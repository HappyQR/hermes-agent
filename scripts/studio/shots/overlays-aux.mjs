// Hermes Studio — aux windows, boot surfaces and toasts (overlays area).
//
//   node scripts/studio/shots/run.mjs --shots scripts/studio/shots/overlays-aux.mjs --only toast,quickentry,wake
//
// Use a sandbox of your own for these (e.g. --sandbox $S/sandbox-overlays-b --port 18674):
//  - `quickentry` / `wake` render the `?win=` aux views INSIDE the main window
//    (the harness cannot open those BrowserWindows), so they leave the app on
//    that view — run them last.
//  - `onboarding` expects a sandbox whose provider is NOT configured (drop the
//    `model:` block from its config.yaml), so the first-run picker is up.

// First button matching one of `names` inside `scope`.
const button = async (scope, names) => {
  for (const name of names) {
    const candidate = scope.getByRole('button', { name, exact: true }).first()
    if (await candidate.count()) return candidate
  }
  return null
}

// Render one of the `?win=` aux views in the main window (no way back without a reload).
async function auxView(page, win, size) {
  const base = page.url().split('#')[0].split('?')[0]
  await page.goto(`${base}?win=${win}`)
  await page.setViewportSize(size)
  await page.waitForTimeout(1500)
}

export default {
  // A real ambient toast: Settings › Notifications › Send test notification.
  async toast(page, { composer, shot, sleep }) {
    await sleep(3000)
    await composer(page)
    await page.evaluate(() => {
      window.location.hash = '#/settings?tab=notifications'
    })
    await sleep(1800)
    const surface = page.locator('[data-overlay-surface]').last()
    const send = await button(surface, ['发送测试通知', 'Send test notification', '发送', 'Send'])
    if (!send) {
      await shot(page, 'toast-debug')
      throw new Error('test-notification button not found')
    }
    await send.scrollIntoViewIfNeeded()
    await send.click()
    await sleep(1500)
    await shot(page, 'toast-over-settings')
    await page.keyboard.press('Escape')
    await sleep(700)
    await shot(page, 'toast')
  },

  // The first-run provider picker (sandbox without a configured provider).
  async onboarding(page, { shot, sleep }) {
    const overlay = page.locator('[data-slot="onboarding-overlay"]')
    await overlay.waitFor({ state: 'visible', timeout: 60_000 })
    await sleep(2500)
    await shot(page, 'onboarding')
    const more = await button(overlay, ['其他提供方', 'Other providers'])
    if (more) {
      await more.click()
      await sleep(700)
      await shot(page, 'onboarding-all')
      // The disclosure persists (localStorage): fold it back.
      const collapse = await button(overlay, ['收起', 'Collapse'])
      if (collapse) await collapse.click()
      await sleep(300)
    }
  },

  // The Quick Ask capture card, as the `?win=quick` window renders it.
  async quickentry(page, { shot, sleep }) {
    await auxView(page, 'quick', { width: 640, height: 168 })
    await sleep(600)
    await shot(page, 'quickentry')
  },

  // The wake pill. Its state comes from main over IPC; pin it for the picture.
  async wake(page, { shot, sleep }) {
    await auxView(page, 'wake', { width: 176, height: 52 })
    await page.evaluate(() => {
      document.querySelector('.wake-indicator-surface')?.setAttribute('data-state', 'capturing')
    })
    await sleep(700)
    await shot(page, 'wake')
  }
}
