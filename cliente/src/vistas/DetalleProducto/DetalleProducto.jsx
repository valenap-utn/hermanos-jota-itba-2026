import {useEffect, useRef, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import "./DetalleProducto.styles.css";
import {useCart} from "../../context/CartContext";
import {useToast} from "../../context/ToastContext";
import {obtenerProductoPorId, eliminarProducto} from "../../services/productosService";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import ErrorState from "../../components/ErrorState/ErrorState";
import {ArrowLeft, Check, Minus, Pencil, Plus, ShoppingCart, Trash2} from "lucide-react";

function DetalleProducto({onAgregarAlCarrito}) {
    const {id} = useParams();
    const navigate = useNavigate();
    const {carrito = []} = useCart();
    const {mostrarToast} = useToast();

    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [tipoError, setTipoError] = useState(null); // 'NOT_FOUND' | 'SERVER_ERROR' | null
    const [cantidad, setCantidad] = useState(1);
    const [agregado, setAgregado] = useState(false);
    const timeoutRef = useRef(null);
    const {sincronizarProducto} = useCart();
    const [modalVisible, setModalVisible] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [errorEliminar, setErrorEliminar] = useState("");
    const [recarga, setRecarga] = useState(0);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const unidadesEnCarrito =
        carrito.find((item) => item.id === (producto?._id || id))?.cantidad || 0;
    const stockTotal = producto?.stock !== undefined ? producto.stock : 0;
    const stockDisponible = Math.max(0, stockTotal - unidadesEnCarrito);

    const decrementarCantidad = () => {
        setCantidad((prev) => Math.max(1, prev - 1));
    };

    const incrementarCantidad = () => {
        setCantidad((prev) => Math.min(stockDisponible, prev + 1));
    };

    const handleEliminar = async () => {
        setEliminando(true);
        setErrorEliminar("");

        try {
            await eliminarProducto(id);
            sincronizarProducto(id, {eliminado: true});
            mostrarToast(`"${producto?.nombre || "Producto"}" fue eliminado correctamente.`, "success");
            navigate("/productos");
        } catch (err) {
            setModalVisible(false);
            const msg = err.message || "No se pudo eliminar el producto. Intentá nuevamente.";
            setErrorEliminar(msg);
            mostrarToast(msg, "error");
        } finally {
            setEliminando(false);
        }
    };

    const handleAgregar = (e) => {
        if (!onAgregarAlCarrito || !producto || stockDisponible === 0) return;
        onAgregarAlCarrito(producto, cantidad);
        setAgregado(true);
        setCantidad(1);

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
                setTipoError(null);
                setProducto(null); // Evita mostrar datos residuales del producto anterior al cambiar de :id
                const data = await obtenerProductoPorId(id);
                if (activo) setProducto(data);
            } catch (err) {
                if (activo) {
                    const noEncontrado = err.status === 400 || err.status === 404;
                    setTipoError(noEncontrado ? "NOT_FOUND" : "SERVER_ERROR");
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarProducto();

        return () => {
            activo = false;
        };
    }, [id, recarga]);

    if (cargando) {
        return (
            <section className="detalle-section">
                <div className="container text-center my-5" role="status" aria-live="polite">
                    <div className="spinner-border" aria-hidden="true"/>
                    <p className="texto-principal mt-3">Cargando producto...</p>
                </div>
            </section>
        );
    }

    if (tipoError || !producto) {
        const esNoEncontrado = tipoError === "NOT_FOUND" || (!tipoError && !producto);

        return (
            <section className="detalle-section">
                <div className="container text-center my-5">
                    <ErrorState
                        titulo={esNoEncontrado ? "Producto no encontrado" : "No pudimos cargar el producto"}
                        mensaje={
                            esNoEncontrado
                                ? "No pudimos encontrar este producto. Puede que ya no esté disponible."
                                : "No pudimos cargar el producto. Intentá nuevamente más tarde."
                        }
                        textoBoton={esNoEncontrado ? "Volver al catálogo" : "Reintentar"}
                        onAccion={esNoEncontrado ? () => navigate("/productos") : () => setRecarga((n) => n + 1)}
                    />
                </div>
            </section>
        );
    }

    const sinStockTotal = stockTotal === 0;
    const alcanzoMaximoCarrito = stockTotal > 0 && stockDisponible === 0;
    const noSePuedeAgregar = stockDisponible === 0;

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
                        <ArrowLeft size={16} aria-hidden="true"/>
                        Ir al catálogo
                    </Link>
                </div>

                <article className="row g-4 g-lg-5">
                    <div className="col-12 col-lg-7">
                        <figure className="detalle-figura mb-0">
                            <img className="detalle-imagen" src={producto.imagenUrl} alt={producto.nombre}/>
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
                                            disabled={cantidad <= 1 || noSePuedeAgregar}
                                            aria-label="Disminuir cantidad"
                                        >
                                            <Minus size={16} aria-hidden="true"/>
                                        </button>

                                        <span
                                            className="detalle-cantidad-valor"
                                            aria-live="polite"
                                            aria-atomic="true"
                                        >
                                            {noSePuedeAgregar ? 0 : cantidad}
                                        </span>

                                        <button
                                            type="button"
                                            className="detalle-btn-cantidad"
                                            onClick={incrementarCantidad}
                                            disabled={cantidad >= stockDisponible || noSePuedeAgregar}
                                            aria-label="Aumentar cantidad"
                                        >
                                            <Plus size={16} aria-hidden="true"/>
                                        </button>
                                    </div>

                                    {unidadesEnCarrito > 0 && stockDisponible > 0 && (
                                        <span className="text-muted small">
                                            ({unidadesEnCarrito} en carrito, quedan {stockDisponible})
                                        </span>
                                    )}

                                    {unidadesEnCarrito === 0 && stockTotal <= 5 && stockTotal > 0 && (
                                        <span className="text-muted small">
                                            (Últimas {stockTotal} unidades)
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className={`btn btn-marca-primario texto-titulo-cta rounded-0 w-100 py-3 d-flex align-items-center justify-content-center gap-2 detalle-btn-agregar ${
                                        agregado ? "detalle-btn-agregar--agregado" : ""
                                    }`}
                                    disabled={noSePuedeAgregar}
                                    aria-label={
                                        sinStockTotal
                                            ? "Sin stock disponible"
                                            : alcanzoMaximoCarrito
                                            ? "Alcanzaste el stock máximo en tu carrito"
                                            : agregado
                                            ? `${cantidad} ${cantidad === 1 ? "unidad" : "unidades"} de ${producto.nombre} añadidas al carrito`
                                            : `Añadir ${cantidad} ${cantidad === 1 ? "unidad" : "unidades"} de ${producto.nombre} al carrito`
                                    }
                                    onClick={handleAgregar}
                                >
                                    {sinStockTotal ? (
                                        <span>Sin stock disponible</span>
                                    ) : alcanzoMaximoCarrito ? (
                                        <span>Alcanzaste el stock máximo en tu carrito</span>
                                    ) : agregado ? (
                                        <>
                                            <Check size={18} aria-hidden="true"/>
                                            <span>
                                                ¡{cantidad} {cantidad === 1 ? "unidad añadida" : "unidades añadidas"}!
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} aria-hidden="true"/>
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

                        <div className="detalle-admin-acciones mt-4">
                            <Link
                                to={`/admin/editar-producto/${producto._id}`}
                                className="detalle-btn-editar texto-titulo-cta"
                            >
                                <Pencil size={18} aria-hidden="true" />
                                Editar producto
                            </Link>

                            <button
                                type="button"
                                className="detalle-btn-eliminar texto-titulo-cta"
                                onClick={() => {
                                    setErrorEliminar("");
                                    setModalVisible(true);
                                }}
                                disabled={eliminando}
                            >
                                <Trash2 size={18} aria-hidden="true" />
                                Eliminar producto
                            </button>
                        </div>

                        {errorEliminar && (
                            <div className="detalle-error-operacion mt-3" role="alert">
                                <p className="mb-0">{errorEliminar}</p>
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

                <ConfirmModal
                    show={modalVisible}
                    title="Eliminar producto"
                    message={`¿Confirmás que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`}
                    actionLabel="Eliminar definitivamente"
                    onConfirmar={handleEliminar}
                    onCancelar={() => setModalVisible(false)}
                    procesando={eliminando}
                />
            </div>
        </section>
    );
}

export default DetalleProducto;