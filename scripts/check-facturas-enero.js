import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFacturasEnero() {
  try {
    console.log('🔍 Consultando TODAS las facturas en la base de datos...\n');

    // Consultar TODAS las facturas sin filtros
    const { data: todasFacturas, error: errorTodas } = await supabase
      .from('facturas')
      .select('*')
      .order('fecha', { ascending: false });

    if (errorTodas) {
      console.error('❌ Error consultando facturas:', errorTodas);
      return;
    }

    console.log(`📊 Total de facturas en la base de datos: ${todasFacturas.length}\n`);

    if (todasFacturas.length > 0) {
      console.log('📋 Listado de TODAS las facturas:\n');
      todasFacturas.forEach((f, index) => {
        const fecha = new Date(f.fecha);
        console.log(`${index + 1}. ${f.numero_factura}`);
        console.log(`   Cliente: ${f.cliente_nombre}`);
        console.log(`   Fecha: ${fecha.toLocaleDateString('es-CO')} ${fecha.toLocaleTimeString('es-CO')}`);
        console.log(`   Total: $${parseFloat(f.total).toLocaleString('es-CO')}`);
        console.log(`   Método: ${f.metodo_pago}`);
        console.log('');
      });
    }

    // Filtrar facturas de enero 2026 manualmente
    const facturasEnero = todasFacturas.filter(f => {
      const fecha = new Date(f.fecha);
      return fecha.getFullYear() === 2026 && fecha.getMonth() === 0; // Enero = mes 0
    });

    console.log(`\n🗓️  Facturas de ENERO 2026: ${facturasEnero.length}\n`);

    if (facturasEnero.length > 0) {
      facturasEnero.forEach((f, index) => {
        console.log(`${index + 1}. ${f.numero_factura} - ${f.cliente_nombre} - $${parseFloat(f.total).toLocaleString('es-CO')}`);
      });
    } else {
      console.log('⚠️  No se encontraron facturas de enero 2026');
    }

    // Consultar con el filtro de la API (como lo hace la aplicación)
    console.log('\n\n🔍 Consultando con filtro de mes "2026-01" (como lo hace la API)...\n');

    const mes = '2026-01';
    const [year, month] = mes.split('-');
    const firstDay = `${year}-${month}-01T00:00:00`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    const lastDayStr = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}T23:59:59`;

    console.log(`Rango de fechas:`);
    console.log(`  Inicio: ${firstDay}`);
    console.log(`  Fin: ${lastDayStr}\n`);

    const { data: facturasAPI, error: errorAPI } = await supabase
      .from('facturas')
      .select('*')
      .gte('fecha', firstDay)
      .lte('fecha', lastDayStr)
      .order('fecha', { ascending: false });

    if (errorAPI) {
      console.error('❌ Error con filtro de API:', errorAPI);
    } else {
      console.log(`✅ Facturas encontradas con filtro API: ${facturasAPI.length}\n`);
      if (facturasAPI.length > 0) {
        facturasAPI.forEach((f, index) => {
          console.log(`${index + 1}. ${f.numero_factura} - ${f.cliente_nombre} - Fecha: ${f.fecha}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkFacturasEnero();
