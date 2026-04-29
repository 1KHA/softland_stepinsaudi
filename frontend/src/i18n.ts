import i18n from 'i18next';
import { initReactI18next } from '../node_modules/react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        brand: 'Soft Landing',
        switchLanguage: 'Switch language',
        english: 'EN',
        arabic: 'AR',
        backHome: 'Back to home',
        or: 'OR'
      },
      nav: {
        home: 'Home',
        about: 'About',
        services: 'Services',
        howItWorks: 'How it works',
        login: 'Start now'
      },
      hero: {
        badge: 'Saudi market entry, simplified',
        title: 'Launch your company in Saudi Arabia with clarity and speed.',
        description: 'A streamlined platform that helps founders and expansion teams set up entities, manage compliance, and execute market-entry tasks from one place.',
        primaryCta: 'Create your company account now',
        secondaryCta: 'See how it works',
        statOneLabel: 'Structured onboarding',
        statOneValue: '5 guided steps',
        statTwoLabel: 'Execution support',
        statTwoValue: 'Documents, tasks, approvals',
        statThreeLabel: 'Built for growth',
        statThreeValue: 'Scalable for cross-border teams'
      },
      services: {
        badge: 'Core services',
        title: 'Everything you need to enter the market with confidence.',
        description: 'We combine local expertise, workflow clarity, and operational support to help your team move faster.',
        items: {
          companyFormation: {
            title: 'Company formation',
            description: 'Set up your legal entity and complete the core registration requirements with a guided process.'
          },
          licenses: {
            title: 'Licenses & permits',
            description: 'Handle approvals, permits, and regulatory steps needed to launch your activity compliantly.'
          },
          support: {
            title: 'Ongoing support',
            description: 'Keep your operations moving with continued coordination, follow-ups, and execution assistance.'
          }
        }
      },
      about: {
        badge: 'About us',
        title: 'A reliable partner for market entry and operational readiness.',
        paragraphOne: 'Soft Landing helps regional and global companies navigate setup, approvals, and execution workflows in Saudi Arabia through a practical digital experience.',
        paragraphTwo: 'Our approach combines clarity, local knowledge, and organized task management so your team can focus on growth instead of fragmented processes.',
        cardTitle: 'Why teams choose Soft Landing',
        points: {
          one: 'Clear process from onboarding to approvals',
          two: 'Bilingual experience for local and international stakeholders',
          three: 'A modern workflow built around documents, tasks, and progress tracking'
        }
      },
      howItWorks: {
        badge: 'How it works',
        title: 'A clear 5-step workflow from signup to approvals.',
        description: 'Designed as an easy-to-follow path so teams always know what comes next.',
        steps: {
          one: {
            title: 'Create Account',
            description: 'Start with a secure account to access your workspace and onboarding flow.'
          },
          two: {
            title: 'Enter Company Data',
            description: 'Provide the key business information needed to initiate your setup process.'
          },
          three: {
            title: 'Define Requirements',
            description: 'Specify the services, approvals, and operational needs relevant to your company.'
          },
          four: {
            title: 'Upload Documents & Execute Tasks',
            description: 'Submit required files, complete guided tasks, and keep all work organized in one place.'
          },
          five: {
            title: 'Track Progress & Get Approvals',
            description: 'Monitor progress, follow status updates, and move through approvals with visibility.'
          }
        }
      },
      cta: {
        title: 'Ready to move your expansion plan forward?',
        description: 'Get a cleaner, faster path to company setup, execution, and approvals in Saudi Arabia.',
        action: 'Get started today'
      },
      footer: {
        description: 'Your trusted platform for setting up and managing business operations in Saudi Arabia with confidence.',
        quickLinks: 'Quick links',
        home: 'Home',
        about: 'About',
        howItWorks: 'How it works',
        services: 'Services',
        serviceLinks: {
          companyFormation: 'Company formation',
          licenses: 'Licenses & permits',
          support: 'Ongoing support'
        },
        contact: 'Contact us',
        address: 'Riyadh, Saudi Arabia',
        rights: 'All rights reserved ©️ {{year}} Soft Landing',
        privacy: 'Privacy policy',
        terms: 'Terms & conditions'
      },
      login: {
        loginTitle: 'Sign in',
        registerTitle: 'Create a new account',
        loginDescription: 'Welcome back. Sign in to continue your workflow.',
        registerDescription: 'Create your company account and complete your business profile to get started.',
        tabLogin: 'Sign in',
        tabRegister: 'New account',
        fullName: 'Full name',
        fullNamePlaceholder: 'Enter your full name',
        companyName: 'Company name',
        companyNamePlaceholder: 'Enter the company name',
        companyManager: 'Company manager',
        companyManagerPlaceholder: 'Enter the company manager name',
        country: 'Country',
        countryPlaceholder: 'Enter the country',
        sector: 'Sector',
        sectorPlaceholder: 'Enter the business sector',
        companyDescription: 'About the company',
        companyDescriptionPlaceholder: 'Write a short description about the company',
        companyLogo: 'Company logo',
        companyLogoHint: 'Upload the company logo',
        founders: 'Company founders',
        foundersPlaceholder: 'Enter the founders names',
        branchesCount: 'Number of branches',
        branchesCountPlaceholder: 'Enter the number of branches',
        contactNumber: 'Contact number',
        contactNumberPlaceholder: 'Enter the contact number',
        companyEmail: 'Company email',
        companyProfile: 'Company profile',
        companyProfileHint: 'Upload the company profile file',
        phone: 'Phone number',
        phonePlaceholder: 'Enter your phone number',
        email: 'Email',
        emailPlaceholder: 'example@email.com',
        password: 'Password',
        confirmPassword: 'Confirm password',
        forgotPassword: 'Forgot password?',
        submitLogin: 'Sign in',
        submitRegister: 'Create account',
        switchToRegister: "Don't have an account? Create one",
        switchToLogin: 'Already have an account? Sign in',
        agreement: 'By continuing, you agree to the',
        terms: 'Terms & Conditions',
        and: 'and',
        privacy: 'Privacy Policy'
      },
      dashboard: {
  dashboard: 'Dashboard',
  profile: 'My Profile',
  progress: 'Progress Tracking',
  notifications: 'Notifications',
  welcome: 'Welcome back',
  title: 'Company Dashboard',
  editProfile: 'Edit Profile',
  uploadDocuments: 'Upload Documents',
  currentStage: 'Current Stage',
  licensing: 'Licensing',
  registration: 'Registration',
  compliance: 'Compliance',
  finalApproval: 'Final Approval',
  inProgress: 'In Progress',
  follow: 'Follow',
  underReview: 'Under Review',
  view: 'View',
  tasks: {
    commercialRegister: {
      title: 'Submit Commercial Registration Request',
      due: 'Before April 25'
    },
    documents: {
      title: 'Upload Certified Company Documents',
      status: 'Submitted'
    }
  }
}
    }
  },
  ar: {
    translation: {
      common: {
        brand: 'سوفت لاندينج',
        switchLanguage: 'تبديل اللغة',
        english: 'EN',
        arabic: 'AR',
        backHome: 'العودة للرئيسية',
        or: 'أو'
      },
      nav: {
        home: 'الرئيسية',
        about: 'من نحن',
        services: 'خدماتنا',
        howItWorks: 'كيف تعمل المنصة؟',
        login: 'ابدأ الآن'
      },
      hero: {
        badge: 'دخول السوق السعودي بشكل أبسط',
        title: 'ابدأ دخول شركتك إلى السوق السعودي بوضوح وسرعة.',
        description: 'منصة عملية تساعد فرق التوسع ورواد الأعمال على تأسيس الكيانات، وإدارة المتطلبات، وتنفيذ المهام من مكان واحد.',
        primaryCta: 'انشىء حساب لشركتك الان',
        secondaryCta: 'شاهد كيف تعمل',
        statOneLabel: 'رحلة منظمة',
        statOneValue: '5 خطوات موجهة',
        statTwoLabel: 'تنفيذ متكامل',
        statTwoValue: 'مستندات، مهام، واعتمادات',
        statThreeLabel: 'جاهزة للتوسع',
        statThreeValue: 'مناسبة للفرق المحلية والدولية'
      },
      services: {
        badge: 'الخدمات الأساسية',
        title: 'كل ما تحتاجه لدخول السوق بثقة.',
        description: 'نجمع بين الخبرة المحلية، ووضوح الإجراءات، والدعم التشغيلي لمساعدة فريقك على التحرك بسرعة أكبر.',
        items: {
          companyFormation: {
            title: 'تأسيس الشركات',
            description: 'أسّس كيانك القانوني وأكمل متطلبات التسجيل الأساسية عبر مسار واضح وموجّه.'
          },
          licenses: {
            title: 'التراخيص والتصاريح',
            description: 'أنجز الموافقات والتصاريح والمتطلبات التنظيمية اللازمة لبدء نشاطك بشكل متوافق.'
          },
          support: {
            title: 'الدعم المستمر',
            description: 'حافظ على سير العمل من خلال المتابعة المستمرة والتنسيق والمساندة التنفيذية.'
          }
        }
      },
      about: {
        badge: 'من نحن',
        title: 'شريك موثوق لدخول السوق والجاهزية التشغيلية.',
        paragraphOne: 'تساعد سوفت لاندينج الشركات الإقليمية والعالمية على إدارة التأسيس والموافقات والمهام التنفيذية في المملكة العربية السعودية عبر تجربة رقمية عملية.',
        paragraphTwo: 'نمزج بين الوضوح، والخبرة المحلية، وتنظيم المهام حتى يتمكن فريقك من التركيز على النمو بدلاً من الإجراءات المتفرقة.',
        cardTitle: 'لماذا تختارنا الفرق؟',
        points: {
          one: 'مسار واضح من التسجيل وحتى الاعتمادات',
          two: 'تجربة ثنائية اللغة لأصحاب المصلحة المحليين والدوليين',
          three: 'منهجية حديثة تتمحور حول المستندات والمهام وتتبع التقدم'
        }
      },
      howItWorks: {
        badge: 'كيف تعمل المنصة؟',
        title: 'مسار واضح من 5 خطوات من التسجيل حتى الاعتمادات.',
        description: 'مصمم ليكون سهل الفهم والمتابعة بحيث يعرف فريقك دائماً الخطوة التالية.',
        steps: {
          one: {
            title: 'Create Account',
            description: 'ابدأ بإنشاء حساب آمن للوصول إلى مساحة العمل ومسار onboarding الخاص بك.'
          },
          two: {
            title: 'Enter Company Data',
            description: 'أدخل بيانات الشركة الأساسية اللازمة لبدء رحلة التأسيس بشكل صحيح.'
          },
          three: {
            title: 'Define Requirements',
            description: 'حدد الخدمات والموافقات والاحتياجات التشغيلية المرتبطة بطبيعة شركتك.'
          },
          four: {
            title: 'Upload Documents & Execute Tasks',
            description: 'ارفع الملفات المطلوبة ونفذ المهام الموجهة مع تنظيم كامل في مكان واحد.'
          },
          five: {
            title: 'Track Progress & Get Approvals',
            description: 'تابع التقدم، واطلع على تحديثات الحالة، وتحرك خلال الاعتمادات بوضوح كامل.'
          }
        }
      },
      cta: {
        title: 'جاهز لتحريك خطة التوسع الخاصة بك؟',
        description: 'ابدأ بمسار أوضح وأسرع لتأسيس الشركة، وتنفيذ المهام، والحصول على الاعتمادات داخل المملكة.',
        action: 'ابدأ اليوم'
      },
      footer: {
        description: 'منصتك الموثوقة لتأسيس وإدارة أعمالك في المملكة العربية السعودية بثقة ووضوح.',
        quickLinks: 'روابط سريعة',
        home: 'الرئيسية',
        about: 'من نحن',
        howItWorks: 'كيف تعمل المنصة؟',
        services: 'خدماتنا',
        serviceLinks: {
          companyFormation: 'تأسيس الشركات',
          licenses: 'التراخيص والتصاريح',
          support: 'الدعم المستمر'
        },
        contact: 'تواصل معنا',
        address: 'الرياض، المملكة العربية السعودية',
        rights: 'جميع الحقوق محفوظة ©️ {{year}} سوفت لاندينج',
        privacy: 'سياسة الخصوصية',
        terms: 'الشروط والأحكام'
      },
      login: {
        loginTitle: 'تسجيل الدخول',
        registerTitle: 'إنشاء حساب جديد',
        loginDescription: 'مرحباً بعودتك. سجّل دخولك لمتابعة سير العمل.',
        registerDescription: 'أنشئ حساب شركتك وأكمل ملفها التعريفي للبدء.',
        tabLogin: 'تسجيل الدخول',
        tabRegister: 'حساب جديد',
        fullName: 'الاسم الكامل',
        fullNamePlaceholder: 'أدخل اسمك الكامل',
        companyName: 'اسم الشركة',
        companyNamePlaceholder: 'أدخل اسم الشركة',
        companyManager: 'مدير الشركة',
        companyManagerPlaceholder: 'أدخل اسم مدير الشركة',
        country: 'الدولة',
        countryPlaceholder: 'أدخل الدولة',
        sector: 'القطاع',
        sectorPlaceholder: 'أدخل القطاع',
        companyDescription: 'وصف عن الشركة',
        companyDescriptionPlaceholder: 'اكتب وصفاً مختصراً عن الشركة',
        companyLogo: 'شعار الشركة',
        companyLogoHint: 'ارفع شعار الشركة',
        founders: 'مؤسسو الشركة',
        foundersPlaceholder: 'أدخل أسماء المؤسسين',
        branchesCount: 'عدد الفروع',
        branchesCountPlaceholder: 'أدخل عدد الفروع',
        contactNumber: 'رقم التواصل',
        contactNumberPlaceholder: 'أدخل رقم التواصل',
        companyEmail: 'بريد الشركة الإلكتروني',
        companyProfile: 'ملف تعريفي عن الشركة',
        companyProfileHint: 'ارفع الملف التعريفي عن الشركة',
        phone: 'رقم الهاتف',
        phonePlaceholder: 'أدخل رقم الهاتف',
        email: 'البريد الإلكتروني',
        emailPlaceholder: 'example@email.com',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        submitLogin: 'تسجيل الدخول',
        submitRegister: 'إنشاء حساب',
        switchToRegister: 'ليس لديك حساب؟ أنشئ واحداً',
        switchToLogin: 'لديك حساب بالفعل؟ سجّل الدخول',
        agreement: 'باستمرارك فأنت توافق على',
        terms: 'الشروط والأحكام',
        and: 'و',
        privacy: 'سياسة الخصوصية'
      },
      dashboard: {
dashboard: 'لوحة التحكم',
profile: 'ملفي الشخصي',
progress: 'تتبع التقدم',
notifications: 'الإشعارات',
  welcome: 'أهلاً بعودتك',
  title: 'لوحة تحكم الشركة',
  editProfile: 'تعديل الملف',
  uploadDocuments: 'رفع مستندات',
  currentStage: 'المرحلة الحالية',
  licensing: 'التراخيص',
  registration: 'التسجيل',
  compliance: 'الامتثال',
  finalApproval: 'القبول النهائي',
  inProgress: 'قيد التنفيذ',
  follow: 'متابعة',
  underReview: 'تحت المراجعة',
  view: 'عرض',
  tasks: {
    commercialRegister: {
      title: 'تقديم طلب السجل التجاري',
      due: 'قبل 25 أبريل'
    },
    documents: {
      title: 'رفع مستندات الشركة الموثقة',
      status: 'تم الإرسال'
    }
  }
}
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;