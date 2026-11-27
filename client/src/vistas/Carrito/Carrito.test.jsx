import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import Carrito from "./Carrito";
import Header from "../../components/Header/Header";
import {CARRITO_STORAGE_KEY, CartProvider} from "../../context/CartContext";
import {obtenerProductos} from "../../services/productosService";

jest.mock("react-router-dom", () => ({
    Link: ({to, children, ...props}) => (
        <a href={to} {...props}>{children}</a>
    ),
    NavLink: ({to, children, className, end: _end, ...props}) => {
        const resolvedClass = typeof className === "function"
            ? className({isActive: false})
            : className;
        return <a href={to} className={resolvedClass} {...props}>{children}</a>;
    },
    useLocation: () => ({pathname: "/carrito"}),
    useNavigate: () => jest.fn()
}));

jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({
        usuario: null,
        token: null,
        isAuthenticated: false,
        cargandoSesion: false,
        errorSesion: null,
        iniciarSesion: jest.fn(),
        cerrarSesion: jest.fn(),
        restaurarSesion: jest.fn()
    })
}));

jest.mock("../../context/ToastContext", () => ({
    useToast: () => ({mostrarToast: jest.fn()})
}));

jest.mock("../../services/productosService", () => ({
    obtenerProductos: jest.fn()
}));

const sillaCordoba = {
    _id: "507f1f77bcf86cd799439011",
    nombre: "Silla Córdoba",
    precio: 120000,
    imagenUrl: "/assets/img/silla-cordoba.webp",
    categoria: "Sillas",
    stock: 2
};

const mesaPampa = {
    _id: "507f1f77bcf86cd799439012",
    nombre: "Mesa Comedor Pampa",
    precio: 450000,
    imagenUrl: "/assets/img/mesa-comedor-pampa.webp",
    categoria: "Mesas",
    stock: 5
};

function renderizarHeaderYCarrito() {
    return render(
        <CartProvider>
            <Header/>
            <Carrito/>
        </CartProvider>
    );
}

describe("Integración Carrito y Header con useCart()", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        localStorage.clear();
    });

    test("sincroniza cantidades, tope de stock, total y badge del Header sin prop drilling", async () => {
        localStorage.setItem(
            CARRITO_STORAGE_KEY,
            JSON.stringify([
                {id: sillaCordoba._id, cantidad: 1},
                {id: mesaPampa._id, cantidad: 1}
            ])
        );
        obtenerProductos.mockResolvedValueOnce({
            productos: [sillaCordoba, mesaPampa]
        });

        renderizarHeaderYCarrito();

        expect(await screen.findByRole("heading", {name: "Tu carrito"}))
            .toBeInTheDocument();

        expect(screen.getAllByRole("link", {name: "Carrito, 2 productos"}))
            .toHaveLength(2);

        const totalInicial = (120000 + 450000).toLocaleString("es-AR");
        expect(
            screen.getByRole("button", {
                name: `Finalizar compra por un total de $${totalInicial}`
            })
        ).toBeInTheDocument();

        const btnAumentarSilla = screen.getByRole("button", {
            name: "Aumentar cantidad de Silla Córdoba"
        });
        userEvent.click(btnAumentarSilla);

        expect(screen.getAllByRole("link", {name: "Carrito, 3 productos"}))
            .toHaveLength(2);
        expect(btnAumentarSilla).toBeDisabled();

        const totalActualizado = (120000 * 2 + 450000).toLocaleString("es-AR");
        expect(
            screen.getByRole("button", {
                name: `Finalizar compra por un total de $${totalActualizado}`
            })
        ).toBeInTheDocument();
    });

    test("permite eliminar un producto desde el modal y actualiza Header y estado vacío", async () => {
        localStorage.setItem(
            CARRITO_STORAGE_KEY,
            JSON.stringify([{id: sillaCordoba._id, cantidad: 1}])
        );
        obtenerProductos.mockResolvedValueOnce({productos: [sillaCordoba]});

        renderizarHeaderYCarrito();

        expect(await screen.findByRole("heading", {name: "Tu carrito"}))
            .toBeInTheDocument();

        userEvent.click(
            screen.getByRole("button", {name: "Eliminar Silla Córdoba del carrito"})
        );
        userEvent.click(screen.getByRole("button", {name: "Eliminar"}));

        await waitFor(() => {
            expect(
                screen.getByRole("heading", {name: "Tu selección aún está vacía"})
            ).toBeInTheDocument();
        });

        expect(screen.getAllByRole("link", {name: "Carrito, 0 productos"}))
            .toHaveLength(2);
    });
});
