import { GeminiService } from '../services/gemini-service.js';
import { ExportService } from '../services/export-service.js';

export class AIChat {
  static summaryData = null;
  static history = [];
  static isOpen = false;

  /**
   * Initializes the AI Chat component.
   * @param {Object} summary Statistical summary data.
   */
  static init(summary) {
    this.summaryData = summary;
    this.history = [];
    this.renderShell();
    this.setupListeners();
    this.addWelcomeMessage();
  }

  /**
   * Updates summary data reference when filters change.
   */
  static updateSummary(newSummary) {
    this.summaryData = newSummary;
  }

  /**
   * Renders the floating chat button and panel into the DOM.
   */
  static renderShell() {
    // Remove old chat components if exist
    const oldBubble = document.getElementById('ai-chat-bubble-trigger');
    const oldPanel = document.getElementById('ai-chat-panel');
    if (oldBubble) oldBubble.remove();
    if (oldPanel) oldPanel.remove();

    // 1. Floating Bubble
    const bubble = document.createElement('button');
    bubble.id = 'ai-chat-bubble-trigger';
    bubble.className = 'fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105 z-50 flex items-center justify-center';
    bubble.innerHTML = `<i data-lucide="message-square-text" class="w-6 h-6"></i>`;
    document.body.appendChild(bubble);

    // 2. Chat Panel
    const panel = document.createElement('div');
    panel.id = 'ai-chat-panel';
    panel.className = 'fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col transform scale-95 opacity-0 pointer-events-none transition-all duration-300 z-50';
    panel.innerHTML = `
      <!-- Header -->
      <div class="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shadow-md">
        <div class="flex items-center gap-2">
          <div class="p-1 bg-white/20 rounded-lg">
            <i data-lucide="bot" class="w-4 h-4 text-white"></i>
          </div>
          <div>
            <h4 class="text-xs font-bold">HR Analytics Advisor</h4>
            <p class="text-[9px] text-indigo-100 font-medium">Sẵn sàng trả lời dữ liệu</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button id="ai-chat-clear-btn" class="p-1 hover:bg-white/10 rounded-lg transition-colors text-white" title="Xóa lịch sử chat">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
          <button id="ai-chat-close-btn" class="p-1 hover:bg-white/10 rounded-lg transition-colors text-white">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Messages Pane -->
      <div id="ai-chat-messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
        <!-- Messages render here -->
      </div>

      <!-- Suggestions Box -->
      <div class="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-1.5" id="ai-chat-suggestions">
        <button class="chat-suggest-btn text-[10px] bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-350 hover:text-indigo-650 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
          Phòng nào có Performance cao nhất?
        </button>
        <button class="chat-suggest-btn text-[10px] bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-350 hover:text-indigo-650 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
          Lương trung bình từng phòng?
        </button>
        <button class="chat-suggest-btn text-[10px] bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-350 hover:text-indigo-650 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
          Nhân viên nghỉ nhiều nhất?
        </button>
        <button class="chat-suggest-btn text-[10px] bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-350 hover:text-indigo-650 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
          Mối tương quan Salary vs Engagement?
        </button>
      </div>

      <!-- Input Footer -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input type="text" id="ai-chat-input" placeholder="Hỏi tôi về dữ liệu của bạn..." class="flex-1 text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent text-slate-700 dark:text-slate-250 focus:outline-none focus:ring-1 focus:ring-indigo-500">
        <button id="ai-chat-send-btn" class="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center">
          <i data-lucide="send" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Attaches click triggers to toggle the window, clean chat, input triggers and suggestions.
   */
  static setupListeners() {
    const bubble = document.getElementById('ai-chat-bubble-trigger');
    const panel = document.getElementById('ai-chat-panel');
    const closeBtn = document.getElementById('ai-chat-close-btn');
    const clearBtn = document.getElementById('ai-chat-clear-btn');
    const sendBtn = document.getElementById('ai-chat-send-btn');
    const input = document.getElementById('ai-chat-input');
    const suggestionsBox = document.getElementById('ai-chat-suggestions');

    // Toggle window visibility
    const togglePanel = () => {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        panel.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
        panel.classList.add('scale-100', 'opacity-100');
        bubble.classList.add('bg-rose-500', 'hover:bg-rose-600');
        bubble.innerHTML = `<i data-lucide="x" class="w-5 h-5"></i>`;
        input.focus();
      } else {
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
        bubble.classList.remove('bg-rose-500', 'hover:bg-rose-600');
        bubble.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
        bubble.innerHTML = `<i data-lucide="message-square-text" class="w-6 h-6"></i>`;
      }
      if (window.lucide) window.lucide.createIcons();
    };

    bubble.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Send on click or Enter key
    sendBtn.addEventListener('click', () => this.sendMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Clear history
    clearBtn.addEventListener('click', () => {
      this.history = [];
      const messagesContainer = document.getElementById('ai-chat-messages-container');
      messagesContainer.innerHTML = '';
      this.addWelcomeMessage();
    });

    // Suggestions clicks
    if (suggestionsBox) {
      suggestionsBox.addEventListener('click', (e) => {
        const btn = e.target.closest('.chat-suggest-btn');
        if (btn) {
          input.value = btn.textContent.trim();
          this.sendMessage();
        }
      });
    }
  }

  /**
   * Adds the initial greeting bubbles.
   */
  static addWelcomeMessage() {
    this.addBubble('model', `Xin chào! Tôi là Trợ lý phân tích nhân sự của bạn. 
Dữ liệu Excel của bạn đã được tải thành công. 

Bạn có thể hỏi tôi bất cứ điều gì liên quan đến báo cáo nhân viên, mức lương, hiệu suất làm việc hoặc độ tuổi công tác!
*Lưu ý: Đảm bảo bạn đã điền Gemini API Key ở tab AI Insights.*`);
  }

  /**
   * Pushes message to UI, calls Gemini API, and updates conversation history.
   */
  static async sendMessage() {
    const input = document.getElementById('ai-chat-input');
    const question = input.value.trim();
    if (!question) return;

    // Clear input
    input.value = '';

    // Check API Key
    const key = GeminiService.getApiKey();
    if (!key) {
      this.addBubble('model', '⚠️ Vui lòng điền **Gemini API Key** ở tab **AI Insights** để bắt đầu trò chuyện.');
      return;
    }

    // Append user message
    this.addBubble('user', question);
    
    // Append loading bubble
    const loadingId = this.addLoadingBubble();

    try {
      // Call Service
      const answer = await GeminiService.askChat(this.summaryData, question, this.history, key);
      
      // Remove loading and append response
      this.removeLoadingBubble(loadingId);
      this.addBubble('model', answer);

      // Save to chat history
      this.history.push({ role: 'user', text: question });
      this.history.push({ role: 'model', text: answer });
    } catch (err) {
      console.error(err);
      this.removeLoadingBubble(loadingId);
      this.addBubble('model', `⚠️ **Lỗi hệ thống:** ${err.message || 'Không thể liên kết API. Vui lòng kiểm tra lại API Key.'}`);
    }
  }

  /**
   * Appends bubble html.
   */
  static addBubble(role, text) {
    const container = document.getElementById('ai-chat-messages-container');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const formattedText = role === 'model' 
      ? ExportService.convertMarkdownToHtml(text) 
      : text.replace(/\n/g, '<br/>');

    bubble.innerHTML = `
      <div class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-750 rounded-tl-none prose dark:prose-invert'}">
        ${formattedText}
      </div>
    `;
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  /**
   * Appends a generic typing dot bubble.
   */
  static addLoadingBubble() {
    const container = document.getElementById('ai-chat-messages-container');
    if (!container) return null;

    const id = `loading-${Date.now()}`;
    const bubble = document.createElement('div');
    bubble.id = id;
    bubble.className = 'flex justify-start';
    bubble.innerHTML = `
      <div class="max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 rounded-tl-none flex items-center gap-1 shadow-sm">
        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    `;

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  static removeLoadingBubble(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
  }
}
