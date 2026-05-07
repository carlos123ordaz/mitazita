// Shared data for the page
const MUG_MODELS = /*EDITMODE-NO*/[
  {
    id: "clasica",
    name: "Clásica",
    desc: "Cerámica blanca 11oz. La tela en blanco perfecta para tu foto.",
    price: 35,
    oldPrice: 45,
    tag: "MÁS VENDIDA",
    accent: "linear-gradient(180deg, #ffffff 0%, #f4f4f4 100%)",
    handle: "right",
    rim: "#e8e1da",
  },
  {
    id: "magica",
    name: "Mágica",
    desc: "Negra que revela la foto al servir algo caliente. Magia real.",
    price: 45,
    oldPrice: null,
    tag: "NUEVA",
    isNew: true,
    accent: "linear-gradient(180deg, #2a1f1c 0%, #4a3530 100%)",
    handle: "right",
    rim: "#1a1311",
    bodyTint: "#3a2a26",
    textColor: "#ffffff",
  },
  {
    id: "interior-rosa",
    name: "Interior Rosa",
    desc: "Blanca por fuera, interior rosa polvo. Detalle que enamora.",
    price: 42,
    oldPrice: 52,
    tag: "FAVORITA",
    accent: "linear-gradient(180deg, #ffffff 0%, #f4f4f4 100%)",
    handle: "right",
    rim: "#e0a8b6",
    interiorTint: "#e0a8b6",
  },
  {
    id: "dorada",
    name: "Borde Dorado",
    desc: "Borde y asa con detalle dorado. Para una mamá elegante.",
    price: 55,
    oldPrice: null,
    tag: "PREMIUM",
    accent: "linear-gradient(180deg, #fdf9f5 0%, #f0e8de 100%)",
    handle: "right",
    rim: "#c9a472",
    handleColor: "#c9a472",
  },
  {
    id: "jumbo",
    name: "Jumbo 15oz",
    desc: "Tamaño grande para los cafés largos de mamá. Cabe todo.",
    price: 48,
    oldPrice: 58,
    tag: null,
    accent: "linear-gradient(180deg, #ffffff 0%, #f4f4f4 100%)",
    handle: "right",
    rim: "#e8e1da",
    scale: 1.15,
  },
  {
    id: "duo",
    name: "Dúo Mamá & Yo",
    desc: "Dos tazas que se complementan. Foto de ustedes en cada una.",
    price: 65,
    oldPrice: 80,
    tag: "PACK",
    accent: "linear-gradient(180deg, #ffffff 0%, #f4f4f4 100%)",
    handle: "right",
    rim: "#e8e1da",
    isDuo: true,
  },
];

const REVIEWS = [
  {
    name: "Carla M.",
    initial: "C",
    loc: "Surco · Pedido verificado",
    quote: "Mamá lloró cuando la abrió. La presentación con caja y tarjeta hizo toda la diferencia. Cien por ciento recomendado.",
    stars: 5,
  },
  {
    name: "Diego R.",
    initial: "D",
    loc: "San Borja · Pedido verificado",
    quote: "Pedí la mágica con una foto de mamá joven. Cuando le serví café y vio la imagen aparecer, no lo podía creer. Atención top.",
    stars: 5,
  },
  {
    name: "Andrea P.",
    initial: "A",
    loc: "Miraflores · Pedido verificado",
    quote: "Me mandaron la prueba antes de imprimir, ajustamos la dedicatoria y llegó al día siguiente. Mejor servicio imposible.",
    stars: 5,
  },
];

const EXTRAS = [
  { id: "caja", label: "Caja de regalo", desc: "Caja kraft con lazo de seda", price: 8 },
  { id: "tarjeta", label: "Tarjeta dedicatoria", desc: "Manuscrita a mano por nosotras", price: 5 },
  { id: "magica", label: "Convertir en taza mágica", desc: "Revela la foto con calor", price: 10 },
  { id: "delivery", label: "Delivery Lima 24h", desc: "Express puerta a puerta", price: 12 },
];

window.MUG_MODELS = MUG_MODELS;
window.REVIEWS = REVIEWS;
window.EXTRAS = EXTRAS;
