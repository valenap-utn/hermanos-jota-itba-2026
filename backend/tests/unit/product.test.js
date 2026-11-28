const Product = require('../../src/models/Product');

function crearProducto(datos = {}) {
    return new Product({
        nombre: 'Mesa Minimalista',
        descripcion: 'Mesa de madera maciza con terminación natural',
        precio: 25000,
        stock: 0,
        imagenUrl: '/assets/img/mesa.webp',
        ...datos,
    });
}

describe('Modelo Product', () => {
    describe('Valores por defecto y compatibilidad', () => {
        it('asigna stock 0 y destacado false por defecto si se omiten en la instancia', async () => {
            const producto = new Product({
                nombre: 'Mesa Minimalista',
                descripcion: 'Mesa de madera maciza con terminación natural',
                precio: 25000,
                imagenUrl: '/assets/img/mesa.webp',
            });

            await expect(producto.validate()).resolves.toBeUndefined();
            expect(producto.stock).toBe(0);
            expect(producto.destacado).toBe(false);
        });

        it('mantiene compatibilidad con productos completos preexistentes', async () => {
            const producto = crearProducto({
                nombre: 'Sillón Escandinavo',
                descripcion: 'Tapizado en lino natural con estructura de roble',
                precio: 120000,
                stock: 12,
                imagenUrl: '/assets/img/sillon-copacabana.webp',
                categoria: 'sillones',
                destacado: true,
            });

            await expect(producto.validate()).resolves.toBeUndefined();
            expect(producto.stock).toBe(12);
            expect(producto.descripcion).toBe('Tapizado en lino natural con estructura de roble');
            expect(producto.imagenUrl).toBe('/assets/img/sillon-copacabana.webp');
        });
    });

    describe('Validaciones obligatorias y rangos', () => {
        it.each([
            ['nombre', undefined, 'required'],
            ['nombre', '', 'required'],
            ['descripcion', undefined, 'required'],
            ['descripcion', '', 'required'],
            ['precio', undefined, 'required'],
            ['precio', -5, 'min'],
            ['stock', null, 'required'],
            ['stock', -3, 'min'],
            ['imagenUrl', undefined, 'required'],
            ['imagenUrl', '', 'required'],
        ])('rechaza %s con valor %p (%s)', async (campo, valor, tipoError) => {
            const producto = crearProducto({ [campo]: valor });

            await expect(producto.validate()).rejects.toMatchObject({
                name: 'ValidationError',
                errors: {
                    [campo]: {
                        kind: tipoError,
                    },
                },
            });
        });
    });

    describe('Normalización de texto', () => {
        it('elimina espacios sobrantes en nombre, descripción e imagenUrl', () => {
            const producto = crearProducto({
                nombre: '  Mesa Minimalista  ',
                descripcion: '  Madera maciza  ',
                imagenUrl: '  /assets/img/mesa.webp  ',
            });

            expect(producto.nombre).toBe('Mesa Minimalista');
            expect(producto.descripcion).toBe('Madera maciza');
            expect(producto.imagenUrl).toBe('/assets/img/mesa.webp');
        });
    });
});
