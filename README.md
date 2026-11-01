# Mueblería Hermanos Jota

Proyecto de e-commerce desarrollado como parte de la formación Full Stack Developer del ITBA. La aplicación permite explorar un catálogo de muebles, consultar detalles, filtrar productos y gestionar un carrito. También incluye operaciones de administración de productos mediante una API REST.

## Estructura del repositorio

```text
/
├── client/        # Frontend React
├── backend/       # Backend Node.js, Express y MongoDB
├── entrega-1/      # Material de los primeros sprints
├── docs/           # Documentación complementaria
└── README.md
```

El frontend y el backend se desarrollan en directorios separados. El cliente consume la API HTTP disponible bajo el prefijo `/api`.

## Tecnologías principales

- **Frontend:** React 19, React Router, JavaScript, CSS, Bootstrap, React Hook Form, Zod y `@hookform/resolvers`.
- **Backend:** Node.js, Express 5, Mongoose, MongoDB, Multer y Cloudinary.
- **Comunicación:** API REST, JSON, `fetch` y CORS.
- **Persistencia:** MongoDB (se puede configurar MongoDB Atlas mediante la cadena de conexión).

## Requisitos previos

- Node.js y npm instalados.
- Una base de datos MongoDB accesible (local o MongoDB Atlas).
- Credenciales de Cloudinary para subir imágenes de productos.

## Instalación y ejecución local

Clonar el repositorio y abrir **dos terminales**, una para cada aplicación.

### 1. Backend (`/servidor`)

```bash
cd backend
npm install
```

Crear `backend/.env` a partir de `backend/.env.example` y completar las variables con los datos del entorno propio:

```dotenv
PORT=3001
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/hermanos-jota?retryWrites=true&w=majority
MAX_PRODUCTOS=25
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP del servidor; por defecto `3001`. |
| `MONGODB_URI` | Cadena de conexión a MongoDB. |
| `MAX_PRODUCTOS` | Límite de productos del catálogo; por defecto `25`. |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta Cloudinary. |
| `CLOUDINARY_API_KEY` | Clave de API de Cloudinary. |
| `CLOUDINARY_API_SECRET` | Secreto de API de Cloudinary. |

Iniciar el backend:

```bash
npm start
```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

Por defecto, la API queda disponible en `http://localhost:3001/api`.

> El servidor intenta conectarse a MongoDB antes de comenzar a escuchar peticiones. Si falla la conexión, no inicia correctamente.

### 2. Frontend (`/cliente`)

En otra terminal, desde la raíz del repositorio:

```bash
cd client
npm install
npm start
```

La aplicación de desarrollo se abre normalmente en `http://localhost:3000`.

El frontend debe poder comunicarse con la API. Opcionalmente, se puede configurar `client/.env` a partir de `client/.env.example`:

```dotenv
REACT_APP_API_URL=http://localhost:3001/api
```

| Variable | Uso |
| --- | --- |
| `REACT_APP_API_URL` | URL base de la API. Por defecto es `http://localhost:3001/api` en desarrollo y `/api` relativo en producción. Si el frontend se despliega por separado en Vercel o Netlify, configurar esta variable en el hosting con la URL de Render (ej. `https://tu-api.onrender.com/api`). |

El código del backend permite peticiones CORS mediante `cors()` sin una lista de orígenes restringidos.

Para generar una compilación de producción del frontend:

```bash
cd client
npm run build
```

## API REST

**URL base local:** `http://localhost:3001/api`

Las rutas de productos están definidas en `backend/src/routes/productosRoutes.js`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/healthcheck` | Comprobar disponibilidad del servicio. |
| `GET` | `/api/productos` | Listar productos, con filtros y paginación opcional. |
| `GET` | `/api/productos/:id` | Obtener un producto por su identificador MongoDB. |
| `POST` | `/api/productos` | Crear un producto. |
| `PUT` | `/api/productos/:id` | Modificar un producto existente. |
| `DELETE` | `/api/productos/:id` | Eliminar un producto existente. |

### Consultar productos

```http
GET /api/productos
```

Parámetros de consulta admitidos:

| Parámetro | Descripción |
| --- | --- |
| `categoria` | Filtra por nombre de categoría; `todos` no aplica filtro. |
| `busqueda` | Busca coincidencias en nombre y descripción. |
| `search` | Alias de `busqueda`. |
| `page` | Número de página, desde 1. |
| `limit` | Cantidad de resultados por página. |

Ejemplo:

```http
GET /api/productos?categoria=Sillas&busqueda=madera&page=1&limit=12
```

La paginación es **opcional**: se activa cuando se envía `page` o `limit`. En ese caso, la respuesta incluye metadatos de paginación (`total`, `page`, `limit` y `totalPages`). Sin esos parámetros se devuelve la lista completa de productos que coinciden con los filtros.

### Consultar un producto

```http
GET /api/productos/:id
```

Reemplazar `:id` por un identificador MongoDB válido de 24 caracteres hexadecimales. Un ID inválido produce un error de solicitud; uno válido pero inexistente produce un error de recurso no encontrado.

### Crear un producto

```http
POST /api/productos
```

El endpoint acepta `multipart/form-data`, incluido un archivo opcional en el campo **`imagen`**. Al crear un producto debe proporcionarse una imagen, ya sea mediante ese archivo o mediante el campo `imagenUrl` con una URL admitida.

Campos principales:

| Campo | Descripción |
| --- | --- |
| `nombre` | Nombre del producto; obligatorio. |
| `descripcion` | Descripción; obligatoria. |
| `precio` | Número mayor o igual a cero; obligatorio. |
| `stock` | Cantidad disponible; por defecto cero si no se proporciona. |
| `categoria` | Nombre de la categoría. |
| `imagen` | Archivo de imagen para subir a Cloudinary. |
| `imagenUrl` | Alternativa al archivo, sujeta a validación de origen. |
| `materiales`, `medidas` | Información adicional del producto. |
| `destacado`, `especificaciones` | Datos adicionales del catálogo. |

Ejemplo con `curl` (reemplazar la ruta de la imagen por una existente):

```bash
curl -X POST http://localhost:3001/api/productos \
  -F 'nombre=Silla de madera' \
  -F 'descripcion=Silla para comedor' \
  -F 'precio=120000' \
  -F 'stock=5' \
  -F 'categoria=Sillas' \
  -F 'imagen=@./foto.jpg'
```

La API valida que `imagenUrl`, si se envía, corresponda al Cloudinary configurado para el proyecto o a una ruta local bajo `/assets/`. La creación está limitada por `MAX_PRODUCTOS`.

### Actualizar un producto

```http
PUT /api/productos/:id
```

Admite `multipart/form-data`, incluyendo un archivo nuevo en el campo `imagen`, o campos de actualización en el cuerpo de la solicitud. Si se envía `imagenUrl`, también se valida su origen.

### Eliminar un producto

```http
DELETE /api/productos/:id
```

Elimina el producto identificado por `:id`. Verificar el identificador antes de ejecutar la operación.

### Categorías y subida de imágenes

El backend también expone rutas bajo `/api/categorias` y `/api/uploads`. Las operaciones de productos integran la resolución de categorías y la subida de imágenes, por lo que el formulario de creación puede utilizar una sola solicitud a `POST /api/productos`.

## Datos iniciales (seed)

Desde `servidor/`:

```bash
npm run seed
```

El seed utiliza una estrategia de actualización/inserción (*upsert*) para conservar productos ya creados. También crea categorías.

Para ejecutar el modo destructivo de reinicialización:

```bash
npm run seed:reset
```

**Atención:** `seed:reset` puede eliminar datos existentes. Utilizarlo solamente en un entorno donde sea aceptable reiniciar los datos.

## Despliegue

El repositorio contiene un script raíz de compilación que instala las dependencias de `/backend` y `/client` y construye el frontend. Además, Express está configurado para servir los archivos generados en `client/build` y resolver las rutas del frontend.

La configuración final de hosting debe comprobarse en el proveedor de despliegue; la presencia de scripts no confirma que una versión específica esté publicada.

| Servicio | URL pública |
| --- | --- |
| Frontend | **https://hermanos-jota-itba-2026.vercel.app/** |
| Backend / API | **https://hermanos-jota-itba-2026.onrender.com/api** |

Si se utiliza Render, verificar el directorio de trabajo y los comandos de build/inicio, las variables de entorno, la conexión con MongoDB Atlas y el acceso a los endpoints públicos. Si el frontend se despliega en otro origen, comprobar CORS desde esa URL.

Antes de dar por finalizada la publicación, probar `GET`, `POST`, `PUT` y `DELETE` desde la URL pública y confirmar que los cambios persistan en la base de datos configurada.

## Seguridad y configuración

- No subir archivos `.env` ni credenciales reales al repositorio.
- Mantener `backend/.env.example` únicamente con valores de ejemplo.
- Configurar secretos reales en las variables de entorno del proveedor de hosting.
- Verificar con Git que ningún `.env` sensible esté rastreado; estar incluido en `.gitignore` no elimina un archivo previamente versionado.
- El backend actualmente usa `cors()` sin restricción de origen y no se debe considerar que el límite de catálogo sustituye a la autenticación o autorización.
- No exponer los endpoints de escritura públicamente como si fueran un panel de administración protegido sin implementar los controles de acceso correspondientes.

## Integrantes

- Valentina Andrada Perino (Referente) — GitHub: `valenap-utn`
- Milagros Escarlon — GitHub: `milagros888`
- Agustín Alberto Leiva — GitHub: `agustin-arg`
- Dante Medici — GitHub: `dantemedici`
- Gerónimo Martín Córdoba — GitHub: `gerocd`
