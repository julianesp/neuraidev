/**
 * Cliente de Resend para envío de emails
 * https://resend.com/docs
 */

import { Resend } from 'resend';

// Inicializar cliente de Resend solo si hay API key
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Email de remitente por defecto
 * Debe estar verificado en Resend
 */
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

/**
 * Verificar si Resend está configurado
 */
export const isResendConfigured = () => !!process.env.RESEND_API_KEY;
