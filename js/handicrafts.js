(function () {
  'use strict';

  /* ─── DOM REFS ─────────────────────────────────────────── */
  const grid        = document.getElementById('products-grid');
  const countEl     = document.getElementById('hc-count');
  const emptyEl     = document.getElementById('hc-empty');
  const activeTagsEl= document.getElementById('hc-active-tags');
  const searchInput = document.getElementById('product-search');
  const searchClear = document.getElementById('hc-search-clear');
  const sortSel     = document.getElementById('hc-sort');
  const applyBtn    = document.getElementById('hc-apply-btn');
  const clearAllBtn = document.getElementById('hc-clear-all');
  const resetBtn    = document.getElementById('hc-reset-btn');
  const sliderMin   = document.getElementById('price-min');
  const sliderMax   = document.getElementById('price-max');
  const lblMin      = document.getElementById('lbl-pmin');
  const lblMax      = document.getElementById('lbl-pmax');
  const sliderFill  = document.getElementById('hc-slider-fill');

  if (!grid) return;

  /* ─── FILTER STATE ─────────────────────────────────────── */
  const state = {
    search:      '',
    categories:  new Set(['all']),
    subcategory: null,   // active subcategory slug (from pill bar)
    materials:   new Set(),
    regions:     new Set(),
    minPrice:    0,
    maxPrice:    1000,
    minRating:   0,
    sort:        'default',
    cols:        4
  };

  /* ─── HELPERS ──────────────────────────────────────────── */
  function getRegion(origin) {
    if (!origin) return 'other';
    const o = origin.toLowerCase();
    if (o.includes('rajasthan') || o.includes('jaipur') || o.includes('nathdwara')) return 'rajasthan';
    if (o.includes('uttar pradesh') || o.includes('agra') || o.includes('bareilly') || o.includes('saharanpur')) return 'uttar-pradesh';
    if (o.includes('india') && !o.includes('uttar') && !o.includes('rajasthan')) return 'pan-india';
    return 'other';
  }

  function renderStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.4 ? 1 : 0;
    const empty = 5 - full - half;
    let s = '';
    for (let i = 0; i < full;  i++) s += '★';
    if (half) s += '½';
    for (let i = 0; i < empty; i++) s += '☆';
    return s;
  }

  function applySort(list) {
    const arr = [...list];
    switch (state.sort) {
      case 'price-asc':  return arr.sort((a, b) => a.price - b.price);
      case 'price-desc': return arr.sort((a, b) => b.price - a.price);
      case 'rating':     return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount':   return arr.sort((a, b) => {
        const dA = a.oldPrice ? Math.round((1 - a.price / a.oldPrice) * 100) : 0;
        const dB = b.oldPrice ? Math.round((1 - b.price / b.oldPrice) * 100) : 0;
        return dB - dA;
      });
      default: return arr;
    }
  }

  /* ─── FILTER PRODUCTS ──────────────────────────────────── */
  function getFiltered() {
    if (typeof window.products === 'undefined') return [];

    return window.products.filter(p => {
      const price  = parseInt(p.price);
      const rating = parseFloat(p.rating || 0);
      const region = getRegion(p.origin || '');
      const query  = state.search.toLowerCase();

      // Category (uses backend slug or legacy string value)
      if (!state.categories.has('all')) {
        // Match against product's category field (slug or display value)
        const prodCat = (p.category || '').toLowerCase();
        const catSlugs = [...state.categories];
        const matched = catSlugs.some(slug => {
          // Direct slug match
          if (prodCat === slug) return true;
          // If backend gives us a category object
          if (p.category && typeof p.category === 'object' && p.category.slug === slug) return true;
          return false;
        });
        if (!matched) return false;
      }

      // Materials (maps to category)
      if (state.materials.size > 0) {
        if (!state.materials.has(p.category)) return false;
      }

      // Region
      if (state.regions.size > 0) {
        if (!state.regions.has(region)) return false;
      }

      // Price
      if (price < state.minPrice || price > state.maxPrice) return false;

      // Rating
      if (rating < state.minRating) return false;

      // Search
      if (query) {
        const haystack = [
          p.title || '', p.shortDesc || '', p.tag || '',
          p.category || '', p.origin || ''
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }

  /* ─── RENDER GRID ──────────────────────────────────────── */
  function render() {
    const filtered = applySort(getFiltered());

    // Count
    countEl.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''} in Handicrafts`;

    // Empty state
    emptyEl.style.display  = filtered.length === 0 ? 'block' : 'none';
    grid.style.display     = filtered.length === 0 ? 'none'  : 'grid';

    grid.innerHTML = '';

    filtered.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'hc-card reveal';
      card.setAttribute('data-cat', p.category);
      card.style.animationDelay = Math.min(i * 0.04, 0.4) + 's';

      const discountBadge = p.discount
        ? `<span class="hc-discount-badge" style="position:absolute;top:10px;left:10px;z-index:2;">${p.discount}</span>`
        : '';

      const oldPrice = p.oldPrice
        ? `<span class="hc-card-old-price">&#8377;${p.oldPrice}</span>`
        : '';

      const reviewCount = p.reviews ? `(${p.reviews})` : '';
      const ratingVal   = p.rating  ? parseFloat(p.rating).toFixed(1) : '';

      const originShort = (p.origin || 'India')
        .replace('Crafted in ', '')
        .replace('Crafted by Women Artisans, ', '');

      card.innerHTML = `
        <div class="hc-card-img-wrap" onclick="window.location.href='product.html?slug=${p.id}'" style="cursor:pointer;">
          <img src="${p.mainImage}" alt="${p.title}" loading="lazy" />
          <button class="hc-wishlist js-wishlist" aria-label="Add to wishlist" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          ${discountBadge}
        </div>
        <div class="hc-card-body">
          <h2 class="hc-card-title" onclick="window.location.href='product.html?slug=${p.id}'">${p.title}</h2>
          <span class="hc-card-origin">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${originShort}
          </span>
          <div class="hc-card-bottom-row">
            <div class="hc-card-price-row">
              <span class="hc-card-price">&#8377;${p.price}</span>
              ${oldPrice}
            </div>
            ${ratingVal ? `<span class="hc-card-rating">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${ratingVal} ${reviewCount}
            </span>` : ''}
          </div>
          <button class="hc-fab-cart" title="Quick add to cart"
            onclick="event.stopPropagation(); addToCart('${p.dbId || p.id}', 1); this.classList.add('added'); var b=this; setTimeout(function(){ b.classList.remove('added'); }, 1100);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      `;


      grid.appendChild(card);
    });

    updateActiveTags();
  }

  /* ─── ACTIVE FILTER TAGS ───────────────────────────────── */
  function updateActiveTags() {
    activeTagsEl.innerHTML = '';

    // Categories (if not 'all')
    if (!state.categories.has('all')) {
      state.categories.forEach(cat => {
        addTag(cat.charAt(0).toUpperCase() + cat.slice(1), () => {
          state.categories.delete(cat);
          if (state.categories.size === 0) state.categories.add('all');
          syncCategoryCheckboxes();
          render();
        });
      });
    }

    // Materials
    state.materials.forEach(mat => {
      const labels = { marble:'Marble', wooden:'Carved Wood', crochet:'Cotton Yarn', textile:'Fabric', zardozi:'Metal Thread', painting:'Paper Art' };
      addTag(labels[mat] || mat, () => {
        state.materials.delete(mat);
        document.querySelectorAll('.hc-mat').forEach(cb => { if (cb.value === mat) cb.checked = false; });
        render();
      });
    });

    // Regions
    state.regions.forEach(r => {
      const labels = { rajasthan:'Rajasthan', 'uttar-pradesh':'Uttar Pradesh', 'pan-india':'Pan-India' };
      addTag(labels[r] || r, () => {
        state.regions.delete(r);
        document.querySelectorAll('.hc-reg').forEach(cb => { if (cb.value === r) cb.checked = false; });
        render();
      });
    });

    // Price (if not default)
    if (state.minPrice > 0 || state.maxPrice < 1000) {
      addTag(`₹${state.minPrice}–₹${state.maxPrice}`, () => {
        state.minPrice = 0; state.maxPrice = 1000;
        sliderMin.value = 0; sliderMax.value = 1000;
        lblMin.textContent = 0; lblMax.textContent = 1000;
        updateSliderFill();
        document.querySelectorAll('.hc-preset').forEach(b => b.classList.remove('active'));
        document.getElementById('preset-all')?.classList.add('active');
        render();
      });
    }

    // Rating
    if (state.minRating > 0) {
      addTag(`${state.minRating}★ & above`, () => {
        state.minRating = 0;
        document.getElementById('rat-any').checked = true;
        render();
      });
    }

    // Search
    if (state.search) {
      addTag(`"${state.search}"`, () => {
        state.search = '';
        searchInput.value = '';
        searchClear.style.display = 'none';
        render();
      });
    }
  }

  function addTag(label, onRemove) {
    const tag = document.createElement('span');
    tag.className = 'hc-tag';
    tag.innerHTML = `${label}<span class="hc-tag-close" aria-label="Remove filter">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </span>`;
    tag.querySelector('.hc-tag-close').addEventListener('click', onRemove);
    activeTagsEl.appendChild(tag);
  }

  /* ─── SYNC CATEGORY CHECKBOXES ─────────────────────────── */
  function syncCategoryCheckboxes() {
    const allCb = document.getElementById('cat-all');
    const catCbs = document.querySelectorAll('.hc-cat:not(#cat-all)');
    if (state.categories.has('all')) {
      if (allCb) allCb.checked = true;
      catCbs.forEach(cb => cb.checked = false);
    } else {
      if (allCb) allCb.checked = false;
      catCbs.forEach(cb => cb.checked = state.categories.has(cb.value));
    }
  }

  /* ─── PRICE SLIDER ─────────────────────────────────────── */
  function updateSliderFill() {
    if (!sliderMin || !sliderMax || !sliderFill) return;
    const min = parseInt(sliderMin.value);
    const max = parseInt(sliderMax.value);
    const rangeMax = parseInt(sliderMax.max);
    const leftPct  = (min / rangeMax) * 100;
    const rightPct = 100 - (max / rangeMax) * 100;
    sliderFill.style.left  = leftPct + '%';
    sliderFill.style.right = rightPct + '%';
  }

  if (sliderMin && sliderMax) {
    sliderMin.addEventListener('input', () => {
      let min = parseInt(sliderMin.value);
      let max = parseInt(sliderMax.value);
      if (min > max - 50) { sliderMin.value = max - 50; min = max - 50; }
      lblMin.textContent = min;
      state.minPrice = min;
      updateSliderFill();
      document.querySelectorAll('.hc-preset').forEach(b => b.classList.remove('active'));
      render();
    });

    sliderMax.addEventListener('input', () => {
      let min = parseInt(sliderMin.value);
      let max = parseInt(sliderMax.value);
      if (max < min + 50) { sliderMax.value = min + 50; max = min + 50; }
      lblMax.textContent = max;
      state.maxPrice = max;
      updateSliderFill();
      document.querySelectorAll('.hc-preset').forEach(b => b.classList.remove('active'));
      render();
    });

    updateSliderFill();
  }

  /* ─── PRICE PRESETS ────────────────────────────────────── */
  document.querySelectorAll('.hc-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const min = parseInt(btn.dataset.min);
      const max = parseInt(btn.dataset.max);
      state.minPrice = min;
      state.maxPrice = max;
      if (sliderMin) sliderMin.value = min;
      if (sliderMax) sliderMax.value = max;
      if (lblMin) lblMin.textContent = min;
      if (lblMax) lblMax.textContent = max;
      updateSliderFill();
      document.querySelectorAll('.hc-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });

  /* ─── CATEGORY CHECKBOXES (event-delegated — works with dynamically rendered DOM) ── */
  const catContainer = document.getElementById('fg-body-categories');

  function bindCategoryCheckboxes() {
    // Bind using delegation on the container so it works after category-nav.js
    // re-renders the checkboxes from the backend API.
    if (catContainer) {
      catContainer.removeEventListener('change', onCatChange);
      catContainer.addEventListener('change', onCatChange);
    }
  }

  function onCatChange(e) {
    const cb = e.target;
    if (!cb.matches('.hc-cat')) return;

    if (cb.value === 'all') {
      state.categories.clear();
      state.categories.add('all');
      catContainer.querySelectorAll('.hc-cat:not(#cat-all)').forEach(c => c.checked = false);
      cb.checked = true;
    } else {
      state.categories.delete('all');
      const allCb = catContainer.querySelector('#cat-all');
      if (allCb) allCb.checked = false;
      if (cb.checked) {
        state.categories.add(cb.value);
      } else {
        state.categories.delete(cb.value);
      }
      if (state.categories.size === 0) {
        state.categories.add('all');
        if (allCb) allCb.checked = true;
      }
    }

    // Show/hide subcategory pill bar for single selected category
    if (window.App && window.App.Categories) {
      const activeCats = [...state.categories].filter(c => c !== 'all');
      if (activeCats.length === 1) {
        window.App.Categories.showSubcategoriesFor(activeCats[0]);
      } else {
        window.App.Categories.showSubcategoriesFor(null);
      }
    }

    // Sync URL
    const newUrl = new URL(window.location);
    if (state.categories.has('all')) {
      newUrl.searchParams.delete('category');
    } else {
      newUrl.searchParams.set('category', [...state.categories].join(','));
    }
    window.history.replaceState({}, '', newUrl);

    render();
  }

  // Bind immediately (for local fallback) and re-bind after dynamic render
  bindCategoryCheckboxes();
  document.addEventListener('categorySidebarRendered', bindCategoryCheckboxes);

  /* ─── SUBCATEGORY EVENTS (from category-nav.js pill bar) ── */
  document.addEventListener('subcategorySelected', (e) => {
    const { slug } = e.detail;
    if (!slug || slug === 'all') {
      // Remove subcategory filter — show all products in the category
      window.products = window._allProducts || window.products;
      render();
      return;
    }

    // Fetch products for the subcategory from the backend, then update window.products
    if (window.apiService && window.apiService.subcategories) {
      // Show a quick loading state on the grid
      grid.innerHTML = '<div class="hc-loading-state" style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">Loading…</div>';

      window.apiService.subcategories.getProducts(slug).then(({ data, error }) => {
        if (error || !data) {
          if (window.App && window.App.UI) window.App.UI.showError('Could not load subcategory products.');
          render();
          return;
        }
        const products = data.products || data.data || [];
        // Temporarily replace window.products for rendering
        if (!window._allProducts) window._allProducts = window.products;
        window.products = products.map(p => {
          const base   = window._allProducts.find(lp => lp.dbId == p.id || lp.id === p.slug) || {};
          let   imgUrl = p.image_url || base.mainImage || '';
          if (imgUrl && imgUrl.startsWith('/') && window.apiService) imgUrl = window.apiService.getBaseUrl() + imgUrl;
          if (window.resolveProductImage) imgUrl = window.resolveProductImage(imgUrl, p.name || p.slug);
          return {
            id:        p.slug || String(p.id),
            dbId:      p.id,
            title:     p.name || base.title || 'Untitled',
            price:     parseFloat(p.price) || base.price || 0,
            oldPrice:  base.oldPrice || null,
            discount:  base.discount || null,
            category:  (p.category?.slug || p.category_name_legacy || base.category || '').toLowerCase(),
            tag:       p.category?.name || base.tag || 'Craft',
            shortDesc: p.short_description || p.description || base.shortDesc || '',
            origin:    base.origin || '',
            rating:    base.rating || null,
            reviews:   base.reviews || null,
            mainImage: imgUrl,
            thumbnails:imgUrl ? [imgUrl] : (base.thumbnails || []),
          };
        });
        render();
      });
    }
  });

  /* ─── MATERIAL CHECKBOXES ──────────────────────────────── */
  document.querySelectorAll('.hc-mat').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) { state.materials.add(cb.value); }
      else { state.materials.delete(cb.value); }
      render();
    });
  });

  /* ─── REGION CHECKBOXES ────────────────────────────────── */
  document.querySelectorAll('.hc-reg').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) { state.regions.add(cb.value); }
      else { state.regions.delete(cb.value); }
      render();
    });
  });

  /* ─── RATING RADIO ─────────────────────────────────────── */
  document.querySelectorAll('input[name="rating"]').forEach(rb => {
    rb.addEventListener('change', () => {
      state.minRating = parseFloat(rb.value) || 0;
      render();
    });
  });

  /* ─── SEARCH ────────────────────────────────────────────── */
  /* Phase 4: API-first search with local fallback.
     - query < 2 chars → local getFiltered() (instant)
     - query >= 2 chars → apiService.products.search() if available
         → normalise results → replace grid
     - on API error → silently fall back to local getFiltered()  */

  let searchTimer;
  let searchController = null; // tracks the latest request

  /* Normalise a raw backend search result into the window.products shape */
  function normaliseSearchResult(p) {
    const api = window.apiService;
    let imgUrl = p.image_url || '';
    if (imgUrl && imgUrl.startsWith('/') && api && api.getBaseUrl) {
      imgUrl = api.getBaseUrl() + imgUrl;
    }
    if (window.resolveProductImage) {
      imgUrl = window.resolveProductImage(imgUrl, p.name || p.slug);
    }
    const catObj    = p.category    && typeof p.category    === 'object' ? p.category    : null;
    const subCatObj = p.subcategory && typeof p.subcategory === 'object' ? p.subcategory : null;
    const catName   = catObj ? catObj.name : (p.category || '');
    const subCatName = subCatObj ? subCatObj.name : '';
    return {
      id:         p.slug || String(p.id),
      dbId:       p.id,
      title:      p.name || 'Untitled',
      price:      parseFloat(p.price) || 0,
      oldPrice:   p.compare_price ? parseFloat(p.compare_price) : null,
      discount:   p.compare_price
                    ? Math.round((1 - p.price / p.compare_price) * 100) + '% OFF'
                    : null,
      category:   catName.toLowerCase(),
      tag:        subCatName || catName,
      shortDesc:  p.short_description || p.description || '',
      origin:     p.region || 'India',
      stock:      typeof p.stock === 'number' ? p.stock : 0,
      rating:     p.rating  || null,
      reviews:    p.reviews || null,
      mainImage:  imgUrl,
      material:   p.material || '',
      sku:        p.sku || '',
    };
  }

  /* Render backend search results directly (bypasses local getFiltered) */
  function renderSearchResults(products, query, total) {
    const sorted = applySort(products);
    const count  = total || sorted.length;

    countEl.textContent = `${count} result${count !== 1 ? 's' : ''} for "${query}"`;
    emptyEl.style.display = sorted.length === 0 ? 'block' : 'none';
    grid.style.display    = sorted.length === 0 ? 'none'  : 'grid';
    grid.innerHTML = '';

    sorted.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'hc-card reveal';
      card.setAttribute('data-cat', p.category);
      card.style.animationDelay = Math.min(i * 0.04, 0.4) + 's';

      const discountBadge = p.discount
        ? `<span class="hc-discount-badge" style="position:absolute;top:10px;left:10px;z-index:2;">${p.discount}</span>`
        : '';
      const oldPrice = p.oldPrice
        ? `<span class="hc-card-old-price">&#8377;${p.oldPrice}</span>` : '';
      const ratingVal   = p.rating  ? parseFloat(p.rating).toFixed(1)  : '';
      const reviewCount = p.reviews ? `(${p.reviews})`                  : '';
      const originShort = (p.origin || 'India')
        .replace('Crafted in ', '')
        .replace('Crafted by Women Artisans, ', '');

      card.innerHTML = `
        <div class="hc-card-img-wrap" onclick="window.location.href='product.html?slug=${p.id}'" style="cursor:pointer;">
          <img src="${p.mainImage}" alt="${p.title}" loading="lazy" />
          <button class="hc-wishlist js-wishlist" aria-label="Add to wishlist" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          ${discountBadge}
        </div>
        <div class="hc-card-body">
          <h2 class="hc-card-title" onclick="window.location.href='product.html?slug=${p.id}'">${p.title}</h2>
          <span class="hc-card-origin">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${originShort}
          </span>
          <div class="hc-card-bottom-row">
            <div class="hc-card-price-row">
              <span class="hc-card-price">&#8377;${p.price}</span>${oldPrice}
            </div>
            ${ratingVal ? `<span class="hc-card-rating">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ${ratingVal} ${reviewCount}
            </span>` : ''}
          </div>
          <button class="hc-fab-cart" title="Quick add to cart"
            onclick="event.stopPropagation(); addToCart('${p.dbId || p.id}', 1); this.classList.add('added'); var b=this; setTimeout(function(){ b.classList.remove('added'); }, 1100);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    updateActiveTags();
  }

  /* Main search handler */
  async function doHCSearch(query) {
    state.search = query;

    // Short query → instant local filter
    if (!query || query.length < 2) {
      render();
      return;
    }

    // Show loading hint in count bar
    if (countEl) countEl.textContent = 'Searching…';

    const api = window.apiService;
    if (api && api.products && api.products.search) {
      try {
        const { data, error } = await api.products.search(query, {
          limit:      40,
          in_stock:   'false',  // include out-of-stock in browse results
        });

        if (!error && data) {
          const raw      = data.products || data.data || [];
          const total    = data.total    || raw.length;
          const products = raw.map(normaliseSearchResult);
          renderSearchResults(products, query, total);
          console.log(`[HC Search] Backend: ${total} results for "${query}"`);
          return;
        }
      } catch (err) {
        console.warn('[HC Search] API call failed, using local fallback.', err.message);
      }
    }

    // Local fallback
    render();
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const val = e.target.value.trim();
      state.search = val;
      searchClear.style.display = val ? 'flex' : 'none';
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => doHCSearch(val), 300);
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.search = '';
      searchInput.value = '';
      searchClear.style.display = 'none';
      render();
      searchInput.focus();
    });
  }


  /* ─── SORT ──────────────────────────────────────────────── */
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      state.sort = sortSel.value;
      render();
    });
  }

  /* ─── GRID TOGGLE ───────────────────────────────────────── */
  document.querySelectorAll('.hc-gt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.hc-gt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cols = parseInt(btn.dataset.cols);
      state.cols = cols;
      grid.className = `hc-grid cols-${cols}`;
    });
  });

  /* Restore grid class to match default state */
  grid.className = `hc-grid cols-${state.cols}`;

  /* ─── COLLAPSIBLE FILTER GROUPS ─────────────────────────── */
  document.querySelectorAll('.hc-fg-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const key  = btn.dataset.fg;
      const body = document.getElementById(`fg-body-${key}`);
      if (!body) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      body.classList.toggle('collapsed', isOpen);
    });
  });

  /* ─── APPLY BUTTON (visual flash + re-render) ───────────── */
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyBtn.textContent = 'Applied ✓';
      applyBtn.style.background = 'var(--hc-accent)';
      render();
      setTimeout(() => {
        applyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Apply Filters`;
        applyBtn.style.background = '';
      }, 1200);
    });
  }

  /* ─── CLEAR ALL ─────────────────────────────────────────── */
  function clearAll() {
    state.search = ''; state.minPrice = 0; state.maxPrice = 1000;
    state.minRating = 0; state.sort = 'default';
    state.categories = new Set(['all']);
    state.materials.clear(); state.regions.clear();

    // Restore full product catalogue if a subcategory fetch replaced it
    if (window._allProducts) {
      window.products  = window._allProducts;
      window._allProducts = null;
    }

    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';
    if (sortSel) sortSel.value = 'default';
    if (sliderMin) sliderMin.value = 0;
    if (sliderMax) sliderMax.value = 1000;
    if (lblMin) lblMin.textContent = 0;
    if (lblMax) lblMax.textContent = 1000;
    updateSliderFill();

    // Reset dynamically-rendered category checkboxes
    if (catContainer) {
      catContainer.querySelectorAll('.hc-cb').forEach(cb => cb.checked = false);
      const catAll = catContainer.querySelector('#cat-all');
      if (catAll) catAll.checked = true;
    } else {
      document.querySelectorAll('.hc-cb').forEach(cb => cb.checked = false);
      const catAll = document.getElementById('cat-all');
      if (catAll) catAll.checked = true;
    }
    const ratAny = document.getElementById('rat-any');
    if (ratAny) ratAny.checked = true;
    document.querySelectorAll('.hc-preset').forEach(b => b.classList.remove('active'));
    const preAll = document.getElementById('preset-all');
    if (preAll) preAll.classList.add('active');

    // Hide subcategory bar
    if (window.App && window.App.Categories) window.App.Categories.showSubcategoriesFor(null);

    window.history.replaceState({}, '', window.location.pathname);
    render();
  }

  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAll);
  if (resetBtn) resetBtn.addEventListener('click', clearAll);

  /* ─── URL PARAMS (initial category) ────────────────────── */
  const urlParams = new URLSearchParams(window.location.search);
  const initCat   = urlParams.get('category');
  if (initCat && initCat !== 'all') {
    const cats = initCat.split(',').filter(Boolean);
    state.categories.clear();
    cats.forEach(c => state.categories.add(c));
    // Sync checkboxes once the sidebar is rendered (may not exist yet)
    function applyCatFromURL() {
      if (!catContainer) return;
      catContainer.querySelectorAll('.hc-cat').forEach(cb => {
        cb.checked = (cb.value === 'all')
          ? false
          : state.categories.has(cb.value);
      });
      const allCb = catContainer.querySelector('#cat-all');
      if (allCb) allCb.checked = state.categories.has('all');
    }
    // Try immediately (local fallback may already be rendered)
    applyCatFromURL();
    // Also handle when category-nav.js re-renders from backend
    document.addEventListener('categorySidebarRendered', applyCatFromURL);
  }

  /* ─── URL PARAM: ?q= (from global search "View all results") */
  const initQ = urlParams.get('q');
  if (initQ && searchInput) {
    searchInput.value = initQ;
    if (searchClear) searchClear.style.display = 'flex';
    // Trigger backend search after products are loaded, or immediately
    const triggerQ = () => doHCSearch(initQ.trim());
    if (window.products && window.products.length) {
      triggerQ();
    } else {
      document.addEventListener('productsLoaded', triggerQ, { once: true });
    }
  }

  /* ─── WISHLIST TOGGLE (local UI only) ───────────────────── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.js-wishlist');
    if (!btn) return;
    btn.classList.toggle('wishlisted');
    const svg = btn.querySelector('svg');
    if (btn.classList.contains('wishlisted')) {
      btn.style.color = '#ef4444';
      if (svg) svg.setAttribute('fill', '#ef4444');
    } else {
      btn.style.color = '';
      if (svg) svg.setAttribute('fill', 'none');
    }
  });

  /* ─── INITIAL RENDER ────────────────────────────────────── */
  // Render immediately with whatever is in window.products (local data)
  render();

  // Re-render when backend products finish loading
  document.addEventListener('productsLoaded', () => {
    console.log('[Handicrafts] Re-rendering with backend products.');
    render();
  });

  // Re-render when category-nav.js finishes (re-wires checkboxes)
  document.addEventListener('categoriesLoaded', () => {
    console.log('[Handicrafts] Categories loaded — re-binding checkbox listeners.');
    bindCategoryCheckboxes();
  });

})();
