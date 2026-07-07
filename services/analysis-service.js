/**
 * Service to calculate all analytical statistics, KPIs, distributions,
 * and correlation coefficients from the dataset.
 */

export class AnalysisService {
  /**
   * Computes the high-level KPIs and summaries for the dataset.
   * @param {Array} data Normalized array of employee data.
   * @returns {Object} Analytical summary.
   */
  static calculateAnalytics(data) {
    if (!data || data.length === 0) {
      return this.getEmptySummary();
    }

    const n = data.length;
    
    // 1. Core aggregates
    let sumSalary = 0;
    let sumAge = 0;
    let sumTenure = 0;
    let sumPerformance = 0;
    let sumEngagement = 0;
    let totalTrainingHours = 0;
    let totalAbsenceDays = 0;
    let totalPromotions = 0;

    const departmentsSet = new Set();
    const gendersSet = new Set();

    data.forEach(emp => {
      sumSalary += emp.Salary;
      sumAge += emp.Age;
      sumTenure += emp.Tenure;
      sumPerformance += emp.Performance_Score;
      sumEngagement += emp.Engagement_Score;
      totalTrainingHours += emp.Training_Hours;
      totalAbsenceDays += emp.Absence_Days;
      totalPromotions += emp.Promotion_Count;

      if (emp.Department) departmentsSet.add(emp.Department);
      if (emp.Gender) gendersSet.add(emp.Gender);
    });

    const avgSalary = sumSalary / n;
    const avgAge = sumAge / n;
    const avgTenure = sumTenure / n;
    const avgPerformance = sumPerformance / n;
    const avgEngagement = sumEngagement / n;

    // 2. Department-level aggregation
    const deptAggregates = {};
    data.forEach(emp => {
      const dept = emp.Department;
      if (!deptAggregates[dept]) {
        deptAggregates[dept] = {
          count: 0,
          salaries: [],
          performances: [],
          engagements: [],
          absences: [],
          trainingHours: [],
          promotions: []
        };
      }
      const d = deptAggregates[dept];
      d.count++;
      d.salaries.push(emp.Salary);
      d.performances.push(emp.Performance_Score);
      d.engagements.push(emp.Engagement_Score);
      d.absences.push(emp.Absence_Days);
      d.trainingHours.push(emp.Training_Hours);
      d.promotions.push(emp.Promotion_Count);
    });

    // Compute metrics for each department
    const deptsList = Object.keys(deptAggregates);
    let topDeptSalary = { name: 'N/A', val: 0 };
    let topDeptPerformance = { name: 'N/A', val: 0 };
    let highestEngagementDept = { name: 'N/A', val: 0 };
    let highestAbsenceDept = { name: 'N/A', val: 0 };

    deptsList.forEach(dept => {
      const d = deptAggregates[dept];
      
      const avgDeptSalary = d.salaries.reduce((a, b) => a + b, 0) / d.count;
      const avgDeptPerf = d.performances.reduce((a, b) => a + b, 0) / d.count;
      const avgDeptEngage = d.engagements.reduce((a, b) => a + b, 0) / d.count;
      const avgDeptAbsence = d.absences.reduce((a, b) => a + b, 0) / d.count;

      if (avgDeptSalary > topDeptSalary.val) {
        topDeptSalary = { name: dept, val: avgDeptSalary };
      }
      if (avgDeptPerf > topDeptPerformance.val) {
        topDeptPerformance = { name: dept, val: avgDeptPerf };
      }
      if (avgDeptEngage > highestEngagementDept.val) {
        highestEngagementDept = { name: dept, val: avgDeptEngage };
      }
      if (avgDeptAbsence > highestAbsenceDept.val) {
        highestAbsenceDept = { name: dept, val: avgDeptAbsence };
      }
    });

    // 3. Gender Distribution
    const genderDist = {};
    data.forEach(emp => {
      genderDist[emp.Gender] = (genderDist[emp.Gender] || 0) + 1;
    });

    // 4. Age Distribution (Binned)
    // Bins: Under 25, 25-34, 35-44, 45-54, 55+
    const ageBins = {
      'Under 25': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };
    data.forEach(emp => {
      const age = emp.Age;
      if (age < 25) ageBins['Under 25']++;
      else if (age <= 34) ageBins['25-34']++;
      else if (age <= 44) ageBins['35-44']++;
      else if (age <= 54) ageBins['45-54']++;
      else ageBins['55+']++;
    });

    // 5. Performance and Engagement Score Distribution
    const perfDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const engageDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(emp => {
      // Round to nearest integer for distribution bar charts
      const p = Math.min(5, Math.max(1, Math.round(emp.Performance_Score)));
      const e = Math.min(5, Math.max(1, Math.round(emp.Engagement_Score)));
      perfDist[p]++;
      engageDist[e]++;
    });

    // 6. Box Plot calculations (Salary by Department)
    const salaryBoxPlotData = deptsList.map(dept => {
      const salaries = [...deptAggregates[dept].salaries].sort((a, b) => a - b);
      const min = salaries[0];
      const max = salaries[salaries.length - 1];
      const q1 = this.getPercentile(salaries, 0.25);
      const median = this.getPercentile(salaries, 0.5);
      const q3 = this.getPercentile(salaries, 0.75);
      return {
        department: dept,
        boxValues: [min, q1, median, q3, max],
        average: salaries.reduce((a, b) => a + b, 0) / salaries.length
      };
    });

    // 7. Correlation Heatmap between numeric features
    const numericKeys = [
      'Age', 'Tenure', 'Salary', 'Performance_Score', 
      'Absence_Days', 'Training_Hours', 'Promotion_Count', 'Engagement_Score'
    ];
    const correlationMatrix = [];
    numericKeys.forEach((keyY, yIdx) => {
      numericKeys.forEach((keyX, xIdx) => {
        const arrX = data.map(emp => emp[keyX]);
        const arrY = data.map(emp => emp[keyY]);
        const r = this.getPearsonCorrelation(arrX, arrY);
        correlationMatrix.push([xIdx, yIdx, r]); // format suitable for ECharts heatmap [col, row, val]
      });
    });

    return {
      // KPI numbers
      totalEmployees: n,
      totalDepartments: departmentsSet.size,
      averageSalary: avgSalary,
      averageAge: avgAge,
      averageTenure: avgTenure,
      averagePerformance: avgPerformance,
      averageEngagement: avgEngagement,
      totalTrainingHours,
      totalAbsenceDays,
      totalPromotions,

      // Calculated Tops
      topDeptSalary,
      topDeptPerformance,
      highestEngagementDept,
      highestAbsenceDept,

      // Chart-ready structures
      departments: deptsList,
      deptCounts: deptsList.map(d => deptAggregates[d].count),
      genderDistribution: Object.keys(genderDist).map(g => ({ name: g, value: genderDist[g] })),
      ageDistribution: ageBins,
      performanceDistribution: perfDist,
      engagementDistribution: engageDist,
      salaryBoxPlot: salaryBoxPlotData,
      trainingHoursByDept: deptsList.map(d => ({
        department: d,
        total: deptAggregates[d].trainingHours.reduce((a, b) => a + b, 0),
        average: deptAggregates[d].trainingHours.reduce((a, b) => a + b, 0) / deptAggregates[d].count
      })),
      promotionsByDept: deptsList.map(d => ({
        department: d,
        total: deptAggregates[d].promotions.reduce((a, b) => a + b, 0)
      })),
      absencesByDept: deptsList.map(d => ({
        department: d,
        total: deptAggregates[d].absences.reduce((a, b) => a + b, 0),
        average: deptAggregates[d].absences.reduce((a, b) => a + b, 0) / deptAggregates[d].count
      })),

      // Scatter plots (keep size manageable if huge - sample up to 1000 for visuals if needed, but let's keep all)
      scatterSalaryPerf: data.map(emp => [emp.Salary, emp.Performance_Score]),
      scatterSalaryEngage: data.map(emp => [emp.Salary, emp.Engagement_Score]),

      // Correlations
      correlationKeys: numericKeys,
      correlationMatrix
    };
  }

  /**
   * Helper to compute percentile of a sorted numeric array.
   */
  static getPercentile(arr, q) {
    const pos = (arr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (arr[base + 1] !== undefined) {
      return arr[base] + rest * (arr[base + 1] - arr[base]);
    } else {
      return arr[base];
    }
  }

  /**
   * Pearson correlation calculation.
   */
  static getPearsonCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumX2 += x[i] * x[i];
      sumY2 += y[i] * y[i];
    }

    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    if (den === 0) return 0;
    return Math.round((num / den) * 100) / 100;
  }

  /**
   * Empty structure.
   */
  static getEmptySummary() {
    return {
      totalEmployees: 0,
      totalDepartments: 0,
      averageSalary: 0,
      averageAge: 0,
      averageTenure: 0,
      averagePerformance: 0,
      averageEngagement: 0,
      totalTrainingHours: 0,
      totalAbsenceDays: 0,
      totalPromotions: 0,
      topDeptSalary: { name: 'N/A', val: 0 },
      topDeptPerformance: { name: 'N/A', val: 0 },
      highestEngagementDept: { name: 'N/A', val: 0 },
      highestAbsenceDept: { name: 'N/A', val: 0 },
      departments: [],
      deptCounts: [],
      genderDistribution: [],
      ageDistribution: {},
      performanceDistribution: {},
      engagementDistribution: {},
      salaryBoxPlot: [],
      trainingHoursByDept: [],
      promotionsByDept: [],
      absencesByDept: [],
      scatterSalaryPerf: [],
      scatterSalaryEngage: [],
      correlationKeys: [],
      correlationMatrix: []
    };
  }

  /**
   * Filter the dataset using the filter settings.
   */
  static filterData(data, filters) {
    if (!data || data.length === 0) return [];

    return data.filter(emp => {
      // 1. Department Filter (Array)
      if (filters.departments && filters.departments.length > 0) {
        if (!filters.departments.includes(emp.Department)) return false;
      }

      // 2. Gender Filter (Array)
      if (filters.genders && filters.genders.length > 0) {
        if (!filters.genders.includes(emp.Gender)) return false;
      }

      // 3. Age Range [min, max]
      if (filters.ageRange) {
        const [minAge, maxAge] = filters.ageRange;
        if (emp.Age < minAge || emp.Age > maxAge) return false;
      }

      // 4. Salary Range [min, max]
      if (filters.salaryRange) {
        const [minSalary, maxSalary] = filters.salaryRange;
        if (emp.Salary < minSalary || emp.Salary > maxSalary) return false;
      }

      // 5. Performance Score Range [min, max]
      if (filters.performanceRange) {
        const [minPerf, maxPerf] = filters.performanceRange;
        if (emp.Performance_Score < minPerf || emp.Performance_Score > maxPerf) return false;
      }

      // 6. Engagement Score Range [min, max]
      if (filters.engagementRange) {
        const [minEngage, maxEngage] = filters.engagementRange;
        if (emp.Engagement_Score < minEngage || emp.Engagement_Score > maxEngage) return false;
      }

      return true;
    });
  }
}
