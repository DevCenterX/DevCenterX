// ============================================
// CREATE ACCOUNT PAGE - Firebase Authentication (OPTIMIZED)
// ============================================

// NOTIFICATION SYSTEM - Initialize early
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  
  return {
    show(message, type = 'info', duration = 4000) {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      
      const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
      };
      
      notification.innerHTML = `
        <span class="notification-icon">${icons[type] || '•'}</span>
        <span>${message}</span>
        <button class="notification-close">×</button>
      `;
      
      container.appendChild(notification);
      
      const closeBtn = notification.querySelector('.notification-close');
      const removeNotification = () => {
        notification.classList.add('removing');
        setTimeout(() => notification.remove(), 300);
      };
      
      closeBtn.addEventListener('click', removeNotification);
      
      if (duration > 0) {
        setTimeout(removeNotification, duration);
      }
      
      return notification;
    },
    
    success(message, duration) {
      return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
      return this.show(message, 'error', duration || 5000);
    },
    
    info(message, duration) {
      return this.show(message, 'info', duration);
    },
    
    warning(message, duration) {
      return this.show(message, 'warning', duration);
    }
  };
})();

// Firebase state
let firebaseReady = false;
let auth = null;
let db = null;

// Initialize Firebase asynchronously during splash screen
(async () => {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
    const { 
      getAuth, 
      setPersistence,
      browserLocalPersistence 
    } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");

    const firebaseConfig = {
      apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
      authDomain: "devcenter-agent-48c86.firebaseapp.com",
      projectId: "devcenter-agent-48c86",
      storageBucket: "devcenter-agent-48c86.firebasestorage.app",
      messagingSenderId: "911929994293",
      appId: "1:911929994293:web:1d08f68b4c507ee162557c",
      measurementId: "G-S5GTYBRVK8"
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    await setPersistence(auth, browserLocalPersistence);
    firebaseReady = true;
    console.log('[create] Firebase initialized');
  } catch (error) {
    console.error('[create] Firebase init error:', error);
    NotificationSystem.error('Error cargando autenticación. Por favor recarga la página.');
  }
})();

// ============================================
// Helper Functions
// ============================================

async function saveUserData(user, provider) {
  if (!user || !db) return;
  
  try {
    const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    
    const userRef = doc(db, 'users', user.uid);
    
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      username: user.displayName || user.email?.split('@')[0] || 'user_' + user.uid.substring(0, 8),
      avatar: user.photoURL || '',
      provider: provider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      plan: 'free',
      limit: 'default'
    });

    localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
    localStorage.setItem('devcenter_user_name', user.displayName || user.email?.split('@')[0] || 'Usuario');
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

function handleAuthError(error) {
  const errorMessages = {
    'auth/email-already-in-use': 'Este email ya está registrado. Intenta con otro o inicia sesión',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/invalid-email': 'Email inválido',
    'auth/operation-not-allowed': 'Este método de autenticación no está disponible',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/popup-closed-by-user': 'Autenticación cancelada',
    'auth/popup-blocked': 'Popup bloqueado. Allow pop-ups para continuar',
    'auth/account-exists-with-different-credential': 'Esta cuenta ya existe con otro método',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
  };
  
  const message = errorMessages[error.code] || error.message || 'Error en autenticación';
  NotificationSystem.error(message);
}

function setButtonLoading(button, loading) {
  if (loading) {
    button.disabled = true;
    button.classList.add('loading');
    button.dataset.originalText = button.innerText;
  } else {
    button.disabled = false;
    button.classList.remove('loading');
    if (button.dataset.originalText) {
      button.innerText = button.dataset.originalText;
    }
  }
}

// ============================================
// UI Elements Setup
// ============================================

function initializeUI() {
  const emailBtn = document.querySelector('.email-auth-option');
  const form = document.querySelector('.split-auth-form');
  const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
  const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
  const passwordToggleBtns = document.querySelectorAll('.password-toggle-btn');
  const backBtn = document.querySelector('.split-auth-back');

  // ============================================
  // Email Form Toggle
  // ============================================
  if (emailBtn && form) {
    emailBtn.addEventListener('click', function() {
      const isHidden = form.style.display === 'none';
      form.style.display = isHidden ? 'block' : 'none';
      emailBtn.style.display = isHidden ? 'none' : 'flex';
    });
  }

  // ============================================
  // Password Visibility Toggle
  // ============================================
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

  // ============================================
  // Email Registration
  // ============================================
  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (!firebaseReady || !auth) {
        NotificationSystem.error('Sistema de autenticación no cargado. Intenta nuevamente');
        return;
      }
      
      const email = form.querySelector('#email').value.trim();
      const password = form.querySelector('#password').value;
      const confirmPassword = form.querySelector('#confirm-password')?.value;
      const submitBtn = form.querySelector('button[type="submit"]');
      
      if (!email || !password) {
        NotificationSystem.warning('Por favor completa todos los campos');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        NotificationSystem.error('Email inválido');
        return;
      }

      if (password.length < 6) {
        NotificationSystem.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (confirmPassword && password !== confirmPassword) {
        NotificationSystem.error('Las contraseñas no coinciden');
        return;
      }
      
      try {
        setButtonLoading(submitBtn, true);
        const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserData(result.user, 'email');
        NotificationSystem.success('¡Cuenta creada! Redirigiendo...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } catch (error) {
        handleAuthError(error);
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // ============================================
  // Google Authentication
  // ============================================
  if (googleBtn) {
    googleBtn.addEventListener('click', async function() {
      if (!firebaseReady || !auth) {
        NotificationSystem.error('Sistema de autenticación no cargado. Intenta nuevamente');
        return;
      }
      
      try {
        setButtonLoading(googleBtn, true);
        const { signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth, provider);
        await saveUserData(result.user, 'google');
        NotificationSystem.success('¡Cuenta creada!');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } catch (error) {
        if (error.code !== 'auth/popup-blocked') {
          handleAuthError(error);
        }
        setButtonLoading(googleBtn, false);
      }
    });
  }

  // ============================================
  // GitHub Authentication
  // ============================================
  if (githubBtn) {
    githubBtn.addEventListener('click', async function() {
      if (!firebaseReady || !auth) {
        NotificationSystem.error('Sistema de autenticación no cargado. Intenta nuevamente');
        return;
      }
      
      try {
        setButtonLoading(githubBtn, true);
        const { signInWithPopup, GithubAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        const provider = new GithubAuthProvider();
        provider.setCustomParameters({ prompt: 'login' });
        
        const result = await signInWithPopup(auth, provider);
        await saveUserData(result.user, 'github');
        NotificationSystem.success('¡Cuenta creada!');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } catch (error) {
        if (error.code !== 'auth/popup-blocked') {
          handleAuthError(error);
        }
        setButtonLoading(githubBtn, false);
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
}

// Wait for DOM to be ready and Firebase to load during splash
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeUI);
} else {
  initializeUI();
}
