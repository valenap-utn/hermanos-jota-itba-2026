const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'El formato del email no es válido']
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    rol: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('User', userSchema);
