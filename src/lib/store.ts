// Simple localStorage-based store for MVP
export interface User {
  id: string;
  name: string;
  phone: string;
  age: number;
  occupation: string;
  city: string;
  incomeType: 'daily' | 'weekly';
  createdAt: string;
  creditScore: number;
}

export interface IncomeLog {
  id: string;
  amount: number;
  source: string;
  paymentType: 'cash' | 'upi';
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  autoSaveAmount: number;
  category: 'emergency' | 'festival' | 'school' | 'medical' | 'other';
  createdAt: string;
}

export interface Loan {
  id: string;
  amount: number;
  duration: 7 | 14 | 30;
  interestRate: number;
  status: 'pending' | 'approved' | 'active' | 'repaid' | 'overdue';
  appliedAt: string;
  approvedAt?: string;
  dueDate?: string;
  repaidAmount: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'savings' | 'loan' | 'transfer';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const STORAGE_KEYS = {
  user: 'rozanapay_user',
  income: 'rozanapay_income',
  savings: 'rozanapay_savings',
  loans: 'rozanapay_loans',
  transactions: 'rozanapay_transactions',
  onboarded: 'rozanapay_onboarded',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  isOnboarded: () => get(STORAGE_KEYS.onboarded, false) as boolean,
  setOnboarded: (v: boolean) => set(STORAGE_KEYS.onboarded, v),

  getUser: () => get<User | null>(STORAGE_KEYS.user, null),
  setUser: (u: User) => set(STORAGE_KEYS.user, u),

  getIncome: () => get<IncomeLog[]>(STORAGE_KEYS.income, []),
  addIncome: (log: IncomeLog) => {
    const logs = get<IncomeLog[]>(STORAGE_KEYS.income, []);
    logs.unshift(log);
    set(STORAGE_KEYS.income, logs);
    // Also add as transaction
    store.addTransaction({
      id: `txn-${Date.now()}`,
      type: 'income',
      amount: log.amount,
      description: `Income from ${log.source}`,
      date: log.date,
      status: 'completed',
    });
  },

  getSavings: () => get<SavingsGoal[]>(STORAGE_KEYS.savings, []),
  addSavingsGoal: (goal: SavingsGoal) => {
    const goals = get<SavingsGoal[]>(STORAGE_KEYS.savings, []);
    goals.push(goal);
    set(STORAGE_KEYS.savings, goals);
  },
  updateSavingsGoal: (id: string, update: Partial<SavingsGoal>) => {
    const goals = get<SavingsGoal[]>(STORAGE_KEYS.savings, []);
    const idx = goals.findIndex(g => g.id === id);
    if (idx >= 0) {
      goals[idx] = { ...goals[idx], ...update };
      set(STORAGE_KEYS.savings, goals);
    }
  },
  addToSavings: (goalId: string, amount: number) => {
    const goals = get<SavingsGoal[]>(STORAGE_KEYS.savings, []);
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx >= 0) {
      goals[idx].currentAmount += amount;
      set(STORAGE_KEYS.savings, goals);
      store.addTransaction({
        id: `txn-${Date.now()}`,
        type: 'savings',
        amount,
        description: `Saved to ${goals[idx].name}`,
        date: new Date().toISOString(),
        status: 'completed',
      });
    }
  },

  getLoans: () => get<Loan[]>(STORAGE_KEYS.loans, []),
  addLoan: (loan: Loan) => {
    const loans = get<Loan[]>(STORAGE_KEYS.loans, []);
    loans.unshift(loan);
    set(STORAGE_KEYS.loans, loans);
    store.addTransaction({
      id: `txn-${Date.now()}`,
      type: 'loan',
      amount: loan.amount,
      description: `Loan applied - ₹${loan.amount} for ${loan.duration} days`,
      date: loan.appliedAt,
      status: 'pending',
    });
  },
  updateLoan: (id: string, update: Partial<Loan>) => {
    const loans = get<Loan[]>(STORAGE_KEYS.loans, []);
    const idx = loans.findIndex(l => l.id === id);
    if (idx >= 0) {
      loans[idx] = { ...loans[idx], ...update };
      set(STORAGE_KEYS.loans, loans);
    }
  },

  getTransactions: () => get<Transaction[]>(STORAGE_KEYS.transactions, []),
  addTransaction: (txn: Transaction) => {
    const txns = get<Transaction[]>(STORAGE_KEYS.transactions, []);
    txns.unshift(txn);
    set(STORAGE_KEYS.transactions, txns);
  },

  // Computed
  getBalance: () => {
    const income = get<IncomeLog[]>(STORAGE_KEYS.income, []);
    const savings = get<SavingsGoal[]>(STORAGE_KEYS.savings, []);
    const loans = get<Loan[]>(STORAGE_KEYS.loans, []);
    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    const totalSaved = savings.reduce((s, g) => s + g.currentAmount, 0);
    const totalLoanRepaid = loans.reduce((s, l) => s + l.repaidAmount, 0);
    const totalLoanBorrowed = loans.filter(l => ['approved', 'active'].includes(l.status)).reduce((s, l) => s + l.amount, 0);
    return totalIncome - totalSaved - totalLoanRepaid + totalLoanBorrowed;
  },

  getTodayIncome: () => {
    const today = new Date().toISOString().split('T')[0];
    return get<IncomeLog[]>(STORAGE_KEYS.income, [])
      .filter(i => i.date.startsWith(today))
      .reduce((s, i) => s + i.amount, 0);
  },

  getTotalSavings: () => {
    return get<SavingsGoal[]>(STORAGE_KEYS.savings, [])
      .reduce((s, g) => s + g.currentAmount, 0);
  },

  getActiveLoans: () => {
    return get<Loan[]>(STORAGE_KEYS.loans, [])
      .filter(l => ['approved', 'active', 'pending'].includes(l.status));
  },

  // Seed demo data
  seedDemoData: () => {
    const now = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toISOString();
    });

    const sources = ['Construction work', 'Delivery', 'Auto driving', 'Shop work', 'Painting job'];
    const incomes: IncomeLog[] = days.map((date, i) => ({
      id: `inc-${i}`,
      amount: 300 + Math.floor(Math.random() * 700),
      source: sources[i % sources.length],
      paymentType: Math.random() > 0.5 ? 'cash' : 'upi',
      date,
    }));
    set(STORAGE_KEYS.income, incomes);

    const savingsGoals: SavingsGoal[] = [
      { id: 'sav-1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 3500, autoSaveAmount: 50, category: 'emergency', createdAt: days[10] },
      { id: 'sav-2', name: 'Diwali Fund', targetAmount: 5000, currentAmount: 1200, autoSaveAmount: 30, category: 'festival', createdAt: days[7] },
      { id: 'sav-3', name: 'School Fees', targetAmount: 8000, currentAmount: 2000, autoSaveAmount: 100, category: 'school', createdAt: days[5] },
    ];
    set(STORAGE_KEYS.savings, savingsGoals);

    const loans: Loan[] = [
      { id: 'loan-1', amount: 2000, duration: 14, interestRate: 2, status: 'active', appliedAt: days[8], approvedAt: days[7], dueDate: days[0], repaidAmount: 500 },
    ];
    set(STORAGE_KEYS.loans, loans);

    const transactions: Transaction[] = [
      ...incomes.slice(0, 5).map((inc, i) => ({
        id: `txn-inc-${i}`,
        type: 'income' as const,
        amount: inc.amount,
        description: `Income from ${inc.source}`,
        date: inc.date,
        status: 'completed' as const,
      })),
      { id: 'txn-sav-1', type: 'savings', amount: 500, description: 'Saved to Emergency Fund', date: days[2], status: 'completed' },
      { id: 'txn-loan-1', type: 'loan', amount: 2000, description: 'Loan disbursed', date: days[7], status: 'completed' },
      { id: 'txn-loan-2', type: 'loan', amount: 500, description: 'Loan repayment', date: days[1], status: 'completed' },
    ];
    set(STORAGE_KEYS.transactions, transactions);
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  },
};
