import { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import "./Toast.styles.css";

function ToastItem({ toast, onCerrar }) {
  const timerRef = useRef(null);
  const tiempoRestanteRef = useRef(toast.duracion);
  const tiempoInicioRef = useRef(Date.now());

  const iniciarTimer = useCallback(() => {
    tiempoInicioRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onCerrar(toast.id);
    }, tiempoRestanteRef.current);
  }, [toast.id, onCerrar]);

  const pausarTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const transcurrido = Date.now() - tiempoInicioRef.current;
      tiempoRestanteRef.current = Math.max(0, tiempoRestanteRef.current - transcurrido);
    }
  }, []);

  useEffect(() => {
    iniciarTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [iniciarTimer]);

  const Icono =
    toast.tipo === "success"
      ? CheckCircle2
      : toast.tipo === "error"
      ? AlertCircle
      : Info;

  const esError = toast.tipo === "error";

  return (
    <div
      className={`app-toast app-toast--${toast.tipo}`}
      role={esError ? "alert" : "status"}
      aria-live={esError ? "assertive" : "polite"}
      aria-atomic="true"
      onMouseEnter={pausarTimer}
      onMouseLeave={iniciarTimer}
      onFocus={pausarTimer}
      onBlur={iniciarTimer}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCerrar(toast.id);
      }}
    >
      <div className="app-toast__icon-wrapper">
        <Icono size={20} className="app-toast__icon" aria-hidden="true" />
      </div>

      <div className="app-toast__content">
        <p className="app-toast__mensaje">{toast.mensaje}</p>
      </div>

      <button
        type="button"
        className="app-toast__btn-cerrar"
        aria-label="Cerrar notificación"
        onClick={() => onCerrar(toast.id)}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

ToastItem.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mensaje: PropTypes.string.isRequired,
    tipo: PropTypes.oneOf(["info", "success", "error", "warning"]).isRequired,
    duracion: PropTypes.number.isRequired,
  }).isRequired,
  onCerrar: PropTypes.func.isRequired,
};

function ToastContainer({ toasts, onCerrar }) {
  if (!toasts.length) return null;

  return (
    <aside className="app-toast-container" aria-label="Notificaciones" role="region">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onCerrar={onCerrar} />
      ))}
    </aside>
  );
}

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      mensaje: PropTypes.string.isRequired,
      tipo: PropTypes.string.isRequired,
      duracion: PropTypes.number.isRequired,
    })
  ).isRequired,
  onCerrar: PropTypes.func.isRequired,
};

export default ToastContainer;
