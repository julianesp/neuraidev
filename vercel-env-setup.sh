#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Ejecuta: chmod +x vercel-env-setup.sh && ./vercel-env-setup.sh

echo "🔧 Configurando variables de entorno en Vercel..."
echo ""
echo "⚠️  IMPORTANTE: Primero ejecuta 'vercel login' si no lo has hecho"
echo ""

# Leer .env.local y extraer las variables necesarias
if [ -f .env.local ]; then
  echo "✅ Archivo .env.local encontrado"
  echo ""
  echo "📋 Variables que debes agregar en Vercel Dashboard:"
  echo "   https://vercel.com/dashboard → tu-proyecto → Settings → Environment Variables"
  echo ""

  grep -E "NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY|CLERK" .env.local | while read line; do
    echo "   $line"
  done

  echo ""
  echo "🔍 Variable más importante (si falta causa el error):"
  echo "   SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  echo "💡 Para agregarlas desde la terminal, ejecuta:"
  echo "   vercel env pull .env.vercel"
  echo "   vercel env add NOMBRE_VARIABLE"
else
  echo "❌ No se encontró .env.local"
fi
