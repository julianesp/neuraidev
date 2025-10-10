import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
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