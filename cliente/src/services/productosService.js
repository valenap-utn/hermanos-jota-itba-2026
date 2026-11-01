import { API_URL } from "../config/api";

// Obtiene el catálogo de productos desde la API (con filtros y paginación)
export async function obtenerProductos(params = {}) {
  const query = new URLSearchParams();
  if (params.categoria && params.categoria !== 'todos') query.set('categoria', params.categoria);
  if (params.busqueda) query.set('busqueda', params.busqueda);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);

  const queryString = query.toString();
  const url = queryString ? `${API_URL}/productos?${queryString}` : `${API_URL}/productos`;
  const response = await fetch(url);

  if (!response.ok)
    throw new Error(`Error al obtener productos: ${response.status}`);

  const resultado = await response.json();
  if (resultado.meta) {
    return {
      productos: resultado.data,
      meta: resultado.meta
    };
  }
  return resultado.data;
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

// Sube un archivo de imagen de forma independiente a Cloudinary vía POST /api/uploads/productos
// (Nota: CrearProducto envía los datos y el archivo de forma atómica en un único POST /api/productos con FormData)
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

  return resultado.data.imagenUrl;
}

// Envía los datos del producto a MongoDB mediante POST /api/productos
export async function crearProducto(datos) {
  const esFormData = typeof FormData !== "undefined" && datos instanceof FormData;
  const headers = esFormData ? {} : { "Content-Type": "application/json" };

  const response = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers,
    body: esFormData ? datos : JSON.stringify(datos),
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
