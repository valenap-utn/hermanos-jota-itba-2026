import "./SustainabilityBenefit.styles.css";

function SustainabilityBenefit({
                                   icon: Icon,
                                   iconVariant,
                                   title,
                                   children,
                               }) {
    return (
        <article className="contacto-beneficio">
            <Icon
                className={`contacto-beneficio__icon contacto-beneficio__icon--${iconVariant}`}
                aria-hidden="true"
            />

            <h3 className="texto-titulo-elegante contacto-beneficio__title">
                {title}
            </h3>

            <p className="texto-secundario-leyenda contacto-beneficio__description">
                {children}
            </p>
        </article>
    );
}

export default SustainabilityBenefit;