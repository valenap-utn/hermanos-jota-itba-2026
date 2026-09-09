import { productos } from "./productos.js";

const CARRITO_KEY = 'hermanosJotaCarrito';
let carrito = cargarCarrito();

function cargarCarrito() {
    try {
        const datos = JSON.parse(localStorage.getItem(CARRITO_KEY));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    } catch {
        // localStorage no disponible o cuota llena: el carrito sigue
        // funcionando en memoria para el resto de la sesión.
    }
}

/**
 * @param {number} id - ID del producto (del catálogo de productos.js)
 */
export function agregarAlCarrito(id) {
    const itemExistente = carrito.find((item) => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ id, cantidad: 1 });
    }

    actualizarContador();
    guardarCarrito();
    animarBadge();
}

/**
 * Elimina un producto del carrito.
 * @param {number} id - ID del producto
 */
export function eliminarDelCarrito(id) {
    carrito = carrito.filter((item) => item.id !== id);
    actualizarContador();
    guardarCarrito();
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * Si la cantidad es <= 0, elimina el producto.
 * @param {number} id - ID del producto
 * @param {number} cantidad - Nueva cantidad
 */
export function actualizarCantidad(id, cantidad) {
    if (cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }
    const itemExistente = carrito.find((item) => item.id === id);
    if (itemExistente) {
        itemExistente.cantidad = cantidad;
        actualizarContador();
        guardarCarrito();
    }
}

/**
 * Devuelve una copia del array actual del carrito.
 * Purga referencias a productos que ya no existen en el catálogo.
 * Se retorna copia para evitar mutaciones externas accidentales.
 * @returns {{ id: number, cantidad: number }[]}
 */
export function obtenerCarrito() {
    return carrito
        .filter((item) => productos.some((p) => p.id === item.id))
        .map((item) => ({ ...item }));
}

/**
 * Retorna la suma total de unidades en el carrito (solo productos válidos).
 * @returns {number}
 */
export function contarItems() {
    return carrito
        .filter((item) => productos.some((p) => p.id === item.id))
        .reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Actualiza el texto de todos los .cart-count del header con el total de items.
 * El header tiene dos instancias: una mobile y una desktop.
 * También actualiza el aria-label de los .carrito-link para accesibilidad.
 */
export function actualizarContador() {
    const total = contarItems();
    const textoAccesible = total === 1 ? "Carrito, 1 producto" : `Carrito, ${total} productos`;

    document.querySelectorAll(".cart-count").forEach((span) => {
        span.textContent = total;
    });

    document.querySelectorAll(".carrito-link").forEach((link) => {
        link.setAttribute("aria-label", textoAccesible);
    });
}

/**
 * Aplica la clase .cart-count--bump a cada badge del header
 * y la remueve al terminar la animación CSS.
 */
function animarBadge() {
    document.querySelectorAll(".cart-count").forEach((span) => {
        // Reinicia la animación si ya estaba corriendo
        span.classList.remove("cart-count--bump");

        // Fuerza reflow para que el browser registre el cambio
        void span.offsetWidth;

        span.classList.add("cart-count--bump");

        span.addEventListener(
            "animationend",
            () => span.classList.remove("cart-count--bump"),
            { once: true }
        );
    });
}

// Actualiza el contador cuando el header ya fue inyectado en el DOM
document.addEventListener("headerCargado", actualizarContador);

// Fallback: por si el header fue inyectado antes de que este módulo corriera
if (document.querySelector(".cart-count")) {
    actualizarContador();
}
