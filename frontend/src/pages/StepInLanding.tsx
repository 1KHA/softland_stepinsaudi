import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * StepIn Saudi landing page — React port of newland/StepIn Landing WMC.dc.html.
 * All copy is bilingual and colocated here (the source template colocated it the
 * same way); the rest of the app keeps using translations.ts.
 */

const C = {
  navy: '#2B3E8F',
  blue: '#0D5DA6',
  cyan: '#1DBAEA',
  teal: '#008A84',
  green: '#98C23E',
  amber: '#E9A623',
  yellow: '#FACC0B',
  gray: '#808184',
  line: '#E3E3E3',
  ink: '#3B3E3B',
};

const rainbow = `linear-gradient(90deg, ${C.navy} 0%, ${C.blue} 18%, ${C.cyan} 38%, ${C.teal} 55%, ${C.green} 72%, ${C.amber} 88%, ${C.yellow} 100%)`;

function Logo({ size = 27 }: { size?: number }) {
  return (
    <div dir="ltr" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, lineHeight: 1, width: 'max-content' }}>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{ color: C.navy, fontWeight: 700, fontSize: size, letterSpacing: '-0.5px' }}>step</span>
        <span style={{ color: C.cyan, fontWeight: 700, fontSize: size, letterSpacing: '-0.5px' }}>in</span>
      </div>
      <span style={{ color: C.gray, fontWeight: 300, fontSize: size * 0.46, letterSpacing: '4.5px', textIndent: '4.5px', textTransform: 'uppercase', textAlign: 'center' }}>
        saudi
      </span>
    </div>
  );
}

export function StepInLanding() {
  const { i18n } = useTranslation();
  const en = !(i18n.language || 'en').startsWith('ar');
  const T = (e: string, a: string) => (en ? e : a);
  const [submitted, setSubmitted] = useState(false);

  const toggleLang = () => i18n.changeLanguage(en ? 'ar' : 'en');

  const stats = en
    ? [
        { n: '45%', c: C.cyan, t: 'of all MENA venture capital went to Saudi Arabia in 2025 (MAGNiTT)' },
        { n: '550', c: C.green, t: 'Entrepreneur licences issued to foreign startups in H1 2025 — up 118% YoY' },
        { n: '$1.72B', c: C.amber, t: 'Saudi VC funding in 2025, the most active market in the region' },
      ]
    : [
        { n: '٤٥٪', c: C.cyan, t: 'من رأس المال الجريء في المنطقة اتجه إلى السعودية في ٢٠٢٥ (ماغنيت)' },
        { n: '550', c: C.green, t: 'رخصة ريادي أعمال صدرت لشركات أجنبية في النصف الأول من ٢٠٢٥ — بنمو ١١٨٪' },
        { n: '$1.72B', c: C.amber, t: 'حجم الاستثمار الجريء في السعودية عام ٢٠٢٥ — السوق الأنشط في المنطقة' },
      ];

  const stages = en
    ? [
        { n: '1', c: C.cyan, title: 'Qualify & Orient', desc: 'Eligibility read, licence route, and a personalised entry map — before you commit.', govLabel: 'GOVERNMENT REQUIRES', gov: 'Nothing yet' },
        { n: '2', c: C.blue, title: 'Licence & Legal Identity', desc: 'MISA registration coordinated; accredited endorsement route where eligible; partner files your AoA and CR.', govLabel: 'GOVERNMENT REQUIRES', gov: 'MISA registration · Commercial Registration' },
        { n: '3', c: C.teal, title: 'Tax, Address & Chamber', desc: 'ZATCA registration, national address and Chamber membership; VAT and e-invoicing flagged from day one.', govLabel: 'GOVERNMENT REQUIRES', gov: 'ZATCA · National address · Chamber' },
        { n: '4', c: C.green, title: 'People & Payroll', desc: 'Qiwa, GOSI and Muqeem activation; Saudization sequenced correctly from your first hire.', govLabel: 'GOVERNMENT REQUIRES', gov: 'HRSD/Qiwa · GOSI · Work visas & iqama' },
        { n: '5', c: C.amber, title: 'Banking & Landing', desc: 'The bank account prepared and sequenced last — then a desk, mentorship and introductions in Diriyah.', govLabel: 'BANK REQUIRES', gov: 'Registered entity · Attested documents · KYC' },
        { n: '6', c: C.navy, title: 'Business Dev & Access', desc: 'Access to market, investors, partners and vendors — delivered by accredited partners through the ecosystem.', govLabel: 'GOVERNMENT REQUIRES', gov: 'Nothing' },
      ]
    : [
        { n: '1', c: C.cyan, title: 'التأهيل والتوجيه', desc: 'تقييم الأهلية وتحديد مسار الترخيص وخريطة دخول مخصّصة — قبل الالتزام.', govLabel: 'متطلبات الجهات الحكومية', gov: 'لا شيء بعد' },
        { n: '2', c: C.blue, title: 'الترخيص والكيان النظامي', desc: 'تنسيق التسجيل لدى وزارة الاستثمار، ومسار التزكية المعتمدة عند الأهلية، وشريك يودع عقد التأسيس والسجل التجاري.', govLabel: 'متطلبات الجهات الحكومية', gov: 'تسجيل وزارة الاستثمار · السجل التجاري' },
        { n: '3', c: C.teal, title: 'الضريبة والعنوان والغرفة', desc: 'التسجيل لدى هيئة الزكاة والضريبة، والعنوان الوطني، وعضوية الغرفة التجارية؛ مع التنبيه لضريبة القيمة المضافة والفوترة الإلكترونية من اليوم الأول.', govLabel: 'متطلبات الجهات الحكومية', gov: 'هيئة الزكاة · العنوان الوطني · الغرفة التجارية' },
        { n: '4', c: C.green, title: 'التوظيف والرواتب', desc: 'تفعيل قوى والتأمينات الاجتماعية ومقيم، وتنظيم التوطين بالتسلسل الصحيح من أول موظف.', govLabel: 'متطلبات الجهات الحكومية', gov: 'قوى · التأمينات · تأشيرات العمل والإقامة' },
        { n: '5', c: C.amber, title: 'الحساب البنكي والاستقرار', desc: 'تجهيز الحساب البنكي في تسلسله الصحيح أخيرًا — ثم مكتب وإرشاد وتعارف في الدرعية.', govLabel: 'متطلبات البنك', gov: 'كيان مسجّل · وثائق مصدّقة · التحقق المصرفي' },
        { n: '6', c: C.navy, title: 'تطوير الأعمال والوصول', desc: 'الوصول إلى السوق والمستثمرين والشركاء والمورّدين — عبر شركاء معتمدين ومنظومة المجمّع.', govLabel: 'متطلبات الجهات الحكومية', gov: 'لا شيء' },
      ];

  const inclCols = en
    ? [
        {
          header: 'We deliver', bar: C.green,
          items: [
            'Eligibility assessment & entry mapping',
            'Accredited support letter for the Entrepreneur Licence (where we qualify as an accredited body — pending confirmation)',
            "Coworking space & desk at the Diriyah complex",
            'Mentorship, advisory, ecosystem & investor introductions',
            'Event access & convening (LEAP, Biban)',
            'Programme management & a single point of contact',
          ],
        },
        {
          header: 'Delivered via accredited partners', bar: C.cyan,
          items: [
            'Articles of Association drafting (legal partner)',
            'Commercial Registration filing (formation partner)',
            'Document attestation & legal translation',
            'Banking introductions (banking partners)',
            'Employer-of-record / PEO (HR partner, optional)',
            'Accounting & tax compliance',
          ],
        },
        {
          header: 'We guide — you obtain from government', bar: C.gray,
          items: [
            'MISA registration & licence (Ministry of Investment)',
            'Commercial Registration issuance (Ministry of Commerce)',
            'ZATCA tax/VAT & Fatoora registration',
            'Qiwa / GOSI / Muqeem employer registration',
            'Work visas, iqama, premium residency (MHRSD / MOI)',
            'Corporate bank-account approval (the bank)',
          ],
        },
      ]
    : [
        {
          header: 'نقدّمه مباشرة', bar: C.green,
          items: [
            'تقييم الأهلية ورسم مسار الدخول',
            'خطاب التزكية المعتمدة لرخصة ريادي الأعمال (متى ما توفرت صفة الجهة المعتمدة — رهن التأكيد)',
            'مساحة عمل ومكتب في مجمع الدرعية',
            'الإرشاد والاستشارات والتعارف على المنظومة والمستثمرين',
            'حضور الفعاليات والمشاركة («ليب»، «بيبان»)',
            'إدارة البرنامج ونقطة تواصل واحدة',
          ],
        },
        {
          header: 'عبر شركاء معتمدين', bar: C.cyan,
          items: [
            'صياغة عقد التأسيس (شريك قانوني)',
            'إيداع السجل التجاري (شريك تأسيس)',
            'تصديق الوثائق والترجمة القانونية',
            'التعريف بالشركاء المصرفيين',
            'خدمات التوظيف والرواتب (شريك موارد بشرية، اختياري)',
            'المحاسبة والالتزام الضريبي',
          ],
        },
        {
          header: 'نُرشدك وتحصل عليه من الجهة الحكومية', bar: C.gray,
          items: [
            'تسجيل ورخصة وزارة الاستثمار',
            'إصدار السجل التجاري (وزارة التجارة)',
            'التسجيل الضريبي والفوترة الإلكترونية (هيئة الزكاة)',
            'تسجيل صاحب العمل في قوى والتأمينات ومقيم',
            'تأشيرات العمل والإقامة والإقامة المميزة',
            'اعتماد الحساب البنكي (البنك)',
          ],
        },
      ];

  const markets = en
    ? ['GCC', 'Wider MENA & Egypt', 'Türkiye', 'Pakistan', 'India', 'China', 'Southeast Asia', 'Europe / UK']
    : ['دول الخليج', 'الشرق الأوسط ومصر', 'تركيا', 'باكستان', 'الهند', 'الصين', 'جنوب شرق آسيا', 'أوروبا والمملكة المتحدة'];

  const proofs = en
    ? [
        "Based inside Monsha'at's Startup Companies Complex, Diriyah",
        'Operated by Wadi Makkah, the investment arm of Umm Al-Qura University, with 230+ startups incubated',
        'A route into the MISA Entrepreneur Licence through accredited endorsement',
        'Direct access to LEAP and Biban',
      ]
    : [
        'مقرّنا داخل مجمع الشركات الناشئة بمنشآت في الدرعية',
        'بإدارة شركة وادي مكة، الذراع الاستثماري لجامعة أم القرى، باحتضان أكثر من ٢٣٠ شركة ناشئة',
        'مسار نحو رخصة ريادي الأعمال عبر تزكية معتمدة',
        'وصول مباشر إلى «ليب» و«بيبان»',
      ];

  const tiers = en
    ? [
        { tag: 'VIRTUAL LANDING', name: 'Explore', who: 'Testing the market pre-commitment', border: C.line, bg: '#ffffff', accent: C.cyan, items: ['Personalised entry map', 'Virtual membership', 'Advisory hours', 'Event access'], durLabel: 'Duration:', dur: '~3 months', price: '[to be verified]' },
        { tag: 'MOST STRUCTURED', name: 'Establish', who: 'Committed to registering', border: C.blue, bg: '#F4F9FD', accent: C.blue, items: ['Everything in Explore', 'Licence & CR coordination', 'Tax & labour guidance', 'Banking preparation', 'Coworking desk in Diriyah'], durLabel: 'Duration:', dur: '~6 months', price: '[to be verified]' },
        { tag: 'SCALE', name: 'Embed', who: 'Scale-ups & corporate innovation arms', border: C.line, bg: '#ffffff', accent: C.green, items: ['Everything in Establish', 'Dedicated office', 'Priority introductions', 'Hiring & Saudization support'], durLabel: 'Duration:', dur: '~12 months', price: '[to be verified]' },
      ]
    : [
        { tag: 'الهبوط الافتراضي', name: 'استكشف', who: 'لاختبار السوق قبل الالتزام', border: C.line, bg: '#ffffff', accent: C.cyan, items: ['خريطة دخول مخصّصة', 'عضوية افتراضية', 'ساعات استشارية', 'حضور الفعاليات'], durLabel: 'المدة:', dur: '~٣ أشهر', price: '[يُستكمل بعد التحقق]' },
        { tag: 'الأكثر تنظيمًا', name: 'أسّس', who: 'للملتزمين بالتسجيل', border: C.blue, bg: '#F4F9FD', accent: C.blue, items: ['كل ما في «استكشف»', 'تنسيق الترخيص والسجل التجاري', 'إرشاد ضريبي وعمالي', 'التحضير المصرفي', 'مكتب عمل في الدرعية'], durLabel: 'المدة:', dur: '~٦ أشهر', price: '[يُستكمل بعد التحقق]' },
        { tag: 'التوسّع', name: 'ترسّخ', who: 'للشركات النامية وأذرع الابتكار المؤسسي', border: C.line, bg: '#ffffff', accent: C.green, items: ['كل ما في «أسّس»', 'مكتب مخصص', 'أولوية في التعارف', 'دعم التوظيف والتوطين'], durLabel: 'المدة:', dur: '~١٢ شهرًا', price: '[يُستكمل بعد التحقق]' },
      ];

  const faqs = en
    ? [
        { q: "Can you guarantee I'll get my licence or visa?", a: 'No. We facilitate and prepare; MISA, MHRSD, and MOI make all decisions.' },
        { q: 'Can I own 100% of my company?', a: 'In most sectors, yes, under the Investment Law in force since 12 February 2025. Some regulated sectors have conditions.' },
        { q: 'How long does setup really take?', a: 'Individual steps run a few days each; full operational readiness is benchmarked externally at roughly 8–14 weeks depending on activity and document quality. These are not our commitments.' },
        { q: 'What does the government side cost?', a: 'The Entrepreneur Licence carries a reduced government fee (around SAR 2,000/yr with a multi-year waiver of ~SAR 60,000 over the first three years); other authority fees and capital requirements apply separately.' },
        { q: 'Why is the bank account so hard?', a: "Banks require a fully registered entity and attested documents (Saudi Embassy then MOFA) and run heavy KYC. It's the last mile, not the first — we prepare you for it." },
        { q: 'Do I have to hire Saudis immediately?', a: 'Saudization applies from day one; micro firms typically need at least one Saudi, and for international companies the second hire after the GM must be Saudi. Foreign investor-owners have counted as Saudi nationals for the ratio since April 2024.' },
        { q: 'Can I get residency?', a: 'Founders can obtain an investor iqama tied to ownership, or premium residency (SAR 100,000/yr renewable or SAR 800,000 permanent); raising SAR 400,000 from authorised partners can qualify for a 5-year entrepreneurial premium residency. Decisions rest with the authorities.' },
        { q: 'What taxes apply?', a: 'VAT is 15% (mandatory registration above SAR 375,000 turnover); corporate income tax applies to foreign-owned entities; e-invoicing (Fatoora) is mandatory.' },
        { q: 'Can I move my money out?', a: 'The Investment Law provides investor protections and fair treatment; profit repatriation is generally permitted subject to tax and regulatory compliance — confirm specifics with your tax advisor.' },
        { q: "What about my customers' data?", a: "PDPL is fully enforced (since 14 September 2024); cross-border transfer of Saudi residents' data is restricted, breaches must be reported to SDAIA within 72 hours, and fines reach SAR 5M." },
        { q: 'Do I need an RHQ?', a: 'Only large multinationals seeking government contracts need the RHQ; most startups do not.' },
        { q: 'Can I run it remotely?', a: 'Limited remote management is possible, but banking and operations effectively require in-Kingdom presence.' },
        { q: 'What if my sector is regulated (fintech, health)?', a: "You'll need the relevant regulator's approval (e.g. SAMA for fintech); we map it but cannot grant it." },
        { q: 'How is this different from a formation agent?', a: 'Agents file paperwork; we sequence the whole journey, endorse eligible startups, host you physically, and connect you to the ecosystem.' },
        { q: 'What exactly do you NOT do?', a: 'We do not issue any government approval, and we guide (not obtain) tax, labour, visa, and banking outcomes.' },
      ]
    : [
        { q: 'هل تضمنون حصولي على الترخيص أو التأشيرة؟', a: 'لا. نحن نُيسّر ونُجهّز؛ والقرارات كلها بيد وزارة الاستثمار ووزارة الموارد البشرية ووزارة الداخلية.' },
        { q: 'هل يمكنني تملّك شركتي بنسبة ١٠٠٪؟', a: 'في معظم القطاعات نعم، بموجب نظام الاستثمار الساري منذ ١٢ فبراير ٢٠٢٥. بعض القطاعات المنظمة لها اشتراطات.' },
        { q: 'كم يستغرق التأسيس فعليًا؟', a: 'كل خطوة تستغرق أيامًا معدودة؛ والجاهزية التشغيلية الكاملة تُقدَّر خارجيًا بنحو ٨–١٤ أسبوعًا بحسب النشاط وجودة الوثائق. وهذه ليست التزامات منّا.' },
        { q: 'كم تبلغ الرسوم الحكومية؟', a: 'رخصة ريادي الأعمال برسم حكومي مخفَّض (نحو ٢٬٠٠٠ ريال سنويًا مع إعفاء يقارب ٦٠٬٠٠٠ ريال خلال السنوات الثلاث الأولى)؛ وتُطبَّق رسوم الجهات الأخرى ومتطلبات رأس المال بشكل مستقل.' },
        { q: 'لماذا الحساب البنكي بهذه الصعوبة؟', a: 'تشترط البنوك كيانًا مكتمل التسجيل ووثائق مصدّقة (السفارة السعودية ثم وزارة الخارجية) وتُجري تحققًا مصرفيًا دقيقًا. إنه آخر الطريق لا أوله — ونحن نجهّزك له.' },
        { q: 'هل عليّ توظيف سعوديين فورًا؟', a: 'يسري التوطين من اليوم الأول؛ فالمنشآت متناهية الصغر تحتاج عادة سعوديًا واحدًا على الأقل، وللشركات الدولية يجب أن يكون الموظف الثاني بعد المدير العام سعوديًا. ويُحتسب المستثمر الأجنبي المالك ضمن نسبة التوطين منذ أبريل ٢٠٢٤.' },
        { q: 'هل يمكنني الحصول على إقامة؟', a: 'يمكن للمؤسس الحصول على إقامة مستثمر مرتبطة بالملكية، أو الإقامة المميزة (١٠٠٬٠٠٠ ريال سنويًا قابلة للتجديد أو ٨٠٠٬٠٠٠ ريال دائمة)؛ وجمعُ ٤٠٠٬٠٠٠ ريال من شركاء معتمدين قد يؤهّل لإقامة مميزة ريادية لخمس سنوات. والقرار بيد الجهات المختصة.' },
        { q: 'ما الضرائب المطبّقة؟', a: 'ضريبة القيمة المضافة ١٥٪ (تسجيل إلزامي فوق ٣٧٥٬٠٠٠ ريال من الإيرادات)؛ وتسري ضريبة الدخل على الكيانات المملوكة لأجانب؛ والفوترة الإلكترونية (فاتورة) إلزامية.' },
        { q: 'هل يمكنني تحويل أرباحي للخارج؟', a: 'يوفّر نظام الاستثمار حماية للمستثمر ومعاملة عادلة؛ وإعادة الأرباح مسموحة عمومًا مع الالتزام الضريبي والتنظيمي — راجع مستشارك الضريبي للتفاصيل.' },
        { q: 'وماذا عن بيانات عملائي؟', a: 'نظام حماية البيانات الشخصية سارٍ بالكامل (منذ ١٤ سبتمبر ٢٠٢٤)؛ نقل بيانات المقيمين خارج المملكة مقيَّد، ويجب إبلاغ سدايا بالاختراقات خلال ٧٢ ساعة، وتصل الغرامات إلى ٥ ملايين ريال.' },
        { q: 'هل أحتاج إلى مقر إقليمي؟', a: 'المقر الإقليمي مطلوب فقط للشركات متعددة الجنسيات الكبرى الساعية للعقود الحكومية؛ معظم الشركات الناشئة لا تحتاجه.' },
        { q: 'هل يمكن إدارة الشركة عن بُعد؟', a: 'الإدارة عن بُعد ممكنة بشكل محدود، لكن العمليات المصرفية والتشغيلية تتطلب عمليًا حضورًا داخل المملكة.' },
        { q: 'ماذا لو كان قطاعي منظمًا (التقنية المالية، الصحة)؟', a: 'ستحتاج إلى موافقة الجهة التنظيمية المختصة (مثل البنك المركزي للتقنية المالية)؛ نرسم لك المسار لكن لا نمنح الموافقة.' },
        { q: 'ما الفرق بينكم وبين وكيل تأسيس؟', a: 'الوكلاء يودعون الأوراق؛ نحن ننظّم الرحلة كاملة، ونزكّي الشركات المؤهلة، ونستضيفك فعليًا، ونربطك بالمنظومة.' },
        { q: 'ما الذي لا تفعلونه تحديدًا؟', a: 'لا نُصدر أي موافقة حكومية، ونُرشد (ولا نحصّل) نتائج الضرائب والعمل والتأشيرات والبنوك.' },
      ];

  const formFields = en
    ? [
        { label: 'Company name', ph: 'Acme Ltd' },
        { label: 'Website', ph: 'acme.com' },
        { label: 'Founder name & role', ph: 'Jane Doe, CEO' },
        { label: 'Home market', ph: 'e.g. UAE, India, UK' },
        { label: 'Sector', ph: 'e.g. fintech, logistics' },
        { label: 'Target Saudi activity', ph: 'What will you do in KSA?' },
        { label: 'Email', ph: 'you@company.com' },
        { label: 'Phone', ph: '+—' },
      ]
    : [
        { label: 'اسم الشركة', ph: 'شركة المثال' },
        { label: 'الموقع الإلكتروني', ph: 'example.com' },
        { label: 'اسم المؤسس وصفته', ph: 'فلان، الرئيس التنفيذي' },
        { label: 'السوق الأم', ph: 'مثل: الإمارات، الهند' },
        { label: 'القطاع', ph: 'مثل: تقنية مالية' },
        { label: 'النشاط المستهدف في السعودية', ph: 'ماذا ستعمل في المملكة؟' },
        { label: 'البريد الإلكتروني', ph: 'you@company.com' },
        { label: 'الهاتف', ph: '+—' },
      ];

  const stageOptions = en
    ? ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Established SME', 'Corporate innovation team']
    : ['ما قبل التأسيس', 'التأسيس', 'الجولة أ', 'الجولة ب', 'منشأة قائمة', 'فريق ابتكار مؤسسي'];

  const heroCta = T('Request your entry assessment', 'اطلب تقييم دخولك للسوق');
  const container: React.CSSProperties = { maxWidth: 1240, margin: '0 auto' };

  return (
    <div dir={en ? 'ltr' : 'rtl'} className="stepin-landing" style={{ minHeight: '100vh', background: '#ffffff', color: C.ink }}>
      <style>{`
        .stepin-landing a { color: ${C.blue}; text-decoration: none; }
        .stepin-landing a:hover { color: ${C.navy}; }
        .stepin-landing .si-btn-primary { background: ${C.navy}; color: #fff; border-radius: 999px; font-weight: 600; display: inline-block; transition: background .2s; }
        .stepin-landing .si-btn-primary:hover { background: ${C.blue}; color: #fff; }
        .stepin-landing .si-btn-gold { background: ${C.yellow}; color: ${C.navy}; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; display: inline-block; transition: background .2s; }
        .stepin-landing .si-btn-gold:hover { background: ${C.amber}; color: ${C.navy}; }
        .stepin-landing details > summary { list-style: none; cursor: pointer; }
        .stepin-landing details > summary::-webkit-details-marker { display: none; }
        .stepin-landing details[open] .faq-chev { transform: rotate(45deg); }
        .stepin-landing .faq-chev { transition: transform .2s; }
        .stepin-landing input, .stepin-landing select, .stepin-landing button { font-family: inherit; }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', borderBottom: `1px solid ${C.line}`, boxShadow: '0 1px 10px rgba(43,62,143,0.07)' }}>
        <div style={{ height: 4, background: rainbow }} />
        <div style={{ ...container, padding: '13px 28px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Logo />
          <nav style={{ display: 'flex', gap: 18, marginInlineStart: 'auto', alignItems: 'center', fontSize: 15, fontWeight: 500, flexWrap: 'wrap' }}>
            <a href="#how">{T('How it works', 'كيف نعمل')}</a>
            <a href="#included">{T("What's included", 'ماذا نقدّم')}</a>
            <a href="#who">{T("Who it's for", 'لمن البرنامج')}</a>
            <a href="#packages">{T('Packages', 'الباقات')}</a>
            <a href="#faq">{T('FAQ', 'الأسئلة الشائعة')}</a>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={toggleLang}
              style={{ background: 'none', border: `1px solid ${C.blue}`, color: C.blue, borderRadius: 999, padding: '7px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {en ? 'العربية' : 'English'}
            </button>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>
              {T('Sign in', 'تسجيل الدخول')}
            </Link>
            <a href="#assess" className="si-btn-primary" style={{ padding: '9px 22px', fontSize: 14 }}>
              {T('Request assessment', 'اطلب التقييم')}
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 580, display: 'flex', alignItems: 'center', overflow: 'hidden', background: C.navy }}>
        <img src="/landing/complex-desks.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(24,32,79,0.95) 0%, rgba(43,62,143,0.85) 52%, rgba(13,93,166,0.45) 100%)', pointerEvents: 'none' }} />
        <div style={{ ...container, position: 'relative', padding: '90px 28px 110px', width: '100%' }}>
          <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.cyan }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.green }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.amber }} />
              </div>
              <div style={{ color: C.cyan, fontWeight: 600, fontSize: 14.5, letterSpacing: 1 }}>
                {T('STEPIN SAUDI — SOFT LANDING', 'ستيب إن السعودية — الهبوط الآمن')}
              </div>
            </div>
            <h1 style={{ margin: 0, color: '#ffffff', fontSize: 'clamp(30px, 4.2vw, 46px)', lineHeight: en ? 1.2 : 1.4, fontWeight: 700 }}>
              {T(
                "Land your company in Saudi Arabia — with a partner inside the Kingdom's SME authority.",
                'انطلق بشركتك في السوق السعودي — مع شريك داخل حاضنة الجهة الوطنية للمنشآت الصغيرة والمتوسطة.'
              )}
            </h1>
            <p style={{ margin: 0, color: '#D8E4F5', fontSize: 19, lineHeight: en ? 1.65 : 1.9, fontWeight: 300 }}>
              {T(
                "From licence to bank account, we sequence your Riyadh market entry into clear stages, from our base at Monsha'at's Startup Companies Complex in Diriyah.",
                'من الترخيص إلى الحساب البنكي، نُنظّم رحلة دخولك إلى سوق الرياض عبر مراحل واضحة، من مقرّنا في مجمع الشركات الناشئة بمنشآت في الدرعية.'
              )}
            </p>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <a href="#assess" className="si-btn-gold" style={{ padding: '14px 34px', fontSize: 17 }}>{heroCta}</a>
            </div>
          </div>
        </div>
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 70, pointerEvents: 'none' }}>
          <path d="M0,45 C 240,10 420,65 720,40 C 1020,15 1200,60 1440,30 L1440,70 L0,70 Z" fill="#ffffff" />
          <path d="M0,50 C 240,18 420,68 720,45 C 1020,22 1200,64 1440,36" fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.8} />
          <path d="M0,58 C 260,30 460,72 760,52 C 1040,34 1220,68 1440,44" fill="none" stroke={C.green} strokeWidth={3} opacity={0.7} />
        </svg>
      </section>

      {/* PARTNERSHIP STRIP */}
      <section style={{ background: '#ffffff' }}>
        <div style={{ ...container, padding: '26px 28px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, flexWrap: 'wrap' }}>
          <div style={{ color: C.gray, fontSize: 13.5, fontWeight: 500, letterSpacing: 0.5 }}>
            {T("A partnership between Wadi Makkah and Startup Hub by Monsha'at", 'شراكة بين وادي مكة ومجمع الشركات الناشئة من منشآت')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <img src="/landing/wadi-makkah.png" alt="Wadi Makkah Company For Technology" style={{ height: 52 }} />
            <div style={{ width: 1, height: 34, background: C.line }} />
            <img src="/landing/startup-hub.png" alt="Startup Hub — Monsha'at" style={{ height: 40 }} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#ffffff', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ ...container, padding: '34px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
          {stats.map((s) => (
            <div key={s.t} style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'center', alignItems: 'center' }}>
              <div dir="ltr" style={{ color: C.blue, fontSize: 34, fontWeight: 700 }}>{s.n}</div>
              <div style={{ width: 28, height: 3, borderRadius: 2, background: s.c }} />
              <div style={{ color: C.gray, fontSize: 14.5, lineHeight: 1.5 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ background: '#F4F7FB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '76px 28px', display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: C.navy, fontSize: 32, fontWeight: 700 }}>
            {T('You can see the opportunity. The maze is what stops you.', 'الفرصة واضحة أمامك. التعقيد هو ما يوقفك.')}
          </h2>
          <p style={{ margin: 0, color: C.ink, fontSize: 18, lineHeight: en ? 1.75 : 2, fontWeight: 300 }}>
            {T(
              "Saudi Arabia took 45% of all MENA venture capital in 2025, the most active market in the region. What stops most founders isn't ambition — it's the maze: which licence, in what order, attested how, and the bank account everyone warns you about. You don't need another consultant's brochure. You need a partner who has walked the path and will sequence it with you.",
              'استحوذت السعودية على ٤٥٪ من إجمالي رأس المال الجريء في منطقة الشرق الأوسط وشمال إفريقيا في عام ٢٠٢٥، لتكون السوق الأكثر نشاطًا في المنطقة. ما يوقف معظم روّاد الأعمال ليس الطموح، بل التعقيد: أيّ ترخيص، وبأيّ ترتيب، وكيف يُصدّق، ثم الحساب البنكي الذي يحذّرك منه الجميع. أنت لا تحتاج إلى كتيّب استشاري آخر، بل إلى شريك سار الطريق وينظّمه معك خطوة بخطوة.'
            )}
          </p>
        </div>
      </section>

      {/* SIX STAGES */}
      <section id="how" style={{ background: '#ffffff' }}>
        <div style={{ ...container, padding: '80px 28px', display: 'flex', flexDirection: 'column', gap: 48 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ margin: 0, color: C.navy, fontSize: 34, fontWeight: 700 }}>
              {T('How it works — six clear stages', 'كيف نعمل — ست مراحل واضحة')}
            </h2>
            <p style={{ margin: 0, color: C.gray, fontSize: 17, fontWeight: 300 }}>
              {T(
                'We do what we can directly, connect you to accredited partners working under published SLAs, and tell you plainly what only government can do.',
                'ننفّذ ما نستطيع مباشرة، ونربطك بشركاء معتمدين يعملون وفق اتفاقيات مستوى خدمة معلنة، ونوضّح لك بصراحة ما تختص به الجهات الحكومية وحدها.'
              )}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, alignItems: 'stretch' }}>
            {stages.map((st) => (
              <div key={st.n} style={{ background: '#ffffff', border: `1px solid ${C.line}`, borderTop: `4px solid ${st.c}`, borderRadius: 14, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 2px 10px rgba(43,62,143,0.05)' }}>
                <div dir="ltr" style={{ width: 40, height: 40, borderRadius: '50%', background: st.c, color: '#ffffff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{st.n}</div>
                <div style={{ color: C.navy, fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>{st.title}</div>
                <div style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.65, fontWeight: 300, flex: 1 }}>{st.desc}</div>
                <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: st.c, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5 }}>{st.govLabel}</div>
                  <div style={{ color: C.gray, fontSize: 13, lineHeight: 1.5 }}>{st.gov}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, textAlign: 'center', color: C.gray, fontSize: 14, fontWeight: 300 }}>
            {T(
              'All durations are indicative external benchmarks, never commitments. Full operational readiness is benchmarked externally at roughly 8–14 weeks.',
              'جميع المدد مؤشرات استرشادية من مصادر خارجية وليست التزامات. الجاهزية التشغيلية الكاملة تُقدَّر خارجيًا بنحو ٨–١٤ أسبوعًا.'
            )}
          </p>
        </div>
      </section>

      {/* INCLUSIONS */}
      <section id="included" style={{ background: C.navy }}>
        <div style={{ ...container, padding: '80px 28px', display: 'flex', flexDirection: 'column', gap: 44 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: 34, fontWeight: 700 }}>
              {T("What's included — with no ambiguity", 'ماذا نقدّم — بلا أي غموض')}
            </h2>
            <p style={{ margin: 0, color: '#A9BEE0', fontSize: 17, fontWeight: 300 }}>
              {T('Every item sits in exactly one column. That clarity is the service.', 'كل بند في عمود واحد فقط. هذا الوضوح هو جوهر الخدمة.')}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
            {inclCols.map((col) => (
              <div key={col.header} style={{ background: '#ffffff', borderRadius: 14, padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ width: 34, height: 5, borderRadius: 3, background: col.bar }} />
                  <div style={{ color: C.navy, fontSize: 19, fontWeight: 600, lineHeight: 1.4 }}>{col.header}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.items.map((it) => (
                    <div key={it} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: col.bar, marginTop: 7, flexShrink: 0 }} />
                      <div style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.6, fontWeight: 300 }}>{it}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section id="who" style={{ background: '#ffffff' }}>
        <div style={{ ...container, padding: '80px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 56, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ margin: 0, color: C.navy, fontSize: 32, fontWeight: 700 }}>
              {T("Who it's for", 'لمن هذا البرنامج')}
            </h2>
            <p style={{ margin: 0, color: C.ink, fontSize: 17, lineHeight: en ? 1.75 : 2, fontWeight: 300 }}>
              {T(
                'Built for foreign-founded startups and scale-ups (pre-seed to Series B), established SMEs, and corporate innovation teams entering Riyadh. Strongest fit: tech and innovation-led ventures eligible for the MISA Entrepreneur Licence, and companies from our priority source markets — the GCC, wider MENA, Türkiye, Pakistan, India, China, Southeast Asia, and Europe/UK.',
                'مُصمّم للشركات الناشئة والنامية ذات التأسيس الأجنبي (من مرحلة ما قبل التأسيس حتى الجولة «ب»)، والمنشآت الصغيرة والمتوسطة القائمة، وفرق الابتكار المؤسسي الراغبة في دخول الرياض. الأنسب: المشاريع التقنية والابتكارية المؤهلة لرخصة ريادي الأعمال من وزارة الاستثمار، والشركات القادمة من أسواقنا ذات الأولوية.'
              )}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {markets.map((m) => (
                <div key={m} style={{ border: `1px solid ${C.line}`, background: '#F4F7FB', color: C.navy, borderRadius: 999, padding: '7px 16px', fontSize: 13.5, fontWeight: 500 }}>{m}</div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', height: 380 }}>
            <img src="/landing/complex-founders.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }} />
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section style={{ background: '#F4F7FB' }}>
        <div style={{ ...container, padding: '80px 28px', display: 'flex', flexDirection: 'column', gap: 40 }}>
          <h2 style={{ margin: 0, textAlign: 'center', color: C.navy, fontSize: 32, fontWeight: 700 }}>
            {T('Why founders can trust the landing', 'لماذا يثق روّاد الأعمال بهذا الهبوط')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {proofs.map((p) => (
              <div key={p} style={{ background: '#ffffff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '26px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ color: C.green, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>✓</div>
                <div style={{ color: C.ink, fontSize: 15, lineHeight: 1.7, fontWeight: 400 }}>{p}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {['complex-wall', 'complex-lounge', 'complex-office'].map((img) => (
              <div key={img} style={{ position: 'relative', height: 260 }}>
                <img src={`/landing/${img}.jpg`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
              </div>
            ))}
          </div>
          <div style={{ background: '#ffffff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '34px 38px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ color: C.blue, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              {T('Partnership & governance', 'الشراكة والحوكمة')}
            </div>
            <p style={{ margin: 0, color: C.ink, fontSize: 16, lineHeight: en ? 1.8 : 2, fontWeight: 300 }}>
              {T(
                "This service is launched by Wadi Makkah in partnership with Startup Hub and Monsha'at. Wadi Makkah facilitates your market entry; it does not issue licences, visas, or approvals — these remain the sole authority of the relevant Saudi government bodies. We make a complex journey clear; we never promise a government outcome we do not control.",
                'يُطلَق هذا البرنامج من شركة وادي مكة بالشراكة مع مجمع الشركات الناشئة ومنشآت. تُيسّر وادي مكة دخولك إلى السوق، ولا تُصدر التراخيص أو التأشيرات أو الموافقات؛ فهذه من اختصاص الجهات الحكومية المعنية وحدها. نُبسّط رحلة معقّدة، ولا نَعِد بنتيجة حكومية لا نملك التحكّم فيها.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" style={{ background: '#ffffff' }}>
        <div style={{ ...container, padding: '80px 28px', display: 'flex', flexDirection: 'column', gap: 44 }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h2 style={{ margin: 0, color: C.navy, fontSize: 34, fontWeight: 700 }}>{T('Packages', 'الباقات')}</h2>
            <p style={{ margin: '0 auto', color: C.gray, fontSize: 17, fontWeight: 300, maxWidth: 720 }}>
              {T(
                "Tailored to your stage and sector. Pricing: [to be verified]. Request a proposal and we'll send indicative scope and cost within [response time — to be confirmed].",
                'تُصمَّم الباقات وفق مرحلتك وقطاعك. الأسعار: [يُستكمل بعد التحقق]. اطلب عرضًا وسنرسل النطاق والتكلفة الاسترشادية خلال [مدة الاستجابة — تُؤكَّد لاحقًا].'
              )}
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22, alignItems: 'stretch' }}>
            {tiers.map((t) => (
              <div key={t.name} style={{ border: `1px solid ${t.border}`, borderTop: `4px solid ${t.accent}`, borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 16, background: t.bg }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ color: t.accent, fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>{t.tag}</div>
                  <div style={{ color: C.navy, fontSize: 24, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ color: C.gray, fontSize: 14.5, fontWeight: 300 }}>{t.who}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                  {t.items.map((i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                      <div style={{ color: C.green, fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>✓</div>
                      <div style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.6, fontWeight: 300 }}>{i}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ color: C.gray, fontSize: 13 }}>
                    {t.durLabel} <span dir="ltr">{t.dur}</span>
                  </div>
                  <div style={{ color: C.navy, fontSize: 17, fontWeight: 600 }}>{t.price}</div>
                </div>
                <a href="#assess" className="si-btn-primary" style={{ textAlign: 'center', padding: '11px 20px', fontSize: 15 }}>
                  {T('Request a proposal', 'اطلب عرضًا')}
                </a>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, textAlign: 'center', color: C.gray, fontSize: 14, fontWeight: 300 }}>
            {T(
              'All prices are visible placeholders pending operator confirmation — never estimates.',
              'جميع الأسعار حقول ظاهرة بانتظار تأكيد المشغّل — وليست تقديرات.'
            )}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: '#F4F7FB' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 28px', display: 'flex', flexDirection: 'column', gap: 36 }}>
          <h2 style={{ margin: 0, textAlign: 'center', color: C.navy, fontSize: 34, fontWeight: 700 }}>
            {T('Frequently asked questions', 'الأسئلة الشائعة')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqs.map((f) => (
              <details key={f.q} style={{ background: '#ffffff', border: `1px solid ${C.line}`, borderRadius: 12, padding: '0 24px' }}>
                <summary style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 0', color: C.navy, fontSize: 16.5, fontWeight: 600, lineHeight: 1.5 }}>
                  <span style={{ flex: 1 }}>{f.q}</span>
                  <span className="faq-chev" style={{ color: C.cyan, fontSize: 22, fontWeight: 400, flexShrink: 0 }}>+</span>
                </summary>
                <div style={{ padding: '0 0 20px 0', color: C.ink, fontSize: 15, lineHeight: en ? 1.75 : 2, fontWeight: 300 }}>{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + FORM */}
      <section id="assess" style={{ position: 'relative', background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`, overflow: 'hidden' }}>
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 90, opacity: 0.25, pointerEvents: 'none' }}>
          <path d="M0,55 C 240,15 420,80 720,50 C 1020,20 1200,75 1440,38" fill="none" stroke={C.cyan} strokeWidth={4} />
          <path d="M0,70 C 260,38 460,88 760,62 C 1040,42 1220,82 1440,54" fill="none" stroke={C.green} strokeWidth={4} />
          <path d="M0,42 C 220,8 440,62 740,38 C 1030,14 1210,58 1440,24" fill="none" stroke={C.amber} strokeWidth={4} />
        </svg>
        <div style={{ ...container, position: 'relative', padding: '84px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 60, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: 36, fontWeight: 700, lineHeight: en ? 1.25 : 1.4 }}>
              {T('One clear next step.', 'خطوة واحدة واضحة.')}
            </h2>
            <p style={{ margin: 0, color: '#D8E4F5', fontSize: 18, lineHeight: en ? 1.7 : 2, fontWeight: 300 }}>
              {T(
                "Tell us about your company and we'll map your entry. We'll respond with an eligibility read and a personalised entry map — with indicative scope and cost within [response time — to be confirmed].",
                'أخبرنا عن شركتك ونرسم لك مسار دخولك. سنرد عليك بتقييم الأهلية وخريطة دخول مخصصة — مع النطاق والتكلفة الاسترشادية خلال [مدة الاستجابة — تُؤكَّد لاحقًا].'
              )}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.green, fontSize: 14, fontWeight: 500 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green }} />
              <span>{T("Your data is handled in line with Saudi Arabia's PDPL.", 'تُعالَج بياناتك وفق نظام حماية البيانات الشخصية في المملكة.')}</span>
            </div>
          </div>
          {submitted ? (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '56px 40px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.green, color: '#ffffff', fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
              <div style={{ color: C.navy, fontSize: 22, fontWeight: 700 }}>
                {T('Thank you — we have your enquiry.', 'شكرًا لك — استلمنا طلبك.')}
              </div>
              <div style={{ color: C.gray, fontSize: 15.5, lineHeight: 1.7, fontWeight: 300, maxWidth: 420 }}>
                {T(
                  'Our intake team will review your company and respond with an eligibility read and next steps within [response time — to be confirmed].',
                  'سيراجع فريقنا طلبك ويرد عليك بتقييم الأهلية والخطوات التالية خلال [مدة الاستجابة — تُؤكَّد لاحقًا].'
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '36px 34px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ color: C.navy, fontSize: 20, fontWeight: 700 }}>{heroCta}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                {formFields.map((ff) => (
                  <label key={ff.label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <span style={{ color: C.gray, fontSize: 12.5, fontWeight: 600 }}>{ff.label}</span>
                    <input
                      type="text"
                      placeholder={ff.ph}
                      style={{ border: `1px solid ${C.line}`, borderRadius: 9, padding: '11px 13px', fontSize: 14.5, color: C.ink, outlineColor: C.blue, background: '#F8FAFC' }}
                    />
                  </label>
                ))}
                <label style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: '1 / -1' }}>
                  <span style={{ color: C.gray, fontSize: 12.5, fontWeight: 600 }}>{T('Stage', 'المرحلة')}</span>
                  <select style={{ border: `1px solid ${C.line}`, borderRadius: 9, padding: '11px 13px', fontSize: 14.5, color: C.ink, background: '#F8FAFC' }}>
                    {stageOptions.map((so) => (
                      <option key={so}>{so}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', color: C.gray, fontSize: 12.5, lineHeight: 1.6, fontWeight: 300 }}>
                <input type="checkbox" style={{ marginTop: 3, accentColor: C.blue }} />
                <span>
                  {T(
                    'I consent to my data being processed to assess this enquiry, in line with the PDPL. We collect no financials or IDs at this stage.',
                    'أوافق على معالجة بياناتي لتقييم هذا الطلب وفق نظام حماية البيانات الشخصية. لا نجمع بيانات مالية أو هويات في هذه المرحلة.'
                  )}
                </span>
              </label>
              <button onClick={() => setSubmitted(true)} className="si-btn-gold" style={{ padding: '14px 30px', fontSize: 16 }}>
                {heroCta}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#ffffff', borderTop: `1px solid ${C.line}` }}>
        <div style={{ ...container, padding: '44px 28px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
            <Logo size={24} />
            <div style={{ width: 1, height: 36, background: C.line }} />
            <img src="/landing/wadi-makkah.png" alt="Wadi Makkah Company For Technology" style={{ height: 50 }} />
            <div style={{ width: 1, height: 36, background: C.line }} />
            <img src="/landing/startup-hub.png" alt="Startup Hub — Monsha'at" style={{ height: 40 }} />
            <div dir="ltr" style={{ marginInlineStart: 'auto', color: C.blue, fontSize: 15, fontWeight: 600 }}>StepinSaudi.com</div>
          </div>
          <p style={{ margin: 0, color: C.gray, fontSize: 13, lineHeight: 1.8, fontWeight: 300, maxWidth: 1000 }}>
            {T(
              "Wadi Makkah facilitates market entry and does not guarantee any government licence, visa, residency, approval, or timeline. All fees, timelines, and entitlements are set by the relevant authorities and subject to change. Personal data is handled in line with Saudi Arabia's PDPL.",
              'تُيسّر شركة وادي مكة دخول السوق ولا تضمن أيّ ترخيص أو تأشيرة أو إقامة أو موافقة حكومية أو مدة زمنية. تُحدَّد جميع الرسوم والمدد والمزايا من الجهات المختصة وقابلة للتغيير. تُعالَج البيانات الشخصية وفق نظام حماية البيانات الشخصية في المملكة.'
            )}
          </p>
          <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 18, display: 'flex', justifyContent: 'space-between', gap: 16, color: '#A3A3A5', fontSize: 12.5, flexWrap: 'wrap' }}>
            <span>{T('© 2026 StepIn Saudi. All rights reserved.', '© ٢٠٢٦ ستيب إن السعودية. جميع الحقوق محفوظة.')}</span>
            <span>{T("Startup Companies Complex, Monsha'at — Diriyah, Riyadh, Saudi Arabia", 'مجمع الشركات الناشئة منشآت — الدرعية، الرياض، المملكة العربية السعودية')}</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: rainbow }} />
        </div>
      </footer>
    </div>
  );
}
