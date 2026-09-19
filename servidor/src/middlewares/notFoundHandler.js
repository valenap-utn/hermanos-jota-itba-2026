const ErrorFactory = require('../errors/errorFactory');

const notFoundHandler = (req, res, next) => {
  next(ErrorFactory.notFound(`Ruta '${req.originalUrl}' no encontrada`));
};

module.exports = notFoundHandler;