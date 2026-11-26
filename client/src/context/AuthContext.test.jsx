import {act, render, renderHook, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import {AuthProvider, CODIGOS_ERROR_SESION, useAuth} from "./AuthContext";
import {AUTH_TOKEN_KEY} from "../utils/authStorage";
import {obtenerUsuarioAutenticado} from "../services/authService";

jest.mock("../services/authService", () => ({
    obtenerUsuarioAutenticado: jest.fn()
}));

const usuarioPrueba = {
    _id: "507f1f77bcf86cd799439011",
    nombre: "Usuario Prueba",
    email: "usuario@example.com",
    rol: "CLIENTE"
};

const administradorPrueba = {
    _id: "507f1f77bcf86cd799439012",
    nombre: "Administrador",
    email: "admin@example.com",
    rol: "ADMIN"
};

const tokenPrueba = "token-usuario-prueba";
const tokenAdministrador = "token-administrador-prueba";

// ===== FUNCIONES AUXILIARES =====

const renderizarAuth = () =>
    renderHook(() => useAuth(), {wrapper: AuthProvider});

const tokenAlmacenado = () =>
    localStorage.getItem(AUTH_TOKEN_KEY);

const almacenarToken = (token = tokenPrueba) =>
    localStorage.setItem(AUTH_TOKEN_KEY, token);

const iniciarSesion = (result, usuario = usuarioPrueba, token = tokenPrueba) =>
    act(() => result.current.iniciarSesion(usuario, token));

function cerrarSesion(result) {
    let eliminado;
    act(() => {
        eliminado = result.current.cerrarSesion();
    });
    return eliminado;
}

function verificarSesion(result, usuario = null, token = null) {
    expect(result.current.usuario).toEqual(usuario);
    expect(result.current.token).toBe(token);
    expect(result.current.isAuthenticated).toBe(Boolean(usuario && token));
    expect(result.current.cargandoSesion).toBe(false);
}

function simularErrorStorage(metodo) {
    jest.spyOn(Storage.prototype, metodo).mockImplementationOnce(() => {
        throw new Error("Almacenamiento no disponible");
    });
}

function verificarError(result, codigo) {
    expect(result.current.errorSesion).toEqual(
        expect.objectContaining({
            codigo,
            mensaje: expect.any(String)
        })
    );
}

function errorHTTP(status) {
    return Object.assign(new Error("Error HTTP"), {status});
}

function promesaPendiente() {
    let resolver, rechazar;
    const promesa = new Promise((resolve, reject) => {
        resolver = resolve;
        rechazar = reject;
    });
    return {promesa, resolver, rechazar};
}

function esperarRestauracion(result) {
    return waitFor(() =>
        expect(result.current.cargandoSesion).toBe(false)
    );
}

// ===== TESTS =====

describe("AuthContext", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        localStorage.clear();
    });

    describe("Estado inicial", () => {
        test("inicializa sin una sesión autenticada", () => {
            const {result} = renderizarAuth();

            verificarSesion(result);
            expect(result.current.errorSesion).toBeNull();
            expect(obtenerUsuarioAutenticado).not.toHaveBeenCalled();
        });
    });

    describe("Inicio de sesión", () => {
        test("actualiza el contexto y almacena el token", () => {
            const {result} = renderizarAuth();
            iniciarSesion(result);

            verificarSesion(result, usuarioPrueba, tokenPrueba);
            expect(tokenAlmacenado()).toBe(tokenPrueba);
            expect(result.current.errorSesion).toBeNull();
        });

        test("reemplaza una sesión existente", () => {
            const {result} = renderizarAuth();
            iniciarSesion(result);
            iniciarSesion(result, administradorPrueba, tokenAdministrador);

            verificarSesion(result, administradorPrueba, tokenAdministrador);
            expect(tokenAlmacenado()).toBe(tokenAdministrador);
        });

        test.each([
            ["sin token", usuarioPrueba, null],
            ["sin usuario", null, tokenPrueba]
        ])("rechaza una sesión %s", (_, usuario, token) => {
            const {result} = renderizarAuth();
            iniciarSesion(result);
            iniciarSesion(result, usuario, token);

            verificarSesion(result);
            expect(tokenAlmacenado()).toBeNull();
        });

        test("mantiene la sesión activa si falla la persistencia", () => {
            const {result} = renderizarAuth();
            simularErrorStorage("setItem");
            iniciarSesion(result);

            verificarSesion(result, usuarioPrueba, tokenPrueba);
            verificarError(result, CODIGOS_ERROR_SESION.PERSISTENCIA);
            expect(tokenAlmacenado()).toBeNull();
        });

        test("informa un error al eliminar el token de una sesión inválida", () => {
            const {result} = renderizarAuth();
            iniciarSesion(result);
            simularErrorStorage("removeItem");
            iniciarSesion(result, null, null);

            verificarSesion(result);
            verificarError(result, CODIGOS_ERROR_SESION.ELIMINACION);
            expect(tokenAlmacenado()).toBe(tokenPrueba);
        });
    });

    describe("Cierre de sesión", () => {
        test("elimina el contexto y el token almacenado", () => {
            const {result} = renderizarAuth();
            iniciarSesion(result);

            expect(cerrarSesion(result)).toBe(true);
            verificarSesion(result);
            expect(tokenAlmacenado()).toBeNull();
            expect(result.current.errorSesion).toBeNull();
        });

        test("permite cerrar sesión sin estar autenticado", () => {
            const {result} = renderizarAuth();

            expect(cerrarSesion(result)).toBe(true);
            verificarSesion(result);
            expect(result.current.errorSesion).toBeNull();
        });

        test("limpia el contexto aunque falle la eliminación del token", () => {
            const {result} = renderizarAuth();
            iniciarSesion(result);
            simularErrorStorage("removeItem");

            expect(cerrarSesion(result)).toBe(false);
            verificarSesion(result);
            verificarError(result, CODIGOS_ERROR_SESION.ELIMINACION);
            expect(tokenAlmacenado()).toBe(tokenPrueba);
        });

        test("permite reintentar la eliminación del token", () => {
            const {result} = renderizarAuth();
            iniciarSesion(result);
            simularErrorStorage("removeItem");

            expect(cerrarSesion(result)).toBe(false);
            expect(cerrarSesion(result)).toBe(true);

            verificarSesion(result);
            expect(tokenAlmacenado()).toBeNull();
            expect(result.current.errorSesion).toBeNull();
        });
    });

    describe("Restauración de sesión", () => {
        test("recupera una sesión almacenada", async () => {
            almacenarToken();
            obtenerUsuarioAutenticado.mockResolvedValueOnce(usuarioPrueba);

            const {result} = renderizarAuth();
            await esperarRestauracion(result);

            verificarSesion(result, usuarioPrueba, tokenPrueba);
            expect(obtenerUsuarioAutenticado).toHaveBeenCalledWith(tokenPrueba);
            expect(result.current.errorSesion).toBeNull();
        });

        test("mantiene el estado de carga durante la validación", async () => {
            almacenarToken();
            const pendiente = promesaPendiente();
            obtenerUsuarioAutenticado.mockReturnValueOnce(pendiente.promesa);

            const {result} = renderizarAuth();

            expect(result.current.cargandoSesion).toBe(true);
            expect(result.current.isAuthenticated).toBe(false);

            await act(async () => pendiente.resolver(usuarioPrueba));
            verificarSesion(result, usuarioPrueba, tokenPrueba);
        });

        test("mantiene la sesión al volver a montar el provider", async () => {
            const primera = renderizarAuth();
            iniciarSesion(primera.result);
            primera.unmount();

            obtenerUsuarioAutenticado.mockResolvedValueOnce(usuarioPrueba);

            const segunda = renderizarAuth();
            await esperarRestauracion(segunda.result);

            verificarSesion(segunda.result, usuarioPrueba, tokenPrueba);
            expect(obtenerUsuarioAutenticado).toHaveBeenCalledWith(tokenPrueba);
        });

        test("no restaura una sesión después del logout", () => {
            const primera = renderizarAuth();
            iniciarSesion(primera.result);
            cerrarSesion(primera.result);
            primera.unmount();

            const segunda = renderizarAuth();

            verificarSesion(segunda.result);
            expect(obtenerUsuarioAutenticado).not.toHaveBeenCalled();
        });

        test("elimina el token cuando el backend responde 401", async () => {
            almacenarToken();
            obtenerUsuarioAutenticado.mockRejectedValueOnce(errorHTTP(401));

            const {result} = renderizarAuth();
            await esperarRestauracion(result);

            verificarSesion(result);
            expect(tokenAlmacenado()).toBeNull();
            expect(result.current.errorSesion).toBeNull();
        });

        test("informa si no puede eliminar un token inválido", async () => {
            almacenarToken();
            simularErrorStorage("removeItem");
            obtenerUsuarioAutenticado.mockRejectedValueOnce(errorHTTP(401));

            const {result} = renderizarAuth();
            await esperarRestauracion(result);

            verificarSesion(result);
            verificarError(result, CODIGOS_ERROR_SESION.ELIMINACION);
            expect(tokenAlmacenado()).toBe(tokenPrueba);
        });

        test.each([
            ["error de conexión", new Error("Failed to fetch")],
            ["error del servidor", errorHTTP(500)]
        ])("conserva el token ante un %s", async (_, error) => {
            almacenarToken();
            obtenerUsuarioAutenticado.mockRejectedValueOnce(error);

            const {result} = renderizarAuth();
            await esperarRestauracion(result);

            verificarSesion(result);
            verificarError(result, CODIGOS_ERROR_SESION.RECUPERACION);
            expect(tokenAlmacenado()).toBe(tokenPrueba);
        });

        test("recupera la sesión al reintentar después de un error", async () => {
            almacenarToken();
            obtenerUsuarioAutenticado
                .mockRejectedValueOnce(new Error("Failed to fetch"))
                .mockResolvedValueOnce(usuarioPrueba);

            const {result} = renderizarAuth();
            await esperarRestauracion(result);

            verificarError(result, CODIGOS_ERROR_SESION.RECUPERACION);

            await act(async () => result.current.restaurarSesion());

            verificarSesion(result, usuarioPrueba, tokenPrueba);
            expect(result.current.errorSesion).toBeNull();
            expect(obtenerUsuarioAutenticado).toHaveBeenCalledTimes(2);
            expect(tokenAlmacenado()).toBe(tokenPrueba);
        });
    });

    describe("Condiciones de carrera", () => {
        test("ignora una restauración pendiente después del logout", async () => {
            almacenarToken();
            const pendiente = promesaPendiente();
            obtenerUsuarioAutenticado.mockReturnValueOnce(pendiente.promesa);

            const {result} = renderizarAuth();
            cerrarSesion(result);

            await act(async () => pendiente.resolver(usuarioPrueba));

            verificarSesion(result);
            expect(tokenAlmacenado()).toBeNull();
        });

        test.each(["respuesta exitosa", "error 401"])(
            "protege una nueva sesión ante una restauración anterior: %s",
            async (escenario) => {
                almacenarToken();
                const pendiente = promesaPendiente();
                obtenerUsuarioAutenticado.mockReturnValueOnce(pendiente.promesa);

                const {result} = renderizarAuth();
                iniciarSesion(result, administradorPrueba, tokenAdministrador);

                await act(async () => {
                    if (escenario === "error 401") {
                        pendiente.rechazar(errorHTTP(401));
                    } else {
                        pendiente.resolver(usuarioPrueba);
                    }
                });

                verificarSesion(result, administradorPrueba, tokenAdministrador);
                expect(tokenAlmacenado()).toBe(tokenAdministrador);
                expect(result.current.errorSesion).toBeNull();
            }
        );
    });

    describe("Hook useAuth", () => {
        test("lanza un error fuera de AuthProvider", () => {
            expect(() => renderHook(() => useAuth())).toThrow(
                "useAuth debe ser utilizado dentro de un AuthProvider"
            );
        });
    });

    describe("Estado compartido", () => {
        test("propaga los cambios entre múltiples consumidores", () => {
            function ConsumidorA() {
                const {iniciarSesion, cerrarSesion} = useAuth();

                return (
                    <>
                        <button onClick={() => iniciarSesion(usuarioPrueba, tokenPrueba)}>
                            Iniciar sesión
                        </button>
                        <button onClick={cerrarSesion}>Cerrar sesión</button>
                    </>
                );
            }

            function ConsumidorB() {
                const {usuario} = useAuth();
                return <div>{usuario?.nombre ?? "Sin sesión"}</div>;
            }

            render(
                <AuthProvider>
                    <ConsumidorA/>
                    <ConsumidorB/>
                </AuthProvider>
            );

            expect(screen.getByText("Sin sesión")).toBeInTheDocument();

            act(() => screen.getByRole("button", {name: "Iniciar sesión"}).click());
            expect(screen.getByText("Usuario Prueba")).toBeInTheDocument();
            expect(screen.queryByText("Sin sesión")).not.toBeInTheDocument();

            act(() => screen.getByRole("button", {name: "Cerrar sesión"}).click());
            expect(screen.getByText("Sin sesión")).toBeInTheDocument();
            expect(screen.queryByText("Usuario Prueba")).not.toBeInTheDocument();
        });
    });
});