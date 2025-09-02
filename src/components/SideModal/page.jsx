import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./SideModal.module.scss";

const SideModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [taxiX, setTaxiX] = useState(0);

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
        }, 300);
      }, 500);
    } else {
      // Si está abierto, cerrar y devolver taxi a posición original
      // console.log("Closing modal and returning taxi"); // Debug
      setIsOpen(false);
      setTaxiX(0); // Devolver taxi a posición original
      setIsAnimating(false);
    }
  };

  // Cerrar el modal cuando se hace clic fuera
  const handleClickOutside = (e) => {
    if (e.target.classList.contains(styles.sideModalOverlay)) {
      setIsOpen(false);
      setTaxiX(0); // Resetear posición del taxi
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className={styles.sideModalOverlay} />}
      <div className={styles.sideModalContainer}>
        <motion.div
          className={styles.sideModal}
          initial={{ width: "80px" }}
          animate={{ width: isOpen ? "200px" : "60px" }}
          // transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <div className={styles.sideModalContent}>
            <motion.div
              className={styles.sideModalText}
              animate={{
                opacity: isOpen ? 1 : 0,
                x: isOpen ? 0 : -20,
                scale: isOpen ? 1 : 0.2,
              }}
              transition={{ duration: 0.15, delay: isOpen ? 0.2 : 0.1 }}
            >
              <h4>Envío gratis</h4>
              <p>¡Solo para el valle de Sibundoy!</p>
            </motion.div>

            <motion.div
              className={styles.sideModalIndicator}
              animate={{
                opacity: isOpen ? 0 : 1,
                scale: isOpen ? 0.2 : 1,
                x: (isOpen ? 180 : 40) + taxiX, // Posición que sigue al modal + desplazamiento animado
                rotate: taxiX !== 0 ? (taxiX < 0 ? -5 : 5) : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              onClick={handleTaxiClick}
            >
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Ftaxi.png?alt=media&token=c6ea14f0-6355-4b4b-b85e-70fd6180d01e"
                alt="Taxi - Envío gratis"
                width={28}
                height={28}
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
