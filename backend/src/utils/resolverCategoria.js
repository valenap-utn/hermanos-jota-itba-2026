const Category = require('../models/Category');

/**
 * Resuelve o crea una categoría de forma case-insensitive.
 * Si ya existe una categoría con diferente mayúscula/minúscula (ej: "living" vs "Living"),
 * retorna la existente para evitar duplicaciones.
 * @param {string} nombre - Nombre de la categoría
 * @returns {Promise<string>} Nombre canónico de la categoría
 */
async function resolverCategoria(nombre) {
  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return '';
  }

  const nombreNormalizado = nombre.trim();
  const escapado = nombreNormalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let cat = await Category.findOne({
    nombre: { $regex: new RegExp(`^${escapado}$`, 'i') }
  });

  if (!cat) {
    try {
      cat = await Category.create({ nombre: nombreNormalizado });
    } catch (error) {
      if (error.code === 11000) {
        cat = await Category.findOne({
          nombre: { $regex: new RegExp(`^${escapado}$`, 'i') }
        });
      } else {
        throw error;
      }
    }
  }

  return cat ? cat.nombre : nombreNormalizado;
}

module.exports = resolverCategoria;
