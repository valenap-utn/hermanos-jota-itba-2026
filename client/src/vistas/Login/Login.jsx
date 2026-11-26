import {useNavigate} from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm";
import {autenticarUsuario} from "../../services/authService";
import {useAuth} from "../../context/AuthContext";
import {useToast} from "../../context/ToastContext";

function Login() {
    const navigate = useNavigate();
    const {iniciarSesion} = useAuth();
    const {mostrarToast} = useToast();

    const manejarLogin = async (credenciales) => {
        const {usuario, token} = await autenticarUsuario(credenciales);

        iniciarSesion(usuario, token);

        mostrarToast(
            `¡Bienvenido/a, ${usuario.nombre}!`,
            "success"
        );

        navigate("/", {replace: true});
    };

    return (
        <AuthForm
            modo="login"
            onSubmit={manejarLogin}
        />
    );
}

export default Login;
