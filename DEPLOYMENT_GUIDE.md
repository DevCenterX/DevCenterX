# DevCenterX - Guía de Despliegue

## Solución de Bugs de Configuración

### Problema Reportado
- Error 404 al cargar `/api/config`
- Configuración no se carga desde el servidor
- Fallback a configuración por defecto (esto es esperado, pero genera warnings)

### Soluciones Implementadas

#### 1. **Mejora en `keys.js`**
- Eliminadas las consolas.log() que generaban warnings en producción
- El script ahora falla silenciosamente y usa fallback automático
- La configuración se carga correctamente desde el endpoint cuando está disponible

#### 2. **Mejora en `_worker.js`**
- Agregado soporte CORS preflight (OPTIONS)
- Mejorado manejo de rutas para `/api/*`
- Agregado cache-control para `/api/config`
- Mejor manejo de 404s para rutas API desconocidas

#### 3. **Mejor estructura en `wrangler.jsonc`**
- Agregados comentarios sobre cómo configurar secrets
- Separada configuración de desarrollo y producción
- Indicadas las variables que deben configurarse en Cloudflare Dashboard

## Cómo Desplegar Correctamente

### Requisitos Previos
```bash
npm install -g wrangler
```

### Paso 1: Configurar Secretos en Cloudflare Dashboard

1. Ve a tu sitio en **Cloudflare Dashboard**
2. Selecciona **Settings → Environment & Secrets**
3. Agrega estos secretos en el ambiente `production`:
   - `GEMINI_API_KEY`: Tu clave de API de Gemini
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_ANON_KEY`: Clave anónima de Supabase

### Paso 2: Desplegar con Wrangler

```bash
# Desarrollo local
wrangler dev

# Desplegar a producción
wrangler deploy --env production
```

### Paso 3: Verificar Despliegue

```bash
# Verificar que el endpoint funciona
curl https://devcenterx.vercel.app/api/config

# Deberías recibir:
{
  "GEMINI_API_KEY": "tu-clave-aquí",
  "GEMINI_API_URL": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
  "SUPABASE_URL": "tu-url",
  "SUPABASE_ANON_KEY": "tu-clave",
  "GITHUB_API_URL": "https://api.github.com"
}
```

## Comportamiento Después de la Solución

### ✅ Correcto
- El script intenta cargar `/api/config` silenciosamente
- Si falla (red, 404, etc.), usa configuración por defecto automáticamente
- No hay warnings o errores en la consola
- La aplicación funciona normalmente en ambos casos

### 📋 Fallback
Si las variables de entorno no están configuradas en Cloudflare:
- Se devuelven valores vacíos `""`
- La app funciona con configuración local
- Los features que requieren API keys pueden requerir configuración manual

## Variables de Entorno

| Variable | Propósito | Ejemplo |
|----------|-----------|---------|
| `GEMINI_API_KEY` | Clave API de Google Gemini | `AIzaSy...` |
| `GEMINI_API_URL` | URL del modelo Gemini | Predefinido |
| `SUPABASE_URL` | URL de Supabase | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave anónima Supabase | `eyJhbG...` |
| `GITHUB_API_URL` | URL de GitHub API | Predefinido |

## Troubleshooting

### Sigue obteniendo 404
1. Verifica que el worker esté desplegado: `wrangler publish --env production`
2. Espera 1-2 minutos después del deploy para que se propague
3. Verifica en Cloudflare Dashboard que el script esté activo

### Las variables no se cargan
1. Verifica que los secretos estén configurados en Cloudflare Dashboard
2. Confirma que el ambiente sea `production` en el deploy
3. Intenta hacer: `wrangler secret list --env production`

### La app no funciona localmente
```bash
wrangler dev --env development
```
Abre `http://localhost:8787` en tu navegador

## Notas Importantes

- Los secretos (API keys) **no deben** estar en `wrangler.jsonc`
- Usa Cloudflare Dashboard para gestionar secretos sensibles
- El endpoint `/api/config` es público y devuelve solo URLs y claves públicas
- Nunca expongas `GEMINI_API_KEY` en el client-side en producción
