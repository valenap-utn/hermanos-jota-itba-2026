import { apiFetch } from "./apiClient";

export async function obtenerCategorias() {
  const res = await apiFetch("/categorias");
  return res.data;
}

export async function crearCategoria(nombre) {
  const res = await apiFetch("/categorias", {
    method: "POST",
    body: { nombre },
  });
  return res.data;
}
