// Middleware propio de logging para registrar cada petición entrante al servidor
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const url = req.originalUrl || req.url;

  console.log(`[${timestamp}] ${req.method} ${url}`);

  next();
};

module.exports = requestLogger;
