# Estructura de Firebase Firestore - DevCenterX



Tu base de datos Firebase (`devcenter-agent-48c86`) tiene 2 colecciones principales:


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
│       ├── plan: string ( muestar que plan tine)
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
│