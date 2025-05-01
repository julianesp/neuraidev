"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const NightSkyHero = () => {
  const starsContainerRef = useRef(null);
  const heroSectionRef = useRef(null);
  const [genderChar, setGenderChar] = useState("o");

  // Función para crear estrellas de forma aleatoria
  const createStars = () => {
    const starsContainer = starsContainerRef.current;
    if (!starsContainer) return;

    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("nightSky-star");

      // Tamaño aleatorio entre 1px y 3px
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;

      // Posición aleatoria
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;

      starsContainer.appendChild(star);
    }
  };

  // Efecto para la animación del texto alternando entre 'o' y 'a'
  useEffect(() => {
    const interval = setInterval(() => {
      setGenderChar((prev) => (prev === "o" ? "a" : "o"));
    }, 2000); // Cambiar cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  // Iniciar animaciones cuando el componente se monte
  useEffect(() => {
    // Asegurarse de que GSAP está disponible
    if (typeof window !== "undefined") {
      // Importar GSAP dinámicamente
      import("gsap").then((gsap) => {
        createStars();

        // Timeline principal
        const mainTimeline = gsap.default.timeline();

        // Animación de fondo
        mainTimeline.to(".nightSky-bg", {
          duration: 2,
          opacity: 1,
          ease: "power2.inOut",
        });

        // Animación de la luna
        mainTimeline.to(
          ".nightSky-moon",
          {
            duration: 2.5,
            opacity: 1,
            ease: "power2.inOut",
            y: 20,
            repeat: -1,
            yoyo: true,
            repeatDelay: 1,
          },
          "-=1.5",
        );

        // Animación de estrellas
        const stars = document.querySelectorAll(".nightSky-star");
        stars.forEach((star) => {
          const delay = Math.random() * 3;
          gsap.default.to(star, {
            duration: 1,
            opacity: Math.random() * 0.8 + 0.2,
            delay: delay,
            ease: "power2.inOut",
          });

          // Efecto de brillo
          gsap.default.to(star, {
            duration: 1 + Math.random() * 3,
            opacity: Math.random() * 0.5 + 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: delay,
          });
        });

        // Animación del contenido
        mainTimeline.to(
          ".nightSky-title",
          {
            duration: 3,
            opacity: 1,
            y: 0,
            ease: "power3.out",
          },
          "-=3",
        );

        mainTimeline.to(
          ".nightSky-desc",
          {
            duration: 2,
            opacity: 1,
            y: 0,
            ease: "power3.out",
          },
          "-=2",
        );

        mainTimeline.to(
          ".nightSky-btn",
          {
            duration: 1,
            opacity: 1,
            y: 0,
            ease: "power3.out",
          },
          "-=1",
        );

        // Animación especial para el caracter de género
        gsap.default.to(".gender-char", {
          duration: 0.5,
          opacity: 0.5,
          scale: 0.9,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut",
        });

        // Añadir evento de scroll para iniciar scroll al hacer clic en el botón
        const exploreBtn = document.querySelector(".nightSky-btn");
        if (exploreBtn) {
          exploreBtn.addEventListener("click", (e) => {
            e.preventDefault();
            // Obtener la altura del hero section
            const heroHeight = heroSectionRef.current.offsetHeight;
            // Hacer scroll a esa posición
            window.scrollTo({
              top: heroHeight,
              behavior: "smooth",
            });
          });
        }
      });
    }

    // Cleanup function
    return () => {
      const exploreBtn = document.querySelector(".nightSky-btn");
      if (exploreBtn) {
        exploreBtn.removeEventListener("click", () => {});
      }
    };
  }, []);

  return (
    <section
      ref={heroSectionRef}
      className="nightSky-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
      }}
    >
      <div
        className="nightSky-bg"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage:
            "url('https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Ffondo.jpg?alt=media&token=9b05c92d-f52f-44f3-810e-a312826fabd4')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0,
        }}
      ></div>

      <div
        className="nightSky-moon"
        style={{
          position: "absolute",
          top: "15%",
          right: "15%",
          width: "100px",
          height: "100px",
          backgroundColor: "#FFFDE7",
          borderRadius: "50%",
          boxShadow: "0 0 40px 20px rgba(255, 253, 231, 0.8)",
          opacity: 0,
        }}
      ></div>

      <div
        ref={starsContainerRef}
        className="nightSky-stars"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      ></div>

      <div
        className="nightSky-content"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          color: "white",
          textAlign: "center",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
          margin: 0,
        }}
      >
        <h1
          className="nightSky-title"
          style={{
            fontSize: "1rem",
            marginBottom: "1rem",
            marginTop: "4rem",
            opacity: 0,
            transform: "translateY(30px)",
            backgroundColor: "rgba(157, 147, 164, 0.4)",
            backdropFilter: "blur(1px)",
            padding: "10px 20px",
            borderRadius: "8px",
            color: "white",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            fontWeight: "bold",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          }}
        >
          Bienvenid
          <span
            className="gender-char"
            style={{
              transition: "all 0.5s ease",
              display: "inline-block",
              // fontWeight: "bold",
              color: "#fff8c0",
              textShadow: "0 0 4px rgba(255,248,192,0.6)",
            }}
          >
            {genderChar}
          </span>
          <span> </span> a mi sitio web
        </h1>

        <p
          className="nightSky-desc"
          style={{
            fontSize: "1.2rem",
            maxWidth: "600px",
            marginBottom: "2rem",
            opacity: 0,
            transform: "translateY(30px)",
            backgroundColor: "rgba(35, 35, 50, 0.8)",
            backdropFilter: "blur(3px)",
            borderRadius: "8px",
            padding: "20px 20px",
            color: "white",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            lineHeight: "1.4",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          Navega y descubre las diferentes secciones de nuestro sitio. Encuentra
          productos, servicios y contenido exclusivo.
        </p>

        <Link
          href="#"
          className="nightSky-btn"
          style={{
            ontSize: "1.5rem",
            maxWidth: "600px",
            marginBottom: "2rem",
            opacity: 0,
            transform: "translateY(30px)",
            backgroundColor: "rgba(35, 35, 50, 0.4)",
            backdropFilter: "blur(3px)",
            border: "2px solid #fff",
            borderRadius: "8px",
            padding: "14px 20px",
            color: "white",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            lineHeight: "1.4",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          }}
        >
          Explorar
        </Link>
      </div>

      <style jsx>{`
        .nightSky-btn:hover {
          background-color: white;
          color: #121839;
        }

        .nightSky-star {
          position: absolute;
          background-color: white;
          border-radius: 50%;
          opacity: 0;
        }

        @keyframes genderChange {
          0%,
          45% {
            transform: rotateY(0deg);
          }
          50%,
          95% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .gender-char {
          animation: pulse 2s infinite alternate;
          perspective: 1000px;
        }

        @keyframes pulse {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
        }

        @media screen and (max-width: 768px) {
          .nightSky-title {
            font-size: 1.75rem !important;
          }

          .nightSky-desc {
            font-size: 1.2rem !important;
            max-width: 90% !important;
          }

          .nightSky-btn {
            font-size: 1rem !important;
            padding: 0.8rem 1.6rem !important;
          }

          .nightSky-moon {
            width: 80px !important;
            height: 80px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default NightSkyHero;
