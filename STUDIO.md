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
- 前后端之间有接口契约（`DESKTOP_BACKEND_CONTRACT`），而且桌面端连接后端的方式也会随版本变化（v0.22.1 用 `hermes gateway ensure`，v0.22.2 自己启动 `hermes serve`），所以 Studio 必须和后端是同一个上游版本。`studio.sh sync` 做的就是这件事：把 `studio` 分支同步到后端正在运行的那个版本的代码，再重新构建。

## 日常使用

```bash
scripts/studio/studio.sh link      # 第一次：把 hermes-studio 放进 ~/.local/bin
hermes-studio update               # 更新官方 Agent，再同步、构建、安装 Studio
hermes-studio sync                 # 只同步 Studio（Agent 已经更新过时）
hermes-studio status               # 看版本和是否需要同步
hermes-studio build && hermes-studio install   # 只重新构建和安装
```

`sync` 和 `update` 可以加 `--push`，同步后把 `studio` 分支推到 GitHub 上的 fork。`update` 还可以加 `--yes`，自动回答 `hermes update` 的确认提示（不在终端里交互运行时用）。`status` 会显示 Agent 版本、是否需要同步，以及装着的 App 是从哪个提交构建的、是否落后于分支。

## 合并冲突

上游改到了 Studio 也改过的文件时，`sync` 会停下来，列出冲突文件。处理原则：

- **保留 Studio 的界面和样式**：结构、类名、令牌、文案。
- **接受上游的行为**：状态管理、接口调用、新功能逻辑。

解决后运行 `git add -A && git commit --no-edit`，再运行 `hermes-studio build && hermes-studio install`。仓库开启了 `git rerere`，同样的冲突解决过一次，下次会自动复用。

`sync` 不直接合并上游的提交，而是先生成一个「影子提交」：代码和 Agent 当前运行的版本完全一样，父提交是上一次同步的版本，再把它合并进 `studio`。这样每次合并只应用两个版本之间的代码变化，不受上游分支怎么走的影响。v0.22.2 就是这种情况：它是 release/0.22.1 分支的代码，只是把 v0.22.1 记成了父提交，直接合并会把 main 上的改动当成被撤销，以后从 main 发布的版本再合并时，这些改动会被悄悄丢掉。

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
- [x] 第 1 阶段：视觉基础——Studio 主题与令牌、字体、圆角与阴影、macOS 控件、窗口玻璃
- [x] 第 2 阶段：外壳——工具栏、侧栏、状态栏收起、检查器
- [x] 第 3 阶段：对话区——消息、工具行、输入框、活动托盘、空状态、审批
- [x] 第 4 阶段：页面——技能与工具、消息平台、自动化、产物、记忆、看板
- [x] 第 5 阶段：设置窗口
- [x] 第 6 阶段：浮层——⌘K、系统状态、快速提问、HUD、首次启动、通知

所有新增文案都走界面语言，9 种语言（英文、简体中文、繁体中文、日文、阿拉伯文、俄文、法文、德文、西班牙文）都已补齐；时间和日期也按界面语言显示。

## 和原型不一样的地方

**后端还没有对应能力。** 界面不伪造数据，这些位置保持原样或不显示，后端补上后可以接上：

- 回复底部的模型和词元数：后端没有按消息保存。
- Webhook 的编辑、轮换密钥、发送测试事件。
- 消息平台：拒绝配对请求，以及「群组中何时回复」这类后端没有的设置行。
- 产物的「移到废纸篓」、技能的「已通过安全扫描」标记、重命名会话时的「让 Hermes 起名」。
- 后端返回的英文文本：审批理由、平台说明和字段描述、日志内容。

**平台和原生能力。**

- 红绿灯、菜单栏和毛玻璃都是 macOS 原生的；毛玻璃透出窗口背后的内容，颜色随桌面变化。
- 快速提问、HUD 和唤醒提示是独立的系统窗口。
- 窗口很窄（小于 640px）时检查器才改为浮层。
- 只按 macOS 调过外观，Windows 和 Linux 可以运行，但没有单独适配。

**保留了原版的行为。**

- 会话列表最上面一组不加日期标题，分隔线只出现在两组之间。
- 默认配置档案显示为 default 和主页图标。
- 首次启动沿用原版流程：检测到本机安装后直接选择模型提供方（原型先问在哪里运行）。
- 原型没画的能力都保留：布局编辑器和布局模板、插件面板、HUD 模式、机器人工作区（侧栏「机器人」分区）。
- 原来约 50 个设置子页合并成 19 个分类，所有设置项都在，搜索能找到每一项。
- 插件自带的界面只继承新的样式，没有逐个重做。

**按使用反馈调整的地方。**

- 会话列表只放对话（本机和消息平台），不混入定时任务的每次运行；运行记录在「自动化」页对应任务里查看，置顶过的运行仍在「已置顶」。
- 产物页的类型标签栏按内容宽度显示（原型是整行宽，右侧一半空着）。
- 输入框里的模型和推理强度是两个按钮，可以分别选择（原型合在一个「模型 · 强度」按钮里）；浮动的紧凑输入框只放得下模型按钮，推理选项仍在模型菜单里。
- 侧栏毛玻璃（macOS）默认用 popover 材质、36% 着色，侧栏会透出桌面的颜色；原先的 header/titlebar 材质看起来是一片灰。可以在设置的「外观」里调整。

**原版已知问题，没有改动。** 切回一个在后台运行、正在等待审批的会话时，这一回合已经出现的回复会显示两遍。原版 v0.22.1 用同样的步骤也会出现，问题在会话恢复逻辑里，不属于界面改版。

## 截图核对

截图脚本在沙盒里启动构建好的 App（独立的 HERMES_HOME 和模拟模型，不会碰 `~/.hermes`），按原型导览里的场景截图：

```bash
source ./activate                      # 第一次：生成脚本要用的后端启动器
(cd apps/desktop && npm run build)
node scripts/studio/shots/run.mjs --seed --native --out /tmp/studio-shots
```

`--seed` 会造 6 个会话、一个 git 项目和 5 个定时任务；`--scheme dark` 拍深色，`--only chat,new` 只拍部分场景，`--native` 截真实窗口（带毛玻璃和红绿灯）。其他参数见 `apps/desktop/STUDIO-DEV.md`。

端到端测试要在没有运行官方 Hermes 后台网关（launchd 任务 `ai.hermes.gateway`）的 Mac 上跑：网关在运行时，测试沙盒里的网关会因为 `service_identity_unverified` 起不来。
