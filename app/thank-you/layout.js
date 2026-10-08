export const metadata = {
  title: "Gracias por tu compra",
  description:
    "Tu pedido ha sido confirmado. Gracias por confiar en Neurai.dev para tus productos tecnológicos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({ children }) {
  return <>{children}</>;
}
