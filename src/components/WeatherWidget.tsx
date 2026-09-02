'use client';

import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Thermometer, Droplets, Loader2 } from 'lucide-react';

interface WeatherWidgetProps {
  cityId: string;
  lat: number;
  lng: number;
  cityName: string;
}

export default function WeatherWidget({ cityId, lat, lng, cityName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const res = await fetch(`/api/weather?cityId=${cityId}&lat=${lat}&lng=${lng}`);
        if (!res.ok) {
          throw new Error('Failed to fetch weather');
        }
        const data = await res.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching weather');
      } finally {
        setLoading(false);
      }
    }

    if (cityId) {
      fetchWeather();
    }
  }, [cityId, lat, lng]);

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-center space-x-3 text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        <span className="text-sm">Loading current weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center text-xs text-rose-400">
        Could not load live weather.
      </div>
    );
  }

  const temp = Math.round(weather.main?.temp ?? 22);
  const feelsLike = Math.round(weather.main?.feels_like ?? 21);
  const description = weather.weather?.[0]?.description ?? 'clear sky';
  const humidity = weather.main?.humidity ?? 50;
  const windSpeed = weather.wind?.speed ?? 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg">
      <h3 className="font-bold text-lg text-white mb-4 flex items-center justify-between">
        <span>Live Weather</span>
        <span className="text-xs font-normal text-slate-400">{cityName}</span>
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
            {description.includes('rain') ? (
              <CloudRain className="w-8 h-8" />
            ) : description.includes('cloud') ? (
              <Cloud className="w-8 h-8" />
            ) : (
              <Sun className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white">{temp}&deg;C</div>
            <div className="text-xs text-emerald-400 font-medium capitalize">{description}</div>
          </div>
        </div>
        <div className="space-y-2 text-xs text-slate-400 border-l border-slate-800 pl-6">
          <div className="flex items-center space-x-1.5">
            <Thermometer className="w-3.5 h-3.5 text-slate-500" />
            <span>Feels like: <strong>{feelsLike}&deg;C</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Droplets className="w-3.5 h-3.5 text-slate-500" />
            <span>Humidity: <strong>{humidity}%</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>Wind: <strong>{windSpeed} m/s</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
