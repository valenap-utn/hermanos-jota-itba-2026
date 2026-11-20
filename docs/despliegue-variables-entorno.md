# Guía de Despliegue y Variables de Entorno (DevOps)

Esta guía documenta la configuración necesaria para el despliegue de **Hermanos Jota** en entornos productivos (MongoDB Atlas, Render y Vercel).

---

## 1. Base de Datos: MongoDB Atlas

1. **Creación del Cluster:**
   - Crear un cluster M0 (Free Tier) en la región más cercana (ej. `sa-east-1` / `us-east-1`).
   - Crear una base de datos denominada `hermanos-jota`.

2. **Acceso a la Base de Datos (Database Access):**
   - Crear un usuario con autenticación por contraseña.
   - Asignar permisos de lectura y escritura (`readWrite` sobre la base `hermanos-jota` o `readWriteAnyDatabase`).

3. **Acceso de Red (Network Access):**
   - Para permitir la conectividad desde los servidores de Render (cuyas IPs son dinámicas), agregar la entrada:
     - **IP Address:** `0.0.0.0/0` (Allow access from anywhere).
     - **Description:** `Render dynamic IP whitelist`.

4. **Cadena de Conexión (SRV):**
   - Obtener la URI desde *Connect > Drivers (Node.js)*:
     ```text
     mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/hermanos-jota?retryWrites=true&w=majority
     ```

---

## 2. Backend: Configuración en Render

En el servicio Web Service de Render, configurar las siguientes variables de entorno:

| Variable | Tipo | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Obligatoria | Modo de ejecución de Node.js | `production` |
| `PORT` | Automática | Puerto asignado por Render | *Asignado por Render* |
| `MONGODB_URI` | Obligatoria / Secreta | Cadena de conexión a MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Obligatoria / Secreta | Clave para firma y verificación de JWT | *Cadena criptográfica aleatoria* |
| `MAX_PRODUCTOS` | Opcional | Límite máximo de productos en catálogo | `50` |
| `CLOUDINARY_CLOUD_NAME` | Opcional | Nombre del cloud en Cloudinary | `tu_cloud_name` |
| `CLOUDINARY_API_KEY` | Opcional | Clave de API de Cloudinary | `tu_api_key` |
| `CLOUDINARY_API_SECRET` | Opcional / Secreta | Secreto de API de Cloudinary | `tu_api_secret` |

**Comandos de construcción y ejecución en Render:**
- **Build Command:** `npm --prefix backend install`
- **Start Command:** `npm --prefix backend start`

---

## 3. Frontend: Configuración en Vercel

En el proyecto de Vercel, configurar las variables de entorno para los entornos de **Production** y **Preview**:

| Variable | Descripción | Valor recomendado |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | URL base pública de la API REST | `https://<nombre-servicio>.onrender.com/api` |

---

## 4. Buenas Prácticas de Seguridad y Repositorio

- **Archivos `.env` ignorados:** Los archivos `.env`, `.env.local` y equivalentes están excluidos del control de versiones mediante `.gitignore` en la raíz, backend y cliente.
- **Plantillas seguras:** Se mantienen `.env.example` sincronizados en `backend/` y `client/` sin contener valores reales ni contraseñas.
- **Sanitización de logs:** En `backend/src/config/db.js` los errores de conexión a MongoDB se registran sanitizando la cadena para no exponer credenciales en la consola.
