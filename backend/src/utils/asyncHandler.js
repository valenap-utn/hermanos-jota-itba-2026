/* Envuelve un controller async para capturar automáticamente
  cualquier error y pasarlo al middleware de errores con next(err).
  Evita tener que escribir try/catch en cada controller.*/

  const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve()
    .then(() => fn(req, res, next))
    .catch(next);
};

module.exports = asyncHandler;