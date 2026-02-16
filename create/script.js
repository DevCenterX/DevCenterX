// ============================================
// CREATE ACCOUNT PAGE - Firebase Authentication (OPTIMIZED)
// ============================================

console.log('[CREATE] 🚀 Script loading started (ts: ' + Date.now() + ')');

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

console.log('[CREATE] 📋 State variables initialized (ts: ' + Date.now() + ')');

// NOTIFICATION SYSTEM - Initialize early
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  console.log('[CREATE] 📢 Notification container:', container ? '✅ Found' : '❌ Not found');
  
  return {
    show(message, type = 'info', duration = 4000) {
      console.log(`[CREATE] 💬 ${type.toUpperCase()}: ${message}`);
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

function checkPageReady() {
  const ready = firebaseReady && uiElementsReady && eventListenersReady;
  const timestamp = Date.now() - firebaseInitStartTime;
  
  if (ready && !pageFullyReady) {
    pageFullyReady = true;
    console.log(`[CREATE] 🎉🎉🎉 PAGE FULLY READY! All systems operational! (${timestamp}ms)`);
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      console.log('[CREATE] 📞 Calling hideLoadingAndShowContent...');
      window.hideLoadingAndShowContent('all-systems-ready');
    } else {
      console.warn('[CREATE] ⚠️ hideLoadingAndShowContent not available');
    }
  } else if (!ready) {
    const elapsed = timestamp;
    if (elapsed % 500 === 0) { // Log sparingly
      console.log(`[CREATE] ⏳ Status (${elapsed}ms): Firebase=${firebaseReady} UI=${uiElementsReady} Listeners=${eventListenersReady}`);
    }
  }
  
  return ready;
}
  
  return {
    show(message, type = 'info', duration = 4000) {
      console.log(`[CREATE] 💬 ${type.toUpperCase()}: ${message}`);
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
  if (ready && !pageFullyReady) {
    pageFullyReady = true;
    console.log('[CREATE] 🎉🎉🎉 PAGE FULLY READY! All systems operational!');
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      window.hideLoadingAndShowContent('all-systems-ready');
    }
  }
  return ready;
}

console.log('[CREATE] ⏱️ Firebase initialization started (ts: ' + Date.now() + ')');
console.log('[CREATE] 🚀 BEGINNING FIREBASE IIFE');

// Initialize Firebase asynchronously during splash screen
(async () => {
  console.log('[CREATE] 📥 INSIDE FIREBASE IIFE - Starting imports (ts: ' + Date.now() + ')');
  try {
    console.log('[CREATE] 📥 Importing Firebase modules...');
    const firebaseImportStart = Date.now();
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
    console.log(`[CREATE] 📦 firebase-app imported (${Date.now() - firebaseImportStart}ms)`);
    
    const authImportStart = Date.now();
    const { 
      getAuth, 
      setPersistence,
      browserLocalPersistence 
    } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
    console.log(`[CREATE] 📦 firebase-auth imported (${Date.now() - authImportStart}ms)`);
    
    const dbImportStart = Date.now();
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    console.log(`[CREATE] 📦 firebase-firestore imported (${Date.now() - dbImportStart}ms)`);

    const firebaseConfig = {
      apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
      authDomain: "devcenter-agent-48c86.firebaseapp.com",
      projectId: "devcenter-agent-48c86",
      storageBucket: "devcenter-agent-48c86.firebasestorage.app",
      messagingSenderId: "911929994293",
      appId: "1:911929994293:web:1d08f68b4c507ee162557c",
      measurementId: "G-S5GTYBRVK8"
    };

    console.log('[CREATE] 🔧 Initializing Firebase app...');
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('[CREATE] 🔐 Setting persistence...');
    await setPersistence(auth, browserLocalPersistence);
    
    firebaseReady = true;
    const initTime = Date.now() - firebaseInitStartTime;
    console.log(`[CREATE] ✅ Firebase initialized successfully (${initTime}ms)`);
    console.log('[CREATE] 🔑 auth:', auth ? '✅ Ready' : '❌ Error');
    console.log('[CREATE] 🗄️ db:', db ? '✅ Ready' : '❌ Error');
    console.log('[CREATE] 📊 State after Firebase: firebaseReady=' + firebaseReady);
    console.log('[CREATE] 🎯 Calling checkPageReady() from Firebase init...');
    checkPageReady();
    console.log('[CREATE] ✅ Firebase IIFE completed!');
  } catch (error) {
    console.error('[CREATE] ❌ Firebase init error:', error);
    console.error('[CREATE] Error details:', error.message);
    if (window.NotificationSystem) {
      NotificationSystem.error('Error cargando autenticación. Por favor recarga la página.');
    }
  }
})();

// ============================================
// Helper Functions
// ============================================

async function saveUserData(user, provider) {
  console.log(`[CREATE] 💾 Saving user data for ${user.uid} (${provider})`);
  if (!user || !db) {
    console.warn('[CREATE] ⚠️ Cannot save: user or db is null');
    return;
  }
  
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
      plan: 'Normal',
      limit: '0'
    });

    localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
    localStorage.setItem('devcenter_user_name', user.displayName || user.email?.split('@')[0] || 'Usuario');
    console.log('[CREATE] ✅ User data saved successfully');
  } catch (error) {
    console.error('[CREATE] ❌ Error saving user data:', error);
  }
}

function handleAuthError(error) {
  console.error('[CREATE] 🔴 Auth error:', error.code, error.message);
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
  console.log(`[CREATE] ⏳ Button loading: ${loading ? 'ON' : 'OFF'}`, button);
  if (loading) {
    button.disabled = true;
    button.classList.add('loading');
    button.dataset.originalText = button.innerText;
    console.log('[CREATE] 🔒 Button disabled');
  } else {
    button.disabled = false;
    button.classList.remove('loading');
    if (button.dataset.originalText) {
      button.innerText = button.dataset.originalText;
    }
    console.log('[CREATE] 🔓 Button enabled');
  }
}

// ============================================
// UI Elements Setup
// ============================================

// Track if UI is initialized to prevent double initialization
let uiInitialized_script = false;
let eventListenersAttached = false;
let initAttempts = 0;

function attachEventListeners() {
  console.log('[CREATE] 🔗 attachEventListeners() called');
  if (eventListenersAttached) {
    console.warn('[CREATE] ⚠️ Event listeners already attached, skipping');
    return;
  }
  eventListenersAttached = true;
  console.log('[CREATE] ✅ Setting eventListenersAttached = true');
  
  const emailBtn = document.querySelector('.email-auth-option');
  const form = document.querySelector('.split-auth-form');
  const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
  const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
  const passwordToggleBtns = document.querySelectorAll('.password-toggle-btn');
  const backBtn = document.querySelector('.split-auth-back');

  console.log('[CREATE] 🎯 Elements found:');
  console.log('  📧 emailBtn:', emailBtn ? '✅' : '❌');
  console.log('  📝 form:', form ? '✅' : '❌');
  console.log('  🔵 googleBtn:', googleBtn ? '✅' : '❌');
  console.log('  ⚫ githubBtn:', githubBtn ? '✅' : '❌');
  console.log('  👁️ passwordToggleBtns:', passwordToggleBtns.length);
  console.log('  ◀️ backBtn:', backBtn ? '✅' : '❌');

  // ============================================
  // Email Form Toggle
  // ============================================
  if (emailBtn && form) {
    console.log('[CREATE] 📧 Attaching email form toggle listener...');
    emailBtn.addEventListener('click', function() {
      console.log('[CREATE] 📧 Email button clicked!');
      const isHidden = form.style.display === 'none';
      form.style.display = isHidden ? 'block' : 'none';
      emailBtn.style.display = isHidden ? 'none' : 'flex';
      console.log('[CREATE] 📧 Form now:', isHidden ? 'VISIBLE' : 'HIDDEN');
    });
  }

  // ============================================
  // Password Visibility Toggle
  // ============================================
  passwordToggleBtns.forEach((btn, idx) => {
    console.log(`[CREATE] 👁️ Attaching password toggle ${idx}...`);
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const input = this.parentElement.querySelector('input');
      const eyeOpen = this.querySelector('.eye-open');
      const eyeClosed = this.querySelector('.eye-closed');
      
      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
        console.log('[CREATE] 👁️ Password visible');
      } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
        console.log('[CREATE] 👁️ Password hidden');
      }
    });
  });

  // ============================================
  // Email Registration
  // ============================================
  if (form) {
    console.log('[CREATE] 📝 Attaching form submit listener...');
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('[CREATE] 📝 Form submitted!');
      
      if (!firebaseReady || !auth) {
        console.error('[CREATE] ❌ Firebase not ready:', { firebaseReady, auth: !!auth });
        NotificationSystem.error('Sistema de autenticación no cargado. Intenta nuevamente');
        return;
      }
      
      const email = form.querySelector('#email').value.trim();
      const password = form.querySelector('#password').value;
      const confirmPassword = form.querySelector('#confirm-password')?.value;
      const submitBtn = form.querySelector('button[type="submit"]');
      
      console.log('[CREATE] 📧 Form data:');
      console.log('  email:', email ? '✅ filled' : '❌ empty');
      console.log('  password:', password ? '✅ filled' : '❌ empty');
      console.log('  confirmPassword:', confirmPassword ? '✅ filled' : '❌ empty');
      
      if (!email || !password) {
        console.warn('[CREATE] ⚠️ Missing required fields');
        NotificationSystem.warning('Por favor completa todos los campos');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.warn('[CREATE] ⚠️ Invalid email format:', email);
        NotificationSystem.error('Email inválido');
        return;
      }

      if (password.length < 6) {
        console.warn('[CREATE] ⚠️ Password too short');
        NotificationSystem.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (confirmPassword && password !== confirmPassword) {
        console.warn('[CREATE] ⚠️ Passwords do not match');
        NotificationSystem.error('Las contraseñas no coinciden');
        return;
      }
      
      try {
        console.log('[CREATE] 🔐 Starting email registration...');
        setButtonLoading(submitBtn, true);
        const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        console.log('[CREATE] 🔐 Calling createUserWithEmailAndPassword...');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('[CREATE] ✅ User created:', result.user.uid);
        
        await saveUserData(result.user, 'email');
        NotificationSystem.success('¡Cuenta creada! Redirigiendo...');
        
        setTimeout(() => {
          console.log('[CREATE] 🚀 Redirecting to home...');
          window.location.href = '/';
        }, 800);
      } catch (error) {
        console.error('[CREATE] ❌ Registration error:', error);
        handleAuthError(error);
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // ============================================
  // Google Authentication
  // ============================================
  if (googleBtn) {
    console.log('[CREATE] 🔵 Attaching Google button listener...');
    googleBtn.addEventListener('click', async function() {
      console.log('[CREATE] 🔵 Google button clicked!');
      if (!checkPageReady()) {
        console.warn('[CREATE] ⚠️ PAGE NOT READY! firebaseReady=' + firebaseReady + ', auth=' + !!auth + ', uiReady=' + uiElementsReady + ', listenersReady=' + eventListenersReady);
        NotificationSystem.error('La página aún está cargando, espera un momento por favor...');
        return;
      }
      
      try {
        console.log('[CREATE] 🔵 Starting Google authentication...');
        setButtonLoading(googleBtn, true);
        const { signInWithPopup, GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        console.log('[CREATE] 🔵 Google provider configured');
        
        console.log('[CREATE] 🔵 Opening Google popup...');
        const result = await signInWithPopup(auth, provider);
        console.log('[CREATE] ✅ Google auth successful:', result.user.uid);
        
        await saveUserData(result.user, 'google');
        NotificationSystem.success('¡Cuenta creada!');
        
        setTimeout(() => {
          console.log('[CREATE] 🚀 Redirecting to home...');
          window.location.href = '/';
        }, 800);
      } catch (error) {
        console.error('[CREATE] ❌ Google auth error:', error.code, error.message);
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
    console.log('[CREATE] ⚫ Attaching GitHub button listener...');
    githubBtn.addEventListener('click', async function() {
      console.log('[CREATE] ⚫ GitHub button clicked!');
      if (!checkPageReady()) {
        console.warn('[CREATE] ⚠️ PAGE NOT READY! firebaseReady=' + firebaseReady + ', auth=' + !!auth + ', uiReady=' + uiElementsReady + ', listenersReady=' + eventListenersReady);
        NotificationSystem.error('La página aún está cargando, espera un momento por favor...');
        return;
      }
      
      try {
        console.log('[CREATE] ⚫ Starting GitHub authentication...');
        setButtonLoading(githubBtn, true);
        const { signInWithPopup, GithubAuthProvider } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        
        const provider = new GithubAuthProvider();
        provider.setCustomParameters({ prompt: 'login' });
        console.log('[CREATE] ⚫ GitHub provider configured');
        
        console.log('[CREATE] ⚫ Opening GitHub popup...');
        const result = await signInWithPopup(auth, provider);
        console.log('[CREATE] ✅ GitHub auth successful:', result.user.uid);
        
        await saveUserData(result.user, 'github');
        NotificationSystem.success('¡Cuenta creada!');
        
        setTimeout(() => {
          console.log('[CREATE] 🚀 Redirecting to home...');
          window.location.href = '/';
        }, 800);
      } catch (error) {
        console.error('[CREATE] ❌ GitHub auth error:', error.code, error.message);
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
    console.log('[CREATE] ◀️ Attaching back button listener...');
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('[CREATE] ◀️ Back button clicked!');
      window.location.href = '/agent.html';
    });
  }
  
  console.log('[CREATE] ✅ All event listeners attached successfully!');
  eventListenersReady = true;
  console.log('[CREATE] 🔗 Setting eventListenersReady = true');
  checkPageReady();
}

function initializeUI() {
  initAttempts++;
  console.log(`[CREATE] 🎯 initializeUI() called (attempt #${initAttempts})`);
  
  if (uiInitialized_script) {
    console.warn('[CREATE] ⚠️ UI already initialized, skipping');
    return;
  }
  
  // Ensure all elements are in the DOM and visible
  const emailBtn = document.querySelector('.email-auth-option');
  const form = document.querySelector('.split-auth-form');
  const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
  const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
  
  console.log('[CREATE] 🔍 Checking element availability:');
  console.log('  emailBtn:', emailBtn ? '✅' : '❌');
  console.log('  form:', form ? '✅' : '❌');
  console.log('  googleBtn:', googleBtn ? '✅' : '❌');
  console.log('  githubBtn:', githubBtn ? '✅' : '❌');
  
  if (!emailBtn && !form && !googleBtn && !githubBtn) {
    console.warn('[CREATE] ⚠️ Elements not ready, retrying in 100ms...');
    uiInitialized_script = false; // Reset to allow retry
    setTimeout(initializeUI, 100);
    return;
  }
  
  uiInitialized_script = true;
  console.log('[CREATE] ✅ Setting uiInitialized_script = true');
  
  // Ensure buttons are clickable and visible
  [emailBtn, googleBtn, githubBtn].forEach((btn, idx) => {
    if (btn) {
      btn.style.pointerEvents = 'auto';
      btn.style.cursor = 'pointer';
      const computed = window.getComputedStyle(btn);
      console.log(`[CREATE] 🖱️ Button ${idx}: pointerEvents=${computed.pointerEvents}, cursor=${computed.cursor}`);
    }
  });
  
  uiElementsReady = true;
  console.log('[CREATE] 🎨 Setting uiElementsReady = true');
  
  console.log('[CREATE] 📞 Calling attachEventListeners()...');
  attachEventListeners();
  console.log('[CREATE] ✅ initializeUI() completed!');
  checkPageReady();
}

// Make reinitializeUI globally accessible for splash screen
window.reinitializeUI = initializeUI;
console.log('[CREATE] 🌐 window.reinitializeUI exposed (ts: ' + Date.now() + ')');

// IMMEDIATE UI initialization attempt
console.log('[CREATE] 🚀 Attempting immediate initializeUI (DOM state: ' + document.readyState + ')');
initializeUI();

// But also wait for DOM if needed
if (document.readyState === 'loading') {
  console.log('[CREATE] ⏳ DOM is loading, will reinitialize on DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[CREATE] ✅ DOMContentLoaded fired! Reinitializing UI...');
    setTimeout(() => initializeUI(), 50);
  });
} else {
  console.log('[CREATE] ✅ DOM already loaded');
}

// AGGRESSIVE re-initialization attempts - every 100ms for first 2 seconds
console.log('[CREATE] 🔄 Starting aggressive initialization retries...');
for (let i = 1; i <= 20; i++) {
  setTimeout(() => {
    if (!pageFullyReady) {
      const ready = checkPageReady();
      if (i <= 5 || i % 5 === 0) {
        console.log(`[CREATE] ⏱️ Retry #${i} (${i * 100}ms): ${ready ? '✅ READY' : '⏳ NOT READY'} [F=${firebaseReady} U=${uiElementsReady} L=${eventListenersReady}]`);
      }
      if (!ready) {
        initializeUI();
      }
    }
  }, i * 100);
}

// Aggressive monitoring - check every 100ms
console.log('[CREATE] 📊 Starting aggressive readiness monitoring...');
let monitoringAttempts = 0;
const readinessInterval = setInterval(() => {
  monitoringAttempts++;
  if (monitoringAttempts % 5 === 0) { // Log every 500ms
    console.log(`[CREATE] 📊 Monitor #${monitoringAttempts} (${monitoringAttempts * 100}ms): Firebase=${firebaseReady ? '✅' : '❌'} UI=${uiElementsReady ? '✅' : '❌'} Listeners=${eventListenersReady ? '✅' : '❌'} FullyReady=${pageFullyReady ? '✅' : '❌'}`);
  }
  if (pageFullyReady) {
    clearInterval(readinessInterval);
    console.log('[CREATE] 🎉 Page fully ready - monitoring stopped after ' + (monitoringAttempts * 100) + 'ms');
  }
}, 100);

setTimeout(() => {
  if (!pageFullyReady) {
    console.warn('[CREATE] ⚠️⚠️⚠️ Page NOT fully ready after 5 seconds!');
    console.warn(`[CREATE] Firebase=${firebaseReady ? '✅' : '❌'} UI=${uiElementsReady ? '✅' : '❌'} Listeners=${eventListenersReady ? '✅' : '❌'}`);
  }
  clearInterval(readinessInterval);
}, 5000);

console.log('[CREATE] ✅ Script loaded successfully!');
