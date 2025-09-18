import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'gadgets');
}

export default function GadgetsProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=gadgets" 
      categoryName="gadgets"
    />
  );
}