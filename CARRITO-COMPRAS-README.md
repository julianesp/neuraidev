# Sistema de Carrito de Compras

## Descripción

Se ha implementado un sistema completo de carrito de compras con las siguientes características:

### Funcionalidades Implementadas

1. **Context API para el Carrito** (`src/context/CartContext.jsx`)
   - Gestión global del estado del carrito
   - Persistencia en localStorage
   - Funciones para agregar, eliminar y actualizar productos
   - Cálculo automático de totales

2. **Componente de Botón "Agregar al Carrito"** (`src/components/AddToCartButton.jsx`)
   - Selector de cantidad con botones +/-
   - Soporte para variaciones de productos (colores, tamaños, etc.)
   - Feedback visual al agregar productos
   - Manejo de diferentes formatos de datos de productos

3. **Vista del Carrito de Compras** (`src/components/ShoppingCart.jsx`)
   - Panel deslizable desde la derecha
   - Vista de todos los productos agregados
   - Control de cantidades directamente en el carrito
   - Botón para eliminar productos
   - Cálculo de total en tiempo real
   - Botón "Vaciar Carrito"

4. **Icono de Carrito en el Header** (`src/components/CartIcon.jsx`)
   - Icono de carrito en la navegación principal
   - Contador de items en tiempo real
   - Click para abrir/cerrar el carrito

5. **Integración en Tarjetas de Productos**
   - Botones de agregar al carrito en `ModernProductGrid.jsx`
   - Componente completo en páginas de detalle de producto (`AccesoriosContainer`)

6. **Checkout vía WhatsApp**
   - Genera mensaje automático con todos los productos
   - Incluye cantidades, variaciones y precios
   - Calcula el total del pedido
   - Redirige a WhatsApp para coordinar el pago

## Configuración del Número de WhatsApp

Para configurar tu número de WhatsApp donde recibirás los pedidos:

1. Abre el archivo: `src/components/ShoppingCart.jsx`

2. Busca la línea 36 (aproximadamente):
   ```javascript
   const numeroWhatsApp = '573172754621'; // Ejemplo: +57 317 275 4621
   ```

3. Reemplaza el número con tu número de WhatsApp en formato internacional:
   - **Formato**: Código de país + número (sin espacios, sin guiones, sin el símbolo +)
   - **Ejemplo Colombia**: `573172754621` para el número +57 317 275 4621
   - **Ejemplo México**: `5215512345678` para el número +52 1 55 1234 5678
   - **Ejemplo España**: `34612345678` para el número +34 612 345 678

4. Guarda el archivo y los cambios se aplicarán automáticamente.

## Estructura de Archivos Creados/Modificados

### Archivos Nuevos
- `src/context/CartContext.jsx` - Context API del carrito
- `src/components/ShoppingCart.jsx` - Vista del carrito
- `src/components/CartIcon.jsx` - Icono del carrito en navbar
- `src/components/AddToCartButton.jsx` - Botón para agregar productos

### Archivos Modificados
- `src/app/layout.js` - Agregado CartProvider y ShoppingCart
- `src/components/NavBar.js` - Agregado CartIcon
- `src/components/ModernProductGrid.jsx` - Integrado botón de carrito
- `src/containers/AccesoriosContainer/page.jsx` - Integrado AddToCartButton

## Cómo Usar el Carrito

### Para los Usuarios

1. **Navegar productos**: Los usuarios pueden ver productos en las diferentes categorías
2. **Agregar al carrito**:
   - En tarjetas de productos: Click en el icono de carrito verde
   - En página de detalle: Seleccionar cantidad, variaciones (si hay) y click en "Agregar al Carrito"
3. **Ver carrito**: Click en el icono de carrito en la navegación superior
4. **Modificar cantidad**: Usar los botones +/- en cada producto del carrito
5. **Eliminar productos**: Click en el icono de basura
6. **Realizar pedido**: Click en "Pagar por WhatsApp"
   - Se abrirá WhatsApp con un mensaje pre-formateado
   - El mensaje incluye todos los productos, cantidades y total
   - El usuario puede coordinar el método de pago directamente por WhatsApp

### Para Productos con Variaciones

Si un producto tiene variaciones (por ejemplo, diferentes colores):

1. En el archivo de datos del producto, agregar un campo `variaciones`:
   ```javascript
   {
     "id": "123",
     "nombre": "Camiseta",
     "precio": 25000,
     "variaciones": ["Rojo", "Azul", "Verde", "Negro"]
   }
   ```

2. El componente AddToCartButton detectará automáticamente las variaciones y mostrará botones para seleccionarlas.

## Ejemplo de Mensaje de WhatsApp

Cuando un usuario hace click en "Pagar por WhatsApp", se genera un mensaje como este:

```
*Hola! Quiero realizar este pedido:*

1. *Memoria RAM DDR4 8GB*
   Cantidad: 2
   Precio unitario: $45000.00
   Subtotal: $90000.00

2. *Mouse Inalámbrico*
   Cantidad: 1
   Precio unitario: $35000.00
   Variación: Negro
   Subtotal: $35000.00

*TOTAL: $125000.00*

Quisiera coordinar el medio de pago.
```

## Persistencia de Datos

El carrito guarda automáticamente los productos en `localStorage`, por lo que:
- Los productos permanecen aunque el usuario cierre el navegador
- Se recuperan automáticamente al volver a visitar el sitio
- Se limpian cuando el usuario vacía el carrito o completa una compra

## Soporte

Si tienes problemas o preguntas sobre la implementación, revisa:
1. La consola del navegador para errores
2. Que el número de WhatsApp esté correctamente formateado
3. Que los productos tengan los campos necesarios (id, nombre, precio, imagen)

## Próximas Mejoras Sugeridas

- Agregar animaciones al agregar productos
- Implementar códigos de descuento
- Guardar pedidos en una base de datos
- Integración con pasarelas de pago
- Sistema de notificaciones por email
