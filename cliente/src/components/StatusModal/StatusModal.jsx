function StatusModal({show, title, message, onClose}) {
    if (!show) {
        return null;
    }

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="status-modal-title"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content modal-marca rounded-0">
                        <div className="modal-header border-0">
                            <h2
                                className="modal-title texto-titulo-elegante fs-4"
                                id="status-modal-title"
                            >
                                {title}
                            </h2>

                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Cerrar"
                                onClick={onClose}
                            />
                        </div>

                        <div className="modal-body">
                            <p className="texto-principal mb-0">
                                {message}
                            </p>
                        </div>

                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn texto-titulo-cta btn-marca-primario rounded-0"
                                onClick={onClose}
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-backdrop fade show"/>
        </>
    );
}

export default StatusModal;
