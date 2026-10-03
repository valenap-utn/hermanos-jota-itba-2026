import { API_URL } from "../config/api";

// Obtiene el catálogo de productos desde la API
export async function obtenerProductos() {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok)
    throw new Error(`Error al obtener productos: ${response.status}`);

  const { data } = await response.json();
  return data;
}

// Obtiene el detalle de un producto por su id
export async function obtenerProductoPorId(id) {
  const response = await fetch(`${API_URL}/productos/${id}`);

  if (!response.ok)
    throw new Error(`Error al obtener el producto: ${response.status}`);

  const { data } = await response.json();
  return data;
}