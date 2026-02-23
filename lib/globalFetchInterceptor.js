/**
 * Interceptor global de fetch para prevenir errores de JSON parsing
 *
 * Este archivo agrega validación automática a TODOS los fetch de la aplicación
 * sin necesidad de modificar cada archivo individual.
 *
 * USO:
 * Importa esto en tu app/layout.jsx:
 *
 * import '@/lib/globalFetchInterceptor';
 */

if (typeof window !== 'undefined') {
  // Guardar referencia al fetch original
  const originalFetch = window.fetch;

  // Sobrescribir fetch con versión mejorada
  window.fetch = async function (...args) {
    try {
      // Llamar al fetch original
      const response = await originalFetch(...args);

      // Clonar la respuesta para poder leerla múltiples veces
      const clonedResponse = response.clone();

      // Sobrescribir el método json() con validación
      const originalJson = clonedResponse.json.bind(clonedResponse);

      clonedResponse.json = async function () {
        try {
          // Verificar el Content-Type antes de parsear
          const contentType = clonedResponse.headers.get('content-type');

          if (!contentType || !contentType.includes('application/json')) {
            console.warn(
              `⚠️ Fetch Warning: Response is not JSON (Content-Type: ${contentType})`,
              {
                url: args[0],
                status: clonedResponse.status,
              }
            );

            // Intentar leer como texto para debugging
            const text = await clonedResponse.text();

            // Si es HTML, mostrar una parte para debugging
            if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
              console.error(
                `❌ Fetch Error: Received HTML instead of JSON from ${args[0]}`,
                {
                  status: clonedResponse.status,
                  statusText: clonedResponse.statusText,
                  preview: text.substring(0, 200) + '...',
                }
              );
            }

            // Lanzar error descriptivo
            throw new Error(
              `Response is not JSON (Content-Type: ${contentType}). ` +
                `Received: ${text.substring(0, 100)}...`
            );
          }

          // Si todo está bien, parsear JSON
          return await originalJson();
        } catch (error) {
          // Mejorar el mensaje de error
          if (error.message.includes('JSON')) {
            console.error(
              `❌ JSON Parse Error at ${args[0]}:`,
              {
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                error: error.message,
              }
            );

            throw new Error(
              `Failed to parse JSON from ${args[0]} ` +
                `(Status: ${clonedResponse.status}). ` +
                `Original error: ${error.message}`
            );
          }

          throw error;
        }
      };

      return clonedResponse;
    } catch (error) {
      console.error(`❌ Fetch Error at ${args[0]}:`, error);
      throw error;
    }
  };

  console.log('✅ Global fetch interceptor loaded');
}
