export const AUTH_TOKEN_KEY = "hermanosJotaAuthToken";

// Recupera el JWT almacenado
export function obtenerToken() {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
        return null;
    }
}

// Persiste el JWT después del login
export function guardarToken(token) {
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return true;
    } catch {
        return false;
    }
}

// Elimina el JWT durante el logout o cuando resulte invalidp
export function eliminarToken() {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return true;
    } catch {
        return false;
    }
}
