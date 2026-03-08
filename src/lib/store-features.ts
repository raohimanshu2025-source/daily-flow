// Feature store for additional fintech features

export interface GoldInvestment {
  id: string;
  amountInr: number;
  goldGrams: number;
  pricePerGram: number;
  date: string;
}

export interface InsurancePolicy {
  id: string;
  type: 'accident' | 'health' | 'tool' | 'life';
  dailyPremium: number;
  coverageAmount: number;
  status: 'active' | 'expired' | 'claimed';
  startDate: string;
  endDate: string;
}

export interface BnplOrder {
  id: string;
  category: 'grocery' | 'medicine' | 'school' | 'essentials';
  amount: number;
  dailyRepayment: number;
  totalRepaid: number;
  durationDays: number;
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
}

export interface RewardEntry {
  id: string;
  coins: number;
  reason: string;
  date: string;
}

export interface BillPayment {
  id: string;
  type: 'mobile' | 'electricity' | 'dth' | 'gas' | 'water';
  provider: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface GroupSavings {
  id: string;
  name: string;
  members: number;
  monthlyContribution: number;
  totalPool: number;
  currentRound: number;
  totalRounds: number;
  status: 'active' | 'completed';
  createdAt: string;
}

const KEYS = {
  gold: 'rozanapay_gold',
  insurance: 'rozanapay_insurance',
  bnpl: 'rozanapay_bnpl',
  rewards: 'rozanapay_rewards',
  rewardCoins: 'rozanapay_reward_coins',
  bills: 'rozanapay_bills',
  groups: 'rozanapay_groups',
  nudges: 'rozanapay_nudges_seen',
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
}
function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const featureStore = {
  // Gold
  getGoldInvestments: () => get<GoldInvestment[]>(KEYS.gold, []),
  addGoldInvestment: (inv: GoldInvestment) => {
    const list = get<GoldInvestment[]>(KEYS.gold, []);
    list.unshift(inv);
    set(KEYS.gold, list);
  },
  getTotalGoldGrams: () => get<GoldInvestment[]>(KEYS.gold, []).reduce((s, g) => s + g.goldGrams, 0),
  getTotalGoldValue: () => {
    const grams = get<GoldInvestment[]>(KEYS.gold, []).reduce((s, g) => s + g.goldGrams, 0);
    return Math.round(grams * 7200); // mock current price
  },

  // Insurance
  getInsurancePolicies: () => get<InsurancePolicy[]>(KEYS.insurance, []),
  addInsurancePolicy: (p: InsurancePolicy) => {
    const list = get<InsurancePolicy[]>(KEYS.insurance, []);
    list.unshift(p);
    set(KEYS.insurance, list);
  },

  // BNPL
  getBnplOrders: () => get<BnplOrder[]>(KEYS.bnpl, []),
  addBnplOrder: (o: BnplOrder) => {
    const list = get<BnplOrder[]>(KEYS.bnpl, []);
    list.unshift(o);
    set(KEYS.bnpl, list);
  },

  // Rewards
  getRewardCoins: () => get<number>(KEYS.rewardCoins, 0),
  addRewardCoins: (amount: number, reason: string) => {
    const current = get<number>(KEYS.rewardCoins, 0);
    set(KEYS.rewardCoins, current + amount);
    const history = get<RewardEntry[]>(KEYS.rewards, []);
    history.unshift({ id: `rw-${Date.now()}`, coins: amount, reason, date: new Date().toISOString() });
    set(KEYS.rewards, history);
  },
  getRewardHistory: () => get<RewardEntry[]>(KEYS.rewards, []),

  // Bills
  getBillPayments: () => get<BillPayment[]>(KEYS.bills, []),
  addBillPayment: (b: BillPayment) => {
    const list = get<BillPayment[]>(KEYS.bills, []);
    list.unshift(b);
    set(KEYS.bills, list);
  },

  // Group Savings
  getGroupSavings: () => get<GroupSavings[]>(KEYS.groups, []),
  addGroupSavings: (g: GroupSavings) => {
    const list = get<GroupSavings[]>(KEYS.groups, []);
    list.unshift(g);
    set(KEYS.groups, list);
  },

  // Seed demo data
  seedFeatureData: () => {
    set(KEYS.gold, [
      { id: 'gold-1', amountInr: 500, goldGrams: 0.07, pricePerGram: 7142, date: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'gold-2', amountInr: 200, goldGrams: 0.028, pricePerGram: 7142, date: new Date(Date.now() - 86400000).toISOString() },
    ]);
    set(KEYS.insurance, [
      { id: 'ins-1', type: 'accident', dailyPremium: 3, coverageAmount: 100000, status: 'active', startDate: new Date(Date.now() - 86400000 * 30).toISOString(), endDate: new Date(Date.now() + 86400000 * 335).toISOString() },
    ]);
    set(KEYS.bnpl, [
      { id: 'bnpl-1', category: 'grocery', amount: 2000, dailyRepayment: 100, totalRepaid: 800, durationDays: 20, status: 'active', createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
    ]);
    set(KEYS.rewardCoins, 350);
    set(KEYS.rewards, [
      { id: 'rw-1', coins: 50, reason: 'Daily login streak (7 days)', date: new Date().toISOString() },
      { id: 'rw-2', coins: 100, reason: 'On-time loan repayment', date: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'rw-3', coins: 200, reason: 'Savings milestone - ₹3000', date: new Date(Date.now() - 86400000 * 5).toISOString() },
    ]);
    set(KEYS.bills, [
      { id: 'bill-1', type: 'mobile', provider: 'Jio', amount: 299, status: 'completed', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    ]);
    set(KEYS.groups, [
      { id: 'grp-1', name: 'Neighbourhood Chit', members: 10, monthlyContribution: 1000, totalPool: 10000, currentRound: 3, totalRounds: 10, status: 'active', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
    ]);
  },
};
