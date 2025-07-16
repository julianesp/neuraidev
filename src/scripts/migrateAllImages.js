import fs from 'fs';
import path from 'path';
import { migrateProductImages } from '../utils/migrateImages.js';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Archivos JSON que contienen productos con imágenes
const JSON_FILES = [
  'accesorios_generales.json',
  'accesoriosNuevos.json',
  'accesoriosDestacados.json',
  'accesories.json',
  'bicicletas.json',
  'celulares.json',
  'computadoras.json',
  'computers.json',
  'damas.json',
  'gadgets.json',
  'generales.json',
  'librosusados.json',
  'librosnuevos.json',
  'peluqueria.json',
  'presentation.json',
  'tecnico_sistemas.json',
  'tienda.json',
  'accesoriesBooksNew.json',
  'accesoriesBooksOld.json'
];

/**
 * Migra todas las imágenes de un archivo JSON
 */
async function migrateJsonFile(filename) {
  const filePath = path.join(PUBLIC_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${filename}`);
    return;
  }
  
  try {
    console.log(`🔄 Procesando: ${filename}`);
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Procesar diferentes estructuras de datos
    let migratedData;
    
    if (Array.isArray(data)) {
      // Array de productos
      migratedData = [];
      for (const product of data) {
        const migratedProduct = await migrateProductImages(product);
        migratedData.push(migratedProduct);
      }
    } else if (typeof data === 'object') {
      // Objeto con productos
      migratedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
          migratedData[key] = [];
          for (const product of value) {
            const migratedProduct = await migrateProductImages(product);
            migratedData[key].push(migratedProduct);
          }
        } else if (typeof value === 'object' && value !== null) {
          migratedData[key] = await migrateProductImages(value);
        } else {
          migratedData[key] = value;
        }
      }
    }
    
    // Crear backup del archivo original
    const backupPath = path.join(PUBLIC_DIR, `${filename}.backup`);
    fs.copyFileSync(filePath, backupPath);
    
    // Escribir el archivo migrado
    fs.writeFileSync(filePath, JSON.stringify(migratedData, null, 2));
    
    console.log(`✅ Migrado exitosamente: ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error migrando ${filename}:`, error);
  }
}

/**
 * Ejecuta la migración de todos los archivos
 */
async function migrateAllImages() {
  console.log('🚀 Iniciando migración de imágenes a Vercel Blob...\n');
  
  for (const filename of JSON_FILES) {
    await migrateJsonFile(filename);
    console.log(''); // Línea en blanco para separar
  }
  
  console.log('🎉 Migración completada!');
  console.log('📁 Los archivos originales fueron respaldados con extensión .backup');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllImages().catch(console.error);
}

export { migrateAllImages, migrateJsonFile };