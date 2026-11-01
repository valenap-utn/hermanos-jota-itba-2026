import { API_URL } from "../config/api";

export async function apiFetch(path, { body, headers, ...opts } = {}) {
  const esJson = body?.constructor === Object; // excluye FormData, string, array y null

  const response = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: { ...(esJson && { "Content-Type": "application/json" }), ...headers },
    body: esJson ? JSON.stringify(body) : body,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw Object.assign(new Error(payload?.message || "Error de red"), {
      status: response.status,
    });
  }

  if (payload === null && response.status !== 204) {
    throw new Error("Respuesta inválida del servidor");
  }

  return payload; // envelope completo: { status, data, meta? }
}
