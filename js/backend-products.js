/* ============================================================
   BACKEND PRODUCT LOADER
   Fetches all products from Express backend and merges with local
   products.js as fallback. Populates window.products.
   ============================================================ */

'use strict';

(async function loadBackendProducts() {
  const api = window.apiService;
  if (!api) {
    console.warn('[Products] API service not found, using local products.js data.');
    return; // window.products already set by products.js
  }

  try {
    const { data: responseData, error } = await api.products.getAll();

    if (error) {
      console.error('[Products] Backend fetch error:', error);
      return; // fall back to local data
    }
    
    // Express backend might return an array or { data: [...] } or { products: [...] }
    const data = Array.isArray(responseData) ? responseData : (responseData?.products || responseData?.data);

    if (!data || data.length === 0) {
      console.warn('[Products] No products found in backend, using local products.js data.');
      return;
    }

    // Map Backend schema to the shape expected by the UI
    // Backend fields typically: id, name, price, category, stock, description, image_url, slug
    // UI fields needed: id, title, price, category, tag, shortDesc, mainImage, thumbnails, origin, rating, reviews

    const localProducts = window.products || [];
    const localMap = {};
    localProducts.forEach(lp => { localMap[lp.id] = lp; });

    window.backendProducts = data.map(p => {
      const slugId = p.slug || String(p.id);
      const localFallback = localMap[slugId] || {};
      
      // Ensure absolute image URL if the backend returns a relative one
      let imgUrl = p.image_url || localFallback.mainImage || '';
      if (imgUrl && imgUrl.startsWith('/')) {
        const baseUrl = api.getBaseUrl();
        imgUrl = `${baseUrl}${imgUrl}`;
      }

      return {
        id:          slugId,
        dbId:        p.id,
        title:       p.name || localFallback.title || 'Untitled',
        price:       parseFloat(p.price) || localFallback.price || 0,
        oldPrice:    localFallback.oldPrice || null,
        discount:    localFallback.discount || null,
        category:    (p.category || localFallback.category || '').toLowerCase(),
        tag:         p.category || localFallback.tag || 'Craft',
        shortDesc:   p.description || localFallback.shortDesc || '',
        description: p.description || localFallback.description || '',
        origin:      localFallback.origin || '',
        stock:       p.stock || localFallback.stock || 0,
        rating:      localFallback.rating || null,
        reviews:     localFallback.reviews || null,
        mainImage:   imgUrl,
        thumbnails:  imgUrl ? [imgUrl] : (localFallback.thumbnails || []),
      };
    });

    console.log(`[Products] Loaded ${window.backendProducts.length} products from backend.`);

    // Merge: Backend rows take priority; local rows fill in anything not in Backend
    const backendIds = new Set(window.backendProducts.map(p => p.id));
    const onlyLocal  = localProducts.filter(p => !backendIds.has(p.id));

    window.products = [...window.backendProducts, ...onlyLocal];
    console.log(`[Products] Merged catalogue: ${window.products.length} products total.`);

    // Notify any listeners that products have updated
    document.dispatchEvent(new CustomEvent('productsLoaded'));

  } catch (err) {
    console.error('[Products] Unexpected error loading products:', err);
  }
})();
