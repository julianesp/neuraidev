import fs from "fs";
import path from "path";
import Image from "next/image";

export async function getStaticProps({ params }) {
  const filePath = path.join(process.cwd(), "data", "accessories.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const accessories = JSON.parse(jsonData);
  const filteredAccessories = accessories.filter(
    (accessory) => accessory.type === params.type,
  );

  return {
    props: {
      accessories: filteredAccessories,
      type: params.type,
    },
  };
}

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), "data", "accessories.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const accessories = JSON.parse(jsonData);

  const types = [...new Set(accessories.map((item) => item.type))];
  const paths = types.map((type) => ({ params: { type } }));

  return {
    paths,
    fallback: false,
  };
}

export default function AccessoryPage({ accessories, type }) {
  return (
    <div>
      <h1>Accesorios de tipo: {type}</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {accessories.map((accessory) => (
          <div
            key={accessory.id}
            style={{ border: "1px solid #ccc", padding: "16px" }}
          >
            <Image
              src={accessory.image}
              alt={accessory.name}
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            <h3>{accessory.name}</h3>
            <p>Precio: ${accessory.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
