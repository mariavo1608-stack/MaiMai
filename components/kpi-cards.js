export class KPICards {
  /**
   * Renders the KPI metrics cards onto the dashboard container.
   * @param {Object} summary The analytical summary data.
   */
  static render(summary) {
    const kpiContainer = document.getElementById('kpi-container');
    if (!kpiContainer) return;

    const cards = [
      {
        title: 'Tổng số nhân viên',
        value: summary.totalEmployees.toLocaleString(),
        subtitle: 'Nhân sự hoạt động',
        icon: 'users',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        textColor: 'text-blue-600 dark:text-blue-400'
      },
      {
        title: 'Tổng phòng ban',
        value: summary.totalDepartments.toString(),
        subtitle: 'Đơn vị phòng ban',
        icon: 'network',
        color: 'from-purple-500 to-indigo-600',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        textColor: 'text-purple-600 dark:text-purple-400'
      },
      {
        title: 'Lương trung bình',
        value: `$${Math.round(summary.averageSalary).toLocaleString()}/năm`,
        subtitle: `Top: ${summary.topDeptSalary?.name || 'N/A'}`,
        icon: 'banknote',
        color: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
        textColor: 'text-emerald-600 dark:text-emerald-400'
      },
      {
        title: 'Tuổi trung bình',
        value: `${(Math.round(summary.averageAge * 10) / 10)} tuổi`,
        subtitle: 'Độ tuổi trung vị',
        icon: 'calendar',
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        textColor: 'text-amber-600 dark:text-amber-400'
      },
      {
        title: 'Thâm niên trung bình',
        value: `${(Math.round(summary.averageTenure * 10) / 10)} năm`,
        subtitle: 'Thời gian công tác',
        icon: 'clock',
        color: 'from-sky-500 to-blue-600',
        bgColor: 'bg-sky-50 dark:bg-sky-950/20',
        textColor: 'text-sky-600 dark:text-sky-400'
      },
      {
        title: 'Điểm Performance',
        value: `${(Math.round(summary.averagePerformance * 100) / 100)} / 5`,
        subtitle: `Top: ${summary.topDeptPerformance?.name || 'N/A'}`,
        icon: 'award',
        color: 'from-rose-500 to-pink-600',
        bgColor: 'bg-rose-50 dark:bg-rose-950/20',
        textColor: 'text-rose-600 dark:text-rose-400'
      },
      {
        title: 'Điểm Engagement',
        value: `${(Math.round(summary.averageEngagement * 100) / 100)} / 5`,
        subtitle: `Top: ${summary.highestEngagementDept?.name || 'N/A'}`,
        icon: 'heart',
        color: 'from-indigo-500 to-violet-600',
        bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
        textColor: 'text-indigo-600 dark:text-indigo-400'
      },
      {
        title: 'Tổng giờ đào tạo',
        value: `${summary.totalTrainingHours.toLocaleString()} giờ`,
        subtitle: 'Nâng cao chuyên môn',
        icon: 'book-open',
        color: 'from-cyan-500 to-blue-600',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
        textColor: 'text-cyan-600 dark:text-cyan-400'
      },
      {
        title: 'Tổng số ngày nghỉ',
        value: `${summary.totalAbsenceDays.toLocaleString()} ngày`,
        subtitle: `Cao nhất: ${summary.highestAbsenceDept?.name || 'N/A'}`,
        icon: 'calendar-days',
        color: 'from-orange-500 to-red-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        textColor: 'text-orange-600 dark:text-orange-400'
      },
      {
        title: 'Tổng số lần thăng chức',
        value: `${summary.totalPromotions.toLocaleString()} lần`,
        subtitle: 'Thăng tiến nghề nghiệp',
        icon: 'arrow-up-right',
        color: 'from-fuchsia-500 to-purple-600',
        bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-950/20',
        textColor: 'text-fuchsia-600 dark:text-fuchsia-400'
      }
    ];

    kpiContainer.innerHTML = cards.map(card => `
      <div class="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">${card.title}</span>
          <div class="p-2.5 rounded-lg ${card.bgColor} ${card.textColor} transition-colors duration-300 group-hover:bg-opacity-80">
            <i data-lucide="${card.icon}" class="w-5 h-5"></i>
          </div>
        </div>
        <div class="space-y-1">
          <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">${card.value}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center font-medium">
            ${card.subtitle}
          </p>
        </div>
        <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    `).join('');

    // Trigger Lucide parsing for icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}
