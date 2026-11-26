import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";

import {eliminarToken, guardarToken, obtenerToken} from "../utils/authStorage";

import {obtenerUsuarioAutenticado} from "../services/authService";

export const CODIGOS_ERROR_SESION = Object.freeze({
    RECUPERACION: "RECUPERACION",
    PERSISTENCIA: "PERSISTENCIA",
    ELIMINACION: "ELIMINACION"
});

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [sesion, setSesion] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);
    const [errorSesion, setErrorSesion] = useState(null);

    const versionSesion = useRef(0);

    const invalidarRestauracion = useCallback(() => {
        versionSesion.current++;
    }, []);

    const usuario = sesion?.usuario ?? null;
    const token = sesion?.token ?? null;

    const isAuthenticated =
        usuario !== null && token !== null;

    const restaurarSesion = useCallback(async () => {
                const version = ++versionSesion.current;

                setCargandoSesion(true);
                setErrorSesion(null);

                const tokenGuardado = obtenerToken();

                if (!tokenGuardado) {
                    setSesion(null);
                    setCargandoSesion(false);
                    return;
                }

                try {
                    const usuarioAutenticado =
                        await obtenerUsuarioAutenticado(tokenGuardado);

                    if (version !== versionSesion.current) return;

                    setSesion({
                        usuario: usuarioAutenticado,
                        token: tokenGuardado
                    });
                } catch (error) {
                    if (version !== versionSesion.current) return;

                    setSesion(null);

                    if (error.status === 401) {
                        const eliminado = eliminarToken();

                        if (!eliminado) {
                            setErrorSesion({
                                codigo: CODIGOS_ERROR_SESION.ELIMINACION,
                                mensaje: "No se pudo eliminar el token almacenado."
                            });
                        }
                    } else {
                        setErrorSesion({
                            codigo: CODIGOS_ERROR_SESION.RECUPERACION,
                            mensaje: "Comprobá tu conexión e intentá nuevamente."
                        });
                    }
                } finally {
                    if (version === versionSesion.current) {
                        setCargandoSesion(false);
                    }
                }
            }
            ,
            []
        )
    ;

    useEffect(() => {
        restaurarSesion();

        return invalidarRestauracion;
    }, [restaurarSesion, invalidarRestauracion]);

    const iniciarSesion = useCallback((usuarioAutenticado, tokenJWT) => {
        versionSesion.current++;

        setCargandoSesion(false);
        setErrorSesion(null);

        if (!usuarioAutenticado || !tokenJWT) {
            setSesion(null);

            if (!eliminarToken()) {
                setErrorSesion({
                    codigo: CODIGOS_ERROR_SESION.ELIMINACION,
                    mensaje: "No se pudo eliminar el token almacenado."
                });
            }

            return;
        }

        const guardado = guardarToken(tokenJWT);

        setSesion({
            usuario: usuarioAutenticado,
            token: tokenJWT
        });

        if (!guardado) {
            setErrorSesion({
                codigo: CODIGOS_ERROR_SESION.PERSISTENCIA,
                mensaje: "Tu sesión está activa, pero no se pudo " +
                    "guardar en el navegador."
            });
        }
    }, []);

    const cerrarSesion = useCallback(() => {
        versionSesion.current++;

        const eliminado = eliminarToken();

        setSesion(null);
        setCargandoSesion(false);

        setErrorSesion(
            eliminado
                ? null
                : {
                    codigo: CODIGOS_ERROR_SESION.ELIMINACION,
                    mensaje: "No se pudo eliminar la sesión " +
                        "almacenada en el navegador."
                }
        );

        return eliminado;
    }, []);

    const value = useMemo(() => ({
        usuario,
        token,
        isAuthenticated,
        cargandoSesion,
        errorSesion,
        iniciarSesion,
        cerrarSesion,
        restaurarSesion
    }), [
        usuario,
        token,
        isAuthenticated,
        cargandoSesion,
        errorSesion,
        iniciarSesion,
        cerrarSesion,
        restaurarSesion
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
