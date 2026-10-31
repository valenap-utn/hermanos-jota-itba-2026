const cloudinary = require('../config/cloudinary');
const createError = require('http-errors');

const TIPOS_IMAGEN_PERMITIDOS = new Set([
  'image/png',
  'image/jpeg',
  'image/webp'
]);

/**
 * Sube un buffer de imagen a Cloudinary verificando su tipo real con magic bytes.
 * @param {Buffer} buffer - Buffer del archivo en memoria
 * @param {string} [folder='hermanos-jota/productos'] - Carpeta de destino en Cloudinary
 * @returns {Promise<string>} URL segura (https) de la imagen subida
 */
async function subirACloudinary(buffer, folder = 'hermanos-jota/productos') {
  const { fileTypeFromBuffer } = await import('file-type');
  const tipoDetectado = await fileTypeFromBuffer(buffer);

  if (!tipoDetectado || !TIPOS_IMAGEN_PERMITIDOS.has(tipoDetectado.mime)) {
    throw createError.BadRequest('La imagen debe tener formato JPG, JPEG, PNG o WebP.');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, resultado) => {
        if (error) return reject(error);
        resolve(resultado.secure_url);
      }
    );
    stream.end(buffer);
  });
}

module.exports = {
  subirACloudinary,
  TIPOS_IMAGEN_PERMITIDOS
};
