# Mueblería Hermanos Jota

Proyecto desarrollado como parte de la formación Full Stack Developer de ITBA.

La aplicación implementa un e-commerce para la Mueblería Hermanos Jota utilizando una arquitectura cliente-servidor.

## Estructura del proyecto

El repositorio se encuentra organizado de la siguiente manera:

```text
/
├── README.md
├── .gitignore
│
├── entrega1-vanilla/
│   ├── index.html
│   └── ...
│
└── entrega2-monolito/
    ├── cliente/       # Aplicación frontend desarrollada con React
    │   ├── src/
    │   ├── public/
    │   └── package.json
    │
    └── backend/       # API desarrollada con Node.js y Express
        ├── src/
        └── package.json
```

## Requisitos previos

Para ejecutar el proyecto es necesario tener instalado:

- Node.js
- npm

## Cliente

La aplicación cliente se encuentra dentro de `entrega2-monolito/cliente/`.

### Instalación

Desde la raíz del proyecto:

```bash
cd entrega2-monolito/cliente
npm install
```

### Ejecución

```bash
npm start
```

La aplicación React se iniciará por defecto en:

```text
http://localhost:3000
```

## Servidor

La aplicación backend se encuentra dentro de `entrega2-monolito/backend/`.

### Instalación

Desde la raíz del proyecto:

```bash
cd entrega2-monolito/backend
npm install
```

### Variables de entorno

Crear un archivo `.env` dentro de `entrega2-monolito/backend/` tomando como referencia el archivo `.env.example`.

Ejemplo:

```env
PORT=3001
```

El archivo `.env` no se encuentra versionado en el repositorio.

### Ejecución

```bash
npm start
```

El servidor se iniciará por defecto en:

```text
http://localhost:3001
```

El puerto puede configurarse mediante la variable de entorno `PORT`.

## API

### Healthcheck

Permite verificar que el servidor se encuentra funcionando correctamente.

```http
GET /api/healthcheck
```

Ejemplo:

```text
http://localhost:3001/api/healthcheck
```

Respuesta esperada:

```json
{
  "status": "OK",
  "success": true
}
```

## Tecnologías

### Frontend

- React
- JavaScript
- HTML
- CSS

### Backend

- Node.js
- Express
- CORS
- dotenv

## Integrantes

- Valentina Andrada Perino (Referente) - Usuario GitHub: valenap-utn 
- Milagros Escarlon - Usuario GitHub: milagros888 
- Agustín Alberto Leiva - Usuario GitHub: agustin-arg 
- Dante Medici - Usuario GitHub: dantemedici 
- Gerónimo Martín Córdoba - Usuario GitHub: gerocd
