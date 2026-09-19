const express = require('express');
const {listarProductos, obtenerProductoPorId} = require('../controllers/productosController');

const router = express.Router();

router.get('/', listarProductos);
router.get('/:id', obtenerProductoPorId);

module.exports = router;