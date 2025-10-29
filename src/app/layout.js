import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../containers/Footer";
import SplashScreen from "../components/SplashScreen";
import StructuredData from "../components/StructuredData";
import "./globals.css";
// import "@/styles/darkMode.scss";
// import "../styles/components/pages/darkMode.scss";
import styles from "../styles/components/Layout.module.scss";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
// import NotificationManager from "../components/NotificationManager";
import StoreStatus from "../components/StoreStatus";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "../contexts/ToastContext";
import { ToastContainer } from "../components/Toast";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://neurai.dev",
  ),
  title: {
    default: "neurai.dev - Tienda de Accesorios y Servicios",
    template: "%s | neurai.dev",
  },
  description:
    "Tienda de accesorios, noticias del Valle de Sibundoy y servicios profesionales en desarrollo de software y técnico en sistemas.",
  keywords: [
    "accesorios",
    "Valle de Sibundoy",
    "noticias",
    "desarrollo software",
    "técnico sistemas",
    "Putumayo",
  ],
  authors: [{ name: "neurai.dev" }],
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://neurai.dev",
    siteName: "neurai.dev",
    title: "neurai.dev - Tienda de Accesorios y Servicios",
    description:
      "Tienda de accesorios, noticias del Valle de Sibundoy y servicios profesionales.",
  },
  twitter: {
    card: "summary_large_image",
    title: "neurai.dev - Tienda de Accesorios y Servicios",
    description:
      "Tienda de accesorios, noticias del Valle de Sibundoy y servicios profesionales.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <meta name="apple-mobile-web-app-title" content="neurai.dev" />
          <link rel="manifest" href="/manifest.json" />

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
          <ClerkProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ToastProvider>
                <SplashScreen />
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
                  <Footer />
                  {/* <StoreStatus /> */}
                </div>
                <ToastContainer />
              </ToastProvider>
            </ThemeProvider>
          </ClerkProvider>
        </body>
      </html>
    </React.Fragment>
  );
}
