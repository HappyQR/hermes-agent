# Hermes Studio

Hermes Studio 是 Hermes Desktop 的 macOS 原生风格改版。这个仓库是 [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) 的 fork，改版全部在 `studio` 分支上。

## 它是怎么工作的

```
~/.hermes/hermes-agent          官方 Hermes Agent（后端），照常 `hermes update`
~/.hermes/                      配置、会话、记忆——官方 App、命令行、Studio 共用
~/Projects/hermes-studio        这个 fork，`studio` 分支只改 apps/desktop
/Applications/Hermes Studio.app 从 fork 构建的 App，连接上面的官方后端
```

- Studio 不内置后端。启动时它找到 `~/.hermes/hermes-agent`，用 `hermes gateway ensure` 连上本机网关，和官方 Hermes.app 用的是同一个网关、同一份数据。
- Studio 有自己的应用标识（`com.nousresearch.hermes-studio`）和本地设置目录（`~/Library/Application Support/Hermes Studio`），可以和官方 Hermes.app 同时安装。
- `hermes update` 不会碰 Studio：官方更新只刷新 `Hermes.app`，而 Studio 的构建标记是 `updateMechanism: external`，App 内也不会自己去跑官方更新。
- 前后端之间有接口契约（`DESKTOP_BACKEND_CONTRACT`），所以 Studio 必须和后端是同一个上游版本。`studio.sh sync` 做的就是这件事：把后端正在运行的那个上游提交合进 `studio` 分支，再重新构建。

## 日常使用

```bash
scripts/studio/studio.sh link      # 第一次：把 hermes-studio 放进 ~/.local/bin
hermes-studio update               # 更新官方 Agent，再同步、构建、安装 Studio
hermes-studio sync                 # 只同步 Studio（Agent 已经更新过时）
hermes-studio status               # 看版本和是否需要同步
hermes-studio build && hermes-studio install   # 只重新构建和安装
```

`sync` 和 `update` 可以加 `--push`，同步后把 `studio` 分支推到 GitHub 上的 fork。

## 合并冲突

上游改到了 Studio 也改过的文件时，`sync` 会停下来，列出冲突文件。处理原则：

- **保留 Studio 的界面和样式**：结构、类名、令牌、文案。
- **接受上游的行为**：状态管理、接口调用、新功能逻辑。

解决后运行 `git add -A && git commit --no-edit`，再运行 `hermes-studio build && hermes-studio install`。仓库开启了 `git rerere`，同样的冲突解决过一次，下次会自动复用。

## 在另一台 Mac 上安装

1. 按官方方式安装 Hermes Agent，得到 `~/.hermes/hermes-agent`。
2. 准备好 Node.js 22+、git 和 Xcode 命令行工具（`xcode-select --install`，签名要用）。
3. 克隆并同步：

   ```bash
   git clone -b studio https://github.com/HappyQR/hermes-agent.git ~/Projects/hermes-studio
   cd ~/Projects/hermes-studio
   git remote add upstream https://github.com/NousResearch/hermes-agent.git
   scripts/studio/studio.sh link
   hermes-studio sync
   ```

`sync` 会把那台机器上 Agent 的版本合进来，然后构建并安装 App。

## 改版进度

设计稿：Hermes Desktop 重设计原型（claude.ai 私有 Artifact）。落地分阶段进行，每个阶段都单独提交。

- [x] 第 0 阶段：fork、Studio 身份、更新方式、同步脚本
- [ ] 第 1 阶段：视觉基础——Studio 主题与令牌、字体、圆角与阴影、macOS 控件、窗口玻璃
- [ ] 第 2 阶段：外壳——工具栏、侧栏、状态栏收起、检查器
- [ ] 第 3 阶段：对话区——消息、工具行、输入框、活动托盘、空状态、审批
- [ ] 第 4 阶段：页面——技能与工具、消息平台、自动化、产物、记忆、看板
- [ ] 第 5 阶段：设置窗口
- [ ] 第 6 阶段：浮层——⌘K、系统状态、快速提问、HUD、首次启动、通知
