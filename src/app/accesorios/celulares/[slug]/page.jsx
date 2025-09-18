import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'celulares');
}

export default function CelularesProductPage() {
  return (
    <ProductDetailWrapper
      apiUrl="/api/productos?categoria=celulares"
      categoryName="celulares"
    />
  );
}