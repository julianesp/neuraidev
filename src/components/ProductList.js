import Link from "next/link";
import RemoveBtn from "./RemoveBtn";
import Image from "next/image";

const getProducts = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return res.json();
  } catch (error) {
    console.log("Error al cargar productos: ", error);
  }
};

export default async function ProductsList() {
  const result = await getProducts();

  if (!result || !result.products) {
    // Maneja el caso donde no hay productos
    return <div>No products found</div>;
  }

  const { products } = await getProducts();

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center">
          <h1 className="font-bold py-10 text-2xl">Listado de accesorios</h1>
        </div>
        <div className="text-right">
          <Link className="btn btn-primary" href={"/addProduct"}>
            Add Product
          </Link>
        </div>

        {/* tabla para mostrar productos */}
        <table className="table">
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((rs) => (
              <tr className="hover" key={rs._id}>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <Image
                          src={rs.image}
                          alt={rs.name}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{rs.name}</div>
                    </div>
                  </div>
                </td>
                <td>${rs.price}</td>
                <td>{rs.category}</td>
                <th>
                  <Link href={`/editProduct/${rs._id}`}>
                    <button className="btn btn-primary">Edit</button>
                  </Link>
                  <RemoveBtn id={rs._id} />
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
