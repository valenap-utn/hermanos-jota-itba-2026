import { createContext, useContext, useState, useCallback, useId } from "react";
import PropTypes from "prop-types";
import ToastContainer from "../components/Toast/ToastContainer";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const baseId = useId();

  const quitarToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (mensaje, tipo = "info", duracion) => {
      const tiempo = duracion || (tipo === "error" ? 7000 : 5000);
      const id = `${baseId}-${Date.now()}-${Math.random()}`;

      setToasts((prev) => [...prev, { id, mensaje, tipo, duracion: tiempo }]);
      return id;
    },
    [baseId]
  );

  return (
    <ToastContext.Provider value={{ mostrarToast, quitarToast }}>
      {children}
      <ToastContainer toasts={toasts} onCerrar={quitarToast} />
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
