// ============================================
// CREATE ACCOUNT PAGE - Firebase Authentication
// ============================================

console.log('[CREATE] 🚀 Script loading');

// ===== STATE VARIABLES =====
let firebaseReady = false;
let uiElementsReady = false;
let eventListenersReady = false;
let pageFullyReady = false;

let auth = null;
let db = null;
let uiInitialized_script = false;
let eventListenersAttached = false;

console.log('[CREATE] 📋 State variables initialized');

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

console.log('[CREATE] ✅ NotificationSystem initialized');

// ===== CHECK PAGE READY =====
function checkPageReady() {
  const allReady = firebaseReady && uiElementsReady && eventListenersReady;
  
  if (allReady && !pageFullyReady) {
    pageFullyReady = true;
    console.log('[CREATE] 🎉🎉🎉 PAGE FULLY READY! All systems operational!');
    window.pageFullyReady = true;
    if (window.hideLoadingAndShowContent) {
      console.log('[CREATE] 📞 Calling hideLoadingAndShowContent...');
      window.hideLoadingAndShowContent('all-systems-ready');
    }
  }
  
  return allReady;
}


// ===== FIREBASE INITIALIZATION =====
console.log('[CREATE] 🔥 Starting Firebase initialization...');
(async () => {
  try {
    console.log('[CREATE] 📥 Importing Firebase modules...');
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js");
    const { getAuth, setPersistence, browserLocalPersistence } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js");
    
    console.log('[CREATE] 🔧 Initializing Firebase app...');
    const app = initializeApp({
      apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
      authDomain: "devcenter-agent-48c86.firebaseapp.com",
      projectId: "devcenter-agent-48c86",
      storageBucket: "devcenter-agent-48c86.firebasestorage.app",
      messagingSenderId: "911929994293",
      appId: "1:911929994293:web:1d08f68b4c507ee162557c",
      measurementId: "G-S5GTYBRVK8"
    });
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('[CREATE] 🔐 Setting persistence...');
    await setPersistence(auth, browserLocalPersistence);
    
    firebaseReady = true;
    console.log('[CREATE] ✅ Firebase initialized successfully!');
    checkPageReady();
  } catch (error) {
    console.error('[CREATE] ❌ Firebase error:', error);
    NotificationSystem.error('Error cargando autenticación');
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
    console.log('[CREATE] ✅ User data saved');
  } catch (error) {
    console.error('[CREATE] ❌ Save error:', error);
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
  console.log('[CREATE] 🔗 Attaching event listeners...');
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    const backBtn = document.querySelector('.split-auth-back');

    console.log('[CREATE] 🎯 Elements found:');
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
      console.log('[CREATE] ✅ Email toggle listener attached');
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
    console.log('[CREATE] ✅ Password toggle listeners attached');

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
      console.log('[CREATE] ✅ Email register listener attached');
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
          setTimeout(() => window.location.href = '/', 800);
        } catch (error) {
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(googleBtn, false);
        }
      });
      console.log('[CREATE] ✅ Google auth listener attached');
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
          setTimeout(() => window.location.href = '/', 800);
        } catch (error) {
          if (error.code !== 'auth/popup-blocked') handleAuthError(error);
          setButtonLoading(githubBtn, false);
        }
      });
      console.log('[CREATE] ✅ GitHub auth listener attached');
    }

    // Back button
    if (backBtn) {
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/agent.html';
      });
      console.log('[CREATE] ✅ Back button listener attached');
    }

    eventListenersReady = true;
    console.log('[CREATE] ✅ ALL EVENT LISTENERS ATTACHED SUCCESSFULLY!');
    checkPageReady();
    
  } catch (error) {
    console.error('[CREATE] ❌ Error attaching listeners:', error);
    eventListenersReady = false;
  }
}

// ===== INITIALIZE UI =====
function initializeUI() {
  if (uiInitialized_script) return;
  
  console.log('[CREATE] 🎨 Attempting to initialize UI...');
  
  try {
    const emailBtn = document.querySelector('.email-auth-option');
    const form = document.querySelector('.split-auth-form');
    const googleBtn = document.querySelectorAll('.social-auth-btn')[0];
    const githubBtn = document.querySelectorAll('.social-auth-btn')[1];
    
    if (!emailBtn || !form || !googleBtn || !githubBtn) {
      console.log('[CREATE] ⏳ UI elements not found yet, retrying...');
      console.log('[CREATE] 📍 Elements found: email=' + (emailBtn ? 'yes' : 'no') + ', form=' + (form ? 'yes' : 'no') + ', google=' + (googleBtn ? 'yes' : 'no') + ', github=' + (githubBtn ? 'yes' : 'no'));
      return;
    }
    
    uiInitialized_script = true;
    console.log('[CREATE] 🎯 UI elements found!');
    
    [emailBtn, googleBtn, githubBtn].forEach((btn) => {
      if (btn) {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.opacity = '1';
      }
    });
    
    uiElementsReady = true;
    console.log('[CREATE] 🎨 UI initialized successfully!');
    
    attachEventListeners();
    checkPageReady();
    
  } catch (error) {
    console.error('[CREATE] ❌ Error initializing UI:', error);
    uiInitialized_script = false;
  }
}

// ===== MAIN INITIALIZATION =====
console.log('[CREATE] 🌐 Exposing window functions...');
window.reinitializeUI = initializeUI;

console.log('[CREATE] 📅 DOM readyState:', document.readyState);

// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  console.log('[CREATE] ⏳ Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[CREATE] ✅ DOMContentLoaded fired!');
    setTimeout(() => {
      console.log('[CREATE] 🚀 Calling initializeUI after DOMContentLoaded...');
      initializeUI();
    }, 50);
  });
} else {
  console.log('[CREATE] ✅ DOM already fully loaded');
  setTimeout(() => {
    console.log('[CREATE] 🚀 Calling initializeUI immediately...');
    initializeUI();
  }, 50);
}

// Aggressive retry loop
console.log('[CREATE] 🔄 Starting aggressive retry loop...');
for (let i = 1; i <= 50; i++) {
  setTimeout(() => {
    if (!pageFullyReady && !uiInitialized_script) {
      if (i <= 5 || i % 10 === 0) {
        console.log(`[CREATE] 🔄 Retry #${i} (${i * 50}ms): Trying initializeUI...`);
      }
      initializeUI();
    }
  }, i * 50);
}

// Indefinite monitoring
console.log('[CREATE] 📊 Starting indefinite monitoring (NO TIMEOUT)...');
let monitorCount = 0;
const monitor = setInterval(() => {
  monitorCount++;
  
  if (monitorCount % 10 === 0) {
    console.log(`[CREATE] 📊 Monitor #${monitorCount} (${monitorCount * 100}ms): FB=${firebaseReady ? '✅' : '❌'} UI=${uiElementsReady ? '✅' : '❌'} L=${eventListenersReady ? '✅' : '❌'} READY=${pageFullyReady ? '✅' : '❌'}`);
  }
  
  if (pageFullyReady) {
    clearInterval(monitor);
    console.log('[CREATE] 🎉🎉🎉 PAGE FULLY READY! Monitor stopped after ' + (monitorCount * 100) + 'ms');
  }
}, 100);

console.log('[CREATE] ✅ Script fully loaded! Waiting for all systems to be ready...');
