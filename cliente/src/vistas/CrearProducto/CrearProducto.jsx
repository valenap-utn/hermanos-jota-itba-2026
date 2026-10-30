import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {crearCategoria, obtenerCategorias} from "../../services/categoriasService";
import {crearProducto, subirImagenProducto} from "../../services/productosService";
import {ImagePlus, UploadCloud, X} from "lucide-react";
import "./CrearProducto.styles.css";

const estadoInicial = {
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "0",
    medidas: "",
    materiales: "",
    categoria: "",
    destacado: false,
};

const OTRA_CATEGORIA = "__otra__";

function CrearProducto() {

    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(estadoInicial);
    const [nuevaCategoria, setNuevaCategoria] = useState("");

    const [categorias, setCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [errorCategorias, setErrorCategorias] = useState("");

    const [errores, setErrores] = useState({});

    const [imagen, setImagen] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState("");
    const [categoriaCreada, setCategoriaCreada] = useState(null);
    const [imagenSubida, setImagenSubida] = useState(null);

    const inputImagenRef = useRef(null);
    const [arrastrandoImagen, setArrastrandoImagen] = useState(false);
    const [vistaPrevia, setVistaPrevia] = useState(null);

    const manejarCambio = (event) => {
        const {name, value, type, checked} = event.target;

        setFormulario((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        setErrores((prev) => ({
            ...prev,
            [name]: undefined,
        }));
    };

    const seleccionarImagen = (archivo) => {
        if (enviando) return;

        setErrores((prev) => ({
            ...prev,
            imagen: undefined,
        }));

        if (!archivo) return;

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!tiposPermitidos.includes(archivo.type)) {
            setErrores((prev) => ({
                ...prev,
                imagen: "La imagen debe ser JPG, JPEG, PNG o WebP.",
            }));
            return;
        }

        if (archivo.size > 5 * 1024 * 1024) {
            setErrores((prev) => ({
                ...prev,
                imagen: "La imagen no puede superar los 5 MB.",
            }));
            return;
        }

        setImagen(archivo);
        setImagenSubida(null);
    };

    const quitarImagen = () => {
        if (enviando) return;

        setImagen(null);
        setImagenSubida(null);
        setErrores((prev) => ({
            ...prev,
            imagen: undefined,
        }));

        if (inputImagenRef.current) {
            inputImagenRef.current.value = "";
        }
    };

    const manejarDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setArrastrandoImagen(false);

        if (enviando) return;

        const archivo = event.dataTransfer.files?.[0];

        if (archivo) {
            seleccionarImagen(archivo);
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formulario.nombre.trim()) {
            nuevosErrores.nombre = "Ingresá el nombre del producto.";
        }

        if (!formulario.descripcion.trim()) {
            nuevosErrores.descripcion = "Ingresá una descripción.";
        }

        if (
            formulario.precio.trim() === "" ||
            !Number.isFinite(Number(formulario.precio)) ||
            Number(formulario.precio) < 0
        ) {
            nuevosErrores.precio = "Ingresá un precio válido, mayor o igual a 0.";
        }

        if (
            formulario.stock.trim() === "" ||
            !Number.isInteger(Number(formulario.stock)) ||
            Number(formulario.stock) < 0
        ) {
            nuevosErrores.stock = "Ingresá un stock entero, mayor o igual a 0.";
        }

        if (!formulario.categoria) {
            nuevosErrores.categoria = "Seleccioná una categoría.";
        }

        if (
            formulario.categoria === OTRA_CATEGORIA &&
            !nuevaCategoria.trim()
        ) {
            nuevosErrores.nuevaCategoria = "Ingresá el nombre de la nueva categoría.";
        }

        if (!imagen) {
            nuevosErrores.imagen = "Seleccioná una imagen del producto.";
        } else if (
            !["image/jpeg", "image/png", "image/webp"].includes(imagen.type)
        ) {
            nuevosErrores.imagen = "La imagen debe ser JPG, JPEG, PNG o WebP.";
        } else if (imagen.size > 5 * 1024 * 1024) {
            nuevosErrores.imagen = "La imagen no puede superar los 5 MB.";
        }

        return nuevosErrores;
    };

    const manejarEnvio = async (event) => {
        event.preventDefault();

        if (enviando) return;

        const nuevosErrores = validarFormulario();
        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) return;

        setEnviando(true);
        setErrorEnvio("");

        try {
            let categoriaFinal = formulario.categoria;

            if (formulario.categoria === OTRA_CATEGORIA) {
                const nombre = nuevaCategoria.trim();

                if (categoriaCreada?.nombre === nombre) {
                    categoriaFinal = categoriaCreada.nombre;
                } else {
                    const categoria = await crearCategoria(nombre);
                    setCategoriaCreada(categoria);
                    categoriaFinal = categoria.nombre;
                }
            }

            let imagenUrl;

            if (imagenSubida?.archivo === imagen) {
                // Reutilizamos la URL si el archivo no cambió
                imagenUrl = imagenSubida.url;
            } else {
                // Subimos la imagen por primera vez
                imagenUrl = await subirImagenProducto(imagen);

                // Guardamos la URL para posibles reintentos
                setImagenSubida({
                    archivo: imagen,
                    url: imagenUrl,
                });
            }

            const datosProducto = {
                nombre: formulario.nombre.trim(),
                descripcion: formulario.descripcion.trim(),
                precio: Number(formulario.precio),
                stock: Number(formulario.stock),
                categoria: categoriaFinal,
                materiales: formulario.materiales.trim(),
                medidas: formulario.medidas.trim(),
                destacado: formulario.destacado,
                imagenUrl,
            };

            const producto = await crearProducto(datosProducto);

            navigate(`/productos/${producto._id}`);
        } catch (error) {
            setErrorEnvio(
                error.message || "Ocurrió un error al crear el producto."
            );
        } finally {
            setEnviando(false);
        }
    };

    //Manejo de categorias
    useEffect(() => {
        let activo = true;

        const cargarCategorias = async () => {
            try {
                const data = await obtenerCategorias();

                if (activo) {
                    setCategorias(data);
                }
            } catch (error) {
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

    useEffect(() => {
        if (!imagen) {
            setVistaPrevia(null);
            return;
        }

        const url = URL.createObjectURL(imagen);
        setVistaPrevia(url);

        return () => URL.revokeObjectURL(url);
    }, [imagen]);

    return (
        <section className="crear-producto container">
            <div className="crear-producto__contenedor">
                <header className="crear-producto__encabezado">
                    <h1 className="texto-titulo-elegante texto-marca-primario">
                        Crear producto
                    </h1>
                    <p className="texto-principal">
                        Completá los datos para incorporar una nueva pieza
                        al catálogo de Hermanos Jota.
                    </p>
                </header>

                <form onSubmit={manejarEnvio} noValidate>
                    <fieldset className="crear-producto__seccion">
                        <legend className="texto-titulo-elegante fs-4 texto-marca-primario contacto-section-title">
                            Información principal
                        </legend>

                        <div className="row g-3">
                            <div className="col-12">
                                <label htmlFor="nombre" className="crear-producto__label">
                                    Nombre del producto *
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                    placeholder="Ej. Mesa de comedor Álamo"
                                    value={formulario.nombre}
                                    onChange={manejarCambio}
                                    aria-invalid={Boolean(errores.nombre)}
                                    aria-describedby={errores.nombre ? "error-nombre" : undefined}
                                    required
                                />
                                {errores.nombre && (
                                    <p id="error-nombre" className="crear-producto__error" role="alert">
                                        {errores.nombre}
                                    </p>
                                )}
                            </div>

                            <div className="col-12">
                                <label htmlFor="descripcion" className="crear-producto__label">
                                    Descripción *
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows={4}
                                    className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                    placeholder="Describí las características del producto..."
                                    value={formulario.descripcion}
                                    onChange={manejarCambio}
                                    aria-invalid={Boolean(errores.descripcion)}
                                    aria-describedby={errores.descripcion ? "error-descripcion" : undefined}
                                    required
                                />
                                {errores.descripcion && (
                                    <p id="error-descripcion" className="crear-producto__error" role="alert">
                                        {errores.descripcion}
                                    </p>
                                )}
                            </div>

                            <div className="col-12 col-md-6">
                                <label htmlFor="precio" className="crear-producto__label">
                                    Precio *
                                </label>
                                <input
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                    placeholder="0,00"
                                    value={formulario.precio}
                                    onChange={manejarCambio}
                                    aria-invalid={Boolean(errores.precio)}
                                    aria-describedby={errores.precio ? "error-precio" : undefined}
                                    required
                                />
                                {errores.precio && (
                                    <p id="error-precio" className="crear-producto__error" role="alert">
                                        {errores.precio}
                                    </p>
                                )}
                            </div>

                            <div className="col-12 col-md-6">
                                <label htmlFor="stock" className="crear-producto__label">
                                    Stock *
                                </label>
                                <input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                    value={formulario.stock}
                                    onChange={manejarCambio}
                                    aria-invalid={Boolean(errores.stock)}
                                    aria-describedby={errores.stock ? "error-stock" : undefined}
                                    required
                                />
                                {errores.stock && (
                                    <p id="error-stock" className="crear-producto__error" role="alert">
                                        {errores.stock}
                                    </p>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="crear-producto__seccion">
                        <legend className="texto-titulo-elegante fs-4 texto-marca-primario contacto-section-title">
                            Características
                        </legend>

                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label htmlFor="categoria" className="crear-producto__label">
                                    Categoría
                                </label>

                                <select
                                    id="categoria"
                                    name="categoria"
                                    className="crear-producto__input form-select rounded-0 p-3 bg-light border-0 texto-principal"
                                    value={formulario.categoria}
                                    onChange={manejarCambio}
                                    disabled={cargandoCategorias || Boolean(errorCategorias)}
                                    aria-invalid={Boolean(errores.categoria)}
                                    aria-describedby={
                                        errores.categoria ? "error-categoria" : undefined
                                    }
                                >
                                    <option value="">
                                        {cargandoCategorias
                                            ? "Cargando categorías..."
                                            : "Seleccioná una categoría"}
                                    </option>

                                    {categorias.map((categoria) => (
                                        <option key={categoria._id} value={categoria.nombre}>
                                            {categoria.nombre}
                                        </option>
                                    ))}

                                    <option value={OTRA_CATEGORIA}>
                                        + Otra categoría...
                                    </option>
                                </select>

                                {errores.categoria && (
                                    <p
                                        id="error-categoria"
                                        className="crear-producto__error"
                                        role="alert"
                                    >
                                        {errores.categoria}
                                    </p>
                                )}

                                {errorCategorias && (
                                    <p className="crear-producto__error" role="alert">
                                        {errorCategorias}
                                    </p>
                                )}

                            </div>

                            {formulario.categoria === OTRA_CATEGORIA && (
                                <div className="col-12 col-md-6">
                                    <label htmlFor="nuevaCategoria" className="crear-producto__label">
                                        Nueva categoría *
                                    </label>

                                    <input
                                        id="nuevaCategoria"
                                        className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                        placeholder="Ej. Exterior"
                                        value={nuevaCategoria}
                                        onChange={(event) => {
                                            setNuevaCategoria(event.target.value);
                                            setErrores((prev) => ({
                                                ...prev,
                                                nuevaCategoria: undefined,
                                            }));
                                        }}
                                        aria-invalid={Boolean(errores.nuevaCategoria)}
                                        aria-describedby={
                                            errores.nuevaCategoria ? "error-nuevaCategoria" : undefined
                                        }
                                        required
                                    />

                                    {errores.nuevaCategoria && (
                                        <p id="error-nuevaCategoria" className="crear-producto__error" role="alert">
                                            {errores.nuevaCategoria}
                                        </p>
                                    )}
                                </div>
                            )}

                            {["materiales", "medidas"].map((campo) => (
                                <div className="col-12 col-md-6" key={campo}>
                                    <label htmlFor={campo} className="crear-producto__label">
                                        {campo.charAt(0).toUpperCase() + campo.slice(1)}
                                    </label>

                                    <input
                                        id={campo}
                                        name={campo}
                                        className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                        placeholder="Opcional"
                                        value={formulario[campo]}
                                        onChange={manejarCambio}
                                    />
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    <div className="crear-producto__imagen-seccion">
                        <label htmlFor="imagen" className="crear-producto__label">
                            Imagen del producto *
                        </label>

                        <div
                            className={`crear-producto__dropzone ${
                                arrastrandoImagen ? "crear-producto__dropzone--activo" : ""
                            } ${errores.imagen ? "crear-producto__dropzone--error" : ""}`}
                            onDragEnter={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                if (!enviando) setArrastrandoImagen(true);
                            }}
                            onDragOver={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                if (event.dataTransfer) {
                                    event.dataTransfer.dropEffect = enviando ? "none" : "copy";
                                }
                            }}
                            onDragLeave={(event) => {
                                event.preventDefault();
                                event.stopPropagation();

                                if (!event.currentTarget.contains(event.relatedTarget)) {
                                    setArrastrandoImagen(false);
                                }
                            }}
                            onDrop={manejarDrop}
                        >
                            <input
                                ref={inputImagenRef}
                                id="imagen"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="crear-producto__file-input"
                                disabled={enviando}
                                onChange={(event) => {
                                    const archivo = event.target.files?.[0];
                                    seleccionarImagen(archivo);

                                    // Permite seleccionar nuevamente el mismo archivo.
                                    event.target.value = "";
                                }}
                                aria-invalid={Boolean(errores.imagen)}
                                aria-describedby="imagen-ayuda error-imagen"
                            />

                            <div className="crear-producto__dropzone-contenido">
                                <UploadCloud size={34} strokeWidth={1.5} aria-hidden="true"/>

                                <p className="crear-producto__dropzone-titulo">
                                    Arrastrá una imagen hasta acá
                                </p>

                                <p className="crear-producto__dropzone-subtitulo">
                                    o seleccioná un archivo desde tu dispositivo
                                </p>

                                <button
                                    type="button"
                                    className="crear-producto__seleccionar"
                                    onClick={() => inputImagenRef.current?.click()}
                                    disabled={enviando}
                                >
                                    <ImagePlus size={18} aria-hidden="true"/>
                                    Seleccionar imagen
                                </button>

                                <p id="imagen-ayuda" className="crear-producto__dropzone-ayuda">
                                    JPG, PNG o WebP · Máximo 5 MB
                                </p>
                            </div>
                        </div>

                        {errores.imagen && (
                            <p
                                id="error-imagen"
                                className="crear-producto__error"
                                role="alert"
                            >
                                {errores.imagen}
                            </p>
                        )}

                        {imagen && vistaPrevia && (
                            <div className="crear-producto__preview">
                                <img
                                    src={vistaPrevia}
                                    alt="Vista previa de la imagen seleccionada"
                                    className="crear-producto__preview-imagen"
                                />

                                <div className="crear-producto__preview-info">
                                    <p className="crear-producto__preview-nombre">
                                        {imagen.name}
                                    </p>

                                    <p className="crear-producto__preview-tamano">
                                        {(imagen.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="crear-producto__preview-eliminar"
                                    onClick={quitarImagen}
                                    disabled={enviando}
                                    aria-label={`Quitar imagen ${imagen.name}`}
                                    title="Quitar imagen"
                                >
                                    <X size={20} aria-hidden="true"/>
                                </button>
                            </div>
                        )}
                    </div>

                    <fieldset className="crear-producto__seccion">
                        <legend className="texto-titulo-elegante fs-4 texto-marca-primario contacto-section-title">
                            Configuración adicional
                        </legend>

                        <label className="crear-producto__checkbox">
                            <input
                                name="destacado"
                                type="checkbox"
                                checked={formulario.destacado}
                                onChange={manejarCambio}
                            />
                            <span>Mostrar como producto destacado</span>
                        </label>
                    </fieldset>

                    <div className="crear-producto__acciones">
                        {errorEnvio && (
                            <p className="crear-producto__error" role="alert">
                                {errorEnvio}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="texto-titulo-cta py-3 px-5 rounded-0 btn-marca-primario"
                            disabled={enviando || cargandoCategorias || Boolean(errorCategorias)}
                        >
                            {enviando ? "Creando producto..." : "Crear producto"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default CrearProducto;
