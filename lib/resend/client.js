/**
 * Cliente de Resend para envío de emails
 * https://resend.com/docs
 */

import { Resend } from 'resend';

// Inicializar cliente de Resend
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email de remitente por defecto
 * Debe estar verificado en Resend
 */
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
