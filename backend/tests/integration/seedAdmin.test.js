const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs/promises');
const { randomBytes } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const app = require('../../src/app');
const { User, ROL } = require('../../src/models/User');

const {
    conectarDB,
    limpiarDB,
    desconectarDB,
    obtenerUriDB,
} = require('../helpers/testDb');

const ejecutarArchivo = promisify(execFile);

const SEED_PATH = path.resolve(
    __dirname,
    '../../src/scripts/seedAdmin.js'
);

const ADMIN_TEST = {
    nombre: 'Administrador Prueba',
    email: 'admin@example.com',
    password: 'AdminPrueba1234',
};

const JWT_SECRET_TEST = randomBytes(32).toString('hex');

const envOriginal = process.env;

let directorioTemporal;

beforeAll(async () => {
    process.env = {
        ...envOriginal,
        JWT_SECRET: JWT_SECRET_TEST,
        JWT_EXPIRES_IN: '1h',
    };

    directorioTemporal = await fs.mkdtemp(
        path.join(os.tmpdir(), 'hermanosjota-seed-test-')
    );

    await conectarDB();
}, 120000);

beforeEach(limpiarDB);

afterAll(async () => {
    try {
        await desconectarDB();
    } finally {
        process.env = envOriginal;

        if (directorioTemporal) {
            await fs.rm(directorioTemporal, {
                recursive: true,
                force: true,
            });
        }
    }
});

async function ejecutarSeed(variables = {}) {
    return ejecutarArchivo(
        process.execPath,
        [SEED_PATH],
        {
            cwd: directorioTemporal,
            env: {
                PATH: process.env.PATH,
                NODE_ENV: 'test',

                ADMIN_NAME: ADMIN_TEST.nombre,
                ADMIN_EMAIL: ADMIN_TEST.email,
                ADMIN_PASSWORD: ADMIN_TEST.password,

                ...variables,

                MONGODB_URI: obtenerUriDB(),
            },
            timeout: 15000,
        }
    );
}

describe('Seed del administrador', () => {

    describe('Creación del administrador', () => {

        it('crea un usuario con rol ADMIN', async () => {
            await ejecutarSeed();

            const administrador = await User.findOne({
                email: ADMIN_TEST.email,
            });

            expect(administrador).not.toBeNull();

            expect(administrador).toMatchObject({
                nombre: ADMIN_TEST.nombre,
                email: ADMIN_TEST.email,
                rol: ROL.ADMIN,
            });

            expect(await User.countDocuments()).toBe(1);
        });

        it('almacena la contraseña mediante bcrypt', async () => {
            await ejecutarSeed();

            const administrador = await User.findOne({
                email: ADMIN_TEST.email,
            }).select('+passwordHash');

            expect(administrador.passwordHash)
                .not.toBe(ADMIN_TEST.password);

            expect(
                await bcrypt.compare(
                    ADMIN_TEST.password,
                    administrador.passwordHash
                )
            ).toBe(true);

            expect(
                bcrypt.getRounds(administrador.passwordHash)
            ).toBe(12);

            expect(administrador.toObject())
                .not.toHaveProperty('password');
        });
    });

    describe('Idempotencia', () => {

        it('no duplica el administrador al ejecutar el seed dos veces', async () => {
            await ejecutarSeed();
            await ejecutarSeed();

            expect(await User.countDocuments()).toBe(1);
        });

        it('no modifica la contraseña de un administrador existente', async () => {
            await ejecutarSeed();

            const administradorOriginal = await User.findOne({
                email: ADMIN_TEST.email,
            }).select('+passwordHash');

            await ejecutarSeed({
                ADMIN_PASSWORD: 'OtraPassword1234',
            });

            const administradorActual = await User.findOne({
                email: ADMIN_TEST.email,
            }).select('+passwordHash');

            expect(administradorActual.passwordHash)
                .toBe(administradorOriginal.passwordHash);

            expect(administradorActual._id.toString())
                .toBe(administradorOriginal._id.toString());
        });
    });

    describe('Seguridad', () => {

        it('no convierte un cliente existente en administrador', async () => {
            const cliente = await User.create({
                nombre: 'Cliente Prueba',
                email: ADMIN_TEST.email,
                passwordHash: await bcrypt.hash('Cliente1234', 4),
                rol: ROL.CLIENTE,
            });

            await expect(ejecutarSeed()).rejects.toMatchObject({
                code: 1,
                stderr: expect.stringContaining(
                    'El email ya pertenece a un usuario que no es administrador.'
                ),
            });

            const usuarioActual = await User.findById(cliente._id);

            expect(usuarioActual.rol).toBe(ROL.CLIENTE);
            expect(await User.countDocuments()).toBe(1);
        });
    });

    describe('Validación de configuración', () => {

        it.each([
            'ADMIN_NAME',
            'ADMIN_EMAIL',
            'ADMIN_PASSWORD',
        ])('rechaza la ejecución sin %s', async (variable) => {
            await expect(
                ejecutarSeed({ [variable]: '' })
            ).rejects.toMatchObject({
                code: 1,
                stderr: expect.stringContaining(
                    'Debés configurar ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD.'
                ),
            });

            expect(await User.countDocuments()).toBe(0);
        });

        it.each([
            [
                'demasiado corta',
                '123',
                'La contraseña debe tener al menos 8 caracteres.',
            ],
            [
                'superior a 72 bytes',
                'a'.repeat(73),
                'La contraseña no puede superar los 72 bytes.',
            ],
        ])('rechaza una contraseña %s', async (_, password, mensaje) => {
            await expect(
                ejecutarSeed({
                    ADMIN_PASSWORD: password,
                })
            ).rejects.toMatchObject({
                code: 1,
                stderr: expect.stringContaining(mensaje),
            });

            expect(await User.countDocuments()).toBe(0);
        });
    });

    describe('Integración con autenticación', () => {

        it('permite iniciar sesión como administrador', async () => {
            await ejecutarSeed();

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: ADMIN_TEST.email,
                    password: ADMIN_TEST.password,
                });

            expect(response.status).toBe(200);

            expect(response.body.data.usuario.rol)
                .toBe(ROL.ADMIN);

            const payload = jwt.verify(
                response.body.data.token,
                JWT_SECRET_TEST,
                { algorithms: ['HS256'] }
            );

            expect(payload.rol).toBe(ROL.ADMIN);

            expect(payload.sub)
                .toBe(response.body.data.usuario._id);
        }, 20000);
    });
});