/**
 * DevCenterX — Create App Page
 * Módulo principal: Firebase, formulario, etiquetas, UX
 */

// ── Tema (sincronía con el resto de la app) ──────────────────────────────────
(function () {
  try {
    const theme = localStorage.getItem('devcenter_theme');
    if (theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
      const s = document.createElement('style');
      s.textContent = 'body{background:#f0f2f7!important;color:#0b1220!important;}';
      document.head.appendChild(s);
    }
  } catch (_) {}
})();

// ── Firebase helpers ─────────────────────────────────────────────────────────
async function getFirestoreInstance() {
  if (window.__DEVCENTER_FIRESTORE) return window.__DEVCENTER_FIRESTORE;

  const [appMod, authMod, storeMod] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'),
  ]);

  const firebaseConfig = {
    apiKey:            "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
    authDomain:        "devcenter-agent-48c86.firebaseapp.com",
    projectId:         "devcenter-agent-48c86",
    storageBucket:     "devcenter-agent-48c86.firebasestorage.app",
    messagingSenderId: "911929994293",
    appId:             "1:911929994293:web:1d08f68b4c507ee162557c",
    measurementId:     "G-S5GTYBRVK8",
  };

  if (!window.__DEVCENTER_FIREBASE_APP) {
    window.__DEVCENTER_FIREBASE_APP = appMod.initializeApp(firebaseConfig);
    window.__DEVCENTER_AUTH = authMod.getAuth(window.__DEVCENTER_FIREBASE_APP);
    await authMod.setPersistence(
      window.__DEVCENTER_AUTH,
      authMod.browserLocalPersistence
    );
  }

  window.__DEVCENTER_FIRESTORE = storeMod.getFirestore(
    window.__DEVCENTER_FIREBASE_APP
  );
  return window.__DEVCENTER_FIRESTORE;
}

// ── Crear app en Firestore ───────────────────────────────────────────────────
async function createAppRecord(name, description, tags = []) {
  const uid = localStorage.getItem('devcenter_user_id');
  if (!uid || localStorage.getItem('devcenter_isLoggedIn') !== 'true') {
    throw new Error('Sesión inválida. Por favor inicia sesión.');
  }

  const db = await getFirestoreInstance();
  const { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } =
    await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

  const ref  = doc(db, 'proyectos', uid);
  const snap = await getDoc(ref);

  const newApp = {
    id:          Date.now().toString(),
    name:        name.trim(),
    description: description?.trim() ?? '',
    tags:        tags.slice(0, 5),
    createdAt:   serverTimestamp(),
    status:      'development',
    downloads:   0,
  };

  if (snap.exists()) {
    await updateDoc(ref, { proyectos: arrayUnion(newApp) });
  } else {
    await setDoc(ref, { uid, proyectos: [newApp], createdAt: serverTimestamp() });
  }

  return newApp;
}

// ── Toast notification ───────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.dcx-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `dcx-toast dcx-toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
    <span class="toast-msg">${message}</span>
  `;

  // inline styles for self-contained toast (no extra CSS file needed)
  Object.assign(toast.style, {
    position:       'fixed',
    bottom:         '24px',
    left:           '50%',
    transform:      'translateX(-50%) translateY(20px)',
    display:        'flex',
    alignItems:     'center',
    gap:            '8px',
    padding:        '10px 20px',
    borderRadius:   '8px',
    fontFamily:     "'JetBrains Mono', monospace",
    fontSize:       '0.78rem',
    fontWeight:     '500',
    letterSpacing:  '0.04em',
    color:          '#fff',
    background:     type === 'success' ? 'rgba(22,30,46,0.95)' : 'rgba(30,14,14,0.95)',
    border:         `1px solid ${type === 'success' ? 'rgba(99,102,241,0.4)' : 'rgba(248,113,113,0.4)'}`,
    boxShadow:      '0 8px 32px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(12px)',
    zIndex:         '9999',
    transition:     'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    opacity:        '0',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Tag management ────────────────────────────────────────────────────────
  const tagInput     = document.getElementById('tagInput');
  const tagContainer = document.getElementById('tagContainer');
  const addTagBtn    = document.getElementById('addTagBtn');
  let   currentTags  = [];
  const MAX_TAGS     = 5;

  function renderTags() {
    tagContainer.querySelectorAll('.tag-chip').forEach(el => el.remove());
    currentTags.forEach(tag => {
      const chip   = document.createElement('span');
      chip.className = 'tag-chip';

      const label  = document.createElement('span');
      label.textContent = tag;

      const remove = document.createElement('span');
      remove.className   = 'remove-tag';
      remove.textContent = '×';
      remove.setAttribute('title', `Eliminar "${tag}"`);
      remove.addEventListener('click', () => {
        currentTags = currentTags.filter(t => t !== tag);
        renderTags();
      });

      chip.appendChild(label);
      chip.appendChild(remove);
      tagContainer.insertBefore(chip, tagInput);
    });

    // disable input + button at max
    const disabled = currentTags.length >= MAX_TAGS;
    if (tagInput) {
      tagInput.disabled    = disabled;
      tagInput.placeholder = disabled
        ? 'máximo alcanzado'
        : 'ej. react, api, mobile…';
    }
    if (addTagBtn) {
      addTagBtn.disabled = disabled;
    }
  }

  function tryAddTag() {
    if (!tagInput) return;
    const val = tagInput.value.trim().replace(/,/g, '').toLowerCase();
    if (!val) return;

    if (currentTags.length >= MAX_TAGS) {
      showToast(`Solo puedes agregar hasta ${MAX_TAGS} etiquetas.`, 'error');
      return;
    }
    if (currentTags.includes(val)) {
      showToast('Etiqueta ya agregada.', 'error');
      tagInput.value = '';
      return;
    }

    currentTags.push(val);
    tagInput.value = '';
    renderTags();
  }

  if (tagInput) {
    tagInput.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
        e.preventDefault();
        tryAddTag();
      }
      // delete last tag on Backspace when input empty
      if (e.key === 'Backspace' && tagInput.value === '' && currentTags.length) {
        currentTags.pop();
        renderTags();
      }
    });
  }

  if (addTagBtn) {
    addTagBtn.addEventListener('click', tryAddTag);
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  const form      = document.getElementById('createAppForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('appName')?.value.trim();
    const desc = document.getElementById('appDesc')?.value.trim();

    if (!name) {
      showToast('El nombre de la aplicación es obligatorio.', 'error');
      document.getElementById('appName')?.focus();
      return;
    }

    // Loading state
    submitBtn?.classList.add('loading');
    if (submitBtn) {
      const lbl = submitBtn.querySelector('.btn-label');
      if (lbl) lbl.textContent = 'Creando proyecto';
    }

    try {
      await createAppRecord(name, desc, currentTags);
      showToast('Proyecto creado exitosamente ✓', 'success');
      setTimeout(() => {
        window.location.href = '/Programar/';
      }, 800);
    } catch (err) {
      console.error('[DevCenterX] Error creando app:', err);
      showToast(err.message ?? 'Ocurrió un error. Intenta de nuevo.', 'error');
      submitBtn?.classList.remove('loading');
      if (submitBtn) {
        const lbl = submitBtn.querySelector('.btn-label');
        if (lbl) lbl.textContent = 'Crear proyecto';
      }
    }
  });

  // ── Back button ───────────────────────────────────────────────────────────
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }
});
