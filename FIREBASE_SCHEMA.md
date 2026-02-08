# Estructura de Firebase Firestore - DevCenterX

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

Tu base de datos Firebase (`devcenter-agent-48c86`) tiene 3 colecciones principales:


firestore (devcenter-agent-48c86)

├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── username: string
│       ├── displayName: string
│       ├── avatar: string
│       ├── provider: "email" | "google" | "github"
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       ├── plan: string ( muestar que plan tiene el usuario )
│       └── limit: string (muestar los limetes de uso del agente )
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
│
