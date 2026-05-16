/* ============================================================
   HOMEPAGE CMS — Phase 1 Frontend Evolution
   ============================================================
   Consumes:
     GET /api/content/homepage  → hero, stats, benefits
     GET /api/content/brand     → founder_quote, statistics
     GET /api/content/footer    → footer links / brand desc

   Strategy:
   - NEVER erases existing HTML structure
   - ONLY enriches text/content where backend has data
   - Always falls back to the hardcoded HTML if API is down
   - Fires 'homepageCMSLoaded' event after enrichment
   - Exposes window.App.CMS for external inspection
   ============================================================ */
'use strict';

(function () {

  /* ─── LOCAL FALLBACKS ─────────────────────────────────────
     These mirror the exact hardcoded values in index.html.
     Used when the backend is unreachable.                    */
  const FALLBACK = {
    hero: {
      eyebrow:  'Real artisans • Real craftsmanship • Real heritage',
      title:    'Crafted by Hands.\nPreserved Through Generations.',
      subtitle: 'Every purchase directly supports local artisans and keeps traditional Indian craftsmanship alive.',
    },
    stats: [
      { value: '120+', label: 'Master Artisans' },
      { value: '18',   label: 'States Covered'  },
      { value: '2400+',label: 'Happy Travellers' },
      { value: '8',    label: 'Years of Craft'   },
    ],
    quote: {
      text:   "India does not lack talent — it lacks the world's gaze turned toward her makers.",
      author: 'Riya Mehta, Founder',
    },
    footer: {
      brand_desc: "Connecting the world to India's living artisan traditions and curating experiences that transform the way you see this ancient civilisation.",
      copyright:  '© 2025 Mokshita Enterprises. All rights reserved.',
    },
  };

  /* ─── SAFE TEXT SETTER ───────────────────────────────────
     Sets textContent only if the element exists and the
     value is a non-empty string. Never crashes on missing IDs. */
  function setText(id, value) {
    if (!value || typeof value !== 'string') return;
    const el = document.getElementById(id);
    if (el) el.textContent = value.trim();
  }

  /* ─── SAFE HTML SETTER ───────────────────────────────────
     Injects HTML — used only for hero title (allows <em> / <br/>). */
  function setHTML(id, html) {
    if (!html || typeof html !== 'string') return;
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  /* ─── RENDER HERO ────────────────────────────────────────*/
  function renderHero(hero) {
    if (!hero || typeof hero !== 'object') return;

    // Eyebrow line
    const eyebrowEl = document.getElementById('hero-eyebrow');
    if (eyebrowEl && hero.eyebrow) {
      // Preserve the decorative <span class="hero-eyebrow-line"> inside
      const line = eyebrowEl.querySelector('.hero-eyebrow-line');
      eyebrowEl.textContent = ' ' + hero.eyebrow;
      if (line) eyebrowEl.insertBefore(line, eyebrowEl.firstChild);
    }

    // Title — backend may send safe HTML with <em>/<br>
    if (hero.title_html) {
      setHTML('hero-title', hero.title_html);
    } else if (hero.title) {
      setText('hero-title', hero.title);
    }

    // Subtitle
    setText('hero-subtitle', hero.subtitle);

    // CTA buttons (only if backend provides them and elements exist)
    const actionsEl = document.getElementById('hero-actions');
    if (actionsEl && Array.isArray(hero.ctas) && hero.ctas.length) {
      actionsEl.innerHTML = hero.ctas.map(cta =>
        `<a href="${escAttr(cta.href || '#')}" class="${escAttr(cta.class || 'btn btn-primary')}">${escText(cta.label || '')}</a>`
      ).join('');
    }

    console.log('[CMS] Hero section enriched from backend.');
  }

  /* ─── RENDER STORY STATS ─────────────────────────────────
     Targets the .story-stat-num elements in the story section.
     Updates both the displayed text AND the data-target attribute
     so the existing counter animation still works.           */
  function renderStats(stats) {
    // stats can come from homepage.stats OR brand.statistics
    const list = Array.isArray(stats)
      ? stats
      : (stats && Array.isArray(stats.items) ? stats.items : null);

    if (!list || !list.length) return;

    const statEls = document.querySelectorAll('.story-stat-num');
    if (!statEls.length) return;

    list.forEach((stat, idx) => {
      const el = statEls[idx];
      if (!el) return;

      const rawVal = String(stat.value || stat.number || '');
      // Extract numeric part and suffix for counter animation
      const numMatch = rawVal.match(/^(\d+)(.*)/);
      if (numMatch) {
        el.dataset.target = numMatch[1];
        el.dataset.suffix = numMatch[2] || '';
      }
      el.textContent = rawVal;

      // Update label sibling
      const labelEl = el.nextElementSibling;
      if (labelEl && labelEl.classList.contains('story-stat-label') && stat.label) {
        labelEl.textContent = stat.label;
      }
    });

    console.log('[CMS] Story stats enriched from backend.');
  }

  /* ─── RENDER FOUNDER QUOTE ───────────────────────────────*/
  function renderFounderQuote(quote) {
    if (!quote || typeof quote !== 'object') return;

    const blockquote = document.querySelector('.story-text-panel blockquote');
    if (!blockquote) return;

    if (quote.text) {
      // Preserve the <footer> author element
      const footer = blockquote.querySelector('footer');
      blockquote.textContent = '"' + quote.text + '"';
      if (footer) {
        if (quote.author) footer.innerHTML = `— ${escText(quote.author)}`;
        blockquote.appendChild(footer);
      }
    }

    console.log('[CMS] Founder quote enriched from backend.');
  }

  /* ─── RENDER FOOTER BRAND DESC ───────────────────────────*/
  function renderFooterBrand(footerData) {
    if (!footerData || typeof footerData !== 'object') return;

    // Brand description paragraph in footer
    const descEl = document.querySelector('footer .footer-brand-desc');
    if (descEl && footerData.brand_description) {
      descEl.textContent = footerData.brand_description;
    }

    // Copyright line
    const copyEl = document.querySelector('.footer-copy');
    if (copyEl && footerData.copyright) {
      copyEl.textContent = footerData.copyright;
    }

    // Dynamic footer link columns — only if backend provides structured links
    if (Array.isArray(footerData.columns)) {
      renderFooterColumns(footerData.columns);
    }

    console.log('[CMS] Footer enriched from backend.');
  }

  /* ─── RENDER FOOTER COLUMNS (optional) ──────────────────
     Only replaces the <ul class="footer-links"> lists if the
     backend provides structured column data. Leaves layout intact. */
  function renderFooterColumns(columns) {
    const footerTop = document.querySelector('footer .footer-top');
    if (!footerTop) return;

    // Find existing column divs (skip the first — that's the brand div)
    const colDivs = Array.from(footerTop.querySelectorAll(':scope > div')).slice(1);

    columns.forEach((col, idx) => {
      const colDiv = colDivs[idx];
      if (!colDiv) return;

      const titleEl = colDiv.querySelector('.footer-col-title');
      if (titleEl && col.title) titleEl.textContent = col.title;

      const ulEl = colDiv.querySelector('.footer-links');
      if (ulEl && Array.isArray(col.links)) {
        ulEl.innerHTML = col.links.map(link =>
          `<li><a href="${escAttr(link.href || '#')}" class="footer-link">${escText(link.label || '')}</a></li>`
        ).join('');
      }
    });
  }

  /* ─── RENDER LAYOUT (Dynamic Section Ordering) ────────────
     Reorders DOM sections inside #homepage-main based on the
     layout array provided by the backend.                     */
  function renderLayout(layoutArray) {
    if (!Array.isArray(layoutArray) || layoutArray.length === 0) return;

    const container = document.getElementById('homepage-main');
    if (!container) return;

    console.log('[CMS] Reordering homepage sections:', layoutArray);
    
    // Iterate through layout array and append each element to the container
    // This moves existing DOM nodes into the correct order without recreating them
    layoutArray.forEach(sectionId => {
      const el = document.getElementById(sectionId);
      if (el && el.parentElement === container) {
        container.appendChild(el);
      }
    });
  }

  /* ─── HTML ESCAPE HELPERS ────────────────────────────────*/
  function escText(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─── MAIN BOOTSTRAP ─────────────────────────────────────
     Fetches all three content endpoints in parallel.
     Each section degrades independently — one API failure
     doesn't break the others.                              */
  async function initHomepageCMS() {
    const api = window.apiService;
    if (!api || !api.content) {
      console.warn('[CMS] apiService.content not available — using hardcoded content.');
      return;
    }

    console.log('[CMS] Fetching homepage content from backend...');

    // Fire all three requests in parallel
    const [homepageResult, brandResult, footerResult] = await Promise.allSettled([
      api.content.getHomepage(),
      api.content.getBrand(),
      api.content.getFooter(),
    ]);

    /* ── Homepage composite (hero + stats + benefits + layout) ── */
    if (homepageResult.status === 'fulfilled' && !homepageResult.value.error) {
      const hpData = homepageResult.value.data?.data || homepageResult.value.data || {};
      renderHero(hpData.hero || {});
      renderStats(hpData.stats || []);
      if (hpData.layout && Array.isArray(hpData.layout)) {
        renderLayout(hpData.layout);
      }
    } else {
      console.warn('[CMS] Homepage content unavailable — using fallback hero/stats.');
    }

    /* ── Brand (founder quote + statistics) ── */
    if (brandResult.status === 'fulfilled' && !brandResult.value.error) {
      const brandData = brandResult.value.data?.data || brandResult.value.data || {};
      renderFounderQuote(brandData.founder_quote || {});
      // stats may also come from brand if homepage.stats is empty
      if (brandData.statistics && Array.isArray(brandData.statistics.items)) {
        renderStats(brandData.statistics.items);
      }
    } else {
      console.warn('[CMS] Brand content unavailable — using fallback founder quote.');
    }

    /* ── Footer ── */
    if (footerResult.status === 'fulfilled' && !footerResult.value.error) {
      const footerData = footerResult.value.data?.data || footerResult.value.data || {};
      renderFooterBrand(footerData);
    } else {
      console.warn('[CMS] Footer content unavailable — using hardcoded footer.');
    }

    // Expose CMS state globally for debugging / other modules
    window.App = window.App || {};
    window.App.CMS = {
      loaded: true,
      timestamp: new Date().toISOString(),
      reload: initHomepageCMS,
    };

    // Signal completion
    document.dispatchEvent(new CustomEvent('homepageCMSLoaded', { detail: { timestamp: window.App.CMS.timestamp } }));
    console.log('[CMS] Phase 1 enrichment complete.');
  }

  /* ─── INIT TRIGGER ───────────────────────────────────────
     Wait for apiService to be available (after axios + api.js load).
     Uses DOMContentLoaded for clean ordering.               */
  function waitForAPIAndInit() {
    if (window.apiService && window.apiService.content) {
      initHomepageCMS();
    } else {
      // api.js loads after DOMContentLoaded in script order — check briefly
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        if (window.apiService && window.apiService.content) {
          clearInterval(poll);
          initHomepageCMS();
        } else if (attempts > 20) {
          clearInterval(poll);
          console.warn('[CMS] apiService timed out — running with hardcoded content.');
        }
      }, 150);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForAPIAndInit);
  } else {
    waitForAPIAndInit();
  }

})();
