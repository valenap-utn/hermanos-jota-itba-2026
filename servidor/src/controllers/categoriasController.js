const mongoose = require('mongoose');
const Category = require('../models/Category');

// GET /api/categorias
const obtenerCategorias = async (req, res, next) => {
    try {
        const categorias = await Category.find()
            .sort({nombre: 1});

        res.status(200).json({
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
                message: 'El nombre de la categoría es obligatorio.',
            });
        }

        const nombreNormalizado = nombre.trim();

        // Evita duplicados sin distinguir mayúsculas y minúsculas.
        const categoriaExistente = await Category.findOne({
            nombre: {
                $regex: `^${nombreNormalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
                $options: 'i',
            },
        });

        if (categoriaExistente) {
            return res.status(409).json({
                message: 'Ya existe una categoría con ese nombre.',
            });
        }

        const categoria = await Category.create({
            nombre: nombreNormalizado,
        });

        res.status(201).json({
            data: categoria,
        });
    } catch (error) {
        console.error('Error al crear categoría:', {
            code: error.code,
            keyPattern: error.keyPattern,
            keyValue: error.keyValue,
            message: error.message,
        });

        if (error.code === 11000) {
            return res.status(409).json({
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
                message: 'El identificador de categoría no es válido.',
            });
        }

        const categoria = await Category.findByIdAndDelete(id);

        if (!categoria) {
            return res.status(404).json({
                message: 'La categoría no existe.',
            });
        }

        res.status(200).json({
            message: 'Categoría eliminada correctamente.',
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
