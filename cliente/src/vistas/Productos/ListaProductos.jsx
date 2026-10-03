import { useState, useMemo, useEffect } from "react";
import "./ListaProductos.styles.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import { obtenerProductos } from "../../services/productosService";
import { Search, PackageOpen } from "lucide-react";

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparRegExp(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ListaProductos({ onAgregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 6;

  useEffect(() => {
    let activo = true;

    async function cargarProductos() {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerProductos();
        if (activo) setProductos(data);
      } catch (err) {
        if (activo)
          setError("No pudimos cargar el catálogo. Intentá nuevamente más tarde.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarProductos();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoria]);

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = normalizarTexto(busqueda);
    const regexBusqueda = textoBusqueda
      ? new RegExp(`\\b${escaparRegExp(textoBusqueda)}`, "i")
      : null;

    return productos.filter((producto) => {
      const coincideCategoria =
        categoria === "todos" || producto.categoria === categoria;

      const coincideBusqueda = regexBusqueda
        ? regexBusqueda.test(normalizarTexto(producto.nombre))
        : true;

      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, busqueda, categoria]);

  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  
  const productosPaginados = productosFiltrados.slice(
    indicePrimerProducto,
    indiceUltimoProducto
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  return (
    <section className="productos-section" aria-labelledby="productos-title">
      <div className="container">
        <div className="productos-header mb-4">
          <p className="productos-eyebrow texto-titulo-cta mb-2">Colección</p>
          <h1 id="productos-title" className="texto-titulo-elegante mb-3">Catálogo de Productos</h1>
          <p className="texto-principal">
            Explorá nuestra selección exclusiva de mobiliario y objetos de diseño.
          </p>
        </div>

        <div className="productos-filtros row g-3 align-items-center mb-5">
          <div className="col-12 col-md-7 col-lg-8">
            <div className="input-group">
              <span className="input-group-text border-end-0">
                <Search size={18} aria-hidden="true" />
              </span>
              <input
                type="search"
                className="form-control border-start-0"
                placeholder="Buscar por nombre..."
                aria-label="Buscar productos"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-5 col-lg-4">
            <select
              className="form-select"
              aria-label="Filtrar por categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="todos">Todas las categorías</option>
              <option value="living">Living</option>
              <option value="comedor">Comedor</option>
              <option value="dormitorio">Dormitorio</option>
              <option value="oficina">Oficina</option>
            </select>
          </div>
        </div>

        {cargando && (
          <div className="text-center my-5" role="status" aria-live="polite">
            <div className="spinner-border" aria-hidden="true" />
            <p className="texto-principal mt-3">Cargando productos...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="text-center my-5" role="alert">
            <p className="texto-principal">{error}</p>
          </div>
        )}

        {!cargando && !error && productosFiltrados.length === 0 && (
          <div className="productos-vacio text-center my-5">
            <PackageOpen size={48} className="mb-3" aria-hidden="true" />
            <h2 className="texto-titulo-elegante h4 mb-2">No se encontraron productos</h2>
            <p className="texto-principal">
              Intentá cambiar los términos de búsqueda o los filtros aplicados.
            </p>
          </div>
        )}

        <div className="visually-hidden" aria-live="polite" aria-atomic="true">
          {!cargando && !error && `Se encontraron ${productosFiltrados.length} productos`}
        </div>

        {!cargando && !error && productosPaginados.length > 0 && (
          <div className="row g-4">
            {productosPaginados.map((producto) => (
              <div key={producto.id} className="col-12 col-sm-6 col-lg-4">
                <ProductCard
                  producto={producto}
                  onAgregarAlCarrito={onAgregarAlCarrito}
                />
              </div>
            ))}
          </div>
        )}

        {!cargando && !error && totalPaginas > 1 && (
          <nav aria-label="Navegación de páginas de productos" className="mt-5">
            <ul className="pagination justify-content-center">
              
              <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(prev => prev - 1)}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </button>
              </li>

              {[...Array(totalPaginas)].map((_, index) => {
                const numeroPagina = index + 1;
                return (
                  <li
                    key={numeroPagina}
                    className={`page-item ${paginaActual === numeroPagina ? "active" : ""}`}
                    aria-current={paginaActual === numeroPagina ? "page" : undefined}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPaginaActual(numeroPagina)}
                    >
                      {numeroPagina}
                    </button>
                  </li>
                );
              })}

              <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPaginaActual(prev => prev + 1)}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </button>
              </li>

            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}

export default ListaProductos;