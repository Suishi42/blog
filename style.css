document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const menuBtn   = document.querySelector('.menu');
    const logo      = document.querySelector('.logo');

    const articleFiles = ['article1.md', 'article2.md'];
    let articles = [];
    let currentArticleIndex = 0;
    let isScrolling = false;
    let lastWheelTime = 0;

    /* -------------- 解析 Front-Matter -------------- */
    function parseFrontMatter(markdown) {
        const fmMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        if (!fmMatch) return { frontMatter: {}, body: markdown };
        const body     = markdown.substring(fmMatch[0].length);
        const frontMatter = {};
        fmMatch[1].split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                frontMatter[parts[0].trim()] = parts.slice(1).join(':').trim();
            }
        });
        return { frontMatter, body };
    }

    /* -------------- 文章加载 -------------- */
    async function loadArticles() {
        // 首页占位
        articles.push({ isHomePage: true, title: 'Ximu的个人博客' });

        const promises = articleFiles.map(async file => {
            try {
                const res = await fetch(`articles/${file}`);
                if (!res.ok) throw new Error(res.statusText);
                let markdown = await res.text();
                const { frontMatter, body } = parseFrontMatter(markdown);

                // 提取一级标题作为文章标题
                const h1Match = body.match(/^#\s+(.*)/m);
                let title = h1Match ? h1Match[1] : (frontMatter.title || file.replace('.md', ''));
                let cleanBody = h1Match ? body.replace(/^#\s+.*\n?/m, '') : body;

                const htmlContent = marked.parse(cleanBody);
                return { title, htmlContent, file };
            } catch (e) {
                console.error(e);
                return { title: 'Loading Failed', htmlContent: `<p>Could not load ${file}</p>`, file };
            }
        });

        const loaded = await Promise.all(promises);
        articles = articles.concat(loaded);
        render();
        setupEventListeners();
    }

    /* -------------- 渲染 -------------- */
    function render() {
        contentContainer.innerHTML = '';
        let html = '';
        articles.forEach((a, i) => {
            if (a.isHomePage) {
                html += `<section class="article-section home-section" id="article-${i}" style="transform:translateY(${i*100}vh)">
                           <div class="home-content-wrapper">
                             <h1>Ximu的个人博客</h1>
                             <p>一个记录学习和思考的地方。</p>
                           </div>
                         </section>`;
            } else {
                html += `<section class="article-section" id="article-${i}" style="transform:translateY(${i*100}vh)">
                           <div class="article-title-wrapper">
                             <h1 class="article-title">${a.title}</h1>
                           </div>
                           <div class="article-content-wrapper">
                             <div class="article-content">${a.htmlContent}</div>
                           </div>
                         </section>`;
            }
        });
        contentContainer.innerHTML = html;
    }

    /* -------------- 边界判定（滚轮 / 手势共用）-------------- */
    function calcNextIndex(direction) {
        if (currentArticleIndex === 0 && direction === -1) return null;

        const wrapper = document.querySelector(`#article-${currentArticleIndex} .article-content-wrapper`);
        if (!wrapper) return currentArticleIndex + direction; // home

        const { scrollTop, scrollHeight, clientHeight } = wrapper;
        if (direction === 1 && scrollHeight - scrollTop > clientHeight + 5) return null;
        if (direction === -1 && scrollTop !== 0) return null;

        const next = currentArticleIndex + direction;
        return (next >= 0 && next < articles.length) ? next : null;
    }

    /* -------------- 事件监听总入口 -------------- */
    function setupEventListeners() {
        window.addEventListener('wheel', handleWheel, { passive: false });
        initTouchSupport();                     // 新增的触摸控制
        logo.addEventListener('click', e => {
            e.preventDefault();
            navigateToArticle(0);
        });
        menuBtn.addEventListener('click', e => {
            e.stopPropagation();
            createArticleMenu();
        });
        navigateToArticle(0, true);
    }

    /* -------------- 滚轮 -------------- */
    const WHEEL_COOLDOWN = 500;
    function handleWheel(e) {
        e.preventDefault();
        if (Date.now() - lastWheelTime < WHEEL_COOLDOWN) return;
        lastWheelTime = Date.now();

        const next = calcNextIndex(e.deltaY > 0 ? 1 : -1);
        if (next !== null) navigateToArticle(next);
        else {
            const wrapper = document.querySelector(`#article-${currentArticleIndex} .article-content-wrapper`);
            if (wrapper) wrapper.scrollBy({ top: e.deltaY * 2, behavior: 'smooth' });
        }
    }

    /* -------------- 触摸 / 指针手势 -------------- */
    function initTouchSupport() {
        let touch = { startY:0, startX:0, startTime:0, isVertical:null };
        const MIN_DIST = 30;
        const MAX_OFFX  = 50;

        function start(e) {
            if (e.pointerType !== 'touch') return;
            touch.startY = e.clientY;
            touch.startX = e.clientX;
            touch.startTime = Date.now();
            touch.isVertical = null;
        }
        function move(e) {
            if (e.pointerType !== 'touch' || touch.isVertical === false) return;
            if (touch.isVertical === null) {
                const dx = Math.abs(e.clientX - touch.startX);
                const dy = Math.abs(e.clientY - touch.startY);
                if (dy > dx && dy > 10)        touch.isVertical = true;
                else if (dx > 10)              touch.isVertical = false;
            }
            if (touch.isVertical) e.preventDefault();
        }
        function end(e) {
            if (e.pointerType !== 'touch' || touch.isVertical !== true) return;
            const dt   = e.clientY - touch.startY;
            const dur  = Date.now() - touch.startTime;
            if (Math.abs(dt) < MIN_DIST || dur > 600) return;

            const direction = dt < 0 ? 1 : -1;   // ↑ => 下一步
            const next = calcNextIndex(direction);
            if (next !== null) navigateToArticle(next);
        }

        contentContainer.addEventListener('pointerdown', start, { passive:true });
        window.addEventListener('pointermove', move, { passive:false });
        window.addEventListener('pointerup', end, { passive:true });
    }

    /* -------------- 页面切换动画 -------------- */
    function navigateToArticle(index, immediate = false) {
        if (isScrolling && !immediate) return;
        isScrolling = true;
        currentArticleIndex = index;

        document.querySelectorAll('.article-section').forEach((el, i) => {
            const y = (i - index) * 100;
            el.style.transition = immediate ? 'none' : 'transform 0.4s cubic-bezier(0.76,0,0.24,1)';
            el.style.transform  = `translateY(${y}vh)`;
        });

        setTimeout(() => {
            isScrolling = false;
            if (immediate) document.querySelectorAll('.article-section').forEach(s => s.style.transition='');
        }, immediate ? 50 : 400);
    }

    /* -------------- Menu 弹层 -------------- */
    function createArticleMenu() {
        if (document.querySelector('.menu-list')) {
            document.querySelector('.menu-list').remove();
            return;
        }
        const div = document.createElement('div');
        div.className = 'menu-list';
        let html = '<ul>';
        articles.forEach((a, i) => {
            if (!a.isHomePage) html += `<li><a href="#" data-index="${i}">${a.title}</a></li>`;
        });
        html += '</ul>';
        div.innerHTML = html;
        document.body.appendChild(div);

        const remove = () => div.remove();
        const closeOutside = e => {
            if (!div.contains(e.target) && e.target !== menuBtn) remove();
        };
        div.addEventListener('click', e => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                navigateToArticle(parseInt(e.target.dataset.index, 10));
                remove();
            }
        });
        setTimeout(() => document.addEventListener('click', closeOutside, { once:true }), 0);
    }

    /* -------------- 启动 -------------- */
    loadArticles();
});
