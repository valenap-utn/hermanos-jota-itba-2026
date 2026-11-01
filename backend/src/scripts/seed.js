const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const productos = require('../data/productos');

async function seed() {
  await connectDB();

  const esReset = process.argv.includes('--reset');

  const docs = productos.map(({ id, imagen, ...resto }) => ({
    ...resto,
    imagenUrl: imagen,
    stock: resto.stock ?? 10
  }));

  if (esReset) {
    await Product.deleteMany({});
    await Product.insertMany(docs);
    console.log(`[Reset] Seed completo: ${docs.length} productos reemplazados.`);
  } else {
    // Modo Upsert: preserva productos existentes agregados por usuarios y sincroniza base
    for (const doc of docs) {
      await Product.findOneAndUpdate(
        { nombre: doc.nombre },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Upsert] Sincronizados ${docs.length} productos base (preservando catálogo previo).`);
  }

  const categoriasBase = [
    ...new Set(productos.map((p) => p.categoria.trim().toLowerCase()))
  ];

  if (esReset) {
    await Category.deleteMany({});
    await Category.insertMany(categoriasBase.map((nombre) => ({ nombre })));
    console.log(`[Reset] Seed completo: ${categoriasBase.length} categorías.`);
  } else {
    for (const nombre of categoriasBase) {
      await Category.findOneAndUpdate(
        { nombre },
        { $setOnInsert: { nombre } },
        { upsert: true, collation: { locale: 'es', strength: 1 } }
      );
    }
    console.log(`[Upsert] Sincronizadas ${categoriasBase.length} categorías base.`);
  }

  await Category.syncIndexes();
  console.log('[Indexes] Índices de Category sincronizados.');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
