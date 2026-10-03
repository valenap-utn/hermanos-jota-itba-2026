import {productos} from "./productos.js";
import {agregarAlCarrito} from "./carrito.js";

// Obtiene el ID del producto desde la URL => producto.html?id=1
const params = new URLSearchParams(window.location.search);
const productoId = Number(params.get("id"));

// Busca en el catálogo el producto correspondiente al ID recibido
const producto = productos.find(({id}) => id === productoId);

if (!producto) {
    renderizarProductoNoEncontrado()
} else {
    renderizarProducto(producto);
}

// Completa la vista de detalle con los datos del producto seleccionado
function renderizarProducto(producto) {
    const breadcrumb = document.querySelector('[data-detalle="breadcrumb"]');
    const imagen = document.querySelector('[data-detalle="imagen"]');
    const categoria = document.querySelector('[data-detalle="categoria"]');
    const nombre = document.querySelector('[data-detalle="nombre"]');
    const precio = document.querySelector('[data-detalle="precio"]');
    const descripcion = document.querySelector('[data-detalle="descripcion"]');
    const specs = document.querySelector('[data-detalle="specs"]');

    const captionSpecs = document.querySelector('[data-detalle="caption-specs"]');

    breadcrumb.textContent = producto.nombre;

    imagen.src = `../${producto.imagen}`;
    imagen.alt = producto.nombre;

    categoria.textContent = producto.categoria;
    nombre.textContent = producto.nombre;

    captionSpecs.textContent = `Especificaciones técnicas de ${producto.nombre}`;

    precio.textContent =
        producto.precio > 0
            ? `$${producto.precio.toLocaleString("es-AR")}`
            : "Precio a confirmar";

    descripcion.textContent = producto.descripcion;

    // El título de la pestaña varía según el nombre del producto que se esté viendo
    document.title = `${producto.nombre} | Hermanos Jota`;

    renderizarEspecificaciones(specs, producto);
}

// Genera dinámicamente la tabla porque las especificaciones varían por producto
function renderizarEspecificaciones(contenedor, producto) {
    contenedor.innerHTML = "";

    // Medidas y materiales son comunes, el resto depende de cada producto
    const especificaciones = {
        Medidas: producto.medidas,
        Materiales: producto.materiales,
        ...producto.especificaciones
    };

    Object.entries(especificaciones).forEach(([nombre, valor]) => {
        const fila = document.createElement("tr");

        const encabezado = document.createElement("th");
        encabezado.scope = "row";
        encabezado.textContent = nombre;

        const dato = document.createElement("td");
        dato.textContent = valor;

        fila.append(encabezado, dato);
        contenedor.appendChild(fila);
    });
}

// Carrito
const btnCarrito = document.querySelector('[data-detalle="btn-carrito"]');
if (btnCarrito) {
    btnCarrito.addEventListener('click', () => {
        agregarAlCarrito(producto.id);
    });
}

// Caso: producto inexistente => estado de error cuando el ID no corresponde a ningún producto
function renderizarProductoNoEncontrado() {
    const main = document.querySelector("main");

    main.innerHTML = `
        <div class="container py-5 text-center">
            <h1 class="texto-titulo-elegante detalle-nombre">
                Producto no encontrado
            </h1>

            <p class="texto-principal mb-4">
                El producto que estás buscando no existe o no está disponible.
            </p>

            <a href="productos.html"
               class="btn btn-marca-primario texto-titulo-cta">
                Volver al catálogo
            </a>
        </div>
    `;

    document.title = "Producto no encontrado | Hermanos Jota";
}
