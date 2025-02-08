import React from "react";
import NavBar from "@/containers/NavBar";
import Footer from "@/containers/Footer";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({ children }) {
  return (
    <React.Fragment>
      <html>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
          <NavBar />
          {children}
          <Footer />
        </body>
      </html>
    </React.Fragment>
  );
}
