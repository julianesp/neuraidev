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
        
        // Cargar datos de la categoría
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        
        const data = await response.json();
        let productos = [];
        
        // Manejar diferentes estructuras de datos
        if (Array.isArray(data)) {
          productos = data;
        } else if (data.accesorios && Array.isArray(data.accesorios)) {
          productos = data.accesorios;
        }
        
        // Buscar el producto por slug
        let producto = findProductBySlug(productos, params.slug);
        
        // Debug logging
        // console.log('ProductDetailWrapper Debug:');
        // console.log('- API URL:', apiUrl);
        // console.log('- Slug buscado:', params.slug);
        // console.log('- Total productos:', productos.length);
        // console.log('- Producto encontrado en archivo principal:', producto ? producto.nombre : 'NO ENCONTRADO');
        
        // Si no se encontró en el archivo principal, buscar en otros archivos
        if (!producto) {
          // console.log('- Buscando en otros archivos JSON...');
          
          const otherFilesToSearch = [
            '/computadoras.json',
            '/celulares.json',
            '/bicicletas.json',
            '/gadgets.json',
            '/generales.json',
            '/damas.json',
            '/accesories.json',
            '/accesoriosDestacados.json',
            '/accesoriosNuevos.json',
            '/librosnuevos.json',
            '/librosusados.json'
          ].filter(file => file !== apiUrl); // Excluir el archivo que ya revisamos
          
          for (const file of otherFilesToSearch) {
            try {
              const response = await fetch(file);
              if (!response.ok) continue;
              
              const data = await response.json();
              let productosArchivo = [];
              
              if (Array.isArray(data)) {
                productosArchivo = data;
              } else if (data.accesorios && Array.isArray(data.accesorios)) {
                productosArchivo = data.accesorios;
              }
              
              const productoEncontrado = findProductBySlug(productosArchivo, params.slug);
              if (productoEncontrado) {
                // console.log(`- ¡Producto encontrado en ${file}!`);
                producto = productoEncontrado;
                productos = productosArchivo; // Actualizar lista de productos para "otros productos"
                break;
              }
            } catch (err) {
              continue;
            }
          }
        }
        
        if (!producto) {
          // console.log('- Producto no encontrado en ningún archivo');
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
  }, [params.slug, apiUrl]);

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