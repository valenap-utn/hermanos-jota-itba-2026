import React from "react";
import PropTypes from "prop-types";
import ErrorState from "../ErrorState/ErrorState";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary atrapó un error de renderizado:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-5 text-center">
          <ErrorState
            titulo="Algo salió mal"
            mensaje="Ocurrió un error inesperado al mostrar esta vista."
            textoBoton="Volver al catálogo"
            onAccion={() => {
              this.setState({ hasError: false, error: null });
              window.location.assign("/productos");
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  resetKey: PropTypes.string,
};

export default ErrorBoundary;
