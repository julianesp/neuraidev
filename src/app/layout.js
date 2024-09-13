import React from "react";
import NavBar from "@/containers/NavBar";
import Footer from "@/containers/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <React.Fragment>
      <html>
        <body>
          <NavBar />

          {children}

          <Footer />
        </body>
      </html>
    </React.Fragment>
  );
}
