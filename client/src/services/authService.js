import { apiFetch } from "./apiClient";

export async function registrarUsuario(datos) {
    const respuesta = await apiFetch("/auth/register", {
        method: "POST",
        body: datos
    });

    return respuesta.data;
}

export async function autenticarUsuario(credenciales) {
    const respuesta = await apiFetch("/auth/login", {
        method: "POST",
        body: credenciales
    });

    return respuesta.data;
}

export async function obtenerUsuarioAutenticado(token) {
    const respuesta = await apiFetch("/auth/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return respuesta.data;
}