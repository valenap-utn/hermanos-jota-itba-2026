import { useEffect, useRef, useState } from "react";
import { crearCategoria, obtenerCategorias } from "../../services/categoriasService";
import { subirImagenProducto } from "../../services/productosService";
import SelectorImagenProducto from "./SelectorImagenProducto";
import { useToast } from "../../context/ToastContext";
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
  onEliminar,
  cargando = false,
  onProcesandoChange,
}) {
  const montadoRef = useRef(true);
  const { mostrarToast } = useToast();

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
      } catch {
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
      const keysConError = Object.keys(nuevosErrores);
      const primerCampo =
        keysConError.length > 0
          ? form.elements[keysConError[0]]
          : form.querySelector(":invalid");

      if (primerCampo) {
        primerCampo.scrollIntoView({ behavior: "smooth", block: "center" });
        primerCampo.focus({ preventScroll: true });
      }

      const msg = "Completá los campos obligatorios para guardar el producto.";
      setErrorEnvio(msg);
      mostrarToast("Hay campos obligatorios incompletos. Revisá el formulario.", "error");
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
          setImagenSubida({ archivo: archivoImagen, url: urlSubida });
          urlFinal = urlSubida;
        }
      }

      const payload = construirPayload(valoresLimpios, {
        categoriaFinal,
        urlFinal,
      });

      await onSubmit?.(payload);
    } catch (err) {
      if (!montadoRef.current) return;
      setErrorEnvio(
        err.message || "Ocurrió un error al procesar el formulario."
      );
    } finally {
      notificarProcesando(false);
    }
  };

  return (
    <form
      className="producto-form"
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
              aria-invalid={Boolean(wasValidated && errores.nombre)}
              aria-describedby={wasValidated && errores.nombre ? "error-nombre" : undefined}
              required
            />
            {wasValidated && errores.nombre && (
              <p id="error-nombre" className="producto-form__error" role="alert">
                {errores.nombre}
              </p>
            )}
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
              aria-invalid={Boolean(wasValidated && errores.descripcion)}
              aria-describedby={wasValidated && errores.descripcion ? "error-descripcion" : undefined}
              required
            />
            {wasValidated && errores.descripcion && (
              <p id="error-descripcion" className="producto-form__error" role="alert">
                {errores.descripcion}
              </p>
            )}
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
              aria-invalid={Boolean(wasValidated && errores.precio)}
              aria-describedby={wasValidated && errores.precio ? "error-precio" : undefined}
              required
            />
            {wasValidated && errores.precio && (
              <p id="error-precio" className="producto-form__error" role="alert">
                {errores.precio}
              </p>
            )}
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
              aria-invalid={Boolean(wasValidated && errores.stock)}
              aria-describedby={wasValidated && errores.stock ? "error-stock" : undefined}
              required
            />
            {wasValidated && errores.stock && (
              <p id="error-stock" className="producto-form__error" role="alert">
                {errores.stock}
              </p>
            )}
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
              aria-invalid={Boolean(wasValidated && errores.categoria)}
              aria-describedby={wasValidated && errores.categoria ? "error-categoria" : undefined}
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
            {wasValidated && errores.categoria && (
              <p id="error-categoria" className="producto-form__error" role="alert">
                {errores.categoria}
              </p>
            )}
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
                aria-invalid={Boolean(wasValidated && errores.nuevaCategoria)}
                aria-describedby={wasValidated && errores.nuevaCategoria ? "error-nuevaCategoria" : undefined}
                required
              />
              {wasValidated && errores.nuevaCategoria && (
                <p id="error-nuevaCategoria" className="producto-form__error" role="alert">
                  {errores.nuevaCategoria}
                </p>
              )}
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
              aria-invalid={Boolean(wasValidated && errores.imagenUrl)}
              aria-describedby={wasValidated && errores.imagenUrl ? "error-imagenUrl" : undefined}
              required={!archivoImagen}
            />
            {wasValidated && errores.imagenUrl && (
              <p id="error-imagenUrl" className="producto-form__error" role="alert">
                {errores.imagenUrl}
              </p>
            )}
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
        {onEliminar && (
          <button
            type="button"
            className="texto-titulo-cta editar-producto__btn-eliminar rounded-0"
            onClick={onEliminar}
            disabled={procesando}
          >
            Eliminar producto
          </button>
        )}

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
