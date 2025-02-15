import React from "react";
import NavBar from "@/containers/NavBar";
import Footer from "@/containers/Footer";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  manifest: "/manifest.json";
  themeColor: "#ffffff";
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ];
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ];
  }

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
        </head>

        <body>
          {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider> */}
          {/* <ThemeProvider>{children}</ThemeProvider> */}
          <NavBar />
          {children}
          <Footer />
        </body>
      </html>
    </React.Fragment>
  );
}
