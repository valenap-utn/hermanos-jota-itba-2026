// Variables para paths en Header y Footer
const scriptUrl = new URL(document.currentScript.src);
const projectRoot = new URL("../", scriptUrl);

async function loadHeader() {
    const resp = await fetch(new URL("/vistas/layout/header.html", projectRoot));
    document.getElementById("header-placeholder").outerHTML = await resp.text();

    await inlineLogo(document.querySelector(".navbar-brand"));
    configureHeaderLinks();

    setActiveNavLink();

    document.dispatchEvent(new Event("headerCargado"));
}

async function loadFooter() {
    const resp = await fetch(new URL("/vistas/layout/footer.html", projectRoot));
    document.getElementById("footer-placeholder").outerHTML = await resp.text();
        
    setFooterYear();
}

// Inyecta el logo como SVG inline para poder controlar su color vía CSS
async function inlineLogo(container, variant = "logo-primary") {
    const placeholder = container.querySelector(".logo-container");
    if (!placeholder) return;

    try {
        const resp = await fetch(new URL("assets/logo/logo.svg", projectRoot));
        if (!resp.ok) throw new Error(`No se pudo cargar el logo: ${resp.status}`);

        const svgText = await resp.text();
        const temp = document.createElement("div");
        temp.innerHTML = svgText;

        const svgElement = temp.querySelector("svg");
        if (!svgElement) throw new Error("El archivo del logo no contiene un <svg> válido");

        svgElement.classList.add("logo", variant);
        svgElement.setAttribute("role", "img");
        svgElement.setAttribute("aria-label", "Hermanos Jota");

        placeholder.replaceWith(svgElement);
    } catch (err) {
        console.error("Error al insertar el logo:", err);
        // Fallback: dejamos el placeholder vacío en vez de romper el header entero
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll("#navbarNav .nav-link").forEach((link) => {
        if (new URL(link.href).pathname === currentPath) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function setFooterYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Función para configurar paths/rutas en Header
function configureHeaderLinks() {
    const homeLink = document.querySelector('[data-route="home"]');
    const productosLink = document.querySelector('[data-route="productos"]');
    const contactoLink = document.querySelector('[data-route="contacto"]');
    const logoLink = document.querySelector(".navbar-brand");
    const carritoLinks = document.querySelectorAll('[data-route="carrito"]');

    logoLink.href = new URL("index.html", projectRoot);

    homeLink.href = new URL("index.html", projectRoot);
    productosLink.href = new URL("vistas/productos.html", projectRoot);
    contactoLink.href = new URL("vistas/contacto.html", projectRoot);
    carritoLinks.forEach((link) => {
        link.href = new URL("vistas/carrito.html", projectRoot);
    })
}

loadHeader();
loadFooter();