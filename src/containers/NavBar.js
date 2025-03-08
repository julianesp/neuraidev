//navbar

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/NavBar.module.scss";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const NavBar = () => {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const menuRef = useRef(null);

  const menuBurger = () => {
    setBurgerOpen(!burgerOpen);
  };

  const handleLinkClick = () => {
    setBurgerOpen(false); // Close the menu when a link is clicked
  };

  const handleOutsideClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setBurgerOpen(false); // Close the menu when clicking outside
    }
  };

  // to hidden menu nav
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <div className={styles.container} ref={menuRef}>
      <div className={styles.logo}>
        <Link href="/Home">
          <div className={styles["container__principal"]}>
            {/* <Logo /> */}
            <Image
              alt="Logo"
              src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=a3de913f-bf54-4804-812c-710efeeb25d6"
              width={40}
              height={40}
            />
          </div>
        </Link>
      </div>

      <div className={styles.circle} onClick={menuBurger}>
        <button>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div>{/* <ThemeSwitch<er /> */}</div>

      <menu
        className={`${styles["enlaces__menu"]} ${
          burgerOpen ? styles.open : styles.closed
        }`}
      >
        <Link href="/" onClick={handleLinkClick}>
          Inicio
        </Link>

        <Link href="/Blog" onClick={handleLinkClick}>
          Blog
        </Link>

        <Link href="/Store" onClick={handleLinkClick}>
          Tienda
        </Link>

        <Link href="/Profile" onClick={handleLinkClick}>
          Sobre mí
        </Link>
      </menu>
    </div>
  );
};

export default NavBar;
