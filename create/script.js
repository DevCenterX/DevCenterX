// ============================================
// CREATE ACCOUNT PAGE - Firebase Authentication
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  setPersistence,
  browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Firebase Configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence);

// ============================================
// UI Elements
// ============================================
const emailBtn = document.querySelector('.email-auth-option');
const form = document.querySelector('.split-auth-form');
const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
const passwordToggleBtns = document.querySelectorAll('.password-toggle-btn');
const backBtn = document.querySelector('.split-auth-back');

// ============================================
// Helper Functions
// ============================================

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

/**
 * Show error message to user
 */
function showError(message) {
  alert(message);
}

/**
 * Handle authentication errors
 */
function handleAuthError(error) {
  let message = 'Error en autenticación';
  
  if (error.code === 'auth/email-already-in-use') {
    message = 'Este email ya está registrado';
  } else if (error.code === 'auth/weak-password') {
    message = 'La contraseña debe tener al menos 6 caracteres';
  } else if (error.code === 'auth/invalid-email') {
    message = 'Email inválido';
  } else if (error.code === 'auth/operation-not-allowed') {
    message = 'Registro no disponible en este momento';
  } else if (error.code === 'auth/too-many-requests') {
    message = 'Demasiados intentos. Intenta más tarde.';
  } else {
    message = error.message || message;
  }
  
  showError(message);
}

// ============================================
// Email Registration
// ============================================

if (emailBtn && form) {
  emailBtn.addEventListener('click', function() {
    const isHidden = form.style.display === 'none';
    form.style.display = isHidden ? 'block' : 'none';
    emailBtn.style.display = isHidden ? 'none' : 'flex';
  });
}

// Password visibility toggle
passwordToggleBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const input = this.parentElement.querySelector('input');
    const eyeOpen = this.querySelector('.eye-open');
    const eyeClosed = this.querySelector('.eye-closed');
    
    if (input.type === 'password') {
      input.type = 'text';
      eyeOpen.style.display = 'none';
      eyeClosed.style.display = 'block';
    } else {
      input.type = 'password';
      eyeOpen.style.display = 'block';
      eyeClosed.style.display = 'none';
    }
  });
});

// Email registration submission
if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = form.querySelector('#email').value.trim();
    const password = form.querySelector('#password').value;
    
    // Validation
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (!email.includes('@')) {
      showError('Por favor ingresa un email válido');
      return;
    }
    
    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creando cuenta...';
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserData(result.user, 'email');
      
      // Redirect to app
      window.location.href = '/';
    } catch (error) {
      handleAuthError(error);
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerText = 'Crear cuenta';
    }
  });
}

// ============================================
// Google Authentication
// ============================================

if (googleBtn) {
  googleBtn.addEventListener('click', async function() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const submitBtn = googleBtn;
      submitBtn.disabled = true;
      submitBtn.innerText = 'Conectando con Google...';
      
      const result = await signInWithPopup(auth, provider);
      await saveUserData(result.user, 'google');
      
      // Redirect to app
      window.location.href = '/';
    } catch (error) {
      if (error.code !== 'auth/popup-blocked') {
        handleAuthError(error);
      }
      googleBtn.disabled = false;
      googleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar con Google
      `;
    }
  });
}

// ============================================
// GitHub Authentication
// ============================================

if (githubBtn) {
  githubBtn.addEventListener('click', async function() {
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({ prompt: 'login' });
    
    try {
      const submitBtn = githubBtn;
      submitBtn.disabled = true;
      submitBtn.innerText = 'Conectando con GitHub...';
      
      const result = await signInWithPopup(auth, provider);
      await saveUserData(result.user, 'github');
      
      // Redirect to app
      window.location.href = '/';
    } catch (error) {
      if (error.code !== 'auth/popup-blocked') {
        handleAuthError(error);
      }
      githubBtn.disabled = false;
      githubBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        Continuar con GitHub
      `;
    }
  });
}

// ============================================
// Back Button
// ============================================

if (backBtn) {
  backBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = '/agent.html';
  });
}
