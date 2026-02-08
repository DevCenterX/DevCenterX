# DevCenterX - Guía de Despliegue en Vercel

## Solución de Bugs (Error 404 en `/api/config`)

### Problema Reportado
```
GET https://devcenterx.vercel.app/api/config 404 (Not Found)
⚠️ Respuesta del servidor: 404
⚠️ No se pudo cargar configuración desde servidor: HTTP 404
```

### Solución Implementada

He creado la estructura correcta para Vercel:

```
DevCenterX/
├── api/
│   └── config.js          ✨ NUEVO - Endpoint serverless
├── public/
│   └── keys.js (actualizado)
├── vercel.json            ✨ NUEVO - Configuración Vercel
└── ...
```

## Archivos Creados/Modificados

### 1. `api/config.js` - Endpoint Serverless
Función que devuelve configuración pública desde variables de entorno:
- ✅ Maneja CORS correctamente
- ✅ Valida método GET
- ✅ Devuelve JSON con todas las claves públicas
- ✅ Cachea por 1 hora

### 2. `vercel.json` - Configuración de Build
- Sirve `/public` como assets estáticos
- Mapea `/api/**` a funciones serverless
- SPA fallback para rutas no encontradas
- Headers de seguridad

### 3. `public/keys.js` - Cliente Actualizado
- Intenta cargar configuración sin warnings
- Fallback automático a defaults
- Sin errores en consola

## Configuración en Vercel Dashboard

### Paso 1: Conectar GitHub
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona `DevCenterX`

### Paso 2: Variables de Entorno
En **Settings → Environment Variables**, agrega:

```
GEMINI_API_KEY=AIzaSyC3IN6nJPqXdH8yP9w_rgqyio0WLb7M0Jc
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
SUPABASE_URL=https://sgqnjgfkycfzsrtwzdfq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncW5qZ2ZreWNmenNydHd6ZGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyOTkwMzMsImV4cCI6MjA3Nzg3NTAzM30.xEVn6iuos-l241hlrwHWpoz3q4seQHzDeXpzdhDoPNs
GITHUB_API_URL=https://api.github.com
```

### Paso 3: Deploy
```bash
git add .
git commit -m "Fix: Add Vercel API configuration"
git push
```

Vercel desplegará automáticamente. Espera 1-2 minutos.

## Verificar que Funciona

### En Terminal/PowerShell:
```powershell
# Test del endpoint
curl https://devcenterx.vercel.app/api/config

# Deberías recibir:
# {
#   "GEMINI_API_KEY": "AIzaSyC3IN6nJPqXdH8yP9w_rgqyio0WLb7M0Jc",
#   "GEMINI_API_URL": "https://generativelanguage.googleapis.com/...",
#   ...
# }
```

### En el Navegador:
1. Abre https://devcenterx.vercel.app/
2. Abre la consola (F12)
3. **No deberías ver errores de 404**
4. La configuración se debe cargar correctamente

## Estructura de Carpetas Final

```
api/
├── config.js              (Endpoint serverless)
public/
├── index.html
├── new.html
├── keys.js               (Cliente - cargar config)
├── ai-prompts-min.js
├── script.js
├── style.css
├── new.css
└── ...
vercel.json               (Configuración de build)
package.json
.env                      (Local - NO subir a repo)
```

## ¿Qué Pasa Ahora?

### ✅ Durante el Deploy
```
📦 Building...
✅ Installing dependencies
✅ Building API functions
✅ Preparing static files
✅ Deploying...
```

### ✅ En la App
1. Usuario accede a https://devcenterx.vercel.app/
2. `keys.js` intenta: `fetch('/api/config')`
3. Vercel llama a `api/config.js`
4. Se devuelve la configuración con CORS headers
5. Variables globales se cargan correctamente

### ✅ Comportamiento
- Si variables están en Vercel → Se cargan desde el servidor
- Si variables no están → Se devuelven vacías (fallback)
- Sin errores en consola en ambos casos

## Troubleshooting

### Sigue obteniendo 404
```bash
# Verifica que los archivos estén en Git
git status

# Debería mostrar:
# api/config.js (nuevo)
# vercel.json (nuevo)

# Si no aparecen:
git add api/config.js vercel.json
git commit -m "Add Vercel serverless API"
git push

# Espera redeploy en Vercel Dashboard
```

### Las variables no se cargan
En **Vercel Dashboard → Settings → Environment Variables**, verifica que:
1. Estén agregadas en el ambiente correcto (production)
2. No tengas espacios extras
3. Haz re-deploy: **Deployments → Redeploy**

### Error "Cannot find module"
Verifica que `package.json` tenga Node 18+ en `engines`:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

## Comandos Útiles

```bash
# Deploy local (simula Vercel)
vercel dev

# Deploy a producción
vercel deploy --prod

# Ver logs
vercel logs [URL]
```

## Notas de Seguridad

⚠️ **IMPORTANTE**:
- El `.env` file contiene keys reales - **NO SUBAS A GIT**
- Ya está en `.gitignore` ✅
- En Vercel Dashboard, las variables están encriptadas ✅
- El endpoint `/api/config` es público (como debe ser) ✅

## Próximos Pasos

1. ✅ Commit y push los archivos nuevos
2. ✅ Vuelve a Vercel Dashboard
3. ✅ Verifica deployment en **Deployments** tab
4. ✅ Pruba en tu navegador
5. ✅ Si ves **✅ AI Config loaded:** - ¡ÉXITO!
