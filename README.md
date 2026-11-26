
# Mueblería Hermanos Jota

Proyecto de e-commerce desarrollado como parte de la formación Full Stack Developer del ITBA. La aplicación permite explorar un catálogo de muebles, consultar detalles, filtrar productos y gestionar un carrito. También incluye operaciones de administración de productos mediante una API REST y un módulo de autenticación de usuarios Full Stack, con registro, inicio de sesión, persistencia de sesión y cierre de sesión.

## Estructura del repositorio

```text
/
├── client/        # Frontend React
├── backend/       # Backend Node.js, Express y MongoDB
│   ├── src/       # Código fuente del servidor
│   └── tests/     # Pruebas unitarias y de integración
├── entrega-1/     # Material de los primeros sprints
├── docs/          # Documentación complementaria
└── README.md
```

El frontend y el backend se desarrollan en directorios separados. El cliente consume la API HTTP disponible bajo el prefijo `/api`.

## Tecnologías principales

- **Frontend:** React 19, React Router, JavaScript, CSS, Bootstrap, React Hook Form, Zod y `@hookform/resolvers`.
- **Backend:** Node.js, Express 5, Mongoose, MongoDB, Multer y Cloudinary.
- **Comunicación:** API REST, JSON, `fetch` y CORS.
- **Persistencia:** MongoDB (se puede configurar MongoDB Atlas mediante la cadena de conexión).
- **Autenticación:** bcrypt, JSON Web Tokens (JWT), React Context API y localStorage.
- **Testing del frontend:** Jest, React Testing Library, Testing Library User Event y Jest DOM.
- **Testing del backend:** Jest, Supertest y MongoDB Memory Server.

## Requisitos previos

- Node.js y npm instalados.
- Una base de datos MongoDB accesible (local o MongoDB Atlas).
- Credenciales de Cloudinary para subir imágenes de productos.

## Instalación y ejecución local

Clonar el repositorio y abrir **dos terminales**, una para cada aplicación.

### 1. Backend (`/backend`)

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
JWT_SECRET=
JWT_EXPIRES_IN=1h
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP del servidor; por defecto `3001`. |
| `MONGODB_URI` | Cadena de conexión a MongoDB. |
| `MAX_PRODUCTOS` | Límite de productos del catálogo; por defecto `25`. |
| `CLOUDINARY_CLOUD_NAME` | Nombre de la cuenta Cloudinary. |
| `CLOUDINARY_API_KEY` | Clave de API de Cloudinary. |
| `CLOUDINARY_API_SECRET` | Secreto de API de Cloudinary. |
| `JWT_SECRET` | Clave secreta hexadecimal de 64 caracteres utilizada para firmar y verificar los JWT. Obligatoria para iniciar el servidor. |
| `JWT_EXPIRES_IN` | Duración de los JWT; por defecto `1h`. |
| `ADMIN_NAME` | Nombre del administrador que se desea crear mediante el seed. |
| `ADMIN_EMAIL` | Email del administrador que se desea crear mediante el seed. |
| `ADMIN_PASSWORD` | Contraseña del administrador que se desea crear mediante el seed. |

#### Generación de la clave secreta JWT

Ejecutar el siguiente comando para generar una clave aleatoria de 32 bytes representada mediante 64 caracteres hexadecimales:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado en la variable `JWT_SECRET` del archivo `.env`.

La duración del token puede configurarse mediante `JWT_EXPIRES_IN`, utilizando valores como `30s`, `15m`, `1h` o `7d`.

Las variables `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` son necesarias únicamente para ejecutar el seed del administrador.

#### Iniciar el servidor

```bash
npm start
```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

Por defecto, la API queda disponible en `http://localhost:3001/api`.

> El servidor valida la configuración JWT e intenta conectarse a MongoDB antes de comenzar a escuchar peticiones. Si la configuración JWT es inválida o falla la conexión con MongoDB, el servidor no inicia.

### 2. Frontend (`/client`)

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

Las rutas de productos están definidas en `backend/src/routes/productosRoutes.js` y las rutas de autenticación en `backend/src/routes/authRoutes.js`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/healthcheck` | Comprobar disponibilidad del servicio. |
| `POST` | `/api/auth/register` | Registrar un usuario con rol CLIENTE. |
| `POST` | `/api/auth/login` | Autenticar un usuario y obtener un JWT. |
| `GET` | `/api/auth/me` | Obtener los datos del usuario autenticado. Requiere JWT. |
| `GET` | `/api/productos` | Listar productos, con filtros y paginación opcional. |
| `GET` | `/api/productos/:id` | Obtener un producto por su identificador MongoDB. |
| `POST` | `/api/productos` | Crear un producto. |
| `PUT` | `/api/productos/:id` | Modificar un producto existente. |
| `DELETE` | `/api/productos/:id` | Eliminar un producto existente. |

### Autenticación de usuarios

El backend implementa autenticación mediante JWT y almacenamiento seguro de contraseñas mediante bcrypt.

#### Roles de usuario

| Rol | Descripción |
| --- | --- |
| `CLIENTE` | Rol asignado automáticamente a los usuarios registrados mediante la API pública. |
| `ADMIN` | Rol asignado a los administradores creados mediante el seed correspondiente. |

El registro público no permite crear usuarios con rol `ADMIN`, independientemente del rol enviado en el cuerpo de la solicitud.

La autenticación se encuentra integrada con el frontend. La autorización de las operaciones del catálogo según el rol del usuario queda pendiente de implementación.

#### Registro de usuarios

```http
POST /api/auth/register
```

El endpoint recibe un cuerpo JSON con los siguientes campos:

| Campo | Descripción |
| --- | --- |
| `nombre` | Obligatorio, entre 3 y 100 caracteres. |
| `email` | Obligatorio, único y con formato de correo electrónico válido. |
| `password` | Obligatorio, con un mínimo de 8 caracteres y un máximo de 72 bytes. |

El email se normaliza eliminando espacios en los extremos y convirtiéndolo a minúsculas.

Las contraseñas se almacenan mediante bcrypt con un factor de costo de 12. La contraseña original y su hash no se incluyen en las respuestas de la API.

Ejemplo:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "nombre": "Usuario Ejemplo",
    "email": "usuario@example.com",
    "password": "PasswordEjemplo123"
  }'
```

Respuestas posibles:

| Código HTTP | Descripción |
| --- | --- |
| `201 Created` | Usuario registrado correctamente. |
| `400 Bad Request` | Datos ausentes o inválidos. |
| `409 Conflict` | El email ya está registrado. |

#### Inicio de sesión

```http
POST /api/auth/login
```

El endpoint recibe el email y la contraseña del usuario. Si las credenciales son válidas, devuelve un JWT firmado mediante el algoritmo HS256 y los datos públicos del usuario.

Ejemplo:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "usuario@example.com",
    "password": "PasswordEjemplo123"
  }'
```

Ejemplo ilustrativo de respuesta:

```json
{
  "status": "success",
  "data": {
    "token": "<JWT>",
    "usuario": {
      "_id": "<id-del-usuario>",
      "nombre": "Usuario Ejemplo",
      "email": "usuario@example.com",
      "rol": "CLIENTE"
    }
  }
}
```

Respuestas posibles:

| Código HTTP | Descripción |
| --- | --- |
| `200 OK` | Autenticación exitosa. |
| `400 Bad Request` | Datos ausentes o inválidos. |
| `401 Unauthorized` | Credenciales inválidas. |

El mensaje de credenciales inválidas es el mismo tanto para un email inexistente como para una contraseña incorrecta.

#### Obtener el usuario autenticado

```http
GET /api/auth/me
```

El endpoint requiere enviar el JWT mediante el encabezado HTTP `Authorization`, utilizando el esquema Bearer.

```http
Authorization: Bearer <JWT>
```

Ejemplo:

```bash
curl http://localhost:3001/api/auth/me \
  -H 'Authorization: Bearer <JWT>'
```

Reemplazar `<JWT>` por el token obtenido durante el inicio de sesión.

El middleware de autenticación verifica la firma, la expiración y el identificador del usuario incluido en el token. También consulta MongoDB para comprobar que el usuario continúa existiendo y obtener sus datos actuales.

Respuestas posibles:

| Código HTTP | Descripción |
| --- | --- |
| `200 OK` | Devuelve los datos públicos del usuario autenticado. |
| `401 Unauthorized` | Token ausente, inválido, expirado o correspondiente a un usuario inexistente. |

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

## Autenticación del frontend

El frontend implementa el registro, inicio de sesión, persistencia y cierre de sesión de usuarios mediante React Context API y los endpoints de autenticación del backend.

### Rutas de autenticación

| Ruta | Descripción |
| --- | --- |
| `/registro` | Formulario de registro de nuevos usuarios. |
| `/login` | Formulario de inicio de sesión. |

Ambos formularios utilizan un componente reutilizable (`AuthForm`) y validaciones mediante React Hook Form y Zod.

### Organización del módulo

```text
client/src/
├── components/
│   ├── AuthForm/
│   └── MenuCuenta/
├── context/
│   └── AuthContext.jsx
├── schemas/
│   └── authSchema.js
├── services/
│   └── authService.js
├── utils/
│   └── authStorage.js
└── vistas/
    ├── Login/
    └── Registro/
```

- `AuthForm`: componente reutilizable para los formularios de registro e inicio de sesión.
- `MenuCuenta`: interfaz de acceso a la cuenta, información del usuario, cierre de sesión y manejo de advertencias.
- `AuthContext`: gestión global del estado de autenticación.
- `authSchema`: esquemas de validación de los formularios.
- `authService`: comunicación con los endpoints de autenticación mediante `apiClient`.
- `authStorage`: gestión del almacenamiento local del JWT.

### Estado global de autenticación

El componente `AuthProvider` proporciona el estado de autenticación a toda la aplicación mediante el hook `useAuth()`.

| Propiedad o método | Descripción |
| --- | --- |
| `usuario` | Datos del usuario autenticado o `null`. |
| `token` | JWT de la sesión activa o `null`. |
| `isAuthenticated` | Indica si existe una sesión autenticada. |
| `cargandoSesion` | Indica si se está recuperando una sesión almacenada. |
| `errorSesion` | Información sobre errores de recuperación, persistencia o eliminación de sesión. |
| `iniciarSesion(usuario, token)` | Actualiza el estado global y almacena el JWT. |
| `cerrarSesion()` | Elimina el estado de autenticación e intenta eliminar el JWT almacenado. |
| `restaurarSesion()` | Valida el token almacenado y recupera los datos del usuario. |

### Flujo de registro

1. El usuario completa el formulario de registro.
2. Se validan los datos y la coincidencia de las contraseñas.
3. Se envía la solicitud a `POST /api/auth/register`.
4. Si el registro es exitoso, se muestra una notificación y se redirige al usuario a `/login`.
5. Si ocurre un error, se informa mediante el formulario.

El registro no inicia sesión automáticamente.

### Flujo de inicio de sesión

1. El usuario ingresa su email y contraseña.
2. Se validan los datos del formulario.
3. Se envía la solicitud a `POST /api/auth/login`.
4. El backend devuelve el JWT y los datos públicos del usuario.
5. `AuthContext` actualiza el estado global y almacena el token.
6. Se muestra una notificación de bienvenida y se redirige al usuario al inicio.

El menú de cuenta del encabezado se actualiza automáticamente según el estado de autenticación.

### Persistencia y recuperación de sesión

El JWT se almacena en `localStorage` utilizando la clave `hermanosJotaAuthToken`.

Al iniciar la aplicación o recargar la página, `AuthProvider` verifica si existe un token almacenado. Si existe, realiza una solicitud a `GET /api/auth/me` para validar la sesión y recuperar los datos actuales del usuario.

Los datos del usuario y su rol no se almacenan en `localStorage`.

Durante la recuperación se muestra un indicador no interactivo en el acceso a la cuenta.

El contexto contempla las siguientes situaciones:

| Situación | Comportamiento |
| --- | --- |
| Token válido | Recupera la sesión y los datos del usuario. |
| Token inválido o expirado | Intenta eliminar el token almacenado y mantiene la sesión cerrada. |
| Error de conexión o del servidor | Conserva el token y permite reintentar la recuperación. |
| Error al almacenar el token | Mantiene la sesión activa en memoria e informa que no pudo persistirse. |
| Error al eliminar el token | Limpia el estado en memoria, informa el problema y permite reintentar la eliminación. |

Las operaciones asíncronas de recuperación incluyen un mecanismo de invalidación para evitar que una respuesta anterior sobrescriba una sesión nueva o restaure una sesión después del logout.

### Cierre de sesión

El usuario puede cerrar sesión desde el menú de cuenta disponible en el encabezado, tanto en desktop como en dispositivos móviles.

El cierre de sesión realiza las siguientes operaciones:

1. Invalida las operaciones pendientes de recuperación.
2. Intenta eliminar el JWT almacenado en `localStorage`.
3. Limpia los datos de autenticación del contexto.
4. Actualiza la interfaz.
5. Muestra una notificación de éxito o error.
6. Redirige al usuario al inicio.

Si falla la eliminación del token, la interfaz informa que la sesión podría recuperarse al recargar la página y permite reintentar el cierre.

## Datos iniciales (seed)

### Productos y categorías

Desde `backend/`:

```bash
npm run seed
```

El seed utiliza una estrategia de actualización/inserción (*upsert*) para conservar productos ya creados. También crea categorías.

Para ejecutar el modo destructivo de reinicialización:

```bash
npm run seed:reset
```

**Atención:** `seed:reset` puede eliminar datos existentes. Utilizarlo solamente en un entorno donde sea aceptable reiniciar los datos.

### Usuario administrador

El proyecto dispone de un seed independiente para crear usuarios con rol `ADMIN`.

Completar las siguientes variables en `backend/.env`:

```dotenv
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

La contraseña debe cumplir los mismos requisitos que una contraseña de registro público.

Desde `backend/`, ejecutar:

```bash
npm run seed:admin
```

El comportamiento del script es el siguiente:

- Si el email no existe, crea un usuario con rol `ADMIN` y almacena su contraseña mediante bcrypt.
- Si ya existe un administrador con ese email, no crea un duplicado ni modifica sus datos.
- Si el email pertenece a un usuario con rol `CLIENTE`, rechaza la operación.
- Si faltan variables obligatorias o los datos son inválidos, informa el error y finaliza con un código de salida distinto de cero.

El seed del administrador es idempotente y no elimina usuarios existentes.

Una vez creado el administrador, puede autenticarse mediante `POST /api/auth/login`.

**Importante:** verificar la variable `MONGODB_URI` antes de ejecutar cualquier seed, ya que determina la base de datos sobre la que se realizará la operación.

## Testing del backend

El backend utiliza Jest como framework de testing, Supertest para realizar solicitudes HTTP sobre la aplicación Express y MongoDB Memory Server para las pruebas que requieren persistencia.

### Organización de las pruebas

```text
backend/
├── jest.config.js
└── tests/
    ├── setup.js
    ├── helpers/
    │   ├── testDb.js
    │   └── userFactory.js
    ├── unit/
    │   ├── user.test.js
    │   └── jwt.test.js
    └── integration/
        ├── auth.test.js
        └── seedAdmin.test.js
```

- **Pruebas unitarias:** verifican las validaciones del modelo de usuario y la configuración JWT.
- **Pruebas de integración:** verifican los endpoints de registro, login y usuario autenticado, incluyendo respuestas de error y validaciones de seguridad.
- **Pruebas del seed:** verifican la creación del administrador, el almacenamiento de contraseñas, la idempotencia y la integración con el login.

### Ejecutar las pruebas

Desde `backend/`:

```bash
npm test
```

Para ejecutar las pruebas en modo observación:

```bash
npm run test:watch
```

Para ejecutar un archivo específico:

```bash
npm test -- tests/integration/auth.test.js
```

### Cobertura de código

Para generar un reporte de cobertura:

```bash
npm run test:coverage
```

Jest muestra un resumen en la terminal y genera un reporte HTML en:

```text
backend/coverage/index.html
```

El reporte incluye cobertura de sentencias, ramas, funciones y líneas de código.

La configuración de cobertura excluye el archivo de inicio del servidor y los scripts del directorio `src/scripts/`. El seed del administrador cuenta con pruebas de integración, aunque no aparece en el reporte de cobertura.

### Aislamiento del entorno de testing

Las pruebas de integración utilizan una instancia temporal de MongoDB creada mediante MongoDB Memory Server, independiente de la base de datos de desarrollo o producción.

Los datos de prueba se eliminan entre ejecuciones individuales y la instancia temporal se detiene al finalizar la suite.

Las pruebas de autenticación utilizan claves JWT y credenciales ficticias generadas o definidas exclusivamente para testing.

No es necesario configurar una conexión a MongoDB Atlas para ejecutar estas pruebas.

MongoDB Memory Server puede necesitar descargar el binario de MongoDB durante la primera ejecución, por lo que esta puede demorar más que las siguientes.

## Testing del frontend

El frontend utiliza Jest y React Testing Library para verificar el comportamiento de los componentes, contextos, servicios y utilidades.

### Organización de las pruebas

Las pruebas se encuentran junto a los archivos correspondientes dentro de `client/src/`.

```text
client/src/
├── components/
│   ├── AuthForm/
│   │   └── AuthForm.test.jsx
│   └── MenuCuenta/
│       └── MenuCuenta.test.jsx
├── context/
│   └── AuthContext.test.jsx
├── schemas/
│   └── authSchema.test.js
├── services/
│   └── authService.test.js
├── utils/
│   └── authStorage.test.js
└── vistas/
    ├── Login/
    │   └── Login.test.jsx
    └── Registro/
        └── Registro.test.jsx
```

Las pruebas del módulo de autenticación verifican:

- Validación de formularios de registro e inicio de sesión.
- Comunicación con los servicios de autenticación.
- Actualización y propagación del estado global.
- Persistencia y recuperación de sesión.
- Eliminación de tokens inválidos o expirados.
- Cierre de sesión.
- Manejo de errores de conexión y almacenamiento.
- Protección frente a condiciones de carrera.
- Comportamiento del menú de cuenta.
- Notificaciones y redirecciones.

### Ejecutar las pruebas

Desde `client/`, ejecutar todas las pruebas:

```bash
npm test -- --watchAll=false --runInBand
```

Para ejecutar las pruebas en modo observación:

```bash
npm test
```

Para ejecutar las pruebas de un módulo específico:

```bash
npm test -- --watchAll=false --runInBand --testPathPattern=AuthContext
```

### Cobertura de código

Para generar un reporte de cobertura global:

```bash
npm test -- --watchAll=false --runInBand --coverage
```

Para obtener la cobertura de un archivo específico:

```bash
npm test -- --watchAll=false --runInBand \
  --testPathPattern=AuthContext \
  --coverage \
  --collectCoverageFrom=src/context/AuthContext.jsx
```

El reporte HTML se genera en:

```text
client/coverage/index.html
```

El reporte incluye cobertura de sentencias, ramas, funciones y líneas de código.

### Aislamiento del entorno de testing

Las pruebas utilizan credenciales, usuarios y tokens ficticios. Los servicios externos se simulan mediante mocks, por lo que no es necesario iniciar el backend ni disponer de una conexión a MongoDB.

Las pruebas de persistencia utilizan el almacenamiento local del entorno de testing, limpiándolo entre ejecuciones para evitar dependencias entre casos.

Las pruebas de componentes simulan las funciones de navegación de React Router cuando corresponde. No sustituyen las pruebas de navegación real ni las verificaciones manuales de integración Full Stack.

## Despliegue

El repositorio contiene un script raíz de compilación que instala las dependencias de `/backend` y `/client` y construye el frontend. Además, Express está configurado para servir los archivos generados en `client/build` y resolver las rutas del frontend.

La configuración final de hosting debe comprobarse en el proveedor de despliegue; la presencia de scripts no confirma que una versión específica esté publicada.

| Servicio | URL pública |
| --- | --- |
| Frontend | **https://hermanos-jota-itba-2026.vercel.app/** |
| Backend / API | **https://hermanos-jota-itba-2026.onrender.com/api** |

Si se utiliza Render, verificar el directorio de trabajo y los comandos de build/inicio, las variables de entorno, la conexión con MongoDB Atlas y el acceso a los endpoints públicos. Si el frontend se despliega en otro origen, comprobar CORS desde esa URL.

Configurar `JWT_SECRET` y, opcionalmente, `JWT_EXPIRES_IN` en las variables de entorno del servicio backend antes de desplegar la funcionalidad de autenticación.

La clave JWT debe mantenerse estable entre reinicios del servidor. Modificarla invalida los tokens firmados con la clave anterior.

Antes de dar por finalizada la publicación, probar los endpoints desde la URL pública y confirmar que los cambios persistan en la base de datos configurada. Realizar las pruebas de escritura y eliminación sobre datos de prueba autorizados.

## Seguridad y configuración

- No subir archivos `.env` ni credenciales reales al repositorio.
- Mantener `backend/.env.example` únicamente con valores de ejemplo.
- Configurar secretos reales en las variables de entorno del proveedor de hosting.
- Verificar con Git que ningún `.env` sensible esté rastreado; estar incluido en `.gitignore` no elimina un archivo previamente versionado.
- No compartir la clave secreta JWT ni incluirla en el código del frontend.
- Utilizar claves JWT diferentes para desarrollo y producción.
- Utilizar HTTPS en producción para transmitir credenciales y tokens.
- Almacenar las contraseñas exclusivamente mediante bcrypt, nunca en texto plano.
- No permitir la asignación del rol `ADMIN` mediante el registro público.
- El backend actualmente usa `cors()` sin restricción de origen y no se debe considerar que el límite de catálogo sustituye a la autenticación o autorización.
- Las rutas de escritura del catálogo todavía no cuentan con autorización por roles. No deben considerarse operaciones administrativas protegidas hasta implementar los controles de acceso correspondientes.
- El frontend almacena únicamente el JWT en `localStorage`, no las contraseñas ni los datos personales del usuario.
- El almacenamiento de JWT en `localStorage` implica exposición ante posibles vulnerabilidades XSS. Como mejora futura, se puede evaluar una estrategia basada en cookies HttpOnly, Secure y SameSite.
- El cierre de sesión elimina el token del cliente, pero no revoca el JWT en el servidor. Un token previamente obtenido puede continuar siendo válido hasta su expiración.
- La sesión se valida contra el backend al recuperar el token almacenado. Actualmente no se implementa renovación automática de tokens, detección inmediata de expiración durante la navegación ni sincronización de sesión entre pestañas.
- El estado de autenticación y el rol disponible en el frontend no sustituyen los controles de autorización que deben aplicarse en el backend.

## Integrantes

- Valentina Andrada Perino (Referente) — GitHub: `valenap-utn`
- Milagros Escarlon — GitHub: `milagros888`
- Agustín Alberto Leiva — GitHub: `agustin-arg`
- Dante Medici — GitHub: `dantemedici`
- Gerónimo Martín Córdoba — GitHub: `gerocd`
