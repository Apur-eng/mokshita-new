const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search, featured, limit = 50, offset = 0 } = req.query;
  let sql = `
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1
  `;
  const params = [];

  if (category) {
    sql += ' AND c.slug = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.vehicle_fitment LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }
  if (featured === 'true') {
    sql += ' AND p.featured = 1';
  }

  sql += ' ORDER BY p.featured DESC, p.name LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const products = db.prepare(sql).all(...params);
  res.json(products);
});

router.get('/featured', (req, res) => {
  const limit = Number(req.query.limit) || 8;
  const products = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.active = 1 AND p.featured = 1
    ORDER BY p.name LIMIT ?
  `).all(limit);
  res.json(products);
});

router.get('/slug/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ? AND p.active = 1
  `).get(req.params.slug);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  const related = db.prepare(`
    SELECT p.*, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.category_id = ? AND p.id != ? AND p.active = 1
    LIMIT 4
  `).all(product.category_id, product.id);

  res.json({ ...product, related });
});

router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

module.exports = router;
