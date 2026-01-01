-- ============================================
-- TABLA DE OFERTAS
-- ============================================
-- Esta tabla gestiona ofertas/descuentos temporales para productos

CREATE TABLE IF NOT EXISTS public.ofertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Información básica de la oferta
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  porcentaje_descuento DECIMAL(5,2) NOT NULL CHECK (porcentaje_descuento > 0 AND porcentaje_descuento <= 100),

  -- Productos incluidos en la oferta (array de IDs de productos)
  productos_ids TEXT[] NOT NULL DEFAULT '{}',

  -- Fechas de vigencia
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Estado de la oferta
  activa BOOLEAN DEFAULT true,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validaciones
  CONSTRAINT fecha_valida CHECK (fecha_fin > fecha_inicio)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ofertas_activa ON public.ofertas(activa);
CREATE INDEX IF NOT EXISTS idx_ofertas_fechas ON public.ofertas(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_ofertas_productos ON public.ofertas USING GIN(productos_ids);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ofertas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ofertas_updated_at
  BEFORE UPDATE ON public.ofertas
  FOR EACH ROW
  EXECUTE FUNCTION update_ofertas_updated_at();

-- ============================================
-- FUNCIÓN PARA OBTENER OFERTAS ACTIVAS
-- ============================================
-- Esta función retorna las ofertas que están activas y dentro del rango de fechas

CREATE OR REPLACE FUNCTION get_ofertas_activas()
RETURNS TABLE (
  id UUID,
  nombre VARCHAR,
  descripcion TEXT,
  porcentaje_descuento DECIMAL,
  productos_ids TEXT[],
  fecha_inicio TIMESTAMP WITH TIME ZONE,
  fecha_fin TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.nombre,
    o.descripcion,
    o.porcentaje_descuento,
    o.productos_ids,
    o.fecha_inicio,
    o.fecha_fin
  FROM public.ofertas o
  WHERE o.activa = true
    AND NOW() >= o.fecha_inicio
    AND NOW() <= o.fecha_fin
  ORDER BY o.fecha_inicio DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN PARA OBTENER OFERTA DE UN PRODUCTO
-- ============================================
-- Esta función retorna la oferta activa para un producto específico

CREATE OR REPLACE FUNCTION get_oferta_producto(producto_id TEXT)
RETURNS TABLE (
  id UUID,
  nombre VARCHAR,
  porcentaje_descuento DECIMAL,
  fecha_fin TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.nombre,
    o.porcentaje_descuento,
    o.fecha_fin
  FROM public.ofertas o
  WHERE o.activa = true
    AND NOW() >= o.fecha_inicio
    AND NOW() <= o.fecha_fin
    AND producto_id = ANY(o.productos_ids)
  ORDER BY o.porcentaje_descuento DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERMISOS (ajustar según tu configuración RLS)
-- ============================================
-- Habilitar RLS
ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (todos pueden ver ofertas activas)
CREATE POLICY "Ofertas activas son públicas"
  ON public.ofertas
  FOR SELECT
  USING (activa = true AND NOW() >= fecha_inicio AND NOW() <= fecha_fin);

-- Política para admin (necesitarás configurar authentication)
-- Por ahora permitimos todas las operaciones desde el service role
CREATE POLICY "Admin puede hacer todo"
  ON public.ofertas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE public.ofertas IS 'Tabla de ofertas/descuentos temporales para productos';
COMMENT ON COLUMN public.ofertas.porcentaje_descuento IS 'Porcentaje de descuento (1-100)';
COMMENT ON COLUMN public.ofertas.productos_ids IS 'Array de IDs de productos incluidos en la oferta';
COMMENT ON COLUMN public.ofertas.fecha_inicio IS 'Fecha y hora de inicio de la oferta';
COMMENT ON COLUMN public.ofertas.fecha_fin IS 'Fecha y hora de fin de la oferta';
