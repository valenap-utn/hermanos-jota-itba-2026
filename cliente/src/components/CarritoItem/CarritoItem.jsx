import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import "./CarritoItem.styles.css";

function CarritoItem({ item, onModificarCantidad, onEliminar }) {
  return (
    <li className="carrito-item d-flex flex-wrap flex-md-nowrap align-items-center gap-3 p-3">
      <img src={item.imagen} alt="" className="carrito-item-img" />

      <h2 className="carrito-item-nombre flex-grow-1 m-0">
        <Link to={`/productos/${item.id}`}>{item.nombre}</Link>
      </h2>

      <div className="carrito-item-actions d-flex align-items-center gap-3 ms-auto">
        <div
          className="carrito-cantidad"
          role="group"
          aria-label={`Cantidad de ${item.nombre}`}
        >
          <button
            type="button"
            className="btn-cantidad"
            disabled={item.cantidad <= 1}
            onClick={() => onModificarCantidad(item.id, -1)}
            aria-label={`Disminuir cantidad de ${item.nombre}`}
          >
            <Minus size={16} aria-hidden="true" />
          </button>

          <span className="carrito-cantidad-valor">{item.cantidad}</span>

          <button
            type="button"
            className="btn-cantidad"
            onClick={() => onModificarCantidad(item.id, 1)}
            aria-label={`Aumentar cantidad de ${item.nombre}`}
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="btn-eliminar-carrito"
          onClick={() => onEliminar(item.id)}
          aria-label={`Eliminar ${item.nombre} del carrito`}
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export default CarritoItem;
