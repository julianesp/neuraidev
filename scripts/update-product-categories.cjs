const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateProductCategories() {
  try {
    console.log('🚀 Iniciando actualización de categorías de productos...');

    // Definir todas las categorías necesarias
    const categoriasDefinidas = {
      'celulares': { nombre: 'Celulares', icono: '📱', orden: 1 },
      'computadoras': { nombre: 'Computación', icono: '💻', orden: 2 },
      'generales': { nombre: 'Accesorios Generales', icono: '🔧', orden: 3 },
      'belleza': { nombre: 'Belleza', icono: '💄', orden: 4 },
      'damas': { nombre: 'Belleza', icono: '💄', orden: 4 },
      'libros': { nombre: 'Libros', icono: '📚', orden: 5 },
      'peluqueria': { nombre: 'Peluquería', icono: '💇', orden: 6 }
    };

    // Crear o actualizar categorías
    console.log('📂 Creando/actualizando categorías...');
    const categorias = {};
    
    for (const [slug, info] of Object.entries(categoriasDefinidas)) {
      let categoria = await prisma.categoria.findUnique({
        where: { slug }
      });

      if (!categoria) {
        // Verificar si ya existe una categoría con el mismo nombre
        categoria = await prisma.categoria.findUnique({
          where: { nombre: info.nombre }
        });

        if (!categoria) {
          categoria = await prisma.categoria.create({
            data: {
              nombre: info.nombre,
              slug,
              icono: info.icono,
              orden: info.orden,
              activa: true
            }
          });
          console.log(`✅ Categoría creada: ${info.nombre} (${slug})`);
        } else {
          // Actualizar el slug si la categoría existe pero con diferente slug
          categoria = await prisma.categoria.update({
            where: { id: categoria.id },
            data: {
              icono: info.icono,
              orden: info.orden
            }
          });
          console.log(`✅ Categoría actualizada: ${info.nombre}`);
        }
      } else {
        // Actualizar información existente
        categoria = await prisma.categoria.update({
          where: { id: categoria.id },
          data: {
            icono: info.icono,
            orden: info.orden
          }
        });
        console.log(`✅ Categoría actualizada: ${info.nombre} (${slug})`);
      }

      categorias[slug] = categoria;
    }

    // Leer archivos JSON y mapear productos a categorías
    const jsonFiles = [
      'celulares.json',
      'computadoras.json', 
      'generales.json',
      'damas.json',
      'librosnuevos.json',
      'librosusados.json',
      'peluqueria.json',
      'accesoriosDestacados.json',
      'accesoriosNuevos.json',
      'productosRecientes.json'
    ];

    let productosActualizados = 0;

    for (const fileName of jsonFiles) {
      const filePath = path.join(process.cwd(), 'public', fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Archivo no encontrado: ${fileName}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      if (!fileContent.trim()) {
        console.log(`⚠️  Archivo vacío: ${fileName}`);
        continue;
      }

      try {
        const jsonData = JSON.parse(fileContent);
        let productos = [];

        // Extraer productos según la estructura del JSON
        if (jsonData.accesorios) {
          productos = jsonData.accesorios;
        } else if (jsonData.celulares) {
          productos = jsonData.celulares;
        } else if (jsonData.libros) {
          productos = jsonData.libros;
        } else if (Array.isArray(jsonData)) {
          productos = jsonData;
        }

        console.log(`📄 Procesando ${fileName}: ${productos.length} productos`);

        for (const producto of productos) {
          // Determinar categoría del archivo y del producto
          let categoriaSlug;
          
          if (producto.categoria) {
            categoriaSlug = producto.categoria;
          } else if (fileName.includes('celulares')) {
            categoriaSlug = 'celulares';
          } else if (fileName.includes('computadoras')) {
            categoriaSlug = 'computadoras';
          } else if (fileName.includes('damas')) {
            categoriaSlug = 'belleza';
          } else if (fileName.includes('libros')) {
            categoriaSlug = 'libros';
          } else if (fileName.includes('peluqueria')) {
            categoriaSlug = 'peluqueria';
          } else {
            categoriaSlug = 'generales';
          }

          // Buscar el producto por nombre y precio en la base de datos
          const productosEncontrados = await prisma.producto.findMany({
            where: {
              nombre: producto.nombre,
              precio: producto.precio || 0
            }
          });

          if (productosEncontrados.length > 0) {
            // Actualizar todos los productos encontrados con esta categoría
            for (const productoEncontrado of productosEncontrados) {
              await prisma.producto.update({
                where: { id: productoEncontrado.id },
                data: {
                  categoria: categoriaSlug
                }
              });
              productosActualizados++;
              console.log(`✅ Producto actualizado: ${producto.nombre} → ${categoriaSlug}`);
            }
          } else {
            console.log(`⚠️  Producto no encontrado en BD: ${producto.nombre}`);
          }
        }

      } catch (error) {
        console.error(`❌ Error procesando ${fileName}:`, error.message);
      }
    }

    // Resumen de categorías y productos
    console.log(`\n📊 Resumen de actualización:`);
    console.log(`✅ Productos actualizados: ${productosActualizados}`);
    
    // Mostrar productos por categoría
    for (const [slug, categoria] of Object.entries(categorias)) {
      const count = await prisma.producto.count({
        where: { categoria: slug }
      });
      console.log(`📦 ${categoria.nombre}: ${count} productos`);
    }

    console.log(`\n🎉 Actualización completada!`);
    
  } catch (error) {
    console.error('❌ Error en la actualización:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar actualización
if (require.main === module) {
  updateProductCategories()
    .then(() => {
      console.log('✅ Script de actualización finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { updateProductCategories };