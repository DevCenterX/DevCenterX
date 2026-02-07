# Tutorial: Configurar Proveedores OAuth en Firebase

## Índice
1. [Configuración General de Firebase](#configuración-general)
2. [Google OAuth](#google-oauth)
3. [GitHub OAuth](#github-oauth)
4. [Pruebas Locales](#pruebas-locales)
5. [Troubleshooting](#troubleshooting)

---

## Configuración General

Tu proyecto Firebase (`devcenter-agent-48c86`) ya está configurado con los datos necesarios. El sistema de login basado en Firebase está integrado en `public/new.html`.

Nota: el sitio de producción es https://devcenterx.vercel.app — agrega este dominio en las listas de orígenes y dominios autorizados en Firebase/Google/GitHub.

### Archivo de Configuración Actual
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
  authDomain: "devcenter-agent-48c86.firebaseapp.com",
  projectId: "devcenter-agent-48c86",
  storageBucket: "devcenter-agent-48c86.firebasestorage.app",
  messagingSenderId: "911929994293",
  appId: "1:911929994293:web:1d08f68b4c507ee162557c",
  measurementId: "G-S5GTYBRVK8"
};
```

---

## Google OAuth (OAuth 2.0)

### Paso 1: Habilitar Google en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **`devcenter-agent-48c86`**
3. En el menú izquierdo, ve a **Build** → **Authentication**
4. Haz clic en la pestaña **Sign-in method** (o Método de inicio de sesión)
5. Haz clic en **Google**
6. Activa el toggle de **Enable** (Habilitada)
7. Selecciona o crea un **Support email** (email de soporte del proyecto)
8. Guarda los cambios

### Paso 2: Configurar Credenciales de OAuth en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Asegúrate de estar en el proyecto **`devcenter-agent-48c86`**
3. En el menú izquierdo, ve a **APIs & Services** → **Credentials**
4. Haz clic en **+ Create Credentials** → **OAuth 2.0 Client IDs**
5. Si no existe, primero debes crear una **OAuth Consent Screen**:
   - Ve a **OAuth consent screen**
   - Selecciona **External** como User Type
   - Completa la información requerida:
     - App name: "DevCenterX"
     - User support email: tu email
     - Developer contact: tu email
   - Haz clic en **Save and Continue**
6. Una vez completado, vuelve a **Credentials**
7. Crea una credencial **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Name: "DevCenterX Web App"
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `http://192.168.x.x:3000` (tu IP local)
     - `https://devcenter-agent-48c86.firebaseapp.com`
     - `https://devcenterx.vercel.app`
   - **Authorized redirect URIs:**
     - `https://devcenter-agent-48c86.firebaseapp.com/__/auth/handler`
     - `http://localhost:3000/__/auth/handler`
     - `https://devcenterx.vercel.app/__/auth/handler`
8. Copia el **Client ID** (lo necesitarás después si decides usar Google Sign-In Direct)

### Paso 3: Configurar Dominio Autorizado

Firebase requiere autorizar los dominios desde los que se usará OAuth:

1. En **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Agrega:
   - `localhost:3000` o `localhost:PORT` (tu puerto local)
   - Tu dominio de producción (cuando esté listo)
   - `devcenter-agent-48c86.firebaseapp.com` (ya debería estar)

### Paso 4: Probar Google OAuth

El código ya está configurado en `new.html`:

```javascript
// Google Auth - Solo copia el bloque
const googleLoginBtn = document.getElementById('googleLoginBtn');
const googleSignupBtn = document.getElementById('googleSignupBtn');

async function handleGoogleAuth() {
  try {
    const result = await signInWithPopup(auth, window.googleProvider);
    const user = result.user;
    // ... guardar datos en Firestore
    showAuthMessage('¡Iniciado con Google! Redirigiendo...', 'success');
    setTimeout(() => window.location.href = '/', 1500);
  } catch (error) {
    showAuthMessage('Error: ' + error.message);
  }
}

if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleAuth);
if (googleSignupBtn) googleSignupBtn.addEventListener('click', handleGoogleAuth);
```

---

## GitHub OAuth

### Paso 1: Habilitar GitHub en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. **Build** → **Authentication** → **Sign-in method**
3. Busca y haz clic en **GitHub**
4. Activa el toggle de **Enable**
5. **Nota:** Firebase te pedirá credenciales de GitHub

### Paso 2: Crear OAuth App en GitHub

1. Ve a [GitHub Settings → Developer settings](https://github.com/settings/apps)
   - O: Your Profile → Settings → Developer settings → OAuth Apps
2. Haz clic en **New OAuth App**
3. Completa el formulario:
   - **Application name:** `DevCenterX`
   - **Homepage URL:** `https://devcenter-agent-48c86.firebaseapp.com`
     - O para producción: `https://devcenterx.vercel.app`
     - O para desarrollo: `http://localhost:3000`
   - **Application description:** `Platform para crear apps con IA`
   - **Authorization callback URL:**
     - `https://devcenter-agent-48c86.firebaseapp.com/__/auth/handler/github/callback`
     - `https://devcenterx.vercel.app/__/auth/handler/github/callback`
     - O para desarrollo: `http://localhost:3000/__/auth/handler`
4. Haz clic en **Register application**
5. Copia el **Client ID** y genera un nuevo **Client Secret**

### Paso 3: Configurar en Firebase

1. De vuelta en **Firebase Console** → **GitHub Sign-in**
2. Pega el **Client ID** de GitHub
3. Pega el **Client Secret** de GitHub
4. Haz clic en **Save**

### Paso 4: Probar GitHub OAuth

El código ya está en `new.html`:

```javascript
// GitHub Auth
const githubLoginBtn = document.getElementById('githubLoginBtn');
const githubSignupBtn = document.getElementById('githubSignupBtn');

async function handleGitHubAuth() {
  try {
    const result = await signInWithPopup(auth, window.githubProvider);
    const user = result.user;
    // ... guardar datos en Firestore
    showAuthMessage('¡Iniciado con GitHub! Redirigiendo...', 'success');
    setTimeout(() => window.location.href = '/', 1500);
  } catch (error) {
    showAuthMessage('Error: ' + error.message);
  }
}

if (githubLoginBtn) githubLoginBtn.addEventListener('click', handleGitHubAuth);
if (githubSignupBtn) githubSignupBtn.addEventListener('click', handleGitHubAuth);
```

---

## Pruebas Locales

### Para desarrollar localmente:

1. **Asegúrate de que tu servidor está corriendo:**
   ```bash
   npm start
   # O
   node server.js
   ```

2. **Accede a:** `http://localhost:3000` (o tu puerto configurado)

3. **En Firebase Console, agrega tus dominios autorizados:**
   - **Authentication** → **Settings** → **Authorized Domains**
  - Agrega: `localhost:3000`
  - Agrega: `devcenterx.vercel.app`

4. **Prueba los botones:**
   - Click en "Continuar con Google"
   - Click en "Continuar con GitHub"
   - Se abrirá un popup para autenticarse

### Variables de Entorno (Opcional)

Si quieres usar variables de entorno, crea un archivo `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY
VITE_FIREBASE_AUTH_DOMAIN=devcenter-agent-48c86.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=devcenter-agent-48c86
VITE_FIREBASE_STORAGE_BUCKET=devcenter-agent-48c86.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=911929994293
VITE_FIREBASE_APP_ID=1:911929994293:web:1d08f68b4c507ee162557c
VITE_FIREBASE_MEASUREMENT_ID=G-S5GTYBRVK8
```

---

## Estructura de Datos en Firestore

Cuando un usuario se registra o inicia sesión con OAuth, se crean/actualizan estos documentos:

### Colección: `users`
```javascript
{
  uid: "user_firebase_id",
  email: "usuario@ejemplo.com",
  username: "username_extraido_del_email",
  displayName: "Usuario Name",
  avatar: "url_de_foto_de_perfil",
  provider: "google" | "github" | "email",
  createdAt: "2024-02-07T...",
  updatedAt: "2024-02-07T..."
}
```

### Colección: `proyectos`
```javascript
{
  uid: "user_firebase_id",
  proyectos: [
    {
      id: "project_id",
      nombre: "Mi App",
      descripcion: "...",
      createdAt: "...",
      updatedAt: "..."
    }
  ],
  createdAt: "2024-02-07T..."
}
```

---

## Troubleshooting

### Error: "Popup blocked"
```
Solución: El navegador está bloqueando popups. 
- Asegúrate de que signInWithPopup() se ejecuta directamente desde un click del usuario
- No dentro de un timeout o evento asincrónico
```

### Error: "Invalid client ID"
```
Solución: 
1. Verifica que la credencial de Google está correctamente guardada
2. Comprueba los dominios autorizados en Google Cloud Console
3. Asegúrate de que el Client ID coincide en OAuth Consent Screen
```

### Error: "Redirect URI mismatch"
```
Solución:
1. Verifica que las URLs de callback coinciden exactamente:
   - En GitHub OAuth App
   - En Firebase Console
   - En Google Cloud Console
2. Nota: Las URLs distinguen entre http/https y www/no-www
```

### Error: "Auth/operation-not-allowed"
```
Solución:
1. Ve a Firebase Console → Authentication
2. Asegúrate de que el método está "Enabled"
3. Si no aparece, habilítalo en "Sign-in method"
```

### Error: "CORS issues"
```
Solución:
1. Asegúrate de que tu dominio está en "Authorized domains"
2. Para desarrollo local, autoriza: localhost:puerto
3. Firebase maneja CORS automáticamente, pero a veces necesita actualización
```

---

## Seguridad

### Reglas de Firestore (Importante)

Reemplaza las reglas en Firestore con estas para proteger tus datos:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cada usuario solo puede leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /proyectos/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Publicar proyectos (opcional, para galería pública)
    match /proyectos_publicos/{projectId} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.ownerUid;
    }
  }
}
```

---

## Pasos Siguientes

### 1. Configurar Storage para imágenes
```javascript
// Subir avatar
import { uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

const storageRef = ref(storage, `avatars/${user.uid}`);
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);
```

### 2. Implementar logout
```javascript
// Ya está en login.js
import { signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

function handleLogout() {
  signOut(auth).then(() => {
    // Limpiar localStorage
    localStorage.removeItem('devcenter_user_id');
    window.location.href = '/index.html';
  });
}
```

### 3. Sincronizar datos de usuario a otras páginas
```javascript
// En cualquier página, usar el UID del usuario
const userId = localStorage.getItem('devcenter_user_id');
const userDoc = await getDoc(doc(db, 'users', userId));
console.log(userDoc.data()); // Datos del usuario
```

---

## Resumen Rápido

| Acción | Ubicación | Estado |
|--------|-----------|--------|
| 🔵 Google OAuth | Firebase Console | ✅ Habilitada |
| 🔵 GitHub OAuth | Firebase Console | ⚙️ Requiere credenciales |
| 📱 Formularios | `public/new.html` | ✅ Configurados |
| 📊 Firestore | `devcenter-agent-48c86` | ✅ Lista |
| 🔒 Reglas de seguridad | Firestore Console | ⚙️ Actualizar recomendado |

---

## Contacto & Soporte

Para problemas:
1. Revisa [Documentación oficial de Firebase](https://firebase.google.com/docs)
2. Revisa la [Documentación de Auth en Firebase](https://firebase.google.com/docs/auth/web/google-signin)
3. Abre un issue en GitHub con detalles del error

---

**Última actualización:** Febrero 7, 2026
**Versión Firebase SDK:** 12.9.0
