/*
 * Adds the core trip-planning catalogue without deleting existing content.
 * Run with: node src/scripts/populate-trip-catalog.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

const catalogue = {
  Peshawar: [
    ['Bala Hissar Fort', 'Historical Sites', 34.0177, 71.5721, 'Historic fort in the old city; access rules can change, so confirm before visiting.'],
    ['Peshawar Museum', 'Historical Sites', 34.0076, 71.5593, 'Museum known for Gandharan art and regional archaeological collections.'],
    ['Mahabat Khan Mosque', 'Religious Sites', 34.0127, 71.5756, 'Seventeenth-century Mughal-era mosque in Peshawar’s old city.'],
    ['Gor Khatri', 'Historical Sites', 34.0123, 71.5767, 'Historic caravanserai and archaeological complex near the old bazaar.'],
    ['Sethi House Museum', 'Historical Sites', 34.0105, 71.5748, 'Restored haveli reflecting the city’s nineteenth-century merchant architecture.'],
    ['Islamia College Peshawar', 'Historical Sites', 34.0068, 71.4871, 'Landmark educational institution with notable colonial-era architecture.'],
    ['Bab-e-Khyber', 'Historical Sites', 34.0152, 71.3813, 'Monumental gateway near the approach to the Khyber Pass.'],
    ['Karkhano Market', 'Shopping & Food', 34.0016, 71.4424, 'Large market known for clothing, household goods, and imported items.'],
    ['Saddar Bazaar Peshawar', 'Shopping & Food', 34.0052, 71.5485, 'Central shopping district with restaurants and everyday local retail.'],
  ],
  Abbottabad: [
    ['Ilyasi Mosque', 'Religious Sites', 34.1623, 73.2218, 'Historic mosque and spring site in Abbottabad.'],
    ['Harnoi Recreation Point', 'Nature & Scenery', 34.1935, 73.2916, 'Streamside picnic and recreation area outside the city centre.'],
    ['St. Luke’s Church', 'Historical Sites', 34.1536, 73.2187, 'Colonial-era church in Abbottabad cantonment.'],
    ['Abbottabad Museum', 'Historical Sites', 34.1527, 73.2195, 'Local museum and heritage stop in the city.'],
    ['Shimla Hill', 'Nature & Scenery', 34.1660, 73.2401, 'Hilltop viewpoint overlooking Abbottabad.'],
    ['Jinnah Bazaar Abbottabad', 'Shopping & Food', 34.1503, 73.2209, 'Main city market for shopping and local food.'],
  ],
  Chitral: [
    ['Chitral Fort', 'Historical Sites', 35.8550, 71.7897, 'Historic fort on the Chitral River; confirm visitor access locally.'],
    ['Shahi Mosque Chitral', 'Religious Sites', 35.8548, 71.7880, 'Prominent mosque near Chitral Fort in the town centre.'],
    ['Chitral Museum', 'Historical Sites', 35.8537, 71.7885, 'Museum covering Chitral’s cultural history and traditions.'],
    ['Chitral Gol National Park', 'Nature & Scenery', 35.8640, 71.7470, 'Mountain national park; check permits, road status, and local guidance.'],
    ['Bumburet Valley', 'Nature & Scenery', 35.7270, 71.7340, 'Kalash valley known for distinctive culture and mountain scenery.'],
    ['Qaqlasht Valley', 'Adventure & Trekking', 36.2411, 72.1831, 'High plateau and festival area north of Chitral town.'],
    ['Golen Valley', 'Nature & Scenery', 35.9415, 71.6895, 'Valley known for mountain scenery and a waterfall.'],
    ['Chitral Bazaar', 'Shopping & Food', 35.8528, 71.7882, 'Town-centre market for local crafts, food, and supplies.'],
  ],
  Mansehra: [
    ['Mansehra Rock Edicts', 'Historical Sites', 34.3309, 73.2023, 'Ancient rock inscriptions attributed to the Mauryan period.'],
    ['Balakot', 'Historical Sites', 34.5488, 73.3520, 'Gateway town on the Kunhar River with historical and travel significance.'],
    ['Shah Ahmad Shaheed Shrine', 'Religious Sites', 34.5482, 73.3512, 'Historic shrine site near Balakot.'],
    ['Baffa Bazaar', 'Shopping & Food', 34.4399, 73.2228, 'Local market for regional food and everyday shopping.'],
    ['Shogran', 'Nature & Scenery', 34.6284, 73.4971, 'Hill station with forest and mountain views; road conditions vary seasonally.'],
    ['Siri Paye Meadows', 'Adventure & Trekking', 34.6408, 73.5057, 'High meadows above Shogran, best approached with suitable local transport.'],
  ],
  Naran: [
    ['Lake Saiful Muluk', 'Nature & Scenery', 34.8791, 73.6931, 'High-altitude lake; check road and weather conditions before departure.'],
    ['Naran Bazaar', 'Shopping & Food', 34.9079, 73.6494, 'Central market with restaurants, hotels, and local goods.'],
    ['Lalazar', 'Nature & Scenery', 34.9007, 73.5512, 'Forest and meadow excursion from Naran.'],
    ['Lulusar Lake', 'Nature & Scenery', 35.0654, 73.9272, 'High mountain lake on the route toward Babusar Pass.'],
    ['Babusar Top', 'Adventure & Trekking', 35.1494, 74.0347, 'High mountain pass; only plan when the road is open and conditions are safe.'],
    ['Kunhar River Viewpoint', 'Nature & Scenery', 34.9073, 73.6481, 'Riverside stop in Naran for views and a short walk.'],
  ],
  'Swat Valley': [
    ['Swat Museum', 'Historical Sites', 34.7751, 72.3624, 'Museum in Mingora with Buddhist and Gandharan collections.'],
    ['Butkara Stupa', 'Historical Sites', 34.7741, 72.3689, 'Buddhist archaeological site near Mingora.'],
    ['Mingora Bazaar', 'Shopping & Food', 34.7717, 72.3602, 'Main market for handicrafts, food, and regional products.'],
    ['Fizagat Park', 'Nature & Scenery', 34.7952, 72.3815, 'Riverside park in the Mingora area.'],
    ['Malam Jabba', 'Adventure & Trekking', 34.7997, 72.5719, 'Mountain resort; verify road, weather, and operating conditions.'],
    ['Marghazar White Palace', 'Historical Sites', 34.7042, 72.3551, 'Historic white-marble palace near Saidu Sharif.'],
    ['Kalam Valley', 'Nature & Scenery', 35.4812, 72.5861, 'Mountain valley with forests and river scenery.'],
  ],
  'Kaghan Valley': [
    ['Kaghan Town', 'Shopping & Food', 34.7811, 73.5255, 'Valley town on the Kunhar River with local services and food.'],
    ['Shogran', 'Nature & Scenery', 34.6284, 73.4971, 'Popular hill station with pine forest and mountain views.'],
    ['Siri Paye Meadows', 'Adventure & Trekking', 34.6408, 73.5057, 'High meadows reached from Shogran; use suitable local transport.'],
    ['Paras', 'Nature & Scenery', 34.7601, 73.4948, 'Riverside settlement and scenic stop in Kaghan Valley.'],
    ['Kunhar River Picnic Point', 'Nature & Scenery', 34.7818, 73.5250, 'Riverside stop for scenery and a short break.'],
  ],
};

const cityCovers = {
  Peshawar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
  Abbottabad: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  Chitral: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  Mansehra: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  Naran: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  'Swat Valley': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'Kaghan Valley': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
};

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing from .env.local');
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const db = mongoose.connection.db;
  const categoryNames = [...new Set(Object.values(catalogue).flat().map((place) => place[1]))];
  for (const name of categoryNames) {
    await db.collection('categories').updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  const categories = await db.collection('categories').find({ name: { $in: categoryNames } }).toArray();
  const categoryByName = new Map(categories.map((category) => [category.name, category._id]));
  let added = 0;
  let alreadyPresent = 0;
  for (const [cityName, places] of Object.entries(catalogue)) {
    const city = await db.collection('cities').findOne({ name: cityName });
    if (!city) { console.warn(`Skipped ${cityName}: city is not in the database.`); continue; }
    await db.collection('cities').updateOne({ _id: city._id }, { $set: { coverImage: cityCovers[cityName] } });
    for (const [name, category, lat, lng, description] of places) {
      const result = await db.collection('places').updateOne(
        { cityId: city._id, name },
        { $setOnInsert: { cityId: city._id, categoryId: categoryByName.get(category), name, description, location: { lat, lng }, address: cityName, images: [], rating: 4.2 } },
        { upsert: true }
      );
      if (result.upsertedCount) added += 1; else alreadyPresent += 1;
    }
  }
  console.log(`Catalogue complete: ${added} places added; ${alreadyPresent} already present. No records were deleted.`);
  await mongoose.disconnect();
}

main().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
