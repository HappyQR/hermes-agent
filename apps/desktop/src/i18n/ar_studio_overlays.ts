// Hermes Studio copy (overlays) — fork-owned so upstream locale merges stay clean.
import { arStudioOverlaysAux } from './ar_studio_overlays_aux'
import type { StudioOverlaysTranslations } from './types_studio_overlays'

export const arStudioOverlays: StudioOverlaysTranslations = {
  quickAsk: 'سؤال سريع',
  aux: arStudioOverlaysAux,
  shortcuts: {
    title: 'اختصارات لوحة المفاتيح',
    subtitle: place => `يمكنك تغييرها من ${place}`,
    close: 'إغلاق اختصارات لوحة المفاتيح',
    search: 'ابحث في الاختصارات',
    searchPlaceholder: 'بحث',
    editInSettings: 'التعديل في الإعدادات',
    noResults: query => `لا توجد اختصارات تطابق «${query}»`,
    slotProfiles: (first, last) => `التبديل إلى ملف التعريف ${first}–${last}`,
    slotTabs: (first, last) => `التبديل إلى علامة التبويب ${first}–${last}`,
    slotSessions: (first, last) => `التبديل إلى الجلسة الحديثة ${first}–${last}`
  },
  system: {
    title: 'حالة النظام',
    subtitle: 'الجلسات وصحة النظام والاستخدام والصيانة',
    close: 'إغلاق حالة النظام',
    sectionsLabel: 'القسم',
    statGateway: 'البوابة',
    running: 'قيد التشغيل',
    stopped: 'متوقفة',
    statVersion: 'الإصدار',
    statActiveSessions: 'الجلسات النشطة',
    statPlatforms: 'منصات المراسلة',
    platformsConnected: count => `${count} متصلة`,
    platformsNone: 'لا توجد منصة متصلة',
    restartDesc: 'ستعيد منصات المراسلة المتصلة الاتصال',
    restart: 'إعادة التشغيل…',
    checkForUpdates: 'التحقق من التحديثات',
    periodLabel: 'النطاق الزمني',
    cacheHit: percent => `نسبة إصابة الذاكرة المؤقتة ${percent}%`,
    dayDetail: (day, input, output) => `${day} · الإدخال ${input} · الإخراج ${output}`,
    searchSessions: 'ابحث في كل الجلسات بالعنوان أو المعرّف',
    tokens: count => `${count} رمز`,
    run: 'تشغيل',
    manageMemory: 'إدارة…'
  },
  palette: {
    placeholder: 'ابحث في الجلسات والصفحات والأوامر والإعدادات',
    scopesLabel: 'النطاق',
    scopes: {
      all: 'الكل',
      sessions: 'الجلسات والمشاريع',
      pages: 'الصفحات',
      actions: 'الأوامر',
      settings: 'الإعدادات'
    },
    recent: 'الأحدث',
    searchContent: query => `ابحث في محتوى كل الجلسات: «${query}»`,
    searchContentDetail: 'بحث في النص الكامل',
    contentGroup: 'في محتوى الجلسات',
    footerSelect: 'تحديد',
    footerOpen: 'فتح',
    footerScope: 'تبديل النطاق',
    footerPaste: 'الصق معرّف جلسة للانتقال إليها مباشرة',
    on: 'تشغيل',
    off: 'إيقاف',
    layoutEditMode: 'تبديل وضع تحرير التخطيط',
    reloadPlugins: 'إعادة تحميل إضافات سطح المكتب',
    resetLayout: 'إعادة تعيين التخطيط'
  },
  profiles: {
    subtitle: 'لكل ملف تعريف نموذجه ومهاراته وذاكرته وشخصيته (SOUL.md) الخاصة.',
    remote: 'بعيد',
    changeModel: 'تغيير…',
    skillsEnabled: count => `${count} مفعّلة`,
    manage: 'إدارة',
    soulHint: 'الشخصية والتعليمات الدائمة',
    soulUnsaved: combo => `غير محفوظ · ${combo} للحفظ`,
    exportNote: 'لا تتضمن ملفات التعريف المصدّرة أي مفاتيح',
    importShort: 'استيراد…'
  },
  updates: {
    currentVersion: (version, channel) => `الحالي ${version} · ${channel}`
  }
}
