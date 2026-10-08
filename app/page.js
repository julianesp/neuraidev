import Home from "@/components/Home/page";

export const metadata = {
  title: {
    absolute:
      "neurai.dev | Tienda de tecnología y técnico en sistemas en Colón, Putumayo",
  },
  description:
    "Tienda de tecnología en Colón, Putumayo: accesorios para celulares y computadoras, formateo y mantenimiento de computadores y desarrollo web. Envío gratis en todo el Alto Putumayo.",
  authors: [{ name: "neurai.dev" }],
  creator: "neurai.dev",
  publisher: "neurai.dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://neurai.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    description:
      "Tienda de tecnología en Colón, Putumayo: accesorios para celulares y computadoras, formateo y mantenimiento de computadores y desarrollo web. Envío gratis en todo el Alto Putumayo.",
    siteName: "neurai.dev",
    url: "https://neurai.dev",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "https://neurai.dev/og-home.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    description:
      "Compra celulares, computadoras, accesorios y más. Servicios profesionales de desarrollo web y soporte técnico.",
    images: [
      "https://neurai.dev/og-home.jpg",
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
