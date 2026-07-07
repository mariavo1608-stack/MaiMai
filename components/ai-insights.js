import { GeminiService } from '../services/gemini-service.js';
import { ExportService } from '../services/export-service.js';

export class AIInsights {
  static summaryData = null;

  /**
   * Initializes the AI Insights panel.
   * @param {Object} summary The calculated summary stats.
   */
  static init(summary) {
    this.summaryData = summary;
    this.renderShell();
    this.loadSavedApiKey();
    this.setupListeners();
  }

  /**
   * Updates summary data reference when filter parameters change.
   */
  static updateSummary(newSummary) {
    this.summaryData = newSummary;
  }

  /**
   * Renders panel layout.
   */
  static renderShell() {
    const container = document.getElementById('ai-tab-container');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Configuration & Actions -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 shadow-sm space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">Gemini AI Executive Insights</h3>
              <p class="text-xs text-slate-500">Tự động phân tích các chỉ số nhân sự và lập báo cáo quản trị bằng AI.</p>
            </div>
            
            <button id="ai-generate-report-btn" class="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all duration-300 transform active:scale-98">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              Báo cáo AI Insights
            </button>
          </div>

          <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- API Key input -->
            <div>
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Gemini API Key</label>
              <div class="relative">
                <input type="password" id="gemini-api-key-input" placeholder="Nhập API Key của bạn..." class="w-full text-sm pl-4 pr-10 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <button id="toggle-key-visibility-btn" class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600">
                  <i data-lucide="eye" class="w-4 h-4"></i>
                </button>
              </div>
              <p class="text-[10px] text-slate-400 mt-1">API Key được lưu trực tiếp trên LocalStorage trình duyệt của bạn.</p>
            </div>
          </div>
        </div>

        <!-- AI Report Output (Hidden by default) -->
        <div id="ai-report-output-card" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/40 shadow-sm overflow-hidden hidden">
          <!-- Toolbar -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/10">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Bản báo cáo quản trị</span>
            
            <!-- Export dropdown / group -->
            <div class="flex items-center gap-1.5">
              <button id="ai-export-pdf-btn" class="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 rounded-lg text-xs font-bold border border-rose-100 dark:border-rose-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="file-down" class="w-3.5 h-3.5"></i> PDF
              </button>
              <button id="ai-export-word-btn" class="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-450 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i> Word
              </button>
              <button id="ai-export-html-btn" class="p-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-450 rounded-lg text-xs font-bold border border-amber-100 dark:border-amber-900/30 transition-colors flex items-center gap-1">
                <i data-lucide="code" class="w-3.5 h-3.5"></i> HTML
              </button>
              <button id="ai-export-md-btn" class="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1">
                <i data-lucide="file" class="w-3.5 h-3.5"></i> MD
              </button>
            </div>
          </div>

          <!-- Report Container -->
          <div class="p-6 md:p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <!-- Loading Skeleton -->
            <div id="ai-report-skeleton" class="space-y-6 hidden">
              <div class="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3 animate-pulse"></div>
              <div class="space-y-3">
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6 animate-pulse"></div>
              </div>
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
              <div class="grid grid-cols-2 gap-4">
                <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                <div class="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
            </div>

            <!-- Styled markdown output goes here -->
            <div id="ai-insights-report-html" class="prose dark:prose-invert max-w-none prose-slate">
              <!-- Rendered report -->
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Loads API key from LocalStorage.
   */
  static loadSavedApiKey() {
    const input = document.getElementById('gemini-api-key-input');
    if (input) {
      input.value = GeminiService.getApiKey();
    }
  }

  /**
   * Sets up listeners.
   */
  static setupListeners() {
    const generateBtn = document.getElementById('ai-generate-report-btn');
    const apiKeyInput = document.getElementById('gemini-api-key-input');
    const visibilityBtn = document.getElementById('toggle-key-visibility-btn');
    
    // Save API key as user types
    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', (e) => {
        GeminiService.saveApiKey(e.target.value);
      });
    }

    // Toggle key visibility
    if (visibilityBtn && apiKeyInput) {
      visibilityBtn.addEventListener('click', () => {
        const type = apiKeyInput.type === 'password' ? 'text' : 'password';
        apiKeyInput.type = type;
        visibilityBtn.innerHTML = type === 'password'
          ? `<i data-lucide="eye" class="w-4 h-4"></i>`
          : `<i data-lucide="eye-off" class="w-4 h-4"></i>`;
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Generate Report Trigger
    let reportText = ''; // Stores generated MD raw text
    
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        const key = GeminiService.getApiKey();
        if (!key) {
          alert('Vui lòng nhập Gemini API Key để sử dụng tính năng này!');
          apiKeyInput.focus();
          return;
        }

        const outputCard = document.getElementById('ai-report-output-card');
        const skeleton = document.getElementById('ai-report-skeleton');
        const reportHtmlContainer = document.getElementById('ai-insights-report-html');

        outputCard.classList.remove('hidden');
        skeleton.classList.remove('hidden');
        reportHtmlContainer.innerHTML = '';
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-70', 'cursor-not-allowed');

        try {
          reportText = await GeminiService.generateReport(this.summaryData, key);
          
          // Render report
          reportHtmlContainer.innerHTML = ExportService.convertMarkdownToHtml(reportText);
        } catch (err) {
          console.error(err);
          reportHtmlContainer.innerHTML = `
            <div class="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg">
              <strong>Lỗi khi tạo báo cáo:</strong> ${err.message || 'Lỗi mạng hoặc API Key không hợp lệ.'}
            </div>
          `;
        } finally {
          skeleton.classList.add('hidden');
          generateBtn.disabled = false;
          generateBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
      });
    }

    // Setup Report Export Listeners
    const exportPdf = document.getElementById('ai-export-pdf-btn');
    if (exportPdf) {
      exportPdf.addEventListener('click', () => {
        ExportService.exportPdf('ai-insights-report-html', 'HR_Analytics_AI_Executive_Report.pdf');
      });
    }

    const exportWord = document.getElementById('ai-export-word-btn');
    if (exportWord) {
      exportWord.addEventListener('click', () => {
        if (!reportText) return;
        ExportService.exportWord(reportText, 'HR_Analytics_AI_Executive_Report.doc');
      });
    }

    const exportHtml = document.getElementById('ai-export-html-btn');
    if (exportHtml) {
      exportHtml.addEventListener('click', () => {
        if (!reportText) return;
        ExportService.exportHtml(reportText, 'HR_Analytics_AI_Executive_Report.html');
      });
    }

    const exportMd = document.getElementById('ai-export-md-btn');
    if (exportMd) {
      exportMd.addEventListener('click', () => {
        if (!reportText) return;
        ExportService.exportMarkdown(reportText, 'HR_Analytics_AI_Executive_Report.md');
      });
    }
  }
}
