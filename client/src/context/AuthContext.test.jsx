import { render, renderHook, act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuthProvider, useAuth } from "./AuthContext";

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

describe("AuthContext", () => {
    describe("Estado inicial", () => {
        test("inicializa el usuario como null", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            expect(result.current.usuario).toBeNull();
        });

        test("inicializa el estado de autenticación como false", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    describe("Inicio de sesión", () => {
        test("almacena los datos del usuario autenticado", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(usuarioPrueba);
            });

            expect(result.current.usuario).toEqual(usuarioPrueba);
        });

        test("actualiza el estado de autenticación a true", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(usuarioPrueba);
            });

            expect(result.current.isAuthenticated).toBe(true);
        });

        test("permite actualizar el usuario autenticado", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(usuarioPrueba);
            });

            act(() => {
                result.current.iniciarSesion(administradorPrueba);
            });

            expect(result.current.usuario).toEqual(administradorPrueba);
            expect(result.current.isAuthenticated).toBe(true);
        });
    });

    describe("Cierre de sesión", () => {
        test("elimina los datos del usuario y actualiza la autenticación", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.iniciarSesion(usuarioPrueba);
            });

            act(() => {
                result.current.cerrarSesion();
            });

            expect(result.current.usuario).toBeNull();
            expect(result.current.isAuthenticated).toBe(false);
        });

        test("permite cerrar sesión sin un usuario autenticado", () => {
            const { result } = renderHook(() => useAuth(), {
                wrapper: AuthProvider
            });

            act(() => {
                result.current.cerrarSesion();
            });

            expect(result.current.usuario).toBeNull();
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
        test("comparte el estado entre múltiples consumidores", () => {
            function ConsumidorA() {
                const { iniciarSesion } = useAuth();

                return (
                    <button
                        onClick={() => iniciarSesion(usuarioPrueba)}
                    >
                        Iniciar sesión
                    </button>
                );
            }

            function ConsumidorB() {
                const { usuario, isAuthenticated } = useAuth();

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
                    <ConsumidorA />
                    <ConsumidorB />
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
        });
    });
});