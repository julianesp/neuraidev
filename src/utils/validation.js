import Joi from 'joi';

// Esquemas de validación comunes
export const schemas = {
  // Validación de usuario
  user: {
    register: Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
          'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
          'string.max': 'El nombre de usuario no puede exceder 30 caracteres'
        }),
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Debe ser un email válido'
        }),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
        .required()
        .messages({
          'string.min': 'La contraseña debe tener al menos 8 caracteres',
          'string.pattern.base': 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un carácter especial'
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': 'Las contraseñas no coinciden'
        }),
      fullName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'El nombre completo debe tener al menos 2 caracteres'
        })
    }),
    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  },

  // Validación de productos
  product: {
    create: Joi.object({
      nombre: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
          'string.min': 'El nombre del producto debe tener al menos 2 caracteres'
        }),
      descripcion: Joi.string()
        .max(1000)
        .allow('')
        .messages({
          'string.max': 'La descripción no puede exceder 1000 caracteres'
        }),
      precio: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
          'number.positive': 'El precio debe ser un número positivo'
        }),
      categoria: Joi.string()
        .valid('technology', 'health', 'shop', 'general', 'restaurant')
        .required()
        .messages({
          'any.only': 'Categoría no válida'
        }),
      imagen_principal: Joi.string().uri().allow('').messages({
        'string.uri': 'La URL de la imagen no es válida'
      }),
      imagenes: Joi.array().items(Joi.string().uri()).max(10).messages({
        'array.max': 'No se pueden agregar más de 10 imágenes'
      })
    })
  },

  // Validación de favoritos
  favorite: {
    add: Joi.object({
      productId: Joi.number().integer().positive().required().messages({
        'number.positive': 'ID de producto no válido'
      })
    })
  },

  // Validación de notificaciones
  notification: Joi.object({
    title: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'El título no puede exceder 100 caracteres'
      }),
    message: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'El mensaje no puede exceder 500 caracteres'
      }),
    subscription: Joi.object().required()
  }),

  // Validación de negocio
  business: {
    register: Joi.object({
      businessName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': 'El nombre del negocio debe tener al menos 2 caracteres'
        }),
      businessType: Joi.string()
        .valid('restaurant', 'shop', 'service', 'technology', 'health')
        .required(),
      ownerName: Joi.string()
        .min(2)
        .max(100)
        .required(),
      email: Joi.string().email().required(),
      phone: Joi.string()
        .pattern(/^[0-9+\-\s()]+$/)
        .min(10)
        .required()
        .messages({
          'string.pattern.base': 'Número de teléfono no válido'
        }),
      address: Joi.string()
        .min(10)
        .max(200)
        .required(),
      description: Joi.string().max(1000).allow('')
    })
  }
};

// Función de validación genérica
export function validateData(data, schema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false, // Mostrar todos los errores
    stripUnknown: true // Remover campos no definidos en el schema
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return {
      isValid: false,
      errors,
      data: null
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value
  };
}

// Sanitización de strings para prevenir XSS
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitización de objetos
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

// Validación de tokens JWT
export function isValidObjectId(id) {
  return /^[0-9]+$/.test(id);
}

const validationModule = {
  schemas,
  validateData,
  sanitizeString,
  sanitizeObject,
  isValidObjectId
};

export default validationModule;