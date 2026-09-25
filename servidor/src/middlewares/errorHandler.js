const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.expose !== false ? err.message : 'Error interno del servidor';

  console.error(`[${req.method} ${req.url}] (${err.name}): ${message}`);

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(err.details && {details: err.details}),
  });
};

module.exports = errorHandler;