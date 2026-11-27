import {imagenSchema} from "../../schemas/productoSchema";

export function normalizarValoresIniciales(initialValues = {}) {
    return {
        nombre: initialValues?.nombre ?? "",
        descripcion: initialValues?.descripcion ?? "",
        precio:
            initialValues?.precio !== undefined && initialValues?.precio !== null
                ? String(initialValues.precio)
                : "",
        stock:
            initialValues?.stock !== undefined && initialValues?.stock !== null
                ? String(initialValues.stock)
                : "0",
        categoria: initialValues?.categoria ?? "",
        nuevaCategoria: "",
        imagen: null,
        imagenUrl: initialValues?.imagenUrl ?? initialValues?.imagen ?? "",
        medidas: initialValues?.medidas ?? "",
        materiales: initialValues?.materiales ?? "",
        destacado: Boolean(initialValues?.destacado),
    };
}

export function validarArchivoImagen(archivo) {
    if (!archivo) return "";

    const resultado = imagenSchema.safeParse(archivo);

    return resultado.success
        ? ""
        : resultado.error.issues[0].message;
}

export function construirPayload(
    valoresLimpios,
    {categoriaFinal, imagenUrlFinal}
) {
    return {
        nombre: valoresLimpios.nombre,
        descripcion: valoresLimpios.descripcion,
        precio: valoresLimpios.precio,
        stock: valoresLimpios.stock,
        categoria: categoriaFinal,
        imagenUrl: imagenUrlFinal,
        medidas: valoresLimpios.medidas,
        materiales: valoresLimpios.materiales,
        destacado: valoresLimpios.destacado,
    };
}
