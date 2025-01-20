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
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=300",
      ],
      titulo: "Collar de Plata",
      descripcion: "Hermoso collar de plata con diseño elegante",
      precio: 99.99,
    },
    {
      id: "2",
      imagenes: [
        "/placeholder.svg?height=300&width=300",
        "/placeholder.svg?height=300&width=300",
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
