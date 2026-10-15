// Hermes Studio — aux windows, boot surfaces and toasts (overlays area).
//
//   node scripts/studio/shots/run.mjs --shots scripts/studio/shots/overlays-aux.mjs --only toast,quickentry,wake
//
// The aux windows (Quick Ask, wake pill) are separate BrowserWindows the
// harness cannot open, so their views are rendered inside the main window via
// `?win=` and the app is restored afterwards. Nothing here persists changes.

// First button matching one of `names` inside `scope` (the open settings surface).
const button = async (scope, names) => {
  for (const name of names) {
    const candidate = scope.getByRole('button', { name, exact: true }).first()
    if (await candidate.count()) return candidate
  }
  return null
}

// Render one of the `?win=` aux views in the main window, run `fn`, then reload the app.
async function inAuxView(page, win, fn) {
  const home = page.url()
  const base = home.split('#')[0].split('?')[0]
  await page.goto(`${base}?win=${win}`)
  await page.waitForTimeout(1500)
  try {
    await fn()
  } finally {
    await page.goto(home)
    await page.waitForTimeout(4000)
  }
}

export default {
  // A real ambient toast: Settings › Notifications › Send test notification.
  async toast(page, { shot, sleep }) {
    await page.evaluate(() => {
      window.location.hash = '#/settings?tab=notifications'
    })
    await sleep(1500)
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

  // The Quick Ask capture card, as the `?win=quick` window renders it.
  async quickentry(page, { shot, sleep }) {
    await inAuxView(page, 'quick', async () => {
      await page.setViewportSize({ width: 640, height: 168 })
      await sleep(600)
      await shot(page, 'quickentry')
    })
    await page.setViewportSize({ width: 1440, height: 900 })
  },

  // The wake pill. Its state comes from main over IPC; pin it for the picture.
  async wake(page, { shot, sleep }) {
    await inAuxView(page, 'wake', async () => {
      await page.setViewportSize({ width: 176, height: 52 })
      await page.evaluate(() => {
        const surface = document.querySelector('.wake-indicator-surface')
        if (surface) surface.setAttribute('data-state', 'capturing')
      })
      await sleep(700)
      await shot(page, 'wake')
    })
    await page.setViewportSize({ width: 1440, height: 900 })
  }
}
