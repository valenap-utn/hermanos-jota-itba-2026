import {act, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AuthForm from "./AuthForm";

jest.mock("react-router-dom", () => ({
    Link: ({ to, children, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    )
}));

function renderizarFormulario(modo, onSubmit = jest.fn()) {
    render(
        <AuthForm
            modo={modo}
            onSubmit={onSubmit}
        />
    );

    return { onSubmit };
}

function completarLogin({
                            email = "usuario@example.com",
                            password = "Password123"
                        } = {}) {
    userEvent.type(
        screen.getByLabelText("Correo electrónico"),
        email
    );

    userEvent.type(
        screen.getByLabelText("Contraseña", {exact: true}),
        password
    );
}

function completarRegistro({
                               nombre = "Juan Pérez",
                               email = "usuario@example.com",
                               password = "Password123",
                               confirmarPassword = password
                           } = {}) {
    userEvent.type(
        screen.getByLabelText("Nombre completo"),
        nombre
    );

    completarLogin({email, password});

    userEvent.type(
        screen.getByLabelText("Confirmar contraseña"),
        confirmarPassword
    );
}

describe("AuthForm", () => {
    describe("Login", () => {
        test("impide el envío cuando los campos son inválidos", async () => {
            const {onSubmit} = renderizarFormulario("login");

            userEvent.click(
                screen.getByRole("button", {
                    name: "Iniciar sesión"
                })
            );

            expect(
                await screen.findByText(
                    "Ingresá tu correo electrónico."
                )
            ).toBeInTheDocument();

            expect(
                screen.getByText("Ingresá tu contraseña.")
            ).toBeInTheDocument();

            expect(onSubmit).not.toHaveBeenCalled();
        });

        test("envía las credenciales válidas y normalizadas", async () => {
            const {onSubmit} = renderizarFormulario("login");

            completarLogin({
                email: "USUARIO@EXAMPLE.COM"
            });

            userEvent.click(
                screen.getByRole("button", {
                    name: "Iniciar sesión"
                })
            );

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledTimes(1);

                expect(onSubmit).toHaveBeenCalledWith({
                    email: "usuario@example.com",
                    password: "Password123"
                });
            });
        });
    });

    describe("Registro", () => {
        test("envía los datos válidos sin incluir la confirmación de contraseña", async () => {
            const {onSubmit} = renderizarFormulario("registro");

            completarRegistro();

            userEvent.click(
                screen.getByRole("button", {
                    name: "Crear cuenta"
                })
            );

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledTimes(1);

                expect(onSubmit).toHaveBeenCalledWith({
                    nombre: "Juan Pérez",
                    email: "usuario@example.com",
                    password: "Password123"
                });
            });
        });

        test("impide el envío cuando las contraseñas no coinciden", async () => {
            const {onSubmit} = renderizarFormulario("registro");

            completarRegistro({
                confirmarPassword: "OtraPassword123"
            });

            userEvent.click(
                screen.getByRole("button", {
                    name: "Crear cuenta"
                })
            );

            expect(
                await screen.findByText(
                    "Las contraseñas no coinciden."
                )
            ).toBeInTheDocument();

            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe("Comportamiento compartido", () => {
        test("muestra los errores de envío y permite reintentar", async () => {
            const onSubmit = jest
                .fn()
                .mockRejectedValueOnce(
                    new Error("No se pudo procesar la solicitud.")
                )
                .mockResolvedValueOnce(undefined);

            renderizarFormulario("login", onSubmit);

            completarLogin();

            const boton = screen.getByRole("button", {
                name: "Iniciar sesión"
            });

            userEvent.click(boton);

            expect(
                await screen.findByText(
                    "No se pudo procesar la solicitud."
                )
            ).toBeInTheDocument();

            await waitFor(() => {
                expect(boton).toBeEnabled();
            });

            userEvent.click(boton);

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledTimes(2);

                expect(
                    screen.queryByText(
                        "No se pudo procesar la solicitud."
                    )
                ).not.toBeInTheDocument();
            });
        });

        test("deshabilita el formulario mientras procesa una solicitud", async () => {
            let resolverSolicitud;

            const solicitud = new Promise((resolve) => {
                resolverSolicitud = resolve;
            });

            const onSubmit = jest.fn(() => solicitud);

            renderizarFormulario("login", onSubmit);

            completarLogin();

            userEvent.click(
                screen.getByRole("button", {
                    name: "Iniciar sesión"
                })
            );

            const botonProcesando = await screen.findByRole(
                "button",
                {name: "Procesando..."}
            );

            expect(botonProcesando).toBeDisabled();

            expect(
                screen.getByLabelText("Correo electrónico")
            ).toBeDisabled();

            expect(
                screen.getByLabelText("Contraseña", {exact: true})
            ).toBeDisabled();

            userEvent.click(botonProcesando);

            expect(onSubmit).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolverSolicitud();
            });

            await waitFor(() => {
                expect(
                    screen.getByRole("button", {
                        name: "Iniciar sesión"
                    })
                ).toBeEnabled();
            });
        });

        test("permite mostrar y ocultar la contraseña sin modificar su valor", () => {
            renderizarFormulario("login");

            const campo = screen.getByLabelText(
                "Contraseña",
                {exact: true}
            );

            userEvent.type(campo, "Password123");

            expect(campo).toHaveAttribute("type", "password");

            userEvent.click(
                screen.getByRole("button", {
                    name: "Mostrar contraseña"
                })
            );

            expect(campo).toHaveAttribute("type", "text");
            expect(campo).toHaveValue("Password123");

            userEvent.click(
                screen.getByRole("button", {
                    name: "Ocultar contraseña"
                })
            );

            expect(campo).toHaveAttribute("type", "password");
            expect(campo).toHaveValue("Password123");
        });
    });
});
