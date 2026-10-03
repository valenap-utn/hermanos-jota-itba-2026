import { productos } from "./productos.js";

const destacadosContainer = document.getElementById("productos-destacados");

// Crea la tarjeta HTML de un producto destacado
function crearTarjetaProducto(producto) {
    const columna = document.createElement("article");
    columna.className = "col-12 col-sm-6 col-lg-3";

    const enlace = document.createElement("a");
    enlace.className = "home-producto-card";
    enlace.href = `./vistas/producto.html?id=${producto.id}`;
    enlace.setAttribute(
        "aria-label",
        `Ver detalle de ${producto.nombre}`
    );

    // Imagen del producto
    const figura = document.createElement("figure");
    figura.className = "home-producto-figure";

    const imagen = document.createElement("img");
    imagen.className = "home-producto-image";
    imagen.src = `./${producto.imagen}`;
    imagen.alt = producto.nombre;
    imagen.loading = "lazy";

    figura.appendChild(imagen);

    // Información visible de la tarjeta
    const contenido = document.createElement("div");
    contenido.className = "home-producto-content";

    const categoria = document.createElement("p");
    categoria.className =
        "home-producto-categoria texto-secundario-leyenda";
    categoria.textContent = producto.categoria;

    const nombre = document.createElement("h3");
    nombre.className =
        "home-producto-nombre texto-enfasis-editorial";
    nombre.textContent = producto.nombre;

    const verProducto = document.createElement("span");
    verProducto.className =
        "home-producto-link texto-titulo-cta";

    verProducto.innerHTML = `
        <span>Ver pieza</span>
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
    `;

    contenido.append(categoria, nombre, verProducto);
    enlace.append(figura, contenido);
    columna.appendChild(enlace);

    return columna;
}

// Obtiene los destacados definidos en productos.js y los renderiza
function renderizarDestacados() {
    if (!destacadosContainer) {
        return;
    }

    const destacados = productos.filter(
        (producto) => producto.destacado
    );

    // Agrupa los nodos antes de agregarlos al DOM
    const fragment = document.createDocumentFragment();

    destacados.forEach((producto) => {
        fragment.appendChild(crearTarjetaProducto(producto));
    });

    destacadosContainer.replaceChildren(fragment);
}

// Inicializa la sección de productos destacados
renderizarDestacados();