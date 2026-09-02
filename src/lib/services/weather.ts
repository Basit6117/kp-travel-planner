import dbConnect from '@/lib/dbConnect';
import WeatherCache from '@/models/WeatherCache';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

export async function getWeatherForCity(cityId: string, lat: number, lng: number) {
  await dbConnect();

  const CACHE_MINUTES = 10;
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() - CACHE_MINUTES);

  // Check cache
  const cached = await WeatherCache.findOne({ cityId });
  if (cached && cached.fetchedAt > expiryTime) {
    return cached.data;
  }

  // Fetch new data
  if (!OPENWEATHER_API_KEY) {
    return {
      main: { temp: 22, feels_like: 21, humidity: 60 },
      weather: [{ description: 'pleasant (no API key)', icon: '01d' }],
      wind: { speed: 3.5 },
      name: 'Fallback Location',
      isFallback: true
    };
  }

  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
    if (!currentRes.ok) {
      throw new Error(`OpenWeather API returned status ${currentRes.status}`);
    }
    const data = await currentRes.json();
    // Forecast is supplementary: a valid current observation should still be
    // returned if the provider's forecast endpoint is temporarily unavailable.
    if (forecastRes.ok) {
      data.forecast = await forecastRes.json();
    }

    // Cache the data
    await WeatherCache.findOneAndUpdate(
      { cityId },
      { data, fetchedAt: new Date() },
      { upsert: true, new: true }
    );

    return data;
  } catch (error) {
    console.error('Weather API error:', error);
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}
