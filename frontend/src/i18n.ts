import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const resources = {
  en: {
    translation: {
      common: {
        brand: 'StepIn',
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
  location: 'Riyadh, Saudi Arabia',
        quickLinks: 'Quick links',
        home: 'Home',
        about: 'About',
        howItWorks: 'How it works',
        services: 'Services',
        
        serviceLinks: {
          companyFormation: 'Company formation',
          licenses: 'Licenses & permits',
          support: 'Ongoing support',
          
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
        selectCountry: 'Select country',
        countries: {
          saudiArabia: 'Saudi Arabia',
          uae: 'United Arab Emirates',
          kuwait: 'Kuwait',
          qatar: 'Qatar',
          bahrain: 'Bahrain',
          oman: 'Oman'
        },
        sector: 'Sector',
        sectorPlaceholder: 'Enter the business sector',
        selectSector: 'Select sector',
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
        submitting: 'Please wait…',
        errors: {
          required: 'This field is required',
          invalidEmail: 'Enter a valid email address',
          passwordMismatch: 'Passwords do not match',
          weakPassword:
            'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character (@$!%*?&)',
          minBranches: 'Enter at least 1 branch',
          selectCountry: 'Please select a country',
          selectSector: 'Please select a sector',
          fileRequired: 'Please choose a file',
          fixFields: 'Please correct the highlighted fields below.',
          loginFailed: 'Sign in failed. Check your email and password.',
          registerFailed: 'We could not create the account. Please try again.',
          network: 'Could not reach the server. Please try again.'
        },
        switchToRegister: "Don't have an account? Create one",
        switchToLogin: 'Already have an account? Sign in',
        agreement: 'By continuing, you agree to the',
        terms: 'Terms & Conditions',
        and: 'and',
        privacy: 'Privacy Policy'
      },

      profile: {
  savedSuccessfully: "Changes saved successfully",
  updatedSuccessfully: "Company information has been updated.",
  companyProfile: "Company Profile",
  manageCompanyInformation: "Manage your company information",
  editingMode: "Editing Mode",
  viewMode: "View Mode",
  companyLogo: "Company Logo",
  companyName: "Company Name",
  companyManager: "Company Manager",
  country: "Country",
  sector: "Sector",
  numberOfBranches: "Number Of Branches",
  contactNumber: "Contact Number",
  companyEmail: "Company Email",
  companyDescription: "Company Description",
  companyFounders: "Company Founders",
  addFounder: "Add Founder",
  saveChanges: "Save Changes"
},

licensesPage: {
  title: "Licenses",
  subtitle: "View and download your issued licenses.",
  noLicenses: "No licenses available",
  noLicensesDescription:
    "Issued licenses will appear here once uploaded by the administrator.",
  finalLicenseIssued: "Final License Issued"
},

download: "Download",
    licenses: "Licenses",
companyHeader: {
  subtitle: "Your First Steps Toward Sustainable Success"
},
landing: {
  slogan: "Your First Steps Toward Sustainable Success"
},

"status": {
  "PENDING": "Pending",
  "UNDER_REVIEW": "Under Review",
  "IN_PROGRESS": "In Progress",
  "COMPLETED": "Completed",
  "APPROVED": "Approved",
  "REJECTED": "Rejected"
},

  "error": "Error",
  "deleteConfirmationTitle": "Delete Confirmation",
  "deleteConfirmationMessage": "Are you sure you want to delete this stage?",

"task": {
    currentStatus: "Current Status",
  requiredDocuments: "Required Documents",
  "reviewAndUpload": "Review task details and upload the required documents.",
    "whatYouNeedToDo": "What You Need To Do",
    "submitTask": "Submit Task",
      "uploadDocuments": "upload Documents ",
      "uploadAllRequiredFiles": "Please upload all required files before submitting",
      "documentsSubmitted": "Documents submitted successfully",
"documentsUnderReview": "Your documents are currently under review",
    "selectFiles": "Please select a file before submitting"
},


 notifications: "Notifications", 
"back":"back",
"view": "View", 
"ok": "OK",

dashboard: {
  dashboard: "Dashboard",
  currentStage: "Current Stage",
  profile: 'My Profile',
  progress: 'Progress Tracking',
  notifications: 'Notifications',
  welcome: 'Welcome back',
  title: 'Company Dashboard',
  editProfile: 'Edit Profile',
  "approvedTitle": "Congratulations!",
  "approvedMessage": "Your company has successfully completed all onboarding stages and has been approved.",
  uploadDocuments: 'Upload Documents',
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
      },


notificationsPage: {
  subtitle: "Stay updated with the latest changes to your documents and applications.",
  noNotifications: "No notifications yet",
  noNotificationsDescription:
    "You'll receive notifications here whenever there are updates to your applications or documents.",

  documentNeedsReupload: "Document requires re-upload",

  documentApproved: "Document approved",
  documentApprovedDesc:
    "Your document has been reviewed and approved.",

  resubmissionRequested: "Document requires re-upload",
  resubmissionRequestedDesc:
    "Your document was reviewed and needs to be uploaded again.",

  licenseIssued: "License issued",
  licenseIssuedDesc:
    "License issued: {{license}}",

  systemNotification: "System notification"
},



employee: {
        welcome: 'Welcome back',
        dashboard: 'Employee Dashboard',
        dashboardSubtitle: 'Manage and follow up on assigned company requests',
        logout: 'Sign out',
        refresh: 'Refresh',
        nav: {
          home: 'Home',
          requests: 'Requests',
          documents: 'Document Review',
          notifications: 'Notifications'
        },
        quickActions: 'Quick Actions',
        summary: {
          totalRequests: 'Total Requests',
          pendingReview: 'Under Review',
          approvedToday: 'Approved',
          rejected: 'Rejected',
          approvalRate: 'Approval Rate',
          needsReview: 'Needs Review',
          needsCompletion: 'Needs Completion',
          activitySummary: 'Activity Summary'
        },
        recentRequests: 'Recent Requests',
        recentNotifications: 'Recent Notifications',
        viewAll: 'View all',
        noRequests: 'No requests assigned to you',
        noNotifications: 'No notifications',
        notificationsWillAppear: 'Notifications will appear here when there are updates',
status: {
  pending: "Pending",
  underReview: "Under Review",
  inProgress: "In Progress",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
  needsCompletion: "Needs Completion",
  needsResubmission: "Needs Resubmission",
  locked: "Locked",
  submitted: "Submitted"
},
"cancel": "Cancel",

        requests: {
          title: 'Requests List',
          subtitle: 'All company requests assigned to you',
          searchPlaceholder: 'Search by company name or request number...',
          filterStatus: 'Filter by Status',
          clearFilters: 'Clear',
          noRequests: 'No matching requests found',
          total: 'request(s) total',
          table: {
            id: 'Request ID',
            company: 'Company',
            sector: 'Sector',
            stage: 'Current Stage',
            status: 'Status',
            employee: 'Assigned Employee',
            date: 'Date',
            actions: 'Actions'
          },
          details: 'Details',
          pagination: {
            showing: 'Showing',
            to: 'to',
            results: 'results'
          }
        },
        requestDetails: {
          title: 'Request Details',
          requestId: 'Request ID',
          backToList: 'Back to requests list',
          companyInfo: 'Company Information',
          requestMeta: 'Request Details',
          country: 'Country',
          createdAt: 'Created At',
          stages: 'Stages',
          completed: 'completed',
          tasks: 'Tasks',
          documents: 'Documents',
          file: 'file(s)',
          progress: 'Progress',
          workflow: 'Workflow Stages',
          docsTitle: 'Uploaded Documents',
          noDocs: 'No documents uploaded yet',
          notes: 'Notes & Comments',
          noNotes: 'No notes available',
          notePlaceholder: 'Write a note...',
          rejectionReason: 'Rejection reason',
          adminNote: 'Admin Note',
          actions: {
            title: 'Actions',
            approve: 'Approve Request',
            requestEdit: 'Request Resubmission',
            reject: 'Reject Request',
            hint: 'Approving completes every stage and task for this company at once. To advance one step at a time, approve the individual documents instead.'
          },
          confirmation: {
            title: 'Confirm Action',
            approve: 'Are you sure you want to approve this request?',
            reject: 'Are you sure you want to reject this request?',
            requestEdit: 'Are you sure you want to request resubmission of documents?',
            reasonPlaceholder: 'Enter the reason or your note...',
            confirm: 'Confirm',
            cancel: 'Cancel',
            processing: 'Processing...'
          },
          toast: {
            approved: 'Request approved successfully \u2705',
            rejected: 'Request rejected',
            resubmit: 'Resubmission requested',
            error: 'An error occurred, please try again'
          }
        },
        documents: {
          title: 'Document Review',
          subtitle: 'Review each uploaded file independently',
          searchPlaceholder: 'Search by file name, company, or task...',
          refresh: 'Refresh',
          clear: 'Clear',
          found: 'document(s)',
          noDocs: 'No documents found',
          tabs: {
            all: 'All',
            pending: 'Under Review',
            approved: 'Approved',
            rejected: 'Rejected',
            needsReupload: 'Needs Re-upload'
          },
          table: {
            name: 'Document Name',
            company: 'Company',
            stage: 'Stage',
            task: 'Task',
            uploadDate: 'Upload Date',
            status: 'Status',
            actions: 'Actions'
          },
          actions: {
            view: 'View',
            download: 'Download',
            approve: 'Approve',
            reject: 'Reject',
            requestReupload: 'Request Re-upload'
          },
          modal: {
            rejectTitle: 'Reject Document',
            resubmitTitle: 'Request Re-upload',
            rejectDesc: 'Please enter the reason for rejecting this document.',
            resubmitDesc: 'Please specify the reason for requesting re-upload.',
            notesLabel: 'Notes',
            notesPlaceholder: 'Enter your notes...',
            confirm: 'Confirm',
            cancel: 'Cancel',
            processing: 'Processing...'
          },
          toast: {
            approved: 'Document approved \u2705',
            rejected: 'Document rejected',
            resubmit: 'Re-upload requested',
            error: 'An error occurred'
          }
        },
        notifications: {
          title: 'Notifications',
          subtitle: 'System alerts and request updates',
          markAllRead: 'Mark all as read',
          markAsRead: 'Mark as read',
          noNotifications: 'No notifications',
          tabs: {
            all: 'All',
            unread: 'Unread',
            approved: 'Approvals',
            rejected: 'Rejections',
            resubmit: 'Resubmissions'
          },

          notificationsPage: {
  subtitle: "Stay updated with the latest status of your documents and requests.",
  noNotifications: "No notifications yet",
  noNotificationsDescription: "We'll notify you whenever there is an update on your requests or documents.",
  documentNeedsReupload: "Document Needs Re-upload",
  resubmissionRequestedDesc:
  "Your document was reviewed and needs to be uploaded again.",

documentApprovedDesc:
  "Your document has been reviewed and approved.",

licenseIssuedDesc:
  "License issued: {{license}}",
  documentApproved: "Document Approved",
  licenseIssued: "License Issued",
  systemNotification: "System Notification"
},

          types: {
            REQUEST_APPROVED: 'Request Approved',
            REQUEST_REJECTED: 'Request Rejected',
            RESUBMISSION_REQUESTED: 'Resubmission Requested',
            INFO: 'Info'
          },

          uploadFinalLicense: "Upload Final License",
selectFileFirst: "Please select a file first",
finalLicenseUploaded: "Final license uploaded successfully",
uploadFailed: "Upload failed",
documentApproved: "Document approved successfully",
documentApproveFailed: "Failed to approve document",
documentNeedsResubmission: "Document marked for resubmission",
documentUpdateFailed: "Failed to update document",


          summary: {
            approvals: 'Approvals',
            rejections: 'Rejections',
            resubmissions: 'Resubmissions',
            unread: 'Unread'
          }
        }
      }
    }
  },
  ar: {
    translation: {
      common: {
        brand: "STEPIN",
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
      title: 'إنشاء الحساب',
      description: 'ابدأ بإنشاء حساب آمن للوصول إلى مساحة العمل ومسار العمل الخاص بشركتك.'
    },
    two: {
      title: 'إدخال بيانات الشركة',
      description: 'أدخل بيانات الشركة الأساسية اللازمة لبدء رحلة التأسيس بشكل صحيح.'
    },
    three: {
      title: 'تحديد المتطلبات',
      description: 'حدد الخدمات والموافقات والاحتياجات التشغيلية المرتبطة بطبيعة شركتك.'
    },
    four: {
      title: 'رفع المستندات وتنفيذ المهام',
      description: 'ارفع الملفات المطلوبة ونفذ المهام الموجهة مع تنظيم كامل في مكان واحد.'
    },
    five: {
      title: 'متابعة التقدم والحصول على الاعتمادات',
      description: 'تابع التقدم واطلع على تحديثات الحالة وتحرك خلال الاعتمادات بوضوح كامل.'
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
        selectCountry: 'اختر الدولة',
        countries: {
          saudiArabia: 'المملكة العربية السعودية',
          uae: 'الإمارات العربية المتحدة',
          kuwait: 'الكويت',
          qatar: 'قطر',
          bahrain: 'البحرين',
          oman: 'عُمان'
        },
        sector: 'القطاع',
        sectorPlaceholder: 'أدخل القطاع',
        selectSector: 'اختر القطاع',
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
        submitting: 'يرجى الانتظار…',
        errors: {
          required: 'هذا الحقل مطلوب',
          invalidEmail: 'أدخل بريداً إلكترونياً صحيحاً',
          passwordMismatch: 'كلمتا المرور غير متطابقتين',
          weakPassword:
            'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وحرف كبير وحرف صغير ورقم ورمز خاص (@$!%*?&)',
          minBranches: 'أدخل فرعاً واحداً على الأقل',
          selectCountry: 'يرجى اختيار الدولة',
          selectSector: 'يرجى اختيار القطاع',
          fileRequired: 'يرجى اختيار ملف',
          fixFields: 'يرجى تصحيح الحقول المحددة أدناه.',
          loginFailed: 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.',
          registerFailed: 'تعذّر إنشاء الحساب. يرجى المحاولة مرة أخرى.',
          network: 'تعذّر الاتصال بالخادم. يرجى المحاولة مرة أخرى.'
        },
        switchToRegister: 'ليس لديك حساب؟ أنشئ واحداً',
        switchToLogin: 'لديك حساب بالفعل؟ سجّل الدخول',
        agreement: 'باستمرارك فأنت توافق على',
        terms: 'الشروط والأحكام',
        and: 'و',
        privacy: 'سياسة الخصوصية'
      },

      profile: {
  savedSuccessfully: "تم حفظ التعديلات بنجاح",
  updatedSuccessfully: "تم تحديث معلومات الشركة.",
  companyProfile: "الملف الشخصي للشركة",
  manageCompanyInformation: "إدارة معلومات شركتك",
  editingMode: "وضع التعديل",
  viewMode: "وضع العرض",
  companyLogo: "شعار الشركة",
  companyName: "اسم الشركة",
  companyManager: "مدير الشركة",
  country: "الدولة",
  sector: "القطاع",
  numberOfBranches: "عدد الفروع",
  contactNumber: "رقم التواصل",
  companyEmail: "البريد الإلكتروني للشركة",
  companyDescription: "وصف الشركة",
  companyFounders: "مؤسسو الشركة",
  addFounder: "إضافة مؤسس",
  saveChanges: "حفظ التعديلات"
},

licensesPage: {
  title: "التراخيص",
  subtitle: "استعرض وقم بتنزيل التراخيص الصادرة لشركتك.",
  noLicenses: "لا توجد تراخيص متاحة",
  noLicensesDescription:
    "ستظهر التراخيص هنا بعد رفعها من قبل المسؤول.",
  finalLicenseIssued: "تم إصدار الترخيص النهائي"
},

download: "تنزيل",
    licenses: "تراخيص",
notifications: "الإشعارات",


      "status": {
  "PENDING": "قيد الانتظار",
  "IN_PROGRESS": "قيد التنفيذ",
  "COMPLETED": "مكتمل",
  "UNDER_REVIEW": "قيد المراجعة",
    "NEEDS_RESUBMISSION": "إعادة رفع مطلوبة",
  "REJECTED": "مرفوض"

},
"cancel": "إلغاء",

notificationsPage: {
  subtitle: "ابقَ على اطلاع بآخر تحديثات مستنداتك وطلباتك.",
  noNotifications: "لا توجد إشعارات حتى الآن",
  noNotificationsDescription: "سنقوم بإشعارك عند وجود أي تحديث على طلباتك أو مستنداتك.",
  documentNeedsReupload: "المستند يحتاج إلى إعادة رفع",


documentApprovedDesc:
  "تمت مراجعة المستند واعتماده بنجاح",

licenseIssuedDesc:
  "تم إصدار الترخيص: {{license}}",
  documentApproved: "تمت الموافقة على المستند",
  resubmissionRequested: "المستند يحتاج إلى إعادة رفع",
resubmissionRequestedDesc:
  "تمت مراجعة المستند ويجب إعادة رفعه مرة أخرى.",
  licenseIssued: "تم إصدار الترخيص",
  systemNotification: "إشعار من النظام"
},


companyHeader: {
  subtitle: "خطواتك الأولى نحو نجاحٍ مستدام"
},

landing: {
  slogan: "خطواتك الأولى نحو نجاحٍ مستدام"
},

  "error": "خطأ",
  "deleteConfirmationTitle": "تأكيد الحذف",
  "deleteConfirmationMessage": "هل أنت متأكد من حذف المرحلة؟",

"task": {
    currentStatus: "الحالة الحالية",
  requiredDocuments: "المستندات المطلوبة",
  "reviewAndUpload": "راجع تفاصيل المهمة وارفع المستندات المطلوبة",
      "selectFiles": "الرجاء اختيار ملف قبل الإرسال",
    "whatYouNeedToDo": "ما الذي يجب عليك القيام به",
    "submitTask": "إرسال المهمة",
      "uploadDocuments": "رفع المستندات",
      "uploadAllRequiredFiles": "يرجى رفع جميع الملفات المطلوبة قبل الإرسال",
      "documentsSubmitted": "تم إرسال المستندات بنجاح",
"documentsUnderReview": "المستندات قيد المراجعة حالياً"
},
  
"back":"رجوع",
"ok": "حسناً",
"view": "عرض",
      dashboard: {
dashboard: 'لوحة التحكم',
  currentStage: 'المرحلة الحالية',
profile: 'ملفي الشخصي',
progress: 'تتبع التقدم',
notifications: 'الإشعارات',
  welcome: 'أهلاً بعودتك',
  title: 'لوحة تحكم الشركة',
  editProfile: 'تعديل الملف',
  "approvedTitle": "تهانينا!",
  "approvedMessage": "تم إكمال جميع مراحل الانضمام بنجاح وتمت الموافقة على شركتك.",
  uploadDocuments: 'رفع مستندات',
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
      },
documentApproved: "تم اعتماد المستند بنجاح",
      employee: {
        welcome: '\u0645\u0631\u062d\u0628\u0627\u064b',
        dashboard: '\u0644\u0648\u062d\u0629 \u062a\u062d\u0643\u0645 \u0627\u0644\u0645\u0648\u0638\u0641',
        dashboardSubtitle: '\u0625\u062f\u0627\u0631\u0629 \u0648\u0645\u062a\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u064f\u0633\u0646\u062f\u0629 \u0625\u0644\u064a\u0643',
        logout: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c',
        refresh: '\u062a\u062d\u062f\u064a\u062b',
        nav: {
          home: '\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629',
          requests: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a',
          documents: '\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
          notifications: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a'
        },
        quickActions: '\u0625\u062c\u0631\u0627\u0621\u0627\u062a \u0633\u0631\u064a\u0639\u0629',
        summary: {
          totalRequests: '\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0637\u0644\u0628\u0627\u062a',
          pendingReview: '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
          approvedToday: '\u0645\u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647\u0627',
          rejected: '\u0645\u0631\u0641\u0648\u0636\u0629',
          approvalRate: '\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629',
          needsReview: '\u064a\u062d\u062a\u0627\u062c \u0645\u0631\u0627\u062c\u0639\u0629',
          needsCompletion: '\u064a\u062d\u062a\u0627\u062c \u0627\u0633\u062a\u0643\u0645\u0627\u0644',
          activitySummary: '\u0645\u0644\u062e\u0635 \u0627\u0644\u0646\u0634\u0627\u0637'
        },
        recentRequests: '\u0627\u0644\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0623\u062e\u064a\u0631\u0629',
        recentNotifications: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0627\u0644\u0623\u062e\u064a\u0631\u0629',
        viewAll: '\u0639\u0631\u0636 \u0627\u0644\u0643\u0644',
        noRequests: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0645\u0633\u0646\u062f\u0629 \u0625\u0644\u064a\u0643',
        noNotifications: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u0634\u0639\u0627\u0631\u0627\u062a',
        notificationsWillAppear: '\u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627 \u0639\u0646\u062f \u0648\u062c\u0648\u062f \u062a\u062d\u062f\u064a\u062b\u0627\u062a',
        status: {
          underReview: '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
          approved: '\u0645\u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647',
          rejected: '\u0645\u0631\u0641\u0648\u0636',
          needsCompletion: '\u064a\u062d\u062a\u0627\u062c \u0627\u0633\u062a\u0643\u0645\u0627\u0644',
          submitted: '\u0645\u0642\u062f\u0645',
          pending: '\u0645\u0639\u0644\u0642',
          inProgress: '\u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0646\u0641\u064a\u0630',
          completed: '\u0645\u0643\u062a\u0645\u0644',
          locked: '\u0645\u063a\u0644\u0642',
          needsResubmission: '\u064a\u062d\u062a\u0627\u062c \u0625\u0639\u0627\u062f\u0629 \u0631\u0641\u0639',
          all: '\u0627\u0644\u0643\u0644'
        },
        requests: {
          title: '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a',
          subtitle: '\u062c\u0645\u064a\u0639 \u0637\u0644\u0628\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0627\u0644\u0645\u064f\u0633\u0646\u062f\u0629 \u0625\u0644\u064a\u0643',
          searchPlaceholder: '\u0627\u0628\u062d\u062b \u0628\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628...',
          filterStatus: '\u0641\u0644\u062a\u0631 \u0627\u0644\u062d\u0627\u0644\u0629',
          clearFilters: '\u0645\u0633\u062d',
          noRequests: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629',
          total: '\u0637\u0644\u0628 \u0625\u062c\u0645\u0627\u0644\u0627\u064b',
          table: {
            id: '\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628',
            company: '\u0627\u0644\u0634\u0631\u0643\u0629',
            sector: '\u0627\u0644\u0642\u0637\u0627\u0639',
            stage: '\u0627\u0644\u0645\u0631\u062d\u0644\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629',
            status: '\u0627\u0644\u062d\u0627\u0644\u0629',
            employee: '\u0627\u0644\u0645\u0648\u0638\u0641 \u0627\u0644\u0645\u0633\u0624\u0648\u0644',
            date: '\u0627\u0644\u062a\u0627\u0631\u064a\u062e',
            actions: '\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a'
          },
          details: '\u062a\u0641\u0627\u0635\u064a\u0644',
          pagination: {
            showing: '\u0639\u0631\u0636',
            to: '\u0625\u0644\u0649',
            results: '\u0646\u062a\u064a\u062c\u0629'
          }
        },
        requestDetails: {
          title: '\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0637\u0644\u0628',
          requestId: '\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628',
          backToList: '\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0644\u0628\u0627\u062a',
          companyInfo: '\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0634\u0631\u0643\u0629',
          requestMeta: '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0637\u0644\u0628',
          country: '\u0627\u0644\u062f\u0648\u0644\u0629',
          createdAt: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0625\u0646\u0634\u0627\u0621',
          stages: '\u0627\u0644\u0645\u0631\u0627\u062d\u0644',
          completed: '\u0645\u0643\u062a\u0645\u0644\u0629',
          tasks: '\u0627\u0644\u0645\u0647\u0627\u0645',
          documents: '\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
          file: '\u0645\u0644\u0641',
          progress: '\u0627\u0644\u062a\u0642\u062f\u0645',
          workflow: '\u0645\u0631\u0627\u062d\u0644 \u0633\u064a\u0631 \u0627\u0644\u0639\u0645\u0644',
          docsTitle: '\u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0627\u0644\u0645\u0631\u0641\u0648\u0639\u0629',
          noDocs: '\u0644\u0645 \u064a\u062a\u0645 \u0631\u0641\u0639 \u0623\u064a \u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0628\u0639\u062f',
          notes: '\u0645\u0644\u0627\u062d\u0638\u0627\u062a \u0648\u062a\u0639\u0644\u064a\u0642\u0627\u062a',
          noNotes: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0644\u0627\u062d\u0638\u0627\u062a',
          notePlaceholder: '\u0627\u0643\u062a\u0628 \u0645\u0644\u0627\u062d\u0638\u0629...',
          rejectionReason: '\u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636',
          adminNote: '\u0645\u0644\u0627\u062d\u0638\u0629 \u0625\u062f\u0627\u0631\u064a\u0629',
          actions: {
            title: '\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a',
            approve: '\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628',
            requestEdit: '\u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0642\u062f\u064a\u0645',
            reject: '\u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628',
            hint: '\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u062a\u064f\u0643\u0645\u0644 \u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0631\u0627\u062d\u0644 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0644\u0647\u0630\u0647 \u0627\u0644\u0634\u0631\u0643\u0629 \u062f\u0641\u0639\u0629 \u0648\u0627\u062d\u062f\u0629. \u0644\u0644\u062a\u0642\u062f\u0645 \u062e\u0637\u0648\u0629 \u0628\u062e\u0637\u0648\u0629\u060c \u0627\u0639\u062a\u0645\u062f \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a \u0628\u0634\u0643\u0644 \u0645\u0646\u0641\u0631\u062f.'
          },
          confirmation: {
            title: '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0625\u062c\u0631\u0627\u0621',
            approve: '\u0647\u0644 \u062a\u0631\u064a\u062f \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628\u061f',
            reject: '\u0647\u0644 \u062a\u0631\u064a\u062f \u0631\u0641\u0636 \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628\u061f',
            requestEdit: '\u0647\u0644 \u062a\u0631\u064a\u062f \u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u062a\u0642\u062f\u064a\u0645 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u061f',
            reasonPlaceholder: '\u0623\u062f\u062e\u0644 \u0633\u0628\u0628 \u0627\u0644\u0631\u0641\u0636 \u0623\u0648 \u0645\u0644\u0627\u062d\u0638\u062a\u0643...',
            confirm: '\u062a\u0623\u0643\u064a\u062f',
            cancel: '\u0625\u0644\u063a\u0627\u0621',
            processing: '\u062c\u0627\u0631\u064a...'
          },
          toast: {
            approved: '\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628 \u2705',
            rejected: '\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628',
            resubmit: '\u062a\u0645 \u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0642\u062f\u064a\u0645',
            error: '\u062d\u062f\u062b \u062e\u0637\u0623\u060c \u062d\u0627\u0648\u0644 \u0645\u062c\u062f\u062f\u0627\u064b'
          }
        },
        documents: {
          title: '\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u0646\u062f\u0627\u062a',
          subtitle: '\u0645\u0631\u0627\u062c\u0639\u0629 \u0643\u0644 \u0645\u0644\u0641 \u0645\u064f\u0631\u0641\u0642 \u0628\u0634\u0643\u0644 \u0645\u0633\u062a\u0642\u0644',
          searchPlaceholder: '\u0627\u0628\u062d\u062b \u0628\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641 \u0623\u0648 \u0627\u0644\u0634\u0631\u0643\u0629 \u0623\u0648 \u0627\u0644\u0645\u0647\u0645\u0629...',
          refresh: '\u062a\u062d\u062f\u064a\u062b',
          clear: '\u0645\u0633\u062d',
          found: '\u0645\u0633\u062a\u0646\u062f',
          noDocs: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0633\u062a\u0646\u062f\u0627\u062a',
          tabs: {
            all: '\u0627\u0644\u0643\u0644',
            pending: '\u0642\u064a\u062f \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629',
            approved: '\u0645\u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647',
            rejected: '\u0645\u0631\u0641\u0648\u0636',
            needsReupload: '\u064a\u062d\u062a\u0627\u062c \u0625\u0639\u0627\u062f\u0629 \u0631\u0641\u0639'
          },
          table: {
            name: '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u0646\u062f',
            company: '\u0627\u0644\u0634\u0631\u0643\u0629',
            stage: '\u0627\u0644\u0645\u0631\u062d\u0644\u0629',
            task: '\u0627\u0644\u0645\u0647\u0645\u0629',
            uploadDate: '\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0631\u0641\u0639',
            status: '\u0627\u0644\u062d\u0627\u0644\u0629',
            actions: '\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a'
          },
          actions: {
            view: '\u0639\u0631\u0636',
            download: '\u062a\u062d\u0645\u064a\u0644',
            approve: '\u0642\u0628\u0648\u0644',
            reject: '\u0631\u0641\u0636',
            requestReupload: '\u0625\u0639\u0627\u062f\u0629 \u0631\u0641\u0639'
          },
          modal: {
            rejectTitle: '\u0631\u0641\u0636 \u0627\u0644\u0645\u0633\u062a\u0646\u062f',
            resubmitTitle: '\u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0631\u0641\u0639',
            rejectDesc: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0633\u0628\u0628 \u0631\u0641\u0636 \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062a\u0646\u062f.',
            resubmitDesc: '\u064a\u0631\u062c\u0649 \u062a\u062d\u062f\u064a\u062f \u0633\u0628\u0628 \u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0631\u0641\u0639.',
            notesLabel: '\u0627\u0644\u0645\u0644\u0627\u062d\u0638\u0627\u062a',
            notesPlaceholder: '\u0623\u062f\u062e\u0644 \u0645\u0644\u0627\u062d\u0638\u0627\u062a\u0643...',
            confirm: '\u062a\u0623\u0643\u064a\u062f',
            cancel: '\u0625\u0644\u063a\u0627\u0621',
            processing: '\u062c\u0627\u0631\u064a...'
          },
          toast: {
            approved: '\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062a\u0646\u062f \u2705',
            rejected: '\u062a\u0645 \u0631\u0641\u0636 \u0627\u0644\u0645\u0633\u062a\u0646\u062f',
            resubmit: '\u062a\u0645 \u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0631\u0641\u0639',
            error: '\u062d\u062f\u062b \u062e\u0637\u0623'
          }
        },
        notifications: {
          documentApproveFailed: "فشل اعتماد المستند",
          documentNeedsResubmission: "تم طلب إعادة رفع المستند",
          documentUpdateFailed: "فشل تحديث المستند",
          finalLicenseUploaded: "تم رفع الترخيص النهائي بنجاح",
          selectFileFirst: "يرجى اختيار ملف أولاً",
          uploadFailed: "فشل في رفع الملف",
          uploadFinalLicense: "رفع الترخيص النهائي",
          title: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
          subtitle: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u062a\u062d\u062f\u064a\u062b\u0627\u062a \u0627\u0644\u0637\u0644\u0628\u0627\u062a',
          markAllRead: '\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0643\u0644 \u0643\u0645\u0642\u0631\u0648\u0621',
          markAsRead: '\u062a\u062d\u062f\u064a\u062f \u0643\u0645\u0642\u0631\u0648\u0621',
          noNotifications: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0625\u0634\u0639\u0627\u0631\u0627\u062a',
          tabs: {
            all: '\u0627\u0644\u0643\u0644',
            unread: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629',
            approved: '\u0645\u0648\u0627\u0641\u0642\u0627\u062a',
            rejected: '\u0645\u0631\u0641\u0648\u0636\u0627\u062a',
            resubmit: '\u0625\u0639\u0627\u062f\u0629 \u062a\u0642\u062f\u064a\u0645'
          },
          types: {
            REQUEST_APPROVED: '\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628',
            REQUEST_REJECTED: '\u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628',
            RESUBMISSION_REQUESTED: '\u0637\u0644\u0628 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0642\u062f\u064a\u0645',
            INFO: '\u0645\u0639\u0644\u0648\u0645\u0629'
          },
          summary: {
            approvals: '\u0645\u0648\u0627\u0641\u0642\u0627\u062a',
            rejections: '\u0645\u0631\u0641\u0648\u0636\u0627\u062a',
            resubmissions: '\u0625\u0639\u0627\u062f\u0629 \u062a\u0642\u062f\u064a\u0645',
            unread: '\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629'
          }
        }
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false
  }
});

document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  // Persist so a reload (or landing directly on any page) keeps the choice —
  // same key the init above reads.
  localStorage.setItem('language', lng);
});

export default i18n;