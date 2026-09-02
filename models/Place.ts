// models/Place.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPlace extends Document {
  cityId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  parentPlaceId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  images?: string[]; // URLs to images
  videoUrl?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  rating?: number;
}

const PlaceSchema = new Schema<IPlace>({
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  parentPlaceId: { type: Schema.Types.ObjectId, ref: 'Place' },
  name: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  videoUrl: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },
  },
  address: { type: String },
  rating: { type: Number, min: 0, max: 5 },
});

export const Place = mongoose.models.Place || mongoose.model<IPlace>('Place', PlaceSchema);
