"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AccesoriosContainer from "../../../containers/AccesoriosContainer/page";
import { findProductBySlug } from "../../../utils/slugify";

export default function GenericProductPage() {
  const params = useParams();
  const [productData, setProductData] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        
        // Lista de archivos JSON donde buscar el producto (orden por prioridad)
        const filesToSearch = [
          '/computadoras.json',
          '/celulares.json',
          '/bicicletas.json',
          '/gadgets.json',
          '/generales.json',
          '/damas.json',
          '/librosnuevos.json',
          '/librosusados.json',
          '/accesories.json',
          '/accesoriosDestacados.json',
          '/accesoriosNuevos.json',
          '/accesorios_generales.json',
          '/tecnico_sistemas.json',
          '/peluqueria.json',
          '/tienda.json',
          '/presentation.json'
        ];
        
        let foundProduct = null;
        let allProducts = [];
        
        // Buscar en cada archivo hasta encontrar el producto
        for (const file of filesToSearch) {
          try {
            const response = await fetch(file);
            if (!response.ok) continue;
            
            const data = await response.json();
            let productos = [];
            
            // Manejar diferentes estructuras de datos
            if (Array.isArray(data)) {
              productos = data;
            } else if (data.accesorios && Array.isArray(data.accesorios)) {
              productos = data.accesorios;
            }
            
            // Buscar el producto por slug
            const producto = findProductBySlug(productos, params.slug);
            
            if (producto) {
              console.log(`GenericProductPage: Producto encontrado en ${file}: ${producto.nombre || producto.title}`);
              foundProduct = producto;
              allProducts = productos;
              break;
            }
          } catch (err) {
            console.warn(`Error loading ${file}:`, err);
            continue;
          }
        }
        
        if (!foundProduct) {
          setError('Producto no encontrado');
          return;
        }
        
        // Configurar datos
        setProductData(foundProduct);
        
        // Otros productos (excluyendo el actual)
        const otrosProductos = allProducts.filter(p => p.id !== foundProduct.id);
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
  }, [params.slug]);

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
    return (
      <main className="py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-4">
            El producto que buscas no existe o ha sido eliminado.
          </p>
          <a 
            href="/accesorios/generales"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Ver todos los accesorios
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