import {z} from "zod";

export const OTRA_CATEGORIA = "__otra__";

export const TIPOS_IMAGEN_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export const TAMANIO_MAX_IMAGEN_BYTES = 5 * 1024 * 1024;

// Validación compartida de archivos de imagen
export const imagenSchema = z
    .instanceof(File, {
        message: "Seleccioná una imagen para el producto.",
    })
    .refine(
        (file) => TIPOS_IMAGEN_PERMITIDOS.includes(file.type),
        "La imagen debe ser JPG, JPEG, PNG o WebP."
    )
    .refine(
        (file) => file.size <= TAMANIO_MAX_IMAGEN_BYTES,
        "La imagen no puede superar los 5 MB."
    );

// Esquema compartido para creación y edición
export const crearProductoSchema = (modo = "crear") =>
    z
        .object({
            nombre: z
                .string()
                .trim()
                .min(1, "Ingresá el nombre del producto.")
                .min(3, "El nombre debe tener al menos 3 caracteres."),

            descripcion: z
                .string()
                .trim()
                .min(1, "Ingresá una descripción.")
                .min(10, "La descripción debe tener al menos 10 caracteres."),

            precio: z
                .string()
                .trim()
                .min(1, "Ingresá el precio del producto.")
                .pipe(
                    z.coerce
                        .number({message: "Ingresá un precio numérico válido."})
                        .finite("Ingresá un precio numérico válido.")
                        .nonnegative("El precio debe ser mayor o igual a 0.")
                ),

            stock: z
                .string()
                .trim()
                .min(1, "Ingresá el stock del producto.")
                .pipe(
                    z.coerce
                        .number({message: "Ingresá un stock numérico válido."})
                        .int("El stock debe ser un número entero.")
                        .nonnegative("El stock no puede ser negativo.")
                ),

            categoria: z
                .string()
                .trim()
                .min(1, "Seleccioná una categoría."),

            nuevaCategoria: z.string().trim().default(""),

            medidas: z.string().trim().default(""),

            materiales: z.string().trim().default(""),

            destacado: z.boolean().default(false),

            imagen: imagenSchema.nullable().default(null),

            imagenUrl: z.string().trim().default(""),
        })
        .superRefine((data, ctx) => {
            if (
                data.categoria === OTRA_CATEGORIA &&
                !data.nuevaCategoria
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["nuevaCategoria"],
                    message: "Ingresá el nombre de la nueva categoría.",
                });
            }

            if (modo === "crear" && !data.imagen) {
                ctx.addIssue({
                    code: "custom",
                    path: ["imagen"],
                    message: "Seleccioná una imagen para el producto.",
                });
            }

            if (
                modo === "editar" &&
                !data.imagen &&
                !data.imagenUrl
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["imagenUrl"],
                    message: "La imagen del producto es obligatoria.",
                });
            }
        });

// Compatibilidad temporal con CrearProducto
export const productoSchema = crearProductoSchema("crear");
