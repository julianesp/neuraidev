import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function DamasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=belleza" 
      categoryName="damas"
    />
  );
}