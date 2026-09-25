import ContactForm from "../../components/ContactForm/ContactForm";
import "./Contacto.styles.css";

function Contacto() {
    return (
        <section className="container my-4">
            <h1 className="texto-titulo-elegante display-4 mb-3">
                Contáctenos
            </h1>

            <ContactForm/>
        </section>
    );
}

export default Contacto;
