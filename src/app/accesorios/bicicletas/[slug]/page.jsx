import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'bicicletas');
}

export default function BicicletasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=bicicletas" 
      categoryName="bicicletas"
    />
  );
}