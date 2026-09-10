// Responde si el servidor está funcionando correctamente
const healthcheck = (req, res) => {
    res.status(200).json({
        status: 'OK',
        success: true,
    });
}

module.exports = {healthcheck};
