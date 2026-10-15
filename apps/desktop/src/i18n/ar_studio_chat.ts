// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const arStudioChat: StudioChatTranslations = {
  contextUsage: 'استخدام السياق',
  tray: {
    label: 'النشاط',
    hide: 'إخفاء النشاط',
    show: count => `إظهار النشاط (${count})`,
    approval: count => (count > 1 ? `يلزم الموافقة · ${count}` : 'يلزم الموافقة'),
    approvalHint: 'الانتقال إلى الأمر الذي ينتظر الموافقة',
    needsInput: 'بانتظار اختيارك',
    needsInputHint: 'الانتقال إلى السؤال',
    previews: count => `المعاينات: ${count}`,
    more: 'المزيد',
    close: 'إغلاق',
    titles: {
      background: 'العمليات في الخلفية',
      preview: 'روابط المعاينة',
      previousTodo: 'المهام السابقة',
      queue: 'قائمة الانتظار',
      subagent: 'الوكلاء الفرعيون',
      todo: 'المهام'
    },
    todoCaption: 'يحدّثها Hermes خلال هذه الجولة',
    queueCaption: 'تُرسل بالترتيب بعد هذه الجولة',
    git: {
      hint: 'الفرع والتغييرات وأشجار العمل',
      reviewChanges: 'مراجعة التغييرات',
      openPullRequest: number => `فتح طلب السحب #${number}`,
      copyWorktreePath: 'نسخ مسار شجرة العمل'
    }
  }
}
