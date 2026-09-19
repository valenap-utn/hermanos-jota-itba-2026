const express = require('express');
const cors = require('cors');
const router = require('./routes/router');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

// App config: crea la app de Express
// A partir de `app` vamos a registrar middlewares y rutas
const app = express();

// Permite que el front pueda realizar peticiones al servidor
app.use(cors());

// ============ MIDDLEWARES ============

// Permite que Express interprete cuerpos de perticiones en formato JSON
app.use(express.json());

// =============== ROUTES ===============

// Todas las rutas de la API se agrupan bajo el prefijo /api
app.use('/api', router);
app.use(notFoundHandler);
app.use(errorHandler);

// Exporta la app para poder iniciar el servidor desde `server.js`
module.exports = app;
