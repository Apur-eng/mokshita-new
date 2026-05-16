/* ============================================================
   GLOBAL SEARCH — Phase 4 Frontend Evolution
   ============================================================
   Features:
   - Magnifier icon injected into <nav> (all pages)
   - Full-screen search overlay with live results
   - Debounced API calls: GET /api/products/search?q=
   - Predictive suggestions while typing
   - Results grid with product cards linking to PDP
   - Empty state with helpful messaging
   - Keyboard navigation (Esc to close, Enter to confirm)
   - Fallback to local window.products if API unavailable
   ============================================================ */
'use strict';

(function () {

  /* ─── CSS ────────────────────────────────────────────────
     Injected into <head> so search works on every page
     without requiring a separate CSS file.               */
  const SEARCH_CSS = `
    /* ── Search trigger button in nav ── */
    .nav-search-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-dark, #2a2a2a);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 6px;
      transition: color 0.2s, background 0.2s;
    }
    .nav-search-btn:hover { color: var(--accent, #c26a3d); background: rgba(194,106,61,0.08); }

    /* ── Full-screen overlay ── */
    #global-search-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(20, 16, 12, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: clamp(60px, 10vh, 100px) 20px 40px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
    }
    #global-search-overlay.is-open {
      opacity: 1;
      pointer-events: all;
    }

    /* ── Search input row ── */
    .gs-input-wrap {
      width: 100%;
      max-width: 680px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 0;
    }
    .gs-input-icon {
      position: absolute;
      left: 18px;
      color: rgba(255,255,255,0.45);
      pointer-events: none;
      flex-shrink: 0;
    }
    #gs-input {
      width: 100%;
      background: rgba(255,255,255,0.07);
      border: 1.5px solid rgba(255,255,255,0.15);
      border-radius: 12px;
      color: #fff;
      font-size: clamp(1.1rem, 2.5vw, 1.5rem);
      font-family: var(--font-body, 'Cormorant Garamond', serif);
      padding: 18px 52px 18px 56px;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    #gs-input::placeholder { color: rgba(255,255,255,0.35); }
    #gs-input:focus {
      border-color: rgba(194,106,61,0.7);
      background: rgba(255,255,255,0.1);
    }
    #gs-clear {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.5);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.15s;
    }
    #gs-clear:hover { color: #fff; }
    #gs-clear.visible { display: flex; }

    /* ── Status / hint line ── */
    #gs-status {
      color: rgba(255,255,255,0.4);
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 14px;
      min-height: 18px;
      width: 100%;
      max-width: 680px;
      text-align: left;
    }

    /* ── Results grid ── */
    #gs-results {
      width: 100%;
      max-width: 880px;
      margin-top: 28px;
      overflow-y: auto;
      max-height: calc(100vh - 260px);
      padding-right: 4px;
    }
    .gs-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }
    .gs-card {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.18s, background 0.18s, border-color 0.18s;
      text-decoration: none;
      color: inherit;
    }
    .gs-card:hover {
      transform: translateY(-3px);
      background: rgba(255,255,255,0.1);
      border-color: rgba(194,106,61,0.45);
    }
    .gs-card-img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      background: rgba(255,255,255,0.05);
    }
    .gs-card-body { padding: 10px 12px 12px; }
    .gs-card-tag {
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(194,106,61,0.85);
      margin-bottom: 4px;
      display: block;
    }
    .gs-card-name {
      font-size: 0.88rem;
      font-weight: 600;
      color: #fff;
      line-height: 1.3;
      margin: 0 0 6px;
    }
    .gs-card-price {
      font-size: 0.92rem;
      color: rgba(255,255,255,0.75);
      font-family: var(--font-body, serif);
    }

    /* ── Empty state ── */
    .gs-empty {
      text-align: center;
      padding: 48px 20px;
      color: rgba(255,255,255,0.45);
    }
    .gs-empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
    .gs-empty-title { font-size: 1.1rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
    .gs-empty-hint  { font-size: 0.82rem; line-height: 1.6; }

    /* ── Loading spinner ── */
    .gs-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: rgba(255,255,255,0.5);
      font-size: 0.85rem;
      padding: 32px 0;
    }
    @keyframes gs-spin { to { transform: rotate(360deg); } }
    .gs-spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: rgba(194,106,61,0.8);
      border-radius: 50%;
      animation: gs-spin 0.7s linear infinite;
    }

    /* ── Close button ── */
    #gs-close {
      position: absolute;
      top: 20px;
      right: 24px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.15s, background 0.15s;
    }
    #gs-close:hover { color: #fff; background: rgba(255,255,255,0.14); }

    /* ── "View all results" link ── */
    #gs-view-all {
      display: none;
      margin-top: 20px;
      text-align: center;
    }
    #gs-view-all a {
      color: rgba(194,106,61,0.9);
      font-size: 0.85rem;
      letter-spacing: 0.06em;
      text-decoration: none;
      border-bottom: 1px solid rgba(194,106,61,0.35);
      padding-bottom: 2px;
      transition: color 0.15s, border-color 0.15s;
    }
    #gs-view-all a:hover { color: #e07840; border-color: #e07840; }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .gs-results-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      #gs-input { font-size: 1rem; padding: 14px 44px 14px 48px; }
    }
  `;

  /* ─── INJECT CSS ─────────────────────────────────────────*/
  const styleEl = document.createElement('style');
  styleEl.textContent = SEARCH_CSS;
  document.head.appendChild(styleEl);

  /* ─── BUILD OVERLAY HTML ─────────────────────────────────*/
  const overlay = document.createElement('div');
  overlay.id = 'global-search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Search products');
  overlay.innerHTML = `
    <button id="gs-close" aria-label="Close search">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Esc
    </button>
    <div class="gs-input-wrap">
      <svg class="gs-input-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input id="gs-input" type="search" placeholder="Search products, crafts, regions…" autocomplete="off" spellcheck="false" />
      <button id="gs-clear" aria-label="Clear search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div id="gs-status">Type to search across all products…</div>
    <div id="gs-results"></div>
    <div id="gs-view-all"><a href="handicrafts.html">View all products →</a></div>
  `;
  document.body.appendChild(overlay);

  /* ─── DOM REFS ───────────────────────────────────────────*/
  const gsInput   = document.getElementById('gs-input');
  const gsClose   = document.getElementById('gs-close');
  const gsClear   = document.getElementById('gs-clear');
  const gsStatus  = document.getElementById('gs-status');
  const gsResults = document.getElementById('gs-results');
  const gsViewAll = document.getElementById('gs-view-all');

  /* ─── INJECT NAV TRIGGER ─────────────────────────────────
     Adds the search icon into the existing nav button group.
     Works for both index.html and sub-pages.              */
  function injectNavButton() {
    // Look for the nav button container (holds cart + account icons)
    const navBtnGroup = document.querySelector('.nav div[style*="display:flex"]') ||
                        document.querySelector('nav > div');
    if (!navBtnGroup) return;

    const btn = document.createElement('button');
    btn.className = 'nav-search-btn';
    btn.id = 'nav-search-btn';
    btn.setAttribute('aria-label', 'Search');
    btn.setAttribute('title', 'Search products');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>`;
    btn.addEventListener('click', openSearch);

    // Insert before first child (before cart icon)
    navBtnGroup.insertBefore(btn, navBtnGroup.firstChild);
    console.log('[Search] Nav search button injected.');
  }

  /* ─── OPEN / CLOSE ───────────────────────────────────────*/
  function openSearch() {
    overlay.classList.add('is-open');
    gsInput.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeSearch() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    // Reset after transition
    setTimeout(() => {
      gsInput.value = '';
      gsClear.classList.remove('visible');
      gsResults.innerHTML = '';
      gsStatus.textContent = 'Type to search across all products…';
      gsViewAll.style.display = 'none';
      currentQuery = '';
    }, 250);
  }

  gsClose.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    // Ctrl/Cmd + K → open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  /* ─── CARD BUILDER ───────────────────────────────────────*/
  function buildResultCard(p) {
    const slug  = p.slug || p.id || '';
    const img   = p.image_url || p.mainImage || '';
    const name  = escText(p.name || p.title || 'Product');
    const price = parseFloat(p.price || 0).toFixed(0);
    const tag   = escText(
      (p.subcategory && p.subcategory.name) ||
      (p.category && (p.category.name || p.category)) ||
      p.tag || ''
    );

    return `
      <a class="gs-card" href="product.html?slug=${slug}" onclick="closeSearchGlobal()">
        <img class="gs-card-img" src="${escAttr(img)}" alt="${name}" loading="lazy"
             onerror="this.style.display='none'" />
        <div class="gs-card-body">
          <span class="gs-card-tag">${tag}</span>
          <h3 class="gs-card-name">${name}</h3>
          <div class="gs-card-price">₹${price}</div>
        </div>
      </a>`;
  }

  /* ─── RENDER RESULTS ─────────────────────────────────────*/
  function renderResults(products, query, totalCount) {
    if (!products || !products.length) {
      gsResults.innerHTML = `
        <div class="gs-empty">
          <div class="gs-empty-icon">🔍</div>
          <p class="gs-empty-title">No results for "${escText(query)}"</p>
          <p class="gs-empty-hint">
            Try different keywords, check spelling,<br/>
            or <a href="handicrafts.html" style="color:rgba(194,106,61,0.85)">browse the full collection</a>.
          </p>
        </div>`;
      gsStatus.textContent = `No products found for "${query}"`;
      gsViewAll.style.display = 'none';
      return;
    }

    const cards = products.slice(0, 12).map(buildResultCard).join('');
    gsResults.innerHTML = `<div class="gs-results-grid">${cards}</div>`;

    const shown = Math.min(products.length, 12);
    const total = totalCount || products.length;
    gsStatus.textContent = total > shown
      ? `Showing ${shown} of ${total} results for "${query}"`
      : `${total} result${total !== 1 ? 's' : ''} for "${query}"`;

    gsViewAll.style.display = total > 12 ? 'block' : 'none';
    if (total > 12) {
      const link = gsViewAll.querySelector('a');
      if (link) link.href = `handicrafts.html?q=${encodeURIComponent(query)}`;
    }
  }

  function showLoading() {
    gsResults.innerHTML = `<div class="gs-loading"><div class="gs-spinner"></div>Searching…</div>`;
    gsStatus.textContent = 'Searching…';
  }

  /* ─── LOCAL FALLBACK SEARCH ──────────────────────────────
     Uses window.products if API is unavailable.            */
  function searchLocal(query) {
    const q   = query.toLowerCase();
    const all = window.products || [];
    return all.filter(p => {
      const haystack = [p.title, p.tag, p.category, p.shortDesc, p.origin]
        .join(' ').toLowerCase();
      return haystack.includes(q);
    }).slice(0, 12);
  }

  /* ─── API SEARCH ─────────────────────────────────────────*/
  let currentQuery = '';
  let debounceTimer;

  async function doSearch(query) {
    if (query === currentQuery) return;
    currentQuery = query;

    if (!query) {
      gsResults.innerHTML = '';
      gsStatus.textContent = 'Type to search across all products…';
      gsViewAll.style.display = 'none';
      return;
    }

    showLoading();

    const api = window.apiService;
    if (api && api.products && api.products.search) {
      try {
        const { data, error } = await api.products.search(query, { limit: 20 });
        // Abort if query changed while awaiting
        if (currentQuery !== query) return;

        if (!error && data) {
          const products = data.products || data.data || [];
          const total    = data.total || products.length;
          renderResults(products, query, total);
          return;
        }
      } catch (err) {
        console.warn('[Search] API search failed, using local fallback.', err.message);
      }
    }

    // Local fallback
    if (currentQuery !== query) return;
    const local = searchLocal(query);
    renderResults(local, query, local.length);
  }

  /* ─── INPUT HANDLER ──────────────────────────────────────*/
  gsInput.addEventListener('input', e => {
    const val = e.target.value.trim();
    gsClear.classList.toggle('visible', !!val);
    clearTimeout(debounceTimer);
    if (!val) {
      gsResults.innerHTML = '';
      gsStatus.textContent = 'Type to search across all products…';
      gsViewAll.style.display = 'none';
      currentQuery = '';
      return;
    }
    gsStatus.textContent = 'Typing…';
    debounceTimer = setTimeout(() => doSearch(val), 280);
  });

  gsInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      const val = gsInput.value.trim();
      if (val) doSearch(val);
    }
  });

  gsClear.addEventListener('click', () => {
    gsInput.value = '';
    gsClear.classList.remove('visible');
    gsResults.innerHTML = '';
    gsStatus.textContent = 'Type to search across all products…';
    gsViewAll.style.display = 'none';
    currentQuery = '';
    gsInput.focus();
  });

  /* ─── ESCAPE HELPERS ─────────────────────────────────────*/
  function escText(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escAttr(s) {
    return String(s || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─── GLOBAL CLOSE HOOK (used by card onclick) ───────────*/
  window.closeSearchGlobal = closeSearch;

  /* ─── INIT ───────────────────────────────────────────────
     Wait for DOM, then inject the nav button.              */
  function init() {
    injectNavButton();

    // If URL has ?q= param (from "View all results" link), pre-fill handicrafts search
    if (window.location.pathname.includes('handicrafts')) {
      const urlQ = new URLSearchParams(window.location.search).get('q');
      if (urlQ) {
        const hcInput = document.getElementById('product-search');
        if (hcInput) {
          hcInput.value = urlQ;
          hcInput.dispatchEvent(new Event('input'));
        }
      }
    }

    console.log('[Search] Global search initialized. Use Ctrl+K or nav icon to open.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
