import { useState, useRef, useEffect } from "react";
import "./ProductCard.styles.css";
import { ArrowRight, ShoppingCart, Check } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ producto, onAgregarAlCarrito }) {
  const [agregado, setAgregado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAgregar = (e) => {
    onAgregarAlCarrito(producto);
    setAgregado(true);

    // Si fue un clic de puntero, liberamos el foco para evitar el anillo visual persistente
    if (e?.detail > 0) {
      e.currentTarget.blur();
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAgregado(false);
    }, 1500);
  };

  const precio = producto.precio > 0
    ? `$${producto.precio.toLocaleString('es-AR')}`
    : 'Consultar precio';

  const labelBoton = agregado
    ? `${producto.nombre} añadido al carrito`
    : `Añadir ${producto.nombre} al carrito`;

  return (
    <article className="product-card">
      <figure className="product-card-figure">
        <img
          className="product-card-image"
          src={producto.imagen}
          alt={producto.nombre}
        />
      </figure>

      <div className="product-card-content">
        <p className="product-card-categoria texto-secundario-leyenda">
          {producto.categoria}
        </p>

        <h2 className="product-card-nombre">
          {producto.nombre}
        </h2>

        <div className="product-card-precio-row">
          <p className="product-card-precio">
            {precio}
          </p>

          {onAgregarAlCarrito && (
            <button
              type="button"
              className={`btn btn-marca-primario product-card-btn-carrito ${
                agregado ? "product-card-btn-carrito--agregado" : ""
              }`}
              aria-label={labelBoton}
              title={labelBoton}
              onClick={handleAgregar}
            >
              {agregado ? (
                <Check size={20} aria-hidden="true" />
              ) : (
                <ShoppingCart size={20} aria-hidden="true" />
              )}
            </button>
          )}

          <span role="status" className="visually-hidden">
            {agregado ? `${producto.nombre} se añadió a tu carrito` : ""}
          </span>
        </div>

        <Link
          to={`/productos/${producto.id}`}
          className="product-card-link texto-titulo-cta"
          aria-label={`Ver detalle de ${producto.nombre}`}
        >
          <span>Ver pieza</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;