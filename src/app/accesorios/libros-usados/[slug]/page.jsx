import ProductDetailWrapper from "../../../../components/ProductDetailWrapper";

export default function LibrosUsadosProductPage() {
  return (
    <ProductDetailWrapper 
      apiUrl="/librosusados.json" 
      categoryName="libros usados"
    />
  );
}