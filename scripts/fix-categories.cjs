const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCategories() {
  try {
    console.log('🔧 Corrigiendo categorías de productos...');

    // Mapeo de categorías incorrectas a correctas
    const correcionCategorias = {
      'tecnologia': 'celulares',
      'accesorios': 'generales', 
      'computacion': 'computadoras',
      'computacio': 'computadoras',
      'computador': 'computadoras',
      'librosnuevos': 'libros',
      'librosusados': 'libros',
      'personal': 'generales',
      'damas': 'belleza'
    };

    let correccionesRealizadas = 0;

    for (const [categoriaIncorrecta, categoriaCorrecta] of Object.entries(correcionCategorias)) {
      const productosACorregir = await prisma.producto.findMany({
        where: {
          categoria: categoriaIncorrecta
        }
      });

      console.log(`📝 Encontrados ${productosACorregir.length} productos con categoría "${categoriaIncorrecta}"`);

      if (productosACorregir.length > 0) {
        await prisma.producto.updateMany({
          where: {
            categoria: categoriaIncorrecta
          },
          data: {
            categoria: categoriaCorrecta
          }
        });

        correccionesRealizadas += productosACorregir.length;
        console.log(`✅ Corregidos ${productosACorregir.length} productos: ${categoriaIncorrecta} → ${categoriaCorrecta}`);
      }
    }

    console.log(`\n📊 Resumen final por categoría:`);
    
    // Contar productos por cada categoría correcta
    const categoriasFinales = ['celulares', 'computadoras', 'generales', 'belleza', 'libros', 'peluqueria'];
    
    for (const categoria of categoriasFinales) {
      const count = await prisma.producto.count({
        where: { categoria }
      });
      console.log(`📦 ${categoria}: ${count} productos`);
    }

    console.log(`\n🎉 Corrección completada! Total de productos corregidos: ${correccionesRealizadas}`);
    
  } catch (error) {
    console.error('❌ Error en la corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar corrección
if (require.main === module) {
  fixCategories()
    .then(() => {
      console.log('✅ Script de corrección finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { fixCategories };