const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const verificarJwt = require('../middlewares/verificarJwt');
const {subirImagenProducto} = require('../controllers/uploadsController');

const router = express.Router();

router.post(
    '/productos',
    verificarJwt,
    upload.single('imagen'),
    subirImagenProducto
);

module.exports = router;
