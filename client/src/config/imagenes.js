export const PLACEHOLDER_IMAGEN = "/assets/img/placeholder.svg";

export function manejarErrorImagen(event) {
  const img = event.currentTarget;
  img.onerror = null;

  if (!img.src.endsWith(PLACEHOLDER_IMAGEN)) {
    img.src = PLACEHOLDER_IMAGEN;
  }
}
