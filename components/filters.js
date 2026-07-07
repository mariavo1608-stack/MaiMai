/**
 * Component to manage filters dynamically based on the uploaded dataset.
 */

export class Filters {
  static currentFilters = {
    departments: [],
    genders: [],
    ageRange: [0, 100],
    salaryRange: [0, 1000000],
    performanceRange: [1, 5],
    engagementRange: [1, 5]
  };

  static originalRanges = {};

  /**
   * Initializes the dynamic filter controls.
   * @param {Array} rawData The entire loaded dataset.
   * @param {Function} onFilterChanged Callback function when filters change.
   */
  static init(rawData, onFilterChanged) {
    if (!rawData || rawData.length === 0) return;

    // Scan values to find dynamic choices and min-max boundaries
    const departments = [...new Set(rawData.map(e => e.Department))].sort();
    const genders = [...new Set(rawData.map(e => e.Gender))].sort();
    
    const ages = rawData.map(e => e.Age);
    const salaries = rawData.map(e => e.Salary);
    const performances = rawData.map(e => e.Performance_Score);
    const engagements = rawData.map(e => e.Engagement_Score);

    this.originalRanges = {
      age: [Math.min(...ages), Math.max(...ages)],
      salary: [Math.min(...salaries), Math.max(...salaries)],
      performance: [Math.min(...performances), Math.max(...performances)],
      engagement: [Math.min(...engagements), Math.max(...engagements)]
    };

    // Set initial values
    this.currentFilters = {
      departments: [],
      genders: [],
      ageRange: [...this.originalRanges.age],
      salaryRange: [...this.originalRanges.salary],
      performanceRange: [...this.originalRanges.performance],
      engagementRange: [...this.originalRanges.engagement]
    };

    // Render filter elements dynamically
    this.renderFilterPanel(departments, genders);
    
    // Attach listeners
    this.setupListeners(onFilterChanged);
  }

  /**
   * Renders the HTML controls inside the filter panel container.
   */
  static renderFilterPanel(departments, genders) {
    const container = document.getElementById('filters-pane-container');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Departments -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Phòng ban</h4>
          <div class="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            ${departments.map((dept, i) => `
              <label class="flex items-center text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input type="checkbox" value="${dept}" class="filter-dept-checkbox rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 mr-2.5 h-4 w-4">
                <span>${dept}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Gender -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Giới tính</h4>
          <div class="flex flex-wrap gap-2">
            ${genders.map(gender => `
              <label class="flex items-center text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <input type="checkbox" value="${gender}" class="filter-gender-checkbox rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 mr-2 h-4 w-4">
                <span>${gender}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Salary Range -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Mức lương ($)</h4>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Min</label>
              <input type="number" id="filter-salary-min" min="${this.originalRanges.salary[0]}" max="${this.originalRanges.salary[1]}" value="${this.originalRanges.salary[0]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Max</label>
              <input type="number" id="filter-salary-max" min="${this.originalRanges.salary[0]}" max="${this.originalRanges.salary[1]}" value="${this.originalRanges.salary[1]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
          </div>
        </div>

        <!-- Age Range -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Độ tuổi</h4>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Min</label>
              <input type="number" id="filter-age-min" min="${this.originalRanges.age[0]}" max="${this.originalRanges.age[1]}" value="${this.originalRanges.age[0]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Max</label>
              <input type="number" id="filter-age-max" min="${this.originalRanges.age[0]}" max="${this.originalRanges.age[1]}" value="${this.originalRanges.age[1]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
          </div>
        </div>

        <!-- Performance Range -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Điểm Performance (1-5)</h4>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Min</label>
              <input type="number" id="filter-perf-min" step="0.1" min="${this.originalRanges.performance[0]}" max="${this.originalRanges.performance[1]}" value="${this.originalRanges.performance[0]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Max</label>
              <input type="number" id="filter-perf-max" step="0.1" min="${this.originalRanges.performance[0]}" max="${this.originalRanges.performance[1]}" value="${this.originalRanges.performance[1]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
          </div>
        </div>

        <!-- Engagement Range -->
        <div>
          <h4 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Điểm Engagement (1-5)</h4>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Min</label>
              <input type="number" id="filter-engage-min" step="0.1" min="${this.originalRanges.engagement[0]}" max="${this.originalRanges.engagement[1]}" value="${this.originalRanges.engagement[0]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
            <div>
              <label class="text-[10px] text-slate-400 dark:text-slate-500">Max</label>
              <input type="number" id="filter-engage-max" step="0.1" min="${this.originalRanges.engagement[0]}" max="${this.originalRanges.engagement[1]}" value="${this.originalRanges.engagement[1]}" class="w-full text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 bg-transparent text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500">
            </div>
          </div>
        </div>

        <!-- Reset Button -->
        <button id="reset-filters-btn" class="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors mt-2 flex items-center justify-center gap-1">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
          Xóa bộ lọc
        </button>
      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Sets up change events for the filters.
   */
  static setupListeners(onFilterChanged) {
    const container = document.getElementById('filters-pane-container');
    if (!container) return;

    const handleFilterChange = () => {
      // 1. Gather checked departments
      const checkedDepts = Array.from(document.querySelectorAll('.filter-dept-checkbox:checked'))
        .map(el => el.value);

      // 2. Gather checked genders
      const checkedGenders = Array.from(document.querySelectorAll('.filter-gender-checkbox:checked'))
        .map(el => el.value);

      // 3. Gather age min/max
      const ageMin = parseFloat(document.getElementById('filter-age-min').value) || this.originalRanges.age[0];
      const ageMax = parseFloat(document.getElementById('filter-age-max').value) || this.originalRanges.age[1];

      // 4. Gather salary min/max
      const salaryMin = parseFloat(document.getElementById('filter-salary-min').value) || this.originalRanges.salary[0];
      const salaryMax = parseFloat(document.getElementById('filter-salary-max').value) || this.originalRanges.salary[1];

      // 5. Gather performance min/max
      const perfMin = parseFloat(document.getElementById('filter-perf-min').value) || this.originalRanges.performance[0];
      const perfMax = parseFloat(document.getElementById('filter-perf-max').value) || this.originalRanges.performance[1];

      // 6. Gather engagement min/max
      const engageMin = parseFloat(document.getElementById('filter-engage-min').value) || this.originalRanges.engagement[0];
      const engageMax = parseFloat(document.getElementById('filter-engage-max').value) || this.originalRanges.engagement[1];

      this.currentFilters = {
        departments: checkedDepts,
        genders: checkedGenders,
        ageRange: [ageMin, ageMax],
        salaryRange: [salaryMin, salaryMax],
        performanceRange: [perfMin, perfMax],
        engagementRange: [engageMin, engageMax]
      };

      onFilterChanged(this.currentFilters);
    };

    // Attach listeners to all inputs
    container.addEventListener('change', (e) => {
      if (
        e.target.classList.contains('filter-dept-checkbox') ||
        e.target.classList.contains('filter-gender-checkbox') ||
        e.target.id.startsWith('filter-')
      ) {
        handleFilterChange();
      }
    });

    // Reset button handler
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Uncheck boxes
        document.querySelectorAll('.filter-dept-checkbox, .filter-gender-checkbox').forEach(cb => cb.checked = false);

        // Reset ranges inputs
        document.getElementById('filter-age-min').value = this.originalRanges.age[0];
        document.getElementById('filter-age-max').value = this.originalRanges.age[1];
        document.getElementById('filter-salary-min').value = this.originalRanges.salary[0];
        document.getElementById('filter-salary-max').value = this.originalRanges.salary[1];
        document.getElementById('filter-perf-min').value = this.originalRanges.performance[0];
        document.getElementById('filter-perf-max').value = this.originalRanges.performance[1];
        document.getElementById('filter-engage-min').value = this.originalRanges.engagement[0];
        document.getElementById('filter-engage-max').value = this.originalRanges.engagement[1];

        // Trigger change
        handleFilterChange();
      });
    }
  }
}
