/* ============================================================
   MOKSHITA ENTERPRISES — HOMEPAGE ECOMMERCE ENGINE
   Single-row horizontal scroll, product deduplication,
   category mixing, loading skeletons, and interactive cart.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initHomeEcommerce);

  async function initHomeEcommerce() {
    renderSkeletons();
    
    // Load products with fallback
    let productsList = await loadProducts();
    
    if (!productsList || productsList.length === 0) {
      productsList = (window.products || []).map(formatLocalProduct);
    }

    // Deduplicate products
    const uniqueProducts = getUniqueProducts(productsList);

    if (uniqueProducts && uniqueProducts.length > 0) {
      renderFeaturedProducts(uniqueProducts);
      renderCategoryShowcases(uniqueProducts);
    } else {
      renderEmptyStates();
    }

    bindScrollNavControls();
    bindAddToCartEvents();
  }

  /* ─── 1. DEDUPLICATION & CATEGORY MIXING ────────────────── */
  function getUniqueProducts(list) {
    const seen = new Set();
    const unique = [];

    list.forEach(p => {
      const key = (p.id || p.title || '').toString().toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    });

    return unique;
  }

  function getMixedFeaturedProducts(products) {
    // Interleave across categories so adjacent cards feature different craft types
    const categories = {};
    products.forEach(p => {
      const cat = (p.category || 'general').toLowerCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(p);
    });

    const mixed = [];
    const catKeys = Object.keys(categories);
    let added = true;
    let index = 0;

    while (added && mixed.length < 10) {
      added = false;
      for (const k of catKeys) {
        if (categories[k][index]) {
          mixed.push(categories[k][index]);
          added = true;
          if (mixed.length >= 10) break;
        }
      }
      index++;
    }

    return mixed.length >= 4 ? mixed : products.slice(0, 10);
  }

  /* ─── 2. PRODUCT DATA FETCHING ──────────────────────────── */
  async function loadProducts() {
    try {
      if (window.apiService && window.apiService.products && typeof window.apiService.products.getProducts === 'function') {
        const res = await window.apiService.products.getProducts();
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          return data.map(formatApiProduct);
        }
      }
    } catch (err) {
      console.warn('[HomeEcommerce] API fetch offline or failed, using local product catalog:', err);
    }
    
    return (window.products || []).map(formatLocalProduct);
  }

  function formatApiProduct(p) {
    return {
      id: p.id || p._id || p.title,
      title: p.title || p.name || 'Handcrafted Art',
      category: (p.category && typeof p.category === 'object' ? p.category.slug : p.category) || 'handicrafts',
      price: p.price || 0,
      oldPrice: p.old_price || p.oldPrice || null,
      discount: p.discount || (p.old_price ? Math.round((1 - p.price / p.old_price) * 100) + '% OFF' : null),
      rating: p.rating || 4.9,
      reviews: p.reviews_count || p.reviews || 24,
      tag: p.tag || 'Handcrafted',
      origin: p.origin || p.craft_location || 'India',
      mainImage: p.main_image || p.mainImage || (p.images && p.images[0]) || 'images/artisan_working.png'
    };
  }

  function formatLocalProduct(p) {
    return {
      id: p.id || p.title,
      title: p.title,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice || null,
      discount: p.discount || null,
      rating: p.rating || 4.8,
      reviews: p.reviews || 15,
      tag: p.tag || 'Handcrafted',
      origin: p.origin || 'Handcrafted in India',
      mainImage: p.mainImage || 'images/artisan_working.png'
    };
  }

  /* ─── 3. SKELETON STATES ────────────────────────────────── */
  function renderSkeletons() {
    const featuredTrack = document.getElementById('featured-products-grid');
    if (featuredTrack) {
      featuredTrack.innerHTML = Array(6).fill(0).map(() => `
        <div class="home-product-card home-product-card--skeleton">
          <div class="skeleton-img"></div>
          <div class="skeleton-body">
            <div class="skeleton-line short"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line med"></div>
          </div>
        </div>
      `).join('');
    }
  }

  /* ─── 4. RENDER FEATURED PRODUCTS ──────────────────────── */
  function renderFeaturedProducts(products) {
    const featuredTrack = document.getElementById('featured-products-grid');
    if (!featuredTrack) return;

    const mixedFeatured = getMixedFeaturedProducts(products);
    
    featuredTrack.innerHTML = mixedFeatured.map(p => createProductCardHTML(p)).join('');
    bindAddToCartEvents();
  }

  /* ─── 5. RENDER CATEGORY SHOWCASES ──────────────────────── */
  function renderCategoryShowcases(products) {
    // Only 2 category rows shown on homepage
    const categories = [
      {
        id: 'marble',
        gridId: 'cat-grid-marble',
        match: c => c.includes('marble') || c.includes('stone') || c.includes('inlay')
      },
      {
        id: 'painting',
        gridId: 'cat-grid-painting',
        match: c => c.includes('painting') || c.includes('pichwai') || c.includes('art')
      }
    ];

    categories.forEach(cat => {
      const gridEl = document.getElementById(cat.gridId);
      if (!gridEl) return;

      // Filter products matching this category
      let filtered = products.filter(p => cat.match((p.category || '').toLowerCase()));

      // Guarantee at least 4 — pad with non-duplicate general products if needed
      if (filtered.length < 4) {
        const usedIds = new Set(filtered.map(p => p.id));
        const extras = products.filter(p => !usedIds.has(p.id));
        filtered = [...filtered, ...extras].slice(0, 8);
      }

      // Show up to 8 products per track
      const list = filtered.slice(0, 8);
      gridEl.innerHTML = list.map(p => createProductCardHTML(p)).join('');
    });

    bindAddToCartEvents();
    bindScrollNavControls();
  }

  /* ─── 6. CARD MARKUP BUILDER ────────────────────────────── */
  function createProductCardHTML(p) {
    const formatPrice = (val) => '₹' + Number(val).toLocaleString('en-IN');
    const imageSrc = p.mainImage || 'images/artisan_working.png';
    
    return `
      <article class="home-product-card" data-product-id="${p.id}">
        <div class="home-product-img-wrap">
          <img src="${imageSrc}" alt="${p.title}" loading="lazy" onerror="this.onerror=null;this.src='images/artisan_working.png';" />
          ${p.discount ? `<span class="home-product-badge">${p.discount}</span>` : ''}
          <span class="home-product-tag">${p.tag}</span>
          <div class="home-product-overlay">
            <button class="home-product-quickadd btn-home-atc" data-id="${p.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              Quick Add
            </button>
          </div>
        </div>
        <div class="home-product-info">
          <div class="home-product-meta">
            <span class="home-product-rating">★ ${p.rating} (${p.reviews})</span>
          </div>
          <h3 class="home-product-title">
            <a href="product-detail.html?id=${p.id}">${p.title}</a>
          </h3>
          <div class="home-product-footer">
            <div class="home-product-price-box">
              <span class="home-product-price">${formatPrice(p.price)}</span>
              ${p.oldPrice ? `<span class="home-product-oldprice">${formatPrice(p.oldPrice)}</span>` : ''}
            </div>
            <button class="btn-home-atc-icon btn-home-atc" data-id="${p.id}" aria-label="Add ${p.title} to cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /* ─── 7. SCROLL NAVIGATION CONTROLS ─────────────────────── */
  function bindScrollNavControls() {
    // Featured section scroll buttons
    const featuredTrack = document.getElementById('featured-products-grid');
    const prevBtn = document.getElementById('featured-scroll-prev');
    const nextBtn = document.getElementById('featured-scroll-next');

    if (featuredTrack && prevBtn) {
      prevBtn.addEventListener('click', () => featuredTrack.scrollBy({ left: -280, behavior: 'smooth' }));
    }
    if (featuredTrack && nextBtn) {
      nextBtn.addEventListener('click', () => featuredTrack.scrollBy({ left: 280, behavior: 'smooth' }));
    }

    // Category row scroll buttons (use data-target attribute)
    document.querySelectorAll('.cat-scroll-prev, .cat-scroll-next').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = 'true';

      const targetId = btn.dataset.target;
      const track = document.getElementById(targetId);
      if (!track) return;

      const direction = btn.classList.contains('cat-scroll-prev') ? -280 : 280;
      btn.addEventListener('click', () => track.scrollBy({ left: direction, behavior: 'smooth' }));
    });
  }


  /* ─── 8. EMPTY STATE ────────────────────────────────────── */
  function renderEmptyStates() {
    const featuredTrack = document.getElementById('featured-products-grid');
    if (featuredTrack) {
      featuredTrack.innerHTML = `
        <div class="home-products-empty">
          <p>Our artisans are crafting new masterpieces. Check back soon!</p>
          <a href="handicrafts.html" class="btn btn-outline">Explore Catalog</a>
        </div>`;
    }
  }

  /* ─── 9. INTERACTIVE ADD TO CART ────────────────────────── */
  function bindAddToCartEvents() {
    document.querySelectorAll('.btn-home-atc').forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = 'true';

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const productId = btn.dataset.id;
        if (!productId) return;

        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `Added ✓`;

        if (typeof window.addToCart === 'function') {
          await window.addToCart(productId, 1);
        } else {
          const cart = JSON.parse(localStorage.getItem('mokshita_cart') || '[]');
          const item = cart.find(i => i.id === productId);
          if (item) item.quantity += 1;
          else cart.push({ id: productId, quantity: 1 });
          localStorage.setItem('mokshita_cart', JSON.stringify(cart));
          
          document.querySelectorAll('.cart-badge').forEach(b => {
            const count = cart.reduce((s, i) => s + (i.quantity || 0), 0);
            b.innerText = count;
            b.style.display = count > 0 ? 'flex' : 'none';
          });
        }

        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalContent;
        }, 1500);
      });
    });
  }

})();
