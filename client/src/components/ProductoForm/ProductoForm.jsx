import {useEffect, useMemo, useRef, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {crearCategoria, obtenerCategorias,} from "../../services/categoriasService";

import {subirImagenProducto} from "../../services/productosService";

import {crearProductoSchema, OTRA_CATEGORIA,} from "../../schemas/productoSchema";

import {construirPayload, normalizarValoresIniciales,} from "./productoForm.utils";

import SelectorImagenProducto from "./SelectorImagenProducto";
import {useToast} from "../../context/ToastContext";

import "./ProductoForm.styles.css";

function MarcaObligatoria() {
    return (
        <>
            <span className="producto-form__asterisco" aria-hidden="true">*</span>
            <span className="producto-form__requerido-texto">(obligatorio)</span>
        </>
    );
}

function ProductoForm({
                          modo = "editar",
                          initialValues = {},
                          onSubmit,
                          onEliminar,
                          cargando = false,
                          onProcesandoChange,
                      }) {
    const esCreacion = modo === "crear";
    const montadoRef = useRef(true);
    const {mostrarToast} = useToast();

    const [categorias, setCategorias] = useState([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [errorCategorias, setErrorCategorias] = useState("");

    const [categoriaCreada, setCategoriaCreada] = useState(null);
    const [imagenSubida, setImagenSubida] = useState(null);
    const [errorArchivo, setErrorArchivo] = useState("");
    const [errorEnvio, setErrorEnvio] = useState("");

    const resolver = useMemo(
        () => zodResolver(crearProductoSchema(modo)),
        [modo]
    );

    const {
        register,
        handleSubmit,
        control,
        watch,
        clearErrors,
        formState: {errors, isSubmitting},
    } = useForm({
        resolver,
        defaultValues: normalizarValoresIniciales(initialValues),
        shouldFocusError: false,
    });

    const categoriaSeleccionada = watch("categoria");
    const archivoImagen = watch("imagen");
    const imagenUrl = watch("imagenUrl");

    const procesando = cargando || isSubmitting;

    useEffect(() => {
        montadoRef.current = true;

        return () => {
            montadoRef.current = false;
        };
    }, []);

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

    const onValidationError = (formErrors) => {
        const primerCampo = Object.keys(formErrors)[0];

        if (primerCampo) {
            const elemento = document.getElementById(
                primerCampo === "imagen" && !esCreacion
                    ? "archivo"
                    : primerCampo
            );

            elemento?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            elemento?.focus({preventScroll: true});
        }

        const msg = esCreacion
            ? "Completá los campos obligatorios para crear el producto."
            : "Completá los campos obligatorios para guardar el producto.";

        setErrorEnvio(msg);

        mostrarToast(
            esCreacion
                ? msg
                : "Hay campos obligatorios incompletos. Revisá el formulario.",
            "error"
        );
    };

    const manejarSubmit = async (data) => {
        setErrorEnvio("");

        if (errorArchivo) {
            onValidationError({imagen: true});
            return;
        }

        onProcesandoChange?.(true);

        try {
            if (esCreacion) {
                await onSubmit(data);
                return;
            }

            let categoriaFinal = data.categoria;

            if (data.categoria === OTRA_CATEGORIA) {
                if (categoriaCreada?.nombre === data.nuevaCategoria) {
                    categoriaFinal = categoriaCreada.nombre;
                } else {
                    const categoria = await crearCategoria(data.nuevaCategoria);

                    if (!montadoRef.current) return;

                    setCategoriaCreada(categoria);
                    categoriaFinal = categoria.nombre;
                }
            }

            let imagenUrlFinal = data.imagenUrl;

            if (data.imagen) {
                if (imagenSubida?.archivo === data.imagen) {
                    imagenUrlFinal = imagenSubida.url;
                } else {
                    const url = await subirImagenProducto(data.imagen);

                    if (!montadoRef.current) return;

                    setImagenSubida({
                        archivo: data.imagen,
                        url,
                    });

                    imagenUrlFinal = url;
                }
            }

            const payload = construirPayload(data, {
                categoriaFinal,
                imagenUrlFinal,
            });

            await onSubmit(payload);
        } catch (err) {
            if (!montadoRef.current) return;

            setErrorEnvio(
                err.message || "Ocurrió un error al procesar el formulario."
            );
        } finally {
            if (montadoRef.current) {
                onProcesandoChange?.(false);
            }
        }
    };

    return (
        <form
            className="producto-form"
            noValidate
            onSubmit={(event) => {
                if (procesando || cargandoCategorias || errorCategorias) {
                    event.preventDefault();
                    return;
                }

                return handleSubmit(manejarSubmit, onValidationError)(event);
            }}
        >
            <fieldset className="producto-form__seccion">
                <legend className="texto-titulo-elegante fs-4 texto-marca-primario mb-3">
                    Información principal
                </legend>

                <div className="row g-3">
                    <div className="col-12">
                        <label htmlFor="nombre" className="producto-form__label">
                            Nombre del producto <MarcaObligatoria />
                        </label>

                        <input
                            id="nombre"
                            {...register("nombre")}
                            type="text"
                            className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                            placeholder="Ej. Mesa de comedor Álamo"
                            disabled={procesando}
                            aria-invalid={Boolean(errors.nombre)}
                            aria-describedby={
                                errors.nombre ? "error-nombre" : undefined
                            }
                            required
                        />

                        {errors.nombre && (
                            <p
                                id="error-nombre"
                                className="producto-form__error"
                                role="alert"
                            >
                                {errors.nombre.message}
                            </p>
                        )}
                    </div>

                    <div className="col-12">
                        <label htmlFor="descripcion" className="producto-form__label">
                            Descripción <MarcaObligatoria />
                        </label>

                        <textarea
                            id="descripcion"
                            {...register("descripcion")}
                            rows={4}
                            className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                            placeholder="Describí las características del producto..."
                            disabled={procesando}
                            aria-invalid={Boolean(errors.descripcion)}
                            aria-describedby={
                                errors.descripcion ? "error-descripcion" : undefined
                            }
                            required
                        />

                        {errors.descripcion && (
                            <p
                                id="error-descripcion"
                                className="producto-form__error"
                                role="alert"
                            >
                                {errors.descripcion.message}
                            </p>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label htmlFor="precio" className="producto-form__label">
                            Precio <MarcaObligatoria />
                        </label>

                        <input
                            id="precio"
                            {...register("precio")}
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                            placeholder="0.00"
                            disabled={procesando}
                            aria-invalid={Boolean(errors.precio)}
                            aria-describedby={
                                errors.precio ? "error-precio" : undefined
                            }
                            required
                        />

                        {errors.precio && (
                            <p
                                id="error-precio"
                                className="producto-form__error"
                                role="alert"
                            >
                                {errors.precio.message}
                            </p>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label htmlFor="stock" className="producto-form__label">
                            Stock <MarcaObligatoria />
                        </label>

                        <input
                            id="stock"
                            {...register("stock")}
                            type="number"
                            min="0"
                            step="1"
                            className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                            placeholder="0"
                            disabled={procesando}
                            aria-invalid={Boolean(errors.stock)}
                            aria-describedby={
                                errors.stock ? "error-stock" : undefined
                            }
                            required
                        />

                        {errors.stock && (
                            <p
                                id="error-stock"
                                className="producto-form__error"
                                role="alert"
                            >
                                {errors.stock.message}
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
                            Categoría <MarcaObligatoria />
                        </label>

                        <Controller
                            name="categoria"
                            control={control}
                            render={({field}) => (
                                <select
                                    id="categoria"
                                    {...field}
                                    className="form-select rounded-0 p-3 bg-light border-0 texto-principal"
                                    disabled={
                                        procesando ||
                                        cargandoCategorias ||
                                        Boolean(errorCategorias)
                                    }
                                    aria-invalid={Boolean(errors.categoria)}
                                    aria-describedby={
                                        errors.categoria ? "error-categoria" : undefined
                                    }
                                    required
                                >
                                    <option value="">
                                        {cargandoCategorias
                                            ? "Cargando categorías..."
                                            : "Seleccioná una categoría"}
                                    </option>

                                    {categorias.map((cat) => (
                                        <option
                                            key={cat._id || cat.nombre}
                                            value={cat.nombre}
                                        >
                                            {cat.nombre}
                                        </option>
                                    ))}

                                    {categoriaSeleccionada &&
                                        categoriaSeleccionada !== OTRA_CATEGORIA &&
                                        !categorias.some(
                                            (cat) => cat.nombre === categoriaSeleccionada
                                        ) && (
                                            <option value={categoriaSeleccionada}>
                                                {categoriaSeleccionada}
                                            </option>
                                        )}

                                    <option value={OTRA_CATEGORIA}>
                                        + Otra categoría...
                                    </option>
                                </select>
                            )}
                        />

                        {errors.categoria && (
                            <p
                                id="error-categoria"
                                className="producto-form__error"
                                role="alert"
                            >
                                {errors.categoria.message}
                            </p>
                        )}

                        {errorCategorias && (
                            <p className="producto-form__error" role="alert">
                                {errorCategorias}
                            </p>
                        )}
                    </div>

                    {categoriaSeleccionada === OTRA_CATEGORIA && (
                        <div className="col-12 col-md-6">
                            <label
                                htmlFor="nuevaCategoria"
                                className="producto-form__label"
                            >
                                Nueva categoría <MarcaObligatoria />
                            </label>

                            <input
                                id="nuevaCategoria"
                                {...register("nuevaCategoria")}
                                type="text"
                                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                placeholder="Ej. Exterior"
                                disabled={procesando}
                                aria-invalid={Boolean(errors.nuevaCategoria)}
                                aria-describedby={
                                    errors.nuevaCategoria
                                        ? "error-nuevaCategoria"
                                        : undefined
                                }
                                required
                            />

                            {errors.nuevaCategoria && (
                                <p
                                    id="error-nuevaCategoria"
                                    className="producto-form__error"
                                    role="alert"
                                >
                                    {errors.nuevaCategoria.message}
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
                            {...register("medidas")}
                            type="text"
                            className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                            placeholder="Ej. 180 x 90 x 75 cm (opcional)"
                            disabled={procesando}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <label htmlFor="materiales" className="producto-form__label">
                            Materiales
                        </label>

                        <input
                            id="materiales"
                            {...register("materiales")}
                            type="text"
                            className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                            placeholder="Ej. Madera maciza de petiribí (opcional)"
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
                    {!esCreacion && (
                        <div className="col-12">
                            <label
                                htmlFor="imagenUrl"
                                className="producto-form__label"
                            >
                                URL o ruta de imagen{" "}
                                {archivoImagen
                                    ? "(opcional si se sube archivo)"
                                    : <MarcaObligatoria />}
                            </label>

                            <input
                                id="imagenUrl"
                                {...register("imagenUrl")}
                                type="text"
                                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                placeholder="https://... o /img/productos/..."
                                disabled={procesando}
                                aria-invalid={Boolean(errors.imagenUrl)}
                                aria-describedby={
                                    errors.imagenUrl
                                        ? "error-imagenUrl"
                                        : undefined
                                }
                                required={!archivoImagen}
                            />

                            {errors.imagenUrl && (
                                <p
                                    id="error-imagenUrl"
                                    className="producto-form__error"
                                    role="alert"
                                >
                                    {errors.imagenUrl.message}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="col-12">
                        <Controller
                            name="imagen"
                            control={control}
                            render={({field, fieldState}) => (
                                <SelectorImagenProducto
                                    modo={modo}
                                    imagenActual={esCreacion ? "" : imagenUrl}
                                    archivo={field.value}
                                    deshabilitado={procesando}
                                    error={
                                        errorArchivo ||
                                        fieldState.error?.message ||
                                        ""
                                    }
                                    onError={setErrorArchivo}
                                    onSeleccionarArchivo={(archivo) => {
                                        field.onChange(archivo);
                                        setImagenSubida(null);
                                        setErrorArchivo("");
                                        clearErrors(["imagen", "imagenUrl"]);
                                    }}
                                    onQuitarArchivo={() => {
                                        field.onChange(null);
                                        setImagenSubida(null);
                                        setErrorArchivo("");
                                        clearErrors("imagen");
                                    }}
                                />
                            )}
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
                        {...register("destacado")}
                        type="checkbox"
                        disabled={procesando}
                    />

                    <span className="texto-principal">
            Mostrar como producto destacado
          </span>
                </label>
            </fieldset>


            {errorEnvio && (
                <div
                    className="producto-form__error-envio mb-3"
                    role="alert"
                >
                    <p className="producto-form__error">
                        {errorEnvio}
                    </p>
                </div>
            )}

            <div className="producto-form__acciones">
                {onEliminar && (
                    <button
                        type="button"
                        className="texto-titulo-cta producto-form__btn-eliminar rounded-0"
                        onClick={onEliminar}
                        disabled={procesando}
                    >
                        Eliminar producto
                    </button>
                )}

                <button
                    type="submit"
                    className="texto-titulo-cta py-3 px-5 rounded-0 btn-marca-primario producto-form__submit"
                    disabled={
                        procesando ||
                        cargandoCategorias ||
                        Boolean(errorCategorias)
                    }
                >
                    {esCreacion
                        ? isSubmitting
                            ? "Creando producto..."
                            : "Crear producto"
                        : procesando
                            ? "Guardando..."
                            : "Guardar producto"}
                </button>
            </div>
        </form>
    );
}

export default ProductoForm;
