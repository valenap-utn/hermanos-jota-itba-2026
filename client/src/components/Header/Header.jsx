import {useEffect, useId, useRef, useState} from "react";
import "./Header.styles.css";
import Logo from "../Logo/Logo";
import {ShoppingCart} from "lucide-react";
import MenuCuenta, {PanelCuenta} from "../MenuCuenta/MenuCuenta";
import {Link, NavLink, useLocation} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";

function Header({cartCount = 0}) {
    const [isBumping, setIsBumping] = useState(false);
    const prevCountRef = useRef(cartCount);

    const [cuentaMobileAbierta, setCuentaMobileAbierta] = useState(false);

    const {isAuthenticated, cargandoSesion, errorSesion} = useAuth();

    const tienePanelCuenta =
        !cargandoSesion &&
        (isAuthenticated || Boolean(errorSesion));

    const location = useLocation();
    const panelMobileId = useId();
    const headerRef = useRef(null);

    useEffect(() => {
        setCuentaMobileAbierta(false);
    }, [
        location.pathname,
        isAuthenticated,
        tienePanelCuenta
    ]);

    useEffect(() => {
        if (!cuentaMobileAbierta) return;

        const manejarEscape = (event) => {
            if (event.key === "Escape") {
                setCuentaMobileAbierta(false);

                headerRef.current
                    ?.querySelector(".navbar-actions .cuenta-link")
                    ?.focus();
            }
        };

        const manejarClickExterior = (event) => {
            if (!headerRef.current?.contains(event.target)) {
                setCuentaMobileAbierta(false);
            }
        };

        const mediaQuery = window.matchMedia("(min-width: 992px)");

        const manejarResize = (event) => {
            if (event.matches) {
                setCuentaMobileAbierta(false);
            }
        };

        document.addEventListener("keydown", manejarEscape);
        document.addEventListener("pointerdown", manejarClickExterior);
        mediaQuery.addEventListener("change", manejarResize);

        return () => {
            document.removeEventListener("keydown", manejarEscape);
            document.removeEventListener("pointerdown", manejarClickExterior);
            mediaQuery.removeEventListener("change", manejarResize);
        };
    }, [cuentaMobileAbierta]);

    useEffect(() => {
        if (cartCount > 0 && cartCount !== prevCountRef.current) {
            setIsBumping(true);
            const timer = setTimeout(() => setIsBumping(false), 350);
            prevCountRef.current = cartCount;
            return () => clearTimeout(timer);
        }

        prevCountRef.current = cartCount;
    }, [cartCount]);

    const MAX_BADGE_COUNT = 99;

    const displayCount =
        cartCount > MAX_BADGE_COUNT
            ? `${MAX_BADGE_COUNT}+`
            : cartCount;

    const cartLabel = `Carrito, ${cartCount} ${
        cartCount === 1 ? "producto" : "productos"
    }`;

    return (
        <>
            <a href="#main-content" className="skip-link">
                Saltar al contenido principal
            </a>

            <header ref={headerRef}>
                <nav
                    className="navbar navbar-expand-lg navbar-hermanos-jota"
                    aria-label="Navegación principal"
                >
                    <div className="container">

                        {/* Logo y nombre */}
                        <div className="d-flex align-items-center marca-container">
                            <Link
                                className="navbar-brand"
                                to="/"
                                aria-label="Hermanos Jota - Inicio"
                            >
                                <Logo className="logo-primary"/>
                            </Link>

                            <span className="texto-titulo-elegante nombre-marca">
                                Hermanos Jota
                            </span>
                        </div>

                        {/* Acciones mobile */}
                        <div className="d-flex align-items-center ms-auto d-lg-none navbar-actions">

                            <Link
                                to="/carrito"
                                className="carrito-link"
                                aria-label={cartLabel}
                            >
                                <ShoppingCart
                                    size={18}
                                    aria-hidden="true"
                                />

                                <span
                                    className={`cart-count${isBumping ? " cart-count--bump" : ""}`}
                                    aria-hidden="true"
                                >
                                    {displayCount}
                                </span>
                            </Link>

                            <MenuCuenta
                                mobile
                                abiertoMobile={cuentaMobileAbierta}
                                onToggleMobile={() =>
                                    setCuentaMobileAbierta((prev) => !prev)
                                }
                                panelMobileId={panelMobileId}
                            />

                            {/* Menú hamburguesa */}
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarNav"
                                aria-controls="navbarNav"
                                aria-expanded="false"
                                aria-label="Abrir menú de navegación"
                                onClick={() => setCuentaMobileAbierta(false)}
                            >
                                <span
                                    className="menu-icon"
                                    aria-hidden="true"
                                >
                                    <span/>
                                    <span/>
                                    <span/>
                                </span>
                            </button>
                        </div>

                        {/* Navegación */}
                        <div
                            className="collapse navbar-collapse"
                            id="navbarNav"
                        >
                            <ul className="navbar-nav ms-auto align-items-lg-center">

                                <li className="nav-item">
                                    <NavLink
                                        to="/"
                                        end
                                        className={({isActive}) =>
                                            `nav-link${isActive ? " active" : ""}`
                                        }
                                    >
                                        Inicio
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/productos"
                                        className={({isActive}) =>
                                            `nav-link${isActive ? " active" : ""}`
                                        }
                                    >
                                        Productos
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/contacto"
                                        className={({isActive}) =>
                                            `nav-link${isActive ? " active" : ""}`
                                        }
                                    >
                                        Contacto
                                    </NavLink>
                                </li>

                                {/* Cuenta desktop */}
                                <li className="nav-item d-none d-lg-flex align-items-center ms-lg-3">
                                    <MenuCuenta/>
                                </li>

                                {/* Carrito desktop */}
                                <li className="nav-item d-none d-lg-flex align-items-center ms-lg-3">
                                    <Link
                                        to="/carrito"
                                        className="carrito-link"
                                        aria-label={cartLabel}
                                    >
                                        <ShoppingCart
                                            size={18}
                                            aria-hidden="true"
                                        />

                                        <span
                                            className={`cart-count${isBumping ? " cart-count--bump" : ""}`}
                                            aria-hidden="true"
                                        >
                                            {displayCount}
                                        </span>
                                    </Link>
                                </li>

                            </ul>
                        </div>
                    </div>
                </nav>

                {tienePanelCuenta && (
                    <div
                        id={panelMobileId}
                        className={`cuenta-panel-mobile d-lg-none${
                            cuentaMobileAbierta
                                ? " cuenta-panel-mobile--abierto"
                                : ""
                        }`}
                        inert={!cuentaMobileAbierta}
                        aria-hidden={!cuentaMobileAbierta}
                    >
                        <div className="cuenta-panel-mobile__contenido">
                            <PanelCuenta
                                onCerrar={() => setCuentaMobileAbierta(false)}
                            />
                        </div>
                    </div>
                )}

            </header>
        </>
    );
}

export default Header;