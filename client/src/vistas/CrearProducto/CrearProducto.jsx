import {useNavigate} from "react-router-dom";
import {crearProducto} from "../../services/productosService";
import {OTRA_CATEGORIA} from "../../schemas/productoSchema";
import ProductoForm from "../../components/ProductoForm/ProductoForm";
import {useCart} from "../../context/CartContext";
import {useToast} from "../../context/ToastContext";

import "./CrearProducto.styles.css";

function CrearProducto() {
    const navigate = useNavigate();
    const {sincronizarProducto} = useCart();
    const {mostrarToast} = useToast();

    const handleCrear = async (data) => {
        try {
            const formData = new FormData();

            formData.append("nombre", data.nombre);
            formData.append("descripcion", data.descripcion);
            formData.append("precio", data.precio);
            formData.append("stock", data.stock);
            formData.append("materiales", data.materiales);
            formData.append("medidas", data.medidas);
            formData.append("destacado", data.destacado);

            const categoriaFinal =
                data.categoria === OTRA_CATEGORIA
                    ? data.nuevaCategoria
                    : data.categoria;

            formData.append("categoria", categoriaFinal);
            formData.append("imagen", data.imagen);

            const producto = await crearProducto(formData);

            sincronizarProducto(producto);

            mostrarToast(
                `"${producto.nombre}" fue creado exitosamente.`,
                "success"
            );

            navigate(`/productos/${producto._id}`);
        } catch (error) {
            const msg =
                error.message || "Ocurrió un error al crear el producto.";

            mostrarToast(msg, "error");

            throw new Error(msg);
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

                <ProductoForm
                    modo="crear"
                    onSubmit={handleCrear}
                />
            </div>
        </section>
    );
}

export default CrearProducto;
