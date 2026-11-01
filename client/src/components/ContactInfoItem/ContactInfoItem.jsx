import "./ContactInfoItem.styles.css";

function ContactInfoItem({ icon, title, children }) {
    return (
        <div className="contacto-info-item">
            <div className="contacto-info-item__icon" aria-hidden="true">
                {icon}
            </div>

            <div className="contacto-info-item__content">
                <h3 className="contacto-info-item__title texto-enfasis-subtitulo">
                    {title}
                </h3>

                <div className="contacto-info-item__text texto-principal">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default ContactInfoItem;
