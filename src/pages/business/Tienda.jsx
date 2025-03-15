// "use client";
// import { useState, useEffect } from "react";
// import BusinessPage from "@/components/BusinessPage";

// export default function TiendaPage() {
//   // Solution for hydratation errors
//   const [isLoaded, setIsLoaded] = useState(false);
//   useEffect(() => {
//     setIsLoaded(true);
//   }, []);
//   if (!isLoaded) return null;

//   // Sample data for a store/tienda
//   const tiendaData = {
//     id: "tienda123",
//     name: "Tienda Don Pedro",
//     description:
//       "La mejor tienda del barrio con productos frescos y precios económicos",
//     logo: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4",
//     headerImage:
//       "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",

//     // Categories based on your sketch
//     categories: [
//       { id: "aseo", name: "Aseo" },
//       { id: "grano", name: "Grano" },
//       { id: "otros", name: "Otros" },
//       { id: "otros2", name: "Otros 2" },
//     ],

//     // Sample products for each section
//     featuredProducts: [
//       {
//         id: "prod1",
//         name: "Arroz Diana x 500g",
//         regularPrice: "2500",
//         image:
//           "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/2.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzIuanBnIiwiaWF0IjoxNzQxNDg1ODUzLCJleHAiOjE3NzMwMjE4NTN9.PAMkygQfo3U-1ny7gGUYAc0PlQCRtvqysZ-RvT25XFw",
//       },
//       {
//         id: "prod2",
//         name: "Aceite Girasol x 1L",
//         regularPrice: "8900",
//         image:
//           "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
//       },
//       {
//         id: "prod3",
//         name: "Frijol rojo x 500g",
//         regularPrice: "4200",
//         image:
//           "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
//       },
//       {
//         id: "prod4",
//         name: "Azúcar blanca x 1kg",
//         regularPrice: "3600",
//         image:
//           "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
//       },
//     ],

//     promotionProducts: [
//       {
//         id: "promo1",
//         name: "Jabón líquido x 500ml",
//         regularPrice: "7500",
//         salePrice: "5900",
//         image:
//           "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
//       },
//       {
//         id: "promo2",
//         name: "Champú familiar x 750ml",
//         regularPrice: "12000",
//         salePrice: "9500",
//         image:
//           "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/local.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9sb2NhbC5wbmciLCJpYXQiOjE3NDAxMDYzMDUsImV4cCI6MTc3MTY0MjMwNX0.Um9CF_Uju100xYcVbMfcgSjrZjCgxbLXFb7Gb-Bmwrc",
//       },
//       {
//         id: "promo3",
//         name: "Pasta dental x 100ml",
//         regularPrice: "4500",
//         salePrice: "3200",
//         image: "/images/products/pasta-dental.jpg",
//       },
//       {
//         id: "promo4",
//         name: "Crema corporal x 400ml",
//         regularPrice: "15000",
//         salePrice: "11900",
//         image: "/images/products/crema.jpg",
//       },
//     ],

//     dailyOffers: [
//       {
//         id: "offer1",
//         name: "Lentejas x 500g",
//         regularPrice: "3800",
//         salePrice: "2500",
//         image: "/images/products/lentejas.jpg",
//       },
//       {
//         id: "offer2",
//         name: "Papel higiénico x 12 rollos",
//         regularPrice: "16000",
//         salePrice: "12000",
//         image: "/images/products/papel.jpg",
//       },
//       {
//         id: "offer3",
//         name: "Detergente x 1kg",
//         regularPrice: "9200",
//         salePrice: "6900",
//         image: "/images/products/detergente.jpg",
//       },
//       {
//         id: "offer4",
//         name: "Café molido x 250g",
//         regularPrice: "8500",
//         salePrice: "5900",
//         image: "/images/products/cafe.jpg",
//       },
//     ],

//     newProducts: [
//       {
//         id: "new1",
//         name: "Gel antibacterial x 300ml",
//         regularPrice: "6700",
//         image: "/images/products/gel.jpg",
//       },
//       {
//         id: "new2",
//         name: "Avena en hojuelas x 400g",
//         regularPrice: "5200",
//         image: "/images/products/avena.jpg",
//       },
//       {
//         id: "new3",
//         name: "Crema facial x 50ml",
//         regularPrice: "19900",
//         image: "/images/products/crema-facial.jpg",
//       },
//       {
//         id: "new4",
//         name: "Atún en agua x 160g",
//         regularPrice: "4900",
//         image: "/images/products/atun.jpg",
//       },
//     ],

//     // Social media links
//     socialMedia: [
//       { type: "whatsapp", url: "https://wa.me/573123456789" },
//       { type: "facebook", url: "https://facebook.com/tiendadonpedro" },
//       { type: "instagram", url: "https://instagram.com/tiendadonpedro" },
//     ],
//   };

//   return <BusinessPage businessData={tiendaData} />;
// }

"use client";
import { useState, useEffect } from "react";
import BusinessPage from "@/components/BusinessPage";
import tiendaData from "../../../public/tienda.json";

export default function TiendaPage() {
  // Solution for hydration errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return <BusinessPage businessData={tiendaData} />;
}
