// ============================================
// LANDING PAGE JAVASCRIPT
// ============================================

// Prompt Data for Animation
const promptData = [
  {
    app: 'una app',
    audience: 'dueños de mascotas',
    feature: 'planificar comidas y generar',
    feature2: 'listas de compras basadas en preferencias',
    feature3: 'alimenticias'
  },
  {
    app: 'una plataforma',
    audience: 'estudiantes universitarios',
    feature: 'crear cronogramas de estudio y',
    feature2: 'organizar tareas por materia con',
    feature3: 'recordatorios automáticos'
  },
  {
    app: 'un dashboard',
    audience: 'emprendedores',
    feature: 'monitorear ventas, gastos e',
    feature2: 'inventario en tiempo real con',
    feature3: 'reportes analíticos'
  },
  {
    app: 'una aplicación',
    audience: 'equipos remotos',
    feature: 'gestionar proyectos, asignar tareas y',
    feature2: 'colaborar en documentos con',
    feature3: 'integración de video llamadas'
  }
];

let currentPromptIndex = 0;
let animationTimeout;

// ============================================
// PROMPT ANIMATION
// ============================================
function updatePrompt() {
  const data = promptData[currentPromptIndex];
  
  const promptApp = document.getElementById('promptApp');
  const promptAudience = document.getElementById('promptAudience');
  const promptFeature = document.getElementById('promptFeature');
  const promptFeature2 = document.getElementById('promptFeature2');
  const promptFeature3 = document.getElementById('promptFeature3');
  
  if (promptApp) promptApp.textContent = data.app;
  if (promptAudience) promptAudience.textContent = data.audience;
  if (promptFeature) promptFeature.textContent = data.feature;
  if (promptFeature2) promptFeature2.textContent = data.feature2;
  if (promptFeature3) promptFeature3.textContent = data.feature3;
  
  currentPromptIndex = (currentPromptIndex + 1) % promptData.length;
}

// Initialize prompt animation
function initPromptAnimation() {
  updatePrompt();
  animationTimeout = setInterval(updatePrompt, 8000);
}

// ============================================
// TAB FUNCTIONALITY
// ============================================
function initPromptTabs() {
  const tabs = document.querySelectorAll('.prompt-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
    });
  });
  
  // Set first tab as active
  if (tabs.length > 0) {
    tabs[0].classList.add('active');
  }
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.landing-nav');
  
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      if (nav) {
        nav.classList.toggle('show-mobile-menu');
      }
    });
  }
}

// Close mobile menu on nav link click
function closeMobileMenuOnNavigation() {
  const navLinks = document.querySelectorAll('.landing-nav a');
  const nav = document.querySelector('.landing-nav');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (nav) {
        nav.classList.remove('show-mobile-menu');
      }
    });
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ============================================
// BUTTON ROUTING
// ============================================
function initButtonRouting() {
  // Buttons are configured with href attributes in HTML
  // "/login" for login button
  // "/create" for signup and CTA buttons
  // No additional JS needed - standard anchor behavior
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initPromptAnimation();
  initPromptTabs();
  initMobileMenu();
  closeMobileMenuOnNavigation();
  initSmoothScroll();
  initButtonRouting();
});

// ============================================
// CLEANUP
// ============================================
window.addEventListener('beforeunload', function() {
  clearInterval(animationTimeout);
});
