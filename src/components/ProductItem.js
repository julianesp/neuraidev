// import React, { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import styles from "../styles/ProductItem.module.scss";

// const ProductItem = ({ product }) => {
//   const [currentImage, setCurrentImage] = useState(
//     Array.isArray(product.images) ? product.images[0] : product.images,
//   );

//   const handleImageChange = (index) => {
//     if (Array.isArray(product.images)) {
//       setCurrentImage(product.images[index]);
//     }
//   };

//   return (
//     <div className={styles.productItem}>
//       <Image
//         src={currentImage || "/placeholder.svg"}
//         alt={product.title || "Accesorio"}
//         width={300}
//         height={300}
//         className={styles.images}
//       />

//       <p>{product.title}</p>
//       <p>${product.price}</p>

//       <Link href={`/products/${product.id}`}>Ver</Link>

//       {Array.isArray(product.images) && product.images.length > 1 && (
//         <div className={styles.thumbnails}>
//           {product.images.map((image, index) => (
//             <Image
//               key={index}
//               src={image || "/placeholder.svg"}
//               alt={`Thumbnail ${index + 1}`}
//               width={50}
//               height={50}
//               onClick={() => handleImageChange(index)}
//               className={currentImage === image ? styles.active : ""}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductItem;

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/ProductItem.module.scss";

const ProductItem = ({ product, maxImages }) => {
  const images = useMemo(() => {
    if (Array.isArray(product.images)) {
      return product.images.slice(0, maxImages);
    }
    return [product.images];
  }, [product.images, maxImages]);

  const [currentImage, setCurrentImage] = useState(images[0]);

  const handleImageChange = (index) => {
    setCurrentImage(images[index]);
  };

  return (
    <div className={styles.productItem}>
      <Image
        src={currentImage || "/placeholder.svg"}
        alt={product.title || "Accesorio"}
        width={300}
        height={300}
        className={styles.images}
      />

      <p>{product.title}</p>
      <p>${product.price}</p>

      <Link href={`/products/${product.id}`} className="btn glass">
        Ver
      </Link>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <Image
              key={index}
              src={
                image ||
                "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
              }
              alt={`Thumbnail ${index + 1}`}
              width={100}
              height={100}
              onClick={() => handleImageChange(index)}
              className={currentImage === image ? styles.active : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductItem;
