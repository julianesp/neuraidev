// utils/apiHelpers.js - Utilidades para trabajar con la API
export const formatApiError = (error) => {
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return "Error inesperado. Inténtalo de nuevo.";
};

export const isNetworkError = (error) => {
  return (
    error.message?.includes("fetch") ||
    error.message?.includes("network") ||
    error.message?.includes("NetworkError")
  );
};

export const retryOperation = async (
  operation,
  maxRetries = 3,
  delay = 1000,
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      if (isNetworkError(error)) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error; // No reintentar errores que no sean de red
      }
    }
  }
};
