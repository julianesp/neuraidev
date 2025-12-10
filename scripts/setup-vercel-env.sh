#!/bin/bash

# Script para configurar variables de entorno en Vercel
# Uso: bash scripts/setup-vercel-env.sh

echo "🚀 Configurando variables de entorno en Vercel..."
echo ""

# Verificar que existe .env.local
if [ ! -f .env.local ]; then
    echo "❌ Error: No se encontró el archivo .env.local"
    echo "   Crea primero tu archivo .env.local con las credenciales"
    exit 1
fi

# Verificar que vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI no está instalado. Instalando..."
    npm install -g vercel
fi

echo "🔐 Iniciando sesión en Vercel..."
vercel login

echo ""
echo "📝 Agregando variables de entorno..."
echo ""

# Leer variables desde .env.local y agregarlas a Vercel
while IFS='=' read -r key value; do
    # Ignorar líneas vacías y comentarios
    if [[ -z "$key" ]] || [[ "$key" =~ ^# ]]; then
        continue
    fi

    # Limpiar espacios
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Solo agregar variables importantes
    if [[ "$key" == *"WOMPI"* ]] || \
       [[ "$key" == *"SUPABASE"* ]] || \
       [[ "$key" == *"CLERK"* ]] || \
       [[ "$key" == "NEXT_PUBLIC_SITE_URL" ]] || \
       [[ "$key" == "ADMIN_EMAILS" ]]; then

        echo "✅ Agregando: $key"

        # Agregar a production
        echo "$value" | vercel env add "$key" production --force 2>/dev/null || true

        # Agregar a preview
        echo "$value" | vercel env add "$key" preview --force 2>/dev/null || true

        # Agregar a development
        echo "$value" | vercel env add "$key" development --force 2>/dev/null || true
    fi
done < .env.local

echo ""
echo "✅ Variables configuradas en Vercel"
echo ""
echo "🚀 Ahora necesitas hacer un redeploy:"
echo "   1. Opción 1: vercel --prod"
echo "   2. Opción 2: git push (si tienes auto-deploy)"
echo "   3. Opción 3: Desde el dashboard de Vercel → Redeploy"
echo ""
