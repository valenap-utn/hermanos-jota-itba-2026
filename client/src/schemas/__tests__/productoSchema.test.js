import {
    crearProductoSchema,
    OTRA_CATEGORIA,
    TAMANIO_MAX_IMAGEN_BYTES,
} from "../productoSchema";

describe("Validación de Producto con descripción e imagen obligatorias y stock opcional", () => {
    const schemaCrear = crearProductoSchema("crear");
    const schemaEditar = crearProductoSchema("editar");

    const crearArchivoValido = () =>
        new File(["contenido"], "silla.webp", { type: "image/webp" });

    describe("modo crear", () => {
        test("acepta producto válido sin stock y asigna 0 por defecto", () => {
            const archivo = crearArchivoValido();
            const resultado = schemaCrear.safeParse({
                nombre: "Mesa Minimal",
                descripcion: "Mesa de madera maciza con acabado natural",
                precio: "45000",
                categoria: "mesas",
                imagen: archivo,
            });

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.nombre).toBe("Mesa Minimal");
                expect(resultado.data.precio).toBe(45000);
                expect(resultado.data.stock).toBe(0);
                expect(resultado.data.imagen).toBe(archivo);
            }
        });

        test("convierte stock vacío en 0", () => {
            const resultado = schemaCrear.safeParse({
                nombre: "Mesa Auxiliar",
                descripcion: "Mesa auxiliar en madera de roble lustrado",
                precio: "12000",
                stock: "",
                categoria: "mesas",
                imagen: crearArchivoValido(),
            });

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.stock).toBe(0);
            }
        });

        test("rechaza producto sin descripción o con menos de 10 caracteres", () => {
            const sinDescripcion = schemaCrear.safeParse({
                nombre: "Mesa Minimal",
                descripcion: "",
                precio: "45000",
                categoria: "mesas",
                imagen: crearArchivoValido(),
            });

            expect(sinDescripcion.success).toBe(false);
            if (!sinDescripcion.success) {
                expect(sinDescripcion.error.issues[0].message).toMatch(/obligatorio/i);
            }

            const descripcionCorta = schemaCrear.safeParse({
                nombre: "Mesa Minimal",
                descripcion: "Muy corta",
                precio: "45000",
                categoria: "mesas",
                imagen: crearArchivoValido(),
            });

            expect(descripcionCorta.success).toBe(false);
        });

        test("rechaza producto sin archivo de imagen e informa que es obligatorio", () => {
            const resultado = schemaCrear.safeParse({
                nombre: "Mesa Minimal",
                descripcion: "Mesa de madera maciza con acabado natural",
                precio: "45000",
                categoria: "mesas",
                imagen: null,
            });

            expect(resultado.success).toBe(false);
            if (!resultado.success) {
                expect(resultado.error.issues[0].path).toEqual(["imagen"]);
                expect(resultado.error.issues[0].message).toMatch(/obligatorio/i);
            }
        });
    });

    describe("modo editar", () => {
        test("acepta producto con imagenUrl existente y sin archivo nuevo ni stock", () => {
            const resultado = schemaEditar.safeParse({
                nombre: "Silla Córdoba",
                descripcion: "Madera de petiribí y esterillado natural",
                precio: "65000",
                categoria: "sillas",
                imagen: null,
                imagenUrl: "/assets/img/silla.webp",
            });

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.stock).toBe(0);
                expect(resultado.data.imagenUrl).toBe("/assets/img/silla.webp");
            }
        });

        test("acepta producto con archivo nuevo aunque imagenUrl esté vacía", () => {
            const archivo = crearArchivoValido();
            const resultado = schemaEditar.safeParse({
                nombre: "Silla Córdoba",
                descripcion: "Madera de petiribí y esterillado natural",
                precio: "65000",
                stock: "15",
                categoria: "sillas",
                imagen: archivo,
                imagenUrl: "",
            });

            expect(resultado.success).toBe(true);
            if (resultado.success) {
                expect(resultado.data.stock).toBe(15);
                expect(resultado.data.imagen).toBe(archivo);
            }
        });

        test("rechaza producto sin imagen ni imagenUrl e informa que es obligatorio", () => {
            const resultado = schemaEditar.safeParse({
                nombre: "Silla Córdoba",
                descripcion: "Madera de petiribí y esterillado natural",
                precio: "65000",
                categoria: "sillas",
                imagen: null,
                imagenUrl: "",
            });

            expect(resultado.success).toBe(false);
            if (!resultado.success) {
                expect(resultado.error.issues[0].path).toEqual(["imagenUrl"]);
                expect(resultado.error.issues[0].message).toMatch(/obligatorio/i);
            }
        });
    });

    describe.each([
        ["crear", schemaCrear],
        ["editar", schemaEditar],
    ])("reglas comunes en modo %s", (_modo, schema) => {
        const baseValida = () => ({
            nombre: "Silla Córdoba",
            descripcion: "Madera de petiribí y esterillado natural",
            precio: "65000",
            stock: "15",
            categoria: "sillas",
            imagen: crearArchivoValido(),
            imagenUrl: "/assets/img/silla.webp",
        });

        test("rechaza nombre menor a 3 caracteres, precio vacío o negativo", () => {
            expect(schema.safeParse({ ...baseValida(), nombre: "Ab" }).success).toBe(false);
            expect(schema.safeParse({ ...baseValida(), precio: "" }).success).toBe(false);
            expect(schema.safeParse({ ...baseValida(), precio: "-100" }).success).toBe(false);
        });

        test("rechaza stock negativo o no entero", () => {
            expect(schema.safeParse({ ...baseValida(), stock: "-2" }).success).toBe(false);
            expect(schema.safeParse({ ...baseValida(), stock: "2.5" }).success).toBe(false);
        });

        test("exige nuevaCategoria cuando se selecciona Otra categoría", () => {
            const resultado = schema.safeParse({
                ...baseValida(),
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
                schema.safeParse({ ...baseValida(), imagen: archivoInvalido }).success
            ).toBe(false);

            const archivoGrande = new File(["x"], "grande.png", {
                type: "image/png",
            });
            Object.defineProperty(archivoGrande, "size", {
                value: TAMANIO_MAX_IMAGEN_BYTES + 1,
            });

            expect(
                schema.safeParse({ ...baseValida(), imagen: archivoGrande }).success
            ).toBe(false);
        });
    });
});
