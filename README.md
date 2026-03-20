# GestuMemo — Y2K Digital Scrapbook ✂️📷

> 一本住在浏览器里的 Y2K 复古剪贴本

---

## 简介

GestuMemo 是一个交互式数字剪贴簿，带有浓郁的 Y2K 复古美学。你可以在虚拟书页上自由拖放贴纸、拍摄照片、录制音频、写下 Ransom Note 风格的文字，并把整本日记本导出为 PDF 保存。

所有内容自动存入浏览器本地存储，关掉页面再打开，一切都还在。

---

## 功能特性

- **拖拽贴纸** — 50+ 款贴纸（胶带、回形针、大头针、自然元素、复古物件、食物等），随意拖放、旋转、缩放
- **拍照上墙** — 调用摄像头拍摄照片，直接贴到页面上
- **录音片段** — 录制语音备忘，作为音频贴条嵌入页面
- **Ransom Note 文字** — 每个字母随机字体 + 随机颜色，拼贴报纸感
- **普通文字** — Morandi 配色 + 多种字体选择
- **多种纸张** — 方格纸、点状纸、牛皮纸三种页面背景
- **6 页书本** — 左右翻页，每页独立布局
- **导出 PDF** — 一键将整本日记导出为 PDF 文件
- **本地持久化** — 数据存储在浏览器 localStorage，无需账号

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS |
| 动画 | Framer Motion |
| PDF 导出 | jsPDF + html2canvas |
| 图标 | Lucide React |

---

## 快速开始

**前置要求：** Node.js

```bash
# 1. 克隆仓库
git clone https://github.com/veronicaji1024/digital-journaling-book.git
cd digital-journaling-book

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可开始使用。

### 构建生产版本

```bash
npm run build
npm run preview
```

---

## 使用方法

1. **选择工具** — 顶部工具栏选择贴纸、文字、相机或录音
2. **点击页面** — 在书页上点击放置内容
3. **拖拽调整** — 拖动元素移动位置，角落手柄调整大小和旋转
4. **翻页** — 底部箭头切换书页（共 6 页）
5. **导出** — 右上角下载按钮导出 PDF

---

## 项目结构

```
digital-journaling-book/
├── App.tsx              # 主应用逻辑（状态管理、导出）
├── types.ts             # TypeScript 类型定义
├── constants.tsx        # 贴纸库、字体、配色常量
├── utils.ts             # 工具函数
└── components/
    ├── Book.tsx          # 书本翻页容器
    ├── Toolbar.tsx       # 顶部工具栏
    ├── DraggableItem.tsx # 可拖拽元素（贴纸/文字/图片）
    ├── CameraModal.tsx   # 摄像头拍照弹窗
    └── AudioRecorderModal.tsx  # 录音弹窗
```

---

*Made with ✂️ and 📷 — a little Y2K chaos never hurt anyone.*
