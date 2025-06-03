import Home from "../components/Home";

export const metadata = {
  openGraph: {
    images: [
      {
        // ← Aquí va tu URL de Firebase
        url: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fshow%20(1).jpg?alt=media&token=04a541a7-9d44-4b9b-bedf-5e10727c616a",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Inicio() {
  return <Home />;
}
