import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import City from '@/models/City';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const cities = await City.find({}).sort({ name: 1 }).select('_id name coverImage');
    return NextResponse.json(cities, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
