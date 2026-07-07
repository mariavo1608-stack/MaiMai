import { Dropzone } from '../components/dropzone.js';
import { KPICards } from '../components/kpi-cards.js';
import { Filters } from '../components/filters.js';
import { DataTable } from '../components/data-table.js';
import { AIInsights } from '../components/ai-insights.js';
import { AIChat } from '../components/ai-chat.js';
import { ThemeToggle } from '../components/theme-toggle.js';
import { AnalysisService } from '../services/analysis-service.js';
import { ChartManager } from '../charts/chart-manager.js';
import { MockService } from '../services/mock-service.js';

class App {
  static rawData = [];
  static filteredData = [];
  static summaryData = null;

  /**
   * Initializes the application.
   */
  static init() {
    // 1. Initialize Theme Engine
    ThemeToggle.init();

    // 2. Initialize Dropzone to await upload
    Dropzone.init((data) => this.handleDataLoaded(data));

    // 3. Bind sample download button
    const sampleBtn = document.getElementById('download-sample-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering dropzone select
        MockService.downloadSampleExcel(100);
      });
    }

    // 4. Setup Tab navigation
    this.setupTabNavigation();
 
    // 5. Setup file re-upload button
    this.setupReupload();
 
    // 6. Watch window resizing for responsive charts
    window.addEventListener('resize', () => ChartManager.resizeAll());
 
    // 7. Listen to theme change events to redrawing charts with correct theme colors
    window.addEventListener('themechanged', () => {
      if (this.rawData.length > 0) {
        this.renderAllCharts();
      }
    });
 
    // 8. Parse standard Lucide icons on start
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Orchestrator called when file upload is successful.
   */
  static handleDataLoaded(data) {
    this.rawData = data;
    this.filteredData = [...data];

    // Show dashboard panel and adjust header actions
    document.getElementById('landing-view').classList.add('hidden');
    
    const dashboardView = document.getElementById('dashboard-view');
    dashboardView.classList.remove('hidden');
    dashboardView.classList.add('flex');
    
    document.getElementById('reupload-btn').classList.remove('hidden');

    // Initialize components
    Filters.init(this.rawData, (filters) => this.handleFilterChanged(filters));
    DataTable.init(this.filteredData);
    
    // Calculate initial statistics
    this.summaryData = AnalysisService.calculateAnalytics(this.filteredData);
    
    // Initialize AI services
    AIInsights.init(this.summaryData);
    AIChat.init(this.summaryData);

    // Initial render
    this.renderDashboard();
  }

  /**
   * Called whenever filter fields are modified.
   */
  static handleFilterChanged(filters) {
    // Filter rows
    this.filteredData = AnalysisService.filterData(this.rawData, filters);
    
    // Recalculate statistics
    this.summaryData = AnalysisService.calculateAnalytics(this.filteredData);

    // Update subordinate components
    DataTable.updateData(this.filteredData);
    AIInsights.updateSummary(this.summaryData);
    AIChat.updateSummary(this.summaryData);

    // Rerender KPIs and ECharts
    this.renderDashboard();
  }

  /**
   * Updates KPIs and draws/redraws ECharts.
   */
  static renderDashboard() {
    KPICards.render(this.summaryData);
    this.renderAllCharts();
  }

  /**
   * Draws all 12 ECharts charts using ChartManager.
   */
  static renderAllCharts() {
    const s = this.summaryData;
    if (!s) return;

    ChartManager.renderDeptBar('chart-dept-count', s.departments, s.deptCounts);
    ChartManager.renderGenderDonut('chart-gender-donut', s.genderDistribution);
    ChartManager.renderAgeHistogram('chart-age-hist', s.ageDistribution);
    ChartManager.renderSalaryBoxPlot('chart-salary-box', s.salaryBoxPlot);
    ChartManager.renderPerformanceDist('chart-perf-dist', s.performanceDistribution);
    ChartManager.renderEngagementDist('chart-engage-dist', s.engagementDistribution);
    ChartManager.renderTrainingHoursBar('chart-training-bar', s.trainingHoursByDept);
    ChartManager.renderPromotionCountBar('chart-promotion-bar', s.promotionsByDept);
    ChartManager.renderAbsenceDaysBar('chart-absence-bar', s.absencesByDept);
    ChartManager.renderSalaryPerformanceScatter('chart-salary-perf-scatter', s.scatterSalaryPerf);
    ChartManager.renderSalaryEngagementScatter('chart-salary-engage-scatter', s.scatterSalaryEngage);
    ChartManager.renderCorrelationHeatmap('chart-correlation-heatmap', s.correlationKeys, s.correlationMatrix);
  }

  /**
   * Binds layout tab button interactions.
   */
  static setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabViews = document.querySelectorAll('.tab-view');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        // Style buttons
        tabButtons.forEach(b => {
          b.classList.remove('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'font-bold');
          b.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400', 'font-semibold');
        });
        btn.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400', 'font-semibold');
        btn.classList.add('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'font-bold');

        // Toggle visibility
        tabViews.forEach(view => {
          if (view.id === `tab-${targetTab}`) {
            view.classList.remove('hidden');
          } else {
            view.classList.add('hidden');
          }
        });

        // Trigger chart redraw to handle hidden container resizing bugs in ECharts
        if (targetTab === 'dashboard') {
          setTimeout(() => ChartManager.resizeAll(), 50);
        }
      });
    });
  }

  /**
   * Resets app state and takes the user back to the landing upload page.
   */
  static setupReupload() {
    const reuploadBtn = document.getElementById('reupload-btn');
    if (!reuploadBtn) return;

    reuploadBtn.addEventListener('click', () => {
      // Clear data state
      this.rawData = [];
      this.filteredData = [];
      this.summaryData = null;

      // Clean HTML instances & chat
      const chatBubble = document.getElementById('ai-chat-bubble-trigger');
      const chatPanel = document.getElementById('ai-chat-panel');
      if (chatBubble) chatBubble.remove();
      if (chatPanel) chatPanel.remove();

      // Reset Dropzone UI
      const dropzoneContent = document.getElementById('dropzone-content');
      const progressContainer = document.getElementById('progress-container');
      const fileInput = document.getElementById('file-input');
      
      if (dropzoneContent) dropzoneContent.classList.remove('hidden');
      if (progressContainer) progressContainer.classList.add('hidden');
      if (fileInput) fileInput.value = '';

      // Reset tabs active state
      const tabButtons = document.querySelectorAll('.tab-btn');
      tabButtons.forEach((b, idx) => {
        b.classList.remove('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'font-bold');
        b.classList.add('border-transparent', 'text-slate-500', 'dark:text-slate-400', 'font-semibold');
        if (idx === 0) {
          b.classList.remove('border-transparent', 'text-slate-500', 'dark:text-slate-400', 'font-semibold');
          b.classList.add('border-indigo-600', 'text-indigo-600', 'dark:border-indigo-400', 'dark:text-indigo-400', 'font-bold');
        }
      });

      const tabViews = document.querySelectorAll('.tab-view');
      tabViews.forEach((view, idx) => {
        if (idx === 0) view.classList.remove('hidden');
        else view.classList.add('hidden');
      });

      // Show landing and hide dashboard
      document.getElementById('landing-view').classList.remove('hidden');
      
      const dashboardView = document.getElementById('dashboard-view');
      dashboardView.classList.add('hidden');
      dashboardView.classList.remove('flex');
      
      reuploadBtn.classList.add('hidden');
    });
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Bind to window for debugging and programmatic testing
window.App = App;
window.MockService = MockService;
