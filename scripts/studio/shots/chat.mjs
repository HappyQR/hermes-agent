// Chat-surface shots for the Studio harness (run.mjs --shots scripts/studio/shots/chat.mjs).
// Each shot leaves the app as it found it (Escape closes what it opened).

const composerRoot = page => page.locator('[data-slot="composer-root"]').first()

async function escape(page, sleep, times = 1) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press('Escape')
    await sleep(250)
  }
}

export default {
  // The activity tray with its first panel chip open.
  async tray(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    const chip = page.locator('[data-slot="activity-tray"] .tray-chip[aria-controls]').first()
    if (await chip.count()) {
      await chip.click()
      await sleep(500)
    }
    await shot(page, 'tray')
    await escape(page, sleep)
  },

  // The git chip's panel.
  async git(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    const chip = page.locator('[data-tray-chip="git"]').first()
    if (await chip.count()) {
      await chip.click()
      await sleep(500)
    }
    await shot(page, 'git')
    await escape(page, sleep)
  },

  // The "+" menu.
  async plus(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    await composerRoot(page).locator('button:has(.codicon-add)').first().click()
    await sleep(500)
    await shot(page, 'plus')
    await escape(page, sleep)
  },

  // The context ring's panel.
  async context(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    const ring = composerRoot(page).locator('[data-slot="composer-context-ring"]').first()
    if (await ring.count()) {
      await ring.click()
      await sleep(600)
    }
    await shot(page, 'context')
    await escape(page, sleep)
  },

  // The merged model · effort panel.
  async 'model-panel'(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    await composerRoot(page).locator('[data-slot="composer-model-pill"]').first().click()
    await sleep(700)
    await shot(page, 'model-panel')
    await escape(page, sleep)
  },

  // The mic's right-click voice menu.
  async voice(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    const mic = composerRoot(page).locator('[data-slot="composer-mic"]').first()
    if (await mic.count()) {
      await mic.click({ button: 'right' })
      await sleep(500)
    }
    await shot(page, 'voice')
    await escape(page, sleep)
  },

  // The prompt's hover actions, then its inline edit (note, Cancel, Send).
  async edit(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    const bubble = page.locator('[data-role="user"]').first()
    await bubble.hover()
    await sleep(500)
    await shot(page, 'prompt-hover')
    const pencil = page.locator('[data-slot="aui_user-actions"] button').first()
    if (await pencil.count()) {
      await pencil.click()
      await sleep(700)
    }
    await shot(page, 'edit')
    await escape(page, sleep)
  },

  // The reply's ⋯ menu.
  async 'reply-more'(page, { openSession, shot, sleep }) {
    await openSession(page, '分组重构')
    const more = page.locator('[data-slot="aui_msg-actions"] button[aria-haspopup="menu"]').last()
    if (await more.count()) {
      await more.click()
      await sleep(500)
    }
    await shot(page, 'reply-more')
    await escape(page, sleep)
  },

  // The empty state (greeting, hero composer, starters).
  async empty(page, { newChat, shot, sleep }) {
    await newChat(page)
    await sleep(800)
    await shot(page, 'empty')
  },

  // The busy composer with a draft: primary + "more send options" menu.
  async 'send-menu'(page, { composer, openSession, shot, sleep }) {
    await openSession(page, 'Telegram 网关断线')
    const editor = await composer(page)
    await editor.click()
    await editor.pressSequentially('再看一下重连测试', { delay: 2 })
    const more = composerRoot(page).locator('[data-slot="composer-send-more"]').first()
    if (await more.count()) {
      await more.click()
      await sleep(500)
    }
    await shot(page, 'send-menu')
    await escape(page, sleep)
    await editor.press('Meta+A')
    await editor.press('Delete')
  }
}
