const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const verificarJwt = require('../src/middlewares/verificarJwt');

const JWT_SECRET = process.env.JWT_SECRET || 'hermanos-jota-secret-key-dev';

test('verificarJwt - Pasa la verificación con Bearer token válido y puebla req.user', () => {
  const payloadEsperado = { id: 'usr-123', email: 'admin@hermanosjota.com', rol: 'admin' };
  const token = jwt.sign(payloadEsperado, JWT_SECRET, { expiresIn: '1h' });

  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  };
  const res = {};
  let nextLlamado = false;
  let errorCapturado = null;

  verificarJwt(req, res, (err) => {
    nextLlamado = true;
    errorCapturado = err;
  });

  assert.equal(nextLlamado, true, 'Debe invocar a next()');
  assert.equal(errorCapturado, undefined, 'No debe pasar ningún error a next()');
  assert.equal(req.user.id, payloadEsperado.id);
  assert.equal(req.user.email, payloadEsperado.email);
  assert.equal(req.user.rol, payloadEsperado.rol);
});

test('verificarJwt - Rechaza petición sin cabecera Authorization', () => {
  const req = { headers: {} };
  const res = {};
  let errorCapturado = null;

  verificarJwt(req, res, (err) => {
    errorCapturado = err;
  });

  assert.ok(errorCapturado, 'Debe generar error');
  assert.equal(errorCapturado.statusCode, 401);
  assert.equal(errorCapturado.message, 'Token de autenticación no proporcionado.');
});

test('verificarJwt - Rechaza formato de cabecera que no utiliza el esquema Bearer', () => {
  const req = {
    headers: {
      authorization: 'Basic dXNlcjpwYXNz'
    }
  };
  const res = {};
  let errorCapturado = null;

  verificarJwt(req, res, (err) => {
    errorCapturado = err;
  });

  assert.ok(errorCapturado, 'Debe generar error');
  assert.equal(errorCapturado.statusCode, 401);
  assert.equal(
    errorCapturado.message,
    'Formato de autorización inválido. Debe ser: Bearer <token>.'
  );
});

test('verificarJwt - Rechaza cabecera Bearer con token vacío', () => {
  const req = {
    headers: {
      authorization: 'Bearer '
    }
  };
  const res = {};
  let errorCapturado = null;

  verificarJwt(req, res, (err) => {
    errorCapturado = err;
  });

  assert.ok(errorCapturado, 'Debe generar error');
  assert.equal(errorCapturado.statusCode, 401);
});

test('verificarJwt - Rechaza token expirado informando vencimiento de sesión', () => {
  const tokenExpirado = jwt.sign({ id: 'usr-999' }, JWT_SECRET, { expiresIn: -10 });

  const req = {
    headers: {
      authorization: `Bearer ${tokenExpirado}`
    }
  };
  const res = {};
  let errorCapturado = null;

  verificarJwt(req, res, (err) => {
    errorCapturado = err;
  });

  assert.ok(errorCapturado, 'Debe generar error');
  assert.equal(errorCapturado.statusCode, 401);
  assert.equal(
    errorCapturado.message,
    'La sesión ha expirado. Por favor, iniciá sesión nuevamente.'
  );
});

test('verificarJwt - Rechaza token adulterado o firmado con secreto incorrecto', () => {
  const tokenInvalido = jwt.sign({ id: 'usr-attacker' }, 'secreto-falso-desconocido');

  const req = {
    headers: {
      authorization: `Bearer ${tokenInvalido}`
    }
  };
  const res = {};
  let errorCapturado = null;

  verificarJwt(req, res, (err) => {
    errorCapturado = err;
  });

  assert.ok(errorCapturado, 'Debe generar error');
  assert.equal(errorCapturado.statusCode, 401);
  assert.equal(errorCapturado.message, 'Token de autenticación inválido.');
});
