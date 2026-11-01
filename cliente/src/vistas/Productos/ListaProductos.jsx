import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./ListaProductos.styles.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import { obtenerProductos } from "../../services/productosService";
import { obtenerCategorias } from "../../services/categoriasService";
import {
    Search,
    PackageOpen,
    Plus,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

function ListaProductos({ onAgregarAlCarrito }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoriaParam = searchParams.get("categoria") || "todos";
    const busquedaParam = searchParams.get("busqueda") || "";
    const paginaParam = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalProductos, setTotalProductos] = useState(0);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estado local para el input de búsqueda (permite tipear fluido con debounce hacia la URL)
    const [inputBusqueda, setInputBusqueda] = useState(busquedaParam);

    const productosPorPagina = 6;

    // Sincroniza el input local si la URL cambia por historial (botones Atrás / Adelante del navegador)
    useEffect(() => {
        setInputBusqueda(busquedaParam);
    }, [busquedaParam]);

    // Debounce al escribir: actualiza la URL tras 350 ms de inactividad
    useEffect(() => {
        if (inputBusqueda === busquedaParam) return;

        const timer = setTimeout(() => {
            const nuevosParams = new URLSearchParams(searchParams);
            const trimmed = inputBusqueda.trim();
            if (trimmed) {
                nuevosParams.set("busqueda", trimmed);
            } else {
                nuevosParams.delete("busqueda");
            }
            nuevosParams.delete("page"); // Resetea a página 1 al iniciar una búsqueda
            setSearchParams(nuevosParams);
        }, 350);

        return () => clearTimeout(timer);
    }, [inputBusqueda, busquedaParam, searchParams, setSearchParams]);

    // Carga de categorías una única vez al montar el componente
    useEffect(() => {
        let activo = true;

        async function cargarCategorias() {
            try {
                const data = await obtenerCategorias().catch(() => []);
                if (activo) setCategorias(data);
            } catch {
                // Si falla, categoriasDisponibles queda vacío
            }
        }

        cargarCategorias();

        return () => {
            activo = false;
        };
    }, []);

    // Consulta de productos paginados y filtrados directamente desde el backend
    useEffect(() => {
        let activo = true;

        async function cargarProductos() {
            try {
                setCargando(true);
                setError(null);

                const res = await obtenerProductos({
                    page: paginaParam,
                    limit: productosPorPagina,
                    categoria: categoriaParam,
                    busqueda: busquedaParam
                });

                if (activo) {
                    if (res && res.productos !== undefined) {
                        setProductos(res.productos);
                        setTotalPaginas(res.meta?.totalPages || 1);
                        setTotalProductos(res.meta?.total || 0);
                    } else if (Array.isArray(res)) {
                        setProductos(res);
                        setTotalPaginas(Math.ceil(res.length / productosPorPagina) || 1);
                        setTotalProductos(res.length);
                    }
                }
            } catch (err) {
                if (activo) {
                    setError("No pudimos cargar el catálogo. Intentá nuevamente más tarde.");
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarProductos();

        return () => {
            activo = false;
        };
    }, [categoriaParam, busquedaParam, paginaParam]);

    const categoriasDisponibles = useMemo(() => {
        const mapa = new Map();

        (categorias || []).forEach((cat) => {
            const nombre = typeof cat === "string" ? cat : cat.nombre;
            if (nombre && nombre.trim()) {
                const normalizado = nombre.trim().toLowerCase();
                if (!mapa.has(normalizado)) {
                    mapa.set(normalizado, nombre.trim());
                }
            }
        });

        return Array.from(mapa.entries())
            .map(([clave, nombreOriginal]) => ({
                id: clave,
                label: nombreOriginal.charAt(0).toUpperCase() + nombreOriginal.slice(1)
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [categorias]);

    const handleCambiarCategoria = (nuevaCat) => {
        const nuevosParams = new URLSearchParams(searchParams);
        if (nuevaCat && nuevaCat !== "todos") {
            nuevosParams.set("categoria", nuevaCat);
        } else {
            nuevosParams.delete("categoria");
        }
        nuevosParams.delete("page"); // Resetea a página 1 al cambiar de categoría
        setSearchParams(nuevosParams);
    };

    const handleCambiarPagina = (nuevaPagina) => {
        const nuevosParams = new URLSearchParams(searchParams);
        if (nuevaPagina > 1) {
            nuevosParams.set("page", String(nuevaPagina));
        } else {
            nuevosParams.delete("page"); // Página 1 limpia la URL
        }
        setSearchParams(nuevosParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <section className="productos-section" aria-labelledby="productos-title">
            <div className="container">
                <div className="productos-header mb-4">
                    <div className="productos-header__contenido">
                        <div>
                            <p className="productos-eyebrow texto-titulo-cta mb-2">
                                Colección
                            </p>

                            <h1
                                id="productos-title"
                                className="texto-titulo-elegante mb-3"
                            >
                                Catálogo de Productos
                            </h1>

                            <p className="texto-principal">
                                Explorá nuestra selección exclusiva de mobiliario
                                y objetos de diseño.
                            </p>
                        </div>

                        <Link
                            to="/admin/crear-producto"
                            className="productos-crear-link"
                        >
                            <Plus size={18} aria-hidden="true"/>
                            <span>Agregar producto</span>
                        </Link>
                    </div>
                </div>

                <div className="productos-filtros row g-3 align-items-center mb-5">
                    <div className="col-12 col-md-7 col-lg-8">
                        <div className="input-group">
                            <span className="input-group-text border-end-0">
                                <Search size={18} aria-hidden="true"/>
                            </span>
                            <input
                                type="search"
                                className="form-control border-start-0"
                                placeholder="Buscar por nombre o descripción..."
                                aria-label="Buscar productos"
                                value={inputBusqueda}
                                onChange={(e) => setInputBusqueda(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-5 col-lg-4">
                        <select
                            className="form-select"
                            aria-label="Filtrar por categoría"
                            value={categoriaParam}
                            onChange={(e) => handleCambiarCategoria(e.target.value)}
                        >
                            <option value="todos">Todas las categorías</option>
                            {categoriasDisponibles.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {cargando && (
                    <div className="text-center my-5" role="status" aria-live="polite">
                        <div className="spinner-border" aria-hidden="true"/>
                        <p className="texto-principal mt-3">Cargando productos...</p>
                    </div>
                )}

                {!cargando && error && (
                    <div className="text-center my-5" role="alert">
                        <p className="texto-principal">{error}</p>
                    </div>
                )}

                {!cargando && !error && productos.length === 0 && (
                    <div className="productos-vacio text-center my-5">
                        <PackageOpen size={48} className="mb-3" aria-hidden="true"/>
                        <h2 className="texto-titulo-elegante h4 mb-2">No se encontraron productos</h2>
                        <p className="texto-principal">
                            Intentá cambiar los términos de búsqueda o los filtros aplicados.
                        </p>
                    </div>
                )}

                <div className="visually-hidden" aria-live="polite" aria-atomic="true">
                    {!cargando && !error && `Se encontraron ${totalProductos} productos`}
                </div>

                {!cargando && !error && productos.length > 0 && (
                    <div className="row g-4">
                        {productos.map((producto) => (
                            <div key={producto._id} className="col-12 col-sm-6 col-lg-4">
                                <ProductCard
                                    producto={producto}
                                    onAgregarAlCarrito={onAgregarAlCarrito}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {!cargando && !error && totalPaginas > 1 && (
                    <nav
                        className="productos-paginacion mt-5"
                        aria-label="Paginación del catálogo"
                    >
                        <ul className="productos-paginacion__lista">
                            <li>
                                <button
                                    type="button"
                                    className="productos-paginacion__boton"
                                    onClick={() => handleCambiarPagina(paginaParam - 1)}
                                    disabled={paginaParam === 1}
                                    aria-label="Ir a la página anterior"
                                >
                                    <ChevronLeft size={20} aria-hidden="true" />
                                </button>
                            </li>

                            {Array.from({ length: totalPaginas }, (_, index) => {
                                const numeroPagina = index + 1;

                                return (
                                    <li key={numeroPagina}>
                                        <button
                                            type="button"
                                            className={`productos-paginacion__boton ${
                                                paginaParam === numeroPagina
                                                    ? "productos-paginacion__boton--activo"
                                                    : ""
                                            }`}
                                            onClick={() => handleCambiarPagina(numeroPagina)}
                                            aria-label={`Ir a la página ${numeroPagina}`}
                                            aria-current={
                                                paginaParam === numeroPagina ? "page" : undefined
                                            }
                                        >
                                            {numeroPagina}
                                        </button>
                                    </li>
                                );
                            })}

                            <li>
                                <button
                                    type="button"
                                    className="productos-paginacion__boton"
                                    onClick={() => handleCambiarPagina(paginaParam + 1)}
                                    disabled={paginaParam === totalPaginas}
                                    aria-label="Ir a la página siguiente"
                                >
                                    <ChevronRight size={20} aria-hidden="true" />
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