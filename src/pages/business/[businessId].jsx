// // pages/business/[businessId].js
// import BusinessPage from "@/components/BusinessPage";

// // En una aplicación real, esto vendría de una base de datos
// // Aquí es solo simulado para demostración
// const businessesData = {
//   tienda123: {
//     id: "tienda123",
//     name: "Tienda Don Pedro",
//     description:
//       "La mejor tienda del barrio con productos frescos y precios económicos",
//     logo: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4",
//     headerImage:
//       "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
//     categories: [
//       { id: "aseo", name: "Aseo" },
//       { id: "grano", name: "Grano" },
//       { id: "otros", name: "Otros" },
//       { id: "otros2", name: "Otros 2" },
//     ],
//     featuredProducts: [],
//     promotionProducts: [],
//     dailyOffers: [],
//     newProducts: [],
//     socialMedia: [],
//   },
//   peluqueria123: {
//     id: "peluqueria123",
//     name: "Peluquería Estilos",
//     description:
//       "Mejoramos tu presentación personal con los mejores cortes y tratamientos capilares",
//     logo: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesories%20several/lamparaByke/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaWVzIHNldmVyYWwvbGFtcGFyYUJ5a2UvMS5qcGciLCJpYXQiOjE3NDE0ODg4OTMsImV4cCI6MTc3MzAyNDg5M30.TQHU4Oh2nBUHN1FDeA2zK6s_Mm_HWd2vgIIFJbQW76Q",
//     headerImage:
//       "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesories%20several/lamparaByke/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaWVzIHNldmVyYWwvbGFtcGFyYUJ5a2UvMS5qcGciLCJpYXQiOjE3NDE0ODg4OTMsImV4cCI6MTc3MzAyNDg5M30.TQHU4Oh2nBUHN1FDeA2zK6s_Mm_HWd2vgIIFJbQW76Q",
//     categories: [
//       { id: "cortes", name: "Cortes" },
//       { id: "tintes", name: "Tintes" },
//       { id: "tratamientos", name: "Tratamientos" },
//       { id: "manicure", name: "Manicure" },
//     ],
//     featuredProducts: [],
//     promotionProducts: [],
//     dailyOffers: [],
//     newProducts: [],
//     socialMedia: [],
//   },
//   // Añadir más negocios según sea necesario
// };

// // Esta función se ejecuta durante el build para generar las rutas estáticas
// // export async function getStaticPaths() {
// //   // Genera las rutas para cada negocio en businessesData
// //   const paths = Object.keys(businessesData).map((id) => ({
// //     params: { businessId: id }, // Asegúrate de que coincida con el nombre del archivo [businessId].js
// //   }));

// //   return {
// //     paths,
// //     fallback: false, // 404 para cualquier ruta no definida en paths
// //   };
// // }

// // Esta función reemplaza a getStaticPaths
// export async function generateStaticParams() {
//   return Object.keys(businessesData).map((id) => ({
//     businessId: id,
//   }));
// }

// // Esta función se ejecuta durante el build para cada ruta generada
// export async function getStaticProps({ params }) {
//   const { businessId } = params; // Asegúrate de que coincida con el nombre del archivo [businessId].js

//   // Obtener los datos del negocio
//   const businessData = businessesData[businessId] || null;

//   // Si no se encuentra el negocio, puedes redirigir a otra página
//   if (!businessData) {
//     return {
//       notFound: true, // Esto mostrará la página 404
//     };
//   }

//   // Asegúrate de que todos los campos requeridos estén presentes
//   const safeBusinessData = {
//     ...businessData,
//     featuredProducts: businessData.featuredProducts || [],
//     promotionProducts: businessData.promotionProducts || [],
//     dailyOffers: businessData.dailyOffers || [],
//     newProducts: businessData.newProducts || [],
//     socialMedia: businessData.socialMedia || [],
//   };

//   return {
//     props: {
//       businessData: safeBusinessData,
//     },
//   };
// }

// // export default function BusinessDetailPage({ businessData }) {
// //   // Ahora los datos del negocio vienen directamente de las props, no de useParams
// //   return <BusinessPage businessData={businessData} />;
// // }

// // Esta función es el componente principal de la página
// export default function BusinessDetailPage({ params }) {
//   const { businessId } = params;
//   const businessData = businessesData[businessId] || null;

//   // Si no se encuentra el negocio, puedes manejar esto de otra manera
//   if (!businessData) {
//     return <div>Negocio no encontrado</div>;
//   }

//   // Asegúrate de que todos los campos requeridos estén presentes
//   const safeBusinessData = {
//     ...businessData,
//     featuredProducts: businessData.featuredProducts || [],
//     promotionProducts: businessData.promotionProducts || [],
//     dailyOffers: businessData.dailyOffers || [],
//     newProducts: businessData.newProducts || [],
//     socialMedia: businessData.socialMedia || [],
//   };

//   return <BusinessPage businessData={safeBusinessData} />;
// }

import BusinessPage from "@/components/BusinessPage";

// En una aplicación real, esto vendría de una base de datos
// Aquí es solo simulado para demostración
const businessesData = {
  tienda123: {
    id: "tienda123",
    name: "Tienda Don Pedro",
    description:
      "La mejor tienda del barrio con productos frescos y precios económicos",
    logo: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4",
    headerImage:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
    categories: [
      { id: "aseo", name: "Aseo" },
      { id: "grano", name: "Grano" },
      { id: "otros", name: "Otros" },
      { id: "otros2", name: "Otros 2" },
    ],
    featuredProducts: [],
    promotionProducts: [],
    dailyOffers: [],
    newProducts: [],
    socialMedia: [],
  },
  peluqueria123: {
    id: "peluqueria123",
    name: "Peluquería Estilos",
    description:
      "Mejoramos tu presentación personal con los mejores cortes y tratamientos capilares",
    logo: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesories%20several/lamparaByke/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaWVzIHNldmVyYWwvbGFtcGFyYUJ5a2UvMS5qcGciLCJpYXQiOjE3NDE0ODg4OTMsImV4cCI6MTc3MzAyNDg5M30.TQHU4Oh2nBUHN1FDeA2zK6s_Mm_HWd2vgIIFJbQW76Q",
    headerImage:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesories%20several/lamparaByke/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaWVzIHNldmVyYWwvbGFtcGFyYUJ5a2UvMS5qcGciLCJpYXQiOjE3NDE0ODg4OTMsImV4cCI6MTc3MzAyNDg5M30.TQHU4Oh2nBUHN1FDeA2zK6s_Mm_HWd2vgIIFJbQW76Q",
    categories: [
      { id: "cortes", name: "Cortes" },
      { id: "tintes", name: "Tintes" },
      { id: "tratamientos", name: "Tratamientos" },
      { id: "manicure", name: "Manicure" },
    ],
    featuredProducts: [],
    promotionProducts: [],
    dailyOffers: [],
    newProducts: [],
    socialMedia: [],
  },
  // Añadir más negocios según sea necesario
};

// Esta función se ejecuta durante el build para generar las rutas estáticas
export function getStaticPaths() {
  // Genera las rutas para cada negocio en businessesData
  const paths = Object.keys(businessesData).map((id) => ({
    params: { businessId: id }, // Asegúrate de que coincida con el nombre del archivo [businessId].js
  }));

  return {
    paths,
    fallback: false, // 404 para cualquier ruta no definida en paths
  };
}

// Esta función se ejecuta durante el build para cada ruta generada
export function getStaticProps({ params }) {
  const { businessId } = params; // Asegúrate de que coincida con el nombre del archivo [businessId].js

  // Obtener los datos del negocio
  const businessData = businessesData[businessId] || null;

  // Si no se encuentra el negocio, puedes redirigir a otra página
  if (!businessData) {
    return {
      notFound: true, // Esto mostrará la página 404
    };
  }

  // Asegúrate de que todos los campos requeridos estén presentes
  const safeBusinessData = {
    ...businessData,
    featuredProducts: businessData.featuredProducts || [],
    promotionProducts: businessData.promotionProducts || [],
    dailyOffers: businessData.dailyOffers || [],
    newProducts: businessData.newProducts || [],
    socialMedia: businessData.socialMedia || [],
  };

  return {
    props: {
      businessData: safeBusinessData,
    },
  };
}

export default function BusinessDetailPage({ businessData }) {
  // Ahora los datos del negocio vienen directamente de las props, no de useParams
  return <BusinessPage businessData={businessData} />;
}
