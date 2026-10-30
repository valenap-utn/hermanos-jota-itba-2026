const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const {subirImagenProducto} = require('../controllers/uploadsController');

const router = express.Router();

router.post(
    '/productos',
    upload.single('imagen'),
    subirImagenProducto
);

module.exports = router;

