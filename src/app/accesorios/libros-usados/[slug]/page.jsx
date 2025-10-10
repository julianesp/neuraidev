import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return await generateProductMetadata(slug, 'libros-usados');
}

export default function LibrosUsadosProductPage() {
  return (
    <ProductDetailWrapper
      apiUrl="/api/productos?categoria=libros-usados"
      categoryName="libros usados"
    />
  );
}
