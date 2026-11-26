function datosUsuario(datos = {}) {
    return {
        nombre: 'Usuario Prueba',
        email: 'usuario@example.com',
        password: 'Prueba1234',
        ...datos,
    };
}

module.exports = {
    datosUsuario,
};
