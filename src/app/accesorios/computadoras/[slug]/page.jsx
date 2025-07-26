import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function ComputadorasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/computadoras.json" 
      categoryName="computadoras"
    />
  );
}