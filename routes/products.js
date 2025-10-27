const express = require('express');
const { v4: uuidv4 } = require('uuid');
const validateProduct = require('../middleware/validateProduct');
const { NotFoundError } = require('../utils/errorClasses');

const router = express.Router();
let products = [];

router.get('/', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  let filtered = category ? products.filter(p => p.category === category) : products;
  const paginated = filtered.slice((page - 1) * limit, page * limit);
  res.json(paginated);
});

router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

router.post('/', validateProduct, (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', validateProduct, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

router.delete('/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));
  products.splice(index, 1);
  res.status(204).send();
});

router.get('/search', (req, res) => {
  const { name } = req.query;
  const results = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  res.json(results);
});

router.get('/stats/category', (req, res) => {
  const stats = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json(stats);
});

module.exports = router;