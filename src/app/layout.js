import NavBar from "@/containers/NavBar";
import Footer from "@/containers/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />

        <div className="pb-8">{children}</div>

        <Footer />
      </body>
    </html>
  );
}
