import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function CelularesProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/celulares.json" 
      categoryName="celulares"
    />
  );
}