const Product = require('../models/Product');
const Category = require('../models/Category');
const createError = require('http-errors');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');
const { subirACloudinary } = require('../utils/subirACloudinary');

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

// Devuelve el catálogo de productos con filtrado y paginación
const listarProductos = asyncHandler(async (req, res) => {
  const { categoria, busqueda, search, page, limit } = req.query;
  const filtro = {};

  if (categoria && categoria !== 'todos' && categoria.trim()) {
    filtro.categoria = { $regex: new RegExp(`^${categoria.trim()}$`, 'i') };
  }

  const terminoBusqueda = busqueda || search;
  if (terminoBusqueda && terminoBusqueda.trim()) {
    filtro.nombre = { $regex: terminoBusqueda.trim(), $options: 'i' };
  }

  // Paginación si se especifican parámetros de página o límite
  if (page !== undefined || limit !== undefined) {
    const numPage = Math.max(1, Number(page) || 1);
    const numLimit = Math.max(1, Number(limit) || 12);
    const total = await Product.countDocuments(filtro);
    const productos = await Product.find(filtro)
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

  const productos = await Product.find(filtro);
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

  if (!nombre || !nombre.trim()) {
    throw createError.BadRequest('El nombre del producto es obligatorio.');
  }
  if (!descripcion || !descripcion.trim()) {
    throw createError.BadRequest('La descripción del producto es obligatoria.');
  }
  if (precio === undefined || isNaN(Number(precio)) || Number(precio) < 0) {
    throw createError.BadRequest('El precio debe ser un número válido mayor o igual a 0.');
  }

  // Validar límite máximo de productos en la base de datos antes de procesar archivos o categorías
  const totalProductos = await Product.countDocuments();
  if (totalProductos >= MAX_PRODUCTOS) {
    throw createError.BadRequest(
      `Se ha alcanzado el límite máximo de ${MAX_PRODUCTOS} productos permitidos en el catálogo.`
    );
  }

  // Resolver categoría
  let categoriaFinal = '';
  if (categoria && typeof categoria === 'string' && categoria.trim()) {
    const nombreCategoria = categoria.trim();
    const cat = await Category.findOneAndUpdate(
      { nombre: nombreCategoria },
      { $setOnInsert: { nombre: nombreCategoria } },
      { upsert: true, new: true, collation: { locale: 'es', strength: 1 } }
    );
    categoriaFinal = cat.nombre;
  }

  // Resolver imagen
  let imagenUrlFinal = '';
  if (req.file && req.file.buffer) {
    imagenUrlFinal = await subirACloudinary(req.file.buffer);
  } else if (req.body.imagenUrl) {
    if (!validarImagen(req.body.imagenUrl)) {
      throw createError.BadRequest('La URL de la imagen debe provenir del almacenamiento oficial del proyecto.');
    }
    imagenUrlFinal = req.body.imagenUrl.trim();
  } else {
    throw createError.BadRequest('Debés seleccionar una imagen para el producto.');
  }

  // Crear el producto en MongoDB
  const nuevoProducto = await Product.create({
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    precio: Number(precio),
    stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : 0,
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
  } else if (datosActualizacion.imagenUrl && !validarImagen(datosActualizacion.imagenUrl)) {
    throw createError.BadRequest('La URL de la imagen debe provenir del almacenamiento oficial del proyecto.');
  }

  // Resolver categoría de forma atómica si se actualiza
  if (datosActualizacion.categoria && typeof datosActualizacion.categoria === 'string') {
    const nombreCat = datosActualizacion.categoria.trim();
    const cat = await Category.findOneAndUpdate(
      { nombre: nombreCat },
      { $setOnInsert: { nombre: nombreCat } },
      { upsert: true, new: true, collation: { locale: 'es', strength: 1 } }
    );
    datosActualizacion.categoria = cat.nombre;
  }

  if (datosActualizacion.precio !== undefined) {
    datosActualizacion.precio = Number(datosActualizacion.precio);
  }
  if (datosActualizacion.stock !== undefined) {
    datosActualizacion.stock = Math.max(0, Number(datosActualizacion.stock));
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