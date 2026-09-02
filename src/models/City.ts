import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  provinceRegion: string;
  description: string;
  coverImage: string;
}

const CitySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  provinceRegion: { type: String, required: true, default: 'Khyber Pakhtunkhwa' },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
});

export default mongoose.models.City || mongoose.model<ICity>('City', CitySchema);
