export interface Expense {
  id: string;
  amount: number;
  category: 'food' | 'transport' | 'rent' | 'medical' | 'education' | 'shopping' | 'utilities' | 'other';
  note: string;
  date: string;
}

const KEY = 'rozanapay_expenses';

function get(): Expense[] {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function set(data: Expense[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const expenseStore = {
  getAll: () => get(),
  add: (e: Expense) => {
    const list = get();
    list.unshift(e);
    set(list);
  },
  getTodayTotal: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().filter(e => e.date.startsWith(today)).reduce((s, e) => s + e.amount, 0);
  },
  getWeekTotal: () => {
    const weekAgo = Date.now() - 7 * 86400000;
    return get().filter(e => new Date(e.date).getTime() > weekAgo).reduce((s, e) => s + e.amount, 0);
  },
  getMonthTotal: () => {
    const monthAgo = Date.now() - 30 * 86400000;
    return get().filter(e => new Date(e.date).getTime() > monthAgo).reduce((s, e) => s + e.amount, 0);
  },
  getByCategory: () => {
    const expenses = get();
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  },
  seedData: () => {
    set([
      { id: 'exp-1', amount: 150, category: 'food', note: 'Lunch & tea', date: new Date().toISOString() },
      { id: 'exp-2', amount: 80, category: 'transport', note: 'Bus fare', date: new Date().toISOString() },
      { id: 'exp-3', amount: 200, category: 'food', note: 'Groceries', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'exp-4', amount: 500, category: 'medical', note: 'Medicine', date: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 'exp-5', amount: 100, category: 'transport', note: 'Auto fare', date: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'exp-6', amount: 2000, category: 'rent', note: 'Room rent partial', date: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 'exp-7', amount: 300, category: 'shopping', note: 'Clothes', date: new Date(Date.now() - 7 * 86400000).toISOString() },
    ]);
  },
};
