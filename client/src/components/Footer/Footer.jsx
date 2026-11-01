import "./Footer.styles.css";
import {Mail} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faInstagram,
    faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container py-4">
                <div className="row">
                    {/* Dirección */}
                    <div className="col-lg-6 col-md-12 mb-4">
                        <h2 className="footer-title mb-3">
                            Hermanos Jota - Casa Taller
                        </h2>

                        <address>
                            Av. San Juan 2847
                            <br/>
                            C1232AAB - Barrio de San Cristóbal
                            <br/>
                            Ciudad Autónoma de Buenos Aires
                            <br/>
                            Argentina
                        </address>
                    </div>

                    {/* Contacto */}
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h2 className="footer-title mb-3">
                            Contacto
                        </h2>

                        <ul className="list-unstyled mb-0">
                            <li className="mb-1">
                                <Mail
                                    size={18}
                                    aria-hidden="true"
                                />

                                <a href="mailto:info@hermanosjota.com.ar">
                                    info@hermanosjota.com.ar
                                </a>
                            </li>

                            <li className="mb-1">
                                <Mail
                                    size={18}
                                    aria-hidden="true"
                                />

                                <a href="mailto:ventas@hermanosjota.com.ar">
                                    ventas@hermanosjota.com.ar
                                </a>
                            </li>

                            <li className="mb-1">
                                <FontAwesomeIcon
                                    icon={faInstagram}
                                    aria-hidden="true"
                                />

                                <a
                                    href="https://www.instagram.com/hermanosjota_ba/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    @hermanosjota_ba
                                </a>
                            </li>

                            <li>
                                <FontAwesomeIcon
                                    icon={faWhatsapp}
                                    aria-hidden="true"
                                />

                                <a href="tel:+541145678900">
                                    +54 11 4567-8900
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Horarios */}
                    <div className="col-lg-3 col-md-6 mb-4">
                        <h2 className="footer-title mb-3">
                            Horarios
                        </h2>

                        <table className="table">
                            <tbody>
                            <tr>
                                <th scope="row">
                                    Lunes a Viernes:
                                </th>

                                <td>
                                    10:00 - 19:00
                                </td>
                            </tr>

                            <tr>
                                <th scope="row">
                                    Sábados:
                                </th>

                                <td>
                                    10:00 - 14:00
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="footer-bottom text-center p-3">
                © {currentYear} Hermanos Jota
            </div>
        </footer>
    );
}

export default Footer;
