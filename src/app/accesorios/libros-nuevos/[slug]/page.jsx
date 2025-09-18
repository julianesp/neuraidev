import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'libros-nuevos');
}

export default function LibrosNuevosProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=libros&condicion=nuevo" 
      categoryName="libros nuevos"
    />
  );
}