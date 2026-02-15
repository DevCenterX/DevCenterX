// Script de la sección de Apps

document.addEventListener('DOMContentLoaded', () => {
  // Helpers para almacenamiento de datos
  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e);
    }
  }

  function loadSetting(key, defaultValue) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? defaultValue : JSON.parse(v);
    } catch (e) {
      return defaultValue;
    }
  }

  // Aplicar tema (usa misma convención que script.js)
  function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    saveSetting('devcenter_theme', theme);
    setSelectedThemeButton(theme);
  }

  function setSelectedThemeButton(theme) {
    const darkBtn = document.querySelector('[data-theme="dark"]');
    const lightBtn = document.querySelector('[data-theme="light"]');
    if (darkBtn) darkBtn.classList.remove('selected');
    if (lightBtn) lightBtn.classList.remove('selected');
    if (theme === 'dark' && darkBtn) darkBtn.classList.add('selected');
    if (theme === 'light' && lightBtn) lightBtn.classList.add('selected');
  }

  // Inicializar tema
  const savedTheme = loadSetting('devcenter_theme', 'dark');
  applyTheme(savedTheme);
  
  // listeners globales para cualquier control que tenga data-theme
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = btn.getAttribute('data-theme');
      if (t) applyTheme(t);
      e.stopPropagation();
    });
  });

  // Cargar datos de aplicaciones desde Firestore
  async function initAppsData() {
    try {
      // Verificar si está logueado
      const isLoggedIn = localStorage.getItem('devcenter_isLoggedIn');
      const uid = localStorage.getItem('devcenter_user_id');
      
      // Sin login válido, no cargar
      if (isLoggedIn !== 'true' || !uid) {
        console.log('⚠️ No hay sesión activa');
        return;
      }

      // Import Firebase modules
      const appMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js');
      const authMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
      const firestoreMod = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js');
      const { initializeApp } = appMod;
      const { getAuth, setPersistence, browserLocalPersistence } = authMod;
      const { getFirestore, doc, getDoc } = firestoreMod;

      const firebaseConfig = {
        apiKey: "AIzaSyCsgsrFZ_nTMrtK69f6815I0Hcc1kTASHY",
        authDomain: "devcenter-agent-48c86.firebaseapp.com",
        projectId: "devcenter-agent-48c86",
        storageBucket: "devcenter-agent-48c86.firebasestorage.app",
        messagingSenderId: "911929994293",
        appId: "1:911929994293:web:1d08f68b4c507ee162557c",
        measurementId: "G-S5GTYBRVK8"
      };

      // Initialize app
      if (!window.__DEVCENTER_FIREBASE_APP) {
        window.__DEVCENTER_FIREBASE_APP = initializeApp(firebaseConfig);
        window.__DEVCENTER_FIRESTORE = getFirestore(window.__DEVCENTER_FIREBASE_APP);
        window.__DEVCENTER_AUTH = getAuth(window.__DEVCENTER_FIREBASE_APP);
        await setPersistence(window.__DEVCENTER_AUTH, browserLocalPersistence);
      }

      const db = window.__DEVCENTER_FIRESTORE;
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        console.warn('❌ Usuario no encontrado en Firestore');
        return;
      }
      
      const userData = snap.data();

      // Procesar datos del usuario
      const plan = (userData.plan && userData.plan.trim().length > 0) 
        ? userData.plan 
        : 'Gratis';

      // Cargar proyectos para contar apps
      try {
        const proyectosRef = doc(db, 'proyectos', uid);
        const proyectosSnap = await getDoc(proyectosRef);
        let totalCount = 0;
        let developmentCount = 0;
        let publishedCount = 0;

        if (proyectosSnap.exists()) {
          const pData = proyectosSnap.data();
          if (Array.isArray(pData.proyectos)) {
            totalCount = pData.proyectos.length;
            pData.proyectos.forEach(app => {
              if (app.published || app.status === 'published') {
                publishedCount++;
              } else {
                developmentCount++;
              }
            });
          }
        }

        // Normalizar nombre de plan
        function normalizePlan(p) {
          const s = (p || '').toString().toLowerCase();
          if (s.includes('pro')) return 'Pro';
          if (s.includes('premium')) return 'Premium';
          return 'Normal';
        }

        const planKey = normalizePlan(plan);
        const limits = { 'Normal': 10, 'Premium': 15, 'Pro': 30 };
        const planLimits = limits[planKey] || 10;

        // Actualizar datos en DOM
        const totalCountEl = document.getElementById('totalAppsCount');
        const totalLimitEl = document.getElementById('totalAppsLimit');
        const devCountEl = document.getElementById('developmentAppsCount');
        const pubCountEl = document.getElementById('publishedAppsCount');
        const userPlanTitleEl = document.getElementById('userPlanTitle');

        if (totalCountEl) totalCountEl.textContent = totalCount;
        if (totalLimitEl) totalLimitEl.textContent = `de ${planLimits}`;
        if (devCountEl) devCountEl.textContent = developmentCount;
        if (pubCountEl) pubCountEl.textContent = publishedCount;

        // Actualizar sidebar
        if (userPlanTitleEl) {
          if (planKey === 'Normal') userPlanTitleEl.textContent = (plan && /starter/i.test(plan)) ? 'Starter Plan' : (plan + ' Plan' || 'Starter Plan');
          else userPlanTitleEl.textContent = plan + ' Plan';
        }

        // Aplicar clase global según plan
        try {
          document.body.classList.remove('plan-normal', 'plan-premium', 'plan-pro');
          if (planKey === 'Pro') document.body.classList.add('plan-pro');
          else if (planKey === 'Premium') document.body.classList.add('plan-premium');
          else document.body.classList.add('plan-normal');
        } catch (e) {
          // ignore
        }

        // Actualizar contadores en sidebar
        const appsCountEl = document.getElementById('userAppsCount');
        if (appsCountEl) {
          appsCountEl.textContent = `${totalCount}/${planLimits} creadas`;
        }

        // Actualizar botón de upgrade
        const upgradeBtn = document.getElementById('upgradeAgentBtn');
        if (upgradeBtn) {
          upgradeBtn.classList.remove('small', 'hidden');
          if (planKey === 'Pro') {
            upgradeBtn.classList.add('hidden');
          } else if (planKey === 'Premium') {
            upgradeBtn.classList.add('small');
          }
        }

      } catch (e) {
        console.warn('No se pudo cargar datos de proyectos:', e);
      }

      console.log('✅ Datos de aplicaciones cargados');

    } catch (e) {
      console.error('❌ Error cargando datos de aplicaciones:', e.message);
    }
  }

  initAppsData();

  // Event listeners para botones
  const createFirstAppBtn = document.getElementById('createFirstAppBtn');
  if (createFirstAppBtn) {
    createFirstAppBtn.addEventListener('click', () => {
      // Redirigir al editor o modal de creación
      alert('Abriendo creador de aplicaciones...');
      // window.location.href = '../create/';
    });
  }

  const templateBtns = document.querySelectorAll('.template-btn');
  templateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const templateName = e.target.closest('.template-item').querySelector('.template-name').textContent;
      alert(`Creando app con plantilla: ${templateName}`);
      // window.location.href = `../create/?template=${templateName}`;
    });
  });

  // Menu logout: navegar a agent.html al hacer clic
  const menuLogout = document.getElementById('menuLogout');
  if (menuLogout) {
    menuLogout.addEventListener('click', () => {
      window.location.href = '../agent.html';
    });
  }
});
