document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('content-container');
  const menuBtn   = document.querySelector('.menu');
  const logo      = document.querySelector('.logo');

  const articleFiles = ['article1.md', 'article2.md'];
  let articles = [];
  let currentArticleIndex = 0;
  let isScrolling = false;
  let lastWheelTime = 0;

  /* ===== ① 真实 100 vh ===== */
  function setRealH() {
    const h = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--real-h', `${h}px`);

    // 整屏元素
    container.style.height = `${h}px`;
    document.querySelectorAll('.article-section').forEach(el => {
      el.style.height = `${h}px`;
    });

    // 避免标题区撑空白：把正文高度计算为 h - 标题区
    const titleEl = document.querySelector(`#article-${currentArticleIndex} .article-title-wrapper`);
    if (titleEl) {
      const titleH = titleEl.offsetHeight;
      const bodyEl = document.querySelector(`#article-${currentArticleIndex} .article-content-wrapper`);
      if (bodyEl) bodyEl.style.height = `calc(${h}px - ${titleH}px)`;
    }
  }

  setRealH();
  window.visualViewport?.addEventListener('resize', setRealH);
  window.addEventListener('orientationchange', setRealH);

  /* -------------------------------------------------- */
  function parseFrontMatter(markdown) {
    const m = markdown.match(/^---\s*\n([\s\S]+?)\n---\s*\n/);
    const front = {};
    if (m) {
      m[1].split('\n').forEach(line => {
        const [k, ...vs] = line.split(':');
        if (k) front[k.trim()] = vs.join(':').trim();
      });
    }
    return { frontMatter: front, body: m ? markdown.slice(m[0].length) : markdown };
  }

  async function loadArticles() {
    articles.push({ isHomePage: true, title: 'Ximu的个人博客' });
    const loaded = await Promise.all(
      articleFiles.map(async file => {
        try {
          const md = await fetch(`articles/${file}`).then(r => r.text());
          let { frontMatter, body } = parseFrontMatter(md);
          const h1  = body.match(/^#\s+(.*)/m)?.[1];
          const title = h1 ?? frontMatter.title ?? file.replace('.md', '');
          body = h1 ? body.replace(/^#\s+.*\n?/m, '') : body;
          return { title, htmlContent: marked.parse(body), file };
        } catch (err) {
          console.error(err);
          return { title: '加载失败', htmlContent: `<p>无法加载 ${file}</p>`, file };
        }
      })
    );
    articles = articles.concat(loaded);
    render();
    setupListeners();
  }

  function render() {
    container.innerHTML = '';
    let html = '';
    articles.forEach((a, i) => {
      if (a.isHomePage) {
        html += `<section class="article-section home-section" id="article-${i}">
                   <div class="home-content-wrapper">
                     <h1>Ximu的个人博客</h1>
                     <p>一个记录学习和思考的地方。</p>
                   </div>
                 </section>`;
      } else {
        html += `<section class="article-section" id="article-${i}">
                   <div class="article-title-wrapper">
                     <h1 class="article-title">${a.title}</h1>
                   </div>
                   <div class="article-content-wrapper">
                     <div class="article-content">${a.htmlContent}</div>
                   </div>
                 </section>`;
      }
    });
    container.insertAdjacentHTML('beforeend', html);
    setRealH();           // ② 渲染完立刻重算并消除留白
  }

  function canPageFlip(dir) {
    if (currentArticleIndex === 0 && dir === -1) return false;
    const w = document.querySelector(`#article-${currentArticleIndex} .article-content-wrapper`);
    if (!w) return true;
    const { scrollTop, scrollHeight, clientHeight } = w;
    if (dir === 1) return scrollHeight - scrollTop <= clientHeight + 3;
    return scrollTop <= 3;
  }

  const WHEEL_COOLDOWN = 500;
  function onWheel(e) {
    if (Date.now() - lastWheelTime < WHEEL_COOLDOWN) return;
    lastWheelTime = Date.now();
    if (!canPageFlip(Math.sign(e.deltaY))) return;
    e.preventDefault();
    const next = currentArticleIndex + Math.sign(e.deltaY);
    if (next >= 0 && next < articles.length) navigateToArticle(next);
  }

  function initTouch() {
    const MIN_DIST = 30;
    let s0 = { y: 0, t: 0 };

    document.addEventListener('touchstart', e => {
      s0 = { y: e.touches[0].clientY, t: Date.now() };
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      const wrapper = document.querySelector(`#article-${currentArticleIndex} .article-content-wrapper`);
      if (!wrapper) return;
      const dir = Math.sign(e.touches[0].clientY - s0.y);
      const boundaryOK = canPageFlip(dir);
      if (boundaryOK) e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchend', e => {
      if (isScrolling) return;
      const dy = e.changedTouches[0].clientY - s0.y;
      const du = Date.now() - s0.t;
      if (Math.abs(dy) < MIN_DIST || du > 500) return;
      const dir = Math.sign(dy);
      if (canPageFlip(dir)) {
        const next = currentArticleIndex + dir;
        if (next >= 0 && next < articles.length) navigateToArticle(next);
      }
    }, { passive: true });
  }

  function navigateToArticle(idx, immediate = false) {
    if (isScrolling && !immediate) return;
    isScrolling = true;
    currentArticleIndex = idx;
    document.querySelectorAll('.article-section').forEach((el, i) => {
      const y = (i - idx) * 100;
      el.style.transition = immediate ? 'none' : 'transform .4s cubic-bezier(.76,0,.24,1)';
      el.style.transform = `translateY(${y}vh)`;
    });
    setTimeout(() => {
      isScrolling = false;
      if (immediate) {
        document.querySelectorAll('.article-section').forEach(s => s.style.transition = '');
      }
      setRealH();        // 切页后再算一次
    }, immediate ? 50 : 400);
  }

  function createMenu() {
    if (document.querySelector('.menu-list')) {
      document.querySelector('.menu-list').remove();
      return;
    }
    const div = document.createElement('div');
    div.className = 'menu-list';
    div.innerHTML = '<ul>' +
      articles
        .map((a, i) =>
          !a.isHomePage ? `<li><a href="#" data-idx="${i}">${a.title}</a></li>` : ''
        )
        .join('') +
      '</ul>';
    document.body.appendChild(div);
    div.addEventListener('click', e => {
      if (e.target.tagName === 'A') {
        navigateToArticle(+e.target.dataset.idx);
        div.remove();
      }
    });
    setTimeout(
      () => document.addEventListener('click', () => div.remove(), { once: true }),
      0
    );
  }

  function setupListeners() {
    window.addEventListener('wheel', onWheel, { passive: false });
    initTouch();
    logo.addEventListener('click', e => {
      e.preventDefault();
      navigateToArticle(0);
    });
    menuBtn.addEventListener('click', createMenu);
    navigateToArticle(0, true);
  }

  loadArticles();
});
