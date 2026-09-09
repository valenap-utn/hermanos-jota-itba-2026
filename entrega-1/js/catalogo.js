import { obtenerProductos } from "./productos.js";
import { productCard } from "../components/product-card/product-card.js";

const spinner = document.getElementById("spinner-carga");
const sinResultados = document.getElementById("sin-resultados");
const contenedor = document.getElementById("contenedor-productos");
const inputBusqueda = document.getElementById("input-busqueda");
const selectCategoria = document.getElementById("select-categoria");

let productosOriginales = [];

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function renderizarProductos(productos) {
  contenedor.innerHTML = "";

  if (productos.length === 0) {
    sinResultados.classList.remove("d-none");
    anunciarResultados("No se encontraron productos");
    return;
  }

  sinResultados.classList.add("d-none");
  contenedor.innerHTML = productos.map(productCard).join("");
  anunciarResultados(`Se encontraron ${productos.length} producto${productos.length !== 1 ? 's' : ''}`);
}

function anunciarResultados(mensaje) {
  const anuncio = document.getElementById("anuncio-resultados");
  anuncio.textContent = mensaje;
}

function aplicarFiltros() {
  const textoBusqueda = normalizarTexto(inputBusqueda.value);
  const categoriaSeleccionada = selectCategoria.value;

  let regexBusqueda;
  try {
    regexBusqueda = new RegExp(`\\b${textoBusqueda}`, 'i');
  } catch (error) {
    regexBusqueda = null;
  }
  // El try/catch está para evitar errores por expresiones que no sean válidas para el regex, como un asterisco al principio.

  const productosFiltrados = productosOriginales.filter((producto) => {
    const coincideCategoria =
      categoriaSeleccionada === "todos" ||
      producto.categoria === categoriaSeleccionada;

    let coincideBusqueda = true;
    if (textoBusqueda !== "") {
      const nombreNormalizado = normalizarTexto(producto.nombre);
      if (regexBusqueda) {
        coincideBusqueda = regexBusqueda.test(nombreNormalizado);
      } else {
        coincideBusqueda = nombreNormalizado.includes(textoBusqueda);
      }
    }

    return coincideCategoria && coincideBusqueda;
  });

  renderizarProductos(productosFiltrados);
}

try {
  spinner.classList.remove("d-none");
  contenedor.innerHTML = "";
  productosOriginales = await obtenerProductos();
  spinner.classList.add("d-none");
  renderizarProductos(productosOriginales);
  inputBusqueda.addEventListener("input", aplicarFiltros);
  selectCategoria.addEventListener("change", aplicarFiltros);
} catch (error) {
  spinner.classList.add("d-none");
  console.error(error);
  sinResultados.classList.remove("d-none");
  sinResultados.querySelector("h3").textContent = "No se pudieron cargar los productos";
  sinResultados.querySelector("p").textContent = "Ocurrió un error al cargar el catálogo. Por favor, intentá nuevamente.";
}
