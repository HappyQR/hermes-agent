// Hermes Studio copy (overlays: aux windows, boot surfaces, toasts) — fork-owned.
import type { StudioOverlaysAuxTranslations } from './types_studio_overlays_aux'

export const arStudioOverlaysAux: StudioOverlaysAuxTranslations = {
  quickEntry: {
    placeholder: 'اسأل Hermes…',
    disconnected: 'غير متصل — افتح Hermes لإعادة الاتصال',
    sendTo: 'إرسال إلى',
    targetLabel: 'الجلسة الهدف',
    targetCurrent: 'المحادثة الحالية',
    targetNew: 'جلسة جديدة',
    send: 'إرسال',
    dismiss: 'إغلاق',
    summon: combo => `اضغط ${combo} في أي تطبيق`,
    deliveryFailed: 'تعذّر على Hermes إيصال الرسالة.'
  },
  wake: {
    listening: 'أستمع'
  },
  pet: {
    label: name => `الحيوان الأليف: ${name}`,
    messagePlaceholder: 'رسالة…',
    openInHermes: 'افتح في Hermes',
    lines: {
      run: [
        'أعمل…',
        'جارٍ التنفيذ…',
        'أحسب…',
        'أعدّل…',
        'أطبخ…',
        'في التفاصيل…',
        'أوصل الأسلاك…',
        'أتقدّم…',
        'منهمك…',
        'أطرق…'
      ],
      review: [
        'أفكر…',
        'أقرأ…',
        'أراجع…',
        'أتأمل…',
        'أربط النقاط…',
        'أقيّم…',
        'أتتبع…',
        'أتدبّر…',
        'أخطط…',
        'همم…'
      ],
      failed: [
        'تعثّرت',
        'أوه',
        'تعطّل شيء',
        'آه',
        'علقت'
      ],
      waiting: [
        'دورك',
        'كلّه لك',
        'الأمر إليك',
        'الكرة في ملعبك',
        'بانتظار أوامرك'
      ],
      idle: [
        'مرحبًا',
        'هل تحتاج شيئًا؟',
        'كل شيء هادئ',
        'في الانتظار',
        'وقت للاستراحة؟'
      ]
    }
  },
  boot: {
    connecting: 'جارٍ الاتصال بـ Hermes…',
    step: (current, total) => `الخطوة ${current} من ${total}`
  }
}
