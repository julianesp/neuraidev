// src/pages/api/accesorios/[categoria]/[slug].js
// Esta API maneja productos individuales por slug

import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { categoria, slug } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Cargar archivo JSON de la categoría
    const dataPath = path.join(process.cwd(), 'data', `${categoria}.json`);
    
    let jsonData;
    try {
      const fileContents = fs.readFileSync(dataPath, 'utf8');
      jsonData = JSON.parse(fileContents);
    } catch (error) {
      console.error('Error leyendo archivo JSON:', error);
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    const accesorios = jsonData.accesorios || [];
    
    // Buscar accesorio por slug
    const accesorio = accesorios.find(item => {
      // Buscar por slug directo
      if (item.slug === slug) return true;
      
      // Si no tiene slug, generar uno desde el nombre y comparar
      if (!item.slug) {
        const slugGenerado = item.nombre
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 60);
        
        if (slugGenerado === slug) return true;
      }
      
      return false;
    });

    if (!accesorio) {
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    }

    // Verificar que pertenece a la categoría correcta
    if (accesorio.categoria !== categoria) {
      return res.status(404).json({ message: 'Accesorio no encontrado en esta categoría' });
    }

    res.status(200).json(accesorio);

  } catch (error) {
    console.error('Error al obtener accesorio:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
} 