/**
 * ECharts Manager to initialize, style, and draw all 12 dashboards charts.
 */

export class ChartManager {
  static instances = {};

  /**
   * Helper to get styling configurations based on dark/light mode.
   */
  static getThemeColors() {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      isDark,
      bg: 'transparent',
      text: isDark ? '#cbd5e1' : '#334155',
      grid: isDark ? '#374151' : '#e2e8f0',
      tooltipBg: isDark ? '#1f2937' : '#ffffff',
      tooltipBorder: isDark ? '#4b5563' : '#cbd5e1',
      tooltipText: isDark ? '#f3f4f6' : '#1f2937',
      // Dynamic palettes
      primary: isDark ? '#818cf8' : '#4f46e5', // Indigo
      secondary: isDark ? '#34d399' : '#10b981', // Emerald
      accent1: isDark ? '#fb7185' : '#f43f5e', // Rose
      accent2: isDark ? '#fbbf24' : '#f59e0b', // Amber
      accent3: isDark ? '#60a5fa' : '#3b82f6', // Blue
      accent4: isDark ? '#c084fc' : '#8b5cf6', // Purple
      gradientPalette: isDark 
        ? ['#818cf8', '#60a5fa', '#34d399', '#c084fc', '#fb7185', '#f59e0b']
        : ['#4f46e5', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#eab308']
    };
  }

  /**
   * Initializes or gets an ECharts instance for a container.
   */
  static initChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Dispose old instance if exists
    if (this.instances[containerId]) {
      this.instances[containerId].dispose();
    }

    const chart = echarts.init(container);
    this.instances[containerId] = chart;
    return chart;
  }

  /**
   * Cleans up and resizes all active charts.
   */
  static resizeAll() {
    Object.values(this.instances).forEach(chart => {
      if (chart) chart.resize();
    });
  }

  /**
   * Chart 1: Employee by Department (Bar Chart)
   */
  static renderDeptBar(containerId, departments, counts) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: departments,
        axisLabel: { color: colors.text, rotate: 25, interval: 0 },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Employees',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } },
        axisLine: { show: false }
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.primary },
              { offset: 1, color: colors.accent3 }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 2: Gender Distribution (Donut Chart)
   */
  static renderGenderDonut(containerId, genderData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'item',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      legend: {
        orient: 'horizontal',
        bottom: '0',
        textStyle: { color: colors.text }
      },
      series: [
        {
          name: 'Gender',
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: colors.isDark ? '#1f2937' : '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
            color: colors.text
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: genderData.map((item, idx) => ({
            ...item,
            itemStyle: { color: colors.gradientPalette[idx % colors.gradientPalette.length] }
          }))
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 3: Age Distribution (Histogram using Bar Bins)
   */
  static renderAgeHistogram(containerId, ageBins) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const categories = Object.keys(ageBins);
    const data = Object.values(ageBins);

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: colors.text },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Employees',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Employees',
          type: 'bar',
          data: data,
          itemStyle: {
            color: colors.secondary,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '60%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 4: Salary by Department (Bar chart of average with range indicators)
   * Note: ECharts boxplot is complex for users to read quickly. An interactive Bar chart
   * showing the average salary and whiskers for min/max provides a cleaner Power BI dashboard layout.
   */
  static renderSalaryBoxPlot(containerId, boxPlotData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const depts = boxPlotData.map(d => d.department);
    const averages = boxPlotData.map(d => Math.round(d.average));
    const mins = boxPlotData.map(d => d.boxValues[0]);
    const maxs = boxPlotData.map(d => d.boxValues[4]);

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText },
        formatter: (params) => {
          const idx = params[0].dataIndex;
          const dataObj = boxPlotData[idx];
          return `<strong>${dataObj.department}</strong><br/>
                  Avg Salary: $${Math.round(dataObj.average).toLocaleString()}/year<br/>
                  Min: $${dataObj.boxValues[0].toLocaleString()}<br/>
                  Q1: $${Math.round(dataObj.boxValues[1]).toLocaleString()}<br/>
                  Median: $${Math.round(dataObj.boxValues[2]).toLocaleString()}<br/>
                  Q3: $${Math.round(dataObj.boxValues[3]).toLocaleString()}<br/>
                  Max: $${dataObj.boxValues[4].toLocaleString()}`;
        }
      },
      grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
      xAxis: {
        type: 'category',
        data: depts,
        axisLabel: { color: colors.text, rotate: 25, interval: 0 },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Salary ($)',
        axisLabel: { color: colors.text, formatter: (v) => `$${(v/1000)}k` },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Average Salary',
          type: 'bar',
          data: averages,
          itemStyle: {
            color: colors.primary,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%'
        },
        {
          name: 'Range',
          type: 'custom',
          renderItem: (params, api) => {
            const group = {
              type: 'group',
              children: []
            };
            const x = api.coord([api.value(0), 0])[0];
            const yMin = api.coord([api.value(0), api.value(1)])[1];
            const yMax = api.coord([api.value(0), api.value(2)])[1];
            
            group.children.push({
              type: 'line',
              shape: { x1: x, y1: yMin, x2: x, y2: yMax },
              style: { stroke: colors.accent1, lineWidth: 2 }
            });
            // Horizontal ticks
            group.children.push({
              type: 'line',
              shape: { x1: x - 5, y1: yMin, x2: x + 5, y2: yMin },
              style: { stroke: colors.accent1, lineWidth: 2 }
            });
            group.children.push({
              type: 'line',
              shape: { x1: x - 5, y1: yMax, x2: x + 5, y2: yMax },
              style: { stroke: colors.accent1, lineWidth: 2 }
            });
            return group;
          },
          data: boxPlotData.map((d, i) => [i, d.boxValues[0], d.boxValues[4]]),
          z: 10
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 5: Performance Score Distribution (Bar Chart)
   */
  static renderPerformanceDist(containerId, perfDist) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const categories = Object.keys(perfDist).map(k => `Score ${k}`);
    const data = Object.values(perfDist);

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: colors.text },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Employees',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: data,
          itemStyle: {
            color: colors.accent4,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 6: Engagement Score Distribution (Bar Chart)
   */
  static renderEngagementDist(containerId, engageDist) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const categories = Object.keys(engageDist).map(k => `Score ${k}`);
    const data = Object.values(engageDist);

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { color: colors.text },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Employees',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Count',
          type: 'bar',
          data: data,
          itemStyle: {
            color: colors.accent2,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 7: Training Hours by Department (Horizontal Bar Chart)
   */
  static renderTrainingHoursBar(containerId, trainingData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    // Sort trainingData by total hours
    const sorted = [...trainingData].sort((a, b) => a.total - b.total);
    const depts = sorted.map(d => d.department);
    const totals = sorted.map(d => Math.round(d.total));

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '6%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'Total Hours',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'category',
        data: depts,
        axisLabel: { color: colors.text },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Total Training Hours',
          type: 'bar',
          data: totals,
          itemStyle: {
            color: colors.secondary,
            borderRadius: [0, 4, 4, 0]
          },
          barWidth: '60%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 8: Promotion Count by Department (Bar Chart)
   */
  static renderPromotionCountBar(containerId, promotionData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const depts = promotionData.map(d => d.department);
    const totals = promotionData.map(d => d.total);

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: depts,
        axisLabel: { color: colors.text, rotate: 25, interval: 0 },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Promotions',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Promotions Count',
          type: 'bar',
          data: totals,
          itemStyle: {
            color: colors.accent2,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 9: Absence Days by Department (Bar Chart)
   */
  static renderAbsenceDaysBar(containerId, absenceData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const depts = absenceData.map(d => d.department);
    const totals = absenceData.map(d => d.total);

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: depts,
        axisLabel: { color: colors.text, rotate: 25, interval: 0 },
        axisLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Absence Days',
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Total Absence Days',
          type: 'bar',
          data: totals,
          itemStyle: {
            color: colors.accent1,
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '50%'
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 10: Salary vs Performance (Scatter Plot)
   */
  static renderSalaryPerformanceScatter(containerId, scatterData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    // Sample data to maximum 1500 points for canvas performance
    const sampledData = scatterData.length > 1500 
      ? this.sampleData(scatterData, 1500)
      : scatterData;

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'item',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText },
        formatter: (params) => {
          return `Salary: $${params.value[0].toLocaleString()}/year<br/>Performance: ${params.value[1]}`;
        }
      },
      grid: { left: '3%', right: '5%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'Salary',
        axisLabel: { color: colors.text, formatter: (v) => `$${v/1000}k` },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Performance',
        min: 0,
        max: 5.5,
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Employees',
          type: 'scatter',
          symbolSize: 8,
          data: sampledData,
          itemStyle: {
            color: colors.primary,
            opacity: 0.6
          }
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 11: Salary vs Engagement (Scatter Plot)
   */
  static renderSalaryEngagementScatter(containerId, scatterData) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const sampledData = scatterData.length > 1500 
      ? this.sampleData(scatterData, 1500)
      : scatterData;

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        trigger: 'item',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText },
        formatter: (params) => {
          return `Salary: $${params.value[0].toLocaleString()}/year<br/>Engagement: ${params.value[1]}`;
        }
      },
      grid: { left: '3%', right: '5%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'value',
        name: 'Salary',
        axisLabel: { color: colors.text, formatter: (v) => `$${v/1000}k` },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      yAxis: {
        type: 'value',
        name: 'Engagement',
        min: 0,
        max: 5.5,
        axisLabel: { color: colors.text },
        splitLine: { lineStyle: { color: colors.grid } }
      },
      series: [
        {
          name: 'Employees',
          type: 'scatter',
          symbolSize: 8,
          data: sampledData,
          itemStyle: {
            color: colors.accent2,
            opacity: 0.6
          }
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Chart 12: Correlation Heatmap
   */
  static renderCorrelationHeatmap(containerId, keys, matrix) {
    const chart = this.initChart(containerId);
    if (!chart) return;
    const colors = this.getThemeColors();

    const option = {
      backgroundColor: colors.bg,
      tooltip: {
        position: 'top',
        backgroundColor: colors.tooltipBg,
        borderColor: colors.tooltipBorder,
        textStyle: { color: colors.tooltipText },
        formatter: (params) => {
          return `${keys[params.value[0]]} vs ${keys[params.value[1]]}: <strong>${params.value[2]}</strong>`;
        }
      },
      grid: { height: '70%', top: '5%', bottom: '25%', left: '15%', right: '5%' },
      xAxis: {
        type: 'category',
        data: keys,
        axisLabel: { color: colors.text, rotate: 35, interval: 0 },
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: keys,
        axisLabel: { color: colors.text },
        splitArea: { show: true }
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: colors.isDark 
            ? ['#f43f5e', '#1f2937', '#10b981'] // Rose to Gray to Emerald (Dark Theme)
            : ['#e11d48', '#f8fafc', '#059669'] // Rose to Slate to Emerald (Light Theme)
        },
        textStyle: { color: colors.text }
      },
      series: [
        {
          name: 'Correlation',
          type: 'heatmap',
          data: matrix,
          label: {
            show: true,
            formatter: (params) => params.value[2],
            color: colors.isDark ? '#ffffff' : '#000000'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    chart.setOption(option);
  }

  /**
   * Helper to random-sample scatter points so the browser canvas does not lag on 50,000 points.
   */
  static sampleData(data, size) {
    const shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, size);
  }
}
