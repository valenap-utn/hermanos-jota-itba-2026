jest.mock('../../src/models/Product', () => ({
    countDocuments: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../src/utils/subirACloudinary', () => ({
    subirACloudinary: jest.fn(),
}));

jest.mock('../../src/utils/resolverCategoria', () => jest.fn());

const Product = require('../../src/models/Product');
const resolverCategoria = require('../../src/utils/resolverCategoria');
const {
    crearProducto,
    actualizarProducto,
} = require('../../src/controllers/productosController');

const ID_VALIDO = '507f1f77bcf86cd799439011';

const BODY_VALIDO = {
    nombre: 'Mesa Minimal',
    descripcion: 'Mesa de madera maciza de petiribí con acabado mate',
    precio: '45000',
    categoria: 'Mesas',
    imagenUrl: '/assets/img/mesa.webp',
};

function ejecutarControlador(handler, req) {
    return new Promise((resolve, reject) => {
        const res = {
            statusCode: 200,
            body: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(payload) {
                this.body = payload;
                resolve(this);
                return this;
            },
        };

        const next = (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        };

        handler(req, res, next);
    });
}

describe('productosController - validaciones obligatorias y seguridad (#108)', () => {
    beforeEach(() => {
        Product.countDocuments.mockResolvedValue(0);
        resolverCategoria.mockResolvedValue('Mesas');
    });

    describe('crearProducto', () => {
        it('crea un producto válido sin stock y asigna 0 por defecto', async () => {
            Product.create.mockImplementation(async (doc) => ({ _id: ID_VALIDO, ...doc }));

            const res = await ejecutarControlador(crearProducto, {
                body: BODY_VALIDO,
            });

            expect(res.statusCode).toBe(201);
            expect(Product.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    nombre: 'Mesa Minimal',
                    descripcion: 'Mesa de madera maciza de petiribí con acabado mate',
                    precio: 45000,
                    stock: 0,
                    imagenUrl: '/assets/img/mesa.webp',
                })
            );
        });

        it('acepta precio explícito en 0', async () => {
            Product.create.mockImplementation(async (doc) => ({ _id: ID_VALIDO, ...doc }));

            const res = await ejecutarControlador(crearProducto, {
                body: {
                    ...BODY_VALIDO,
                    precio: '0',
                },
            });

            expect(res.statusCode).toBe(201);
            expect(Product.create).toHaveBeenCalledWith(
                expect.objectContaining({ precio: 0 })
            );
        });

        it.each([undefined, '', '   ', null, 123])(
            'rechaza descripción ausente o inválida (%p) con 400',
            async (descripcionInvalida) => {
                await expect(
                    ejecutarControlador(crearProducto, {
                        body: {
                            ...BODY_VALIDO,
                            descripcion: descripcionInvalida,
                        },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.create).not.toHaveBeenCalled();
            }
        );

        it.each([undefined, '', '   '])(
            'rechaza creación sin archivo ni imagenUrl (%p) con 400',
            async (imagenAusente) => {
                await expect(
                    ejecutarControlador(crearProducto, {
                        body: {
                            ...BODY_VALIDO,
                            imagenUrl: imagenAusente,
                        },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.create).not.toHaveBeenCalled();
            }
        );

        it.each(['', '   ', null, undefined, false, [], {}, -10, 'abc'])(
            'rechaza precio inválido (%p) con 400 para no guardar $0',
            async (precioInvalido) => {
                await expect(
                    ejecutarControlador(crearProducto, {
                        body: {
                            ...BODY_VALIDO,
                            precio: precioInvalido,
                        },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.create).not.toHaveBeenCalled();
            }
        );

        it.each([123, null, { $ne: '' }, ['/assets/img/mesa.webp'], true])(
            'rechaza imagenUrl con tipo no-string (%p) con 400',
            async (imagenInvalida) => {
                await expect(
                    ejecutarControlador(crearProducto, {
                        body: {
                            ...BODY_VALIDO,
                            imagenUrl: imagenInvalida,
                        },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.create).not.toHaveBeenCalled();
            }
        );
    });

    describe('actualizarProducto', () => {
        it.each(['', '   ', null, false, [], {}, -1, 'no-es-numero'])(
            'rechaza precio inválido (%p) con 400 para no sobrescribir con $0',
            async (precioInvalido) => {
                await expect(
                    ejecutarControlador(actualizarProducto, {
                        params: { id: ID_VALIDO },
                        body: { precio: precioInvalido },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
            }
        );

        it.each(['', '   ', null, 123])(
            'rechaza descripción vacía o no-string (%p) con 400',
            async (descripcionInvalida) => {
                await expect(
                    ejecutarControlador(actualizarProducto, {
                        params: { id: ID_VALIDO },
                        body: { descripcion: descripcionInvalida },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
            }
        );

        it.each([123, null, { $ne: '' }, ['https://evil.test/x.png'], true, '', '   '])(
            'rechaza imagenUrl vacía o con tipo no-string (%p) para evitar bypass de validarImagen',
            async (imagenInvalida) => {
                await expect(
                    ejecutarControlador(actualizarProducto, {
                        params: { id: ID_VALIDO },
                        body: { imagenUrl: imagenInvalida },
                    })
                ).rejects.toMatchObject({ status: 400 });

                expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
            }
        );

        it('rechaza imagenUrl externa no autorizada con 400', async () => {
            await expect(
                ejecutarControlador(actualizarProducto, {
                    params: { id: ID_VALIDO },
                    body: { imagenUrl: 'https://sitio-externo.test/foto.jpg' },
                })
            ).rejects.toMatchObject({ status: 400 });

            expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('actualiza correctamente precio numérico válido e imagenUrl permitida', async () => {
            Product.findByIdAndUpdate.mockResolvedValue({
                _id: ID_VALIDO,
                nombre: 'Mesa',
                precio: 15000,
                imagenUrl: '/assets/img/mesa.webp',
            });

            const res = await ejecutarControlador(actualizarProducto, {
                params: { id: ID_VALIDO },
                body: {
                    precio: '15000',
                    imagenUrl: '  /assets/img/mesa.webp  ',
                },
            });

            expect(res.statusCode).toBe(200);
            expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
                ID_VALIDO,
                expect.objectContaining({
                    precio: 15000,
                    imagenUrl: '/assets/img/mesa.webp',
                }),
                { new: true, runValidators: true }
            );
        });
    });
});
