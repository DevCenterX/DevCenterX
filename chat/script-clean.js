// ======================= DEVCENTRE AGENT =======================
// Chat AI simplificado y limpio con Vercel API

// =============== CONFIGURACIÓN BÁSICA ===============
const APP_NAME = 'DevCenter Agent';
const API_ENDPOINT = '/api/gemini';

let chatHistory = [];
let currentChatId = null;
let allChats = [];
let isGenerating = false;

// =============== ELEMENTOS DEL DOM ===============
const elements = {
    messages: document.getElementById('messages') || document.getElementById('chatMessages'),
    input: document.getElementById('messageInput') || document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    backBtn: document.getElementById('backBtn'),
    sidebar: document.getElementById('sidebarContent') || document.getElementById('chatHistory'),
    menuBtn: document.getElementById('menuBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn')
};

// =============== INICIALIZACIÓN ===============
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadChatsFromStorage();
    loadChatFromURL();
    updateTitle();
});

function setupEventListeners() {
    // Enviar mensaje con Enter
    if (elements.input) {
        elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // Auto-resize textarea
        elements.input.addEventListener('input', () => {
            elements.input.style.height = 'auto';
            elements.input.style.height = Math.min(elements.input.scrollHeight, 150) + 'px';
        });
    }

    // Botones principales
    if (elements.sendBtn) elements.sendBtn.addEventListener('click', handleSendMessage);
    if (elements.newChatBtn) elements.newChatBtn.addEventListener('click', createNewChat);
    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // Sidebar
    if (elements.menuBtn) elements.menuBtn.addEventListener('click', showSidebar);
    if (elements.closeSidebarBtn) elements.closeSidebarBtn.addEventListener('click', hideSidebar);
}

function updateTitle() {
    document.title = APP_NAME;
    const headerTitle = document.querySelector('h1');
    if (headerTitle) headerTitle.textContent = APP_NAME;
}

// =============== GESTIÓN DE CHATS ===============
function loadChatFromURL() {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('id');
    
    if (chatId && allChats.find(c => c.id == chatId)) {
        const chat = allChats.find(c => c.id == chatId);
        currentChatId = allChats.indexOf(chat);
        chatHistory = chat.messages || [];
    } else if (allChats.length === 0) {
        createNewChat();
        return;
    } else {
        currentChatId = 0;
        chatHistory = allChats[0].messages || [];
    }
    
    renderMessages();
    updateChatList();
}

function createNewChat() {
    const newChat = {
        id: Date.now(),
        title: 'Nuevo chat',
        messages: [],
        created: new Date().toISOString()
    };
    
    allChats.push(newChat);
    currentChatId = allChats.length - 1;
    chatHistory = [];
    window.history.pushState({}, '', `/chat?id=${newChat.id}`);
    saveChatsToStorage();
    renderMessages();
    updateChatList();
    if (elements.input) elements.input.focus();
}

function deleteChat(index) {
    if (confirm('¿Eliminar este chat?')) {
        allChats.splice(index, 1);
        if (currentChatId === index) {
            currentChatId = allChats.length > 0 ? 0 : null;
            chatHistory = allChats[currentChatId]?.messages || [];
        }
        saveChatsToStorage();
        updateChatList();
        renderMessages();
        if (allChats.length === 0) createNewChat();
    }
}

// =============== ENVÍO DE MENSAJES ===============
async function handleSendMessage() {
    const message = elements.input?.value.trim();
    if (!message || isGenerating) return;

    // Agregar mensaje del usuario
    chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
    });

    // Actualizar título si es primer mensaje
    if (chatHistory.length === 1) {
        allChats[currentChatId].title = message.substring(0, 40) + (message.length > 40 ? '...' : '');
    }

    allChats[currentChatId].messages = chatHistory;
    saveChatsToStorage();
    
    if (elements.input) {
        elements.input.value = '';
        elements.input.style.height = 'auto';
    }
    
    renderMessages();
    if (elements.sendBtn) elements.sendBtn.disabled = true;
    addTypingIndicator();
    isGenerating = true;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                mode: 'chat',
                conversationHistory: chatHistory.slice(0, -1)
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply || data.response || 'No hubo respuesta';

        removeTypingIndicator();

        chatHistory.push({
            role: 'ai',
            content: reply,
            timestamp: new Date().toISOString()
        });

        allChats[currentChatId].messages = chatHistory;
        saveChatsToStorage();
        renderMessages();
        scrollToBottom();

    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();

        chatHistory.push({
            role: 'ai',
            content: `❌ Error: ${error.message}`,
            timestamp: new Date().toISOString()
        });

        renderMessages();
    } finally {
        isGenerating = false;
        if (elements.sendBtn) elements.sendBtn.disabled = false;
        if (elements.input) elements.input.focus();
    }
}

// =============== RENDERIZADO ===============
function renderMessages() {
    if (!elements.messages) return;

    elements.messages.innerHTML = '';

    chatHistory.forEach((msg, index) => {
        const div = document.createElement('div');
        div.className = `message message-${msg.role}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = msg.content;

        div.appendChild(contentDiv);

        // Acciones para mensajes del usuario
        if (msg.role === 'user') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';

            // Botón copiar
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn';
            copyBtn.textContent = '📋';
            copyBtn.title = 'Copiar';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(msg.content);
                copyBtn.textContent = '✅';
                setTimeout(() => copyBtn.textContent = '📋', 1500);
            };

            // Botón eliminar
            const delBtn = document.createElement('button');
            delBtn.className = 'action-btn';
            delBtn.textContent = '🗑️';
            delBtn.title = 'Eliminar';
            delBtn.onclick = () => {
                if (confirm('¿Eliminar este mensaje?')) {
                    chatHistory.splice(index, 1);
                    allChats[currentChatId].messages = chatHistory;
                    saveChatsToStorage();
                    renderMessages();
                }
            };

            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(delBtn);
            div.appendChild(actionsDiv);
        }

        elements.messages.appendChild(div);
    });

    scrollToBottom();
}

function addTypingIndicator() {
    if (!elements.messages) return;
    const div = document.createElement('div');
    div.className = 'message message-ai typing';
    div.id = 'typing-indicator';
    div.innerHTML = '<div class="message-content"><span>.</span><span>.</span><span>.</span></div>';
    elements.messages.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

function scrollToBottom() {
    if (elements.messages) {
        setTimeout(() => {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        }, 0);
    }
}

// =============== LISTA DE CHATS ===============
function updateChatList() {
    if (!elements.sidebar) return;

    elements.sidebar.innerHTML = '';

    if (allChats.length === 0) {
        elements.sidebar.innerHTML = '<div style="padding: 1rem; text-align: center; color: #999;">No hay chats</div>';
        return;
    }

    allChats.forEach((chat, index) => {
        const item = document.createElement('div');
        item.className = 'chat-item';
        if (index === currentChatId) item.classList.add('active');

        const title = document.createElement('span');
        title.textContent = chat.title;
        title.onclick = () => selectChat(index);

        const actions = document.createElement('div');
        actions.className = 'chat-actions';

        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteChat(index);
        };

        actions.appendChild(delBtn);
        item.appendChild(title);
        item.appendChild(actions);
        elements.sidebar.appendChild(item);
    });
}

function selectChat(index) {
    currentChatId = index;
    chatHistory = allChats[index].messages || [];
    window.history.pushState({}, '', `/chat?id=${allChats[index].id}`);
    renderMessages();
    updateChatList();
    if (elements.input) elements.input.focus();
}

// =============== ALMACENAMIENTO ===============
function saveChatsToStorage() {
    allChats[currentChatId].messages = chatHistory;
    localStorage.setItem('devcentre_agent_chats', JSON.stringify(allChats));
}

function loadChatsFromStorage() {
    try {
        const saved = localStorage.getItem('devcentre_agent_chats');
        allChats = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Error loading chats:', e);
        allChats = [];
    }
}

// =============== SIDEBAR ===============
function showSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.add('show');
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.classList.add('show');
}

function hideSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('show');
    const overlay = document.querySelector('.overlay');
    if (overlay) overlay.classList.remove('show');
}

console.log(`✅ ${APP_NAME} inicializado correctamente`);
