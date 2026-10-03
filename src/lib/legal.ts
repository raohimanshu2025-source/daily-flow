// Privacy Policy and Terms of Use content, in English and Hindi.
// Plain language for low-literacy users. Keep both languages in sync when editing.
// NOTE: this is a good-faith draft, not legal advice. Have a lawyer review it
// before onboarding real users or real money.
import type { Language } from "@/lib/i18n";

/** Fill these in when available. Empty values are simply not shown. */
export const LEGAL_CONFIG = {
  operator: "RozanaPay",
  contactEmail: "", // e.g. "privacy@rozanapay.app"
  grievanceOfficer: "", // name of the Grievance Officer, when appointed
  lastUpdated: "3 October 2026",
};

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

const contactLine = (lang: Language) => {
  const parts: string[] = [];
  if (LEGAL_CONFIG.grievanceOfficer) {
    parts.push(lang === "hi" ? `शिकायत अधिकारी: ${LEGAL_CONFIG.grievanceOfficer}` : `Grievance Officer: ${LEGAL_CONFIG.grievanceOfficer}`);
  }
  if (LEGAL_CONFIG.contactEmail) {
    parts.push(lang === "hi" ? `ईमेल: ${LEGAL_CONFIG.contactEmail}` : `Email: ${LEGAL_CONFIG.contactEmail}`);
  }
  return parts;
};

const privacyEn = (): LegalDoc => ({
  title: "Privacy Policy",
  intro:
    "This policy explains what information RozanaPay collects, why, who it is shared with, and the choices you have. It follows India's Digital Personal Data Protection Act, 2023 (DPDP Act).",
  sections: [
    {
      heading: "1. Important: this is a pilot",
      body: [
        "RozanaPay is currently a pilot. No real money moves through the app. Loans, repayments, UPI, gold, insurance and bill payments are simulated for demonstration.",
        "RozanaPay is not a bank or a lender and is not licensed by the RBI. Any future lending will only be done through an RBI-registered bank or NBFC partner, who will be named clearly before you take a loan.",
      ],
    },
    {
      heading: "2. What we collect",
      body: [
        "Account details: your email or phone number, name, and the profile details you add (age, occupation, city, income type).",
        "Money records you enter: income, expenses, savings goals, loan requests and repayments.",
        "KYC documents you upload (such as PAN or Aadhaar), stored privately. We advise masking the first 8 digits of your Aadhaar number before uploading.",
        "Messages you type into the AI assistant, and support tickets you raise.",
        "Basic technical data needed to keep you signed in and the service secure (login session, IP address in server logs).",
      ],
    },
    {
      heading: "3. Why we use it",
      body: [
        "To run your account and show your income, savings and loans.",
        "To calculate your RozanaPay credit score from your activity in the app.",
        "To give tips and answers through the AI assistant and smart nudges.",
        "To review KYC, handle support requests, prevent fraud and meet legal duties.",
        "We do not sell your personal data. We do not use it for advertising.",
      ],
    },
    {
      heading: "4. Who we share it with",
      body: [
        "Supabase — stores our database and files on servers in Mumbai, India.",
        "Netlify — hosts the website files. It sees basic request data such as your IP address.",
        "Google (Gemini AI) — receives the questions you ask the assistant, and a short summary of your income, spending, savings and loans when you use smart nudges. While we use Google's free plan, Google may use this data to improve its products. Do not type Aadhaar, PAN, bank or card numbers into the assistant.",
        "A bank or NBFC partner — only when you apply for a real loan in future, and only with your consent.",
        "Government or law enforcement — only when the law requires it.",
      ],
    },
    {
      heading: "5. How long we keep it",
      body: [
        "We keep your data while your account is open.",
        "When you delete your account, we delete your profile, money records, savings, KYC documents, AI tips and notifications.",
        "Records of loans that were actually given, and their repayment history, plus security logs, are kept for as long as the law requires (often at least 5 years after the loan is closed). They are not used for anything else.",
      ],
    },
    {
      heading: "6. Your rights",
      body: [
        "See your data: download everything we hold about you from Financial Identity → Download my data.",
        "Correct your data: edit your profile at any time.",
        "Delete your data: use Financial Identity → Delete my account. You must repay any loan first.",
        "Withdraw consent: you can stop using the app and delete your account at any time.",
        "Nominate someone: you may name a person to use these rights for you if you die or cannot act. Contact us through Support.",
        "Complain: raise a ticket in Help & Grievance. If you are not satisfied, you can complain to the Data Protection Board of India.",
      ],
    },
    {
      heading: "7. Security",
      body: [
        "Your data is protected with secure logins, row-level access rules (each user can only see their own records), private storage for KYC files with short-lived links, and an audit log of sensitive actions.",
        "No system is perfectly secure. If a breach affects you, we will tell you and the Data Protection Board as the law requires.",
      ],
    },
    {
      heading: "8. Children",
      body: ["RozanaPay is only for people aged 18 or above."],
    },
    {
      heading: "9. Contact",
      body: [
        "For any privacy question or request, raise a ticket in Help & Grievance inside the app.",
      ],
    },
  ],
});

const privacyHi = (): LegalDoc => ({
  title: "गोपनीयता नीति",
  intro:
    "यह नीति बताती है कि रोज़ानापे कौन-सी जानकारी लेता है, क्यों लेता है, किसके साथ साझा करता है, और आपके पास क्या विकल्प हैं। यह भारत के डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 (DPDP अधिनियम) के अनुसार है।",
  sections: [
    {
      heading: "1. ज़रूरी: यह एक पायलट है",
      body: [
        "रोज़ानापे अभी एक पायलट है। ऐप में कोई असली पैसा नहीं चलता। लोन, भुगतान, UPI, सोना, बीमा और बिल भुगतान केवल प्रदर्शन के लिए हैं।",
        "रोज़ानापे बैंक या लोन देने वाली कंपनी नहीं है और RBI से लाइसेंस प्राप्त नहीं है। आगे कोई भी असली लोन केवल RBI-पंजीकृत बैंक या NBFC साझेदार के ज़रिए दिया जाएगा, जिसका नाम लोन लेने से पहले साफ़ बताया जाएगा।",
      ],
    },
    {
      heading: "2. हम क्या जानकारी लेते हैं",
      body: [
        "खाते की जानकारी: आपका ईमेल या फ़ोन नंबर, नाम, और प्रोफ़ाइल में भरी जानकारी (उम्र, काम, शहर, आय का प्रकार)।",
        "आपके डाले गए पैसों के रिकॉर्ड: आय, खर्च, बचत लक्ष्य, लोन आवेदन और भुगतान।",
        "आपके अपलोड किए KYC दस्तावेज़ (जैसे PAN या आधार), जो निजी रूप से रखे जाते हैं। अपलोड करने से पहले आधार के पहले 8 अंक छुपा दें।",
        "AI सहायक में लिखे आपके संदेश, और आपकी सहायता शिकायतें।",
        "आपको लॉग-इन रखने और सेवा सुरक्षित रखने के लिए ज़रूरी तकनीकी जानकारी (लॉग-इन सत्र, सर्वर लॉग में IP पता)।",
      ],
    },
    {
      heading: "3. हम इसका उपयोग क्यों करते हैं",
      body: [
        "आपका खाता चलाने और आपकी आय, बचत और लोन दिखाने के लिए।",
        "ऐप में आपकी गतिविधि से आपका रोज़ानापे क्रेडिट स्कोर बनाने के लिए।",
        "AI सहायक और स्मार्ट सुझावों के ज़रिए सलाह देने के लिए।",
        "KYC जाँचने, शिकायतें सुलझाने, धोखाधड़ी रोकने और कानूनी नियम मानने के लिए।",
        "हम आपकी जानकारी नहीं बेचते। हम इसे विज्ञापन के लिए उपयोग नहीं करते।",
      ],
    },
    {
      heading: "4. हम किसके साथ साझा करते हैं",
      body: [
        "Supabase — हमारा डेटाबेस और फ़ाइलें मुंबई, भारत के सर्वर पर रखता है।",
        "Netlify — वेबसाइट चलाता है। इसे आपका IP पता जैसी बुनियादी जानकारी दिखती है।",
        "Google (Gemini AI) — AI सहायक से पूछे गए आपके सवाल, और स्मार्ट सुझावों के लिए आपकी आय, खर्च, बचत और लोन का छोटा सारांश इसे भेजा जाता है। जब तक हम Google का मुफ़्त प्लान उपयोग करते हैं, Google इस जानकारी का उपयोग अपनी सेवाएँ सुधारने के लिए कर सकता है। सहायक में आधार, PAN, बैंक या कार्ड नंबर न लिखें।",
        "बैंक या NBFC साझेदार — केवल तब, जब आप भविष्य में असली लोन के लिए आवेदन करें, और आपकी अनुमति से।",
        "सरकार या पुलिस — केवल तब, जब कानून ऐसा माँगे।",
      ],
    },
    {
      heading: "5. हम जानकारी कितने समय तक रखते हैं",
      body: [
        "जब तक आपका खाता खुला है, हम आपकी जानकारी रखते हैं।",
        "खाता हटाने पर हम आपकी प्रोफ़ाइल, पैसों के रिकॉर्ड, बचत, KYC दस्तावेज़, AI सुझाव और सूचनाएँ हटा देते हैं।",
        "जो लोन सच में दिए गए, उनके और उनके भुगतान के रिकॉर्ड, और सुरक्षा लॉग, कानून के अनुसार ज़रूरी समय तक रखे जाते हैं (अक्सर लोन बंद होने के कम से कम 5 साल बाद तक)। इनका किसी और काम में उपयोग नहीं होता।",
      ],
    },
    {
      heading: "6. आपके अधिकार",
      body: [
        "अपनी जानकारी देखें: वित्तीय पहचान → मेरा डेटा डाउनलोड करें से सब कुछ डाउनलोड करें।",
        "जानकारी सुधारें: अपनी प्रोफ़ाइल कभी भी बदलें।",
        "जानकारी हटाएँ: वित्तीय पहचान → मेरा खाता हटाएँ का उपयोग करें। पहले कोई भी बकाया लोन चुकाना होगा।",
        "अनुमति वापस लें: आप कभी भी ऐप का उपयोग बंद करके खाता हटा सकते हैं।",
        "किसी को नामित करें: आपकी मृत्यु या असमर्थता की स्थिति में आपके अधिकारों का उपयोग करने के लिए आप किसी व्यक्ति को नामित कर सकते हैं। मदद और शिकायत के ज़रिए संपर्क करें।",
        "शिकायत करें: मदद और शिकायत में टिकट बनाएँ। संतुष्ट न हों तो आप भारत के डेटा संरक्षण बोर्ड से शिकायत कर सकते हैं।",
      ],
    },
    {
      heading: "7. सुरक्षा",
      body: [
        "आपकी जानकारी सुरक्षित लॉग-इन, पहुँच के सख्त नियम (हर व्यक्ति केवल अपने रिकॉर्ड देख सकता है), KYC फ़ाइलों के लिए निजी स्टोरेज और थोड़ी देर चलने वाले लिंक, और ज़रूरी कामों के ऑडिट लॉग से सुरक्षित है।",
        "कोई भी सिस्टम पूरी तरह सुरक्षित नहीं होता। अगर कोई डेटा लीक आपको प्रभावित करता है, तो हम कानून के अनुसार आपको और डेटा संरक्षण बोर्ड को बताएँगे।",
      ],
    },
    {
      heading: "8. बच्चे",
      body: ["रोज़ानापे केवल 18 साल या उससे अधिक उम्र के लोगों के लिए है।"],
    },
    {
      heading: "9. संपर्क",
      body: ["गोपनीयता से जुड़े किसी भी सवाल या अनुरोध के लिए ऐप में मदद और शिकायत में टिकट बनाएँ।"],
    },
  ],
});

const termsEn = (): LegalDoc => ({
  title: "Terms of Use",
  intro: "By creating an account or using RozanaPay, you agree to these terms. Please read them carefully.",
  sections: [
    {
      heading: "1. What RozanaPay is",
      body: [
        "RozanaPay is an app to track your daily income and spending, build savings habits, and see a credit score based on your activity in the app.",
        "It is currently a pilot. No real money is moved. Loans, repayments, UPI, digital gold, insurance, bill payments and group savings are simulated.",
      ],
    },
    {
      heading: "2. Not a bank or lender",
      body: [
        "RozanaPay is not a bank, NBFC or payment company and is not licensed by the RBI.",
        "In future, real loans will only be offered by an RBI-registered bank or NBFC partner, under their own loan agreement and Key Fact Statement, which will be shown to you before you accept.",
      ],
    },
    {
      heading: "3. Who can use it",
      body: ["You must be 18 or older and give true information about yourself. One account per person."],
    },
    {
      heading: "4. Your account",
      body: [
        "Keep your password and OTPs secret. You are responsible for activity on your account.",
        "Tell us through Help & Grievance if you think someone else has used your account.",
      ],
    },
    {
      heading: "5. The credit score and AI tips",
      body: [
        "The RozanaPay score is an estimate based on what you record in the app. It is not a credit bureau score and does not guarantee you a loan.",
        "The AI assistant and smart nudges give general money tips. They can be wrong and are not professional financial, legal or tax advice.",
      ],
    },
    {
      heading: "6. Fair use",
      body: [
        "Do not enter false records, try to cheat the credit score, break the app's security, or use RozanaPay for anything illegal.",
        "We may suspend accounts that break these rules.",
      ],
    },
    {
      heading: "7. Limits of responsibility",
      body: [
        "During the pilot the app is provided as it is. We try to keep it working and accurate but cannot promise it will always be available or error-free.",
        "Nothing in these terms takes away rights you have under Indian consumer law.",
      ],
    },
    {
      heading: "8. Closing your account",
      body: [
        "You can delete your account at any time from Financial Identity → Delete my account, after repaying any loan. See the Privacy Policy for what is deleted and what the law requires us to keep.",
      ],
    },
    {
      heading: "9. Changes and law",
      body: [
        "We may update these terms. If the change is important, we will tell you in the app.",
        "These terms follow the laws of India.",
      ],
    },
    {
      heading: "10. Help and complaints",
      body: ["Raise a ticket in Help & Grievance inside the app. We aim to reply within 30 days."],
    },
  ],
});

const termsHi = (): LegalDoc => ({
  title: "उपयोग की शर्तें",
  intro: "खाता बनाकर या रोज़ानापे का उपयोग करके आप इन शर्तों से सहमत होते हैं। कृपया इन्हें ध्यान से पढ़ें।",
  sections: [
    {
      heading: "1. रोज़ानापे क्या है",
      body: [
        "रोज़ानापे एक ऐप है जिसमें आप अपनी रोज़ की आय और खर्च लिखते हैं, बचत की आदत बनाते हैं, और ऐप में अपनी गतिविधि के आधार पर क्रेडिट स्कोर देखते हैं।",
        "यह अभी एक पायलट है। कोई असली पैसा नहीं चलता। लोन, भुगतान, UPI, डिजिटल सोना, बीमा, बिल भुगतान और समूह बचत केवल प्रदर्शन के लिए हैं।",
      ],
    },
    {
      heading: "2. बैंक या लोन देने वाली कंपनी नहीं",
      body: [
        "रोज़ानापे बैंक, NBFC या पेमेंट कंपनी नहीं है और RBI से लाइसेंस प्राप्त नहीं है।",
        "भविष्य में असली लोन केवल RBI-पंजीकृत बैंक या NBFC साझेदार देगा, उनके अपने लोन समझौते और मुख्य तथ्य विवरण (KFS) के साथ, जो आपको स्वीकार करने से पहले दिखाया जाएगा।",
      ],
    },
    {
      heading: "3. कौन उपयोग कर सकता है",
      body: ["आपकी उम्र 18 साल या उससे अधिक होनी चाहिए और आपको अपने बारे में सही जानकारी देनी होगी। एक व्यक्ति, एक खाता।"],
    },
    {
      heading: "4. आपका खाता",
      body: [
        "अपना पासवर्ड और OTP किसी को न बताएँ। आपके खाते में होने वाली गतिविधि की ज़िम्मेदारी आपकी है।",
        "अगर लगे कि किसी और ने आपका खाता उपयोग किया है, तो मदद और शिकायत में बताएँ।",
      ],
    },
    {
      heading: "5. क्रेडिट स्कोर और AI सुझाव",
      body: [
        "रोज़ानापे स्कोर ऐप में आपके लिखे रिकॉर्ड पर आधारित एक अनुमान है। यह क्रेडिट ब्यूरो स्कोर नहीं है और लोन की गारंटी नहीं देता।",
        "AI सहायक और स्मार्ट सुझाव पैसों की सामान्य सलाह देते हैं। ये गलत भी हो सकते हैं और पेशेवर वित्तीय, कानूनी या टैक्स सलाह नहीं हैं।",
      ],
    },
    {
      heading: "6. सही उपयोग",
      body: [
        "झूठे रिकॉर्ड न डालें, क्रेडिट स्कोर से धोखा करने की कोशिश न करें, ऐप की सुरक्षा न तोड़ें, और रोज़ानापे का उपयोग किसी गैरकानूनी काम के लिए न करें।",
        "इन नियमों को तोड़ने वाले खाते हम बंद कर सकते हैं।",
      ],
    },
    {
      heading: "7. ज़िम्मेदारी की सीमा",
      body: [
        "पायलट के दौरान ऐप जैसा है वैसा दिया जाता है। हम इसे चालू और सही रखने की कोशिश करते हैं, पर हमेशा उपलब्ध या बिना गलती के रहने का वादा नहीं कर सकते।",
        "इन शर्तों से भारतीय उपभोक्ता कानून के तहत आपके अधिकार कम नहीं होते।",
      ],
    },
    {
      heading: "8. खाता बंद करना",
      body: [
        "बकाया लोन चुकाने के बाद आप कभी भी वित्तीय पहचान → मेरा खाता हटाएँ से अपना खाता हटा सकते हैं। क्या हटाया जाता है और कानून के अनुसार क्या रखना ज़रूरी है, यह गोपनीयता नीति में देखें।",
      ],
    },
    {
      heading: "9. बदलाव और कानून",
      body: [
        "हम इन शर्तों को बदल सकते हैं। ज़रूरी बदलाव होने पर हम ऐप में बताएँगे।",
        "ये शर्तें भारत के कानूनों के अनुसार हैं।",
      ],
    },
    {
      heading: "10. मदद और शिकायत",
      body: ["ऐप में मदद और शिकायत में टिकट बनाएँ। हम 30 दिनों के अंदर जवाब देने की कोशिश करते हैं।"],
    },
  ],
});

export function getLegalDoc(kind: "privacy" | "terms", lang: Language): LegalDoc {
  const doc = kind === "privacy" ? (lang === "hi" ? privacyHi() : privacyEn()) : lang === "hi" ? termsHi() : termsEn();
  const extra = contactLine(lang);
  if (extra.length) {
    const last = doc.sections[doc.sections.length - 1];
    last.body = [...last.body, ...extra];
  }
  return doc;
}
