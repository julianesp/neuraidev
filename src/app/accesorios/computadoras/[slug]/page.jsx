import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function ComputadorasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=computadoras" 
      categoryName="computadoras"
    />
  );
}