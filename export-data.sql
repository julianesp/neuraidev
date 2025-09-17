-- Script para exportar datos de la base local
-- Ejecutar este comando en tu terminal para generar el dump:
-- PGPASSWORD=neuraidev2024 pg_dump -U neuraidev -h localhost -p 5432 neuraidev_db --data-only --no-owner --no-privileges > backup-data.sql

-- Alternativa: Script manual para verificar datos
\echo 'Verificando datos en base local...'
SELECT 'Productos' as tabla, COUNT(*) as total FROM "Producto";
SELECT 'Imagenes' as tabla, COUNT(*) as total FROM "ProductoImagen";
SELECT 'Tiendas' as tabla, COUNT(*) as total FROM "Tienda";
SELECT 'Categorias' as tabla, COUNT(*) as total FROM "Categoria";