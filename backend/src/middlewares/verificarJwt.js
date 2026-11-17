const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const JWT_SECRET = process.env.JWT_SECRET || 'hermanos-jota-secret-key-dev';

// Valida la firma y vigencia del token JWT enviado en el header Authorization
const verificarJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(createError.Unauthorized('Token de autenticación no proporcionado.'));
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return next(
      createError.Unauthorized('Formato de autorización inválido. Debe ser: Bearer <token>.')
    );
  }

  const token = partes[1].trim();
  if (!token) {
    return next(createError.Unauthorized('Token de autenticación no proporcionado.'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError.Unauthorized('La sesión ha expirado. Por favor, iniciá sesión nuevamente.'));
    }
    return next(createError.Unauthorized('Token de autenticación inválido.'));
  }
};

module.exports = verificarJwt;
