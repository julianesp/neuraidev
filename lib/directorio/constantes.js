// Municipios del departamento del Putumayo (13).
export const MUNICIPIOS = [
  { slug: "mocoa", nombre: "Mocoa" },
  { slug: "colon", nombre: "Colón" },
  { slug: "orito", nombre: "Orito" },
  { slug: "puerto-asis", nombre: "Puerto Asís" },
  { slug: "puerto-caicedo", nombre: "Puerto Caicedo" },
  { slug: "puerto-guzman", nombre: "Puerto Guzmán" },
  { slug: "puerto-leguizamo", nombre: "Puerto Leguízamo" },
  { slug: "san-francisco", nombre: "San Francisco" },
  { slug: "san-miguel", nombre: "San Miguel" },
  { slug: "santiago", nombre: "Santiago" },
  { slug: "sibundoy", nombre: "Sibundoy" },
  { slug: "valle-del-guamuez", nombre: "Valle del Guamuez" },
  { slug: "villagarzon", nombre: "Villagarzón" },
];

export const CATEGORIAS = [
  { slug: "restaurantes", nombre: "Restaurantes y comidas rápidas" },
  { slug: "hoteles", nombre: "Hoteles y hospedaje" },
  { slug: "tiendas", nombre: "Tiendas y supermercados" },
  { slug: "droguerias", nombre: "Droguerías y farmacias" },
  { slug: "salud", nombre: "Clínicas, médicos y odontólogos" },
  { slug: "veterinarias", nombre: "Veterinarias y agropecuarios" },
  { slug: "ferreterias", nombre: "Ferreterías y construcción" },
  { slug: "talleres", nombre: "Talleres de carros y motos" },
  { slug: "tecnologia", nombre: "Tecnología y computadores" },
  { slug: "celulares", nombre: "Celulares y accesorios" },
  { slug: "ropa", nombre: "Ropa, calzado y moda" },
  { slug: "belleza", nombre: "Belleza y peluquerías" },
  { slug: "gimnasios", nombre: "Gimnasios y deportes" },
  { slug: "educacion", nombre: "Educación y capacitación" },
  { slug: "profesionales", nombre: "Abogados, contadores y profesionales" },
  { slug: "transporte", nombre: "Transporte y mensajería" },
  { slug: "turismo", nombre: "Turismo y sitios turísticos" },
  { slug: "eventos", nombre: "Eventos, fiestas y fotografía" },
  { slug: "artesanias", nombre: "Artesanías y regalos" },
  { slug: "agricultura", nombre: "Agricultura y productos del campo" },
  { slug: "panaderias", nombre: "Panaderías y pastelerías" },
  { slug: "licores", nombre: "Licorerías y bares" },
  { slug: "hogar", nombre: "Hogar, muebles y electrodomésticos" },
  { slug: "servicios", nombre: "Servicios técnicos y oficios" },
  { slug: "otros", nombre: "Otros" },
];

export const MAX_FOTOS = 6;
export const MAX_NEGOCIOS_POR_CUENTA = 5;
export const POR_PAGINA = 24;

const municipioPorSlug = Object.fromEntries(MUNICIPIOS.map((m) => [m.slug, m.nombre]));
const categoriaPorSlug = Object.fromEntries(CATEGORIAS.map((c) => [c.slug, c.nombre]));

export const nombreMunicipio = (slug) => municipioPorSlug[slug] || slug;
export const nombreCategoria = (slug) => categoriaPorSlug[slug] || slug;
export const municipioValido = (slug) => slug in municipioPorSlug;
export const categoriaValida = (slug) => slug in categoriaPorSlug;

// Centro aproximado de cada municipio (para abrir el mapa cerca del negocio).
export const CENTRO_MUNICIPIO = {
  mocoa: [1.1491, -76.6472],
  colon: [1.1853, -76.9733],
  orito: [0.6692, -76.8708],
  "puerto-asis": [0.5017, -76.4953],
  "puerto-caicedo": [0.6892, -76.6064],
  "puerto-guzman": [0.9692, -76.4086],
  "puerto-leguizamo": [-0.1936, -74.7822],
  "san-francisco": [1.1767, -76.8776],
  "san-miguel": [0.3414, -76.9206],
  santiago: [1.1469, -77.0036],
  sibundoy: [1.2028, -76.9169],
  "valle-del-guamuez": [0.4247, -76.9156],
  villagarzon: [0.9786, -76.6178],
};

// Negocios creados por neurai.dev como muestra: llevan la marca "Ejemplo" en la tarjeta y en la ficha.
export const NEGOCIOS_EJEMPLO = ["neurai-colon"];
export const esEjemplo = (slug) => NEGOCIOS_EJEMPLO.includes(slug);
