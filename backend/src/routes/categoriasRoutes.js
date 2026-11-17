const express = require('express');
const verificarJwt = require('../middlewares/verificarJwt');
const {
    obtenerCategorias,
    crearCategoria,
    eliminarCategoria,
} = require('../controllers/categoriasController');

const router = express.Router();

router.get('/', obtenerCategorias);
router.post('/', verificarJwt, crearCategoria);
router.delete('/:id', verificarJwt, eliminarCategoria);

module.exports = router;
