"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';

const CheckoutForm = ({ subtotal, itemCount, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    // Información de contacto
    email: '',
    telefono: '',

    // Dirección de envío
    nombre: '',
    departamento: '',
    ciudad: '',
    direccion: '',
    codigoPostal: '',
    referencia: '',

    // Opciones de entrega
    metodoEnvio: 'DOMICILIO',
    metodoPago: 'EFECTIVO',
    notas: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar teléfono
    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    // Validar dirección de envío solo si no es recogida local
    if (formData.metodoEnvio !== 'RECOGIDA_LOCAL') {
      if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
      if (!formData.departamento) newErrors.departamento = 'El departamento es requerido';
      if (!formData.ciudad) newErrors.ciudad = 'La ciudad es requerida';
      if (!formData.direccion) newErrors.direccion = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const envio = formData.metodoEnvio === 'RECOGIDA_LOCAL' ? 0 :
                formData.metodoEnvio === 'MOTOTAXI' ? 8000 :
                subtotal >= 100000 ? 0 : 15000;

  const total = subtotal + envio;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información de contacto */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.telefono ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="300 123 4567"
            />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
          </div>
        </div>
      </div>

      {/* Método de envío */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Método de entrega</h2>
        <div className="space-y-3">
          <label htmlFor="envio-domicilio" aria-label="Envío a domicilio" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="envio-domicilio"
              type="radio"
              name="metodoEnvio"
              value="DOMICILIO"
              checked={formData.metodoEnvio === 'DOMICILIO'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Envío a domicilio</span>
                <span className="text-gray-600">
                  {subtotal >= 100000 ? 'Gratis' : '$15.000 COP'}
                </span>
              </div>
              <p className="text-sm text-gray-500">Entrega en 2-5 días hábiles</p>
            </div>
          </label>

          <label htmlFor="envio-mototaxi" aria-label="Envío express por mototaxi" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="envio-mototaxi"
              type="radio"
              name="metodoEnvio"
              value="MOTOTAXI"
              checked={formData.metodoEnvio === 'MOTOTAXI'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Envío express (mototaxi)</span>
                <span className="text-gray-600">$8.000 COP</span>
              </div>
              <p className="text-sm text-gray-500">Entrega el mismo día (zona urbana)</p>
            </div>
          </label>

          <label htmlFor="envio-recogida" aria-label="Recogida en local" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="envio-recogida"
              type="radio"
              name="metodoEnvio"
              value="RECOGIDA_LOCAL"
              checked={formData.metodoEnvio === 'RECOGIDA_LOCAL'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Recogida en local</span>
                <span className="text-gray-600">Gratis</span>
              </div>
              <p className="text-sm text-gray-500">Coordinaremos contigo la recogida</p>
            </div>
          </label>
        </div>
      </div>

      {/* Dirección de envío */}
      {formData.metodoEnvio !== 'RECOGIDA_LOCAL' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de entrega</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.nombre ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre completo"
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <input
                type="text"
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.departamento ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Cundinamarca"
              />
              {errors.departamento && <p className="text-red-500 text-sm mt-1">{errors.departamento}</p>}
            </div>

            <div>
              <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.ciudad ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Bogotá"
              />
              {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.direccion ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Calle 123 #45-67"
              />
              {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
            </div>

            <div>
              <label htmlFor="codigoPostal" className="block text-sm font-medium text-gray-700 mb-2">
                Código postal
              </label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="110111"
              />
            </div>

            <div>
              <label htmlFor="referencia" className="block text-sm font-medium text-gray-700 mb-2">
                Referencia
              </label>
              <input
                type="text"
                id="referencia"
                name="referencia"
                value={formData.referencia}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Casa blanca, portón negro"
              />
            </div>
          </div>
        </div>
      )}

      {/* Método de pago */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Método de pago</h2>
        <div className="space-y-3">
          <label htmlFor="pago-efectivo" aria-label="Pago en efectivo" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="pago-efectivo"
              type="radio"
              name="metodoPago"
              value="EFECTIVO"
              checked={formData.metodoPago === 'EFECTIVO'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3">
              <span className="font-medium">Pago en efectivo</span>
              <p className="text-sm text-gray-500">Pago contra entrega</p>
            </div>
          </label>

          <label htmlFor="pago-transferencia" aria-label="Transferencia bancaria" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="pago-transferencia"
              type="radio"
              name="metodoPago"
              value="TRANSFERENCIA"
              checked={formData.metodoPago === 'TRANSFERENCIA'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3">
              <span className="font-medium">Transferencia bancaria</span>
              <p className="text-sm text-gray-500">Te enviaremos los datos bancarios</p>
            </div>
          </label>

          <label htmlFor="pago-nequi" aria-label="Pago por Nequi" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="pago-nequi"
              type="radio"
              name="metodoPago"
              value="NEQUI"
              checked={formData.metodoPago === 'NEQUI'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3">
              <span className="font-medium">Nequi</span>
              <p className="text-sm text-gray-500">Pago por Nequi</p>
            </div>
          </label>

          <label htmlFor="pago-epayco" aria-label="Pago en línea con ePayco" className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              id="pago-epayco"
              type="radio"
              name="metodoPago"
              value="EPAYCO"
              checked={formData.metodoPago === 'EPAYCO'}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600"
            />
            <div className="ml-3 flex items-center">
              <span className="font-medium">Pago en línea</span>
              <div className="ml-2 flex items-center gap-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">ePayco</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Tarjetas de crédito/débito, PSE, Efecty, Baloto</p>
            </div>
          </label>
        </div>
      </div>

      {/* Notas adicionales */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas adicionales</h2>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Instrucciones especiales para la entrega..."
        />
      </div>

      {/* Resumen del pedido */}
      <div className="bg-gray-50 rounded-lg p-6 sticky bottom-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({itemCount} productos)</span>
            <span>${subtotal.toLocaleString()} COP</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>{envio === 0 ? 'Gratis' : `$${envio.toLocaleString()} COP`}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toLocaleString()} COP</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando pedido...
            </div>
          ) : (
            'Confirmar pedido'
          )}
        </button>
      </div>
    </form>
  );
};

const CheckoutSummary = ({ items }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tu pedido</h2>
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {items.map(item => {
        const precio = parseFloat(item.producto.precio);
        const subtotal = precio * item.cantidad;
        const imagen = item.producto.imagenes?.[0]?.url || item.producto.imagenPrincipal;

        return (
          <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
              {imagen ? (
                <Image
                  src={imagen}
                  alt={item.producto.nombre}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {item.producto.nombre}
              </h3>
              <p className="text-sm text-gray-500">
                Cantidad: {item.cantidad}
              </p>
              <p className="text-sm font-medium text-gray-900">
                ${subtotal.toLocaleString()} COP
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default function CheckoutPage() {
  const { items, itemCount, subtotal, loading: cartLoading } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Configurar metadatos
    document.title = 'Checkout | Neurai.dev';

    // Redirigir si el carrito está vacío
    if (!cartLoading && items.length === 0) {
      router.push('/carrito');
    }
  }, [cartLoading, items.length, router]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const direccionEnvio = formData.metodoEnvio !== 'RECOGIDA_LOCAL' ? {
        nombre: formData.nombre,
        telefono: formData.telefono,
        departamento: formData.departamento,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        codigoPostal: formData.codigoPostal,
        referencia: formData.referencia,
      } : null;

      const payload = {
        direccionEnvio,
        metodoEnvio: formData.metodoEnvio,
        metodoPago: formData.metodoPago,
        notas: formData.notas,
        emailInvitado: formData.email,
      };

      // Crear el pedido primero
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // Si es pago con ePayco, procesar el pago en línea
        if (formData.metodoPago === 'EPAYCO') {
          await processEpaycoPayment(data.pedido.numero);
        } else {
          // Para otros métodos de pago, ir directo a confirmación
          router.push(`/pedido-confirmado?numero=${data.pedido.numero}`);
        }
      } else {
        setError(data.error || 'Error al procesar el pedido');
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const processEpaycoPayment = async (pedidoNumero) => {
    try {
      const response = await fetch('/api/epayco/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pedidoNumero }),
      });

      const data = await response.json();

      if (data.success) {
        // Crear formulario para enviar a ePayco
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://checkout.epayco.co/checkout.jsp';
        form.target = '_self';

        // Agregar todos los parámetros como campos ocultos
        Object.entries(data.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        // Enviar formulario
        document.body.appendChild(form);
        form.submit();
      } else {
        setError(data.error || 'Error al inicializar el pago');
      }
    } catch (err) {
      console.error('Error procesando pago ePayco:', err);
      setError('Error al conectar con el sistema de pagos');
    }
  };

  if (cartLoading) {
    return (
      <main className="min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return null; // El useEffect redirigirá
  }

  return (
    <main className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/carrito" className="hover:text-gray-700">Carrito</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>

          <h1 className="text-3xl font-bold text-gray-900">
            Finalizar compra
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-2 text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2">
            <CheckoutForm
              subtotal={subtotal}
              itemCount={itemCount}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <CheckoutSummary items={items} />
          </div>
        </div>
      </div>
    </main>
  );
}