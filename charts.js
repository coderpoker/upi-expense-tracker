// =============================================
// Canvas-Based Chart Rendering — Zero Dependencies
// =============================================

const CHART_COLORS = [
  '#7c3aed', // Purple
  '#06d6a0', // Teal
  '#ff6b6b', // Coral
  '#ffd93d', // Yellow
  '#4ecdc4', // Aqua
  '#ff8a5c', // Orange
  '#a8e6cf', // Mint
  '#dda0dd', // Plum
  '#87ceeb', // Sky
  '#f0e68c', // Khaki
];

class ChartRenderer {
  // ---------- Donut Chart ----------
  static drawDonut(canvas, data, centerText = '') {
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 10;
    const innerRadius = outerRadius * 0.6;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return;

    ctx.clearRect(0, 0, width, height);

    let startAngle = -Math.PI / 2;

    data.forEach((item, i) => {
      const sliceAngle = (item.value / total) * (Math.PI * 2);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = CHART_COLORS[i % CHART_COLORS.length];
      ctx.fill();

      // Add subtle shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      startAngle = endAngle;
    });

    // Center text
    if (centerText) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerText, centerX, centerY - 8);

      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Total Spent', centerX, centerY + 12);
    }
  }

  // ---------- Bar Chart ----------
  static drawBarChart(canvas, labels, values, color = '#7c3aed') {
    if (!canvas || !labels || labels.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 15, bottom: 35, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...values, 1);
    const barWidth = (chartWidth / labels.length) * 0.6;
    const gap = (chartWidth / labels.length) * 0.4;

    // Grid lines
    const gridLines = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      const val = maxValue - (maxValue / gridLines) * i;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText('₹' + Math.round(val).toLocaleString('en-IN'), padding.left - 5, y + 3);
    }

    // Bars
    labels.forEach((label, i) => {
      const x = padding.left + i * (barWidth + gap) + gap / 2;
      const barHeight = (values[i] / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Bar gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '60');

      ctx.fillStyle = gradient;

      // Rounded top
      const radius = Math.min(4, barWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x, y + barHeight);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + barWidth / 2, height - padding.bottom + 15);

      // Value on top
      if (values[i] > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText('₹' + values[i].toLocaleString('en-IN'), x + barWidth / 2, y - 5);
      }
    });
  }

  // ---------- Progress Bar (Budget) ----------
  static drawProgressBar(canvas, percentage, spent, budget) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barHeight = 10;
    const y = (height - barHeight) / 2;
    const radius = barHeight / 2;

    // Background track
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(0, y, width, barHeight, radius);
    ctx.fill();

    // Fill
    const fillWidth = Math.min(percentage / 100, 1) * width;
    let fillColor;

    if (percentage >= 100) {
      fillColor = '#ff4444';
    } else if (percentage >= 75) {
      fillColor = '#ffaa00';
    } else if (percentage >= 50) {
      fillColor = '#ffd93d';
    } else {
      fillColor = '#06d6a0';
    }

    if (fillWidth > 0) {
      const gradient = ctx.createLinearGradient(0, 0, fillWidth, 0);
      gradient.addColorStop(0, fillColor + 'aa');
      gradient.addColorStop(1, fillColor);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, y, Math.max(fillWidth, barHeight), barHeight, radius);
      ctx.fill();

      // Glow
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
  }

  // ---------- Mini Sparkline ----------
  static drawSparkline(canvas, values, color = '#7c3aed') {
    if (!canvas || !values || values.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 4;

    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal || 1;
    const step = (width - padding * 2) / (values.length - 1);

    // Area fill
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    values.forEach((val, i) => {
      const x = padding + i * step;
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.lineTo(padding + (values.length - 1) * step, height - padding);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '05');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    values.forEach((val, i) => {
      const x = padding + i * step;
      const y = height - padding - ((val - minVal) / range) * (height - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // End dot
    const lastX = padding + (values.length - 1) * step;
    const lastY = height - padding - ((values[values.length - 1] - minVal) / range) * (height - padding * 2);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#0f0f1a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
