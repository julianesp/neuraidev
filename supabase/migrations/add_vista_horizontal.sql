-- Agregar columna vista_horizontal a la tabla Producto
-- Esta columna determina si un producto se muestra en formato horizontal (2 columnas) o vertical (1 columna)

ALTER TABLE "Producto"
ADD COLUMN IF NOT EXISTS vista_horizontal BOOLEAN DEFAULT false;

-- Comentario en la columna para documentación
COMMENT ON COLUMN "Producto".vista_horizontal IS 'Indica si el producto debe mostrarse en formato horizontal (true) ocupando 2 columnas, o vertical (false) ocupando 1 columna';
