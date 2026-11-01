import PropTypes from "prop-types";

function ErrorState({
  titulo,
  mensaje,
  textoBoton,
  onAccion,
  textoSecundario,
  onAccionSecundaria,
  icono: Icono,
}) {
  return (
    <div className="text-center my-5" role="alert">
      {Icono && (
        <Icono
          size={48}
          className="mb-3"
          style={{ color: "var(--color-error)" }}
          aria-hidden="true"
        />
      )}
      {titulo && <h2 className="texto-titulo-elegante h4 mb-2">{titulo}</h2>}
      {mensaje && <p className="texto-principal mb-4">{mensaje}</p>}
      <div className="d-flex justify-content-center gap-2 flex-wrap">
        {textoBoton && onAccion && (
          <button
            type="button"
            className="btn btn-marca-primario texto-titulo-cta rounded-0 px-4 py-2"
            onClick={onAccion}
          >
            {textoBoton}
          </button>
        )}
        {textoSecundario && onAccionSecundaria && (
          <button
            type="button"
            className="btn btn-outline-secondary texto-titulo-cta rounded-0 px-4 py-2"
            onClick={onAccionSecundaria}
          >
            {textoSecundario}
          </button>
        )}
      </div>
    </div>
  );
}

ErrorState.propTypes = {
  titulo: PropTypes.string,
  mensaje: PropTypes.string,
  textoBoton: PropTypes.string,
  onAccion: PropTypes.func,
  textoSecundario: PropTypes.string,
  onAccionSecundaria: PropTypes.func,
  icono: PropTypes.elementType,
};

export default ErrorState;
