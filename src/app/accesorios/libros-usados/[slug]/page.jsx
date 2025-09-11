import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function LibrosUsadosProductPage() {
  return (
    <ProductDetailWrapper
      apiUrl="/api/productos?categoria=libros&condicion=usado"
      categoryName="libros usados"
    />
  );
}
