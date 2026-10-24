# Colección de Postman de la API Hermanos Jota

Esta carpeta contiene la colección de Postman utilizada para probar manualmente los endpoints de la API, como evidencia de las pruebas
realizadas en los distintos issues del backend.

## Archivo

- `HermanosJota.postman_collection.json`: colección con las requests agrupadas por recurso (Catálogo, HealthCheck, etc.).

## Cómo usar

1. Descargar el archivo.
2. Abrir Postman.
3. Importar desde la opción: **Use resource or import** → seleccionar el JSON (o arrastrarlo directo a la ventana de Postman).
4. En la esquina superior derecha, crear el environment **"Hermanos Jota"** en el desplegable.
5. Añadir a ese environment la variable `servidorUrl`, que apunte al servidor correspondiente:
   - Desarrollo local: `http://localhost:3001/api`
   - Servidor desplegado: reemplazar por la URL de producción, si aplica.
6. Ejecutar cualquier request de la colección.

## Casos cubiertos (Catálogo de productos)

- **Obtener productos** — `GET /api/productos` → 200 con el catálogo completo (`_id`, `imagenUrl`, etc.).
- **Obtener producto por id** — `GET /api/productos/:id` → 200 con el producto correspondiente buscando por su `_id` de MongoDB.
- **Obtener producto por id inexistente** — `GET /api/productos/:id` con un `_id` con formato válido que no existe en la base de datos → 404.
- **Obtener producto con id inválido** — `GET /api/productos/:id` con un formato de identificador inválido → 400.
