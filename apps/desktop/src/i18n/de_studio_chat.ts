// Hermes Studio copy (chat) — fork-owned so upstream locale merges stay clean.
import type { StudioChatTranslations } from './types_studio_chat'

export const deStudioChat: StudioChatTranslations = {
  contextUsage: 'Kontextnutzung',
  tray: {
    label: 'Aktivität',
    hide: 'Aktivität ausblenden',
    show: count => `Aktivität anzeigen (${count})`,
    approval: count => (count > 1 ? `Freigabe nötig · ${count}` : 'Freigabe nötig'),
    approvalHint: 'Zum Befehl springen, der auf Freigabe wartet',
    needsInput: 'Wartet auf deine Auswahl',
    needsInputHint: 'Zur Frage springen',
    previews: count => `${count} Vorschau${count === 1 ? '' : 'en'}`,
    more: 'Mehr',
    close: 'Schließen',
    titles: {
      background: 'Hintergrundprozesse',
      preview: 'Vorschau-Links',
      previousTodo: 'Frühere Aufgaben',
      queue: 'Warteschlange',
      subagent: 'Subagenten',
      todo: 'Aufgaben'
    },
    todoCaption: 'Hermes hält sie in diesem Zug aktuell',
    queueCaption: 'Werden nach diesem Zug der Reihe nach gesendet',
    git: {
      hint: 'Branch, Änderungen und Worktrees',
      reviewChanges: 'Änderungen prüfen',
      openPullRequest: number => `Pull-Request #${number} öffnen`,
      copyWorktreePath: 'Worktree-Pfad kopieren'
    }
  }
}
