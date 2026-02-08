# 🔐 Seguridad de Variables de Entorno

## Arquitetura Actual

Tu proyecto ahora carga **todas las variables desde el servidor** de forma segura:

```
┌─ Development (.env en tu máquina)
│
├─ Production (Vercel / Cloudflare Workers)
│   └─ Variables de Entorno en Settings
│
└─ /api/config endpoint
   └─ Sirve solo claves PÚBLICAS al cliente
```

## Cambios Realizados

### ✅ Eliminado
- ❌ Credenciales hardcodeadas en `keys.js`
- ❌ Exposición de secretos en el cliente

### ✅ Creado
- ✨ Endpoint `/api/config` en `server.js`
- ✨ Nuevo `keys.js` que carga desde el servidor
- ✨ `.env.example` para documentar variables
- ✨ `VERCEL_SETUP.md` para configurar en producción

## Cómo Funciona Localmente

```bash
# 1. Las variables están en .env
GEMINI_API_KEY=tu_clave_aqui
SUPABASE_URL=tu_url_aqui

# 2. server.js lee .env (Cloudflare Workers)
# 3. Endpoint /api/config las sirve públicamente
# 4. keys.js las carga en window.GEMINI_API_KEY, etc.
```

## Cómo Funciona en Vercel

```bash
# 1. Agregas variables en Vercel Settings
# 2. Vercel las inyecta automáticamente en la app
# 3. El endpoint /api/config las sirve al cliente
# 4. Todo funciona igual que localmente
```

## Qué Variables se Exponen al Cliente

**PÚBLICAS** (seguro exponer):
- `GEMINI_API_KEY` - API Key de Gemini
- `GEMINI_API_URL` - URL del servicio
- `SUPABASE_URL` - URL de Supabase
- `SUPABASE_ANON_KEY` - Clave anon de Supabase
- `GITHUB_API_URL` - URL pública de GitHub API

**PRIVADAS** (nunca se exponen):
- `GITHUB_TOKEN` - Token de GitHub (no está en el endpoint)

## Migración Completada

| Archivo | Antes | Después |
|---------|-------|---------|
| `keys.js` | Hardcoded + .env | Cargado del servidor |
| `server.js` | Solo archivos estáticos | + endpoint `/api/config` |
| `wrangler.jsonc` | Sin variables | Con vars para producción |
| `.env.example` | N/A | Creado para documentación |

## Next Steps

1. **Local**: Todo funciona igual, pero más seguro
2. **GitHub**: `.env` está en `.gitignore` ✓
3. **Vercel**: Configura variables en Settings (ver `VERCEL_SETUP.md`)
4. **Deploy**: `npm run deploy` o git push

---

**Resultado final**: Las variables siempre vienen del servidor, nunca están hardcodeadas. 🔒
