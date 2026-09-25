import {useEffect, useRef} from 'react';
import {CircleCheck} from "lucide-react";
import "./StatusModal.styles.css";

function StatusModal({show, title, message, onClose}) {

    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        if (!show) {
            return;
        }

        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
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
    }, [show, onClose]);

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
                aria-labelledby="status-modal-title"
                aria-describedby="status-modal-description"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content modal-marca rounded-0">
                        <button
                            ref={closeButtonRef}
                            type="button"
                            className="btn-close status-modal__close"
                            aria-label="Cerrar"
                            onClick={onClose}
                        />

                        <div className="modal-body status-modal__body">
                            <CircleCheck
                                className="status-modal__icon"
                                aria-hidden="true"
                            />

                            <h2
                                id="status-modal-title"
                                className="texto-titulo-elegante status-modal__title"
                            >
                                {title}
                            </h2>

                            <p
                                id="status-modal-description"
                                className="texto-principal status-modal__message"
                            >
                                {message}
                            </p>

                            <button
                                type="button"
                                className="texto-titulo-cta btn-marca-primario rounded-0 status-modal__action"
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
