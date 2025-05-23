import React from "react";
import NavBar from "../containers/NavBar";
import Footer from "../containers/Footer";
import "./globals.css";
// import "@/styles/darkMode.scss";
// import "../styles/components/pages/darkMode.scss";
import styles from "../styles/components/Layout.module.scss";
import { ThemeProvider } from "next-themes";

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
