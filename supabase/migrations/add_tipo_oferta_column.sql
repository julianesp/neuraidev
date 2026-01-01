-- ============================================
-- ACTUALIZACIÓN DE TABLA OFERTAS
-- Agregar columna tipo_oferta para soportar combos
-- ============================================

-- Agregar columna tipo_oferta si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'ofertas'
    AND column_name = 'tipo_oferta'
  ) THEN
    ALTER TABLE public.ofertas
    ADD COLUMN tipo_oferta VARCHAR(20) DEFAULT 'individual' CHECK (tipo_oferta IN ('individual', 'combo'));

    COMMENT ON COLUMN public.ofertas.tipo_oferta IS 'Tipo de oferta: individual (descuento en productos separados) o combo (descuento al comprar productos juntos)';
  END IF;
END $$;

-- Actualizar ofertas existentes para que tengan tipo_oferta = 'individual' por defecto
UPDATE public.ofertas
SET tipo_oferta = 'individual'
WHERE tipo_oferta IS NULL;
