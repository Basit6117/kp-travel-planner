import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import { ContactMessage } from '@/models/ContactMessage';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
  return NextResponse.json(messages);
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  await dbConnect();
  const msg = await ContactMessage.findById(id);
  if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

  msg.read = !msg.read;
  await msg.save();

  return NextResponse.json(msg);
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  await dbConnect();
  await ContactMessage.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Message deleted successfully' });
}
