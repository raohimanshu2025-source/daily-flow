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

  // Voice logging
  'voice.cta': { en: 'Speak to log income or spending', hi: 'बोलकर कमाई या खर्च लिखें' },
  'voice.ctaHint': { en: 'e.g. "Earned 650 from delivery today"', hi: 'जैसे "आज डिलीवरी से 650 कमाए"' },
  'voice.title': { en: 'Speak to log', hi: 'बोलकर लिखें' },
  'voice.example': { en: 'Say it in Hindi or English: "आज डिलीवरी से 650 कमाए" or "Spent 40 on tea".', hi: 'हिंदी या अंग्रेज़ी में बोलें: "आज डिलीवरी से 650 कमाए" या "चाय पर 40 खर्च"।' },
  'voice.tapToSpeak': { en: 'Tap and speak', hi: 'दबाएँ और बोलें' },
  'voice.stop': { en: 'Stop', hi: 'रोकें' },
  'voice.listening': { en: 'Listening… tap to stop ·', hi: 'सुन रहे हैं… रोकने के लिए दबाएँ ·' },
  'voice.thinking': { en: 'Understanding…', hi: 'समझ रहे हैं…' },
  'voice.typeInstead': { en: 'Type instead', hi: 'लिखकर बताएँ' },
  'voice.speakInstead': { en: 'Speak instead', hi: 'बोलकर बताएँ' },
  'voice.typePlaceholder': { en: 'e.g. 650 delivery, or chai 40', hi: 'जैसे 650 डिलीवरी, या चाय 40' },
  'voice.understand': { en: 'Continue', hi: 'आगे बढ़ें' },
  'voice.income': { en: 'Income', hi: 'कमाई' },
  'voice.expense': { en: 'Spending', hi: 'खर्च' },
  'voice.amount': { en: 'Amount', hi: 'रकम' },
  'voice.source': { en: 'Earned from', hi: 'कहाँ से कमाया' },
  'voice.category': { en: 'Spent on', hi: 'किस पर खर्च' },
  'voice.again': { en: 'Again', hi: 'फिर से' },
  'voice.save': { en: 'Save', hi: 'सेव करें' },
  'voice.savedIncome': { en: 'Income saved', hi: 'कमाई सेव हो गई' },
  'voice.savedExpense': { en: 'Spending saved', hi: 'खर्च सेव हो गया' },
  'voice.unclear': { en: "Couldn't catch the amount — please check it", hi: 'रकम साफ़ नहीं सुनी — कृपया जाँच लें' },
  'voice.tooShort': { en: 'That was too short — try again', hi: 'बहुत छोटा था — फिर से बोलें' },
  'voice.micDenied': { en: 'Microphone not available — you can type instead', hi: 'माइक नहीं मिला — आप लिखकर बता सकते हैं' },
  'voice.busy': { en: 'Busy right now — please try again in a minute', hi: 'अभी व्यस्त है — एक मिनट बाद फिर कोशिश करें' },
  'voice.notReady': { en: "Voice logging isn't set up yet", hi: 'बोलकर लिखना अभी चालू नहीं है' },
  'voice.failed': { en: "Couldn't understand that — please try again", hi: 'समझ नहीं आया — फिर से कोशिश करें' },
  'voice.cat.food': { en: 'Food', hi: 'खाना' },
  'voice.cat.transport': { en: 'Transport', hi: 'आना-जाना' },
  'voice.cat.rent': { en: 'Rent', hi: 'किराया' },
  'voice.cat.medical': { en: 'Medical', hi: 'दवा-इलाज' },
  'voice.cat.education': { en: 'Education', hi: 'पढ़ाई' },
  'voice.cat.shopping': { en: 'Shopping', hi: 'खरीदारी' },
  'voice.cat.utilities': { en: 'Bills', hi: 'बिल' },
  'voice.cat.other': { en: 'Other', hi: 'अन्य' },

  // Credit score panel (scorecard reason codes)
  'score.breakdown': { en: 'Score breakdown', hi: 'स्कोर का हिसाब' },
  'score.notYet': { en: 'Not computed yet', hi: 'अभी नहीं बना' },
  'score.updating': { en: 'Updating...', hi: 'अपडेट हो रहा है...' },
  'score.recompute': { en: 'Recompute', hi: 'फिर से बनाएँ' },
  'score.helping': { en: 'Helping', hi: 'मदद कर रहा है' },
  'score.hurting': { en: 'Hurting', hi: 'नुकसान कर रहा है' },
  'score.yes': { en: 'Yes', hi: 'हाँ' },
  'score.no': { en: 'No', hi: 'नहीं' },
  'score.unit.days': { en: 'days', hi: 'दिन' },
  'score.modelNote': { en: 'Scored by RozanaPay scorecard v1 — an ML model trained on simulated data while we collect real repayment history.', hi: 'रोज़ानापे स्कोरकार्ड v1 से बना — यह ML मॉडल अभी नकली (सिम्युलेटेड) डेटा पर सीखा है, जब तक असली भुगतान का इतिहास नहीं बनता।' },
  'score.band.excellent': { en: 'Excellent', hi: 'बहुत अच्छा' },
  'score.band.good': { en: 'Good', hi: 'अच्छा' },
  'score.band.fair': { en: 'Fair', hi: 'ठीक' },
  'score.band.poor': { en: 'Poor', hi: 'कमज़ोर' },
  'score.band.very_poor': { en: 'Very poor', hi: 'बहुत कमज़ोर' },
  'score.f.income_days_30': { en: 'Days with income', hi: 'कमाई वाले दिन' },
  'score.f.income_total_30': { en: 'Income (30 days)', hi: 'कमाई (30 दिन)' },
  'score.f.active_weeks_12': { en: 'Active weeks', hi: 'सक्रिय हफ़्ते' },
  'score.f.expense_ratio_30': { en: 'Spending vs income', hi: 'कमाई के मुकाबले खर्च' },
  'score.f.loans_repaid_on_time': { en: 'Loans repaid on time', hi: 'समय पर चुकाए लोन' },
  'score.f.loans_repaid_late': { en: 'Loans repaid late', hi: 'देर से चुकाए लोन' },
  'score.f.loans_overdue_now': { en: 'Loans overdue now', hi: 'अभी बकाया लोन' },
  'score.f.bnpl_active': { en: 'Active BNPL orders', hi: 'चालू BNPL ऑर्डर' },
  'score.f.kyc_verified': { en: 'KYC verified', hi: 'KYC सत्यापित' },
  'score.tip.income_days_30': { en: 'Log your income every working day', hi: 'हर काम वाले दिन कमाई लिखें' },
  'score.tip.income_total_30': { en: 'Log all your earnings', hi: 'अपनी पूरी कमाई लिखें' },
  'score.tip.active_weeks_12': { en: 'Log income every week', hi: 'हर हफ़्ते कमाई लिखें' },
  'score.tip.expense_ratio_30': { en: 'Spend less than you earn', hi: 'कमाई से कम खर्च करें' },
  'score.tip.loans_repaid_on_time': { en: 'Repay loans by the due date', hi: 'लोन समय पर चुकाएँ' },
  'score.tip.loans_repaid_late': { en: 'Repay future loans on time', hi: 'आगे के लोन समय पर चुकाएँ' },
  'score.tip.loans_overdue_now': { en: 'Repay your overdue loan', hi: 'बकाया लोन चुकाएँ' },
  'score.tip.bnpl_active': { en: 'Finish your BNPL payments', hi: 'BNPL भुगतान पूरे करें' },
  'score.tip.kyc_verified': { en: 'Complete your KYC', hi: 'अपना KYC पूरा करें' },

  // Loan Key Fact Statement (KFS)
  'kfs.title': { en: 'Key Fact Statement (KFS) — RBI Digital Lending', hi: 'मुख्य तथ्य विवरण (KFS) — RBI डिजिटल लेंडिंग' },
  'kfs.lender': { en: 'Lender: not yet assigned — pilot, no real money is lent', hi: 'लोन देने वाला: अभी तय नहीं — पायलट, कोई असली पैसा नहीं दिया जाता' },
  'kfs.lsp': { en: 'Loan Service Provider: RozanaPay (digital lending app)', hi: 'लोन सेवा प्रदाता: रोज़ानापे (डिजिटल लेंडिंग ऐप)' },
  'kfs.range': { en: 'Min/Max tenure: 7–30 days · Min/Max APR: 24%–36%', hi: 'न्यूनतम/अधिकतम अवधि: 7–30 दिन · न्यूनतम/अधिकतम APR: 24%–36%' },
  'kfs.sanctioned': { en: 'Sanctioned ₹{amount} · Net disbursal ₹{net} after ₹{fee} processing fee', hi: 'स्वीकृत ₹{amount} · ₹{fee} प्रोसेसिंग शुल्क के बाद मिलेंगे ₹{net}' },
  'kfs.total': { en: 'Total to repay ₹{total} in {days} days · Representative APR {apr}%', hi: '{days} दिनों में कुल चुकाना ₹{total} · अनुमानित APR {apr}%' },
  'kfs.lateFee': { en: 'Late fee: ₹50 per day after the due date, capped at 10% of the loan amount · No rollover', hi: 'देर से भुगतान शुल्क: नियत तारीख के बाद ₹50 प्रतिदिन, अधिकतम लोन राशि का 10% · कोई रोलओवर नहीं' },
  'kfs.coolingOff': { en: 'Cooling-off period: cancel within 3 days and repay only principal + proportionate APR, with no prepayment penalty', hi: 'कूलिंग-ऑफ अवधि: 3 दिन के अंदर रद्द करें और केवल मूलधन + उतने दिनों का ब्याज चुकाएँ, बिना किसी जुर्माने के' },
  'kfs.recovery': { en: 'Recovery agent details and data-usage policy are shared before any collection contact', hi: 'वसूली से पहले वसूली एजेंट की जानकारी और डेटा-उपयोग नीति बताई जाती है' },
  'kfs.repayment': { en: 'Repay in the app before the due date (pilot: repayments are simulated)', hi: 'नियत तारीख से पहले ऐप में चुकाएँ (पायलट: भुगतान केवल प्रदर्शन के लिए हैं)' },
  'kfs.grievance': { en: 'Complaints: raise a ticket in Help & Grievance · reply within 30 days', hi: 'शिकायत: मदद और शिकायत में टिकट बनाएँ · 30 दिनों में जवाब' },

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
