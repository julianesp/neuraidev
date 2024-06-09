// import RootLayout from "@/app/layout";
// import EditProductForm from "@/components/EditProductForm";

// const getProductById = async (id) => {
//   try {
//     const res = await fetch(`http://localhost:3000/api/products/${id}`, {
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       throw new Error("No se pudo recuperar el producto");
//     }

//     const data = await res.json();
//     return { product: data };

//     // return res.json();
//   } catch (error) {
//     console.error("Error al obtener el producto:", error);
//     return { product: null };
//     // console.log(error);
//   }
// };

// export const generateStaticParams = async () => {
//   try {
//     const res = await fetch("http://localhost:3000/api/products", {
//       cache: "no-store",
//     });

//     if (!res.ok) {
//       throw new Error("No se pudieron recuperar los productos");
//     }

//     const products = await res.json();

//     // Retorna un array de objetos con los parámetros para las rutas dinámicas
//     return products.map((product) => ({
//       id: product._id.toString(),
//     }));
//   } catch (error) {
//     console.error("Error al obtener los productos:", error);
//     return [];
//   }
// };

// export default async function EditProduct({ params }) {
//   const { id } = params;
//   const { product } = await getProductById(id);

//   if (!product) {
//     // Maneja el caso donde el producto no se encuentra
//     return <div>El accesorio no se ha encontrado</div>;
//   }

//   const { name, image, price, category } = product;

//   return (
//     <RootLayout>
//       <EditProductForm
//         id={id}
//         name={name}
//         image={image}
//         price={price}
//         category={category}
//       />
//     </RootLayout>
//   );
// }

import RootLayout from "@/app/layout";
import EditProductForm from "@/components/EditProductForm";

const getAllProducts = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("No se pudo recuperar los productos");
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error("La respuesta de productos no es un array");
    }

    return data;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};

const getProductById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("No se pudo recuperar el producto");
    }

    return res.json();
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    return null;
  }
};

// Función generateStaticParams
export const generateStaticParams = async () => {
  try {
    const products = await getAllProducts();
    return products.map((product) => ({
      id: product._id.toString(),
    }));
  } catch (error) {
    // Proporciona un valor predeterminado o un array vacío en caso de error
    return [];
  }
};

export default async function EditProduct({ params }) {
  const { id } = params;
  const product = await getProductById(id);

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
