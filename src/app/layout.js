import NavBar from "@/containers/NavBar";
import Footer from "@/containers/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />

        {children}

        <Footer />
      </body>
    </html>
  );
}
