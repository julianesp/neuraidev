import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";
import { generateProductMetadata } from "../../../../utils/productMetadata";

// Generar metadatos dinámicos
export async function generateMetadata({ params }) {
  const { slug } = params;
  return await generateProductMetadata(slug, 'libros-usados');
}

export default function LibrosUsadosProductPage() {
  return (
    <ProductDetailWrapper
      apiUrl="/api/productos?categoria=libros&condicion=usado"
      categoryName="libros usados"
    />
  );
}
