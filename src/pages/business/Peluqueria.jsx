"use client";
import { useState, useEffect } from "react";
import BusinessPage from "../../components/BusinessPage/page";
import tiendaData from "../../../public/peluqueria.json";

export default function Peluqueria() {
  // Solution for hydration errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return <BusinessPage businessData={tiendaData} />;
}
