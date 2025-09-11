import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function GeneralesProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=generales" 
      categoryName="generales"
    />
  );
}