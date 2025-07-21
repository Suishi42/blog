document.addEventListener('DOMContentLoaded', () => {
    const contentStream = document.getElementById('content-stream');
    const indexPanel = document.getElementById('index-panel');
    const indexButton = document.getElementById('index-button');

    const postFiles = ['article-1.md', 'another-post.md'];

    const loadPosts = async () => {
        for (const postFile of postFiles) {
            const response = await fetch(`posts/${postFile}`);
            const markdown = await response.text();
            const html = marked.parse(markdown);

            const article = document.createElement('article');
            article.id = postFile.replace('.md', '');

            if (window.innerWidth >= 1024) {
                // Desktop layout
                const titleMatch = markdown.match(/^#\s(.+)/);
                const title = titleMatch ? titleMatch[1] : 'Untitled';

                article.innerHTML = `
                    <div class="title-container">
                        <h1>${title}</h1>
                    </div>
                    <div class="content-container">
                        ${html.replace(/^<h1>.*<\/h1>/, '')}
                    </div>
                `;
            } else {
                // Mobile layout
                const titleMatch = markdown.match(/^#\s(.+)/);
                const title = titleMatch ? titleMatch[1] : 'Untitled';

                article.innerHTML = `
                    <section class="snap-card title-card"><h1>${title}</h1></section>
                    <section class="snap-card content-card">
                        <div class="scrollable-content">${html.replace(/^<h1>.*<\/h1>/, '')}</div>
                    </section>
                `;
            }
            contentStream.appendChild(article);

            // Add to index
            const link = document.createElement('a');
            link.href = `#${article.id}`;
            const titleMatch = markdown.match(/^#\s(.+)/);
            link.textContent = titleMatch ? titleMatch[1] : 'Untitled';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById(article.id).scrollIntoView({ behavior: 'smooth' });
                indexPanel.classList.add('hidden');
            });
            indexPanel.appendChild(link);
        }

        // Smooth scroll observer
        const articles = document.querySelectorAll('article');
        articles.forEach((article, index) => {
            if (index < articles.length - 1) {
                const observer = new IntersectionObserver(entries => {
                    if (entries[0].isIntersecting) {
                        // We don't auto-scroll, we let the user do it.
                        // This can be enhanced later.
                    }
                }, { threshold: 0.5 }); // Adjust threshold as needed

                const sentinel = document.createElement('div');
                sentinel.style.height = '1px';
                article.querySelector('.content-container, .scrollable-content').appendChild(sentinel);
                observer.observe(sentinel);
            }
        });
    };

    indexButton.addEventListener('click', () => {
        indexPanel.classList.toggle('hidden');
    });

    loadPosts();
});
