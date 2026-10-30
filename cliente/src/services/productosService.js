import { API_URL } from "../config/api";

async function manejarRespuesta(response) {
  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(resultado.message || `Error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return resultado.data;
}

// Obtiene el catálogo de productos desde la API
export async function obtenerProductos() {
  const response = await fetch(`${API_URL}/productos`);
  return manejarRespuesta(response);
}

// Obtiene el detalle de un producto por su id
export async function obtenerProductoPorId(id) {
  const response = await fetch(`${API_URL}/productos/${id}`);
  return manejarRespuesta(response);
}

// Actualiza un producto existente por su id
export async function actualizarProducto(id, datos) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(response);
}

// Elimina un producto por su id
export async function eliminarProducto(id) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
  });
  return manejarRespuesta(response);
}