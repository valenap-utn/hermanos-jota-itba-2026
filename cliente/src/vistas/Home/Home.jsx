import "./Home.styles.css";
import {
    ArrowRight,
    Leaf,
    Hand,
    History
} from "lucide-react";

function Home({
                  productos = [],
                  onNavigate,
                  onSelectProducto
              }) {
    const destacados = productos.filter(
        (producto) => producto.destacado
    );

    return (
        <>
            {/* ================= HERO ================= */}
            <section
                className="home-hero"
                aria-labelledby="hero-title"
            >
                <div className="container">
                    <div className="home-hero-layout">
                        <div className="home-hero-content">
                            <p className="home-eyebrow texto-titulo-cta">
                                Hermanos Jota
                            </p>

                            <h1
                                id="hero-title"
                                className="home-hero-title texto-titulo-elegante"
                            >
                                Redescubrir el arte de vivir
                            </h1>

                            <p className="home-hero-description texto-principal">
                                Diseño atemporal, materiales nobles y piezas hechas
                                para acompañarte durante años.
                            </p>

                            <button
                                type="button"
                                className="home-btn-primary texto-titulo-cta"
                                onClick={() => onNavigate("productos")}
                            >
                                Ver colección
                            </button>
                        </div>

                        <figure className="home-hero-figure">
                            <img
                                src="/assets/img/biblioteca-recoleta.png"
                                alt="Biblioteca Recoleta de Hermanos Jota"
                                className="home-hero-image"
                            />
                        </figure>
                    </div>
                </div>
            </section>

            {/* ================= DESTACADOS ================= */}
            <section
                className="home-section home-destacados"
                aria-labelledby="destacados-title"
            >
                <div className="container">
                    <div className="home-section-header">
                        <div>
                            <p className="home-eyebrow texto-titulo-cta">
                                Selección
                            </p>

                            <h2
                                id="destacados-title"
                                className="home-section-title texto-titulo-elegante"
                            >
                                Piezas destacadas
                            </h2>

                            <p className="home-section-description texto-principal">
                                Una selección donde oficio, materia y diseño
                                encuentran su equilibrio.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="home-link-catalogo texto-titulo-cta"
                            onClick={() => onNavigate("productos")}
                        >
                            Ver toda la colección

                            <ArrowRight size={16} aria-hidden="true" />
                        </button>
                    </div>

                    <div
                        className="row g-4"
                        aria-live="polite"
                    >
                        {destacados.length > 0 && (
                            destacados.map((producto) => (
                                <article
                                    key={producto.id}
                                    className="col-12 col-sm-6 col-lg-3"
                                >
                                    <button
                                        type="button"
                                        className="home-producto-card"
                                        aria-label={`Ver detalle de ${producto.nombre}`}
                                        onClick={() => onSelectProducto(producto)}
                                    >
                                        <figure className="home-producto-figure">
                                            <img
                                                className="home-producto-image"
                                                src={`/${producto.imagen}`}
                                                alt={producto.nombre}
                                                loading="lazy"
                                            />
                                        </figure>

                                        <div className="home-producto-content">
                                            <p className="home-producto-categoria texto-secundario-leyenda">
                                                {producto.categoria}
                                            </p>

                                            <h3 className="home-producto-nombre texto-enfasis-editorial">
                                                {producto.nombre}
                                            </h3>

                                            <span className="home-producto-link texto-titulo-cta">
                                        <span>
                                            Ver pieza
                                        </span>

                                        <ArrowRight size={16} aria-hidden="true" />
                                    </span>
                                        </div>
                                    </button>
                                </article>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ================= MARCA / VALORES ================= */}
            <section
                className="home-section home-valores"
                aria-labelledby="valores-title"
            >
                <div className="container">
                    <div className="row gy-5 gx-4 align-items-start">
                        <div className="col-12 col-lg-5">
                            <p className="home-eyebrow texto-titulo-cta">
                                Nuestra filosofía
                            </p>

                            <h2
                                id="valores-title"
                                className="home-section-title texto-titulo-elegante"
                            >
                                Diseñados para perdurar
                            </h2>

                            <p className="home-valores-intro texto-principal">
                                Cada pieza nace del encuentro entre la tradición
                                artesanal y una forma consciente de pensar el futuro.
                            </p>
                        </div>

                        <div className="col-12 col-lg-7">
                            <div className="row g-4">
                                <article className="col-12 col-md-4">
                                    <div className="home-valor">
                                        <Leaf
                                            className="home-valor-icon"
                                            size={22}
                                            aria-hidden="true"
                                        />


                                        <h3 className="home-valor-title texto-enfasis-subtitulo">
                                            Materiales sustentables
                                        </h3>

                                        <p className="texto-principal mb-0">
                                            Maderas certificadas y materiales elegidos
                                            por su origen, calidad y durabilidad.
                                        </p>
                                    </div>
                                </article>

                                <article className="col-12 col-md-4">
                                    <div className="home-valor">
                                        <Hand
                                            className="home-valor-icon"
                                            size={22}
                                            aria-hidden="true"
                                        />

                                        <h3 className="home-valor-title texto-enfasis-subtitulo">
                                            Oficio y detalle
                                        </h3>

                                        <p className="texto-principal mb-0">
                                            Diseño cuidado y manos expertas detrás
                                            de cada forma, unión y terminación.
                                        </p>
                                    </div>
                                </article>

                                <article className="col-12 col-md-4">
                                    <div className="home-valor">
                                        <History
                                            className="home-valor-icon"
                                            size={22}
                                            aria-hidden="true"
                                        />

                                        <h3 className="home-valor-title texto-enfasis-subtitulo">
                                            Longevidad
                                        </h3>

                                        <p className="texto-principal mb-0">
                                            Piezas pensadas para acompañar la vida
                                            cotidiana y ganar carácter con el tiempo.
                                        </p>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= CTA FINAL ================= */}
            <section
                className="home-cta"
                aria-labelledby="cta-title"
            >
                <div className="container">
                    <div className="home-cta-content">
                        <p className="home-eyebrow texto-titulo-cta">
                            Hermanos Jota
                        </p>

                        <h2
                            id="cta-title"
                            className="home-cta-title texto-titulo-elegante"
                        >
                            Piezas para historias que continúan
                        </h2>

                        <p className="home-cta-description texto-principal">
                            Descubrí nuestra colección de muebles diseñados
                            para habitar el presente y perdurar en el tiempo.
                        </p>

                        <button
                            type="button"
                            className="home-btn-secondary texto-titulo-cta"
                            onClick={() => onNavigate("productos")}
                        >
                            Explorar productos
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Home;
