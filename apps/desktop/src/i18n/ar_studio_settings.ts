// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const arStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: 'ابحث في الإعدادات',
  pages: {
    general: {
      title: 'عام',
      hero: 'اللغة وبدء التشغيل والتلميحات وسلوك النافذة.'
    },
    appearance: {
      title: 'المظهر',
      hero: 'الألوان والسمات وزجاج النافذة والخطوط والحيوانات الأليفة.'
    },
    chat: {
      title: 'المحادثة',
      hero: 'أسلوب الردود، وطريقة عرض التفكير واستدعاءات الأدوات والرسائل.'
    },
    notifications: {
      title: 'الإشعارات',
      hero: 'ما الذي يحق له مقاطعتك، والصوت عند انتهاء العمل.'
    },
    keyboard: {
      title: 'لوحة المفاتيح والاختصارات',
      hero: 'الاختصارات والسؤال السريع وإيماءة HUD والتقاط النافذة.'
    },
    models: {
      title: 'النماذج',
      hero: 'النموذج الافتراضي والنماذج الاحتياطية والنماذج المساعدة للمهام في الخلفية.'
    },
    providers: {
      title: 'الحسابات والمزودون',
      hero: 'الحسابات المسجلة ومفاتيح API ونقاط النهاية المخصصة والنماذج المحلية.'
    },
    memory: {
      title: 'الذاكرة والسياق',
      hero: 'ما الذي يتذكره Hermes ومقداره، وكيف تُضغط المحادثات الطويلة.'
    },
    voice: {
      title: 'الصوت',
      hero: 'المحادثة الصوتية وتحويل الكلام إلى نص والقراءة بصوت عالٍ وكلمة التنبيه.'
    },
    workspace: {
      title: 'مساحة العمل',
      hero: 'مجلدات المشاريع ومكان تشغيل الأوامر ونقاط الحفظ للملفات.'
    },
    safety: {
      title: 'الأمان والخصوصية',
      hero: 'الموافقة على الأوامر والخصوصية والمتصفح والوصول إلى الشبكات الخاصة.'
    },
    passwords: {
      title: 'كلمات المرور وتسجيلات الدخول',
      hero: 'بيانات الاعتماد التي يستخدمها Hermes عند تسجيل الدخول إلى المواقع نيابةً عنك.'
    },
    tools: {
      title: 'الأدوات والمفاتيح',
      hero: 'مفاتيح API لخدمات الأدوات ومتغيرات بيئة الخادم.'
    },
    gateways: {
      title: 'البوابات والاتصالات',
      hero: 'نسخة Hermes التي تتصل بها هذه النافذة، واتصالاتك المحفوظة.'
    },
    sessions: {
      title: 'الجلسات والأرشيف',
      hero: 'الأرشفة التلقائية والجلسات المؤرشفة.'
    },
    plugins: {
      title: 'الإضافات',
      hero: page => `إعدادات الإضافات المثبتة. يتم التثبيت والتفعيل من «${page} › الإضافات».`
    },
    billing: {
      title: 'الفوترة',
      hero: 'الرصيد والخطة وإعادة الشحن التلقائية وحدود الإنفاق.'
    },
    advanced: {
      title: 'متقدم',
      hero: 'خطوات الوكيل وواجهة الطرفية الخلفية والوكلاء الفرعيون وحدود المخرجات. لمن يعرف Hermes جيدًا.'
    },
    about: {
      title: 'حول Hermes',
      hero: 'الإصدار والتحديثات والنسخ الاحتياطي للإعدادات وإلغاء التثبيت.'
    }
  },
  window: {
    navLabel: 'فئات الإعدادات',
    noResults: query => `لا نتائج لـ «${query}»`,
    categoryResult: 'فئة',
    onlyThisMac: 'هذا الـ Mac فقط',
    onlyThisDevice: 'هذا الجهاز فقط',
    appliesToProfile: profile => `تنطبق على «${profile}»`,
    appliesTo: 'تنطبق على',
    scopeMenuTitle: 'تنطبق هذه الإعدادات على',
    searchResults: 'نتائج البحث',
    pageMenu: 'صفحة الإعدادات'
  },
  sections: {
    general: {
      language: 'اللغة وبدء التشغيل',
      tips: 'التلميحات والدروس',
      system: 'النافذة والنظام'
    },
    appearance: {
      look: 'المظهر',
      theme: 'السمات',
      themeNote: 'تُحفظ السمات لكل ملف تعريف. ويمكنك أيضًا تثبيت سمة مباشرةً من متجر VS Code.',
      window: 'النافذة',
      typography: 'الخطوط والتحجيم',
      pet: 'الحيوان الأليف'
    },
    chat: {
      replies: 'الردود',
      messages: 'الرسائل',
      media: 'المحتوى المضمّن والمرفقات'
    },
    notifications: {
      alerts: 'تنبيهات سطح المكتب',
      sounds: 'الصوت واللمس'
    },
    keyboard: {
      shortcuts: 'الاختصارات',
      shortcutsNote: 'انقر على مجموعة مفاتيح لتغييرها. يظهر التعارض في الصف نفسه.',
      quickAsk: 'السؤال السريع',
      hud: 'HUD والتقاط النافذة'
    },
    models: {
      main: 'النموذج الرئيسي',
      fallbacks: 'النماذج الاحتياطية',
      fallbacksNote: 'تُجرَّب بالترتيب عندما يكون النموذج الرئيسي غير متاح أو ينفد رصيده.',
      auxiliary: 'النماذج المساعدة',
      auxiliaryDisclosure: 'المهام في الخلفية (الرؤية، الضغط، توليد العناوين…)',
      moa: 'مزيج الوكلاء',
      moaDisclosure: 'تجيب عدة نماذج معًا ثم يجمع نموذج تجميع إجاباتها (‎/moa)'
    },
    providers: {
      accounts: 'الحسابات',
      apiKeys: 'مفاتيح API',
      endpoints: 'نقاط النهاية المخصصة',
      local: 'النماذج المحلية'
    },
    memory: {
      memory: 'الذاكرة طويلة المدى',
      context: 'السياق والضغط',
      contextDisclosure: 'تفاصيل الضغط',
      maintenance: 'الصيانة'
    },
    voice: {
      conversation: 'المحادثة الصوتية',
      stt: 'تحويل الكلام إلى نص',
      tts: 'القراءة بصوت عالٍ',
      wake: 'كلمة التنبيه'
    },
    workspace: {
      projects: 'المشاريع',
      execution: 'التنفيذ',
      checkpoints: 'نقاط الحفظ',
      checkpointsNote: 'تُحفظ تلقائيًا قبل كل تعديل على الملفات، فيمكنك «استعادة نقطة الحفظ» من الرسالة.'
    },
    safety: {
      approvals: 'الموافقة على الأوامر',
      privacy: 'الخصوصية',
      browser: 'المتصفح والشبكة'
    },
    passwords: {
      credentials: 'بيانات الاعتماد المحفوظة',
      credentialsNote: 'يستخدمها Hermes عند تسجيل الدخول أو ملء النماذج نيابةً عنك.',
      managers: 'مديرو كلمات المرور'
    },
    tools: {
      toolKeys: 'مفاتيح خدمات الأدوات',
      serverEnv: 'متغيرات بيئة الخادم',
      toolsets: 'مجموعات الأدوات'
    },
    gateways: {
      connection: 'تتصل هذه النافذة بـ',
      saved: 'الاتصالات المحفوظة',
      remoteUpdates: 'التحديثات عن بُعد'
    },
    sessions: {
      retention: 'الأرشفة والاحتفاظ',
      archived: 'الجلسات المؤرشفة'
    },
    plugins: {
      pages: 'إعدادات الإضافات',
      manage: 'التثبيت والتفعيل'
    },
    advanced: {
      agent: 'الوكيل',
      terminal: 'الواجهة الخلفية للطرفية',
      subagents: 'الوكلاء الفرعيون',
      output: 'حدود المخرجات',
      updates: 'التحديثات داخل التطبيق'
    },
    about: {
      updates: 'التحديثات',
      config: 'الإعدادات',
      diagnostics: 'التشخيص',
      uninstall: 'إلغاء التثبيت'
    }
  },
  rows: {
    modeLight: 'فاتح',
    modeDark: 'داكن',
    modeAuto: 'تلقائي',
    modeGroup: 'وضع الألوان',
    accentTitle: 'لون التمييز',
    accentDesc: 'لون الأزرار والعناصر المحددة والروابط',
    accentNous: 'أزرق',
    accentHermes: 'أزرق Hermes',
    accentViolet: 'بنفسجي',
    accentPink: 'وردي',
    accentRed: 'أحمر',
    accentOrange: 'برتقالي',
    accentGreen: 'أخضر',
    accentMono: 'جرافيت',
    thinkingTitle: 'التفكير',
    thinkingDesc: 'كيف يظهر استدلال النموذج في الردود',
    thinkingShow: 'إظهار',
    thinkingCollapse: 'مطوي',
    thinkingHide: 'مخفي',
    timestampsTitle: 'إظهار الطوابع الزمنية',
    hapticsTitle: 'الاستجابة اللمسية',
    hapticsDesc: 'إشارات لمسية عند السحب وعند انتهاء العمل. يؤدي إيقافها أيضًا إلى كتم صوت الإكمال.',
    wakeTitle: 'تفعيل كلمة التنبيه',
    wakeDesc: 'يستمع في الخلفية ويبدأ محادثة صوتية عند سماع العبارة',
    wakePhrase: 'عبارة التنبيه',
    memoryOpenTitle: 'العرض والتعديل',
    memoryOpenDesc: 'تصفّح الرسم البياني والقائمة في صفحة الذاكرة',
    memoryOpenAction: 'فتح الذاكرة',
    resetMemoryTitle: 'إعادة تعيين الذاكرة',
    resetMemoryDesc: 'يمسح MEMORY.md. لا يمكن التراجع عن ذلك.',
    resetProfileTitle: 'إعادة تعيين ملف المستخدم',
    resetProfileDesc: 'يمسح USER.md.',
    resetAction: 'إعادة تعيين…',
    toolsetsTitle: 'تشغيل مجموعات الأدوات أو إيقافها',
    toolsetsDesc: page => `تُدار من «${page} › الأدوات».`,
    openAction: 'فتح',
    pluginsManageDesc: 'التثبيت والتحديث والتفعيل وإلغاء التثبيت',
    pluginsManageAction: 'فتح الإضافات',
    exportDesc: 'يحفظ الملف hermes-config.json، دون المفاتيح.',
    exportAction: 'تصدير…',
    importAction: 'استيراد…',
    resetConfigDesc: 'يؤثر في ملف التعريف الحالي فقط، وتبقى إعدادات المظهر على هذا الجهاز كما هي.',
    resetConfigAction: 'استعادة…',
    diagnosticsTitle: 'إرسال بيانات التشخيص',
    diagnosticsDesc: 'يرفع سجلات منقّحة للدعم. تؤكد قبل الإرسال، وتنتهي صلاحية الرابط.',
    diagnosticsAction: 'إرسال…',
    logsTitle: 'مجلد السجلات',
    logsActionMac: 'إظهار في Finder',
    logsActionOther: 'فتح المجلد',
    localModelsDesc: 'نزّل نماذج مفتوحة وشغّلها على هذا الكمبيوتر.',
    localModelsAction: 'إدارة النماذج المحلية…',
    sendTestAction: 'إرسال',
    themeMarketplaceTitle: 'التثبيت من متجر VS Code',
    noThemesMatch: query => `لا توجد سمات مثبّتة تطابق «${query}».`,
    activateKey: 'تفعيل',
    activatingKey: 'جارٍ التفعيل…',
    apiKeyFallback: 'مفتاح API',
    pasteKeyPlaceholder: name => `الصق ${name}`,
    providerNeedsKey: provider => `يحتاج ${provider} إلى مفتاح API — اضبطه لتتمكن من اختيار نموذج.`,
    providerBrowserSignIn: provider => `يسجّل ${provider} الدخول عبر متصفحك — ويتولى Hermes الخطوات نيابةً عنك.`,
    addCredentialTitle: 'إضافة بيانات اعتماد',
    addCredentialDesc: 'تسجيل دخول أو بطاقة دفع أو عنوان',
    addCredentialAction: 'إضافة…',
    resetShortcutsAction: 'استعادة كل الإعدادات الافتراضية'
  }
}
