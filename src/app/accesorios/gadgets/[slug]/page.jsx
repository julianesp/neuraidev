import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function GadgetsProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=gadgets" 
      categoryName="gadgets"
    />
  );
}