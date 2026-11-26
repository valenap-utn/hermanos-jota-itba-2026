const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const os = require('node:os');

let mongoServer;

async function conectarDB() {
    if (mongoose.connection.readyState !== 0) {
        throw new Error('Ya existe una conexión a MongoDB.');
    }

    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri(), {
        dbName: 'hermanosjota_test',
        runtimeAdapters: { os },
    });

    await Promise.all(
        Object.values(mongoose.models).map(model => model.init())
    );
}

async function limpiarDB() {
    if (
        !mongoServer ||
        mongoose.connection.readyState !== 1 ||
        mongoose.connection.name !== 'hermanosjota_test'
    ) {
        throw new Error('No existe una conexión de testing válida.');
    }

    const colecciones = mongoose.connection.collections;

    await Promise.all(
        Object.values(colecciones).map(
            coleccion => coleccion.deleteMany({})
        )
    );
}

async function desconectarDB() {
    try {
        await mongoose.disconnect();
    } finally {
        if (mongoServer) {
            await mongoServer.stop();
            mongoServer = undefined;
        }
    }
}

function obtenerUriDB() {
    if (
        !mongoServer ||
        mongoose.connection.readyState !== 1 ||
        mongoose.connection.name !== 'hermanosjota_test'
    ) {
        throw new Error('No existe una conexión de testing válida.');
    }

    return mongoServer.getUri('hermanosjota_test');
}

module.exports = {
    conectarDB,
    limpiarDB,
    desconectarDB,
    obtenerUriDB,
};
