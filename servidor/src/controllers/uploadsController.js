const cloudinary = require('../config/cloudinary');

const TIPOS_PERMITIDOS = new Set([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
]);

const subirImagenProducto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                mensaje: 'Debés seleccionar una imagen.',
            });
        }

        // Verificamos el contenido real del archivo.
        const {fileTypeFromBuffer} = await import('file-type');

        const tipoDetectado = await fileTypeFromBuffer(req.file.buffer);

        if (!tipoDetectado || !TIPOS_PERMITIDOS.has(tipoDetectado.mime)) {
            return res.status(400).json({
                mensaje: 'La imagen debe tener formato JPG, JPEG, PNG o WebP.',
            });
        }

        // Subimos el archivo a Cloudinary desde memoria.
        const resultado = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'hermanos-jota/productos',
                    resource_type: 'image',
                },
                (error, resultado) => {
                    if (error) return reject(error);
                    resolve(resultado);
                }
            );

            stream.end(req.file.buffer);
        });

        return res.status(201).json({
            imagenUrl: resultado.secure_url,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    subirImagenProducto,
};
