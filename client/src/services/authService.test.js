import {apiFetch} from "./apiClient";

import {autenticarUsuario, obtenerUsuarioAutenticado, registrarUsuario} from "./authService";

jest.mock("./apiClient", () => ({
    apiFetch: jest.fn()
}));

const usuarioPrueba = {
    _id: "507f1f77bcf86cd799439011",
    nombre: "Usuario Prueba",
    email: "usuario@example.com",
    rol: "CLIENTE"
};

const tokenPrueba = "token-usuario-prueba";

describe("authService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("registrarUsuario", () => {
        test("envía los datos al endpoint de registro y retorna el usuario", async () => {
            const datos = {
                nombre: "Usuario Prueba",
                email: "usuario@example.com",
                password: "Password123"
            };

            apiFetch.mockResolvedValue({
                status: "success",
                data: usuarioPrueba
            });

            const resultado = await registrarUsuario(datos);

            expect(apiFetch).toHaveBeenCalledTimes(1);

            expect(apiFetch).toHaveBeenCalledWith(
                "/auth/register",
                {
                    method: "POST",
                    body: datos
                }
            );

            expect(resultado).toEqual(usuarioPrueba);
        });

        test("propaga el error cuando el correo ya está registrado", async () => {
            const error = Object.assign(
                new Error("El correo electrónico ya está registrado"),
                {status: 409}
            );

            apiFetch.mockRejectedValue(error);

            await expect(
                registrarUsuario({
                    nombre: "Usuario Prueba",
                    email: "usuario@example.com",
                    password: "Password123"
                })
            ).rejects.toBe(error);
        });
    });

    describe("autenticarUsuario", () => {
        test("envía las credenciales y retorna el usuario y el token", async () => {
            const credenciales = {
                email: "usuario@example.com",
                password: "Password123"
            };

            const sesion = {
                usuario: usuarioPrueba,
                token: tokenPrueba
            };

            apiFetch.mockResolvedValue({
                status: "success",
                data: sesion
            });

            const resultado = await autenticarUsuario(credenciales);

            expect(apiFetch).toHaveBeenCalledTimes(1);

            expect(apiFetch).toHaveBeenCalledWith(
                "/auth/login",
                {
                    method: "POST",
                    body: credenciales
                }
            );

            expect(resultado).toEqual(sesion);
        });

        test("propaga el error cuando las credenciales son incorrectas", async () => {
            const error = Object.assign(
                new Error("Credenciales inválidas"),
                {status: 401}
            );

            apiFetch.mockRejectedValue(error);

            await expect(
                autenticarUsuario({
                    email: "usuario@example.com",
                    password: "PasswordIncorrecta"
                })
            ).rejects.toBe(error);
        });
    });

    describe("obtenerUsuarioAutenticado", () => {
        test("envía el token mediante Authorization Bearer y retorna el usuario", async () => {
            apiFetch.mockResolvedValue({
                status: "success",
                data: usuarioPrueba
            });

            const resultado = await obtenerUsuarioAutenticado(tokenPrueba);

            expect(apiFetch).toHaveBeenCalledTimes(1);

            expect(apiFetch).toHaveBeenCalledWith(
                "/auth/me",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${tokenPrueba}`
                    }
                }
            );

            expect(resultado).toEqual(usuarioPrueba);
        });

        test("propaga el error cuando el token es inválido o está vencido", async () => {
            const error = Object.assign(
                new Error("Token inválido o vencido"),
                {status: 401}
            );

            apiFetch.mockRejectedValue(error);

            await expect(
                obtenerUsuarioAutenticado(tokenPrueba)
            ).rejects.toBe(error);
        });
    });
});
