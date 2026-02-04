# 🚨 PLAN DE REMEDIACIÓN - SERVICE ROLE KEY EXPUESTO

**FECHA:** 2026-02-03
**SEVERIDAD:** CRÍTICA
**TOKEN EXPUESTO:** Service Role Key de Supabase

## ⚠️ IMPACTO

El Service Role Key expuesto permite:
- ✅ Acceso completo de lectura/escritura a TODA la base de datos
- ✅ Bypass de todas las políticas RLS (Row Level Security)
- ✅ Modificar/eliminar cualquier dato
- ✅ Acceder a información sensible de usuarios
- ✅ Modificar configuraciones de la base de datos

## 📋 ACCIONES INMEDIATAS REQUERIDAS

### 1. ROTAR EL SERVICE ROLE KEY (HACER AHORA MISMO)

```bash
# Ve a: https://supabase.com/dashboard/project/yfglwidanlpqsmbnound/settings/api
# 1. En la sección "Service Role Key", haz click en "Regenerate"
# 2. Confirma la regeneración
# 3. Copia el nuevo Service Role Key
```

### 2. ACTUALIZAR VARIABLES DE ENTORNO EN VERCEL

```bash
# Actualiza la variable SUPABASE_SERVICE_ROLE_KEY en Vercel
vercel env rm SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Pega el nuevo token cuando te lo pida

# También actualiza en preview y development si las usas
vercel env rm SUPABASE_SERVICE_ROLE_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview

vercel env rm SUPABASE_SERVICE_ROLE_KEY development
vercel env add SUPABASE_SERVICE_ROLE_KEY development
```

### 3. ACTUALIZAR .env.local

```bash
# Edita tu archivo .env.local y actualiza:
SUPABASE_SERVICE_ROLE_KEY=<nuevo-token>
```

### 4. LIMPIAR HISTORIAL DE GIT

**OPCIÓN A: Reescribir historial (RECOMENDADO si es repo personal/privado)**

```bash
# Instalar git-filter-repo si no lo tienes
pip3 install git-filter-repo

# Hacer backup del repo
cd ..
cp -r neuraidev neuraidev-backup
cd neuraidev

# Reescribir historial para eliminar el token
git filter-repo --invert-paths --path query_schema_info.mjs \
  --path query_schema.mjs \
  --path get_schema_all.mjs \
  --path get_schema.mjs

# Force push (CUIDADO: esto reescribe la historia)
git push origin --force --all
```

**OPCIÓN B: Si no puedes reescribir historial (repo público/compartido)**

```bash
# Solo elimina los archivos del commit actual
git add query_schema_info.mjs query_schema.mjs get_schema_all.mjs get_schema.mjs
git commit -m "security: Remove exposed Supabase Service Role Key"
git push origin main
```

### 5. VERIFICAR QUE NO HAYA MÁS SECRETOS EXPUESTOS

```bash
# Buscar otros posibles secretos
git grep -i "supabase" | grep -i "key"
git grep -i "secret"
git grep -i "password"
git grep -i "token"
```

### 6. VERIFICAR .gitignore

Asegúrate de que `.env.local` esté en `.gitignore`:

```bash
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
git add .gitignore
git commit -m "security: Update .gitignore to prevent env file commits"
```

## 📊 ARCHIVOS AFECTADOS

Los siguientes archivos contenían el Service Role Key hardcodeado:
- `query_schema_info.mjs` (ELIMINADO)
- `query_schema.mjs` (ELIMINADO)
- `get_schema_all.mjs` (ELIMINADO)
- `get_schema.mjs` (ELIMINADO)

## 🔍 COMMITS AFECTADOS

El token apareció en múltiples commits, incluyendo:
- `2e2b0af` - Corrigiendo errores de Supabase
- `c2bb3c6` - Fix: Mejorar sistema de tracking
- `e9e924b` - Botón de pago Wompi habilitado
- Y varios más...

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Service Role Key rotado en Supabase
- [ ] Variables de entorno actualizadas en Vercel
- [ ] .env.local actualizado localmente
- [ ] Archivos con tokens eliminados del repositorio
- [ ] Historial de Git limpiado (si aplica)
- [ ] .gitignore actualizado
- [ ] No hay otros secretos expuestos
- [ ] Aplicación desplegada con nuevo token
- [ ] Aplicación funciona correctamente con nuevo token

## 🔐 PREVENCIÓN FUTURA

1. **NUNCA** hardcodear secretos en archivos de código
2. **SIEMPRE** usar variables de entorno (`process.env.SUPABASE_SERVICE_ROLE_KEY`)
3. Configurar pre-commit hooks para detectar secretos:
   ```bash
   npm install --save-dev @commitlint/cli husky
   npx husky install
   ```
4. Revisar código antes de hacer commit
5. Usar herramientas como `gitleaks` o `trufflehog` para escanear secretos

## 📞 CONTACTO

Si detectas actividad sospechosa en la base de datos:
1. Revisa logs de Supabase Dashboard
2. Revisa logs de Vercel
3. Contacta a soporte de Supabase si es necesario
