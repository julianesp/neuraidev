import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'damas');
}

export default function DamasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=belleza" 
      categoryName="damas"
    />
  );
}