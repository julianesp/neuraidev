import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'computadoras');
}

export default function ComputadorasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=computadoras" 
      categoryName="computadoras"
    />
  );
}