const app = require('./app');

// Usa el puerto definido por el `.env` o 3001 por defecto
const port = process.env.PORT || 3000;

// Inicia el servidor
const start = async () => {
    try {
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        })
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

start();
