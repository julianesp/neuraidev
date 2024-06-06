"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import face from "../../public/assets/redes/facebook.png";
import ins from "../../public/assets/redes/instagram.png";
import tik from "../../public/assets/redes/tiktok.png";
import wha from "../../public/assets/redes/whatsapp.png";
import map from "../../public/map.png";
import arrow from "../../public/next.png";
import phone from "../../public/phone.png";
import styles from "../styles/Footer.module.css";

const Contacto = () => {
  const [menuOption, setMenuOptions] = useState(false);
  const switchOptions = () => {
    setMenuOptions(!menuOption);
  };

  return (
    <div className={styles.footer}>
      <article className={styles.flecha} onClick={switchOptions}>
        <Image alt="Links to navigation" src={arrow} priority />
      </article>

      <article className={styles.description}>
        <p>Servicio de cirugía general</p>
      </article>

      <article className={styles.ubicacion}>
        <p>Sibundoy - Putumayo</p>
        {/* <p>Información: 313-862-7818</p> */}
        <div className={styles.call}>
          Llámame:
          <a href="tel:+3174503604">
            <Image src={phone} alt="Imagen de teléfono" />
          </a>
        </div>
      </article>

      <article
        className={`${styles.redes} ${
          menuOption ? styles.open : styles.closed
        }`}
      >
        <ul>
          <li>
            <Link
              href="https://www.facebook.com/ALIRIO.SOLARTE"
              target="_blank"
              rel="noreferrer"
              passHref
            >
              <Image alt="Facebook" src={face} priority />
            </Link>
          </li>

          <li>
            <Link
              href="https://www.instagram.com/alirio8308/"
              target="_blank"
              rel="noreferrer"
              passHref
            >
              <Image alt="Instagram" src={ins} priority />
            </Link>
          </li>

          <li>
            <Link
              href="https://www.instagram.com/alirio8308/"
              target="_blank"
              rel="noreferrer"
              passHref
            >
              <Image alt="Whatsapp" src={wha} priority />
            </Link>
          </li>

          <li className={styles.tiktok}>
            <Link
              href="https://www.tiktok.com/@cirugia_general?is_from_webapp=1&sender_device=pc"
              target="_blank"
              rel="noreferrer"
              passHref
            >
              <Image alt="TikTok" src={tik} priority />
            </Link>
          </li>
        </ul>
      </article>

      <article className={styles.externo}>
        <a
          href="https://www.flaticon.es/iconos-gratis/facebook"
          title="facebook iconos"
          target="_blank"
          rel="noreferrer"
        >
          Iconos creados por Freepik - Flaticon
        </a>
      </article>
    </div>
  );
};

export default Contacto;
