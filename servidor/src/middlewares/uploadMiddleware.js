const multer = require('multer');

const TIPOS_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },

    fileFilter: (req, file, cb) => {
        if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
            return cb(
                new Error('Formato no permitido. Utilizá JPG, PNG o WebP.')
            );
        }

        cb(null, true);
    },
});

module.exports = upload;
