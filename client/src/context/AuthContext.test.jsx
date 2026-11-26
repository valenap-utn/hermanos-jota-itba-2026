import {act, render, renderHook, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {AuthProvider, useAuth} from "./AuthContext";

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

describe("AuthContext", () => {
    describe("Estado inicial", () => {
        test("inicializa el contexto sin una sesión autenticada", () => {
            const {result} = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            expect(result.current.usuario).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe("Inicio de sesión", () => {
        test("almacena el usuario y el token y actualiza la autenticación", () => {
            const {result} = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(
                    usuarioPrueba,
                    tokenPrueba
                );
            });

            expect(result.current.usuario).toEqual(usuarioPrueba);
            expect(result.current.token).toBe(tokenPrueba);
            expect(result.current.isAuthenticated).toBe(true);
        });

        test("actualiza el usuario y el token de manera sincronizada", () => {
            const {result} = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(
                    usuarioPrueba,
                    tokenPrueba
                );
            });

            act(() => {
                result.current.iniciarSesion(
                    administradorPrueba,
                    tokenAdministrador
                );
            });

            expect(result.current.usuario).toEqual(administradorPrueba);
            expect(result.current.token).toBe(tokenAdministrador);
            expect(result.current.isAuthenticated).toBe(true);
        });

        test.each([
            ["sin token", usuarioPrueba, null],
            ["sin usuario", null, tokenPrueba]
        ])("no considera autenticada una sesión %s", (_, usuario, token) => {
            const {result} = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(usuario, token);
            });

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe("Cierre de sesión", () => {
        test("elimina el usuario y el token y actualiza la autenticación", () => {
            const {result} = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(
                    usuarioPrueba,
                    tokenPrueba
                );
            });

            act(() => {
                result.current.cerrarSesion();
            });

            expect(result.current.usuario).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });

        test("permite cerrar sesión sin una sesión autenticada", () => {
            const {result} = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.cerrarSesion();
            });

            expect(result.current.usuario).toBeNull();
            expect(result.current.token).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe("Hook useAuth", () => {
        test("lanza un error cuando se utiliza fuera de AuthProvider", () => {
            expect(() => {
                renderHook(() => useAuth());
            }).toThrow(
                "useAuth debe ser utilizado dentro de un AuthProvider"
            );
        });
    });

    describe("Estado compartido", () => {
        test("propaga el inicio y cierre de sesión entre múltiples consumidores", () => {
            function ConsumidorA() {
                const {iniciarSesion, cerrarSesion} = useAuth();

                return (
                    <>
                        <button
                            onClick={() =>
                                iniciarSesion(usuarioPrueba, tokenPrueba)
                            }
                        >
                            Iniciar sesión
                        </button>

                        <button onClick={cerrarSesion}>
                            Cerrar sesión
                        </button>
                    </>
                );
            }

            function ConsumidorB() {
                const {usuario, isAuthenticated} = useAuth();

                return (
                    <div>
                        {isAuthenticated
                            ? usuario.nombre
                            : "Sin sesión"}
                    </div>
                );
            }

            render(
                <AuthProvider>
                    <ConsumidorA/>
                    <ConsumidorB/>
                </AuthProvider>
            );

            expect(
                screen.getByText("Sin sesión")
            ).toBeInTheDocument();

            act(() => {
                screen.getByRole("button", {
                    name: "Iniciar sesión"
                }).click();
            });

            expect(
                screen.getByText("Usuario Prueba")
            ).toBeInTheDocument();

            expect(
                screen.queryByText("Sin sesión")
            ).not.toBeInTheDocument();

            act(() => {
                screen.getByRole("button", {
                    name: "Cerrar sesión"
                }).click();
            });

            expect(
                screen.getByText("Sin sesión")
            ).toBeInTheDocument();

            expect(
                screen.queryByText("Usuario Prueba")
            ).not.toBeInTheDocument();
        });
    });
});
