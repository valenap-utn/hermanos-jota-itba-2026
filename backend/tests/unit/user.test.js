const bcrypt = require('bcrypt');
const { User, ROL } = require('../../src/models/User');

const PASSWORD_HASH = bcrypt.hashSync('Prueba1234', 4);

// Factory: genera un usuario válido por defecto.
function crearUsuario(datos = {}) {
    return new User({
        nombre: 'Usuario Prueba',
        email: 'usuario@example.com',
        passwordHash: PASSWORD_HASH,
        ...datos,
    });
}

describe('Modelo User', () => {

    describe('Validaciones', () => {

        it('acepta un usuario válido', async () => {
            const usuario = crearUsuario();

            await expect(usuario.validate()).resolves.toBeUndefined();
        });

        it.each([
            ['nombre', undefined, 'required'],
            ['nombre', '', 'required'],
            ['nombre', 'Jo', 'minlength'],
            ['nombre', 'a'.repeat(101), 'maxlength'],

            ['email', undefined, 'required'],
            ['email', '', 'required'],
            ['email', 'correo-invalido', 'regexp'],
            ['email', `${'a'.repeat(255)}@example.com`, 'maxlength'],

            ['passwordHash', undefined, 'required'],
            ['passwordHash', 'Prueba1234', 'regexp'],

            ['rol', 'SUPERADMIN', 'enum'],
        ])('rechaza %s con valor %p (%s)', async (campo, valor, tipoError) => {
            const usuario = crearUsuario({ [campo]: valor });

            await expect(usuario.validate()).rejects.toMatchObject({
                name: 'ValidationError',
                errors: {
                    [campo]: {
                        kind: tipoError,
                    },
                },
            });
        });
    });

    describe('Normalización de datos', () => {

        it.each([
            ['nombre', '  Usuario Prueba  ', 'Usuario Prueba'],
            ['email', '  USUARIO@EXAMPLE.COM  ', 'usuario@example.com'],
        ])('normaliza correctamente el campo %s', (campo, entrada, esperado) => {
            const usuario = crearUsuario({ [campo]: entrada });

            expect(usuario[campo]).toBe(esperado);
        });
    });

    describe('Roles', () => {

        it('asigna CLIENTE como rol por defecto', () => {
            expect(crearUsuario().rol).toBe(ROL.CLIENTE);
        });

        it.each(Object.values(ROL))('acepta el rol %s', async (rol) => {
            const usuario = crearUsuario({ rol });

            await expect(usuario.validate()).resolves.toBeUndefined();
        });
    });

    describe('Serialización y seguridad', () => {

        it.each([
            'passwordHash',
            '__v',
        ])('excluye %s de la representación JSON', (campo) => {
            const usuario = crearUsuario({ __v: 0 });

            expect(usuario.toJSON()).not.toHaveProperty(campo);
        });

        it('conserva los datos públicos del usuario', () => {
            const usuario = crearUsuario();

            expect(usuario.toJSON()).toMatchObject({
                _id: usuario._id,
                nombre: 'Usuario Prueba',
                email: 'usuario@example.com',
                rol: ROL.CLIENTE,
            });
        });
    });
});