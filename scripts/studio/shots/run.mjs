#!/usr/bin/env node
// Launch the built desktop app against a sandboxed Hermes home and a scripted
// model, then capture screenshots of its main surfaces.
//
//   node scripts/studio/shots/run.mjs --seed            fresh sandbox + seeded conversations
//   node scripts/studio/shots/run.mjs                   reuse the sandbox, just capture
//   node scripts/studio/shots/run.mjs --only chat,new   capture a subset
//   node scripts/studio/shots/run.mjs --dump            also write the DOM's labelled controls
//
// Parallel runs: --port <n> (mock model port, default 18642), --shots <file.mjs>
// (extra shots: `export default { name: async (page, api) => {} }`, may repeat; `api.app`
// is the Playwright ElectronApplication for main-process checks),
// --installs-from <hermes-home> (reuse that home's prepared PM environment).
// Options: --sandbox <dir> (default $TMPDIR/hermes-studio-shots), --out <dir>,
// --scheme light|dark, --size 1440x900, --hermes <launcher> (backend command,
// default this checkout's .hermes/bin/hermes from `source ./activate`), --hold <seconds>,
// --native (macOS: capture the real window — glass, traffic lights — not the renderer),
// --fake-media (Chromium's fake mic/camera + auto-granted prompt, so voice surfaces can run).
// Needs `npm run build` in apps/desktop first. Never touches ~/.hermes: the
// backend runs with HOME and HERMES_HOME inside the sandbox.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { _electron } from '@playwright/test'

import { startMockLlm, MODEL_ID } from './mock-llm.mjs'
import { scenarios, seedProject, SEND_ORDER } from './scenarios.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '../../..')
const DESKTOP = path.join(REPO, 'apps/desktop')

const args = process.argv.slice(2)
const flag = name => args.includes(`--${name}`)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}

const MOCK_PORT = Number(opt('port', '18642'))
const sandbox = path.resolve(opt('sandbox', path.join(os.tmpdir(), 'hermes-studio-shots')))
const outDir = path.resolve(opt('out', path.join(sandbox, 'shots')))
const scheme = opt('scheme', 'light')
const [width, height] = opt('size', '1440x900').split('x').map(Number)
// The fork's own launcher (created by `source ./activate` with this sandbox's
// HERMES_HOME and a HERMES_RUNTIME_DIR); --hermes points elsewhere.
const hermesLauncher = opt('hermes', path.join(REPO, '.hermes/bin/hermes'))
const only = opt('only', '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const home = path.join(sandbox, 'home')
// Not $HOME/.hermes: that would be the platform-default home and share the
// real gateway's launchd label (ai.hermes.gateway) instead of a hashed one.
const hermesHome = path.join(sandbox, 'hermes-home')
const userData = path.join(sandbox, 'electron-user-data')
const project = path.join(home, 'Projects', 'hermes-agent')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Gateways are detached daemons that outlive the app; one left holding the
// sandbox's state.db makes the next run refuse to open it (split-brain WAL).
// Only processes with files open under this sandbox's Hermes home are stopped.
function stopSandboxProcesses() {
  if (!fs.existsSync(hermesHome)) return
  const out = spawnSync('lsof', ['-t', '+D', hermesHome], { encoding: 'utf8' }).stdout || ''
  const pids = [...new Set(out.split(/\s+/).filter(Boolean).map(Number))].filter(pid => pid !== process.pid)
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {}
  }
  if (pids.length) console.log(`Stopped ${pids.length} sandbox process(es): ${pids.join(', ')}`)
}

function prepareSandbox(mockUrl) {
  // Keep the agent's managed Python environment (installs/): building it for a
  // new HERMES_HOME takes minutes, and it does not depend on the seeded data.
  const installs = path.join(hermesHome, 'installs')
  const parked = path.join(path.dirname(sandbox), `.${path.basename(sandbox)}-installs`)
  const shared = opt('installs-from', '')
  if (fs.existsSync(installs) && !fs.lstatSync(installs).isSymbolicLink()) fs.renameSync(installs, parked)
  fs.rmSync(sandbox, { recursive: true, force: true })
  fs.mkdirSync(hermesHome, { recursive: true })
  if (shared) fs.symlinkSync(path.resolve(shared, 'installs'), installs)
  else if (fs.existsSync(parked)) fs.renameSync(parked, installs)
  fs.mkdirSync(userData, { recursive: true })
  seedProject(project)
  gitProject(project)
  const config = [
    'model:',
    `  default: ${MODEL_ID}`,
    '  provider: custom',
    `  base_url: ${mockUrl}/v1`,
    '  context_length: 200000',
    'custom_providers:',
    '  - name: mock',
    `    base_url: ${mockUrl}/v1`,
    '    key_env: OPENAI_API_KEY',
    'approvals:',
    '  mode: manual',
    'onboarding:',
    '  run: false',
    'display:',
    '  language: zh',
    // New sessions start in the seeded repo, which the Projects sidebar lists.
    'terminal:',
    `  cwd: ${project}`,
    'desktop:',
    '  repo_scan_roots:',
    `    - ${path.dirname(project)}`,
    // An explicit answer keeps the shared-metrics consent strip out of every shot.
    'telemetry:',
    '  shared_metrics:',
    '    enabled: false',
    '    send: false',
    '    offer_version: 2',
    ''
  ].join('\n')
  fs.writeFileSync(path.join(hermesHome, 'config.yaml'), config)
  fs.writeFileSync(path.join(hermesHome, '.env'), `OPENAI_API_KEY=studio-mock-key\nOPENAI_BASE_URL=${mockUrl}/v1\n`)
}

// The seeded project as a repo on a feature branch with work in progress, so
// the toolbar has branch and diff chips and the sidebar a project lane.
function gitProject(root) {
  const git = (...args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' })
  git('init', '-q', '-b', 'main')
  git('-c', 'user.name=Hermes Studio', '-c', 'user.email=studio@example.invalid', 'add', '-A')
  git('-c', 'user.name=Hermes Studio', '-c', 'user.email=studio@example.invalid', 'commit', '-q', '-m', 'Initial commit')
  git('checkout', '-q', '-b', 'feat/sidebar-groups')
  fs.appendFileSync(path.join(root, 'src/store/session-groups.ts'), '\n// TODO: group by source\n')
}

// Scheduled jobs for the Automations page (the prototype's examples).
function seedCronJobs() {
  const jobs = [
    ['0 9 * * *', '每日 AI 新闻摘要', '汇总过去 24 小时 AI 领域的重要新闻，每条一句话，附来源链接。'],
    ['30 9 * * 1-5', '工作日站会提醒', '9:45 站会前提醒我，列出昨天的进展和今天的计划。'],
    ['0 10 * * 1', '每周依赖安全审计', '检查项目依赖的安全公告，有高危问题时告诉我。'],
    ['every 15m', 'NAS 磁盘巡检', '检查 NAS 的磁盘使用率，超过 85% 时提醒我。', '--paused'],
    ['0 9 1 * *', '月度账单整理', '整理上个月的账单，按类别汇总成表格。']
  ]
  for (const [schedule, name, prompt, ...flags] of jobs) {
    spawnSync(hermesLauncher, ['cron', 'create', '--name', name, '--deliver', 'local', ...flags, schedule, prompt], {
      env: appEnv(),
      encoding: 'utf8'
    })
  }
}

function writeWindowState() {
  fs.mkdirSync(userData, { recursive: true })
  fs.writeFileSync(
    path.join(userData, 'window-state.json'),
    JSON.stringify({ x: 40, y: 40, width, height, isMaximized: false })
  )
  fs.writeFileSync(path.join(userData, 'zoom-state.json'), JSON.stringify({ zoomLevel: 0 }))
}

function appEnv() {
  const env = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue
    if (/(_API_KEY|_TOKEN|_SECRET|_PASSWORD|_CREDENTIALS|_ACCESS_KEY|_PRIVATE_KEY)$/.test(key)) continue
    if (key.startsWith('HERMES_') && !key.startsWith('HERMES_DESKTOP_')) continue
    env[key] = value
  }
  return {
    ...env,
    HOME: home,
    HERMES_HOME: hermesHome,
    HERMES_DESKTOP_USER_DATA_DIR: userData,
    HERMES_DESKTOP_IGNORE_EXISTING: '1',
    HERMES_DESKTOP_ISOLATED_BACKEND: '1',
    // The installed agent's own launcher (its managed Python); HOME and
    // HERMES_HOME above keep it inside the sandbox.
    HERMES_DESKTOP_HERMES: hermesLauncher,
    HERMES_DESKTOP_APP_NAME: `HermesStudioShots-${Date.now()}`,
    HERMES_DESKTOP_SKIP_QUIT_CONFIRM: '1',
    HERMES_DESKTOP_SKIP_PROTOCOL_REGISTRATION: '1'
  }
}

function electronBinary() {
  const bin = path.join(DESKTOP, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
  if (fs.existsSync(bin)) return bin
  return path.join(REPO, 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron')
}

async function composer(page, timeout = 120_000) {
  const editor = page
    .locator('[data-slot="composer-root"] [contenteditable="true"]:visible, [data-slot="composer-root"] textarea:not([aria-hidden="true"]):not(.sr-only):visible')
    .first()
  await editor.waitFor({ state: 'visible', timeout })
  return editor
}

async function newChat(page) {
  await page.keyboard.press('Meta+N')
  await sleep(700)
}

async function send(page, text) {
  const editor = await composer(page)
  try {
    await editor.click({ timeout: 20_000 })
  } catch (error) {
    await shot(page, 'send-blocked')
    const blockers = await page.evaluate(() =>
      [...document.querySelectorAll('[role="dialog"], [role="alertdialog"], [role="alert"], [data-glass-opaque]')]
        .filter(el => el.getBoundingClientRect().width > 0)
        .map(el => (el.innerText || el.className).slice(0, 400))
    )
    console.log('Composer blocked by:', JSON.stringify(blockers, null, 1))
    throw error
  }
  await editor.press('Meta+A')
  await editor.press('Delete')
  await editor.pressSequentially(text, { delay: 2 })
  await editor.press('Enter')
}

// Rows show the generated title or, until one lands, the prompt: match a fragment.
async function openSession(page, title) {
  const row = page.getByText(title).first()
  await row.click({ timeout: 15_000 })
  await sleep(1200)
}

// --native: capture the real macOS window (vibrancy, traffic lights, corners)
// instead of the renderer — Electron's media source id carries the CGWindowID.
let nativeApp = null

async function nativeWindowId(page) {
  return nativeApp.evaluate(({ BrowserWindow }, url) => {
    const win = BrowserWindow.getAllWindows().find(w => !w.isDestroyed() && w.webContents.getURL() === url)
    if (!win?.isVisible()) return null
    win.focus()
    return win.getMediaSourceId().split(':')[1] ?? null
  }, page.url())
}

async function shot(page, name) {
  fs.mkdirSync(outDir, { recursive: true })
  const file = path.join(outDir, `${name}.png`)
  const windowId = nativeApp && process.platform === 'darwin' ? await nativeWindowId(page) : null
  if (windowId) {
    await sleep(250)
    spawnSync('screencapture', ['-x', '-o', `-l${windowId}`, file])
  } else {
    await page.screenshot({ path: file })
  }
  console.log(`  ✓ ${name} → ${file}`)
}

async function dumpControls(page, name) {
  const controls = await page.evaluate(() =>
    [...document.querySelectorAll('button, [role="button"], [role="tab"], a, [data-slot]')]
      .filter(el => el.getBoundingClientRect().width > 0)
      .slice(0, 600)
      .map(el => ({
        tag: el.tagName.toLowerCase(),
        slot: el.getAttribute('data-slot'),
        label: el.getAttribute('aria-label'),
        text: (el.textContent || '').trim().slice(0, 40),
        box: (({ x, y, width, height }) => [x, y, width, height].map(Math.round))(el.getBoundingClientRect())
      }))
  )
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, `${name}.controls.json`), JSON.stringify(controls, null, 1))
}

const SHOTS = {
  async chat(page) {
    await openSession(page, '分组重构')
    await shot(page, 'chat')
  },
  async approval(page) {
    await openSession(page, 'Telegram 网关断线')
    await shot(page, 'approval')
  },
  async clarify(page) {
    await openSession(page, 'AI 新闻')
    await shot(page, 'clarify')
  },
  async delegate(page) {
    await openSession(page, '无障碍')
    await shot(page, 'delegate')
  },
  async error(page) {
    await openSession(page, 'OpenRouter')
    await shot(page, 'error')
  },
  async new(page) {
    await newChat(page)
    await shot(page, 'new')
  },
  async palette(page) {
    await page.keyboard.press('Meta+K')
    await sleep(800)
    await shot(page, 'palette')
    await page.keyboard.press('Escape')
    await sleep(400)
  },
  async menu(page) {
    await openSession(page, '分组重构')
    const row = page.getByText('无障碍').first()
    await row.click({ button: 'right' })
    await sleep(500)
    const items = page.locator('[data-slot="context-menu-item"], [role="menuitem"]')
    if (await items.count()) await items.nth(1).hover()
    await sleep(300)
    await shot(page, 'menu')
    await page.keyboard.press('Escape')
    await sleep(400)
  },
  async model(page) {
    await openSession(page, '分组重构')
    const pill = page.locator('[data-slot="composer-root"] button').filter({ hasText: /mock|Mock/ }).first()
    await pill.click()
    await sleep(700)
    await shot(page, 'model')
    await page.keyboard.press('Escape')
    await sleep(400)
  },
  async appearance(page) {
    await page.keyboard.press('Meta+Comma')
    await sleep(1200)
    await page.getByText('外观', { exact: true }).first().click()
    await sleep(900)
    await shot(page, 'appearance')
    await page.keyboard.press('Escape')
    await sleep(500)
  },
  async dialog(page) {
    const row = page.getByText('无障碍').first()
    await row.click({ button: 'right' })
    await sleep(500)
    await page.getByText('重命名', { exact: false }).first().click()
    await sleep(900)
    await shot(page, 'dialog')
    await page.keyboard.press('Escape')
    await sleep(500)
  },
  async settings(page) {
    await page.keyboard.press('Meta+Comma')
    await sleep(1200)
    await shot(page, 'settings')
    await page.keyboard.press('Escape')
    await sleep(500)
  }
}

async function main() {
  const steps = []
  const mock = await startMockLlm({
    scenarios: scenarios(project),
    port: MOCK_PORT,
    onStep: event => steps.push({ ...event, at: Date.now() })
  })
  stopSandboxProcesses()
  if (flag('seed') || !fs.existsSync(hermesHome)) {
    await sleep(1000)
    prepareSandbox(mock.url)
    seedCronJobs()
  }
  writeWindowState()

  const app = await _electron.launch({
    executablePath: electronBinary(),
    args: [
      DESKTOP,
      '--disable-gpu-sandbox',
      ...(flag('fake-media') ? ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] : [])
    ],
    env: appEnv(),
    cwd: DESKTOP,
    colorScheme: scheme
  })
  if (flag('native')) nativeApp = app
  const logFile = fs.createWriteStream(path.join(sandbox, 'app.log'), { flags: 'a' })
  app.process().stdout?.on('data', data => logFile.write(data))
  app.process().stderr?.on('data', data => logFile.write(data))
  const page = await app.firstWindow()
  page.on('pageerror', error => console.log(`[pageerror] ${error.message}`))
  page.on('console', message => {
    if (message.type() === 'error') logFile.write(`[renderer] ${message.text()}\n`)
  })
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
  console.log('Waiting for the composer…')
  try {
    await composer(page, Number(opt('boot-timeout', '120')) * 1000)
  } catch (error) {
    await shot(page, 'boot-failure')
    const dialogs = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"], [role="alert"]')].map(el => el.innerText.slice(0, 600)))
    console.log('Boot did not reach the composer. Dialogs:', JSON.stringify(dialogs, null, 1))
    console.log(`Main-process log: ${path.join(sandbox, 'app.log')}`)
    await app.close()
    await mock.close()
    process.exit(1)
  }
  await sleep(1500)

  if (flag('seed')) {
    console.log('Seeding conversations…')
    for (const prompt of SEND_ORDER) {
      const scenario = scenarios(project).find(s => prompt.includes(s.match))
      const before = steps.length
      await newChat(page)
      await send(page, prompt)
      const deadline = Date.now() + 90_000
      while (Date.now() < deadline) {
        const mine = steps.slice(before).filter(e => e.title === scenario.title)
        const last = mine.at(-1)
        const pausing = last && scenario.steps[last.step]?.toolCalls?.some(c => c.name === 'clarify' || /rm -rf/.test(c.args?.command ?? ''))
        if (last?.final || scenario.fail) break
        if (pausing) break
        await sleep(300)
      }
      await sleep(4000)
      console.log(`  · ${scenario.title}`)
    }
    // The titler runs after each turn, so a session's live title push can land
    // while the next one is in front; reload once to list the stored titles.
    await page.reload()
    await composer(page, 60_000)
    await sleep(2500)
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] !== '--shots' || !args[i + 1]) continue
    const extra = await import(path.resolve(args[i + 1]))
    Object.assign(SHOTS, extra.default ?? extra.shots ?? {})
  }
  if (flag('dump')) await dumpControls(page, 'controls')
  const names = only.length ? only : Object.keys(SHOTS)
  for (const name of names) {
    try {
      await SHOTS[name](page, { app, outDir, shot, sleep, openSession, newChat, send, composer })
    } catch (error) {
      console.log(`  ✗ ${name}: ${error.message.split('\n')[0]}`)
    }
  }
  const hold = Number(opt('hold', '0'))
  if (hold > 0) await sleep(hold * 1000)
  await app.close()
  await mock.close()
  stopSandboxProcesses()
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
