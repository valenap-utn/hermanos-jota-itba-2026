const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('node:crypto');
const { User, ROL } = require('../../src/models/User');
const mongoose = require('mongoose');

const {
    conectarDB,
    limpiarDB,
    desconectarDB,
} = require('../helpers/testDb');

const { datosUsuario } = require('../helpers/userFactory');

const REGISTER_URL = '/api/auth/register';
const LOGIN_URL = '/api/auth/login';

const JWT_SECRET_TEST = randomBytes(32).toString('hex');
const JWT_EXPIRES_IN_TEST = '1h';

const ME_URL = '/api/auth/me';

const envOriginal = process.env;

beforeAll(async () => {
    process.env = {
        ...envOriginal,
        JWT_SECRET: JWT_SECRET_TEST,
        JWT_EXPIRES_IN: JWT_EXPIRES_IN_TEST,
    };

    await conectarDB();
}, 120000);

beforeEach(limpiarDB);

afterAll(async () => {
    try {
        await desconectarDB();
    } finally {
        process.env = envOriginal;
    }
});

function registrar(datos = {}) {
    return request(app)
        .post(REGISTER_URL)
        .send(datosUsuario(datos));
}

function iniciarSesion(datos = {}) {
    const { email, password } = datosUsuario();

    return request(app)
        .post(LOGIN_URL)
        .send({
            email,
            password,
            ...datos,
        });
}

function obtenerUsuarioActual(token) {
    const solicitud = request(app).get(ME_URL);

    if (token !== undefined) {
        solicitud.set('Authorization', `Bearer ${token}`);
    }

    return solicitud;
}

function generarToken(
    usuarioId,
    opciones = {},
    secret = JWT_SECRET_TEST
) {
    return jwt.sign(
        { rol: ROL.CLIENTE },
        secret,
        {
            subject: usuarioId.toString(),
            algorithm: 'HS256',
            expiresIn: JWT_EXPIRES_IN_TEST,
            ...opciones,
        }
    );
}

describe('POST /api/auth/register', () => {

    describe('Registro exitoso', () => {

        it('registra un usuario con datos válidos', async () => {
            const response = await registrar();

            expect(response.status).toBe(201);

            expect(response.body).toMatchObject({
                status: 'success',
                data: {
                    nombre: 'Usuario Prueba',
                    email: 'usuario@example.com',
                    rol: ROL.CLIENTE,
                },
            });

            expect(response.body.data).toHaveProperty('_id');

            const usuario = await User.findById(
                response.body.data._id
            );

            expect(usuario).not.toBeNull();
            expect(usuario.email).toBe('usuario@example.com');
        });

        it('normaliza el email antes de almacenarlo', async () => {
            const response = await registrar({
                email: '  USUARIO@EXAMPLE.COM  ',
            });

            expect(response.status).toBe(201);

            expect(response.body.data.email)
                .toBe('usuario@example.com');
        });
    });

    describe('Validación de datos', () => {

        it.each([
            ['nombre ausente', { nombre: undefined }],
            ['nombre corto', { nombre: 'Jo' }],
            ['email ausente', { email: undefined }],
            ['email inválido', { email: 'correo-invalido' }],
            ['contraseña ausente', { password: undefined }],
            ['contraseña corta', { password: '123' }],
            ['contraseña superior a 72 bytes', {
                password: 'a'.repeat(73),
            }],
        ])('rechaza un registro con %s', async (_, datos) => {
            const response = await registrar(datos);

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('fail');
            expect(await User.countDocuments()).toBe(0);
        });

        it('rechaza una solicitud sin datos', async () => {
            const response = await request(app)
                .post(REGISTER_URL)
                .send({});

            expect(response.status).toBe(400);
            expect(await User.countDocuments()).toBe(0);
        });
    });

    describe('Unicidad del email', () => {

        it.each([
            'usuario@example.com',
            '  USUARIO@EXAMPLE.COM  ',
        ])('rechaza el email duplicado %p', async (email) => {
            const primeraRespuesta = await registrar();

            expect(primeraRespuesta.status).toBe(201);

            const response = await registrar({ email });

            expect(response.status).toBe(409);
            expect(response.body.status).toBe('fail');
            expect(await User.countDocuments()).toBe(1);
        });
    });

    describe('Seguridad', () => {

        it('impide el registro público como ADMIN', async () => {
            const response = await registrar({
                rol: ROL.ADMIN,
            });

            expect(response.status).toBe(201);
            expect(response.body.data.rol).toBe(ROL.CLIENTE);

            const usuario = await User.findById(
                response.body.data._id
            );

            expect(usuario.rol).toBe(ROL.CLIENTE);
        });

        it('almacena la contraseña mediante bcrypt', async () => {
            const datos = datosUsuario();
            const response = await registrar(datos);

            expect(response.status).toBe(201);

            const usuario = await User
                .findById(response.body.data._id)
                .select('+passwordHash');

            expect(usuario.passwordHash)
                .not.toBe(datos.password);

            expect(
                await bcrypt.compare(
                    datos.password,
                    usuario.passwordHash
                )
            ).toBe(true);

            expect(
                await bcrypt.compare(
                    'ContraseñaIncorrecta',
                    usuario.passwordHash
                )
            ).toBe(false);

            expect(bcrypt.getRounds(usuario.passwordHash))
                .toBe(12);

            expect(usuario.toObject())
                .not.toHaveProperty('password');
        });

        it('no expone información sensible en la respuesta', async () => {
            const response = await registrar();

            expect(response.status).toBe(201);

            expect(response.body.data)
                .not.toHaveProperty('password');

            expect(response.body.data)
                .not.toHaveProperty('passwordHash');

            const usuario = await User.findById(
                response.body.data._id
            );

            expect(usuario.passwordHash).toBeUndefined();
        });
    });

    describe('POST /api/auth/login', () => {

        beforeEach(async () => {
            const response = await registrar();

            expect(response.status).toBe(201);
        });

        describe('Login exitoso', () => {

            it('inicia sesión con credenciales válidas', async () => {
                const response = await iniciarSesion();

                expect(response.status).toBe(200);

                expect(response.body).toMatchObject({
                    status: 'success',
                    data: {
                        token: expect.any(String),
                        usuario: {
                            _id: expect.any(String),
                            nombre: 'Usuario Prueba',
                            email: 'usuario@example.com',
                            rol: ROL.CLIENTE,
                        },
                    },
                });
            });

            it('normaliza el email antes de autenticar', async () => {
                const response = await iniciarSesion({
                    email: '  USUARIO@EXAMPLE.COM  ',
                });

                expect(response.status).toBe(200);
            });
        });

        describe('Credenciales inválidas', () => {

            it.each([
                ['email inexistente', {
                    email: 'inexistente@example.com',
                }],
                ['contraseña incorrecta', {
                    password: 'Incorrecta123',
                }],
            ])('rechaza el login con %s', async (_, datos) => {
                const response = await iniciarSesion(datos);

                expect(response.status).toBe(401);

                expect(response.body).toMatchObject({
                    status: 'fail',
                    message: 'Credenciales inválidas.',
                });

                expect(response.body).not.toHaveProperty('data');
            });
        });

        describe('Validación de datos', () => {

            it.each([
                ['email ausente', { email: undefined }],
                ['email vacío', { email: '' }],
                ['email no textual', { email: 123 }],
                ['contraseña ausente', { password: undefined }],
                ['contraseña vacía', { password: '' }],
                ['contraseña no textual', { password: 123 }],
                ['contraseña superior a 72 bytes', {
                    password: 'a'.repeat(73),
                }],
            ])('rechaza una solicitud con %s', async (_, datos) => {
                const response = await iniciarSesion(datos);

                expect(response.status).toBe(400);
                expect(response.body.status).toBe('fail');
            });

            it('rechaza una solicitud sin datos', async () => {
                const response = await request(app)
                    .post(LOGIN_URL)
                    .send({});

                expect(response.status).toBe(400);
            });
        });

        describe('Seguridad del JWT', () => {

            it('genera un JWT con firma válida', async () => {
                const response = await iniciarSesion();

                expect(response.status).toBe(200);

                const { token, usuario } = response.body.data;

                const payload = jwt.verify(token, JWT_SECRET_TEST, {
                    algorithms: ['HS256'],
                });

                expect(payload).toMatchObject({
                    sub: usuario._id,
                    rol: ROL.CLIENTE,
                    iat: expect.any(Number),
                    exp: expect.any(Number),
                });
            });

            it('genera un JWT con una duración de una hora', async () => {
                const response = await iniciarSesion();

                expect(response.status).toBe(200);

                const payload = jwt.verify(
                    response.body.data.token,
                    JWT_SECRET_TEST,
                    { algorithms: ['HS256'] }
                );

                expect(payload.exp - payload.iat).toBe(3600);
            });

            it('no incluye información sensible en el JWT', async () => {
                const response = await iniciarSesion();

                expect(response.status).toBe(200);

                const payload = jwt.verify(
                    response.body.data.token,
                    JWT_SECRET_TEST,
                    { algorithms: ['HS256'] }
                );

                expect(Object.keys(payload).sort()).toEqual(
                    ['sub', 'rol', 'iat', 'exp'].sort()
                );
            });

            it('no expone la contraseña ni su hash en la respuesta', async () => {
                const response = await iniciarSesion();

                expect(response.status).toBe(200);

                const { usuario } = response.body.data;

                expect(usuario).not.toHaveProperty('password');
                expect(usuario).not.toHaveProperty('passwordHash');
            });
        });
    });


    describe('GET /api/auth/me', () => {

        let usuario;
        let token;

        beforeEach(async () => {
            const registro = await registrar();

            expect(registro.status).toBe(201);

            usuario = registro.body.data;

            const login = await iniciarSesion();

            expect(login.status).toBe(200);

            token = login.body.data.token;
        });

        describe('Autenticación exitosa', () => {

            it('devuelve el usuario autenticado', async () => {
                const response = await obtenerUsuarioActual(token);

                expect(response.status).toBe(200);

                expect(response.body).toMatchObject({
                    status: 'success',
                    data: {
                        _id: usuario._id,
                        nombre: usuario.nombre,
                        email: usuario.email,
                        rol: ROL.CLIENTE,
                    },
                });
            });

            it('no expone información sensible', async () => {
                const response = await obtenerUsuarioActual(token);

                expect(response.status).toBe(200);

                expect(response.body.data)
                    .not.toHaveProperty('password');

                expect(response.body.data)
                    .not.toHaveProperty('passwordHash');
            });
        });

        describe('Validación de autorización', () => {

            it('rechaza una solicitud sin token', async () => {
                const response = await obtenerUsuarioActual();

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('fail');
            });

            it.each([
                'Basic credenciales',
                'Bearer',
                'Bearer token adicional',
            ])('rechaza el formato de autorización %p', async (header) => {
                const response = await request(app)
                    .get(ME_URL)
                    .set('Authorization', header);

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('fail');
            });
        });

        describe('Validación del JWT', () => {

            it.each([
                [
                    'inválido',
                    () => 'token-invalido',
                ],
                [
                    'manipulado',
                    () => {
                        const partes = token.split('.');

                        const primerCaracter =
                            partes[2][0] === 'a' ? 'b' : 'a';

                        partes[2] =
                            primerCaracter + partes[2].slice(1);

                        return partes.join('.');
                    },
                ],
                [
                    'expirado',
                    () => generarToken(usuario._id, {
                        expiresIn: -60,
                    }),
                ],
                [
                    'firmado con otra clave',
                    () => generarToken(
                        usuario._id,
                        {},
                        randomBytes(32).toString('hex')
                    ),
                ],
                [
                    'sin expiración',
                    () => jwt.sign(
                        { rol: ROL.CLIENTE },
                        JWT_SECRET_TEST,
                        {
                            subject: usuario._id,
                            algorithm: 'HS256',
                        }
                    ),
                ],
                [
                    'con identificador inválido',
                    () => generarToken('id-invalido'),
                ],
                [
                    'de un usuario inexistente',
                    () => generarToken(
                        new mongoose.Types.ObjectId()
                    ),
                ],
            ])('rechaza un token %s', async (_, crearToken) => {
                const response = await obtenerUsuarioActual(
                    crearToken()
                );

                expect(response.status).toBe(401);
                expect(response.body.status).toBe('fail');
                expect(response.body).not.toHaveProperty('data');
            });
        });

        describe('Estado actual del usuario', () => {

            it('rechaza el token de un usuario eliminado', async () => {
                await User.findByIdAndDelete(usuario._id);

                const response = await obtenerUsuarioActual(token);

                expect(response.status).toBe(401);
            });

            it('devuelve el rol actual almacenado en MongoDB', async () => {
                await User.findByIdAndUpdate(usuario._id, {
                    rol: ROL.ADMIN,
                });

                const response = await obtenerUsuarioActual(token);

                expect(response.status).toBe(200);
                expect(response.body.data.rol).toBe(ROL.ADMIN);
            });
        });
    });
});
