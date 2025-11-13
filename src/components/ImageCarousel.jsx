import { useState, useEffect } from "react";
import { CarouselDemo } from "./CarouselDemo";

const ImageCarousel = ({ jsonFile }) => {
  const [presentationSlides, setPresentationSlides] = useState([]);

  useEffect(() => {
    fetch(jsonFile)
      .then((response) => response.json())
      .then((data) => {
        // Extraer imágenes del JSON
        const images = data.flatMap((item) => item.images);
        setPresentationSlides(images);
      })
      .catch((error) => console.error("Error al cargar imágenes:", error));
  }, [jsonFile]); // Se ejecuta cada vez que cambia el archivo JSON

  return <CarouselDemo images={presentationSlides} />;
};

export default ImageCarousel;
