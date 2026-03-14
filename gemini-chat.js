/**
 * Gemini Chat Integration
 * Maneja la interfaz de chat y comunicación con la API de Gemini
 */

class GeminiChat {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.isLoading = false;
    this.chatContainer = null;
    this.init();
  }

  init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupChat());
    } else {
      this.setupChat();
    }
  }

  setupChat() {
    // Crear el chat UI si no existe
    this.createChatUI();
    this.attachEventListeners();
  }

  createChatUI() {
    // Verificar si el chat ya existe
    if (document.getElementById('gemini-chat-container')) {
      return;
    }

    // Crear el HTML del chat
    const chatHTML = `
      <div id="gemini-chat-container" class="gemini-chat-container">
        <!-- Botón flotante para abrir/cerrar chat -->
        <div id="gemini-chat-toggle" class="gemini-chat-toggle" title="Chat IA">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span class="chat-badge" id="chat-badge" style="display: none;">1</span>
        </div>

        <!-- Ventana del chat -->
        <div id="gemini-chat-window" class="gemini-chat-window" style="display: none;">
          <!-- Header -->
          <div class="gemini-chat-header">
            <div class="gemini-chat-header-title">
              <h3>Asistente IA</h3>
              <p>Powered by Gemini 3.1 Flash Lite</p>
            </div>
            <button id="gemini-chat-close" class="gemini-chat-close" title="Cerrar chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Mensajes -->
          <div id="gemini-chat-messages" class="gemini-chat-messages">
            <div class="gemini-chat-message bot-message">
              <div class="message-content">
                <p>¡Hola! Soy tu asistente IA. Puedo ayudarte a crear aplicaciones web increíbles.</p>
                <p style="margin-top: 8px; font-size: 12px; opacity: 0.8;">💡 Escribe <strong>/PROGRAMAR</strong> seguido de tu idea para comenzar a crear una app.</p>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="gemini-chat-footer">
            <form id="gemini-chat-form" class="gemini-chat-input-form">
              <input 
                type="text" 
                id="gemini-chat-input" 
                class="gemini-chat-input" 
                placeholder="Describe tu idea... o escribe /PROGRAMAR"
                autocomplete="off"
              />
              <button type="submit" class="gemini-chat-send-btn" title="Enviar mensaje">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>
        .gemini-chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          z-index: 9999;
        }

        .gemini-chat-toggle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          color: white;
          transition: all 0.3s ease;
          position: relative;
        }

        .gemini-chat-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }

        .chat-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .gemini-chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          max-width: 90vw;
          height: 500px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gemini-chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .gemini-chat-header-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .gemini-chat-header-title p {
          margin: 4px 0 0 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .gemini-chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        .gemini-chat-close:hover {
          opacity: 0.7;
        }

        .gemini-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gemini-chat-message {
          display: flex;
          margin-bottom: 8px;
        }

        .bot-message .message-content {
          background: white;
          padding: 10px 12px;
          border-radius: 8px;
          border-left: 3px solid #667eea;
          max-width: 85%;
        }

        .user-message {
          justify-content: flex-end;
        }

        .user-message .message-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 12px;
          border-radius: 8px;
          max-width: 85%;
        }

        .message-content {
          font-size: 13px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-content p {
          margin: 0;
          line-height: 1.4;
        }

        .message-content p:not(:last-child) {
          margin-bottom: 6px;
        }

        .loading-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
        }

        .loading-dot {
          width: 6px;
          height: 6px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }

        .gemini-chat-footer {
          padding: 12px;
          background: white;
          border-radius: 0 0 12px 12px;
          border-top: 1px solid #e0e0e0;
        }

        .gemini-chat-input-form {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .gemini-chat-input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }

        .gemini-chat-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .gemini-chat-send-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .gemini-chat-send-btn:hover {
          transform: scale(1.05);
        }

        .gemini-chat-send-btn:active {
          transform: scale(0.95);
        }

        .gemini-chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Scrollbar personalizado */
        .gemini-chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .gemini-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .gemini-chat-messages::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }

        .gemini-chat-messages::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .gemini-chat-container {
            bottom: 10px;
            right: 10px;
          }

          .gemini-chat-window {
            width: calc(100vw - 20px);
            height: 60vh;
            max-width: none;
            bottom: 70px;
          }
        }
      </style>
    `;

    // Insertar el HTML al body
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    this.chatContainer = document.getElementById('gemini-chat-container');
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('gemini-chat-toggle');
    const closeBtn = document.getElementById('gemini-chat-close');
    const chatWindow = document.getElementById('gemini-chat-window');
    const form = document.getElementById('gemini-chat-form');
    const input = document.getElementById('gemini-chat-input');
    const startChatBtn = document.getElementById('startChatBtn');

    // Abrir/cerrar chat
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        if (chatWindow) {
          chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.isOpen = false;
        if (chatWindow) {
          chatWindow.style.display = 'none';
        }
      });
    }

    // Enviar mensaje
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message && !this.isLoading) {
          this.sendMessage(message);
          input.value = '';
          input.focus();
        }
      });
    }

    // Abrir chat cuando se presiona "Iniciar chat"
    if (startChatBtn) {
      startChatBtn.addEventListener('click', () => {
        this.isOpen = true;
        if (chatWindow) {
          chatWindow.style.display = 'flex';
        }
        if (input) {
          setTimeout(() => input.focus(), 100);
        }
      });
    }

    // También abrir chat con click en el input de búsqueda
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
      searchBox.addEventListener('focus', () => {
        if (!this.isOpen) {
          this.isOpen = true;
          if (chatWindow) {
            chatWindow.style.display = 'flex';
          }
        }
      });
    }
  }

  async sendMessage(message) {
    const messagesContainer = document.getElementById('gemini-chat-messages');
    const input = document.getElementById('gemini-chat-input');
    const sendBtn = document.querySelector('.gemini-chat-send-btn');

    // Mostrar mensaje del usuario
    this.addMessageToUI(message, 'user');
    
    // Agregar al historial
    this.conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Deshabilitar input mientras se obtiene respuesta
    this.isLoading = true;
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;

    // Mostrar indicador de carga
    const loadingId = 'loading-' + Date.now();
    this.addLoadingIndicator(loadingId);

    try {
      // Verificar si el mensaje contiene /PROGRAMAR
      if (message.includes('/PROGRAMAR')) {
        // Procesar comando /PROGRAMAR
        await this.handleProgramarCommand(message);
      } else {
        // Enviar mensaje a la API de Gemini
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            conversationHistory: this.conversationHistory.slice(0, -1), // Enviar historial sin el último mensaje
          }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Agregar respuesta al historial
        this.conversationHistory.push({
          role: 'assistant',
          content: data.reply,
        });

        // Mostrar respuesta
        this.removeLoadingIndicator(loadingId);
        this.addMessageToUI(data.reply, 'bot');
      }
    } catch (error) {
      console.error('Error:', error);
      this.removeLoadingIndicator(loadingId);
      this.addMessageToUI(
        `Lo siento, ocurrió un error: ${error.message}. Por favor, intenta de nuevo.`,
        'bot'
      );
    } finally {
      this.isLoading = false;
      if (input) input.disabled = false;
      if (sendBtn) sendBtn.disabled = false;

      // Scroll al último mensaje
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }

  async handleProgramarCommand(message) {
    const messagesContainer = document.getElementById('gemini-chat-messages');
    
    // Extraer la descripción de la app
    const appDescription = message.replace('/PROGRAMAR', '').trim();

    if (!appDescription) {
      this.removeLoadingIndicator('loading-' + (Date.now() - 100));
      this.addMessageToUI(
        '📝 Por favor, describe tu idea de aplicación después de /PROGRAMAR.\n\nEjemplo: /PROGRAMAR un blog con comentarios',
        'bot'
      );
      return;
    }

    // Confirmar que se va a crear la app
    this.removeLoadingIndicator('loading-' + (Date.now() - 100));
    this.addMessageToUI(
      `✨ Entendido! Voy a ayudarte a crear una aplicación:\n\n"${appDescription}"\n\nRedirigiendo al creador de apps...`,
      'bot'
    );

    // Guardar la descripción en localStorage
    localStorage.setItem('devcenter_app_idea', appDescription);
    localStorage.setItem('devcenter_app_creation_time', new Date().toISOString());

    // Agregar al historial
    this.conversationHistory.push({
      role: 'assistant',
      content: `Entendí tu idea: "${appDescription}". Voy a redirigirte al creador de apps.`,
    });

    // Redirigir a la página de crear app después de 2 segundos
    setTimeout(() => {
      window.location.href = '/Programar/crear-app?idea=' + encodeURIComponent(appDescription);
    }, 2000);
  }

  addMessageToUI(message, role) {
    const messagesContainer = document.getElementById('gemini-chat-messages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `gemini-chat-message ${role === 'user' ? 'user-message' : 'bot-message'}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Convertir markdown básico a HTML
    let htmlContent = message
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    contentDiv.innerHTML = htmlContent;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);

    // Scroll automático
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addLoadingIndicator(id) {
    const messagesContainer = document.getElementById('gemini-chat-messages');
    if (!messagesContainer) return;

    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.className = 'gemini-chat-message bot-message';
    loadingDiv.innerHTML = `
      <div class="loading-indicator">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;

    messagesContainer.appendChild(loadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeLoadingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  }
}

// Inicializar el chat cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.geminiChat = new GeminiChat();
  });
} else {
  window.geminiChat = new GeminiChat();
}
