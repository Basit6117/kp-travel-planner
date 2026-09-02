import { NextResponse } from 'next/server';
import { getWeatherForCity } from '@/lib/services/weather';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId');
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!cityId || !latStr || !lngStr) {
      return NextResponse.json({ error: 'Missing cityId, lat, or lng parameters' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude values' }, { status: 400 });
    }

    const weatherData = await getWeatherForCity(cityId, lat, lng);
    return NextResponse.json(weatherData);
  } catch (error: any) {
    console.error('API weather error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch weather data' }, { status: 500 });
  }
}
