import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Place from '@/models/Place';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
      return NextResponse.json({ error: 'Missing placeId parameter' }, { status: 400 });
    }

    await dbConnect();
    const reviews = await Review.find({ placeId }).populate('userId', 'name').sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('API reviews GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { placeId, rating, comment } = await req.json();

    if (!placeId || !rating || !comment) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await dbConnect();

    const review = await Review.create({
      placeId,
      userId: (session.user as any).id,
      rating: ratingNum,
      comment,
    });

    // Update average rating on the place
    const allReviews = await Review.find({ placeId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Place.findByIdAndUpdate(placeId, { rating: parseFloat(avgRating.toFixed(1)) });

    return NextResponse.json({ message: 'Review added successfully.', review }, { status: 201 });
  } catch (error: any) {
    console.error('API reviews POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add review' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');
    if (!reviewId) {
      return NextResponse.json({ error: 'Missing review ID' }, { status: 400 });
    }

    await dbConnect();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    // Check ownership or admin status
    if (review.userId.toString() !== userId && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const placeId = review.placeId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate average rating for place
    const remainingReviews = await Review.find({ placeId });
    const avgRating =
      remainingReviews.length > 0
        ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
        : 0;

    await Place.findByIdAndUpdate(placeId, { rating: parseFloat(avgRating.toFixed(1)) });

    return NextResponse.json({ message: 'Review deleted successfully.' });
  } catch (error: any) {
    console.error('API reviews DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}

