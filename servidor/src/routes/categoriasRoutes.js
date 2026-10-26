const express = require('express');

const {
    obtenerCategorias,
    crearCategoria,
    eliminarCategoria,
} = require('../controllers/categoriasController');

const router = express.Router();

router.get('/', obtenerCategorias);
router.post('/', crearCategoria);
router.delete('/:id', eliminarCategoria);

module.exports = router;
