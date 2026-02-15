// ==================== MENU & NAVIGATION ====================
// Funciones del menú home y navegación principal

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('mainSidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarCollapsedControls = document.getElementById('sidebarCollapsedControls');
  const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
  const searchBtn = document.querySelector('.search-btn');
  const optionsBtn = document.getElementById('optionsBtn');
  const optionsMenu = document.getElementById('optionsMenu');

  // ==================== SIDEBAR FUNCTIONS ====================
  // Función para cerrar el sidebar
  function closeSidebar() {
    if (sidebar) sidebar.classList.add('sidebar-hidden');
    if (mainContent) mainContent.classList.add('sidebar-hidden');
    if (sidebarCollapsedControls) sidebarCollapsedControls.style.display = 'flex';
  }

  // Función para abrir el sidebar
  function openSidebar() {
    if (sidebar) sidebar.classList.remove('sidebar-hidden');
    if (mainContent) mainContent.classList.remove('sidebar-hidden');
    if (sidebarCollapsedControls) sidebarCollapsedControls.style.display = 'none';
    if (optionsMenu) optionsMenu.classList.remove('active');
  }

  // Cerrar sidebar por defecto en móvil
  if (window.innerWidth <= 768) {
    closeSidebar();
  }

  // Botón de búsqueda (cierra el sidebar)
  if (searchBtn) {
    searchBtn.addEventListener('click', closeSidebar);
  }

  // Botón para abrir el sidebar
  if (sidebarOpenBtn) {
    sidebarOpenBtn.addEventListener('click', openSidebar);
  }

  // Botón de opciones - redirige a account
  if (optionsBtn) {
    optionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/account';
    });
  }

  // ==================== OPTIONS MENU ITEMS ====================
  const optionsMenuAccount = document.getElementById('optionsMenuAccount');
  const optionsMenuHelp = document.getElementById('optionsMenuHelp');
  const optionsMenuLogout = document.getElementById('optionsMenuLogout');
  const optionsThemeIcons = document.querySelectorAll('#optionsMenu .theme-icon');

  // Account item en options menu
  if (optionsMenuAccount) {
    optionsMenuAccount.addEventListener('click', () => {
      window.location.href = '/account';
      if (optionsMenu) optionsMenu.classList.remove('active');
    });
  }

  // Help item en options menu
  if (optionsMenuHelp) {
    optionsMenuHelp.addEventListener('click', () => {
      window.open('https://github.com/DevCenterX-Agent/docs', '_blank');
      if (optionsMenu) optionsMenu.classList.remove('active');
    });
  }

  // Logout item en options menu
  if (optionsMenuLogout) {
    optionsMenuLogout.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        performLogout();
      }
      if (optionsMenu) optionsMenu.classList.remove('active');
    });
  }

  // Cambiar tema (menú de opciones)
  // Funciones para manejar tema y persistencia
  function saveTheme(t) {
    try { localStorage.setItem('devcenter_theme', JSON.stringify(t)); } catch(e) {}
  }
  function loadTheme() {
    try { const v = localStorage.getItem('devcenter_theme'); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  }
  function applyTheme(theme) {
    document.body.classList.remove('dark-theme','light-theme');
    if (theme === 'dark') document.body.classList.add('dark-theme');
    if (theme === 'light') document.body.classList.add('light-theme');
    // marcar iconos activos
    optionsThemeIcons.forEach(ic => ic.classList.toggle('active', ic.dataset.theme === theme));
    document.querySelectorAll('.theme-icon').forEach(ic => ic.classList.toggle('active', ic.dataset.theme === theme));
  }

  // aplicar tema guardado al inicio
  const currentSavedTheme = loadTheme();
  if (currentSavedTheme) applyTheme(currentSavedTheme);

  optionsThemeIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = icon.dataset.theme;
      applyTheme(theme);
      saveTheme(theme);
    });
  });

  // ==================== LOGO MENU ====================
  const logoBtn = document.getElementById('logoBtn');
  const logoMenu = document.getElementById('logoMenu');
  
  if (logoBtn && logoMenu) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      logoMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!logoMenu.contains(e.target) && e.target !== logoBtn && !logoBtn.contains(e.target)) {
        logoMenu.classList.remove('active');
      }
    });
  }

  // ==================== LOGO MENU ITEMS ====================
  const menuAccount = document.getElementById('menuAccount');
  const menuHelp = document.getElementById('menuHelp');
  const menuLogout = document.getElementById('menuLogout');
  const themeIcons = document.querySelectorAll('.theme-icon');

  // Account item
  if (menuAccount) {
    menuAccount.addEventListener('click', () => {
      window.location.href = '/account';
      if (logoMenu) logoMenu.classList.remove('active');
    });
    
    // Actualizar el texto del botón Account
    const accountTextElement = document.getElementById('accountText');
    if (accountTextElement) {
      const currentUser = localStorage.getItem('devcenter_user');
      if (currentUser) {
        accountTextElement.textContent = currentUser;
      }
    }
  }

  // Help item
  if (menuHelp) {
    menuHelp.addEventListener('click', () => {
      window.open('https://github.com/DevCenterX-Agent/docs', '_blank');
      if (logoMenu) logoMenu.classList.remove('active');
    });
  }

  // Logout item
  if (menuLogout) {
    menuLogout.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        performLogout();
      }
      if (logoMenu) logoMenu.classList.remove('active');
    });
  }

  // Logout helper to keep behavior consistent
  function performLogout() {
    try {
      const keys = [
        'devcenter_user_id','devcenter_isLoggedIn','devcenter_user','devcenter_user_name',
        'devcenter_email','devcenter_avatar','devcenter_plan','devcenter_limit',
        'devcenter_login_time','devcenter_datos','devcenter_session','supabase_nombrepersona'
      ];
      keys.forEach(k => localStorage.removeItem(k));
      console.log('✅ Sesión cerrada (localStorage limpiado)');
    } catch (e) {
      console.warn('Error al limpiar sesión:', e);
    }
    window.location.href = '/agent.html';
  }

  // Theme icons
  themeIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = icon.dataset.theme;
      // Aplicar y guardar tema para todos los iconos (consistente con optionsThemeIcons)
      try {
        applyTheme(theme);
        saveTheme(theme);
      } catch (err) {
        console.warn('No se pudo aplicar el tema:', err);
      }
    });
  });
});

// NOTE: Section navigation handled by separate pages; do not intercept nav links to allow folder redirection.

// ==================== CREATE APP BUTTON ====================
// Botón principal "Create App" del sidebar
document.addEventListener('DOMContentLoaded', () => {
  const mainCreateBtn = document.getElementById('mainCreateBtn');
  if (mainCreateBtn) {
    mainCreateBtn.addEventListener('click', () => {
      window.location.href = '/Programar/crear-app';
    });
  }

  // Cargar nombre de usuario desde Firestore y actualizar greeting
  async function loadUserAndUpdateGreeting() {
    try {
      const isLoggedIn = localStorage.getItem('devcenter_isLoggedIn');
      const uid = localStorage.getItem('devcenter_user_id');
      
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
        // Set persistence to local to validate session
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
      const username = (userData.username && userData.username.trim().length > 0) 
        ? userData.username 
        : (userData.email && userData.email.trim().length > 0 ? userData.email : 'Usuario');
      
      const plan = (userData.plan && userData.plan.trim().length > 0) 
        ? userData.plan 
        : 'Gratis';

      // Guardar nombre del usuario en localStorage
      localStorage.setItem('devcenter_user_name', username);

      // Actualizar greeting con el nombre del usuario
      const greetingText = document.getElementById('greetingText');
      if (greetingText) {
        const greetings = [
          `${username}, ¿creamos algo hoy?`,
          `¿Listo ${username}? Vamos a crear`,
          `${username}, ¿qué haremos?`,
          `¡Bienvenido ${username}! ¿Qué construimos?`,
          `${username}, es hora de crear`,
          `¿Qué le parece ${username}? Empecemos`,
          `${username}, ¡creemos juntos!`
        ];
        
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        const usernameSpan = document.getElementById('usernameSpan');
        if (usernameSpan) {
          usernameSpan.textContent = username;
        }
        greetingText.textContent = randomGreeting;
      }

      // Cargar proyectos para actualizar sidebar con datos
      try {
        const proyectosRef = doc(db, 'proyectos', uid);
        const proyectosSnap = await getDoc(proyectosRef);
        let createdCount = 0;
        if (proyectosSnap.exists()) {
          const pData = proyectosSnap.data();
          if (Array.isArray(pData.proyectos)) createdCount = pData.proyectos.length;
        }

        function normalizePlan(p) {
          const s = (p || '').toString().toLowerCase();
          if (s.includes('pro')) return 'Pro';
          if (s.includes('premium')) return 'Premium';
          return 'Normal';
        }

        const planKey = normalizePlan(plan);
        const limits = { 'Normal': 10, 'Premium': 15, 'Pro': 30 };
        const planLimits = limits[planKey] || 10;

        // Actualizar sidebar
        const planTitleEl = document.getElementById('userPlanTitle');
        const appsCountEl = document.getElementById('userAppsCount');
        const usageEl = document.getElementById('userAgentUsage');
        const upgradeBtn = document.getElementById('upgradeAgentBtn');

        if (planTitleEl) {
          if (planKey === 'Normal') planTitleEl.textContent = (plan && /starter/i.test(plan)) ? 'Plan Inicial' : `Plan ${plan || 'Normal'}`;
          else planTitleEl.textContent = `Plan ${plan}`;
        }

        if (appsCountEl) appsCountEl.textContent = `${createdCount}/${planLimits} creadas`;

        if (usageEl) {
          let percent = 0;
          if (planLimits > 0) percent = Math.round((createdCount / planLimits) * 100);
          if (percent > 100) percent = 100;
          usageEl.textContent = `${percent}% usado`;
        }

        if (upgradeBtn) {
          // Normalizar estado
          upgradeBtn.classList.remove('small', 'hidden');
          upgradeBtn.style.display = '';

          if (planKey === 'Pro') {
            // Ocultar completamente para usuarios Pro
            upgradeBtn.classList.add('hidden');
            upgradeBtn.style.display = 'none';
          } else if (planKey === 'Premium') {
            // Mostrar versión compacta para Premium
            upgradeBtn.classList.add('small');
            upgradeBtn.style.display = '';
            upgradeBtn.innerHTML = '<span>+</span> Mejorar';
          } else {
            // Normal/Starter
            upgradeBtn.classList.remove('small', 'hidden');
            upgradeBtn.style.display = '';
            upgradeBtn.innerHTML = '<span>+</span> Mejorar Agente';
          }
        }

        try {
          document.body.classList.remove('plan-normal', 'plan-premium', 'plan-pro');
          if (planKey === 'Pro') document.body.classList.add('plan-pro');
          else if (planKey === 'Premium') document.body.classList.add('plan-premium');
          else document.body.classList.add('plan-normal');
        } catch (e) {
          // ignore
        }

      } catch (e) {
        console.warn('No se pudo cargar datos de proyectos:', e);
      }

      console.log('✅ Usuario y proyectos cargados');

    } catch (e) {
      console.error('❌ Error cargando usuario:', e.message);
    }
  }

  loadUserAndUpdateGreeting();
});

// ==================== RESPONSIVE RESIZE ====================
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('mainSidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarCollapsedControls = document.getElementById('sidebarCollapsedControls');
  
  if (window.innerWidth > 768) {
    if (sidebar) sidebar.classList.remove('sidebar-hidden');
    if (mainContent) mainContent.classList.remove('sidebar-hidden');
    if (sidebarCollapsedControls) sidebarCollapsedControls.style.display = 'none';
  }
});

console.log('✅ Menu functions loaded');
