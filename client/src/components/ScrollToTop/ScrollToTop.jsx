import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Lleva la vista al inicio cada vez que se navega a una ruta nueva.
function ScrollToTop() {
  const { nombreRuta } = useLocation();
  const tipoNavegacion = useNavigationType();

  useEffect(() => {
    // Cuando se hace atrás/adelante (POP) no se fuerza el scroll para no pisar la posición
    if (tipoNavegacion !== "POP")
      window.scrollTo(0, 0);
  }, [nombreRuta, tipoNavegacion]);

  return null;
}

export default ScrollToTop;