// models/City.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICity extends Document {
  name: string;
  region?: string;
  description?: string;
  coverImage?: string;
}

const CitySchema = new Schema<ICity>({
  name: { type: String, required: true, unique: true },
  region: { type: String },
  description: { type: String },
  coverImage: { type: String },
});

export const City = mongoose.models.City || mongoose.model<ICity>('City', CitySchema);
