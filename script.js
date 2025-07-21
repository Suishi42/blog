document.addEventListener('DOMContentLoaded', () => {
    const contentContainer = document.getElementById('content-container');
    const menuBtn = document.querySelector('.menu');
    const logo = document.querySelector('.logo');

    const articleFiles = [
        'article1.md',
        'article2.md'
    ];

    let articles = [];
    let currentArticleIndex = 0;
    let isScrolling = false;
    let lastWheelTime = 0;

    function parseFrontMatter(markdown) {
        const frontMatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
        if (!frontMatterMatch) {
            return { frontMatter: {}, body: markdown };
        }
        const frontMatterBlock = frontMatterMatch[1];
        const body = markdown.substring(frontMatterMatch[0].length);
        const frontMatter = {};
        frontMatterBlock.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                frontMatter[key] = value;
            }
        });
        return { frontMatter, body };
    }

    async function loadArticles() {
        articles.push({
            isHomePage: true,
            title: 'Ximu的个人博客'
        });

        const articlePromises = articleFiles.map(async (file) => {
            try {
                const response = await fetch(`articles/${file}`);
                if (!response.ok) throw new Error(`Network response was not ok for ${file}`);
                const markdown = await response.text();
                let { frontMatter, body } = parseFrontMatter(markdown);
                
                const h1Match = body.match(/^#\s+(.*)/m);
                const title = h1Match ? h1Match[1] : (frontMatter.title || file.replace('.md', ''));
                
                // Remove the H1 title from the body before rendering
                if (h1Match) {
                    body = body.replace(/^#\s+(.*)\n?/, '');
                }

                const htmlContent = marked.parse(body);
                return { title, htmlContent, file };
            } catch (error) {
                console.error(`Failed to load article ${file}:`, error);
                return { title: 'Loading Failed', htmlContent: `<p>Could not load ${file}.</p>`, file };
            }
        });

        const loadedArticles = await Promise.all(articlePromises);
        articles = articles.concat(loadedArticles);
        
        render();
        setupEventListeners();
    }

    function render() {
        contentContainer.innerHTML = '';
        let sectionHTML = '';
        articles.forEach((article, index) => {
            if (article.isHomePage) {
                sectionHTML += `
                    <section class="article-section home-section" id="article-${index}" style="transform: translateY(${index * 100}vh);">
                        <div class="home-content-wrapper"><h1>Ximu的个人博客</h1><p>一个记录学习和思考的地方。</p></div>
                    </section>
                `;
            } else {
                sectionHTML += `
                    <section class="article-section" id="article-${index}" style="transform: translateY(${index * 100}vh);">
                        <div class="article-title-wrapper">
                            <h1 class="article-title">${article.title}</h1>
                        </div>
                        <div class="article-content-wrapper">
                            <div class="article-content">${article.htmlContent}</div>
                        </div>
                    </section>
                `;
            }
        });
        contentContainer.innerHTML = sectionHTML;
    }

    function setupEventListeners() {
        window.addEventListener('wheel', handleWheel, { passive: false });
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToArticle(0);
        });
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            createArticleMenu();
        });
        navigateToArticle(0, true);
    }

    function handleWheel(e) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTime < 500) return;
        lastWheelTime = now;

        const direction = e.deltaY > 0 ? 1 : -1;
        if (currentArticleIndex === 0 && direction === -1) return;

        const contentWrapper = document.querySelector(`#article-${currentArticleIndex} .article-content-wrapper`);
        if (!contentWrapper) {
             const nextIndex = currentArticleIndex + direction;
             if (nextIndex >= 0 && nextIndex < articles.length) navigateToArticle(nextIndex);
             return;
        }

        const { scrollTop, scrollHeight, clientHeight } = contentWrapper;
        if ((direction === 1 && scrollHeight - scrollTop <= clientHeight + 5) || (direction === -1 && scrollTop === 0)) {
            const nextIndex = currentArticleIndex + direction;
            if (nextIndex >= 0 && nextIndex < articles.length) navigateToArticle(nextIndex);
        } else {
            contentWrapper.scrollBy({ top: e.deltaY * 2, behavior: 'smooth' });
        }
    }

    function navigateToArticle(index, immediate = false) {
        if (isScrolling && !immediate) return;
        isScrolling = true;
        currentArticleIndex = index;
        
        document.querySelectorAll('.article-section').forEach((section, i) => {
            const newTransform = `translateY(${(i - index) * 100}vh)`;
            section.style.transition = immediate ? 'none' : 'transform 0.8s cubic-bezier(0.76, 0, 0.24, 1)';
            section.style.transform = newTransform;
        });

        setTimeout(() => {
            isScrolling = false;
            if (immediate) document.querySelectorAll('.article-section').forEach(s => s.style.transition = '');
        }, immediate ? 50 : 800);
    }

    function createArticleMenu() {
        const existingMenu = document.querySelector('.menu-list');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-list';
        
        let menuHtml = '<ul>';
        articles.forEach((article, index) => {
            if (!article.isHomePage) {
                menuHtml += `<li><a href="#" data-index="${index}">${article.title}</a></li>`;
            }
        });
        menuHtml += '</ul>';
        menuContainer.innerHTML = menuHtml;
        document.body.appendChild(menuContainer);

        const closeMenu = () => {
            if(menuContainer.parentElement) menuContainer.remove();
            document.removeEventListener('click', closeMenuOnClickOutside);
        };

        const closeMenuOnClickOutside = (e) => {
            if (!menuContainer.contains(e.target) && e.target !== menuBtn) closeMenu();
        };

        menuContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const articleIndex = parseInt(e.target.dataset.index, 10);
                navigateToArticle(articleIndex);
                closeMenu();
            }
        });
        
        setTimeout(() => document.addEventListener('click', closeMenuOnClickOutside), 0);
    }

    loadArticles();
});
