// import { useState, useEffect } from "react";
// import axios from "axios";

// // funcion que se va a exportar
// const useGetProducts = (API) => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     // Declarar una función asíncrona dentro del efecto
//     const fetchData = async () => {
//       try {
//         // Llamada a la API
//         const response = await axios(API);
//         setProducts(response.data); // Actualizar el estado con los datos
//       } catch (error) {
//         console.error("Error fetching data:", error); // Manejo de errores
//       }
//     };

//     // Llamar a la función asíncrona
//     fetchData();
//   }, [API]); // Dependencias del efecto

//   return products;
// };

// // exportamos la funcion
// export default useGetProducts;

// import { useState, useEffect } from "react";
// import axios from "axios";

// const useGetProducts = (API) => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await axios(API);
//         setProducts(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setError("Error al cargar los productos");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [API]);

//   return { products, loading, error };
// };

// export default useGetProducts;

import { useState, useEffect } from "react";
import axios from "axios";

const useGetProducts = (API) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios(API);
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los productos");
        setLoading(false);
      }
    };

    fetchData();
  }, [API]);

  return { products, loading, error };
};

export default useGetProducts;
