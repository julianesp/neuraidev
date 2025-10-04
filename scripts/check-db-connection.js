const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkConnection() {
  try {
    console.log('🔍 Verificando conexión a la base de datos...\n');

    // Test connection
    await prisma.$connect();
    console.log('✅ Conexión exitosa!\n');

    // Get database info
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('📊 Información de la base de datos:');
    console.log(result);
    console.log('\n');

    // Count products
    const productCount = await prisma.producto.count();
    console.log(`📦 Total de productos: ${productCount}`);

    // Count images
    const imageCount = await prisma.productoImagen.count();
    console.log(`🖼️  Total de imágenes: ${imageCount}`);

    // Count stores
    const storeCount = await prisma.tienda.count();
    console.log(`🏪 Total de tiendas: ${storeCount}`);

    console.log('\n✨ Todo está funcionando correctamente!\n');

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkConnection();
