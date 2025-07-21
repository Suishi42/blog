// main.js
document.addEventListener('DOMContentLoaded', () => {
    const contentStream = document.getElementById('content-stream');
    const indexPanel = document.getElementById('index-panel');
    const lofiToggle = document.getElementById('lofi-toggle');
    const indexButton = document.getElementById('index-button');

    // 1. 获取文章列表
    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(posts => {
            // 2. 遍历列表，为每篇文章创建内容和索引
            posts.forEach(post => {
                // 创建索引链接
                const link = document.createElement('a');
                link.href = `#${post.filename}`;
                link.textContent = post.title;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById(post.filename)?.scrollIntoView({ behavior: 'smooth' });
                    indexPanel.classList.add('hidden'); // 点击后关闭索引
                });
                indexPanel.appendChild(link);

                // 异步获取并渲染文章内容
                loadPost(post.filename);
            });
        })
        .catch(error => {
            console.error('Error fetching post list:', error);
            contentStream.innerHTML = `<article><h1>SYSTEM ERROR</h1><p>Could not load post index. Please check console or run 'node generate-post-list.js'</p></article>`;
        });

    async function loadPost(filename) {
        try {
            const response = await fetch(`posts/${filename}`);
             if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const html = marked.parse(markdown);

            const article = document.createElement('article');
            article.id = filename; // 为文章设置ID，用于锚点跳转

            // 桌面端优化：将标题和内容分开处理
            const titleMatch = html.match(/<h1(.*?)>(.*?)<\/h1>/);
            const titleHTML = titleMatch ? titleMatch[0] : `<h1>${filename.replace(/\.md$/, '').replace(/-/g, ' ')}</h1>`;
            const contentHTML = titleMatch ? html.replace(titleMatch[0], '') : html;

            article.innerHTML = `
                <div class="title-container">
                    ${titleHTML}
                </div>
                <div class="content-container">
                    ${contentHTML}
                </div>
            `;

            contentStream.appendChild(article);

        } catch (error) {
            console.error(`Failed to load post: ${filename}`, error);
            const article = document.createElement('article');
            article.id = filename;
            article.innerHTML = `<h1>Error loading ${filename}</h1><p>${error.message}</p>`;
            contentStream.appendChild(article);
        }
    }

    // 索引面板开关
    indexButton.addEventListener('click', () => {
        indexPanel.classList.toggle('hidden');
    });

    // Lo-Fi模式开关
    lofiToggle.addEventListener('click', () => {
        document.body.classList.toggle('low-fi-mode');
    });
});
