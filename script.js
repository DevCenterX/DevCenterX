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
  `${username}, ¡creemos juntos!`,
  `${username}, manos a la obra`,
  `¿Qué sigue, ${username}?`,
  `¡A darle, ${username}!`,
  `${username}, ¿qué sigue en la lista?`,
  `¡Hola ${username}! A diseñar`,
  `${username}, materializa tu idea`,
  `¿Inspirado, ${username}?`,
  `${username}, hagamos magia`,
  `¡Dale, ${username}! Empieza ahora`,
  `${username}, el lienzo es tuyo`
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
          // Guardar el tema actual antes de agregar clases de plan
          const currentTheme = loadTheme() || 'dark';
          
          document.body.classList.remove('plan-normal', 'plan-premium', 'plan-pro');
          if (planKey === 'Pro') document.body.classList.add('plan-pro');
          else if (planKey === 'Premium') document.body.classList.add('plan-premium');
          else document.body.classList.add('plan-normal');
          
          // Re-aplicar el tema después de agregar las clases de plan para asegurar que se mantiene
          applyTheme(currentTheme);
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

// ==================== GEMINI CHAT INTEGRATION ====================
// Integración con Gemini 1.5 Flash para el input de búsqueda

document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.getElementById('searchBox');
  const startChatBtn = document.getElementById('startChatBtn');
  
  if (!searchBox || !startChatBtn) {
    console.log('⚠️ Chat elements not found');
    return;
  }

  console.log('✅ Gemini chat elements loaded');

  // Enviar mensaje al presionar Enter o pulsar el botón
  const sendMessage = async () => {
    const message = searchBox.value.trim();
    
    if (!message) {
      console.log('⚠️ Empty message');
      return;
    }

    console.log('📤 Sending message:', message.substring(0, 50) + '...');

    // Limpiar el input
    searchBox.value = '';

    // Verificar si es el comando /PROGRAMAR
    if (message.startsWith('/PROGRAMAR')) {
      const appIdea = message.replace('/PROGRAMAR', '').trim();
      
      if (!appIdea) {
        console.warn('❌ /PROGRAMAR command but no idea provided');
        alert('Por favor, describe tu idea después de /PROGRAMAR\n\nEjemplo: /PROGRAMAR un blog con comentarios');
        return;
      }

      console.log('✨ Creating app with idea:', appIdea);

      // Guardar la idea en localStorage
      localStorage.setItem('devcenter_app_idea', appIdea);
      localStorage.setItem('devcenter_app_creation_time', new Date().toISOString());

      // Redirigir a crear app
      window.location.href = '/Programar/crear-app?idea=' + encodeURIComponent(appIdea);
      return;
    }

    // Para mensajes normales, hacer una solicitud a Gemini
    let originalText = ''; // Declarar fuera del try
    
    try {
      startChatBtn.disabled = true;
      originalText = startChatBtn.innerHTML;
      
      // Mostrar barra de progreso épica
      showEpicProgressBar();

      console.log('📡 Contacting /api/gemini...');

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: [],
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        closeProgressBar();
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('📦 Response data:', data);

      if (data.error) {
        closeProgressBar();
        throw new Error(data.error);
      }

      if (!data.reply) {
        closeProgressBar();
        throw new Error('Sin respuesta de Gemini');
      }

      console.log('✅ Got response:\n', data.reply);
      
      // Detectar y procesar código en la respuesta
      const codeBlocks = detectCodeBlocks(data.reply);
      
      if (codeBlocks.html) {
        // Hay código - guardar y redirigir
        console.log('✨ Código HTML detectado, guardando...');
        saveAndOpenCode(codeBlocks);
        // La redirección ocurre en saveAndOpenCode
      } else {
        closeProgressBar();
        alert('⚠️ No se detectó código HTML en la respuesta.\n\nIntenta ser más específico.');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.error('Stack:', error);
      alert('❌ Error: ' + error.message + '\n\nRevisa la consola (F12) para más detalles.');
    } finally {
      startChatBtn.disabled = false;
      if (originalText) startChatBtn.innerHTML = originalText;
      searchBox.focus();
    }
  };

  // Función para mostrar barra de progreso épica
  function showEpicProgressBar() {
    const progressHTML = `
      <div id="epicProgress" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      ">
        <div style="text-align: center;">
          <h1 style="
            color: white;
            font-size: 48px;
            margin: 0 0 30px 0;
            animation: pulse 2s infinite;
          ">✨ Generando tu código...</h1>
          
          <div style="
            width: 300px;
            height: 8px;
            background: rgba(255,255,255,0.3);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 30px;
          ">
            <div id="progressBar" style="
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #4CAF50, #45a049, #4CAF50);
              background-size: 200% 200%;
              animation: moveGradient 2s infinite, fillProgress 8s ease-in-out forwards;
            "></div>
          </div>

          <p style="
            color: white;
            font-size: 18px;
            margin: 0;
            animation: fadeInOut 3s infinite;
          ">Espera mientras la IA crea magia... 🚀</p>
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          
          @keyframes fillProgress {
            0% { width: 0%; }
            90% { width: 90%; }
            100% { width: 100%; }
          }
          
          @keyframes moveGradient {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
          
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
        </style>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', progressHTML);
  }

  // Función para cerrar la barra de progreso
  function closeProgressBar() {
    const progress = document.getElementById('epicProgress');
    if (progress) {
      progress.style.animation = 'fadeOut 0.5s ease forwards';
      setTimeout(() => progress.remove(), 500);
    }
  }

  // Función para detectar bloques de código
  function detectCodeBlocks(text) {
    const codeBlocks = {
      html: '',
      css: '',
      javascript: ''
    };

    // Detectar HTML
    const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
    if (htmlMatch) codeBlocks.html = htmlMatch[1].trim();

    // Detectar CSS
    const cssMatch = text.match(/```css\n([\s\S]*?)\n```/);
    if (cssMatch) codeBlocks.css = cssMatch[1].trim();

    // Detectar JavaScript
    const jsMatch = text.match(/```(?:javascript|js)\n([\s\S]*?)\n```/);
    if (jsMatch) codeBlocks.javascript = jsMatch[1].trim();

    return codeBlocks;
  }

  // Función para mostrar modal con código
  function showCodeModal(codeBlocks, fullResponse) {
    // Crear HTML del modal
    const modalHTML = `
      <div id="codeModal" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
          <h2 style="margin-top: 0; color: #333;">Código generado</h2>
          
          <div style="margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; max-height: 200px; overflow-y: auto;">
            <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;">${fullResponse}</p>
          </div>

          <div style="display: flex; gap: 12px;">
            <button id="usecodeBtn" style="
              flex: 1;
              padding: 10px 16px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            ">Usar en Programar</button>
            
            <button id="closeModalBtn" style="
              flex: 1;
              padding: 10px 16px;
              background: #ddd;
              color: #333;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
            ">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    // Insertar modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Event listeners
    document.getElementById('usecodeBtn').addEventListener('click', () => {
      saveAndOpenCode(codeBlocks);
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.getElementById('codeModal').remove();
    });

    // Cerrar al hacer clic fuera del modal
    document.getElementById('codeModal').addEventListener('click', (e) => {
      if (e.target.id === 'codeModal') {
        document.getElementById('codeModal').remove();
      }
    });
  }

  // Función para guardar código y abrir en Programar
  function saveAndOpenCode(codeBlocks) {
    // Guardar en localStorage
    const codeData = {
      html: codeBlocks.html || '',
      css: codeBlocks.css || '',
      javascript: codeBlocks.javascript || '',
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('devcenter_generated_code', JSON.stringify(codeData));
    console.log('✅ Código guardado correctamente');

    // Esperar un poco y luego redirigir con animación
    setTimeout(() => {
      closeProgressBar();
      
      // Crear animación de transición
      const transitionDiv = document.createElement('div');
      transitionDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 99998;
        animation: slideOut 0.6s ease-in forwards;
      `;
      document.body.appendChild(transitionDiv);

      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideOut {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `;
      document.head.appendChild(style);

      // Redirigir después de la animación
      setTimeout(() => {
        window.location.href = '/Programar?generated=true';
      }, 600);
    }, 500);
  }

  // Click en botón Iniciar chat
  startChatBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
  });

  // Enter en el textarea (pero no Shift+Enter)
  searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  console.log('✅ Gemini chat integration ready');
});
