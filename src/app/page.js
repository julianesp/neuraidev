import Home from "../components/Home";

export const metadata = {
  openGraph: {
    images: [
      {
        // ← Aquí va tu URL de Firebase
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Ftab.png?alt=media&token=5cefe9cd-82cc-4b31-b896-f9db4ec43a33",
        width: 1200,
        height: 630,
        alt: "neurai.dev",
      },
    ],
  },
};

export default function Inicio() {
  return <Home />;
}
