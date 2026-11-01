import PropTypes from "prop-types";

function ErrorState({ titulo, mensaje, textoBoton, onAccion, icono: Icono }) {
  return (
    <div className="text-center my-5" role="alert">
      {Icono && <Icono size={48} className="mb-3 text-danger" aria-hidden="true" />}
      {titulo && <h2 className="texto-titulo-elegante h4 mb-2">{titulo}</h2>}
      {mensaje && <p className="texto-principal mb-4">{mensaje}</p>}
      {textoBoton && onAccion && (
        <button
          type="button"
          className="btn btn-marca-primario texto-titulo-cta rounded-0 px-4 py-2"
          onClick={onAccion}
        >
          {textoBoton}
        </button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  titulo: PropTypes.string,
  mensaje: PropTypes.string,
  textoBoton: PropTypes.string,
  onAccion: PropTypes.func,
  icono: PropTypes.elementType,
};

export default ErrorState;
