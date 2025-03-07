import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function AccesoriosPage() {
  // Datos de ejemplo para los accesorios
  const accesorios = [
    {
      id: 1,
      nombre: "Accesorio 1",
      descripcion:
        "Este es un accesorio de alta calidad diseñado para mejorar tu experiencia. Fabricado con materiales premium y acabados de lujo.",
      precio: 29.99,
      imagenes: [
        "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/3.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzMuanBnIiwiaWF0IjoxNzQxMzExNTc2LCJleHAiOjE3NzI4NDc1NzZ9.fF5vP2bvIfPEqqlvPQyiZB2u8Y_Xzuu3tZZMuR-2gjU",
        "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzEuanBnIiwiaWF0IjoxNzQxMzExNTk0LCJleHAiOjE3NzI4NDc1OTR9.DVrpDKKJCSImCM6xYWfTFi17cslpwQVACtnL8jgThNA",
      ],
      video:
        "/https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4",
    },
    {
      id: 2,
      nombre: "Accesorio 2",
      descripcion:
        "Accesorio versátil con múltiples funciones. Ideal para uso diario y compatible con varios dispositivos.",
      precio: 39.99,
      imagenes: [
        "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/3.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzMuanBnIiwiaWF0IjoxNzQxMzExNTc2LCJleHAiOjE3NzI4NDc1NzZ9.fF5vP2bvIfPEqqlvPQyiZB2u8Y_Xzuu3tZZMuR-2gjU",
        "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/accesorios%20computers/multi%20puerto%20usb%203%208%20puertos/1.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9hY2Nlc29yaW9zIGNvbXB1dGVycy9tdWx0aSBwdWVydG8gdXNiIDMgOCBwdWVydG9zLzEuanBnIiwiaWF0IjoxNzQxMzExNTk0LCJleHAiOjE3NzI4NDc1OTR9.DVrpDKKJCSImCM6xYWfTFi17cslpwQVACtnL8jgThNA",
      ],
      video:
        "/https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4",
    },
  ];

  const accesorioActual = accesorios[0];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Carrusel de imágenes con flechas de navegación */}
      <Carousel className="w-full mb-6 rounded-xl overflow-hidden border">
        <CarouselContent>
          {accesorioActual.imagenes.map((imagen, index) => (
            <CarouselItem key={index}>
              <div className="flex items-center justify-center p-1">
                <Image
                  src={
                    imagen ||
                    "/https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4"
                  }
                  alt={`Imagen ${index + 1} de ${accesorioActual.nombre}`}
                  width={800}
                  height={400}
                  className="rounded-lg object-cover w-full h-[200px] md:h-[300px]"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 bg-white/80 hover:bg-white">
          <ChevronLeft className="h-6 w-6" />
        </CarouselPrevious>
        <CarouselNext className="right-2 bg-white/80 hover:bg-white">
          <ChevronRight className="h-6 w-6" />
        </CarouselNext>
      </Carousel>

      {/* Descripción del accesorio */}
      <div className="mb-6 p-4 border rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Descripción de accesorio</h2>
        <p className="text-gray-700">{accesorioActual.descripcion}</p>
      </div>

      {/* Botón de comprar */}
      <div className="mb-6 flex justify-center">
        <Button className="px-8 py-6 text-lg font-semibold">Comprar</Button>
      </div>

      {/* Video de presentación */}
      <div className="mb-6 p-4 border rounded-xl">
        <h2 className="text-xl font-semibold mb-2">
          Video de presentación de accesorio
        </h2>
        <div className="relative rounded-lg overflow-hidden">
          <Image
            src={
              accesorioActual.video ||
              "/https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4"
            }
            alt="Video de presentación"
            width={800}
            height={300}
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-16 h-16 bg-white/80 hover:bg-white"
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        </div>
      </div>

      {/* Galería de accesorios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="p-2">
              <Image
                src={`/https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/store.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9zdG9yZS5wbmciLCJpYXQiOjE3NDAxMDk4NzksImV4cCI6MTc3MTY0NTg3OX0.TJG-NcrDlATRTk5uhH_NcvmnauUoNJrGOQPmpVleDj4`}
                alt={`Accesorio ${item}`}
                width={150}
                height={150}
                className="w-full h-[100px] object-cover rounded-md"
              />
              <p className="mt-2 text-center font-medium">Accesorio {item}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
