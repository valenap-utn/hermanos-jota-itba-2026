const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
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
router.post('/', upload.single('imagen'), crearProducto);
router.put('/:id', upload.single('imagen'), actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;
