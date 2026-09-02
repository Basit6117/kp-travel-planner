import dbConnect from '@/lib/dbConnect';
import City from '@/models/City';
// Populate resolves referenced models by name. Importing this model ensures
// Mongoose has registered the `Category` schema before Place is populated.
import '@/models/Category';
import Place from '@/models/Place';
import { getWeatherForCity } from '@/lib/services/weather';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

type TravelerLocation = { lat: number; lng: number };

type PlaceForPlan = {
  name: string;
  description: string;
  address?: string;
  rating?: number;
  location?: { lat?: number; lng?: number };
  categoryId?: { name?: string } | null;
};

export async function generateItinerary(
  cityId: string,
  days: number,
  budget: string,
  travelType: string,
  interests: string[],
  travelerLocation?: TravelerLocation
) {
  await dbConnect();

  // Find the city
  const city = await City.findById(cityId);
  if (!city) {
    throw new Error('City not found');
  }

  // Find all database places in this city
  // Keep the prompt fast and bounded. The full place document (images, videos,
  // coordinates, etc.) is not useful to the model and makes requests slower.
  let dbPlaces = await Place.find({ cityId: city._id })
    .select('name description address rating location categoryId')
    .populate({ path: 'categoryId', select: 'name' })
    .sort({ rating: -1, name: 1 })
    .limit(75)
    .lean() as unknown as PlaceForPlan[];

  // If permission was granted, start with places closest to the traveller.
  // Otherwise locations remain ordered by relevance and rating.
  if (travelerLocation) {
    dbPlaces = dbPlaces.sort(
      (a, b) => squaredDistance(a, travelerLocation) - squaredDistance(b, travelerLocation)
    );
  }

  const weatherPlace = dbPlaces.find(hasCoordinates);
  const weather = weatherPlace
    ? await getWeatherForCity(city._id.toString(), weatherPlace.location.lat, weatherPlace.location.lng).catch(() => null)
    : null;
  const weatherContext = formatWeather(weather);

  // Format places for the AI prompt
  const placesContext = dbPlaces
    .map((place) => {
      const categoryName = place.categoryId?.name || 'General';
      const description = place.description.replace(/\s+/g, ' ').slice(0, 350);
      return `- Name: "${place.name}" (Category: "${categoryName}", rating: ${place.rating || 'N/A'}). Description: "${description}". Address: "${place.address || 'N/A'}"`;
    })
    .join('\n');

  const prompt = `You are a professional travel planner specializing in Khyber Pakhtunkhwa (KPK), Pakistan.
Create a day-by-day travel itinerary for a trip to "${city.name}".

Trip details:
- Destination: ${city.name}
- Duration: ${days} days
- Budget Range: ${budget}
- Travel Group Type: ${travelType}
- Specific Interests: ${interests.join(', ')}
- Current local weather: ${weatherContext}

Planning rules:
- Use ONLY place names listed in DATABASE PLACES for recommendedPlace. Never suggest a place from another city.
- Give every day a distinct, practical theme and avoid repeating the same place.
- Prioritize categories matching the traveller's interests. Group nearby places together where possible.
- If the weather mentions rain, thunder, snow, extreme heat, or strong wind, make outdoor activities flexible and prioritize sheltered/indoor options. Clearly state the weather adjustment in the activity.
- Include useful logistics: realistic visiting order, rest/meal breaks, road or weather caution when relevant. Do not invent hotel names; only list hotels from DATABASE PLACES.

Here are real, existing tourist locations and hotels from our database in "${city.name}". You MUST prioritize recommending these places if they fit the traveler's interests and budget, so that our application can show real links and details. Use general knowledge about the area only if you need to fill gaps.

DATABASE PLACES AND HOTELS IN ${city.name.toUpperCase()}:
${placesContext}

Return your response strictly in the following JSON format. Do not write any explanations before or after the JSON.

{
  "tripTitle": "string",
  "itinerary": [
    {
      "day": number,
      "theme": "string",
      "morning": {
        "activity": "string",
        "recommendedPlace": "name of a place from the database, or N/A if not in the list"
      },
      "afternoon": {
        "activity": "string",
        "recommendedPlace": "name of a place from the database, or N/A if not in the list"
      },
      "evening": {
        "activity": "string",
        "recommendedPlace": "name of a place from the database, or N/A if not in the list"
      }
    }
  ],
  "suggestedHotels": [
    {
      "name": "name of hotel from the database list",
      "priceRange": "string",
      "rationale": "string"
    }
  ],
  "costBreakdown": {
    "accommodation": "string",
    "transport": "string",
    "food": "string",
    "activities": "string",
    "total": "string"
  },
  "travelTips": [
    "string"
  ],
  "packingSuggestions": [
    "string"
  ]
}`;

  if (!GEMINI_API_KEY) {
    return getFallbackItinerary(city.name, days, budget, travelType, interests, dbPlaces, weather);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const jsonRes = await response.json();
    const textOutput = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      throw new Error('Gemini API returned an empty output');
    }

    const generatedPlan = JSON.parse(textOutput);
    return validatePlan(generatedPlan, city.name, days, budget, travelType, interests, dbPlaces, weather);
  } catch (error) {
    console.error('Gemini itinerary generation error:', error);
    return getFallbackItinerary(city.name, days, budget, travelType, interests, dbPlaces, weather);
  }
}

function hasCoordinates(place: PlaceForPlan): place is PlaceForPlan & { location: { lat: number; lng: number } } {
  return Number.isFinite(place.location?.lat) && Number.isFinite(place.location?.lng);
}

function squaredDistance(place: PlaceForPlan, point: TravelerLocation) {
  if (!hasCoordinates(place)) return Number.POSITIVE_INFINITY;
  return (place.location.lat - point.lat) ** 2 + (place.location.lng - point.lng) ** 2;
}

function formatWeather(weather: any) {
  if (!weather || weather.isFallback) return 'Weather is unavailable—ask the traveller to check the local forecast before departure.';
  const condition = weather.weather?.[0]?.description || 'unknown conditions';
  const forecast = weather.forecast?.list
    ?.filter((item: any) => typeof item.dt_txt === 'string' && item.dt_txt.includes('12:00:00'))
    .slice(0, 3)
    .map((item: any) => `${item.dt_txt.slice(0, 10)}: ${item.weather?.[0]?.description || 'unknown'}, ${Math.round(item.main?.temp ?? 0)}°C`)
    .join('; ');
  return `${condition}, ${Math.round(weather.main?.temp ?? 0)}°C, humidity ${weather.main?.humidity ?? 'N/A'}%, wind ${weather.wind?.speed ?? 'N/A'} m/s.${forecast ? ` Forecast: ${forecast}.` : ''}`;
}

function hasDisruptiveWeather(weather: any) {
  if (!weather || weather.isFallback) return false;
  const text = `${weather.weather?.[0]?.main || ''} ${weather.weather?.[0]?.description || ''}`.toLowerCase();
  return /rain|drizzle|thunder|snow|storm|squall|tornado/.test(text) || (weather.wind?.speed ?? 0) >= 10;
}

function matchesInterest(place: PlaceForPlan, interests: string[]) {
  const haystack = `${place.categoryId?.name || ''} ${place.name} ${place.description}`.toLowerCase();
  const keywords: Record<string, string[]> = {
    'Nature & Scenery': ['nature', 'valley', 'lake', 'waterfall', 'park', 'mountain', 'forest', 'tourist'],
    'History & Culture': ['historic', 'history', 'museum', 'fort', 'archaeolog', 'culture', 'heritage'],
    'Shopping & Food': ['mall', 'shopping', 'bazaar', 'market', 'food'],
    'Adventure & Trekking': ['trek', 'hike', 'adventure', 'mountain', 'lake', 'waterfall'],
    Photography: ['view', 'scenic', 'valley', 'lake', 'mountain', 'waterfall', 'tourist'],
    'Religious Sites': ['mosque', 'shrine', 'religious', 'church', 'temple'],
  };
  return interests.some((interest) => (keywords[interest] || []).some((word) => haystack.includes(word)));
}

function getFallbackItinerary(
  cityName: string,
  days: number,
  budget: string,
  travelType: string,
  interests: string[],
  places: PlaceForPlan[],
  weather: any
) {
  const prioritized = [...places].sort((a, b) => {
    const relevance = Number(matchesInterest(b, interests)) - Number(matchesInterest(a, interests));
    return relevance || (b.rating || 0) - (a.rating || 0);
  });
  const usablePlaces = prioritized.length ? prioritized : places;
  const rainPlan = hasDisruptiveWeather(weather);
  const itinerary = Array.from({ length: days }, (_, index) => {
    // A place should never be recommended twice in the same generated plan.
    // If the catalogue has too few places, leave remaining slots flexible.
    const dayPlaces = [0, 1, 2]
      .map((offset) => usablePlaces[index * 3 + offset])
      .filter(Boolean);
    const [morning, afternoon, evening] = dayPlaces;
    const theme = morning?.categoryId?.name ? `${morning.categoryId.name} highlights in ${cityName}` : `Discovering ${cityName}`;
    return {
      day: index + 1,
      theme,
      morning: activitySlot('morning', morning, rainPlan),
      afternoon: activitySlot('afternoon', afternoon, rainPlan),
      evening: activitySlot('evening', evening, rainPlan),
    };
  });

  const hotels = places.filter((place) => (place.categoryId?.name || '').toLowerCase().includes('hotel')).slice(0, 2);

  return {
    tripTitle: `${cityName} ${interests[0] || 'Travel'} Itinerary (${travelType})`,
    itinerary,
    suggestedHotels: hotels.map((hotel) => ({ name: hotel.name, priceRange: budget, rationale: hotel.address ? `Listed in the local database: ${hotel.address}.` : 'Listed in the local database.' })),
    costBreakdown: getCostBreakdown(budget, days),
    travelTips: [
      `Current conditions: ${formatWeather(weather)}`,
      rainPlan ? 'Rain or severe weather is reported: confirm road conditions and keep outdoor stops flexible.' : 'Check the latest weather and road conditions before leaving.',
      'Carry cash since ATMs are sparse in remote valleys.'
    ],
    packingSuggestions: [
      'Comfortable walking or hiking shoes',
      rainPlan ? 'Waterproof jacket, rain cover, and dry spare socks' : 'Warm fleece jacket or shawl',
      'Power bank and camera',
      'First aid kit and personal medications'
    ]
  };
}

function getCostBreakdown(budget: string, days: number) {
  const level = budget.toLowerCase().includes('luxury') ? 'luxury' : budget.toLowerCase().includes('economy') ? 'economy' : 'mid';
  const daily = {
    economy: { accommodation: [2500, 5000], transport: [1000, 2500], food: [1200, 2200], activities: [500, 1500] },
    mid: { accommodation: [6000, 12000], transport: [2000, 5000], food: [2500, 4500], activities: [1000, 3000] },
    luxury: { accommodation: [15000, 30000], transport: [6000, 12000], food: [5000, 9000], activities: [3000, 8000] },
  }[level];
  const format = ([min, max]: number[]) => `PKR ${(min * days).toLocaleString()} - ${(max * days).toLocaleString()}`;
  const totalMin = Object.values(daily).reduce((total, [min]) => total + min, 0) * days;
  const totalMax = Object.values(daily).reduce((total, [, max]) => total + max, 0) * days;
  return { accommodation: format(daily.accommodation), transport: format(daily.transport), food: format(daily.food), activities: format(daily.activities), total: `PKR ${totalMin.toLocaleString()} - ${totalMax.toLocaleString()}` };
}

function activitySlot(time: string, place: PlaceForPlan | undefined, rainPlan: boolean) {
  if (!place) return { activity: `Keep this ${time} open for meals, travel time, or a local recommendation.`, recommendedPlace: 'N/A' };
  const weatherNote = rainPlan ? ' Check conditions first; shorten or postpone this outdoor stop if rain worsens.' : '';
  return {
    activity: `${time[0].toUpperCase() + time.slice(1)} visit to ${place.name}${place.address ? ` near ${place.address}` : ''}. Allow time to explore and travel to the next stop.${weatherNote}`,
    recommendedPlace: place.name,
  };
}

function validatePlan(plan: any, cityName: string, days: number, budget: string, travelType: string, interests: string[], places: PlaceForPlan[], weather: any) {
  if (!plan || !Array.isArray(plan.itinerary) || plan.itinerary.length !== days) {
    return getFallbackItinerary(cityName, days, budget, travelType, interests, places, weather);
  }
  const validNames = new Set(places.map((place) => place.name));
  for (const day of plan.itinerary) {
    for (const slot of ['morning', 'afternoon', 'evening']) {
      if (!day?.[slot] || typeof day[slot].activity !== 'string') {
        return getFallbackItinerary(cityName, days, budget, travelType, interests, places, weather);
      }
      if (!validNames.has(day[slot].recommendedPlace)) day[slot].recommendedPlace = 'N/A';
    }
  }
  return plan;
}
