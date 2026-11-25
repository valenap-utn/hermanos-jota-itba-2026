const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const mongoose = require('mongoose');
const { User } = require('../models/User');
const { obtenerConfiguracionJWT } = require('../config/jwt');
const asyncHandler = require('../utils/asyncHandler');

const autenticarUsuario = asyncHandler(async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        throw createError.Unauthorized(
            'Token de autenticación requerido.'
        );
    }

    const coincidencia = authorization.match(/^Bearer\s+(\S+)$/i);

    if (!coincidencia) {
        throw createError.Unauthorized(
            'Formato de autenticación inválido.'
        );
    }

    const token = coincidencia[1];

    const { secret, algorithm } = obtenerConfiguracionJWT();

    let payload;

    try {
        payload = jwt.verify(token, secret, {
            algorithms: [algorithm],
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw createError.Unauthorized('Token expirado.');
        }

        throw createError.Unauthorized('Token inválido.');
    }

    if (
        typeof payload !== 'object' ||
        typeof payload.sub !== 'string' ||
        !mongoose.isObjectIdOrHexString(payload.sub) ||
        !Number.isInteger(payload.exp)
    ) {
        throw createError.Unauthorized('Token inválido.');
    }

    const usuario = await User.findById(payload.sub);

    if (!usuario) {
        throw createError.Unauthorized('Usuario no encontrado.');
    }

    req.usuario = usuario;

    next();
});

module.exports = {
    autenticarUsuario,
};
