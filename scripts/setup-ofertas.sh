#!/bin/bash

# Script para configurar el sistema de ofertas
# Ejecuta la migración SQL en Supabase

echo "🚀 Configurando sistema de ofertas..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Leer variables de entorno
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Verificar que existan las variables necesarias
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL no está configurado en .env.local"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurado en .env.local"
    exit 1
fi

echo -e "${BLUE}📋 Información de Supabase:${NC}"
echo "URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Extraer el ID del proyecto de la URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo -e "${YELLOW}📝 Para ejecutar la migración, sigue estos pasos:${NC}"
echo ""
echo "1. Ve a: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "2. Copia y pega el siguiente archivo SQL:"
echo "   supabase/migrations/create_ofertas_table.sql"
echo ""
echo "3. Haz clic en 'Run' o presiona Ctrl+Enter"
echo ""

echo -e "${BLUE}📄 Contenido del archivo SQL:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat supabase/migrations/create_ofertas_table.sql
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Después de ejecutar la migración, podrás:${NC}"
echo "  • Acceder al panel de ofertas en /dashboard/ofertas"
echo "  • Crear y gestionar ofertas con descuentos"
echo "  • Ver ofertas activas automáticamente en productos"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  Solo usuarios con email julii1295@gmail.com pueden acceder"
echo ""

read -p "¿Quieres abrir el SQL Editor de Supabase ahora? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]
then
    xdg-open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" 2>/dev/null || open "https://supabase.com/dashboard/project/$PROJECT_REF/sql/new" 2>/dev/null
    echo -e "${GREEN}✅ Abriendo navegador...${NC}"
fi

echo ""
echo -e "${GREEN}✨ ¡Listo! Sigue las instrucciones arriba para completar la configuración.${NC}"
