import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./vistas/Home/Home";
import ListaProductos from "./vistas/Productos/ListaProductos";
import DetalleProducto from "./vistas/DetalleProducto/DetalleProducto";
import Contacto from "./vistas/Contacto/Contacto";
import Carrito from "./vistas/Carrito/Carrito";

function App() {
    const [carrito, setCarrito] = useState([]);

    const cartCount = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    const handleAgregarAlCarrito = (producto) => {
        setCarrito((prevCarrito) => {
            const itemExistente = prevCarrito.find((item) => item.id === producto.id);
            if (itemExistente) {
                return prevCarrito.map((item) =>
                    item.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prevCarrito, { ...producto, cantidad: 1 }];
        });
    };

    const handleModificarCantidad = (id, delta) => {
        setCarrito((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
            )
        );
    };

    const handleEliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <>
            <Header
                cartCount={cartCount}
            />

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
                                onAgregarAlCarrito={handleAgregarAlCarrito}
                            />
                        }
                    />

                    <Route
                        path="/productos/:id"
                        element={
                            <DetalleProducto onAgregarAlCarrito={handleAgregarAlCarrito} />
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
                                onModificarCantidad={handleModificarCantidad}
                                onEliminarDelCarrito={handleEliminarDelCarrito}
                            />
                        }
                    />
                </Routes>
            </main>

            <Footer/>
        </>
    );
}

export default App;
