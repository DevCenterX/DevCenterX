// Chat State
let chatHistory = [];
let currentChatId = null;
let allChats = [];

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatForm = document.getElementById('chatForm');
const chatHistory_el = document.getElementById('chatHistory');
const newChatBtn = document.getElementById('newChatBtn');
const backBtn = document.getElementById('backBtn');
const sendBtn = document.getElementById('sendBtn');

// Initialize Chat
document.addEventListener('DOMContentLoaded', () => {
    // Enviar mensaje con Enter (sin Shift)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
      }
    });
  console.log('✅ Chat system initialized');
  loadChatsFromStorage();
  loadChatFromURL();
  
  // Event listeners
  chatForm.addEventListener('submit', handleSendMessage);
  newChatBtn.addEventListener('click', createNewChat);
  backBtn.addEventListener('click', goBack);
  
  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });

  // Focus on input
  chatInput.focus();
  
  // Check if there's a first message from the main page
  const firstMessage = localStorage.getItem('devcenter_first_message');
  if (firstMessage) {
    chatInput.value = firstMessage;
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    localStorage.removeItem('devcenter_first_message');
    
    // Auto-send the first message
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      chatForm.dispatchEvent(event);
    }, 300);
  }
});

// Load chat from URL params or localStorage
function loadChatFromURL() {
  const params = new URLSearchParams(window.location.search);
  const chatId = params.get('id');
  
  if (chatId && allChats[chatId]) {
    currentChatId = chatId;
    chatHistory = allChats[chatId].messages || [];
    renderMessages();
  } else if (allChats.length === 0) {
    createNewChat();
  } else {
    currentChatId = allChats.length - 1;
    chatHistory = allChats[currentChatId].messages || [];
    renderMessages();
  }
  
  updateChatList();
}

// Create new chat
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
  // Update URL
  window.history.pushState({}, '', `/chat?id=${newChat.id}`);
  saveChatsToStorage();
  renderMessages();
  updateChatList();
  chatInput.focus();
}

// Send message
async function handleSendMessage(e) {
  e.preventDefault();
  
  const message = chatInput.value.trim();
  if (!message) return;
  
  // Add user message
  chatHistory.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
  // Update chat title if first message
  if (chatHistory.length === 1) {
    allChats[currentChatId].title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
  }
  allChats[currentChatId].messages = chatHistory;
  saveChatsToStorage();
  chatInput.value = '';
  chatInput.style.height = 'auto';
  renderMessages();
  // Disable button while loading
  sendBtn.disabled = true;
  // Show typing indicator
  addTypingIndicator();
  
  try {
    // Build conversation history for API (excluding the current message)
    const conversationHistory = chatHistory.slice(0, -1).map(msg => ({
      role: msg.role === 'ai' ? 'model' : msg.role,
      content: msg.content
    }));
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        mode: 'chat',
        conversationHistory: conversationHistory
      })
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    const data = await response.json();
    if (!data.reply) {
      throw new Error('No response from AI');
    }
    // Remove typing indicator
    removeTypingIndicator();
    // Add AI message
    chatHistory.push({
      role: 'ai',
      content: data.reply,
      timestamp: new Date().toISOString()
    });
    allChats[currentChatId].messages = chatHistory;
    saveChatsToStorage();
    renderMessages();
    scrollToBottom();
    
  } catch (error) {
    console.error('❌ Error:', error);
    removeTypingIndicator();
    
    // Add error message
    chatHistory.push({
      role: 'ai',
      content: `❌ Error: ${error.message}. Intenta de nuevo.`,
      timestamp: new Date().toISOString()
    });
    
    renderMessages();
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// Render messages
function renderMessages() {
  chatMessages.innerHTML = '';
  
  chatHistory.forEach(msg => {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${msg.role}`;
    messageEl.innerHTML = `<div class="message-content">${escapeHtml(msg.content)}</div>`;
    chatMessages.appendChild(messageEl);
  });
  
  scrollToBottom();
}

// Add typing indicator
function addTypingIndicator() {
  const messageEl = document.createElement('div');
  messageEl.className = 'message ai typing';
  messageEl.id = 'typingIndicator';
  messageEl.innerHTML = `
    <div class="message-content">
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  chatMessages.appendChild(messageEl);
  scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// Scroll to bottom
function scrollToBottom() {
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 0);
}

// Update chat list
function updateChatList() {
  chatHistory_el.innerHTML = '';
  
  allChats.forEach((chat, index) => {
    const btn = document.createElement('button');
    btn.className = 'chat-item';
    if (index === currentChatId) btn.style.background = 'var(--message-user)';
    btn.textContent = chat.title || 'Chat sin título';
    btn.title = chat.title;
    btn.addEventListener('click', () => {
      currentChatId = index;
      chatHistory = chat.messages || [];
      window.history.pushState({}, '', `/chat?id=${chat.id}`);
      renderMessages();
      saveChatsToStorage();
      updateChatList();
      chatInput.focus();
    });
    chatHistory_el.appendChild(btn);
  });
}

// Go back to main page
function goBack() {
  window.location.href = '/';
}

// Save chats to localStorage
function saveChatsToStorage() {
  allChats[currentChatId].messages = chatHistory;
  localStorage.setItem('devcenter_chats', JSON.stringify(allChats));
}

// Load chats from localStorage
function loadChatsFromStorage() {
  const saved = localStorage.getItem('devcenter_chats');
  if (saved) {
    try {
      allChats = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading chats:', e);
      allChats = [];
    }
  }
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('✅ Chat script loaded');
