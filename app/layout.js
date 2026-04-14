import React from "react";
import NavBar from "@/components/NavBar/page";
import ConditionalFooter from "@/components/ConditionalFooter";
// import SplashScreen from "../components/SplashScreen";
import StructuredData from "@/components/StructuredData";
import FAQSchema from "@/components/FAQSchema";
import AOSInit from "@/components/AOSInit";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import "../styles/sweetalert2-custom.css";
import "../styles/minecraft-theme.css";
// import "@/styles/darkMode.scss";
// import "../styles/components/pages/darkMode.scss";
import styles from "../styles/components/Layout.module.scss";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
// import NotificationManager from "../components/NotificationManager";
import StoreStatus from "@/components/StoreStatus";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/contexts/ToastContext";
import { ToastContainer } from "@/components/Toast";
import { ClerkProvider } from "@clerk/nextjs";
import AIChat from "@/components/AIChat/AIChat";
import { CartProvider } from "@/context/CartContext";
import ShoppingCart from "@/components/ShoppingCart/page";
import AnnouncementsProvider from "@/components/AnnouncementsProvider";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { MinecraftThemeProvider } from "@/contexts/MinecraftThemeContext";
import MinecraftThemeFloatingButton from "@/components/MinecraftThemeFloatingButton";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://neurai.dev"),
  title: {
    default:
      "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    template: "%s | neurai.dev",
  },
  description:
    "Accesorios para celulares y computadoras. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
  keywords: [
    // Servicios principales (long-tail keywords para mejor posicionamiento)
    "desarrollo web Colombia",
    "desarrollador web Putumayo",
    "crear página web económica",
    "tienda online para negocio",
    "técnico en sistemas Valle de Sibundoy",
    "soporte técnico computadoras Colombia",
    "mantenimiento PC Putumayo",
    "reparación computadores Valle de Sibundoy",

    // Productos - Celulares (con intención de compra)
    "comprar accesorios celulares Colombia",
    "fundas celular baratas",
    "protectores pantalla originales",
    "cargadores rápidos celular",
    "cargador tipo C original",
    "auriculares bluetooth económicos",
    "manos libres para celular",
    "cables USB tipo C baratos",
    "fundas Samsung Xiaomi iPhone",

    // Productos - Computadoras (keywords específicos)
    "comprar memorias RAM DDR3 DDR4",
    "discos SSD baratos Colombia",
    "SSD M.2 NVME precio",
    "SSD SATA 256GB 512GB",
    "disco duro externo",
    "teclado gamer económico",
    "mouse inalámbrico Bluetooth",
    "mouse gamer barato",
    "memorias RAM portátil",
    "HUB USB tipo C",
    "adaptador SATA USB",
    "webcam HD 720p",

    // Productos - Libros y otros
    "libros técnicos programación",
    "libros usados baratos",
    "libros universitarios usados",

    // Ubicación geográfica (SEO local)
    "tienda tecnología Valle de Sibundoy",
    "accesorios computadoras Putumayo",
    "tienda online Sibundoy",
    "envíos Putumayo Colombia",
    "Colón Putumayo",
    "San Francisco Putumayo",

    // Marca y términos comerciales
    "neurai.dev",
    "tienda tecnología online Colombia",
    "ofertas accesorios tecnología",
    "precios bajos accesorios",
    "envío gratis Colombia",
    "comprar tecnología online",
  ],
  authors: [{ name: "neurai.dev" }],
  creator: "neurai.dev",
  publisher: "neurai.dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "neurai.dev",
  },
  openGraph: {
    title: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    description:
      "Accesorios para celulares y computadoras. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
    siteName: "neurai.dev",
    images: [
      {
        url: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
        width: 512,
        height: 512,
        alt: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "neurai.dev | Tienda Online de Tecnología y Servicios Profesionales",
    description:
      "Accesorios para celulares y computadoras. Servicios profesionales de desarrollo web y soporte técnico en sistemas.",
    images: ["https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png"],
    creator: "@neuraidev",
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
  other: {
    "apple-mobile-web-app-title": "neurai.dev",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "twitter:domain": "neurai.dev",
    "twitter:url": "https://neurai.dev/",
    "geo.region": "CO-PUT",
    "geo.placename": "Valle de Sibundoy, Putumayo",
    "geo.position": "1.1333;-76.9",
    ICBM: "1.1333, -76.9",
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <React.Fragment>
      <html lang="es" suppressHydrationWarning className={pressStart2P.variable}>
        <head>
          <link
            rel="icon"
            type="image/png"
            href="/favicon-96x96.png"
            sizes="96x96"
          />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <meta name="apple-mobile-web-app-title" content="neurai.dev" />

          {/* Google Analytics con variable de entorno */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
          </Script>

          {/* Script para prevenir scroll automático al cargar */}
          <Script id="scroll-restoration" strategy="beforeInteractive">
            {`
            if ('scrollRestoration' in history) {
              history.scrollRestoration = 'manual';
            }
            window.addEventListener('load', function() {
              setTimeout(function() {
                window.scrollTo(0, 0);
              }, 0);
            });
          `}
          </Script>

        </head>

        <body>
          <StructuredData />
          <FAQSchema />
          <ClerkProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <MinecraftThemeProvider>
                <AOSInit />
                <ToastProvider>
                  <CartProvider>
                  {/*
                  presentacion de mi logo
                   <SplashScreen />
                   */}
                  <div className={styles.layoutContainer}>
                    <NavBar />
                    <main
                      id="main-content"
                      className={styles.mainContent}
                      role="main"
                      aria-label="Contenido principal"
                    >
                      {children}
                      {/* <NotificationManager /> */}
                      <Analytics />
                    </main>
                    <ConditionalFooter />
                    {/* <StoreStatus /> */}
                  </div>
                  <ShoppingCart />
                  {/* <AIChat /> */}
                  <ToastContainer />
                  <AnnouncementsProvider />
                  {/* <AccessibilityPanel /> */}
                  <MinecraftThemeFloatingButton />
                </CartProvider>
              </ToastProvider>
              </MinecraftThemeProvider>
            </ThemeProvider>
          </ClerkProvider>
        </body>
      </html>
    </React.Fragment>
  );
}
