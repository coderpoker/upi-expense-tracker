// =============================================
// Budget Reminder & Notification System
// =============================================

class BudgetNotifier {
  constructor() {
    this.permissionGranted = false;
    this.checkInterval = null;
    this.lastAlerts = {}; // track last alert per budget type to avoid spam
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const result = await Notification.requestPermission();
    this.permissionGranted = result === 'granted';
    return this.permissionGranted;
  }

  sendNotification(title, body, tag) {
    if (!this.permissionGranted) return;

    const options = {
      body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      tag: tag || 'budget-alert',
      vibrate: [100, 50, 100],
      requireInteraction: false,
    };

    try {
      new Notification(title, options);
    } catch (e) {
      // Fallback for environments where Notification constructor fails
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, options);
        });
      }
    }
  }

  async checkBudgets() {
    try {
      const budgets = await db.getAllBudgets();
      if (!budgets || budgets.length === 0) return;

      for (const budget of budgets) {
        let expenses = [];
        let periodLabel = '';

        switch (budget.type) {
          case 'daily':
            expenses = await db.getTodayExpenses();
            periodLabel = "Today's";
            break;
          case 'weekly':
            expenses = await db.getWeekExpenses();
            periodLabel = "This week's";
            break;
          case 'monthly':
            expenses = await db.getMonthExpenses();
            periodLabel = "This month's";
            break;
        }

        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const percentage = (total / budget.amount) * 100;
        const alertKey = `${budget.type}-${Math.floor(percentage / 25) * 25}`;

        // Don't re-alert for same threshold
        if (this.lastAlerts[alertKey]) continue;

        if (percentage >= 100) {
          this.sendNotification(
            '🚨 Budget Exceeded!',
            `${periodLabel} spending ₹${total.toLocaleString('en-IN')} has exceeded your ${budget.type} budget of ₹${budget.amount.toLocaleString('en-IN')}`,
            `exceeded-${budget.type}`
          );
          this.lastAlerts[alertKey] = true;
        } else if (percentage >= 90) {
          this.sendNotification(
            '⚠️ Budget Alert — 90%',
            `${periodLabel} spending is at ₹${total.toLocaleString('en-IN')} of ₹${budget.amount.toLocaleString('en-IN')} ${budget.type} budget`,
            `alert90-${budget.type}`
          );
          this.lastAlerts[alertKey] = true;
        } else if (percentage >= 75) {
          this.sendNotification(
            '💡 Budget Warning — 75%',
            `${periodLabel} spending reached ₹${total.toLocaleString('en-IN')} of ₹${budget.amount.toLocaleString('en-IN')} ${budget.type} budget`,
            `alert75-${budget.type}`
          );
          this.lastAlerts[alertKey] = true;
        }
      }
    } catch (err) {
      console.error('Budget check error:', err);
    }
  }

  startMonitoring(intervalMs = 60000) {
    // Check every minute
    this.checkBudgets();
    this.checkInterval = setInterval(() => this.checkBudgets(), intervalMs);

    // Also check when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkBudgets();
      }
    });
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Reset alerts at the start of each new period
  resetAlerts() {
    this.lastAlerts = {};
  }

  async getBudgetStatus() {
    const budgets = await db.getAllBudgets();
    const statuses = [];

    for (const budget of budgets) {
      let expenses = [];
      let periodLabel = '';

      switch (budget.type) {
        case 'daily':
          expenses = await db.getTodayExpenses();
          periodLabel = 'Today';
          break;
        case 'weekly':
          expenses = await db.getWeekExpenses();
          periodLabel = 'This Week';
          break;
        case 'monthly':
          expenses = await db.getMonthExpenses();
          periodLabel = 'This Month';
          break;
      }

      const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      statuses.push({
        type: budget.type,
        label: periodLabel,
        budget: budget.amount,
        spent,
        remaining: Math.max(0, budget.amount - spent),
        percentage: Math.min(100, percentage),
        exceeded: spent > budget.amount,
      });
    }

    return statuses;
  }
}

const notifier = new BudgetNotifier();
