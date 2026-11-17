const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Order = require('../src/models/Order');

test('Order Model - Rechaza pedido sin usuario', async () => {
  const pedido = new Order({
    items: [{
      producto: new mongoose.Types.ObjectId(),
      nombre: 'Mesa Roble',
      precio: 15000,
      cantidad: 1,
      subtotal: 15000
    }],
    total: 15000
  });

  await assert.rejects(async () => {
    await pedido.validate();
  }, (err) => {
    return Boolean(err.errors && err.errors.usuario);
  });
});

test('Order Model - Rechaza pedido con lista de items vacía', async () => {
  const pedido = new Order({
    usuario: new mongoose.Types.ObjectId(),
    items: [],
    total: 0
  });

  await assert.rejects(async () => {
    await pedido.validate();
  }, (err) => {
    return Boolean(err.errors && err.errors.items);
  });
});

test('Order Model - Rechaza item con cantidad menor a 1 o precio negativo', async () => {
  const pedido = new Order({
    usuario: new mongoose.Types.ObjectId(),
    items: [{
      producto: new mongoose.Types.ObjectId(),
      nombre: 'Mesa',
      precio: -100,
      cantidad: 0,
      subtotal: 0
    }],
    total: 100
  });

  await assert.rejects(async () => {
    await pedido.validate();
  }, (err) => {
    return Boolean(err.errors && err.errors['items.0.precio'] && err.errors['items.0.cantidad']);
  });
});

test('Order Model - Valida correctamente un pedido con datos válidos y aplica defaults', async () => {
  const pedido = new Order({
    usuario: new mongoose.Types.ObjectId(),
    items: [{
      producto: new mongoose.Types.ObjectId(),
      nombre: 'Silla Clásica',
      precio: 12000,
      cantidad: 2,
      subtotal: 24000
    }],
    total: 24000
  });

  await pedido.validate();
  assert.equal(pedido.estado, 'confirmado');
  assert.equal(pedido.items.length, 1);
  assert.equal(pedido.total, 24000);
});
