const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStoreStatus() {
  console.log('🚀 Configurando tabla StoreStatus en Supabase...\n');

  try {
    // Crear la tabla usando una consulta SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Crear tabla para estado de la tienda
        CREATE TABLE IF NOT EXISTS "StoreStatus" (
          id SERIAL PRIMARY KEY,
          is_open BOOLEAN NOT NULL DEFAULT true,
          manual_override BOOLEAN NOT NULL DEFAULT false,
          override_until TIMESTAMP WITH TIME ZONE,
          open_time TIME NOT NULL DEFAULT '08:00:00',
          close_time TIME NOT NULL DEFAULT '18:00:00',
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_by TEXT
        );

        -- Crear índice para mejorar rendimiento
        CREATE INDEX IF NOT EXISTS idx_store_status_updated_at ON "StoreStatus" (updated_at DESC);

        -- Habilitar Row Level Security (RLS)
        ALTER TABLE "StoreStatus" ENABLE ROW LEVEL SECURITY;

        -- Eliminar políticas existentes si existen
        DROP POLICY IF EXISTS "Anyone can read store status" ON "StoreStatus";
        DROP POLICY IF EXISTS "Authenticated users can update store status" ON "StoreStatus";

        -- Política de lectura: todos pueden leer el estado de la tienda
        CREATE POLICY "Anyone can read store status"
          ON "StoreStatus"
          FOR SELECT
          TO public
          USING (true);

        -- Política de escritura: solo usuarios autenticados pueden actualizar
        CREATE POLICY "Authenticated users can update store status"
          ON "StoreStatus"
          FOR UPDATE
          TO authenticated
          USING (true)
          WITH CHECK (true);

        -- Crear función para actualizar automáticamente updated_at
        CREATE OR REPLACE FUNCTION update_store_status_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Eliminar trigger si existe
        DROP TRIGGER IF EXISTS update_store_status_timestamp ON "StoreStatus";

        -- Crear trigger para actualizar updated_at automáticamente
        CREATE TRIGGER update_store_status_timestamp
          BEFORE UPDATE ON "StoreStatus"
          FOR EACH ROW
          EXECUTE FUNCTION update_store_status_timestamp();
      `
    });

    if (error) {
      throw error;
    }

    console.log('✅ Tabla StoreStatus creada exitosamente');

    // Insertar el estado inicial
    const { data: insertData, error: insertError } = await supabase
      .from('StoreStatus')
      .upsert({
        id: 1,
        is_open: true,
        manual_override: false,
        open_time: '08:00:00',
        close_time: '18:00:00'
      }, {
        onConflict: 'id'
      });

    if (insertError) {
      console.log('ℹ️ Intentando insertar estado inicial de otra manera...');

      // Intento alternativo de inserción
      const { error: altInsertError } = await supabase
        .from('StoreStatus')
        .insert({
          is_open: true,
          manual_override: false,
          open_time: '08:00:00',
          close_time: '18:00:00'
        });

      if (altInsertError && !altInsertError.message.includes('duplicate')) {
        console.warn('⚠️ Error al insertar estado inicial:', altInsertError.message);
      } else {
        console.log('✅ Estado inicial de la tienda configurado');
      }
    } else {
      console.log('✅ Estado inicial de la tienda configurado');
    }

    console.log('\n✨ Configuración completada exitosamente!');
    console.log('\n📋 Detalles de la tabla:');
    console.log('   - Horario por defecto: 8:00 AM - 6:00 PM');
    console.log('   - Estado inicial: Abierta');
    console.log('   - Permisos: Lectura pública, escritura solo autenticados');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setupStoreStatus();
