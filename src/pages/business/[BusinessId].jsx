"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BusinessPage from "@/components/BusinessPage";

// In a real application, this would come from a database
// Here it's just mocked for demonstration
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
    featuredProducts: [
      /* Same as in the previous example */
    ],
    promotionProducts: [
      /* Same as in the previous example */
    ],
    dailyOffers: [
      /* Same as in the previous example */
    ],
    newProducts: [
      /* Same as in the previous example */
    ],
    socialMedia: [
      /* Same as in the previous example */
    ],
  },
  peluqueria123: {
    id: "peluqueria123",
    name: "Peluquería Estilos",
    description:
      "Mejoramos tu presentación personal con los mejores cortes y tratamientos capilares",
    logo: "/images/businesses/peluqueria-logo.jpg",
    headerImage: "/images/businesses/peluqueria-header.jpg",
    categories: [
      { id: "cortes", name: "Cortes" },
      { id: "tintes", name: "Tintes" },
      { id: "tratamientos", name: "Tratamientos" },
      { id: "manicure", name: "Manicure" },
    ],
    featuredProducts: [
      /* Same as in the previous example */
    ],
    promotionProducts: [
      /* Same as in the previous example */
    ],
    dailyOffers: [
      /* Same as in the previous example */
    ],
    newProducts: [
      /* Same as in the previous example */
    ],
    socialMedia: [
      /* Same as in the previous example */
    ],
  },
  // Add more businesses as needed
};

export default function BusinessDetailPage() {
  const { businessId } = useParams();
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch data from an API
    // For this example, we're just getting mock data
    try {
      const data = businessesData[businessId];
      if (data) {
        setBusinessData(data);
      } else {
        setError("Negocio no encontrado");
      }
    } catch (err) {
      setError("Error al cargar los datos del negocio");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <div className="text-red-500 text-xl font-bold mb-4">{error}</div>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Volver
        </button>
      </div>
    );
  }

  return <BusinessPage businessData={businessData} />;
}
