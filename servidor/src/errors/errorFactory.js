const AppError = require('/AppError');

const ErrorFactory = {
  notFound: (message) => new AppError(message, 404, 'not_found'),
  badRequest: (message) => new AppError(message, 400, 'bad_request'),
  internal: (message) => new AppError(message || 'Error interno del servidor', 500, 'error'),
};

module.exports = ErrorFactory;