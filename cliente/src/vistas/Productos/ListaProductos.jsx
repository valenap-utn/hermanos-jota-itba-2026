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

function ListaProductos({ onAgregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");

  useEffect(() => {
    let activo = true;

    async function cargarProductos() {
      try {
        setCargando(true);
        setError(null);
        const data = await obtenerProductos();
        if (activo)
          setProductos(data);
      } catch (err) {
        if (activo)
          setError("No pudimos cargar el catálogo. Intentá nuevamente más tarde.");
      } finally {
        if (activo)
          setCargando(false);
      }
    }

    cargarProductos();

    // Evita actualizar el estado si el componente se desmontó antes de que la petición termine.
    return () => {
      activo = false;
    };
  }, []);

  const productosFiltrados = useMemo(() => {
    const textoBusqueda = normalizarTexto(busqueda);

    let regexBusqueda;
    try {
      regexBusqueda = new RegExp(`\\b${textoBusqueda}`, 'i');
    } catch (error) {
      regexBusqueda = null;
    }
    // El try/catch está para evitar errores por expresiones que no sean válidas para el regex, como un asterisco al principio.
    return productos.filter((producto) => {
      const coincideCategoria =
        categoria === "todos" || producto.categoria === categoria;

      let coincideBusqueda = true;
      if (textoBusqueda !== "") {
        const nombreNormalizado = normalizarTexto(producto.nombre);
        if (regexBusqueda) {
          coincideBusqueda = regexBusqueda.test(nombreNormalizado);
        } else {
          coincideBusqueda = nombreNormalizado.includes(textoBusqueda);
        }
      }
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, busqueda, categoria]);
  
  return (
    <section className="productos-section" aria-labelledby="productos-title">
      <div className="container">
        <div className="productos-header mb-4">
          <p className="productos-eyebrow texto-titulo-cta mb-2" id="productos-title">Colección</p>
          <h1 className="texto-titulo-elegante mb-3">Catálogo de Productos</h1>
          <p className="texto-principal">Explore nuestra selección exclusiva de mobiliario y objetos de diseño.</p>
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
            <h3 className="texto-titulo-elegante h4 mb-2">No se encontraron productos</h3>
            <p className="texto-principal">
              Intentá cambiar los términos de búsqueda o los filtros aplicados.
            </p>
          </div>
        )}

        <div
          className="visually-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          {!cargando && !error &&
            `Se encontraron ${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? "s" : ""}`}
        </div>

        {!cargando && !error && productosFiltrados.length > 0 && (
          <div className="row g-4">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="col-12 col-sm-6 col-lg-4">
                <ProductCard
                  producto={producto}
                  onAgregarAlCarrito={onAgregarAlCarrito}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ListaProductos;