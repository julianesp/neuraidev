"use client";

import { useState, useEffect } from "react";
import BusinessPage from "@/components/BusinessPage";

export default function PeluqueriaPage() {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  // Sample data for a salon/peluquería
  const peluqueriaData = {
    id: "peluqueria123",
    name: "Barber Jam",
    description:
      "Mejoramos tu presentación personal con los mejores cortes y tratamientos capilares",
    logo: "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/barber_jam_profile.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9iYXJiZXJfamFtX3Byb2ZpbGUuanBnIiwiaWF0IjoxNzQyMDUxNTE2LCJleHAiOjE3NDI2NTYzMTZ9.UcypwrwKW-n6ueLvE-5-Id5N3zGofbpqzat36Y9llDw",
    // headerImage: "/images/businesses/peluqueria-header.jpg",
    headerImage:
      "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/barber_jam.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9iYXJiZXJfamFtLmpwZyIsImlhdCI6MTc0MjA1MTA4MywiZXhwIjoxNzQyNjU1ODgzfQ.R8KIXZWbtrm_4A1Ra3vd9nsczQidFpRCtqKUmIEk1ic",

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
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "serv2",
        name: "Corte Dama",
        regularPrice: "25000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "serv3",
        name: "Peinado Especial",
        regularPrice: "35000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "serv4",
        name: "Barba y Bigote",
        regularPrice: "12000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
    ],

    // Promotion services
    promotionProducts: [
      {
        id: "promo1",
        name: "Tinte + Corte",
        regularPrice: "85000",
        salePrice: "65000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "promo2",
        name: "Keratina Brasileña",
        regularPrice: "150000",
        salePrice: "120000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "promo3",
        name: "Manicure + Pedicure",
        regularPrice: "45000",
        salePrice: "35000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "promo4",
        name: "Depilación Facial",
        regularPrice: "18000",
        salePrice: "14000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
    ],

    // Daily offers
    dailyOffers: [
      {
        id: "offer1",
        name: "Hidratación Profunda",
        regularPrice: "45000",
        salePrice: "30000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "offer2",
        name: "Cepillado y Planchado",
        regularPrice: "35000",
        salePrice: "25000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "offer3",
        name: "Corte Infantil",
        regularPrice: "18000",
        salePrice: "12000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "offer4",
        name: "Brushing",
        regularPrice: "28000",
        salePrice: "20000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
    ],

    // New services
    newProducts: [
      {
        id: "new1",
        name: "Mechas Balayage",
        regularPrice: "120000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "new2",
        name: "Tratamiento Botox Capilar",
        regularPrice: "180000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "new3",
        name: "Diseño de Cejas",
        regularPrice: "25000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
      },
      {
        id: "new4",
        name: "Extensiones de Pestañas",
        regularPrice: "85000",
        image:
          "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/business/presentation.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9idXNpbmVzcy9wcmVzZW50YXRpb24ucG5nIiwiaWF0IjoxNzQyMDUyMTAwLCJleHAiOjE3NDI2NTY5MDB9.LJ_x6wwS-eFTFGHHWPIgnG7gzE8pCrfCwZrJ5X_peiM",
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
