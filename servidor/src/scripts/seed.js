const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const productos = require('../data/productos');

async function seed() {
  await connectDB();

  const docs = productos.map(({ id, imagen, ...resto }) => ({
    ...resto,
    imagenUrl: imagen,
    stock: resto.stock ?? 10
  }));

  await Product.deleteMany({});
  await Product.insertMany(docs);
  console.log(`Seed completo: ${docs.length} productos`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});