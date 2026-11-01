import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./vistas/Home/Home";
import ListaProductos from "./vistas/Productos/ListaProductos";
import DetalleProducto from "./vistas/DetalleProducto/DetalleProducto";
import Contacto from "./vistas/Contacto/Contacto";
import Carrito from "./vistas/Carrito/Carrito";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { useCart } from "./context/CartContext";
import CrearProducto from "./vistas/CrearProducto/CrearProducto";
import EditarProducto from "./vistas/EditarProducto/EditarProducto";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

function App() {
    const location = useLocation();
    const {
        carrito,
        cartCount,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        cargando,
        error: errorCarrito,
        reintentarSincronizacion
    } = useCart();

    return (
        <>
            <ScrollToTop />
            <Header
                cartCount={cartCount}
            />

            <ErrorBoundary resetKey={location.pathname}>
                <main id="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={<Home/>}
                        />
                        
                        <Route
                            path="/productos"
                            element={
                                <ListaProductos
                                    onAgregarAlCarrito={agregarAlCarrito}
                                />
                            }
                        />

                        <Route
                            path="/productos/:id"
                            element={
                                <DetalleProducto onAgregarAlCarrito={agregarAlCarrito} />
                            }
                        />

                        <Route
                            path="/contacto"
                            element={<Contacto/>}
                        />

                        <Route
                            path="/carrito"
                            element={
                                <Carrito
                                    carrito={carrito}
                                    onActualizarCantidad={actualizarCantidad}
                                    onEliminarDelCarrito={eliminarDelCarrito}
                                    onVaciarCarrito={vaciarCarrito}
                                    cargando={cargando}
                                    error={errorCarrito}
                                    onReintentar={reintentarSincronizacion}
                                />
                            }
                        />

                        <Route
                            path="/admin/crear-producto"
                            element={<CrearProducto/>}
                        />

                        <Route
                            path="/admin/editar-producto/:id"
                            element={<EditarProducto />}
                        />

                    </Routes>
                </main>
            </ErrorBoundary>

            <Footer/>
        </>
    );
}

export default App;
