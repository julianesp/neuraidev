"use client";

import BusinessPage from "@/components/BusinessPage";

export default function PeluqueriaPage() {
  // Sample data for a salon/peluquería
  const peluqueriaData = {
    id: "peluqueria123",
    name: "Peluquería Estilos",
    description:
      "Mejoramos tu presentación personal con los mejores cortes y tratamientos capilares",
    logo: "/images/businesses/peluqueria-logo.jpg",
    headerImage: "/images/businesses/peluqueria-header.jpg",

    // Categories specialized for a salon
    categories: [
      { id: "cortes", name: "Cortes" },
      { id: "tintes", name: "Tintes" },
      { id: "tratamientos", name: "Tratamientos" },
      { id: "manicure", name: "Manicure" },
    ],

    // Featured services/products
    featuredProducts: [
      {
        id: "serv1",
        name: "Corte Caballero",
        regularPrice: "15000",
        image: "/images/services/corte-caballero.jpg",
      },
      {
        id: "serv2",
        name: "Corte Dama",
        regularPrice: "25000",
        image: "/images/services/corte-dama.jpg",
      },
      {
        id: "serv3",
        name: "Peinado Especial",
        regularPrice: "35000",
        image: "/images/services/peinado.jpg",
      },
      {
        id: "serv4",
        name: "Barba y Bigote",
        regularPrice: "12000",
        image: "/images/services/barba.jpg",
      },
    ],

    // Promotion services
    promotionProducts: [
      {
        id: "promo1",
        name: "Tinte + Corte",
        regularPrice: "85000",
        salePrice: "65000",
        image: "/images/services/tinte.jpg",
      },
      {
        id: "promo2",
        name: "Keratina Brasileña",
        regularPrice: "150000",
        salePrice: "120000",
        image: "/images/services/keratina.jpg",
      },
      {
        id: "promo3",
        name: "Manicure + Pedicure",
        regularPrice: "45000",
        salePrice: "35000",
        image: "/images/services/manicure.jpg",
      },
      {
        id: "promo4",
        name: "Depilación Facial",
        regularPrice: "18000",
        salePrice: "14000",
        image: "/images/services/depilacion.jpg",
      },
    ],

    // Daily offers
    dailyOffers: [
      {
        id: "offer1",
        name: "Hidratación Profunda",
        regularPrice: "45000",
        salePrice: "30000",
        image: "/images/services/hidratacion.jpg",
      },
      {
        id: "offer2",
        name: "Cepillado y Planchado",
        regularPrice: "35000",
        salePrice: "25000",
        image: "/images/services/cepillado.jpg",
      },
      {
        id: "offer3",
        name: "Corte Infantil",
        regularPrice: "18000",
        salePrice: "12000",
        image: "/images/services/corte-infantil.jpg",
      },
      {
        id: "offer4",
        name: "Brushing",
        regularPrice: "28000",
        salePrice: "20000",
        image: "/images/services/brushing.jpg",
      },
    ],

    // New services
    newProducts: [
      {
        id: "new1",
        name: "Mechas Balayage",
        regularPrice: "120000",
        image: "/images/services/balayage.jpg",
      },
      {
        id: "new2",
        name: "Tratamiento Botox Capilar",
        regularPrice: "180000",
        image: "/images/services/botox.jpg",
      },
      {
        id: "new3",
        name: "Diseño de Cejas",
        regularPrice: "25000",
        image: "/images/services/cejas.jpg",
      },
      {
        id: "new4",
        name: "Extensiones de Pestañas",
        regularPrice: "85000",
        image: "/images/services/pestanas.jpg",
      },
    ],

    // Social media links
    socialMedia: [
      { type: "whatsapp", url: "https://wa.me/573123456789" },
      { type: "facebook", url: "https://facebook.com/peluqueriaestilos" },
      { type: "instagram", url: "https://instagram.com/peluqueriaestilos" },
    ],
  };

  return <BusinessPage businessData={peluqueriaData} />;
}
