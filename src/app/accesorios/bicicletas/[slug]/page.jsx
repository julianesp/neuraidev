import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function BicicletasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/bicicletas.json" 
      categoryName="bicicletas"
    />
  );
}