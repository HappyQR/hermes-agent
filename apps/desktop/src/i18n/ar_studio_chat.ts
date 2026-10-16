// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

type ArForms = readonly [one: string, two: string, few: string, many: string, other: string]

// صيغ العدد في العربية: واحد، مثنى، 3–10، 11–99، وما سواها (100، 101…).
const arCount = (count: number, [one, two, few, many, other]: ArForms) => {
  const tail = count % 100

  if (count === 1) {
    return one
  }

  if (count === 2) {
    return two
  }

  if (tail >= 3 && tail <= 10) {
    return `${count} ${few}`
  }

  return tail >= 11 && tail <= 99 ? `${count} ${many}` : `${count} ${other}`
}

// ملخص تشغيل الأدوات: «تم استكشاف 3 ملفات»، «جارٍ تشغيل npm test».
const arRun = (definite: string, named: string, counted: string, forms: ArForms) => ({
  present: `جارٍ ${definite}`,
  named: (target: string, live: boolean) => `${live ? 'جارٍ' : 'تم'} ${named} ${target}`,
  counted: (count: number, live: boolean) => `${live ? 'جارٍ' : 'تم'} ${counted} ${arCount(count, forms)}`
})

const AR_FILE: ArForms = ['ملف واحد', 'ملفين', 'ملفات', 'ملفًا', 'ملف']
const AR_PAGE: ArForms = ['صفحة واحدة', 'صفحتين', 'صفحات', 'صفحة', 'صفحة']

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
    voiceOptionsHint: 'انقر بزر الفأرة الأيمن لخيارات الصوت',
    voiceEngineHint: 'انقر بزر الفأرة الأيمن لاختيار المحرك',
    placeholderBusy: combo => `أضف سياقًا، أو اضغط ${combo} لإرساله في الجولة التالية`,
    placeholderHero: 'امنح Hermes مهمة — / للأوامر، @ للإشارة إلى الملفات'
  },
  empty: {
    greeting: {
      lateNight: 'الوقت متأخر',
      morning: 'صباح الخير',
      noon: 'طاب يومك',
      afternoon: 'طاب يومك',
      evening: 'مساء الخير'
    },
    startersLabel: 'بدايات سريعة',
    starters: {
      fixError: {
        title: 'إصلاح خطأ',
        description: 'الصق رسالة الخطأ وسأحدد السبب وأصلحه',
        prompt: 'ساعدني في فهم هذا الخطأ:'
      },
      organizeFolder: {
        title: 'تنظيم مجلد',
        description: 'أرشفة حسب النوع والتاريخ مع قائمة بما نُقل',
        prompt: 'نظّم ~/Downloads وضع الفواتير في مكان منفصل.'
      },
      schedule: {
        title: 'مهمة يومية مجدولة',
        description: 'مثل ملخص أخبار الذكاء الاصطناعي في 9 صباحًا إلى Telegram',
        prompt: 'كل صباح في الساعة 9، لخّص أخبار الذكاء الاصطناعي وأرسلها إلى Telegram.'
      },
      prototype: {
        title: 'نموذج أولي لصفحة ويب',
        description: 'صف الفكرة واحصل على صفحة قابلة للنقر',
        prompt: 'أنشئ نموذجًا أوليًا لصفحة ويب قابلة للنقر من أجل:'
      }
    },
    continueFrom: 'المتابعة من Claude Code أو Codex'
  },
  toolRun: {
    categories: {
      analyze: arRun('التحليل', 'تحليل', 'تحليل', ['صورة واحدة', 'صورتين', 'صور', 'صورة', 'صورة']),
      browse: arRun('الفتح', 'فتح', 'فتح', AR_PAGE),
      delegate: arRun('التفويض', 'تفويض', 'تفويض', ['مهمة واحدة', 'مهمتين', 'مهام', 'مهمة', 'مهمة']),
      edit: arRun('التعديل', 'تعديل', 'تعديل', AR_FILE),
      explore: arRun('الاستكشاف', 'استكشاف', 'استكشاف', AR_FILE),
      interact: arRun('التنفيذ', 'تنفيذ', 'تنفيذ', [
        'إجراء واحد في المتصفح',
        'إجراءين في المتصفح',
        'إجراءات في المتصفح',
        'إجراءً في المتصفح',
        'إجراء في المتصفح'
      ]),
      other: arRun('الاستخدام', 'استخدام', 'استخدام', ['أداة واحدة', 'أداتين', 'أدوات', 'أداة', 'أداة']),
      read: arRun('القراءة', 'قراءة', 'قراءة', AR_PAGE),
      run: arRun('التشغيل', 'تشغيل', 'تشغيل', ['أمر واحد', 'أمرين', 'أوامر', 'أمرًا', 'أمر']),
      search: arRun('البحث', 'البحث عن', 'إجراء', ['استعلام واحد', 'استعلامين', 'استعلامات', 'استعلامًا', 'استعلام'])
    },
    join: clauses => clauses.join('، '),
    moreCommands: (first, more) =>
      `${first} + ${arCount(more, ['أمر آخر', 'أمران آخران', 'أوامر أخرى', 'أمرًا آخر', 'أمر آخر'])}`
  },
  voice: {
    label: 'محادثة صوتية',
    doneSpeaking: 'انتهيت من الكلام'
  },
  transcript: {
    replyDuration: seconds => {
      const m = Math.floor(seconds / 60)
      const s = seconds % 60

      return m === 0 ? `${s} ث` : s === 0 ? `${m} د` : `${m} د ${s} ث`
    },
    searchResults: 'نتائج البحث',
    delegatedTask: 'مهمة مفوَّضة',
    delegateSpawned: count => `أنشأ ${count} من الوكلاء الفرعيين`,
    delegateRunning: count => `${count} قيد التشغيل`,
    delegateAllDone: 'اكتمل الكل',
    openAgents: 'عرض في المفتش',
    approvalTitle: 'هل تسمح لـ Hermes بتشغيل هذا الأمر؟',
    approvalTitleAction: 'هل تسمح لـ Hermes بتنفيذ هذا الإجراء؟',
    approvalMode: 'وضع الموافقة…',
    needsChoice: 'يحتاج إلى اختيارك',
    answered: 'تمت الإجابة',
    questions: count => `عدد الأسئلة: ${count}`,
    clarifyHint: 'اختر خيارًا، أو اكتب إجابتك',
    clarifyHintMulti: 'اختر كل ما ينطبق، أو اكتب إجابتك',
    recommended: 'موصى به',
    moreRecovery: 'خيارات استرداد أخرى',
    preparingReply: 'يُعدّ Hermes ردًا',
    timelineLabel: 'المخطط الزمني للمحادثة',
    editAndRerun: 'تعديل وإعادة التشغيل',
    editRerunNote: 'يُرسل من هنا — تُحذف الرسائل اللاحقة في هذه المحادثة',
    previousVersion: 'الإصدار السابق',
    nextVersion: 'الإصدار التالي',
    exportMarkdown: 'تصدير بتنسيق Markdown…',
    exportFileName: 'رد Hermes.md',
    exported: name => `تم حفظ ${name}`,
    exportFailed: 'تعذّر تصدير الرد'
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
