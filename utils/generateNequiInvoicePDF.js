import { jsPDF } from "jspdf";

/**
 * Genera una factura en PDF para pagos con Nequi
 *
 * @param {Object} data - Datos de la factura
 * @param {string} data.productoNombre - Nombre del producto
 * @param {string} data.productoColor - Color del producto (opcional)
 * @param {number} data.cantidad - Cantidad de productos
 * @param {number} data.precioOriginal - Precio original del producto
 * @param {number} data.descuento - Porcentaje de descuento
 * @param {number} data.precioConDescuento - Precio final con descuento
 * @param {string} data.numeroNequi - Número de Nequi para el pago
 * @param {string} data.nombreNegocio - Nombre del negocio
 */
export function generateNequiInvoicePDF(data) {
  const {
    productoNombre,
    productoColor,
    cantidad = 1,
    precioOriginal,
    descuento,
    precioConDescuento,
    numeroNequi,
    nombreNegocio
  } = data;

  // Crear documento PDF
  const doc = new jsPDF();

  // Configuración de colores
  const colorPrimario = [147, 51, 234]; // Purple-600
  const colorSecundario = [109, 40, 217]; // Purple-700
  const colorTexto = [31, 41, 55]; // Gray-800
  const colorTextoClaro = [107, 114, 128]; // Gray-500

  // Generar número de factura único
  const fecha = new Date();
  const numeroFactura = `NEQUI-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}${String(fecha.getSeconds()).padStart(2, '0')}`;

  // Formatear fecha
  const fechaFormateada = `${fecha.getDate()} de ${fecha.toLocaleString('es-CO', { month: 'long' })} de ${fecha.getFullYear()}`;

  let yPosition = 20;

  // ===============================
  // HEADER - Logo y Título
  // ===============================
  doc.setFillColor(...colorPrimario);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('FACTURA DE COMPRA', 105, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont(undefined, 'normal');
  doc.text(nombreNegocio, 105, 30, { align: 'center' });

  yPosition = 50;

  // ===============================
  // Información de la Factura
  // ===============================
  doc.setTextColor(...colorTexto);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');

  doc.text(`Factura #: ${numeroFactura}`, 20, yPosition);
  doc.text(`Fecha: ${fechaFormateada}`, 20, yPosition + 7);

  // Badge "Metodo: Nequi"
  doc.setFillColor(...colorPrimario);
  doc.roundedRect(20, yPosition + 12, 40, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Metodo: Nequi', 22, yPosition + 17);

  yPosition += 30;

  // ===============================
  // Línea separadora
  // ===============================
  doc.setDrawColor(...colorTextoClaro);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);

  yPosition += 10;

  // ===============================
  // PRODUCTO
  // ===============================
  doc.setTextColor(...colorTexto);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('PRODUCTO:', 20, yPosition);

  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const nombreCompleto = productoColor
    ? `${productoNombre} - ${productoColor}`
    : productoNombre;
  doc.text(nombreCompleto, 20, yPosition);

  yPosition += 7;

  doc.setFontSize(10);
  doc.setTextColor(...colorTextoClaro);
  doc.text(`Cantidad: ${cantidad} ${cantidad > 1 ? 'unidades' : 'unidad'}`, 20, yPosition);

  yPosition += 15;

  // ===============================
  // DETALLES DE PAGO
  // ===============================
  doc.setDrawColor(...colorTextoClaro);
  doc.line(20, yPosition, 190, yPosition);

  yPosition += 10;

  doc.setTextColor(...colorTexto);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const totalOriginal = precioOriginal * cantidad;
  const totalDescuento = (precioOriginal * descuento / 100) * cantidad;
  const totalFinal = precioConDescuento * cantidad;

  // Precio original
  doc.text('Precio original:', 20, yPosition);
  doc.text(`$${totalOriginal.toLocaleString('es-CO')}`, 190, yPosition, { align: 'right' });

  yPosition += 8;

  // Descuento
  doc.setTextColor(22, 163, 74); // Green-600
  doc.setFont(undefined, 'bold');
  doc.text(`Descuento Nequi (${descuento}%):`, 20, yPosition);
  doc.text(`-$${totalDescuento.toLocaleString('es-CO')}`, 190, yPosition, { align: 'right' });

  yPosition += 10;

  // Línea separadora del total
  doc.setDrawColor(...colorTexto);
  doc.setLineWidth(1);
  doc.line(130, yPosition, 190, yPosition);

  yPosition += 10;

  // TOTAL FINAL
  doc.setTextColor(...colorPrimario);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL PAGADO:', 20, yPosition);
  doc.text(`$${totalFinal.toLocaleString('es-CO')}`, 190, yPosition, { align: 'right' });

  yPosition += 15;

  // Estado
  doc.setFillColor(255, 237, 213); // Orange-100
  doc.roundedRect(20, yPosition, 170, 10, 2, 2, 'F');
  doc.setTextColor(194, 65, 12); // Orange-700
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Estado: Pendiente de confirmacion', 105, yPosition + 6.5, { align: 'center' });

  yPosition += 20;

  // ===============================
  // INFORMACIÓN DE PAGO
  // ===============================
  doc.setDrawColor(...colorTextoClaro);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);

  yPosition += 10;

  doc.setTextColor(...colorTexto);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Pago realizado mediante Nequi', 20, yPosition);

  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Numero Nequi: ${numeroNequi}`, 20, yPosition);

  yPosition += 15;

  // ===============================
  // AVISO IMPORTANTE
  // ===============================
  doc.setFillColor(254, 243, 199); // Yellow-100
  doc.setDrawColor(251, 191, 36); // Yellow-400
  doc.setLineWidth(2);
  doc.roundedRect(20, yPosition, 170, 35, 3, 3, 'FD');

  yPosition += 7;

  doc.setTextColor(146, 64, 14); // Yellow-900
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('IMPORTANTE:', 25, yPosition);

  yPosition += 7;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Esta factura sera confirmada una vez recibamos tu comprobante de pago.', 25, yPosition);

  yPosition += 6;

  doc.text('Envia tu comprobante a WhatsApp:', 25, yPosition);

  yPosition += 6;

  doc.setFont(undefined, 'bold');
  doc.text(`WhatsApp: +57 ${numeroNequi}`, 25, yPosition);

  yPosition += 15;

  // ===============================
  // FOOTER
  // ===============================
  const footerY = 270;

  doc.setFillColor(...colorSecundario);
  doc.rect(0, footerY, 210, 27, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Gracias por tu compra', 105, footerY + 10, { align: 'center' });

  doc.setFontSize(8);
  doc.text(`${nombreNegocio} | WhatsApp: +57 ${numeroNequi}`, 105, footerY + 16, { align: 'center' });
  doc.text('Esta es una factura digital generada automaticamente', 105, footerY + 21, { align: 'center' });

  // ===============================
  // Guardar PDF
  // ===============================
  const nombreArchivo = `Factura_${nombreNegocio.replace(/\s/g, '_')}_${numeroFactura}.pdf`;
  doc.save(nombreArchivo);

  return {
    numeroFactura,
    nombreArchivo,
    totalFinal
  };
}
