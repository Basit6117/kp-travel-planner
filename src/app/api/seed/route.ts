import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import City from '@/models/City';
import Category from '@/models/Category';
import Place from '@/models/Place';

export async function GET() {
  try {
    await dbConnect();
    
    // 1. Clear existing data
    await Promise.all([
      User.deleteMany({}),
      City.deleteMany({}),
      Category.deleteMany({}),
      Place.deleteMany({})
    ]);

    // 2. Create Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    await User.create([
      { name: 'Admin User', email: 'admin@kpktravel.com', password: adminPassword, role: 'admin' },
      { name: 'Demo User', email: 'user@kpktravel.com', password: userPassword, role: 'user' }
    ]);

    // 3. Create Categories
    const categories = await Category.insertMany([
      { name: 'Lakes & Rivers', icon: '🌊', description: 'Beautiful water bodies' },
      { name: 'Mountains & Valleys', icon: '⛰️', description: 'Scenic peaks and valleys' },
      { name: 'Historical Sites', icon: '🏛️', description: 'Ancient ruins and forts' },
      { name: 'Parks & Forests', icon: '🌲', description: 'Lush green forests and national parks' }
    ]);

    const catMap = categories.reduce((acc: any, c) => { acc[c.name] = c._id; return acc; }, {});

    // 4. Create Cities
    const swat = await City.create({
      name: 'Swat Valley',
      provinceRegion: 'Malakand Division',
      description: 'Known as the Switzerland of the East, famous for its lush green valleys and snow-capped peaks.',
      coverImage: 'https://images.unsplash.com/photo-1627896157734-4d7d425c2826?w=800&q=80'
    });

    const peshawar = await City.create({
      name: 'Peshawar',
      provinceRegion: 'Peshawar Valley',
      description: 'The capital of KPK, famous for its rich history, food, and the ancient Qissa Khwani Bazaar.',
      coverImage: 'https://images.unsplash.com/photo-1596726914569-826622b7a957?w=800&q=80'
    });
// 4. Create Additional Cities
    const naran = await City.create({
      name: 'Naran',
      provinceRegion: 'Kaghan Valley',
      description: 'Town near Saif ul Malook Lake, gateway to beautiful alpine lakes.',
      coverImage: 'https://images.unsplash.com/photo-1587716306868-17d5e2b1c791?w=800&q=80'
    });

    const kaghan = await City.create({
      name: 'Kaghan Valley',
      provinceRegion: 'Kaghan Valley',
      description: 'Scenic valley famous for its lush meadows and lakes.',
      coverImage: 'https://images.unsplash.com/photo-1528763380143-65b3c1b946bf?w=800&q=80'
    });

    const chitral = await City.create({
      name: 'Chitral',
      provinceRegion: 'Upper KPK',
      description: 'Home to the unique Kalash Valleys and stunning mountain scenery.',
      coverImage: 'https://images.unsplash.com/photo-1542564394-5ef842121908?w=800&q=80'
    });

    const abbottabad = await City.create({
      name: 'Abbottabad',
      provinceRegion: 'Hazara Division',
      description: 'Hill station with pleasant climate and pine forests.',
      coverImage: 'https://images.unsplash.com/photo-1547988633-51858fc814c3?w=800&q=80'
    });

    const mansehra = await City.create({
      name: 'Mansehra',
      provinceRegion: 'Hazara Division',
      description: 'Gateway to the northern areas, near Kaghan Valley.',
      coverImage: 'https://images.unsplash.com/photo-1531312775881-93bf2b9b643b?w=800&q=80'
    });

    // 5. Create Places
    await Place.insertMany([
      {
        cityId: swat._id,
        categoryId: catMap['Mountains & Valleys'],
        name: 'Malam Jabba Ski Resort',
        description: 'A famous hill station and ski resort in the Hindu Kush mountain range.',
        location: { lat: 34.7981, lng: 72.5714 },
        images: ['https://images.unsplash.com/photo-1551582045-6c41114b0ba2?w=800&q=80'],
        priceRange: '$$'
      },
      {
        cityId: swat._id,
        categoryId: catMap['Lakes & Rivers'],
        name: 'Mahodand Lake',
        description: 'A stunning alpine glacial lake located in the upper Usho Valley.',
        location: { lat: 35.4211, lng: 72.5930 },
        images: ['https://images.unsplash.com/photo-1627896157734-4d7d425c2826?w=800&q=80'],
        priceRange: 'Free'
      },
      {
        cityId: peshawar._id,
        categoryId: catMap['Historical Sites'],
        name: 'Qissa Khwani Bazaar',
        description: 'The historic Storytellers Bazaar, famous for its traditional tea (Kahwa) and bustling atmosphere.',
        location: { lat: 34.0117, lng: 71.5768 },
        images: ['https://images.unsplash.com/photo-1596726914569-826622b7a957?w=800&q=80'],
        priceRange: 'Free'
       },
        {
          cityId: naran._id,
          categoryId: catMap['Lakes & Rivers'],
          name: 'Saif-ul-Malook Lake',
          description: 'A stunning alpine lake surrounded by snow‑capped peaks.',
          location: { lat: 35.4845, lng: 73.2192 },
          images: ['https://images.unsplash.com/photo-1587716306868-17d5e2b1c791?w=800&q=80'],
          priceRange: 'Free'
        },
        {
          cityId: kaghan._id,
          categoryId: catMap['Lakes & Rivers'],
          name: 'Lulusar Lake',
          description: 'High‑altitude lake famous for its turquoise water.',
          location: { lat: 35.4639, lng: 73.3383 },
          images: ['https://images.unsplash.com/photo-1528763380143-65b3c1b946bf?w=800&q=80'],
          priceRange: 'Free'
        },
        {
          cityId: kaghan._id,
          categoryId: catMap['Parks & Forests'],
          name: 'Shogran',
          description: 'Scenic hill station with meadows and pine forests.',
          location: { lat: 35.4600, lng: 73.3170 },
          images: ['https://images.unsplash.com/photo-1627896157734-4d7d425c2826?w=800&q=80'],
          priceRange: 'Free'
        },
        {
          cityId: kaghan._id,
          categoryId: catMap['Mountains & Valleys'],
          name: 'Payee Meadows',
          description: 'Rolling meadow offering panoramic views of the surrounding mountains.',
          location: { lat: 35.4605, lng: 73.3175 },
          images: ['https://images.unsplash.com/photo-1542564394-5ef842121908?w=800&q=80'],
          priceRange: 'Free'
        },
        {
          cityId: chitral._id,
          categoryId: catMap['Historical Sites'],
          name: 'Kalash Valleys',
          description: 'Three unique valleys (Bumburet, Rumbur, Birir) known for vibrant culture.',
          location: { lat: 35.8100, lng: 71.9250 },
          images: ['https://images.unsplash.com/photo-1542564394-5ef842121908?w=800&q=80'],
          priceRange: 'Free'
        },
        {
          cityId: abbottabad._id,
          categoryId: catMap['Parks & Forests'],
          name: 'Nathia Gali',
          description: 'Hill station with pine‑covered slopes and chilly weather.',
          location: { lat: 34.0138, lng: 73.3828 },
          images: ['https://images.unsplash.com/photo-1547988633-51858fc814c3?w=800&q=80'],
          priceRange: 'Free'
        }
      ]);

    return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
