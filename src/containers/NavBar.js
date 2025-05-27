"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/components/NavBar.module.scss";
import ThemeSwitcher from "../components/ThemeSwitcher";

// IDs especificos para cada categpria de accesorios
const CATEGORIA_IDS = {
  CELULARES: "celulares",
  COMPUTADORES: "computadores",
  DAMAS: "damas",
  LIBROS_NUEVOS: "libros-nuevos",
  LIBROS_USADOS: "libros-usados",
};

const NavBar = () => {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);

  const menuBurger = () => {
    setBurgerOpen(!burgerOpen);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const handleLinkClick = () => {
    setBurgerOpen(false); // Close the menu when a link is clicked
    setDropdownOpen(false); // Close the dropdown when a link is clicked
  };

  const handleOutsideClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setBurgerOpen(false); // Close the menu when clicking outside
    }

    // Close dropdown when clicking outside of it
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  // to hidden menu nav
  useEffect(() => {
    setIsLoaded(true);
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  if (!isLoaded) return null;

  return (
    <div className={styles.container} ref={menuRef}>
      <div className={styles.logo}>
        <Link href="/">
          <div className={styles.container__principal}>
            <Image
              alt="Logo"
              src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb"
              width={30}
              height={30}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      </div>

      <div className={styles.themeSwitcher}>
        <ThemeSwitcher />
      </div>
      <nav className={styles.nav_container}>
        <ul
          className={`${styles.enlaces__menu} ${
            burgerOpen ? styles.open : styles.closed
          }`}
        >
          <li>
            <Link href="/" onClick={handleLinkClick}>
              Inicio
            </Link>
          </li>
          <li>
            <Link href="/Blog" onClick={handleLinkClick}>
              Blog
            </Link>
          </li>
          <li className={styles.dropdown} ref={dropdownRef}>
            <button
              href="#"
              onClick={toggleDropdown}
              className={styles.dropdown_toggle}
            >
              Tienda
              <span className={styles.dropdown_arrow}>▼</span>
            </button>
            <ul
              className={`${styles.dropdown_menu} ${dropdownOpen ? styles.show : ""}`}
            >
              <li>
                <Link href={`/accesorios/celulares`} onClick={handleLinkClick}>
                  Accesorios celulares
                </Link>
              </li>
              <li>
                <Link
                  href={`/accesorios/computadoras`}
                  onClick={handleLinkClick}
                >
                  A. computadores
                </Link>
              </li>

              <li>
                <Link href={`/accesorios/generales`} onClick={handleLinkClick}>
                  Accesorios generales
                </Link>
              </li>

              <li>
                <Link href={`/accesorios/damas`} onClick={handleLinkClick}>
                  Damas
                </Link>
              </li>

              <li>
                <Link
                  href={`/accesorios/libros-nuevos`}
                  onClick={handleLinkClick}
                >
                  Libros nuevos
                </Link>
              </li>
              <li>
                <Link
                  href={`/accesorios/libros-usados`}
                  onClick={handleLinkClick}
                >
                  Libros usados
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/Profile" onClick={handleLinkClick}>
              Sobre mí
            </Link>
          </li>
        </ul>
      </nav>
      <div className={styles.circle}>
        <button onClick={menuBurger}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
