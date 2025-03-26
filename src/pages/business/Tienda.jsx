"use client";
import { useState, useEffect } from "react";
import BusinessPage from "@/components/BusinessPage/page";
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
