import mongoose, { Schema, Document } from 'mongoose';

export interface IPlace extends Document {
  cityId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  parentPlaceId?: mongoose.Types.ObjectId | null;
  name: string;
  description: string;
  images: string[];
  videoUrl?: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  rating: number;
}

const PlaceSchema: Schema = new Schema({
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  parentPlaceId: { type: Schema.Types.ObjectId, ref: 'Place', default: null },
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  videoUrl: { type: String },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  address: { type: String },
  rating: { type: Number, default: 0 },
});

export default mongoose.models.Place || mongoose.model<IPlace>('Place', PlaceSchema);
