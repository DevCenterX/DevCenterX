/**
 * DevCenterX — Crear App
 * Firebase Firestore: guarda proyecto y redirige al editor
 */

// ── Firebase helpers ──────────────────────────────────────────────────────────
async function getFirestoreWithAuth() {
    if (window.__DCX_DB && window.__DCX_AUTH_USER) return { db: window.__DCX_DB, user: window.__DCX_AUTH_USER };

    const [appMod, authMod, storeMod] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js'),
    ]);

    const config = {
        apiKey:            "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
        authDomain:        "devcenter-agent-48c86.firebaseapp.com",
        projectId:         "devcenter-agent-48c86",
        storageBucket:     "devcenter-agent-48c86.firebasestorage.app",
        messagingSenderId: "911929994293",
        appId:             "1:911929994293:web:1d08f68b4c507ee162557c",
    };

    if (!window.__DCX_APP) window.__DCX_APP = appMod.initializeApp(config);

    const auth = authMod.getAuth(window.__DCX_APP);
    // Wait for auth state restore (Firebase uses IndexedDB persistence by default)
    const user = await new Promise(resolve => {
        const unsub = authMod.onAuthStateChanged(auth, u => { unsub(); resolve(u); });
    });

    window.__DCX_DB = storeMod.getFirestore(window.__DCX_APP);
    window.__DCX_AUTH_USER = user;
    return { db: window.__DCX_DB, user };
}

async function createProjectInFirestore(name, description, tags) {
  const { db, user } = await getFirestoreWithAuth();
  const { doc, getDoc, setDoc, updateDoc, arrayUnion, serverTimestamp } =
    await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');

  const uid = user?.uid || localStorage.getItem('devcenter_user_id');
  if (!uid) throw new Error('Sesión inválida. Inicia sesión para crear proyectos.');

  const projectId = 'proj_' + Date.now();
  const now = new Date().toISOString(); // ISO string — safe inside arrays

  const newProject = {
    id:          projectId,
    name:        name.trim(),
    description: description?.trim() || '',
    tags:        tags.slice(0, 5),
    html:        '',
    css:         '',
    js:          '',
    status:      'development',
    deployUrl:   '',
    createdAt:   now,   // ← new Date() ISO string, NOT serverTimestamp()
    updatedAt:   now,   // ← same — serverTimestamp() is NOT allowed inside arrays
  };

  const ref  = doc(db, 'proyectos', uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Check plan limit
    const userRef  = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const plan     = userSnap.data()?.plan || 'Normal';
    const limits   = { Normal: 10, Premium: 15, Pro: 30 };
    const limit    = limits[plan] ?? 10;
    const existing = snap.data()?.proyectos || [];

    if (existing.length >= limit) {
      throw new Error(`Has alcanzado el límite de ${limit} apps para el plan ${plan}.`);
    }

    await updateDoc(ref, { proyectos: arrayUnion(newProject) });
  } else {
    // New document — serverTimestamp() is OK at document level
    await setDoc(ref, {
      uid,
      proyectos: [newProject],
      createdAt: serverTimestamp(),
    });
  }

  return projectId;
}

// ── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = (type === 'success' ? '✓  ' : type === 'error' ? '✕  ' : '⚠  ') + msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transform = 'translateY(8px)';
    el.style.transition = 'all .3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Auth check
  const uid      = localStorage.getItem('devcenter_user_id');
  const loggedIn = localStorage.getItem('devcenter_isLoggedIn') === 'true';

  if (!uid || !loggedIn) {
    showToast('Debes iniciar sesión primero.', 'warn');
    setTimeout(() => window.location.href = '/login', 1500);
    return;
  }

  // ── Tag logic ────────────────────────────────────────────────────────────
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
      chip.innerHTML = `<span>${tag}</span><span class="remove-tag" title="Eliminar">×</span>`;
      chip.querySelector('.remove-tag').addEventListener('click', () => {
        currentTags = currentTags.filter(t => t !== tag);
        renderTags();
      });
      tagContainer.insertBefore(chip, tagInput);
    });

    const maxed = currentTags.length >= MAX_TAGS;
    tagInput.disabled    = maxed;
    tagInput.placeholder = maxed ? 'máximo alcanzado' : 'react, api, mobile…';
    addTagBtn.disabled   = maxed;
  }

  function tryAddTag() {
    const val = tagInput.value.trim().replace(/,/g, '').toLowerCase().slice(0, 20);
    if (!val) return;
    if (currentTags.length >= MAX_TAGS) { showToast('Máximo 5 etiquetas.', 'warn'); return; }
    if (currentTags.includes(val)) { showToast('Etiqueta duplicada.', 'warn'); tagInput.value = ''; return; }
    currentTags.push(val);
    tagInput.value = '';
    renderTags();
  }

  tagInput?.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim()) {
      e.preventDefault(); tryAddTag();
    }
    if (e.key === 'Backspace' && !tagInput.value && currentTags.length) {
      currentTags.pop(); renderTags();
    }
  });
  addTagBtn?.addEventListener('click', tryAddTag);

  // ── Char counter ─────────────────────────────────────────────────────────
  const nameInput = document.getElementById('appName');
  const charCount = document.getElementById('charCount');

  nameInput?.addEventListener('input', () => {
    if (nameInput.value.length > 15) nameInput.value = nameInput.value.slice(0, 15);
    if (charCount) {
      charCount.textContent = `${nameInput.value.length} / 15`;
      charCount.style.color = nameInput.value.length > 12 ? '#fbbf24' : '';
    }
  });

  // ── Form submit ───────────────────────────────────────────────────────────
  const form      = document.getElementById('createAppForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitLbl = document.getElementById('submitLabel');

  form?.addEventListener('submit', async e => {
    e.preventDefault();

    const name = nameInput?.value.trim();
    const desc = document.getElementById('appDesc')?.value.trim();

    if (!name) {
      showToast('El nombre es obligatorio.', 'error');
      nameInput?.focus(); return;
    }
    if (name.length > 15) {
      showToast('El nombre no puede superar 15 caracteres.', 'error'); return;
    }

    submitBtn.disabled   = true;
    if (submitLbl) submitLbl.textContent = 'Creando…';

    try {
      const projectId = await createProjectInFirestore(name, desc, currentTags);

      // Ensure user document has correct structure
      const { db, user } = await getFirestoreWithAuth();
      if (user && db) {
        const { doc, getDoc, setDoc, updateDoc, serverTimestamp } =
          await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
        const userRef  = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid:       user.uid,
            email:     user.email || '',
            username:  user.displayName || user.email?.split('@')[0] || 'user_' + user.uid.substring(0, 8),
            avatar:    user.photoURL || '',
            provider:  user.providerData?.[0]?.providerId?.replace('.com','') || 'email',
            createdAt: serverTimestamp(),
            plan:      'Normal',
            limit:     0,
          });
        } else {
          // Ensure required fields exist
          const d = userSnap.data(); const patch = {};
          if (d.limit    === undefined) patch.limit    = 0;
          if (d.plan     === undefined) patch.plan     = 'Normal';
          if (d.username === undefined) patch.username = user.displayName || user.email?.split('@')[0] || 'Usuario';
          if (Object.keys(patch).length) await updateDoc(userRef, patch);
        }
      }

      showToast('Proyecto creado exitosamente ✓', 'success');

      // Redirect to editor with project ID
      setTimeout(() => {
        window.location.href = `/Programar/?pid=${projectId}`;
      }, 700);

    } catch (err) {
      console.error('[DevCenterX] Error:', err);
      showToast(err.message || 'Error al crear el proyecto.', 'error');
      submitBtn.disabled   = false;
      if (submitLbl) submitLbl.textContent = 'Crear proyecto';
    }
  });

  // ── Back button ───────────────────────────────────────────────────────────
  document.getElementById('backBtn')?.addEventListener('click', () => {
    history.length > 1 ? history.back() : (window.location.href = '/');
  });
});
