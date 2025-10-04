import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadataForCategory } from "../../../../utils/generateProductMetadata";

// Generar metadatos dinámicos en el servidor
export async function generateMetadata({ params }) {
  return await generateProductMetadataForCategory(params.slug, 'celulares');
}

export default function CelularesProductPage() {
  return (
    <ProductDetailWrapper
      apiUrl="/api/productos?categoria=celulares"
      categoryName="celulares"
    />
  );
}