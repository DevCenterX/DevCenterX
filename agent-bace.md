# Estructura de Firebase Firestore - DevCenterX
Web: https://devcenterx.vercel.app


Tu base de datos Firebase (`devcenter-agent-48c86`) tiene 3 colecciones principales:


firestore (devcenter-agent-48c86)

├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── username: string
│       ├── avatar: string
│       ├── provider: "email" | "google" | "github"
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       ├── plan: string (muestra el plan de usuario al crearse se pone como {Normal})
│       └── limit: number (muestar los limetes de uso del agente al inio es {0})
│      
│       
│
├── proyectos/
│   └── {uid}/
│       ├── uid: string
│       ├── proyectos: array
│       └── createdAt: timestamp
│ 
│ 
│ 
├── proyectos-publicos/  (muestra los proyectos ya publicados en la secion de apps)
│   └── {uid}/
│       ├── uid: string
│       ├── proyectos: array
│       ├── cometarios: array
│       ├── likes: number
│       ├── visitas: number
│       └── createdAt: timestamp




 ---------------------- Cuenta nueva  ----------------------


/**
 * Save user data in Firestore
 */
async function saveUserData(user, provider) {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email || '',
    username: user.displayName || user.email?.split('@')[0] || 'user_' + user.uid.substring(0, 8),
    avatar: user.photoURL || '',
    provider: provider,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    plan: 'Normal',
    limit: '0'
  });

  // Guardar SOLO 2 claves en localStorage
  localStorage.setItem('devcenter_user_id', user.uid);
  localStorage.setItem('devcenter_isLoggedIn', 'true');
}






 ---------------------- Permisos actuales  ----------------------
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Permite que usuarios autenticados lean sus propios documentos de usuario y otros usuarios puedan leer datos públicos
    match /users/{userId} {
      allow read: if request.auth != null; // Todo usuario autenticado puede leer perfiles
      allow write: if request.auth.uid == userId; // Solo el propietario puede escribir
    }
    
    // Colección proyectos - permite lectura/escritura para usuarios autenticados
    match /proyectos/{userId} {
      allow read, write, delete: if request.auth.uid == userId;
    }
    
    // Colección proyectos-publicos - todos pueden leer, solo propietario puede escribir
    match /proyectos-publicos/{userId} {
      allow read: if request.auth != null; // Usuarios autenticados pueden leer
      allow write, delete: if request.auth.uid == userId; // Solo propietario puede escribir/eliminar
    }
  }
}










<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
    authDomain: "devcenter-agent-48c86.firebaseapp.com",
    projectId: "devcenter-agent-48c86",
    storageBucket: "devcenter-agent-48c86.firebasestorage.app",
    messagingSenderId: "911929994293",
    appId: "1:911929994293:web:1d08f68b4c507ee162557c",
    measurementId: "G-S5GTYBRVK8"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>