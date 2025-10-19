/**
 * Script de migración de productos de archivos JSON a Supabase
 * Ejecutar: node scripts/migrate-json-to-supabase.js
 */

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de archivos JSON a categorías
const archivosCategoria = {
  'celulares.json': 'celulares',
  'computadoras.json': 'computadoras',
  'damas.json': 'damas',
  'libros-nuevos.json': 'libros-nuevos',
  'libros-usados.json': 'libros-usados',
  'generales.json': 'generales'
};

/**
 * Transforma un producto del formato JSON al formato de Supabase
 */
function transformarProducto(producto, categoria) {
  // Extraer URLs de imágenes
  const imagenes = producto.imagenes?.map(img =>
    typeof img === 'object' ? img.url : img
  ) || [];

  // Extraer número de garantía si es un string
  let garantia = null;
  if (producto.garantia) {
    if (typeof producto.garantia === 'number') {
      garantia = producto.garantia;
    } else if (typeof producto.garantia === 'string') {
      // Buscar el primer número en el string
      const match = producto.garantia.match(/\d+/);
      garantia = match ? parseInt(match[0]) : null;
    }
  }

  return {
    // ID personalizado (string) - Supabase generará UUID si no se proporciona
    // Guardamos el ID original en metadata
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: parseFloat(producto.precio) || 0,
    precio_oferta: producto.precioAnterior ? parseFloat(producto.precioAnterior) : null,
    categoria: categoria,
    subcategoria: producto.subcategoria || null,
    imagenes: imagenes,
    imagen_principal: producto.imagenPrincipal || imagenes[0] || null,
    stock: producto.cantidad || producto.stock || 0,
    sku: producto.id?.toString() || null,
    activo: producto.disponible !== false,
    destacado: producto.destacado === true,
    marca: producto.marca || null,
    garantia: garantia,
    estado: producto.estado || 'nuevo',
    disponible: producto.disponible !== false,
    fecha_ingreso: producto.fechaIngreso || new Date().toISOString().split('T')[0],
    cantidad: producto.cantidad || producto.stock || 0,
    store_id: null, // NULL para la tienda principal
    metadata: {
      id_original: producto.id,
      caracteristicas: producto.caracteristicas || [],
      especificaciones: producto.especificaciones || {},
      // Guardar cualquier otro campo adicional
      ...Object.keys(producto).reduce((acc, key) => {
        const camposExcluidos = [
          'id', 'nombre', 'descripcion', 'precio', 'precioAnterior',
          'categoria', 'imagenes', 'imagenPrincipal', 'cantidad', 'stock',
          'disponible', 'destacado', 'marca', 'garantia', 'estado', 'fechaIngreso'
        ];
        if (!camposExcluidos.includes(key)) {
          acc[key] = producto[key];
        }
        return acc;
      }, {})
    }
  };
}

/**
 * Migra productos de un archivo JSON
 */
async function migrarArchivo(nombreArchivo, categoria) {
  console.log(`\n📂 Procesando ${nombreArchivo}...`);

  try {
    const rutaArchivo = path.join(process.cwd(), 'public', nombreArchivo);
    const contenido = await fs.readFile(rutaArchivo, 'utf-8');
    const data = JSON.parse(contenido);

    const productos = data.accesorios || [];
    console.log(`   Encontrados ${productos.length} productos`);

    if (productos.length === 0) {
      console.log('   ⚠️  No hay productos para migrar');
      return { exito: 0, errores: 0 };
    }

    // Transformar productos
    const productosTransformados = productos.map(p => transformarProducto(p, categoria));

    // Insertar en Supabase en lotes de 100
    const BATCH_SIZE = 100;
    let exito = 0;
    let errores = 0;

    for (let i = 0; i < productosTransformados.length; i += BATCH_SIZE) {
      const lote = productosTransformados.slice(i, i + BATCH_SIZE);

      const { data: insertados, error } = await supabase
        .from('products')
        .insert(lote)
        .select();

      if (error) {
        console.error(`   ❌ Error insertando lote ${i / BATCH_SIZE + 1}:`, error.message);
        errores += lote.length;
      } else {
        exito += insertados.length;
        console.log(`   ✅ Insertados ${insertados.length} productos (lote ${i / BATCH_SIZE + 1})`);
      }
    }

    return { exito, errores };

  } catch (error) {
    console.error(`   ❌ Error procesando ${nombreArchivo}:`, error.message);
    return { exito: 0, errores: 0 };
  }
}

/**
 * Función principal de migración
 */
async function migrarTodo() {
  console.log('🚀 Iniciando migración de productos a Supabase...\n');

  let totalExito = 0;
  let totalErrores = 0;

  // Preguntar si quiere limpiar la tabla primero
  console.log('⚠️  ¿Deseas limpiar la tabla products antes de migrar? (esto borrará todos los productos existentes)');
  console.log('   Para limpiar, ejecuta manualmente en Supabase SQL Editor:');
  console.log('   DELETE FROM products WHERE store_id IS NULL;\n');

  // Migrar cada archivo
  for (const [archivo, categoria] of Object.entries(archivosCategoria)) {
    const resultado = await migrarArchivo(archivo, categoria);
    totalExito += resultado.exito;
    totalErrores += resultado.errores;
  }

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Productos migrados exitosamente: ${totalExito}`);
  console.log(`❌ Errores: ${totalErrores}`);
  console.log('='.repeat(50) + '\n');

  if (totalExito > 0) {
    console.log('🎉 ¡Migración completada!');
    console.log('\nPróximos pasos:');
    console.log('1. Verifica los datos en Supabase Dashboard');
    console.log('2. Actualiza los servicios para usar Supabase en lugar de JSON');
    console.log('3. Crea la página de dashboard para gestionar productos\n');
  }
}

// Ejecutar migración
migrarTodo().catch(console.error);
