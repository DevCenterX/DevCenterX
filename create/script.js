// ============================================
// CREATE ACCOUNT PAGE - Firebase Authentication
// ============================================

// ===== STATE VARIABLES =====
let firebaseReady = false;
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;

let auth = null;
let db = null;
let uiInitialized_script = false;
let eventListenersAttached = false;

// ===== NOTIFICATION SYSTEM =====
const NotificationSystem = (() => {
  const container = document.getElementById('notificationContainer');
  return {
    show(msg, type = 'info', dur = 4000) {
      console.log(`[CREATE] 💬 ${type}: ${msg}`);
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

// ===== CHECK PAGE READY =====
function checkPageReady() {
  const allReady = firebaseReady && uiElementsReady && eventListenersReady;
  
  if (allReady && !pageFullyReady) {
    pageFullyReady = true;
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      window.hideLoadingAndShowContent('all-systems-ready');
    }
  }
  
  return allReady;
}


// ===== FIREBASE INITIALIZATION =====
(async () => {
  try {
    let firebaseApp, authModule, dbModule;
    let retries = 0;
    const maxRetries = 3;
    let lastError = null;
    
    while (retries < maxRetries) {
      try {
        retries++;
        
        const initRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
        firebaseApp = initRes.initializeApp;
        
        const authRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
        authModule = authRes;
        
        const dbRes = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
        dbModule = dbRes;
        
        const firebaseConfig = {
          apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
          authDomain: "devcenter-agent-48c86.firebaseapp.com",
          projectId: "devcenter-agent-48c86",
          storageBucket: "devcenter-agent-48c86.firebasestorage.app",
          messagingSenderId: "911929994293",
          appId: "1:911929994293:web:1d08f68b4c507ee162557c",
          measurementId: "G-S5GTYBRVK8"
        };
        
        const app = firebaseApp(firebaseConfig);
        auth = authModule.getAuth(app);
        db = dbModule.getFirestore(app);
        
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
        
        firebaseReady = true;
        checkPageReady();
        break;
        
      } catch (err) {
        lastError = err;
        console.error(`Firebase import attempt #${retries} failed:`, err.message);
        
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }
    
    if (!auth || !db) {
      throw new Error(`Firebase not initialized after ${maxRetries} attempts. Last error: ${lastError?.message}`);
    }
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    NotificationSystem.error('Firebase error: ' + (error.message || 'Unknown'));
    firebaseReady = false;
  }
})();

// ===== HELPER FUNCTIONS =====
async function saveUserData(user, provider) {
  if (!user || !db) return;
  try {
    const { doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      uid: user.uid,
      email: user.email || '',
      username: user.displayName || user.email?.split('@')[0] || 'user',
      avatar: user.photoURL || '',
      provider: provider,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      plan: 'Normal',
      limit: '0'
    });
    localStorage.setItem('devcenter_user_id', user.uid);
    localStorage.setItem('devcenter_isLoggedIn', 'true');
  } catch (error) {
    console.error('User data save error:', error);
  }
}

function handleAuthError(error) {
  const msgs = {
    'auth/email-already-in-use': 'Email ya registrado',
    'auth/weak-password': 'Contraseña muy corta',
    'auth/invalid-email': 'Email inválido',
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
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    const backBtn = document.querySelector('.split-auth-back');

    // Email toggle
    if (emailBtn && form) {
      emailBtn.addEventListener('click', function() {
        const isHidden = form.style.display === 'none' || form.style.display === '';
        form.style.display = isHidden ? 'block' : 'none';
        emailBtn.style.display = isHidden ? 'none' : 'flex';
      });
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

    // Email register form
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!firebaseReady || !auth) {
          NotificationSystem.error('Sistema de autenticación no está cargado');
          return;
        }
        
        const email = form.querySelector('#email')?.value?.trim();
        const pwd = form.querySelector('#password')?.value;
        const pwdConfirm = form.querySelector('#confirm-password')?.value;
        const btn = form.querySelector('button[type="submit"]');
        
        if (!email || !pwd) { NotificationSystem.warning('Completa todos los campos'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { NotificationSystem.error('Email inválido'); return; }
        if (pwd.length < 6) { NotificationSystem.error('Contraseña muy corta (mín 6 caracteres)'); return; }
        if (pwdConfirm && pwd !== pwdConfirm) { NotificationSystem.error('Las contraseñas no coinciden'); return; }
        
        try {
          setButtonLoading(btn, true);
          const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
          const result = await createUserWithEmailAndPassword(auth, email, pwd);
          await saveUserData(result.user, 'email');
          NotificationSystem.success('¡Cuenta creada!');
          setTimeout(() => window.location.href = '/', 800);
        } catch (error) {
          handleAuthError(error);
          setButtonLoading(btn, false);
        }
      });
    }

    // Google auth
    if (googleBtn) {
      googleBtn.addEventListener('click', async function() {
        if (!firebaseReady || !auth) { 
          NotificationSystem.error('Sistema de autenticación no disponible'); 
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
          setTimeout(() => window.location.href = '/', 800);
        } catch (error) {
          console.error('Google Auth error:', error.code, error.message);
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(googleBtn, false);
        }
      });
    }

    // GitHub auth
    if (githubBtn) {
      githubBtn.addEventListener('click', async function() {
        if (!firebaseReady || !auth) { 
          NotificationSystem.error('Sistema de autenticación no disponible'); 
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
          setTimeout(() => window.location.href = '/', 800);
        } catch (error) {
          console.error('GitHub Auth error:', error.code, error.message);
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(githubBtn, false);
        }
      });
    }

    // Back button
    if (backBtn) {
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/agent.html';
      });
    }

    eventListenersReady = true;
    checkPageReady();
    
  } catch (error) {
    console.error('Error attaching listeners:', error);
    eventListenersReady = false;
  }
}

// ===== INITIALIZE UI =====
function initializeUI() {
  if (uiInitialized_script) return;
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    
    if (!emailBtn || !form || !googleBtn || !githubBtn) {
      return;
    }
    
    uiInitialized_script = true;
    
    [emailBtn, googleBtn, githubBtn].forEach((btn) => {
      if (btn) {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
      }
    });
    
    uiElementsReady = true;
    attachEventListeners();
    checkPageReady();
    
  } catch (error) {
    console.error('Error initializing UI:', error);
    uiInitialized_script = false;
  }
}

// ===== MAIN INITIALIZATION =====
window.reinitializeUI = initializeUI;

// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      initializeUI();
    }, 50);
  });
} else {
  setTimeout(() => {
    initializeUI();
  }, 50);
}

// Aggressive retry loop
for (let i = 1; i <= 50; i++) {
  setTimeout(() => {
    if (!pageFullyReady && !uiInitialized_script) {
      initializeUI();
    }
  }, i * 50);
}

// Indefinite monitoring
let monitorCount = 0;
const monitor = setInterval(() => {
  monitorCount++;
  
  if (pageFullyReady) {
    clearInterval(monitor);
    console.log('===============================================');
    console.log('PAGE READY! Monitor stopped after ' + (monitorCount * 100) + 'ms');
    console.log('===============================================');
  }
}, 100);
