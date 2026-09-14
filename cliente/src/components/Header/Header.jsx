import "./Header.styles.css";
import Logo from "../Logo/Logo";
import { ShoppingCart } from "lucide-react";

function Header({ cartCount = 0, onNavigate }) {
    const cartLabel = `Carrito, ${cartCount} ${
        cartCount === 1 ? "producto" : "productos"
    }`;

    const handleNavigation = (event, vista) => {
        event.preventDefault();
        onNavigate(vista);
    };

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
                            <a
                                className="navbar-brand"
                                href="/"
                                aria-label="Hermanos Jota - Inicio"
                                onClick={(event) =>
                                    handleNavigation(event, "home")
                                }
                            >
                                <Logo className="logo-primary" />
                            </a>

                            <span className="texto-titulo-elegante nombre-marca">
                                Hermanos Jota
                            </span>
                        </div>

                        {/* Acciones mobile */}
                        <div className="d-flex align-items-center ms-auto d-lg-none navbar-actions">
                            <a
                                href="/carrito"
                                className="carrito-link"
                                aria-label={cartLabel}
                                onClick={(event) =>
                                    handleNavigation(event, "carrito")
                                }
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
                            </a>

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
                                    <a
                                        href="/"
                                        className="nav-link"
                                        onClick={(event) =>
                                            handleNavigation(event, "home")
                                        }
                                    >
                                        Inicio
                                    </a>
                                </li>

                                <li className="nav-item">
                                    <a
                                        href="/productos"
                                        className="nav-link"
                                        onClick={(event) =>
                                            handleNavigation(
                                                event,
                                                "productos"
                                            )
                                        }
                                    >
                                        Productos
                                    </a>
                                </li>

                                <li className="nav-item">
                                    <a
                                        href="/contacto"
                                        className="nav-link"
                                        onClick={(event) =>
                                            handleNavigation(
                                                event,
                                                "contacto"
                                            )
                                        }
                                    >
                                        Contacto
                                    </a>
                                </li>

                                {/* Carrito desktop */}
                                <li className="nav-item d-none d-lg-flex align-items-center ms-lg-3">
                                    <a
                                        href="/carrito"
                                        className="carrito-link"
                                        aria-label={cartLabel}
                                        onClick={(event) =>
                                            handleNavigation(
                                                event,
                                                "carrito"
                                            )
                                        }
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
                                    </a>
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
