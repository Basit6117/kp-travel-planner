import mongoose, { Schema, Document } from 'mongoose';

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  cityId: mongoose.Types.ObjectId;
  days: number;
  budget: string;
  travelType: string;
  generatedPlan: any;
  createdAt: Date;
}

const ItinerarySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  days: { type: Number, required: true },
  budget: { type: String, required: true },
  travelType: { type: String, required: true },
  generatedPlan: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
