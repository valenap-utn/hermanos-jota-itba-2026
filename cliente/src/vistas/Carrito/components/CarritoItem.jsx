import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

function CarritoItem({ item, onActualizarCantidad, onSolicitarEliminar, itemRef }) {
    const precioUnitario = item.precio > 0
        ? `$${item.precio.toLocaleString("es-AR")}`
        : "Precio a confirmar";

    return (
        <li className="carrito-item" ref={itemRef}>
            <Link
                to={`/productos/${item.id}`}
                className="carrito-item-imagen-link"
                aria-label={`Ver ${item.nombre}`}
            >
                <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="carrito-item-img"
                />
            </Link>

            <div className="carrito-item-info">
                <h2 className="carrito-item-nombre">
                    <Link to={`/productos/${item.id}`}>
                        {item.nombre}
                    </Link>
                </h2>

                <p className="carrito-item-precio">
                    {precioUnitario}
                </p>
            </div>

            <div className="carrito-item-actions">
                <div
                    className="carrito-cantidad"
                    role="group"
                    aria-label={`Cantidad de ${item.nombre}`}
                >
                    <button
                        type="button"
                        className="btn-cantidad"
                        disabled={item.cantidad <= 1}
                        onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}
                        aria-label={`Disminuir cantidad de ${item.nombre}`}
                    >
                        <Minus size={14} aria-hidden="true" />
                    </button>

                    <span className="carrito-cantidad-valor">
                        {item.cantidad}
                    </span>

                    <button
                        type="button"
                        className="btn-cantidad"
                        onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}
                        aria-label={`Aumentar cantidad de ${item.nombre}`}
                    >
                        <Plus size={14} aria-hidden="true" />
                    </button>
                </div>

                <button
                    type="button"
                    className="btn-eliminar-carrito"
                    onClick={() => onSolicitarEliminar(item)}
                    aria-label={`Eliminar ${item.nombre} del carrito`}
                >
                    <Trash2 size={18} aria-hidden="true" />
                </button>
            </div>
        </li>
    );
}

export default CarritoItem;
