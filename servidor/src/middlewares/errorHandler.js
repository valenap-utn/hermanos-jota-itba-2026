const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.expose !== false ? err.message : 'Error interno del servidor';

  // Manejo de errores de conversión de Mongoose (ej: id no compatible con ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `El formato del id '${err.value}' no es válido`;
  }

  // Manejo de errores de validación de Mongoose (campos requeridos, tipos o validaciones de schema)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  console.error(`[${req.method} ${req.url}] (${err.name}): ${message}`);

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(err.details && {details: err.details}),
  });
};

module.exports = errorHandler;