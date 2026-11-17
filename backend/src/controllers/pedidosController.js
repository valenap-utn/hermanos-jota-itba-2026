const createError = require('http-errors');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Registra un nuevo pedido autenticado, validando stock y calculando precios en el servidor
const crearPedido = asyncHandler(async (req, res) => {
  const usuarioId = req.user?.id || req.user?._id;
  if (!usuarioId) {
    throw createError.Unauthorized('Usuario no autenticado.');
  }

  const rawItems = Array.isArray(req.body)
    ? req.body
    : req.body?.items || req.body?.carrito;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw createError.BadRequest('El pedido debe incluir una lista no vacía de items.');
  }

  // Normalizar y validar estructura inicial de cada item
  const itemsNormalizados = [];
  for (const item of rawItems) {
    const prodId = item?.producto || item?.id || item?.productoId;
    const cantidad = Number(item?.cantidad);

    if (!prodId || !OBJECT_ID_REGEX.test(String(prodId))) {
      throw createError.BadRequest(`Identificador de producto inválido: ${prodId}`);
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw createError.BadRequest('La cantidad solicitada debe ser un número entero mayor a 0.');
    }

    itemsNormalizados.push({ productoId: String(prodId), cantidad });
  }

  // Agrupar cantidades si hay productos duplicados en la misma petición
  const mapaItems = new Map();
  for (const { productoId, cantidad } of itemsNormalizados) {
    mapaItems.set(productoId, (mapaItems.get(productoId) || 0) + cantidad);
  }

  // 1. Fase de verificación previa: existencia y stock
  const productosEncontrados = [];
  for (const [productoId, cantidadRequerida] of mapaItems.entries()) {
    const producto = await Product.findById(productoId);
    if (!producto) {
      throw createError.NotFound(`No se encontró el producto con id '${productoId}'.`);
    }

    const stockActual = Number(producto.stock) || 0;
    if (stockActual < cantidadRequerida) {
      throw createError.BadRequest(
        `Stock insuficiente para "${producto.nombre}". Stock disponible: ${stockActual}, solicitado: ${cantidadRequerida}.`
      );
    }

    productosEncontrados.push({
      producto,
      cantidad: cantidadRequerida
    });
  }

  // 2. Fase de decremento atómico de stock con mecanismo de rollback ante colisiones
  const decrementosExitosos = [];
  let errorDecremento = null;

  for (const { producto, cantidad } of productosEncontrados) {
    const actualizado = await Product.findOneAndUpdate(
      { _id: producto._id, stock: { $gte: cantidad } },
      { $inc: { stock: -cantidad } },
      { returnDocument: 'after' }
    );

    if (!actualizado) {
      errorDecremento = createError.Conflict(
        `No fue posible reservar stock para "${producto.nombre}". Stock insuficiente o modificado concurrentemente.`
      );
      break;
    }

    decrementosExitosos.push({ id: producto._id, cantidad });
  }

  // Si falló algún decremento, revertir los que se hayan aplicado
  if (errorDecremento) {
    await Promise.all(
      decrementosExitosos.map(({ id, cantidad }) =>
        Product.updateOne({ _id: id }, { $inc: { stock: cantidad } })
      )
    );
    throw errorDecremento;
  }

  // 3. Fase de creación del pedido en base de datos
  try {
    let total = 0;
    const itemsParaGuardar = productosEncontrados.map(({ producto, cantidad }) => {
      const precio = Number(producto.precio) || 0;
      const subtotal = precio * cantidad;
      total += subtotal;

      return {
        producto: producto._id,
        nombre: producto.nombre,
        precio,
        cantidad,
        subtotal
      };
    });

    const nuevoPedido = await Order.create({
      usuario: usuarioId,
      items: itemsParaGuardar,
      total,
      estado: 'confirmado'
    });

    return successResponse(res, { statusCode: 201, data: nuevoPedido });
  } catch (err) {
    // Rollback total del stock si falla la persistencia de la orden
    await Promise.all(
      decrementosExitosos.map(({ id, cantidad }) =>
        Product.updateOne({ _id: id }, { $inc: { stock: cantidad } })
      )
    );
    throw err;
  }
});

// Devuelve los pedidos del usuario autenticado
const listarPedidosUsuario = asyncHandler(async (req, res) => {
  const usuarioId = req.user?.id || req.user?._id;
  if (!usuarioId) {
    throw createError.Unauthorized('Usuario no autenticado.');
  }

  const pedidos = await Order.find({ usuario: usuarioId }).sort({ createdAt: -1 });
  return successResponse(res, { data: pedidos });
});

// Devuelve el detalle de un pedido específico del usuario
const obtenerPedidoPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.user?.id || req.user?._id;

  if (!OBJECT_ID_REGEX.test(id)) {
    throw createError.BadRequest(`El id '${id}' no es válido`);
  }

  const pedido = await Order.findById(id).populate('items.producto', 'nombre precio imagenUrl');
  if (!pedido) {
    throw createError.NotFound(`No se encontró ningún pedido con id '${id}'.`);
  }

  if (pedido.usuario.toString() !== String(usuarioId) && req.user?.rol !== 'admin') {
    throw createError.Forbidden('No tenés permisos para visualizar este pedido.');
  }

  return successResponse(res, { data: pedido });
});

module.exports = {
  crearPedido,
  listarPedidosUsuario,
  obtenerPedidoPorId
};
