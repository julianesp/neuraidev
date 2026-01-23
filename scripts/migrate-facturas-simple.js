// Script para ejecutar migración de facturas y clientes
// Uso: node scripts/migrate-facturas-simple.js

const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Migración: Sistema de Facturas y Clientes    ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    console.log('📦 Preparando migración...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../supabase/migrations/create_facturas_clientes.sql');

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Archivo SQL no encontrado: ${sqlPath}`);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Archivo SQL leído correctamente');
    console.log('📊 Tamaño del archivo:', (sql.length / 1024).toFixed(2), 'KB\n');

    console.log('🔍 Instrucciones:\n');
    console.log('Para ejecutar esta migración, tienes 2 opciones:\n');

    console.log('Opción 1 - Panel de Supabase (RECOMENDADO):');
    console.log('  1. Ve a https://supabase.com/dashboard');
    console.log('  2. Selecciona tu proyecto');
    console.log('  3. Ve a "SQL Editor" en el menú lateral');
    console.log('  4. Haz clic en "New Query"');
    console.log('  5. Copia y pega el contenido del archivo:');
    console.log('     supabase/migrations/create_facturas_clientes.sql');
    console.log('  6. Haz clic en "Run"\n');

    console.log('Opción 2 - Supabase CLI:');
    console.log('  npx supabase db push\n');

    console.log('📋 Esta migración creará:\n');
    console.log('  ✓ Tabla "clientes" para gestión de clientes frecuentes');
    console.log('  ✓ Tabla "facturas" para almacenamiento de facturas');
    console.log('  ✓ Índices para búsquedas rápidas');
    console.log('  ✓ Triggers para actualización automática de estadísticas');
    console.log('  ✓ Sistema de niveles de fidelidad (bronce, plata, oro, platino)');
    console.log('  ✓ Cálculo automático de descuentos\n');

    console.log('🎯 Características del sistema:\n');
    console.log('  🥉 Bronce: < $500,000 (0% descuento)');
    console.log('  🥈 Plata: $500,000 - $1,999,999 (5% descuento)');
    console.log('  🥇 Oro: $2,000,000 - $4,999,999 (10% descuento)');
    console.log('  💎 Platino: ≥ $5,000,000 (15% descuento)\n');

    console.log('📖 Para más información, lee: SISTEMA-FACTURAS-CLIENTES.md\n');

    // Guardar el SQL en un archivo temporal para fácil acceso
    const tempPath = path.join(__dirname, '../migration-temp.sql');
    fs.writeFileSync(tempPath, sql);
    console.log('✅ SQL guardado temporalmente en: migration-temp.sql');
    console.log('   (puedes copiar el contenido de este archivo al SQL Editor)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
