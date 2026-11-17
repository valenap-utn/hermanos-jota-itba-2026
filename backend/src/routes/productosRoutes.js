const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const verificarJwt = require('../middlewares/verificarJwt');
const {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productosController');

const router = express.Router();

router.get('/', listarProductos);
router.get('/:id', obtenerProductoPorId);
router.post('/', verificarJwt, upload.single('imagen'), crearProducto);
router.put('/:id', verificarJwt, upload.single('imagen'), actualizarProducto);
router.delete('/:id', verificarJwt, eliminarProducto);

module.exports = router;
