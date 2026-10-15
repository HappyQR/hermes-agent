// Overlay sheet shots: ⌘K palette scopes, System Status tabs, Profiles,
// Shortcuts, Import and Updates sheets. Read-only: nothing is renamed, created
// or deleted in the shared sandbox.
//   node scripts/studio/shots/run.mjs ... --shots scripts/studio/shots/overlays-sheets.mjs --only system,profiles
const SHEET = '[data-slot="route-sheet"], [role="dialog"]'

// The connecting overlay can linger a few seconds after the composer appears.
const ready = async page => {
  await page
    .locator('[data-slot="connecting-overlay"]')
    .waitFor({ state: 'detached', timeout: 60_000 })
    .catch(() => undefined)
}

const go = async (page, hash, sleep, wait = 1100) => {
  await ready(page)
  await page.evaluate(target => {
    window.location.hash = target
  }, hash)
  await sleep(wait)
}

const back = async (page, sleep) => {
  await page.keyboard.press('Escape')
  await sleep(500)
  await go(page, '#/', sleep, 600)
}

// Scoped to the open sheet: the sidebar behind it has same-named buttons.
const clickInSheet = async (page, name, sleep, wait = 900) => {
  await page.locator(SHEET).last().getByRole('button', { name }).first().click()
  await sleep(wait)
}

export default {
  async system(page, { shot, sleep }) {
    await go(page, '#/command-center', sleep, 1800)
    await shot(page, 'system-status')
    for (const [label, name] of [
      [/^(用量|Usage)$/, 'system-usage'],
      [/^(会话|Sessions)$/, 'system-sessions'],
      [/^(维护|Maintenance)$/, 'system-maintenance']
    ]) {
      await clickInSheet(page, label, sleep, 1400)
      await shot(page, name)
    }
    await back(page, sleep)
  },
  async profiles(page, { shot, sleep }) {
    await go(page, '#/profiles', sleep, 1600)
    await shot(page, 'profiles')
    await clickInSheet(page, /^(新建配置档案|New profile)$/, sleep, 700)
    await shot(page, 'profiles-new')
    await clickInSheet(page, /^default/, sleep, 700)
    await clickInSheet(page, /^(操作|Actions)/, sleep, 500)
    await shot(page, 'profiles-actions')
    await page.keyboard.press('Escape')
    await sleep(300)
    await back(page, sleep)
  },
  async shortcuts(page, { shot, sleep }) {
    await ready(page)
    await page.keyboard.press('Meta+Slash')
    await sleep(1000)
    await shot(page, 'shortcuts')
    await page.keyboard.type('终')
    await sleep(400)
    await shot(page, 'shortcuts-search')
    await page.keyboard.press('Escape')
    await sleep(500)
  },
  async importSheet(page, { shot, sleep }) {
    await go(page, '#/session-import', sleep, 2200)
    await shot(page, 'import')
    await back(page, sleep)
  },
  async updates(page, { shot, sleep }) {
    await go(page, '#/command-center', sleep, 1400)
    await clickInSheet(page, /^(检查更新|Check for updates)$/, sleep, 2500)
    await shot(page, 'updates')
    await page.keyboard.press('Escape')
    await sleep(400)
    await back(page, sleep)
  },
  async agents(page, { shot, sleep }) {
    await go(page, '#/agents', sleep, 1400)
    await shot(page, 'agents')
    await back(page, sleep)
  },
  // Run it last (or after a few seconds): the recent block needs the session
  // list, and the boot-time locale switch would otherwise land mid-capture.
  async paletteScopes(page, { shot, sleep }) {
    await ready(page)
    await sleep(3000)
    await page.keyboard.press('Meta+K')
    await sleep(900)
    await shot(page, 'palette-all')
    for (const name of ['palette-sessions', 'palette-pages', 'palette-actions', 'palette-settings']) {
      await page.keyboard.press('Tab')
      await sleep(600)
      await shot(page, name)
    }
    await page.keyboard.press('Tab')
    await sleep(300)
    await page.keyboard.type('主题')
    await sleep(700)
    await shot(page, 'palette-query')
    await page.keyboard.press('Escape')
    await sleep(500)
  }
}
