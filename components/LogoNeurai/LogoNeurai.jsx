import styles from "./LogoNeurai.module.css";

/**
 * Logo de neurai.dev en CSS puro: retrato mitad humano / mitad robot.
 * Al pasar el cursor (o si un enlace ancestro está en hover/focus) el ojo
 * humano hace un guiño. Solo usa <span> para poder ir dentro de <a>/<Link>.
 */
export default function LogoNeurai({
  size = 48,
  className = "",
  title = "neurai.dev",
  // true: ojo guiñado fijo · "auto": dos guiños animados en 3 s (intro de carga)
  wink = false,
}) {
  return (
    <span
      className={`${styles.logo} ${className}`.trim()}
      role="img"
      aria-label={title}
      style={{ "--logo-size": typeof size === "number" ? `${size}px` : size }}
      data-wink={wink === true ? "true" : wink || undefined}
    >
      <span className={styles.sweater} aria-hidden="true" />
      <span className={styles.neck} aria-hidden="true" />
      <span className={styles.collar} aria-hidden="true" />
      <span className={styles.earH} aria-hidden="true" />
      <span className={styles.earR} aria-hidden="true" />
      <span className={styles.head} aria-hidden="true">
        <span className={styles.robotShade} />
        <span className={styles.plateA} />
        <span className={styles.plateB} />
        <span className={styles.plateC} />
        <span className={styles.divider} />
        <span className={styles.cheek} />
        <span className={styles.brow} />
        <span className={styles.eyeH}>
          <span className={styles.iris} />
          <span className={styles.lid} />
        </span>
        <span className={styles.winkLine} />
        <span className={styles.socket}>
          <span className={styles.eyeR} />
        </span>
        <span className={styles.nose} />
        <span className={styles.mouthH} />
        <span className={styles.mouthR} />
      </span>
      <span className={styles.hair} aria-hidden="true" />
      <span className={styles.tuft} aria-hidden="true" />
    </span>
  );
}
