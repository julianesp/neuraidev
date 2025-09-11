import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function LibrosNuevosProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=libros&condicion=nuevo" 
      categoryName="libros nuevos"
    />
  );
}