document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initSearchOverlay();
    initLiveSearch();
    initTicker();
    initSidebar();
    handleScrollToTop();
    
    if (document.getElementById('featured-container')) {
        renderHomePage();
        initHomeSearch();
    } 
    else if (document.getElementById('category-news-grid')) {
        renderCategoryPage();
    } 
    else if (document.getElementById('article-container')) {
        renderArticlePage();
    } 
    else if (document.getElementById('search-results-grid')) {
        renderSearchPage();
    }
});

function getParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function createCardHTML(article) {
    return `
        <article class="news-card">
            <div class="card-image">
                <a href="article.html?id=${article.id}">
                    <img src="${article.image}" alt="${article.title}">
                </a>
            </div>
            <div class="card-content">
                <div class="badge-container">
                    <span class="badge" style="background:${getCategoryColor(article.category)}">${article.category}</span>
                </div>
                <h3 class="card-title"><a href="article.html?id=${article.id}">${article.title}</a></h3>
                <p class="card-excerpt">${article.content.substring(0, 100)}...</p>
                <div class="meta">
                    <i class="far fa-clock"></i> ${formatDate(article.date)}
                </div>
                <a href="article.html?id=${article.id}" class="read-more">Read Article &rarr;</a>
            </div>
        </article>
    `;
}

function getCategoryColor(cat) {
    switch(cat) {
        case 'politics': return '#d60000';
        case 'technology': return '#0077ff';
        case 'sports': return '#228822';
        case 'business': return '#555555';
        default: return '#d60000';
    }
}

function initHeader() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    
    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('active');
            btn.innerHTML = menu.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
}

function initSearchOverlay() {
    const toggle = document.getElementById('search-toggle');
    const close = document.getElementById('close-search');
    const overlay = document.getElementById('search-overlay');

    if (toggle && overlay) {
        toggle.addEventListener('click', () => {
            overlay.classList.add('active');
            overlay.querySelector('input').focus();
        });
    }

    if (close && overlay) {
        close.addEventListener('click', () => overlay.classList.remove('active'));
    }
}

function initTicker() {
    const tickerContainer = document.getElementById('breaking-ticker');
    if (tickerContainer) {
        const recent = articles.slice(0, 5);
        let html = '';
        recent.forEach(art => {
            html += `<span><a href="article.html?id=${art.id}">${art.title}</a> &nbsp;&nbsp;&bull;&nbsp;&nbsp; </span>`;
        });
        tickerContainer.innerHTML = html;
    }
}

function initSidebar() {
    const trendingList = document.getElementById('trending-list');
    if (trendingList) {
        let html = '';
       articles.slice(0,5).forEach(art => {

            html += `
                <div class="mini-card">
                    <a href="article.html?id=${art.id}">
                        <img src="${art.image}" alt="thumb">
                    </a>
                    <div class="mini-card-content">
                        <h4><a href="article.html?id=${art.id}">${art.title}</a></h4>
                        <span>${formatDate(art.date)}</span>
                    </div>
                </div>
            `;
        });
        trendingList.innerHTML = html;
    }
}

function handleScrollToTop() {
    const btn = document.getElementById('scroll-top');
    if(btn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) btn.style.display = 'block';
            else btn.style.display = 'none';
        });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function renderHomePage() {
    const featured = articles.find(a => a.featured) || articles[0];
    const featuredContainer = document.getElementById('featured-container');
    
    if (featuredContainer && featured) {
        featuredContainer.innerHTML = `
            <div class="featured-card">
                <img src="${featured.image}" alt="${featured.title}">
                <div class="featured-overlay">
                    <span class="badge">${featured.category}</span>
                    <h2 class="featured-title"><a href="article.html?id=${featured.id}" style="color:white">${featured.title}</a></h2>
                    <div class="meta">
                        <span>By ${featured.author}</span> &bull; <span>${formatDate(featured.date)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    const newsGrid = document.getElementById('latest-news-grid');
    if (newsGrid) {
        const items = articles.filter(a => a.id !== featured.id);
        renderWithPagination(items, newsGrid, 'pagination-controls', 8);
    }
}

function renderCategoryPage() {
    const type = getParam('type');
    const container = document.getElementById('category-news-grid');
    const titleEl = document.getElementById('category-title');
    const breadcrumbEl = document.getElementById('breadcrumb-category');
    const countEl = document.getElementById('category-count');

    if (!type) {
        container.innerHTML = '<p>No category specified.</p>';
        return;
    }
    const filtered = articles.filter(a => a.category.toLowerCase() === type.toLowerCase());
    const displayType = type.charAt(0).toUpperCase() + type.slice(1);
    titleEl.textContent = displayType + " News";
    breadcrumbEl.textContent = displayType;
    countEl.textContent = `${filtered.length} articles found`;
    const items = filtered;
    if (items.length === 0) {
        container.innerHTML = '<p>No articles found in this category.</p>';
        const pagination = document.getElementById('pagination-controls');
        if (pagination) pagination.innerHTML = '';
        return;
    }

    renderWithPagination(items, container, 'pagination-controls', 8, { typeParam: 'type', typeValue: type });
}

function renderArticlePage() {
    const id = parseInt(getParam('id'));
    const article = articles.find(a => a.id === id);
    const contentDiv = document.getElementById('article-content');

    if (!article) {
        document.getElementById('article-title').textContent = "Article Not Found";
        contentDiv.innerHTML = "<p>The article you are looking for does not exist.</p>";
        return;
    }
    document.title = `${article.title} - NewsPortal`;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-category-badge').textContent = article.category;
    document.getElementById('article-category-badge').style.background = getCategoryColor(article.category);
    document.getElementById('article-date').textContent = formatDate(article.date);
    const catLink = document.getElementById('article-category-link');
    catLink.textContent = article.category;
    catLink.href = `category.html?type=${article.category}`;
    const img = document.getElementById('article-image');
    img.src = article.image;
    img.style.display = 'block';
    contentDiv.innerHTML = `
        <p class="lead">${article.content}</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <blockquote>"This is a pull quote highlighting a key moment in the story that grabs the reader's attention."</blockquote>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <h3>Looking Ahead</h3>
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    `;
    const relatedGrid = document.getElementById('related-news-grid');
    const related = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
    
    if (related.length > 0) {
        relatedGrid.innerHTML = related.map(article => createCardHTML(article)).join('');
    } else {
        relatedGrid.innerHTML = '<p>No related articles found.</p>';
    }
}

function renderSearchPage() {
    const query = getParam('query') ? getParam('query').toLowerCase() : '';
    const container = document.getElementById('search-results-grid');
    const keywordSpan = document.getElementById('search-keyword');
    const countSpan = document.getElementById('search-count');
    const noResults = document.getElementById('no-results');

    keywordSpan.textContent = query;
    if (!query) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    const results = articles.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.content.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
    );

    countSpan.textContent = `Found ${results.length} articles`;

    if (results.length > 0) {
        noResults.style.display = 'none';
        renderWithPagination(results, container, 'pagination-controls', 8, { queryParam: 'query', queryValue: query });
    } else {
        container.innerHTML = '';
        const pagination = document.getElementById('pagination-controls');
        if (pagination) pagination.innerHTML = '';
        noResults.style.display = 'block';
    }
}

function renderWithPagination(items, container, paginationId, perPage = 8, options = {}) {
    const pagination = document.getElementById(paginationId);
    const currentPage = parseInt(getParam('page')) || 1;
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    const start = (currentPage - 1) * perPage;
    const pageItems = items.slice(start, start + perPage);

    if (pageItems.length > 0) {
        container.innerHTML = pageItems.map(article => createCardHTML(article)).join('');
    } else {
        container.innerHTML = '<p>No articles to display.</p>';
    }

    if (!pagination) return;

    let pagHTML = '';
    if (currentPage > 1) {
        pagHTML += `<button class="page-btn" data-page="${currentPage - 1}">Previous</button>`;
    }
    for (let p = 1; p <= totalPages; p++) {
        pagHTML += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    if (currentPage < totalPages) {
        pagHTML += `<button class="page-btn" data-page="${currentPage + 1}">Next</button>`;
    }

    pagination.innerHTML = pagHTML;

    pagination.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-page');
            if (!target) return;
            const url = new URL(window.location);
            // preserve existing helpful params (type/query) if present in options or url
            if (options.typeParam && options.typeValue) {
                url.searchParams.set(options.typeParam, options.typeValue);
            }
            if (options.queryParam && options.queryValue) {
                url.searchParams.set(options.queryParam, options.queryValue);
            }
            url.searchParams.set('page', target);
            window.location.href = url.toString();
        });
    });
}

function initLiveSearch() {
    const inputs = document.querySelectorAll('input[name="query"]');
    if (!inputs || inputs.length === 0) return;

    inputs.forEach(input => {
        // ensure parent can contain absolute dropdown
        const parent = input.parentElement || document.body;
        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

        const results = document.createElement('div');
        results.className = 'live-search-results';
        results.style.cssText = 'position:absolute; left:0; right:0; top:100%; background:#fff; border:1px solid #ddd; max-height:320px; overflow:auto; z-index:9999; display:none; box-shadow:0 4px 12px rgba(0,0,0,0.08);';
        parent.appendChild(results);

        let lastQuery = '';
        input.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            if (!q) { results.style.display = 'none'; return; }
            if (q === lastQuery) return;
            lastQuery = q;

            const matches = articles.filter(a => a.title.toLowerCase().includes(q)).slice(0, 8);
            if (matches.length === 0) {
                results.innerHTML = '<div style="padding:10px;color:#666">No results</div>';
                results.style.display = 'block';
                return;
            }

            results.innerHTML = matches.map(a => `
                <a href="article.html?id=${a.id}" class="live-search-item" style="display:block;padding:10px 12px;border-bottom:1px solid #f1f1f1;color:#222;text-decoration:none;"><strong>${a.title}</strong><div style="font-size:12px;color:#666;margin-top:4px">${formatDate(a.date)} — ${a.category}</div></a>
            `).join('');
            results.style.display = 'block';
        });

        // keyboard: enter goes to first match
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = results.querySelector('a');
                if (first) {
                    e.preventDefault();
                    window.location.href = first.href;
                }
            }
        });

        // hide when clicking outside
        document.addEventListener('click', (ev) => {
            if (!parent.contains(ev.target)) results.style.display = 'none';
        });
    });
}

function initHomeSearch() {
    // Find sidebar search input on home page
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const searchForm = sidebar.querySelector('.search-widget form');
    if (!searchForm) return;

    const searchInput = searchForm.querySelector('input[name="query"]');
    const newsGrid = document.getElementById('latest-news-grid');
    const paginationControls = document.getElementById('pagination-controls');

    if (!searchInput || !newsGrid) return;

    // Store original featured-excluded articles
    const featured = articles.find(a => a.featured) || articles[0];
    const allItems = articles.filter(a => a.id !== featured.id);

    searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();

        if (!q) {
            // No query: show normal paginated view
            renderWithPagination(allItems, newsGrid, 'pagination-controls', 8);
            return;
        }

        // Filter by title matching
        const filtered = allItems.filter(a => a.title.toLowerCase().includes(q));

        if (filtered.length === 0) {
            newsGrid.innerHTML = '<p>No articles found matching your search.</p>';
            if (paginationControls) paginationControls.innerHTML = '';
            return;
        }

        // Show all filtered results without pagination (or with pagination if many)
        const perPage = 8;
        renderWithPagination(filtered, newsGrid, 'pagination-controls', perPage);
    });

    // Prevent form submission and filter instead
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim().toLowerCase();
        if (!q) return;

        const filtered = allItems.filter(a => a.title.toLowerCase().includes(q));
        if (filtered.length === 0) {
            newsGrid.innerHTML = '<p>No articles found matching your search.</p>';
            if (paginationControls) paginationControls.innerHTML = '';
            return;
        }

        renderWithPagination(filtered, newsGrid, 'pagination-controls', 8);
    });
}