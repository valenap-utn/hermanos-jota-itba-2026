const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en las variables de entorno');
  await mongoose.connect(uri);
  console.log(`MongoDB conectado: ${mongoose.connection.name}`);
}

module.exports = connectDB;