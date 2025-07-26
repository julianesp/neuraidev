import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function LibrosNuevosProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/librosnuevos.json" 
      categoryName="libros nuevos"
    />
  );
}