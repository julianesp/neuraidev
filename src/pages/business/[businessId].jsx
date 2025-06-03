// import BusinessPage from "@/components/BusinessPage/page";
import BusinessPage from "../../components/BusinessPage/page";

// En una aplicación real, esto vendría de una base de datos
// Aquí es solo simulado para demostración
const businessesData = {
  tienda123: {
    id: "tienda123",
    name: "Tienda Don Pedro",
    description:
      "La mejor tienda del barrio con productos frescos y precios económicos",
    logo: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fstore.png?alt=media&token=85a094bb-a288-4f8d-b08f-5fd226dc8bd0",
    headerImage:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fstore.png?alt=media&token=85a094bb-a288-4f8d-b08f-5fd226dc8bd0",
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
    logo: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fstore.png?alt=media&token=85a094bb-a288-4f8d-b08f-5fd226dc8bd0",
    headerImage:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fstore.png?alt=media&token=85a094bb-a288-4f8d-b08f-5fd226dc8bd0",
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
