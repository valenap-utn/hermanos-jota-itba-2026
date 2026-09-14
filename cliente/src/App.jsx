import {useState} from "react";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./vistas/Home/Home";

import "./App.css";


function App() {
    const [vistaActual, setVistaActual] = useState("home");
    const [carrito, setCarrito] = useState([]);

    const renderVista = () => {
        switch (vistaActual) {
            case "home":
                return (
                    <Home
                        /*productos={productos}*/
                        onNavigate={setVistaActual}
                        /*onSelectProducto={(producto) => {
                            setProductoSeleccionado(producto);
                            setVistaActual("producto");
                        }}*/
                    />
                );

            case "productos":
                return (
                    <section>
                        <h1>Productos</h1>
                        <p>Listado de productos</p>
                    </section>
                );
            // return <ProductList />

            case "contacto":
                return (
                    <section>
                        <h1>Contacto</h1>
                        <p>Formulario de contacto</p>
                    </section>
                );
            // return <ContactForm />

            case "carrito":
                return (
                    <section>
                        <h1>Carrito</h1>
                        <p>Productos agregados: {carrito.length}</p>
                    </section>
                );
            // return <Carrito carrito={carrito} />

            default:
                return null;
        }
    };

    return (
        <>
            <Header
                cartCount={carrito.length}
                onNavigate={setVistaActual}
            />

            <main id="main-content">
                {renderVista()}
            </main>

            <Footer/>
        </>
    );
}

export default App;
