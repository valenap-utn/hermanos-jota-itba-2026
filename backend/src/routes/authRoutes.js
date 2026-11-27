const express = require('express');

const {
    registrarUsuario, iniciarSesion, obtenerUsuarioActual,
} = require('../controllers/authController');

const { autenticarUsuario } = require('../middlewares/authMiddleware')

const router = express.Router();

// Rutas publicas
router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);

// Rutas protegidas
router.get('/me', autenticarUsuario, obtenerUsuarioActual);


module.exports = router;
