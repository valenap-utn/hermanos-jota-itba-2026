export function productCard(producto) {
    const precio = (producto.precio && producto.precio > 0)
        ? `$${producto.precio.toLocaleString('es-AR')}`
        : 'Consultar precio';

    return `
        <div class="col-12 col-md-6 col-lg-4">
            <article class="product-card">
                <figure class="product-card-figure">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="product-card-image" loading="lazy">
                </figure>
                <div class="product-card-content">
                    <span class="product-card-categoria texto-secundario-leyenda">${producto.categoria}</span>
                    <h2 class="product-card-nombre">${producto.nombre}</h2>
                    <p class="product-card-precio">${precio}</p>
            
                    <a href="producto.html?id=${producto.id}" class="product-card-link texto-titulo-cta" aria-label="Ver detalles de ${producto.nombre}">
                        <span>Ver pieza</span>
                        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </a>
                </div>
            </article>
        </div>
    `;
}