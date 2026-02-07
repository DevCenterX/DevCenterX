# Guía Rápida de Pruebas - Firebase Auth

## ✅ Estado Actual

La autenticación con Firebase está totalmente configurada en `public/new.html` con:

- ✅ **Email/Contraseña** - Crear cuenta e iniciar sesión
- ✅ **Google OAuth** - Inicia sesión con Google
- ✅ **GitHub OAuth** - Inicia sesión con GitHub

---

## 📊 Estructura de Datos en Firestore

### Cuando un usuario se registra o inicia sesión, se crean automáticamente:

**Colección: `users/{uid}`**
```javascript
{
  uid: "user_firebase_id",                    // ID único de Firebase
  email: "usuario@ejemplo.com",               // Email del usuario
  username: "username_extraido_del_email",    // Username generado del email
  displayName: "Usuario Name",                // Nombre del usuario
  avatar: "url_o_vacio",                      // Avatar (foto de perfil)
  provider: "email" | "google" | "github",    // Cómo se autenticó
  createdAt: "2024-02-07T10:30:00.000Z",     // Fecha de creación
  updatedAt: "2024-02-07T10:30:00.000Z"      // Última actualización
}
```

**Colección: `proyectos/{uid}`**
```javascript
{
  uid: "user_firebase_id",        // ID del usuario propietario
  proyectos: [],                  // Array vacío para guardar proyectos
  createdAt: "2024-02-07T..."    // Fecha de creación
}
```

---

## 🧪 Cómo Probar Localmente

### 1. Inicia el servidor
```bash
npm start
# o
node server.js
```

### 2. Abre en el navegador
```
http://localhost:3000
```

### 3. Prueba cada opción

#### ✉️ **Opción 1: Crear cuenta con Email**
1. Haz click en **"Registrarse"** o navega a `#create`
2. Haz click en **"Email y contraseña"**
3. Ingresa:
   - Email: `test@ejemplo.com`
   - Contraseña: `Abc123!!` (mínimo 6 caracteres)
4. Haz click en **"Crear cuenta"**
5. **Esperado:** Se crea el usuario y se redirige a la página principal

#### ✉️ **Opción 2: Iniciar sesión con Email**
1. Haz click en **"Iniciar sesión"** o navega a `#login`
2. Haz click en **"Email y contraseña"**
3. Ingresa:
   - Email o usuario: `test@ejemplo.com`
   - Contraseña: `Abc123!!`
4. Haz click en **"Iniciar sesion"**
5. **Esperado:** Inicia sesión y redirige a la página principal

#### 🔵 **Opción 3: Google OAuth**
1. Haz click en **"Continuar con Google"** (en login o signup)
2. Se abre un popup de Google
3. Selecciona tu cuenta de Google o inicia sesión
4. Autoriza la aplicación
5. **Esperado:** Se crea/actualiza el usuario y redirige a la página principal

#### 🐙 **Opción 4: GitHub OAuth**
1. Haz click en **"Continuar con GitHub"** (en login o signup)
2. Se abre un popup de GitHub
3. Inicia sesión con GitHub si es necesario
4. Autoriza la aplicación
5. **Esperado:** Se crea/actualiza el usuario y redirige a la página principal

---

## 📱 Verificar Datos en Firebase Console

### Para ver los datos que se guardan:

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecciona **`devcenter-agent-48c86`**
3. En el menú izquierdo: **Build** → **Firestore Database**
4. Busca las colecciones:
   - **`users`** - Datos de los usuarios
   - **`proyectos`** - Documentos para almacenar proyectos

### Verifica que los datos tengan esta estructura:

```
users/
  ├── [uid_usuario_1]/
  │   ├── uid: "uid_usuario_1"
  │   ├── email: "test@ejemplo.com"
  │   ├── username: "test"
  │   ├── displayName: "test"
  │   ├── avatar: "" (o URL)
  │   ├── provider: "email" | "google" | "github"
  │   ├── createdAt: timestamp
  │   └── updatedAt: timestamp
  │
  └── [uid_usuario_2]/
      └── ... (mismo estructura)

proyectos/
  ├── [uid_usuario_1]/
  │   ├── uid: "uid_usuario_1"
  │   ├── proyectos: [] (array vacío)
  │   └── createdAt: timestamp
  │
  └── [uid_usuario_2]/
      └── ... (mismo estructura)
```

---

## 🔐 Datos Guardados en localStorage

Cuando un usuario inicia sesión correctamente, se guardan en `localStorage`:

```javascript
{
  "devcenter_user_id": "uid_firebase_id",      // ID único
  "devcenter_email": "usuario@ejemplo.com",     // Email
  "devcenter_user": "username",                 // Username
  "devcenter_avatar": "url_o_vacio",           // Avatar (si existe)
  "devcenter_login_time": "2024-02-07T..."    // Hora de login
}
```

Puedes verificar esto en el navegador:
1. Abre **DevTools** (F12)
2. Ve a **Application** o **Storage**
3. Busca **localStorage**
4. Verifica que estos valores estén presentes

---

## ✔️ Checklist de Pruebas

- [ ] **Email/Contraseña**: Crear cuenta exitosamente
- [ ] **Email/Contraseña**: Iniciar sesión exitosamente
- [ ] **Firestore**: Los datos se guardan en la colección `users`
- [ ] **Firestore**: Se crea automáticamente la colección `proyectos`
- [ ] **localStorage**: Se llenan correctamente los datos al login
- [ ] **Google OAuth**: El popup se abre correctamente
- [ ] **Google OAuth**: Se autentica y redirige a la página principal
- [ ] **GitHub OAuth**: El popup se abre correctamente
- [ ] **GitHub OAuth**: Se autentica y redirige a la página principal
- [ ] **Firestore**: Contiene el campo `provider` con el valor correcto

---

## 🐛 Troubleshooting Rápido

### Error: "Auth/operation-not-allowed"
**Solución:** Email/Contraseña no está habilitado en Firebase Console
- Ve a [Firebase Console](https://console.firebase.google.com/) 
- **Authentication** → **Sign-in method** 
- Busca **Email/Password** y actívalo

### Error: "Popup blocked"
**Solución:** El navegador bloquea los popups de OAuth
- Asegúrate de hacer click directamente en el botón
- No está dentro de un timeout o setTimeout

### Error en Firebase: "Unknown origin"
**Solución:** Tu dominio no está autorizado
- Ve a **Authentication** → **Settings** → **Authorized domains**
- Agrega: `localhost:3000` (o tu puerto)

### Error: "CORS or Network"
**Solución:** 
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network** o **Console**
3. Verifica qué error exacto aparece
4. Si es de CORS, asegúrate de estar en `localhost:3000` (no en otra IP)

---

## 🔧 Cómo Probar OAuth Localmente

### Importante: No funciona con IP local o dominios diferentes

OAuth (Google y GitHub) no funcionan con:
- ❌ `192.168.x.x:3000`
- ❌ `127.0.0.1:3000` (excepto si está autorizado específicamente)
- ❌ Otros puertos diferentes al configurado

**Solución:** Siempre usar `http://localhost:3000` para desarrollo local

---

## 📝 Ejemplo: Crear Cuenta + Verificar en Firestore

### Paso 1: Crea una cuenta
1. Ve a `http://localhost:3000#create`
2. Click en "Email y contraseña"
3. Email: `demo@test.com`
4. Contraseña: `Test123`
5. Click en "Crear cuenta"

### Paso 2: Verifica en Firestore
1. Ve a Firebase Console → Firestore Database
2. Abre la colección **users**
3. Busca el documento con el UID que aparece en el documento
4. Deberías ver:
   ```
   uid: (tu UID)
   email: demo@test.com
   username: demo
   displayName: demo
   avatar: ""
   provider: "email"
   createdAt: (timestamp)
   updatedAt: (timestamp)
   ```

### Paso 3: Verifica en localStorage
1. Abre DevTools (F12)
2. **Application** → **localStorage** → `http://localhost:3000`
3. Deberías ver:
   ```
   devcenter_user_id: (tu UID)
   devcenter_email: demo@test.com
   devcenter_user: demo
   devcenter_login_time: (timestamp)
   ```

---

## 🎉 ¡Listo!

Si todo está funcionando correctamente, significa que:
- ✅ Firebase Auth está integrado correctamente
- ✅ Los datos se guardan en Firestore con la estructura correcta
- ✅ Los OAuth funciona para Google y GitHub
- ✅ El localStorage se sincroniza correctamente

---

**Última actualización:** Febrero 7, 2026
**Versión Firebase SDK:** 12.9.0
