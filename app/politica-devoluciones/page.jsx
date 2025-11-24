"use client";

export default function PoliticaDevolucionesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Política de Devoluciones
        </h1>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              1. Condiciones Generales
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              En NeuraI.dev aceptamos devoluciones dentro de los primeros 7 días desde la fecha de recepción del producto, siempre y cuando el artículo se encuentre en las mismas condiciones en que fue entregado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              2. Productos Elegibles para Devolución
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>El producto debe estar sin usar y en su empaque original</li>
              <li>Debe incluir todos los accesorios, manuales y documentación original</li>
              <li>No debe presentar signos de uso, daños o modificaciones</li>
              <li>Debe incluir la factura o comprobante de compra</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              3. Productos No Elegibles
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Productos personalizados o hechos a medida</li>
              <li>Software o productos digitales descargables</li>
              <li>Productos de higiene personal abiertos</li>
              <li>Libros usados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              4. Proceso de Devolución
            </h2>
            <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Contacta con nuestro servicio de atención al cliente por WhatsApp al +57 317 450 3604</li>
              <li>Proporciona tu número de pedido y el motivo de la devolución</li>
              <li>Empaca el producto de forma segura con todos sus accesorios</li>
              <li>Coordina la entrega del producto en nuestra ubicación o envío</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              5. Reembolsos
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Una vez recibido y verificado el producto, procesaremos tu reembolso en un plazo de 5 a 7 días hábiles. El reembolso se realizará mediante el mismo método de pago utilizado en la compra original.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              6. Cambios
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Si deseas cambiar un producto por otro, el proceso es el mismo que para las devoluciones. Una vez procesado el reembolso, puedes realizar un nuevo pedido.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              7. Costos de Envío
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Los costos de envío de la devolución correrán por cuenta del cliente, excepto en casos de productos defectuosos o errores en el envío.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              8. Contacto
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Para cualquier consulta sobre nuestra política de devoluciones, puedes contactarnos:
            </p>
            <ul className="list-none text-gray-700 dark:text-gray-300 space-y-2">
              <li>📧 Email: julii1295@gmail.com</li>
              <li>📞 Teléfono: +57 317 450 3604</li>
              <li>💬 WhatsApp: +57 317 450 3604</li>
              <li>📍 Dirección: Calle 1A # 6 - 7, Colón - Putumayo</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
