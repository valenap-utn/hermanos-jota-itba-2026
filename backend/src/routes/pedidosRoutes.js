const express = require('express');
const verificarJwt = require('../middlewares/verificarJwt');
const {
  crearPedido,
  listarPedidosUsuario,
  obtenerPedidoPorId
} = require('../controllers/pedidosController');

const router = express.Router();

// Todas las rutas de pedidos requieren autenticación previa
router.use(verificarJwt);

router.post('/', crearPedido);
router.get('/', listarPedidosUsuario);
router.get('/:id', obtenerPedidoPorId);

module.exports = router;
