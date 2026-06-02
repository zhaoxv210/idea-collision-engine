# ⚡ Idea Collision Engine

> **AI 驱动的可视化思维画板** - 让想法在画布上碰撞，激发创意火花

[![GitHub stars](https://img.shields.io/github/stars/zhaoxv210/idea-collision-engine?style=social)](https://github.com/zhaoxv210/idea-collision-engine/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/zhaoxv210/idea-collision-engine?style=social)](https://github.com/zhaoxv210/idea-collision-engine/network/members)

---

## 🎯 这是什么？

Idea Collision Engine 是一个**可视化思维画板**，你可以：

- 📌 在画布上添加想法节点
- 🔗 手动或让 AI 建立节点之间的连接
- ⚡ 选中多个节点，让 AI 生成**创意火花**
- 💡 点击火花展开为具体的创意方案

**核心理念**：不是让 AI 替你思考，而是让 AI 帮你发现**想法之间隐藏的联系**。

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/zhaoxv210/idea-collision-engine.git
cd idea-collision-engine
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:5173/

### 4. 配置 LLM

点击右上角「配置」按钮，选择你的 LLM Provider：

| Provider | 说明 |
|----------|------|
| **OpenAI** | 需要 API Key，支持 GPT-4o |
| **Ollama** | 本地运行，完全免费 |
| **自定义 API** | 支持 DeepSeek、智谱、Moonshot 等 |

---

## 🎮 使用方法

### 基础操作

1. **添加节点** - 在左侧面板输入想法，点击 **+** 添加
2. **拖拽节点** - 在画布上自由拖动节点
3. **连接节点** - 从节点的连接点拖拽到另一个节点
4. **删除节点** - 悬停在节点上，点击右上角的 **×**

### 多选节点

- 按住 **Shift** 或 **Ctrl** 点击节点可多选
- 支持框选（拖拽选择区域）

### ⚡ Idea Spark（创意火花）

1. 选中 **2 个或更多节点**
2. 点击右侧面板的 **"⚡ Idea Spark"**
3. AI 会生成创意火花，如：
   ```
   AI × 教育 → 自动导师系统
   AI × 教育 × 游戏 → 游戏化学习平台
   ```
4. 点击任意火花，AI 会展开为 **2-3 个具体方案**
5. 点击方案即可添加为新节点

### AI 推荐连接

- 点击 **"AI 推荐连接"** 让 AI 分析节点并建议有意义的连接
- 点击任意连线，再点击 **"AI 解释连接"** 获取关系解释

---

## 🛠️ 技术栈

- **React 18** + **TypeScript**
- **Vite** - 极速开发体验
- **React Flow** - 节点画布
- **Zustand** - 状态管理
- **Tailwind CSS** - 样式
- **LLM** - OpenAI / Ollama / 自定义 API

---

## 📸 截图

> 在画布上构建你的思维网络

![Idea Canvas](https://via.placeholder.com/800x400/0A0B0E/E8DCC4?text=Idea+Canvas)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

```bash
# 开发
npm run dev

# 类型检查
npm run check

# 构建
npm run build
```

---

## 📝 License

MIT

---

## ⭐ Star History

如果这个项目对你有帮助，请给一个 ⭐ Star！

[![Star History Chart](https://api.star-history.com/svg?repos=zhaoxv210/idea-collision-engine&type=Date)](https://star-history.com/#zhaoxv210/idea-collision-engine&Date)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/zhaoxv210">zhaoxv210</a>
</p>
