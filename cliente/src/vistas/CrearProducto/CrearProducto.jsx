import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { obtenerCategorias } from "../../services/categoriasService";
import { crearProducto } from "../../services/productosService";
import { productoSchema } from "../../schemas/productoSchema";
import ImageDropzone from "../../components/ImageDropzone/ImageDropzone";
import "./CrearProducto.styles.css";

const OTRA_CATEGORIA = "__otra__";

function CrearProducto() {
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "0",
      categoria: "",
      nuevaCategoria: "",
      materiales: "",
      medidas: "",
      destacado: false,
      imagen: null,
    },
  });

  const categoriaSeleccionada = watch("categoria");

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

  const onSubmit = async (data) => {
    setErrorEnvio("");

    try {
      const formData = new FormData();
      formData.append("nombre", data.nombre.trim());
      formData.append("descripcion", data.descripcion.trim());
      formData.append("precio", data.precio);
      formData.append("stock", data.stock);
      formData.append("materiales", (data.materiales || "").trim());
      formData.append("medidas", (data.medidas || "").trim());
      formData.append("destacado", data.destacado);

      const categoriaFinal =
        data.categoria === OTRA_CATEGORIA
          ? data.nuevaCategoria.trim()
          : data.categoria;
      formData.append("categoria", categoriaFinal);
      formData.append("imagen", data.imagen);

      const producto = await crearProducto(formData);
      navigate(`/productos/${producto._id}`);
    } catch (error) {
      setErrorEnvio(error.message || "Ocurrió un error al crear el producto.");
    }
  };

  return (
    <section className="crear-producto container">
      <div className="crear-producto__contenedor">
        <header className="crear-producto__encabezado">
          <h1 className="texto-titulo-elegante texto-marca-primario">
            Crear producto
          </h1>
          <p className="texto-principal">
            Completá los datos para incorporar una nueva pieza al catálogo de
            Hermanos Jota.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                  {...register("nombre")}
                  className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                  placeholder="Ej. Mesa de comedor Álamo"
                  aria-invalid={Boolean(errors.nombre)}
                  aria-describedby={errors.nombre ? "error-nombre" : undefined}
                  disabled={isSubmitting}
                />
                {errors.nombre && (
                  <p
                    id="error-nombre"
                    className="crear-producto__error"
                    role="alert"
                  >
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="col-12">
                <label htmlFor="descripcion" className="crear-producto__label">
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
                  {...register("descripcion")}
                  rows={4}
                  className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                  placeholder="Describí las características del producto..."
                  aria-invalid={Boolean(errors.descripcion)}
                  aria-describedby={
                    errors.descripcion ? "error-descripcion" : undefined
                  }
                  disabled={isSubmitting}
                />
                {errors.descripcion && (
                  <p
                    id="error-descripcion"
                    className="crear-producto__error"
                    role="alert"
                  >
                    {errors.descripcion.message}
                  </p>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="precio" className="crear-producto__label">
                  Precio *
                </label>
                <input
                  id="precio"
                  {...register("precio")}
                  type="number"
                  min="0"
                  step="0.01"
                  className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                  placeholder="0,00"
                  aria-invalid={Boolean(errors.precio)}
                  aria-describedby={errors.precio ? "error-precio" : undefined}
                  disabled={isSubmitting}
                />
                {errors.precio && (
                  <p
                    id="error-precio"
                    className="crear-producto__error"
                    role="alert"
                  >
                    {errors.precio.message}
                  </p>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="stock" className="crear-producto__label">
                  Stock *
                </label>
                <input
                  id="stock"
                  {...register("stock")}
                  type="number"
                  min="0"
                  step="1"
                  className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                  aria-invalid={Boolean(errors.stock)}
                  aria-describedby={errors.stock ? "error-stock" : undefined}
                  disabled={isSubmitting}
                />
                {errors.stock && (
                  <p
                    id="error-stock"
                    className="crear-producto__error"
                    role="alert"
                  >
                    {errors.stock.message}
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
                  Categoría *
                </label>

                <select
                  id="categoria"
                  {...register("categoria")}
                  className="crear-producto__input form-select rounded-0 p-3 bg-light border-0 texto-principal"
                  disabled={
                    isSubmitting ||
                    cargandoCategorias ||
                    Boolean(errorCategorias)
                  }
                  aria-invalid={Boolean(errors.categoria)}
                  aria-describedby={
                    errors.categoria ? "error-categoria" : undefined
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

                  <option value={OTRA_CATEGORIA}>+ Otra categoría...</option>
                </select>

                {errors.categoria && (
                  <p
                    id="error-categoria"
                    className="crear-producto__error"
                    role="alert"
                  >
                    {errors.categoria.message}
                  </p>
                )}

                {errorCategorias && (
                  <p className="crear-producto__error" role="alert">
                    {errorCategorias}
                  </p>
                )}
              </div>

              {categoriaSeleccionada === OTRA_CATEGORIA && (
                <div className="col-12 col-md-6">
                  <label
                    htmlFor="nuevaCategoria"
                    className="crear-producto__label"
                  >
                    Nueva categoría *
                  </label>

                  <input
                    id="nuevaCategoria"
                    {...register("nuevaCategoria")}
                    className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                    placeholder="Ej. Exterior"
                    aria-invalid={Boolean(errors.nuevaCategoria)}
                    aria-describedby={
                      errors.nuevaCategoria
                        ? "error-nuevaCategoria"
                        : undefined
                    }
                    disabled={isSubmitting}
                  />

                  {errors.nuevaCategoria && (
                    <p
                      id="error-nuevaCategoria"
                      className="crear-producto__error"
                      role="alert"
                    >
                      {errors.nuevaCategoria.message}
                    </p>
                  )}
                </div>
              )}

              <div className="col-12 col-md-6">
                <label htmlFor="materiales" className="crear-producto__label">
                  Materiales
                </label>
                <input
                  id="materiales"
                  {...register("materiales")}
                  className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                  placeholder="Opcional"
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="medidas" className="crear-producto__label">
                  Medidas
                </label>
                <input
                  id="medidas"
                  {...register("medidas")}
                  className="crear-producto__input form-control rounded-0 p-3 bg-light border-0 texto-principal"
                  placeholder="Opcional"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </fieldset>

          <Controller
            name="imagen"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <ImageDropzone
                archivo={field.value}
                onSeleccionarArchivo={(archivo) => field.onChange(archivo)}
                error={error?.message}
                disabled={isSubmitting}
              />
            )}
          />

          <fieldset className="crear-producto__seccion">
            <legend className="texto-titulo-elegante fs-4 texto-marca-primario contacto-section-title">
              Configuración adicional
            </legend>

            <label className="crear-producto__checkbox">
              <input
                type="checkbox"
                {...register("destacado")}
                disabled={isSubmitting}
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
              disabled={
                isSubmitting ||
                cargandoCategorias ||
                Boolean(errorCategorias)
              }
            >
              {isSubmitting ? "Creando producto..." : "Crear producto"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CrearProducto;
