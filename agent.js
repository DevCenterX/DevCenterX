    document.addEventListener('DOMContentLoaded', () => {

      // 1. GENERADOR DE PARTÍCULAS HOLOGRÁFICAS EN EL HERO
      const particlesContainer = document.getElementById('particles-container');
      const symbols = ['</>', '{}', '[]', '#', ';', '()', '=>'];
      const isMobile = window.innerWidth <= 768;
      const numParticles = isMobile ? 12 : 25;

      for (let i = 0; i < numParticles; i++) {
        const symbol = document.createElement('div');
        symbol.classList.add('hero-symbol');
        symbol.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        const leftPos = Math.random() * 100;
        const duration = 10 + Math.random() * 20;
        const delay = Math.random() * 15;
        const size = 0.8 + Math.random() * 2;

        symbol.style.left = `${leftPos}%`;
        symbol.style.animationDuration = `${duration}s`;
        symbol.style.animationDelay = `-${delay}s`;
        symbol.style.fontSize = `${size}rem`;
        
        particlesContainer.appendChild(symbol);
      }

      // 2. Datos para Sugerencias (Typewriter)
      const datosModos = {
        programar: {
          sugerencias: [
            "Crear una landing page moderna en HTML, CSS y JS...",
            "Desarrollar un panel de control estilo SaaS...",
            "Crear un portafolio personal animado...",
            "Programar un clon de interfaz de Twitter..."
          ],
          docTitulo: "Generación Web Completa",
          docDesc: "Genera páginas web estructuradas con HTML, interactividad en script.js y diseño en style.css. Te da la posibilidad de publicarlo instantáneamente y obtener una URL funcional.",
          docIcono: "fa-laptop-code"
        },
        chat: {
          sugerencias: [
            "¿Cómo optimizar mi código JavaScript para SEO?",
            "Explícame la arquitectura de microservicios...",
            "Muéstrame un ejemplo de conexión a base de datos...",
            "Analiza este bloque de código y encuentra el error..."
          ],
          docTitulo: "Asistencia Técnica Inteligente",
          docDesc: "Asistente con amplio conocimiento. Puede resolver dudas complejas sobre servidores y también programar en tiempo real para mostrarte ejemplos y soluciones visuales.",
          docIcono: "fa-comments-dollar"
        },
        docs: {
          sugerencias: [
            "Generar un reporte financiero anual en Excel...",
            "Crear una presentación de ventas de 10 diapositivas...",
            "Redactar un contrato de prestación de servicios en Word...",
            "Hacer una plantilla de presupuesto de marketing..."
          ],
          docTitulo: "Generador de Documentación",
          docDesc: "Este modo te puede generar archivos Excel bien estructurados, documentos de Word con información precisa y presentaciones de PowerPoint bien decoradas y listas para usar.",
          docIcono: "fa-file-signature"
        }
      };

      const pestanas = document.querySelectorAll('.prompt-tab');
      const elementoTexto = document.getElementById('texto-maquina');
      const docTitulo = document.getElementById('titulo-doc');
      const docDesc = document.getElementById('descripcion-doc');
      const docIcono = document.getElementById('icono-doc');
      const docContenedor = document.querySelector('.docs-rapida-container');
      
      let categoriaActual = 'programar';
      let indiceSugerencia = 0;
      let indiceCaracter = 0;
      let borrando = false;
      let temporizadorEscritura;
      let pausado = false;

      elementoTexto.textContent = "";

      function efectoEscribir() {
        const sugerenciasActuales = datosModos[categoriaActual].sugerencias;
        const textoCompleto = sugerenciasActuales[indiceSugerencia];
        
        if (pausado) return;

        if (borrando) {
          elementoTexto.textContent = textoCompleto.substring(0, indiceCaracter - 1);
          indiceCaracter--;
        } else {
          elementoTexto.textContent = textoCompleto.substring(0, indiceCaracter + 1);
          indiceCaracter++;
        }

        let velocidad = borrando ? 20 : 45; 

        if (!borrando && indiceCaracter === textoCompleto.length) {
          velocidad = 2500; 
          borrando = true;
        } else if (borrando && indiceCaracter === 0) {
          borrando = false;
          indiceSugerencia = (indiceSugerencia + 1) % sugerenciasActuales.length;
          velocidad = 500;
        }

        temporizadorEscritura = setTimeout(efectoEscribir, velocidad);
      }

      temporizadorEscritura = setTimeout(efectoEscribir, 500);

      pestanas.forEach(pestana => {
        pestana.addEventListener('click', (e) => {
          pestanas.forEach(p => p.classList.remove('active'));
          const pestanaSeleccionada = e.currentTarget;
          pestanaSeleccionada.classList.add('active');
          
          const nuevaCategoria = pestanaSeleccionada.getAttribute('data-tab');
          
          if (categoriaActual !== nuevaCategoria) {
            categoriaActual = nuevaCategoria;
            
            docContenedor.style.opacity = 0;
            docContenedor.style.transform = "translateY(10px)";
            
            setTimeout(() => {
              docTitulo.innerHTML = `${datosModos[categoriaActual].docTitulo} <i class="fa-solid fa-circle-check"></i>`;
              docDesc.textContent = datosModos[categoriaActual].docDesc;
              docIcono.className = `fa-solid ${datosModos[categoriaActual].docIcono}`;
              
              docContenedor.style.opacity = 1;
              docContenedor.style.transform = "translateY(0)";
            }, 300);

            clearTimeout(temporizadorEscritura);
            indiceSugerencia = 0;
            indiceCaracter = 0;
            borrando = false;
            elementoTexto.textContent = "";
            
            pausado = true;
            setTimeout(() => {
              pausado = false;
              efectoEscribir();
            }, 400);
          }
        });
      });

      // 3. Lógica Acordeón FAQ
      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
          const isOpen = item.classList.contains('active');
          
          faqItems.forEach(faq => {
            faq.classList.remove('active');
            faq.querySelector('.faq-answer').style.maxHeight = null;
          });

          if (!isOpen) {
            item.classList.add('active');
            const answer = item.querySelector('.faq-answer');
            answer.style.maxHeight = answer.scrollHeight + "px";
          }
        });
      });

      // 4. INTERSECTION OBSERVER PARA ANIMACIÓN DE FLUJO (SCROLL)
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      };

      const flowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('flow-visible');
            flowObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Asignar elementos simples
      document.querySelectorAll('.badge-pill, .landing-hero-title, .landing-hero-subtitle, .landing-prompt-container').forEach(el => flowObserver.observe(el));
      document.querySelectorAll('.section-title, .section-subtitle').forEach(el => flowObserver.observe(el));

      // Asignar retraso escalonado (staggered delay) para cuadrículas
      document.querySelectorAll('.features-grid .feature-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.15}s`;
        flowObserver.observe(el);
      });

      document.querySelectorAll('.benefits-flex .benefit-item').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.15}s`;
        flowObserver.observe(el);
      });

      document.querySelectorAll('.faq-container .faq-item').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        flowObserver.observe(el);
      });

      const extraElements = document.querySelectorAll('.tech-grid-wrapper, .orbit-wrapper, .cta-content-wrapper');
      extraElements.forEach(el => flowObserver.observe(el));

    });
