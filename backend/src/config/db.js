const mongoose = require('mongoose');

// Establece la conexión a MongoDB (Atlas en producción o local en desarrollo)
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta MONGODB_URI en las variables de entorno');

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout de 5s para fallar con diagnóstico claro ante problemas de red o credenciales en Atlas
  };

  try {
    await mongoose.connect(uri, options);
    console.log(`MongoDB conectado exitosamente a la base: ${mongoose.connection.name}`);
  } catch (error) {
    // Registro sin exponer contraseñas en el log de consola
    const hostSanitizado = uri.includes('@') ? uri.split('@')[1] : 'host local/privado';
    console.error(`Error al conectar con MongoDB (${hostSanitizado}):`, error.message);
    throw error;
  }
}

module.exports = connectDB;