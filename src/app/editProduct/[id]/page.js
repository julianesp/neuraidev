//app\editProduct\[id]\page.js
// import EditProductForm from "@/components/EditProductForm";
import RootLayout from "@/app/layout";
import EditProductForm from "@/components/EditProductForm";

const getProductById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("No se pudo recuperar el producto");
    }

    const data = await res.json();
    return { product: data };

    // return res.json();
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return { product: null };
    // console.log(error);
  }
};

export default async function EditProduct({ params }) {
  const { id } = params;
  const { product } = await getProductById(id);

  if (!product) {
    // Maneja el caso donde el producto no se encuentra
    return <div>El accesorio no se ha encontrado</div>;
  }

  const { name, image, price, category } = product;

  return (
    <RootLayout>
      <EditProductForm
        id={id}
        name={name}
        image={image}
        price={price}
        category={category}
      />
    </RootLayout>
  );
}
