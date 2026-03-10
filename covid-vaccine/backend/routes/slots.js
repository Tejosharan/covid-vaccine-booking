// routes/slots.js
const express = require('express');
const { Slot } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET /api/slots?centreId=&date=&doseNumber=&vaccine=
router.get('/', async (req, res) => {
  try {
    const { centreId, date, doseNumber, vaccine } = req.query;
    const q = {};
    if (centreId)   q.centre = centreId;
    if (doseNumber) q.doseNumber = Number(doseNumber);
    if (vaccine)    q.vaccine = new RegExp(vaccine, 'i');
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      q.date = { $gte: d, $lt: next };
    }
    const slots = await Slot.find(q).populate('centre', 'name address district feeType feeAmount');
    const result = slots.map(s => ({
      ...s.toObject(),
      availableSlots: s.totalSlots - s.bookedSlots,
      isFull: s.bookedSlots >= s.totalSlots
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await Slot.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
