import { SupportedLanguage } from '../../types';

export const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav & Common
    'app.title': 'AI Vehicle Damage Assessment & Claim Assistance',
    'nav.home': 'Home',
    'nav.howItWorks': 'How It Works',
    'nav.features': 'Features',
    'nav.faq': 'FAQ',
    'nav.dashboard': 'Dashboard',
    'nav.myVehicles': 'My Vehicles',
    'nav.myPolicies': 'My Policies',
    'nav.accidentReports': 'Accident Reports',
    'nav.newReport': 'New Accident Report',
    'nav.documentScanner': 'Document Scanner',
    'nav.costEstimate': 'Cost Estimator',
    'nav.nomineeAssistance': 'Nominee / Deceased Assistance',
    'nav.myReports': 'My Reports',
    'nav.profile': 'Profile & Settings',
    'nav.privacyExport': 'Privacy & Data Export',
    'nav.adminWorkspace': 'Admin Review Workspace',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Create Account',
    'nav.signOut': 'Sign Out',
    
    // Landing Page
    'hero.title': 'After an accident, know what to do next.',
    'hero.subtitle': 'A structured, intelligent platform to document vehicle damage, organize insurance documents, estimate repair costs, and prepare complete claim-assistance reports.',
    'hero.ctaStart': 'Start Your Assessment',
    'hero.ctaHowItWorks': 'See How It Works',
    'hero.disclaimer': 'Disclaimer: This platform provides preliminary damage reports and claim preparation assistance. It does not replace an official insurance surveyor, legal representative, or workshop quote.',
    
    // How it works steps
    'step.1.title': '1. Register Vehicle',
    'step.1.desc': 'Add your vehicle details and link your insurance policy.',
    'step.2.title': '2. Record Incident & Evidence',
    'step.2.desc': 'Upload scene photos, record time & location, and describe visible damage.',
    'step.3.title': '3. AI Damage & Cost Analysis',
    'step.3.desc': 'Get automated or guided manual damage inspection and indicative repair cost estimates.',
    'step.4.title': '4. Claim Report & Checklist',
    'step.4.desc': 'Generate a downloadable PDF claim bundle with a document compliance checklist.',

    // Features
    'feature.ai.title': 'Honest AI Damage Inspection',
    'feature.ai.desc': 'Computer vision or server-assisted vision detects damaged vehicle parts with transparent confidence and manual correction support.',
    'feature.ocr.title': 'In-Browser Document OCR',
    'feature.ocr.desc': 'Extract details from Registration Certificates, insurance policies, and driving licences locally using Tesseract.',
    'feature.cost.title': 'Data-Driven Cost Estimates',
    'feature.cost.desc': 'Calculates labor and parts cost ranges based on regional reference tables, without fake promises.',
    'feature.nominee.title': 'Nominee & Legal-Heir Flow',
    'feature.nominee.desc': 'Specialized respectful guidance for claims involving deceased policyholders.',
    
    // Buttons & Actions
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.next': 'Next Step',
    'btn.back': 'Back',
    'btn.submit': 'Submit for Review',
    'btn.downloadPdf': 'Download PDF Report',
    'btn.downloadJson': 'Export JSON Data',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.confirm': 'Confirm',
    'btn.uploadPhoto': 'Upload Photograph',
    'btn.scanDocument': 'Scan Document with OCR',
    'btn.speak': 'Speak Input',
    'btn.listening': 'Listening...',
    'btn.retry': 'Retry',

    // Damage & Severity
    'severity.minor': 'Minor Damage',
    'severity.moderate': 'Moderate Damage',
    'severity.severe': 'Severe Damage',
    'severity.unable_to_determine': 'Unable to Determine',

    // Statuses
    'status.draft': 'Draft',
    'status.ready_for_submission': 'Ready for Review',
    'status.submitted_for_review': 'Submitted to Reviewer',
    'status.under_review': 'Under Review',
    'status.more_info_required': 'Clarification Requested',
    'status.review_complete': 'Review Complete',
    'status.closed': 'Closed',

    // Voice & Offline
    'voice.notSupported': 'Voice speech recognition is not supported in this browser.',
    'offline.notice': 'You are currently offline. Changes are saved locally and will sync when connected.',
    
    // Admin
    'admin.title': 'Administrator & Reviewer Area',
    'admin.subtitle': 'Internal project workspace to review case submissions, inspect evidence, and manage cost reference tables.',
    'admin.referenceCosts': 'Manage Reference Repair Costs',
    'admin.auditLog': 'Audit Log & Review History'
  },
  hi: {
    // Nav & Common
    'app.title': 'एआई वाहन क्षति आकलन एवं बीमा दावा सहायता',
    'nav.home': 'मुख्य पृष्ठ',
    'nav.howItWorks': 'यह कैसे काम करता है',
    'nav.features': 'विशेषताएं',
    'nav.faq': 'अक्सर पूछे जाने वाले प्रश्न',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.myVehicles': 'मेरे वाहन',
    'nav.myPolicies': 'मेरी बीमा पॉलिसियां',
    'nav.accidentReports': 'दुर्घटना रिपोर्ट',
    'nav.newReport': 'नई दुर्घटना रिपोर्ट',
    'nav.documentScanner': 'दस्तावेज़ स्कैनर',
    'nav.costEstimate': 'लागत अनुमानक',
    'nav.nomineeAssistance': 'नामांकित / कानूनी वारिस सहायता',
    'nav.myReports': 'मेरी रिपोर्ट',
    'nav.profile': 'प्रोफ़ाइल एवं सेटिंग्स',
    'nav.privacyExport': 'गोपनीयता एवं डेटा निर्यात',
    'nav.adminWorkspace': 'प्रशासक समीक्षा केंद्र',
    'nav.signIn': 'साइन इन',
    'nav.signUp': 'खाता बनाएं',
    'nav.signOut': 'साइन आउट',
    
    // Landing Page
    'hero.title': 'दुर्घटना के बाद, जानें कि आगे क्या करना है।',
    'hero.subtitle': 'वाहन क्षति को दस्तावेज़ित करने, बीमा कागजात व्यवस्थित करने, मरम्मत लागत का अनुमान लगाने और दावा सहायता रिपोर्ट तैयार करने का एक संरचित मंच।',
    'hero.ctaStart': 'अपना आकलन शुरू करें',
    'hero.ctaHowItWorks': 'देखें यह कैसे काम करता है',
    'hero.disclaimer': 'अस्वीकरण: यह मंच प्रारंभिक क्षति रिपोर्ट और दावा सहायता प्रदान करता है। यह आधिकारिक बीमा सर्वेक्षक या कानूनी प्रतिनिधि का विकल्प नहीं है।',
    
    // How it works steps
    'step.1.title': '1. वाहन पंजीकृत करें',
    'step.1.desc': 'अपने वाहन का विवरण जोड़ें और अपनी बीमा पॉलिसी संलग्न करें।',
    'step.2.title': '2. घटना और साक्ष्य रिकॉर्ड करें',
    'step.2.desc': 'दुर्घटना की तस्वीरें अपलोड करें, समय और स्थान रिकॉर्ड करें।',
    'step.3.title': '3. एआई क्षति और लागत विश्लेषण',
    'step.3.desc': 'स्वचालित या मैन्युअल क्षति निरीक्षण और अनुमानित मरम्मत लागत प्राप्त करें।',
    'step.4.title': '4. दावा रिपोर्ट और चेकलिस्ट',
    'step.4.desc': 'दस्तावेज़ चेकलिस्ट के साथ डाउनलोड योग्य पीडीएफ रिपोर्ट बनाएं।',

    // Features
    'feature.ai.title': 'ईमानदार एआई क्षति निरीक्षण',
    'feature.ai.desc': 'कंप्यूटर विज़न द्वारा पारदर्शी क्षति पहचान और मैन्युअल सुधार सहायता।',
    'feature.ocr.title': 'ब्राउज़र में दस्तावेज़ ओसीआर',
    'feature.ocr.desc': 'आरसी, बीमा पॉलिसी और ड्राइविंग लाइसेंस से स्थानीय रूप से डेटा निकालें।',
    'feature.cost.title': 'डेटा-आधारित लागत अनुमान',
    'feature.cost.desc': 'क्षेत्रीय संदर्भ तालिकाओं के आधार पर श्रम और पुर्जों की लागत सीमा का आकलन।',
    'feature.nominee.title': 'नामांकित / कानूनी वारिस प्रवाह',
    'feature.nominee.desc': 'दिवंगत पॉलिसीधारक के दावों के लिए विशेष संवेदनशील मार्गदर्शन।',
    
    // Buttons & Actions
    'btn.save': 'सहेजें',
    'btn.cancel': 'रद्द करें',
    'btn.next': 'अगला कदम',
    'btn.back': 'पीछे जाएं',
    'btn.submit': 'समीक्षा के लिए भेजें',
    'btn.downloadPdf': 'पीडीएफ रिपोर्ट डाउनलोड करें',
    'btn.downloadJson': 'जेसन डेटा निर्यात करें',
    'btn.edit': 'संपादित करें',
    'btn.delete': 'हटाएं',
    'btn.confirm': 'पुष्टि करें',
    'btn.uploadPhoto': 'फोटो अपलोड करें',
    'btn.scanDocument': 'ओसीआर से दस्तावेज़ स्कैन करें',
    'btn.speak': 'बोलकर दर्ज करें',
    'btn.listening': 'सुन रहा है...',
    'btn.retry': 'पुनः प्रयास करें',

    // Damage & Severity
    'severity.minor': 'मामूली क्षति',
    'severity.moderate': 'मध्यम क्षति',
    'severity.severe': 'गंभीर क्षति',
    'severity.unable_to_determine': 'निर्धारित करने में असमर्थ',

    // Statuses
    'status.draft': 'ड्राफ्ट',
    'status.ready_for_submission': 'समीक्षा के लिए तैयार',
    'status.submitted_for_review': 'समीक्षक को भेजा गया',
    'status.under_review': 'समीक्षाधीन',
    'status.more_info_required': 'स्पष्टीकरण आवश्यक',
    'status.review_complete': 'समीक्षा पूर्ण',
    'status.closed': 'बंद',

    // Voice & Offline
    'voice.notSupported': 'इस ब्राउज़र में वाक् पहचान समर्थित नहीं है।',
    'offline.notice': 'आप वर्तमान में ऑफ़लाइन हैं। परिवर्तन स्थानीय रूप से सहेजे गए हैं।',
    
    // Admin
    'admin.title': 'प्रशासक एवं समीक्षक कार्यक्षेत्र',
    'admin.subtitle': 'मामलों की समीक्षा करने और लागत तालिकाओं को प्रबंधित करने का आंतरिक कार्यक्षेत्र।',
    'admin.referenceCosts': 'संदर्भ मरम्मत लागत प्रबंधित करें',
    'admin.auditLog': 'ऑडिट लॉग एवं समीक्षा इतिहास'
  },
  mr: {
    // Nav & Common
    'app.title': 'एआय वाहन नुकसान मूल्यांकन व विमा दावा साहाय्य',
    'nav.home': 'मुख्य पृष्ठ',
    'nav.howItWorks': 'हे कसे कार्य करते',
    'nav.features': 'वैशिष्ट्ये',
    'nav.faq': 'वारंवार विचारले जाणारे प्रश्न',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.myVehicles': 'माझी वाहने',
    'nav.myPolicies': 'माझ्या विमा पोलिसी',
    'nav.accidentReports': 'अपघात अहवाल',
    'nav.newReport': 'नवीन अपघात अहवाल',
    'nav.documentScanner': 'कागदपत्र स्कॅनर',
    'nav.costEstimate': 'खर्च अंदाजक',
    'nav.nomineeAssistance': 'वारसदार / कायदेशीर वारस साहाय्य',
    'nav.myReports': 'माझे अहवाल',
    'nav.profile': 'प्रोफाइल आणि सेटिंग्ज',
    'nav.privacyExport': 'गोपनीयता आणि डेटा निर्यात',
    'nav.adminWorkspace': 'प्रशासक पुनरावलोकन क्षेत्र',
    'nav.signIn': 'साइन इन',
    'nav.signUp': 'खाते तयार करा',
    'nav.signOut': 'साइन आउट',
    
    // Landing Page
    'hero.title': 'अपघातानंतर, पुढे काय करायचे ते जाणून घ्या.',
    'hero.subtitle': 'वाहनाच्या नुकसानीची नोंद करण्यासाठी, विम्याची कागदपत्रे व्यवस्थापित करण्यासाठी आणि दुरुस्ती खर्चाचा अंदाज लावण्यासाठी एक सुटसुटीत प्लॅटफॉर्म.',
    'hero.ctaStart': 'तुमचे मूल्यमापन सुरू करा',
    'hero.ctaHowItWorks': 'हे कसे कार्य करते ते पहा',
    'hero.disclaimer': 'अस्वीकरण: हे प्लॅटफॉर्म प्राथमिक नुकसान अहवाल आणि दावा साहाय्य प्रदान करते. हे अधिकृत विमा सर्वेक्षक किंवा कायदेशीर प्रतिनिधीचा पर्याय नाही.',
    
    // How it works steps
    'step.1.title': '1. वाहनाची नोंदणी करा',
    'step.1.desc': 'तुमच्या वाहनाची माहिती जोडा आणि विमा पॉलिसी लिंक करा.',
    'step.2.title': '2. घटना आणि पुरावे नोंदवा',
    'step.2.desc': 'अपघाताचे फोटो अपलोड करा, वेळ आणि ठिकाण नोंदवा.',
    'step.3.title': '3. एआय नुकसान आणि खर्च विश्लेषण',
    'step.3.desc': 'नुकसानीची तपासणी आणि अंदाजित दुरुस्ती खर्च मिळवा.',
    'step.4.title': '4. दावा अहवाल आणि चेकलिस्ट',
    'step.4.desc': 'कागदपत्र चेकलिस्टसह डाउनलोड करण्यायोग्य पीडीएफ अहवाल तयार करा.',

    // Features
    'feature.ai.title': 'प्रामाणिक एआय नुकसान तपासणी',
    'feature.ai.desc': 'कॉम्प्युटर व्हिजनद्वारे पारदर्शक नुकसान ओळख आणि मॅन्युअल दुरुस्ती साहाय्य.',
    'feature.ocr.title': 'ब्राउझरमध्ये कागदपत्र ओसीआर',
    'feature.ocr.desc': 'आरसी, विमा पॉलिसी आणि ड्रायव्हिंग लायसन्सवरून डेटा स्कॅन करा.',
    'feature.cost.title': 'डेटा-आधारित खर्च अंदाज',
    'feature.cost.desc': 'प्रादेशिक संदर्भ तक्त्यांच्या आधारे मजुरी आणि सुट्या भागांच्या खर्चाची श्रेणी.',
    'feature.nominee.title': 'वारसदार / कायदेशीर वारस साहाय्य',
    'feature.nominee.desc': 'मयत पॉलिसीधारकांच्या दाव्यांसाठी विशेष संवेदनशील मार्गदर्शन.',
    
    // Buttons & Actions
    'btn.save': 'जतन करा',
    'btn.cancel': 'रद्द करा',
    'btn.next': 'पुढील पायरी',
    'btn.back': 'मागे जा',
    'btn.submit': 'पुनरावलोकनासाठी पाठवा',
    'btn.downloadPdf': 'पीडीएफ अहवाल डाउनलोड करा',
    'btn.downloadJson': 'जेसन डेटा निर्यात करा',
    'btn.edit': 'संपादित करा',
    'btn.delete': 'काढून टाका',
    'btn.confirm': 'नक्की करा',
    'btn.uploadPhoto': 'फोटो अपलोड करा',
    'btn.scanDocument': 'ओसीआरने कागदपत्र स्कॅन करा',
    'btn.speak': 'बोलून नोंदवा',
    'btn.listening': 'ऐकत आहे...',
    'btn.retry': 'पुन्हा प्रयत्न करा',

    // Damage & Severity
    'severity.minor': 'किरकोळ नुकसान',
    'severity.moderate': 'मध्यम नुकसान',
    'severity.severe': 'गंभीर नुकसान',
    'severity.unable_to_determine': 'निश्चित करणे अशक्य',

    // Statuses
    'status.draft': 'मसुदा',
    'status.ready_for_submission': 'पुनरावलोकनासाठी तयार',
    'status.submitted_for_review': 'समीक्षकाकडे पाठवले',
    'status.under_review': 'तपासणी सुरू',
    'status.more_info_required': 'स्पष्टीकरण आवश्यक',
    'status.review_complete': 'तपासणी पूर्ण',
    'status.closed': 'बंद',

    // Voice & Offline
    'voice.notSupported': 'या ब्राउझरमध्ये आवाज ओळखणे समर्थित नाही.',
    'offline.notice': 'तुम्ही सध्या ऑफलाइन आहात. बदल स्थानिक पातळीवर जतन केले गेले आहेत.',
    
    // Admin
    'admin.title': 'प्रशासक आणि समीक्षक कार्यक्षेत्र',
    'admin.subtitle': 'प्रकरणांचे पुनरावलोकन करण्यासाठी आणि दुरुस्ती खर्च व्यवस्थापित करण्यासाठी अंतर्गत कार्यक्षेत्र.',
    'admin.referenceCosts': 'संदर्भ दुरुस्ती खर्च व्यवस्थापित करा',
    'admin.auditLog': 'ऑडिट लॉग आणि इतिहास'
  }
};
