import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  actualizarProducto,
  eliminarProducto,
  obtenerProductoPorId,
} from "../../services/productosService";
import ProductoForm from "../../components/ProductoForm/ProductoForm";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import ErrorState from "../../components/ErrorState/ErrorState";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import "./EditarProducto.styles.css";

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sincronizarProducto } = useCart();
  const { mostrarToast } = useToast();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [recarga, setRecarga] = useState(0);

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
  }, [id, recarga]);

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

      mostrarToast("Producto actualizado correctamente.", "success");
      navigate(`/productos/${id}`);
    } catch (err) {
      if (cicloCargaRef.current !== cicloActual) return;
      const msg = err.message || "No se pudo actualizar el producto. Intentá nuevamente.";
      setErrorOperacion(msg);
      mostrarToast(msg, "error");
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

      mostrarToast(`"${producto?.nombre || "Producto"}" fue eliminado correctamente.`, "success");
      navigate("/productos");
    } catch (err) {
      if (cicloCargaRef.current !== cicloActual) return;
      setModalVisible(false);
      const msg = err.message || "No se pudo eliminar el producto. Intentá nuevamente.";
      setErrorOperacion(msg);
      mostrarToast(msg, "error");
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
        <div className="container text-center my-5">
          <ErrorState
            titulo={esNoEncontrado ? "Producto no encontrado" : "No pudimos cargar el producto"}
            mensaje={errorCarga?.mensaje || "El producto que buscás no existe o no está disponible."}
            textoBoton={esNoEncontrado ? "Volver al catálogo" : "Reintentar"}
            onAccion={esNoEncontrado ? () => navigate("/productos") : () => setRecarga((n) => n + 1)}
            textoSecundario={!esNoEncontrado ? "Volver al catálogo" : undefined}
            onAccionSecundaria={!esNoEncontrado ? () => navigate("/productos") : undefined}
          />
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
          <div className="d-flex justify-content-between align-items-center gap-3">
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
        </header>

        <ProductoForm
          key={id}
          initialValues={producto}
          onSubmit={handleGuardar}
          onEliminar={() => {
            setErrorOperacion("");
            setModalVisible(true);
          }}
          cargando={operacionEnCurso}
          onProcesandoChange={setProcesandoForm}
        />

        {errorOperacion && (
          <div className="editar-producto__error-operacion mt-3" role="alert">
            <p className="mb-0">{errorOperacion}</p>
          </div>
        )}
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
