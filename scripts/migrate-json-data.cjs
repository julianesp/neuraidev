const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateJsonData() {
  try {
    console.log('🚀 Iniciando migración de datos JSON...');
    
    // Obtener la tienda por defecto o crear una
    let tienda = await prisma.tienda.findFirst();
    if (!tienda) {
      tienda = await prisma.tienda.create({
        data: {
          nombre: 'NeuraIDev Store',
          descripcion: 'Tienda principal de NeuraIDev',
          direccion: 'Online',
          telefono: '+57 300 000 0000',
          email: 'info@neuraidev.com',
          activa: true
        }
      });
      console.log('✅ Tienda creada:', tienda.nombre);
    }

    // Mapeo de categorías JSON a base de datos
    const categoriaMap = {
      'computadoras': 'computadoras',
      'celulares': 'celulares',
      'generales': 'generales',
      'belleza': 'belleza',
      'damas': 'belleza',
      'libros': 'libros',
      'peluqueria': 'peluqueria'
    };

    // Crear categorías si no existen
    const categorias = {};
    for (const [jsonCat, dbCat] of Object.entries(categoriaMap)) {
      let categoria = await prisma.categoria.findUnique({
        where: { slug: jsonCat }
      });
      
      if (!categoria) {
        // Verificar también por nombre para evitar duplicados
        const categoriaExistente = await prisma.categoria.findUnique({
          where: { nombre: dbCat.charAt(0).toUpperCase() + dbCat.slice(1) }
        });
        
        if (categoriaExistente) {
          categoria = categoriaExistente;
        } else {
          categoria = await prisma.categoria.create({
            data: {
              nombre: dbCat.charAt(0).toUpperCase() + dbCat.slice(1),
              slug: jsonCat,
              icono: '📦',
              activa: true
            }
          });
        }
      }
      categorias[jsonCat] = dbCat;
    }

    console.log('✅ Categorías preparadas');

    // Archivos JSON a procesar
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

    let totalProductos = 0;

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
          // Determinar categoría
          let categoria;
          if (producto.categoria) {
            categoria = categorias[producto.categoria] || categorias['generales'];
          } else if (fileName.includes('celulares')) {
            categoria = categorias['celulares'];
          } else if (fileName.includes('computadoras')) {
            categoria = categorias['computadoras'];
          } else if (fileName.includes('damas')) {
            categoria = categorias['belleza'];
          } else if (fileName.includes('libros')) {
            categoria = categorias['libros'];
          } else if (fileName.includes('peluqueria')) {
            categoria = categorias['peluqueria'];
          } else {
            categoria = categorias['generales'];
          }

          // Verificar si el producto ya existe (por nombre y precio)
          const productoExistente = await prisma.producto.findFirst({
            where: {
              nombre: producto.nombre,
              precio: producto.precio || 0
            }
          });

          if (productoExistente) {
            console.log(`⏭️  Producto ya existe: ${producto.nombre}`);
            continue;
          }

          // Crear el producto
          const nuevoProducto = await prisma.producto.create({
            data: {
              nombre: producto.nombre,
              descripcion: producto.descripcion || '',
              precio: producto.precio || 0,
              categoria: categoria,
              imagenPrincipal: producto.imagenPrincipal || (producto.imagenes && producto.imagenes.length > 0 ? (producto.imagenes[0].url || producto.imagenes[0]) : null),
              stock: producto.cantidad || producto.stock || 1,
              sku: `${fileName.split('.')[0].toUpperCase()}-${producto.id || Date.now()}`,
              condicion: producto.estado || 'nuevo',
              destacado: producto.destacado || false,
              disponible: producto.disponible !== false,
              marca: producto.marca || 'Sin marca',
              tiendaId: tienda.id
            }
          });

          // Agregar imágenes si existen
          if (producto.imagenes && producto.imagenes.length > 0) {
            for (let i = 0; i < producto.imagenes.length; i++) {
              await prisma.productoImagen.create({
                data: {
                  url: producto.imagenes[i].url || producto.imagenes[i],
                  alt: producto.nombre,
                  orden: i,
                  productoId: nuevoProducto.id
                }
              });
            }
          } else if (producto.imagenPrincipal) {
            await prisma.productoImagen.create({
              data: {
                url: producto.imagenPrincipal,
                alt: producto.nombre,
                orden: 0,
                productoId: nuevoProducto.id
              }
            });
          }

          totalProductos++;
          console.log(`✅ Producto creado: ${producto.nombre} (ID: ${nuevoProducto.id})`);
        }
      } catch (error) {
        console.error(`❌ Error procesando ${fileName}:`, error.message);
      }
    }

    console.log(`\n🎉 Migración completada!`);
    console.log(`📊 Total de productos migrados: ${totalProductos}`);
    console.log(`🏪 Tienda: ${tienda.nombre}`);
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateJsonData()
    .then(() => {
      console.log('✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateJsonData };