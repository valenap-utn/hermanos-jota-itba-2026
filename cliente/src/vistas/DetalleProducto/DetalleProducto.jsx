import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./DetalleProducto.styles.css";
import { obtenerProductoPorId } from "../../services/productosService";
import { ArrowLeft, ShoppingCart, Check, Minus, Plus } from "lucide-react";

function DetalleProducto({ onAgregarAlCarrito }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const decrementarCantidad = () => {
    setCantidad((prev) => Math.max(1, prev - 1));
  };

  const incrementarCantidad = () => {
    setCantidad((prev) => Math.min(99, prev + 1));
  };

  const handleAgregar = (e) => {
    if (!onAgregarAlCarrito || !producto) return;
    onAgregarAlCarrito(producto, cantidad);
    setAgregado(true);

    if (e?.detail > 0) {
      e.currentTarget.blur();
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAgregado(false);
    }, 1800);
  };

  useEffect(() => {
    let activo = true;

    async function cargarProducto() {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerProductoPorId(id);
        if (activo) setProducto(data);
      } catch (err) {
        if (activo) setError("No pudimos encontrar este producto. Puede que ya no esté disponible.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarProducto();

    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <section className="detalle-section">
        <div className="container text-center my-5" role="status" aria-live="polite">
          <div className="spinner-border" aria-hidden="true" />
          <p className="texto-principal mt-3">Cargando producto...</p>
        </div>
      </section>
    );
  }

  if (error || !producto) {
      return (
        <section className="detalle-section">
          <div className="container text-center my-5" role="alert">
            <h1 className="texto-titulo-elegante detalle-nombre">Producto no encontrado</h1>
            <p className="texto-principal mb-4">
              {error || "El producto que buscás no existe o no está disponible."}
            </p>
            <button
              type="button"
              className="detalle-btn-volver texto-titulo-cta"
              onClick={() => navigate("/productos")}
            >
              Volver al catálogo
            </button>
          </div>
        </section>
      );
  }

  return (
      <section className="detalle-section">
        <div className="container py-4 py-lg-5">
          <div className="detalle-topbar mb-4">
            <nav aria-label="Migas de pan" className="detalle-breadcrumb">
              <Link to="/productos">Productos</Link>
              {" / "}
              <span aria-current="page">{producto.nombre}</span>
            </nav>

            <Link to="/productos" className="detalle-volver texto-titulo-cta">
              <ArrowLeft size={16} aria-hidden="true" />
              Ir al catálogo
            </Link>
          </div>

          <article className="row g-4 g-lg-5">
            <div className="col-12 col-lg-7">
              <figure className="detalle-figura mb-0">
                <img className="detalle-imagen" src={producto.imagen} alt={producto.nombre} />
              </figure>
            </div>

            <div className="col-12 col-lg-5">
              <p className="detalle-categoria texto-secundario-leyenda mb-2">
                {producto.categoria}
              </p>

              <h1 className="texto-titulo-elegante detalle-nombre">{producto.nombre}</h1>

              <p className="detalle-precio texto-enfasis-editorial">
                {producto.precio > 0
                  ? `$${producto.precio.toLocaleString("es-AR")}`
                  : "Precio a confirmar"}
              </p>

              <p className="texto-principal detalle-descripcion">{producto.descripcion}</p>

              {onAgregarAlCarrito && (
                <div className="detalle-comprar-bloque mt-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <span className="detalle-cantidad-label texto-secundario-leyenda">
                      Cantidad:
                    </span>

                    <div
                      className="detalle-cantidad-selector"
                      role="group"
                      aria-label={`Seleccionar cantidad para ${producto.nombre}`}
                    >
                      <button
                        type="button"
                        className="detalle-btn-cantidad"
                        onClick={decrementarCantidad}
                        disabled={cantidad <= 1}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={16} aria-hidden="true" />
                      </button>

                      <span
                        className="detalle-cantidad-valor"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {cantidad}
                      </span>

                      <button
                        type="button"
                        className="detalle-btn-cantidad"
                        onClick={incrementarCantidad}
                        disabled={cantidad >= 99}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-marca-primario texto-titulo-cta rounded-0 w-100 py-3 d-flex align-items-center justify-content-center gap-2 detalle-btn-agregar ${
                      agregado ? "detalle-btn-agregar--agregado" : ""
                    }`}
                    aria-label={
                      agregado
                        ? `${cantidad} ${cantidad === 1 ? "unidad" : "unidades"} de ${producto.nombre} añadidas al carrito`
                        : `Añadir ${cantidad} ${cantidad === 1 ? "unidad" : "unidades"} de ${producto.nombre} al carrito`
                    }
                    onClick={handleAgregar}
                  >
                    {agregado ? (
                      <>
                        <Check size={18} aria-hidden="true" />
                        <span>
                          ¡{cantidad} {cantidad === 1 ? "unidad añadida" : "unidades añadidas"}!
                        </span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} aria-hidden="true" />
                        <span>Añadir al carrito</span>
                      </>
                    )}
                  </button>

                  <span role="status" className="visually-hidden">
                    {agregado
                      ? `Se ${cantidad === 1 ? "añadió 1 unidad" : `añadieron ${cantidad} unidades`} de ${producto.nombre} al carrito`
                      : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="col-12">
              <section className="detalle-specs mt-2 mt-lg-4">
                <h2 className="texto-titulo-elegante detalle-specs-titulo mb-3">
                  Detalles de fabricación
                </h2>
                <div className="table-responsive">
                  <table className="table detalle-tabla">
                    <caption className="visually-hidden">
                        Especificaciones técnicas de {producto.nombre}
                    </caption>
                    <tbody>
                        <tr>
                          <th scope="row">Medidas</th>
                          <td>{producto.medidas}</td>
                        </tr>
                        <tr>
                          <th scope="row">Materiales</th>
                          <td>{producto.materiales}</td>
                        </tr>
                        {Object.entries(producto.especificaciones || {}).map(
                          ([nombre, valor]) => (
                            <tr key={nombre}>
                              <th scope="row">{nombre}</th>
                              <td>{valor}</td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </article>
        </div>
      </section>
  );
}

export default DetalleProducto;