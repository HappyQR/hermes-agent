// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const arStudioChat: StudioChatTranslations = {
  contextUsage: 'استخدام السياق',
  composer: {
    addContext: 'إضافة سياق',
    addContextHint: 'إضافة ملفات أو صور أو روابط أو مقتطفات',
    popOut: 'فصل مربع الكتابة',
    dock: 'إرجاع مربع الكتابة',
    skills: 'المهارات…',
    autoApprove: 'موافقة تلقائية',
    autoApproveHint: 'الموافقات متوقفة — تُنفَّذ الأوامر دون سؤال',
    yoloHint: 'وضع YOLO مفعّل لهذه المحادثة — تُنفَّذ الأوامر دون سؤال',
    turnOffYolo: 'إيقاف YOLO لهذه المحادثة',
    contextUsagePercent: percent => `استخدام السياق ${percent}%`,
    cacheHit: value => `إصابات الذاكرة المؤقتة ${value}`,
    stats: {
      cacheHit: 'إصابات الذاكرة المؤقتة',
      throughput: 'معدل التوليد',
      throughputValue: value => `${value} رمز/ث`,
      turnTime: 'هذه الجولة',
      sessionCost: 'تكلفة الجلسة'
    },
    compress: 'ضغط السياق',
    compressIdleOnly: 'متاح عندما يكون Hermes غير مشغول',
    usageDetails: 'تفاصيل الاستخدام',
    effortOff: 'متوقف',
    moreSendOptions: 'خيارات إرسال أخرى',
    steerHint: 'بعد استدعاء الأداة التالي',
    redirectHint: 'يتوقف ثم يرسل',
    voiceOptionsHint: 'انقر بزر الفأرة الأيمن لخيارات الصوت',
    voiceEngineHint: 'انقر بزر الفأرة الأيمن لاختيار المحرك',
    placeholderBusy: combo => `أضف سياقًا، أو اضغط ${combo} لإرساله في الجولة التالية`,
    placeholderHero: 'امنح Hermes مهمة — / للأوامر، @ للإشارة إلى الملفات'
  },
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
