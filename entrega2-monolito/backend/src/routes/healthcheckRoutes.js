const express = require('express');
const {healthcheck} = require('../controllers/healthcheckController');

// Router encargado de las rutas relacionadas al healthcheck
const router = express.Router();

// GET / => verifica que el servidor esté funcionando
router.get('/', healthcheck);

module.exports = router;
