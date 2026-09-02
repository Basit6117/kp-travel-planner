import mongoose, { Document, Schema } from 'mongoose';

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  cityId: mongoose.Types.ObjectId;
  days: number;
  budget: number;
  travelType: 'solo' | 'family' | 'friends' | 'couple';
  interests: string[];
  generatedPlan: any; // store AI-generated itinerary JSON or string
  createdAt: Date;
}

const ItinerarySchema = new Schema<IItinerary>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  days: { type: Number, required: true },
  budget: { type: Number, required: true },
  travelType: { type: String, enum: ['solo', 'family', 'friends', 'couple'], required: true },
  interests: [{ type: String }],
  generatedPlan: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export const Itinerary = mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
