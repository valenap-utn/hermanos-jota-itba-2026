const productos = require('../data/productos');
const ErrorFactory = require('../errors/errorFactory');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');

// Devuelve el catálogo completo de productos
const listarProductos = asyncHandler ((req, res) => {
  successResponse(res, { data: productos });
});

// Devuelve el producto correspondiente al id recibido, o 404 si no existe
const obtenerProductoPorId = asyncHandler ((req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id))
    throw ErrorFactory.badRequest(`El id '${req.params.id}' no es válido`);

  const producto = productos.find((p) => p.id === id);

  if (!producto)
    throw ErrorFactory.notFound(`No se encontró ningún producto con id ${id}`);

  successResponse(res, { data: producto });
});

module.exports = {listarProductos, obtenerProductoPorId};