// =============================================
// UPI Expense Tracker — Main Application
// =============================================

const CATEGORIES = {
  food: { emoji: '🍔', label: 'Food', color: '#ffd93d' },
  transport: { emoji: '🚗', label: 'Transport', color: '#4ecdc4' },
  shopping: { emoji: '🛍️', label: 'Shopping', color: '#a78bfa' },
  bills: { emoji: '📄', label: 'Bills', color: '#ff6b6b' },
  entertainment: { emoji: '🎬', label: 'Entertainment', color: '#ff8a5c' },
  health: { emoji: '💊', label: 'Health', color: '#06d6a0' },
  recharge: { emoji: '📱', label: 'Recharge', color: '#87ceeb' },
  others: { emoji: '📦', label: 'Others', color: '#dda0dd' },
};

// ---------- State ----------
let currentPage = 'dashboard';
let currentFilter = 'all';
let editingExpenseId = null;
let selectedCategory = null;
let selectedUpiApp = null;
let selectedBudgetType = null;

// ---------- DOM Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---------- Navigation ----------
function navigateTo(page) {
  currentPage = page;

  $$('.page').forEach((p) => p.classList.remove('active'));
  $(`#page-${page}`).classList.add('active');

  $$('.nav-item').forEach((n) => n.classList.remove('active'));
  $(`.nav-item[data-page="${page}"]`).classList.add('active');

  // Refresh page data
  switch (page) {
    case 'dashboard':
      refreshDashboard();
      break;
    case 'expenses':
      refreshExpenses();
      break;
    case 'budgets':
      refreshBudgets();
      break;
    case 'analytics':
      refreshAnalytics();
      break;
  }
}

// ---------- Dashboard ----------
async function refreshDashboard() {
  try {
    // Today's totals
    const todayExpenses = await db.getTodayExpenses();
    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    $('#today-total').textContent = formatCurrency(todayTotal);
    $('#today-count').textContent = todayExpenses.length === 0
      ? 'No expenses yet — tap + to add'
      : `${todayExpenses.length} transaction${todayExpenses.length !== 1 ? 's' : ''} today`;

    // Week total
    const weekExpenses = await db.getWeekExpenses();
    const weekTotal = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    $('#week-total').textContent = formatCurrency(weekTotal);

    // Month total
    const monthExpenses = await db.getMonthExpenses();
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    $('#month-total').textContent = formatCurrency(monthTotal);

    // Sparkline — last 7 days
    const sparkData = await getLast7DayTotals();
    const sparkCanvas = $('#hero-sparkline');
    if (sparkCanvas) {
      ChartRenderer.drawSparkline(sparkCanvas, sparkData, '#ffffff');
    }

    // Budget progress
    await renderBudgetProgress();

    // Recent expenses (last 5)
    const allExpenses = await db.getAllExpenses();
    renderExpenseList(allExpenses.slice(0, 5), '#recent-expenses-list', true);
  } catch (err) {
    console.error('Dashboard refresh error:', err);
  }
}

async function getLast7DayTotals() {
  const totals = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const expenses = await db.getExpensesByDate(dateStr);
    totals.push(expenses.reduce((sum, e) => sum + e.amount, 0));
  }
  return totals;
}

async function renderBudgetProgress() {
  const container = $('#budget-progress-list');
  const statuses = await notifier.getBudgetStatus();

  if (statuses.length === 0) {
    container.innerHTML = `
      <div class="card card-sm" style="text-align: center; padding: 20px;">
        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
        <div style="font-size: 13px; color: var(--text-muted);">No budgets set yet. Go to Budgets to set up.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = statuses.map((s) => {
    const statusClass = s.percentage >= 90 ? 'danger' : s.percentage >= 75 ? 'warning' : 'safe';
    const statusText = s.exceeded
      ? `Exceeded by ${formatCurrency(s.spent - s.budget)}`
      : `${formatCurrency(s.remaining)} remaining`;

    return `
      <div class="card budget-progress-item">
        <div class="budget-progress-header">
          <span class="budget-progress-label">${s.label}</span>
          <span class="budget-progress-amount">${formatCurrency(s.spent)} / ${formatCurrency(s.budget)}</span>
        </div>
        <canvas class="budget-progress-bar" data-percentage="${s.percentage}" data-spent="${s.spent}" data-budget="${s.budget}"></canvas>
        <div class="budget-status ${statusClass}">${s.percentage.toFixed(0)}% — ${statusText}</div>
      </div>
    `;
  }).join('');

  // Draw progress bars
  container.querySelectorAll('.budget-progress-bar').forEach((canvas) => {
    const pct = parseFloat(canvas.dataset.percentage);
    const spent = parseFloat(canvas.dataset.spent);
    const budget = parseFloat(canvas.dataset.budget);
    setTimeout(() => ChartRenderer.drawProgressBar(canvas, pct, spent, budget), 50);
  });
}

// ---------- Expenses Page ----------
async function refreshExpenses() {
  let expenses;

  switch (currentFilter) {
    case 'today':
      expenses = await db.getTodayExpenses();
      break;
    case 'week':
      expenses = await db.getWeekExpenses();
      break;
    case 'month':
      expenses = await db.getMonthExpenses();
      break;
    default:
      expenses = await db.getAllExpenses();
  }

  renderExpenseList(expenses, '#expenses-list');
}

function renderExpenseList(expenses, containerSel, compact = false) {
  const container = $(containerSel);

  if (!expenses || expenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">No Expenses Found</div>
        <div class="empty-desc">Tap the + button to log your first UPI payment</div>
      </div>
    `;
    return;
  }

  // Group by date
  const grouped = {};
  expenses.forEach((e) => {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  });

  let html = '';
  for (const [date, items] of Object.entries(grouped)) {
    const dayTotal = items.reduce((sum, e) => sum + e.amount, 0);

    html += `
      <div class="date-group-header">
        <span>${formatDate(date)}</span>
        <span class="date-group-total">−${formatCurrency(dayTotal)}</span>
      </div>
    `;

    items.forEach((item) => {
      const cat = CATEGORIES[item.category] || CATEGORIES.others;
      html += `
        <div class="card card-sm expense-item" data-id="${item.id}" onclick="openEditExpense(${item.id})">
          <div class="expense-icon ${item.category}">${cat.emoji}</div>
          <div class="expense-details">
            <div class="expense-merchant">${escapeHtml(item.merchant || cat.label)}</div>
            <div class="expense-meta">
              <span>${cat.label}</span>
              <span>•</span>
              <span>${item.time || ''}</span>
              ${item.upiApp ? `<span>•</span><span>${item.upiApp}</span>` : ''}
            </div>
          </div>
          <div class="expense-amount">−${formatCurrency(item.amount)}</div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Budgets Page ----------
async function refreshBudgets() {
  const container = $('#budgets-list');
  const statuses = await notifier.getBudgetStatus();
  const budgetTypes = ['daily', 'weekly', 'monthly'];

  let html = '';

  for (const type of budgetTypes) {
    const status = statuses.find((s) => s.type === type);

    if (status) {
      const statusClass = status.percentage >= 90 ? 'danger' : status.percentage >= 75 ? 'warning' : 'safe';
      html += `
        <div class="card budget-card">
          <div class="budget-type-label">${type} budget</div>
          <div class="budget-amounts">
            <span class="budget-spent">${formatCurrency(status.spent)}</span>
            <span class="budget-limit">of ${formatCurrency(status.budget)}</span>
          </div>
          <canvas class="budget-progress-canvas budget-pbar" data-pct="${status.percentage}" data-spent="${status.spent}" data-budget="${status.budget}"></canvas>
          <div class="budget-status ${statusClass}">
            ${status.exceeded
              ? `🚨 Exceeded by ${formatCurrency(status.spent - status.budget)}`
              : `${formatCurrency(status.remaining)} remaining (${status.percentage.toFixed(0)}%)`
            }
          </div>
          <button class="set-budget-btn" style="margin-top: 12px;" onclick="openBudgetModal('${type}')">✏️ Edit Budget</button>
        </div>
      `;
    } else {
      html += `
        <button class="set-budget-btn" onclick="openBudgetModal('${type}')">
          + Set ${type.charAt(0).toUpperCase() + type.slice(1)} Budget
        </button>
      `;
    }
  }

  // Data management
  html += `
    <div class="data-section">
      <div class="section-title" style="margin-bottom: 12px;">Data Management</div>
      <button class="data-btn" onclick="exportData()">📤 Export All Data (JSON)</button>
      <button class="data-btn" onclick="document.getElementById('import-file').click()">📥 Import Data</button>
      <input type="file" id="import-file" accept=".json" style="display: none;" onchange="importData(event)">
    </div>
  `;

  container.innerHTML = html;

  // Draw progress bars
  setTimeout(() => {
    container.querySelectorAll('.budget-pbar').forEach((canvas) => {
      const pct = parseFloat(canvas.dataset.pct);
      const spent = parseFloat(canvas.dataset.spent);
      const budget = parseFloat(canvas.dataset.budget);
      ChartRenderer.drawProgressBar(canvas, pct, spent, budget);
    });
  }, 50);
}

// ---------- Analytics Page ----------
async function refreshAnalytics() {
  const expenses = await db.getMonthExpenses();

  // Category breakdown (donut)
  const categoryTotals = {};
  expenses.forEach((e) => {
    const cat = e.category || 'others';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
  });

  const donutData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val]) => ({
      label: CATEGORIES[cat]?.label || cat,
      value: val,
      color: CATEGORIES[cat]?.color || '#888',
    }));

  const totalMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  setTimeout(() => {
    ChartRenderer.drawDonut($('#chart-donut'), donutData, formatCurrency(totalMonth));
  }, 50);

  // Legend
  const legendContainer = $('#chart-legend');
  legendContainer.innerHTML = donutData.map((d, i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background: ${CHART_COLORS[i % CHART_COLORS.length]}"></span>
      <span>${d.label}: ${formatCurrency(d.value)}</span>
    </div>
  `).join('');

  // Bar chart — daily for last 7 days
  const last7Labels = [];
  const last7Values = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    last7Labels.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));
    const dayExpenses = await db.getExpensesByDate(dateStr);
    last7Values.push(dayExpenses.reduce((sum, e) => sum + e.amount, 0));
  }

  setTimeout(() => {
    ChartRenderer.drawBarChart($('#chart-bar'), last7Labels, last7Values);
  }, 100);

  // Top categories list
  const topCats = $('#top-categories');
  if (donutData.length === 0) {
    topCats.innerHTML = '<div style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 16px;">No data this month</div>';
  } else {
    topCats.innerHTML = donutData.slice(0, 5).map((d, i) => `
      <div style="display: flex; align-items: center; gap: 10px; padding: 10px 0; ${i < donutData.length - 1 ? 'border-bottom: 1px solid var(--border-subtle);' : ''}">
        <span style="font-size: 20px;">${CATEGORIES[Object.keys(categoryTotals)[Object.values(categoryTotals).indexOf(d.value)]]?.emoji || '📦'}</span>
        <span style="flex: 1; font-size: 14px; font-weight: 500;">${d.label}</span>
        <span style="font-family: Outfit; font-weight: 600; color: var(--accent-coral);">${formatCurrency(d.value)}</span>
        <span style="font-size: 11px; color: var(--text-muted);">${totalMonth > 0 ? ((d.value / totalMonth) * 100).toFixed(0) : 0}%</span>
      </div>
    `).join('');
  }
}

// ---------- Expense Modal ----------
function openAddExpense() {
  editingExpenseId = null;
  selectedCategory = null;
  selectedUpiApp = null;

  $('#expense-modal-title').textContent = 'Add Expense';
  $('#expense-form').reset();
  $('#btn-delete-expense').classList.add('hidden');
  $('#btn-save-expense').textContent = '💾 Save Expense';

  // Set defaults
  const now = new Date();
  $('#input-date').value = now.toISOString().split('T')[0];
  $('#input-time').value = now.toTimeString().split(' ')[0].substring(0, 5);

  // Clear selections
  $$('.category-option').forEach((c) => c.classList.remove('selected'));
  $$('.upi-chip').forEach((c) => c.classList.remove('selected'));

  $('#modal-expense').classList.add('active');
  setTimeout(() => $('#input-amount').focus(), 300);
}

async function openEditExpense(id) {
  const expense = await db.getExpense(id);
  if (!expense) return;

  editingExpenseId = id;
  selectedCategory = expense.category;
  selectedUpiApp = expense.upiApp;

  $('#expense-modal-title').textContent = 'Edit Expense';
  $('#btn-delete-expense').classList.remove('hidden');
  $('#btn-save-expense').textContent = '✏️ Update Expense';

  $('#input-amount').value = expense.amount;
  $('#input-merchant').value = expense.merchant || '';
  $('#input-date').value = expense.date;
  $('#input-time').value = expense.time || '';
  $('#input-notes').value = expense.notes || '';

  // Category selection
  $$('.category-option').forEach((c) => {
    c.classList.toggle('selected', c.dataset.category === expense.category);
  });

  // UPI app selection
  $$('.upi-chip').forEach((c) => {
    c.classList.toggle('selected', c.dataset.upi === expense.upiApp);
  });

  $('#modal-expense').classList.add('active');
}

function closeExpenseModal() {
  $('#modal-expense').classList.remove('active');
  editingExpenseId = null;
}

// ---------- Budget Modal ----------
function openBudgetModal(preselectedType = null) {
  selectedBudgetType = preselectedType;
  $('#budget-form').reset();

  $$('.budget-type-btn').forEach((b) => {
    b.classList.toggle('selected', b.dataset.budgetType === preselectedType);
  });

  if (preselectedType) {
    db.getBudget(preselectedType).then((budget) => {
      if (budget) {
        $('#input-budget-amount').value = budget.amount;
      }
    });
  }

  $('#modal-budget').classList.add('active');
  setTimeout(() => $('#input-budget-amount').focus(), 300);
}

function closeBudgetModal() {
  $('#modal-budget').classList.remove('active');
  selectedBudgetType = null;
}

// ---------- Data Export/Import ----------
async function exportData() {
  try {
    const json = await db.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upi-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  } catch (err) {
    showToast('Export failed: ' + err.message, 'error');
  }
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    await db.importData(text);
    showToast('Data imported successfully!');
    navigateTo(currentPage);
  } catch (err) {
    showToast('Import failed: ' + err.message, 'error');
  }

  event.target.value = '';
}

// ---------- Event Listeners ----------
function initEvents() {
  // Navigation
  $$('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.page);
    });
  });

  // Dashboard shortcuts
  $('#btn-goto-budgets')?.addEventListener('click', () => navigateTo('budgets'));
  $('#btn-goto-expenses')?.addEventListener('click', () => navigateTo('expenses'));

  // FAB
  $('#fab-add').addEventListener('click', openAddExpense);

  // Category selection
  $$('.category-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      $$('.category-option').forEach((c) => c.classList.remove('selected'));
      opt.classList.add('selected');
      selectedCategory = opt.dataset.category;
    });
  });

  // UPI app selection
  $$('.upi-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.upi-chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedUpiApp = chip.dataset.upi;
    });
  });

  // Budget type selection
  $$('.budget-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.budget-type-btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedBudgetType = btn.dataset.budgetType;
    });
  });

  // Expense form submission
  $('#expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = $('#input-amount').value;
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (!selectedCategory) {
      showToast('Please select a category', 'error');
      return;
    }

    const expenseData = {
      amount: parseFloat(amount),
      category: selectedCategory,
      merchant: $('#input-merchant').value.trim(),
      upiApp: selectedUpiApp || '',
      date: $('#input-date').value,
      time: $('#input-time').value,
      notes: $('#input-notes').value.trim(),
    };

    try {
      if (editingExpenseId) {
        await db.updateExpense(editingExpenseId, expenseData);
        showToast('Expense updated! ✏️');
      } else {
        await db.addExpense(expenseData);
        showToast('Expense added! ✅');
      }

      closeExpenseModal();
      navigateTo(currentPage);

      // Check budgets after adding
      notifier.checkBudgets();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Delete expense
  $('#btn-delete-expense').addEventListener('click', async () => {
    if (!editingExpenseId) return;

    if (confirm('Delete this expense?')) {
      try {
        await db.deleteExpense(editingExpenseId);
        showToast('Expense deleted 🗑️');
        closeExpenseModal();
        navigateTo(currentPage);
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    }
  });

  // Budget form submission
  $('#budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedBudgetType) {
      showToast('Please select a budget period', 'error');
      return;
    }

    const amount = $('#input-budget-amount').value;
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      await db.setBudget(selectedBudgetType, parseFloat(amount));
      showToast(`${selectedBudgetType.charAt(0).toUpperCase() + selectedBudgetType.slice(1)} budget set! 🎯`);
      closeBudgetModal();
      notifier.resetAlerts();
      navigateTo(currentPage);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  });

  // Modal overlay close
  $$('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Expense filters
  $$('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      refreshExpenses();
    });
  });

  // Notification permission
  $('#btn-enable-notif')?.addEventListener('click', async () => {
    const granted = await notifier.requestPermission();
    if (granted) {
      showToast('Notifications enabled! 🔔');
      $('#notif-banner').classList.add('hidden');
      notifier.startMonitoring();
    } else {
      showToast('Notifications blocked. Enable in browser settings.', 'error');
    }
  });

  $('#btn-notif')?.addEventListener('click', async () => {
    const granted = await notifier.requestPermission();
    if (granted) {
      showToast('Notifications already enabled! 🔔');
    } else {
      showToast('Notifications blocked.', 'error');
    }
  });

  // Export button
  $('#btn-export')?.addEventListener('click', exportData);

  // Handle window resize for charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (currentPage === 'analytics') refreshAnalytics();
      if (currentPage === 'dashboard') refreshDashboard();
    }, 250);
  });
}

// ---------- Initialization ----------
async function init() {
  try {
    await db.open();
    console.log('📦 Database ready');

    initEvents();

    // Check notification status
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        $('#notif-banner').classList.add('hidden');
        notifier.permissionGranted = true;
        notifier.startMonitoring();
      } else if (Notification.permission === 'denied') {
        $('#notif-banner').classList.add('hidden');
      }
    } else {
      $('#notif-banner').classList.add('hidden');
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then(() => {
        console.log('🔧 Service Worker registered');
      }).catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    // Load dashboard
    await refreshDashboard();

    console.log('✅ UPI Tracker ready');
  } catch (err) {
    console.error('Init error:', err);
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
