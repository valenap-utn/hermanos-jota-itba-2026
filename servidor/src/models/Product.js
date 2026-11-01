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

// Garantiza que nunca se supere el límite de catálogo
// Es para proteger la base de datos y cloudinary mientras no haya autenticación.
productSchema.pre('save', async function () {
  if (this.isNew) {
    const MAX_PRODUCTOS = Number(process.env.MAX_PRODUCTOS) || 25;
    const total = await this.constructor.countDocuments();
    if (total >= MAX_PRODUCTOS) {
      const error = new Error(
        `Se ha alcanzado el límite máximo de ${MAX_PRODUCTOS} productos permitidos en el catálogo.`
      );
      error.status = 400;
      throw error;
    }
  }
});

module.exports = mongoose.model('Product', productSchema);