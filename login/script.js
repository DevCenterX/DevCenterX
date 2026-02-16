// ============================================
// LOGIN PAGE - Firebase Authentication (OPTIMIZED)
// ============================================

console.log('[LOGIN] 🚀 Script loading started (ts: ' + Date.now() + ')');

// State variables - inline for IMMEDIATE initialization
let firebaseReady = false;
let auth = null;
let db = null;
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;
let firebaseInitStartTime = Date.now();
let initAttempts = 0;
let uiInitialized_script = false;
let eventListenersAttached = false;

console.log('[LOGIN] 📋 State variables initialized (ts: ' + Date.now() + ')');

// NOTIFICATION SYSTEM - Initialize early
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  console.log('[LOGIN] 📢 Notification container:', container ? '✅ Found' : '❌ Not found');
  
  return {
    show(message, type = 'info', duration = 4000) {
      console.log(`[LOGIN] 💬 ${type.toUpperCase()}: ${message}`);
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
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;
let firebaseInitStartTime = Date.now();

function checkPageReady() {
  const ready = firebaseReady && uiElementsReady && eventListenersReady;
  const timestamp = Date.now() - firebaseInitStartTime;
  
  if (ready && !pageFullyReady) {
    pageFullyReady = true;
    console.log(`[LOGIN] 🎉🎉🎉 PAGE FULLY READY! All systems operational! (${timestamp}ms)`);
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      console.log('[LOGIN] 📞 Calling hideLoadingAndShowContent...');
      window.hideLoadingAndShowContent('all-systems-ready');
    } else {
      console.warn('[LOGIN] ⚠️ hideLoadingAndShowContent not available');
    }
  } else if (!ready) {
    const elapsed = timestamp;
    if (elapsed % 500 === 0) { // Log sparingly
      console.log(`[LOGIN] ⏳ Status (${elapsed}ms): Firebase=${firebaseReady} UI=${uiElementsReady} Listeners=${eventListenersReady}`);
    }
  }
  
  return ready;
}

console.log('[LOGIN] ⏱️ Firebase initialization started (ts: ' + Date.now() + ')');
console.log('[LOGIN] 🚀 BEGINNING FIREBASE IIFE');

// Initialize Firebase asynchronously during splash screen
(async () => {
  console.log('[LOGIN] 📥 INSIDE FIREBASE IIFE - Starting imports (ts: ' + Date.now() + ')');
  try {
    console.log('[LOGIN] 📥 Importing Firebase modules...');
    const firebaseImportStart = Date.now();
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
    console.log(`[LOGIN] 📦 firebase-app imported (${Date.now() - firebaseImportStart}ms)`);
    
    const authImportStart = Date.now();
    const { 
      getAuth, 
      setPersistence,
      browserLocalPersistence 
    } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
    console.log(`[LOGIN] 📦 firebase-auth imported (${Date.now() - authImportStart}ms)`);
    
    const dbImportStart = Date.now();
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    console.log(`[LOGIN] 📦 firebase-firestore imported (${Date.now() - dbImportStart}ms)`);

    const firebaseConfig = {
      apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
      authDomain: "devcenter-agent-48c86.firebaseapp.com",
      projectId: "devcenter-agent-48c86",
      storageBucket: "devcenter-agent-48c86.firebasestorage.app",
      messagingSenderId: "911929994293",
      appId: "1:911929994293:web:1d08f68b4c507ee162557c",
      measurementId: "G-S5GTYBRVK8"
    };

    console.log('[LOGIN] 🔧 Initializing Firebase app...');
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('[LOGIN] 🔐 Setting persistence...');
    await setPersistence(auth, browserLocalPersistence);
    
    firebaseReady = true;
    const initTime = Date.now() - firebaseInitStartTime;
    console.log(`[LOGIN] ✅ Firebase initialized successfully (${initTime}ms)`);
    console.log('[LOGIN] 🔑 auth:', auth ? '✅ Ready' : '❌ Error');
    console.log('[LOGIN] 🗄️ db:', db ? '✅ Ready' : '❌ Error');
    console.log('[LOGIN] 📊 State after Firebase: firebaseReady=' + firebaseReady);
    console.log('[LOGIN] 🎯 Calling checkPageReady() from Firebase init...');
    checkPageReady();
    console.log('[LOGIN] ✅ Firebase IIFE completed!');
  } catch (error) {
    console.error('[LOGIN] ❌ Firebase init error:', error);
    console.error('[LOGIN] Error details:', error.message);
    if (window.NotificationSystem) {
      NotificationSystem.error('Error cargando autenticación. Por favor recarga la página.');
    }
  }
})();

// ============================================
// Helper Functions
// ============================================

async function saveUserData(user, provider) {
  if (!user || !db) return;
  
  try {
    const { doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await setDoc(userRef, {
        updatedAt: serverTimestamp()
      }, { merge: true });
    } else {
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
    }
    
    localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

function handleAuthError(error) {
  const errorMessages = {
    'auth/user-not-found': 'Este email no está registrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-email': 'Email inválido',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/popup-closed-by-user': 'Autenticación cancelada',
    'auth/popup-blocked': 'Popup bloqueado. Allow pop-ups para continuar',
    'auth/account-exists-with-different-credential': 'Esta cuenta ya existe con otro método de login',
    'auth/operation-not-allowed': 'Este método de autenticación no está disponible',
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

// Track if UI is initialized to prevent double initialization
let uiInitialized_script = false;
let eventListenersAttached = false;

function attachEventListeners() {
  if (eventListenersAttached) return; // Prevent double attachment
  eventListenersAttached = true;
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
  // Email Login
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
      const submitBtn = form.querySelector('button[type="submit"]');
      
      if (!email || !password) {
        NotificationSystem.warning('Por favor completa todos los campos');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        NotificationSystem.error('Email inválido');
        return;
      }
      
      try {
        setButtonLoading(submitBtn, true);
        const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserData(result.user, 'email');
        NotificationSystem.success('¡Bienvenido!');
        
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
        NotificationSystem.success('¡Sesión iniciada!');
        
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
        NotificationSystem.success('¡Sesión iniciada!');
        
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

function initializeUI() {
  if (uiInitialized_script) return;
  uiInitialized_script = true;
  
  // Ensure all elements are in the DOM and visible
  const emailBtn = document.querySelector('.email-auth-option');
  const form = document.querySelector('.split-auth-form');
  const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
  const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
  
  if (!emailBtn && !form && !googleBtn && !githubBtn) {
    // Elements not ready yet, retry in 100ms
    setTimeout(initializeUI, 100);
    return;
  }
  
  // Ensure buttons are clickable and visible
  [emailBtn, googleBtn, githubBtn].forEach(btn => {
    if (btn) {
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
    }
  });
  
  attachEventListeners();
}

// Make reinitializeUI globally accessible for splash screen
window.reinitializeUI = initializeUI;
console.log('[LOGIN] 🌐 window.reinitializeUI exposed (ts: ' + Date.now() + ')');

// IMMEDIATE UI initialization attempt
console.log('[LOGIN] 🚀 Attempting immediate initializeUI (DOM state: ' + document.readyState + ')');
initializeUI();

// But also wait for DOM if needed
if (document.readyState === 'loading') {
  console.log('[LOGIN] ⏳ DOM is loading, will reinitialize on DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[LOGIN] ✅ DOMContentLoaded fired! Reinitializing UI...');
    setTimeout(() => initializeUI(), 50);
  });
} else {
  console.log('[LOGIN] ✅ DOM already loaded');
}

// AGGRESSIVE re-initialization attempts - every 100ms for first 2 seconds
console.log('[LOGIN] 🔄 Starting aggressive initialization retries...');
for (let i = 1; i <= 20; i++) {
  setTimeout(() => {
    if (!pageFullyReady) {
      const ready = checkPageReady();
      if (i <= 5 || i % 5 === 0) {
        console.log(`[LOGIN] ⏱️ Retry #${i} (${i * 100}ms): ${ready ? '✅ READY' : '⏳ NOT READY'} [F=${firebaseReady} U=${uiElementsReady} L=${eventListenersReady}]`);
      }
      if (!ready) {
        initializeUI();
      }
    }
  }, i * 100);
}

// Aggressive monitoring - check every 100ms
console.log('[LOGIN] 📊 Starting aggressive readiness monitoring...');
let monitoringAttempts = 0;
const readinessInterval = setInterval(() => {
  monitoringAttempts++;
  if (monitoringAttempts % 5 === 0) { // Log every 500ms
    console.log(`[LOGIN] 📊 Monitor #${monitoringAttempts} (${monitoringAttempts * 100}ms): Firebase=${firebaseReady ? '✅' : '❌'} UI=${uiElementsReady ? '✅' : '❌'} Listeners=${eventListenersReady ? '✅' : '❌'} FullyReady=${pageFullyReady ? '✅' : '❌'}`);
  }
  if (pageFullyReady) {
    clearInterval(readinessInterval);
    console.log('[LOGIN] 🎉 Page fully ready - monitoring stopped after ' + (monitoringAttempts * 100) + 'ms');
  }
}, 100);

setTimeout(() => {
  if (!pageFullyReady) {
    console.warn('[LOGIN] ⚠️⚠️⚠️ Page NOT fully ready after 5 seconds!');
    console.warn(`[LOGIN] Firebase=${firebaseReady ? '✅' : '❌'} UI=${uiElementsReady ? '✅' : '❌'} Listeners=${eventListenersReady ? '✅' : '❌'}`);
  }
  clearInterval(readinessInterval);
}, 5000);
