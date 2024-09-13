import RootLayout from "@/app/layout";
import React from "react";

const Blog = () => {
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
