import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'generales');
}

export default function GeneralesProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=generales" 
      categoryName="generales"
    />
  );
}