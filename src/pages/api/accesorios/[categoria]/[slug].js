// pages/api/accesorios/[categoria]/[slug].js
// API adaptada para el enfoque híbrido (ID numérico + slug para URLs)

import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { categoria, slug } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Cargar archivo JSON de la categoría
    const dataPath = path.join(process.cwd(), "data", `${categoria}.json`);

    let jsonData;
    try {
      const fileContents = fs.readFileSync(dataPath, "utf8");
      jsonData = JSON.parse(fileContents);
    } catch (error) {
      console.error("Error leyendo archivo JSON:", error);
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    const accesorios = jsonData.accesorios || [];

    // Buscar accesorio por slug
    const accesorio = accesorios.find(
      (item) => item.slug === slug && item.categoria === categoria,
    );

    if (!accesorio) {
      return res.status(404).json({ message: "Accesorio no encontrado" });
    }

    res.status(200).json(accesorio);
  } catch (error) {
    console.error("Error al obtener accesorio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
