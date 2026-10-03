import {actualizarCantidad, eliminarDelCarrito, obtenerCarrito} from "./carrito.js";
import {productos} from "./productos.js";

const contenedorCarrito = document.getElementById("carrito-container");
const carritoStatus = document.getElementById("carrito-status");

const modalEliminarElement = document.getElementById("modalEliminarProducto");
const btnConfirmarEliminar = document.getElementById("confirmar-eliminar-producto");

let productoPendienteDeEliminar = null;

function anunciarCambio(mensaje) {
    if (!carritoStatus) return;

    carritoStatus.textContent = "";

    requestAnimationFrame(() => {
        carritoStatus.textContent = mensaje;
    });
}

function renderizarCarrito(foco = null) {
    if (!contenedorCarrito) return;

    const itemsCarrito = obtenerCarrito();

    // Estado vacío
    if (itemsCarrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="carrito-vacio">

                <span
                    class="carrito-vacio-icono"
                    aria-hidden="true"
                >
                    <i class="fa-solid fa-couch fa-3x"></i>
                </span>

                <h1 class="texto-titulo-elegante">
                    Tu selección aún está vacía
                </h1>

                <p class="texto-principal">
                    Redescubre el arte de vivir. Aún no has seleccionado
                    ninguna pieza para tu hogar, pero nuestra colección te está
                    esperando con muebles diseñados para perdurar.
                </p>

                <a
                    href="productos.html"
                    class="btn-carrito-explorar texto-titulo-cta"
                >
                    Explorar colección
                </a>

            </div>
        `;

        if (foco?.action === "empty") {
            contenedorCarrito
                .querySelector(".btn-carrito-explorar")
                ?.focus();
        }

        return;
    }

    // Estado con productos
    let html = `
        <section class="carrito-section" aria-labelledby="carrito-titulo">

            <h1
                id="carrito-titulo"
                class="carrito-titulo"
            >
                Tu carrito
            </h1>

            <div class="row g-4 align-items-start carrito-layout">
                <div class="col-12 col-xl-8">
                    <ul class="list-unstyled m-0">
    `;

    let totalGeneral = 0;
    let resumenHtml = "";

    itemsCarrito.forEach((item) => {
        const productoCatalogo = productos.find((p) => p.id === item.id);
        if (!productoCatalogo) return;

        // Para el resumen del carrito
        const subtotal = productoCatalogo.precio * item.cantidad;

        totalGeneral += subtotal;

        resumenHtml += `
            <tr class="carrito-resumen-fila">
                <th
                    scope="row"
                    class="carrito-resumen-producto"
                >
                    ${productoCatalogo.nombre}
                </th>
        
                <td>
                    ${item.cantidad}
                </td>
        
                <td>
                    $${productoCatalogo.precio.toLocaleString("es-AR")}
                </td>
        
                <td class="carrito-resumen-subtotal">
                    $${subtotal.toLocaleString("es-AR")}
                </td>
            </tr>
        `;

        html += `
            <li class="carrito-item">

                <a
                    href="producto.html?id=${productoCatalogo.id}"
                    class="carrito-item-imagen-link"
                    aria-label="Ver ${productoCatalogo.nombre}"
                >
                    <img
                        src="../${productoCatalogo.imagen}"
                        alt="${productoCatalogo.nombre}"
                        class="carrito-item-img"
                    >
                </a>

                <div class="carrito-item-info">
                    <h2 class="carrito-item-nombre">
                        <a href="producto.html?id=${productoCatalogo.id}"
                           data-id="${productoCatalogo.id}"
                           data-action="product"
                        >
                            ${productoCatalogo.nombre}
                        </a>
                    </h2>
                
                    <p class="carrito-item-precio">
                        Precio a confirmar
                    </p>
                </div>

                <div class="carrito-item-actions">

                    <div
                        class="carrito-cantidad"
                        role="group"
                        aria-label="Cantidad de ${productoCatalogo.nombre}"
                    >

                        <button
                            type="button"
                            class="btn-cantidad"
                            data-id="${productoCatalogo.id}"
                            data-action="decrease"
                            ${item.cantidad <= 1 ? "disabled" : ""}
                            aria-label="Disminuir cantidad de ${productoCatalogo.nombre}"
                        >
                            <i
                                class="fa-solid fa-minus"
                                aria-hidden="true"
                            ></i>
                        </button>

                        <span class="carrito-cantidad-valor" >
                            ${item.cantidad}
                        </span>

                        <button
                            type="button"
                            class="btn-cantidad"
                            data-id="${productoCatalogo.id}"
                            data-action="increase"
                            aria-label="Aumentar cantidad de ${productoCatalogo.nombre}"
                        >
                            <i
                                class="fa-solid fa-plus"
                                aria-hidden="true"
                            ></i>
                        </button>

                    </div>

                    <button
                        type="button"
                        class="btn-eliminar-carrito"
                        data-id="${productoCatalogo.id}"
                        data-action="delete"
                        aria-label="Eliminar ${productoCatalogo.nombre} del carrito"
                    >
                        <i
                            class="fa-regular fa-trash-can"
                            aria-hidden="true"
                        ></i>
                    </button>

                </div>

            </li>
        `;
    });

    html += `
                    </ul>
            </div>
            
            <!-- Resumen de compra -->
            <div class="col-12 col-xl-4">
                <aside class="carrito-resumen" aria-labelledby="carrito-resumen-titulo" >
                    <h2 id="carrito-resumen-titulo" class="carrito-resumen-titulo texto-titulo-elegante">
                        Resumen de tu selección
                    </h2>
        
                    <div class="carrito-resumen-scroll">
                        <table class="carrito-resumen-tabla">
                            <thead>
                                <tr class="carrito-resumen-encabezado">
                                    <th scope="col">Producto</th>
                                    <th scope="col">Cantidad</th>
                                    <th scope="col">Precio unitario</th>
                                    <th scope="col">Subtotal</th>
                                </tr>
                            </thead>
                        
                            <tbody>
                                ${resumenHtml}
                            </tbody>
                        </table>
                    </div>
        
                    <div class="carrito-resumen-total">
                        <span>Total general</span>
        
                        <strong>
                            $${totalGeneral.toLocaleString("es-AR")}
                        </strong>
                    </div>
                </aside>
            </div>
        </div>
    </section>
    `;

    contenedorCarrito.innerHTML = html;

    // Asignar event listeners
    asignarEventos();

    if (foco) {
        const elemento = contenedorCarrito.querySelector(
            `[data-id="${foco.id}"][data-action="${foco.action}"]`
        );

        elemento?.focus();
    }
}

function asignarEventos() {
    const btnDecrease = contenedorCarrito.querySelectorAll('[data-action="decrease"]');
    const btnIncrease = contenedorCarrito.querySelectorAll('[data-action="increase"]');
    const btnDelete = contenedorCarrito.querySelectorAll('[data-action="delete"]');

    btnDecrease.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.getAttribute("data-id"));
            const item = obtenerCarrito().find(i => i.id === id);
            const producto = productos.find(p => p.id === id);

            if (item && item.cantidad > 1) {
                const nuevaCantidad = item.cantidad - 1;

                actualizarCantidad(id, nuevaCantidad);
                renderizarCarrito({id, action: "decrease"});

                if (producto) {
                    anunciarCambio(
                        `Cantidad de ${producto.nombre} actualizada a ${nuevaCantidad}`
                    );
                }
            }
        });
    });

    btnIncrease.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.getAttribute("data-id"));
            const item = obtenerCarrito().find(i => i.id === id);
            const producto = productos.find(p => p.id === id);

            if (item) {
                const nuevaCantidad = item.cantidad + 1;

                actualizarCantidad(id, nuevaCantidad);
                renderizarCarrito({id, action: "increase"});

                if (producto) {
                    anunciarCambio(
                        `Cantidad de ${producto.nombre} actualizada a ${nuevaCantidad}`
                    );
                }
            }
        });
    });

    btnDelete.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.getAttribute("data-id"));
            solicitarEliminacion(id);
        });
    });
}

// Confirmación de eliminación
function solicitarEliminacion(id) {
    productoPendienteDeEliminar = id;

    if (!modalEliminarElement) return;

    const modal = bootstrap.Modal.getOrCreateInstance(
        modalEliminarElement
    );

    modal.show();
}


btnConfirmarEliminar?.addEventListener("click", () => {
    if (productoPendienteDeEliminar === null) {
        return;
    }

    const itemsAntesDeEliminar = obtenerCarrito();

    const indiceEliminado = itemsAntesDeEliminar.findIndex(
        item => item.id === productoPendienteDeEliminar
    );

    const productoEliminado = productos.find(
        p => p.id === productoPendienteDeEliminar
    );

    eliminarDelCarrito(productoPendienteDeEliminar);

    const itemsRestantes = obtenerCarrito();

    productoPendienteDeEliminar = null;

    const modal = bootstrap.Modal.getInstance(
        modalEliminarElement
    );

    modal?.hide();

    let foco;

    if (itemsRestantes.length > 0) {
        const nuevoIndice = Math.min(
            indiceEliminado,
            itemsRestantes.length - 1
        );

        foco = {
            id: itemsRestantes[nuevoIndice].id,
            action: "product"
        };
    } else {
        foco = {
            action: "empty"
        };
    }

    renderizarCarrito(foco);

    if (productoEliminado) {
        anunciarCambio(
            `${productoEliminado.nombre} fue eliminado del carrito`
        );
    }
});


modalEliminarElement?.addEventListener(
    "hidden.bs.modal",
    () => {
        productoPendienteDeEliminar = null;
    }
);

renderizarCarrito();
