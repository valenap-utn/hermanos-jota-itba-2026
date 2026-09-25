import {useRef, useState} from 'react';
import StatusModal from '../StatusModal/StatusModal';

const initialFormData = {
    nombre: "",
    email: "",
    telefono: "",
    motivo: "",
    mensaje: "",
};

function ContactForm() {

    const [formData, setFormData] = useState(initialFormData);
    const [wasValidated, setWasValidated] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const submitButtonRef = useRef(null);

    const handleChange = (event) => {
        const {name, value} = event.target;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const form = event.currentTarget;

        setWasValidated(true);

        if (!form.checkValidity()) {
            const firstInvalidField = form.querySelector(":invalid");
            firstInvalidField?.focus();
            return;
        }

        // Abre el modal
        setShowStatusModal(true);

        // Limpia los campos
        setFormData(initialFormData);

        // Elimina los estados verdes de validación
        setWasValidated(false);
    };

    const handleCloseStatusModal = () => {
        setShowStatusModal(false);

        requestAnimationFrame(() => {
            submitButtonRef.current?.focus();
        });
    };

    return (
        <>
            <div className="contacto-formulario">
                <h2 className="texto-titulo-elegante fs-4 mb-4 texto-marca-primario">
                    Envíanos un mensaje
                </h2>

                <form
                    className={`needs-validation ${wasValidated ? "was-validated" : ""}`}
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label
                                htmlFor="nombre"
                                className="form-label texto-secundario-leyenda text-uppercase texto-marca-primario"
                            >
                                Nombre Completo
                            </label>

                            <input
                                type="text"
                                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                minLength={3}
                                placeholder="Tu nombre"
                                aria-describedby="nombre-error"
                            />

                            <div
                                id="nombre-error"
                                className="invalid-feedback texto-secundario-leyenda">
                                Por favor, ingresa tu nombre.
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="email"
                                className="form-label texto-secundario-leyenda text-uppercase texto-marca-primario"
                            >
                                Correo Electrónico
                            </label>

                            <input
                                type="email"
                                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="tu@email.com"
                                aria-describedby="email-error"
                            />

                            <div
                                id="email-error"
                                className="invalid-feedback texto-secundario-leyenda">
                                Por favor, ingresa un correo electrónico válido.
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="telefono"
                                className="form-label texto-secundario-leyenda text-uppercase texto-marca-primario"
                            >
                                Teléfono / WhatsApp
                            </label>

                            <input
                                type="tel"
                                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="Ej: +54 11 1234-5678"
                            />
                        </div>

                        <div className="col-md-6">
                            <label
                                htmlFor="motivo"
                                className="form-label texto-secundario-leyenda text-uppercase texto-marca-primario"
                            >
                                Motivo de Consulta
                            </label>

                            <select
                                className="form-select rounded-0 p-3 bg-light border-0 texto-principal"
                                id="motivo"
                                required
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleChange}
                                aria-describedby="motivo-error"
                            >
                                <option value="" disabled>
                                    Selecciona una opción
                                </option>
                                <option value="consulta">Consulta General</option>
                                <option value="medida">
                                    Mueble a Medida / Personalizado
                                </option>
                                <option value="herencia">
                                    Programa Herencia Viva (Restauración)
                                </option>
                                <option value="taller">
                                    Inscripción a Taller de Cuidados
                                </option>
                            </select>

                            <div
                                id="motivo-error"
                                className="invalid-feedback texto-secundario-leyenda">
                                Por favor, selecciona un motivo.
                            </div>
                        </div>

                        <div className="col-12">
                            <label
                                htmlFor="mensaje"
                                className="form-label texto-secundario-leyenda text-uppercase texto-marca-primario"
                            >
                                Mensaje
                            </label>

                            <textarea
                                className="form-control rounded-0 p-3 bg-light border-0 texto-principal"
                                id="mensaje"
                                name="mensaje"
                                value={formData.mensaje}
                                onChange={handleChange}
                                rows={5}
                                required
                                minLength={10}
                                placeholder="Cuéntanos sobre tu proyecto..."
                                aria-describedby="mensaje-error"
                            />

                            <div
                                id="mensaje-error"
                                className="invalid-feedback texto-secundario-leyenda">
                                Por favor, escribe tu mensaje.
                            </div>
                        </div>

                        <div className="col-12 mt-4">
                            <button
                                ref={submitButtonRef}
                                type="submit"
                                className="texto-titulo-cta py-3 px-5 rounded-0 w-100 btn-marca-primario"
                            >
                                Enviar Mensaje
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal */}
            <StatusModal
                show={showStatusModal}
                title="¡Mensaje enviado!"
                message="Gracias por comunicarte con la Casa Taller. Hemos recibido tu consulta y uno de nuestros artesanos se contactará contigo a la brevedad."
                onClose={handleCloseStatusModal}
            />
        </>
    );
}

export default ContactForm;