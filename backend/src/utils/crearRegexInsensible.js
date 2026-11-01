/**
 * Construye una expresión regular insensible a mayúsculas y acentos/tildes en español.
 * Permite que búsquedas como "sofa" o "sillon" encuentren "Sofá" y "Sillón" en MongoDB.
 * @param {string} termino - Cadena de texto a buscar
 * @returns {RegExp|null} Expresión regular compilada o null si el término es vacío
 */
function crearRegexInsensible(termino) {
  if (!termino || typeof termino !== 'string' || !termino.trim()) return null;

  const mapa = {
    a: '[aáàäâã]',
    e: '[eéèëê]',
    i: '[iíìïî]',
    o: '[oóòöôõ]',
    u: '[uúùüû]',
    n: '[nñ]'
  };

  const escapado = termino.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalizado = escapado
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const patron = normalizado.replace(/[aeioun]/g, (letra) => mapa[letra] || letra);
  return new RegExp(patron, 'i');
}

module.exports = crearRegexInsensible;
