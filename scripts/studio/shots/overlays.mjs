// Settings window shots (overlays area). Run with:
//   node scripts/studio/shots/run.mjs --only settings-general,... --shots scripts/studio/shots/overlays.mjs
// Shots never change persistent settings: they only navigate, search and scroll.

// The first-boot "Connecting…" overlay can outlive the composer while onboarding is decided.
const settled = page =>
  page.waitForSelector('[data-slot="connecting-overlay"]', { state: 'detached', timeout: 45_000 }).catch(() => undefined)

const go = async (page, hash, sleep, wait = 1100) => {
  await settled(page)
  await page.evaluate(target => {
    window.location.hash = target
  }, hash)
  await sleep(wait)
}

const closeSettings = async (page, sleep) => {
  await page.keyboard.press('Escape')
  await sleep(400)
  // A second Esc closes the window when the first one only cleared the search.
  if (await page.locator('[data-slot="settings-window"]').count()) {
    await page.keyboard.press('Escape')
    await sleep(400)
  }
}

const settingsPage = (tab, { scroll = 0, name = `settings-${tab}` } = {}) =>
  async (page, { shot, sleep }) => {
    await go(page, `#/settings?tab=${tab}`, sleep)
    if (scroll) {
      await page.evaluate(y => {
        const body = document.querySelector('[data-slot="settings-main"] > div:last-child')
        if (body) body.scrollTop = y
      }, scroll)
      await sleep(350)
    }
    await shot(page, name)
    await closeSettings(page, sleep)
  }

export default {
  async 'settings-open'(page, { shot, sleep }) {
    await settled(page)
    await page.keyboard.press('Meta+Comma')
    await sleep(1200)
    await shot(page, 'settings-open')
    await closeSettings(page, sleep)
  },
  'settings-general': settingsPage('general'),
  'settings-appearance': settingsPage('appearance'),
  'settings-appearance-2': settingsPage('appearance', { scroll: 560, name: 'settings-appearance-2' }),
  'settings-chat': settingsPage('chat'),
  'settings-notifications': settingsPage('notifications'),
  'settings-keyboard': settingsPage('keyboard'),
  'settings-models': settingsPage('models'),
  'settings-providers': settingsPage('providers'),
  'settings-memory': settingsPage('memory'),
  'settings-voice': settingsPage('voice'),
  'settings-workspace': settingsPage('workspace'),
  'settings-safety': settingsPage('safety'),
  'settings-passwords': settingsPage('passwords'),
  'settings-tools': settingsPage('tools'),
  'settings-gateways': settingsPage('gateways'),
  'settings-sessions': settingsPage('sessions'),
  'settings-plugins': settingsPage('plugins'),
  'settings-billing': settingsPage('billing'),
  'settings-advanced': settingsPage('advanced'),
  'settings-about': settingsPage('about'),
  async 'settings-search'(page, { shot, sleep }) {
    await go(page, '#/settings?tab=general', sleep)
    await page.keyboard.type('字', { delay: 40 })
    await sleep(900)
    await shot(page, 'settings-search')
    await closeSettings(page, sleep)
  },
  async 'settings-legacy-link'(page, { shot, sleep }) {
    // A pre-window deep link: Model › Auxiliary models.
    await go(page, '#/settings?tab=config:model&page=auxiliary', sleep, 1600)
    await shot(page, 'settings-legacy-link')
    await closeSettings(page, sleep)
  },
  async 'settings-narrow'(page, { shot, sleep }) {
    await page.setViewportSize({ width: 820, height: 760 })
    await go(page, '#/settings?tab=appearance', sleep)
    await shot(page, 'settings-narrow')
    await closeSettings(page, sleep)
    await page.setViewportSize({ width: 1440, height: 900 })
    await sleep(300)
  }
}
