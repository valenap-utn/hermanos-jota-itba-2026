require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const { User, ROL } = require('../models/User');

const SALT_ROUNDS = 12;

async function seedAdmin() {
    try {
        const nombre = process.env.ADMIN_NAME?.trim();
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!nombre || !email || !password) {
            throw new Error(
                'Debés configurar ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD.'
            );
        }

        if (password.length < 8) {
            throw new Error(
                'La contraseña debe tener al menos 8 caracteres.'
            );
        }

        if (Buffer.byteLength(password, 'utf8') > 72) {
            throw new Error(
                'La contraseña no puede superar los 72 bytes.'
            );
        }

        await connectDB();

        // Garantizar que el índice único esté disponible.
        await User.init();

        const usuarioExistente = await User.findOne({ email });

        if (usuarioExistente) {
            if (usuarioExistente.rol !== ROL.ADMIN) {
                throw new Error(
                    'El email ya pertenece a un usuario que no es administrador.'
                );
            }

            console.log('El usuario administrador ya existe.');
            return;
        }

        const administrador = new User({
            nombre,
            email,
            rol: ROL.ADMIN,
        });

        await administrador.validate([
            'nombre',
            'email',
            'rol',
        ]);

        administrador.passwordHash = await bcrypt.hash(
            password,
            SALT_ROUNDS
        );

        await administrador.save();

        console.log('Usuario administrador creado correctamente.');

    } catch (error) {
        if (error.code === 11000) {
            console.error(
                'No se pudo crear el administrador: el email ya está registrado.'
            );
        } else {
            console.error(
                'Error al crear el administrador:',
                error.message
            );
        }

        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin();
