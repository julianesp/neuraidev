import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const SideModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el modal cuando el usuario hace clic fuera
  const handleClickOutside = (e) => {
    if (e.target.classList.contains("side-modal-container")) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="side-modal-container" onClick={() => setIsOpen(!isOpen)}>
      <motion.div
        className="side-modal"
        initial={{ width: "50px" }}
        animate={{ width: isOpen ? "300px" : "50px" }}
        transition={{ duration: 0.3 }}
      >
        <div className="side-modal-content">
          <motion.div
            className="side-modal-text"
            animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3>Envío gratis</h3>
            <p>¡Solo para el valle de Sibundoy!</p>
          </motion.div>
          <motion.div
            className="side-modal-indicator"
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <span>
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Ftaxi.png?alt=media&token=c6ea14f0-6355-4b4b-b85e-70fd6180d01e"
                alt="Arrow Right"
                width={24}
                height={24}
              />
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SideModal;
