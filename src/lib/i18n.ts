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

  // Legal pages & account deletion
  'legal.privacy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  'legal.terms': { en: 'Terms of Use', hi: 'उपयोग की शर्तें' },
  'legal.updated': { en: 'Last updated', hi: 'आखिरी बदलाव' },
  'legal.back': { en: 'Go back', hi: 'वापस जाएँ' },
  'legal.switchLang': { en: 'Switch language', hi: 'भाषा बदलें' },
  'legal.agree': { en: 'By continuing you agree to our', hi: 'आगे बढ़कर आप हमारी इनसे सहमत होते हैं:' },
  'legal.and': { en: 'and', hi: 'और' },
  'delete.title': { en: 'Delete my account', hi: 'मेरा खाता हटाएँ' },
  'delete.desc': { en: 'Permanently delete your account and personal data. Records of loans you actually received are kept as the law requires.', hi: 'अपना खाता और निजी जानकारी हमेशा के लिए हटाएँ। जो लोन सच में मिले थे, उनके रिकॉर्ड कानून के अनुसार रखे जाते हैं।' },
  'delete.confirmTitle': { en: 'Delete your account?', hi: 'क्या आप अपना खाता हटाना चाहते हैं?' },
  'delete.confirmBody': { en: 'This cannot be undone. Your profile, income, expenses, savings, KYC documents and notifications will be deleted. Download your data first if you want a copy.', hi: 'यह वापस नहीं हो सकता। आपकी प्रोफ़ाइल, आय, खर्च, बचत, KYC दस्तावेज़ और सूचनाएँ हटा दी जाएँगी। अगर आपको कॉपी चाहिए, तो पहले अपना डेटा डाउनलोड कर लें।' },
  'delete.typeToConfirm': { en: 'Type DELETE to confirm', hi: 'पुष्टि के लिए DELETE लिखें' },
  'delete.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'delete.confirm': { en: 'Delete forever', hi: 'हमेशा के लिए हटाएँ' },
  'delete.working': { en: 'Deleting…', hi: 'हटाया जा रहा है…' },
  'delete.done': { en: 'Your account has been deleted', hi: 'आपका खाता हटा दिया गया है' },
  'delete.owed': { en: 'Please repay your loan before deleting your account.', hi: 'खाता हटाने से पहले कृपया अपना लोन चुकाएँ।' },
  'delete.failed': { en: 'Could not delete your account. Please try again or contact support.', hi: 'खाता नहीं हटाया जा सका। फिर से कोशिश करें या सहायता से संपर्क करें।' },

  // Transactions
  'txn.title': { en: 'Transactions', hi: 'लेन-देन' },
  'txn.empty': { en: 'No transactions yet', hi: 'अभी कोई लेन-देन नहीं' },
  'txn.pending': { en: 'Pending', hi: 'प्रक्रिया में' },
  'txn.failed': { en: 'Failed', hi: 'असफल' },
  'txn.type.income': { en: 'Income', hi: 'आय' },
  'txn.type.savings': { en: 'Savings', hi: 'बचत' },
  'txn.type.loan': { en: 'Loan', hi: 'लोन' },
  'txn.type.transfer': { en: 'Transfer', hi: 'ट्रांसफर' },
  'txn.type.expense': { en: 'Expense', hi: 'खर्च' },

  // Welcome (landing) — honest product facts, no invented metrics
  'welcome.stat.loans': { en: 'Micro-loans', hi: 'छोटे लोन' },
  'welcome.stat.score': { en: 'Credit score', hi: 'क्रेडिट स्कोर' },
  'welcome.stat.lang.value': { en: 'हिं + EN', hi: 'हिं + EN' },
  'welcome.stat.lang': { en: 'Languages', hi: 'भाषाएं' },
  'welcome.trust': { en: 'Secure login • Your data stays private', hi: 'सुरक्षित लॉगिन • आपका डेटा निजी रहता है' },
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
