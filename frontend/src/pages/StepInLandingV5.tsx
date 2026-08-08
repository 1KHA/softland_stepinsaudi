import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * StepIn Saudi landing page v5 — React port of last-land/StepIn Landing v5.dc.html.
 * Editorial dark-navy design with numbered sections and a 4-step application
 * wizard (validated per step, draft saved to localStorage). Copy is bilingual
 * and colocated, as in the source template; the rest of the app uses i18n.ts.
 */

const EN = {
  langLabel: 'العربية', navHow: 'How it works', navJourney: 'Your journey', navPlans: 'Membership', navFaq: 'FAQ', navCta: 'Start now', navSignIn: 'Sign in',
  heroEyebrow: 'Market entry programme — Riyadh & Makkah',
  eyeWhy: 'The problem', eyeHow: 'How it works', eyeJourney: 'Your journey', eyePlace: 'Where you land', eyeServices: 'What we deliver', eyeNetwork: 'Partner network', eyePlans: 'Membership', eyeFit: 'Fit', eyeFaq: 'Questions', eyeStart: 'Get started',
  heroTitle: 'Your first step into the Saudi market',
  heroSub: 'One written route from first enquiry to a licensed, operating company. One person owns your file the whole way.',
  heroCta1: 'Book a qualification call', heroCta2: 'See how it works',
  ownedBy: 'A product of Wadi Makkah Technology', withPartner: 'In partnership with',
  problemTitle: 'The market is open. The path into it is not clear.',
  problemSub: 'The market is not the hard part. Finding one map you can trust, and one party responsible for it, is.',
  stagesTitle: 'Six stages, and you know who owns each one',
  stagesSub: 'Every service carries an accountability badge, published before you commit. Partner stages are delivered under a service level agreement.',
  badgeUs: 'We deliver', badgePartner: 'Accredited partner',
  alwaysOn1Title: 'Virtual office', alwaysOn1: 'An address and workspace in Riyadh and Makkah, running across all six stages.',
  alwaysOn2Title: 'One point of contact', alwaysOn2: 'A named case owner who tracks your file, including the parts partners execute.',
  journeyTitle: 'From first message to an operating company',
  journeySub: 'Six stops. At each one you know what is asked of you, what we are doing, and what you walk away with.',
  youDo: 'YOU DO', weDo: 'WE DO', youGet: 'YOU GET',
  journeyNote: 'Timings depend on your document readiness and on the competent authorities. We commit to no government timelines.',
  servicesTitle: 'Eight services we deliver ourselves, each with a written output',
  networkTitle: 'Accredited partners, not a list of names',
  networkSub: 'Partners pass weighted accreditation criteria, sign a service level agreement, and commit to an escalation path. We follow up with them for you.',
  plansTitle: 'Three packages, chosen by your stage', plansCta: 'Enquire',
  plansNote: 'Durations are indicative and adjustable. We send a priced commercial proposal after your qualification call.',
  fitTitle: 'Who the programme fits',
  needTitle: 'What we need from you to start',
  needNote: 'Most sectors are open to foreign investment; a few need additional approvals. We check your activity before anything is filed.',
  faqTitle: 'Frequently asked',
  startTitle: 'Three steps and your map is ready', startSub: 'Tell us what you want to run in the Kingdom. We reply within one business day.',
  formTitle: 'Start your application',
  wizSub: 'Four short steps, about three minutes. You can save and come back to it.',
  tab1: 'Profile', tab2: 'Company', tab3: 'Readiness', tab4: 'Contact',
  q1: 'What best describes you?', q1Note: 'So your file goes to the right case owner from the start.',
  qMarket: 'Which market are you coming from?',
  lCompany: 'Company or startup name', lWebsite: 'Website', lLinkedIn: 'LinkedIn',
  lSize: 'Company size', lSizePh: 'Total employees including founders',
  lActivity: 'Primary business activity',
  lActivityNote: 'Some activities need additional approvals or a higher share capital. We check yours before anything is filed.',
  lStage: 'Company stage', lCapital: 'Capital raised to date',
  lSaudi: 'Do you already have clients or partners in Saudi Arabia?',
  lTimeline: 'When do you want to be operating?',
  lFile: 'Pitch deck or company profile',
  fDrop: 'Drop your file here, or', fSelect: 'Select file',
  fFileNote: 'PDF, PPT, PPTX, DOC or DOCX. Max 5 MB, one file.',
  lFirst: 'First name', lLast: 'Last name', lEmail: 'Work email', lPhone: 'Phone number', lRole: 'Your role in the company',
  choose: 'Choose', back: 'Previous', next: 'Next', submit: 'Submit application',
  save: 'Save and continue later', savedMsg: 'Saved on this device. Reopen this page to continue.',
  errRequired: 'Please complete the required fields on this step.',
  capHero: 'Startup Hub, Diriyah — Riyadh',
  placeTitle: 'A real address, not a mailbox',
  placeSub: 'Your membership includes an address and workspace inside the Wadi Makkah complex in Riyadh and Makkah — desks, private offices and meeting rooms, with the ecosystem around them.',
  cap1: 'Where founders and teams meet, daily', cap2: 'The Wadi Makkah complex atrium', cap3: 'Workshop and event space',
  fConsent: 'I agree that my data may be processed to respond to this request, in line with the Personal Data Protection Law.',
  sentTitle: 'Application received', sentBody: 'We reply within one business day with a named case owner and a slot for your qualification call.',
  footerBlurb: 'The single entry route for foreign founders, scaling companies and corporate innovation teams entering Saudi Arabia.',
  footerAddr: 'Startup Hub, Diriyah, Riyadh',
  disclaimer: 'We facilitate market entry. We do not issue licences, visas, residencies or approvals — these rest solely with the competent government authorities. Fees and timelines are set by those authorities and are subject to change.'
};

const AR: typeof EN = {
  langLabel: 'English', navHow: 'كيف نعمل', navJourney: 'رحلتك', navPlans: 'العضويات', navFaq: 'الأسئلة', navCta: 'ابدأ الآن', navSignIn: 'تسجيل الدخول',
  heroEyebrow: 'برنامج دخول السوق — الرياض ومكة المكرمة',
  eyeWhy: 'المشكلة', eyeHow: 'كيف نعمل', eyeJourney: 'رحلتك', eyePlace: 'مكان عملك', eyeServices: 'ما ننفّذه', eyeNetwork: 'شبكة الشركاء', eyePlans: 'العضويات', eyeFit: 'الملاءمة', eyeFaq: 'الأسئلة', eyeStart: 'البداية',
  heroTitle: 'خطوتك الأولى إلى السوق السعودي',
  heroSub: 'مسار واحد مكتوب من أول استفسار إلى شركة مرخّصة تعمل. وشخص واحد يتابع ملفك في الطريق كله.',
  heroCta1: 'احجز جلسة تأهيل', heroCta2: 'كيف نعمل',
  ownedBy: 'أحد منتجات شركة وادي مكة للتقنية', withPartner: 'بالشراكة مع',
  problemTitle: 'السوق مفتوح، لكن الطريق إليه غير واضح',
  problemSub: 'السوق ليس هو الجزء الصعب. الصعب أن تجد خريطة واحدة تثق بها، وجهة واحدة تتحمل مسؤوليتها معك.',
  stagesTitle: 'ست مراحل، وتعرف من المسؤول عن كل مرحلة',
  stagesSub: 'كل خدمة تحمل شارة مسؤولية معلنة قبل أن تلتزم. ومراحل الشركاء تُنفَّذ وفق اتفاقية مستوى خدمة.',
  badgeUs: 'ننجزه نحن', badgePartner: 'عبر شريك معتمد',
  alwaysOn1Title: 'مقر افتراضي', alwaysOn1: 'عنوان ومساحة عمل في الرياض ومكة المكرمة، على امتداد المراحل الست.',
  alwaysOn2Title: 'نقطة تواصل واحدة', alwaysOn2: 'مالك حالة مسمّى يتابع ملفك، بما في ذلك ما ينفّذه الشركاء.',
  journeyTitle: 'من أول رسالة إلى شركة تعمل',
  journeySub: 'ست محطات. في كل واحدة تعرف المطلوب منك، وما نعمل عليه، وما تستلمه.',
  youDo: 'ما تفعله أنت', weDo: 'ما نفعله نحن', youGet: 'ما تستلمه',
  journeyNote: 'المدد تعتمد على اكتمال وثائقك وعلى قرار الجهة المختصة. ولا نلتزم بمدد حكومية.',
  servicesTitle: 'ثماني خدمات ننفّذها بأنفسنا، ولكل واحدة مخرج مكتوب',
  networkTitle: 'شركاء معتمدون، لا قائمة أسماء',
  networkSub: 'الشريك يجتاز معايير اعتماد، ويوقّع اتفاقية مستوى خدمة، ويلتزم بمسار تصعيد. ونحن نتابع معه بدلًا عنك.',
  plansTitle: 'ثلاث باقات، تختار منها بحسب مرحلتك', plansCta: 'استفسر',
  plansNote: 'المدد مقترحة وقابلة للتعديل. نقدّم العرض التجاري بالأسعار بعد جلسة التأهيل.',
  fitTitle: 'من يناسبه البرنامج',
  needTitle: 'ما نحتاجه منك للبدء',
  needNote: 'معظم القطاعات مفتوحة للاستثمار الأجنبي، وبعضها يحتاج موافقات إضافية. نتحقق من نشاطك قبل أي إجراء.',
  faqTitle: 'الأسئلة الشائعة',
  startTitle: 'ثلاث خطوات وتصلك خريطتك', startSub: 'أخبرنا بالنشاط الذي تريد ممارسته في المملكة. نردّ خلال يوم عمل واحد.',
  formTitle: 'ابدأ طلبك',
  wizSub: 'أربع خطوات قصيرة، نحو ثلاث دقائق. ويمكنك الحفظ والعودة لاحقًا.',
  tab1: 'التعريف', tab2: 'الشركة', tab3: 'الجاهزية', tab4: 'التواصل',
  q1: 'أي وصف ينطبق عليك؟', q1Note: 'لنحيل ملفك إلى مالك الحالة المناسب من البداية.',
  qMarket: 'من أي سوق تأتي؟',
  lCompany: 'اسم الشركة أو المنشأة', lWebsite: 'الموقع الإلكتروني', lLinkedIn: 'حساب لينكدإن',
  lSize: 'حجم الشركة', lSizePh: 'إجمالي الموظفين بمن فيهم المؤسسون',
  lActivity: 'النشاط التجاري الأساسي',
  lActivityNote: 'بعض الأنشطة تحتاج موافقات إضافية أو رأس مال أعلى. نتحقق من نشاطك قبل أي إجراء.',
  lStage: 'مرحلة الشركة', lCapital: 'رأس المال المُجمَّع حتى اليوم',
  lSaudi: 'هل لديك عملاء أو شركاء في السعودية؟',
  lTimeline: 'متى تريد أن تكون الشركة جاهزة للعمل؟',
  lFile: 'العرض التقديمي أو الملف التعريفي',
  fDrop: 'أفلِت الملف هنا، أو', fSelect: 'اختر ملفًا',
  fFileNote: 'PDF أو PPT أو PPTX أو DOC أو DOCX، بحد أقصى ٥ ميغابايت وملف واحد.',
  lFirst: 'الاسم الأول', lLast: 'اسم العائلة', lEmail: 'البريد الإلكتروني للعمل', lPhone: 'رقم الجوال', lRole: 'دورك في الشركة',
  choose: 'اختر', back: 'السابق', next: 'التالي', submit: 'إرسال الطلب',
  save: 'حفظ ومتابعة لاحقًا', savedMsg: 'حُفظ على هذا الجهاز. افتح الصفحة مجددًا لإكمال الطلب.',
  errRequired: 'يرجى إكمال الحقول المطلوبة في هذه الخطوة.',
  capHero: 'مجمع الشركات الناشئة، الدرعية — الرياض',
  placeTitle: 'عنوان حقيقي، لا صندوق بريد',
  placeSub: 'عضويتك تشمل عنوانًا ومساحة عمل داخل مجمع وادي مكة في الرياض ومكة المكرمة — مكاتب مشتركة وخاصة وقاعات اجتماعات، والمنظومة من حولها.',
  cap1: 'حيث يلتقي المؤسسون والفرق كل يوم', cap2: 'بهو مجمع وادي مكة', cap3: 'مساحة ورش وفعاليات',
  fConsent: 'أوافق على معالجة بياناتي للرد على هذا الطلب، وفق نظام حماية البيانات الشخصية.',
  sentTitle: 'استلمنا طلبك', sentBody: 'نردّ خلال يوم عمل واحد باسم مالك الحالة وموعد جلسة التأهيل.',
  footerBlurb: 'الباب الواحد لدخول المؤسسين الأجانب والشركات وفرق الابتكار المؤسسي إلى السوق السعودي.',
  footerAddr: 'مجمع الشركات الناشئة، الدرعية، الرياض',
  disclaimer: 'نُيسّر دخول السوق ولا نُصدر تراخيص أو تأشيرات أو إقامات أو موافقات — فهذه سلطة حصرية للجهات الحكومية المختصة. والرسوم والمدد تحددها الجهات المعنية وقابلة للتغيير.'
};

type StageRow = { n: string; title: string; desc: string; detail: string; owner: string };
type JourneyCard = { n: string; c: string; title: string; you: string; we: string; get: string };
type PlanRow = { name: string; dur: string; desc: string; featured?: boolean };

const DATA = {
  en: {
    stats: [
      { n: '45%', label: 'of MENA venture capital deployed in Saudi Arabia in 2025', src: 'MAGNiTT annual report, 2025' },
      { n: '+118%', label: 'growth in entrepreneur licences issued to foreign companies, H1 2025', src: 'Ministry of Investment, July 2025' },
      { n: '230+', label: 'startups incubated by Wadi Makkah Technology', src: 'Company record, 2026' }
    ],
    quotes: ['Every office gives me a different answer on the right sequence.', "I paid a consultant and still don't know where my file stands.", 'My application was rejected — wrong activity code, unattested documents.', 'I started with the bank account and lost three months.'],
    stages: [
      { n: '01', title: 'Qualify & Orient', desc: 'A documented eligibility read and a written entry map.', detail: 'Activity assessment, licence route selection, document checklist.', owner: 'We deliver' },
      { n: '02', title: 'Licence & Entity', desc: 'Licence file coordination and the endorsement letter.', detail: 'Articles of association, commercial registration and attestation via a legal partner.', owner: 'We deliver' },
      { n: '03', title: 'Zakat, Tax & Registrations', desc: 'Registrations that make the entity operational.', detail: 'Zakat and VAT, e-invoicing, national address, chamber membership.', owner: 'Accredited partner' },
      { n: '04', title: 'Hiring & Residency', desc: 'A compliant team, in the right order.', detail: 'Labour platform files, visas and residency, Saudization planning.', owner: 'Accredited partner' },
      { n: '05', title: 'Banking & Landing', desc: 'The bank account, sequenced last, not first.', detail: 'KYC pack, attestation support and bank introductions.', owner: 'Accredited partner' },
      { n: '06', title: 'Business Dev & Access', desc: 'Where the company starts trading.', detail: 'Access to market, investors, partners and vendors.', owner: 'Accredited partner' }
    ] as StageRow[],
    journey: [
      { n: '1', c: '#2B3E8F', title: 'First contact', you: 'Fill a short form about your activity and market.', we: 'Reply within one business day and book you in.', get: 'A confirmed slot and a named case owner' },
      { n: '2', c: '#0D5DA6', title: 'Qualification call', you: 'One call, and share parent-company documents.', we: 'Documented eligibility read and licence route.', get: 'A written eligibility report' },
      { n: '3', c: '#1DBAEA', title: 'Entry map', you: 'Approve the route and choose a membership.', we: 'Written map with an owner and output per step.', get: 'An entry map and document checklist' },
      { n: '4', c: '#008A84', title: 'Licence & entity', you: 'Attest documents and sign with the legal partner.', we: 'Completeness review, endorsement letter, partner referral.', get: 'A licensed entity and a virtual office' },
      { n: '5', c: '#98C23E', title: 'Operate & comply', you: 'Approve tax filings and your first hire.', we: 'Coordinate partners and track files to closure.', get: 'Active registrations and a compliant team' },
      { n: '6', c: '#E9A623', title: 'Grow & access', you: 'Show up to meetings and events.', we: 'Introduce you to investors, partners and vendors.', get: 'Documented introductions and meetings' }
    ] as JourneyCard[],
    services: [
      { t: 'Eligibility read', d: 'A written report on your viable route.' },
      { t: 'Entry map', d: 'Ordered steps with owners and outputs.' },
      { t: 'Licence route selection', d: 'A recommendation by activity and sector.' },
      { t: 'Licence file coordination', d: 'Completeness review and status tracking.' },
      { t: 'Endorsement letter', d: 'For those eligible for the entrepreneur licence.' },
      { t: 'Virtual office', d: 'Address and workspace in Riyadh and Makkah.' },
      { t: 'Single point of contact', d: 'One case owner across the journey.' },
      { t: 'Ecosystem access', d: 'Community, events and introductions.' }
    ],
    sla: [
      { k: 'Referral accepted or declined', v: '1 business day' },
      { k: 'Partner contacts you', v: '1 business day' },
      { k: 'Written quotation', v: '3 business days' },
      { k: 'Status update on your file', v: 'Weekly' }
    ],
    categories: [
      { t: 'Legal & incorporation', d: 'Articles, registration, attestation.' },
      { t: 'Accounting & tax', d: 'Zakat, VAT, e-invoicing, bookkeeping.' },
      { t: 'Human resources', d: 'Labour files, visas, Saudization.' },
      { t: 'Banking facilitation', d: 'KYC pack and bank introductions.' },
      { t: 'Business development', d: 'Market, investors, partners, vendors.' }
    ],
    plans: [
      { name: 'Explore', dur: 'around 3 months', desc: 'You are assessing the market before committing: eligibility read, entry map and ecosystem access.' },
      { name: 'Establish', dur: 'around 6 months', desc: 'You have decided to register: stages one and two in full, virtual office, and coordination across partners.', featured: true },
      { name: 'Expand', dur: 'around 12 months', desc: 'A scaling company or corporate innovation team: the full journey with extended coordination and wider access.' }
    ] as PlanRow[],
    fitFor: ['A foreign startup opening an entity in Saudi Arabia', 'An established company abroad looking at the Saudi market', 'A corporate innovation team that needs a local arm', 'A founder who wants an entrepreneur licence and a legal presence in Riyadh'],
    needs: ['Parent-company documents, or your ID if you are a solo founder', 'A clear description of the activity you want to run', 'Readiness to attest and translate foreign documents', 'One person on your side who follows up with us'],
    faqs: [
      { q: 'Do you issue the licence yourselves?', a: 'No. Licences, visas, residencies and approvals rest solely with the competent government authorities. We prepare and coordinate the file, and tell you plainly which step is theirs.' },
      { q: 'How long does the whole route take?', a: 'It depends on your document readiness and on the authorities. We publish indicative turnaround for our own work and for partner work, and we exclude government decision time from every commitment.' },
      { q: 'Can I own 100% of the company?', a: 'Full foreign ownership is permitted across most sectors under the Investment Law in force since February 2025. A few sectors need additional approvals, which we check in the qualification call.' },
      { q: 'Do I contract with you or with the partners?', a: 'You contract with each partner directly, so professional liability and pricing stay with them. We accredit them, refer you, and follow up on delivery under a service level agreement.' },
      { q: 'What does it cost?', a: 'We send a priced commercial proposal after the qualification call, once the route and scope are clear. Partner fees are published and quoted separately.' },
      { q: 'Do I need to be in Saudi Arabia to start?', a: 'Not to start. Most of the qualification and licence work is remote, but the company cannot be run with no formal presence in the Kingdom, which is part of what the entry map plans for.' }
    ],
    steps: [
      { n: '1', t: 'A short form', d: 'Two minutes, on this page.' },
      { n: '2', t: 'Qualification call', d: 'We reply within one business day and book you in.' },
      { n: '3', t: 'Your map in hand', d: 'A written route and a priced commercial proposal.' }
    ],
    profiles: [
      'Foreign startup opening an entity in Saudi Arabia',
      'Established company expanding into the Saudi market',
      'Saudi-registered company that needs compliance support',
      'Corporate innovation team building a local arm',
      'Government or public entity building a sector',
      'Other'
    ],
    stageList: ['Idea / pre-product', 'Pre-seed', 'Seed', 'Series A', 'Series B or later', 'Established company, not venture backed'],
    capitalList: ['None yet', 'Under $500K', '$500K – $2M', '$2M – $10M', 'Over $10M'],
    saudiList: ['Yes, we have clients or partners', 'In discussion', 'Not yet'],
    timelineList: ['Within 3 months', '3 – 6 months', '6 – 12 months', 'Still exploring'],
    tabNums: ['1', '2', '3', '4']
  },
  ar: {
    stats: [
      { n: '45%', label: 'حصة السعودية من رأس المال الجريء في المنطقة خلال 2025', src: 'تقرير ماغنِت السنوي، 2025' },
      { n: '+118%', label: 'نموّ رخص ريادة الأعمال للشركات الأجنبية في النصف الأول من 2025', src: 'وزارة الاستثمار، يوليو 2025' },
      { n: '+230', label: 'شركة ناشئة احتضنتها شركة وادي مكة للتقنية', src: 'سجل الشركة، 2026' }
    ],
    quotes: ['كل جهة تعطيني إجابة مختلفة عن الترتيب الصحيح.', 'دفعتُ لاستشاري ولا أعرف أين وصل ملفي.', 'رُفض طلبي بسبب تصنيف نشاط خاطئ ووثائق غير مصدّقة.', 'بدأت بالحساب البنكي فخسرت ثلاثة أشهر.'],
    stages: [
      { n: '٠١', title: 'التأهيل والتوجيه', desc: 'تقييم أهلية موثّق وخريطة دخول مكتوبة.', detail: 'تقييم النشاط، واختيار مسار الترخيص، وقائمة الوثائق.', owner: 'ننجزه نحن' },
      { n: '٠٢', title: 'الترخيص والكيان', desc: 'تنسيق ملف الترخيص وخطاب التزكية.', detail: 'عقد التأسيس والسجل التجاري والتصديق عبر شريك قانوني.', owner: 'ننجزه نحن' },
      { n: '٠٣', title: 'الزكاة والضريبة والتسجيلات', desc: 'التسجيلات التي تجعل الكيان جاهزًا للعمل.', detail: 'الزكاة والضريبة، والفوترة الإلكترونية، والعنوان الوطني، والغرفة.', owner: 'عبر شريك معتمد' },
      { n: '٠٤', title: 'التوظيف والإقامة', desc: 'فريق نظامي، بالترتيب الصحيح.', detail: 'ملفات التوظيف الحكومية، والتأشيرات والإقامة، والتوطين.', owner: 'عبر شريك معتمد' },
      { n: '٠٥', title: 'الحساب البنكي والاستقرار', desc: 'الحساب البنكي في آخر الترتيب، لا أوله.', detail: 'تجهيز ملف التعريف البنكي والتصديق والتعريف بالبنوك.', owner: 'عبر شريك معتمد' },
      { n: '٠٦', title: 'تطوير الأعمال والوصول', desc: 'حيث يبدأ عمل الشركة فعليًا.', detail: 'الوصول إلى السوق والمستثمرين والشركاء والمورّدين.', owner: 'عبر شريك معتمد' }
    ] as StageRow[],
    journey: [
      { n: '١', c: '#2B3E8F', title: 'التواصل الأول', you: 'تعبئة نموذج قصير عن نشاطك وسوقك.', we: 'نردّ خلال يوم عمل ونحدّد الموعد.', get: 'موعد مؤكد ومالك حالة مسمّى' },
      { n: '٢', c: '#0D5DA6', title: 'جلسة التأهيل', you: 'جلسة واحدة ومشاركة وثائق الشركة الأم.', we: 'تقييم أهلية موثّق وتحديد مسار الترخيص.', get: 'تقرير أهلية مكتوب' },
      { n: '٣', c: '#1DBAEA', title: 'خريطة الدخول', you: 'اعتماد المسار واختيار العضوية.', we: 'خريطة مكتوبة بمسؤول ومخرج لكل خطوة.', get: 'خريطة دخول وقائمة وثائق' },
      { n: '٤', c: '#008A84', title: 'الترخيص والكيان', you: 'تصديق الوثائق والتوقيع مع الشريك القانوني.', we: 'مراجعة اكتمال الملف وخطاب التزكية وإحالة الشريك.', get: 'كيان مرخّص ومقر افتراضي' },
      { n: '٥', c: '#98C23E', title: 'التشغيل والامتثال', you: 'اعتماد الملفات الضريبية وأول تعيين.', we: 'تنسيق الشركاء ومتابعة الملفات حتى الإغلاق.', get: 'تسجيلات نافذة وفريق نظامي' },
      { n: '٦', c: '#E9A623', title: 'النمو والوصول', you: 'حضور اللقاءات والفعاليات.', we: 'تعريفك بالمستثمرين والشركاء والمورّدين.', get: 'تعريفات ولقاءات موثّقة' }
    ] as JourneyCard[],
    services: [
      { t: 'تقييم الأهلية', d: 'تقرير مكتوب بمسارك الممكن.' },
      { t: 'خريطة الدخول', d: 'خطوات مرتّبة بمسؤول ومخرج.' },
      { t: 'تحديد مسار الترخيص', d: 'توصية بحسب النشاط والقطاع.' },
      { t: 'تنسيق ملف الترخيص', d: 'مراجعة اكتمال ومتابعة حالة.' },
      { t: 'خطاب التزكية', d: 'للمؤهلين لرخصة ريادة الأعمال.' },
      { t: 'المقر الافتراضي', d: 'عنوان ومساحة عمل في الرياض ومكة.' },
      { t: 'نقطة تواصل واحدة', d: 'مالك حالة واحد عبر الرحلة كلها.' },
      { t: 'الوصول إلى المنظومة', d: 'مجتمع وفعاليات وتعريفات.' }
    ],
    sla: [
      { k: 'قبول الإحالة أو الاعتذار عنها', v: 'يوم عمل' },
      { k: 'تواصل الشريك معك', v: 'يوم عمل' },
      { k: 'عرض سعر مكتوب', v: '٣ أيام عمل' },
      { k: 'تحديث حالة ملفك', v: 'أسبوعيًا' }
    ],
    categories: [
      { t: 'قانوني وتأسيس', d: 'العقود والسجل والتصديق.' },
      { t: 'محاسبي وضريبي', d: 'الزكاة والضريبة والفوترة والدفاتر.' },
      { t: 'موارد بشرية', d: 'ملفات التوظيف والتأشيرات والتوطين.' },
      { t: 'تيسير مصرفي', d: 'ملف التعريف البنكي والتعريف بالبنوك.' },
      { t: 'تطوير أعمال', d: 'السوق والمستثمرون والشركاء والمورّدون.' }
    ],
    plans: [
      { name: 'استكشاف', dur: 'نحو ٣ أشهر', desc: 'تدرس السوق قبل الالتزام: تقييم الأهلية، وخريطة الدخول، والوصول إلى المنظومة.' },
      { name: 'تأسيس', dur: 'نحو ٦ أشهر', desc: 'قرّرت التسجيل: المرحلتان الأولى والثانية كاملتين، والمقر الافتراضي، والتنسيق عبر الشركاء.', featured: true },
      { name: 'توسّع', dur: 'نحو ١٢ شهرًا', desc: 'شركة متوسعة أو فريق ابتكار مؤسسي: الرحلة كاملة مع تنسيق ممتد ووصول موسّع.' }
    ] as PlanRow[],
    fitFor: ['شركة ناشئة أجنبية تريد فتح كيان في السعودية', 'شركة قائمة خارج المملكة تدرس التوسّع إلى السوق السعودي', 'فريق ابتكار في شركة كبيرة يريد ذراعًا محلية', 'مؤسس يريد رخصة ريادة أعمال وحضورًا نظاميًا في الرياض'],
    needs: ['وثائق الشركة الأم أو الهوية إن كنت مؤسسًا فردًا', 'وصف واضح للنشاط الذي تريد ممارسته', 'استعداد لتصديق الوثائق الأجنبية وترجمتها', 'شخص مسؤول من طرفك يتابع معنا'],
    faqs: [
      { q: 'هل تصدرون الرخصة بأنفسكم؟', a: 'لا. التراخيص والتأشيرات والإقامات والموافقات سلطة حصرية للجهات الحكومية المختصة. نحن نجهّز الملف وننسّقه، ونوضّح لك أي خطوة تخصّها.' },
      { q: 'كم تستغرق الرحلة كاملة؟', a: 'تعتمد على اكتمال وثائقك وعلى الجهات المختصة. نعلن مدد إنجاز استرشادية لعملنا ولعمل الشركاء، ونستثني وقت القرار الحكومي من كل التزام.' },
      { q: 'هل أستطيع تملّك الشركة بالكامل؟', a: 'التملّك الأجنبي الكامل متاح في معظم القطاعات بموجب نظام الاستثمار النافذ منذ فبراير 2025. وبعض القطاعات يحتاج موافقات إضافية نتحقق منها في جلسة التأهيل.' },
      { q: 'هل أتعاقد معكم أم مع الشركاء؟', a: 'تتعاقد مع كل شريك مباشرة، فتبقى المسؤولية المهنية والتسعير عنده. ونحن نعتمده ونحيلك إليه ونتابع التنفيذ وفق اتفاقية مستوى خدمة.' },
      { q: 'ما التكلفة؟', a: 'نرسل عرضًا تجاريًا بالأسعار بعد جلسة التأهيل، حين يتضح المسار والنطاق. ورسوم الشركاء معلنة وتُسعّر بشكل منفصل.' },
      { q: 'هل يجب أن أكون في السعودية للبدء؟', a: 'ليس للبدء. معظم أعمال التأهيل والترخيص تتم عن بُعد، لكن الشركة لا تُدار بلا حضور نظامي داخل المملكة، وهذا ما ترتّبه خريطة الدخول.' }
    ],
    steps: [
      { n: '١', t: 'نموذج قصير', d: 'دقيقتان، في هذه الصفحة.' },
      { n: '٢', t: 'جلسة تأهيل', d: 'نردّ خلال يوم عمل ونحدّد موعدك.' },
      { n: '٣', t: 'خريطتك بين يديك', d: 'مسار مكتوب وعرض تجاري بالأسعار.' }
    ],
    profiles: [
      'شركة ناشئة أجنبية تفتح كيانًا في السعودية',
      'شركة قائمة تتوسّع إلى السوق السعودي',
      'شركة مسجّلة في السعودية تحتاج دعم امتثال',
      'فريق ابتكار مؤسسي يبني ذراعًا محلية',
      'جهة حكومية أو عامة تبني قطاعًا',
      'أخرى'
    ],
    stageList: ['فكرة / ما قبل المنتج', 'ما قبل التأسيسية', 'التأسيسية', 'السلسلة أ', 'السلسلة ب فما فوق', 'شركة قائمة غير ممولة استثماريًا'],
    capitalList: ['لا شيء حتى الآن', 'أقل من ٥٠٠ ألف دولار', '٥٠٠ ألف – ٢ مليون دولار', '٢ – ١٠ مليون دولار', 'أكثر من ١٠ مليون دولار'],
    saudiList: ['نعم، لدينا عملاء أو شركاء', 'قيد النقاش', 'ليس بعد'],
    timelineList: ['خلال ٣ أشهر', '٣ – ٦ أشهر', '٦ – ١٢ شهرًا', 'ما زلت أستكشف'],
    tabNums: ['١', '٢', '٣', '٤']
  }
};

const STAGE_ICONS = [
  { p1: 'M28 8 a20 20 0 1 0 0 40 a20 20 0 1 0 0-40', p2: 'M28 16 v6 M28 34 v6 M16 28 h6 M34 28 h6', p3: 'M28 28 L35 21' },
  { p1: 'M14 8 h20 l8 8 v32 h-28 z', p2: 'M34 8 v8 h8 M20 26 h16 M20 34 h16', p3: 'M20 42 h9' },
  { p1: 'M15 10 h26 a3 3 0 0 1 3 3 v30 a3 3 0 0 1 -3 3 h-26 a3 3 0 0 1 -3 -3 v-30 a3 3 0 0 1 3 -3 z', p2: 'M18 18 h20 M18 27 h6 M25 27 h6 M32 27 h6 M18 34 h6 M25 34 h6', p3: 'M32 41 h6' },
  { p1: 'M21 13 a7 7 0 1 0 0 14 a7 7 0 1 0 0-14', p2: 'M8 46 c0-8 6-13 13-13 s13 5 13 13', p3: 'M39 17 a5 5 0 1 0 0 10 a5 5 0 1 0 0-10 M33 44 c0-6 3-10 8-10 s7 4 7 10' },
  { p1: 'M8 22 L28 10 L48 22', p2: 'M12 22 v20 M22 22 v20 M34 22 v20 M44 22 v20', p3: 'M8 46 h40' },
  { p1: 'M10 42 l12-12 8 6 14-16', p2: 'M8 48 h40', p3: 'M36 20 h8 v8' }
];
const CAT_ICONS = [
  { p1: 'M14 8 h22 l6 6 v34 h-28 z', p2: 'M20 24 h16 M20 32 h16', p3: 'M20 40 c3-4 5 2 8-2 s5 2 8-2' },
  { p1: 'M16 8 h24 a3 3 0 0 1 3 3 v34 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 v-34 a3 3 0 0 1 3 -3 z', p2: 'M22 18 h12 M22 26 h12 M22 34 h12', p3: 'M22 42 h7' },
  { p1: 'M21 13 a7 7 0 1 0 0 14 a7 7 0 1 0 0-14', p2: 'M8 46 c0-8 6-13 13-13 s13 5 13 13', p3: 'M39 17 a5 5 0 1 0 0 10 a5 5 0 1 0 0-10 M33 44 c0-6 3-10 8-10 s7 4 7 10' },
  { p1: 'M8 22 L28 10 L48 22', p2: 'M12 22 v20 M22 22 v20 M34 22 v20 M44 22 v20', p3: 'M8 46 h40' },
  { p1: 'M10 42 l12-12 8 6 14-16', p2: 'M8 48 h40', p3: 'M36 20 h8 v8' }
];
const DIALS = ['+966', '+971', '+973', '+974', '+965', '+968', '+20', '+44', '+1', '+33', '+49', '+91', '+90', '+86', '+27', '+234'];

type FormState = {
  profile: string; homeMarket: string; company: string; website: string; linkedin: string;
  size: string; activity: string; stage: string; capital: string; saudi: string; timeline: string;
  file: string; first: string; last: string; email: string; dial: string; phone: string; role: string; consent: boolean;
};
const BLANK: FormState = { profile: '', homeMarket: '', company: '', website: '', linkedin: '', size: '', activity: '', stage: '', capital: '', saudi: '', timeline: '', file: '', first: '', last: '', email: '', dial: '+966', phone: '', role: '', consent: false };
const VALID: Array<(f: FormState) => boolean> = [
  (f) => !!f.profile,
  (f) => !!f.company.trim() && !!f.activity.trim(),
  (f) => !!f.stage,
  (f) => !!f.first.trim() && !!f.last.trim() && /.+@.+\..+/.test(f.email) && !!f.phone.trim() && f.consent
];
const DRAFT_KEY = 'stepin-v3-application';

const Icon = ({ paths, size = 40, stroke = '#2B3E8F', style }: { paths: { p1: string; p2: string; p3: string }; size?: number; stroke?: string; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d={paths.p1} /><path d={paths.p2} /><path d={paths.p3} stroke="#1DBAEA" strokeWidth={4} />
  </svg>
);

const Eyebrow = ({ n, label, light = false }: { n: string; label: string; light?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
    <span dir="ltr" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 2.5, color: '#1DBAEA' }}>{n}</span>
    <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 2.5, color: light ? 'rgba(255,255,255,0.72)' : '#9AA1AC' }}>{label}</span>
    <span style={{ flex: 1, height: 1, background: light ? 'rgba(255,255,255,0.28)' : '#E4EAF3' }} />
  </div>
);

const Wordmark = ({ size = 25, subColor = 'rgba(255,255,255,0.55)' }: { size?: number; subColor?: string }) => (
  <div style={{ direction: 'ltr', display: 'flex', alignItems: 'baseline', gap: 1 }}>
    <span style={{ fontSize: size, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.5px' }}>Step</span>
    <span style={{ fontSize: size, fontWeight: 700, color: '#1DBAEA', lineHeight: 1, letterSpacing: '-0.5px' }}>in</span>
    <span style={{ fontSize: 10, fontWeight: 700, color: subColor, letterSpacing: 4, marginLeft: 10 }}>SAUDI</span>
  </div>
);

const fieldStyle: React.CSSProperties = { width: '100%', fontFamily: 'inherit', fontSize: 15, padding: '13px 14px', border: '1px solid #DDE5F0', borderRadius: 2, color: '#1B1D21', background: '#FBFCFE' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6B7280', letterSpacing: 0.6, marginBottom: 8 };
const Req = () => <span style={{ color: '#D14343' }}> *</span>;

export function StepInLandingV5() {
  const { i18n } = useTranslation();
  const ar = (i18n.language || 'en').startsWith('ar');
  const t = ar ? AR : EN;
  const d = ar ? DATA.ar : DATA.en;

  const [open, setOpen] = useState(-1);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);
  const [f, setF] = useState<FormState>({ ...BLANK });

  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (draft && draft.f) {
        setF({ ...BLANK, ...draft.f });
        if (typeof draft.step === 'number') setStep(draft.step);
      }
    } catch (e) { /* corrupt draft — start clean */ }
  }, []);

  const edit = (patch: Partial<FormState>) => { setF((prev) => ({ ...prev, ...patch })); setErr(false); setSavedFlag(false); };
  const go = (n: number) => { setStep(n); setErr(false); setSavedFlag(false); };
  const advance = () => { if (!VALID[step](f)) { setErr(true); return; } go(Math.min(step + 1, 3)); };
  const persist = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ f, step })); } catch (e) { /* private mode */ }
    setSavedFlag(true); setErr(false);
  };
  const send = () => {
    if (!VALID[3](f)) { setErr(true); return; }
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
    setSent(true);
  };
  const toggleLang = () => i18n.changeLanguage(ar ? 'en' : 'ar');

  const badge = (owner: string) => owner === t.badgeUs ? { dot: '#2B3E8F', fg: '#2B3E8F' } : { dot: '#1DBAEA', fg: '#0D5DA6' };
  const planStyle = (p: PlanRow) => p.featured
    ? { bg: '#0B1226', rule: '#1DBAEA', accent: '#FFFFFF', muted: '#1DBAEA', body: '#C6D3EA', btnBg: '#1DBAEA', btnFg: '#0B1226' }
    : { bg: '#FFFFFF', rule: '#0B1226', accent: '#2B3E8F', muted: '#9AA1AC', body: '#4A4F58', btnBg: '#0B1226', btnFg: '#FFFFFF' };

  const container: React.CSSProperties = { maxWidth: 1280, margin: '0 auto', padding: 'clamp(52px, 8vw, 100px) clamp(20px, 5vw, 40px)' };
  const h2Style: React.CSSProperties = { margin: 0, fontSize: 'clamp(27px, 4.4vw, 42px)', fontWeight: 700, color: '#0B1226', lineHeight: 1.2, letterSpacing: '-1px' };
  const selOpts = (list: string[]) => [{ v: '', l: t.choose }].concat(list.map((x) => ({ v: x, l: x })));

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="siv5" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", color: '#1B1D21', background: '#FFFFFF', overflowX: 'hidden' }}>
      <style>{`
        .siv5 a { color: #0D5DA6; text-decoration: none; }
        .siv5 a:hover { color: #1DBAEA; }
        .siv5 .nav-link { font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.82); }
        .siv5 .nav-link:hover { color: #1DBAEA; }
        .siv5 .btn-cyan { background: #1DBAEA; color: #0B1226; border-radius: 2px; font-weight: 700; }
        .siv5 .btn-cyan:hover { background: #FFFFFF; color: #0B1226; }
        .siv5 .btn-white { background: #FFFFFF; color: #0B1226; border-radius: 2px; font-weight: 700; white-space: nowrap; }
        .siv5 .btn-white:hover { background: #1DBAEA; color: #0B1226; }
        .siv5 .btn-ghost { border: 1px solid rgba(255,255,255,0.45); color: #FFFFFF; border-radius: 2px; font-weight: 600; white-space: nowrap; }
        .siv5 .btn-ghost:hover { border-color: #FFFFFF; background: rgba(255,255,255,0.08); }
        .siv5 .btn-dark { font-family: inherit; cursor: pointer; background: #0B1226; color: #FFFFFF; border: none; border-radius: 2px; padding: 15px 36px; font-size: 15px; font-weight: 700; }
        .siv5 .btn-dark:hover { background: #2B3E8F; }
        .siv5 .stage-row:hover { background: #F7F9FC; }
        .siv5 .radio-card { background: #F7F9FC; }
        .siv5 .radio-card:hover { background: #EDF3FA; }
        .siv5 .drop-zone:hover { border-color: #1DBAEA !important; background: #F5FBFE !important; }
        .siv5 input:focus, .siv5 select:focus { border-color: #1DBAEA; outline: none; background: #FFFFFF; }
        .siv5 .faq-btn:hover span:first-child { color: #0D5DA6; }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,18,38,0.94)', backdropFilter: 'saturate(140%) blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px clamp(20px, 5vw, 40px)', minHeight: 68, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px 22px' }}>
          <Wordmark size={25} />
          <nav style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 20px' }}>
            <a className="nav-link" href="#stages">{t.navHow}</a>
            <a className="nav-link" href="#journey">{t.navJourney}</a>
            <a className="nav-link" href="#membership">{t.navPlans}</a>
            <a className="nav-link" href="#faq">{t.navFaq}</a>
            <Link className="nav-link" to="/login">{t.navSignIn}</Link>
            <button onClick={toggleLang} style={{ fontFamily: 'inherit', cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.28)', borderRadius: 2, padding: '7px 14px', fontSize: 13.5, fontWeight: 600, color: '#FFFFFF' }}>
              {t.langLabel}
            </button>
            <a className="btn-cyan" href="#start" style={{ padding: '11px 22px', fontSize: 14 }}>{t.navCta}</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 'clamp(560px, 86vh, 900px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/landing/complex-desks.jpg" alt="The Wadi Makkah startup complex" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(11,18,38,0.92) 0%, rgba(11,18,38,0.74) 46%, rgba(11,18,38,0.34) 100%)' }} />
        <div style={{ position: 'relative', width: '100%', maxWidth: 1280, margin: '0 auto', padding: 'clamp(60px, 10vw, 110px) clamp(20px, 5vw, 40px) clamp(96px, 12vw, 150px)' }}>
          <div style={{ maxWidth: 840 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'clamp(20px, 3vw, 30px)' }}>
              <span style={{ width: 'clamp(24px, 5vw, 44px)', height: 1, background: '#1DBAEA', flexShrink: 0 }} />
              <span style={{ fontSize: 'clamp(10.5px, 2.2vw, 12.5px)', fontWeight: 700, letterSpacing: 2.5, color: '#1DBAEA', lineHeight: 1.5 }}>{t.heroEyebrow}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(36px, 7.4vw, 72px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.06, letterSpacing: '-1.6px' }}>{t.heroTitle}</h1>
            <p style={{ margin: 'clamp(20px, 3vw, 28px) 0 0', fontSize: 'clamp(17px, 2.4vw, 20px)', fontWeight: 300, color: '#DCE5F5', lineHeight: 1.72, maxWidth: 580 }}>{t.heroSub}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'clamp(28px, 4vw, 40px)' }}>
              <a className="btn-white" href="#start" style={{ padding: '16px 32px', fontSize: 16 }}>{t.heroCta1}</a>
              <a className="btn-ghost" href="#stages" style={{ padding: '16px 32px', fontSize: 16 }}>{t.heroCta2}</a>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', insetInline: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(11,18,38,0) 0%, rgba(8,14,29,0.92) 100%)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '18px clamp(20px, 5vw, 40px) 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><img src="/landing/wm-mark.png" alt="" style={{ height: 26, width: 'auto' }} /><span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>{t.ownedBy}</span></div>
            <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>{t.withPartner}</span><img src="/landing/startup-hub.png" alt="Startup Hub — Monsha'at" style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.85 }} /></div>
            <div style={{ flex: 1, minWidth: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1DBAEA', letterSpacing: 0.4 }}>{t.capHero}</span>
          </div>
        </div>
      </section>

      {/* 01 — PROBLEM + STATS */}
      <section style={{ background: '#FFFFFF', display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 480px', minWidth: 0, padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ maxWidth: 600 }}>
            <Eyebrow n="01" label={t.eyeWhy} />
            <h2 style={{ ...h2Style, fontSize: 'clamp(27px, 4.4vw, 40px)' }}>{t.problemTitle}</h2>
            <p style={{ margin: '18px 0 0', fontSize: 'clamp(16px, 2.1vw, 18.5px)', color: '#4A4F58', lineHeight: 1.8 }}>{t.problemSub}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(22px, 4vw, 40px)', marginTop: 'clamp(28px, 4vw, 44px)' }}>
              {d.stats.map((s) => (
                <div key={s.label} style={{ flex: '1 1 150px', minWidth: 0, borderTop: '2px solid #0B1226', paddingTop: 16 }}>
                  <div dir="ltr" style={{ fontSize: 'clamp(34px, 5vw, 46px)', fontWeight: 700, color: '#2B3E8F', lineHeight: 1, letterSpacing: '-1.6px', textAlign: 'start' }}>{s.n}</div>
                  <div style={{ marginTop: 11, fontSize: 14.5, fontWeight: 500, color: '#4A4F58', lineHeight: 1.55 }}>{s.label}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9AA1AC' }}>{s.src}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: '1 1 380px', minWidth: 0, display: 'grid', gridTemplateRows: '1fr 1fr', gap: 4 }}>
          <img src="/landing/complex-office.jpg" alt="" style={{ display: 'block', width: '100%', height: '100%', minHeight: 'clamp(180px, 26vw, 260px)', objectFit: 'cover' }} />
          <img src="/landing/complex-lounge.jpg" alt="" style={{ display: 'block', width: '100%', height: '100%', minHeight: 'clamp(180px, 26vw, 260px)', objectFit: 'cover' }} />
        </div>
      </section>

      {/* QUOTES */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="/landing/complex-wall.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,18,38,0.82)' }} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: 'clamp(48px, 7vw, 84px) clamp(20px, 5vw, 40px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'clamp(22px, 3.5vw, 44px)' }}>
            {d.quotes.map((q) => (
              <div key={q} style={{ borderTop: '1px solid rgba(255,255,255,0.28)', paddingTop: 20, minWidth: 0 }}>
                <div dir="ltr" style={{ fontSize: 28, fontWeight: 700, color: '#1DBAEA', lineHeight: 0.7, textAlign: 'start' }}>&ldquo;</div>
                <p style={{ margin: '14px 0 0', fontSize: 'clamp(15.5px, 2vw, 17.5px)', fontWeight: 500, color: '#FFFFFF', lineHeight: 1.65 }}>{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 — STAGES */}
      <section id="stages" style={{ background: '#FFFFFF' }}>
        <div style={container}>
          <Eyebrow n="02" label={t.eyeHow} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(24px, 4vw, 60px)', alignItems: 'start', marginBottom: 'clamp(30px, 4vw, 50px)' }}>
            <h2 style={h2Style}>{t.stagesTitle}</h2>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 'clamp(16px, 2.1vw, 18px)', color: '#4A4F58', lineHeight: 1.8 }}>{t.stagesSub}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginTop: 18 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 600, color: '#2B3E8F' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2B3E8F', flexShrink: 0 }} />{t.badgeUs}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 600, color: '#0D5DA6' }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1DBAEA', flexShrink: 0 }} />{t.badgePartner}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '2px solid #0B1226' }}>
            {d.stages.map((st, i) => {
              const b = badge(st.owner);
              return (
                <div key={st.n} className="stage-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px clamp(18px, 3vw, 32px)', alignItems: 'baseline', padding: 'clamp(20px, 3vw, 28px) 2px', borderBottom: '1px solid #E1E8F2' }}>
                  <Icon paths={STAGE_ICONS[i] || STAGE_ICONS[0]} style={{ flex: '0 0 40px', alignSelf: 'flex-start' }} />
                  <div dir="ltr" style={{ flex: '0 0 34px', fontSize: 14, fontWeight: 700, color: '#1DBAEA', letterSpacing: 1, textAlign: 'start' }}>{st.n}</div>
                  <div style={{ flex: '1 1 250px', minWidth: 0 }}>
                    <div style={{ fontSize: 'clamp(18px, 2.4vw, 21px)', fontWeight: 700, color: '#0B1226', lineHeight: 1.35, letterSpacing: '-0.3px' }}>{st.title}</div>
                    <p style={{ margin: '7px 0 0', fontSize: 15.5, color: '#4A4F58', lineHeight: 1.7 }}>{st.desc}</p>
                  </div>
                  <div style={{ flex: '1 1 220px', minWidth: 0, fontSize: 15, color: '#6B7280', lineHeight: 1.7 }}>{st.detail}</div>
                  <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: b.dot, flexShrink: 0 }} /><span style={{ fontSize: 13.5, fontWeight: 600, color: b.fg }}>{st.owner}</span></div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, marginTop: 'clamp(24px, 3.5vw, 40px)' }}>
            <div style={{ background: '#0B1226', padding: 'clamp(24px, 3.4vw, 32px)' }}>
              <svg width={36} height={36} viewBox="0 0 56 56" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginBottom: 14 }}><path d="M10 46 V18 l18-10 18 10 v28" /><path d="M20 46 V30 h16 v16" /><path d="M24 22 h8" stroke="#1DBAEA" strokeWidth={4} /></svg>
              <div style={{ fontSize: 17.5, fontWeight: 700, color: '#FFFFFF' }}>{t.alwaysOn1Title}</div>
              <p style={{ margin: '10px 0 0', fontSize: 15.5, fontWeight: 300, color: '#C6D3EA', lineHeight: 1.7 }}>{t.alwaysOn1}</p>
            </div>
            <div style={{ background: '#2B3E8F', padding: 'clamp(24px, 3.4vw, 32px)' }}>
              <svg width={36} height={36} viewBox="0 0 56 56" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginBottom: 14 }}><path d="M21 17 a11 11 0 1 0 0 22 a11 11 0 1 0 0-22" /><path d="M35 17 a11 11 0 1 0 0 22 a11 11 0 1 0 0-22" stroke="#1DBAEA" /></svg>
              <div style={{ fontSize: 17.5, fontWeight: 700, color: '#FFFFFF' }}>{t.alwaysOn2Title}</div>
              <p style={{ margin: '10px 0 0', fontSize: 15.5, fontWeight: 300, color: '#C6D3EA', lineHeight: 1.7 }}>{t.alwaysOn2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — JOURNEY */}
      <section id="journey" style={{ background: '#F5F8FC' }}>
        <div style={container}>
          <Eyebrow n="03" label={t.eyeJourney} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(24px, 4vw, 60px)', alignItems: 'start', marginBottom: 'clamp(30px, 4vw, 48px)' }}>
            <h2 style={h2Style}>{t.journeyTitle}</h2>
            <p style={{ margin: 0, fontSize: 'clamp(16px, 2.1vw, 18px)', color: '#4A4F58', lineHeight: 1.8 }}>{t.journeySub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))', gap: 16 }}>
            {d.journey.map((j) => (
              <div key={j.title} style={{ background: '#FFFFFF', borderTop: `3px solid ${j.c}`, padding: 'clamp(22px, 3vw, 28px)', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span dir="ltr" style={{ fontSize: 12.5, fontWeight: 700, color: '#9AA1AC', letterSpacing: 1 }}>{j.n}</span>
                  <span style={{ fontSize: 17.5, fontWeight: 700, color: '#0B1226', lineHeight: 1.35 }}>{j.title}</span>
                </div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#9AA1AC', letterSpacing: 1.4, marginBottom: 6 }}>{t.youDo}</div><p style={{ margin: 0, fontSize: 14.5, color: '#4A4F58', lineHeight: 1.65 }}>{j.you}</p></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#9AA1AC', letterSpacing: 1.4, marginBottom: 6 }}>{t.weDo}</div><p style={{ margin: 0, fontSize: 14.5, color: '#4A4F58', lineHeight: 1.65 }}>{j.we}</p></div>
                <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #E1E8F2' }}><div style={{ fontSize: 11, fontWeight: 700, color: '#0D5DA6', letterSpacing: 1.4, marginBottom: 6 }}>{t.youGet}</div><p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: '#2B3E8F', lineHeight: 1.6 }}>{j.get}</p></div>
              </div>
            ))}
          </div>
          <p style={{ margin: '28px 0 0', fontSize: 14, color: '#9AA1AC', lineHeight: 1.75, maxWidth: 860 }}>{t.journeyNote}</p>
        </div>
      </section>

      {/* 04 — PLACE */}
      <section style={{ background: '#FFFFFF', paddingBottom: 'clamp(52px, 8vw, 100px)' }}>
        <div style={{ ...container, padding: 'clamp(52px, 8vw, 100px) clamp(20px, 5vw, 40px) clamp(28px, 4vw, 44px)' }}>
          <Eyebrow n="04" label={t.eyePlace} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(24px, 4vw, 60px)', alignItems: 'start' }}>
            <h2 style={h2Style}>{t.placeTitle}</h2>
            <p style={{ margin: 0, fontSize: 'clamp(16px, 2.1vw, 18px)', color: '#4A4F58', lineHeight: 1.8 }}>{t.placeSub}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'stretch' }}>
          {[
            { img: '/landing/complex-founders.jpg', cap: t.cap1, flex: '1.7 1 460px' },
            { img: '/landing/wm-atrium.png', cap: t.cap2, flex: '1 1 280px' },
            { img: '/landing/wm-workshop.png', cap: t.cap3, flex: '1 1 280px' }
          ].map((g) => (
            <figure key={g.img} style={{ margin: 0, position: 'relative', flex: g.flex, minWidth: 0, height: 'clamp(240px, 32vw, 440px)', overflow: 'hidden' }}>
              <img src={g.img} alt="" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
              <figcaption style={{ position: 'absolute', insetInlineStart: 0, bottom: 0, background: '#0B1226', color: '#FFFFFF', fontSize: 13, fontWeight: 600, padding: '11px 20px', letterSpacing: 0.3 }}>{g.cap}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 05 — SERVICES */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#0B1226' }}>
        <img src="/landing/wm-coworking.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,18,38,0.90) 0%, rgba(11,18,38,0.94) 100%)' }} />
        <div style={{ position: 'relative', ...container }}>
          <Eyebrow n="05" label={t.eyeServices} light />
          <h2 style={{ ...h2Style, color: '#FFFFFF', margin: '0 0 clamp(30px, 4.4vw, 52px)', maxWidth: 820 }}>{t.servicesTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0 clamp(20px, 3vw, 44px)' }}>
            {d.services.map((sv) => (
              <div key={sv.t} style={{ borderTop: '1px solid rgba(255,255,255,0.22)', padding: '22px 0 26px', minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.4 }}>{sv.t}</div>
                <p style={{ margin: '9px 0 0', fontSize: 14.5, fontWeight: 300, color: '#A8B6D4', lineHeight: 1.7 }}>{sv.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — NETWORK */}
      <section style={{ background: '#FFFFFF' }}>
        <div style={container}>
          <Eyebrow n="06" label={t.eyeNetwork} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 'clamp(30px, 5vw, 68px)', alignItems: 'start' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ ...h2Style, margin: '0 0 16px' }}>{t.networkTitle}</h2>
              <p style={{ margin: '0 0 30px', fontSize: 'clamp(16px, 2.1vw, 18px)', color: '#4A4F58', lineHeight: 1.8 }}>{t.networkSub}</p>
              <div style={{ borderTop: '2px solid #0B1226' }}>
                {d.sla.map((s) => (
                  <div key={s.k} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '15px 2px', borderBottom: '1px solid #E1E8F2' }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#4A4F58', flex: 1, minWidth: 0, lineHeight: 1.5 }}>{s.k}</span>
                    <span dir="ltr" style={{ fontSize: 14.5, fontWeight: 700, color: '#008A84', whiteSpace: 'nowrap' }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '0 clamp(20px, 3vw, 38px)', minWidth: 0 }}>
              {d.categories.map((c, i) => (
                <div key={c.t} style={{ borderTop: '1px solid #E4EAF3', padding: '20px 0 22px', minWidth: 0 }}>
                  <Icon paths={CAT_ICONS[i] || CAT_ICONS[0]} size={34} style={{ display: 'block', marginBottom: 12 }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0D5DA6', lineHeight: 1.4 }}>{c.t}</div>
                  <p style={{ margin: '8px 0 0', fontSize: 14.5, color: '#4A4F58', lineHeight: 1.65 }}>{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 07 — MEMBERSHIP */}
      <section id="membership" style={{ background: '#F5F8FC' }}>
        <div style={container}>
          <Eyebrow n="07" label={t.eyePlans} />
          <h2 style={{ ...h2Style, margin: '0 0 clamp(30px, 4.4vw, 48px)', maxWidth: 760 }}>{t.plansTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(265px, 1fr))', gap: 2 }}>
            {d.plans.map((p) => {
              const ps = planStyle(p);
              return (
                <div key={p.name} style={{ background: ps.bg, padding: 'clamp(28px, 3.6vw, 36px) clamp(24px, 3.2vw, 34px)', display: 'flex', flexDirection: 'column', gap: 13, borderTop: `3px solid ${ps.rule}`, minWidth: 0 }}>
                  <div style={{ fontSize: 'clamp(22px, 3vw, 25px)', fontWeight: 700, color: ps.accent, letterSpacing: '-0.4px' }}>{p.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: ps.muted, letterSpacing: 1.2 }}>{p.dur}</div>
                  <p style={{ margin: '5px 0 0', fontSize: 15.5, color: ps.body, lineHeight: 1.75, flex: 1 }}>{p.desc}</p>
                  <a href="#start" style={{ alignSelf: 'flex-start', borderRadius: 2, padding: '12px 25px', fontSize: 14.5, fontWeight: 600, background: ps.btnBg, color: ps.btnFg, marginTop: 8 }}>{t.plansCta}</a>
                </div>
              );
            })}
          </div>
          <p style={{ margin: '26px 0 0', fontSize: 14, color: '#9AA1AC', lineHeight: 1.75 }}>{t.plansNote}</p>
        </div>
      </section>

      {/* 08 — FIT */}
      <section style={{ background: '#FFFFFF' }}>
        <div style={container}>
          <Eyebrow n="08" label={t.eyeFit} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(30px, 5vw, 68px)', alignItems: 'start' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ ...h2Style, fontSize: 'clamp(24px, 3.4vw, 34px)', lineHeight: 1.28, letterSpacing: '-0.7px', margin: '0 0 22px' }}>{t.fitTitle}</h2>
              <div style={{ borderTop: '2px solid #0B1226' }}>
                {d.fitFor.map((x) => (
                  <p key={x} style={{ margin: 0, padding: '16px 2px', borderBottom: '1px solid #E1E8F2', fontSize: 16.5, color: '#2B3E8F', fontWeight: 500, lineHeight: 1.65 }}>{x}</p>
                ))}
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ ...h2Style, fontSize: 'clamp(24px, 3.4vw, 34px)', lineHeight: 1.28, letterSpacing: '-0.7px', margin: '0 0 22px' }}>{t.needTitle}</h2>
              <div style={{ borderTop: '2px solid #98C23E' }}>
                {d.needs.map((x) => (
                  <p key={x} style={{ margin: 0, padding: '16px 2px', borderBottom: '1px solid #E1E8F2', fontSize: 16, color: '#4A4F58', lineHeight: 1.65 }}>{x}</p>
                ))}
              </div>
              <p style={{ margin: '20px 0 0', fontSize: 14, color: '#9AA1AC', lineHeight: 1.75 }}>{t.needNote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — FAQ */}
      <section id="faq" style={{ background: '#F5F8FC' }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(52px, 8vw, 100px) clamp(20px, 5vw, 40px)' }}>
          <Eyebrow n="09" label={t.eyeFaq} />
          <h2 style={{ ...h2Style, margin: '0 0 clamp(26px, 4vw, 42px)' }}>{t.faqTitle}</h2>
          <div style={{ borderTop: '2px solid #0B1226' }}>
            {d.faqs.map((fq, i) => (
              <div key={fq.q} style={{ borderBottom: '1px solid #DDE5F0' }}>
                <button className="faq-btn" onClick={() => setOpen(open === i ? -1 : i)} style={{ width: '100%', fontFamily: 'inherit', textAlign: 'start', cursor: 'pointer', background: 'none', border: 'none', padding: '20px 2px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ fontSize: 'clamp(16px, 2.2vw, 17.5px)', fontWeight: 600, color: '#0B1226', lineHeight: 1.5, minWidth: 0 }}>{fq.q}</span>
                  <span dir="ltr" style={{ fontSize: 20, fontWeight: 400, color: '#1DBAEA', flexShrink: 0, lineHeight: 1 }}>{open === i ? '−' : '+'}</span>
                </button>
                {open === i && (
                  <p style={{ margin: 0, padding: '0 2px 24px', fontSize: 16, color: '#4A4F58', lineHeight: 1.85 }}>{fq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 — START + WIZARD */}
      <section id="start" style={{ position: 'relative', overflow: 'hidden', background: '#0B1226' }}>
        <img src="/landing/complex-lounge.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,18,38,0.88) 0%, rgba(8,14,29,0.96) 100%)' }} />
        <div style={{ position: 'relative', ...container }}>
          <Eyebrow n="10" label={t.eyeStart} light />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(24px, 4vw, 60px)', alignItems: 'start' }}>
            <h2 style={{ ...h2Style, color: '#FFFFFF' }}>{t.startTitle}</h2>
            <p style={{ margin: 0, fontSize: 'clamp(16px, 2.1vw, 18px)', fontWeight: 300, color: '#DCE5F5', lineHeight: 1.8 }}>{t.startSub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 clamp(20px, 3vw, 44px)', marginTop: 'clamp(26px, 4vw, 44px)' }}>
            {d.steps.map((s) => (
              <div key={s.t} style={{ borderTop: '1px solid rgba(255,255,255,0.24)', padding: '18px 0 4px', minWidth: 0 }}>
                <span dir="ltr" style={{ fontSize: 12.5, fontWeight: 700, color: '#1DBAEA', letterSpacing: 1.4 }}>{s.n}</span>
                <div style={{ marginTop: 9, fontSize: 16.5, fontWeight: 700, color: '#FFFFFF' }}>{s.t}</div>
                <p style={{ margin: '6px 0 0', fontSize: 14.5, fontWeight: 300, color: '#A8B6D4', lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>

          <div style={{ background: '#FFFFFF', padding: 'clamp(24px, 4vw, 48px) clamp(18px, 3.4vw, 44px)', maxWidth: 980, margin: 'clamp(34px, 5vw, 58px) auto 0' }}>
            {sent ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#0B1226', letterSpacing: '-0.5px' }}>{t.sentTitle}</div>
                <p style={{ margin: '14px auto 0', fontSize: 17, color: '#4A4F58', lineHeight: 1.8, maxWidth: 520 }}>{t.sentBody}</p>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 5px', fontSize: 23, fontWeight: 700, color: '#0B1226', letterSpacing: '-0.4px' }}>{t.formTitle}</h3>
                <p style={{ margin: '0 0 26px', fontSize: 15, color: '#9AA1AC', lineHeight: 1.6 }}>{t.wizSub}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', alignItems: 'center' }}>
                  {[t.tab1, t.tab2, t.tab3, t.tab4].map((label, i) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span dir="ltr" style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700, background: i === step ? '#1DBAEA' : i < step ? '#2B3E8F' : '#EDF1F7', color: i <= step ? '#FFFFFF' : '#9AA1AC' }}>{d.tabNums[i]}</span>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: i === step ? '#2B3E8F' : i < step ? '#4A4F58' : '#9AA1AC' }}>{label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 3, background: '#EDF1F7', marginTop: 18, overflow: 'hidden' }}><div style={{ height: '100%', background: '#1DBAEA', width: `${((step + 1) / 4) * 100}%` }} /></div>

                {step === 0 && (
                  <div style={{ paddingTop: 34 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0B1226', lineHeight: 1.4 }}>{t.q1}<Req /></div>
                    <p style={{ margin: '7px 0 16px', fontSize: 14.5, color: '#9AA1AC', lineHeight: 1.6 }}>{t.q1Note}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {d.profiles.map((label) => (
                        <label key={label} className="radio-card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', cursor: 'pointer' }}>
                          <input type="radio" name="stepin-profile" checked={f.profile === label} onChange={() => edit({ profile: label })} style={{ marginTop: 3, width: 16, height: 16, accentColor: '#2B3E8F', flexShrink: 0 }} />
                          <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, color: '#1B1D21', lineHeight: 1.5 }}>{label}</span>
                        </label>
                      ))}
                    </div>
                    <div style={{ maxWidth: 430, marginTop: 26 }}>
                      <label style={labelStyle}>{t.qMarket}</label>
                      <input type="text" value={f.homeMarket} onChange={(e) => edit({ homeMarket: e.target.value })} style={fieldStyle} />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div style={{ paddingTop: 34, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={labelStyle}>{t.lCompany}<Req /></label>
                      <input type="text" value={f.company} onChange={(e) => edit({ company: e.target.value })} style={fieldStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>{t.lWebsite}</label>
                        <input type="url" dir="ltr" placeholder="https://" value={f.website} onChange={(e) => edit({ website: e.target.value })} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t.lLinkedIn}</label>
                        <input type="url" dir="ltr" placeholder="https://" value={f.linkedin} onChange={(e) => edit({ linkedin: e.target.value })} style={fieldStyle} />
                      </div>
                    </div>
                    <div style={{ maxWidth: 430 }}>
                      <label style={labelStyle}>{t.lSize}</label>
                      <input type="text" placeholder={t.lSizePh} value={f.size} onChange={(e) => edit({ size: e.target.value })} style={fieldStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t.lActivity}<Req /></label>
                      <input type="text" value={f.activity} onChange={(e) => edit({ activity: e.target.value })} style={fieldStyle} />
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: '#9AA1AC', lineHeight: 1.6 }}>{t.lActivityNote}</p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ paddingTop: 34, display: 'flex', flexDirection: 'column', gap: 22 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>{t.lStage}<Req /></label>
                        <select value={f.stage} onChange={(e) => edit({ stage: e.target.value })} style={fieldStyle}>
                          {selOpts(d.stageList).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>{t.lCapital}</label>
                        <select value={f.capital} onChange={(e) => edit({ capital: e.target.value })} style={fieldStyle}>
                          {selOpts(d.capitalList).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <div style={{ ...labelStyle, marginBottom: 10 }}>{t.lSaudi}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px' }}>
                        {d.saudiList.map((label) => (
                          <label key={label} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                            <input type="radio" name="stepin-saudi" checked={f.saudi === label} onChange={() => edit({ saudi: label })} style={{ width: 16, height: 16, accentColor: '#2B3E8F' }} />
                            <span style={{ fontSize: 15.5, color: '#1B1D21' }}>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ maxWidth: 430 }}>
                      <label style={labelStyle}>{t.lTimeline}</label>
                      <select value={f.timeline} onChange={(e) => edit({ timeline: e.target.value })} style={fieldStyle}>
                        {selOpts(d.timelineList).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ ...labelStyle, marginBottom: 10 }}>{t.lFile}</div>
                      <label className="drop-zone" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, border: '1px dashed #C6D0DE', padding: '32px 20px', cursor: 'pointer', background: '#FAFBFD' }}>
                        <span style={{ fontSize: 15, color: '#6B7280' }}>{t.fDrop}</span>
                        <span style={{ border: '1px solid #DDE5F0', padding: '10px 22px', fontSize: 14, fontWeight: 600, color: '#2B3E8F', background: '#FFFFFF' }}>{t.fSelect}</span>
                        <input type="file" onChange={(e) => { const fl = e.target.files && e.target.files[0]; edit({ file: fl ? fl.name : '' }); }} style={{ display: 'none' }} />
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', marginTop: 9 }}>
                        <span style={{ fontSize: 13, color: '#9AA1AC', lineHeight: 1.6 }}>{t.fFileNote}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#008A84' }}>{f.file}</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ paddingTop: 34, display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>{t.lFirst}<Req /></label>
                        <input type="text" value={f.first} onChange={(e) => edit({ first: e.target.value })} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{t.lLast}<Req /></label>
                        <input type="text" value={f.last} onChange={(e) => edit({ last: e.target.value })} style={fieldStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>{t.lEmail}<Req /></label>
                      <input type="email" dir="ltr" value={f.email} onChange={(e) => edit({ email: e.target.value })} style={fieldStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>{t.lPhone}<Req /></label>
                        <div dir="ltr" style={{ display: 'flex', gap: 8 }}>
                          <select value={f.dial} onChange={(e) => edit({ dial: e.target.value })} style={{ ...fieldStyle, flex: '0 0 104px', width: 'auto', padding: '13px 10px' }}>
                            {DIALS.map((x) => <option key={x} value={x}>{x}</option>)}
                          </select>
                          <input type="tel" value={f.phone} onChange={(e) => edit({ phone: e.target.value })} style={{ ...fieldStyle, flex: 1, minWidth: 0, width: 'auto' }} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>{t.lRole}</label>
                        <input type="text" value={f.role} onChange={(e) => edit({ role: e.target.value })} style={fieldStyle} />
                      </div>
                    </div>
                    <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 4, cursor: 'pointer' }}>
                      <input type="checkbox" checked={f.consent} onChange={(e) => edit({ consent: e.target.checked })} style={{ marginTop: 3, width: 16, height: 16, accentColor: '#2B3E8F', flexShrink: 0 }} />
                      <span style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.65 }}>{t.fConsent}</span>
                    </label>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 34, paddingTop: 24, borderTop: '1px solid #EDF1F7' }}>
                  {step > 0 && (
                    <button onClick={() => go(Math.max(step - 1, 0))} style={{ fontFamily: 'inherit', cursor: 'pointer', background: '#FFFFFF', color: '#2B3E8F', border: '1px solid #DDE5F0', borderRadius: 2, padding: '14px 28px', fontSize: 15, fontWeight: 600 }}>{t.back}</button>
                  )}
                  {step < 3 && <button className="btn-dark" onClick={advance}>{t.next}</button>}
                  {step === 3 && <button className="btn-dark" onClick={send}>{t.submit}</button>}
                  <div style={{ flex: 1, minWidth: 8 }} />
                  <button onClick={persist} style={{ fontFamily: 'inherit', cursor: 'pointer', background: 'none', border: 'none', padding: '8px 0', fontSize: 14.5, fontWeight: 600, color: '#0D5DA6', textDecoration: 'underline', textUnderlineOffset: 3 }}>{t.save}</button>
                </div>
                {err && <div style={{ marginTop: 14, background: '#FDECEC', padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#B93030' }}>{t.errRequired}</div>}
                {savedFlag && <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: '#008A84' }}>{t.savedMsg}</div>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#080E1D' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(40px, 6vw, 70px) clamp(20px, 5vw, 40px) 36px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px 40px', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ minWidth: 0 }}>
              <Wordmark size={24} subColor="#7C8BAD" />
              <p style={{ margin: '15px 0 0', fontSize: 14.5, color: '#7C8BAD', lineHeight: 1.75, maxWidth: 340 }}>{t.footerBlurb}</p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><img src="/landing/wm-mark.png" alt="" style={{ height: 26, width: 'auto' }} /><span style={{ fontSize: 13.5, color: '#7C8BAD' }}>{t.ownedBy}</span></div>
              <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.14)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><span style={{ fontSize: 13.5, color: '#7C8BAD' }}>{t.withPartner}</span><img src="/landing/startup-hub.png" alt="Startup Hub — Monsha'at" style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.8 }} /></div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div dir="ltr" style={{ fontSize: 17.5, fontWeight: 700, color: '#FFFFFF', textAlign: 'start' }}>StepinSaudi.com</div>
              <div dir="ltr" style={{ fontSize: 14.5, color: '#7C8BAD', marginTop: 7, textAlign: 'start' }}>info@stepinsaudi.com</div>
              <div style={{ fontSize: 14.5, color: '#7C8BAD', marginTop: 7 }}>{t.footerAddr}</div>
            </div>
          </div>
          <p style={{ margin: '26px 0 0', fontSize: 12.5, color: '#5C6883', lineHeight: 1.85, maxWidth: 1000 }}>{t.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
