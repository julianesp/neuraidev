import React from "react";
import NavBar from "../components/NavBar";
import Footer from "../containers/Footer";
import "./globals.css";
// import "@/styles/darkMode.scss";
// import "../styles/components/pages/darkMode.scss";
import styles from "../styles/components/Layout.module.scss";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import NotificationManager from "../components/NotificationManager";
import StoreStatus from "../components/StoreStatus";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "../contexts/ToastContext";
import { CartProvider } from "../contexts/CartContext";
import { ToastContainer } from "../components/Toast";

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

          {/* Google AdSense */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3332683017412148"
            crossOrigin="anonymous"
          ></script>

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
        </head>

        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
              <CartProvider>
                <div className={styles.layoutContainer}>
                  <NavBar />
                  <main className={styles.mainContent}>
                    {children}
                    {/* <NotificationManager /> */}
                    <Analytics />
                  </main>
                  <Footer />
                  {/* <StoreStatus /> */}
                </div>
                <ToastContainer />
              </CartProvider>
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </React.Fragment>
  );
}
