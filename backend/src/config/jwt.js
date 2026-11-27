const ALGORITHM = 'HS256';

function obtenerConfiguracionJWT() {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

    if (!secret || !/^[a-fA-F0-9]{64}$/.test(secret)) {
        throw new Error(
            'JWT_SECRET debe contener una clave hexadecimal de 64 caracteres.'
        );
    }

    if (!/^[1-9]\d*[smhd]$/.test(expiresIn)) {
        throw new Error(
            'JWT_EXPIRES_IN debe ser una duración válida. Ejemplo: 1h.'
        );
    }

    return {
        secret,
        expiresIn,
        algorithm: ALGORITHM,
    };
}

module.exports = {
    obtenerConfiguracionJWT,
};
