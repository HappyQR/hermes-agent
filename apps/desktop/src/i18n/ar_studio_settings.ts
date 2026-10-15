// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
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
    scopeMenuTitle: 'تنطبق هذه الإعدادات على'
  }
}
