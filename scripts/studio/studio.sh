#!/usr/bin/env bash
# Hermes Studio — keep the redesigned desktop app in step with the installed
# Hermes Agent.
#
# The agent stays an official install (~/.hermes/hermes-agent, updated by
# `hermes update`). This fork only carries the desktop redesign on the
# `studio` branch. `sync` merges the exact upstream commit the agent runs into
# that branch, so the app and its backend always speak the same protocol, then
# rebuilds and reinstalls /Applications/Hermes Studio.app.
#
#   studio.sh update   [--skip-agent] [--push]   hermes update, then sync
#   studio.sh sync     [--no-build] [--push]     merge the agent's commit, build, install
#   studio.sh build                               deps + renderer + packaged .app
#   studio.sh install                             copy the built app into place
#   studio.sh status                              versions and what a sync would do
#   studio.sh link                                put `hermes-studio` on PATH (~/.local/bin)
#   studio.sh open                                launch the installed app
set -euo pipefail

SELF="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
REPO="$(cd "$SELF/../.." && pwd)"
DESKTOP="$REPO/apps/desktop"
AGENT_ROOT="${HERMES_STUDIO_AGENT_ROOT:-${HERMES_HOME:-$HOME/.hermes}/hermes-agent}"
BRANCH="${HERMES_STUDIO_BRANCH:-studio}"
UPSTREAM="${HERMES_STUDIO_UPSTREAM:-upstream}"
APP_NAME="Hermes Studio"
INSTALL_DIR="${HERMES_STUDIO_INSTALL_DIR:-/Applications}"
INSTALLED_APP="$INSTALL_DIR/$APP_NAME.app"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
warn() { printf '\033[33m! %s\033[0m\n' "$*" >&2; }
die() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit "${2:-1}"; }

git_repo() { git -C "$REPO" "$@"; }

agent_python() {
  local py="$AGENT_ROOT/venv/bin/python"
  [ -x "$py" ] || py="$(command -v python3)"
  printf '%s' "$py"
}

# The commit the installed agent runs, and a human label for it.
agent_target() {
  [ -d "$AGENT_ROOT/.git" ] || die "No Hermes Agent checkout at $AGENT_ROOT (set HERMES_STUDIO_AGENT_ROOT)."
  git -C "$AGENT_ROOT" rev-parse HEAD
}
agent_label() {
  git -C "$AGENT_ROOT" describe --tags --exact-match HEAD 2>/dev/null \
    || git -C "$AGENT_ROOT" rev-parse --short HEAD
}

require_clean_branch() {
  local current
  current="$(git_repo branch --show-current)"
  [ "$current" = "$BRANCH" ] || die "The Studio checkout is on '$current'; switch to '$BRANCH' first."
  if [ -n "$(git_repo status --porcelain --untracked-files=no)" ]; then
    die "The Studio checkout has uncommitted changes. Commit or stash them, then run sync again."
  fi
  if [ -e "$(git_repo rev-parse --git-path MERGE_HEAD)" ]; then
    die "A merge is in progress. Resolve it (git status), commit, then run: studio.sh build && studio.sh install"
  fi
}

cmd_status() {
  local target label
  target="$(agent_target)"
  label="$(agent_label)"
  bold "Hermes Studio"
  info "Studio checkout : $REPO ($(git_repo branch --show-current) @ $(git_repo rev-parse --short HEAD))"
  info "Hermes Agent    : $AGENT_ROOT ($label)"
  if git_repo cat-file -e "$target^{commit}" 2>/dev/null && git_repo merge-base --is-ancestor "$target" HEAD; then
    info "Sync            : up to date — the studio branch already contains $label"
  else
    info "Sync            : needed — run 'studio.sh sync' to merge $label"
  fi
  if [ -d "$INSTALLED_APP" ]; then
    local built
    built="$(plutil -extract CFBundleShortVersionString raw "$INSTALLED_APP/Contents/Info.plist" 2>/dev/null || echo '?')"
    info "Installed app   : $INSTALLED_APP (version $built)"
  else
    info "Installed app   : not installed yet (run 'studio.sh build && studio.sh install')"
  fi
}

cmd_merge() {
  local target label
  target="$(agent_target)"
  label="$(agent_label)"
  require_clean_branch
  bold "Fetching $UPSTREAM"
  git_repo fetch "$UPSTREAM" --tags --quiet
  if ! git_repo cat-file -e "$target^{commit}" 2>/dev/null; then
    git_repo fetch "$UPSTREAM" "$target" --quiet \
      || die "Commit $target (the agent's HEAD) is not on $UPSTREAM. Is the agent on a private branch?"
  fi
  if git_repo merge-base --is-ancestor "$target" HEAD; then
    info "Already contains $label — nothing to merge."
    return 0
  fi
  bold "Merging $label into $BRANCH"
  if ! git_repo -c rerere.enabled=true -c rerere.autoupdate=true merge --no-edit -m "studio: merge upstream $label" "$target"; then
    warn "Merge stopped on conflicts:"
    git_repo diff --name-only --diff-filter=U | sed 's/^/    /' >&2
    cat >&2 <<EOF

  Resolve the files above (keep the Studio design, take upstream behaviour),
  then:  git -C "$REPO" add -A && git -C "$REPO" commit --no-edit
         "$SELF/studio.sh" build && "$SELF/studio.sh" install
  To give up on this merge instead:  git -C "$REPO" merge --abort
EOF
    exit 2
  fi
  info "Merged $label."
}

cmd_build() {
  bold "Installing Node dependencies"
  node "$REPO/scripts/build/node-deps.mjs" --source "$REPO" --reuse --workspace apps/desktop
  bold "Building the renderer and main process"
  (cd "$DESKTOP" && npm run build --silent)
  bold "Packaging $APP_NAME.app"
  rm -rf "$DESKTOP/release/mac-arm64" "$DESKTOP/release/mac"
  (cd "$DESKTOP" && CSC_IDENTITY_AUTO_DISCOVERY=false npm run builder --silent -- --dir --publish never)
  local app
  app="$(built_app)"
  [ -n "$app" ] || die "electron-builder produced no $APP_NAME.app under $DESKTOP/release"
  bold "Signing (ad-hoc)"
  sign_app "$app"
  info "Built $app"
}

built_app() {
  local candidate
  for candidate in "$DESKTOP/release/mac-arm64/$APP_NAME.app" "$DESKTOP/release/mac/$APP_NAME.app"; do
    [ -d "$candidate" ] && { printf '%s' "$candidate"; return 0; }
  done
  return 0
}

# Inside-out ad-hoc signing with the repo's entitlements, exactly as
# `hermes desktop` signs a local build (a plain --deep signature would strip
# the JIT entitlement and reset privacy grants on every rebuild).
sign_app() {
  local app="$1"
  if PYTHONPATH="$REPO" "$(agent_python)" - "$app" "$DESKTOP" <<'PY'
import sys
from pathlib import Path
from hermes_cli.main_desktop import _desktop_macos_local_codesign
sys.exit(0 if _desktop_macos_local_codesign(Path(sys.argv[1]), desktop_dir=Path(sys.argv[2])) else 1)
PY
  then
    return 0
  fi
  warn "Falling back to a plain ad-hoc signature."
  codesign --force --deep --sign - "$app"
}

cmd_install() {
  local app
  app="$(built_app)"
  [ -n "$app" ] || die "Nothing to install — run 'studio.sh build' first."
  if pgrep -xq "$APP_NAME"; then
    bold "Quitting the running $APP_NAME"
    osascript -e "quit app \"$APP_NAME\"" >/dev/null 2>&1 || true
    for _ in $(seq 1 30); do pgrep -xq "$APP_NAME" || break; sleep 0.5; done
    pgrep -xq "$APP_NAME" && die "$APP_NAME is still running; quit it and run install again."
  fi
  bold "Installing to $INSTALLED_APP"
  mkdir -p "$INSTALL_DIR"
  rm -rf "$INSTALLED_APP.studio-new"
  ditto "$app" "$INSTALLED_APP.studio-new"
  rm -rf "$INSTALLED_APP"
  mv "$INSTALLED_APP.studio-new" "$INSTALLED_APP"
  info "Installed. Open it with: open -a \"$INSTALLED_APP\""
}

cmd_sync() {
  local build=1 push=0
  for arg in "$@"; do
    case "$arg" in
      --no-build) build=0 ;;
      --push) push=1 ;;
      *) die "Unknown sync option: $arg" ;;
    esac
  done
  cmd_merge
  if [ "$build" = 1 ]; then
    cmd_build
    cmd_install
  fi
  if [ "$push" = 1 ]; then
    bold "Pushing $BRANCH to origin"
    git_repo push origin "$BRANCH"
  fi
}

cmd_update() {
  local skip_agent=0 sync_args=()
  for arg in "$@"; do
    case "$arg" in
      --skip-agent) skip_agent=1 ;;
      *) sync_args+=("$arg") ;;
    esac
  done
  if [ "$skip_agent" = 0 ]; then
    bold "Updating Hermes Agent (hermes update)"
    command -v hermes >/dev/null || die "'hermes' is not on PATH."
    hermes update
  fi
  cmd_sync "${sync_args[@]+"${sync_args[@]}"}"
}

cmd_link() {
  mkdir -p "$HOME/.local/bin"
  ln -sf "$SELF/studio.sh" "$HOME/.local/bin/hermes-studio"
  info "Linked $HOME/.local/bin/hermes-studio → $SELF/studio.sh"
}

case "${1:-status}" in
  update) shift; cmd_update "$@" ;;
  sync) shift; cmd_sync "$@" ;;
  build) cmd_build ;;
  install) cmd_install ;;
  status) cmd_status ;;
  link) cmd_link ;;
  open) open -a "$INSTALLED_APP" ;;
  -h|--help|help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//' ;;
  *) die "Unknown command: $1 (try: update, sync, build, install, status, link, open)" ;;
esac
