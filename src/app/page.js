import Home from "../components/Home";

export const metadata = {
  title: "Neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
  description:
    "Compra celulares, computadoras, accesorios y más. Servicios profesionales de desarrollo web y soporte técnico en sistemas. Envíos a toda Colombia.",
  keywords:
    "tienda online, celulares, computadoras, accesorios tecnológicos, desarrollo web, soporte técnico, Colombia, libros, damas, belleza, generales",
  authors: [{ name: "Neurai.dev" }],
  creator: "Neurai.dev",
  publisher: "Neurai.dev",
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
    title: "Neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    description:
      "Compra celulares, computadoras, accesorios y más. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
    url: "https://www.neurai.dev",
    siteName: "Neurai.dev",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Ftab.png?alt=media&token=5cefe9cd-82cc-4b31-b896-f9db4ec43a33",
        width: 1200,
        height: 630,
        alt: "Neurai.dev - Tienda Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neurai.dev | Tienda Online de Tecnología",
    description:
      "Compra celulares, computadoras, accesorios y más. Servicios profesionales de desarrollo web y soporte técnico.",
    images: [
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Ftab.png?alt=media&token=5cefe9cd-82cc-4b31-b896-f9db4ec43a33",
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
    google: "google-site-verification-code", // Agregar tu código de verificación
  },
};

export default function Inicio() {
  return <Home />;
}
