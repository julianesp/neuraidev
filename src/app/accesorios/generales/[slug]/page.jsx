import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
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