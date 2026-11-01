import { apiFetch } from "./apiClient";

// Obtiene el catálogo de productos desde la API (con filtros y paginación)
export async function obtenerProductos(params = {}) {
  const query = new URLSearchParams();
  if (params.categoria && params.categoria !== "todos") query.set("categoria", params.categoria);
  if (params.busqueda) query.set("busqueda", params.busqueda);
  if (params.page) query.set("page", params.page);
  if (params.limit) query.set("limit", params.limit);

  const queryString = query.toString();
  const path = queryString ? `/productos?${queryString}` : "/productos";
  const res = await apiFetch(path);

  return {
    productos: res.data,
    meta: res.meta || null,
  };
}

// Obtiene el detalle de un producto por su id
export async function obtenerProductoPorId(id) {
  const res = await apiFetch(`/productos/${id}`);
  return res.data;
}

// Sube un archivo de imagen de forma independiente a Cloudinary vía POST /api/uploads/productos
export async function subirImagenProducto(archivo) {
  const formData = new FormData();
  formData.append("imagen", archivo);

  const res = await apiFetch("/uploads/productos", {
    method: "POST",
    body: formData,
  });

  return res.data.imagenUrl;
}

// Envía los datos del producto a MongoDB mediante POST /api/productos
export async function crearProducto(datos) {
  const res = await apiFetch("/productos", {
    method: "POST",
    body: datos,
  });

  return res.data;
}

// Actualiza un producto existente en MongoDB mediante PUT /api/productos/:id
export async function actualizarProducto(id, datos) {
  const res = await apiFetch(`/productos/${id}`, {
    method: "PUT",
    body: datos,
  });

  return res.data;
}

// Elimina un producto de MongoDB mediante DELETE /api/productos/:id
export async function eliminarProducto(id) {
  const res = await apiFetch(`/productos/${id}`, {
    method: "DELETE",
  });

  return res.data;
}
