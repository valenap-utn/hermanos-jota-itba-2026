import {loginSchema, registroSchema} from "./authSchema";

const loginValido = {
    email: "usuario@example.com",
    password: "Password123"
};

const registroValido = {
    nombre: "Juan Pérez",
    email: "usuario@example.com",
    password: "Password123",
    confirmarPassword: "Password123"
};

describe("loginSchema", () => {
    test("acepta credenciales válidas", () => {
        const resultado = loginSchema.safeParse(loginValido);

        expect(resultado.success).toBe(true);
        expect(resultado.data).toEqual(loginValido);
    });

    test("normaliza el correo electrónico sin modificar la contraseña", () => {
        const resultado = loginSchema.parse({
            email: "  USUARIO@EXAMPLE.COM  ",
            password: " Password123 "
        });

        expect(resultado.email).toBe("usuario@example.com");
        expect(resultado.password).toBe(" Password123 ");
    });

    test.each([
        ["email vacío", {email: ""}],
        ["email inválido", {email: "usuario"}],
        ["email sin dominio válido", {email: "usuario@example"}],
        ["password vacío", {password: ""}],
        ["password solo espacios", {password: "        "}],
        ["password superior a 72 bytes", {
            password: "a".repeat(73)
        }],
        ["password multibyte superior a 72 bytes", {
            password: "á".repeat(37)
        }]
    ])("rechaza %s", (_, cambios) => {
        const resultado = loginSchema.safeParse({
            ...loginValido,
            ...cambios
        });

        expect(resultado.success).toBe(false);
    });

    test.each([
        "a".repeat(72),
        "á".repeat(36)
    ])("acepta contraseñas de exactamente 72 bytes", (password) => {
        const resultado = loginSchema.safeParse({
            ...loginValido,
            password
        });

        expect(resultado.success).toBe(true);
    });
});

describe("registroSchema", () => {
    test("acepta datos de registro válidos", () => {
        const resultado = registroSchema.safeParse(registroValido);

        expect(resultado.success).toBe(true);
        expect(resultado.data).toEqual(registroValido);
    });

    test("normaliza el nombre y el correo sin modificar la contraseña", () => {
        const resultado = registroSchema.parse({
            ...registroValido,
            nombre: "  Juan Pérez  ",
            email: "  USUARIO@EXAMPLE.COM  ",
            password: " Password123 ",
            confirmarPassword: " Password123 "
        });

        expect(resultado.nombre).toBe("Juan Pérez");
        expect(resultado.email).toBe("usuario@example.com");
        expect(resultado.password).toBe(" Password123 ");
    });

    test.each([
        ["nombre vacío", {nombre: ""}],
        ["nombre demasiado corto", {nombre: "Jo"}],
        ["nombre demasiado largo", {nombre: "a".repeat(101)}],
        ["email vacío", {email: ""}],
        ["email inválido", {email: "usuario"}],
        ["password vacío", {
            password: "",
            confirmarPassword: ""
        }],
        ["password solo espacios", {
            password: "        ",
            confirmarPassword: "        "
        }],
        ["password demasiado corto", {
            password: "1234567",
            confirmarPassword: "1234567"
        }],
        ["password superior a 72 bytes", {
            password: "a".repeat(73),
            confirmarPassword: "a".repeat(73)
        }],
        ["password multibyte superior a 72 bytes", {
            password: "á".repeat(37),
            confirmarPassword: "á".repeat(37)
        }],
        ["confirmación vacía", {
            confirmarPassword: ""
        }]
    ])("rechaza %s", (_, cambios) => {
        const resultado = registroSchema.safeParse({
            ...registroValido,
            ...cambios
        });

        expect(resultado.success).toBe(false);
    });

    test("asocia el error de contraseñas diferentes al campo de confirmación", () => {
        const resultado = registroSchema.safeParse({
            ...registroValido,
            confirmarPassword: "OtraPassword123"
        });

        expect(resultado.success).toBe(false);

        expect(resultado.error.flatten().fieldErrors.confirmarPassword)
            .toContain("Las contraseñas no coinciden.");
    });

    test.each([
        "12345678",
        "a".repeat(72),
        "á".repeat(36)
    ])("acepta contraseñas dentro de los límites permitidos", (password) => {
        const resultado = registroSchema.safeParse({
            ...registroValido,
            password,
            confirmarPassword: password
        });

        expect(resultado.success).toBe(true);
    });
});