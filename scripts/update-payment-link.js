/**
 * Script para agregar/actualizar el payment_link de productos en Supabase
 *
 * Uso:
 * node scripts/update-payment-link.js "ID_DEL_PRODUCTO" "https://checkout.nequi.wompi.co/l/xxx"
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  // Para scripts de servidor utiliza la SERVICE_ROLE_KEY (no exponer en el cliente)
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('🔐 Usando SUPABASE_SERVICE_ROLE_KEY para operaciones de escritura.');
} else {
  console.warn(
    '⚠️  Usando la ANON key. Las operaciones de escritura pueden fallar por Row Level Security (RLS).',
  );
}

async function updatePaymentLink(productId, paymentLink) {
  try {
    console.log(`\n🔍 Buscando producto con ID: ${productId}...`);

    // Obtener el producto actual
    const { data: producto, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (fetchError) {
      console.error("❌ Error al buscar el producto:", fetchError);
      return;
    }

    if (!producto) {
      console.error("❌ Producto no encontrado");
      return;
    }

    console.log(`✅ Producto encontrado: ${producto.nombre}`);

    // Obtener metadata actual o crear objeto vacío
    const metadata = producto.metadata || {};

    // Agregar/actualizar payment_link
    metadata.payment_link = paymentLink;

    console.log(`\n💾 Actualizando payment_link...`);

    // Actualizar el producto. Usamos .select() (sin .single()) y validamos el resultado
    const { data: updatedData, error: updateError } = await supabase
      .from("products")
      .update({ metadata })
      .eq("id", productId)
      .select();

    if (updateError) {
      console.error("❌ Error al actualizar:", updateError);
      return;
    }

    // Cuando no se actualiza ninguna fila, PostgREST puede devolver un array vacío.
    if (!updatedData || (Array.isArray(updatedData) && updatedData.length === 0)) {
      console.error(
        "❌ Actualización no afectó filas. Posible problema de permisos (RLS) o condición incorrecta.",
      );
      console.error(
        "Sugerencia: ejecuta el script con `SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local` o revisa las políticas de RLS en Supabase.",
      );
      return;
    }

    const updated = Array.isArray(updatedData) ? updatedData[0] : updatedData;

    console.log(`\n✅ ¡Payment link actualizado exitosamente!`);
    console.log(`\n📋 Detalles:`);
    console.log(`   ID: ${updated.id}`);
    console.log(`   Nombre: ${updated.nombre}`);
    console.log(`   Payment Link: ${updated.metadata?.payment_link}`);
  } catch (error) {
    console.error("❌ Error:", error && error.message ? error.message : error);
  }
}

// Función para buscar producto por nombre (si no sabes el ID)
async function findProductByName(searchName) {
  try {
    console.log(`\n🔍 Buscando productos que contengan: "${searchName}"...`);

    const { data: productos, error } = await supabase
      .from("products")
      .select("id, nombre, precio, categoria, metadata")
      .ilike("nombre", `%${searchName}%`);

    if (error) {
      console.error("❌ Error:", error);
      return;
    }

    if (!productos || productos.length === 0) {
      console.log("❌ No se encontraron productos");
      return;
    }

    console.log(`\n✅ Se encontraron ${productos.length} producto(s):\n`);

    productos.forEach((p, index) => {
      console.log(`${index + 1}. ${p.nombre}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Precio: $${p.precio}`);
      console.log(`   Categoría: ${p.categoria}`);
      console.log(
        `   Payment Link: ${p.metadata?.payment_link || "No configurado"}`,
      );
      console.log("");
    });

    return productos;
  } catch (error) {
    console.error("❌ Error:", error && error.message ? error.message : error);
  }
}

// Procesar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📦 Script para actualizar Payment Links de productos

Uso:

  1. Buscar producto por nombre:
     node scripts/update-payment-link.js buscar "Memoria USB"

  2. Actualizar payment link:
     node scripts/update-payment-link.js "ID_PRODUCTO" "https://checkout.nequi.wompi.co/l/xxx"

Ejemplos:
  node scripts/update-payment-link.js buscar "Memoria"
  node scripts/update-payment-link.js "tc53741c-862b-418d-9393-828ac7393b33" "https://checkout.nequi.wompi.co/l/wFfo89"
  `);
  process.exit(0);
}

if (args[0] === "buscar" && args[1]) {
  findProductByName(args[1]);
} else if (args.length === 2) {
  updatePaymentLink(args[0], args[1]);
} else {
  console.error(
    "❌ Argumentos inválidos. Usa: node scripts/update-payment-link.js --help",
  );
}
