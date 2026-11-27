const mongoose = require('mongoose');

const ROL = Object.freeze({
    ADMIN: 'ADMIN',
    CLIENTE: 'CLIENTE',
});

const userSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio.'],
            trim: true,
            minlength: [3, 'El nombre debe tener al menos 3 caracteres.'],
            maxlength: [100, 'El nombre no puede superar los 100 caracteres.'],
        },

        email: {
            type: String,
            required: [true, 'El email es obligatorio.'],
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: [254, 'El email es demasiado largo.'],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'El formato del email no es válido.',
            ],
        },

        passwordHash: {
            type: String,
            required: [true, 'La contraseña hasheada es obligatoria.'],
            select: false,
            match: [
                /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/,
                'El formato del hash de la contraseña no es válido.',
            ],
        },

        rol: {
            type: String,
            enum: {
                values: Object.values(ROL),
                message: 'El rol del usuario no es válido.',
            },
            default: ROL.CLIENTE,
            required: true,
        },
    },
    {
        timestamps: true,

        toJSON: {
            transform: function (doc, ret) {
                delete ret.passwordHash;
                delete ret.__v;
                return ret;
            },
        },
    }
);

const User = mongoose.model('User', userSchema);

module.exports = { User, ROL };
