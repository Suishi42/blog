# Ximu的个人博客 - 项目说明

这是一个基于HTML, CSS, 和 JavaScript 构建的生成艺术/未来主义风格的个人博客网站。

## ✨ 特点

- **双栏布局**: 左侧为文章标题，右侧为正文。
- **独特滚动体验**: 右侧正文可以独立滚动。当滚动到底部时，整个页面才会切换到下一篇文章。
- **Markdown驱动**: 通过在 `articles` 文件夹中添加 `.md` 文件来轻松发布新内容。
- **纯静态**: 无需后端或数据库，易于部署和维护。

## 🚀 如何本地运行

1.  由于浏览器安全策略（CORS），直接在本地通过 `file://` 协议打开 `index.html` 可能无法加载文章。
2.  推荐使用一个简单的本地服务器来预览网站。如果你安装了Node.js，可以使用 `http-server` 或 `live-server`。
    - **使用 live-server (推荐)**:
      ```bash
      # 如果没有安装，先全局安装
      npm install -g live-server
      # 在项目根目录运行
      live-server
      ```
    - 浏览器将自动打开 `http://127.0.0.1:8080` (或类似地址)，你就可以看到效果了。

## ✍️ 如何添加新文章

1.  在 `articles` 文件夹中创建一个新的 `.md` 文件 (例如 `my-new-post.md`)。
2.  文件的第一行必须是`# 你的文章标题`，这将作为左侧显示的大标题。
3.  打开 `script.js` 文件。
4.  找到 `articles` 数组，并将你的新文件名添加进去。

    ```javascript
    // script.js

    const articles = [
        'article1.md',
        'article2.md',
        'my-new-post.md' // <-- 在这里添加你的新文件名
    ];
    ```
5.  保存文件，刷新浏览器即可看到新文章。

**未来改进**: `script.js` 可以被修改为自动扫描 `articles` 目录，从而无需手动编辑数组。这需要一个构建步骤或服务器端逻辑，但对于纯静态部署，手动更新列表是最简单直接的方法。

## ☁️ 如何部署到 Cloudflare Pages

1.  **创建 GitHub 仓库**:
    - 在 GitHub 上创建一个新的仓库。
    - 将本项目的所有文件 (`index.html`, `style.css`, `script.js`, `README.md`, `articles/` 文件夹) 上传到该仓库。

2.  **连接到 Cloudflare Pages**:
    - 登录你的 Cloudflare 账户。
    - 在仪表板中，进入 **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**。
    - 选择你刚刚创建的 GitHub 仓库。
    - 在 **Set up builds and deployments** 页面:
        - **Production branch**: 选择 `main` (或你的主分支)。
        - **Build settings**:
            - **Framework preset**: 选择 `None`。
            - **Build command**: 留空。
            - **Build output directory**: 留空 (或填 `/`)。
    - 点击 **Save and Deploy**。

Cloudflare 将会自动从你的 GitHub 仓库拉取文件并部署网站。部署完成后，你将获得一个 `.pages.dev` 的域名。

之后，每当你向 GitHub 仓库的 `articles` 文件夹推送新的文章并更新 `script.js` 后，Cloudflare Pages 都会自动重新部署你的网站。
