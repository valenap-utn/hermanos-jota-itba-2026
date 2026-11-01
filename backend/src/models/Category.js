const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

// índice con case-insensitive e indiferente a tildes
categorySchema.index(
    { nombre: 1 },
    {
        unique: true,
        collation: { locale: 'es', strength: 1 },
    }
);

module.exports = mongoose.model('Category', categorySchema);
