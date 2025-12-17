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
 * Crea un registro de factura en la base de datos
 * @param {Object} supabase - Cliente de Supabase
 * @param {Object} orderData - Datos de la orden
 * @param {Object} transactionData - Datos de la transacción (opcional)
 * @returns {Promise<Object>} Factura creada
 */
export async function createInvoiceRecord(supabase, orderData, transactionData = null) {
  try {
    // Obtener el ID de la última factura para generar el número secuencial
    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    const invoiceNumber = generateInvoiceNumber(lastInvoice?.id || 0);

    // Calcular subtotal e impuestos
    // Soportar tanto el formato nuevo (metadata.productos) como el antiguo (items)
    const items = Array.isArray(orderData.metadata?.productos)
      ? orderData.metadata.productos
      : Array.isArray(orderData.productos)
        ? orderData.productos
        : Array.isArray(orderData.items)
          ? orderData.items
          : [];

    const subtotal = items.reduce(
      (sum, item) => sum + (item.price || item.precio || 0) * (item.quantity || item.cantidad || 1),
      0
    );
    const tax = orderData.impuestos || 0; // Usar impuestos de la orden si existe
    const total = orderData.total || subtotal + tax;

    // Preparar datos de la factura
    // Soportar tanto nombres nuevos como antiguos para compatibilidad
    const invoiceData = {
      invoice_number: invoiceNumber,
      order_reference: orderData.numero_orden || orderData.invoice || orderData.order_reference,
      customer_name: orderData.nombre_cliente || orderData.customer_name || 'Cliente',
      customer_email: orderData.correo_cliente || orderData.customer_email,
      customer_phone: orderData.telefono_cliente || orderData.customer_phone || null,
      customer_type_doc: orderData.tipo_documento_cliente || orderData.customer_type_doc || null,
      customer_number_doc: orderData.numero_documento_cliente || orderData.customer_number_doc || null,
      customer_address: orderData.direccion_cliente || orderData.customer_address || null,
      customer_city: orderData.ciudad_cliente || orderData.customer_city || null,
      customer_region: orderData.region_cliente || orderData.customer_region || null,
      transaction_id: transactionData?.id || orderData.transaction_id || null,
      payment_method: transactionData?.payment_method_type || orderData.metodo_pago || orderData.payment_method || null,
      items: items,
      subtotal: subtotal,
      tax: tax,
      total: total,
      currency: 'COP',
      status: 'issued',
      issued_at: new Date().toISOString(),
    };

    // Insertar en la base de datos
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return invoice;
  } catch (error) {
    console.error('Error creando registro de factura:', error);
    throw error;
  }
}
