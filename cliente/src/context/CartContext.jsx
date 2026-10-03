import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from "react";
import { obtenerProductos } from "../services/productosService";

const CARRITO_STORAGE_KEY = "hermanosJotaCarrito";

const CartContext = createContext(null);

/*
Lee del localStorage el array de referencias mínimas [{ id, cantidad }].
Repara cualquier dato residual garantizando que ningún precio, nombre o descripción persista en el cliente.
*/
function cargarReferenciasLocales() {
    try {
        const raw = localStorage.getItem(CARRITO_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((item) => item && typeof item.id !== "undefined" && Number(item.cantidad) > 0)
            .map((item) => ({
                id: Number(item.id),
                cantidad: Number(item.cantidad)
            }));
    } catch {
        return [];
    }
}

/*
Guarda estrictamente el array [{ id, cantidad }].
No almacena información comercial sensible (precios, nombres, etc.).
*/
function guardarReferenciasLocales(referencias) {
    try {
        const dataMinima = referencias.map(({ id, cantidad }) => ({
            id: Number(id),
            cantidad: Number(cantidad)
        }));
        localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(dataMinima));
    } catch {
        // En caso de exceso o modo incógnito restringido
    }
}

export function CartProvider({ children }) {
    // Referencias previamente explicadas
    const [referencias, setReferencias] = useState(() => cargarReferenciasLocales());

    // Catálogo obtenido desde el back
    const [catalogo, setCatalogo] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Hidratación de datos al iniciar el contexto
    useEffect(() => {
        let activo = true;

        async function hidratar() {
            try {
                setCargando(true);
                setError(null);
                const productosFresco = await obtenerProductos();
                if (activo) {
                    setCatalogo(productosFresco);
                }
            } catch (err) {
                if (activo) {
                    setError("No se pudo sincronizar el catálogo de productos.");
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        hidratar();

        return () => {
            activo = false;
        };
    }, []);

    // Sincronizar referencias con localStorage
    useEffect(() => {
        guardarReferenciasLocales(referencias);
    }, [referencias]);

    // Cruza las cantidades de las referencias con los datos del back
    const carrito = useMemo(() => {
        if (!catalogo || catalogo.length === 0) return [];

        return referencias
            .map((ref) => {
                const productoReal = catalogo.find((p) => p.id === ref.id);
                if (!productoReal) return null; // Si ya no existe en el catálogo, se descarta

                return {
                    id: productoReal.id,
                    nombre: productoReal.nombre,
                    precio: productoReal.precio,
                    imagen: productoReal.imagen,
                    categoria: productoReal.categoria,
                    cantidad: ref.cantidad
                };
            })
            .filter(Boolean);
    }, [referencias, catalogo]);

    // Contador de unidades en el carrito
    const cartCount = useMemo(() => {
        return referencias.reduce((acc, item) => acc + item.cantidad, 0);
    }, [referencias]);

    // Total general calculado sobre los precios
    const totalGeneral = useMemo(() => {
        return carrito.reduce((acc, item) => acc + (item.precio || 0) * item.cantidad, 0);
    }, [carrito]);

    // Acciones del carrito
    const agregarAlCarrito = useCallback((productoOId, cantidad = 1) => {
        const id = typeof productoOId === "object" ? Number(productoOId.id) : Number(productoOId);
        if (!id) return;

        // Si se entra directo a un producto, lo sumamos al catálogo en memoria de forma no persistente
        if (typeof productoOId === "object" && productoOId.nombre && productoOId.precio !== undefined) {
            setCatalogo((prev) => {
                if (prev.some((p) => p.id === id)) return prev;
                return [...prev, productoOId];
            });
        }

        setReferencias((prev) => {
            const index = prev.findIndex((item) => item.id === id);
            if (index !== -1) {
                return prev.map((item, idx) =>
                    idx === index
                        ? { id: item.id, cantidad: item.cantidad + cantidad }
                        : item
                );
            }
            return [...prev, { id, cantidad }];
        });
    }, []);

    const actualizarCantidad = useCallback((id, nuevaCantidad) => {
        const idNum = Number(id);
        if (nuevaCantidad <= 0) {
            setReferencias((prev) => prev.filter((item) => item.id !== idNum));
            return;
        }

        setReferencias((prev) =>
            prev.map((item) =>
                item.id === idNum ? { id: item.id, cantidad: nuevaCantidad } : item
            )
        );
    }, []);

    const eliminarDelCarrito = useCallback((id) => {
        const idNum = Number(id);
        setReferencias((prev) => prev.filter((item) => item.id !== idNum));
    }, []);

    const vaciarCarrito = useCallback(() => {
        setReferencias([]);
    }, []);

    const value = {
        carrito,
        referencias,
        cartCount,
        totalGeneral,
        cargando,
        error,
        agregarAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart debe ser utilizado dentro de un CartProvider");
    }
    return context;
}
