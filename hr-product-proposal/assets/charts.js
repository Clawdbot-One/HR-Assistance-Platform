(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var purple = style.getPropertyValue('--purple').trim();
  var warning = style.getPropertyValue('--warning').trim();
  var success = style.getPropertyValue('--success').trim();

  // --- Chart: Department Headcount ---
  var chartDept = echarts.init(document.getElementById('chart-dept'), null, { renderer: 'svg' });
  chartDept.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    legend: { data: ['编制数', '在岗人数'], bottom: 0, textStyle: { fontSize: 12, color: muted } },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['技术部', '产品部', '市场部', '人事部', '财务部', '运营部'],
      axisLabel: { fontSize: 11, color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '编制数', type: 'bar', barWidth: 24,
        itemStyle: { color: rule, borderRadius: [4, 4, 0, 0] },
        data: [50, 30, 25, 15, 12, 20]
      },
      {
        name: '在岗人数', type: 'bar', barWidth: 24,
        itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] },
        data: [48, 28, 22, 14, 11, 18]
      }
    ],
    animation: false
  });
  window.addEventListener('resize', function() { chartDept.resize(); });

  // --- Chart: Recruitment Funnel ---
  var chartFunnel = echarts.init(document.getElementById('chart-funnel'), null, { renderer: 'svg' });
  chartFunnel.setOption({
    tooltip: { trigger: 'item', appendToBody: true, formatter: '{b}: {c}人 ({d}%)' },
    series: [{
      type: 'funnel',
      left: '10%', top: 20, bottom: 20, width: '80%',
      min: 0, max: 2000,
      sort: 'descending',
      gap: 3,
      label: { show: true, position: 'inside', fontSize: 12, color: '#fff', formatter: '{b}\n{c}人' },
      itemStyle: { borderColor: bg2, borderWidth: 2 },
      data: [
        { value: 2000, name: '简历投递', itemStyle: { color: accent } },
        { value: 800, name: '初筛通过', itemStyle: { color: '#3B82F6' } },
        { value: 320, name: '面试安排', itemStyle: { color: accent2 } },
        { value: 120, name: '面试通过', itemStyle: { color: '#14B8A6' } },
        { value: 48, name: '录用入职', itemStyle: { color: success } }
      ]
    }],
    animation: false
  });
  window.addEventListener('resize', function() { chartFunnel.resize(); });

  // --- Chart: Attendance Trend ---
  var chartAttendance = echarts.init(document.getElementById('chart-attendance'), null, { renderer: 'svg' });
  chartAttendance.setOption({
    tooltip: { trigger: 'axis', appendToBody: true },
    legend: { data: ['迟到', '缺卡', '早退', '请假'], bottom: 0, textStyle: { fontSize: 12, color: muted } },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: { fontSize: 11, color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', name: '人次',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { fontSize: 11, color: muted },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    series: [
      {
        name: '迟到', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2 }, itemStyle: { color: warning },
        data: [45, 38, 52, 41, 35, 28, 32, 30, 25, 22, 20, 18]
      },
      {
        name: '缺卡', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2 }, itemStyle: { color: accent },
        data: [30, 25, 35, 28, 22, 18, 20, 15, 12, 10, 8, 7]
      },
      {
        name: '早退', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2 }, itemStyle: { color: purple },
        data: [12, 10, 15, 11, 9, 8, 7, 6, 5, 5, 4, 3]
      },
      {
        name: '请假', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5,
        lineStyle: { width: 2 }, itemStyle: { color: accent2 },
        data: [60, 85, 45, 40, 35, 50, 55, 48, 42, 38, 30, 25]
      }
    ],
    animation: false
  });
  window.addEventListener('resize', function() { chartAttendance.resize(); });

  // --- Chart: Performance Distribution ---
  var chartPerformance = echarts.init(document.getElementById('chart-performance'), null, { renderer: 'svg' });
  chartPerformance.setOption({
    tooltip: { trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' } },
    legend: { data: ['优秀', '称职', '基本称职', '不称职'], bottom: 0, textStyle: { fontSize: 12, color: muted } },
    grid: { left: 70, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: muted, formatter: '{value}%' },
      splitLine: { lineStyle: { color: rule, type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: ['技术部', '产品部', '市场部', '人事部', '财务部', '运营部'],
      axisLabel: { fontSize: 11, color: muted },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [
      {
        name: '优秀', type: 'bar', stack: 'total', barWidth: 20,
        itemStyle: { color: success },
        data: [15, 12, 18, 10, 8, 14]
      },
      {
        name: '称职', type: 'bar', stack: 'total',
        itemStyle: { color: accent },
        data: [65, 70, 62, 72, 75, 68]
      },
      {
        name: '基本称职', type: 'bar', stack: 'total',
        itemStyle: { color: warning },
        data: [15, 13, 15, 14, 12, 13]
      },
      {
        name: '不称职', type: 'bar', stack: 'total',
        itemStyle: { color: '#EF4444' },
        data: [5, 5, 5, 4, 5, 5]
      }
    ],
    animation: false
  });
  window.addEventListener('resize', function() { chartPerformance.resize(); });
})();
