const { obtenerConfiguracionJWT } = require('../../src/config/jwt');

const JWT_SECRET_VALIDO = 'a'.repeat(64);

describe('Configuración JWT', () => {

    const envOriginal = process.env;

    beforeEach(() => {
        process.env = {
            ...envOriginal,
            JWT_SECRET: JWT_SECRET_VALIDO,
            JWT_EXPIRES_IN: '1h',
        };
    });

    afterEach(() => {
        process.env = envOriginal;
    });

    describe('Configuración válida', () => {

        it('devuelve la configuración esperada', () => {
            expect(obtenerConfiguracionJWT()).toEqual({
                secret: JWT_SECRET_VALIDO,
                expiresIn: '1h',
                algorithm: 'HS256',
            });
        });

        it('utiliza 1h como duración por defecto', () => {
            delete process.env.JWT_EXPIRES_IN;

            expect(obtenerConfiguracionJWT().expiresIn).toBe('1h');
        });

        it.each([
            '30s',
            '15m',
            '2h',
            '7d',
        ])('acepta una duración de %s', (duracion) => {
            process.env.JWT_EXPIRES_IN = duracion;

            expect(obtenerConfiguracionJWT().expiresIn).toBe(duracion);
        });
    });

    describe('Validación del secreto', () => {

        it.each([
            ['ausente', undefined],
            ['vacío', ''],
            ['demasiado corto', 'a'.repeat(63)],
            ['demasiado largo', 'a'.repeat(65)],
            ['no hexadecimal', 'z'.repeat(64)],
        ])('rechaza un secreto %s', (_, secreto) => {
            if (secreto === undefined) {
                delete process.env.JWT_SECRET;
            } else {
                process.env.JWT_SECRET = secreto;
            }

            expect(obtenerConfiguracionJWT).toThrow(/JWT_SECRET/);
        });
    });

    describe('Validación de duración', () => {

        it.each([
            '0h',
            '-1h',
            '1.5h',
            '60',
            'abc',
            '2x',
        ])('rechaza una duración inválida: %s', (duracion) => {
            process.env.JWT_EXPIRES_IN = duracion;

            expect(obtenerConfiguracionJWT).toThrow(/JWT_EXPIRES_IN/);
        });
    });
});