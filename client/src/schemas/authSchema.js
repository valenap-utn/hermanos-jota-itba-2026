import {z} from "zod";

const emailSchema = z
    .string()
    .trim()
    .min(1, "Ingresá tu correo electrónico.")
    .max(254, "El correo electrónico es demasiado largo.")
    .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Ingresá un correo electrónico válido."
    )
    .toLowerCase();

const passwordSchema = z
    .string()
    .min(1, "Ingresá tu contraseña.")
    .refine(
        (password) => new Blob([password]).size <= 72,
        "La contraseña no puede superar los 72 bytes."
    );

export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema
});

export const registroSchema = z
    .object({
        nombre: z
            .string()
            .trim()
            .min(3, "El nombre debe tener al menos 3 caracteres.")
            .max(100, "El nombre no puede superar los 100 caracteres."),

        email: emailSchema,

        password: passwordSchema.refine(
            (password) => password.length >= 8,
            "La contraseña debe tener al menos 8 caracteres."
        ),

        confirmarPassword: z
            .string()
            .min(1, "Confirmá tu contraseña.")
    })
    .refine(
        (datos) => datos.password === datos.confirmarPassword,
        {
            message: "Las contraseñas no coinciden.",
            path: ["confirmarPassword"]
        }
    );