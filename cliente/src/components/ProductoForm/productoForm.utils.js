export const OTRA_CATEGORIA = "__otra__";

export const TIPOS_IMAGEN_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const TAMANIO_MAX_IMAGEN_BYTES = 5 * 1024 * 1024; // 5 MB

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
    imagenUrl: initialValues?.imagenUrl ?? initialValues?.imagen ?? "",
    medidas: initialValues?.medidas ?? "",
    materiales: initialValues?.materiales ?? "",
    destacado: Boolean(initialValues?.destacado),
  };
}

export function validarArchivoImagen(archivo) {
  if (!archivo) return "";
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
    return "La imagen debe ser JPG, JPEG, PNG o WebP.";
  }
  if (archivo.size > TAMANIO_MAX_IMAGEN_BYTES) {
    return "La imagen no puede superar los 5 MB.";
  }
  return "";
}

export function validarCampos(
  formulario,
  { nuevaCategoria = "", archivoImagen = null, errorArchivo = "" } = {}
) {
  const errores = {};

  const nombreTrim = (formulario?.nombre || "").trim();
  if (!nombreTrim) {
    errores.nombre = "El nombre es obligatorio.";
  }

  const descTrim = (formulario?.descripcion || "").trim();
  if (!descTrim) {
    errores.descripcion = "La descripción es obligatoria.";
  }

  const precioTrim = String(formulario?.precio ?? "").trim();
  const precioNum = Number(precioTrim);
  if (precioTrim === "" || !Number.isFinite(precioNum) || precioNum < 0) {
    errores.precio = "Ingresá un precio válido mayor o igual a 0.";
  }

  const stockTrim = String(formulario?.stock ?? "").trim();
  const stockNum = Number(stockTrim);
  if (stockTrim === "" || !Number.isInteger(stockNum) || stockNum < 0) {
    errores.stock = "Ingresá un stock entero mayor o igual a 0.";
  }

  if (!formulario?.categoria) {
    errores.categoria = "Seleccioná una categoría.";
  } else if (formulario.categoria === OTRA_CATEGORIA && !nuevaCategoria.trim()) {
    errores.nuevaCategoria = "Ingresá el nombre de la nueva categoría.";
  }

  const imagenUrlTrim = (formulario?.imagenUrl || "").trim();
  if (!imagenUrlTrim && !archivoImagen) {
    errores.imagenUrl = "La imagen del producto es obligatoria.";
  }

  if (errorArchivo) {
    errores.archivo = errorArchivo;
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
    valoresLimpios: {
      nombre: nombreTrim,
      descripcion: descTrim,
      precio: precioNum,
      stock: stockNum,
      categoria: formulario?.categoria || "",
      medidas: (formulario?.medidas || "").trim(),
      materiales: (formulario?.materiales || "").trim(),
      destacado: Boolean(formulario?.destacado),
      nuevaCategoria: nuevaCategoria.trim(),
      imagenUrl: imagenUrlTrim,
    },
  };
}

export function construirPayload(valoresLimpios, { categoriaFinal, imagenUrlFinal }) {
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

