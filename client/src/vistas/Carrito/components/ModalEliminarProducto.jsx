import { useEffect, useRef } from "react";

function ModalEliminarProducto({ show, producto, onConfirmar, onCancelar }) {
    const modalRef = useRef(null);
    const cancelButtonRef = useRef(null);

    useEffect(() => {
        if (!show) return;

        // Foco inicial en botón Cancelar
        cancelButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCancelar();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusableElements = modalRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements?.length) {
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [show, onCancelar]);

    if (!show) {
        return null;
    }

    return (
        <>
            <div
                ref={modalRef}
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modalEliminarProductoTitulo"
                aria-describedby="modalEliminarProductoDescripcion"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content modal-carrito">
                        <div className="modal-header">
                            <h2
                                className="modal-title texto-titulo-elegante"
                                id="modalEliminarProductoTitulo"
                            >
                                Eliminar producto
                            </h2>

                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Cerrar"
                                onClick={onCancelar}
                            />
                        </div>

                        <div className="modal-body">
                            <p id="modalEliminarProductoDescripcion">
                                ¿Estás seguro de que querés eliminar {producto ? <strong>{producto.nombre}</strong> : "este producto"} de tu carrito?
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                ref={cancelButtonRef}
                                type="button"
                                className="btn-carrito-cancelar texto-titulo-cta"
                                onClick={onCancelar}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                id="confirmar-eliminar-producto"
                                className="btn-carrito-eliminar texto-titulo-cta"
                                onClick={onConfirmar}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show" onClick={onCancelar} />
        </>
    );
}

export default ModalEliminarProducto;
