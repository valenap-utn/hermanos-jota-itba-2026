import {useNavigate} from "react-router-dom";
import AuthForm from "../../components/AuthForm/AuthForm";
import {registrarUsuario} from "../../services/authService";
import {useToast} from "../../context/ToastContext";

function Registro() {
    const navigate = useNavigate();
    const {mostrarToast} = useToast();

    const manejarRegistro = async (datos) => {
        await registrarUsuario(datos);

        mostrarToast(
            "Tu cuenta fue creada correctamente. Ya podés iniciar sesión.",
            "success"
        );

        navigate("/login", {replace: true});
    };

    return (
        <AuthForm
            modo="registro"
            onSubmit={manejarRegistro}
        />
    );
}

export default Registro;