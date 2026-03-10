// routes/centres.js
const express = require('express');
const { Centre } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { district, state, pincode } = req.query;
    const q = { isActive: true };
    if (district) q.district = new RegExp(district, 'i');
    if (state)    q.state = new RegExp(state, 'i');
    if (pincode)  q.pincode = pincode;
    res.json(await Centre.find(q));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await Centre.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Centre not found' });
    res.json(c);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await Centre.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const c = await Centre.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
