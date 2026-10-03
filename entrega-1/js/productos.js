// TODO: definir precios para cada producto

// Nota: Las rutas de las imgs las resuelve cada vista desde su ubicación

// Fuente de datos del catálogo
export const productos = [
    {
        id: 1,
        nombre: "Aparador Uspallata",
        precio: 1800000,
        imagen: "../assets/img/aparador-uspallata.png",
        descripcion:
            "Aparador de seis puertas fabricado en nogal sostenible con tiradores metálicos en acabado latón. Su silueta minimalista realza el veteado natural de la madera, creando una pieza que combina funcionalidad y elegancia atemporal para espacios contemporáneos.",
        medidas: "180 × 45 × 75 cm",
        materiales: "Nogal macizo FSC®, herrajes de latón",
        categoria: "living",
        destacado: true,
        especificaciones: {
            Acabado: "Aceite natural ecológico",
            Peso: "68 kg",
            Capacidad: "6 compartimentos interiores"
        }
    },
    {
        id: 2,
        nombre: "Biblioteca Recoleta",
        precio: 1200000,
        imagen: "../assets/img/biblioteca-recoleta.png",
        descripcion:
            "Sistema modular de estantes abierto que combina estructura de acero Sage Green y repisas en roble claro. Perfecta para colecciones y objetos de diseño, su diseño versátil se adapta a cualquier espacio contemporáneo con elegancia funcional.",
        medidas: "100 × 35 × 200 cm",
        materiales: "Estructura de acero, estantes de roble",
        categoria: "living",
        destacado: false,
        especificaciones: {
            Acabado: "Laca mate ecológica",
            Capacidad: "45 kg por estante",
            Modulares: "5 estantes ajustables"
        }
    },
    {
        id: 3,
        nombre: "Butaca Mendoza",
        precio: 750000,
        imagen: "../assets/img/butaca-mendoza.png",
        descripcion:
            "Butaca tapizada en bouclé Dusty Rose con base de madera de guatambú. El respaldo curvo abraza el cuerpo y ofrece máximo confort, mientras que su diseño orgánico aporta calidez y sofisticación a cualquier ambiente contemporáneo.",
        medidas: "80 × 75 × 85 cm",
        materiales: "Guatambú macizo, tela bouclé",
        categoria: "living",
        destacado: true,
        especificaciones: {
            Acabado: "Cera vegetal, tapizado premium",
            Tapizado: "Repelente al agua y manchas",
            Confort: "Espuma alta densidad"
        }
    },
    {
        id: 4,
        nombre: "Sillón Copacabana",
        precio: 890000,
        imagen: "../assets/img/sillon-copacabana.png",
        descripcion:
            "Sillón lounge en cuero cognac con base giratoria en acero Burnt Sienna. Inspirado en la estética brasilera moderna de los 60, combina comodidad excepcional con un diseño icónico que trasciende tendencias y épocas.",
        medidas: "90 × 85 × 95 cm",
        materiales: "Cuero curtido vegetal, acero pintado",
        categoria: "living",
        destacado: false,
        especificaciones: {
            Acabado: "Cuero anilina premium",
            Rotacion: "360° silenciosa y suave",
            Garantia: "10 años en estructura"
        }
    },
    {
        id: 5,
        nombre: "Mesa de Centro Araucaria",
        precio: 940000,
        imagen: "../assets/img/mesa-de-centro-araucaria.png",
        descripcion:
            "Mesa de centro con sobre circular de mármol Patagonia y base de tres patas en madera de nogal. Su diseño minimalista se convierte en el punto focal perfecto para cualquier sala de estar contemporánea, combinando la frialdad del mármol con la calidez de la madera.",
        medidas: "90 × 90 × 45 cm",
        materiales: "Sobre de mármol Patagonia, patas de nogal",
        categoria: "living",
        destacado: false,
        especificaciones: {
            Acabado: "Mármol pulido, aceite natural en madera",
            Peso: "42 kg",
            "Carga máxima": "25 kg distribuidos"
        }
    },
    {
        id: 6,
        nombre: "Mesa de Noche Aconcagua",
        precio: 650000,
        imagen: "../assets/img/mesa-de-noche-aconcagua.png",
        descripcion:
            "Mesa de noche con cajón oculto y repisa inferior en roble certificado FSC®. Su diseño limpio y funcional permite convivir con diferentes estilos de dormitorio, ofreciendo almacenamiento discreto y elegante para objetos personales.",
        medidas: "45 × 35 × 60 cm",
        materiales: "Roble macizo FSC®, herrajes soft-close",
        categoria: "dormitorio",
        destacado: false,
        especificaciones: {
            Acabado: "Barniz mate de poliuretano",
            Almacenamiento: "1 cajón + repisa inferior",
            Caracteristicas: "Cajón con cierre suave"
        }
    },
    {
        id: 7,
        nombre: "Sofá Patagonia",
        precio: 2100000,
        imagen: "../assets/img/sof-patagonia.png",
        descripcion:
            "Sofá de tres cuerpos tapizado en lino Warm Alabaster con patas cónicas de madera. Los cojines combinan espuma de alta resiliencia con plumón reciclado, ofreciendo comodidad duradera y sostenible para el hogar moderno.",
        medidas: "220 × 90 × 80 cm",
        materiales: "Madera de eucalipto certificada FSC®, lino 100% natural premium",
        categoria: "living",
        destacado: true,
        especificaciones: {
            Estructura: "Madera de eucalipto certificada FSC®",
            Tapizado: "Lino 100% natural premium",
            Relleno: "Espuma HR + plumón reciclado",
            Sostenibilidad: "Materiales 100% reciclables"
        }
    },
    {
        id: 8,
        nombre: "Mesa Comedor Pampa",
        precio: 2000000,
        imagen: "../assets/img/mesa-comedor-pampa.png",
        descripcion:
            "Mesa extensible de roble macizo con tablero biselado y sistema de apertura suave. Su diseño robusto y elegante se adapta perfectamente a reuniones íntimas o grandes celebraciones familiares, extendiéndose de 6 a 10 comensales.",
        medidas: "160-240 × 90 × 75 cm",
        materiales: "Roble macizo FSC®, mecanismo alemán",
        categoria: "comedor",
        destacado: true,
        especificaciones: {
            Acabado: "Aceite-cera natural",
            Capacidad: "6-10 comensales",
            Extension: "Sistema de mariposa central"
        }
    },
    {
        id: 9,
        nombre: "Sillas Córdoba",
        precio: 1200000,
        imagen: "../assets/img/silla-cordoba.png",
        descripcion:
            "Set de cuatro sillas apilables en contrachapado moldeado de nogal y estructura tubular pintada en Sage Green. Su diseño ergonómico y materiales de calidad garantizan comodidad y durabilidad en el uso diario, perfectas para comedores contemporáneos.",
        medidas: "45 × 52 × 80 cm (cada una)",
        materiales: "Contrachapado nogal, tubo de acero",
        categoria: "comedor",
        destacado: false,
        especificaciones: {
            Acabado: "Laca mate, pintura epoxi",
            Apilables: "Hasta 6 sillas",
            Incluye: "Set de 4 sillas"
        }
    },
    {
        id: 10,
        nombre: "Escritorio Costa",
        precio: 1500000,
        imagen: "../assets/img/escritorio-costa.png",
        descripcion:
            "Escritorio compacto con cajón organizado y tapa pasacables integrada en bambú laminado. Ideal para espacios de trabajo en casa, combina funcionalidad moderna con estética minimalista y sostenible, perfecto para el trabajo remoto.",
        medidas: "120 × 60 × 75 cm",
        materiales: "Bambú laminado, herrajes ocultos",
        categoria: "oficina",
        destacado: false,
        especificaciones: {
            Acabado: "Laca mate resistente",
            Almacenamiento: "1 cajón con organizador",
            Cables: "Pasacables integrado"
        }
    },
    {
        id: 11,
        nombre: "Silla de Trabajo Belgrano",
        precio: 850000,
        imagen: "../assets/img/silla-de-trabajo-belgrano.png",
        descripcion:
            "Silla ergonómica regulable en altura con respaldo de malla transpirable y asiento tapizado en tejido reciclado. Diseñada para largas jornadas de trabajo con máximo confort y apoyo lumbar, ideal para oficinas en casa y espacios de coworking.",
        medidas: "60 × 60 × 90-100 cm",
        materiales: "Malla técnica, tejido reciclado",
        categoria: "oficina",
        destacado: false,
        especificaciones: {
            Acabado: "Base cromada, tapizado premium",
            Regulacion: "Altura + inclinación respaldo",
            Certificacion: "Ergonomía europea EN 1335"
        }
    }
];

export function obtenerProductos() {
    return new Promise((resolve, reject) => {
        const delay = Math.floor(Math.random() * 401) + 400; // 400-800 ms

        setTimeout(() => {
            resolve(productos);
        }, delay);
    });
}
