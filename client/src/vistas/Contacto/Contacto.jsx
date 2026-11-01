import {Clock, Leaf, MapPin, PersonStanding, RefreshCcw, ShieldCheck, Wrench, Phone, Mail} from "lucide-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInstagram, faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import ContactForm from "../../components/ContactForm/ContactForm";
import ContactInfoItem from "../../components/ContactInfoItem/ContactInfoItem";
import SustainabilityBenefit from "../../components/SustainabilityBenefit/SustainabilityBenefit";
import "./Contacto.styles.css";

function Contacto() {
    return (
        <>
            <section className="contacto-hero">
                <div className="container text-center">
                    <h1 className="texto-titulo-elegante contacto-hero__title">
                        Contáctenos
                    </h1>

                    <p className="texto-principal contacto-hero__description">
                        Muebles que alimentan el alma. Escríbenos para consultas sobre piezas
                        personalizadas, restauraciones bajo nuestro programa{" "}
                        <strong className="texto-enfasis-subtitulo texto-marca-primario">
                            Herencia Viva
                        </strong>{" "}
                        o visitas al taller.
                    </p>
                </div>
            </section>

            <section className="container contacto-main">
                <div className="row gx-0 gy-4 gx-lg-5">
                    <div className="col-12 col-lg-7">
                        <ContactForm/>
                    </div>

                    <div className="col-12 col-lg-5">
                        <div className="contacto-info">
                            <h2 className="texto-titulo-elegante fs-4 texto-marca-primario contacto-section-title">
                                Nuestra Casa Taller
                            </h2>

                            <div className="contacto-info__items">
                                <ContactInfoItem
                                    icon={<MapPin/>}
                                    title="Showroom y Taller"
                                >
                                    <address className="texto-principal contacto-info-item__text">
                                        Av. San Juan 2847
                                        <br/>
                                        C1232AAB - Barrio de San Cristóbal
                                        <br/>
                                        Ciudad Autónoma de Buenos Aires, Argentina
                                    </address>
                                </ContactInfoItem>

                                <ContactInfoItem
                                    icon={<Clock/>}
                                    title="Horarios de Atención"
                                >
                                    <p className="texto-principal contacto-info-item__text">
                                        <strong>Lunes a Viernes:</strong> 10:00 - 19:00
                                        <br/>
                                        <strong>Sábados:</strong> 10:00 - 14:00
                                    </p>
                                </ContactInfoItem>

                                <ContactInfoItem
                                    icon={<Phone/>}
                                    title="Contacto Directo"
                                >
                                    <div className="contacto-info-item__links">
                                        <a
                                            href="https://wa.me/541145678900"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="contacto-info-link"
                                        >
                                            <FontAwesomeIcon
                                                icon={faWhatsapp}
                                                className="contacto-info-link__icon"
                                                aria-hidden="true"
                                            />

                                            <span>+54 11 4567-8900</span>
                                        </a>

                                        <a
                                            href="mailto:info@hermanosjota.com.ar"
                                            className="contacto-info-link"
                                        >
                                            <Mail
                                                className="contacto-info-link__icon"
                                                aria-hidden="true"
                                            />

                                            <span>info@hermanosjota.com.ar</span>
                                        </a>

                                        <a
                                            href="mailto:ventas@hermanosjota.com.ar"
                                            className="contacto-info-link"
                                        >
                                            <Mail
                                                className="contacto-info-link__icon"
                                                aria-hidden="true"
                                            />

                                            <span>ventas@hermanosjota.com.ar</span>
                                        </a>
                                    </div>
                                </ContactInfoItem>

                                <ContactInfoItem
                                    icon={<FontAwesomeIcon icon={faInstagram}/>}
                                    title="Redes Sociales"
                                >
                                    <a
                                        href="https://instagram.com/hermanosjota_ba"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contacto-info-link"
                                    >
                                        <span>@hermanosjota_ba</span>
                                    </a>
                                </ContactInfoItem>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mapa-taller-container">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.47958988636!2d-58.4055272!3d-34.6173661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaeffb032d8b%3A0xc3f510842db117b9!2sAv.%20San%20Juan%202847%2C%20C1232AAB%20CABA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
                        className="mapa-taller-iframe"
                        title="Ubicación de Hermanos Jota - Casa Taller"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </section>

            <section className="contacto-sustentabilidad">
                <div className="container">
                    <div className="contacto-sustentabilidad__header text-center">
                        <h2 className="texto-titulo-elegante contacto-sustentabilidad__title">
                            Garantía y Sustentabilidad
                        </h2>

                        <p className="texto-principal contacto-sustentabilidad__description">
                            Creemos en la longevidad y el impacto responsable. Todas nuestras
                            piezas son fabricadas con maderas nativas certificadas FSC
                            (Algarrobo, Quebracho, Caldén) y acabadas con ceras y aceites 100%
                            naturales.
                        </p>
                    </div>

                    <div className="contacto-beneficios">
                        <div className="contacto-beneficio-col">
                            <SustainabilityBenefit
                                icon={ShieldCheck}
                                iconVariant="premium"
                                title="Garantía de Vida"
                            >
                                Garantía extendida de 10 años en estructura y 5 años en acabados.
                            </SustainabilityBenefit>
                        </div>

                        <div className="contacto-beneficio-col">
                            <SustainabilityBenefit
                                icon={Wrench}
                                iconVariant="secondary"
                                title="Restauración"
                            >
                                Servicio especializado para recuperar, renovar y dar una segunda vida a tus piezas.
                            </SustainabilityBenefit>
                        </div>

                        <div className="contacto-beneficio-col">
                            <SustainabilityBenefit
                                icon={PersonStanding}
                                iconVariant="soft"
                                title="Talleres de Cuidado"
                            >
                                Capacitaciones gratuitas sobre mantenimiento de madera con aceites y ceras naturales.
                            </SustainabilityBenefit>
                        </div>

                        <div className="contacto-beneficio-col">
                            <SustainabilityBenefit
                                icon={RefreshCcw}
                                iconVariant="primary"
                                title="Recompra Garantizada"
                            >
                                Garantizamos la recompra de tu mueble de hasta el 40% de su valor para futuras renovaciones.
                            </SustainabilityBenefit>
                        </div>

                        <div className="contacto-beneficio-col">
                            <SustainabilityBenefit
                                icon={Leaf}
                                iconVariant="secondary"
                                title="Trazabilidad de Origen"
                            >
                                Certificado de trazabilidad forestal que garantiza el origen sustentable y ético de cada madera.
                            </SustainabilityBenefit>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Contacto;
