const test = require('node:test');
const assert = require('node:assert/strict');
const connectDB = require('../src/config/db');

test('connectDB - Falla si falta MONGODB_URI en las variables de entorno', async () => {
  const origUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  try {
    await assert.rejects(async () => {
      await connectDB();
    }, /Falta MONGODB_URI/i);
  } finally {
    if (origUri) {
      process.env.MONGODB_URI = origUri;
    }
  }
});
