import { z } from "zod";

const TIPOS_IMAGEN_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024; // 5 MB

export const productoSchema = z
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

    // Valida que no esté vacío y luego transforma a número positivo o cero
    precio: z
      .string()
      .trim()
      .min(1, "Ingresá el precio del producto.")
      .pipe(
        z.coerce
          .number({ message: "Ingresá un precio numérico válido." })
          .nonnegative("El precio debe ser mayor o igual a 0.")
      ),

    // Valida que no esté vacío y luego transforma a entero mayor o igual a cero
    stock: z
      .string()
      .trim()
      .min(1, "Ingresá el stock del producto.")
      .pipe(
        z.coerce
          .number({ message: "Ingresá un stock numérico válido." })
          .int("El stock debe ser un número entero.")
          .nonnegative("El stock no puede ser negativo.")
      ),

    categoria: z
      .string()
      .trim()
      .min(1, "Seleccioná una categoría."),

    nuevaCategoria: z
      .string()
      .trim()
      .optional(),

    medidas: z
      .string()
      .trim()
      .optional(),

    materiales: z
      .string()
      .trim()
      .optional(),

    destacado: z
      .boolean()
      .default(false),

    imagen: z
      .instanceof(File, { message: "Seleccioná una imagen para el producto." })
      .refine(
        (file) => TIPOS_IMAGEN_PERMITIDOS.includes(file.type),
        "La imagen debe ser JPG, JPEG, PNG o WebP."
      )
      .refine(
        (file) => file.size <= TAMANO_MAXIMO_IMAGEN,
        "La imagen no puede superar los 5 MB."
      ),
  })
  .superRefine((data, ctx) => {
    if (
      data.categoria === "__otra__" &&
      (!data.nuevaCategoria || !data.nuevaCategoria.trim())
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["nuevaCategoria"],
        message: "Ingresá el nombre de la nueva categoría.",
      });
    }
  });
