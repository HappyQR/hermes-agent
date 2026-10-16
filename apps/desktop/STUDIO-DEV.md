# Hermes Studio — developer guide

How to build the Studio redesign inside this fork. Read with `apps/desktop/AGENTS.md`,
`DESIGN.md` and `src/AGENTS.md` (their invariants still hold unless this file says otherwise).
User-facing overview: `/STUDIO.md`.

## Sources of truth

- **Design:** the interactive prototype (React + htm, Chinese copy; a private claude.ai
  artifact, not part of this repo). Its look and interaction are what the shipped surfaces
  reproduce; `/STUDIO.md` lists where the app deliberately differs and why.
- The implementation maps and feature inventories used during the redesign were working
  notes and are not kept. The rule they enforced still holds: nothing may be lost.

## Non-negotiables

1. **No feature loss.** Every existing capability keeps a reachable home (see the maps' "where
   everything goes" tables). Backend-dependent prototype features that have no backend yet are
   hidden, never faked.
2. **i18n, always.** No UI text literals in JSX/TS — everything through `useI18n()`.
   - Studio copy lives under `t.studio.<area>` (`shell`, `sidebar`, `chat`, `pages`, `settings`,
     `overlays`). Types: `src/i18n/types_studio_<area>.ts`. Copy: `src/i18n/<locale>_studio_<area>.ts`
     for **all 9 locales** (`en zh zh-hant ja ar ru fr de es`). Add a key to the type and all nine
     files in the same change; write real translations (the prototype's Chinese goes into `zh`,
     and `zh-hant` is Traditional Chinese, not a copy of `zh`).
   - Reuse an existing upstream key when the meaning is identical; otherwise add a studio key
     instead of editing upstream locale files (they change hundreds of times a quarter).
   - After adding keys run `npm run i18n:keys` (regenerates `locales/_keys.desktop.json`).
   - Never ship the prototype's designer notes ("原来…", "旧位置…"); say "Mac"/"this device"
     through platform-aware copy.
3. **Tokens, not literals.** Use `--ui-*` tokens and the Studio aliases from
   `src/studio/foundation.css`: `--ui-fill`, `--ui-fill-2`, `--ui-hover`, `--ui-press`,
   `--ui-selected`, `--ui-line`, `--ui-line-2`, `--ui-bg-inspector`, `--ui-bg-recessed`,
   `--ui-accent-text`, `--ui-accent-soft`, `--ui-accent-softer`, `--ui-on-accent`, `--ui-glass`,
   `--ui-glass-strong`, `--ui-menu`, `--ui-scrim`, `--ui-code-background`, `--ui-dot-*`
   (status dots), `--elev-pop|float|soft|win`, `--hairline-hi`, `--studio-ease`,
   `--studio-spring`. Brand colours of third-party platforms are the only allowed hex.
4. **Primitives first.** `Button` (variants default/secondary/outline/ghost/destructive/floating/
   link/text), `Switch`, `SegmentedControl` (sliding thumb, `size="sm"`, `aria-label`),
   `SearchField variant="filled"`, `Badge`, `Kbd`, `Checkbox`, `Select`, `DropdownMenu`/
   `ContextMenu`/`ActionsMenu` (menus paint through `components/ui/menu.ts`), `Popover`,
   `Dialog` (renders as a macOS sheet), `Tip` + `TipKeybindLabel`. Do not fork them; if a
   primitive needs a new capability, add an **additive** prop and note it in your report.
5. **Merge-friendly.** New UI goes in fork-owned files/folders (e.g. `app/chat/sidebar/studio/`,
   `app/chat/composer/activity-tray/`, `store/*-studio.ts`). Edits to upstream files are thin
   call-site swaps. The code-health ratchet caps TypeScript units (CC ≤ 20, ≤ 300 lines/function,
   ≤ 2000 lines/file; units already over may only shrink) — never grow an over-cap unit, extract.
6. **Styles.** Prefer Tailwind classes with tokens. Anything that cannot be expressed that way goes
   in your area file `src/studio/<area>.css` (loaded after `foundation.css`). Do not edit
   `foundation.css` or another area's file — report what you need instead.
7. **Keep test hooks.** Preserve `data-slot`, `data-tour`, `data-tree-*`, roles, accessible names
   used by tests/e2e unless the map says to change them; update the affected tests in the same
   change.

## Build, test, look

```bash
# once per checkout/worktree (from the repo root)
node scripts/build/node-deps.mjs --source . --reuse --workspace apps/desktop

cd apps/desktop
npx tsc -p . --noEmit                    # types
npx vitest run src/<area paths>          # unit tests (the full suite has env-only failures; compare)
npx eslint <changed files>               # lint (pre-commit runs it too)
npm run build                            # renderer + main into dist/
```

Screenshots of the real app (sandboxed: own HERMES_HOME, scripted mock model, never touches
`~/.hermes`):

```bash
SHOTS=${TMPDIR:-/tmp}/hermes-studio-shots
node scripts/studio/shots/run.mjs --seed --native \
  --sandbox $SHOTS/<area> --port <unique port> \
  --out $SHOTS/<area>/out [--only a,b] [--shots scripts/studio/shots/<area>.mjs] [--scheme dark]
```

The backend is this checkout's `.hermes/bin/hermes` (from `source ./activate`; `--hermes`
points elsewhere, `HERMES_RUNTIME_DIR` picks its runtime). `--installs-from <hermes-home>`
reuses another sandbox's prepared environment, `--native` captures the real macOS window
(glass, traffic lights) instead of the renderer. `--seed` creates six conversations (tool
runs, approval, clarify, sub-agents, error); the `live` shot in `chat.mjs` sends one more and
captures it while it waits on a choice. Put
area-specific shots in `scripts/studio/shots/<area>.mjs` (`export default { name: async (page,
{ shot, sleep, openSession, newChat, send, composer }) => {} }`). Use a unique `--port` and
`--sandbox` per parallel run. A test window appears on screen while it runs.

## Commits

Small, reviewable commits on your branch: `studio(<area>): <what>` with the trailer
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Typecheck, lint and the area's
tests pass before each commit.
