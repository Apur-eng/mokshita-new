/* ============================================================
   CATEGORY NAV — Dynamic Category & Subcategory System
   ============================================================
   Responsibilities:
   - Fetch categories + subcategories from backend
   - Populate window.categories and window.subcategories
   - Dynamically render the sidebar category filter checkboxes
     in handicrafts.html (replacing hardcoded HTML)
   - Expose window.App.Categories for other modules to consume
   - Fire a 'categoriesLoaded' CustomEvent when ready
   - Gracefully fall back to local category data if API fails
   ============================================================ */

'use strict';

(function () {

  /* ─── LOCAL FALLBACK CATALOGUE ─────────────────────────────
     Mirrors the hardcoded sidebar in handicrafts.html.
     Used when the backend is unavailable.
  ─────────────────────────────────────────────────────────── */
  const LOCAL_CATEGORIES = [
    { id: 'painting', name: 'Paintings',           slug: 'painting', subcategories: [] },
    { id: 'marble',   name: 'Marble & Decor',      slug: 'marble',   subcategories: [] },
    { id: 'wooden',   name: 'Wooden Items',         slug: 'wooden',   subcategories: [] },
    { id: 'crochet',  name: 'Crochet',              slug: 'crochet',  subcategories: [] },
    { id: 'textile',  name: 'Textile & Pouches',    slug: 'textile',  subcategories: [] },
    { id: 'zardozi',  name: 'Zardozi',              slug: 'zardozi',  subcategories: [] },
  ];

  /* ─── INTERNAL STATE ─────────────────────────────────────── */
  let _categories    = [];   // populated after fetch
  let _isLoaded      = false;

  /* ─── HELPERS ───────────────────────────────────────────── */

  /**
   * Map a backend category row → normalised shape used by the UI.
   * Tolerates both relational (category_id) and legacy (category string) shapes.
   */
  function normaliseCategory(raw) {
    return {
      id:            raw.id,
      name:          raw.name,
      slug:          raw.slug,
      description:   raw.description || '',
      imageUrl:      raw.image_url   || '',
      productCount:  raw.product_count || 0,
      subcategories: (raw.subcategories || []).filter(sc => sc && sc.id),
    };
  }

  /* ─── RENDER: Sidebar category checkboxes ───────────────── */
  /**
   * Dynamically builds the category + subcategory filter list
   * inside #fg-body-categories.  If the container doesn't exist
   * (e.g. we're on a non-shop page) this is a safe no-op.
   */
  function renderSidebarCategories(categories) {
    const container = document.getElementById('fg-body-categories');
    if (!container) return;

    // Start with the "All Crafts" option (always present)
    let html = `
      <label class="hc-check">
        <input type="checkbox" class="hc-cb hc-cat" value="all" id="cat-all" checked />
        <span class="hc-box"></span>All Crafts
      </label>`;

    categories.forEach(cat => {
      const safeId = `cat-${cat.slug}`;
      html += `
        <label class="hc-check">
          <input type="checkbox" class="hc-cb hc-cat" value="${cat.slug}" id="${safeId}" />
          <span class="hc-box"></span>${cat.name}
          ${cat.productCount ? `<span class="hc-cat-count">(${cat.productCount})</span>` : ''}
        </label>`;

      // Subcategories rendered as indented sub-items
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach(sc => {
          if (!sc || !sc.slug) return;
          const scId = `subcat-${sc.slug}`;
          html += `
          <label class="hc-check hc-subcat-check" data-parent-cat="${cat.slug}">
            <input type="checkbox" class="hc-cb hc-subcat" value="${sc.slug}" id="${scId}"
                   data-parent="${cat.slug}" />
            <span class="hc-box hc-box--sub"></span>
            <span class="hc-subcat-name">↳ ${sc.name}</span>
          </label>`;
        });
      }
    });

    container.innerHTML = html;

    // Re-attach event listeners (handicrafts.js listens to the live DOM)
    document.dispatchEvent(new CustomEvent('categorySidebarRendered'));
  }

  /* ─── RENDER: Subcategory pills / breadcrumb strip ─────── */
  /**
   * Renders dynamic subcategory quick-filter pills
   * inside #hc-subcategory-bar (if present in the DOM).
   * The bar is shown only when a single category is active.
   */
  function renderSubcategoryBar(category) {
    const bar = document.getElementById('hc-subcategory-bar');
    if (!bar) return;

    const subcats = category ? (category.subcategories || []) : [];

    if (subcats.length === 0) {
      bar.style.display = 'none';
      bar.innerHTML = '';
      return;
    }

    bar.style.display = 'flex';
    bar.innerHTML = `
      <button class="hc-subcat-pill active" data-subcat="all">All</button>
      ${subcats.map(sc => `
        <button class="hc-subcat-pill" data-subcat="${sc.slug}">${sc.name}</button>
      `).join('')}
    `;

    bar.querySelectorAll('.hc-subcat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('.hc-subcat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const subSlug = btn.dataset.subcat;
        document.dispatchEvent(new CustomEvent('subcategorySelected', {
          detail: { slug: subSlug, categorySlug: category.slug }
        }));
      });
    });
  }

  /* ─── FETCH & BOOTSTRAP ─────────────────────────────────── */
  async function loadCategories() {
    const api = window.apiService;

    if (!api || !api.categories) {
      console.warn('[CategoryNav] apiService.categories not found — using local fallback.');
      _categories = LOCAL_CATEGORIES;
      _isLoaded   = true;
      window.categories = _categories;
      renderSidebarCategories(_categories);
      document.dispatchEvent(new CustomEvent('categoriesLoaded', { detail: { categories: _categories, source: 'local' } }));
      return;
    }

    try {
      const { data, error } = await api.categories.getAll();

      if (error || !data || !data.data) {
        throw new Error(error || 'Empty response from /api/categories');
      }

      _categories = data.data.map(normaliseCategory);
      console.log(`[CategoryNav] Loaded ${_categories.length} categories from backend.`);

    } catch (err) {
      console.warn('[CategoryNav] Backend unavailable, using local fallback.', err.message);
      _categories = LOCAL_CATEGORIES;
    }

    _isLoaded         = true;
    window.categories = _categories;

    renderSidebarCategories(_categories);

    document.dispatchEvent(new CustomEvent('categoriesLoaded', {
      detail: { categories: _categories, source: _categories === LOCAL_CATEGORIES ? 'local' : 'backend' }
    }));
  }

  /* ─── PUBLIC API ────────────────────────────────────────── */
  window.App = window.App || {};
  window.App.Categories = {
    /** Returns the loaded category array (or [] if not yet ready). */
    getAll() { return _categories; },

    /** Returns a single category by slug, or null. */
    getBySlug(slug) {
      return _categories.find(c => c.slug === slug) || null;
    },

    /** Returns true once the initial fetch is done. */
    isLoaded() { return _isLoaded; },

    /**
     * Render or update the subcategory pill bar for a given category slug.
     * Call this whenever the active category changes.
     */
    showSubcategoriesFor(categorySlug) {
      const cat = categorySlug ? this.getBySlug(categorySlug) : null;
      renderSubcategoryBar(cat);
    },

    /**
     * Reload categories from backend and re-render the sidebar.
     * Useful after admin changes.
     */
    async reload() {
      _isLoaded = false;
      await loadCategories();
    }
  };

  /* ─── INIT ──────────────────────────────────────────────── */
  // Run as soon as this script executes (after api.js is loaded).
  // Uses a small delay to ensure api.js has had time to set window.apiService.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCategories);
  } else {
    loadCategories();
  }

})();
