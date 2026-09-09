const express = require('express');
const healthcheckRoutes = require("./healthcheckRoutes");

// Router principal de la API
// Acá se van a agrupar las distintas rutas de la aplicación
const router = express.Router();

// Rutas de la API
router.use('/healthcheck', healthcheckRoutes);

module.exports = router;
