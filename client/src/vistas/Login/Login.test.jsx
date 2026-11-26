import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Login from "./Login";
import {AuthProvider, useAuth} from "../../context/AuthContext";
import {autenticarUsuario} from "../../services/authService";

const mockNavigate = jest.fn();
const mockMostrarToast = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    Link: ({to, children, ...props}) => (
        <a href={to} {...props}>
            {children}
        </a>
    )
}));

jest.mock("../../services/authService", () => ({
    autenticarUsuario: jest.fn()
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

const tokenPrueba = "token-usuario-prueba";

function EstadoSesion() {
    const {usuario, token, isAuthenticated} = useAuth();

    return (
        <div>
            <span data-testid="estado-sesion">
                {isAuthenticated ? "Autenticado" : "Sin sesión"}
            </span>

            <span data-testid="usuario-sesion">
                {usuario?.nombre}
            </span>

            <span data-testid="token-sesion">
                {token}
            </span>
        </div>
    );
}

function renderizarLogin() {
    return render(
        <AuthProvider>
            <Login/>
            <EstadoSesion/>
        </AuthProvider>
    );
}

function completarFormulario() {
    userEvent.type(
        screen.getByLabelText(/^Correo electrónico/i),
        "usuario@example.com"
    );

    userEvent.type(
        screen.getByLabelText(/^Contraseña/i),
        "Password123"
    );

    userEvent.click(
        screen.getByRole("button", {
            name: "Iniciar sesión"
        })
    );
}

describe("Login", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("inicia sesión, actualiza el contexto, muestra un toast y redirige al Home", async () => {
        autenticarUsuario.mockResolvedValue({
            usuario: usuarioPrueba,
            token: tokenPrueba
        });

        renderizarLogin();

        expect(
            screen.getByTestId("estado-sesion")
        ).toHaveTextContent("Sin sesión");

        completarFormulario();

        expect(
            await screen.findByText("Autenticado")
        ).toBeInTheDocument();

        expect(autenticarUsuario).toHaveBeenCalledTimes(1);

        expect(autenticarUsuario).toHaveBeenCalledWith({
            email: "usuario@example.com",
            password: "Password123"
        });

        expect(
            screen.getByTestId("usuario-sesion")
        ).toHaveTextContent(usuarioPrueba.nombre);

        expect(
            screen.getByTestId("token-sesion")
        ).toHaveTextContent(tokenPrueba);

        expect(mockMostrarToast).toHaveBeenCalledWith(
            `¡Bienvenido/a, ${usuarioPrueba.nombre}!`,
            "success"
        );

        expect(mockNavigate).toHaveBeenCalledWith(
            "/",
            {replace: true}
        );
    });

    test.each([
        [
            "credenciales incorrectas",
            Object.assign(
                new Error("Credenciales inválidas"),
                {status: 401}
            )
        ],
        [
            "error de conexión",
            new Error("No se pudo conectar con el servidor")
        ]
    ])("muestra el error y mantiene la sesión cerrada ante %s", async (_, error) => {
        autenticarUsuario.mockRejectedValue(error);

        renderizarLogin();

        completarFormulario();

        expect(
            await screen.findByText(error.message)
        ).toBeInTheDocument();

        expect(
            screen.getByTestId("estado-sesion")
        ).toHaveTextContent("Sin sesión");

        expect(
            screen.getByTestId("usuario-sesion")
        ).toBeEmptyDOMElement();

        expect(
            screen.getByTestId("token-sesion")
        ).toBeEmptyDOMElement();

        expect(mockMostrarToast).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();

        expect(
            screen.getByRole("button", {
                name: "Iniciar sesión"
            })
        ).toBeEnabled();
    });
});
