import { Link } from "react-router-dom";
import { Armchair } from "lucide-react";

function CarritoVacio({ exploreRef }) {
    return (
        <div className="carrito-vacio">
            <span className="carrito-vacio-icono" aria-hidden="true">
                <Armchair size={52} strokeWidth={1.4} />
            </span>

            <h1 className="texto-titulo-elegante">
                Tu selección aún está vacía
            </h1>

            <p className="texto-principal">
                Redescubre el arte de vivir. Aún no has seleccionado
                ninguna pieza para tu hogar, pero nuestra colección te está
                esperando con muebles diseñados para perdurar.
            </p>

            <Link
                ref={exploreRef}
                to="/productos"
                className="btn-carrito-explorar texto-titulo-cta"
            >
                Explorar colección
            </Link>
        </div>
    );
}

export default CarritoVacio;
