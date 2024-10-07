"use client";

import RootLayout from "@/app/layout";
import { React, useState, useEffect } from "react";

const Blog = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <section
        className={`flex justify-center items-center text-center h-screen  mt-9 `}
      >
        <h1 className="text-2xl">Espacio para mis publicaciones</h1>
      </section>
    </RootLayout>
  );
};

export default Blog;
