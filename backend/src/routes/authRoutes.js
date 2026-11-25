const express = require('express');

const {
    registrarUsuario,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registrarUsuario);

module.exports = router;
