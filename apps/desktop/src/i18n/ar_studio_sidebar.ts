// Hermes Studio copy (sidebar) — fork-owned so upstream locale merges stay clean.
import type { StudioSidebarTranslations } from './types_studio_sidebar'

export const arStudioSidebar: StudioSidebarTranslations = {
  search: 'بحث',
  searchAria: 'البحث في الجلسات والصفحات والأوامر',
  nav: {
    label: 'الصفحات',
    automations: 'الأتمتة',
    memory: 'الذاكرة',
    open: 'فتح',
    pendingPairing: count => `طلبات اقتران معلّقة: ${count}`,
    cronJobs: count => `المهام المجدولة: ${count}`,
    cronFailing: count => `مهام فاشلة: ${count}`
  },
  section: {
    expand: 'توسيع',
    collapse: 'طي',
    collapsedCount: count => `مخفي: ${count}`,
    expandGroups: 'توسيع كل المجموعات',
    collapseGroups: 'طي كل المجموعات'
  },
  projects: {
    newProject: 'مشروع جديد…',
    openFolder: 'فتح مجلد كمشروع…',
    newWorktree: 'شجرة عمل جديدة…',
    auto: 'تلقائي',
    actions: 'إجراءات المشروع',
    newSessionHere: 'جلسة جديدة في هذا المشروع',
    newSessionInLane: 'جلسة جديدة في هذا المسار',
    empty: 'لا توجد مشاريع بعد'
  },
  scope: {
    tip: 'تُعرض جلسات هذا المشروع فقط',
    clear: 'عرض كل الجلسات'
  },
  sessions: {
    viewOptions: 'خيارات العرض',
    viewOptionsTip: 'التجميع والفرز والتصفية',
    noMatches: 'لا توجد جلسات تطابق عوامل التصفية هذه.',
    clearFilters: 'مسح عوامل التصفية'
  },
  grouping: {
    label: 'التجميع',
    time: 'حسب الوقت',
    project: 'حسب المشروع',
    status: 'حسب الحالة',
    source: 'حسب المصدر',
    profile: 'حسب البوابة والملف الشخصي',
    none: 'بدون تجميع',
    noProject: 'بلا مشروع'
  },
  statusGroup: {
    needsInput: 'بانتظار إدخالك',
    working: 'قيد التشغيل',
    unread: 'غير مقروءة',
    draft: 'مسودات',
    done: 'مكتملة'
  },
  view: {
    reset: 'استعادة الإعدادات الافتراضية',
    sort: 'الفرز',
    show: 'عرض',
    time: 'الوقت',
    density: 'كثافة القائمة',
    compact: 'مضغوطة',
    comfortable: 'مريحة',
    detailed: 'مفصّلة',
    filters: 'عوامل التصفية',
    sources: 'المصادر',
    prStatus: 'حالة طلب الدمج',
    prAny: 'الكل',
    showArchived: 'عرض الجلسات المؤرشفة',
    moreFilters: 'مزيد من عوامل التصفية'
  },
  source: {
    desktop: 'سطح المكتب',
    cron: 'مهمة مجدولة',
    from: label => `من ${label}`
  },
  row: {
    yesterday: 'أمس'
  },
  menu: {
    clickHint: keys => `${keys} + نقرة`,
    openInNewWindow: 'فتح في نافذة جديدة',
    splitRight: 'يمين',
    splitDown: 'أسفل',
    splitLeft: 'يسار',
    splitUp: 'أعلى',
    color: 'اللون',
    copySessionId: 'نسخ معرّف الجلسة',
    branchFromHere: 'التفرع من هنا',
    export: 'تصدير',
    exportJson: 'JSON…',
    exportMarkdown: 'Markdown…',
    exportFailed: 'تعذّر تصدير الجلسة',
    newProject: 'مشروع جديد…',
    delete: 'حذف…'
  },
  footer: {
    updateAvailable: name => `يتوفر ${name}`,
    updateView: 'انقر للعرض',
    updateBehind: count => `متأخر بـ ${count} من الإيداعات · انقر للعرض`,
    updateApplying: 'جارٍ التحديث…',
    updateRestart: 'أعد التشغيل لإكمال التحديث',
    account: 'الملفات الشخصية والبوابات',
    ready: 'جاهزة',
    connecting: 'جارٍ الاتصال…',
    disconnected: 'انقطع الاتصال',
    unreachable: 'يتعذّر الوصول',
    remote: 'بعيد',
    thisDevice: 'هذا الجهاز',
    thisMac: 'جهاز Mac هذا',
    defaultSuffix: ' (افتراضي)',
    needsInputBadge: count => `بانتظار الإدخال: ${count}`,
    unreadBadge: count => `غير مقروءة: ${count}`,
    switchHere: 'التبديل إلى هذا الملف الشخصي',
    newProfile: 'ملف شخصي جديد…',
    gateway: 'البوابة',
    reconnect: 'إعادة الاتصال',
    recentActivity: 'النشاط الأخير…',
    connectGateway: 'ربط بوابة أخرى…',
    systemStatus: 'حالة النظام…',
    settings: 'الإعدادات…',
    shortcuts: 'اختصارات لوحة المفاتيح',
    checkUpdates: 'البحث عن تحديثات…',
    showRail: 'إظهار شريط الملفات الشخصية'
  }
}
