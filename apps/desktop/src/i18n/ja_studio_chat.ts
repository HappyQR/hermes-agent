// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

// ツール実行の要約：「ファイル 3 件を調査」「npm test を実行中」。
const jaRun = (verb: string, noun: string) => ({
  present: `${verb}中`,
  // A Latin-script target keeps a space before the particle; Japanese text does not.
  named: (target: string, live: boolean) =>
    `${target}${/[\x21-\x7e]$/.test(target) ? ' ' : ''}を${verb}${live ? '中' : ''}`,
  counted: (count: number, live: boolean) => `${noun} ${count} 件を${verb}${live ? '中' : ''}`
})

export const jaStudioChat: StudioChatTranslations = {
  contextUsage: 'コンテキスト使用量',
  composer: {
    addContext: 'コンテキストを追加',
    addContextHint: 'ファイル、画像、リンク、スニペットを追加',
    popOut: '入力欄を切り離す',
    dock: '入力欄を元に戻す',
    skills: 'スキル…',
    autoApprove: '自動承認',
    autoApproveHint: '承認はオフです。コマンドは確認なしで実行されます',
    yoloHint: 'このチャットは YOLO がオンです。コマンドは確認なしで実行されます',
    turnOffYolo: 'このチャットの YOLO をオフにする',
    contextUsagePercent: percent => `コンテキスト使用量 ${percent}%`,
    cacheHit: value => `キャッシュヒット ${value}`,
    stats: {
      cacheHit: 'キャッシュヒット',
      throughput: '生成速度',
      throughputValue: value => `${value} トークン/秒`,
      turnTime: 'このターン',
      sessionCost: 'セッションの費用'
    },
    compress: 'コンテキストを圧縮',
    compressIdleOnly: 'Hermes が待機中のときに使えます',
    usageDetails: '使用量の詳細',
    effortOff: 'オフ',
    moreSendOptions: 'その他の送信方法',
    steerHint: '次のツール呼び出しの後',
    redirectHint: '停止してから送信',
    voiceOptionsHint: '右クリックで音声オプション',
    voiceEngineHint: '右クリックでエンジンを選択',
    placeholderBusy: combo => `コンテキストを追加するか、${combo} で次のターンに予約`,
    placeholderHero: 'Hermes にタスクを — / でコマンド、@ でファイルを参照'
  },
  empty: {
    greeting: {
      lateNight: '夜遅くまでお疲れさまです',
      morning: 'おはようございます',
      noon: 'こんにちは',
      afternoon: 'こんにちは',
      evening: 'こんばんは'
    },
    startersLabel: 'クイックスタート',
    starters: {
      fixError: {
        title: 'エラーを直す',
        description: 'エラーメッセージを貼れば、原因を突き止めて修正します',
        prompt: 'このエラーを見てください：'
      },
      organizeFolder: {
        title: 'フォルダを整理する',
        description: '種類と日付で分類し、一覧を作ります',
        prompt: '~/Downloads を整理して、請求書は別にまとめてください。'
      },
      schedule: {
        title: '毎日決まった時間に',
        description: '例：朝 9 時に AI ニュースをまとめて Telegram に送る',
        prompt: '毎朝 9 時に AI ニュースをまとめて Telegram に送ってください。'
      },
      prototype: {
        title: 'Web ページを試作する',
        description: 'アイデアを伝えれば、クリックできるページに',
        prompt: '次の内容でクリックできる Web ページの試作を作ってください：'
      }
    },
    continueFrom: 'Claude Code や Codex から続ける'
  },
  toolRun: {
    categories: {
      analyze: jaRun('分析', '画像'),
      browse: jaRun('表示', 'ページ'),
      delegate: jaRun('委任', 'タスク'),
      edit: jaRun('編集', 'ファイル'),
      explore: jaRun('調査', 'ファイル'),
      interact: jaRun('実行', 'ブラウザ操作'),
      other: jaRun('使用', 'ツール'),
      read: jaRun('読み込み', 'ページ'),
      run: jaRun('実行', 'コマンド'),
      search: jaRun('検索', 'クエリ')
    },
    join: clauses => clauses.join('、'),
    moreCommands: (first, more) => `${first} ほか ${more} 件のコマンド`
  },
  voice: {
    label: '音声会話',
    doneSpeaking: '話し終えた'
  },
  transcript: {
    searchResults: '検索結果',
    delegatedTask: '委任したタスク',
    delegateSpawned: count => `${count} 個のサブエージェントを起動`,
    delegateRunning: count => `${count} 件実行中`,
    delegateAllDone: 'すべて完了',
    openAgents: 'インスペクタで表示',
    approvalTitle: 'Hermes にこのコマンドの実行を許可しますか？',
    approvalTitleAction: 'Hermes にこの操作を許可しますか？',
    approvalMode: '承認モード…',
    needsChoice: '選択が必要です',
    answered: '回答済み',
    questions: count => `質問 ${count} 件`,
    clarifyHint: '1 つ選ぶか、答えを入力してください',
    clarifyHintMulti: '当てはまるものをすべて選ぶか、答えを入力してください',
    recommended: 'おすすめ',
    moreRecovery: 'その他の復旧方法',
    preparingReply: 'Hermes が返信を準備しています',
    timelineLabel: '会話のタイムライン',
    editAndRerun: '編集して再実行',
    editRerunNote: 'ここから送信します。このチャットの以降のメッセージは削除されます',
    previousVersion: '前のバージョン',
    nextVersion: '次のバージョン',
    exportMarkdown: 'Markdown として書き出す…',
    exportFileName: 'Hermes の返信.md',
    exported: name => `${name} を保存しました`,
    exportFailed: '返信を書き出せませんでした'
  },
  tray: {
    label: 'アクティビティ',
    hide: 'アクティビティを隠す',
    show: count => `アクティビティを表示（${count}）`,
    approval: count => (count > 1 ? `承認待ち · ${count}` : '承認待ち'),
    approvalHint: '承認を待っているコマンドへ移動',
    needsInput: '選択を待っています',
    needsInputHint: '質問へ移動',
    previews: count => `プレビュー ${count}`,
    more: 'その他',
    close: '閉じる',
    titles: {
      background: 'バックグラウンドプロセス',
      preview: 'プレビューリンク',
      previousTodo: '以前のタスク',
      queue: 'キュー',
      subagent: 'サブエージェント',
      todo: 'タスク'
    },
    todoCaption: 'このターンの間は Hermes が更新します',
    queueCaption: 'このターンの後に順番に送信します',
    git: {
      hint: 'ブランチ、変更、ワークツリー',
      reviewChanges: '変更をレビュー',
      openPullRequest: number => `プルリクエスト #${number} を開く`,
      copyWorktreePath: 'ワークツリーのパスをコピー'
    }
  }
}
