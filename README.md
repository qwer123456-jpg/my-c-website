# 大学生学习工具箱

一个使用 React + Vite + Tailwind CSS 构建的纯前端学习工具网站，包含算法笔记、数学建模、课程复习、待办清单、作品展示和学习计划生成器。

## 本地运行

当前项目使用 pnpm 管理依赖：

```bash
pnpm install
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

构建产物会输出到 `dist` 目录。

## 路由说明

项目没有使用 React Router，页面切换由 React 状态控制，因此静态部署后刷新不会因为前端路由路径导致 404。

同时项目已提供静态托管兜底配置：

- Netlify：`public/_redirects` 和 `netlify.toml`
- Vercel：`vercel.json`

## 上传到 GitHub

1. 在 GitHub 新建一个仓库，例如 `student-study-toolbox`。
2. 在本地项目目录执行：

```bash
git remote add origin https://github.com/你的用户名/student-study-toolbox.git
git branch -M main
git push -u origin main
```

如果你使用 GitHub Desktop，也可以选择“Add existing repository”，选中本项目文件夹后发布到 GitHub。

## 部署到 Vercel

1. 打开 [Vercel](https://vercel.com/) 并登录。
2. 点击 `Add New...`，选择 `Project`。
3. 选择刚刚上传到 GitHub 的仓库。
4. Vercel 会读取 `vercel.json`，使用：
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. 点击 `Deploy`。
6. 部署完成后，Vercel 会给出一个公网访问链接。

如需启用真正的 AI 生成学习计划，请在 Vercel 项目的环境变量里添加：

- `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key
- `DEEPSEEK_MODEL`: 可选，默认使用 `deepseek-v4-flash`

## 部署到 Netlify

1. 打开 [Netlify](https://www.netlify.com/) 并登录。
2. 点击 `Add new site`，选择 `Import an existing project`。
3. 选择 GitHub 并授权，选中本仓库。
4. Netlify 会读取 `netlify.toml`，使用：
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. 点击 `Deploy site`。
6. 部署完成后，Netlify 会给出一个公网访问链接。

如需启用真正的 AI 生成学习计划，请在 Netlify 项目的 `Site configuration` -> `Environment variables` 中添加：

- `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key
- `DEEPSEEK_MODEL`: 可选，默认使用 `deepseek-v4-flash`

如果没有设置 `DEEPSEEK_API_KEY`，网站仍可使用，但学习计划会自动退回到本地模板生成。
