import AuthForm from "../../components/AuthForm/AuthForm";

function Registro() {
    const manejarRegistro = async () => {
        throw new Error(
            "El registro de usuarios todavía no está disponible."
        );
    };

    return (
        <AuthForm
            modo="registro"
            onSubmit={manejarRegistro}
        />
    );
}

export default Registro;