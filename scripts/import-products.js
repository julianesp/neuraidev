// scripts/import-products.js
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Mapeo de categorías de archivos a categorías de base de datos
const categoryMapping = {
  'celulares': 'celulares',
  'computadoras': 'computadoras', 
  'damas': 'damas',
  'generales': 'generales',
  'bicicletas': 'bicicletas',
  'librosusados': 'libros-usados',
  'librosnuevos': 'libros-nuevos',
  'accesorios_generales': 'generales',
  // 'gadgets': 'gadgets'
};

function extractCategoryFromFilename(filename) {
  const baseName = path.basename(filename, '.json');
  return categoryMapping[baseName] || baseName;
}

function generateSKU(nombre, categoria, index) {
  const categoriaCodigo = categoria.substring(0, 4).toUpperCase();
  const nombreCodigo = nombre.substring(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${categoriaCodigo}-${nombreCodigo}-${index.toString().padStart(3, '0')}`;
}

function parsePrice(precio) {
  if (typeof precio === 'number') return precio;
  if (typeof precio === 'string') {
    const cleanPrice = precio.replace(/[^\d]/g, '');
    return parseInt(cleanPrice) || 0;
  }
  return 0;
}

async function importProductsFromFile(filePath) {
  // console.log(`Importando productos desde: ${filePath}`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const categoria = extractCategoryFromFilename(filePath);
    
    // console.log(`Categoría detectada: ${categoria}`);
    
    // Buscar productos en la estructura del JSON
    let productos = [];
    if (data.accesorios) {
      productos = data.accesorios;
    } else if (data.productos) {
      productos = data.productos;
    } else if (Array.isArray(data)) {
      productos = data;
    } else {
      // console.log(`No se encontraron productos en ${filePath}`);
      return 0;
    }

    let importedCount = 0;
    
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      
      try {
        // Verificar si el producto ya existe por nombre y categoría
        const existingProduct = await prisma.producto.findFirst({
          where: {
            nombre: producto.nombre,
            categoria: categoria
          }
        });

        if (existingProduct) {
          console.log(`⚠️ Producto ya existe: ${producto.nombre}`);
          continue;
        }

        // Preparar datos del producto
        const productData = {
          nombre: producto.nombre,
          descripcion: producto.descripcion || '',
          precio: parsePrice(producto.precio),
          precioAnterior: producto.precioAnterior ? parsePrice(producto.precioAnterior) : null,
          categoria: categoria,
          imagenPrincipal: producto.imagenes && producto.imagenes[0] ? producto.imagenes[0].url : null,
          destacado: producto.destacado || false,
          disponible: producto.disponible !== false, // default true
          stock: producto.stock || 1,
          sku: producto.sku || generateSKU(producto.nombre, categoria, i + 1),
          marca: producto.marca || 'Sin marca',
          condicion: producto.condicion || 'nuevo',
          tags: producto.tags || [],
          tiendaId: 'neuraidev-principal' // Asignar a la tienda principal
        };

        // Crear el producto
        const createdProduct = await prisma.producto.create({
          data: productData
        });

        // Crear las imágenes asociadas
        if (producto.imagenes && producto.imagenes.length > 0) {
          const imageData = producto.imagenes.map((img, index) => ({
            productoId: createdProduct.id,
            url: img.url,
            alt: img.alt || producto.nombre,
            orden: index
          }));

          await prisma.imagen.createMany({
            data: imageData
          });
        }

        // console.log(`✅ Importado: ${producto.nombre}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error importando ${producto.nombre}:`, error.message);
      }
    }

    // console.log(`📊 Importados ${importedCount} productos de ${filePath}`);
    return importedCount;

  } catch (error) {
    console.error(`❌ Error leyendo archivo ${filePath}:`, error.message);
    return 0;
  }
}

async function main() {
  // console.log('🚀 Iniciando importación de productos...\n');

  // Obtener todos los archivos JSON del directorio public
  const publicDir = path.join(__dirname, '../public');
  const jsonFiles = fs.readdirSync(publicDir)
    .filter(file => file.endsWith('.json'))
    .filter(file => !['manifest.json', 'tienda.json', 'presentation.json', 'productosRecientes.json', 'accesoriosDestacados.json', 'accesoriosNuevos.json'].includes(file))
    .map(file => path.join(publicDir, file));

  // console.log(`📁 Archivos encontrados: ${jsonFiles.length}\n`);

  // Crear tienda principal si no existe
  try {
    await prisma.tienda.upsert({
      where: { id: 'neuraidev-principal' },
      update: {},
      create: {
        id: 'neuraidev-principal',
        nombre: 'neurai.dev',
        descripcion: 'Tienda principal de neurai.dev',
        activa: true
      }
    });
    // console.log('✅ Tienda principal verificada\n');
  } catch (error) {
    // console.error('❌ Error creando tienda:', error.message);
  }

  let totalImported = 0;

  // Importar productos de cada archivo
  for (const filePath of jsonFiles) {
    const count = await importProductsFromFile(filePath);
    totalImported += count;
    console.log(''); // Línea en blanco para separar archivos
  }

  console.log(`🎉 Importación completada! Total de productos importados: ${totalImported}`);
  
  // Mostrar estadísticas finales
  const stats = await prisma.producto.groupBy({
    by: ['categoria'],
    _count: {
      id: true
    }
  });

  console.log('\n📊 Productos por categoría:');
  stats.forEach(stat => {
    console.log(`  ${stat.categoria}: ${stat._count.id} productos`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error en la importación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });