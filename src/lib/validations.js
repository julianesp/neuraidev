// lib/validations.js - Validaciones para los anuncios
export const anuncioValidation = {
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s0-9\-_&.,!]+$/,
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
  imageUrl: {
    required: false,
    pattern: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
  },
  linkUrl: {
    required: false,
    pattern: /^https?:\/\/.+/,
  },
  category: {
    required: true,
    allowedValues: [
      "general",
      "restaurant",
      "shop",
      "service",
      "technology",
      "health",
      "education",
      "entertainment",
    ],
  },
  contactPhone: {
    required: false,
    pattern: /^[+]?[0-9\s\-()]{7,20}$/,
  },
  contactEmail: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

export function validateAnuncio(data) {
  const errors = {};

  // Validar nombre del negocio
  if (!data.businessName) {
    errors.businessName = "El nombre del negocio es requerido";
  } else if (
    data.businessName.length < anuncioValidation.businessName.minLength
  ) {
    errors.businessName = `El nombre debe tener al menos ${anuncioValidation.businessName.minLength} caracteres`;
  } else if (
    data.businessName.length > anuncioValidation.businessName.maxLength
  ) {
    errors.businessName = `El nombre no puede exceder ${anuncioValidation.businessName.maxLength} caracteres`;
  } else if (!anuncioValidation.businessName.pattern.test(data.businessName)) {
    errors.businessName = "El nombre contiene caracteres no válidos";
  }

  // Validar descripción
  if (!data.description) {
    errors.description = "La descripción es requerida";
  } else if (
    data.description.length < anuncioValidation.description.minLength
  ) {
    errors.description = `La descripción debe tener al menos ${anuncioValidation.description.minLength} caracteres`;
  } else if (
    data.description.length > anuncioValidation.description.maxLength
  ) {
    errors.description = `La descripción no puede exceder ${anuncioValidation.description.maxLength} caracteres`;
  }

  // Validar URL de imagen
  if (
    data.imageUrl &&
    !anuncioValidation.imageUrl.pattern.test(data.imageUrl)
  ) {
    errors.imageUrl = "La URL de la imagen no es válida";
  }

  // Validar URL del sitio web
  if (data.linkUrl && !anuncioValidation.linkUrl.pattern.test(data.linkUrl)) {
    errors.linkUrl = "La URL del sitio web no es válida";
  }

  // Validar categoría
  if (!anuncioValidation.category.allowedValues.includes(data.category)) {
    errors.category = "Categoría no válida";
  }

  // Validar teléfono
  if (
    data.contactInfo?.phone &&
    !anuncioValidation.contactPhone.pattern.test(data.contactInfo.phone)
  ) {
    errors.contactPhone = "El formato del teléfono no es válido";
  }

  // Validar email
  if (
    data.contactInfo?.email &&
    !anuncioValidation.contactEmail.pattern.test(data.contactInfo.email)
  ) {
    errors.contactEmail = "El formato del email no es válido";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
