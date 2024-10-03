"use client";

import { React, useState, useEffect } from "react";
import RootLayout from "@/app/layout";
import Link from "next/link";
import styles from "@/styles/Services.module.scss";

const Services = () => {
  // Solution for hydratation errors
  // const [isLoaded, setIsLoaded] = useState(false);
  // useEffect(() => {
  //   setIsLoaded(true);
  // }, []);
  // if (!isLoaded) return null;

  return (
    // <RootLayout>
    <>
      <div className={styles.area}>
        <h3>Servicios</h3>

        <ul>
          <li>Formateo PC</li>
          <li>Mantenimiento PC</li>
          <li>Instalación programas</li>
          <li>Desarrollo páginas web</li>
        </ul>

        <Link href="/Services">Ver más</Link>
      </div>
      {/* </RootLayout>*/}
    </>
  );
};

export default Services;
