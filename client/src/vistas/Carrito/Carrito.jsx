import { useState, useRef } from "react";
import PropTypes from "prop-types";
import { AlertCircle } from "lucide-react";
import "./Carrito.styles.css";
import CarritoVacio from "./components/CarritoVacio";
import CarritoItem from "./components/CarritoItem";
import CarritoResumen from "./components/CarritoResumen";
import ModalEliminarProducto from "./components/ModalEliminarProducto";
import StatusModal from "../../components/StatusModal/StatusModal";
import ErrorState from "../../components/ErrorState/ErrorState";

function Carrito({
    carrito = [],
    onActualizarCantidad,
    onEliminarDelCarrito,
    onVaciarCarrito,
    cargando = false,
    error = null,
    onReintentar
}) {
    const [productoPendienteEliminar, setProductoPendienteEliminar] = useState(null);
    const [modalCompraVisible, setModalCompraVisible] = useState(false);
    const [mensajeStatus, setMensajeStatus] = useState("");
    const exploreButtonRef = useRef(null);

    const anunciar = (mensaje) => {
        setMensajeStatus("");
        requestAnimationFrame(() => {
            setMensajeStatus(mensaje);
        });
    };

    const handleActualizarCantidad = (id, nuevaCantidad) => {
        const item = carrito.find((i) => i.id === id);
        if (onActualizarCantidad) {
            onActualizarCantidad(id, nuevaCantidad);
        }
        if (item) {
            anunciar(`Cantidad de ${item.nombre} actualizada a ${nuevaCantidad}`);
        }
    };

    const handleSolicitarEliminar = (item) => {
        setProductoPendienteEliminar(item);
    };

    const handleConfirmarEliminar = () => {
        if (!productoPendienteEliminar) return;

        const productoEliminado = productoPendienteEliminar;
        if (onEliminarDelCarrito) {
            onEliminarDelCarrito(productoEliminado.id);
        }
        setProductoPendienteEliminar(null);
        anunciar(`${productoEliminado.nombre} fue eliminado del carrito`);
    };

    const handleCancelarEliminar = () => {
        setProductoPendienteEliminar(null);
    };

    const handleIniciarCompra = () => {
        setModalCompraVisible(true);
    };

    const handleCerrarModalCompra = () => {
        setModalCompraVisible(false);
        if (onVaciarCarrito) {
            onVaciarCarrito();
        }
        anunciar("¡Compra simulada completada con éxito! Tu carrito ha sido vaciado.");
        setTimeout(() => {
            exploreButtonRef.current?.focus();
        }, 50);
    };

    const totalGeneral = carrito.reduce(
        (total, item) => total + (item.precio || 0) * item.cantidad,
        0
    );

    return (
        <section className="carrito-main">
            <div
                id="carrito-status"
                className="visually-hidden"
                aria-live="polite"
                aria-atomic="true"
            >
                {mensajeStatus}
            </div>

            <div id="carrito-container" className="container min-vh-50">
                {cargando ? (
                    <div className="text-center my-5 py-5" role="status" aria-live="polite">
                        <div className="spinner-border text-primary" style={{ color: "var(--color-primary)" }} aria-hidden="true" />
                        <p className="texto-principal mt-3">Sincronizando carrito...</p>
                    </div>
                ) : error ? (
                    <div className="py-5">
                        <ErrorState
                            icono={AlertCircle}
                            titulo="No pudimos sincronizar tu carrito"
                            mensaje={error}
                            textoBoton="Reintentar"
                            onAccion={onReintentar}
                        />
                    </div>
                ) : carrito.length === 0 ? (
                    <CarritoVacio exploreRef={exploreButtonRef} />
                ) : (
                    <div className="carrito-section" aria-labelledby="carrito-titulo">
                        <h1 id="carrito-titulo" className="carrito-titulo">
                            Tu carrito
                        </h1>

                        <div className="row g-4 align-items-start carrito-layout">
                            <div className="col-12 col-xl-8">
                                <ul className="list-unstyled m-0">
                                    {carrito.map((item) => (
                                        <CarritoItem
                                            key={item.id}
                                            item={item}
                                            onActualizarCantidad={handleActualizarCantidad}
                                            onSolicitarEliminar={handleSolicitarEliminar}
                                        />
                                    ))}
                                </ul>
                            </div>

                            <div className="col-12 col-xl-4">
                                <CarritoResumen
                                    carrito={carrito}
                                    totalGeneral={totalGeneral}
                                    onFinalizarCompra={handleIniciarCompra}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ModalEliminarProducto
                show={Boolean(productoPendienteEliminar)}
                producto={productoPendienteEliminar}
                onConfirmar={handleConfirmarEliminar}
                onCancelar={handleCancelarEliminar}
            />

            <StatusModal
                show={modalCompraVisible}
                title="¡Gracias por tu compra!"
                message="Tu pedido ha sido registrado con éxito en esta simulación. No se ha requerido ningún cobro real. Ahora vaciaremos tu carrito para que puedas seguir explorando nuestra colección."
                actionLabel="Continuar explorando"
                onClose={handleCerrarModalCompra}
            />
        </section>
    );
}

Carrito.propTypes = {
    carrito: PropTypes.array,
    onActualizarCantidad: PropTypes.func,
    onEliminarDelCarrito: PropTypes.func,
    onVaciarCarrito: PropTypes.func,
    cargando: PropTypes.bool,
    error: PropTypes.string,
    onReintentar: PropTypes.func
};

export default Carrito;
