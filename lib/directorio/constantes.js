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
