/**
 * Generador de facturas en PDF usando jsPDF.
 *
 * Se usa jsPDF (no pdfkit) porque pdfkit necesita archivos de fuentes .afm que
 * no se incluyen en el bundle serverless de Vercel y hacían fallar la descarga
 * con "ENOENT: ... Helvetica.afm". jsPDF trae sus fuentes embebidas y funciona
 * en Vercel sin dependencias de archivos externos.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
 * Genera un PDF de factura electrónica con jsPDF.
 * @param {Object} invoiceData - Datos de la factura
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
export async function generateInvoicePDF(invoiceData) {
  // Colores (RGB)
  const primary = [37, 99, 235]; // azul
  const text = [31, 41, 55]; // gris oscuro
  const muted = [107, 114, 128];

  // items puede llegar como string JSON (D1) o array
  let items = invoiceData.items;
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = []; }
  }
  if (!Array.isArray(items)) items = [];

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 50;
  const marginRight = pageWidth - 50;

  // ========== ENCABEZADO ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...primary);
  doc.text('NEURAI.DEV', marginLeft, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...text);
  doc.text('Tienda Online', marginLeft, 82);
  doc.text('NIT: 123456789-0', marginLeft, 96);
  doc.text('contacto@neurai.dev', marginLeft, 110);
  doc.text('https://neurai.dev', marginLeft, 124);

  // Título y datos de factura (alineado a la derecha)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...primary);
  doc.text('FACTURA ELECTRÓNICA', marginRight, 60, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...text);
  doc.text(`No. ${invoiceData.invoice_number}`, marginRight, 82, { align: 'right' });
  doc.text(`Fecha: ${formatDate(invoiceData.issued_at || new Date())}`, marginRight, 98, { align: 'right' });
  doc.text(`Referencia: ${invoiceData.order_reference}`, marginRight, 114, { align: 'right' });

  // Línea divisoria
  doc.setDrawColor(...primary);
  doc.setLineWidth(2);
  doc.line(marginLeft, 150, marginRight, 150);

  // ========== INFORMACIÓN DEL CLIENTE ==========
  let y = 176;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primary);
  doc.text('INFORMACIÓN DEL CLIENTE', marginLeft, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...text);
  y += 18;
  doc.text(`Nombre: ${invoiceData.customer_name ?? ''}`, marginLeft, y);
  y += 15;
  doc.text(`Email: ${invoiceData.customer_email ?? ''}`, marginLeft, y);

  if (invoiceData.customer_phone) {
    y += 15;
    doc.text(`Teléfono: ${invoiceData.customer_phone}`, marginLeft, y);
  }
  if (invoiceData.customer_number_doc) {
    y += 15;
    doc.text(
      `${invoiceData.customer_type_doc || 'Documento'}: ${invoiceData.customer_number_doc}`,
      marginLeft,
      y,
    );
  }
  if (invoiceData.customer_address) {
    y += 15;
    doc.text(`Dirección: ${invoiceData.customer_address}`, marginLeft, y);
  }
  if (invoiceData.customer_city) {
    y += 15;
    doc.text(
      `Ciudad: ${invoiceData.customer_city}${invoiceData.customer_region ? `, ${invoiceData.customer_region}` : ''}`,
      marginLeft,
      y,
    );
  }

  // ========== TABLA DE PRODUCTOS ==========
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primary);
  doc.text('DETALLE DE LA COMPRA', marginLeft, y);
  y += 10;

  const filas = items.map((item) => {
    const itemPrice = item.price || item.precio || 0;
    const itemQuantity = item.quantity || item.cantidad || 1;
    const itemName = item.name || item.nombre || 'Producto';
    return [
      itemName,
      String(itemQuantity),
      formatCurrency(itemPrice),
      formatCurrency(itemPrice * itemQuantity),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'Cantidad', 'Precio', 'Total']],
    body: filas,
    margin: { left: marginLeft, right: 50 },
    styles: { fontSize: 9, cellPadding: 6, textColor: text },
    headStyles: { fillColor: primary, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
  });

  // ========== TOTALES ==========
  let yTot = (doc.lastAutoTable?.finalY || y) + 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...text);

  doc.text('Subtotal:', marginRight - 120, yTot, { align: 'right' });
  doc.text(formatCurrency(invoiceData.subtotal ?? 0), marginRight, yTot, { align: 'right' });

  if (invoiceData.tax && invoiceData.tax > 0) {
    yTot += 16;
    doc.text('Impuestos:', marginRight - 120, yTot, { align: 'right' });
    doc.text(formatCurrency(invoiceData.tax), marginRight, yTot, { align: 'right' });
  }

  yTot += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primary);
  doc.text('TOTAL:', marginRight - 120, yTot, { align: 'right' });
  doc.text(formatCurrency(invoiceData.total ?? 0), marginRight, yTot, { align: 'right' });

  // ========== INFORMACIÓN DE PAGO ==========
  let yPago = yTot + 34;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (invoiceData.payment_method) {
    doc.setTextColor(...text);
    doc.text('Método de pago: ', marginLeft, yPago);
    doc.setTextColor(...primary);
    doc.text(String(invoiceData.payment_method).toUpperCase(), marginLeft + 90, yPago);
  }
  if (invoiceData.transaction_id) {
    yPago += 15;
    doc.setTextColor(...text);
    doc.text('ID de transacción: ', marginLeft, yPago);
    doc.setTextColor(...primary);
    doc.text(String(invoiceData.transaction_id), marginLeft + 100, yPago);
  }

  // ========== PIE DE PÁGINA ==========
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 90;
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(1);
  doc.line(marginLeft, footerY, marginRight, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(
    'Gracias por su compra. Esta es una factura electrónica válida.',
    pageWidth / 2,
    footerY + 20,
    { align: 'center' },
  );
  doc.text(
    'Para cualquier consulta, contáctenos en contacto@neurai.dev o visite https://neurai.dev',
    pageWidth / 2,
    footerY + 34,
    { align: 'center' },
  );

  if (invoiceData.status && invoiceData.status !== 'issued') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(239, 68, 68);
    doc.text(
      `FACTURA ${String(invoiceData.status).toUpperCase()}`,
      pageWidth / 2,
      footerY + 58,
      { align: 'center' },
    );
  }

  // jsPDF devuelve un ArrayBuffer; el endpoint espera un Buffer de Node.
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
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

  // invoices.id es INTEGER NOT NULL sin AUTOINCREMENT en D1: lo generamos como
  // el siguiente después del máximo actual.
  const nextId = (Number(last?.id) || 0) + 1;
  const invoiceNumber = generateInvoiceNumber(last?.id ?? 0);

  const metadata = typeof order.metadata === 'string'
    ? JSON.parse(order.metadata)
    : (order.metadata ?? {});

  const items = metadata.productos ?? [];

  // El tercer parámetro (datos de la transacción) puede no venir cuando la
  // factura se genera a posteriori desde /factura/[ref]. En ese caso usamos
  // lo que la orden ya guardó (transaction_id, informacion_pago) como respaldo.
  const tx = epayco ?? {};
  const infoPago = typeof order.informacion_pago === 'string'
    ? (() => { try { return JSON.parse(order.informacion_pago); } catch { return {}; } })()
    : (order.informacion_pago ?? {});

  const invoiceData = {
    id: nextId,
    invoice_number: invoiceNumber,
    order_reference: order.numero_orden,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone ?? '',
    customer_address: order.direccion_envio ?? '',
    customer_city: metadata.customer_city ?? '',
    customer_region: metadata.customer_region ?? '',
    transaction_id: tx.id ?? order.transaction_id ?? infoPago.x_transaction_id ?? infoPago.x_ref_payco ?? '',
    payment_method: tx.payment_method_type ?? infoPago.x_franchise ?? order.metodo_pago ?? 'ePayco',
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

  // 3 y 4: generar el PDF y enviarlo por correo. Esto es un "extra": la factura
  // ya quedó guardada en D1 arriba, así que si falla la generación del PDF (por
  // ejemplo pdfkit sin sus fuentes en el bundle) NO debe tumbar todo el flujo.
  // La página /factura usa los datos de la factura y tiene su propio botón de
  // descarga; el correo es adicional.
  try {
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
  } catch (pdfErr) {
    // No bloqueamos la creación de la factura si el PDF/correo falla.
    console.error('⚠️ Error generando/enviando el PDF de la factura:', pdfErr.message);
  }

  return savedInvoice ?? invoiceData;
}
