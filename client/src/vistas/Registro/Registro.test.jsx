import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Registro from "./Registro";
import {registrarUsuario} from "../../services/authService";

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
    registrarUsuario: jest.fn()
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

function completarFormulario() {
    userEvent.type(
        screen.getByLabelText(/^Nombre completo/i),
        "Usuario Prueba"
    );

    userEvent.type(
        screen.getByLabelText(/^Correo electrónico/i),
        "usuario@example.com"
    );

    userEvent.type(
        screen.getByLabelText(/^Contraseña/i),
        "Password123"
    );

    userEvent.type(
        screen.getByLabelText(/^Confirmar contraseña/i),
        "Password123"
    );

    userEvent.click(
        screen.getByRole("button", {
            name: "Crear cuenta"
        })
    );
}

describe("Registro", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("registra al usuario, muestra un toast y redirige al login", async () => {
        registrarUsuario.mockResolvedValue(usuarioPrueba);

        render(<Registro/>);

        completarFormulario();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                "/login",
                {replace: true}
            );
        });

        expect(registrarUsuario).toHaveBeenCalledTimes(1);

        expect(registrarUsuario).toHaveBeenCalledWith({
            nombre: "Usuario Prueba",
            email: "usuario@example.com",
            password: "Password123"
        });

        expect(mockMostrarToast).toHaveBeenCalledWith(
            "Tu cuenta fue creada correctamente. Ya podés iniciar sesión.",
            "success"
        );
    });

    test.each([
        [
            "correo electrónico duplicado",
            Object.assign(
                new Error("El correo electrónico ya está registrado"),
                {status: 409}
            )
        ],
        [
            "error de conexión",
            new Error("No se pudo conectar con el servidor")
        ]
    ])("muestra el error y permanece en el formulario ante %s", async (_, error) => {
        registrarUsuario.mockRejectedValue(error);

        render(<Registro/>);

        completarFormulario();

        expect(
            await screen.findByText(error.message)
        ).toBeInTheDocument();

        expect(mockMostrarToast).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();

        expect(
            screen.getByLabelText(/^Nombre completo/i)
        ).toHaveValue("Usuario Prueba");

        expect(
            screen.getByLabelText(/^Correo electrónico/i)
        ).toHaveValue("usuario@example.com");

        expect(
            screen.getByRole("button", {
                name: "Crear cuenta"
            })
        ).toBeEnabled();
    });
});
