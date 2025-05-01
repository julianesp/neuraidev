"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import face from "../../public/assets/redes/facebook.png";
import ins from "../../public/assets/redes/instagram.png";
import tik from "../../public/assets/redes/tiktok.png";
import wha from "../../public/assets/redes/whatsapp.png";
import arrow from "../../public/next.png";
import styles from "../styles/components/Footer.module.scss";

const Footer = () => {
  const [menuOption, setMenuOptions] = useState(false);
  const menuRef = useRef(null);
  const flechaRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const switchOptions = () => {
    setMenuOptions(!menuOption);
  };

  useEffect(() => {
    // Función para manejar el scroll y detectar si estamos en el fondo
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;
      setIsAtBottom(isBottom);
    };

    // Función para cerrar el menú cuando se hace clic fuera
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        flechaRef.current &&
        !flechaRef.current.contains(event.target)
      ) {
        setMenuOptions(false); // Oculta las redes sociales si haces clic fuera
      }
    };

    // Agregar los event listeners
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    // Limpiar event listeners al desmontar el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <footer className={styles.footer}>
      <button ref={flechaRef} className={styles.flecha} onClick={switchOptions}>
        <Image
          alt="Links to navigation"
          src={arrow}
          priority
          width={30}
          height={30}
        />
      </button>

      <article className={styles.description}>
        <h3>neurai.dev</h3>
      </article>

      <article className={styles.information}>
        <h2>Información</h2>
        <h3>
          <Link href="/politicas">Políticas de privacidad</Link>
        </h3>
        <h3>
          <Link href="/clientes">Atención al cliente</Link>
        </h3>
      </article>

      <article className={styles.ubicacion}>
        <p>Colón - Putumayo</p>
      </article>

      <article
        ref={menuRef}
        className={`${styles.redes} ${menuOption ? styles.open : styles.closed}`}
      >
        <ul>
          <li>
            <Link
              href="https://www.facebook.com/profile.php?id=100085485673809"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                alt="Facebook"
                src={face}
                priority
                width={40}
                height={40}
              />
            </Link>
          </li>
          <li>
            <Link
              href="https://www.instagram.com/alexriob/"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                alt="Instagram"
                src={ins}
                priority
                width={40}
                height={40}
              />
            </Link>
          </li>
          <li>
            <Link
              href="https://wa.me/573174503604"
              target="_blank"
              rel="noreferrer"
            >
              <Image alt="Whatsapp" src={wha} priority width={40} height={40} />
            </Link>
          </li>
          <li className={styles.tiktok}>
            <Link
              href="https://www.tiktok.com/@julii1295?_t=8n2OQ52Q4aD&_r=1"
              target="_blank"
              rel="noreferrer"
            >
              <Image alt="TikTok" src={tik} priority width={40} height={40} />
            </Link>
          </li>
        </ul>
      </article>
    </footer>
  );
};

export default Footer;
