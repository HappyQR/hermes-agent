// Hermes Studio copy (settings) — fork-owned so upstream locale merges stay clean.
// Generated from one table (all 9 locales together); edit the table, not one file.
import type { StudioSettingsTranslations } from './types_studio_settings'

export const jaStudioSettings: StudioSettingsTranslations = {
  searchPlaceholder: '設定を検索',
  pages: {
    general: {
      title: '一般',
      hero: '言語、起動方法、ヒント、ウインドウの動作。'
    },
    appearance: {
      title: '外観',
      hero: 'カラー、テーマ、ウインドウのガラス、フォント、ペット。'
    },
    chat: {
      title: 'チャット',
      hero: '返信のスタイルと、思考過程・ツール呼び出し・メッセージの表示方法。'
    },
    notifications: {
      title: '通知',
      hero: 'どんなときに通知するか、作業完了時のサウンド。'
    },
    keyboard: {
      title: 'キーボードとショートカット',
      hero: 'ショートカット、クイック質問、HUD ジェスチャ、ウインドウのキャプチャ。'
    },
    models: {
      title: 'モデル',
      hero: 'デフォルトのモデル、予備のモデル、バックグラウンド処理用の補助モデル。'
    },
    providers: {
      title: 'アカウントとプロバイダー',
      hero: 'サインイン中のアカウント、API キー、カスタムエンドポイント、ローカルモデル。'
    },
    memory: {
      title: 'メモリとコンテキスト',
      hero: 'Hermes が何をどれだけ覚えるか、長い会話をどう圧縮するか。'
    },
    voice: {
      title: '音声',
      hero: '音声会話、音声入力、読み上げ、ウェイクワード。'
    },
    workspace: {
      title: 'ワークスペース',
      hero: 'プロジェクトフォルダ、コマンドの実行環境、ファイルのチェックポイント。'
    },
    safety: {
      title: '安全とプライバシー',
      hero: 'コマンドの承認、プライバシー、ブラウザとプライベートネットワークへのアクセス。'
    },
    passwords: {
      title: 'パスワードとログイン',
      hero: 'Hermes があなたの代わりにサイトへサインインするときの認証情報。'
    },
    tools: {
      title: 'ツールとキー',
      hero: 'ツールサービスの API キーとサーバーの環境変数。'
    },
    gateways: {
      title: 'ゲートウェイと接続',
      hero: 'このウインドウが接続する Hermes と、保存された接続。'
    },
    sessions: {
      title: 'セッションとアーカイブ',
      hero: '自動アーカイブとアーカイブ済みのセッション。'
    },
    plugins: {
      title: 'プラグイン',
      hero: page => `インストール済みプラグインの設定です。インストールと有効化は「${page} › プラグイン」で行います。`
    },
    billing: {
      title: '請求',
      hero: '残高、プラン、自動チャージ、利用上限。'
    },
    advanced: {
      title: '詳細設定',
      hero: 'エージェントのステップ数、ターミナルのバックエンド、サブエージェント、出力の上限。Hermes に詳しい方向け。'
    },
    about: {
      title: 'Hermes について',
      hero: 'バージョン、アップデート、設定のバックアップ、アンインストール。'
    }
  },
  window: {
    navLabel: '設定のカテゴリ',
    noResults: query => `「${query}」に一致する項目はありません`,
    categoryResult: 'カテゴリ',
    onlyThisMac: 'この Mac のみ',
    onlyThisDevice: 'このデバイスのみ',
    appliesToProfile: profile => `「${profile}」に適用`,
    appliesTo: '適用先',
    scopeMenuTitle: 'これらの設定の適用先',
    searchResults: '検索結果',
    pageMenu: '設定ページ'
  },
  sections: {
    general: {
      language: '言語と起動',
      tips: 'ヒントとチュートリアル',
      system: 'ウインドウとシステム'
    },
    appearance: {
      look: '外観',
      theme: 'テーマ',
      themeNote: 'テーマはプロファイルごとに保存されます。VS Code Marketplace から直接インストールすることもできます。',
      window: 'ウインドウ',
      typography: 'フォントと拡大縮小',
      pet: 'ペット'
    },
    chat: {
      replies: '返信',
      messages: 'メッセージ',
      media: '埋め込みと添付ファイル'
    },
    notifications: {
      alerts: 'デスクトップ通知',
      sounds: 'サウンドと触覚'
    },
    keyboard: {
      shortcuts: 'ショートカット',
      shortcutsNote: 'キーの組み合わせをクリックすると変更できます。重複は行内に表示されます。',
      quickAsk: 'クイック質問',
      hud: 'HUD とウインドウのキャプチャ'
    },
    models: {
      main: 'メインモデル',
      fallbacks: '予備のモデル',
      fallbacksNote: 'メインモデルが使えない、またはクレジットが足りないときに順番に試します。',
      auxiliary: '補助モデル',
      auxiliaryDisclosure: 'バックグラウンド処理（画像認識、圧縮、タイトル生成…）',
      moa: 'エージェント混合',
      moaDisclosure: '複数のモデルが一緒に答え、集約モデルがまとめます（/moa）'
    },
    providers: {
      accounts: 'アカウント',
      apiKeys: 'API キー',
      endpoints: 'カスタムエンドポイント',
      local: 'ローカルモデル'
    },
    memory: {
      memory: '長期メモリ',
      context: 'コンテキストと圧縮',
      contextDisclosure: '圧縮の詳細',
      maintenance: 'メンテナンス'
    },
    voice: {
      conversation: '音声会話',
      stt: '音声入力',
      tts: '読み上げ',
      wake: 'ウェイクワード'
    },
    workspace: {
      projects: 'プロジェクト',
      execution: '実行',
      checkpoints: 'チェックポイント',
      checkpointsNote: 'ファイルを変更する前に自動で保存され、メッセージから「チェックポイントを復元」できます。'
    },
    safety: {
      approvals: 'コマンドの承認',
      privacy: 'プライバシー',
      browser: 'ブラウザとネットワーク'
    },
    passwords: {
      credentials: '保存された認証情報',
      credentialsNote: 'Hermes があなたの代わりにサインインやフォーム入力をするときに使います。',
      managers: 'パスワードマネージャ'
    },
    tools: {
      toolKeys: 'ツールサービスのキー',
      serverEnv: 'サーバーの環境変数',
      toolsets: 'ツールセット'
    },
    gateways: {
      connection: 'このウインドウの接続先',
      saved: '保存された接続',
      remoteUpdates: 'リモートの更新'
    },
    sessions: {
      retention: 'アーカイブと保持',
      archived: 'アーカイブ済みのセッション'
    },
    plugins: {
      pages: 'プラグインの設定',
      manage: 'インストールと有効化'
    },
    advanced: {
      agent: 'エージェント',
      terminal: 'ターミナルのバックエンド',
      subagents: 'サブエージェント',
      output: '出力の上限',
      updates: 'アプリ内アップデート'
    },
    about: {
      updates: 'アップデート',
      config: '設定ファイル',
      diagnostics: '診断',
      uninstall: 'アンインストール'
    }
  },
  rows: {
    modeLight: 'ライト',
    modeDark: 'ダーク',
    modeAuto: '自動',
    modeGroup: 'カラーモード',
    accentTitle: 'アクセントカラー',
    accentDesc: 'ボタン、選択項目、リンクの色',
    accentNous: 'ブルー',
    accentHermes: 'Hermes ブルー',
    accentViolet: 'パープル',
    accentPink: 'ピンク',
    accentRed: 'レッド',
    accentOrange: 'オレンジ',
    accentGreen: 'グリーン',
    accentMono: 'グラファイト',
    thinkingTitle: '思考過程',
    thinkingDesc: 'モデルの推論を返信にどう表示するか',
    thinkingShow: '表示',
    thinkingCollapse: '折りたたむ',
    thinkingHide: '非表示',
    timestampsTitle: 'タイムスタンプを表示',
    hapticsTitle: '触覚フィードバック',
    hapticsDesc: 'ドラッグや作業完了時の触覚フィードバック。オフにすると完了サウンドも消えます。',
    wakeTitle: 'ウェイクワードを有効にする',
    wakeDesc: 'バックグラウンドで聞き取り、フレーズを聞くと音声会話を始めます',
    wakePhrase: 'ウェイクワード',
    memoryOpenTitle: '表示と編集',
    memoryOpenDesc: '「メモリ」ページでグラフと一覧を確認できます',
    memoryOpenAction: 'メモリを開く',
    resetMemoryTitle: 'メモリをリセット',
    resetMemoryDesc: 'MEMORY.md を空にします。元に戻せません',
    resetProfileTitle: 'ユーザープロファイルをリセット',
    resetProfileDesc: 'USER.md を空にします',
    resetAction: 'リセット…',
    maintenanceActiveOnly: profile => `リセットはこのウインドウが使用中のプロファイル（「${profile}」）に適用されます。`,
    toolsetsTitle: 'ツールセットのオン・オフ',
    toolsetsDesc: page => `「${page} › ツール」で管理します`,
    openAction: '開く',
    pluginsManageDesc: 'インストール、アップデート、有効化、アンインストール',
    pluginsManageAction: 'プラグインを開く',
    exportDesc: 'hermes-config.json として保存します。キーは含まれません',
    exportAction: '書き出す…',
    importAction: '読み込む…',
    resetConfigDesc: '現在のプロファイルだけに影響します。このデバイスの外観設定は変わりません',
    resetConfigAction: 'リセット…',
    diagnosticsTitle: '診断情報を送信',
    diagnosticsDesc: 'サポート用に秘匿化したログをアップロードします。送信前に確認があり、リンクは期限切れになります',
    diagnosticsAction: '送信…',
    logsTitle: 'ログフォルダ',
    logsActionMac: 'Finder で表示',
    logsActionOther: 'フォルダを開く',
    localModelsDesc: 'オープンモデルをダウンロードしてこのコンピュータで実行します',
    localModelsAction: 'ローカルモデルを管理…',
    sendTestAction: '送信',
    resetShortcutsAction: 'すべてデフォルトに戻す'
  }
}
