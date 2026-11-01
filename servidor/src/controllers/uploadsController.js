const { subirACloudinary } = require('../utils/subirACloudinary');

const subirImagenProducto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'Debés seleccionar una imagen.',
            });
        }

        const imagenUrl = await subirACloudinary(req.file.buffer);

        return res.status(201).json({
            status: 'success',
            data: {
                imagenUrl,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    subirImagenProducto,
};
