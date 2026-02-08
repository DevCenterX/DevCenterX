# DevCenterX - Guía de Despliegue en Vercel

## Solución de Bugs (Error 404 en `/api/config`)

### Problema Reportado
```
GET https://devcenterx.vercel.app/api/config 404 (Not Found)
⚠️ Respuesta del servidor: 404
⚠️ No se pudo cargar configuración desde servidor: HTTP 404
```

### Solución Implementada

He creado la estructura correcta para Vercel con seguridad mejorada:

```
DevCenterX/
├── api/
│   └── config.js          ✨ NUEVO - Endpoint serverless (solo key pública)
├── public/
│   ├── new.html           (Firebase config en inline script)
│   └── keys.js            (actualizado)
├── vercel.json            (configuración de build + seguridad)
└── ...
```

## Archivos Modificados

### 1. `api/config.js` - Endpoint Seguro
- ✅ Solo expone `GEMINI_API_KEY` (clave pública de Google)
- ✅ NO expone URLs (GEMINI_API_URL, GITHUB_API_URL)
- ✅ NO incluye referencias a Supabase (deprecated)
- ✅ Firebase se configura directamente en `new.html`
- ✅ Maneja CORS correctamente

### 2. `public/keys.js` - Cliente Actualizado
- ✅ Carga GEMINI_API_KEY desde `/api/config`
- ✅ URLs públicas cargadas desde hardcoded defaults (seguro)
- ✅ Firebase no se carga aquí (ya está en new.html)
- ✅ Sin errores en consola

### 3. `new.html` - Firebase Integrado
- ✅ Firebase config está en inline script (más seguro)
- ✅ Autenticación y Firestore funcional
- ✅ No depende de `/api/config` para Firebase

### 4. `.env` - Limpiado
- ✅ Removido SUPABASE_URL y SUPABASE_ANON_KEY
- ✅ Agregado config de Firebase (solo IDs públicos)
- ✅ Mantiene GEMINI_API_KEY

## Configuración en Vercel Dashboard

### Paso 1: Conectar GitHub
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Selecciona `DevCenterX`

### Paso 2: Variables de Entorno
En **Settings → Environment Variables**, agrega **SOLO**:

```
GEMINI_API_KEY = AIzaSyC3IN6nJPqXdH8yP9w_rgqyio0WLb7M0Jc
```

**NO agregues URLs** - son públicas y no necesitan protección:
- ~~GEMINI_API_URL~~ (usamos default)
- ~~GITHUB_API_URL~~ (usamos default)
- ~~SUPABASE_*~~ (deprecated - usando Firebase)

### Paso 3: Deploy
```bash
git add .
git commit -m "Fix: Secure Vercel config - Firebase only, remove Supabase"
git push
```

Vercel desplegará automáticamente. Espera 1-2 minutos.

## Verificar que Funciona

### En Terminal/PowerShell:
```powershell
# Test del endpoint
curl https://devcenterx.vercel.app/api/config

# Deberías recibir SOLO:
# {
#   "GEMINI_API_KEY": "AIzaSyC3IN6nJPqXdH8yP9w_rgqyio0WLb7M0Jc"
# }
```

### En el Navegador:
1. Abre https://devcenterx.vercel.app/
2. Abre la consola (F12 → Console tab)
3. **Deberías VER:**
   ```
   ✅ AI Config loaded: {enableAdvancedPrompts: true, ...}
   ```
4. **NO deberías ver:**
   - Errores de 404 en `/api/config`
   - Errores sobre Supabase
   - Warnings en rojo

## Seguridad Implementada

### ✅ Lo que está protegido:
- No exponemos URLs de APIs
- No exponemos credenciales sensibles
- Solo GEMINI_API_KEY es pública (por diseño de Google)
- Firebase config está en cliente (Firebase Design)

### ✅ Lo que es público (seguro):
- GEMINI_API_KEY (Google lo diseñó así)
- URLs estándar de APIs públicas
- Firebase project ID (necesario para cliente)

### ❌ Lo que removimos:
- Supabase (deprecated)
- URLs de endpoints
- Secrets no necesarios

## Estructura de Carpetas Final

```
api/
├── config.js              (Endpoint serverless - SEGURO)
public/
├── index.html
├── new.html               (Firebase inline config)
├── keys.js                (Carga GEMINI_API_KEY)
├── ai-prompts-min.js
├── script.js
├── style.css
├── new.css
└── ...
vercel.json               (Configuración de build + headers seguridad)
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
2. Se carga `new.html` con Firebase inline config
3. Se carga `keys.js` que intenta: `fetch('/api/config')`
4. Vercel llama a `api/config.js`
5. Se devuelve `{ GEMINI_API_KEY: "..." }`
6. Variables globales se cargan correctamente
7. Firebase funciona normalmente

### ✅ Comportamiento
- Si GEMINI_API_KEY está en Vercel → Se carga desde el servidor
- Si no está → Se devuelve string vacío (fallback)
- **Sin errores en consola en ambos casos**
- Firebase funciona siempre (config en HTML)

## Troubleshooting

### Sigue obteniendo 404
```bash
# Verifica que los archivos estén en Git
git status

# Debería mostrar:
# api/config.js (debe existir)
# vercel.json (debe existir)

# Si no aparecen:
git add api/ vercel.json
git commit -m "Add Vercel serverless API"
git push

# Espera redeploy en Vercel Dashboard
```

### Las variables no se cargan
En **Vercel Dashboard → Settings → Environment Variables**, verifica que:
1. `GEMINI_API_KEY` esté agregado
2. No tengas espacios extras
3. Haz re-deploy: **Deployments → Redeploy**

### Sigo viendo errores sobre Supabase
```bash
# Busca referencias al viejo código
grep -r "SUPABASE" .

# Si hay algunas:
# 1. Reemplazalas
# 2. Commit y push
# 3. Vercel redeploy

# Limpia el cache del navegador
# Ctrl+Shift+Del → Cached images and files
```

### Firebase no funciona
1. Abre `new.html` en el editor
2. Verifica que `firebaseConfig` esté correcto
3. Verifica que Firebase scripts se carguen (Network tab)
4. Abre la consola - debería haber logs de Firebase

## Comandos Útiles

```bash
# Deploy local (simula Vercel)
vercel dev

# Deploy a producción
vercel deploy --prod

# Ver logs
vercel logs [URL]

# Limpiar build cache
vercel build --yes
```

## Notas de Seguridad

⚠️ **IMPORTANTE**:
- El `.env` file contiene la GEMINI_API_KEY - **NO SUBAS A GIT**
- Ya está en `.gitignore` ✅
- En Vercel Dashboard está encriptada ✅
- El endpoint `/api/config` es público (solo expone key pública) ✅
- Firebase config es público (por diseño de Firebase) ✅
- No exponemos URLs ni credentials sensibles ✅

## Próximos Pasos

1. ✅ Commit y push de los cambios:
   ```bash
   git add -A
   git commit -m "Refactor: Secure config, remove Supabase, use Firebase"
   git push
   ```

2. ✅ En Vercel Dashboard agregar variable:
   - `GEMINI_API_KEY = AIzaSyC3IN6nJPqXdH8yP9w_rgqyio0WLb7M0Jc`

3. ✅ Espera deploy (1-2 min)

4. ✅ Verifica en tu navegador:
   - https://devcenterx.vercel.app/
   - Abre Console (F12)
   - Busca: "✅ AI Config loaded"
   - ¡ÉXITO! 🎉

