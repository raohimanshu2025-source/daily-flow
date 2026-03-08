import { store } from './store';
import { featureStore } from './store-features';
import { expenseStore } from './store-expenses';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'milestone' | 'reminder' | 'reward' | 'tip';
  icon: string;
  read: boolean;
  date: string;
}

const KEY = 'rozanapay_notifications';

function get(): AppNotification[] {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}
function set(data: AppNotification[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export const notificationStore = {
  getAll: () => get(),
  getUnreadCount: () => get().filter(n => !n.read).length,
  markAllRead: () => {
    const list = get();
    list.forEach(n => n.read = true);
    set(list);
  },
  add: (n: Omit<AppNotification, 'id' | 'read' | 'date'>) => {
    const list = get();
    list.unshift({ ...n, id: `notif-${Date.now()}`, read: false, date: new Date().toISOString() });
    set(list);
  },
  generateSmartNotifications: () => {
    const notifications: AppNotification[] = [];
    const now = new Date();

    // Savings milestone
    const totalSavings = store.getTotalSavings();
    if (totalSavings >= 1000) {
      notifications.push({
        id: 'notif-sav-milestone', title: '🎉 Savings Milestone!',
        message: `You've saved ₹${totalSavings.toLocaleString('en-IN')}! Keep it up.`,
        type: 'milestone', icon: '🎯', read: false, date: now.toISOString(),
      });
    }

    // Loan reminder
    const activeLoans = store.getActiveLoans();
    activeLoans.forEach(loan => {
      if (loan.dueDate) {
        const due = new Date(loan.dueDate);
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);
        if (daysLeft <= 3 && daysLeft >= 0) {
          notifications.push({
            id: `notif-loan-${loan.id}`, title: '⏰ Loan Due Soon',
            message: `₹${loan.amount} loan due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Repay to boost credit.`,
            type: 'reminder', icon: '💳', read: false, date: now.toISOString(),
          });
        }
      }
    });

    // Reward coins
    const coins = featureStore.getRewardCoins();
    if (coins >= 100) {
      notifications.push({
        id: 'notif-reward', title: '🪙 Reward Coins Available',
        message: `You have ${coins} reward coins. Redeem them for cashback!`,
        type: 'reward', icon: '🎁', read: false, date: now.toISOString(),
      });
    }

    // Spending tip
    const todayExpense = expenseStore.getTodayTotal();
    const avgDaily = store.getTodayIncome() || 500;
    if (todayExpense > avgDaily * 0.6) {
      notifications.push({
        id: 'notif-spend-tip', title: '💡 Spending Alert',
        message: `You've spent ₹${todayExpense} today — over 60% of your daily income. Try to save more!`,
        type: 'tip', icon: '⚠️', read: false, date: now.toISOString(),
      });
    }

    // Income streak
    const incomes = store.getIncome();
    if (incomes.length >= 7) {
      notifications.push({
        id: 'notif-streak', title: '🔥 Income Streak!',
        message: 'You\'ve logged income for 7+ days. Great financial discipline!',
        type: 'milestone', icon: '🔥', read: false, date: now.toISOString(),
      });
    }

    set(notifications);
    return notifications;
  },
};
