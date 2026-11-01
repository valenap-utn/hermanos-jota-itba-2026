const successResponse = require('../utils/successResponse');

// Responde si el servidor está funcionando correctamente
const healthcheck = (req, res) => {
  successResponse(res, { statusCode: 200 });
}

module.exports = {healthcheck};
