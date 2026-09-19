const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Error interno del servidor';

  console.error(`[${req.method} ${req.url}] (${err.name}): ${message}`);

  res.status(statusCode).json({
    status,
    message,
    ...(err.details && {details: err.details}),
  });
};

module.exports = errorHandler;