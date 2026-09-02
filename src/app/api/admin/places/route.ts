import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Place from '@/models/Place';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') return null;
  return session;
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId');
  const query = cityId ? { cityId } : {};
  const places = await Place.find(query)
    .populate('cityId', 'name')
    .populate('categoryId', 'name')
    .sort({ name: 1 });
  return NextResponse.json(places);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await req.json();
  const place = await Place.create(body);
  return NextResponse.json(place, { status: 201 });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await dbConnect();
  const body = await req.json();
  const place = await Place.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(place);
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await dbConnect();
  await Place.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Place deleted' });
}
