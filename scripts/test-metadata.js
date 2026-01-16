/**
 * Script para validar metadata de Open Graph en páginas de productos
 *
 * Uso: node scripts/test-metadata.js
 *
 * Este script prueba que la metadata se genera correctamente para productos
 */

import { generateStaticProductMetadata } from '../utils/staticMetadata.js';

const COLORES = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
};

async function testMetadata() {
  console.log(`\n${COLORES.CYAN}🔍 Validando Metadata de Open Graph${COLORES.RESET}\n`);

  // Lista de productos de prueba (categoria, slug)
  const testCases = [
    { categoria: 'computadoras', slug: 'mouse-inalambrico-usb-bluethooth-ac62a01d-b7a5-4cac-a1ac-85dc907ec537' },
    { categoria: 'celulares', slug: 'funda-protectora-ejemplo' }, // Slug de ejemplo
  ];

  let pasadas = 0;
  let fallidas = 0;

  for (const testCase of testCases) {
    console.log(`${COLORES.BLUE}📦 Probando: ${testCase.categoria} / ${testCase.slug}${COLORES.RESET}`);

    try {
      const metadata = await generateStaticProductMetadata(testCase.categoria, testCase.slug);

      // Validaciones
      const checks = [
        { name: 'Tiene título', valid: !!metadata.title },
        { name: 'Tiene descripción', valid: !!metadata.description },
        { name: 'Tiene Open Graph', valid: !!metadata.openGraph },
        { name: 'OG tiene imagen', valid: !!metadata.openGraph?.images?.[0]?.url },
        { name: 'OG tipo es product', valid: metadata.openGraph?.type === 'product' },
        { name: 'Tiene Twitter Card', valid: !!metadata.twitter },
        { name: 'Twitter tiene imagen', valid: !!metadata.twitter?.images?.[0] },
        { name: 'Tiene precio en metadata', valid: !!metadata.other?.['product:price:amount'] },
      ];

      let allPassed = true;

      for (const check of checks) {
        if (check.valid) {
          console.log(`  ${COLORES.GREEN}✓${COLORES.RESET} ${check.name}`);
        } else {
          console.log(`  ${COLORES.RED}✗${COLORES.RESET} ${check.name}`);
          allPassed = false;
        }
      }

      if (allPassed) {
        console.log(`\n  ${COLORES.GREEN}✅ Metadata correcta${COLORES.RESET}`);
        pasadas++;
      } else {
        console.log(`\n  ${COLORES.RED}❌ Metadata incompleta${COLORES.RESET}`);
        fallidas++;
      }

      // Mostrar datos generados
      console.log(`\n  ${COLORES.CYAN}Datos generados:${COLORES.RESET}`);
      console.log(`  Título: ${metadata.title}`);
      console.log(`  Descripción: ${metadata.description?.substring(0, 80)}...`);
      console.log(`  Imagen OG: ${metadata.openGraph?.images?.[0]?.url?.substring(0, 60)}...`);
      console.log(`  Precio: ${metadata.other?.['product:price:amount']} ${metadata.other?.['product:price:currency']}`);
      console.log(`  Disponibilidad: ${metadata.other?.['product:availability']}`);

    } catch (error) {
      console.log(`  ${COLORES.RED}❌ Error: ${error.message}${COLORES.RESET}`);
      fallidas++;
    }

    console.log('\n' + '─'.repeat(80) + '\n');
  }

  // Resumen
  console.log(`${COLORES.CYAN}📊 Resumen de Pruebas${COLORES.RESET}`);
  console.log(`  ${COLORES.GREEN}✓ Pasadas: ${pasadas}${COLORES.RESET}`);
  console.log(`  ${COLORES.RED}✗ Fallidas: ${fallidas}${COLORES.RESET}`);
  console.log(`  Total: ${pasadas + fallidas}\n`);

  // Instrucciones
  console.log(`${COLORES.YELLOW}💡 Próximos pasos:${COLORES.RESET}`);
  console.log(`  1. Despliega a producción: ${COLORES.CYAN}vercel --prod${COLORES.RESET}`);
  console.log(`  2. Valida en Facebook: ${COLORES.CYAN}https://developers.facebook.com/tools/debug/${COLORES.RESET}`);
  console.log(`  3. Valida en Twitter: ${COLORES.CYAN}https://cards-dev.twitter.com/validator${COLORES.RESET}`);
  console.log(`  4. Prueba compartir en WhatsApp\n`);

  process.exit(fallidas > 0 ? 1 : 0);
}

testMetadata();
