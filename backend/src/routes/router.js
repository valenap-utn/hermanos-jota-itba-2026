const express = require('express');
const healthcheckRoutes = require("./healthcheckRoutes");
const productosRoutes = require("./productosRoutes");
const uploadsRoutes = require('./uploadsRoutes');
const categoriasRoutes = require('./categoriasRoutes');
const authRoutes = require('./authRoutes');

// Router principal de la API
// Acá se van a agrupar las distintas rutas de la aplicación
const router = express.Router();

// Rutas de la API
router.use('/healthcheck', healthcheckRoutes);
router.use('/productos', productosRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/auth', authRoutes);

module.exports = router;
