// lib/constants.js - Constantes de la aplicación
export const CATEGORIES = [
  { value: "general", label: "General", icon: "📋" },
  { value: "restaurant", label: "Restaurante", icon: "🍽️" },
  { value: "shop", label: "Tienda", icon: "🛍️" },
  { value: "service", label: "Servicio", icon: "🔧" },
  { value: "technology", label: "Tecnología", icon: "💻" },
  { value: "health", label: "Salud", icon: "🏥" },
  { value: "education", label: "Educación", icon: "📚" },
  { value: "entertainment", label: "Entretenimiento", icon: "🎬" },
];

export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
};

export const VALIDATION_MESSAGES = {
  REQUIRED: "Este campo es requerido",
  MIN_LENGTH: (min) => `Debe tener al menos ${min} caracteres`,
  MAX_LENGTH: (max) => `No puede exceder ${max} caracteres`,
  INVALID_FORMAT: "El formato no es válido",
  INVALID_URL: "La URL no es válida",
  INVALID_EMAIL: "El email no es válido",
  INVALID_PHONE: "El teléfono no es válido",
};
