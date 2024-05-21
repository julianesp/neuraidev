import Layout from "@/components/Layout";
import Image from "next/image";
import Home from "@/pages/Home";
import Logo from "@/components/Logo";

export default function Inicio() {
  return (
    <Layout>
      <main className="">
        <Home />
        {/* <Logo/> */}
      </main>
    </Layout>
  );
}
