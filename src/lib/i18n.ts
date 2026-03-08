// Internationalization - Hindi/English support
export type Language = 'en' | 'hi';

const translations = {
  // Common
  'app.name': { en: 'RozanaPay', hi: 'रोज़ानापे' },
  'common.save': { en: 'Save', hi: 'बचाएं' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.add': { en: 'Add', hi: 'जोड़ें' },
  'common.seeAll': { en: 'See All', hi: 'सब देखें' },
  'common.noData': { en: 'No data yet', hi: 'अभी कोई डेटा नहीं' },

  // Navigation
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.income': { en: 'Income', hi: 'आय' },
  'nav.services': { en: 'Services', hi: 'सेवाएं' },
  'nav.savings': { en: 'Savings', hi: 'बचत' },
  'nav.insights': { en: 'Insights', hi: 'विश्लेषण' },

  // Dashboard
  'dash.greeting': { en: 'Good morning', hi: 'नमस्ते' },
  'dash.balance': { en: 'Available Balance', hi: 'उपलब्ध शेष' },
  'dash.todayIncome': { en: "Today's Income", hi: 'आज की आय' },
  'dash.totalSavings': { en: 'Total Savings', hi: 'कुल बचत' },
  'dash.addIncome': { en: 'Add Income', hi: 'आय जोड़ें' },
  'dash.saveMoney': { en: 'Save Money', hi: 'पैसे बचाएं' },
  'dash.sendMoney': { en: 'Send Money', hi: 'पैसे भेजें' },
  'dash.getLoan': { en: 'Get Loan', hi: 'लोन लें' },
  'dash.creditScore': { en: 'Credit Score', hi: 'क्रेडिट स्कोर' },
  'dash.activeLoans': { en: 'Active Loans', hi: 'सक्रिय लोन' },
  'dash.exploreServices': { en: 'Explore Services', hi: 'सेवाएं देखें' },
  'dash.recentActivity': { en: 'Recent Activity', hi: 'हाल की गतिविधि' },

  // Income
  'income.title': { en: 'Daily Income', hi: 'दैनिक आय' },
  'income.today': { en: 'Today', hi: 'आज' },
  'income.thisWeek': { en: 'This Week', hi: 'इस सप्ताह' },
  'income.thisMonth': { en: 'This Month', hi: 'इस महीने' },
  'income.addToday': { en: "Add Today's Income", hi: 'आज की आय जोड़ें' },
  'income.history': { en: 'Income History', hi: 'आय इतिहास' },
  'income.amount': { en: 'Amount (₹)', hi: 'राशि (₹)' },
  'income.source': { en: 'Source of Work', hi: 'काम का स्रोत' },
  'income.paymentType': { en: 'Payment Type', hi: 'भुगतान प्रकार' },

  // Savings
  'savings.title': { en: 'Smart Savings', hi: 'स्मार्ट बचत' },
  'savings.totalSaved': { en: 'Total Saved', hi: 'कुल बचत' },
  'savings.createGoal': { en: 'Create Savings Goal', hi: 'बचत लक्ष्य बनाएं' },
  'savings.newGoal': { en: 'New Savings Goal', hi: 'नया बचत लक्ष्य' },
  'savings.addToSavings': { en: 'Add to Savings', hi: 'बचत में जोड़ें' },
  'savings.autoSave': { en: 'Auto-save per day', hi: 'रोज़ाना ऑटो-सेव' },
  'savings.completed': { en: 'completed', hi: 'पूर्ण' },

  // Expenses
  'expense.title': { en: 'Expense Tracker', hi: 'खर्चे का हिसाब' },
  'expense.today': { en: "Today's Expenses", hi: 'आज के खर्चे' },
  'expense.addExpense': { en: 'Add Expense', hi: 'खर्चा जोड़ें' },
  'expense.category': { en: 'Category', hi: 'श्रेणी' },
  'expense.history': { en: 'Expense History', hi: 'खर्चे का इतिहास' },
  'expense.food': { en: 'Food', hi: 'खाना' },
  'expense.transport': { en: 'Transport', hi: 'यातायात' },
  'expense.rent': { en: 'Rent', hi: 'किराया' },
  'expense.medical': { en: 'Medical', hi: 'चिकित्सा' },
  'expense.education': { en: 'Education', hi: 'शिक्षा' },
  'expense.shopping': { en: 'Shopping', hi: 'खरीदारी' },
  'expense.utilities': { en: 'Utilities', hi: 'बिजली-पानी' },
  'expense.other': { en: 'Other', hi: 'अन्य' },

  // Services
  'services.title': { en: 'All Services', hi: 'सभी सेवाएं' },
  'services.subtitle': { en: 'Everything you need in one place', hi: 'एक जगह सब कुछ' },

  // Analytics
  'analytics.title': { en: 'Financial Insights', hi: 'वित्तीय विश्लेषण' },
  'analytics.avgDaily': { en: 'Avg. Daily Income', hi: 'औसत दैनिक आय' },
  'analytics.savingsRate': { en: 'Savings Rate', hi: 'बचत दर' },
  'analytics.outstandingLoans': { en: 'Outstanding Loans', hi: 'बकाया लोन' },
  'analytics.totalTxns': { en: 'Total Transactions', hi: 'कुल लेनदेन' },
  'analytics.weeklyIncome': { en: 'Weekly Income', hi: 'साप्ताहिक आय' },
  'analytics.savingsGoals': { en: 'Savings Goals', hi: 'बचत लक्ष्य' },
  'analytics.loanHealth': { en: 'Loan Health', hi: 'लोन स्थिति' },

  // Notifications
  'notif.title': { en: 'Notifications', hi: 'सूचनाएं' },
  'notif.empty': { en: 'No new notifications', hi: 'कोई नई सूचना नहीं' },
} as const;

type TranslationKey = keyof typeof translations;

const LANG_KEY = 'rozanapay_lang';

export function getLang(): Language {
  return (localStorage.getItem(LANG_KEY) as Language) || 'en';
}

export function setLang(lang: Language) {
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new Event('langchange'));
}

export function t(key: string): string {
  const lang = getLang();
  const entry = translations[key as TranslationKey];
  if (!entry) return key;
  return entry[lang] || entry['en'] || key;
}
