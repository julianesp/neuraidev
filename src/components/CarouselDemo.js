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

  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/contavsib.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vY29udGF2c2liLmpwZyIsImlhdCI6MTczOTY3NDQ5OSwiZXhwIjoxNzcxMjEwNDk5fQ.z8xKrVLotc3If3bLViN_S1cR28d6HJlFCIja180pThY",
  "https://nwxetoffoghsimkqfsbv.supabase.co/storage/v1/object/sign/media/presentation/desarrollo.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJtZWRpYS9wcmVzZW50YXRpb24vZGVzYXJyb2xsby5qcGciLCJpYXQiOjE3Mzk2NzQ1NjUsImV4cCI6MTc3MTIxMDU2NX0.GmirLAxZCmiNmHDV5ZqujSmUufMH95DtTpBVEtWY0GM",
];

export function CarouselDemo() {
  return (
    <Carousel className={`${styles.carousel} w-full`}>
      <CarouselContent className={styles.carouselContent}>
        {images.map((src, index) => (
          <CarouselItem key={index} className={styles.carouselItem}>
            <div className="p-1">
              <Card className={styles.card}>
                {/* sm:h-60 md:h-80 */}
                <CardContent
                  className={`${styles.cardContent} flex items-center justify-center p-0 w-full  sm:h-4/6 md:h-80 `}
                >
                  <Image
                    src={src}
                    alt={`Imagen ${index + 1}`}
                    className="w-full object-cover rounded-lg "
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

// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// import Image from "next/image";
// import styles from "@/styles/Carousel.module.scss";

// export function CarouselDemo({ images = [] }) {
//   return (
//     <Carousel className={`${styles.carousel} w-full`}>
//       <CarouselContent className={styles.carouselContent}>
//         {Array.isArray(images) && images.length > 0 ? (
//           images.map((src, index) => (
//             <CarouselItem key={index} className={styles.carouselItem}>
//               <div className="p-1">
//                 <Card className={styles.card}>
//                   <CardContent
//                     className={`${styles.cardContent} flex items-center justify-center p-0 w-full sm:h-4/6 md:h-80 `}
//                   >
//                     <Image
//                       src={src}
//                       alt={`Imagen ${index + 1}`}
//                       className="w-full object-cover rounded-lg "
//                       width={320}
//                       height={320}
//                     />
//                   </CardContent>
//                 </Card>
//               </div>
//             </CarouselItem>
//           ))
//         ) : (
//           <p className="text-center text-gray-500">
//             No hay imágenes disponibles
//           </p>
//         )}
//       </CarouselContent>
//       {/* <CarouselPrevious />
//       <CarouselNext /> */}
//       <CarouselPrevious
//         onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
//       />
//       <CarouselNext
//         onClick={() =>
//           setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1))
//         }
//       />
//     </Carousel>
//   );
// }

// export default CarouselDemo;
