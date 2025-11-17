import Home from "@/components/Home/page";

export const metadata = {
  title: "Neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
  description:
    "Compra accesorios para celulares, computadoras y más. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
  keywords:
    "tienda online, celulares, computadoras, accesorios tecnológicos, desarrollo web, soporte técnico, Colombia, libros, damas, belleza, generales",
  authors: [{ name: "neurai.dev" }],
  creator: "neurai.dev",
  publisher: "neurai.dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.neurai.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    description:
      "Compra accesorios para celulares, computadoras y más. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
    url: "https://www.neurai.dev",
    siteName: "neurai.dev",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
        width: 1200,
        height: 630,
        alt: "neurai.dev - Tienda Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "neurai.dev | Tienda Online de Tecnología",
    description:
      "Compra celulares, computadoras, accesorios y más. Servicios profesionales de desarrollo web y soporte técnico.",
    images: [
      "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google:
      "google-site-verification=j5F1gIRKtoFcGqjKTDo7lUp7bRgRFjWw4HJz7AQ1ZnM",
  },
};

export default function Inicio() {
  return <Home />;
}
