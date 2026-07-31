/**
 * Generador de facturas en PDF usando PDFKit
 * Este módulo crea facturas electrónicas profesionales para las ventas
 */

import PDFDocument from 'pdfkit';

/**
 * Genera el siguiente número de factura secuencial
 * @param {number} lastInvoiceId - ID de la última factura
 * @returns {string} Número de factura formateado (ej: FAC-2024-00001)
 */
export function generateInvoiceNumber(lastInvoiceId = 0) {
  const year = new Date().getFullYear();
  const sequential = String(lastInvoiceId + 1).padStart(5, '0');
  return `FAC-${year}-${sequential}`;
}

/**
 * Formatea un número como moneda colombiana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada (ej: $1.234.567)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha en formato colombiano
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada (ej: 16 de diciembre de 2024)
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Genera un PDF de factura electrónica
 * @param {Object} invoiceData - Datos de la factura
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      // Crear nuevo documento PDF
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 50,
      });

      // Buffer para almacenar el PDF
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Configuración de colores
      const primaryColor = '#2563eb'; // Azul
      const textColor = '#1f2937'; // Gris oscuro
      const lightGray = '#f3f4f6';

      // ========== ENCABEZADO ==========
      // Logo o nombre de la empresa (puedes reemplazar con un logo real)
      doc
        .fontSize(24)
        .fillColor(primaryColor)
        .text('NEURAI.DEV', 50, 50, { bold: true });

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('Tienda Online', 50, 80)
        .text('NIT: 123456789-0', 50, 95)
        .text('contacto@neurai.dev', 50, 110)
        .text('https://neurai.dev', 50, 125);

      // Título de factura
      doc
        .fontSize(20)
        .fillColor(primaryColor)
        .text('FACTURA ELECTRÓNICA', 350, 50, { align: 'right' });

      // Número de factura
      doc
        .fontSize(12)
        .fillColor(textColor)
        .text(`No. ${invoiceData.invoice_number}`, 350, 80, { align: 'right' })
        .text(`Fecha: ${formatDate(invoiceData.issued_at)}`, 350, 100, { align: 'right' })
        .text(`Referencia: ${invoiceData.order_reference}`, 350, 120, { align: 'right' });

      // Línea divisoria
      doc
        .moveTo(50, 160)
        .lineTo(562, 160)
        .strokeColor(primaryColor)
        .lineWidth(2)
        .stroke();

      // ========== INFORMACIÓN DEL CLIENTE ==========
      let yPosition = 180;

      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('INFORMACIÓN DEL CLIENTE', 50, yPosition);

      yPosition += 20;

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text(`Nombre: ${invoiceData.customer_name}`, 50, yPosition);

      yPosition += 15;
      doc.text(`Email: ${invoiceData.customer_email}`, 50, yPosition);

      if (invoiceData.customer_phone) {
        yPosition += 15;
        doc.text(`Teléfono: ${invoiceData.customer_phone}`, 50, yPosition);
      }

      if (invoiceData.customer_number_doc) {
        yPosition += 15;
        doc.text(
          `${invoiceData.customer_type_doc || 'Documento'}: ${invoiceData.customer_number_doc}`,
          50,
          yPosition
        );
      }

      if (invoiceData.customer_address) {
        yPosition += 15;
        doc.text(`Dirección: ${invoiceData.customer_address}`, 50, yPosition);
      }

      if (invoiceData.customer_city) {
        yPosition += 15;
        doc.text(
          `Ciudad: ${invoiceData.customer_city}${
            invoiceData.customer_region ? `, ${invoiceData.customer_region}` : ''
          }`,
          50,
          yPosition
        );
      }

      yPosition += 30;

      // ========== TABLA DE PRODUCTOS ==========
      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('DETALLE DE LA COMPRA', 50, yPosition);

      yPosition += 20;

      // Encabezados de tabla
      const tableTop = yPosition;
      const colProduct = 50;
      const colQuantity = 320;
      const colPrice = 400;
      const colTotal = 480;

      // Fondo del encabezado
      doc
        .rect(colProduct, tableTop, 512, 25)
        .fillColor(lightGray)
        .fill();

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('Producto', colProduct + 10, tableTop + 8)
        .text('Cantidad', colQuantity, tableTop + 8)
        .text('Precio', colPrice, tableTop + 8)
        .text('Total', colTotal, tableTop + 8);

      yPosition = tableTop + 35;

      // Líneas de productos
      let subtotal = 0;
      const items = Array.isArray(invoiceData.items) ? invoiceData.items : [];

      items.forEach((item, index) => {
        // Soportar tanto price/precio y quantity/cantidad
        const itemPrice = item.price || item.precio || 0;
        const itemQuantity = item.quantity || item.cantidad || 1;
        const itemName = item.name || item.nombre || 'Producto';
        const itemTotal = itemPrice * itemQuantity;
        subtotal += itemTotal;

        // Alternar color de fondo
        if (index % 2 === 0) {
          doc
            .rect(colProduct, yPosition - 5, 512, 20)
            .fillColor('#fafafa')
            .fill();
        }

        doc
          .fontSize(9)
          .fillColor(textColor)
          .text(itemName, colProduct + 10, yPosition, {
            width: 260,
            ellipsis: true,
          })
          .text(String(itemQuantity), colQuantity, yPosition)
          .text(formatCurrency(itemPrice), colPrice, yPosition)
          .text(formatCurrency(itemTotal), colTotal, yPosition);

        yPosition += 25;
      });

      // Línea antes de totales
      yPosition += 10;
      doc
        .moveTo(350, yPosition)
        .lineTo(562, yPosition)
        .strokeColor('#d1d5db')
        .lineWidth(1)
        .stroke();

      yPosition += 15;

      // ========== TOTALES ==========
      // Subtotal
      doc
        .fontSize(10)
        .fillColor(textColor)
        .text('Subtotal:', 400, yPosition, { width: 80, align: 'right' })
        .text(formatCurrency(invoiceData.subtotal), 480, yPosition, {
          width: 82,
          align: 'right',
        });

      // Impuestos (si aplica)
      if (invoiceData.tax && invoiceData.tax > 0) {
        yPosition += 20;
        doc
          .text('Impuestos:', 400, yPosition, { width: 80, align: 'right' })
          .text(formatCurrency(invoiceData.tax), 480, yPosition, {
            width: 82,
            align: 'right',
          });
      }

      // Total
      yPosition += 20;
      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text('TOTAL:', 400, yPosition, { width: 80, align: 'right' })
        .text(formatCurrency(invoiceData.total), 480, yPosition, {
          width: 82,
          align: 'right',
        });

      // ========== INFORMACIÓN DE PAGO ==========
      yPosition += 40;

      if (invoiceData.payment_method) {
        doc
          .fontSize(10)
          .fillColor(textColor)
          .text('Método de pago: ', 50, yPosition, { continued: true })
          .fillColor(primaryColor)
          .text(invoiceData.payment_method.toUpperCase());
      }

      if (invoiceData.transaction_id) {
        yPosition += 15;
        doc
          .fillColor(textColor)
          .text('ID de transacción: ', 50, yPosition, { continued: true })
          .fillColor(primaryColor)
          .text(invoiceData.transaction_id);
      }

      // ========== PIE DE PÁGINA ==========
      const pageHeight = doc.page.height;
      const footerY = pageHeight - 100;

      // Línea divisoria
      doc
        .moveTo(50, footerY)
        .lineTo(562, footerY)
        .strokeColor('#d1d5db')
        .lineWidth(1)
        .stroke();

      doc
        .fontSize(9)
        .fillColor('#6b7280')
        .text(
          'Gracias por su compra. Esta es una factura electrónica válida.',
          50,
          footerY + 20,
          { align: 'center', width: 512 }
        )
        .text(
          'Para cualquier consulta, contáctenos en contacto@neurai.dev o visite https://neurai.dev',
          50,
          footerY + 35,
          { align: 'center', width: 512 }
        );

      // Estado de la factura
      if (invoiceData.status !== 'issued') {
        doc
          .fontSize(14)
          .fillColor('#ef4444')
          .text(
            `FACTURA ${invoiceData.status.toUpperCase()}`,
            0,
            footerY + 60,
            {
              align: 'center',
            }
          );
      }

      // Finalizar el documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Crea el registro de la factura en D1, genera el PDF con logo y lo envía
 * al cliente por correo usando Resend.
 *
 * @param {object} db      - Cliente D1 (getSupabaseClient())
 * @param {object} order   - Fila de la tabla orders
 * @param {object} epayco  - Datos de la transacción ePayco
 * @returns {object} Factura creada { invoice_number, ... }
 */
export async function createInvoiceRecord(db, order, epayco) {
  // 1. Obtener el último número de factura para generar el siguiente.
  const { data: last } = await db
    .from('invoices')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const invoiceNumber = generateInvoiceNumber(last?.id ?? 0);

  const metadata = typeof order.metadata === 'string'
    ? JSON.parse(order.metadata)
    : (order.metadata ?? {});

  const items = metadata.productos ?? [];

  const invoiceData = {
    invoice_number: invoiceNumber,
    order_reference: order.numero_orden,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone ?? '',
    customer_address: order.direccion_envio ?? '',
    customer_city: metadata.customer_city ?? '',
    customer_region: metadata.customer_region ?? '',
    transaction_id: epayco.id ?? '',
    payment_method: epayco.payment_method_type ?? 'ePayco',
    items,
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.impuestos ?? 0),
    total: Number(order.total ?? 0),
    currency: 'COP',
    status: 'issued',
    issued_at: new Date().toISOString(),
  };

  // 2. Guardar la factura en D1.
  const { data: savedInvoice, error } = await db
    .from('invoices')
    .insert({ ...invoiceData, items: JSON.stringify(items) })
    .select()
    .single();

  if (error) {
    throw new Error(`Error guardando factura en D1: ${error.message}`);
  }

  // 3. Generar el PDF.
  const pdfBuffer = await generateInvoicePDF({ ...invoiceData, issued_at: new Date() });

  // 4. Enviar el PDF al cliente por correo.
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@neurai.dev';
  const LOGO_URL = 'https://neurai.dev/logo-original.png';

  if (RESEND_API_KEY) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .header { background: #0070f3; padding: 24px 32px; text-align: center; }
        .header img { height: 56px; }
        .header h1 { color: #fff; margin: 12px 0 0; font-size: 20px; }
        .body { padding: 32px; }
        .info { background: #f3f4f6; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
        .info p { margin: 4px 0; font-size: 14px; }
        .label { color: #6b7280; font-size: 12px; margin-bottom: 2px; }
        .footer { text-align: center; font-size: 11px; color: #9ca3af; padding: 16px 32px 32px; }
      </style></head>
      <body>
        <div class="header">
          <img src="${LOGO_URL}" alt="neurai.dev" />
          <h1>¡Gracias por tu compra!</h1>
        </div>
        <div class="body">
          <p>Hola <strong>${order.customer_name}</strong>,</p>
          <p>Tu pago fue aprobado. Adjunto encontrarás tu factura de compra en PDF.</p>
          <div class="info">
            <p class="label">Número de factura</p>
            <p><strong>${invoiceNumber}</strong></p>
            <p class="label" style="margin-top:12px">Referencia de pago</p>
            <p>${order.numero_orden}</p>
            <p class="label" style="margin-top:12px">Total pagado</p>
            <p><strong>${formatCurrency(Number(order.total))}</strong></p>
          </div>
          <p>Nos pondremos en contacto contigo pronto para coordinar la entrega.</p>
          <p>¡Gracias por confiar en <strong>neurai.dev</strong>!</p>
        </div>
        <div class="footer">
          neurai.dev · contacto@neurai.dev · <a href="https://neurai.dev">neurai.dev</a>
        </div>
      </body>
      </html>
    `;

    const pdfBase64 = pdfBuffer.toString('base64');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [order.customer_email],
        subject: `Factura ${invoiceNumber} — neurai.dev`,
        html,
        attachments: [
          {
            filename: `${invoiceNumber}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    }).catch((err) =>
      console.error('⚠️ Error enviando factura por correo:', err.message)
    );
  }

  return savedInvoice ?? invoiceData;
}
