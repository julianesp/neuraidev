import Accesorio from "../components/Accesorio";
import styles from "./page.module.css";

// Asumimos que esta función obtiene los datos de los accesorios
// Podrías reemplazarla con una llamada a una API real
async function getAccesorios() {
  // Simulamos una llamada a API
  return [
    {
      id: "1",
      imagenes: [
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      ],
      titulo: "Collar de Plata",
      descripcion: "Hermoso collar de plata con diseño elegante",
      precio: 99.99,
    },
    {
      id: "2",
      imagenes: [
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
        "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b",
      ],
      titulo: "Pulsera de Oro",
      descripcion:
        "Pulsera de oro de 18 quilates con incrustaciones de diamantes",
      precio: 299.99,
    },
    // Agrega más accesorios aquí
  ];
}

export default async function Home() {
  const accesorios = await getAccesorios();

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>Nuestros Accesorios</h1>
      <div className={styles.grid}>
        {accesorios.map((accesorio) => (
          <Accesorio key={accesorio.id} {...accesorio} />
        ))}
      </div>
    </main>
  );
}
