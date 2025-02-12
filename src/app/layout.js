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
      <html>
        <body>
          {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider> */}
          <NavBar />
          {children}
          <Footer />
        </body>
      </html>
    </React.Fragment>
  );
}
