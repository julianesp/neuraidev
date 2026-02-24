import React from "react";
import NavBar from "@/components/NavBar/page";
import ConditionalFooter from "@/components/ConditionalFooter";
// import SplashScreen from "../components/SplashScreen";
import StructuredData from "@/components/StructuredData";
import AOSInit from "@/components/AOSInit";
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
    // Servicios principales
    "desarrollo web",
    "desarrollador web Colombia",
    "técnico en sistemas",
    "soporte técnico computadoras",
    "mantenimiento computadoras",
    "reparación computadoras",
    // Productos - Celulares
    "accesorios celulares",
    "fundas celular",
    "protectores pantalla",
    "cargadores celular",
    "manos libres",
    // Productos - Computadoras
    "accesorios computadoras",
    "teclados",
    "mouse",
    "memorias RAM",
    "ssd",
    "m.2",
    "msata",
    "teclado gamer",
    "teclados gamer",
    "discos duros",
    "pendrives",
    "cables USB",
    // Productos - Libros
    "libros nuevos",
    "libros usados",

    "productos generales",
    // Ubicación
    "Valle de Sibundoy",
    "Sibundoy",
    "Colón",
    "San Francisco",
    "Santiago",
    "Putumayo",
    "Colombia",
    // Marca y general
    "neurai.dev",
    "tienda tecnología",
    "tienda online",
    "ofertas tecnología",
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
        url: "/og-image.png",
        width: 1200,
        height: 630,
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
    images: ["/og-image.png"],
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
      <html lang="es" suppressHydrationWarning>
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

          {/* Fuente pixelada para tema Minecraft */}
          <link
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
            rel="stylesheet"
          />

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

          {/* ePayco Checkout para procesamiento de pagos */}
          <Script
            src="https://checkout.epayco.co/checkout.js"
            strategy="afterInteractive"
          />
        </head>

        <body>
          <StructuredData />
          <AOSInit />
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
                  <AccessibilityPanel />
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
