import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { generateItinerary } from '@/lib/services/gemini';
import dbConnect from '@/lib/dbConnect';
import Itinerary from '@/models/Itinerary';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cityId, days, budget, travelType, interests, travelerLocation } = await req.json();

    if (
      typeof cityId !== 'string' ||
      !mongoose.isValidObjectId(cityId) ||
      typeof budget !== 'string' ||
      typeof travelType !== 'string' ||
      !Array.isArray(interests) ||
      !interests.every((interest) => typeof interest === 'string') ||
      (travelerLocation !== undefined && (
        typeof travelerLocation !== 'object' ||
        typeof travelerLocation.lat !== 'number' ||
        typeof travelerLocation.lng !== 'number' ||
        !Number.isFinite(travelerLocation.lat) ||
        !Number.isFinite(travelerLocation.lng) ||
        travelerLocation.lat < -90 || travelerLocation.lat > 90 ||
        travelerLocation.lng < -180 || travelerLocation.lng > 180
      ))
    ) {
      return NextResponse.json({ error: 'Invalid input parameters.' }, { status: 400 });
    }

    const daysNum = typeof days === 'number'
      ? days
      : typeof days === 'string' && /^\d+$/.test(days)
        ? Number(days)
        : NaN;
    if (!Number.isInteger(daysNum) || daysNum < 1 || daysNum > 10) {
      return NextResponse.json({ error: 'Duration must be between 1 and 10 days.' }, { status: 400 });
    }

    const sanitizedInterests = interests.map((interest) => interest.trim()).filter(Boolean);
    if (!cityId.trim() || !budget.trim() || !travelType.trim() || sanitizedInterests.length === 0) {
      return NextResponse.json({ error: 'Please provide a city, budget, travel type, and at least one interest.' }, { status: 400 });
    }

    // Call Gemini generator service
    const generatedPlan = await generateItinerary(
      cityId.trim(),
      daysNum,
      budget.trim(),
      travelType.trim(),
      sanitizedInterests,
      travelerLocation
    );

    // Save to Database
    await dbConnect();
    const newItinerary = await Itinerary.create({
      userId: (session.user as any).id,
      cityId: cityId.trim(),
      days: daysNum,
      budget: budget.trim(),
      travelType: travelType.trim(),
      generatedPlan,
    });

    return NextResponse.json({
      message: 'Itinerary generated successfully.',
      itineraryId: newItinerary._id,
      plan: generatedPlan,
    });
  } catch (error: any) {
    console.error('API itinerary error:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during itinerary generation.' }, { status: 500 });
  }
}
