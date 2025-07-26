import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function GadgetsProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/gadgets.json" 
      categoryName="gadgets"
    />
  );
}