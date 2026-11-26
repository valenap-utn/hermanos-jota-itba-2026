import {useEffect, useId, useRef, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {ChevronDown, LogOut, UserRound} from "lucide-react";
import {useAuth} from "../../context/AuthContext";
import {useToast} from "../../context/ToastContext";
import "./MenuCuenta.styles.css";

export function PanelCuenta({onCerrar, id}) {
    const {usuario, cerrarSesion} = useAuth();
    const {mostrarToast} = useToast();
    const navigate = useNavigate();

    const manejarLogout = () => {
        onCerrar();
        cerrarSesion();

        mostrarToast(
            "Cerraste sesión correctamente.",
            "success"
        );

        navigate("/", {replace: true});
    };

    if (!usuario) return null;

    const primerNombre = usuario.nombre.trim().split(/\s+/)[0];

    return (
        <div
            id={id}
            className="menu-cuenta__desplegable"
        >
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

            <button
                type="button"
                className="menu-cuenta__logout"
                onClick={manejarLogout}
            >
                <LogOut size={16} aria-hidden="true"/>
                Cerrar sesión
            </button>
        </div>
    );
}

function MenuCuenta({
                        mobile = false,
                        abiertoMobile = false,
                        onToggleMobile,
                        panelMobileId
                    }) {
    const {usuario, isAuthenticated} = useAuth();

    const [abiertoDesktop, setAbiertoDesktop] = useState(false);

    const menuRef = useRef(null);
    const botonRef = useRef(null);
    const menuId = useId();

    const abierto = mobile ? abiertoMobile : abiertoDesktop;

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
        if (!isAuthenticated) {
            setAbiertoDesktop(false);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
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

    const primerNombre = usuario.nombre.trim().split(/\s+/)[0];

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
                aria-label={`Cuenta de ${usuario.nombre}`}
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

                <span className="menu-cuenta__nombre">
                    {primerNombre}
                </span>

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
