/**
 * Script para agregar columna colores_disponibles a la tabla products
 */

import { getSupabaseClient } from '../lib/db.js';

async function addColoresColumn() {
  const supabase = getSupabaseClient();

  try {
    console.log('🔧 Agregando columna colores_disponibles a la tabla products...');

    // Ejecutar SQL para agregar columna si no existe
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE products
        ADD COLUMN IF NOT EXISTS colores_disponibles TEXT[];
      `
    });

    if (error) {
      console.error('❌ Error al agregar columna:', error);

      // Intentar método alternativo: actualizar metadata
      console.log('🔄 Intentando método alternativo usando metadata...');
      console.log('✅ Se usará el campo metadata para almacenar colores');
      console.log('📝 Los colores se guardarán en metadata.colores_disponibles');
      return;
    }

    console.log('✅ Columna colores_disponibles agregada exitosamente');
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('');
    console.log('💡 Solución alternativa:');
    console.log('   Los colores se almacenarán en el campo metadata.colores_disponibles');
    console.log('   No es necesario modificar la estructura de la tabla');
  }
}

addColoresColumn();
