// ============================================
// LOGIN PAGE - Firebase Authentication
// ============================================

console.log('[LOGIN] 🚀 Script loading - PHASE 1: Initial log');
console.log('[LOGIN] 📍 Window object:', typeof window !== 'undefined' ? '✅' : '❌');
console.log('[LOGIN] 📍 Document object:', typeof document !== 'undefined' ? '✅' : '❌');

// ===== STATE VARIABLES =====
let firebaseReady = false;
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;

let auth = null;
let db = null;
let uiInitialized_script = false;
let eventListenersAttached = false;

console.log('[LOGIN] 📋 State variables initialized');

// ===== NOTIFICATION SYSTEM =====
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  return {
    show(msg, type = 'info', dur = 4000) {
      console.log(`[LOGIN] 💬 ${type}: ${msg}`);
      if (!container) return;
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
      notification.innerHTML = `<span class="notification-icon">${icons[type] || '•'}</span><span>${msg}</span><button class="notification-close">×</button>`;
      container.appendChild(notification);
      const closeBtn = notification.querySelector('.notification-close');
      const remove = () => { notification.classList.add('removing'); setTimeout(() => notification.remove(), 300); };
      closeBtn?.addEventListener('click', remove);
      if (dur > 0) setTimeout(remove, dur);
      return notification;
    },
    success(m, d) { return this.show(m, 'success', d); },
    error(m, d) { return this.show(m, 'error', d || 5000); },
    info(m, d) { return this.show(m, 'info', d); },
    warning(m, d) { return this.show(m, 'warning', d); }
  };
})();

console.log('[LOGIN] ✅ NotificationSystem initialized');

// ===== CHECK PAGE READY =====
function checkPageReady() {
  const allReady = firebaseReady && uiElementsReady && eventListenersReady;
  
  console.log('[LOGIN] 🔍 checkPageReady() called: FB=' + firebaseReady + ' UI=' + uiElementsReady + ' L=' + eventListenersReady + ' => ALL=' + allReady);
  
  if (allReady && !pageFullyReady) {
    pageFullyReady = true;
    console.log('[LOGIN] 🎉🎉🎉 PAGE FULLY READY! Setting window.pageFullyReady=true');
    window.pageFullyReady = true;
    console.log('[LOGIN] ✅ window.pageFullyReady is now:', window.pageFullyReady);
    if (window.hideLoadingAndShowContent) {
      console.log('[LOGIN] 📞 Calling hideLoadingAndShowContent("all-systems-ready")...');
      window.hideLoadingAndShowContent('all-systems-ready');
      console.log('[LOGIN] ✅ hideLoadingAndShowContent completed');
    } else {
      console.warn('[LOGIN] ⚠️ window.hideLoadingAndShowContent not available!');
    }
  }
  
  return allReady;
}

// ===== FIREBASE INITIALIZATION =====
console.log('[LOGIN] 🔥 PHASE 2: Starting Firebase initialization...');
console.log('[LOGIN] ⏰ Timestamp:', new Date().toISOString());

(async () => {
  try {
    console.log('[LOGIN] 📥 PHASE 2A: About to import Firebase modules...');
    
    let firebaseApp, authModule, dbModule;
    let retries = 0;
    const maxRetries = 3;
    let lastError = null;
    
    console.log('[LOGIN] 🔄 Starting import attempts (max: ' + maxRetries + ')');
    
    while (retries < maxRetries) {
      try {
        retries++;
        console.log(`[LOGIN] 🔄 PHASE 2B.${retries}: Import attempt #${retries}...`);
        
        console.log('[LOGIN] 📦 Loading firebase-app.js');
        const initRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
        firebaseApp = initRes.initializeApp;
        console.log('[LOGIN] ✅ firebase-app loaded');
        
        console.log('[LOGIN] 📦 Loading firebase-auth.js');
        const authRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        authModule = authRes;
        console.log('[LOGIN] ✅ firebase-auth loaded');
        
        console.log('[LOGIN] 📦 Loading firebase-firestore.js');
        const dbRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
        dbModule = dbRes;
        console.log('[LOGIN] ✅ firebase-firestore loaded');
        
        console.log('[LOGIN] 🎉 All modules imported successfully on attempt #' + retries);
        
        const firebaseConfig = {
          apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
          authDomain: "devcenter-agent-48c86.firebaseapp.com",
          projectId: "devcenter-agent-48c86",
          storageBucket: "devcenter-agent-48c86.firebasestorage.app",
          messagingSenderId: "911929994293",
          appId: "1:911929994293:web:1d08f68b4c507ee162557c",
          measurementId: "G-S5GTYBRVK8"
        };
        
        console.log('[LOGIN] 🔧 PHASE 2C: Initializing Firebase app...');
        const app = firebaseApp(firebaseConfig);
        console.log('[LOGIN] ✅ Firebase app initialized');
        
        auth = authModule.getAuth(app);
        console.log('[LOGIN] ✅ Auth module ready');
        db = dbModule.getFirestore(app);
        console.log('[LOGIN] ✅ Firestore database ready');
        
        console.log('[LOGIN] 🔐 Setting persistence...');
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
        console.log('[LOGIN] ✅ Persistence set');
        
        firebaseReady = true;
        console.log('[LOGIN] ✅✅✅ FIREBASE FULLY INITIALIZED! firebaseReady=true');
        checkPageReady();
        break;
        
      } catch (err) {
        lastError = err;
        console.error(`[LOGIN] ❌ Attempt #${retries} FAILED:`, err.message);
        console.error('[LOGIN] Error details:', err);
        
        if (retries < maxRetries) {
          console.log(`[LOGIN] ⏳ Waiting 500ms before retry #${retries + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!auth || !db) {
      throw new Error(`Firebase not initialized after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }
    
    console.log('[LOGIN] 🎉 Firebase initialization COMPLETE');
    
  } catch (error) {
    console.error('[LOGIN] ❌❌❌ FATAL ERROR in Firebase init:', error);
    console.error('[LOGIN] Stack:', error.stack);
    NotificationSystem.error('Firebase error: ' + (error.message || 'Unknown'));
    firebaseReady = false;
  }
})();

console.log('[LOGIN] PHASE 2 END: Firebase initialization async function started');

// ===== HELPER FUNCTIONS =====
async function saveUserData(user, provider) {
  if (!user || !db) return;
  try {
    const { doc, setDoc, getDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        username: user.displayName || user.email?.split('@')[0] || 'user',
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
    console.log('[LOGIN] ✅ User data saved');
  } catch (error) {
    console.error('[LOGIN] ❌ Save error:', error);
  }
}

function handleAuthError(error) {
  const msgs = {
    'auth/user-not-found': 'Este email no está registrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-email': 'Email inválido',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/popup-closed-by-user': 'Autenticación cancelada',
    'auth/network-request-failed': 'Error de conexión',
  };
  NotificationSystem.error(msgs[error.code] || error.message);
}

function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.dataset.originalText = btn.innerText;
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (btn.dataset.originalText) btn.innerText = btn.dataset.originalText;
  }
}

// ===== ATTACH EVENT LISTENERS =====
function attachEventListeners() {
  if (eventListenersAttached) return;
  eventListenersAttached = true;
  console.log('[LOGIN] 🔗 Attaching event listeners...');
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    const backBtn = document.querySelector('.split-auth-back');

    console.log('[LOGIN] 🎯 Elements found:');
    console.log('  emailBtn:', emailBtn ? '✅' : '❌');
    console.log('  form:', form ? '✅' : '❌');
    console.log('  googleBtn:', googleBtn ? '✅' : '❌');
    console.log('  githubBtn:', githubBtn ? '✅' : '❌');
    console.log('  backBtn:', backBtn ? '✅' : '❌');

    // Email toggle
    if (emailBtn && form) {
      emailBtn.addEventListener('click', function() {
        const isHidden = form.style.display === 'none' || form.style.display === '';
        form.style.display = isHidden ? 'block' : 'none';
        emailBtn.style.display = isHidden ? 'none' : 'flex';
      });
      console.log('[LOGIN] ✅ Email toggle listener attached');
    }

    // Password visibility
    document.querySelectorAll('.password-toggle-btn').forEach((btn) => {
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
    console.log('[LOGIN] ✅ Password toggle listeners attached');

    // Email login form
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!firebaseReady || !auth) {
          NotificationSystem.error('Sistema de autenticación no está cargado');
          return;
        }
        
        const email = form.querySelector('#email')?.value?.trim();
        const password = form.querySelector('#password')?.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (!email || !password) { NotificationSystem.warning('Completa todos los campos'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { NotificationSystem.error('Email inválido'); return; }
        
        try {
          setButtonLoading(submitBtn, true);
          const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
          const result = await signInWithEmailAndPassword(auth, email, password);
          await saveUserData(result.user, 'email');
          NotificationSystem.success('¡Bienvenido!');
          setTimeout(() => { window.location.href = '/'; }, 800);
        } catch (error) {
          handleAuthError(error);
          setButtonLoading(submitBtn, false);
        }
      });
      console.log('[LOGIN] ✅ Email login listener attached');
    }

    // Google auth
    if (googleBtn) {
      googleBtn.addEventListener('click', async function() {
        if (!checkPageReady()) { 
          NotificationSystem.error('Cargando sistemas...'); 
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
          setTimeout(() => { window.location.href = '/'; }, 800);
        } catch (error) {
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(googleBtn, false);
        }
      });
      console.log('[LOGIN] ✅ Google auth listener attached');
    }

    // GitHub auth
    if (githubBtn) {
      githubBtn.addEventListener('click', async function() {
        if (!checkPageReady()) { 
          NotificationSystem.error('Cargando sistemas...'); 
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
          setTimeout(() => { window.location.href = '/'; }, 800);
        } catch (error) {
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(githubBtn, false);
        }
      });
      console.log('[LOGIN] ✅ GitHub auth listener attached');
    }

    // Back button
    if (backBtn) {
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/agent.html';
      });
      console.log('[LOGIN] ✅ Back button listener attached');
    }

    eventListenersReady = true;
    console.log('[LOGIN] ✅ ALL EVENT LISTENERS ATTACHED SUCCESSFULLY!');
    checkPageReady();
    
  } catch (error) {
    console.error('[LOGIN] ❌ Error attaching listeners:', error);
    eventListenersReady = false;
  }
}

// ===== INITIALIZE UI =====
function initializeUI() {
  if (uiInitialized_script) return;
  
  console.log('[LOGIN] 🎨 Attempting to initialize UI...');
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    
    if (!emailBtn || !form || !googleBtn || !githubBtn) {
      console.log('[LOGIN] ⏳ UI elements not found yet, retrying...');
      console.log('[LOGIN] 📍 Elements found: email=' + (emailBtn ? 'yes' : 'no') + ', form=' + (form ? 'yes' : 'no') + ', google=' + (googleBtn ? 'yes' : 'no') + ', github=' + (githubBtn ? 'yes' : 'no'));
      return;
    }
    
    uiInitialized_script = true;
    console.log('[LOGIN] 🎯 UI elements found!');
    
    [emailBtn, googleBtn, githubBtn].forEach((btn) => {
      if (btn) {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
      }
    });
    
    uiElementsReady = true;
    console.log('[LOGIN] 🎨 UI initialized successfully!');
    
    attachEventListeners();
    checkPageReady();
    
  } catch (error) {
    console.error('[LOGIN] ❌ Error initializing UI:', error);
    uiInitialized_script = false;
  }
}

// ===== MAIN INITIALIZATION =====
console.log('[LOGIN] 🌐 Exposing window functions...');
window.reinitializeUI = initializeUI;

console.log('[LOGIN] 📅 DOM readyState:', document.readyState);

// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  console.log('[LOGIN] ⏳ Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[LOGIN] ✅ DOMContentLoaded fired!');
    setTimeout(() => {
      console.log('[LOGIN] 🚀 Calling initializeUI after DOMContentLoaded...');
      initializeUI();
    }, 50);
  });
} else {
  console.log('[LOGIN] ✅ DOM already fully loaded');
  setTimeout(() => {
    console.log('[LOGIN] 🚀 Calling initializeUI immediately...');
    initializeUI();
  }, 50);
}

// Aggressive retry loop
console.log('[LOGIN] 🔄 Starting aggressive retry loop...');
for (let i = 1; i <= 50; i++) {
  setTimeout(() => {
    if (!pageFullyReady && !uiInitialized_script) {
      if (i <= 5 || i % 10 === 0) {
        console.log(`[LOGIN] 🔄 Retry #${i} (${i * 50}ms): Trying initializeUI...`);
      }
      initializeUI();
    }
  }, i * 50);
}

// Indefinite monitoring
console.log('[LOGIN] 📊 Starting indefinite monitoring (NO TIMEOUT)...');
let monitorCount = 0;
const monitor = setInterval(() => {
  monitorCount++;
  
  if (monitorCount % 10 === 0) {
    console.log(`[LOGIN] 📊 Monitor #${monitorCount} (${monitorCount * 100}ms): FB=${firebaseReady ? '✅' : '❌'} UI=${uiElementsReady ? '✅' : '❌'} L=${eventListenersReady ? '✅' : '❌'} READY=${pageFullyReady ? '✅' : '❌'}`);
  }
  
  if (pageFullyReady) {
    clearInterval(monitor);
    console.log('[LOGIN] 🎉🎉🎉 PAGE FULLY READY! Monitor stopped after ' + (monitorCount * 100) + 'ms');
  }
}, 100);

console.log('[LOGIN] ✅ Script fully loaded! Waiting for all systems to be ready...');
