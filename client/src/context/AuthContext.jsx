import {createContext, useCallback, useContext, useMemo, useState} from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [usuario, setUsuario] = useState(null);

    const isAuthenticated = usuario !== null;

    const iniciarSesion = useCallback((usuarioAutenticado) => {
        setUsuario(usuarioAutenticado);
    }, []);

    const cerrarSesion = useCallback(() => {
        setUsuario(null);
    }, []);

    const value = useMemo(() => ({
        usuario,
        isAuthenticated,
        iniciarSesion,
        cerrarSesion
    }), [
        usuario,
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