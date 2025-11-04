/**
 * ePayco Payment Service
 * Servicio para integración con la pasarela de pagos ePayco
 */

import epaycoSDK from 'epayco-sdk-node';

/**
 * Inicializar cliente de ePayco con credenciales
 */
function getEpaycoClient() {
  if (!process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || !process.env.EPAYCO_PRIVATE_KEY) {
    throw new Error('ePayco credentials are not configured. Please check your .env.local file.');
  }

  return epaycoSDK({
    apiKey: process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY,
    privateKey: process.env.EPAYCO_PRIVATE_KEY,
    lang: 'ES',
    test: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true'
  });
}

/**
 * Crear un cliente en ePayco
 * @param {Object} customerData - Datos del cliente
 * @returns {Promise<Object>} - Cliente creado
 */
async function createCustomer(customerData) {
  const epayco = getEpaycoClient();

  const customer_info = {
    name: customerData.name,
    last_name: customerData.lastName,
    email: customerData.email,
    phone: customerData.phone,
    default: true
  };

  try {
    const customer = await epayco.customers.create(customer_info);
    return customer;
  } catch (error) {
    console.error('Error creating customer in ePayco:', error);
    throw error;
  }
}

/**
 * Crear una referencia de pago
 * @param {Object} paymentData - Datos del pago
 * @returns {Promise<Object>} - Referencia de pago creada
 */
async function createPaymentReference(paymentData) {
  const epayco = getEpaycoClient();

  const payment_info = {
    name: paymentData.name,
    description: paymentData.description,
    invoice: paymentData.invoice,
    currency: "COP",
    amount: paymentData.amount,
    tax_base: "0",
    tax: "0",
    country: "CO",
    lang: "ES",

    // URLs de respuesta
    external: "false",
    response: process.env.NEXT_PUBLIC_EPAYCO_RESPONSE_URL,
    confirmation: process.env.NEXT_PUBLIC_EPAYCO_CONFIRMATION_URL,

    // Información del cliente
    name_billing: paymentData.customer.name,
    address_billing: paymentData.customer.address || "N/A",
    type_doc_billing: "CC",
    mobilephone_billing: paymentData.customer.phone,
    number_doc_billing: paymentData.customer.document || "000000000",

    // Información adicional
    extra1: paymentData.extra1 || "",
    extra2: paymentData.extra2 || "",
    extra3: paymentData.extra3 || "",
  };

  try {
    const payment = await epayco.cash.create("efecty", payment_info);
    return payment;
  } catch (error) {
    console.error('Error creating payment reference:', error);
    throw error;
  }
}

/**
 * Crear un pago con PSE
 * @param {Object} pseData - Datos del pago PSE
 * @returns {Promise<Object>} - Pago PSE creado
 */
async function createPSEPayment(pseData) {
  const epayco = getEpaycoClient();

  const pse_info = {
    bank: pseData.bank,
    invoice: pseData.invoice,
    description: pseData.description,
    value: pseData.value,
    tax: "0",
    tax_base: "0",
    currency: "COP",
    type_person: pseData.type_person, // 0 = Natural, 1 = Juridica
    doc_type: pseData.doc_type, // CC, CE, NIT
    doc_number: pseData.doc_number,
    name: pseData.name,
    last_name: pseData.last_name,
    email: pseData.email,
    country: "CO",
    cell_phone: pseData.cell_phone,

    // URLs de respuesta
    url_response: process.env.NEXT_PUBLIC_EPAYCO_RESPONSE_URL,
    url_confirmation: process.env.NEXT_PUBLIC_EPAYCO_CONFIRMATION_URL,

    // Información del método de pago
    method_confirmation: "GET",
  };

  try {
    const payment = await epayco.bank.create(pse_info);
    return payment;
  } catch (error) {
    console.error('Error creating PSE payment:', error);
    throw error;
  }
}

/**
 * Verificar el estado de una transacción
 * @param {string} ref_payco - Referencia de pago de ePayco
 * @returns {Promise<Object>} - Estado de la transacción
 */
async function checkTransaction(ref_payco) {
  const epayco = getEpaycoClient();

  try {
    const transaction = await epayco.charge.get(ref_payco);
    return transaction;
  } catch (error) {
    console.error('Error checking transaction:', error);
    throw error;
  }
}

/**
 * Obtener información de un pago
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<Object>} - Información del pago
 */
async function getPaymentInfo(transactionId) {
  const epayco = getEpaycoClient();

  try {
    const payment = await epayco.charge.transaction(transactionId);
    return payment;
  } catch (error) {
    console.error('Error getting payment info:', error);
    throw error;
  }
}

export {
  getEpaycoClient,
  createCustomer,
  createPaymentReference,
  createPSEPayment,
  checkTransaction,
  getPaymentInfo
};
