/* ============================================================
   FEATURED CMS — Phase 3 Frontend Evolution
   ============================================================
   Consumes:
     GET /api/products/featured?limit=8

   Strategy:
   - Targets the TWO artisan row scroll-tracks in index.html:
       #bs-track  → Best Sellers row
       #na-track  → New Arrivals row
   - If backend returns featured products → replaces ONLY the
     dynamic cards (not the entire row structure/header)
   - Static CTA card ("View Full Collection →") is always preserved
   - All existing CSS classes, animations, hover effects unchanged
   - Fires 'featuredLoaded' event on completion
   ============================================================ */
'use strict';

(function () {

  /* ─── CARD BUILDER ───────────────────────────────────────
     Produces the exact same HTML structure as the hardcoded
     artisan-card elements already in index.html.            */
  function buildArtisanCard(p, badgeType) {
    const slug      = p.slug || '';
    const imgSrc    = p.image_url || '';
    const name      = escText(p.name || 'Product');
    const origin    = escText((p.region ? p.region : 'India'));
    const priceNum  = parseFloat(p.price || 0);
    const origPrice = p.compare_price ? parseFloat(p.compare_price) : null;
    const priceStr  = '&#8377;' + priceNum.toFixed(0);
    const origStr   = origPrice ? '<span class="artisan-orig">&#8377;' + origPrice.toFixed(0) + '</span>' : '';
    const rating    = p.rating ? parseFloat(p.rating) : 4.5;
    const reviews   = p.reviews ? parseInt(p.reviews) : 0;
    const ratingStr = rating.toFixed(1);
    const reviewStr = reviews ? '(' + reviews + ')' : '';

    const badgeHTML = {
      best:     '<span class="artisan-badge artisan-badge--best">BEST SELLER</span>',
      new:      '<span class="artisan-badge artisan-badge--new">NEW</span>',
      trending: '<span class="artisan-badge artisan-badge--trending">TRENDING</span>',
      handmade: '<span class="artisan-badge artisan-badge--handmade">HANDMADE</span>',
    }[badgeType] || '';

    return `
      <article class="artisan-card" onclick="window.location.href='product.html?slug=${slug}'" style="cursor: pointer;">
        <div class="artisan-card-img-wrap">
          ${badgeHTML}
          <button class="artisan-wishlist" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <img src="${imgSrc}" alt="${name}" loading="lazy" />
        </div>
        <div class="artisan-card-body">
          <p class="artisan-card-origin">${origin}</p>
          <h4 class="artisan-card-name">${name}</h4>
          <div class="artisan-card-rating">
            <span class="artisan-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span class="artisan-rating-count">${reviewStr || '(0)'}</span>
          </div>
          <div class="artisan-card-price-row">
            <span class="artisan-price">${priceStr}</span>${origStr}
            <button class="artisan-atc" aria-label="Explore">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </article>`;
  }

  /* ─── STATIC CTA CARD ────────────────────────────────────
     The "View Full Collection" card is always the last item.
     Preserved exactly as hardcoded.                         */
  const CTA_CARD = `
    <article class="artisan-card artisan-card--cta" onclick="window.location.href='handicrafts.html'">
      <div class="artisan-card-cta-content">
        <h3>View Full Collection &#8594;</h3>
      </div>
    </article>`;

  /* ─── INJECT INTO TRACK ──────────────────────────────────
     Replaces dynamic cards inside the scroll track.
     Never touches the row header, trust bar, or nav arrows. */
  function injectIntoTrack(trackEl, products, badgeTypes, maxCards) {
    if (!trackEl) return;

    // Preserve only the static CTA card (artisan-card--cta)
    const ctaCard = trackEl.querySelector('.artisan-card--cta');

    // Clear existing dynamic product cards
    Array.from(trackEl.querySelectorAll('.artisan-card:not(.artisan-card--cta)'))
      .forEach(el => el.remove());

    // Build new cards from backend data
    const cardsToRender = products.slice(0, maxCards || 6);
    const fragment = document.createDocumentFragment();
    const wrapper = document.createElement('div');
    wrapper.style.display = 'contents'; // transparent container

    cardsToRender.forEach((p, idx) => {
      const badge = badgeTypes[idx % badgeTypes.length];
      wrapper.insertAdjacentHTML('beforeend', buildArtisanCard(p, badge));
    });

    // Insert before CTA card, or at end if no CTA
    if (ctaCard) {
      trackEl.insertBefore(wrapper, ctaCard);
    } else {
      trackEl.appendChild(wrapper);
    }

    console.log(`[Featured] Injected ${cardsToRender.length} cards into #${trackEl.id}.`);
  }

  /* ─── MAIN BOOTSTRAP ─────────────────────────────────────*/
  async function initFeatured() {
    const api = window.apiService;
    if (!api || !api.products || !api.products.getFeatured) {
      console.warn('[Featured] apiService.products.getFeatured not available. Keeping hardcoded cards.');
      return;
    }

    const bsTrack = document.getElementById('bs-track');
    const naTrack = document.getElementById('na-track');

    // If neither track exists (page other than index.html), exit silently
    if (!bsTrack && !naTrack) return;

    console.log('[Featured] Fetching featured products from backend...');

    const { data, error } = await api.products.getFeatured(12);

    if (error || !data) {
      console.warn('[Featured] Featured products fetch failed. Keeping hardcoded cards.');
      return;
    }

    const products = data.products || data.data || [];
    if (!products.length) {
      console.warn('[Featured] No featured products returned. Keeping hardcoded cards.');
      return;
    }

    // Split into two rows: first half → Best Sellers, second half → New Arrivals
    const mid       = Math.ceil(products.length / 2);
    const bestSellers = products.slice(0, mid);
    const newArrivals = products.slice(mid);

    // Inject Best Sellers row
    if (bsTrack && bestSellers.length) {
      injectIntoTrack(bsTrack, bestSellers, ['best', 'handmade', 'trending'], 6);
    }

    // Inject New Arrivals row
    if (naTrack && newArrivals.length) {
      injectIntoTrack(naTrack, newArrivals, ['new', 'trending', 'new'], 6);
    }

    // Expose state
    window.App = window.App || {};
    window.App.Featured = {
      loaded: true,
      count: products.length,
      isFallback: data.is_fallback || false,
      timestamp: new Date().toISOString(),
    };

    document.dispatchEvent(new CustomEvent('featuredLoaded', {
      detail: { count: products.length, isFallback: data.is_fallback || false },
    }));

    console.log(`[Featured] Phase 3 complete. ${products.length} products loaded${data.is_fallback ? ' (backend fallback — no products marked featured)' : ''}.`);
  }

  /* ─── HTML ESCAPE ────────────────────────────────────────*/
  function escText(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── INIT TRIGGER ───────────────────────────────────────
     Waits for apiService (polling), then for productsLoaded
     OR runs immediately if apiService is already ready.    */
  function waitAndInit() {
    if (window.apiService && window.apiService.products && window.apiService.products.getFeatured) {
      initFeatured();
      return;
    }
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (window.apiService && window.apiService.products && window.apiService.products.getFeatured) {
        clearInterval(poll);
        initFeatured();
      } else if (attempts > 20) {
        clearInterval(poll);
        console.warn('[Featured] apiService timed out — keeping hardcoded artisan cards.');
      }
    }, 150);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitAndInit);
  } else {
    waitAndInit();
  }

})();
