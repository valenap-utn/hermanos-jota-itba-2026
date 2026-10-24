const Product = require('../models/Product');
const createError = require('http-errors');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

// Devuelve el catálogo completo de productos almacenados en MongoDB
const listarProductos = asyncHandler(async (req, res) => {
  const productos = await Product.find();
  successResponse(res, { data: productos });
});

// Devuelve el producto correspondiente al _id recibido, o 404 si no existe
const obtenerProductoPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!OBJECT_ID_REGEX.test(id)) {
    throw createError.BadRequest(`El id '${id}' no es válido`);
  }

  const producto = await Product.findById(id);

  if (!producto) {
    throw createError.NotFound(`No se encontró ningún producto con id ${id}`);
  }

  successResponse(res, { data: producto });
});

// Crea y persiste un nuevo producto en MongoDB
const crearProducto = asyncHandler(async (req, res) => {
  const nuevoProducto = await Product.create(req.body);
  successResponse(res, { data: nuevoProducto, statusCode: 201 });
});

// Actualiza un producto existente en MongoDB según su _id
const actualizarProducto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!OBJECT_ID_REGEX.test(id)) {
    throw createError.BadRequest(`El id '${id}' no es válido`);
  }

  const productoActualizado = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  if (!productoActualizado) {
    throw createError.NotFound(`No se encontró ningún producto con id ${id}`);
  }

  successResponse(res, { data: productoActualizado });
});

// Elimina un producto de MongoDB según su _id
const eliminarProducto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!OBJECT_ID_REGEX.test(id)) {
    throw createError.BadRequest(`El id '${id}' no es válido`);
  }

  const productoEliminado = await Product.findByIdAndDelete(id);

  if (!productoEliminado) {
    throw createError.NotFound(`No se encontró ningún producto con id ${id}`);
  }

  successResponse(res, { data: productoEliminado });
});

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};