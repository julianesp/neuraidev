// pages/api/accesorios/[categoria]/index.js
// Para listar todos los accesorios de una categoría

import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { categoria, exclude } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
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
    const configuracion = jsonData.configuracion || {};

    // Filtrar por categoría
    let accesoriosFiltrados = accesorios.filter(
      (item) => item.categoria === categoria,
    );

    // Excluir el accesorio actual si se especifica (por slug)
    if (exclude) {
      accesoriosFiltrados = accesoriosFiltrados.filter(
        (item) => item.slug !== exclude,
      );
    }

    res.status(200).json({
      accesorios: accesoriosFiltrados,
      configuracion,
      total: accesoriosFiltrados.length,
    });
  } catch (error) {
    console.error("Error al obtener accesorios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}
