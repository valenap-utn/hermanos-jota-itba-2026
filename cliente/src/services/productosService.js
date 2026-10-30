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

  if (!response.ok) {
    const error = new Error(`Error al obtener el producto: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const { data } = await response.json();
  return data;
}

// Envía el archivo a Cloudinary y obtenemos su URL
export async function subirImagenProducto(archivo) {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const response = await fetch(`${API_URL}/uploads/productos`, {
    method: "POST",
    body: formData,
  });

  const resultado = await response.json();

  if (!response.ok) {
    const error = new Error(
        resultado.message || "No se pudo subir la imagen."
    );
    error.status = response.status;
    throw error;
  }

  return resultado.imagenUrl;
}

// Envía los datos del producto a MongoDB mediante POST /api/productos
export async function crearProducto(datos) {
  const response = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const resultado = await response.json();

  if (!response.ok) {
    const error = new Error(
        resultado.message || "No se pudo crear el producto."
    );
    error.status = response.status;
    throw error;
  }

  return resultado.data;
}
