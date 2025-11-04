# Configuración de ePayco - Guía Completa

Esta guía te ayudará a configurar la integración de ePayco en tu tienda online para aceptar pagos con tarjetas de crédito, débito y PSE.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Crear Cuenta en ePayco](#paso-1-crear-cuenta-en-epayco)
3. [Paso 2: Obtener Credenciales de API](#paso-2-obtener-credenciales-de-api)
4. [Paso 3: Configurar Variables de Entorno](#paso-3-configurar-variables-de-entorno)
5. [Paso 4: Crear Tabla de Órdenes en Supabase](#paso-4-crear-tabla-de-órdenes-en-supabase)
6. [Paso 5: Configurar Webhook en ePayco](#paso-5-configurar-webhook-en-epayco)
7. [Paso 6: Probar la Integración](#paso-6-probar-la-integración)
8. [Paso 7: Pasar a Producción](#paso-7-pasar-a-producción)
9. [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

- ✅ Cuenta en ePayco (gratuita para comenzar)
- ✅ Proyecto de Supabase configurado
- ✅ Dominio propio (para producción)
- ✅ Documentos legales del negocio (RUT, cédula, etc.)

---

## Paso 1: Crear Cuenta en ePayco

1. Ve a [https://dashboard.epayco.co/register](https://dashboard.epayco.co/register)
2. Completa el formulario de registro:
   - Nombre del negocio
   - Email empresarial
   - Teléfono
   - País (Colombia)
3. Verifica tu email
4. Completa la información de tu negocio en el dashboard

---

## Paso 2: Obtener Credenciales de API

1. Inicia sesión en [https://dashboard.epayco.co](https://dashboard.epayco.co)
2. Ve a **Configuración** → **API**
3. Encontrarás tres credenciales importantes:

   - **Public Key** (Llave Pública)
   - **Private Key** (Llave Privada)
   - **P Customer ID** (ID de Cliente)

4. **IMPORTANTE:** Guarda estas credenciales de forma segura. NUNCA las compartas públicamente.

### Modo de Prueba (Test)

- ePayco te proporciona automáticamente credenciales de prueba
- Úsalas para hacer pruebas sin procesar pagos reales
- Las credenciales de prueba tienen el prefijo `test_`

---

## Paso 3: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en la raíz de tu proyecto
2. Busca la sección **EPAYCO PAYMENT GATEWAY CONFIGURATION**
3. Reemplaza los valores con tus credenciales reales:

```bash
# ============================================
# EPAYCO PAYMENT GATEWAY CONFIGURATION
# ============================================

# Llave pública de ePayco (se puede usar en el cliente)
NEXT_PUBLIC_EPAYCO_PUBLIC_KEY="tu_public_key_aqui"

# Llave privada de ePayco (NUNCA expongas esto en el cliente)
EPAYCO_PRIVATE_KEY="tu_private_key_aqui"

# P Customer ID de ePayco
EPAYCO_CUST_ID="tu_customer_id_aqui"

# Modo de prueba: "true" para pruebas, "false" para producción
NEXT_PUBLIC_EPAYCO_TEST_MODE="true"

# URLs de confirmación (ajusta según tu dominio)
NEXT_PUBLIC_EPAYCO_CONFIRMATION_URL="https://tu-dominio.com/api/payments/confirmation"
NEXT_PUBLIC_EPAYCO_RESPONSE_URL="https://tu-dominio.com/respuesta-pago"
```

4. **Para desarrollo local**, puedes usar:
```bash
NEXT_PUBLIC_EPAYCO_CONFIRMATION_URL="http://localhost:3000/api/payments/confirmation"
NEXT_PUBLIC_EPAYCO_RESPONSE_URL="http://localhost:3000/respuesta-pago"
```

5. Guarda el archivo `.env.local`

---

## Paso 4: Crear Tabla de Órdenes en Supabase

1. Abre tu proyecto en [https://app.supabase.com](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `supabase-orders-schema.sql`
5. Haz click en **Run** para ejecutar el script
6. Verifica que la tabla `orders` se creó correctamente en **Table Editor**

### Verificar la Tabla

En el SQL Editor, ejecuta:

```sql
SELECT * FROM orders LIMIT 10;
```

Si no hay errores, la tabla está lista.

---

## Paso 5: Configurar Webhook en ePayco

Los webhooks permiten que ePayco notifique a tu servidor cuando un pago se procesa.

### Configuración en ePayco Dashboard

1. Ve a [https://dashboard.epayco.co](https://dashboard.epayco.co)
2. Navega a **Configuración** → **Webhooks**
3. Haz click en **Agregar URL de Confirmación**
4. Ingresa la URL de tu webhook:

   ```
   https://tu-dominio.com/api/payments/confirmation
   ```

5. Selecciona el método: **GET** (también soportamos POST)
6. Guarda los cambios

### Para Desarrollo Local con ngrok

Si quieres probar en local:

1. Instala ngrok: `npm install -g ngrok`
2. Ejecuta: `ngrok http 3000`
3. Copia la URL HTTPS que te da (ej: `https://abc123.ngrok.io`)
4. Úsala en el webhook de ePayco:
   ```
   https://abc123.ngrok.io/api/payments/confirmation
   ```

---

## Paso 6: Probar la Integración

### Tarjetas de Prueba de ePayco

Usa estas tarjetas para probar (solo en modo test):

**Visa - Pago Aprobado:**
- Número: `4575623182290326`
- CVV: `123`
- Fecha de vencimiento: Cualquier fecha futura (ej: 12/2025)

**MasterCard - Pago Rechazado:**
- Número: `5254133674403900`
- CVV: `123`
- Fecha de vencimiento: Cualquier fecha futura

**Diners - Pago Pendiente:**
- Número: `36032428276554`
- CVV: `123`
- Fecha de vencimiento: Cualquier fecha futura

### Flujo de Prueba

1. Inicia tu servidor de desarrollo: `npm run dev`
2. Agrega productos al carrito
3. Haz click en "Pagar con Tarjeta/PSE"
4. Completa el formulario con tus datos
5. En el checkout de ePayco, usa una de las tarjetas de prueba
6. Verifica que:
   - El pago se procesa correctamente
   - Eres redirigido a la página de confirmación
   - La orden se guarda en Supabase
   - El stock se actualiza (si el pago fue aprobado)

---

## Paso 7: Pasar a Producción

### Checklist de Producción

- [ ] Verificar documentación del negocio en ePayco
- [ ] Activar cuenta de producción en ePayco
- [ ] Obtener credenciales de producción (sin prefijo `test_`)
- [ ] Actualizar `.env.local` con credenciales de producción
- [ ] Cambiar `NEXT_PUBLIC_EPAYCO_TEST_MODE` a `"false"`
- [ ] Configurar URLs de producción correctas
- [ ] Probar con tarjeta real (monto pequeño)
- [ ] Configurar notificaciones por email (opcional)
- [ ] Revisar políticas de seguridad en Supabase

### Actualizar Variables de Entorno

```bash
# Credenciales de producción
NEXT_PUBLIC_EPAYCO_PUBLIC_KEY="tu_public_key_produccion"
EPAYCO_PRIVATE_KEY="tu_private_key_produccion"
EPAYCO_CUST_ID="tu_customer_id_produccion"

# Cambiar a modo producción
NEXT_PUBLIC_EPAYCO_TEST_MODE="false"

# URLs de producción
NEXT_PUBLIC_EPAYCO_CONFIRMATION_URL="https://neurai.dev/api/payments/confirmation"
NEXT_PUBLIC_EPAYCO_RESPONSE_URL="https://neurai.dev/respuesta-pago"
```

### Desplegar en Vercel

Si usas Vercel:

1. Ve a tu proyecto en [https://vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Agrega todas las variables de entorno de ePayco
4. Redeploy el proyecto

---

## Solución de Problemas

### Error: "ePayco credentials are not configured"

**Solución:**
- Verifica que las variables de entorno estén configuradas en `.env.local`
- Reinicia el servidor de desarrollo después de modificar `.env.local`
- En producción, asegúrate de configurar las variables en Vercel/Netlify

### El pago se procesa pero no se guarda en la base de datos

**Solución:**
- Verifica que la tabla `orders` existe en Supabase
- Revisa los logs del webhook en `/api/payments/confirmation`
- Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Verifica las políticas de RLS en la tabla `orders`

### El webhook no se ejecuta

**Solución:**
- Verifica que la URL del webhook sea accesible públicamente
- En desarrollo local, usa ngrok
- Revisa la configuración del webhook en ePayco Dashboard
- Verifica que el endpoint soporte GET y POST

### Error 405 en el webhook

**Solución:**
- El endpoint debe soportar tanto GET como POST
- Revisa el archivo `/api/payments/confirmation/route.js`

### Stock no se actualiza después del pago

**Solución:**
- Verifica que el campo `items` en la orden tenga los IDs correctos
- Asegúrate de que la tabla `products` tenga el campo `stock`
- Revisa los logs del webhook para ver errores de actualización

---

## Costos de ePayco

### Comisiones (2025)

- **Tarjetas de crédito/débito:** 2.99% + $700 COP por transacción
- **PSE:** 2.99% + $700 COP por transacción
- **Sin cuota mensual** (solo pagas por transacción exitosa)

### Retiros

- Los fondos se depositan en tu cuenta bancaria en 2-3 días hábiles
- Sin costo adicional por retiro

---

## Seguridad

### Mejores Prácticas

✅ **NUNCA** expongas tu `EPAYCO_PRIVATE_KEY` en el código del cliente
✅ Siempre usa HTTPS en producción
✅ Verifica las firmas de los webhooks (próxima mejora)
✅ Mantén actualizadas las dependencias de seguridad
✅ Usa variables de entorno para todas las credenciales
✅ Habilita autenticación de dos factores en ePayco

---

## Soporte

### Recursos de ePayco

- Documentación oficial: [https://docs.epayco.com](https://docs.epayco.com)
- Soporte: [https://ayuda.epayco.co](https://ayuda.epayco.co)
- Email: soporte@epayco.co
- Teléfono: (+57) 601 432 1986

### Recursos del Proyecto

- Para problemas con la integración, revisa los logs en la consola
- Consulta la documentación de Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
- Documentación de Supabase: [https://supabase.com/docs](https://supabase.com/docs)

---

## Changelog

### v1.0.0 - 2025-02-11
- ✅ Integración inicial con ePayco
- ✅ Checkout con formulario de cliente
- ✅ Webhook de confirmación de pagos
- ✅ Actualización automática de stock
- ✅ Página de respuesta de pago
- ✅ Soporte para tarjetas y PSE
- ✅ Modo test y producción

---

¡Listo! 🎉 Tu integración con ePayco está completa y funcionando.
