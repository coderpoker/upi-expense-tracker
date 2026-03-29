// =============================================
// IndexedDB Data Layer — UPI Expense Tracker
// =============================================

const DB_NAME = 'upi_expense_tracker';
const DB_VERSION = 1;

const STORES = {
  EXPENSES: 'expenses',
  BUDGETS: 'budgets',
  SETTINGS: 'settings',
};

class ExpenseDB {
  constructor() {
    this.db = null;
  }

  async open() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Expenses store
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          const expenseStore = db.createObjectStore(STORES.EXPENSES, {
            keyPath: 'id',
            autoIncrement: true,
          });
          expenseStore.createIndex('date', 'date', { unique: false });
          expenseStore.createIndex('category', 'category', { unique: false });
          expenseStore.createIndex('upiApp', 'upiApp', { unique: false });
        }

        // Budgets store
        if (!db.objectStoreNames.contains(STORES.BUDGETS)) {
          db.createObjectStore(STORES.BUDGETS, { keyPath: 'type' });
        }

        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // ---------- Expense CRUD ----------

  async addExpense(expense) {
    const db = await this.open();
    const now = new Date();
    const record = {
      ...expense,
      amount: parseFloat(expense.amount),
      date: expense.date || now.toISOString().split('T')[0],
      time: expense.time || now.toTimeString().split(' ')[0].substring(0, 5),
      createdAt: now.toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.EXPENSES, 'readwrite');
      const store = tx.objectStore(STORES.EXPENSES);
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateExpense(id, updates) {
    const db = await this.open();
    return new Promise(async (resolve, reject) => {
      const tx = db.transaction(STORES.EXPENSES, 'readwrite');
      const store = tx.objectStore(STORES.EXPENSES);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) return reject(new Error('Not found'));
        const updated = { ...existing, ...updates, id };
        if (updates.amount) updated.amount = parseFloat(updates.amount);
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async deleteExpense(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.EXPENSES, 'readwrite');
      const store = tx.objectStore(STORES.EXPENSES);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getExpense(id) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.EXPENSES, 'readonly');
      const store = tx.objectStore(STORES.EXPENSES);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllExpenses() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.EXPENSES, 'readonly');
      const store = tx.objectStore(STORES.EXPENSES);
      const request = store.getAll();
      request.onsuccess = () => {
        const sorted = request.result.sort((a, b) => {
          const dateComp = b.date.localeCompare(a.date);
          if (dateComp !== 0) return dateComp;
          return (b.time || '').localeCompare(a.time || '');
        });
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getExpensesByDateRange(startDate, endDate) {
    const all = await this.getAllExpenses();
    return all.filter((e) => e.date >= startDate && e.date <= endDate);
  }

  async getExpensesByDate(date) {
    return this.getExpensesByDateRange(date, date);
  }

  async getTodayExpenses() {
    const today = new Date().toISOString().split('T')[0];
    return this.getExpensesByDate(today);
  }

  async getWeekExpenses() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const startDate = monday.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    return this.getExpensesByDateRange(startDate, endDate);
  }

  async getMonthExpenses() {
    const today = new Date();
    const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = today.toISOString().split('T')[0];
    return this.getExpensesByDateRange(startDate, endDate);
  }

  // ---------- Budget CRUD ----------

  async setBudget(type, amount) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.BUDGETS, 'readwrite');
      const store = tx.objectStore(STORES.BUDGETS);
      const record = { type, amount: parseFloat(amount), updatedAt: new Date().toISOString() };
      const request = store.put(record);
      request.onsuccess = () => resolve(record);
      request.onerror = () => reject(request.error);
    });
  }

  async getBudget(type) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.BUDGETS, 'readonly');
      const store = tx.objectStore(STORES.BUDGETS);
      const request = store.get(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBudgets() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.BUDGETS, 'readonly');
      const store = tx.objectStore(STORES.BUDGETS);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ---------- Settings ----------

  async setSetting(key, value) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // ---------- Data Export/Import ----------

  async exportData() {
    const expenses = await this.getAllExpenses();
    const budgets = await this.getAllBudgets();
    return JSON.stringify({ expenses, budgets, exportedAt: new Date().toISOString() }, null, 2);
  }

  async importData(jsonString) {
    const data = JSON.parse(jsonString);
    const db = await this.open();

    if (data.expenses) {
      const tx = db.transaction(STORES.EXPENSES, 'readwrite');
      const store = tx.objectStore(STORES.EXPENSES);
      for (const expense of data.expenses) {
        delete expense.id;
        store.add(expense);
      }
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = rej;
      });
    }

    if (data.budgets) {
      const tx = db.transaction(STORES.BUDGETS, 'readwrite');
      const store = tx.objectStore(STORES.BUDGETS);
      for (const budget of data.budgets) {
        store.put(budget);
      }
      await new Promise((res, rej) => {
        tx.oncomplete = res;
        tx.onerror = rej;
      });
    }
  }
}

// Singleton
const db = new ExpenseDB();
