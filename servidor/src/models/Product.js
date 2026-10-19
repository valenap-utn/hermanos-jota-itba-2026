const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    nombre:      { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    precio:      { type: Number, required: true, min: 0 },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    imagenUrl:   { type: String, required: true, trim: true },
    medidas:          { type: String, trim: true },
    materiales:       { type: String, trim: true },
    categoria:        { type: String, trim: true },
    destacado:        { type: Boolean, default: false },
    especificaciones: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);