import "./Header.styles.css";
import Logo from "../Logo/Logo";
import { ShoppingCart } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

function Header({ cartCount = 0 }) {
    const cartLabel = `Carrito, ${cartCount} ${
        cartCount === 1 ? "producto" : "productos"
    }`;

    return (
        <>
            <a href="#main-content" className="skip-link">
                Saltar al contenido principal
            </a>

            <header>
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
                                <Logo className="logo-primary" />
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
                                    className="cart-count"
                                    aria-hidden="true"
                                >
                                    {cartCount}
                                </span>
                            </Link>

                            {/* Menú hamburguesa */}
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarNav"
                                aria-controls="navbarNav"
                                aria-expanded="false"
                                aria-label="Abrir menú de navegación"
                            >
                                <span
                                    className="menu-icon"
                                    aria-hidden="true"
                                >
                                    <span />
                                    <span />
                                    <span />
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
                                        className={({ isActive }) =>
                                            `nav-link${isActive ? " active" : ""}`
                                        }
                                    >
                                        Inicio
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/productos"
                                        className={({ isActive }) =>
                                            `nav-link${isActive ? " active" : ""}`
                                        }
                                    >
                                        Productos
                                    </NavLink>
                                </li>

                                <li className="nav-item">
                                    <NavLink
                                        to="/contacto"
                                        className={({ isActive }) =>
                                            `nav-link${isActive ? " active" : ""}`
                                        }
                                    >
                                        Contacto
                                    </NavLink>
                                </li>

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
                                            className="cart-count"
                                            aria-hidden="true"
                                        >
                                            {cartCount}
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
}

export default Header;
