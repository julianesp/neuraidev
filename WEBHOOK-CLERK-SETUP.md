# 🔗 Configuración del Webhook de Clerk

Este webhook es **FUNDAMENTAL** para sincronizar los usuarios de Clerk con Supabase.

## ¿Por qué es importante?

Cuando un usuario se registra en Clerk, necesitamos crear automáticamente su perfil en Supabase (tabla `profiles`). Sin esto, los usuarios no podrán crear tiendas ni productos.

## 📋 Pasos para configurar el webhook:

### 1. Determinar tu URL de webhook

Tu webhook estará en:
```
https://neurai.dev/api/webhooks/clerk
```

**IMPORTANTE:** Si estás en desarrollo local, necesitarás usar un servicio como **ngrok** para exponer tu localhost:

```bash
# Instalar ngrok (si no lo tienes)
npm install -g ngrok

# Exponer tu localhost:3000
ngrok http 3000

# Copiará una URL como: https://abc123.ngrok.io
# Tu webhook sería: https://abc123.ngrok.io/api/webhooks/clerk
```

### 2. Ir al Dashboard de Clerk

1. Ve a https://dashboard.clerk.com
2. Selecciona tu aplicación
3. En el menú lateral, busca **"Webhooks"**
4. Click en **"Add Endpoint"**

### 3. Configurar el endpoint

Completa los campos:

**Endpoint URL:**
```
https://neurai.dev/api/webhooks/clerk
```
(O tu URL de ngrok si estás en desarrollo)

**Subscribe to events:**
Marca estos 3 eventos:
- ✅ `user.created` - Cuando se crea un nuevo usuario
- ✅ `user.updated` - Cuando un usuario actualiza su perfil
- ✅ `user.deleted` - Cuando un usuario elimina su cuenta

### 4. Guardar el Signing Secret

Después de crear el webhook, Clerk te mostrará un **"Signing Secret"**.

**IMPORTANTE:** Copia ese secret y agrégalo a tu `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxx
```

El secret se ve algo así: `whsec_1234567890abcdefghijklmnopqrstuvwxyz`

### 5. Verificar que funciona

#### Opción A: Probar en producción

1. Despliega tu sitio en Vercel
2. Regístrate con un nuevo usuario
3. Ve a Supabase > Table Editor > `profiles`
4. Deberías ver el nuevo usuario creado automáticamente

#### Opción B: Probar en local con ngrok

1. Inicia tu servidor local:
   ```bash
   npm run dev
   ```

2. En otra terminal, inicia ngrok:
   ```bash
   ngrok http 3000
   ```

3. Copia la URL de ngrok (ej: `https://abc123.ngrok.io`)

4. Ve a Clerk Dashboard > Webhooks > Edita tu webhook
5. Cambia temporalmente la URL a: `https://abc123.ngrok.io/api/webhooks/clerk`

6. Regístrate con un nuevo usuario de prueba

7. Revisa:
   - Los logs de tu terminal (deberías ver el webhook recibido)
   - Supabase > `profiles` (debería aparecer el usuario)

### 6. Ver logs del webhook en Clerk

Clerk te permite ver si los webhooks están funcionando:

1. Ve a **Webhooks** en Clerk Dashboard
2. Click en tu webhook
3. Click en **"Logs"** o **"Recent Deliveries"**
4. Verás cada webhook enviado, su status y la respuesta

**Status esperados:**
- ✅ `200` - Webhook procesado correctamente
- ❌ `400` - Error de validación
- ❌ `500` - Error en el servidor

## 🆘 Solución de problemas

### Error: "Missing svix headers"
- El webhook no está configurado correctamente en Clerk
- Verifica que la URL sea exactamente `/api/webhooks/clerk`

### Error: "Verification failed"
- El `CLERK_WEBHOOK_SECRET` en `.env.local` no es correcto
- Copia nuevamente el secret desde Clerk Dashboard

### El usuario se crea en Clerk pero no en Supabase
- Revisa los logs del webhook en Clerk Dashboard
- Verifica que el endpoint esté respondiendo 200
- Revisa los logs de tu servidor Next.js

### Error: "Error creating profile in Supabase"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Verifica que las tablas existan en Supabase
- Revisa las políticas RLS (el service role key debería bypass RLS)

## 📝 Código del webhook

El código está en: `/src/app/api/webhooks/clerk/route.js`

Maneja 3 eventos:
1. **user.created** → Crea perfil en Supabase
2. **user.updated** → Actualiza perfil en Supabase
3. **user.deleted** → Elimina perfil en Supabase (y tiendas por CASCADE)

## ✅ Próximos pasos

Una vez configurado el webhook:

1. ✅ Prueba registrando un usuario
2. ✅ Verifica que aparezca en Supabase
3. ✅ Continúa con la implementación del Dashboard

---

**¿Necesitas ayuda?** Si el webhook no funciona, revisa los logs tanto en Clerk Dashboard como en tu consola de Next.js.
