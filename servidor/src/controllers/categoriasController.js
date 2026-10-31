const mongoose = require('mongoose');
const Category = require('../models/Category');

// GET /api/categorias
const obtenerCategorias = async (req, res, next) => {
    try {
        const categorias = await Category.find()
            .collation({ locale: 'es', strength: 2 })
            .sort({ nombre: 1 });

        res.status(200).json({
            status: 'success',
            data: categorias,
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/categorias
const crearCategoria = async (req, res, next) => {
    try {
        const nombre = req.body.nombre;

        if (typeof nombre !== 'string' || !nombre.trim()) {
            return res.status(400).json({
                status: 'fail',
                message: 'El nombre de la categoría es obligatorio.',
            });
        }

        const nombreNormalizado = nombre.trim();

        // Confiamos en el índice único de MongoDB con collation para garantizar atomicidad y prevenir condiciones de carrera
        const categoria = await Category.create({
            nombre: nombreNormalizado,
        });

        res.status(201).json({
            status: 'success',
            data: categoria,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                status: 'fail',
                message: 'Ya existe una categoría con ese nombre.',
            });
        }

        next(error);
    }
};

// DELETE /api/categorias/:id
const eliminarCategoria = async (req, res, next) => {
    try {
        const {id} = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                status: 'fail',
                message: 'El identificador de categoría no es válido.',
            });
        }

        const categoria = await Category.findByIdAndDelete(id);

        if (!categoria) {
            return res.status(404).json({
                status: 'fail',
                message: 'La categoría no existe.',
            });
        }

        res.status(200).json({
            status: 'success',
            data: categoria,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    obtenerCategorias,
    crearCategoria,
    eliminarCategoria,
};
