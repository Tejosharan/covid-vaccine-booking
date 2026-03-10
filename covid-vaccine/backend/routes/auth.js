// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');
const router = express.Router();

const token = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, aadhaar, dob } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    if (await User.findOne({ aadhaar })) return res.status(400).json({ message: 'Aadhaar already registered' });
    const user = await User.create({ name, email, phone, password, aadhaar, dob });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: token(user._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && await user.matchPassword(req.body.password)) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, dose1Taken: user.dose1Taken, dose2Taken: user.dose2Taken, token: token(user._id) });
    } else { res.status(401).json({ message: 'Invalid credentials' }); }
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
