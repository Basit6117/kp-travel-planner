import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import City from '@/models/City';

const DEFAULT_CITY_COVER = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') return null;
  return session;
}

export async function GET() {
  await dbConnect();
  const cities = await City.find({}).sort({ name: 1 });
  return NextResponse.json(cities);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await req.json();
  if (!body?.name?.trim() || !body?.description?.trim()) {
    return NextResponse.json({ error: 'Destination name and description are required.' }, { status: 400 });
  }
  const city = await City.create({
    ...body,
    name: body.name.trim(),
    description: body.description.trim(),
    provinceRegion: body.provinceRegion?.trim() || 'Khyber Pakhtunkhwa',
    coverImage: body.coverImage?.trim() || DEFAULT_CITY_COVER,
  });
  return NextResponse.json(city, { status: 201 });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await dbConnect();
  await City.findByIdAndDelete(id);
  return NextResponse.json({ message: 'City deleted' });
}
