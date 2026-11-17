const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Product = require('../src/models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'hermanos-jota-secret-key-dev';

// Inicia un servidor HTTP en un puerto aleatorio para pruebas de rutas protegidas
let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}/api`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Rutas públicas - GET /api/healthcheck responde 200 sin autenticación', async () => {
  const res = await fetch(`${baseUrl}/healthcheck`);
  assert.equal(res.status, 200);
});

test('Rutas protegidas de productos - Rechazan peticiones sin autenticación (401)', async (t) => {
  await t.test('POST /api/productos sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Mesa' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.status, 'fail');
    assert.match(data.message, /Token de autenticación no proporcionado/i);
  });

  await t.test('PUT /api/productos/:id sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/productos/64b1f28b7e09876543210001`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Mesa Modificada' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.status, 'fail');
    assert.match(data.message, /Token de autenticación no proporcionado/i);
  });

  await t.test('DELETE /api/productos/:id sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/productos/64b1f28b7e09876543210001`, {
      method: 'DELETE'
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.status, 'fail');
    assert.match(data.message, /Token de autenticación no proporcionado/i);
  });
});

test('Rutas protegidas de categorías - Rechazan peticiones sin autenticación (401)', async (t) => {
  await t.test('POST /api/categorias sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/categorias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Dormitorio' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.status, 'fail');
  });

  await t.test('DELETE /api/categorias/:id sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/categorias/64b1f28b7e09876543210002`, {
      method: 'DELETE'
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.status, 'fail');
  });
});

test('Rutas protegidas de uploads - Rechaza subida de imagen sin autenticación (401)', async () => {
  const res = await fetch(`${baseUrl}/uploads/productos`, {
    method: 'POST'
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.status, 'fail');
});

test('Validación de tokens - Rechaza token inválido y token expirado con 401', async (t) => {
  await t.test('POST /api/productos con token adulterado responde 401', async () => {
    const tokenInvalido = jwt.sign({ id: 'bad-user' }, 'clave-falsa');
    const res = await fetch(`${baseUrl}/productos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenInvalido}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre: 'Mesa' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.message, /Token de autenticación inválido/i);
  });

  await t.test('POST /api/productos con token expirado responde 401', async () => {
    const tokenExpirado = jwt.sign({ id: 'expired-user' }, JWT_SECRET, { expiresIn: -10 });
    const res = await fetch(`${baseUrl}/productos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenExpirado}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre: 'Mesa' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.match(data.message, /ha expirado/i);
  });
});

test('Autorización exitosa - Pasa el middleware con Bearer token válido', async () => {
  const tokenValido = jwt.sign(
    { id: 'usr-admin-1', email: 'admin@hermanosjota.com', rol: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const origFn = Product.findByIdAndDelete;
  Product.findByIdAndDelete = async () => ({ _id: '64b1f28b7e09876543210001', nombre: 'Mesa Mock' });

  try {
    const res = await fetch(`${baseUrl}/productos/64b1f28b7e09876543210001`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenValido}`
      }
    });

    assert.equal(res.status, 200, 'Debe procesar la petición y devolver 200');
    const data = await res.json();
    assert.equal(data.status, 'success');
  } finally {
    Product.findByIdAndDelete = origFn;
  }
});
