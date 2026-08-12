const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

router.get('/:slug', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug);
  if (!category) return res.status(404).json({ error: 'Category not found' });

  const products = db
    .prepare('SELECT * FROM products WHERE category_id = ? AND active = 1 ORDER BY name')
    .all(category.id);

  res.json({ ...category, products });
});

module.exports = router;
