require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { obtenerConfiguracionJWT } = require('./config/jwt');

// Puerto del .env o 3001 por defecto
const port = process.env.PORT || 3001;

// Iniciamos el servidor
const start = async () => {
    try {
        obtenerConfiguracionJWT();

        await connectDB();

        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    } catch (e) {
        console.error('Error al iniciar el servidor:', e.message);
        process.exit(1);
    }
};

start();
