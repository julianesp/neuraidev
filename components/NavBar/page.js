"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/components/NavBar/NavBar.module.scss";
import ThemeSwitcher from "../ThemeSwitcher";
import StoreStatus from "../StoreStatus";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { isAdmin } from "@/lib/auth/roles";
import CartIcon from "../CartIcon";

const NavBar = () => {
  const { user } = useUser();
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [serviciosDropdownOpen, setServiciosDropdownOpen] = useState(false);
  const [negociosDropdownOpen, setNegociosDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState({});
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const serviciosDropdownRef = useRef(null);
  const negociosDropdownRef = useRef(null);

  // Define unique ID for the logo image
  const logoImageId = "navbar-logo";

  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);

  // Verificar si el usuario es administrador
  const userIsAdmin = user && isAdmin(user);

  const menuBurger = () => {
    setBurgerOpen(!burgerOpen);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
    setServiciosDropdownOpen(false); // Close other dropdown
    setNegociosDropdownOpen(false); // Close other dropdown
  };

  const toggleServiciosDropdown = (e) => {
    e.preventDefault();
    setServiciosDropdownOpen(!serviciosDropdownOpen);
    setDropdownOpen(false); // Close other dropdown
    setNegociosDropdownOpen(false); // Close other dropdown
  };

  const toggleNegociosDropdown = (e) => {
    e.preventDefault();
    setNegociosDropdownOpen(!negociosDropdownOpen);
    setDropdownOpen(false); // Close other dropdown
    setServiciosDropdownOpen(false); // Close other dropdown
  };

  // Manejadores de hover para desktop
  const handleTiendaMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setDropdownOpen(true);
      setServiciosDropdownOpen(false);
      setNegociosDropdownOpen(false);
    }
  };

  const handleTiendaMouseLeave = () => {
    // No hacer nada aquí - el dropdown se cerrará solo cuando el mouse salga completamente
  };

  const handleServiciosMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setServiciosDropdownOpen(true);
      setDropdownOpen(false);
      setNegociosDropdownOpen(false);
    }
  };

  const handleServiciosMouseLeave = () => {
    // No hacer nada aquí - el dropdown se cerrará solo cuando el mouse salga completamente
  };

  const handleNegociosMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setNegociosDropdownOpen(true);
      setDropdownOpen(false);
      setServiciosDropdownOpen(false);
    }
  };

  const handleNegociosMouseLeave = () => {
    // No hacer nada aquí - el dropdown se cerrará solo cuando el mouse salga completamente
  };

  const handleLinkClick = () => {
    setBurgerOpen(false); // Close the menu when a link is clicked
    setDropdownOpen(false); // Close the dropdown when a link is clicked
    setServiciosDropdownOpen(false); // Close the servicios dropdown when a link is clicked
    setNegociosDropdownOpen(false); // Close the negocios dropdown when a link is clicked
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

    // Close negocios dropdown when clicking outside of it
    if (
      negociosDropdownRef.current &&
      !negociosDropdownRef.current.contains(event.target)
    ) {
      setNegociosDropdownOpen(false);
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
              src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png"
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

      {/* <div className={styles.storeStatusWrapper}>
        <StoreStatus />
      </div> */}

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
              href="/blog"
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
            className={styles.dropdownContainer}
            onMouseEnter={handleTiendaMouseEnter}
            onMouseLeave={() => {
              if (window.innerWidth >= 1024) {
                setTimeout(() => setDropdownOpen(false), 300);
              }
            }}
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
              Productos ▾
            </Link>
            {dropdownOpen && (
              <ul className={styles.dropdown}>
                {/* <li>
                  <Link href="/accesorios/destacados" onClick={handleLinkClick}>
                    Destacados
                  </Link>
                </li> */}
                <li>
                  <Link href="/accesorios/celulares" onClick={handleLinkClick}>
                    Accesorios Celulares
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accesorios/computadoras"
                    onClick={handleLinkClick}
                  >
                    Accesorios computadoras
                  </Link>
                </li>
                <li>
                  <Link href="/accesorios/damas" onClick={handleLinkClick}>
                    Damas
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
                  <Link href="/accesorios/generales" onClick={handleLinkClick}>
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
            className={styles.dropdownContainer}
            onMouseEnter={handleServiciosMouseEnter}
            onMouseLeave={() => {
              if (window.innerWidth >= 1024) {
                setTimeout(() => setServiciosDropdownOpen(false), 300);
              }
            }}
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

          {/* Dropdown de Negocios Externos */}
          <li
            role="none"
            ref={negociosDropdownRef}
            className={styles.dropdownContainer}
            onMouseEnter={handleNegociosMouseEnter}
            onMouseLeave={() => {
              if (window.innerWidth >= 1024) {
                setTimeout(() => setNegociosDropdownOpen(false), 300);
              }
            }}
          >
            <Link
              href="#"
              title="Ver negocios aliados"
              onClick={(e) => {
                e.preventDefault();
                if (window.innerWidth < 1024) {
                  toggleNegociosDropdown(e);
                }
              }}
            >
              Del Valle ▾
            </Link>
            {negociosDropdownOpen && (
              <ul className={styles.dropdown}>
                <li>
                  <Link
                    href="/selecta"
                    onClick={handleLinkClick}
                    title="Escuchar Selecta FM en vivo"
                  >
                    📻 Selecta FM 93.3
                  </Link>
                </li>
                {/* Aquí puedes agregar más negocios externos en el futuro */}
              </ul>
            )}
          </li>

          <li role="none">
            <Link
              href="/sobre-nosotros"
              title="Ir al perfil"
              onClick={handleLinkClick}
            >
              Sobre nosotros
            </Link>
          </li>

          {/* Enlace a Mi Cuenta solo para usuarios autenticados */}
          <SignedIn>
            <li role="none">
              <Link
                href="/perfil"
                title="Ir a mi cuenta"
                onClick={handleLinkClick}
              >
                Mi Cuenta
              </Link>
            </li>
          </SignedIn>

          {/* Botón de Dashboard solo para admins */}
          {userIsAdmin && (
            <li role="none">
              <Link
                href="/dashboard"
                title="Ir al dashboard"
                onClick={handleLinkClick}
                className={styles.dashboardLink}
              >
                Dashboard
              </Link>
            </li>
          )}

          {/* Botones de autenticación en móvil */}
          <li role="none" className={styles.mobileAuthItem}>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className={styles.mobileSignInBtn}
                  onClick={handleLinkClick}
                >
                  Iniciar Sesión
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className={styles.mobileUserSection}>
                <UserButton
                  localization={esES}
                  fallbackRedirectUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>
            </SignedIn>
          </li>
        </ul>
      </nav>

      {/* Botones de autenticación y carrito */}
      <div className={styles.authButtons}>
        <CartIcon />
        <SignedOut>
          <SignInButton mode="modal">
            <button className={styles.signInBtn}>Iniciar Sesión</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            localization={esES}
            fallbackRedirectUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </SignedIn>
      </div>

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
