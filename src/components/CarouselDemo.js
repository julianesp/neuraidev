"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Image from "next/image";

import styles from "@/styles/Carousel.module.scss";

const images = [
  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/presentationFormateo.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vcHJlc2VudGF0aW9uRm9ybWF0ZW8uanBnIiwiaWF0IjoxNzM5NTg4ODIxLCJleHAiOjE3NzExMjQ4MjF9.Q3S1LMTRV3mQrxdl-jktDMClc6corCx3OyK6H1Fh7E8",
      
  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/studio.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vc3R1ZGlvLnBuZyIsImlhdCI6MTczOTU4ODg1NSwiZXhwIjoxNzcxMTI0ODU1fQ.o18MzlbjUguamnHOkdWpCx-EvHmhRadXegr-DxnHSK4g",
  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/books.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vYm9va3MuanBnIiwiaWF0IjoxNzM5NTg4ODY5LCJleHAiOjE3NzExMjQ4Njl9.gr7lGYZFmUykkGQVWZeTpBOCSJz-DVlpggBgW65WAiY",
  "/images/image4.jpg",
  "/images/image5.jpg",
];

export function CarouselDemo() {
  return (
    // <Carousel className={`${styles.carusel} w-full `}>
    //   <CarouselContent>
    //     {Array.from({ length: 5 }).map((_, index) => (
    //       <CarouselItem key={index}>
    //         <div className="p-1">
    //           <Card>
    //             <CardContent className="flex aspect-square items-center justify-center p-6">
    //               <span className="text-4xl font-semibold">{index + 1}</span>
    //             </CardContent>
    //           </Card>
    //         </div>
    //       </CarouselItem>
    //     ))}
    //   </CarouselContent>
    //   <CarouselPrevious />
    //   <CarouselNext />
    // </Carousel>

    <Carousel className={`${styles.carusel} w-full`}>
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="w-full h-full">
                <CardContent className="flex items-center justify-center p-6 w-full h-full">
                  <Image
                    src={src}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    width={320}
                    height={320}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

export default CarouselDemo;
