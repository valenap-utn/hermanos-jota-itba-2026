import {useEffect, useId, useRef, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {ChevronDown, CircleAlert, LogOut, UserRound} from "lucide-react";

import {CODIGOS_ERROR_SESION, useAuth} from "../../context/AuthContext";

import {useToast} from "../../context/ToastContext";
import "./MenuCuenta.styles.css";

function AvisoSesion({onCerrar}) {
    const {
        errorSesion,
        restaurarSesion,
        cerrarSesion
    } = useAuth();

    const {mostrarToast} = useToast();

    if (!errorSesion) return null;

    const esRecuperacion =
        errorSesion.codigo === CODIGOS_ERROR_SESION.RECUPERACION;

    const esPersistencia =
        errorSesion.codigo === CODIGOS_ERROR_SESION.PERSISTENCIA;

    const esEliminacion =
        errorSesion.codigo === CODIGOS_ERROR_SESION.ELIMINACION;

    const titulo = esRecuperacion
        ? "No pudimos recuperar tu sesión"
        : esPersistencia
            ? "Sesión temporal"
            : "Cierre de sesión incompleto";

    const reintentarRecuperacion = () => {
        onCerrar();
        restaurarSesion();
    };

    const reintentarEliminacion = () => {
        const eliminado = cerrarSesion();

        if (eliminado) {
            onCerrar();

            mostrarToast(
                "Cerraste sesión correctamente.",
                "success"
            );
        }
    };

    return (
        <div className="menu-cuenta__aviso">
            <div className="menu-cuenta__aviso-titulo">
                <CircleAlert size={16} aria-hidden="true"/>
                <span>{titulo}</span>
            </div>

            <p className="menu-cuenta__aviso-mensaje">
                {errorSesion.mensaje}
            </p>

            {esRecuperacion && (
                <>
                    <button
                        type="button"
                        className="btn-marca-primario menu-cuenta__reintentar"
                        onClick={reintentarRecuperacion}
                    >
                        Reintentar
                    </button>

                    <NavLink
                        to="/login"
                        className="menu-cuenta__login-alternativo"
                        onClick={onCerrar}
                    >
                        Iniciar sesión
                    </NavLink>
                </>
            )}

            {esEliminacion && (
                <button
                    type="button"
                    className="btn-marca-primario menu-cuenta__reintentar"
                    onClick={reintentarEliminacion}
                >
                    Reintentar cierre
                </button>
            )}
        </div>
    );
}

export function PanelCuenta({onCerrar, id}) {
    const {
        usuario,
        cerrarSesion,
        errorSesion
    } = useAuth();

    const {mostrarToast} = useToast();
    const navigate = useNavigate();

    const manejarLogout = () => {
        onCerrar();

        const sesionEliminada = cerrarSesion();

        if (sesionEliminada) {
            mostrarToast(
                "Cerraste sesión correctamente.",
                "success"
            );
        } else {
            mostrarToast(
                "No se pudo eliminar la sesión almacenada. " +
                "Es posible que se recupere al recargar la página.",
                "error"
            );
        }

        navigate("/", {replace: true});
    };

    if (!usuario && !errorSesion) return null;

    const primerNombre = usuario
        ? usuario.nombre.trim().split(/\s+/)[0]
        : null;

    return (
        <div
            id={id}
            className="menu-cuenta__desplegable"
        >
            {usuario && (
                <div className="menu-cuenta__usuario">
                    <span className="menu-cuenta__saludo">
                        Hola, {primerNombre}
                    </span>

                    <span className="menu-cuenta__email">
                        {usuario.email}
                    </span>

                    {usuario.rol === "ADMIN" && (
                        <span className="menu-cuenta__rol">
                            Administrador
                        </span>
                    )}
                </div>
            )}

            {errorSesion && (
                <AvisoSesion onCerrar={onCerrar}/>
            )}

            {usuario && (
                <button
                    type="button"
                    className="menu-cuenta__logout"
                    onClick={manejarLogout}
                >
                    <LogOut size={16} aria-hidden="true"/>
                    Cerrar sesión
                </button>
            )}
        </div>
    );
}

function MenuCuenta({
                        mobile = false,
                        abiertoMobile = false,
                        onToggleMobile,
                        panelMobileId
                    }) {
    const {
        usuario,
        isAuthenticated,
        cargandoSesion,
        errorSesion
    } = useAuth();

    const [abiertoDesktop, setAbiertoDesktop] = useState(false);

    const menuRef = useRef(null);
    const botonRef = useRef(null);
    const menuId = useId();

    const abierto = mobile
        ? abiertoMobile
        : abiertoDesktop;

    const tienePanel =
        !cargandoSesion && (isAuthenticated || Boolean(errorSesion));

    useEffect(() => {
        if (mobile || !abiertoDesktop) return;

        const manejarClickExterior = (event) => {
            if (!menuRef.current?.contains(event.target)) {
                setAbiertoDesktop(false);
            }
        };

        const manejarEscape = (event) => {
            if (event.key === "Escape") {
                setAbiertoDesktop(false);
                botonRef.current?.focus();
            }
        };

        document.addEventListener(
            "pointerdown",
            manejarClickExterior
        );

        document.addEventListener(
            "keydown",
            manejarEscape
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                manejarClickExterior
            );

            document.removeEventListener(
                "keydown",
                manejarEscape
            );
        };
    }, [mobile, abiertoDesktop]);

    useEffect(() => {
        if (!tienePanel) {
            setAbiertoDesktop(false);
        }
    }, [tienePanel]);

    if (cargandoSesion) {
        return (
            <span
                className="cuenta-link cuenta-link--cargando"
                role="status"
                aria-label="Recuperando sesión"
            >
                <UserRound
                    size={20}
                    aria-hidden="true"
                />
            </span>
        );
    }

    if (!tienePanel) {
        return (
            <NavLink
                to="/login"
                className="cuenta-link"
                aria-label="Iniciar sesión"
            >
                <UserRound size={20} aria-hidden="true"/>
            </NavLink>
        );
    }

    const primerNombre = usuario
        ? usuario.nombre.trim().split(/\s+/)[0]
        : null;

    const etiquetaCuenta = usuario
        ? `Cuenta de ${usuario.nombre}`
        : "Cuenta";

    return (
        <div
            className="menu-cuenta"
            ref={menuRef}
        >
            <button
                ref={botonRef}
                type="button"
                className={`cuenta-link cuenta-link--autenticado${
                    abierto ? " active" : ""
                }`}
                aria-label={
                    errorSesion
                        ? `${etiquetaCuenta}. Advertencia de sesión`
                        : etiquetaCuenta
                }
                aria-expanded={abierto}
                aria-controls={
                    abierto
                        ? mobile
                            ? panelMobileId
                            : menuId
                        : undefined
                }
                onClick={
                    mobile
                        ? onToggleMobile
                        : () => setAbiertoDesktop((prev) => !prev)
                }
            >
                <UserRound size={20} aria-hidden="true"/>

                {primerNombre && (
                    <span className="menu-cuenta__nombre">
                        {primerNombre}
                    </span>
                )}

                {errorSesion && (
                    <CircleAlert
                        size={14}
                        className="menu-cuenta__indicador-error"
                        aria-hidden="true"
                    />
                )}

                <ChevronDown
                    size={14}
                    className={`menu-cuenta__flecha${
                        abierto ? " menu-cuenta__flecha--abierta" : ""
                    }`}
                    aria-hidden="true"
                />
            </button>

            {!mobile && abiertoDesktop && (
                <PanelCuenta
                    id={menuId}
                    onCerrar={() => setAbiertoDesktop(false)}
                />
            )}
        </div>
    );
}

export default MenuCuenta;
