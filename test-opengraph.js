/**
 * Script para verificar los meta tags Open Graph de productos
 * Este script verifica que los meta tags se generen correctamente
 */

import 'dotenv/config';
import { generateProductMetadata } from './utils/productMetadata.js';

async function testOpenGraph() {
  console.log('🔍 Verificando meta tags Open Graph...\n');

  // Producto específico del usuario
  const slug = 'cargador-rapido-pd-20w-con-cable-usb-c-a-c-1-metro';
  const categoria = 'celulares';

  try {
    const metadata = await generateProductMetadata(slug, categoria);

    console.log('=== Metadatos generados ===\n');
    console.log('Título:', metadata.title);
    console.log('Descripción:', metadata.description);
    console.log('\n=== Open Graph ===');
    console.log('OG Title:', metadata.openGraph.title);
    console.log('OG Description:', metadata.openGraph.description);
    console.log('OG URL:', metadata.openGraph.url);
    console.log('OG Locale:', metadata.openGraph.locale);
    console.log('\n=== Imágenes Open Graph ===');
    metadata.openGraph.images.forEach((img, idx) => {
      console.log(`\nImagen ${idx + 1}:`);
      console.log('  URL:', img.url);
      console.log('  Secure URL:', img.secureUrl);
      console.log('  Width:', img.width);
      console.log('  Height:', img.height);
      console.log('  Type:', img.type);
      console.log('  Alt:', img.alt);
    });

    console.log('\n=== Twitter Card ===');
    console.log('Card:', metadata.twitter.card);
    console.log('Title:', metadata.twitter.title);
    console.log('Images:', metadata.twitter.images);

    console.log('\n✅ Meta tags generados correctamente!');

    // Verificar que la imagen principal no tenga espacios sin codificar
    const imagenPrincipal = metadata.openGraph.images[0].url;
    if (imagenPrincipal.includes(' ')) {
      console.error('\n❌ ERROR: La URL de la imagen contiene espacios sin codificar');
    } else if (imagenPrincipal.includes('%20')) {
      console.log('\n✅ URLs correctamente codificadas (espacios como %20)');
    }

    // Verificar que tenga secureUrl
    if (metadata.openGraph.images[0].secureUrl) {
      console.log('✅ secureUrl presente (requerido por WhatsApp)');
    } else {
      console.error('❌ ERROR: secureUrl no está presente');
    }

  } catch (error) {
    console.error('❌ Error al generar metadatos:', error);
  }
}

testOpenGraph();
