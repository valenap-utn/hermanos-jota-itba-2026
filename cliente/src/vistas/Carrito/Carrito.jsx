import { Link } from "react-router-dom";
import { Armchair } from "lucide-react";
import CarritoItem from "../../components/CarritoItem/CarritoItem";
import "./Carrito.styles.css";

const formatearPrecio = (valor) =>
  valor > 0 ? `$${valor.toLocaleString("es-AR")}` : "A confirmar";

function Carrito({ carrito, onModificarCantidad, onEliminarDelCarrito }) {
  if (carrito.length === 0) {
    return (
      <section className="container carrito-vacio py-5 d-flex flex-column align-items-center justify-content-center text-center">
        <Armchair size={64} className="carrito-vacio-icono mb-3" aria-hidden="true" />
        <h1 className="texto-titulo-elegante mb-3">Tu selección aún está vacía</h1>
        <p className="texto-principal mb-4 mx-auto">
          Redescubre el arte de vivir. Aún no has seleccionado ninguna pieza para tu hogar, pero nuestra colección te está esperando con muebles diseñados para perdurar.
        </p>
        <Link
          to="/productos"
          className="btn btn-marca-primario texto-titulo-cta rounded-0 px-4 py-3"
        >
          Explorar colección
        </Link>
      </section>
    );
  }

  const totalGeneral = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  return (
    <section className="container py-4 py-lg-5" aria-labelledby="carrito-titulo">
      <h1 id="carrito-titulo" className="texto-titulo-elegante carrito-titulo mb-4">
        Tu carrito
      </h1>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-7">
          <ul className="list-unstyled d-grid gap-3 m-0">
            {carrito.map((item) => (
              <CarritoItem
                key={item.id}
                item={item}
                onModificarCantidad={onModificarCantidad}
                onEliminar={onEliminarDelCarrito}
              />
            ))}
          </ul>
        </div>

        <div className="col-12 col-xl-5">
          <aside className="carrito-resumen" aria-labelledby="carrito-resumen-titulo">
            <h2 id="carrito-resumen-titulo" className="texto-titulo-elegante carrito-resumen-titulo mb-3">
              Resumen de tu selección
            </h2>

            <div className="table-responsive">
              <table className="table carrito-tabla">
                <thead>
                  <tr>
                    <th scope="col">Producto</th>
                    <th scope="col">Cantidad</th>
                    <th scope="col">Precio unitario</th>
                    <th scope="col" className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.id}>
                      <th scope="row" className="carrito-tabla-producto">
                        {item.nombre}
                      </th>
                      <td>{item.cantidad}</td>
                      <td>{formatearPrecio(item.precio)}</td>
                      <td className="text-end">
                        {formatearPrecio(item.precio * item.cantidad)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              className="carrito-resumen-total d-flex justify-content-between align-items-center pt-3"
              aria-live="polite"
            >
              <span>Total general</span>
              <strong>{formatearPrecio(totalGeneral)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Carrito;
