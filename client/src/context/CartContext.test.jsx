import {act, render, renderHook, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import {CARRITO_STORAGE_KEY, CartProvider, useCart} from "./CartContext";
import {obtenerProductos} from "../services/productosService";

jest.mock("../services/productosService", () => ({
    obtenerProductos: jest.fn()
}));

const sillaCordoba = {
    _id: "507f1f77bcf86cd799439011",
    nombre: "Silla Córdoba",
    precio: 120000,
    imagenUrl: "/assets/img/silla-cordoba.webp",
    categoria: "Sillas",
    stock: 3
};

const mesaPampa = {
    _id: "507f1f77bcf86cd799439012",
    nombre: "Mesa Comedor Pampa",
    precio: 450000,
    imagenUrl: "/assets/img/mesa-comedor-pampa.webp",
    categoria: "Mesas",
    stock: 5
};

const sillonSinStock = {
    _id: "507f1f77bcf86cd799439013",
    nombre: "Sillón Copacabana",
    precio: 380000,
    imagenUrl: "/assets/img/sillon-copacabana.webp",
    categoria: "Sillones",
    stock: 0
};

const piezaSinPrecio = {
    _id: "507f1f77bcf86cd799439014",
    nombre: "Aparador Uspallata",
    precio: 0,
    imagenUrl: "/assets/img/aparador-uspallata.webp",
    categoria: "Aparadores",
    stock: 2
};

const catalogoBase = [sillaCordoba, mesaPampa, sillonSinStock, piezaSinPrecio];

// ===== FUNCIONES AUXILIARES =====

function guardarCarritoLocal(items) {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(items));
}

function leerCarritoLocal() {
    const raw = localStorage.getItem(CARRITO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

function promesaPendiente() {
    let resolver, rechazar;
    const promesa = new Promise((resolve, reject) => {
        resolver = resolve;
        rechazar = reject;
    });
    return {promesa, resolver, rechazar};
}

async function renderizarCarritoHidratado(productos = catalogoBase) {
    obtenerProductos.mockResolvedValueOnce({productos});
    const hook = renderHook(() => useCart(), {wrapper: CartProvider});
    await waitFor(() => {
        expect(hook.result.current.cargando).toBe(false);
    });
    return hook;
}

// ===== TESTS =====

describe("CartContext", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        localStorage.clear();
    });

    describe("Estado inicial e hidratación", () => {
        test("inicializa vacío al hidratar el catálogo sin referencias previas", async () => {
            const {result} = await renderizarCarritoHidratado();

            expect(result.current.carrito).toEqual([]);
            expect(result.current.referencias).toEqual([]);
            expect(result.current.cartCount).toBe(0);
            expect(result.current.totalGeneral).toBe(0);
            expect(result.current.error).toBeNull();
            expect(obtenerProductos).toHaveBeenCalledTimes(1);
        });

        test("hidrata productos desde localStorage combinándolos con el catálogo", async () => {
            guardarCarritoLocal([
                {id: sillaCordoba._id, cantidad: 2},
                {id: mesaPampa._id, cantidad: 1}
            ]);

            const {result} = await renderizarCarritoHidratado();

            expect(result.current.carrito).toEqual([
                {
                    id: sillaCordoba._id,
                    nombre: sillaCordoba.nombre,
                    precio: sillaCordoba.precio,
                    imagen: sillaCordoba.imagenUrl,
                    categoria: sillaCordoba.categoria,
                    stock: sillaCordoba.stock,
                    cantidad: 2
                },
                {
                    id: mesaPampa._id,
                    nombre: mesaPampa.nombre,
                    precio: mesaPampa.precio,
                    imagen: mesaPampa.imagenUrl,
                    categoria: mesaPampa.categoria,
                    stock: mesaPampa.stock,
                    cantidad: 1
                }
            ]);
            expect(result.current.cartCount).toBe(3);
            expect(result.current.totalGeneral).toBe(690000);
        });

        test("descarta referencias corruptas o inválidas almacenadas en localStorage", async () => {
            guardarCarritoLocal([
                {id: sillaCordoba._id, cantidad: 2},
                {id: "id-invalido", cantidad: 1},
                {id: mesaPampa._id, cantidad: 0},
                {id: mesaPampa._id, cantidad: -3},
                {id: mesaPampa._id, cantidad: 1.5},
                null
            ]);

            const {result} = await renderizarCarritoHidratado();

            expect(result.current.referencias).toEqual([
                {id: sillaCordoba._id, cantidad: 2}
            ]);
            expect(result.current.cartCount).toBe(2);
        });

        test("tolera JSON malformado en localStorage", async () => {
            localStorage.setItem(CARRITO_STORAGE_KEY, "{json-roto");

            const {result} = await renderizarCarritoHidratado();

            expect(result.current.carrito).toEqual([]);
            expect(result.current.cartCount).toBe(0);
        });

        test("purga del carrito los productos que ya no existen en el catálogo", async () => {
            const idInexistente = "507f1f77bcf86cd799439099";
            guardarCarritoLocal([
                {id: sillaCordoba._id, cantidad: 1},
                {id: idInexistente, cantidad: 2}
            ]);

            const {result} = await renderizarCarritoHidratado();

            await waitFor(() => {
                expect(result.current.referencias).toEqual([
                    {id: sillaCordoba._id, cantidad: 1}
                ]);
            });
            expect(result.current.cartCount).toBe(1);
            expect(leerCarritoLocal()).toEqual([
                {id: sillaCordoba._id, cantidad: 1}
            ]);
        });

        test("informa error cuando falla la sincronización y permite reintentar", async () => {
            obtenerProductos
                .mockRejectedValueOnce(new Error("Network error"))
                .mockResolvedValueOnce({productos: catalogoBase});

            const {result} = renderHook(() => useCart(), {wrapper: CartProvider});

            await waitFor(() => {
                expect(result.current.cargando).toBe(false);
            });

            expect(result.current.error).toBe(
                "No se pudo sincronizar el catálogo de productos."
            );

            act(() => {
                result.current.reintentarSincronizacion();
            });

            await waitFor(() => {
                expect(result.current.cargando).toBe(false);
                expect(result.current.error).toBeNull();
            });

            expect(obtenerProductos).toHaveBeenCalledTimes(2);
        });
    });

    describe("Agregado de productos", () => {
        test("agrega un producto nuevo por objeto y acumula cantidad al repetirlo", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba);
            });

            expect(result.current.carrito).toHaveLength(1);
            expect(result.current.carrito[0].cantidad).toBe(1);
            expect(result.current.cartCount).toBe(1);

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
            });

            expect(result.current.carrito[0].cantidad).toBe(3);
            expect(result.current.cartCount).toBe(3);
        });

        test("agrega un producto pasando solo su ID cuando está en el catálogo", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(mesaPampa._id, 2);
            });

            expect(result.current.carrito).toHaveLength(1);
            expect(result.current.carrito[0].id).toBe(mesaPampa._id);
            expect(result.current.carrito[0].cantidad).toBe(2);
        });

        test.each([
            ["ID inválido", "no-es-object-id", 1],
            ["cantidad cero", sillaCordoba, 0],
            ["cantidad negativa", sillaCordoba, -2],
            ["cantidad decimal", sillaCordoba, 1.5],
            ["cantidad string", sillaCordoba, "2"]
        ])("ignora intentos de agregado con %s", async (_, entrada, cantidad) => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(entrada, cantidad);
            });

            expect(result.current.carrito).toEqual([]);
            expect(result.current.cartCount).toBe(0);
        });
    });

    describe("Límites de stock", () => {
        test("no agrega productos con stock igual a 0", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillonSinStock, 1);
            });

            expect(result.current.carrito).toEqual([]);
            expect(result.current.cartCount).toBe(0);
        });

        test("limita al stock máximo al agregar una cantidad superior al disponible", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 10);
            });

            expect(result.current.carrito[0].cantidad).toBe(sillaCordoba.stock);
            expect(result.current.cartCount).toBe(3);
        });

        test("no supera el stock disponible al agregar repetidamente el mismo producto", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
            });
            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 5);
            });

            expect(result.current.carrito[0].cantidad).toBe(sillaCordoba.stock);
            expect(result.current.cartCount).toBe(3);
        });

        test("limita actualizarCantidad al stock máximo disponible", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 1);
            });
            act(() => {
                result.current.actualizarCantidad(sillaCordoba._id, 99);
            });

            expect(result.current.carrito[0].cantidad).toBe(sillaCordoba.stock);
            expect(result.current.cartCount).toBe(3);
        });

        test("elimina el ítem si actualizarCantidad se invoca sobre un producto cuyo stock pasó a 0", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 1);
            });
            act(() => {
                result.current.sincronizarProducto({...sillaCordoba, stock: 0});
            });
            act(() => {
                result.current.actualizarCantidad(sillaCordoba._id, 1);
            });

            expect(result.current.carrito).toEqual([]);
            expect(result.current.referencias).toEqual([]);
            expect(result.current.cartCount).toBe(0);
        });
    });

    describe("Actualización de cantidades", () => {
        test("actualiza la cantidad dentro del rango permitido", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(mesaPampa, 2);
            });
            act(() => {
                result.current.actualizarCantidad(mesaPampa._id, 4);
            });

            expect(result.current.carrito[0].cantidad).toBe(4);

            act(() => {
                result.current.actualizarCantidad(mesaPampa._id, 1);
            });

            expect(result.current.carrito[0].cantidad).toBe(1);
        });

        test.each([0, -1])(
            "elimina el producto cuando la nueva cantidad es %i",
            async (nuevaCantidad) => {
                const {result} = await renderizarCarritoHidratado();

                act(() => {
                    result.current.agregarAlCarrito(sillaCordoba, 2);
                });
                act(() => {
                    result.current.actualizarCantidad(sillaCordoba._id, nuevaCantidad);
                });

                expect(result.current.carrito).toEqual([]);
                expect(result.current.cartCount).toBe(0);
            }
        );

        test("ignora actualizaciones con ID inválido o cantidad no entera", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
            });
            act(() => {
                result.current.actualizarCantidad("id-invalido", 1);
                result.current.actualizarCantidad(sillaCordoba._id, 2.5);
                result.current.actualizarCantidad(sillaCordoba._id, "3");
            });

            expect(result.current.carrito[0].cantidad).toBe(2);
        });
    });

    describe("Eliminación, vaciado y sincronización", () => {
        test("elimina únicamente el producto indicado con eliminarDelCarrito", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 1);
                result.current.agregarAlCarrito(mesaPampa, 2);
            });
            act(() => {
                result.current.eliminarDelCarrito(sillaCordoba._id);
            });

            expect(result.current.carrito).toHaveLength(1);
            expect(result.current.carrito[0].id).toBe(mesaPampa._id);
            expect(result.current.cartCount).toBe(2);
        });

        test("vacía completamente el carrito y el almacenamiento local con vaciarCarrito", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
                result.current.agregarAlCarrito(mesaPampa, 1);
            });
            act(() => {
                result.current.vaciarCarrito();
            });

            expect(result.current.carrito).toEqual([]);
            expect(result.current.referencias).toEqual([]);
            expect(result.current.cartCount).toBe(0);
            expect(result.current.totalGeneral).toBe(0);
            expect(leerCarritoLocal()).toEqual([]);
        });

        test("sincronizarProducto actualiza los datos del producto y refleja su eliminación", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
            });
            act(() => {
                result.current.sincronizarProducto({
                    ...sillaCordoba,
                    nombre: "Silla Córdoba Edición Nogal",
                    precio: 150000
                });
            });

            expect(result.current.carrito[0].nombre).toBe("Silla Córdoba Edición Nogal");
            expect(result.current.totalGeneral).toBe(300000);

            act(() => {
                result.current.sincronizarProducto(sillaCordoba._id, {eliminado: true});
            });

            expect(result.current.carrito).toEqual([]);
            expect(result.current.cartCount).toBe(0);
        });

        test("preserva cambios hechos con sincronizarProducto durante la hidratación", async () => {
            const pendiente = promesaPendiente();
            obtenerProductos.mockReturnValueOnce(pendiente.promesa);

            const {result} = renderHook(() => useCart(), {wrapper: CartProvider});

            const productoEditado = {...sillaCordoba, precio: 180000};
            act(() => {
                result.current.sincronizarProducto(productoEditado);
                result.current.agregarAlCarrito(productoEditado, 1);
            });

            await act(async () => {
                pendiente.resolver({productos: catalogoBase});
            });

            await waitFor(() => {
                expect(result.current.cargando).toBe(false);
            });

            expect(result.current.carrito[0].precio).toBe(180000);
            expect(result.current.totalGeneral).toBe(180000);
        });
    });

    describe("Cálculo de totales", () => {
        test("calcula cartCount y totalGeneral correctamente ante múltiples operaciones", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2); // 240.000
                result.current.agregarAlCarrito(mesaPampa, 1);    // 450.000
                result.current.agregarAlCarrito(piezaSinPrecio, 2); // 0
            });

            expect(result.current.cartCount).toBe(5);
            expect(result.current.totalGeneral).toBe(690000);

            act(() => {
                result.current.actualizarCantidad(mesaPampa._id, 3); // 1.350.000
            });

            expect(result.current.cartCount).toBe(7);
            expect(result.current.totalGeneral).toBe(1590000);

            act(() => {
                result.current.eliminarDelCarrito(sillaCordoba._id);
            });

            expect(result.current.cartCount).toBe(5);
            expect(result.current.totalGeneral).toBe(1350000);
        });
    });

    describe("Persistencia en localStorage", () => {
        test("persiste únicamente las referencias mínimas {id, cantidad}", async () => {
            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
            });

            expect(leerCarritoLocal()).toEqual([
                {id: sillaCordoba._id, cantidad: 2}
            ]);
        });

        test("mantiene el carrito en memoria si falla localStorage.setItem", async () => {
            jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
                throw new Error("QuotaExceededError");
            });

            const {result} = await renderizarCarritoHidratado();

            act(() => {
                result.current.agregarAlCarrito(sillaCordoba, 2);
            });

            expect(result.current.cartCount).toBe(2);
            expect(result.current.totalGeneral).toBe(240000);
        });
    });

    describe("Hook useCart, memoización y estado compartido", () => {
        test("lanza un error si useCart se usa fuera de CartProvider", () => {
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            expect(() => renderHook(() => useCart())).toThrow(
                "useCart debe ser utilizado dentro de un CartProvider"
            );

            consoleErrorSpy.mockRestore();
        });

        test("mantiene la misma referencia de value cuando el padre re-renderiza sin cambios del carrito", async () => {
            obtenerProductos.mockResolvedValueOnce({productos: catalogoBase});
            const valoresObservados = [];

            function Observador() {
                const value = useCart();
                valoresObservados.push(value);
                return <span>{value.cartCount}</span>;
            }

            const {rerender} = render(
                <CartProvider>
                    <Observador/>
                </CartProvider>
            );

            await waitFor(() => {
                expect(valoresObservados[valoresObservados.length - 1].cargando).toBe(false);
            });

            const valorAntesDelRerender = valoresObservados[valoresObservados.length - 1];

            rerender(
                <CartProvider>
                    <Observador/>
                </CartProvider>
            );

            const valorDespuesDelRerender = valoresObservados[valoresObservados.length - 1];
            expect(valorDespuesDelRerender).toBe(valorAntesDelRerender);
        });

        test("propaga cambios entre consumidores hermanos sin prop drilling", async () => {
            obtenerProductos.mockResolvedValueOnce({productos: catalogoBase});

            function ConsumidorAcciones() {
                const {agregarAlCarrito, vaciarCarrito} = useCart();
                return (
                    <>
                        <button onClick={() => agregarAlCarrito(sillaCordoba, 2)}>
                            Agregar sillas
                        </button>
                        <button onClick={vaciarCarrito}>Vaciar</button>
                    </>
                );
            }

            function ConsumidorResumen() {
                const {cartCount, totalGeneral} = useCart();
                return (
                    <div>
                        <span data-testid="cantidad">{cartCount}</span>
                        <span data-testid="total">{totalGeneral}</span>
                    </div>
                );
            }

            render(
                <CartProvider>
                    <ConsumidorAcciones/>
                    <ConsumidorResumen/>
                </CartProvider>
            );

            await waitFor(() => {
                expect(obtenerProductos).toHaveBeenCalledTimes(1);
            });

            expect(screen.getByTestId("cantidad")).toHaveTextContent("0");
            expect(screen.getByTestId("total")).toHaveTextContent("0");

            act(() => {
                screen.getByRole("button", {name: "Agregar sillas"}).click();
            });

            expect(screen.getByTestId("cantidad")).toHaveTextContent("2");
            expect(screen.getByTestId("total")).toHaveTextContent("240000");

            act(() => {
                screen.getByRole("button", {name: "Vaciar"}).click();
            });

            expect(screen.getByTestId("cantidad")).toHaveTextContent("0");
            expect(screen.getByTestId("total")).toHaveTextContent("0");
        });
    });
});
