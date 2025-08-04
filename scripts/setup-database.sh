#!/bin/bash

echo "🔧 Configurando Base de Datos PostgreSQL para NeuraIdev"
echo "======================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si un comando fue exitoso
check_success() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ Error: $1${NC}"
        exit 1
    fi
}

echo -e "${BLUE}📡 Verificando que PostgreSQL esté corriendo...${NC}"
sudo systemctl start postgresql
check_success "PostgreSQL iniciado"

echo -e "${BLUE}👤 Creando usuario y base de datos...${NC}"
sudo -u postgres psql << EOF
-- Crear usuario si no existe
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'neuraidev') THEN
        CREATE USER neuraidev WITH PASSWORD 'dataNeuraidev_25@';
        RAISE NOTICE 'Usuario neuraidev creado';
    ELSE
        RAISE NOTICE 'Usuario neuraidev ya existe';
    END IF;
END
\$\$;

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE anuncios_db OWNER neuraidev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'anuncios_db');

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE anuncios_db TO neuraidev;

-- Confirmar
\q
EOF

check_success "Usuario y base de datos configurados"

echo -e "${BLUE}🔍 Probando conexión...${NC}"
PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -c "SELECT 'Conexión exitosa' as status;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Conexión a PostgreSQL exitosa${NC}"
else
    echo -e "${RED}❌ Error de conexión. Intentando solucionar...${NC}"
    
    # Intentar arreglar problemas comunes
    echo -e "${YELLOW}🔧 Aplicando configuración de autenticación...${NC}"
    
    # Backup y modificar pg_hba.conf para permitir conexiones locales
    sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup
    
    # Agregar línea para permitir conexiones locales con password
    echo "local   all             neuraidev                               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    echo "host    all             neuraidev       127.0.0.1/32            md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
    
    # Reiniciar PostgreSQL
    sudo systemctl restart postgresql
    sleep 2
    
    # Probar de nuevo
    PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -c "SELECT 'Conexión exitosa' as status;" > /dev/null 2>&1
    check_success "Conexión corregida"
fi

echo -e "${BLUE}📋 Creando tablas...${NC}"
PGPASSWORD='dataNeuraidev_25@' psql -h localhost -U neuraidev -d anuncios_db -f scripts/create-admin-table.sql
check_success "Tablas creadas"

echo -e "${BLUE}📝 Verificando configuración de .env.local...${NC}"
if grep -q "DATABASE_URL" .env.local; then
    echo -e "${GREEN}✅ .env.local ya contiene DATABASE_URL${NC}"
else
    echo -e "${YELLOW}⚙️  Agregando DATABASE_URL a .env.local...${NC}"
    echo "" >> .env.local
    echo "# Configuración de Base de Datos PostgreSQL" >> .env.local
    echo "DATABASE_URL=postgresql://neuraidev:dataNeuraidev_25@localhost:5432/anuncios_db" >> .env.local
    check_success "DATABASE_URL agregado a .env.local"
fi

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada exitosamente!${NC}"
echo -e "${BLUE}📋 Resumen:${NC}"
echo "   ✅ PostgreSQL configurado"
echo "   ✅ Usuario 'neuraidev' creado"
echo "   ✅ Base de datos 'anuncios_db' creada"
echo "   ✅ Tablas de administración creadas"
echo "   ✅ Variables de entorno configuradas"
echo ""
echo -e "${YELLOW}🚀 Próximo paso:${NC}"
echo "   Ejecuta: ${BLUE}node scripts/create-admin-user.js${NC}"
echo ""