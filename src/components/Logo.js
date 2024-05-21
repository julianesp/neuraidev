// extension formatear codigo en vscode
import React from "react";
import styles from "../styles/Logo.module.css";

const Logo = () => {
  return (
    <div className={styles.logo__container}>

    <div className={styles.face}>
      <div className={styles.frente}></div>

      <div className={styles.hair}>
        <div className={styles.hair_1} id="parte"></div>
        <div className={styles.hair_2}></div>
        <div className={styles.hair_3}></div>
        <div className={styles.hair_4}></div>
        <div className={styles.hair_5}></div>
      </div>
      <div className={styles.robot}>{/* parche al ojo */}</div>

      <div className={styles.ears}>
        <div className={styles.ear__left}></div>
        <div className={styles.ear__right}></div>
      </div>

      <div className={styles.eye}>
        <div className={styles.eye__left}>
          <div className={styles.cerrar}></div>
          <div className={`${styles.eyelash} ${styles.left}}`}></div>
          <div className="iris"></div>
        </div>
        <div className={styles.eye__right}>
          <div className={`${styles.eyelash} ${styles.right}`}></div>
          <div className={styles.iris}></div>
        </div>
      </div>

      <div className={styles.nose}>
        <div className={styles.left}></div>
        <div className={styles.right}></div>
      </div>

      <div className={styles.mouth}>
        <div className={styles.up}>
          <div className={styles.left}></div>
          <div className={styles.right}></div>
        </div>
        <div className={styles.down}></div>
      </div>

      <div className={styles.menton}></div>
    </div>
    </div>
  );
};

export default Logo;
