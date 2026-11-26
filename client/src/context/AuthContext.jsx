import {createContext, useCallback, useContext, useMemo, useState} from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [sesion, setSesion] = useState(null);

    const usuario = sesion?.usuario ?? null;
    const token = sesion?.token ?? null;

    const isAuthenticated = usuario !== null && token !== null;

    const iniciarSesion = useCallback((usuarioAutenticado, tokenJWT) => {
        setSesion({
            usuario: usuarioAutenticado,
            token: tokenJWT
        });
    }, []);

    const cerrarSesion = useCallback(() => {
        setSesion(null);
    }, []);

    const value = useMemo(() => ({
        usuario,
        token,
        isAuthenticated,
        iniciarSesion,
        cerrarSesion
    }), [
        usuario,
        token,
        isAuthenticated,
        iniciarSesion,
        cerrarSesion
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe ser utilizado dentro de un AuthProvider"
        );
    }

    return context;
}