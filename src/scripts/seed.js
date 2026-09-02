const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Parse .env.local manually
const envPath = path.join(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kpk_travel_explorer';

// Define Schemas inline
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  provinceRegion: { type: String, required: true, default: 'Khyber Pakhtunkhwa' },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const PlaceSchema = new mongoose.Schema({
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  parentPlaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', default: null },
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const City = mongoose.models.City || mongoose.model('City', CitySchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Place = mongoose.models.Place || mongoose.model('Place', PlaceSchema);

async function seed() {
  console.log('Connecting to database:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Connected!');

  // 1. Clear collections
  await User.deleteMany({});
  await City.deleteMany({});
  await Category.deleteMany({});
  await Place.deleteMany({});
  console.log('Cleared existing data.');

  // 2. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await User.create({
    name: 'Admin Explorer',
    email: 'admin@kpktravel.com',
    password: adminPassword,
    role: 'admin',
  });

  const normalUser = await User.create({
    name: 'Khan Traveller',
    email: 'user@kpktravel.com',
    password: userPassword,
    role: 'user',
  });

  console.log('Seeded Users.');

  // 3. Create Categories
  const categoryNames = [
    'Hotels',
    'Historical Places',
    'Malls / Shopping',
    'Hospitals',
    'General / Tourist Attractions'
  ];

  const categories = {};
  for (const name of categoryNames) {
    const cat = await Category.create({ name });
    categories[name] = cat._id;
  }
  console.log('Seeded Categories.');

  // 4. Create Cities
  const citiesData = [
    { name: 'Peshawar', description: 'The historic capital of Khyber Pakhtunkhwa, one of the oldest living cities in South Asia.', coverImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Swat', description: 'Often referred to as the Switzerland of Pakistan, Swat features breathtaking valleys, lush forests, and rich Buddhist history.', coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Naran', description: 'A scenic valley town located in the Mansehra District, popular for summer tourism, glacial lakes, and river valleys.', coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Kaghan Valley', description: 'An alpine valley stretching 155 km in northern Pakistan, home to pristine rivers, meadows, and lakes.', coverImage: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Kumrat Valley', description: 'A lush green valley in Upper Dir District, famous for its towering pine trees, waterfalls, and Jahaz Banda Meadows.', coverImage: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Chitral', description: 'A dramatic mountainous valley situated in the northernmost part of KPK, dominated by the Hindukush peaks and Kalash culture.', coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Nathia Gali', description: 'A serene mountain resort and hill station in Abbottabad district, famous for its dense pine forests and cold climate.', coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Abbottabad', description: 'A clean and green city in the Hazara region, serving as the gateway to the Karakoram Highway and scenic valleys.', coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Mardan', description: 'The second-most populous city in KP, renowned for Takht-i-Bahi, a UNESCO World Heritage Buddhist monastic complex.', coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' }
  ];

  const cities = {};
  for (const cData of citiesData) {
    const city = await City.create(cData);
    cities[cData.name] = city._id;
  }
  console.log('Seeded Cities.');

  // 5. Seed Places (with hierarchical sub-places)

  // -- PESHAWAR PLACES --
  const pId = cities['Peshawar'];
  const balaHissar = await Place.create({
    cityId: pId,
    categoryId: categories['Historical Places'],
    name: 'Bala Hissar Fort',
    description: 'A historic fortress located in Peshawar. Mentioned by the Chinese traveler Xuanzang, it is one of the most prominent historic landmarks of Peshawar.',
    images: ['https://images.unsplash.com/photo-1627914801128-48b488730999?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0177, lng: 71.5721 },
    address: 'Khyber Bazar, Peshawar',
    rating: 4.6
  });

  const qissaKhwani = await Place.create({
    cityId: pId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Qissa Khwani Bazaar',
    description: 'The "Bazaar of Storytellers" is a historic marketplace in Peshawar, famous for its green tea (kahwah) shops, street food, and traditional brassware shops.',
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0125, lng: 71.5768 },
    address: 'Qissa Khwani Road, Peshawar',
    rating: 4.5
  });

  const peshMuseum = await Place.create({
    cityId: pId,
    categoryId: categories['Historical Places'],
    name: 'Peshawar Museum',
    description: 'Home to one of the most comprehensive collections of Gandharan Buddhist art in the world, including sculptures, coins, and Buddhist relics.',
    images: ['https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0076, lng: 71.5593 },
    address: 'Saddar Road, Peshawar',
    rating: 4.7
  });

  const babEKhyber = await Place.create({
    cityId: pId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Bab-e-Khyber',
    description: 'The monumental gateway standing at the entrance of the legendary Khyber Pass. A symbol of resilience and history.',
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0152, lng: 71.3813 },
    address: 'Jamrud Road, Khyber Agency Entrance',
    rating: 4.8
  });

  // -- SWAT PLACES --
  const swatId = cities['Swat'];
  const mingora = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Mingora Bazaar',
    description: 'The largest commercial city and main shopping hub of Swat valley. Bustling with markets selling local dry fruit, gemstones, and shawls.',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.7717, lng: 72.3602 },
    address: 'Mingora City Center, Swat',
    rating: 4.2
  });

  const malamJabba = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Malam Jabba Ski Resort',
    description: 'A beautiful hill station in the Karakoram range, featuring the only ski resort in Swat, a zip line, chairlifts, and majestic mountain vistas.',
    images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.7997, lng: 72.5719 },
    address: 'Malam Jabba Road, Swat',
    rating: 4.7
  });

  const whitePalace = await Place.create({
    cityId: swatId,
    categoryId: categories['Historical Places'],
    name: 'Marghazar White Palace',
    description: 'Built in 1940 by the first Wali of Swat using white marble imported from Jaipur, India. Now serves as a historical hotel.',
    images: ['https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.7042, lng: 72.3551 },
    address: 'Marghazar Road, Swat',
    rating: 4.4
  });

  const fizagat = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Fizagat Park',
    description: 'A riverside recreational park along the Swat River, featuring kids play areas, boat rides, and lovely seating spots.',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.7952, lng: 72.3815 },
    address: 'Fizagat Bypass Road, Mingora',
    rating: 4.3
  });

  // -- SWAT NESTED (Kalam Valley & its subplaces) --
  const kalamValley = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Kalam Valley',
    description: 'A sub-region located in Swat at an altitude of 6,600 feet, famous for its pine forests, rushing Swat river, and majestic snow peaks.',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.4812, lng: 72.5861 },
    address: 'Kalam, Swat, KP',
    rating: 4.8
  });

  const mahodandLake = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    parentPlaceId: kalamValley._id, // NESTED under Kalam Valley
    name: 'Mahodand Lake',
    description: 'A stunning glacial lake in the Ushu Valley of Kalam. Flanked by meadows, wildflowers, and thick pine forests, it is famous for boating and trout fishing.',
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.7139, lng: 72.6514 },
    address: 'Ushu Valley, Kalam, Swat',
    rating: 4.9
  });

  const ushuForest = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    parentPlaceId: kalamValley._id, // NESTED under Kalam Valley
    name: 'Ushu Forest',
    description: 'A dense, enchanting cedar and pine forest on the way to Mahodand Lake. Known for its towering canopy and cool mist.',
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.5392, lng: 72.6241 },
    address: 'Ushu, Kalam, Swat',
    rating: 4.6
  });

  const gabral = await Place.create({
    cityId: swatId,
    categoryId: categories['General / Tourist Attractions'],
    parentPlaceId: kalamValley._id,
    name: 'Gabral Valley & River',
    description: 'A scenic valley and river confluence near Kalam, featuring rich vegetation, apple orchards, and excellent views of peaks.',
    images: ['https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.5297, lng: 72.4831 },
    address: 'Gabral Road, Kalam, Swat',
    rating: 4.5
  });

  // -- NARAN PLACES --
  const naranId = cities['Naran'];
  const saifulMalook = await Place.create({
    cityId: naranId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Lake Saiful Malook',
    description: 'A legendary mountainous lake at the northern end of Kaghan Valley. Renowned for its fairytale folklore of Prince Saiful Malook and Badri-ul-Jamala.',
    images: ['https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.8791, lng: 73.6931 },
    address: 'Naran, Mansehra, KP',
    rating: 4.9
  });

  const naranBazaar = await Place.create({
    cityId: naranId,
    categoryId: categories['Malls / Shopping'],
    name: 'Naran Bazaar',
    description: 'A busy marketplace offering local handicrafts, warm shawls, high-quality honey, dry fruits, and dozens of local restaurants serving fresh trout.',
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.9085, lng: 73.6513 },
    address: 'Main Naran Road, Naran',
    rating: 4.1
  });

  const babusarTop = await Place.create({
    cityId: naranId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Babusar Top',
    description: 'A high mountain pass at an elevation of 13,691 feet, connecting Khyber Pakhtunkhwa with Gilgit-Baltistan. Offers panoramic views of the Himalayas.',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.1481, lng: 74.0273 },
    address: 'Naran-Chilas Highway, Babusar',
    rating: 4.8
  });

  // -- KAGHAN VALLEY PLACES (with nested Shogran) --
  const kaghanId = cities['Kaghan Valley'];
  const kaghanTown = await Place.create({
    cityId: kaghanId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Kaghan Town',
    description: 'The namesake town of the Kaghan Valley, situated along the Kunhar River. A great place to experience local mountain lifestyle.',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.7811, lng: 73.5255 },
    address: 'Kaghan, KP',
    rating: 4.3
  });

  const shogran = await Place.create({
    cityId: kaghanId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Shogran Resort',
    description: 'A beautiful, green plateau hill-station in Kaghan Valley. Situated at an altitude of 7,749 feet, featuring scenic pine trees and pleasant weather.',
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.6293, lng: 73.4623 },
    address: 'Shogran Plateau, Kaghan Valley',
    rating: 4.7
  });

  const siriPaye = await Place.create({
    cityId: kaghanId,
    categoryId: categories['General / Tourist Attractions'],
    parentPlaceId: shogran._id, // NESTED under Shogran
    name: 'Siri Paye Meadows',
    description: 'A breathtaking green meadow at 10,000 feet, situated above Shogran. Famous for its tiny lake reflecting the mountaintops and horses grazing in the mist.',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.6419, lng: 73.4886 },
    address: 'Siri Paye Road, near Shogran',
    rating: 4.8
  });

  const lulusarLake = await Place.create({
    cityId: kaghanId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Lulusar Lake',
    description: 'A large, mirror-like deep blue lake surrounded by snow-capped peaks. The primary source of the Kunhar River.',
    images: ['https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.0815, lng: 73.9312 },
    address: 'Naran-Chilas Highway, Kaghan Valley',
    rating: 4.7
  });

  // -- KUMRAT VALLEY PLACES --
  const kumratId = cities['Kumrat Valley'];
  const jahazBanda = await Place.create({
    cityId: kumratId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Jahaz Banda Meadows',
    description: 'A high-altitude mountain meadow in Upper Dir. Accessible by a trek, it features grassy slopes, glaciers, and a small lake.',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.5122, lng: 72.1812 },
    address: 'Upper Dir, Kumrat',
    rating: 4.8
  });

  const kumratWaterfalls = await Place.create({
    cityId: kumratId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Kumrat Waterfalls',
    description: 'Magnificent, gushing waterfalls situated along the Panjkora River in Kumrat. Ideal for camping and forest walks.',
    images: ['https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.5397, lng: 72.2144 },
    address: 'Kumrat Forest Road, Dir',
    rating: 4.6
  });

  // -- CHITRAL PLACES (with nested Kalash) --
  const chitralId = cities['Chitral'];
  const chitralFort = await Place.create({
    cityId: chitralId,
    categoryId: categories['Historical Places'],
    name: 'Chitral Fort',
    description: 'The historical seat of the Mehtar of Chitral, standing alongside the Chitral River. Reflects classical Chitrali architecture.',
    images: ['https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.8492, lng: 71.7915 },
    address: 'Shahi Qila Road, Chitral Town',
    rating: 4.4
  });

  const shahiMosque = await Place.create({
    cityId: chitralId,
    categoryId: categories['Historical Places'],
    name: 'Shahi Mosque Chitral',
    description: 'Built by the ruler Shuja ul Mulk in 1924, this mosque features elegant white domes and minarets in traditional Central Asian styles.',
    images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.8488, lng: 71.7901 },
    address: 'Near Chitral Fort, Chitral',
    rating: 4.5
  });

  const kalashValleys = await Place.create({
    cityId: chitralId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Kalash Valleys',
    description: 'Home of the unique Kalash people who speak the Kalasha language and practice an ancient, colorful, polytheistic religion.',
    images: ['https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.6811, lng: 71.7214 },
    address: 'Kalash, Chitral District',
    rating: 4.9
  });

  const bumburet = await Place.create({
    cityId: chitralId,
    categoryId: categories['General / Tourist Attractions'],
    parentPlaceId: kalashValleys._id, // NESTED under Kalash Valleys
    name: 'Bumburet Valley',
    description: 'The largest and most commercial valley of the Kalash people. Lush green with local orchards, woodcarvers, and dance venues.',
    images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 35.6833, lng: 71.6667 },
    address: 'Bumburet, Kalash Valleys',
    rating: 4.8
  });

  // -- NATHIA GALI PLACES --
  const nathiaId = cities['Nathia Gali'];
  const mukshpuri = await Place.create({
    cityId: nathiaId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Mukshpuri Peak',
    description: 'A 9,200 feet high pine-clad peak. Offers a beautiful 3 km trekking trail from Nathia Gali with carpeted green meadows at the top.',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0617, lng: 73.4112 },
    address: 'Dunga Gali to Mukshpuri Trail',
    rating: 4.8
  });

  const miranjani = await Place.create({
    cityId: nathiaId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Miranjani Peak',
    description: 'The highest peak in Abbottabad District (9,800 feet). A popular 4-hour trek starting near the Governor House in Nathia Gali.',
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0931, lng: 73.4076 },
    address: 'Nathia Gali Trail Head, Abbottabad',
    rating: 4.7
  });

  const dungaGali = await Place.create({
    cityId: nathiaId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Dunga Gali Pipeline Track',
    description: 'A flat, scenic 4 km walking track along historical water pipeline tracks. Connects Dunga Gali with Ayubia, offering views of the deep valleys.',
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0571, lng: 73.3855 },
    address: 'Pipeline Road, Dunga Gali',
    rating: 4.7
  });

  // -- ABBOTTABAD PLACES --
  const abbottabadId = cities['Abbottabad'];
  const shimlaHill = await Place.create({
    cityId: abbottabadId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Shimla Hill Park',
    description: 'A pine-wooded hill station park offering sweeping panoramic views of the entire Abbottabad valley.',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.1629, lng: 73.2389 },
    address: 'Shimla Hill Road, Abbottabad',
    rating: 4.2
  });

  const ayubia = await Place.create({
    cityId: abbottabadId,
    categoryId: categories['General / Tourist Attractions'],
    name: 'Ayubia National Park & Chairlift',
    description: 'A protected forest area famous for its chairlift ride, cold weather, and wild monkeys that greet travelers along the tracks.',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.0255, lng: 73.4005 },
    address: 'Ayubia Town, KP',
    rating: 4.6
  });

  // -- MARDAN PLACES --
  const mardanId = cities['Mardan'];
  const takhtIBahi = await Place.create({
    cityId: mardanId,
    categoryId: categories['Historical Places'],
    name: 'Takht-i-Bahi Buddhist Monasteries',
    description: 'An Indo-Parthian archaeological site of an ancient Buddhist monastery in Mardan. It is one of the most well-preserved ancient monuments in Pakistan, dating back to the 1st century CE.',
    images: ['https://images.unsplash.com/photo-1599341967000-474744f9f688?auto=format&fit=crop&w=800&q=80'],
    location: { lat: 34.3164, lng: 71.9786 },
    address: 'Takht-i-Bahi Hilltop, Mardan',
    rating: 4.9
  });

  // -- SEED SOME HOTELS for AI Itinerary generator reference --
  for (const [cityName, cityId] of Object.entries(cities)) {
    await Place.create({
      cityId,
      categoryId: categories['Hotels'],
      name: `${cityName} Serena Hotel & Resort`,
      description: 'A luxurious 5-star hotel offering traditional hospitality, clean premium rooms, local cuisines, and beautiful gardens.',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
      location: { lat: 34.0 + Math.random() * 0.5, lng: 72.0 + Math.random() * 0.5 },
      address: `1 Main Avenue, ${cityName}`,
      rating: 4.8
    });

    await Place.create({
      cityId,
      categoryId: categories['Hotels'],
      name: `KPK Tourism Inn ${cityName}`,
      description: 'A clean, budget-friendly residency offering comfortable lodgings, warm service, and local breakfast.',
      images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'],
      location: { lat: 34.0 + Math.random() * 0.5, lng: 72.0 + Math.random() * 0.5 },
      address: `10 Mall Road, ${cityName}`,
      rating: 4.2
    });
  }

  console.log('Seeded Places.');
  console.log('Database Seeding Completed Successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
