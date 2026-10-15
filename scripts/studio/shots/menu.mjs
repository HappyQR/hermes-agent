// The macOS application menu, checked from the main process (shot harness).
//
//   STUDIO_SHOT_LANG=zh node scripts/studio/shots/run.mjs … --only appmenu --shots scripts/studio/shots/menu.mjs
//
// Writes <out>/appmenu-<lang>.json — the installed NSMenu as Electron sees it
// (labels, roles, key equivalents, enabled/checked) — and
// <out>/appmenu-<lang>-checks.json: items clicked from main (and one key
// equivalent replayed into the window) with what each changed, plus
// screenshots of the surfaces they open. Run it once per display language.
import fs from 'node:fs'
import path from 'node:path'

const menuTree = app =>
  app.evaluate(({ Menu }) => {
    const walk = menu =>
      menu.items.map(item => {
        const node = { label: item.label, type: item.type }

        if (item.id) node.id = item.id
        if (item.role) node.role = item.role
        if (item.accelerator) node.accelerator = item.accelerator
        if (!item.enabled) node.enabled = false
        if (item.type === 'checkbox' || item.type === 'radio') node.checked = item.checked
        if (item.submenu) node.submenu = walk(item.submenu)

        return node
      })

    const menu = Menu.getApplicationMenu()

    return menu ? walk(menu) : null
  })

function findItem(tree, id) {
  for (const node of tree ?? []) {
    if (node.id === id) return node
    const hit = findItem(node.submenu, id)
    if (hit) return hit
  }

  return null
}

async function waitFor(read, accept, { timeout = 10_000, interval = 150 } = {}) {
  const deadline = Date.now() + timeout
  let value = await read()

  while (!accept(value) && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, interval))
    value = await read()
  }

  return value
}

/** Click an item the way AppKit would: by id, from main. `accelerator`
 *  simulates its key equivalent firing (Electron passes triggeredByAccelerator). */
const clickItem = (app, id, accelerator = false) =>
  app.evaluate(
    ({ BrowserWindow, Menu }, { accelerator, id }) => {
      const item = Menu.getApplicationMenu()?.getMenuItemById(id)
      const win = BrowserWindow.getAllWindows().find(candidate => candidate.isVisible())

      if (!item || !win) return false

      item.click(accelerator ? { triggeredByAccelerator: true } : undefined, win, win.webContents)

      return true
    },
    { accelerator, id }
  )

/** A key equivalent only reaches a focused window, so bring the app forward. */
const focusApp = app =>
  app.evaluate(({ app: electronApp, BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows().find(candidate => candidate.isVisible())

    electronApp.focus({ steal: true })
    win?.show()
    win?.focus()
    win?.webContents.focus()
  })

const focusState = app =>
  app.evaluate(({ BrowserWindow, webContents }) => ({
    focusedContents: webContents.getFocusedWebContents()?.id ?? null,
    focusedWindow: BrowserWindow.getFocusedWindow()?.webContents.id ?? null
  }))

const label = async (app, id) => findItem(await menuTree(app), id)?.label
const checked = async (app, id) => findItem(await menuTree(app), id)?.checked

export default {
  async appmenu(page, { app, outDir, shot, sleep, openSession, newChat }) {
    // The renderer republishes as soon as its locale loads (from the backend
    // config, a while after the composer shows): wait for the language asked
    // for in STUDIO_SHOT_LANG, then for the installed menu to hold still.
    const expected = process.env.STUDIO_SHOT_LANG

    if (expected) {
      await waitFor(
        () => page.evaluate(() => document.documentElement.lang),
        value => value === expected,
        { interval: 500, timeout: 60_000 }
      )
    }

    let previous = ''
    let steady = 0
    const settled = await waitFor(
      async () => ({
        lang: await page.evaluate(() => document.documentElement.lang || 'unknown'),
        tree: await menuTree(app)
      }),
      value => {
        const key = JSON.stringify(value)

        // The profile list lands shortly after the gateway connects.
        const loaded = findItem(value.tree, 'session.new') && findItem(value.tree, 'menu.profile:default')

        steady = key === previous && loaded ? steady + 1 : 0
        previous = key

        return steady >= 4
      },
      { interval: 500, timeout: 30_000 }
    )
    const { lang, tree } = settled

    fs.mkdirSync(outDir, { recursive: true })
    fs.writeFileSync(path.join(outDir, `appmenu-${lang}.json`), JSON.stringify(tree, null, 2))
    console.log(`  ✓ appmenu-${lang}.json (${tree?.length ?? 0} menus)`)

    const checks = []
    const record = (name, data) => {
      checks.push({ name, ...data })
      console.log(`    · ${name}: ${JSON.stringify(data)}`)
    }

    // 1. A click runs the renderer action, and the model the renderer sends
    //    back flips the label (renderer → main → NSMenu round trip).
    const sidebarBefore = await label(app, 'view.toggleSidebar')
    await clickItem(app, 'view.toggleSidebar')
    const sidebarAfter = await waitFor(
      () => label(app, 'view.toggleSidebar'),
      value => value !== sidebarBefore
    )
    record('click View › Sidebar', { before: sidebarBefore, after: sidebarAfter })

    // 2. The key equivalent is replayed into the focused page as the same
    //    keystroke, so the keybind dispatcher runs it.
    await page.evaluate(() => {
      window.__menuKeys = []
      window.addEventListener(
        'keydown',
        event =>
          window.__menuKeys.push({ code: event.code, key: event.key, meta: event.metaKey, trusted: event.isTrusted }),
        { capture: true }
      )
    })
    await focusApp(app)
    const focus = await waitFor(
      () => focusState(app),
      value => value.focusedContents !== null
    )
    await clickItem(app, 'view.toggleSidebar', true)
    const sidebarReplayed = await waitFor(
      () => label(app, 'view.toggleSidebar'),
      value => value === sidebarBefore
    )
    record('key equivalent ⌘B (replayed)', {
      after: sidebarReplayed,
      focus,
      keys: await page.evaluate(() => window.__menuKeys)
    })

    // 3. A checkmark item: Appearance › Dark, then back.
    const appearance = await menuTree(app)
    const darkBefore = findItem(appearance, 'menu.appearance.dark')?.checked
    const original =
      ['menu.appearance.light', 'menu.appearance.dark', 'menu.appearance.system'].find(
        id => findItem(appearance, id)?.checked
      ) ?? 'menu.appearance.system'
    await clickItem(app, 'menu.appearance.dark')
    const darkAfter = await waitFor(
      () => checked(app, 'menu.appearance.dark'),
      value => value === true
    )
    await sleep(400)
    await shot(page, `appmenu-${lang}-dark`)
    record('click View › Appearance › Dark', { before: darkBefore, after: darkAfter })
    await clickItem(app, original)
    await sleep(400)

    // 4. Settings… opens the settings overlay.
    await clickItem(app, 'nav.settings')
    await sleep(900)
    record('click Settings…', { url: page.url().split('#')[1] })
    await shot(page, `appmenu-${lang}-settings`)
    await page.keyboard.press('Escape')
    await sleep(500)

    // 5. Session menu: disabled on a fresh draft, enabled on a session.
    await newChat(page)
    const draftRename = findItem(
      await waitFor(
        () => menuTree(app),
        value => findItem(value, 'menu.session.rename')?.enabled === false,
        { timeout: 5_000 }
      ),
      'menu.session.rename'
    )
    await openSession(page, '分组重构')
    const sessionTree = await waitFor(
      () => menuTree(app),
      value => findItem(value, 'menu.session.rename')?.enabled !== false
    )
    record('Session › Rename… enablement', {
      draft: draftRename?.enabled !== false,
      session: findItem(sessionTree, 'menu.session.rename')?.enabled !== false
    })
    fs.writeFileSync(path.join(outDir, `appmenu-${lang}-session.json`), JSON.stringify(sessionTree, null, 2))
    await clickItem(app, 'menu.session.rename')
    await sleep(700)
    await shot(page, `appmenu-${lang}-rename`)
    record('click Session › Rename…', {
      dialog: await page.evaluate(() => document.querySelector('[role="dialog"]')?.textContent?.slice(0, 80) ?? null)
    })
    await page.keyboard.press('Escape')
    await sleep(500)

    // 6. Help › Keyboard Shortcuts.
    await clickItem(app, 'keybinds.openPanel')
    await sleep(900)
    record('click Help › Keyboard Shortcuts', { url: page.url().split('#')[1] })
    await shot(page, `appmenu-${lang}-shortcuts`)
    await page.keyboard.press('Escape')
    await sleep(500)

    fs.writeFileSync(path.join(outDir, `appmenu-${lang}-checks.json`), JSON.stringify(checks, null, 2))
  }
}
