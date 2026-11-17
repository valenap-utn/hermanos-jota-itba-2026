const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

const JWT_SECRET = process.env.JWT_SECRET || 'hermanos-jota-secret-key-dev';

let server;
let baseUrl;

const usuarioTest = {
  id: new mongoose.Types.ObjectId().toString(),
  email: 'comprador@hermanosjota.com',
  rol: 'user'
};

const tokenValido = jwt.sign(usuarioTest, JWT_SECRET, { expiresIn: '1h' });

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

test('Pedidos - Seguridad: Rechaza peticiones sin autenticación (401)', async (t) => {
  await t.test('POST /api/pedidos sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.status, 'fail');
    assert.match(data.message, /Token de autenticación no proporcionado/i);
  });

  await t.test('GET /api/pedidos sin token responde 401', async () => {
    const res = await fetch(`${baseUrl}/pedidos`);
    assert.equal(res.status, 401);
  });
});

test('Pedidos - Validaciones de entrada (400)', async (t) => {
  await t.test('Rechaza items vacío', async () => {
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: [] })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /debe incluir una lista no vacía/i);
  });

  await t.test('Rechaza id de producto con formato inválido', async () => {
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: [{ id: 'invalido-123', cantidad: 1 }] })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /Identificador de producto inválido/i);
  });

  await t.test('Rechaza cantidad menor o igual a cero', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: [{ id: validId, cantidad: 0 }] })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /cantidad solicitada debe ser un número entero mayor a 0/i);
  });
});

test('Pedidos - Validación de existencia de producto (404)', async () => {
  const validId = new mongoose.Types.ObjectId().toString();

  const origFindById = Product.findById;
  Product.findById = async () => null;

  try {
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: [{ id: validId, cantidad: 2 }] })
    });

    assert.equal(res.status, 404);
    const data = await res.json();
    assert.match(data.message, /No se encontró el producto/i);
  } finally {
    Product.findById = origFindById;
  }
});

test('Pedidos - Validación de stock insuficiente (400)', async () => {
  const prodId = new mongoose.Types.ObjectId().toString();
  const productoMock = {
    _id: prodId,
    nombre: 'Silla Roble',
    precio: 25000,
    stock: 2
  };

  const origFindById = Product.findById;
  Product.findById = async () => productoMock;

  try {
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: [{ id: prodId, cantidad: 5 }] })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /Stock insuficiente/i);
  } finally {
    Product.findById = origFindById;
  }
});

test('Pedidos - Creación exitosa: valida precios en backend, descuenta stock y persiste (201)', async () => {
  const prodId = new mongoose.Types.ObjectId().toString();
  const productoMock = {
    _id: prodId,
    nombre: 'Mesa Ratona Jota',
    precio: 45000,
    stock: 10
  };

  const origFindById = Product.findById;
  const origFindOneAndUpdate = Product.findOneAndUpdate;
  const origCreate = Order.create;

  let stockDescontado = false;
  let ordenPersistida = null;

  Product.findById = async () => productoMock;
  Product.findOneAndUpdate = async (filter, update) => {
    if (filter._id === prodId && update.$inc && update.$inc.stock === -2) {
      stockDescontado = true;
      return { ...productoMock, stock: 8 };
    }
    return null;
  };

  Order.create = async (doc) => {
    ordenPersistida = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...doc,
      createdAt: new Date().toISOString()
    };
    return ordenPersistida;
  };

  try {
    const res = await fetch(`${baseUrl}/pedidos`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenValido}`,
        'Content-Type': 'application/json'
      },
      // Intento de manipulación de precio en el cliente: envía precio 10
      body: JSON.stringify({
        items: [{ id: prodId, cantidad: 2, precio: 10 }]
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.status, 'success');
    assert.equal(stockDescontado, true);

    // Valida que el precio se tomó de la DB (45000 * 2 = 90000) ignorando el precio del cliente
    assert.equal(data.data.total, 90000);
    assert.equal(data.data.items[0].precio, 45000);
    assert.equal(data.data.items[0].subtotal, 90000);
    assert.equal(data.data.usuario, usuarioTest.id);
  } finally {
    Product.findById = origFindById;
    Product.findOneAndUpdate = origFindOneAndUpdate;
    Order.create = origCreate;
  }
});

test('Pedidos - Listado de pedidos del usuario autenticado (200)', async () => {
  const origFind = Order.find;
  const pedidosMock = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      usuario: usuarioTest.id,
      total: 90000,
      estado: 'confirmado',
      items: []
    }
  ];

  Order.find = (filter) => {
    assert.equal(filter.usuario, usuarioTest.id);
    return {
      sort: () => Promise.resolve(pedidosMock)
    };
  };

  try {
    const res = await fetch(`${baseUrl}/pedidos`, {
      headers: {
        Authorization: `Bearer ${tokenValido}`
      }
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'success');
    assert.equal(data.data.length, 1);
    assert.equal(data.data[0].total, 90000);
  } finally {
    Order.find = origFind;
  }
});
