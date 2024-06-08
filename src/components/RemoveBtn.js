//components\RemoveBtn.jsx
"use client";

import { useRouter } from "next/navigation";

export default function RemoveBtn({ id }) {
  const router = useRouter();
  const removeProduct = async () => {
    const confirmed = confirm("¿Seguro que quieres eliminar el accesorio?");

    if (confirmed) {
      const res = await fetch(`http://localhost:3000/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      }
    }
  };

  return (
    <button onClick={removeProduct} className="btn btn-error ml-2">
      Eliminar
    </button>
  );
}
