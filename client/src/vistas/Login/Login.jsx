import AuthForm from "../../components/AuthForm/AuthForm";

function Login() {
    const manejarLogin = async () => {
        throw new Error(
            "El inicio de sesión todavía no está disponible."
        );
    };

    return (
        <AuthForm
            modo="login"
            onSubmit={manejarLogin}
        />
    );
}

export default Login;