import { productoSchema } from "../productoSchema";
import { validarCampos } from "../../components/ProductoForm/productoForm.utils";

describe("Validación de Producto con campos opcionales (#108)", () => {
  test("productoSchema acepta producto mínimo sin descripción, stock ni imagen", () => {
    const dataMinima = {
      nombre: "Mesa Minimal",
      precio: "45000",
      categoria: "mesas",
    };

    const resultado = productoSchema.safeParse(dataMinima);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.stock).toBe(0);
      expect(resultado.data.precio).toBe(45000);
      expect(resultado.data.nombre).toBe("Mesa Minimal");
    }
  });

  test("productoSchema acepta producto completo con todos los campos", () => {
    const dataCompleta = {
      nombre: "Silla Córdoba",
      descripcion: "Madera de petiribí y esterillado natural",
      precio: "65000",
      stock: "15",
      categoria: "sillas",
      materiales: "Petiribí",
      medidas: "50x50x85 cm",
      destacado: true,
    };

    const resultado = productoSchema.safeParse(dataCompleta);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.stock).toBe(15);
      expect(resultado.data.precio).toBe(65000);
      expect(resultado.data.descripcion).toBe("Madera de petiribí y esterillado natural");
    }
  });

  test("productoSchema rechaza nombre menor a 3 caracteres o precio negativo", () => {
    const invalido = {
      nombre: "Ab",
      precio: "-100",
      categoria: "mesas",
    };

    const resultado = productoSchema.safeParse(invalido);
    expect(resultado.success).toBe(false);
  });

  test("validarCampos acepta formulario sin descripción, stock ni imagenUrl", () => {
    const formMinimo = {
      nombre: "Mesa Auxiliar",
      descripcion: "",
      precio: "12000",
      stock: "",
      categoria: "mesas",
      imagenUrl: "",
    };

    const { esValido, errores, valoresLimpios } = validarCampos(formMinimo);
    expect(esValido).toBe(true);
    expect(errores).toEqual({});
    expect(valoresLimpios.stock).toBe(0);
    expect(valoresLimpios.descripcion).toBe("");
    expect(valoresLimpios.imagenUrl).toBe("");
  });
});
