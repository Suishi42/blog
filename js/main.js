document.addEventListener('DOMContentLoaded', () => {
    const postFiles = ['article-1.md', 'another-post.md'];
    const contentStream = document.getElementById('content-stream');
    const indexPanel = document.getElementById('index-panel');
    const indexButton = document.getElementById('index-button');

    const isMobile = () => window.innerWidth <= 767;

    const loadPosts = async () => {
        for (const postFile of postFiles) {
            try {
                const response = await fetch(`posts/${postFile}`);
                if (!response.ok) throw new Error(`Failed to fetch ${postFile}`);
                const markdown = await response.text();
                const html = marked.parse(markdown);
                
                const article = document.createElement('article');
                article.id = postFile.replace('.md', '');

                if (isMobile()) {
                    // Mobile: Snap-card layout
                    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
                    const title = titleMatch ? titleMatch[1] : 'Untitled';
                    const titleCard = document.createElement('section');
                    titleCard.className = 'snap-card title-card';
                    titleCard.innerHTML = `<h1>${title}</h1>`;

                    const contentCard = document.createElement('section');
                    contentCard.className = 'snap-card content-card';
                    const scrollableDiv = document.createElement('div');
                    scrollableDiv.className = 'scrollable-content';
                    scrollableDiv.innerHTML = html;
                    contentCard.appendChild(scrollableDiv);
                    
                    article.appendChild(titleCard);
                    article.appendChild(contentCard);

                } else {
                    // Desktop: Sticky title layout
                    const titleContainer = document.createElement('div');
                    titleContainer.className = 'title-container';
                    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
                    if(titleMatch) titleContainer.innerHTML = titleMatch[0];


                    const contentContainer = document.createElement('div');
                    contentContainer.className = 'content-container';
                    contentContainer.innerHTML = html;

                    article.appendChild(titleContainer);
                    article.appendChild(contentContainer);
                }

                contentStream.appendChild(article);

                // Add to index panel
                const link = document.createElement('a');
                const linkTitleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
                link.textContent = linkTitleMatch ? linkTitleMatch[1] : postFile;
                link.href = `#${article.id}`;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById(article.id).scrollIntoView({ behavior: 'smooth' });
                    indexPanel.classList.remove('visible');
                });
                indexPanel.appendChild(link);

            } catch (error) {
                console.error('Error loading post:', error);
                const errorEl = document.createElement('p');
                errorEl.textContent = `Could not load ${postFile}.`;
                contentStream.appendChild(errorEl);
            }
        }
        setupIntersectionObserver();
    };

    const setupIntersectionObserver = () => {
        if (isMobile()) return; // Only for desktop

        const articles = document.querySelectorAll('#content-stream article');
        if (articles.length <= 1) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const nextArticle = entry.target.parentElement.nextElementSibling;
                    if (nextArticle) {
                        // Smooth scroll to the next article's title
                        const nextTitle = nextArticle.querySelector('.title-container');
                        if(nextTitle) {
                           // This is a bit tricky, a direct scroll might be jarring.
                           // For now, we just detect it. A more advanced implementation
                           // could hijack the scroll.
                        }
                    }
                }
            });
        }, { threshold: 0.9 }); // 90% of the article content is visible

        articles.forEach(article => {
            const content = article.querySelector('.content-container');
            if(content) observer.observe(content);
        });
    };

    indexButton.addEventListener('click', () => {
        indexPanel.classList.toggle('visible');
    });

    loadPosts();
});
