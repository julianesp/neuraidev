// // /businesses/utils/businessManager.js
// // Utilidades para gestionar negocios

// export const businessTypes = {
//   PELUQUERIA: 'Peluquería',
//   TECNOLOGIA: 'Tecnología',
//   MODA: 'Ropa y Moda',
//   ACCESORIOS: 'Accesorios Móviles',
//   SUPERMERCADO: 'Supermercado',
//   RESTAURANTE: 'Restaurante',
//   FARMACIA: 'Farmacia',
//   FERRETERIA: 'Ferretería',
//   PANADERIA: 'Panadería',
//   GIMNASIO: 'Gimnasio'
// };

// export const businessIcons = {
//   [businessTypes.PELUQUERIA]: '💇‍♀️',
//   [businessTypes.TECNOLOGIA]: '📱',
//   [businessTypes.MODA]: '👗',
//   [businessTypes.ACCESORIOS]: '🔌',
//   [businessTypes.SUPERMERCADO]: '🛒',
//   [businessTypes.RESTAURANTE]: '🍽️',
//   [businessTypes.FARMACIA]: '💊',
//   [businessTypes.FERRETERIA]: '🔧',
//   [businessTypes.PANADERIA]: '🥖',
//   [businessTypes.GIMNASIO]: '💪'
// };

// export const businessColors = {
//   [businessTypes.PELUQUERIA]: 'from-pink-500 to-purple-600',
//   [businessTypes.TECNOLOGIA]: 'from-blue-500 to-cyan-600',
//   [businessTypes.MODA]: 'from-rose-500 to-pink-600',
//   [businessTypes.ACCESORIOS]: 'from-green-500 to-emerald-600',
//   [businessTypes.SUPERMERCADO]: 'from-orange-500 to-red-600',
//   [businessTypes.RESTAURANTE]: 'from-yellow-500 to-orange-600',
//   [businessTypes.FARMACIA]: 'from-green-600 to-teal-600',
//   [businessTypes.FERRETERIA]: 'from-gray-600 to-slate-700',
//   [businessTypes.PANADERIA]: 'from-amber-500 to-yellow-600',
//   [businessTypes.GIMNASIO]: 'from-red-500 to-orange-600'
// };

// // Plantilla para crear nuevos negocios
// export const createBusinessTemplate = (businessInfo) => {
//   const {
//     id,
//     name,
//     type,
//     description,
//     phone,
//     email,
//     address,
//     hours = {}
//   } = businessInfo;

//   return {
//     id,
//     name,
//     type,
//     description,
//     logo: `/images/logos/${id}-logo.png`,
//     headerImage: `/images/headers/${id}-header.jpg`,
//     contact: {
//       phone,
//       email,
//       address,
//       hours: {
//         lunes_viernes: hours.weekdays || "9:00 AM - 6:00 PM",
//         sabado: hours.saturday || "9:00 AM - 4:00 PM",
//         domingo: hours.sunday || "Cerrado"
//       }
//     },
//     categories: [],
//     featuredProducts: [],
//     promotionProducts: [],
//     dailyOffers: [],
//     newProducts: [],
//     socialMedia: []
//   };
// };

// // Validador de estructura de negocio
// export const validateBusinessData = (businessData) => {
//   const requiredFields = ['id', 'name', 'type', 'description'];
//   const missingFields = requiredFields.filter(field => !businessData[field]);

//   if (missingFields.length > 0) {
//     throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
//   }

//   return true;
// };

// // /businesses/data/accesorios-cell.json - Ejemplo adicional
// {
//   "id": "accesorios-cell",
//   "name": "CellMania",
//   "type": "Accesorios Móviles",
//   "description": "Especialistas en accesorios para celulares. Fundas, protectores, cargadores y reparaciones express para todos los modelos.",
//   "logo": "/images/logos/cellmania-logo.png",
//   "headerImage": "/images/headers/cellmania-header.jpg",
//   "contact": {
//     "phone": "+57 318 777 8888",
//     "email": "contacto@cellmania.com",
//     "address": "Centro Comercial Plaza, Local 15, Sibundoy",
//     "hours": {
//       "lunes_viernes": "9:00 AM - 7:00 PM",
//       "sabado": "9:00 AM - 8:00 PM",
//       "domingo": "11:00 AM - 5:00 PM"
//     }
//   },
//   "categories": [
//     { "id": 1, "name": "Fundas y Protectores" },
//     { "id": 2, "name": "Cargadores" },
//     { "id": 3, "name": "Audífonos" },
//     { "id": 4, "name": "Reparaciones" },
//     { "id": 5, "name": "Accesorios Gaming" }
//   ],
//   "featuredProducts": [
//     {
//       "id": 1,
//       "name": "Funda Premium iPhone",
//       "price": "$35.000",
//       "image": "/images/products/funda-iphone.jpg",
//       "description": "Protección total con diseño elegante"
//     },
//     {
//       "id": 2,
//       "name": "Vidrio Templado",
//       "price": "$15.000",
//       "image": "/images/products/vidrio-templado.jpg",
//       "description": "Protección 9H para tu pantalla"
//     },
//     {
//       "id": 3,
//       "name": "Cargador Rápido 65W",
//       "price": "$55.000",
//       "image": "/images/products/cargador-rapido.jpg",
//       "description": "Carga ultra rápida para cualquier dispositivo"
//     },
//     {
//       "id": 4,
//       "name": "AirPods Réplica Premium",
//       "price": "$85.000",
//       "image": "/images/products/airpods-replica.jpg",
//       "description": "Calidad premium a precio accesible"
//     }
//   ],
//   "promotionProducts": [
//     {
//       "id": 1,
//       "name": "Kit Protección Completa",
//       "price": "$40.000",
//       "originalPrice": "$55.000",
//       "image": "/images/promos/kit-proteccion.jpg",
//       "description": "Funda + Vidrio + Pop Socket"
//     }
//   ],
//   "dailyOffers": [
//     {
//       "id": 1,
//       "name": "Cable USB-C",
//       "price": "$8.000",
//       "image": "/images/offers/cable-usbc.jpg",
//       "description": "Oferta flash - Solo hoy"
//     }
//   ],
//   "newProducts": [
//     {
//       "id": 1,
//       "name": "Soporte Magnético Auto",
//       "price": "$28.000",
//       "image": "/images/new/soporte-magnetico.jpg",
//       "description": "Recién llegado - Soporte para carro"
//     }
//   ],
//   "socialMedia": [
//     { "name": "Instagram", "url": "https://instagram.com/cellmania" },
//     { "name": "TikTok", "url": "https://tiktok.com/@cellmania" },
//     { "name": "WhatsApp", "url": "https://wa.me/573187778888" }
//   ]
// }

// /*
// === GUÍA DE IMPLEMENTACIÓN ===

// 1. ESTRUCTURA DE CARPETAS:
// /businesses/
//   ├── page.js (lista de todos los negocios)
//   ├── [businessId]/page.js (página dinámica)
//   ├── components/
//   │   ├── BusinessPage.js (el componente principal que ya tienes)
//   │   └── BusinessCard.js (opcional - para la lista)
//   ├── data/
//   │   ├── peluqueria-bella.json
//   │   ├── tienda-tech.json
//   │   ├── boutique-moda.json
//   │   ├── accesorios-cell.json
//   │   ├── supermercado-local.json
//   │   └── restaurante-sabor.json
//   └── utils/
//       └── businessManager.js

// 2. CÓMO AGREGAR UN NUEVO NEGOCIO:

// Paso 1: Crear el archivo JSON
// - Copiar cualquier ejemplo de la carpeta /data/
// - Cambiar el id, name, type, description, contact
// - Actualizar productos, categorías y servicios
// - Guardar como /data/nuevo-negocio.json

// Paso 2: Agregar al businessDataFiles
// En /[businessId]/page.js, agregar:
// 'nuevo-negocio': () => import('../../data/nuevo-negocio.json'),

// Paso 3: Agregar a la lista principal
// En /page.js, agregar objeto al businessList:
// {
//   id: "nuevo-negocio",
//   name: "Nombre del Negocio",
//   type: "Tipo de Negocio",
//   description: "Descripción breve",
//   image: "/images/nuevo-negocio.jpg",
//   color: "from-color-500 to-color-600"
// }

// 3. PERSONALIZACIÓN POR TIPO DE NEGOCIO:

// PELUQUERÍA:
// - Servicios en lugar de productos
// - Horarios de citas
// - Galería de trabajos realizados

// RESTAURANTE:
// - Menú por categorías (entradas, platos fuertes, postres)
// - Horarios de atención especiales
// - Sistema de reservas

// SUPERMERCADO:
// - Productos por departamentos
// - Ofertas semanales
// - Servicio a domicilio

// TECNOLOGÍA:
// - Especificaciones técnicas
// - Garantías
// - Servicios de reparación

// 4. RUTAS GENERADAS:
// - /businesses (lista principal)
// - /businesses/peluqueria-bella
// - /businesses/tienda-tech
// - /businesses/boutique-moda
// - etc...

// 5. SEO Y OPTIMIZACIÓN:
// - Cada negocio tiene su propia URL
// - Metadata específica por negocio
// - Images optimizadas por negocio
// - Structured data para cada tipo

// 6. FUNCIONALIDADES ADICIONALES SUGERIDAS:
// - Sistema de reseñas
// - Integración con WhatsApp Business
// - Catálogo descargable
// - Sistema de citas online
// - Carrito de compras
// - Geolocalización
// - Horarios en tiempo real
// */

// /businesses/utils/businessManager.js
// Utilidades para gestionar negocios

export const businessTypes = {
  PELUQUERIA: "Peluquería",
  TECNOLOGIA: "Tecnología",
  MODA: "Ropa y Moda",
  ACCESORIOS: "Accesorios Móviles",
  SUPERMERCADO: "Supermercado",
  RESTAURANTE: "Restaurante",
  FARMACIA: "Farmacia",
  FERRETERIA: "Ferretería",
  PANADERIA: "Panadería",
  GIMNASIO: "Gimnasio",
};

export const businessIcons = {
  [businessTypes.PELUQUERIA]: "💇‍♀️",
  [businessTypes.TECNOLOGIA]: "📱",
  [businessTypes.MODA]: "👗",
  [businessTypes.ACCESORIOS]: "📱", // Cambiado de 🔌 a 📱 para ser más específico
  [businessTypes.SUPERMERCADO]: "🛒",
  [businessTypes.RESTAURANTE]: "🍽️",
  [businessTypes.FARMACIA]: "💊",
  [businessTypes.FERRETERIA]: "🔧",
  [businessTypes.PANADERIA]: "🥖",
  [businessTypes.GIMNASIO]: "💪",
};

export const businessColors = {
  [businessTypes.PELUQUERIA]: "from-pink-500 to-purple-600",
  [businessTypes.TECNOLOGIA]: "from-blue-500 to-cyan-600",
  [businessTypes.MODA]: "from-rose-500 to-pink-600",
  [businessTypes.ACCESORIOS]: "from-green-500 to-emerald-600",
  [businessTypes.SUPERMERCADO]: "from-orange-500 to-red-600",
  [businessTypes.RESTAURANTE]: "from-yellow-500 to-orange-600",
  [businessTypes.FARMACIA]: "from-green-600 to-teal-600",
  [businessTypes.FERRETERIA]: "from-gray-600 to-slate-700",
  [businessTypes.PANADERIA]: "from-amber-500 to-yellow-600",
  [businessTypes.GIMNASIO]: "from-red-500 to-orange-600",
};

// Plantilla para crear nuevos negocios
export const createBusinessTemplate = (businessInfo) => {
  const {
    id,
    name,
    type,
    description,
    phone,
    email,
    address,
    hours = {},
    socialMedia = [],
  } = businessInfo;

  // Validación básica
  if (!id || !name || !type) {
    throw new Error("Los campos id, name y type son obligatorios");
  }

  return {
    id,
    name,
    type,
    description: description || "",
    logo: `/images/logos/${id}-logo.png`,
    headerImage: `/images/headers/${id}-header.jpg`,
    contact: {
      phone: phone || "",
      email: email || "",
      address: address || "",
      hours: {
        lunes_viernes: hours.weekdays || "9:00 AM - 6:00 PM",
        sabado: hours.saturday || "9:00 AM - 4:00 PM",
        domingo: hours.sunday || "Cerrado",
      },
    },
    categories: [],
    featuredProducts: [],
    promotionProducts: [],
    dailyOffers: [],
    newProducts: [],
    socialMedia: socialMedia,
  };
};

// Validador de estructura de negocio
export const validateBusinessData = (businessData) => {
  const requiredFields = ["id", "name", "type", "description"];
  const missingFields = requiredFields.filter((field) => !businessData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missingFields.join(", ")}`);
  }

  // Validaciones adicionales
  if (businessData.contact) {
    const { phone, email } = businessData.contact;

    // Validar formato de teléfono colombiano básico
    if (phone && !/^\+57\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/.test(phone)) {
      console.warn(
        `Formato de teléfono incorrecto para ${businessData.name}: ${phone}`,
      );
    }

    // Validar formato de email básico
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(
        `Formato de email incorrecto para ${businessData.name}: ${email}`,
      );
    }
  }

  return true;
};

// Función para obtener información del tipo de negocio
export const getBusinessTypeInfo = (type) => {
  return {
    type,
    icon: businessIcons[type] || "🏪",
    color: businessColors[type] || "from-gray-500 to-gray-600",
  };
};

// Función para formatear horarios
export const formatBusinessHours = (hours) => {
  if (!hours) return "Horarios no especificados";

  const formatHour = (hour) => hour || "No especificado";

  return {
    "Lunes a Viernes": formatHour(hours.lunes_viernes),
    Sábado: formatHour(hours.sabado),
    Domingo: formatHour(hours.domingo),
  };
};

// Función para generar URL de WhatsApp
export const getWhatsAppURL = (phone, message = "") => {
  if (!phone) return null;

  // Limpiar el número de teléfono
  const cleanPhone = phone.replace(/\D/g, "");
  const defaultMessage = encodeURIComponent(
    message ||
      "¡Hola! Me interesa conocer más sobre sus productos y servicios.",
  );

  return `https://wa.me/${cleanPhone}?text=${defaultMessage}`;
};

// Función para buscar negocios
export const searchBusinesses = (businesses, searchTerm) => {
  if (!searchTerm) return businesses;

  const term = searchTerm.toLowerCase();
  return businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(term) ||
      business.type.toLowerCase().includes(term) ||
      business.description.toLowerCase().includes(term),
  );
};

// Función para filtrar por tipo
export const filterByType = (businesses, type) => {
  if (!type) return businesses;
  return businesses.filter((business) => business.type === type);
};
