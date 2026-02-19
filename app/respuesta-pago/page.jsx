"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import CustomerRegistrationModal from "@/components/CustomerRegistrationModal";

/**
 * Componente interno que usa useSearchParams
 */
function RespuestaPagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [isRegisteredCustomer, setIsRegisteredCustomer] = useState(false);

  useEffect(() => {
    // Detectar si es redirect de ePayco (tiene x_ref_payco o x_transaction_state)
    const epaycoRef = searchParams.get("x_ref_payco");
    const epaycoState = searchParams.get("x_transaction_state");

    // Si es un redirect de ePayco, leer los parámetros directamente de la URL
    if (epaycoRef || epaycoState) {
      const stateMap = {
        "Aceptada": "APPROVED",
        "Rechazada": "DECLINED",
        "Pendiente": "PENDING",
        "Fallida": "ERROR",
        "Abandonada": "VOIDED",
      };

      const rawState = epaycoState || "";
      const reference = searchParams.get("x_id_invoice") || searchParams.get("x_extra1") || "";

      const data = {
        transactionId: epaycoRef || searchParams.get("x_transaction_id") || "",
        reference: reference,
        amount: parseFloat(searchParams.get("x_amount") || searchParams.get("x_amount_ok") || 0),
        currency: searchParams.get("x_currency_code") || "COP",
        status: stateMap[rawState] || "ERROR",
        statusMessage: rawState,
        paymentMethod: searchParams.get("x_franchise") || "ePayco",
        customerEmail: searchParams.get("x_customer_email") || "",
        source: "epayco",
      };

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("[DEV] Datos de respuesta de ePayco recibidos", data);
      }

      setPaymentData(data);

      // Consultar la orden desde nuestra base de datos
      if (reference) {
        fetch(`/api/orders/get-by-reference?reference=${reference}`)
          .then((res) => res.ok ? res.json() : null)
          .then(async (orderInfo) => {
            if (orderInfo?.order) {
              setOrderData(orderInfo.order);
            }
            // Verificar si el cliente ya está registrado (solo si pago exitoso)
            if (data.status === "APPROVED" && data.customerEmail) {
              try {
                const customerCheck = await fetch(
                  `/api/customers/register?email=${encodeURIComponent(data.customerEmail)}`
                );
                if (customerCheck.ok) {
                  const customerData = await customerCheck.json();
                  setIsRegisteredCustomer(customerData.registered);
                  if (!customerData.registered) {
                    setTimeout(() => setShowCustomerModal(true), 2000);
                  }
                }
              } catch (error) {
                console.error("Error verificando cliente:", error);
              }
            }
          })
          .catch((error) => console.error("Error consultando orden:", error))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return;
    }

    // Flujo Wompi: tiene un ID de transacción en ?id=
    const transactionId = searchParams.get("id");

    if (transactionId) {
      // Consultar el estado de la transacción desde la API de Wompi
      fetch(`https://production.wompi.co/v1/transactions/${transactionId}`)
        .then((res) => res.json())
        .then(async (transaction) => {
          const data = {
            transactionId: transaction.data.id,
            reference: transaction.data.reference,
            amount: transaction.data.amount_in_cents / 100,
            currency: transaction.data.currency,
            status: transaction.data.status,
            statusMessage: transaction.data.status_message,
            paymentMethod: transaction.data.payment_method_type,
            createdAt: transaction.data.created_at,
            customerEmail: transaction.data.customer_email || "",
            source: "wompi",
          };

          if (process.env.NODE_ENV === "development") {
            // eslint-disable-next-line no-console
            console.warn("[DEV] Datos de respuesta de Wompi recibidos", data);
          }

          setPaymentData(data);

          try {
            const orderResponse = await fetch(
              `/api/orders/get-by-reference?reference=${data.reference}`,
            );
            if (orderResponse.ok) {
              const orderInfo = await orderResponse.json();
              setOrderData(orderInfo.order);

              if (process.env.NODE_ENV === "development") {
                // eslint-disable-next-line no-console
                console.warn("[DEV] Datos de la orden recibidos", orderInfo.order);
              }

              if (data.status === "APPROVED" && data.customerEmail) {
                try {
                  const customerCheck = await fetch(
                    `/api/customers/register?email=${encodeURIComponent(data.customerEmail)}`
                  );
                  if (customerCheck.ok) {
                    const customerData = await customerCheck.json();
                    setIsRegisteredCustomer(customerData.registered);
                    if (!customerData.registered) {
                      setTimeout(() => setShowCustomerModal(true), 2000);
                    }
                  }
                } catch (error) {
                  console.error("Error verificando cliente:", error);
                }
              }
            }
          } catch (error) {
            console.error("Error consultando orden:", error);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error("Error consultando transacción:", error);
          setPaymentData(null);
          setLoading(false);
        });
    } else {
      setPaymentData(null);
      setLoading(false);
    }
  }, [searchParams]);

  // Determinar el estado del pago
  const getPaymentStatus = () => {
    if (!paymentData) return null;

    const state = paymentData.status;

    // Estados normalizados (ambos gateways usan APPROVED/DECLINED/PENDING/VOIDED/ERROR)

    if (state === "APPROVED") {
      return {
        type: "success",
        icon: "✅",
        title: "¡Pago exitoso!",
        message: "Tu transacción ha sido procesada correctamente.",
        color: "green",
      };
    } else if (state === "DECLINED") {
      return {
        type: "error",
        icon: "❌",
        title: "Pago rechazado",
        message: paymentData.statusMessage || "La transacción fue rechazada.",
        color: "red",
      };
    } else if (state === "PENDING") {
      return {
        type: "warning",
        icon: "⏳",
        title: "Pago pendiente",
        message:
          "Tu pago está en proceso de verificación. Te notificaremos cuando se confirme.",
        color: "yellow",
      };
    } else if (state === "VOIDED") {
      return {
        type: "error",
        icon: "🚫",
        title: "Pago anulado",
        message: "La transacción fue anulada.",
        color: "red",
      };
    } else {
      return {
        type: "error",
        icon: "⚠️",
        title: "Error en el pago",
        message: "Hubo un error al procesar tu pago.",
        color: "red",
      };
    }
  };

  const status = getPaymentStatus();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Procesando respuesta...
          </p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No se recibió información de pago.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 mt-14 ">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        {/* Icono y título */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{status.icon}</div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              status.color === "green"
                ? "text-green-600 dark:text-green-400"
                : status.color === "red"
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {status.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{status.message}</p>
        </div>

        {/* Detalles del cliente */}
        {orderData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Información del Cliente
            </h2>
            <div className="space-y-3">
              {(orderData.nombre_cliente || orderData.customer_name) && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Nombre:
                  </span>
                  <span className="text-blue-900 dark:text-blue-100 font-semibold">
                    {orderData.nombre_cliente || orderData.customer_name}
                  </span>
                </div>
              )}
              {(orderData.correo_cliente || orderData.customer_email) && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Email:
                  </span>
                  <span className="text-blue-900 dark:text-blue-100 font-mono text-sm">
                    {orderData.correo_cliente || orderData.customer_email}
                  </span>
                </div>
              )}
              {(orderData.telefono_cliente || orderData.customer_phone) && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Teléfono:
                  </span>
                  <span className="text-blue-900 dark:text-blue-100 font-mono text-sm">
                    {orderData.telefono_cliente || orderData.customer_phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Productos comprados */}
        {orderData &&
          (orderData.metadata?.productos || orderData.productos || orderData.items) &&
          (orderData.metadata?.productos || orderData.productos || orderData.items).length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Productos Comprados
              </h2>
              <div className="space-y-3">
                {(orderData.metadata?.productos || orderData.productos || orderData.items).map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name || item.nombre}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cantidad: {item.quantity || item.cantidad || 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        $
                        {parseFloat(
                          item.price || item.precio || 0,
                        ).toLocaleString("es-CO")}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      $
                      {parseFloat(orderData.total || 0).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Detalles de la transacción */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Detalles de la transacción
          </h2>
          <div className="space-y-3">
            {paymentData.reference && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Referencia:
                </span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                  {paymentData.reference}
                </span>
              </div>
            )}
            {paymentData.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  ID de transacción:
                </span>
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                  {paymentData.transactionId}
                </span>
              </div>
            )}
            {paymentData.amount && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  ${parseFloat(paymentData.amount).toFixed(2)}{" "}
                  {paymentData.currency || "COP"}
                </span>
              </div>
            )}
            {paymentData.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Método de pago:
                </span>
                <span className="font-mono text-sm text-gray-900 dark:text-white uppercase">
                  {paymentData.paymentMethod}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invitación a crear cuenta (solo para usuarios no registrados) */}
        {isLoaded && !isSignedIn && status.type === "success" && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  ¿Te gustaría crear una cuenta en este sitio?
                </h3>
                <p className="text-blue-100 mb-4">
                  Así podrás llevar registro de tus futuras compras, además de
                  ser uno de los primeros en saber sobre los días de promociones
                  o descuentos especiales.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">
                      Historial completo de tus compras
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">
                      Notificaciones sobre promociones exclusivas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">
                      Acceso anticipado a nuevos productos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">
                      Gestión fácil de direcciones de envío
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/sign-up"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg transition-colors text-center shadow-md"
                  >
                    Crear cuenta gratis
                  </Link>
                  <Link
                    href="/sign-in"
                    className="bg-white/10 hover:bg-white/20 border-2 border-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4">
          {status.type === "success" && (
            <>
              {/* Solo mostrar botón de factura si la orden existe y está completada */}
              {orderData &&
                (orderData.estado === "completado" ||
                  orderData.estado_pago === "completado") && (
                  <Link
                    href={`/factura/${paymentData.reference}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Ver Factura
                  </Link>
                )}
              <Link
                href="/"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
              >
                Volver al inicio
              </Link>
              <Link
                href="/accesorios"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Seguir comprando
              </Link>
            </>
          )}

          {status.type === "error" && (
            <>
              <button
                onClick={() => router.back()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Reintentar pago
              </button>
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                Volver al inicio
              </Link>
            </>
          )}

          {status.type === "warning" && (
            <Link
              href="/"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Volver al inicio
            </Link>
          )}
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {status.type === "success" && (
                <>
                  {orderData &&
                  (orderData.estado === "completado" ||
                    orderData.estado_pago === "completado") ? (
                    <p>
                      Recibirás un correo electrónico con los detalles de tu
                      compra. Puedes descargar tu factura en cualquier momento
                      haciendo clic en el botón "Ver Factura".
                    </p>
                  ) : (
                    <p>
                      Tu pago ha sido procesado exitosamente. La factura se
                      generará automáticamente en los próximos minutos. Si
                      tienes alguna pregunta, contáctanos en contacto@neurai.dev
                    </p>
                  )}
                </>
              )}
              {status.type === "error" && (
                <p>
                  Si crees que esto es un error, por favor contacta con nosotros
                  a través de WhatsApp o correo electrónico.
                </p>
              )}
              {status.type === "warning" && (
                <p>
                  Los pagos pendientes pueden tardar hasta 24 horas en
                  confirmarse. Te notificaremos por correo cuando se confirme.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de registro de cliente */}
      {showCustomerModal && orderData && (
        <CustomerRegistrationModal
          orderData={orderData}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={() => {
            setIsRegisteredCustomer(true);
            setTimeout(() => setShowCustomerModal(false), 3000);
          }}
        />
      )}
    </div>
  );
}

/**
 * Componente de loading para el Suspense
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Página de respuesta después del pago con Wompi
 * URL: /respuesta-pago
 *
 * Wompi redirige aquí con el ID de transacción en la URL después del pago
 */
export default function RespuestaPago() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RespuestaPagoContent />
    </Suspense>
  );
}
