const Product = require('../models/Product');
const createError = require('http-errors');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');
const { subirACloudinary } = require('../utils/subirACloudinary');
const resolverCategoria = require('../utils/resolverCategoria');
const crearRegexInsensible = require('../utils/crearRegexInsensible');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const MAX_PRODUCTOS = Number(process.env.MAX_PRODUCTOS) || 25;

// Valida que la URL de imagen provenga de Cloudinary propio o de assets locales del proyecto
function validarImagen(url) {
  if (!url || typeof url !== 'string') return false;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const esCloudinaryOficial = cloudName && url.startsWith(`https://res.cloudinary.com/${cloudName}/`);
  const esAssetLocal = url.startsWith('/assets/');
  return Boolean(esCloudinaryOficial || esAssetLocal);
}

// Valida y convierte el precio rechazando vacío, espacios, tipos no escalares, NaN, Infinity o negativos
function parsearPrecioValido(valor) {
  if (typeof valor !== 'number' && typeof valor !== 'string') return null;
  if (typeof valor === 'string' && valor.trim() === '') return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return null;
  return numero;
}

// Valida y convierte el stock exigiendo un entero finito mayor o igual a 0
function parsearStockValido(valor) {
  if (typeof valor !== 'number' && typeof valor !== 'string') return null;
  if (typeof valor === 'string' && valor.trim() === '') return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 0) return null;
  return numero;
}

// Devuelve el catálogo de productos con filtrado y paginación
const listarProductos = asyncHandler(async (req, res) => {
  const { categoria, busqueda, page, limit } = req.query;
  const filtro = {};

  if (typeof categoria === 'string' && categoria !== 'todos' && categoria.trim()) {
    const catEscapada = categoria.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filtro.categoria = { $regex: new RegExp(`^${catEscapada}$`, 'i') };
  }

  if (typeof busqueda === 'string' && busqueda.trim()) {
    const regexBusqueda = crearRegexInsensible(busqueda);
    if (regexBusqueda) {
      filtro.$or = [
        { nombre: { $regex: regexBusqueda } },
        { descripcion: { $regex: regexBusqueda } }
      ];
    }
  }

  // Paginación si se especifican parámetros de página o límite
  if (page !== undefined || limit !== undefined) {
    const numPage = Math.max(1, Number(page) || 1);
    const numLimit = Math.min(50, Math.max(1, Number(limit) || 12));
    const total = await Product.countDocuments(filtro);
    const productos = await Product.find(filtro)
      .sort({ nombre: 1, _id: 1 })
      .skip((numPage - 1) * numLimit)
      .limit(numLimit);

    return successResponse(res, {
      data: productos,
      meta: {
        total,
        page: numPage,
        limit: numLimit,
        totalPages: Math.ceil(total / numLimit) || 1
      }
    });
  }

  const productos = await Product.find(filtro).sort({ nombre: 1, _id: 1 });
  successResponse(res, { data: productos });
});

// Devuelve el producto correspondiente al id recibido o 404 si no existe
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

// Crea y persiste un nuevo producto de forma atómica
const crearProducto = asyncHandler(async (req, res) => {
  const {
    nombre,
    descripcion,
    precio,
    stock,
    categoria,
    materiales,
    medidas,
    destacado,
    especificaciones
  } = req.body;

  if (typeof nombre !== 'string' || !nombre.trim()) {
    throw createError.BadRequest('El nombre del producto es obligatorio.');
  }
  if (typeof descripcion !== 'string' || !descripcion.trim()) {
    throw createError.BadRequest('La descripción del producto es obligatoria.');
  }
  const precioValido = parsearPrecioValido(precio);
  if (precioValido === null) {
    throw createError.BadRequest('El precio debe ser un número válido mayor o igual a 0.');
  }
  const stockValido = parsearStockValido(stock);
  if (stockValido === null) {
    throw createError.BadRequest('El stock debe ser un número entero mayor o igual a 0.');
  }

  // Validar límite máximo de productos en la base de datos antes de procesar archivos o categorías
  const totalProductos = await Product.countDocuments();
  if (totalProductos >= MAX_PRODUCTOS) {
    throw createError.BadRequest(
      `Se ha alcanzado el límite máximo de ${MAX_PRODUCTOS} productos permitidos en el catálogo.`
    );
  }

  // Validar y procesar imagen (obligatoria)
  let imagenUrlFinal = '';
  if (req.file && req.file.buffer) {
    imagenUrlFinal = await subirACloudinary(req.file.buffer);
  } else if (req.body.imagenUrl !== undefined) {
    if (typeof req.body.imagenUrl !== 'string') {
      throw createError.BadRequest('La URL de la imagen debe ser un texto válido.');
    }
    const urlLimpia = req.body.imagenUrl.trim();
    if (!urlLimpia) {
      throw createError.BadRequest('Debés seleccionar una imagen para el producto.');
    }
    if (!validarImagen(urlLimpia)) {
      throw createError.BadRequest('La URL de la imagen debe provenir del almacenamiento oficial del proyecto.');
    }
    imagenUrlFinal = urlLimpia;
  } else {
    throw createError.BadRequest('Debés seleccionar una imagen para el producto.');
  }

  // Resolver categoría
  const categoriaFinal = await resolverCategoria(categoria);

  // Crear el producto en MongoDB
  const nuevoProducto = await Product.create({
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    precio: precioValido,
    stock: stockValido,
    categoria: categoriaFinal,
    materiales: materiales ? materiales.trim() : '',
    medidas: medidas ? medidas.trim() : '',
    destacado: destacado === true || destacado === 'true',
    imagenUrl: imagenUrlFinal,
    especificaciones
  });

  successResponse(res, { data: nuevoProducto, statusCode: 201 });
});

// Actualiza un producto existente en MongoDB según su id
const actualizarProducto = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!OBJECT_ID_REGEX.test(id)) {
    throw createError.BadRequest(`El id '${id}' no es válido`);
  }

  const datosActualizacion = { ...req.body };

  // Si se envió un archivo nuevo en la actualización
  if (req.file && req.file.buffer) {
    datosActualizacion.imagenUrl = await subirACloudinary(req.file.buffer);
  } else if (datosActualizacion.imagenUrl !== undefined) {
    if (typeof datosActualizacion.imagenUrl !== 'string') {
      throw createError.BadRequest('La URL de la imagen debe ser un texto válido.');
    }
    const urlLimpia = datosActualizacion.imagenUrl.trim();
    if (!urlLimpia) {
      throw createError.BadRequest('La imagen del producto es obligatoria.');
    }
    if (!validarImagen(urlLimpia)) {
      throw createError.BadRequest('La URL de la imagen debe provenir del almacenamiento oficial del proyecto.');
    }
    datosActualizacion.imagenUrl = urlLimpia;
  }

  if (datosActualizacion.descripcion !== undefined) {
    if (typeof datosActualizacion.descripcion !== 'string' || !datosActualizacion.descripcion.trim()) {
      throw createError.BadRequest('La descripción del producto es obligatoria.');
    }
    datosActualizacion.descripcion = datosActualizacion.descripcion.trim();
  }

  // Resolver categoría de forma atómica si se actualiza
  if (datosActualizacion.categoria && typeof datosActualizacion.categoria === 'string') {
    datosActualizacion.categoria = await resolverCategoria(datosActualizacion.categoria);
  }

  if (datosActualizacion.precio !== undefined) {
    const precioValido = parsearPrecioValido(datosActualizacion.precio);
    if (precioValido === null) {
      throw createError.BadRequest('El precio debe ser un número válido mayor o igual a 0.');
    }
    datosActualizacion.precio = precioValido;
  }
  if (datosActualizacion.stock !== undefined) {
    const stockValido = parsearStockValido(datosActualizacion.stock);
    if (stockValido === null) {
      throw createError.BadRequest('El stock debe ser un número entero mayor o igual a 0.');
    }
    datosActualizacion.stock = stockValido;
  }
  if (datosActualizacion.destacado !== undefined) {
    datosActualizacion.destacado = datosActualizacion.destacado === true || datosActualizacion.destacado === 'true';
  }

  const productoActualizado = await Product.findByIdAndUpdate(id, datosActualizacion, {
    new: true,
    runValidators: true
  });

  if (!productoActualizado) {
    throw createError.NotFound(`No se encontró ningún producto con id ${id}`);
  }

  successResponse(res, { data: productoActualizado });
});

// Elimina un producto de MongoDB según su id
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
