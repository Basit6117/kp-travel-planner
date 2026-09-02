import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Itinerary from '@/models/Itinerary';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = (session.user as any).id;

    await dbConnect();

    // Scope deletion to the requesting user — prevents any user from
    // deleting another user's itinerary by guessing an ObjectId.
    const deleted = await Itinerary.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Itinerary not found or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Itinerary deleted successfully.' });
  } catch (error: any) {
    console.error('DELETE /api/itinerary/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while deleting the itinerary.' },
      { status: 500 }
    );
  }
}
