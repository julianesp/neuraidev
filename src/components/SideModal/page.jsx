import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./SideModal.module.scss";

const SideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [taxiX, setTaxiX] = useState(0);

  // Calcular valores responsivos basados en el viewport
  const getResponsiveValue = () => {
    if (typeof window === 'undefined') return { closed: 40, open: 180 };
    const vw = window.innerWidth;

    // Para pantallas muy pequeñas (320px - 480px)
    if (vw <= 480) return { closed: 30, open: 140 };
    // Para pantallas medianas (481px - 768px)
    if (vw <= 768) return { closed: 35, open: 160 };
    // Para pantallas grandes (769px+)
    return { closed: 40, open: 180 };
  };

  const [taxiPositions, setTaxiPositions] = useState(getResponsiveValue());

  const handleTaxiClick = async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Si está cerrado, hacer la animación del taxi y luego abrir
    if (!isOpen) {
      // Animación de retroceso del taxi
      // console.log("Setting taxiX to -20"); // Debug
      setTaxiX(-10);

      // Después del retroceso, hacer el impulso hacia adelante con desplazamiento
      setTimeout(() => {
        // console.log("Setting taxiX to 400"); // Debug - mover completamente fuera del viewport
        setTaxiX(400);

        // Abrir el modal mientras el taxi está desplazado
        setTimeout(() => {
          // console.log("Opening modal with taxi displaced"); // Debug
          setIsOpen(true);
          setIsAnimating(false);
          // El taxi permanece desplazado cuando el modal está abierto
        }, 100);
      }, 400);
    } else {
      // Si está abierto, cerrar y devolver taxi a posición original
      // console.log("Closing modal and returning taxi"); // Debug
      setIsOpen(false);
      setTaxiX(0); // Devolver taxi a posición original
      setIsAnimating(false);
    }
  };

  const modalRef = useRef(null);

  // Cerrar el modal cuando se hace clic fuera
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setIsOpen(false);
      setTaxiX(0); // Resetear posición del taxi
    }
  };

  useEffect(() => {
    // Agregar el evento cuando el componente se monta
    document.addEventListener("mousedown", handleClickOutside);

    // Actualizar valores responsivos en resize
    const handleResize = () => {
      setTaxiPositions(getResponsiveValue());
    };

    window.addEventListener("resize", handleResize);

    // Limpiar el evento cuando el componente se desmonta
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {isOpen && <div className={styles.sideModalOverlay} />}
      <div className={styles.sideModalContainer}>
        <motion.div
          ref={modalRef}
          className={styles.sideModal}
          initial={{ width: "10px" }}
          // anuncio abierto
          animate={{ width: isOpen ? "min(280px, 35vw)" : "" }}
          // transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <div className={styles.sideModalContent}>
            <motion.div
              className={styles.sideModalText}
              animate={{
                opacity: isOpen ? 1 : 0,
                // x: isOpen ? 0 : -20,
                x: isOpen ? 0 : -200,

                scale: isOpen ? 1 : 0.2,
              }}
              transition={{ duration: 0.15, delay: isOpen ? 0.2 : 0.1 }}
            >
              <h4 className="">¡Envío gratis!</h4>
              <p>Solo para el valle de Sibundoy</p>
            </motion.div>

            <motion.div
              className={styles.sideModalIndicator}
              animate={{
                opacity: isOpen ? 0 : 1,
                scale: isOpen ? 0.2 : 1,

                // Posición que sigue al modal + desplazamiento animado
                x: (isOpen ? taxiPositions.open : taxiPositions.closed) + taxiX,
                rotate: taxiX !== 0 ? (taxiX < 0 ? -40 : 5) : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              onClick={handleTaxiClick}
            >
              <Image
                src="https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/icons/taxi.png"
                alt="Taxi - Envío gratis"
                width={35}
                height={35}
                className={styles.taxiImage}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SideModal;
