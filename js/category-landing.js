/* ============================================================
   App.CategoryLanding — Commerce Category Landing Page Engine
   ============================================================
   - Renders category hero/banner on shop page when a category is active
   - Breadcrumb navigation (Home → Category → Subcategory)
   - Category context header with title, description, product count
   - Subcategory navigation header (supplementing sidebar pills)
   - Fully event-driven — responds to categoryChanged / categoriesLoaded
   - Safe: does NOT touch cart, checkout, PDP, addToCart, App.Auth, App.UI
   ============================================================ */

'use strict';

(function () {

  /* ─── CONFIG ────────────────────────────────────────────── */
  const SHOP_PAGE = 'handicrafts.html';

  /* ─── HELPERS ────────────────────────────────────────────── */
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getCategories() {
    return window.App && window.App.Categories ? window.App.Categories : null;
  }

  function isShopPage() {
    return /handicrafts\.html/i.test(window.location.pathname) ||
           document.getElementById('products-grid') !== null;
  }

  /* ─── DOM INJECTION POINT ────────────────────────────────── */
  /* Inject the category hero container before the hc-shop section */
  function ensureLandingContainers() {
    // Category hero banner (injected before the .hc-shop section)
    if (!document.getElementById('cat-landing-hero')) {
      const shopSection = document.querySelector('.hc-shop');
      if (!shopSection) return;

      const hero = document.createElement('div');
      hero.id = 'cat-landing-hero';
      hero.className = 'cat-landing-hero';
      hero.style.display = 'none';
      shopSection.parentNode.insertBefore(hero, shopSection);
    }

    // Breadcrumb bar inside the main hc-main area (before controls)
    if (!document.getElementById('cat-breadcrumb')) {
      const controls = document.querySelector('.hc-controls');
      if (!controls) return;

      const bc = document.createElement('nav');
      bc.id = 'cat-breadcrumb';
      bc.className = 'cat-breadcrumb';
      bc.setAttribute('aria-label', 'Breadcrumb');
      bc.style.display = 'none';
      controls.parentNode.insertBefore(bc, controls);
    }
  }

  /* ─── RENDER: Category Hero / Banner ─────────────────────── */
  function renderCategoryHero(category, subcategory) {
    const hero = document.getElementById('cat-landing-hero');
    if (!hero) return;

    if (!category) {
      hero.style.display = 'none';
      hero.innerHTML = '';
      return;
    }

    const Cats = getCategories();
    const catObj = Cats ? Cats.getBySlug(category) : null;
    if (!catObj) {
      hero.style.display = 'none';
      return;
    }

    // Find subcategory object if active
    const subObj = subcategory
      ? (catObj.subcategories || []).find(sc => sc.slug === subcategory)
      : null;

    const displayName = subObj ? subObj.name : catObj.name;
    const displayDesc = subObj
      ? (subObj.description || catObj.description || '')
      : (catObj.description || '');
    const count = subObj ? (subObj.productCount || 0) : (catObj.productCount || 0);

    // Gradient palette per category (fallback when no image)
    const gradients = {
      'marble-decor':  'linear-gradient(135deg, #c8b97a 0%, #6e5a2a 100%)',
      'paintings':     'linear-gradient(135deg, #c26a3d 0%, #7a3520 100%)',
      'wooden-items':  'linear-gradient(135deg, #7a5c3a 0%, #3e2a10 100%)',
      'crochet':       'linear-gradient(135deg, #6aab8a 0%, #2a5a42 100%)',
      'textile':       'linear-gradient(135deg, #8a6aab 0%, #3a2a5a 100%)',
      'zardozi':       'linear-gradient(135deg, #c9a84c 0%, #7a5a1a 100%)',
      'others':        'linear-gradient(135deg, #2f5d50 0%, #1a3028 100%)',
    };
    const bg = gradients[catObj.slug] || 'linear-gradient(135deg, #2f5d50 0%, #1a3028 100%)';

    hero.style.display = '';
    hero.innerHTML = `
      <div class="cat-hero-inner" style="${catObj.imageUrl ? '' : `background: ${bg}`}">
        ${catObj.imageUrl ? `
          <div class="cat-hero-bg-wrap">
            <img src="${esc(catObj.imageUrl)}" alt="${esc(catObj.name)}" class="cat-hero-bg-img" loading="eager" />
            <div class="cat-hero-bg-overlay"></div>
          </div>` : ''}
        <div class="cat-hero-content">
          <nav class="cat-hero-breadcrumb" aria-label="Breadcrumb">
            <a href="index.html" class="cat-hero-bc-link">Home</a>
            <span class="cat-hero-bc-sep">›</span>
            ${subObj
              ? `<a href="${Cats ? Cats.buildShopUrl(catObj.slug) : '#'}" class="cat-hero-bc-link">${esc(catObj.name)}</a>
                 <span class="cat-hero-bc-sep">›</span>
                 <span class="cat-hero-bc-current">${esc(subObj.name)}</span>`
              : `<span class="cat-hero-bc-current">${esc(catObj.name)}</span>`
            }
          </nav>

          <div class="cat-hero-text">
            <span class="cat-hero-eyebrow">Mokshita Enterprises · Artisan Collection</span>
            <h1 class="cat-hero-title">${esc(displayName)}</h1>
            ${displayDesc ? `<p class="cat-hero-desc">${esc(displayDesc)}</p>` : ''}
            <div class="cat-hero-meta">
              ${count > 0 ? `<span class="cat-hero-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                ${count} handcrafted pieces
              </span>` : ''}
              <span class="cat-hero-origin">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Crafted in India
              </span>
            </div>
          </div>

          ${(catObj.subcategories || []).length > 0 ? `
          <div class="cat-hero-subcats">
            <button type="button" class="cat-hero-subcat-pill${!subObj ? ' active' : ''}" data-subcat="all">
              All ${esc(catObj.name)}
            </button>
            ${(catObj.subcategories || []).map(sc => `
              <button type="button" class="cat-hero-subcat-pill${sc.slug === subcategory ? ' active' : ''}"
                      data-subcat="${esc(sc.slug)}">
                ${esc(sc.name)}
                ${sc.productCount ? `<span class="cat-hero-sc-count">${sc.productCount}</span>` : ''}
              </button>
            `).join('')}
          </div>` : ''}
        </div>
      </div>
    `;

    /* Bind subcategory pill clicks */
    hero.querySelectorAll('.cat-hero-subcat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.subcat;
        const Cats = getCategories();
        if (!Cats) return;
        if (slug === 'all') {
          Cats.setActiveSubcategory(null, { push: true });
        } else {
          Cats.setActiveSubcategory(slug, { push: true });
        }
      });
    });

    /* Animate in */
    requestAnimationFrame(() => {
      hero.classList.add('cat-landing-hero--visible');
    });
  }

  /* ─── RENDER: Breadcrumb (inside main content area) ───────── */
  function renderBreadcrumb(category, subcategory) {
    const bc = document.getElementById('cat-breadcrumb');
    if (!bc) return;

    const Cats = getCategories();

    if (!category) {
      bc.style.display = 'none';
      bc.innerHTML = '';
      return;
    }

    const catObj = Cats ? Cats.getBySlug(category) : null;
    const catName = catObj ? catObj.name : category.replace(/-/g, ' ');

    const subObj = (catObj && subcategory)
      ? (catObj.subcategories || []).find(sc => sc.slug === subcategory)
      : null;

    const shopUrl = Cats ? Cats.buildShopUrl(null) : SHOP_PAGE;
    const catUrl = Cats ? Cats.buildShopUrl(category) : `${SHOP_PAGE}?category=${category}`;

    bc.style.display = 'flex';
    bc.innerHTML = `
      <ol class="cat-bc-list" aria-label="Breadcrumb">
        <li class="cat-bc-item">
          <a href="index.html" class="cat-bc-link">Home</a>
          <span class="cat-bc-sep" aria-hidden="true">›</span>
        </li>
        <li class="cat-bc-item">
          <a href="${shopUrl}" class="cat-bc-link">All Crafts</a>
          <span class="cat-bc-sep" aria-hidden="true">›</span>
        </li>
        ${subObj
          ? `<li class="cat-bc-item">
               <a href="${catUrl}" class="cat-bc-link">${esc(catName)}</a>
               <span class="cat-bc-sep" aria-hidden="true">›</span>
             </li>
             <li class="cat-bc-item">
               <span class="cat-bc-current" aria-current="page">${esc(subObj.name)}</span>
             </li>`
          : `<li class="cat-bc-item">
               <span class="cat-bc-current" aria-current="page">${esc(catName)}</span>
             </li>`
        }
      </ol>
    `;
  }

  /* ─── UPDATE: product count label in the hc-count element ─── */
  function updateCountLabel(category, subcategory) {
    const countEl = document.getElementById('hc-count');
    if (!countEl) return;

    const Cats = getCategories();
    if (!category) {
      // Reset to default label; handicrafts.js will fill in on render
      return;
    }

    const catObj = Cats ? Cats.getBySlug(category) : null;
    const subObj = (catObj && subcategory)
      ? (catObj.subcategories || []).find(sc => sc.slug === subcategory)
      : null;

    const context = subObj
      ? `in ${subObj.name}`
      : catObj
        ? `in ${catObj.name}`
        : '';

    if (context) {
      // handicrafts.js will overwrite with actual count; we just tag context
      countEl.dataset.catContext = context;
    } else {
      delete countEl.dataset.catContext;
    }
  }

  /* ─── MAIN CONTROLLER ────────────────────────────────────── */
  function onCategoryChanged(e) {
    if (!isShopPage()) return;

    const detail = (e && e.detail) || {};
    const category = detail.categorySlug || null;
    const subcategory = detail.subcategorySlug || null;

    ensureLandingContainers();
    renderCategoryHero(category, subcategory);
    renderBreadcrumb(category, subcategory);
    updateCountLabel(category, subcategory);
  }

  function onCategoriesLoaded() {
    if (!isShopPage()) return;

    const Cats = getCategories();
    if (!Cats) return;

    ensureLandingContainers();

    const category = Cats.getActiveCategory();
    const subcategory = Cats.getActiveSubcategory();

    renderCategoryHero(category, subcategory);
    renderBreadcrumb(category, subcategory);
    updateCountLabel(category, subcategory);
  }

  /* ─── EVENT BINDINGS ─────────────────────────────────────── */
  document.addEventListener('categoryChanged', onCategoryChanged);
  document.addEventListener('categoriesLoaded', onCategoriesLoaded);
  document.addEventListener('categoryProductsLoaded', (e) => {
    // Keep subcategory pills in hero in sync with what was loaded
    const { subcategorySlug } = (e && e.detail) || {};
    const heroSubcatPills = document.querySelectorAll('.cat-hero-subcat-pill');
    heroSubcatPills.forEach(btn => {
      const slug = btn.dataset.subcat;
      btn.classList.toggle('active',
        slug === (subcategorySlug || 'all') ||
        (slug === 'all' && !subcategorySlug)
      );
    });
  });

  window.addEventListener('popstate', () => {
    if (!isShopPage()) return;
    const Cats = getCategories();
    if (!Cats) return;
    // Small delay for App.Categories to process popstate first
    setTimeout(() => {
      const category = Cats.getActiveCategory();
      const subcategory = Cats.getActiveSubcategory();
      renderCategoryHero(category, subcategory);
      renderBreadcrumb(category, subcategory);
    }, 50);
  });

  /* ─── INIT ───────────────────────────────────────────────── */
  if (isShopPage()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        ensureLandingContainers();
      });
    } else {
      ensureLandingContainers();
    }
  }

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  window.App = window.App || {};
  window.App.CategoryLanding = {
    refresh() {
      const Cats = getCategories();
      if (!Cats) return;
      const category = Cats.getActiveCategory();
      const subcategory = Cats.getActiveSubcategory();
      ensureLandingContainers();
      renderCategoryHero(category, subcategory);
      renderBreadcrumb(category, subcategory);
    },
  };

})();
