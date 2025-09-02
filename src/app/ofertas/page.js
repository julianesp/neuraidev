import OfertasEspeciales from "../../components/OfertasEspeciales";

export const metadata = {
  title: "Ofertas Especiales | Neurai.dev",
  description: "Descubre nuestras ofertas especiales en servicios tecnológicos. Mantenimiento de computadores, desarrollo web y más con descuentos increíbles.",
  openGraph: {
    title: "Ofertas Especiales - Neurai.dev",
    description: "Aprovecha nuestros descuentos especiales en servicios de tecnología",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fofertas-og.jpg?alt=media&token=ofertas-special",
        width: 1200,
        height: 630,
        alt: "Ofertas especiales Neurai.dev",
      },
    ],
  },
  keywords: [
    "ofertas tecnología",
    "descuentos computadores",
    "mantenimiento PC",
    "desarrollo web",
    "servicios tecnológicos",
    "amor y amistad",
    "ofertas especiales"
  ],
};

export default function OfertasPage() {
  return <OfertasEspeciales />;
}