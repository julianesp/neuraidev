'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

export default function AddToCartButton({ producto }) {
  const { addToCart, checkStock } = useCart();
  const toast = useToast();
  const [cantidad, setCantidad] = useState(1);
  const [variacionSeleccionada, setVariacionSeleccionada] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stockDisponible, setStockDisponible] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalizar datos del producto para manejar diferentes formatos
  const productData = {
    id: producto.id,
    nombre: producto.title || producto.nombre || 'Producto',
    precio: parseFloat(
      (producto.price || producto.precio || 0).toString().replace(/[^\d.-]/g, '')
    ),
    imagen: Array.isArray(producto.images)
      ? producto.images[0]
      : Array.isArray(producto.imagenes)
      ? producto.imagenes[0]
      : producto.imagen || '/placeholder.jpg',
    categoria: producto.categoria || 'general'
  };

  // Cargar stock disponible al montar el componente
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stock = await checkStock(producto.id);
        setStockDisponible(stock);
      } catch (error) {
        console.error('Error al cargar stock:', error);
        setStockDisponible(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, [producto.id, checkStock]);

  // Detectar si el producto tiene variaciones (por ejemplo, color)
  const tieneVariaciones = producto.variaciones && producto.variaciones.length > 0;

  const handleAddToCart = async () => {
    if (tieneVariaciones && !variacionSeleccionada) {
      toast.warning('Por favor selecciona una variación', {
        title: 'Variación Requerida',
        duration: 4000
      });
      return;
    }

    const success = await addToCart(productData, cantidad, variacionSeleccionada);

    if (!success) {
      return;
    }

    // Mostrar mensaje de éxito
    toast.success(`${cantidad} ${cantidad > 1 ? 'unidades agregadas' : 'unidad agregada'} al carrito`, {
      title: '¡Producto Agregado!',
      duration: 3000
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCantidad(1);
      setVariacionSeleccionada(null);
    }, 2000);
  };

  const incrementar = () => {
    if (stockDisponible !== null && cantidad >= stockDisponible) {
      toast.warning(`Solo hay ${stockDisponible} unidades disponibles`, {
        title: 'Stock Limitado',
        duration: 3000
      });
      return;
    }
    setCantidad(prev => prev + 1);
  };

  const decrementar = () => setCantidad(prev => (prev > 1 ? prev - 1 : 1));

  // Si aún está cargando el stock
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Si no hay stock disponible
  if (stockDisponible === 0) {
    return (
      <div className="space-y-3">
        <div className="w-full px-4 py-2.5 rounded-lg font-medium bg-gray-300 text-gray-600 text-center">
          Sin Stock Disponible
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selector de variaciones si existen */}
      {tieneVariaciones && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Selecciona una opción:
          </div>
          <div className="flex flex-wrap gap-2">
            {producto.variaciones.map((variacion, index) => (
              <button
                key={index}
                onClick={() => setVariacionSeleccionada(variacion)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  variacionSeleccionada === variacion
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {variacion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de stock */}
      <div className="text-sm text-gray-600">
        <span className={stockDisponible <= 5 ? 'text-orange-600 font-semibold' : ''}>
          {stockDisponible <= 5 ? '¡Últimas unidades! ' : ''}
          Stock disponible: <strong>{stockDisponible}</strong>
        </span>
      </div>

      {/* Selector de cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Cantidad:</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={decrementar}
            className="p-2 hover:bg-gray-100 transition-colors"
            aria-label="Disminuir cantidad"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-1 font-semibold min-w-[3ch] text-center">
            {cantidad}
          </span>
          <button
            onClick={incrementar}
            className="p-2 hover:bg-gray-100 transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Botón de agregar al carrito */}
      <button
        onClick={handleAddToCart}
        disabled={showSuccess}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
          showSuccess
            ? 'bg-green-500 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
        }`}
      >
        {showSuccess ? (
          <>
            <span>✓</span>
            <span>¡Agregado!</span>
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            <span>Agregar al Carrito</span>
          </>
        )}
      </button>
    </div>
  );
}
