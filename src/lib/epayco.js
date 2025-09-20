import crypto from 'crypto';

// Configuración de ePayco
export const EPAYCO_CONFIG = {
  P_CUST_ID_CLIENTE: process.env.EPAYCO_CUST_ID,
  P_KEY: process.env.EPAYCO_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EPAYCO_PRIVATE_KEY,
  TEST: process.env.NODE_ENV !== 'production', // Modo test en desarrollo
  BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://secure.epayco.co'
    : 'https://secure.epayco.co', // ePayco usa la misma URL para test y producción
};

// Generar firma para ePayco
export function generateEpaycoSignature(params) {
  const {
    p_cust_id_cliente,
    p_key,
    p_id_invoice,
    p_amount,
    p_currency_code,
    private_key
  } = params;

  const signature = `${p_cust_id_cliente}^${p_key}^${p_id_invoice}^${p_amount}^${p_currency_code}`;

  return crypto
    .createHash('sha256')
    .update(signature + private_key)
    .digest('hex');
}

// Validar respuesta de ePayco
export function validateEpaycoResponse(responseData) {
  const {
    x_cust_id_cliente,
    x_ref_payco,
    x_transaction_id,
    x_amount,
    x_currency_code,
    x_signature
  } = responseData;

  const expectedSignature = generateEpaycoSignature({
    p_cust_id_cliente: x_cust_id_cliente,
    p_key: EPAYCO_CONFIG.P_KEY,
    p_id_invoice: x_ref_payco,
    p_amount: x_amount,
    p_currency_code: x_currency_code,
    private_key: EPAYCO_CONFIG.PRIVATE_KEY
  });

  return x_signature === expectedSignature;
}

// Crear parámetros para ePayco
export function createEpaycoParams(orderData) {
  const {
    pedidoNumero,
    total,
    email,
    nombre,
    telefono,
    descripcion = 'Compra en Neurai.dev'
  } = orderData;

  const signature = generateEpaycoSignature({
    p_cust_id_cliente: EPAYCO_CONFIG.P_CUST_ID_CLIENTE,
    p_key: EPAYCO_CONFIG.P_KEY,
    p_id_invoice: pedidoNumero,
    p_amount: total,
    p_currency_code: 'COP',
    private_key: EPAYCO_CONFIG.PRIVATE_KEY
  });

  return {
    // Información del comercio
    p_cust_id_cliente: EPAYCO_CONFIG.P_CUST_ID_CLIENTE,
    p_key: EPAYCO_CONFIG.P_KEY,

    // Información de la transacción
    p_id_invoice: pedidoNumero,
    p_description: descripcion,
    p_amount: total,
    p_amount_base: total,
    p_currency_code: 'COP',
    p_signature: signature,

    // Información del comprador
    p_email: email,
    p_name: nombre,
    p_phone: telefono,

    // URLs de respuesta
    p_url_response: `${process.env.NEXT_PUBLIC_SITE_URL}/api/epayco/response`,
    p_url_confirmation: `${process.env.NEXT_PUBLIC_SITE_URL}/api/epayco/confirmation`,

    // Configuración adicional
    p_test_request: EPAYCO_CONFIG.TEST ? 'TRUE' : 'FALSE',
    p_split_type: '02', // Pago directo
    p_split_primary_receiver: EPAYCO_CONFIG.P_CUST_ID_CLIENTE,
    p_split_primary_receiver_fee: '0',

    // Idioma
    p_lang: 'es'
  };
}

// Estados de transacción de ePayco
export const EPAYCO_STATES = {
  1: 'ACEPTADA',
  2: 'RECHAZADA',
  3: 'PENDIENTE',
  4: 'FALLIDA',
  6: 'REVERSADA',
  7: 'RETENIDA',
  8: 'INICIADA',
  9: 'EXPIREDA',
  10: 'ABANDONADA',
  11: 'CANCELADA',
  12: 'ANTIFRAUDE'
};

// Mapear estados de ePayco a estados internos
export function mapEpaycoStateToInternal(epaycoState) {
  switch (parseInt(epaycoState)) {
    case 1:
      return 'PAGADO';
    case 2:
    case 4:
    case 6:
    case 7:
    case 9:
    case 10:
    case 11:
    case 12:
      return 'CANCELADO';
    case 3:
    case 8:
      return 'PENDIENTE_PAGO';
    default:
      return 'PENDIENTE';
  }
}