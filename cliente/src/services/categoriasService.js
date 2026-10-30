import { API_URL } from "../config/api";

export async function obtenerCategorias() {
    const response = await fetch(`${API_URL}/categorias`);

    if (!response.ok) {
        throw new Error(
            `Error al obtener las categorías: ${response.status}`
        );
    }

    const { data } = await response.json();

    return data;
}

export async function crearCategoria(nombre) {
    const response = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre }),
    });

    const resultado = await response.json();

    if (!response.ok) {
        const error = new Error(
            resultado.message || "No se pudo crear la categoría."
        );
        error.status = response.status;
        throw error;
    }

    return resultado.data;
}

