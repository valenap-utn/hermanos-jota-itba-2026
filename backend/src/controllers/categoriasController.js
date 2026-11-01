const mongoose = require('mongoose');
const createError = require('http-errors');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');

// GET /api/categorias
const obtenerCategorias = asyncHandler(async (req, res) => {
    const categorias = await Category.find()
        .collation({ locale: 'es', strength: 2 })
        .sort({ nombre: 1 });

    successResponse(res, { data: categorias });
});

// POST /api/categorias
const crearCategoria = asyncHandler(async (req, res) => {
    const nombre = req.body.nombre;

    if (typeof nombre !== 'string' || !nombre.trim()) {
        throw createError.BadRequest('El nombre de la categoría es obligatorio.');
    }

    const nombreNormalizado = nombre.trim();

    // Confiamos en el índice único de MongoDB con collation para garantizar atomicidad y prevenir condiciones de carrera.
    // El middleware errorHandler global captura el error 11000 y responde con 409.
    const categoria = await Category.create({
        nombre: nombreNormalizado,
    });

    successResponse(res, { data: categoria, statusCode: 201 });
});

// DELETE /api/categorias/:id
const eliminarCategoria = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        throw createError.BadRequest('El identificador de categoría no es válido.');
    }

    const categoria = await Category.findByIdAndDelete(id);

    if (!categoria) {
        throw createError.NotFound('La categoría no existe.');
    }

    successResponse(res, { data: categoria });
});

module.exports = {
    obtenerCategorias,
    crearCategoria,
    eliminarCategoria,
};
