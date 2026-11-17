// Lugares de Colón, cada uno con su propia sección y galería en /colon.
//
// Las fotos viven en R2 (bucket neurai-pos-images, carpeta myTown/<lugar>/).
// Las fotos originales del celular pesan 25–45 MB (200 MP) y Cloudflare no
// puede redimensionarlas, así que cada foto se sube en dos tamaños:
//   <n>.jpg     → 2400 px, para el visor a pantalla completa
//   <n>-sm.jpg  →  900 px, para la cuadrícula
//
// Para agregar un lugar nuevo (termales, iglesia…): subir sus fotos a
// myTown/<id>/ en esos dos tamaños y añadir un bloque a este arreglo.

const CDN = "https://images.neurai.dev/myTown";

function fotosDe(carpeta, cantidad, alt) {
  return Array.from({ length: cantidad }, (_, i) => ({
    src: `${CDN}/${carpeta}/${i + 1}.jpg`,
    thumb: `${CDN}/${carpeta}/${i + 1}-sm.jpg`,
    alt: `${alt} — foto ${i + 1}`,
  }));
}

export const lugares = [
  {
    id: "parque",
    titulo: "El parque",
    descripcion:
      "El corazón de Colón: la plazoleta amplia, sus zonas verdes y palmeras, y la cubierta donde se reúne el pueblo en ferias y eventos.",
    fotos: fotosDe("parque", 6, "Parque de Colón, Putumayo"),
  },
];
