"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/components/NavBar.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
// import { CartButton } from "./CartButton";

const NavBar = () => {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serviciosDropdownOpen, setServiciosDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState({});
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const serviciosDropdownRef = useRef(null);

  // Define unique ID for the logo image
  const logoImageId = "navbar-logo";

  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);

  const menuBurger = () => {
    setBurgerOpen(!burgerOpen);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
    setServiciosDropdownOpen(false); // Close other dropdown
  };

  const toggleServiciosDropdown = (e) => {
    e.preventDefault();
    setServiciosDropdownOpen(!serviciosDropdownOpen);
    setDropdownOpen(false); // Close other dropdown
  };

  // Manejadores de hover para desktop
  const handleTiendaMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setDropdownOpen(true);
      setServiciosDropdownOpen(false);
    }
  };

  const handleTiendaMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      setTimeout(() => {
        setDropdownOpen(false);
      }, 300); // Delay de 300ms antes de cerrar
    }
  };

  const handleServiciosMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setServiciosDropdownOpen(true);
      setDropdownOpen(false);
    }
  };

  const handleServiciosMouseLeave = () => {
    if (window.innerWidth >= 1024) {
      setTimeout(() => {
        setServiciosDropdownOpen(false);
      }, 300); // Delay de 300ms antes de cerrar
    }
  };

  const handleLinkClick = () => {
    setBurgerOpen(false); // Close the menu when a link is clicked
    setDropdownOpen(false); // Close the dropdown when a link is clicked
    setServiciosDropdownOpen(false); // Close the servicios dropdown when a link is clicked
  };

  const handleOutsideClick = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setBurgerOpen(false); // Close the menu when clicking outside
    }

    // Close dropdown when clicking outside of it
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }

    // Close servicios dropdown when clicking outside of it
    if (
      serviciosDropdownRef.current &&
      !serviciosDropdownRef.current.contains(event.target)
    ) {
      setServiciosDropdownOpen(false);
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
    <div
      className={`${styles.container} dark:text-white`}
      ref={menuRef}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className={styles.logo}>
        <Link href="/" aria-label="Ir a la página principal">
          <div className={styles.container__principal}>
            <Image
              alt="Neurai.dev - Logo de la empresa"
              src="/images/logo.png"
              width={30}
              height={30}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false} // Solo true para imágenes above-the-fold
              loading="lazy"
              quality={85}
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [logoImageId]: true }))
              }
            />
          </div>
        </Link>
      </div>

      <div className={styles.themeSwitcher}>
        <ThemeSwitcher />
      </div>

      <nav className={styles.nav_container}>
        <ul
          className={`${styles.enlaces__menu}  ${
            burgerOpen ? styles.open : styles.closed
          } `}
          role="menubar"
        >
          <li role="none">
            <Link
              className="text-black"
              href="/"
              role="menuitem"
              onClick={handleLinkClick}
              title="Ir a la página principal"
            >
              Inicio
            </Link>
          </li>
          <li role="none">
            <Link
              href="/Blog"
              title="Ir al blog"
              role="menuitem"
              onClick={handleLinkClick}
            >
              Blog
            </Link>
          </li>

          {/* Dropdown de Tienda */}
          <li
            role="none"
            ref={dropdownRef}
            onMouseEnter={handleTiendaMouseEnter}
            onMouseLeave={handleTiendaMouseLeave}
          >
            <Link
              href="/accesorios"
              title="Ir a la tienda de accesorios"
              onClick={(e) => {
                // Solo prevenir navegación en móvil para toggle
                if (window.innerWidth < 1024) {
                  e.preventDefault();
                  toggleDropdown(e);
                }
              }}
            >
              Tienda ▾
            </Link>
            {dropdownOpen && (
              <ul className={styles.dropdown}>
                <li>
                  <Link
                    href="/accesorios/destacados"
                    onClick={handleLinkClick}
                  >
                    Destacados
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/celulares"
                    onClick={handleLinkClick}
                  >
                    Celulares
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/computadoras"
                    onClick={handleLinkClick}
                  >
                    Computadoras
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/damas"
                    onClick={handleLinkClick}
                  >
                    Damas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/belleza"
                    onClick={handleLinkClick}
                  >
                    Belleza
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/libros-nuevos"
                    onClick={handleLinkClick}
                  >
                    Libros Nuevos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/libros-usados"
                    onClick={handleLinkClick}
                  >
                    Libros Usados
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/generales"
                    onClick={handleLinkClick}
                  >
                    Generales
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Dropdown de Servicios */}
          <li
            role="none"
            ref={serviciosDropdownRef}
            onMouseEnter={handleServiciosMouseEnter}
            onMouseLeave={handleServiciosMouseLeave}
          >
            <Link
              href="/servicios"
              title="Ver servicios profesionales"
              onClick={(e) => {
                // Solo prevenir navegación en móvil para toggle
                if (window.innerWidth < 1024) {
                  e.preventDefault();
                  toggleServiciosDropdown(e);
                }
              }}
            >
              Servicios ▾
            </Link>
            {serviciosDropdownOpen && (
              <ul className={styles.dropdown}>
                <li>
                  <Link
                    href="/servicios/tecnico-sistemas"
                    onClick={handleLinkClick}
                  >
                    Técnico en Sistemas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/servicios/desarrollador-software"
                    onClick={handleLinkClick}
                  >
                    Desarrollador Web
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li role="none">
            <Link
              href="/profile"
              title="Ir al perfil"
              onClick={handleLinkClick}
            >
              Sobre mí
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles.circle}>
        <button
          onClick={menuBurger}
          aria-label={burgerOpen ? "Cerrar menu" : "Abrir menu"}
          aria-controls="mobile-menu"
          aria-expanded={burgerOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default NavBar;
