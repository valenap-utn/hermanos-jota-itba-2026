import {useEffect, useRef, useState} from "react";
import {ImagePlus, UploadCloud, X} from "lucide-react";
import {validarArchivoImagen} from "./productoForm.utils";

function SelectorImagenProducto({
                                    modo = "editar",
                                    imagenActual = "",
                                    archivo = null,
                                    deshabilitado = false,
                                    error = "",
                                    onSeleccionarArchivo,
                                    onQuitarArchivo,
                                    onError,
                                }) {
    const esCreacion = modo === "crear";
    const inputId = esCreacion ? "imagen" : "archivo";

    const [arrastrando, setArrastrando] = useState(false);
    const [vistaPrevia, setVistaPrevia] = useState(null);
    const [errorPreview, setErrorPreview] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        if (!archivo) {
            setVistaPrevia(null);
            return;
        }

        const url = URL.createObjectURL(archivo);
        setVistaPrevia(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [archivo]);

    const procesarArchivo = (file) => {
        if (deshabilitado || !file) return;

        const errorValidacion = validarArchivoImagen(file);

        if (errorValidacion) {
            onError?.(errorValidacion);
            return;
        }

        onError?.("");
        onSeleccionarArchivo?.(file);
    };

    const manejarDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setArrastrando(false);

        if (deshabilitado) return;

        const file = event.dataTransfer?.files?.[0];

        if (file) {
            procesarArchivo(file);
        }
    };

    const quitarArchivo = () => {
        if (deshabilitado) return;

        onError?.("");
        onQuitarArchivo?.();

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const previewMostrada =
        vistaPrevia || imagenActual.trim();

    useEffect(() => {
        setErrorPreview(false);
    }, [previewMostrada]);

    return (
        <div className="producto-form__imagen-selector">
            <label
                htmlFor={inputId}
                className="producto-form__label"
            >
                {esCreacion
                    ? "Imagen del producto *"
                    : "Reemplazar imagen con archivo nuevo (opcional)"}
            </label>

            <div
                className={`producto-form__dropzone ${
                    arrastrando ? "producto-form__dropzone--activo" : ""
                } ${
                    error ? "producto-form__dropzone--error" : ""
                }`}
                onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!deshabilitado) {
                        setArrastrando(true);
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (e.dataTransfer) {
                        e.dataTransfer.dropEffect =
                            deshabilitado ? "none" : "copy";
                    }
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setArrastrando(false);
                    }
                }}
                onDrop={manejarDrop}
            >
                <input
                    ref={inputRef}
                    id={inputId}
                    name={inputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="producto-form__file-input"
                    disabled={deshabilitado}
                    aria-required={esCreacion}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error
                            ? `${inputId}-ayuda error-${inputId}`
                            : `${inputId}-ayuda`
                    }
                    onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                            procesarArchivo(file);
                        }

                        e.target.value = "";
                    }}
                />

                <div className="producto-form__dropzone-contenido">
                    <UploadCloud
                        size={32}
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />

                    <p className="producto-form__dropzone-titulo">
                        {esCreacion
                            ? "Arrastrá una imagen hasta acá"
                            : "Arrastrá un archivo para cambiar la imagen"}
                    </p>

                    <p className="producto-form__dropzone-subtitulo">
                        o seleccioná una imagen desde tu dispositivo
                    </p>

                    <button
                        type="button"
                        className="producto-form__seleccionar"
                        onClick={() => inputRef.current?.click()}
                        disabled={deshabilitado}
                    >
                        <ImagePlus size={18} aria-hidden="true"/>

                        {esCreacion
                            ? "Seleccionar imagen"
                            : "Seleccionar nueva imagen"}
                    </button>

                    <p
                        id={`${inputId}-ayuda`}
                        className="producto-form__dropzone-ayuda"
                    >
                        JPG, PNG o WebP · Máximo 5 MB
                    </p>
                </div>
            </div>

            {error && (
                <p
                    id={`error-${inputId}`}
                    className="producto-form__error"
                    role="alert"
                >
                    {error}
                </p>
            )}

            {previewMostrada && (
                <div className="producto-form__preview">
                    {!errorPreview && (
                        <img
                            src={previewMostrada}
                            alt="Vista previa de la imagen del producto"
                            className="producto-form__preview-imagen"
                            onError={() => setErrorPreview(true)}
                        />
                    )}

                    <div className="producto-form__preview-info">
                        <p className="producto-form__preview-titulo mb-0 texto-principal fw-medium">
                            {archivo
                                ? archivo.name
                                : "Imagen actual del producto"}
                        </p>

                        <p className="producto-form__preview-subtitulo mb-0 texto-secundario-leyenda">
                            {archivo
                                ? `${(archivo.size / (1024 * 1024)).toFixed(2)} MB (se subirá al guardar)`
                                : imagenActual}
                        </p>
                    </div>

                    {archivo && (
                        <button
                            type="button"
                            className="producto-form__preview-eliminar ms-auto btn btn-link p-1"
                            onClick={quitarArchivo}
                            disabled={deshabilitado}
                            aria-label={
                                esCreacion
                                    ? "Quitar imagen seleccionada"
                                    : "Cancelar reemplazo de imagen"
                            }
                            title={
                                esCreacion
                                    ? "Quitar imagen"
                                    : "Cancelar reemplazo"
                            }
                        >
                            <X size={20} aria-hidden="true"/>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SelectorImagenProducto;
