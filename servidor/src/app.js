const express = require('express');
const cors = require('cors');
const path = require('path');
const router = require('./routes/router');
const requestLogger = require('./middlewares/requestLogger');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');

// App config: crea la app de Express
// A partir de `app` vamos a registrar middlewares y rutas
const app = express();

// Permite que el front pueda realizar peticiones al servidor
app.use(cors());

// ============ MIDDLEWARES ============

// Registra el método HTTP y la URL de cada petición entrante
app.use(requestLogger);

// Permite que Express interprete cuerpos de peticiones en formato JSON
app.use(express.json());

// =============== ROUTES ===============

// Todas las rutas de la API se agrupan bajo el prefijo /api
app.use('/api', router);
app.use('/api', notFoundHandler);

app.use(express.static(path.join(__dirname, '../cliente/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../cliente/dist/index.html'));
});

app.use(errorHandler);

// Exporta la app para poder iniciar el servidor desde `server.js`
module.exports = app;
