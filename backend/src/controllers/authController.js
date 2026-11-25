const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { User, ROL } = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const successResponse = require('../utils/successResponse');
const jwt = require('jsonwebtoken');
const { obtenerConfiguracionJWT } = require('../config/jwt');

const SALT_ROUNDS = 12;

// POST /api/auth/register
const registrarUsuario = asyncHandler(async (req, res) => {
    const { nombre, email, password } = req.body ?? {};

    if (typeof nombre !== 'string' || !nombre.trim()) {
        throw createError.BadRequest('El nombre es obligatorio.');
    }

    if (typeof email !== 'string' || !email.trim()) {
        throw createError.BadRequest('El email es obligatorio.');
    }

    if (typeof password !== 'string' || !password) {
        throw createError.BadRequest('La contraseña es obligatoria.');
    }

    if (password.length < 8) {
        throw createError.BadRequest(
            'La contraseña debe tener al menos 8 caracteres.'
        );
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw createError.BadRequest(
            'La contraseña no puede superar los 72 bytes.'
        );
    }

    const usuario = new User({
        nombre,
        email,
        rol: ROL.CLIENTE,
    });

    // Validamos los datos antes de realizar el hashing.
    await usuario.validate(['nombre', 'email', 'rol']);

    usuario.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await usuario.save();

    successResponse(res, {
        data: {
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt,
        },
        statusCode: 201,
    });
});

// POST /api/auth/login
const iniciarSesion = asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || !email.trim()) {
        throw createError.BadRequest('El email es obligatorio.');
    }

    if (typeof password !== 'string' || !password) {
        throw createError.BadRequest('La contraseña es obligatoria.');
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
        throw createError.BadRequest(
            'La contraseña no puede superar los 72 bytes.'
        );
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await User
        .findOne({ email: emailNormalizado })
        .select('+passwordHash');

    if (!usuario) {
        throw createError.Unauthorized('Credenciales inválidas.');
    }

    const passwordValida = await bcrypt.compare(
        password,
        usuario.passwordHash
    );

    if (!passwordValida) {
        throw createError.Unauthorized('Credenciales inválidas.');
    }

    const { secret, expiresIn, algorithm } =
        obtenerConfiguracionJWT();

    const token = jwt.sign(
        {
            rol: usuario.rol,
        },
        secret,
        {
            subject: usuario._id.toString(),
            expiresIn,
            algorithm,
        }
    );

    successResponse(res, {
        data: {
            token,
            usuario: {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        },
    });
});

// GET /api/auth/me
const obtenerUsuarioActual = asyncHandler(async (req, res) => {
    const usuario = req.usuario;

    successResponse(res, {
        data: {
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
        },
    });
});

module.exports = {
    registrarUsuario,
    iniciarSesion,
    obtenerUsuarioActual,
};
