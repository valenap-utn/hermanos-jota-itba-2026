import {act, fireEvent, render, screen, within} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import MenuCuenta, {PanelCuenta} from "./MenuCuenta";
import {AuthProvider, useAuth} from "../../context/AuthContext";

const mockNavigate = jest.fn();
const mockMostrarToast = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    NavLink: ({to, children, ...props}) => (
        <a href={to} {...props}>
            {children}
        </a>
    )
}));

jest.mock("../../context/ToastContext", () => ({
    useToast: () => ({
        mostrarToast: mockMostrarToast
    })
}));

const usuarioPrueba = {
    _id: "507f1f77bcf86cd799439011",
    nombre: "Usuario Prueba",
    email: "usuario@example.com",
    rol: "CLIENTE"
};

const administradorPrueba = {
    _id: "507f1f77bcf86cd799439012",
    nombre: "Administrador Prueba",
    email: "admin@example.com",
    rol: "ADMIN"
};

const tokenPrueba = "token-usuario-prueba";

function ControlSesion({usuario}) {
    const {iniciarSesion, isAuthenticated, token} = useAuth();

    return (
        <>
            <button
                onClick={() => iniciarSesion(usuario, tokenPrueba)}
            >
                Simular login
            </button>

            <span data-testid="estado-sesion">
                {isAuthenticated ? "Autenticado" : "Sin sesión"}
            </span>

            <span data-testid="token-sesion">
                {token}
            </span>
        </>
    );
}

function renderizarMenu(usuario = usuarioPrueba, props = {}) {
    const resultado = render(
        <AuthProvider>
            <ControlSesion usuario={usuario}/>
            <MenuCuenta {...props} />
            <button>Elemento exterior</button>
        </AuthProvider>
    );

    return resultado;
}

function simularLogin() {
    userEvent.click(
        screen.getByRole("button", {
            name: "Simular login"
        })
    );
}

function obtenerBotonCuenta(usuario = usuarioPrueba) {
    return screen.getByRole("button", {
        name: `Cuenta de ${usuario.nombre}`
    });
}

describe("MenuCuenta", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("Estado de autenticación", () => {
        test("muestra el acceso al login cuando no existe una sesión", () => {
            renderizarMenu();

            expect(
                screen.getByRole("link", {
                    name: "Iniciar sesión"
                })
            ).toHaveAttribute("href", "/login");

            expect(
                screen.queryByRole("button", {
                    name: "Cerrar sesión"
                })
            ).not.toBeInTheDocument();
        });

        test("muestra el nombre del usuario cuando inicia sesión", () => {
            renderizarMenu();

            simularLogin();

            expect(
                obtenerBotonCuenta()
            ).toHaveTextContent("Usuario");

            expect(
                screen.queryByRole("link", {
                    name: "Iniciar sesión"
                })
            ).not.toBeInTheDocument();
        });
    });

    describe("Menú desktop", () => {
        test("permite abrir y cerrar el desplegable", () => {
            renderizarMenu();
            simularLogin();

            const boton = obtenerBotonCuenta();

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "false"
            );

            userEvent.click(boton);

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "true"
            );

            expect(
                screen.getByText("Hola, Usuario")
            ).toBeInTheDocument();

            expect(
                screen.getByText(usuarioPrueba.email)
            ).toBeInTheDocument();

            expect(
                screen.getByRole("button", {
                    name: "Cerrar sesión"
                })
            ).toBeInTheDocument();

            const panelId = boton.getAttribute("aria-controls");

            expect(panelId).toBeTruthy();

            expect(
                document.getElementById(panelId)
            ).toBeInTheDocument();

            userEvent.click(boton);

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "false"
            );

            expect(
                screen.queryByText("Hola, Usuario")
            ).not.toBeInTheDocument();
        });

        test("cierra el menú mediante Escape y devuelve el foco al botón", () => {
            renderizarMenu();
            simularLogin();

            const boton = obtenerBotonCuenta();

            userEvent.click(boton);

            act(() => {
                screen.getByRole("button", {
                    name: "Cerrar sesión"
                }).focus();
            });

            fireEvent.keyDown(document, {
                key: "Escape"
            });

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "false"
            );

            expect(boton).toHaveFocus();

            expect(
                screen.queryByRole("button", {
                    name: "Cerrar sesión"
                })
            ).not.toBeInTheDocument();
        });

        test("cierra el menú al hacer clic fuera del desplegable", () => {
            renderizarMenu();
            simularLogin();

            const boton = obtenerBotonCuenta();

            userEvent.click(boton);

            fireEvent.pointerDown(
                screen.getByRole("button", {
                    name: "Elemento exterior"
                })
            );

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "false"
            );

            expect(
                screen.queryByText("Hola, Usuario")
            ).not.toBeInTheDocument();
        });

        test("mantiene el menú abierto al interactuar dentro del panel", () => {
            renderizarMenu();
            simularLogin();

            const boton = obtenerBotonCuenta();

            userEvent.click(boton);

            fireEvent.pointerDown(
                screen.getByText(usuarioPrueba.email)
            );

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "true"
            );
        });
    });

    describe("Roles de usuario", () => {
        test.each([
            ["ADMIN", administradorPrueba, true],
            ["CLIENTE", usuarioPrueba, false]
        ])("muestra correctamente la información del rol %s", (_, usuario, esAdmin) => {
            renderizarMenu(usuario);
            simularLogin();

            userEvent.click(
                obtenerBotonCuenta(usuario)
            );

            const boton = obtenerBotonCuenta(usuario);

            const panel = document.getElementById(
                boton.getAttribute("aria-controls")
            );

            expect(panel).toBeInTheDocument();

            const etiquetaRol = within(panel).queryByText(
                "Administrador",
                {exact: true}
            );

            if (esAdmin) {
                expect(etiquetaRol).toBeInTheDocument();
            } else {
                expect(etiquetaRol).not.toBeInTheDocument();
            }
        });
    });

    describe("Cierre de sesión", () => {
        test("elimina la sesión, muestra un toast y redirige al Home", () => {
            renderizarMenu();
            simularLogin();

            userEvent.click(obtenerBotonCuenta());

            userEvent.click(
                screen.getByRole("button", {
                    name: "Cerrar sesión"
                })
            );

            expect(
                screen.getByTestId("estado-sesion")
            ).toHaveTextContent("Sin sesión");

            expect(
                screen.getByTestId("token-sesion")
            ).toBeEmptyDOMElement();

            expect(
                screen.getByRole("link", {
                    name: "Iniciar sesión"
                })
            ).toBeInTheDocument();

            expect(
                screen.queryByRole("button", {
                    name: "Cerrar sesión"
                })
            ).not.toBeInTheDocument();

            expect(mockMostrarToast).toHaveBeenCalledWith(
                "Cerraste sesión correctamente.",
                "success"
            );

            expect(mockNavigate).toHaveBeenCalledWith(
                "/",
                {replace: true}
            );
        });
    });

    describe("Menú mobile", () => {
        test("delega la apertura y el cierre al componente padre", () => {
            const onToggleMobile = jest.fn();

            const {rerender} = renderizarMenu(
                usuarioPrueba,
                {
                    mobile: true,
                    abiertoMobile: false,
                    onToggleMobile,
                    panelMobileId: "panel-mobile"
                }
            );

            simularLogin();

            const boton = obtenerBotonCuenta();

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "false"
            );

            userEvent.click(boton);

            expect(onToggleMobile).toHaveBeenCalledTimes(1);

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "false"
            );

            rerender(
                <AuthProvider>
                    <ControlSesion usuario={usuarioPrueba}/>

                    <MenuCuenta
                        mobile
                        abiertoMobile={true}
                        onToggleMobile={onToggleMobile}
                        panelMobileId="panel-mobile"
                    />

                    <button>Elemento exterior</button>
                </AuthProvider>
            );

            expect(boton).toHaveAttribute(
                "aria-expanded",
                "true"
            );

            expect(boton).toHaveAttribute(
                "aria-controls",
                "panel-mobile"
            );

            expect(
                screen.queryByRole("button", {
                    name: "Cerrar sesión"
                })
            ).not.toBeInTheDocument();

            userEvent.click(boton);

            expect(onToggleMobile).toHaveBeenCalledTimes(2);
        });
    });
});

describe("PanelCuenta", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("no muestra información cuando no existe un usuario", () => {
        const {container} = render(
            <AuthProvider>
                <PanelCuenta onCerrar={jest.fn()}/>
            </AuthProvider>
        );

        expect(container).toBeEmptyDOMElement();
    });

    test("notifica al componente padre cuando se cierra la sesión", () => {
        const onCerrar = jest.fn();

        render(
            <AuthProvider>
                <ControlSesion usuario={usuarioPrueba}/>

                <PanelCuenta
                    id="panel-mobile"
                    onCerrar={onCerrar}
                />
            </AuthProvider>
        );

        simularLogin();

        expect(
            document.getElementById("panel-mobile")
        ).toBeInTheDocument();

        userEvent.click(
            screen.getByRole("button", {
                name: "Cerrar sesión"
            })
        );

        expect(onCerrar).toHaveBeenCalledTimes(1);

        expect(
            screen.getByTestId("estado-sesion")
        ).toHaveTextContent("Sin sesión");

        expect(
            document.getElementById("panel-mobile")
        ).not.toBeInTheDocument();
    });
});
