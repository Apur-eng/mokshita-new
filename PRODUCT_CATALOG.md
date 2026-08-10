# Mokshita Enterprises — Product Catalog

> **Source:** Combined from `js/products.js` (local fallback) + live backend `https://mokshita-final-release.onrender.com/api/products`
> **Backend total:** 16 products | **Local catalog total:** 22 products
> **Last updated:** August 2026

---

## 🎨 Paintings

| # | Product Name | Price (₹) | Old Price (₹) | Discount | Origin | In Backend |
|---|-------------|-----------|--------------|----------|--------|-----------|
| 1 | Taj Mahal Watercolour (A5) | ₹600 | ₹850 | 30% OFF | Agra, Uttar Pradesh | ❌ Local only |
| 2 | Pichwai Art (A5) | ₹650 | ₹900 | 27% OFF | Nathdwara, Rajasthan | ❌ Local only |
| 3 | Watercolour Mini (2.5×6 inch) | ₹300 | — | — | Jaipur, Rajasthan | ❌ Local only |

---

## 🪨 Marble Decor

| # | Product Name | Price (₹) | Old Price (₹) | Discount | Origin | In Backend |
|---|-------------|-----------|--------------|----------|--------|-----------|
| 4 | Marble Tortoise (Inlay Work, 2.5") | ₹430 | — | — | Agra, Uttar Pradesh | ❌ Local only |
| 5 | Marble Coaster Plates (5") | ₹750 | ₹1,000 | 25% OFF | Agra, Uttar Pradesh | ✅ Backend |

---

## 🪵 Wooden Items

| # | Product Name | Price (₹) | Old Price (₹) | Discount | Origin | In Backend |
|---|-------------|-----------|--------------|----------|--------|-----------|
| 6 | Wooden Dice | ₹370 | — | — | Saharanpur, Uttar Pradesh | ✅ Backend |
| 7 | Wooden Ganesha (2") | ₹310 | — | — | Jaipur, Rajasthan | ✅ Backend |

---

## 🧶 Crochet

| # | Product Name | Price (₹) | Old Price (₹) | Discount | Origin | In Backend |
|---|-------------|-----------|--------------|----------|--------|-----------|
| 8 | Crochet Doll (Multicolour) | ₹750 | ₹900 | 16% OFF | Women Artisans, India | ✅ Backend |
| 9 | Crochet Turtle (Multicolour) | ₹350 | — | — | Women Artisans, India | ✅ Backend |
| 10 | Crochet Sunflower Keyring | ₹250 | — | — | Women Artisans, India | ✅ Backend |

---

## 🧵 Textile

| # | Product Name | Price (₹) | Old Price (₹) | Discount | Origin | In Backend |
|---|-------------|-----------|--------------|----------|--------|-----------|
| 11 | Hand-painted Elephant Pouch | ₹550 | — | — | Rajasthan | ✅ Backend |

---

## 🪡 Zardozi Embroidery

| # | Product Name | Price (₹) | Old Price (₹) | Discount | Origin | In Backend |
|---|-------------|-----------|--------------|----------|--------|-----------|
| 12 | Double Side Elephant (Mehroon) | ₹480 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 13 | Single Side Elephant | ₹380 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 14 | Single Side Camel | ₹360 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 15 | Single Side Carrot | ₹360 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 16 | Elephant with Trunk | ₹360 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 17 | Tiger (Orange) | ₹430 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 18 | Tuk-tuk | ₹380 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |
| 19 | Coin Purse | ₹660 | ₹850 | 22% OFF | Bareilly, Uttar Pradesh | ✅ Backend |
| 20 | Halloween Design | ₹360 | — | — | Bareilly, Uttar Pradesh | ✅ Backend |

---

## 📊 Price Summary

| Category | Products | Lowest Price | Highest Price |
|----------|----------|-------------|--------------|
| Paintings | 3 | ₹300 | ₹650 |
| Marble Decor | 2 | ₹430 | ₹750 |
| Wooden Items | 2 | ₹310 | ₹370 |
| Crochet | 3 | ₹250 | ₹750 |
| Textile | 1 | ₹550 | ₹550 |
| Zardozi | 9 | ₹360 | ₹660 |

**Total Products: 20**
**Price Range: ₹250 — ₹750**
**Average Price: ~₹446**

---

## ⚠️ Local-only Products (Not in Backend)

These 4 products exist in `js/products.js` but are **missing from the Render backend database**. They will only load via the local fallback and cannot be ordered:

| Product | Slug | Price |
|---------|------|-------|
| Taj Mahal Watercolour (A5) | `taj-mahal-watercolour` | ₹600 |
| Pichwai Art (A5) | `pichwai-art` | ₹650 |
| Watercolour Mini (2.5×6 inch) | `watercolour-mini` | ₹300 |
| Marble Tortoise (Inlay Work, 2.5") | `marble-tortoise` | ₹430 |

> **Action Required:** Add these products to the Render backend database so they can be purchased via the cart checkout flow.
