// Apariencia compartida de Clerk (sign-in / sign-up).
// Botones sociales: cuadrados y grandes, en dos columnas (icono arriba, nombre abajo).
export const clerkAppearance = {
  layout: { socialButtonsVariant: "blockButton" },
  elements: {
    rootBox: "mx-auto",
    card: "shadow-xl",
    socialButtons: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    socialButtonsBlockButton: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "10px",
      aspectRatio: "1 / 1",
      minHeight: "130px",
      height: "auto",
      width: "100%",
      borderRadius: "16px",
      borderWidth: "2px",
    },
    socialButtonsBlockButtonText: {
      fontSize: "1rem",
      fontWeight: 600,
      textAlign: "center",
    },
    socialButtonsProviderIcon: {
      width: "2.5rem",
      height: "2.5rem",
      margin: 0,
    },
  },
};
