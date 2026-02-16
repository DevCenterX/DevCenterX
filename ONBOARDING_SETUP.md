# Sistema de Onboarding DevCenterX

## Descripción General
Después de que un usuario se autentica (login o registro), se muestra un flujo de onboarding modal antes de redirigir al home.

## Flujo de Onboarding

### Paso 1: Foto de Perfil
- El usuario puede subir una foto personalizada (se sube a Cloudinary)
- Si usa Google o GitHub, se muestra el icono del proveedor (🔵 para Google, ⬛ para GitHub)
- Si usa Email, se muestra un avatar por defecto (👤)
- El usuario puede continuar sin foto

### Paso 2: Nombre de Usuario
- El usuario debe elegir un nombre de usuario único
- Mínimo 3 caracteres
- Sistema valida disponibilidad en tiempo real usando Firestore
- Muestra ✅ si está disponible o ❌ si ya existe

### Paso 3: Guardado en Firebase
- Los datos se guardan en Firestore con:
  - `uid`: ID único del usuario
  - `email`: Correo electrónico
  - `username`: Nombre de usuario (minúsculas)
  - `avatar`: URL de la foto (Cloudinary o vacío)
  - `provider`: Método de autenticación (email, google, github)
  - `plan`: Plan actual (free)
  - `limit`: Límite de uso (default)
  - `createdAt` y `updatedAt`: Timestamps

## Configuración Cloudinary

```javascript
CLOUDINARY_NAME = 'duybqkv24'
CLOUDINARY_UPLOAD_PRESET = 'devcenter_profile'
CLOUDINARY_API_KEY = '445151322255556'
```

**Nota**: El UPLOAD_PRESET debe estar configurado en Cloudinary con:
- Tipo: Unsigned
- Carpeta de destino: `/devcenter/profiles/`

## Archivos Modificados

- `login/script.js`: Integrado flujo de onboarding
- `create/script.js`: Integrado flujo de onboarding
- Ambos archivos tienen:
  - Sistema de modal de onboarding
  - Integración con Cloudinary para upload de fotos
  - Validación de nombres de usuario en Firestore
  - Sistema de notificaciones mejorado

## Flujo Técnico

1. **Autenticación**: Usuario se autentica (email, Google, GitHub)
2. **Trigger**: Se llama a `handleAuthSuccess(user, provider)`
3. **Modal**: Se muestra el modal de onboarding con dos pasos
4. **Foto**: Usuario sube foto o continúa sin ella
5. **Usuario**: Usuario elige nombre único y disponible
6. **Guardado**: `saveFinalUserData()` guarda todo en Firestore
7. **Redirección**: Usuario es redirigido al home

## API de Cloudinary Usada

```
POST https://api.cloudinary.com/v1_1/{CLOUDINARY_NAME}/image/upload
```

Parámetros:
- `file`: Archivo de imagen
- `upload_preset`: Preset de Cloudinary (unsigned)

## Validación de Nombres de Usuario

```javascript
// Query Firestore
where('username', '==', username.toLowerCase())
```

- Los nombres se almacenan en minúsculas
- Se valida en tiempo real mientras el usuario escribe

## LocalStorage

Se guardan:
- `devcenter_user_id`: UID del usuario
- `devcenter_isLoggedIn`: Bandera de login

## Estado y Variables Globales

```javascript
currentUser     // Objeto del usuario autenticado
authProvider    // Proveedor usado (email, google, github)
```

## Consideraciones de Seguridad

1. ✅ Números de Cloudinary no exponen información sensible (son públicos en cada upload)
2. ✅ No se almacenan contraseñas (Firebase Auth maneja esto)
3. ✅ Validación de nombres de usuario contra Firestore
4. ✅ Usuarios no autenticados no pueden tocar los datos en Firestore (reglas de seguridad recomendadas)

## Pruebas Recomendadas

1. Login con Email → Onboarding → Subir foto → Nombre usuario
2. Login con Google → Onboarding → Icono Google → Nombre usuario
3. Login con GitHub → Onboarding → Icono GitHub → Nombre usuario
4. Intentar nombre usado → Ver mensaje de error
5. Saltar foto → Continuar con avatar por defecto

## URLs Relacionadas

- Cloudinary Upload: `https://api.cloudinary.com/v1_1/duybqkv24/image/upload`
- Preview de fotos: `https://res.cloudinary.com/duybqkv24/image/upload/{public_id}`

## Notas Importantes

- El modal se muestra ANTES de redirigir al home
- Las fotos se suben a Cloudinary (externo)
- El nombre debe ser único en toda la base de datos
- El flujo es obligatorio (usuario debe completar los dos pasos)
- En caso de error, se muestra notificación y permite reintentar
