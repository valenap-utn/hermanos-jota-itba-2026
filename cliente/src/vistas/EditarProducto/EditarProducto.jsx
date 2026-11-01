import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  actualizarProducto,
  eliminarProducto,
  obtenerProductoPorId,
} from "../../services/productosService";
import ProductoForm from "../../components/ProductoForm/ProductoForm";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { useCart } from "../../context/CartContext";
import "./EditarProducto.styles.css";

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sincronizarProducto } = useCart();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [guardando, setGuardando] = useState(false);
  const [procesandoForm, setProcesandoForm] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");

  const cicloCargaRef = useRef(0);

  useEffect(() => {
    const cicloActual = ++cicloCargaRef.current;
    const esCicloVigente = () => cicloCargaRef.current === cicloActual;

    setProducto(null);
    setCargando(true);
    setErrorCarga(null);
    setErrorOperacion("");
    setModalVisible(false);
    setGuardando(false);
    setEliminando(false);
    setProcesandoForm(false);

    async function cargarProducto() {
      try {
        const data = await obtenerProductoPorId(id);
        if (esCicloVigente()) {
          setProducto(data);
        }
      } catch (err) {
        if (esCicloVigente()) {
          const es400o404 = err.status === 400 || err.status === 404;
          setErrorCarga({
            tipo: es400o404 ? "no_encontrado" : "error_servidor",
            status: err.status,
            mensaje: es400o404
              ? "No pudimos encontrar este producto. Puede que ya no esté disponible."
              : "No pudimos cargar el producto. Intentá nuevamente más tarde.",
          });
        }
      } finally {
        if (esCicloVigente()) {
          setCargando(false);
        }
      }
    }

    cargarProducto();

    return () => {
      cicloCargaRef.current += 1;
    };
  }, [id]);

  const handleCancelar = () => {
    if (operacionEnCurso) return;
    navigate(`/productos/${id}`);
  };

  const handleGuardar = async (datos) => {
    const cicloActual = cicloCargaRef.current;
    if (cicloCargaRef.current !== cicloActual) return;

    setGuardando(true);
    setErrorOperacion("");

    try {
      if (cicloCargaRef.current !== cicloActual) return;
      const productoActualizado = await actualizarProducto(id, datos);
      sincronizarProducto(productoActualizado);
      if (cicloCargaRef.current !== cicloActual) return;

      navigate(`/productos/${id}`);
    } catch (err) {
      if (cicloCargaRef.current !== cicloActual) return;
      setErrorOperacion(
        err.message || "No se pudo actualizar el producto. Intentá nuevamente."
      );
    } finally {
      if (cicloCargaRef.current === cicloActual) {
        setGuardando(false);
      }
    }
  };

  const handleEliminar = async () => {
    const cicloActual = cicloCargaRef.current;
    if (cicloCargaRef.current !== cicloActual) return;

    setEliminando(true);
    setErrorOperacion("");

    try {
      if (cicloCargaRef.current !== cicloActual) return;
      await eliminarProducto(id);
      sincronizarProducto(id, { eliminado: true });
      if (cicloCargaRef.current !== cicloActual) return;

      navigate("/productos");
    } catch (err) {
      if (cicloCargaRef.current !== cicloActual) return;
      setModalVisible(false);
      setErrorOperacion(
        err.message || "No se pudo eliminar el producto. Intentá nuevamente."
      );
    } finally {
      if (cicloCargaRef.current === cicloActual) {
        setEliminando(false);
      }
    }
  };

  if (cargando) {
    return (
      <section className="editar-producto container">
        <div className="text-center my-5" role="status" aria-live="polite">
          <div className="spinner-border" aria-hidden="true" />
          <p className="texto-principal mt-3">Cargando producto...</p>
        </div>
      </section>
    );
  }

  if (errorCarga || !producto) {
    const esNoEncontrado = errorCarga?.tipo === "no_encontrado";
    return (
      <section className="editar-producto container">
        <div className="text-center my-5" role="alert">
          <h1 className="texto-titulo-elegante texto-marca-primario">
            {esNoEncontrado ? "Producto no encontrado" : "No pudimos cargar el producto"}
          </h1>
          <p className="texto-principal mb-4">
            {errorCarga?.mensaje || "El producto que buscás no existe o no está disponible."}
          </p>
          <button
            type="button"
            className="texto-titulo-cta py-3 px-5 rounded-0 btn-marca-primario"
            onClick={() => navigate("/productos")}
          >
            Volver al catálogo
          </button>
        </div>
      </section>
    );
  }

  const operacionEnCurso =
    guardando || eliminando || procesandoForm || modalVisible;

  return (
    <section className="editar-producto container">
      <div className="editar-producto__contenedor">
        <header className="editar-producto__encabezado">
          <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
            <h1 className="texto-titulo-elegante texto-marca-primario mb-0">
              Editar producto
            </h1>
            <button
              type="button"
              className="texto-titulo-cta editar-producto__btn-cancelar"
              onClick={handleCancelar}
              disabled={operacionEnCurso}
            >
              Cancelar
            </button>
          </div>
          <p className="texto-principal">{producto.nombre}</p>
        </header>

        <ProductoForm
          key={id}
          initialValues={producto}
          onSubmit={handleGuardar}
          cargando={operacionEnCurso}
          onProcesandoChange={setProcesandoForm}
        />

        {errorOperacion && (
          <div className="editar-producto__error-operacion mt-3" role="alert">
            <p className="mb-0">{errorOperacion}</p>
          </div>
        )}

        <div className="editar-producto__zona-peligro mt-4">
          <button
            type="button"
            className="texto-titulo-cta editar-producto__btn-eliminar"
            onClick={() => {
              setErrorOperacion("");
              setModalVisible(true);
            }}
            disabled={operacionEnCurso}
          >
            Eliminar producto
          </button>
        </div>
      </div>

      <ConfirmModal
        show={modalVisible}
        title="Eliminar producto"
        message={`¿Confirmás que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`}
        actionLabel="Eliminar definitivamente"
        onConfirmar={handleEliminar}
        onCancelar={() => setModalVisible(false)}
        procesando={eliminando}
      />
    </section>
  );
}

export default EditarProducto;

