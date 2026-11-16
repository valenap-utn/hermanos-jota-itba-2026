import {
    crearProductoSchema,
    OTRA_CATEGORIA,
    TAMANIO_MAX_IMAGEN_BYTES,
} from "../productoSchema";

describe("Validación de Producto con campos opcionales (#108)", () => {
    const schemaCrear = crearProductoSchema("crear");
    const schemaEditar = crearProductoSchema("editar");

    describe.each([
        ["crear", schemaCrear],
        ["editar", schemaEditar],
    ])("modo %s", (_modo, schema) => {
        test("acepta producto mínimo sin descripción, stock ni imagen", () => {
            const dataMinima = {
                nombre: "Mesa Minimal",
                precio: "45000",
                categoria: "mesas",
            };

            const resultado = schema.safeParse(dataMinima);

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.nombre).toBe("Mesa Minimal");
                expect(resultado.data.descripcion).toBe("");
                expect(resultado.data.precio).toBe(45000);
                expect(resultado.data.stock).toBe(0);
                expect(resultado.data.imagen).toBeNull();
                expect(resultado.data.imagenUrl).toBe("");
            }
        });

        test("convierte stock vacío en 0 y permite imagenUrl vacía", () => {
            const resultado = schema.safeParse({
                nombre: "Mesa Auxiliar",
                descripcion: "",
                precio: "12000",
                stock: "",
                categoria: "mesas",
                imagen: null,
                imagenUrl: "",
            });

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.stock).toBe(0);
                expect(resultado.data.descripcion).toBe("");
                expect(resultado.data.imagenUrl).toBe("");
            }
        });

        test("acepta producto completo con todos los campos y archivo de imagen válido", () => {
            const archivoValido = new File(["contenido"], "silla.webp", {
                type: "image/webp",
            });

            const resultado = schema.safeParse({
                nombre: "Silla Córdoba",
                descripcion: "Madera de petiribí y esterillado natural",
                precio: "65000",
                stock: "15",
                categoria: "sillas",
                materiales: "Petiribí",
                medidas: "50x50x85 cm",
                destacado: true,
                imagen: archivoValido,
                imagenUrl: "/assets/img/silla.webp",
            });

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.stock).toBe(15);
                expect(resultado.data.precio).toBe(65000);
                expect(resultado.data.descripcion).toBe(
                    "Madera de petiribí y esterillado natural"
                );
                expect(resultado.data.imagen).toBe(archivoValido);
            }
        });

        test("rechaza nombre menor a 3 caracteres, precio vacío o negativo", () => {
            expect(
                schema.safeParse({
                    nombre: "Ab",
                    precio: "1000",
                    categoria: "mesas",
                }).success
            ).toBe(false);

            expect(
                schema.safeParse({
                    nombre: "Mesa",
                    precio: "",
                    categoria: "mesas",
                }).success
            ).toBe(false);

            expect(
                schema.safeParse({
                    nombre: "Mesa",
                    precio: "-100",
                    categoria: "mesas",
                }).success
            ).toBe(false);
        });

        test("rechaza stock negativo o no entero", () => {
            expect(
                schema.safeParse({
                    nombre: "Mesa",
                    precio: "1000",
                    stock: "-2",
                    categoria: "mesas",
                }).success
            ).toBe(false);

            expect(
                schema.safeParse({
                    nombre: "Mesa",
                    precio: "1000",
                    stock: "2.5",
                    categoria: "mesas",
                }).success
            ).toBe(false);
        });

        test("exige nuevaCategoria cuando se selecciona Otra categoría", () => {
            const resultado = schema.safeParse({
                nombre: "Banco Exterior",
                precio: "30000",
                categoria: OTRA_CATEGORIA,
                nuevaCategoria: "   ",
            });

            expect(resultado.success).toBe(false);
        });

        test("rechaza archivo de imagen con tipo MIME no permitido o tamaño mayor al límite", () => {
            const archivoInvalido = new File(["texto"], "doc.pdf", {
                type: "application/pdf",
            });

            expect(
                schema.safeParse({
                    nombre: "Mesa",
                    precio: "1000",
                    categoria: "mesas",
                    imagen: archivoInvalido,
                }).success
            ).toBe(false);

            const archivoGrande = new File(["x"], "grande.png", {
                type: "image/png",
            });
            Object.defineProperty(archivoGrande, "size", {
                value: TAMANIO_MAX_IMAGEN_BYTES + 1,
            });

            expect(
                schema.safeParse({
                    nombre: "Mesa",
                    precio: "1000",
                    categoria: "mesas",
                    imagen: archivoGrande,
                }).success
            ).toBe(false);
        });
    });
});
