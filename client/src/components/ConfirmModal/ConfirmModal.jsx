import { useEffect, useRef } from "react";
import "../StatusModal/StatusModal.styles.css";
import "./ConfirmModal.styles.css";

function ConfirmModal({
  show,
  title,
  message,
  actionLabel = "Confirmar",
  onConfirmar,
  onCancelar,
  procesando = false,
}) {
  const modalRef = useRef(null);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    const elementoAnterior = document.activeElement;
    cancelButtonRef.current?.focus();

    return () => {
      if (elementoAnterior?.isConnected) {
        elementoAnterior.focus();
      }
    };
  }, [show]);

  useEffect(() => {
    if (show && procesando) {
      modalRef.current?.focus();
    }
  }, [show, procesando]);

  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!procesando) onCancelar();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const dialog = modalRef.current?.querySelector(".modal-dialog");
      const focusInsideDialog = dialog && dialog.contains(document.activeElement);

      if (!focusInsideDialog) {
        event.preventDefault();
        if (event.shiftKey) {
          lastElement.focus();
        } else {
          firstElement.focus();
        }
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onCancelar, procesando]);

  if (!show) return null;

  return (
    <>
      <div
        ref={modalRef}
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        onClick={(e) => {
          if (!procesando && e.target === modalRef.current) {
            onCancelar();
          }
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content modal-marca rounded-0">
            <button
              type="button"
              className="btn-close status-modal__close"
              aria-label="Cerrar"
              onClick={onCancelar}
              disabled={procesando}
            />

            <div className="modal-body status-modal__body confirm-modal__body">
              <h2
                id="confirm-modal-title"
                className="texto-titulo-elegante status-modal__title"
              >
                {title}
              </h2>

              <p
                id="confirm-modal-description"
                className="texto-principal status-modal__message"
              >
                {message}
              </p>

              <div className="confirm-modal__actions">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  className="texto-titulo-cta confirm-modal__btn-cancelar"
                  onClick={onCancelar}
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="texto-titulo-cta confirm-modal__btn-confirmar"
                  onClick={onConfirmar}
                  disabled={procesando}
                >
                  {procesando ? "Procesando…" : actionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal-backdrop fade show"
        onClick={procesando ? undefined : onCancelar}
      />
    </>
  );
}

export default ConfirmModal;
