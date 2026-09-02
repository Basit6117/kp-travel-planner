import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import Itinerary from '@/models/Itinerary';
import ItineraryDetailClient from '@/components/ItineraryDetailClient';

export default async function ItineraryDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/login');

  await dbConnect();
  const userId = (session.user as any).id;

  const itinerary = await Itinerary.findOne({ _id: params.id, userId })
    .populate('cityId', 'name coverImage')
    .lean();

  if (!itinerary) notFound();

  return (
    <ItineraryDetailClient
      itinerary={JSON.parse(JSON.stringify(itinerary))}
    />
  );
}
