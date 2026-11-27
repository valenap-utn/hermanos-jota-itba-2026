import {Route, Routes, useLocation} from "react-router-dom";
import "./App.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./vistas/Home/Home";
import ListaProductos from "./vistas/Productos/ListaProductos";
import DetalleProducto from "./vistas/DetalleProducto/DetalleProducto";
import Contacto from "./vistas/Contacto/Contacto";
import Carrito from "./vistas/Carrito/Carrito";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import CrearProducto from "./vistas/CrearProducto/CrearProducto";
import EditarProducto from "./vistas/EditarProducto/EditarProducto";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import Login from "./vistas/Login/Login";
import Registro from "./vistas/Registro/Registro";

function App() {
    const location = useLocation();

    return (
        <>
            <ScrollToTop/>
            <Header/>

            <ErrorBoundary resetKey={location.pathname}>
                <main id="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={<Home/>}
                        />

                        <Route
                            path="/productos"
                            element={<ListaProductos/>}
                        />

                        <Route
                            path="/productos/:id"
                            element={<DetalleProducto/>}
                        />

                        <Route
                            path="/contacto"
                            element={<Contacto/>}
                        />

                        <Route
                            path="/carrito"
                            element={<Carrito/>}
                        />

                        <Route
                            path="/login"
                            element={<Login/>}
                        />

                        <Route
                            path="/registro"
                            element={<Registro/>}
                        />

                        <Route
                            path="/admin/crear-producto"
                            element={<CrearProducto/>}
                        />

                        <Route
                            path="/admin/editar-producto/:id"
                            element={<EditarProducto/>}
                        />

                    </Routes>
                </main>
            </ErrorBoundary>

            <Footer/>
        </>
    );
}

export default App;
