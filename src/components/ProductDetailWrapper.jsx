"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AccesoriosContainer from "../containers/AccesoriosContainer/page";
import { findProductBySlug } from "../utils/slugify";

export default function ProductDetailWrapper({ apiUrl, categoryName }) {
  const params = useParams();
  const [productData, setProductData] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // Usar la API de productos en lugar de archivos JSON
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        
        const data = await response.json();
        let productos = [];
        
        // Manejar la estructura de la API
        if (data.productos && Array.isArray(data.productos)) {
          productos = data.productos;
        } else if (Array.isArray(data)) {
          productos = data;
        }
        
        // Buscar el producto por slug
        let producto = findProductBySlug(productos, params.slug);
        
        // Si no se encontró el producto en la categoría actual, buscar en todas las categorías
        if (!producto) {
          const categoriasParaBuscar = [
            'celulares',
            'computadoras', 
            'bicicletas',
            'gadgets',
            'generales',
            'damas',
            'libros-nuevos',
            'libros-usados'
          ];
          
          // Buscar en todas las categorías
          for (const categoria of categoriasParaBuscar) {
            if (categoria === categoryName) continue; // Ya buscamos en la categoría actual
            
            try {
              const response = await fetch(`/api/productos?categoria=${categoria}`);
              if (!response.ok) continue;
              
              const data = await response.json();
              const productosCategoria = data.productos || data || [];
              
              const productoEncontrado = findProductBySlug(productosCategoria, params.slug);
              if (productoEncontrado) {
                producto = productoEncontrado;
                productos = productosCategoria;
                break;
              }
            } catch (err) {
              continue;
            }
          }
        }
        
        if (!producto) {
          setError('Producto no encontrado');
          return;
        }
        
        // Configurar datos
        setProductData(producto);
        
        // Otros productos (excluyendo el actual)
        const otrosProductos = productos.filter(p => p.id !== producto.id);
        setOtherProducts(otrosProductos);
        
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadProductData();
    }
  }, [params.slug, apiUrl, categoryName]);

  if (loading) {
    return (
      <main className="py-14">
        <div className="max-w-6xl mx-auto px-4 flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  if (error || !productData) {
    const categorySlug = apiUrl.replace(/^\//, '').replace(/\.json$/, '');
    
    return (
      <main className="py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-4">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <a 
            href={`/accesorios/${categorySlug}`}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Ver todos los accesorios de {categoryName}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="py-14">
      <div className="max-w-6xl mx-auto px-4">
        <AccesoriosContainer
          accesorio={productData}
          otrosAccesorios={otherProducts}
        />
      </div>
    </main>
  );
}