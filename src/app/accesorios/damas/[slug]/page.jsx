import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function DamasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/damas.json" 
      categoryName="damas"
    />
  );
}