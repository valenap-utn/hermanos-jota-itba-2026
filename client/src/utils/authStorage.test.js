import {AUTH_TOKEN_KEY, eliminarToken, guardarToken, obtenerToken} from "./authStorage";

describe("authStorage", () => {
    const tokenPrueba = "jwt-token-de-prueba";

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        localStorage.clear();
    });

    describe("obtenerToken", () => {
        test("devuelve null cuando no existe un token almacenado", () => {
            expect(obtenerToken()).toBeNull();
        });

        test("devuelve el token almacenado", () => {
            localStorage.setItem(AUTH_TOKEN_KEY, tokenPrueba);

            expect(obtenerToken()).toBe(tokenPrueba);
        });

        test("devuelve null cuando falla el acceso al almacenamiento", () => {
            jest.spyOn(Storage.prototype, "getItem")
                .mockImplementationOnce(() => {
                    throw new Error("Almacenamiento no disponible");
                });

            expect(obtenerToken()).toBeNull();
        });
    });

    describe("guardarToken", () => {
        test("almacena el token y devuelve true", () => {
            expect(guardarToken(tokenPrueba)).toBe(true);

            expect(localStorage.getItem(AUTH_TOKEN_KEY))
                .toBe(tokenPrueba);
        });

        test("reemplaza un token previamente almacenado", () => {
            guardarToken(tokenPrueba);

            expect(guardarToken("nuevo-token")).toBe(true);

            expect(localStorage.getItem(AUTH_TOKEN_KEY))
                .toBe("nuevo-token");
        });

        test("devuelve false cuando no puede almacenar el token", () => {
            jest.spyOn(Storage.prototype, "setItem")
                .mockImplementationOnce(() => {
                    throw new Error("No se pudo guardar el token");
                });

            expect(guardarToken(tokenPrueba)).toBe(false);

            expect(localStorage.getItem(AUTH_TOKEN_KEY))
                .toBeNull();
        });
    });

    describe("eliminarToken", () => {
        test("elimina el token almacenado y devuelve true", () => {
            localStorage.setItem(AUTH_TOKEN_KEY, tokenPrueba);

            expect(eliminarToken()).toBe(true);

            expect(localStorage.getItem(AUTH_TOKEN_KEY))
                .toBeNull();
        });

        test("devuelve true aunque no exista un token almacenado", () => {
            expect(eliminarToken()).toBe(true);
        });

        test("devuelve false cuando no puede eliminar el token", () => {
            localStorage.setItem(AUTH_TOKEN_KEY, tokenPrueba);

            jest.spyOn(Storage.prototype, "removeItem")
                .mockImplementationOnce(() => {
                    throw new Error("No se pudo eliminar el token");
                });

            expect(eliminarToken()).toBe(false);

            expect(localStorage.getItem(AUTH_TOKEN_KEY))
                .toBe(tokenPrueba);
        });
    });
});
