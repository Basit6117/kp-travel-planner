import mongoose, { Schema, Document } from 'mongoose';

export interface IWeatherCache extends Document {
  cityId: mongoose.Types.ObjectId;
  data: any;
  fetchedAt: Date;
}

const WeatherCacheSchema: Schema = new Schema({
  cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  fetchedAt: { type: Date, default: Date.now },
});

export default mongoose.models.WeatherCache || mongoose.model<IWeatherCache>('WeatherCache', WeatherCacheSchema);
