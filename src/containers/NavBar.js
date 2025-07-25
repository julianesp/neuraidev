"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/components/NavBar.module.scss";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccesoriosOpen, setIsAccesoriosOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsAccesoriosOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleAccesorios = (e) => {
    e.stopPropagation();
    setIsAccesoriosOpen(!isAccesoriosOpen);
  };

  return (
    <nav className={`${styles.navbar} bg-white shadow-lg sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                alt="NeuraIDev Logo"
                width={40}
                height={40}
                className="rounded-lg"
                onError={(e) => {
                  // Fallback si no existe logo.png
                  e.target.src =
                    "data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23007acc'/%3E%3Ctext x='20' y='25' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3EN%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <span className="text-xl font-bold text-gray-900">NeuraIDev</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Inicio
            </Link>

            <Link
              href="/Blog"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Blog
            </Link>

            {/* Dropdown Accesorios */}
            <div className="relative">
              <button
                onClick={toggleAccesorios}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Accesorios
                <svg
                  className="ml-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isAccesoriosOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <Link
                    href="/accesorios/celulares"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsAccesoriosOpen(false)}
                  >
                    Celulares
                  </Link>
                  <Link
                    href="/accesorios/computadoras"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsAccesoriosOpen(false)}
                  >
                    Computadoras
                  </Link>
                  <Link
                    href="/accesorios/damas"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsAccesoriosOpen(false)}
                  >
                    Damas
                  </Link>
                  <Link
                    href="/accesorios/libros-nuevos"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsAccesoriosOpen(false)}
                  >
                    Libros Nuevos
                  </Link>
                  <Link
                    href="/accesorios/libros-usados"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsAccesoriosOpen(false)}
                  >
                    Libros Usados
                  </Link>
                  <Link
                    href="/accesorios/generales"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsAccesoriosOpen(false)}
                  >
                    Generales
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/Profile"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Sobre mí
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/Blog"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>

              {/* Mobile Accesorios Submenu */}
              <div className="px-3 py-2">
                <div className="text-gray-700 font-medium mb-2">Accesorios</div>
                <div className="pl-4 space-y-1">
                  <Link
                    href="/accesorios/celulares"
                    className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Celulares
                  </Link>
                  <Link
                    href="/accesorios/computadoras"
                    className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Computadoras
                  </Link>
                  <Link
                    href="/accesorios/damas"
                    className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Damas
                  </Link>
                  <Link
                    href="/accesorios/libros-nuevos"
                    className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Libros Nuevos
                  </Link>
                  <Link
                    href="/accesorios/libros-usados"
                    className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Libros Usados
                  </Link>
                  <Link
                    href="/accesorios/generales"
                    className="block py-1 text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Generales
                  </Link>
                </div>
              </div>

              <Link
                href="/Profile"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre mí
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
