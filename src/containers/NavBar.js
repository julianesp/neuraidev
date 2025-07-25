// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import styles from "../styles/components/NavBar.module.scss";
// import ThemeSwitcher from "../components/ThemeSwitcher";

// export default function NavBar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isAccesoriosOpen, setIsAccesoriosOpen] = useState(false);
//   const [burgerOpen, setBurgerOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [imageError, setImageError] = useState({});
//   const menuRef = useRef(null);
//   const dropdownRef = useRef(null);

//   // Define unique ID for the logo image
//   const logoImageId = "navbar-logo";

//   // Solution for hydratation errors
//   const [isLoaded, setIsLoaded] = useState(false);

//   const menuBurger = () => {
//     setBurgerOpen(!burgerOpen);
//   };

//   const toggleDropdown = (e) => {
//     e.preventDefault();
//     setDropdownOpen(!dropdownOpen);
//   };

//   const handleLinkClick = () => {
//     setBurgerOpen(false); // Close the menu when a link is clicked
//     setDropdownOpen(false); // Close the dropdown when a link is clicked
//   };

//   const handleOutsideClick = (event) => {
//     if (menuRef.current && !menuRef.current.contains(event.target)) {
//       setBurgerOpen(false); // Close the menu when clicking outside
//     }

//     // Close dropdown when clicking outside of it
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setDropdownOpen(false);
//     }
//   };

//   // to hidden menu nav

//   useEffect(() => {
//     const handleClickOutside = () => {
//       setIsMenuOpen(false);
//       setIsAccesoriosOpen(false);
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   const toggleAccesorios = (e) => {
//     e.stopPropagation();
//     setIsAccesoriosOpen(!isAccesoriosOpen);
//   };

//   return (
//     <>
//       <nav className={styles.container}>
//         <div className={styles.container__principal}>
//           <div className={styles.logo}>
//             <Link href="/">
//               <Image
//                 src="/logo.png"
//                 alt="NeuraIDev Logo"
//                 width={50}
//                 height={50}
//                 onError={(e) => {
//                   // Fallback si no existe logo.png
//                   e.target.src =
//                     "data:image/svg+xml,%3Csvg width='50' height='50' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='50' height='50' fill='%23007acc'/%3E%3Ctext x='25' y='30' font-family='Arial' font-size='20' fill='white' text-anchor='middle'%3EN%3C/text%3E%3C/svg%3E";
//                 }}
//               />
//             </Link>
//           </div>
//         </div>

//         <div className={styles.themeSwitcher}>
//           <ThemeSwitcher />
//         </div>

//         <div className={styles.menu} ref={menuRef}>
//           <li className={styles.dropdown} ref={dropdownRef} role="none">
//             <button
//               role="menuitem"
//               onClick={toggleDropdown}
//               className={styles.dropdown_toggle}
//               aria-haspopup="true"
//               aria-expanded={dropdownOpen}
//               aria-controls="dropdown-menu"
//               title="Ir a la tienda"
//             >
//               Tienda
//               <span className={styles.dropdown_arrow} aria-hidden="true">
//                 ▼
//               </span>
//             </button>
//             <ul
//               className={`${styles.dropdown_menu} ${dropdownOpen ? styles.show : ""}`}
//               role="menu"
//               aria-labelledby="dropdown-toggle"
//             >
//               <li role="none">
//                 <Link
//                   href={`/accesorios/celulares`}
//                   role="menuitem"
//                   onClick={handleLinkClick}
//                 >
//                   Accesorios celulares
//                 </Link>
//               </li>
//               <li role="none">
//                 <Link
//                   href={`/accesorios/computadoras`}
//                   role="menuitem"
//                   onClick={handleLinkClick}
//                 >
//                   A. computadores
//                 </Link>
//               </li>

//             <li className={styles.dropdown}>
//               <div
//                 className={styles.dropdown_toggle}
//                 onClick={toggleDropdown}
//               >
//                 Accesorios
//                 <span className={styles.dropdown_arrow}>▼</span>
//               </div>
//               <ul className={`${styles.dropdown_menu} ${dropdownOpen ? styles.show : ''}`} ref={dropdownRef}>
//                 <li>
//                   <Link href="/accesorios/celulares" onClick={handleLinkClick}>
//                     Celulares
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/accesorios/computadoras" onClick={handleLinkClick}>
//                     Computadoras
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/accesorios/damas" onClick={handleLinkClick}>
//                     Damas
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/accesorios/libros-nuevos" onClick={handleLinkClick}>
//                     Libros Nuevos
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/accesorios/libros-usados" onClick={handleLinkClick}>
//                     Libros Usados
//                   </Link>
//                 </li>
//                 <li>
//                   <Link href="/accesorios/generales" onClick={handleLinkClick}>
//                     Generales
//                   </Link>
//                 </li>
//               </ul>
//             </li>

//             <li>
//               <Link href="/Profile" onClick={handleLinkClick}>
//                 Sobre mí
//               </Link>
//             </li>

//           </ul>
//         </div>

//         <div className={styles.circle}>
//           <button
//             onClick={menuBurger}
//             aria-label={burgerOpen ? "Cerrar menu" : "Abrir menu"}
//             aria-controls="mobile-menu"
//             aria-expanded={burgerOpen}
//           >
//             <span></span>
//             <span></span>
//             <span></span>
//           </button>
//         </div>
//       </nav>
//     </>
//   );
// }

"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/components/NavBar.module.scss";
import ThemeSwitcher from "../components/ThemeSwitcher";

const NavBar = () => {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState({});
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);

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
              src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb"
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

          {/* <li role="none">
            <Link href="/businesses" className="nav-link">
              Negocios
            </Link>
          </li> */}

          <li className={styles.dropdown} ref={dropdownRef} role="none">
            <button
              role="menuitem"
              onClick={toggleDropdown}
              className={styles.dropdown_toggle}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-controls="dropdown-menu"
              title="Ir a la tienda"
            >
              Tienda
              <span className={styles.dropdown_arrow} aria-hidden="true">
                ▼
              </span>
            </button>
            <ul
              className={`${styles.dropdown_menu} ${dropdownOpen ? styles.show : ""}`}
              role="menu"
              aria-labelledby="dropdown-toggle"
            >
              <li role="none">
                <Link
                  href={`/accesorios/celulares`}
                  role="menuitem"
                  onClick={handleLinkClick}
                >
                  Accesorios celulares
                </Link>
              </li>
              <li role="none">
                <Link
                  href={`/accesorios/computadoras`}
                  role="menuitem"
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
