import { useState, useEffect } from "react";
import axios from "axios";

// funcion que se va a exportar
const useGetProducts = (API) => {
  const [products, setProducts] = useState([]);

  useEffect(async () => {
    const response = await axios(API);
    setProducts(response.data);
  }, []);

  return products;
};

// exportamos la funcion
export default useGetProducts;
