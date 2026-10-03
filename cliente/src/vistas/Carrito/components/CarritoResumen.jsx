function CarritoResumen({ carrito, totalGeneral, onFinalizarCompra }) {
    return (
        <aside className="carrito-resumen" aria-labelledby="carrito-resumen-titulo">
            <h2
                id="carrito-resumen-titulo"
                className="carrito-resumen-titulo texto-titulo-elegante"
            >
                Resumen de tu selección
            </h2>

            <div className="carrito-resumen-scroll">
                <table className="carrito-resumen-tabla">
                    <thead>
                        <tr className="carrito-resumen-encabezado">
                            <th scope="col">Producto</th>
                            <th scope="col">Cantidad</th>
                            <th scope="col">Precio unitario</th>
                            <th scope="col">Subtotal</th>
                        </tr>
                    </thead>

                    <tbody>
                        {carrito.map((item) => {
                            const precio = item.precio || 0;
                            const subtotal = precio * item.cantidad;

                            return (
                                <tr key={item.id} className="carrito-resumen-fila">
                                    <th scope="row" className="carrito-resumen-producto">
                                        {item.nombre}
                                    </th>

                                    <td>{item.cantidad}</td>

                                    <td>
                                        {precio > 0
                                            ? `$${precio.toLocaleString("es-AR")}`
                                            : "A confirmar"}
                                    </td>

                                    <td className="carrito-resumen-subtotal">
                                        ${subtotal.toLocaleString("es-AR")}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="carrito-resumen-total">
                <span>Total general</span>

                <strong>
                    ${totalGeneral.toLocaleString("es-AR")}
                </strong>
            </div>

            <button
                type="button"
                className="btn-carrito-comprar texto-titulo-cta"
                onClick={onFinalizarCompra}
                aria-label={`Finalizar compra por un total de $${totalGeneral.toLocaleString("es-AR")}`}
            >
                Finalizar compra
            </button>
        </aside>
    );
}

export default CarritoResumen;
