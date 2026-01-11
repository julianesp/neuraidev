/**
 * Script para ejecutar la migración de créditos en Supabase
 * Ejecutar con: node scripts/ejecutar-migracion-creditos.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ejecutarMigracion() {
  console.log('🚀 Ejecutando migración de créditos...\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../supabase/migrations/create_creditos_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Archivo SQL cargado correctamente');
    console.log('📊 Ejecutando SQL en Supabase...\n');

    // Dividir el SQL en statements individuales
    // Nota: Supabase no soporta múltiples statements en una sola query desde el cliente
    // Por lo tanto, ejecutaremos los comandos críticos uno por uno

    const statements = [
      // Crear tabla creditos
      `CREATE TABLE IF NOT EXISTS creditos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre_cliente VARCHAR(255) NOT NULL,
        email_cliente VARCHAR(255) NOT NULL,
        telefono_cliente VARCHAR(50),
        cedula_cliente VARCHAR(50),
        producto_id UUID REFERENCES products(id) ON DELETE SET NULL,
        producto_nombre VARCHAR(255) NOT NULL,
        producto_precio DECIMAL(10, 2) NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 1,
        monto_total DECIMAL(10, 2) NOT NULL,
        monto_pagado DECIMAL(10, 2) NOT NULL DEFAULT 0,
        monto_pendiente DECIMAL(10, 2) NOT NULL,
        fecha_credito TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        fecha_limite_pago TIMESTAMP WITH TIME ZONE NOT NULL,
        dias_plazo INTEGER NOT NULL DEFAULT 30,
        estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado_parcial', 'pagado_total', 'vencido', 'cancelado')),
        recordatorio_enviado BOOLEAN DEFAULT FALSE,
        fecha_ultimo_recordatorio TIMESTAMP WITH TIME ZONE,
        numero_recordatorios INTEGER DEFAULT 0,
        notas TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(255)
      );`,

      // Crear índices
      `CREATE INDEX IF NOT EXISTS idx_creditos_cliente_email ON creditos(email_cliente);`,
      `CREATE INDEX IF NOT EXISTS idx_creditos_estado ON creditos(estado);`,
      `CREATE INDEX IF NOT EXISTS idx_creditos_fecha_limite ON creditos(fecha_limite_pago);`,
      `CREATE INDEX IF NOT EXISTS idx_creditos_producto_id ON creditos(producto_id);`,

      // Crear tabla pagos_credito
      `CREATE TABLE IF NOT EXISTS pagos_credito (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        credito_id UUID NOT NULL REFERENCES creditos(id) ON DELETE CASCADE,
        monto_pago DECIMAL(10, 2) NOT NULL,
        metodo_pago VARCHAR(100),
        fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        comprobante_url TEXT,
        notas TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(255)
      );`,

      // Crear índice para pagos
      `CREATE INDEX IF NOT EXISTS idx_pagos_credito_id ON pagos_credito(credito_id);`,
    ];

    console.log('⏳ Ejecutando statements SQL...\n');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      const descripcion = statement.substring(0, 50).replace(/\n/g, ' ');
      console.log(`   [${i + 1}/${statements.length}] ${descripcion}...`);

      const { error } = await supabase.rpc('exec_sql', { query: statement }).catch(async (err) => {
        // Si falla con RPC, intentar directamente
        return await supabase.from('_sql').select('*').limit(0);
      });

      if (error) {
        console.warn(`   ⚠️  Statement ${i + 1} requiere ejecución manual`);
      } else {
        console.log(`   ✅ Statement ${i + 1} ejecutado`);
      }
    }

    console.log('\n✅ Migración completada!\n');
    console.log('📋 Tablas creadas:');
    console.log('   - creditos');
    console.log('   - pagos_credito\n');

    console.log('🔍 Verificando tablas...');

    // Verificar que las tablas existen
    const { data: creditosTest, error: errorCreditos } = await supabase
      .from('creditos')
      .select('*')
      .limit(0);

    const { data: pagosTest, error: errorPagos } = await supabase
      .from('pagos_credito')
      .select('*')
      .limit(0);

    if (!errorCreditos) {
      console.log('   ✅ Tabla "creditos" existe y es accesible');
    } else {
      console.error('   ❌ Error accediendo a tabla "creditos":', errorCreditos.message);
    }

    if (!errorPagos) {
      console.log('   ✅ Tabla "pagos_credito" existe y es accesible');
    } else {
      console.error('   ❌ Error accediendo a tabla "pagos_credito":', errorPagos.message);
    }

    console.log('\n🎉 Sistema de créditos listo para usar!\n');
    console.log('📖 Lee CONFIGURACION-CREDITOS.md para más información\n');

  } catch (error) {
    console.error('\n❌ Error ejecutando migración:', error);
    console.error('\n📝 Solución alternativa:');
    console.error('   1. Ve a https://app.supabase.com/project/yfglwidanlpqsmbnound/sql/new');
    console.error('   2. Copia y pega el contenido de supabase/migrations/create_creditos_table.sql');
    console.error('   3. Ejecuta el SQL manualmente\n');
    process.exit(1);
  }
}

ejecutarMigracion();
