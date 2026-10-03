const createError = require('http-errors');

const notFoundHandler = (req, res, next) => {
    next(createError.NotFound(`Ruta '${req.originalUrl}' no encontrada`));
};

module.exports = notFoundHandler;