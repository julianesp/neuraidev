import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function CelularesProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=celulares" 
      categoryName="celulares"
    />
  );
}