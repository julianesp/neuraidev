// import { metadata } from "next";
import Layout from "@/components/Layout";
import Image from "next/image";
import Home from "@/pages/Home";
import Logo from "@/components/Logo";

export const metadata = {
  title: 'Mi Página',
  description: 'Descripción de mi página',
}

export default function Inicio() {
  return (
    <Layout>
      <main className="">
        <Home />
      </main>
    </Layout>
  );
}
