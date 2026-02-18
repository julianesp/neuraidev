/**
 * Modelo de Cliente con validación Zod
 */

import { z } from 'zod';

/**
 * Tipos de documento válidos
 */
export const DocumentType = z.enum(['CC', 'CE', 'NIT', 'TI', 'PP']);

/**
 * Esquema de cliente
 */
export const CustomerSchema = z.object({
  // Datos personales
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),

  // Documento
  typeDoc: DocumentType.default('CC'),
  numberDoc: z.string().min(6, 'Número de documento inválido'),

  // Dirección
  address: z.string().min(5, 'Dirección inválida'),
  city: z.string().min(3, 'Ciudad inválida'),
  region: z.string().min(3, 'Región/Departamento inválida'),

  // Opcional
  userId: z.string().optional(), // Clerk user ID
});

/**
 * Clase Customer con métodos de factory
 */
export class Customer {
  /**
   * Crea un cliente desde datos del formulario
   */
  static fromForm(formData) {
    try {
      return CustomerSchema.parse(formData);
    } catch (error) {
      console.error('[Customer.fromForm] Error de validación:', {
        error: error.message,
        data: formData,
      });
      throw error;
    }
  }

  /**
   * Crea un cliente desde localStorage
   */
  static fromStorage(storageData) {
    try {
      return CustomerSchema.parse(storageData);
    } catch (error) {
      // Si falla la validación, retornar null (datos corruptos)
      return null;
    }
  }

  /**
   * Valida solo los campos obligatorios
   */
  static validateRequired(data) {
    const requiredSchema = CustomerSchema.pick({
      name: true,
      email: true,
      phone: true,
    });

    return requiredSchema.safeParse(data);
  }
}

/**
 * Validadores
 */
export const validateCustomer = (data) => {
  return CustomerSchema.safeParse(data);
};
