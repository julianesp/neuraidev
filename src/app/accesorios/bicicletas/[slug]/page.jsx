import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function BicicletasProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/api/productos?categoria=bicicletas" 
      categoryName="bicicletas"
    />
  );
}