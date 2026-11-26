import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Link} from "react-router-dom";
import {Eye, EyeOff} from "lucide-react";
import {loginSchema, registroSchema} from "../../schemas/authSchema";
import "./AuthForm.styles.css";

function CampoAuth({
                       nombre,
                       etiqueta,
                       tipo = "text",
                       placeholder,
                       autoComplete,
                       register,
                       error,
                       deshabilitado
                   }) {
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const esPassword = tipo === "password";
    const tipoInput = esPassword && mostrarPassword
        ? "text"
        : tipo;

    const id = `auth-${nombre}`;
    const errorId = `${id}-error`;

    return (
        <div className="auth-form__campo">
            <label
                htmlFor={id}
                className="auth-form__label"
            >
                {etiqueta}
            </label>

            <div className="auth-form__input-container">
                <input
                    {...register(nombre)}
                    id={id}
                    type={tipoInput}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`form-control rounded-0 p-3 bg-light border-0 texto-principal ${
                        esPassword ? "auth-form__input-password" : ""
                    }`}
                    disabled={deshabilitado}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    required
                />

                {esPassword && (
                    <button
                        type="button"
                        className="auth-form__toggle-password"
                        onClick={() =>
                            setMostrarPassword((prev) => !prev)
                        }
                        aria-label={
                            mostrarPassword
                                ? `Ocultar ${etiqueta.toLowerCase()}`
                                : `Mostrar ${etiqueta.toLowerCase()}`
                        }
                        aria-controls={id}
                        disabled={deshabilitado}
                    >
                        {mostrarPassword ? (
                            <EyeOff size={20} aria-hidden="true"/>
                        ) : (
                            <Eye size={20} aria-hidden="true"/>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p
                    id={errorId}
                    className="auth-form__error"
                    role="alert"
                >
                    {error.message}
                </p>
            )}
        </div>
    );
}

function AuthForm({modo = "login", onSubmit}) {
    const esRegistro = modo === "registro";

    const {
        register,
        handleSubmit,
        clearErrors,
        setError,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm({
        resolver: zodResolver(
            esRegistro ? registroSchema : loginSchema
        ),
        mode: "onSubmit",
        reValidateMode: "onChange",
        defaultValues: esRegistro
            ? {
                nombre: "",
                email: "",
                password: "",
                confirmarPassword: ""
            }
            : {
                email: "",
                password: ""
            }
    });

    const manejarSubmit = async (datos) => {
        clearErrors("root");

        try {
            const {confirmarPassword, ...payload} = datos;

            await onSubmit(payload);
        } catch (error) {
            setError("root", {
                type: "server",
                message:
                    error.message ||
                    "Ocurrió un error. Intentá nuevamente."
            });
        }
    };

    return (
        <section className="auth-form__pagina">
            <div className="auth-form__contenedor">

                <div className="auth-form__encabezado">
                    <h1 className="texto-titulo-elegante">
                        {esRegistro
                            ? "Crear cuenta"
                            : "Iniciar sesión"}
                    </h1>

                    <p className="texto-principal">
                        {esRegistro
                            ? "Completá tus datos para registrarte."
                            : "Ingresá tus datos para acceder a tu cuenta."}
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit(manejarSubmit)}
                    noValidate
                    aria-busy={isSubmitting}
                >
                    {esRegistro && (
                        <CampoAuth
                            nombre="nombre"
                            etiqueta="Nombre completo"
                            placeholder="Tu nombre"
                            autoComplete="name"
                            register={register}
                            error={errors.nombre}
                            deshabilitado={isSubmitting}
                        />
                    )}

                    <CampoAuth
                        nombre="email"
                        etiqueta="Correo electrónico"
                        tipo="email"
                        placeholder="nombre@email.com"
                        autoComplete="email"
                        register={register}
                        error={errors.email}
                        deshabilitado={isSubmitting}
                    />

                    <CampoAuth
                        nombre="password"
                        etiqueta="Contraseña"
                        tipo="password"
                        placeholder="Ingresá tu contraseña"
                        autoComplete={
                            esRegistro
                                ? "new-password"
                                : "current-password"
                        }
                        register={register}
                        error={errors.password}
                        deshabilitado={isSubmitting}
                    />

                    {esRegistro && (
                        <CampoAuth
                            nombre="confirmarPassword"
                            etiqueta="Confirmar contraseña"
                            tipo="password"
                            placeholder="Repetí tu contraseña"
                            autoComplete="new-password"
                            register={register}
                            error={errors.confirmarPassword}
                            deshabilitado={isSubmitting}
                        />
                    )}

                    {errors.root && (
                        <div
                            className="auth-form__error-envio"
                            role="alert"
                        >
                            {errors.root.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="texto-titulo-cta btn-marca-primario auth-form__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Procesando..."
                            : esRegistro
                                ? "Crear cuenta"
                                : "Iniciar sesión"}
                    </button>
                </form>

                <div className="auth-form__alternativa">
                    <p>
                        {esRegistro
                            ? "¿Ya tenés una cuenta?"
                            : "¿Todavía no tenés una cuenta?"}
                    </p>

                    <Link
                        to={esRegistro ? "/login" : "/registro"}
                    >
                        {esRegistro
                            ? "Iniciá sesión"
                            : "Registrate"}
                    </Link>
                </div>

            </div>
        </section>
    );
}

export default AuthForm;