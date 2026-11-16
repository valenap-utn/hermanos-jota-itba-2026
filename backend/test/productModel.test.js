const test = require('node:test');
const assert = require('node:assert/strict');
const Product = require('../src/models/Product');

test('Modelo Producto - Validación con campos opcionales ausentes', async () => {
  const prod = new Product({
    nombre: 'Mesa Minimalista',
    precio: 25000
  });

  await prod.validate();
  assert.equal(prod.descripcion, '', 'La descripcion debe ser string vacio por defecto');
  assert.equal(prod.stock, 0, 'El stock debe ser 0 por defecto');
  assert.equal(prod.imagenUrl, '', 'La imagenUrl debe ser string vacio por defecto');
});

test('Modelo Producto - Compatibilidad con productos completos preexistentes', async () => {
  const prod = new Product({
    nombre: 'Sillón Escandinavo',
    descripcion: 'Tapizado en lino natural con estructura de roble',
    precio: 120000,
    stock: 12,
    imagenUrl: '/assets/img/sillon-copacabana.webp',
    categoria: 'sillones'
  });

  await prod.validate();
  assert.equal(prod.stock, 12);
  assert.equal(prod.descripcion, 'Tapizado en lino natural con estructura de roble');
});

test('Modelo Producto - Rechaza producto sin nombre o con precio negativo', async () => {
  const prodSinNombre = new Product({ precio: 1000 });
  await assert.rejects(async () => prodSinNombre.validate(), /nombre/);

  const prodPrecioNegativo = new Product({ nombre: 'Mesa', precio: -5 });
  await assert.rejects(async () => prodPrecioNegativo.validate(), /precio/);
});

test('Modelo Producto - Rechaza stock negativo', async () => {
  const prodStockNegativo = new Product({
    nombre: 'Mesa',
    precio: 500,
    stock: -3
  });
  await assert.rejects(async () => prodStockNegativo.validate(), /stock/);
});
