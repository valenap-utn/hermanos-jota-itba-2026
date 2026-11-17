const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio']
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true
    },
    precio: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad mínima es 1']
    },
    subtotal: {
      type: Number,
      required: [true, 'El subtotal del ítem es obligatorio'],
      min: [0, 'El subtotal no puede ser negativo']
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio']
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'El pedido debe contener al menos un producto'
      }
    },
    total: {
      type: Number,
      required: [true, 'El total es obligatorio'],
      min: [0, 'El total no puede ser negativo']
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
      default: 'confirmado'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Order', orderSchema);
