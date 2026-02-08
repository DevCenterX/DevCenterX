# 🚀 Configuración en Vercel

## Variables de Entorno Requeridas

Sigue estos pasos para configurar tu proyecto en Vercel:

### 1. Ve a tu proyecto en Vercel
- Dashboard → Selecciona tu proyecto

### 2. Settings → Environment Variables

Añade estas variables **exactamente** como aparecen:

| Variable | Valor | Tipo |
|----------|-------|------|
| `GEMINI_API_KEY` | Tu API Key de Google Gemini | Secret |
| `SUPABASE_URL` | URL de tu proyecto Supabase | Secret |
| `SUPABASE_ANON_KEY` | Anon Key de Supabase | Secret |
| `GITHUB_API_URL` | `https://api.github.com` | Public |
| `GEMINI_API_URL` | `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` | Public |

### 3. Dónde obtener cada valor

**Google Gemini:**
- Ve a https://aistudio.google.com/app/apikey
- Copia tu API Key

**Supabase:**
- Dashboard → Project Settings
- Copia la URL y Anon Key

**GitHub:**
- No necesita configuración (es pública)

### 4. Después de agregar variables
- Haz clic en "Save"
- Vuelve a desplegar (Redeploy) tu proyecto
- Las variables estarán disponibles en la app

## Flujo de Seguridad

```
Backend (.env) → server.js (/api/config) → Frontend (keys.js)
```

- El backend carga variables desde `.env` (desarrollo) o Variables de Entorno (Vercel)
- El endpoint `/api/config` sirve **solo las claves públicas** al cliente
- El cliente nunca accede directamente a `GITHUB_TOKEN` (no se expone)
- Las variables secretas nunca salen del servidor

## Verificar que funciona

Abre la consola del navegador (F12) y ejecuta:
```javascript
console.log(window.SUPABASE_URL);
console.log(window.GEMINI_API_KEY);
```

Deberías ver los valores configurados.
