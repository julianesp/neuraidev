import React from "react";
import NavBar from "../containers/NavBar";
import Footer from "../containers/Footer";
import "./globals.css";
// import "@/styles/darkMode.scss";
// import "../styles/components/pages/darkMode.scss";
import styles from "../styles/components/Layout.module.scss";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

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
        </head>

        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className={styles.layoutContainer}>
              <NavBar />
              <main className={styles.mainContent}>{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </React.Fragment>
  );
}

// import React, { use } from "react";
// // import NavBar from "../containers/NavBar";
// // import Footer from "../containers/Footer";
// import "./globals.css";
// import styles from "../styles/components/Layout.module.scss";
// import { ThemeProvider } from "next-themes";
// import LayoutClient from "../components/LayoutClient";

// // ✅ METADATA EXPORTADO (fuera del componente)
// const metadata = {
//   title: {
//     default: "Neurai.dev - Accesorios para Celulares y Computadores",
//     template: "%s | Neurai.dev",
//   },
//   description:
//     "Encuentra los mejores accesorios para celulares, computadores y más. Calidad garantizada, envíos a toda Colombia. ¡Compra ahora!",
//   keywords: [
//     "accesorios celulares",
//     "accesorios computadores",
//     "cables USB",
//     "cargadores",
//     "Colombia",
//     "tecnología",
//     "neurai.dev",
//   ],
//   authors: [{ name: "Neurai.dev", url: "https://neurai.dev" }],
//   creator: "Neurai.dev",
//   publisher: "Neurai.dev",

//   // Configuración de robots/SEO
//   robots: {
//     index: true,
//     follow: true,
//     googleBot: {
//       index: true,
//       follow: true,
//       "max-video-preview": -1,
//       "max-image-preview": "large",
//       "max-snippet": -1,
//     },
//   },

//   // Open Graph para redes sociales
//   openGraph: {
//     type: "website",
//     locale: "es_CO",
//     url: "https://neurai.dev",
//     title: "Neurai.dev - Accesorios Tecnológicos",
//     description:
//       "Los mejores accesorios para celulares y computadores en Colombia",
//     images: [
//       {
//         url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb", // Cambia por tu imagen real
//         width: 1200,
//         height: 630,
//         alt: "Neurai.dev - Accesorios Tecnológicos",
//       },
//     ],
//     siteName: "Neurai.dev",
//   },

//   // Twitter Cards
//   twitter: {
//     card: "summary_large_image",
//     title: "Neurai.dev - Accesorios Tecnológicos",
//     description:
//       "Los mejores accesorios para celulares y computadores en Colombia",
//     images: [
//       "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb",
//     ], // Cambia por tu imagen real
//   },

//   // Verificaciones
//   verification: {
//     // Cambia por tu código real
//     google: "j5F1gIRKtoFcGqjKTDo7lUp7bRgRFjWw4HJz7AQ1ZnM",
//   },

//   // URL canónica
//   alternates: {
//     canonical: "https://neurai.dev",
//   },

//   category: "technology",

//   // Configuración adicional
//   formatDetection: {
//     telephone: false,
//   },

//   // Manifest para PWA
//   manifest: "/manifest.json",
// };

// // ✅ COMPONENTE LAYOUT (simplificado)
// export default function RootLayout({ children }) {
//   return (
//     <html lang="es" suppressHydrationWarning>
//       <head>
//         {/* ✅ Favicons - mantén los que ya tienes */}
//         <link
//           rel="icon"
//           type="image/png"
//           href="/favicon-96x96.png"
//           sizes="96x96"
//         />
//         <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
//         <link rel="shortcut icon" href="/favicon.ico" />
//         <link
//           rel="apple-touch-icon"
//           sizes="180x180"
//           href="/apple-touch-icon.png"
//         />
//         <meta name="apple-mobile-web-app-title" content="neurai.dev" />

//         {/* ✅ PWA y tema */}
//         <meta name="theme-color" content="#0070f3" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />

//         {/* ✅ Preconectar a dominios externos para mejor performance */}
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
//       </head>

//       <body>
//         <div className={styles.layoutContainer}>
//           <LayoutClient/>
//         </div>
//       </body>
//     </html>
//   );
// }
