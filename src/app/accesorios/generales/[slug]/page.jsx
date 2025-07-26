import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function GeneralesProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/generales.json" 
      categoryName="generales"
    />
  );
}