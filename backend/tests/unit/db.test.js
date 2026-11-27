const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');

describe('Configuración de conexión a MongoDB (connectDB)', () => {
    const envOriginal = process.env;

    beforeEach(() => {
        process.env = { ...envOriginal };
    });

    afterEach(() => {
        process.env = envOriginal;
    });

    it('falla si falta MONGODB_URI en las variables de entorno', async () => {
        delete process.env.MONGODB_URI;

        await expect(connectDB()).rejects.toThrow(/Falta MONGODB_URI/i);
    });

    it('conecta con mongoose usando serverSelectionTimeoutMS de 5000ms', async () => {
        process.env.MONGODB_URI = 'mongodb+srv://usuario:clave@cluster0.mongodb.net/hermanos-jota';
        const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);

        await connectDB();

        expect(connectSpy).toHaveBeenCalledWith(
            process.env.MONGODB_URI,
            { serverSelectionTimeoutMS: 5000 }
        );
    });

    it('sanitiza el host al fallar sin exponer usuario ni contraseña aunque contenga @', async () => {
        process.env.MONGODB_URI = 'mongodb+srv://usuario:mi@secreto@cluster0.mongodb.net/hermanos-jota?retryWrites=true';
        const errorConexion = new Error('Authentication failed');
        jest.spyOn(mongoose, 'connect').mockRejectedValue(errorConexion);

        await expect(connectDB()).rejects.toThrow('Authentication failed');

        expect(console.error).toHaveBeenCalledWith(
            'Error al conectar con MongoDB (cluster0.mongodb.net):',
            'Authentication failed'
        );
        const mensajeLog = console.error.mock.calls[0][0];
        expect(mensajeLog).not.toContain('usuario');
        expect(mensajeLog).not.toContain('mi@secreto');
        expect(mensajeLog).not.toContain('secreto');
    });

    it('usa fallback seguro en el log cuando MONGODB_URI tiene formato inválido', async () => {
        process.env.MONGODB_URI = 'uri-invalida-sin-esquema';
        const errorConexion = new Error('Invalid connection string');
        jest.spyOn(mongoose, 'connect').mockRejectedValue(errorConexion);

        await expect(connectDB()).rejects.toThrow('Invalid connection string');

        expect(console.error).toHaveBeenCalledWith(
            'Error al conectar con MongoDB (host desconocido):',
            'Invalid connection string'
        );
    });
});
