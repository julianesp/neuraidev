// Configuración de metadata para cada categoría
export const categoryMetadata = {
  celulares: {
    title: "Celulares y Accesorios | Neurai.dev",
    description: "Descubre nuestra selección de celulares y accesorios móviles. Encuentra cables, cargadores, fundas y más para tu dispositivo móvil con descuentos especiales.",
    keywords: [
      "celulares",
      "accesorios móviles", 
      "cables USB-C",
      "cargadores",
      "fundas celular",
      "smartphones",
      "accesorios tecnológicos"
    ]
  },
  
  computadoras: {
    title: "Computadoras y Accesorios | Neurai.dev",
    description: "Encuentra computadoras, laptops, componentes y accesorios para PC. Ofertas especiales en equipos tecnológicos con descuentos de septiembre.",
    keywords: [
      "computadoras",
      "laptops",
      "PC",
      "componentes PC",
      "accesorios computadora",
      "equipos cómputo",
      "tecnología"
    ]
  },
  
  damas: {
    title: "Accesorios para Damas | Neurai.dev",
    description: "Productos de belleza y cuidado personal para damas. Encuentra accesorios, cosméticos y productos de cuidado con precios especiales.",
    keywords: [
      "accesorios damas",
      "productos belleza",
      "cuidado personal",
      "cosméticos",
      "belleza femenina",
      "accesorios mujer"
    ]
  },
  
  "libros-nuevos": {
    title: "Libros Nuevos | Neurai.dev",
    description: "Colección de libros nuevos de diferentes géneros. Literatura, ciencia, tecnología y más con precios especiales.",
    keywords: [
      "libros nuevos",
      "literatura",
      "libros ciencia",
      "libros tecnología",
      "educación",
      "lectura"
    ]
  },
  
  "libros-usados": {
    title: "Libros Usados | Neurai.dev",
    description: "Libros de segunda mano en excelente estado. Encuentra literatura clásica y contemporánea a precios accesibles.",
    keywords: [
      "libros usados",
      "libros segunda mano",
      "literatura usada",
      "libros baratos",
      "libros económicos"
    ]
  },
  
  bicicletas: {
    title: "Accesorios para Bicicletas | Neurai.dev",
    description: "Repuestos y accesorios para ciclistas. Encuentra todo lo que necesitas para mantener tu bicicleta en perfecto estado.",
    keywords: [
      "accesorios bicicletas",
      "repuestos bici",
      "ciclismo",
      "componentes bicicleta",
      "mantenimiento bici"
    ]
  },
  
  generales: {
    title: "Accesorios Generales | Neurai.dev",
    description: "Variedad de productos para diferentes necesidades. Encuentra accesorios diversos con ofertas especiales.",
    keywords: [
      "accesorios generales",
      "productos diversos",
      "accesorios varios",
      "productos tecnológicos",
      "ofertas especiales"
    ]
  },
  
  destacados: {
    title: "Productos Destacados | Neurai.dev",
    description: "Los mejores productos seleccionados especialmente. Encuentra nuestras recomendaciones con descuentos exclusivos.",
    keywords: [
      "productos destacados",
      "mejores productos",
      "recomendaciones",
      "productos populares",
      "ofertas exclusivas"
    ]
  },
  
  nuevos: {
    title: "Productos Nuevos | Neurai.dev",
    description: "Los productos más recientes de nuestra tienda. Descubre las últimas novedades con precios especiales.",
    keywords: [
      "productos nuevos",
      "novedades",
      "últimos productos",
      "recién llegados",
      "nuevos lanzamientos"
    ]
  }
};

// Función para generar metadata de una categoría
export const generateCategoryMetadata = (categorySlug) => {
  const category = categoryMetadata[categorySlug];
  
  if (!category) {
    return {
      title: "Accesorios | Neurai.dev",
      description: "Encuentra accesorios y productos tecnológicos con ofertas especiales.",
      keywords: ["accesorios", "productos", "tecnología", "ofertas"]
    };
  }

  const logoUrl = "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo-neuraidev.png?alt=media&token=logo-neuraidev";

  return {
    title: category.title,
    description: category.description,
    openGraph: {
      title: category.title,
      description: category.description,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: `${category.title} - Neurai.dev`,
        },
      ],
      type: "website",
      locale: "es_ES",
      siteName: "Neurai.dev"
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
      images: [logoUrl],
    },
    keywords: category.keywords,
  };
};