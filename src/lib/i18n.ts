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

  // Government benefits finder
  'ben.service': { en: 'Govt Benefits', hi: 'सरकारी योजनाएं' },
  'ben.serviceDesc': { en: 'Find schemes for you', hi: 'आपके लिए योजनाएं' },
  'ben.title': { en: 'Government Benefits', hi: 'सरकारी योजनाएं' },
  'ben.subtitle': { en: 'Answer 6 quick questions to see which schemes you can get.', hi: '6 आसान सवालों के जवाब दें और देखें कौन सी योजनाएं आपको मिल सकती हैं।' },
  'ben.private': { en: 'Your answers stay on this phone. Nothing is saved or sent.', hi: 'आपके जवाब इसी फ़ोन पर रहते हैं। कुछ भी सेव या भेजा नहीं जाता।' },
  'ben.q.age': { en: 'Your age', hi: 'आपकी उम्र' },
  'ben.q.income': { en: 'Monthly income (approx.)', hi: 'महीने की कमाई (लगभग)' },
  'ben.q.work': { en: 'Your work', hi: 'आपका काम' },
  'ben.q.bank': { en: 'Do you have a bank account?', hi: 'क्या आपका बैंक खाता है?' },
  'ben.q.epf': { en: 'Do you have PF, ESIC or NPS?', hi: 'क्या आपका PF, ESIC या NPS है?' },
  'ben.q.epfHint': { en: 'Usually only if an employer pays it into your salary', hi: 'आमतौर पर तभी जब मालिक सैलरी में यह कटता/जमा करता हो' },
  'ben.q.tax': { en: 'Do you pay income tax?', hi: 'क्या आप इनकम टैक्स भरते हैं?' },
  'ben.inc.lt10': { en: 'Under ₹10,000', hi: '₹10,000 से कम' },
  'ben.inc.10to15': { en: '₹10,000–15,000', hi: '₹10,000–15,000' },
  'ben.inc.15to25': { en: '₹15,000–25,000', hi: '₹15,000–25,000' },
  'ben.inc.gt25': { en: 'Over ₹25,000', hi: '₹25,000 से ज़्यादा' },
  'ben.work.platform': { en: 'Delivery / app-based', hi: 'डिलीवरी / ऐप वाला काम' },
  'ben.work.driver': { en: 'Auto / taxi driver', hi: 'ऑटो / टैक्सी ड्राइवर' },
  'ben.work.vendor': { en: 'Street vendor', hi: 'रेहड़ी-पटरी विक्रेता' },
  'ben.work.construction': { en: 'Construction', hi: 'निर्माण मज़दूर' },
  'ben.work.shop': { en: 'Shop worker', hi: 'दुकान कर्मचारी' },
  'ben.work.other': { en: 'Other daily work', hi: 'अन्य दिहाड़ी काम' },
  'ben.yes': { en: 'Yes', hi: 'हाँ' },
  'ben.no': { en: 'No', hi: 'नहीं' },
  'ben.unsure': { en: 'Not sure', hi: 'पता नहीं' },
  'ben.find': { en: 'Show my schemes', hi: 'मेरी योजनाएं दिखाएं' },
  'ben.edit': { en: 'Change answers', hi: 'जवाब बदलें' },
  'ben.found': { en: 'You may qualify for {n} schemes', hi: 'आप {n} योजनाओं के लिए योग्य हो सकते हैं' },
  'ben.none': { en: 'No match from these answers. Check myscheme.gov.in for state schemes.', hi: 'इन जवाबों से कोई योजना नहीं मिली। राज्य की योजनाओं के लिए myscheme.gov.in देखें।' },
  'ben.match.yes': { en: 'You qualify', hi: 'आप योग्य हैं' },
  'ben.match.check': { en: 'Check eligibility', hi: 'योग्यता जांचें' },
  'ben.get': { en: 'What you get', hi: 'क्या मिलेगा' },
  'ben.cost': { en: 'Cost', hi: 'खर्च' },
  'ben.docs': { en: 'Documents', hi: 'दस्तावेज़' },
  'ben.open': { en: 'Official website', hi: 'सरकारी वेबसाइट' },
  'ben.disclaimer': { en: 'Rules can change. Always confirm on the official website or at a CSC / bank before applying. RozanaPay is not a government service and charges nothing for this. Last checked: {date}.', hi: 'नियम बदल सकते हैं। आवेदन से पहले सरकारी वेबसाइट या CSC / बैंक पर ज़रूर पक्का करें। RozanaPay सरकारी सेवा नहीं है और इसके लिए कोई पैसा नहीं लेता। आखिरी बार जांचा: {date}।' },
  'ben.csc': { en: 'Free help: visit your nearest Common Service Centre (CSC) or bank branch.', hi: 'मुफ़्त मदद: नज़दीकी जन सेवा केंद्र (CSC) या बैंक शाखा जाएं।' },

  'ben.s.jandhan.name': { en: 'PM Jan Dhan bank account', hi: 'प्रधानमंत्री जन धन खाता' },
  'ben.s.jandhan.get': { en: 'Free zero-balance bank account with RuPay card and accident insurance. Needed for most other schemes.', hi: 'मुफ़्त ज़ीरो-बैलेंस बैंक खाता, RuPay कार्ड और दुर्घटना बीमा के साथ। ज़्यादातर योजनाओं के लिए ज़रूरी।' },
  'ben.s.jandhan.cost': { en: 'Free', hi: 'मुफ़्त' },
  'ben.s.jandhan.docs': { en: 'Aadhaar, mobile number', hi: 'आधार, मोबाइल नंबर' },

  'ben.s.eshram.name': { en: 'e-Shram card', hi: 'ई-श्रम कार्ड' },
  'ben.s.eshram.get': { en: 'Official ID (UAN) for informal workers. Opens the door to welfare schemes; app-based workers need it for the announced health cover.', hi: 'असंगठित मज़दूरों का सरकारी पहचान पत्र (UAN)। कल्याण योजनाओं का रास्ता; ऐप वाले वर्कर्स के लिए घोषित स्वास्थ्य कवर के लिए ज़रूरी।' },
  'ben.s.eshram.cost': { en: 'Free', hi: 'मुफ़्त' },
  'ben.s.eshram.docs': { en: 'Aadhaar, Aadhaar-linked mobile, bank account', hi: 'आधार, आधार से जुड़ा मोबाइल, बैंक खाता' },

  'ben.s.ayushman.name': { en: 'Ayushman Bharat health cover', hi: 'आयुष्मान भारत स्वास्थ्य कवर' },
  'ben.s.ayushman.get': { en: 'Up to ₹5 lakh a year of free hospital treatment per family. Announced for e-Shram-registered app-based workers; others qualify if the family is on the list. Check your name on the site.', hi: 'हर परिवार को साल में ₹5 लाख तक मुफ़्त अस्पताल इलाज। ई-श्रम में रजिस्टर ऐप वाले वर्कर्स के लिए घोषित; बाकी लोग तभी जब परिवार सूची में हो। वेबसाइट पर अपना नाम जांचें।' },
  'ben.s.ayushman.cost': { en: 'Free', hi: 'मुफ़्त' },
  'ben.s.ayushman.docs': { en: 'Aadhaar, ration card or e-Shram card', hi: 'आधार, राशन कार्ड या ई-श्रम कार्ड' },

  'ben.s.pmsym.name': { en: 'PM Shram Yogi Maandhan (pension)', hi: 'पीएम श्रम योगी मानधन (पेंशन)' },
  'ben.s.pmsym.get': { en: '₹3,000 a month pension after age 60. The government adds the same amount you pay.', hi: '60 साल के बाद हर महीने ₹3,000 पेंशन। जितना आप जमा करें, उतना ही सरकार भी जमा करती है।' },
  'ben.s.pmsym.cost': { en: '₹55–200 a month, depending on age when you join', hi: 'जुड़ने की उम्र के हिसाब से ₹55–200 महीना' },
  'ben.s.pmsym.docs': { en: 'Aadhaar, savings / Jan Dhan account, mobile', hi: 'आधार, बचत / जन धन खाता, मोबाइल' },

  'ben.s.apy.name': { en: 'Atal Pension Yojana', hi: 'अटल पेंशन योजना' },
  'ben.s.apy.get': { en: 'Fixed pension of ₹1,000–5,000 a month after age 60 (you choose).', hi: '60 साल के बाद ₹1,000–5,000 महीने की पक्की पेंशन (आप चुनें)।' },
  'ben.s.apy.cost': { en: 'Small monthly auto-debit; lower the younger you join', hi: 'हर महीने छोटी रकम खाते से कटती है; जितनी जल्दी जुड़ें उतनी कम' },
  'ben.s.apy.docs': { en: 'Bank account, Aadhaar, mobile', hi: 'बैंक खाता, आधार, मोबाइल' },

  'ben.s.pmsby.name': { en: 'PM Suraksha Bima (accident)', hi: 'पीएम सुरक्षा बीमा (दुर्घटना)' },
  'ben.s.pmsby.get': { en: '₹2 lakh for accidental death or full disability, ₹1 lakh for partial disability.', hi: 'दुर्घटना में मृत्यु या पूरी विकलांगता पर ₹2 लाख, आंशिक विकलांगता पर ₹1 लाख।' },
  'ben.s.pmsby.cost': { en: '₹20 a year (auto-debit)', hi: '₹20 साल (खाते से कटता है)' },
  'ben.s.pmsby.docs': { en: 'Bank account, Aadhaar', hi: 'बैंक खाता, आधार' },

  'ben.s.pmjjby.name': { en: 'PM Jeevan Jyoti Bima (life)', hi: 'पीएम जीवन ज्योति बीमा (जीवन)' },
  'ben.s.pmjjby.get': { en: '₹2 lakh to your family if you die for any reason.', hi: 'किसी भी कारण से मृत्यु होने पर परिवार को ₹2 लाख।' },
  'ben.s.pmjjby.cost': { en: '₹436 a year (auto-debit)', hi: '₹436 साल (खाते से कटता है)' },
  'ben.s.pmjjby.docs': { en: 'Bank account, Aadhaar', hi: 'बैंक खाता, आधार' },

  'ben.s.svanidhi.name': { en: 'PM SVANidhi (vendor loan)', hi: 'पीएम स्वनिधि (विक्रेता लोन)' },
  'ben.s.svanidhi.get': { en: 'Working-capital loans of ₹15,000, then ₹25,000, then ₹50,000 with interest subsidy, plus cashback up to ₹1,200 a year for digital payments.', hi: '₹15,000, फिर ₹25,000, फिर ₹50,000 का लोन, ब्याज में छूट के साथ, और डिजिटल भुगतान पर साल में ₹1,200 तक कैशबैक।' },
  'ben.s.svanidhi.cost': { en: 'Loan — repay in instalments', hi: 'लोन — किस्तों में चुकाएं' },
  'ben.s.svanidhi.docs': { en: 'Aadhaar, vending certificate or letter from local body, bank account', hi: 'आधार, वेंडिंग सर्टिफिकेट या नगर निकाय का पत्र, बैंक खाता' },

  'ben.s.bocw.name': { en: 'Construction Workers Welfare Board', hi: 'भवन निर्माण श्रमिक कल्याण बोर्ड' },
  'ben.s.bocw.get': { en: 'State board benefits such as accident help, children\'s education, maternity and tools. Benefits differ by state.', hi: 'राज्य बोर्ड से दुर्घटना सहायता, बच्चों की पढ़ाई, मातृत्व और औज़ार जैसी मदद। हर राज्य में अलग।' },
  'ben.s.bocw.cost': { en: 'Small registration fee (varies by state)', hi: 'छोटी रजिस्ट्रेशन फ़ीस (राज्य के हिसाब से)' },
  'ben.s.bocw.docs': { en: 'Aadhaar, proof of 90 days of building work in the last year, bank account', hi: 'आधार, पिछले साल 90 दिन निर्माण काम का सबूत, बैंक खाता' },
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
