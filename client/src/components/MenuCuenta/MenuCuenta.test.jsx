import {act, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import MenuCuenta, {PanelCuenta} from "./MenuCuenta";
import {AuthProvider, useAuth} from "../../context/AuthContext";
import {AUTH_TOKEN_KEY} from "../../utils/authStorage";
import {obtenerUsuarioAutenticado} from "../../services/authService";

const mockNavigate = jest.fn();
const mockMostrarToast = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    NavLink: ({to, children, ...props}) => (
        <a href={to} {...props}>{children}</a>
    )
}));

jest.mock("../../context/ToastContext", () => ({
    useToast: () => ({mostrarToast: mockMostrarToast})
}));

jest.mock("../../services/authService", () => ({
    obtenerUsuarioAutenticado: jest.fn()
}));

const usuarioPrueba = {
    _id: "507f1f77bcf86cd799439011",
    nombre: "Usuario Prueba",
    email: "usuario@example.com",
    rol: "CLIENTE"
};

const administradorPrueba = {
    ...usuarioPrueba,
    _id: "507f1f77bcf86cd799439012",
    nombre: "Administrador Prueba",
    email: "admin@example.com",
    rol: "ADMIN"
};

const tokenPrueba = "token-usuario-prueba";

// ===== FUNCIONES AUXILIARES =====

function ControlSesion({usuario}) {
    const {iniciarSesion, isAuthenticated, token} = useAuth();

    return (
        <>
            <button onClick={() => iniciarSesion(usuario, tokenPrueba)}>
                Simular login
            </button>

            <span data-testid="estado-sesion">
                {isAuthenticated ? "Autenticado" : "Sin sesión"}
            </span>

            <span data-testid="token-sesion">{token}</span>
        </>
    );
}

function renderizarMenu(usuario = usuarioPrueba, props = {}) {
    return render(
        <AuthProvider>
            <ControlSesion usuario={usuario}/>
            <MenuCuenta {...props}/>
            <button>Elemento exterior</button>
        </AuthProvider>
    );
}

const boton = (name) => screen.getByRole("button", {name});
const click = (name) => userEvent.click(boton(name));
const simularLogin = () => click("Simular login");

const obtenerBotonCuenta = (usuario = usuarioPrueba) =>
    boton(`Cuenta de ${usuario.nombre}`);

function abrirMenu(usuario = usuarioPrueba) {
    const cuenta = obtenerBotonCuenta(usuario);
    userEvent.click(cuenta);
    return cuenta;
}

function verificarMenu(cuenta, abierto) {
    expect(cuenta).toHaveAttribute("aria-expanded", String(abierto));
}

function verificarSesionCerrada() {
    expect(screen.getByTestId("estado-sesion")).toHaveTextContent("Sin sesión");
    expect(screen.getByTestId("token-sesion")).toBeEmptyDOMElement();
}

function simularErrorStorage(metodo) {
    jest.spyOn(Storage.prototype, metodo).mockImplementationOnce(() => {
        throw new Error("Almacenamiento no disponible");
    });
}

function almacenarToken() {
    localStorage.setItem(AUTH_TOKEN_KEY, tokenPrueba);
}

function abrirAdvertencia() {
    click(/Advertencia de sesión/);
}

beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
});

// ===== TESTS =====

describe("MenuCuenta", () => {
    describe("Estado de autenticación", () => {
        test("muestra el acceso al login cuando no existe una sesión", () => {
            renderizarMenu();

            expect(screen.getByRole("link", {name: "Iniciar sesión"}))
                .toHaveAttribute("href", "/login");

            expect(screen.queryByRole("button", {name: "Cerrar sesión"}))
                .not.toBeInTheDocument();
        });

        test("muestra el nombre del usuario cuando inicia sesión", () => {
            renderizarMenu();
            simularLogin();

            expect(obtenerBotonCuenta()).toHaveTextContent("Usuario");
            expect(screen.queryByRole("link", {name: "Iniciar sesión"}))
                .not.toBeInTheDocument();
        });

        test("muestra un indicador no interactivo durante la recuperación", async () => {
            almacenarToken();

            let resolver;
            obtenerUsuarioAutenticado.mockReturnValueOnce(
                new Promise(resolve => {
                    resolver = resolve;
                })
            );

            renderizarMenu();

            expect(screen.getByRole("status", {name: "Recuperando sesión"}))
                .toBeInTheDocument();

            expect(screen.queryByRole("link", {name: "Iniciar sesión"}))
                .not.toBeInTheDocument();

            await act(async () => resolver(usuarioPrueba));

            expect(obtenerBotonCuenta()).toBeInTheDocument();
            expect(screen.queryByRole("status")).not.toBeInTheDocument();
        });
    });

    describe("Menú desktop", () => {
        test("permite abrir y cerrar el desplegable", () => {
            renderizarMenu();
            simularLogin();

            const cuenta = obtenerBotonCuenta();
            verificarMenu(cuenta, false);

            userEvent.click(cuenta);
            verificarMenu(cuenta, true);

            expect(screen.getByText("Hola, Usuario")).toBeInTheDocument();
            expect(screen.getByText(usuarioPrueba.email)).toBeInTheDocument();
            expect(boton("Cerrar sesión")).toBeInTheDocument();

            const panelId = cuenta.getAttribute("aria-controls");
            expect(panelId).toBeTruthy();
            expect(document.getElementById(panelId)).toBeInTheDocument();

            userEvent.click(cuenta);
            verificarMenu(cuenta, false);

            expect(screen.queryByText("Hola, Usuario")).not.toBeInTheDocument();
        });

        test("cierra mediante Escape y devuelve el foco", () => {
            renderizarMenu();
            simularLogin();
            const cuenta = abrirMenu();

            act(() => boton("Cerrar sesión").focus());
            fireEvent.keyDown(document, {key: "Escape"});

            verificarMenu(cuenta, false);
            expect(cuenta).toHaveFocus();
            expect(screen.queryByRole("button", {name: "Cerrar sesión"}))
                .not.toBeInTheDocument();
        });

        test("cierra al hacer clic fuera del menú", () => {
            renderizarMenu();
            simularLogin();
            const cuenta = abrirMenu();

            fireEvent.pointerDown(boton("Elemento exterior"));

            verificarMenu(cuenta, false);
            expect(screen.queryByText("Hola, Usuario")).not.toBeInTheDocument();
        });

        test("permanece abierto al interactuar dentro del panel", () => {
            renderizarMenu();
            simularLogin();
            const cuenta = abrirMenu();

            fireEvent.pointerDown(screen.getByText(usuarioPrueba.email));

            verificarMenu(cuenta, true);
        });
    });

    describe("Roles de usuario", () => {
        test.each([
            ["ADMIN", administradorPrueba, true],
            ["CLIENTE", usuarioPrueba, false]
        ])("muestra correctamente el rol %s", (_, usuario, esAdmin) => {
            renderizarMenu(usuario);
            simularLogin();

            const cuenta = abrirMenu(usuario);
            const panel = document.getElementById(cuenta.getAttribute("aria-controls"));

            expect(panel).toBeInTheDocument();

            const etiqueta = within(panel).queryByText("Administrador", {exact: true});

            if (esAdmin) {
                expect(etiqueta).toBeInTheDocument();
            } else {
                expect(etiqueta).not.toBeInTheDocument();
            }
        });
    });

    describe("Cierre de sesión", () => {
        test("elimina la sesión, muestra un toast y redirige al Home", () => {
            renderizarMenu();
            simularLogin();
            abrirMenu();
            click("Cerrar sesión");

            verificarSesionCerrada();

            expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
            expect(screen.getByRole("link", {name: "Iniciar sesión"}))
                .toBeInTheDocument();

            expect(screen.queryByRole("button", {name: "Cerrar sesión"}))
                .not.toBeInTheDocument();

            expect(mockMostrarToast).toHaveBeenCalledWith(
                "Cerraste sesión correctamente.", "success"
            );

            expect(mockNavigate).toHaveBeenCalledWith("/", {replace: true});
        });
    });

    describe("Errores de sesión", () => {
        test("muestra una advertencia cuando falla la recuperación", async () => {
            almacenarToken();
            obtenerUsuarioAutenticado.mockRejectedValueOnce(new Error("Failed to fetch"));

            renderizarMenu();

            await screen.findByRole("button", {name: /Advertencia de sesión/});
            abrirAdvertencia();

            expect(screen.getByText("No pudimos recuperar tu sesión"))
                .toBeInTheDocument();

            expect(boton("Reintentar")).toBeInTheDocument();
            expect(screen.getByRole("link", {name: "Iniciar sesión"}))
                .toHaveAttribute("href", "/login");
        });

        test("recupera la sesión al presionar Reintentar", async () => {
            almacenarToken();

            obtenerUsuarioAutenticado
                .mockRejectedValueOnce(new Error("Failed to fetch"))
                .mockResolvedValueOnce(usuarioPrueba);

            renderizarMenu();

            await screen.findByRole("button", {name: /Advertencia de sesión/});
            abrirAdvertencia();
            click("Reintentar");

            await waitFor(() => {
                expect(obtenerBotonCuenta()).toBeInTheDocument();
            });

            expect(obtenerUsuarioAutenticado).toHaveBeenCalledTimes(2);
            expect(screen.queryByRole("button", {name: /Advertencia de sesión/}))
                .not.toBeInTheDocument();
        });

        test("informa cuando la sesión no puede persistirse", () => {
            renderizarMenu();
            simularErrorStorage("setItem");
            simularLogin();
            abrirAdvertencia();

            expect(screen.getByText("Sesión temporal")).toBeInTheDocument();
            expect(screen.getByText("Hola, Usuario")).toBeInTheDocument();
            expect(boton("Cerrar sesión")).toBeInTheDocument();
            expect(screen.getByTestId("estado-sesion")).toHaveTextContent("Autenticado");
        });

        test("informa cuando falla la eliminación del token", () => {
            renderizarMenu();
            simularLogin();
            abrirMenu();

            simularErrorStorage("removeItem");
            click("Cerrar sesión");

            verificarSesionCerrada();
            abrirAdvertencia();

            expect(screen.getByText("Cierre de sesión incompleto"))
                .toBeInTheDocument();

            expect(boton("Reintentar cierre")).toBeInTheDocument();
            expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(tokenPrueba);

            expect(mockMostrarToast).toHaveBeenCalledWith(
                expect.stringContaining("No se pudo eliminar"), "error"
            );
        });

        test("permite reintentar un cierre de sesión incompleto", () => {
            renderizarMenu();
            simularLogin();
            abrirMenu();

            simularErrorStorage("removeItem");
            click("Cerrar sesión");

            abrirAdvertencia();
            click("Reintentar cierre");

            verificarSesionCerrada();
            expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();

            expect(screen.getByRole("link", {name: "Iniciar sesión"}))
                .toBeInTheDocument();

            expect(mockMostrarToast).toHaveBeenLastCalledWith(
                "Cerraste sesión correctamente.", "success"
            );
        });
    });

    describe("Menú mobile", () => {
        test("delega la apertura y el cierre al componente padre", () => {
            const onToggleMobile = jest.fn();

            const props = {
                mobile: true,
                abiertoMobile: false,
                onToggleMobile,
                panelMobileId: "panel-mobile"
            };

            const {rerender} = renderizarMenu(usuarioPrueba, props);
            simularLogin();

            const cuenta = obtenerBotonCuenta();
            verificarMenu(cuenta, false);

            userEvent.click(cuenta);
            expect(onToggleMobile).toHaveBeenCalledTimes(1);
            verificarMenu(cuenta, false);

            rerender(
                <AuthProvider>
                    <ControlSesion usuario={usuarioPrueba}/>
                    <MenuCuenta {...props} abiertoMobile/>
                    <button>Elemento exterior</button>
                </AuthProvider>
            );

            verificarMenu(cuenta, true);
            expect(cuenta).toHaveAttribute("aria-controls", "panel-mobile");

            expect(screen.queryByRole("button", {name: "Cerrar sesión"}))
                .not.toBeInTheDocument();

            userEvent.click(cuenta);
            expect(onToggleMobile).toHaveBeenCalledTimes(2);
        });
    });
});

describe("PanelCuenta", () => {
    test("no muestra información sin usuario ni errores", () => {
        const {container} = render(
            <AuthProvider>
                <PanelCuenta onCerrar={jest.fn()}/>
            </AuthProvider>
        );

        expect(container).toBeEmptyDOMElement();
    });

    test("notifica al componente padre al cerrar sesión", () => {
        const onCerrar = jest.fn();

        render(
            <AuthProvider>
                <ControlSesion usuario={usuarioPrueba}/>
                <PanelCuenta id="panel-mobile" onCerrar={onCerrar}/>
            </AuthProvider>
        );

        simularLogin();
        expect(document.getElementById("panel-mobile")).toBeInTheDocument();

        click("Cerrar sesión");

        expect(onCerrar).toHaveBeenCalledTimes(1);
        verificarSesionCerrada();
        expect(document.getElementById("panel-mobile")).not.toBeInTheDocument();
    });
});
