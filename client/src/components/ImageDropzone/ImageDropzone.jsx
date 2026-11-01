import { useEffect, useRef, useState } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";

export function ImageDropzone({
  archivo,
  onSeleccionarArchivo,
  error,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState(null);

  useEffect(() => {
    if (!archivo || !(archivo instanceof File)) {
      setVistaPrevia(null);
      return;
    }

    const url = URL.createObjectURL(archivo);
    setVistaPrevia(url);

    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const manejarDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setArrastrando(false);

    if (disabled) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      onSeleccionarArchivo(file);
    }
  };

  const quitarArchivo = () => {
    if (disabled) return;
    onSeleccionarArchivo(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="crear-producto__imagen-seccion">
      <label htmlFor="imagen" className="crear-producto__label">
        Imagen del producto *
      </label>

      <div
        className={`crear-producto__dropzone ${
          arrastrando ? "crear-producto__dropzone--activo" : ""
        } ${error ? "crear-producto__dropzone--error" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setArrastrando(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = disabled ? "none" : "copy";
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
          id="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="crear-producto__file-input"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onSeleccionarArchivo(file);
            }
            e.target.value = "";
          }}
          aria-invalid={Boolean(error)}
          aria-describedby="imagen-ayuda error-imagen"
        />

        <div className="crear-producto__dropzone-contenido">
          <UploadCloud size={34} strokeWidth={1.5} aria-hidden="true" />

          <p className="crear-producto__dropzone-titulo">
            Arrastrá una imagen hasta acá
          </p>

          <p className="crear-producto__dropzone-subtitulo">
            o seleccioná un archivo desde tu dispositivo
          </p>

          <button
            type="button"
            className="crear-producto__seleccionar"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            <ImagePlus size={18} aria-hidden="true" />
            Seleccionar imagen
          </button>

          <p id="imagen-ayuda" className="crear-producto__dropzone-ayuda">
            JPG, PNG o WebP · Máximo 5 MB
          </p>
        </div>
      </div>

      {error && (
        <p id="error-imagen" className="crear-producto__error" role="alert">
          {error}
        </p>
      )}

      {archivo && vistaPrevia && (
        <div className="crear-producto__preview">
          <img
            src={vistaPrevia}
            alt="Vista previa de la imagen seleccionada"
            className="crear-producto__preview-imagen"
          />

          <div className="crear-producto__preview-info">
            <p className="crear-producto__preview-nombre">{archivo.name}</p>
            <p className="crear-producto__preview-tamano">
              {(archivo.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <button
            type="button"
            className="crear-producto__preview-eliminar"
            onClick={quitarArchivo}
            disabled={disabled}
            aria-label={`Quitar imagen ${archivo.name}`}
            title="Quitar imagen"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageDropzone;
