const createError = require('http-errors');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');
const { subirACloudinary } = require('../utils/subirACloudinary');

const subirImagenProducto = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw createError.BadRequest('Debés seleccionar una imagen.');
    }

    const imagenUrl = await subirACloudinary(req.file.buffer);

    successResponse(res, {
        data: {
            imagenUrl,
        },
        statusCode: 201,
    });
});

module.exports = {
    subirImagenProducto,
};
