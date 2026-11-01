import { useEffect, useRef, useState } from "react";
import { crearCategoria, obtenerCategorias } from "../../services/categoriasService";
import { subirImagenProducto } from "../../services/productosService";
import SelectorImagenProducto from "./SelectorImagenProducto";
import {
  OTRA_CATEGORIA,
  construirPayload,
  normalizarValoresIniciales,
  validarCampos,
} from "./productoForm.utils";
import "./ProductoForm.styles.css";

function ProductoForm({
  initialValues = {},
  onSubmit,
  cargando = false,
  onProcesandoChange,
}) {
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const [formulario, setFormulario] = useState(() =>
    normalizarValoresIniciales(initialValues)
  );

  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categoriaCreada, setCategoriaCreada] = useState(null);

  const [archivoImagen, setArchivoImagen] = useState(null);
  const [imagenSubida, setImagenSubida] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  const [wasValidated, setWasValidated] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorEnvio, setErrorEnvio] = useState("");

  const notificarProcesando = (estado) => {
    if (!montadoRef.current) return;
    setSubiendo(estado);
    onProcesandoChange?.(estado);
  };

  const procesando = cargando || subiendo;

  useEffect(() => {
    let activo = true;

    const cargarCategorias = async () => {
      try {
        setCargandoCategorias(true);
        setErrorCategorias("");
        const data = await obtenerCategorias();
        if (activo) {
          setCategorias(data || []);
        }
      } catch (err) {
        if (activo) {
          setErrorCategorias("No se pudieron cargar las categorías.");
        }
      } finally {
        if (activo) {
          setCargandoCategorias(false);
        }
      }
    };

    cargarCategorias();

    return () => {
      activo = false;
    };
  }, []);

  const manejarCambio = (event) => {
    const { name, value, type, checked } = event.target;
    const valor = type === "checkbox" ? checked : value;

    setFormulario((prev) => ({
      ...prev,
      [name]: valor,
    }));

    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    event.target.setCustomValidity("");
  };

  const manejarCambioNuevaCategoria = (event) => {
    const val = event.target.value;
    setNuevaCategoria(val);

    if (categoriaCreada && categoriaCreada.nombre !== val.trim()) {
      setCategoriaCreada(null);
    }

    event.target.setCustomValidity("");

    if (errores.nuevaCategoria) {
      setErrores((prev) => ({
        ...prev,
        nuevaCategoria: undefined,
      }));
    }
  };

  const manejarSeleccionarArchivo = (file) => {
    setArchivoImagen(file);
    setImagenSubida(null);
    setErrorArchivo("");

    setErrores((prev) => ({
      ...prev,
      imagenUrl: undefined,
      archivo: undefined,
    }));
  };

  const manejarQuitarArchivo = () => {
    if (procesando) return;
    setArchivoImagen(null);
    setImagenSubida(null);
    setErrorArchivo("");
  };

  const manejarSubmit = async (event) => {
    event.preventDefault();
    if (procesando) return;

    const form = event.currentTarget;
    setWasValidated(true);
    setErrorEnvio("");

    const { esValido, errores: nuevosErrores, valoresLimpios } = validarCampos(
      formulario,
      {
        nuevaCategoria,
        archivoImagen,
        errorArchivo,
      }
    );

    // Derivar setCustomValidity del resultado de validación centralizado
    if (form.nombre) form.nombre.setCustomValidity(nuevosErrores.nombre || "");
    if (form.descripcion) {
      form.descripcion.setCustomValidity(nuevosErrores.descripcion || "");
    }
    if (form.precio) form.precio.setCustomValidity(nuevosErrores.precio || "");
    if (form.stock) form.stock.setCustomValidity(nuevosErrores.stock || "");
    if (form.categoria) {
      form.categoria.setCustomValidity(nuevosErrores.categoria || "");
    }
    if (form.nuevaCategoria) {
      form.nuevaCategoria.setCustomValidity(nuevosErrores.nuevaCategoria || "");
    }
    if (form.imagenUrl) {
      form.imagenUrl.setCustomValidity(nuevosErrores.imagenUrl || "");
    }

    setErrores(nuevosErrores);

    if (!esValido || !form.checkValidity()) {
      const primerInvalido = form.querySelector(":invalid");
      primerInvalido?.focus();
      return;
    }

    notificarProcesando(true);

    try {
      let categoriaFinal = formulario.categoria;
      if (formulario.categoria === OTRA_CATEGORIA) {
        const nombreCat = valoresLimpios.nuevaCategoria;
        if (categoriaCreada?.nombre === nombreCat) {
          categoriaFinal = categoriaCreada.nombre;
        } else {
          const cat = await crearCategoria(nombreCat);
          if (!montadoRef.current) return;
          setCategoriaCreada(cat);
          categoriaFinal = cat.nombre;
        }
      }

      let urlFinal = valoresLimpios.imagenUrl;
      if (archivoImagen) {
        if (imagenSubida?.archivo === archivoImagen) {
          urlFinal = imagenSubida.url;
        } else {
          const urlSubida = await subirImagenProducto(archivoImagen);
          if (!montadoRef.current) return;
          urlFinal = urlSubida;
          setImagenSubida({ archivo: archivoImagen, url: urlFinal });
        }
      }

      if (!montadoRef.current) return;

      const payload = construirPayload(valoresLimpios, {
        categoriaFinal,
        imagenUrlFinal: urlFinal,
      });

      if (onSubmit) {
        await onSubmit(payload);
      }
    } catch (err) {
      if (montadoRef.current) {
        setErrorEnvio(err.message || "Ocurrió un error al procesar el producto.");
      }
    } finally {
      if (montadoRef.current) {
        notificarProcesando(false);
      }
    }
  };

  return (
    <form
      className={`producto-form needs-validation ${
        wasValidated ? "was-validated" : ""
      }`}
      noValidate
      onSubmit={manejarSubmit}
    >
      <fieldset className="producto-form__seccion">
        <legend className="texto-titulo-elegante fs-4 texto-marca-primario mb-3">
          Información principal
        </legend>

        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="nombre" className="producto-form__label">
              Nombre del producto *
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="Ej. Mesa de comedor Álamo"
              value={formulario.nombre}
              onChange={manejarCambio}
              disabled={procesando}
              required
            />
            <div className="invalid-feedback">
              {errores.nombre || "El nombre es obligatorio."}
            </div>
          </div>

          <div className="col-12">
            <label htmlFor="descripcion" className="producto-form__label">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="Describí las características del producto..."
              value={formulario.descripcion}
              onChange={manejarCambio}
              disabled={procesando}
              required
            />
            <div className="invalid-feedback">
              {errores.descripcion || "La descripción es obligatoria."}
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="precio" className="producto-form__label">
              Precio *
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              min="0"
              step="0.01"
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="0.00"
              value={formulario.precio}
              onChange={manejarCambio}
              disabled={procesando}
              required
            />
            <div className="invalid-feedback">
              {errores.precio || "Ingresá un precio válido mayor o igual a 0."}
            </div>
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="stock" className="producto-form__label">
              Stock *
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="0"
              value={formulario.stock}
              onChange={manejarCambio}
              disabled={procesando}
              required
            />
            <div className="invalid-feedback">
              {errores.stock || "Ingresá un stock entero mayor o igual a 0."}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="producto-form__seccion">
        <legend className="texto-titulo-elegante fs-4 texto-marca-primario mb-3">
          Características
        </legend>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label htmlFor="categoria" className="producto-form__label">
              Categoría *
            </label>
            <select
              id="categoria"
              name="categoria"
              className="form-select rounded-0 p-3 bg-light border-0 texto-principal"
              value={formulario.categoria}
              onChange={manejarCambio}
              disabled={
                procesando || cargandoCategorias || Boolean(errorCategorias)
              }
              required
            >
              <option value="">
                {cargandoCategorias
                  ? "Cargando categorías..."
                  : "Seleccioná una categoría"}
              </option>

              {categorias.map((cat) => (
                <option key={cat._id || cat.nombre} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}

              {formulario.categoria &&
                formulario.categoria !== OTRA_CATEGORIA &&
                !categorias.some((c) => c.nombre === formulario.categoria) && (
                  <option value={formulario.categoria}>
                    {formulario.categoria}
                  </option>
                )}

              <option value={OTRA_CATEGORIA}>+ Otra categoría...</option>
            </select>
            <div className="invalid-feedback">
              {errores.categoria || "Seleccioná una categoría."}
            </div>
            {errorCategorias && (
              <p className="producto-form__error" role="alert">
                {errorCategorias}
              </p>
            )}
          </div>

          {formulario.categoria === OTRA_CATEGORIA && (
            <div className="col-12 col-md-6">
              <label htmlFor="nuevaCategoria" className="producto-form__label">
                Nueva categoría *
              </label>
              <input
                id="nuevaCategoria"
                name="nuevaCategoria"
                type="text"
                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                placeholder="Ej. Exterior"
                value={nuevaCategoria}
                onChange={manejarCambioNuevaCategoria}
                disabled={procesando}
                required
              />
              <div className="invalid-feedback">
                {errores.nuevaCategoria ||
                  "Ingresá el nombre de la nueva categoría."}
              </div>
            </div>
          )}

          <div className="col-12 col-md-6">
            <label htmlFor="medidas" className="producto-form__label">
              Medidas
            </label>
            <input
              id="medidas"
              name="medidas"
              type="text"
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="Ej. 180 x 90 x 75 cm (opcional)"
              value={formulario.medidas}
              onChange={manejarCambio}
              disabled={procesando}
            />
          </div>

          <div className="col-12 col-md-6">
            <label htmlFor="materiales" className="producto-form__label">
              Materiales
            </label>
            <input
              id="materiales"
              name="materiales"
              type="text"
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="Ej. Madera maciza de petiribí (opcional)"
              value={formulario.materiales}
              onChange={manejarCambio}
              disabled={procesando}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="producto-form__seccion">
        <legend className="texto-titulo-elegante fs-4 texto-marca-primario mb-3">
          Imagen del producto
        </legend>

        <div className="row g-3">
          <div className="col-12">
            <label htmlFor="imagenUrl" className="producto-form__label">
              URL o ruta de imagen{" "}
              {archivoImagen ? "(opcional si se sube archivo)" : "*"}
            </label>
            <input
              id="imagenUrl"
              name="imagenUrl"
              type="text"
              className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
              placeholder="https://... o /img/productos/..."
              value={formulario.imagenUrl}
              onChange={manejarCambio}
              disabled={procesando}
              required={!archivoImagen}
            />
            <div className="invalid-feedback">
              {errores.imagenUrl || "La imagen es obligatoria."}
            </div>
          </div>

          <div className="col-12">
            <SelectorImagenProducto
              imagenActual={formulario.imagenUrl}
              archivo={archivoImagen}
              deshabilitado={procesando}
              error={errorArchivo}
              onError={setErrorArchivo}
              onSeleccionarArchivo={manejarSeleccionarArchivo}
              onQuitarArchivo={manejarQuitarArchivo}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="producto-form__seccion">
        <legend className="texto-titulo-elegante fs-4 texto-marca-primario mb-3">
          Configuración adicional
        </legend>

        <label className="producto-form__checkbox">
          <input
            id="destacado"
            name="destacado"
            type="checkbox"
            checked={formulario.destacado}
            onChange={manejarCambio}
            disabled={procesando}
          />
          <span className="texto-principal">
            Mostrar como producto destacado
          </span>
        </label>
      </fieldset>

      {errorEnvio && (
        <div className="producto-form__error-envio mb-3" role="alert">
          <p className="producto-form__error">{errorEnvio}</p>
        </div>
      )}

      <div className="producto-form__acciones">
        <button
          type="submit"
          className="texto-titulo-cta py-3 px-5 rounded-0 btn-marca-primario producto-form__submit"
          disabled={procesando}
        >
          {procesando ? "Guardando..." : "Guardar producto"}
        </button>
      </div>
    </form>
  );
}

export default ProductoForm;
