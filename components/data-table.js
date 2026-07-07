/**
 * Component to manage the interactive employee data table with
 * sorting, paginated viewport, global searching, and CSV/Excel exports.
 */

export class DataTable {
  static data = [];
  static filteredData = [];
  
  // Table state
  static currentPage = 1;
  static pageSize = 25;
  static sortField = 'Employee_ID';
  static sortAscending = true;
  static searchQuery = '';

  /**
   * Initializes the data table.
   * @param {Array} data The dataset array.
   */
  static init(data) {
    this.data = data;
    this.filteredData = [...data];
    this.currentPage = 1;
    this.searchQuery = '';
    
    this.renderShell();
    this.setupListeners();
    this.updateTable();
  }

  /**
   * Refreshes the table with new filtered data (e.g., when dashboard filters update).
   * @param {Array} filteredData The new filtered array.
   */
  static updateData(filteredData) {
    this.filteredData = [...filteredData];
    this.currentPage = 1;
    this.updateTable();
  }

  /**
   * Renders the base HTML structure of the table page.
   */
  static renderShell() {
    const container = document.getElementById('table-tab-container');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Toolbar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 shadow-sm">
          <!-- Search -->
          <div class="relative flex-1 max-w-md">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <i data-lucide="search" class="w-4 h-4"></i>
            </span>
            <input type="text" id="table-search-input" placeholder="Tìm kiếm theo mã, phòng ban, giới tính..." class="w-full text-sm pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Hiển thị:</span>
              <select id="table-page-size-select" class="border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 bg-transparent focus:ring-1 focus:ring-indigo-500">
                <option value="10">10</option>
                <option value="25" selected>25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <button id="table-export-csv-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-850 transition-colors">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              CSV
            </button>
            
            <button id="table-export-excel-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-900/40 transition-colors">
              <i data-lucide="sheet" class="w-3.5 h-3.5"></i>
              Excel
            </button>
          </div>
        </div>

        <!-- Table Responsive Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/40 shadow-sm overflow-hidden">
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Employee_ID">ID <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Department">Phòng ban <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Gender">Giới tính <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Age">Tuổi <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Salary">Mức lương <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Tenure">Thâm niên <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Performance_Score">Performance <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Engagement_Score">Engagement <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Absence_Days">Ngày nghỉ <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Training_Hours">Đào tạo <span class="sort-icon"></span></th>
                  <th class="py-3.5 px-4 cursor-pointer sort-header hover:text-indigo-500" data-field="Promotion_Count">Thăng chức <span class="sort-icon"></span></th>
                </tr>
              </thead>
              <tbody id="employee-table-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-600 dark:text-slate-350">
                <!-- Rows render here -->
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs font-semibold text-slate-400">
            <div id="table-info-text">Hiển thị 0 - 0 của 0 nhân sự</div>
            <div class="flex items-center gap-1" id="table-pagination-buttons">
              <!-- Buttons render here -->
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
   * Sets up listeners for searching, sorting, resizing pages, and exporting.
   */
  static setupListeners() {
    // Search input
    const searchInput = document.getElementById('table-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.currentPage = 1;
        this.updateTable();
      });
    }

    // Page size selection
    const pageSizeSelect = document.getElementById('table-page-size-select');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value);
        this.currentPage = 1;
        this.updateTable();
      });
    }

    // Table sorting headers
    const headers = document.querySelectorAll('.sort-header');
    headers.forEach(h => {
      h.addEventListener('click', () => {
        const field = h.getAttribute('data-field');
        if (this.sortField === field) {
          this.sortAscending = !this.sortAscending;
        } else {
          this.sortField = field;
          this.sortAscending = true;
        }
        this.updateTable();
      });
    });

    // Exports
    const csvBtn = document.getElementById('table-export-csv-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => this.exportToCSV());
    }

    const excelBtn = document.getElementById('table-export-excel-btn');
    if (excelBtn) {
      excelBtn.addEventListener('click', () => this.exportToExcel());
    }
  }

  /**
   * Computes matching records, sorts them, extracts the active page slices, and updates the table UI.
   */
  static updateTable() {
    const tbody = document.getElementById('employee-table-tbody');
    if (!tbody) return;

    // 1. Apply search filter
    let records = [...this.filteredData];
    if (this.searchQuery) {
      records = records.filter(emp => {
        return (
          emp.Employee_ID.toLowerCase().includes(this.searchQuery) ||
          emp.Department.toLowerCase().includes(this.searchQuery) ||
          emp.Gender.toLowerCase().includes(this.searchQuery)
        );
      });
    }

    // 2. Apply sorting
    records.sort((a, b) => {
      let valA = a[this.sortField];
      let valB = b[this.sortField];

      // Handle numerical sort vs string sort
      if (typeof valA === 'string') {
        return this.sortAscending 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return this.sortAscending 
          ? valA - valB 
          : valB - valA;
      }
    });

    // Update Sorting Icons on Headers
    const headers = document.querySelectorAll('.sort-header');
    headers.forEach(h => {
      const field = h.getAttribute('data-field');
      const iconSpan = h.querySelector('.sort-icon');
      if (field === this.sortField) {
        iconSpan.innerHTML = this.sortAscending 
          ? '↑' 
          : '↓';
        h.classList.add('text-indigo-600', 'dark:text-indigo-400');
      } else {
        iconSpan.innerHTML = '';
        h.classList.remove('text-indigo-600', 'dark:text-indigo-400');
      }
    });

    // 3. Extract pagination boundaries
    const totalCount = records.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, totalCount);
    const paginatedRecords = records.slice(startIdx, endIdx);

    // Update text
    const infoText = document.getElementById('table-info-text');
    if (infoText) {
      infoText.textContent = totalCount > 0 
        ? `Hiển thị ${startIdx + 1} - ${endIdx} của ${totalCount.toLocaleString()} nhân sự`
        : 'Không tìm thấy nhân sự phù hợp';
    }

    // 4. Render Rows
    tbody.innerHTML = paginatedRecords.map(emp => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
        <td class="py-3 px-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">${emp.Employee_ID}</td>
        <td class="py-3 px-4 font-medium">${emp.Department}</td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2 py-0.5 rounded-full ${emp.Gender === 'Male' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' : 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400'}">
            ${emp.Gender}
          </span>
        </td>
        <td class="py-3 px-4">${emp.Age}</td>
        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-300">$${emp.Salary.toLocaleString()}</td>
        <td class="py-3 px-4 font-medium text-slate-500">${emp.Tenure} năm</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-1.5">
            <span class="font-bold">${emp.Performance_Score}</span>
            <div class="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div class="bg-rose-500 h-full" style="width: ${(emp.Performance_Score / 5) * 100}%"></div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-1.5">
            <span class="font-bold">${emp.Engagement_Score}</span>
            <div class="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-full" style="width: ${(emp.Engagement_Score / 5) * 100}%"></div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-semibold text-slate-500">${emp.Absence_Days} ngày</td>
        <td class="py-3 px-4">${emp.Training_Hours} giờ</td>
        <td class="py-3 px-4 font-medium text-slate-500">${emp.Promotion_Count} lần</td>
      </tr>
    `).join('');

    // 5. Render Page controls
    this.renderPaginationControls(totalPages);
  }

  /**
   * Renders Prev, Next and numbered pagination buttons.
   */
  static renderPaginationControls(totalPages) {
    const container = document.getElementById('table-pagination-buttons');
    if (!container) return;

    let html = '';
    
    // Prev Button
    html += `
      <button ${this.currentPage === 1 ? 'disabled' : ''} class="pagination-btn p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 disabled:opacity-40 transition-colors" data-page="${this.currentPage - 1}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </button>
    `;

    // Limit pages buttons dynamically
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      html += `<button class="pagination-btn px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" data-page="1">1</button>`;
      if (startPage > 2) html += `<span class="px-1 text-slate-400">...</span>`;
    }

    for (let p = startPage; p <= endPage; p++) {
      const activeClass = p === this.currentPage 
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800';
      html += `
        <button class="pagination-btn px-2.5 py-1 rounded-lg text-xs font-semibold ${activeClass} transition-colors" data-page="${p}">
          ${p}
        </button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) html += `<span class="px-1 text-slate-400">...</span>`;
      html += `<button class="pagination-btn px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next Button
    html += `
      <button ${this.currentPage === totalPages ? 'disabled' : ''} class="pagination-btn p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 disabled:opacity-40 transition-colors" data-page="${this.currentPage + 1}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </button>
    `;

    container.innerHTML = html;

    // Attach click triggers
    container.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(btn.getAttribute('data-page'));
        if (page && page >= 1 && page <= totalPages) {
          this.currentPage = page;
          this.updateTable();
        }
      });
    });
  }

  /**
   * Generates a CSV file and prompts a download.
   */
  static exportToCSV() {
    if (!this.filteredData.length) return;

    // Define CSV Headers
    const headers = ['Employee_ID', 'Department', 'Gender', 'Age', 'Salary', 'Tenure', 'Performance_Score', 'Engagement_Score', 'Absence_Days', 'Training_Hours', 'Promotion_Count'];
    
    // Construct rows
    const rows = this.filteredData.map(emp => {
      return headers.map(h => {
        // String escaping for CSVs
        let cell = emp[h];
        if (cell === null || cell === undefined) cell = '';
        cell = String(cell).replace(/"/g, '""');
        if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'HR_Analytics_Filtered_Employees.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generates an Excel file client-side using SheetJS.
   */
  static exportToExcel() {
    if (!this.filteredData.length) return;

    // Standardize key names for presentation in Excel sheet
    const displayData = this.filteredData.map(emp => ({
      'Mã Nhân Viên': emp.Employee_ID,
      'Phòng Ban': emp.Department,
      'Giới Tính': emp.Gender,
      'Tuổi': emp.Age,
      'Lương ($)': emp.Salary,
      'Thâm Niên (Năm)': emp.Tenure,
      'Performance Score': emp.Performance_Score,
      'Engagement Score': emp.Engagement_Score,
      'Số Ngày Nghỉ': emp.Absence_Days,
      'Giờ Đào Tạo': emp.Training_Hours,
      'Số Lần Thăng Chức': emp.Promotion_Count
    }));

    const worksheet = XLSX.utils.json_to_sheet(displayData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    // Auto-fit column widths (nice polish!)
    const maxKeys = Object.keys(displayData[0]);
    worksheet['!cols'] = maxKeys.map(key => {
      return { wch: Math.max(key.length + 3, 12) };
    });

    XLSX.writeFile(workbook, 'HR_Analytics_Filtered_Employees.xlsx');
  }
}
