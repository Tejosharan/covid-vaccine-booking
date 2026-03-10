// routes/bookings.js
const express = require('express');
const { Booking, Slot, User } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

// POST /api/bookings — book a slot
router.post('/', protect, async (req, res) => {
  try {
    const { slotId } = req.body;
    const slot = await Slot.findById(slotId).populate('centre');
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.bookedSlots >= slot.totalSlots) return res.status(400).json({ message: 'Slot is fully booked' });

    const user = await User.findById(req.user._id);
    if (slot.doseNumber === 1 && user.dose1Taken) return res.status(400).json({ message: 'Dose 1 already booked/taken' });
    if (slot.doseNumber === 2 && !user.dose1Taken) return res.status(400).json({ message: 'Please complete Dose 1 first' });
    if (slot.doseNumber === 2 && user.dose2Taken) return res.status(400).json({ message: 'Dose 2 already booked/taken' });

    // Check duplicate booking for same slot
    const existing = await Booking.findOne({ user: req.user._id, slot: slotId, status: 'confirmed' });
    if (existing) return res.status(400).json({ message: 'Already booked this slot' });

    const booking = await Booking.create({
      user: req.user._id,
      slot: slotId,
      centre: slot.centre._id,
      vaccine: slot.vaccine,
      doseNumber: slot.doseNumber,
      appointmentDate: slot.date,
    });

    // Increment booked count
    slot.bookedSlots += 1;
    await slot.save();

    await booking.populate([
      { path: 'slot', populate: { path: 'centre', select: 'name address district' } }
    ]);

    res.status(201).json({ message: 'Booking confirmed!', booking });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/bookings/my
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('centre', 'name address district')
      .populate('slot', 'date startTime endTime vaccine doseNumber')
      .sort('-createdAt');
    res.json(bookings);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/bookings/:id — cancel
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    booking.status = 'cancelled';
    await booking.save();

    // Release the slot
    await Slot.findByIdAndUpdate(booking.slot, { $inc: { bookedSlots: -1 } });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/bookings (admin — all)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone aadhaar')
      .populate('centre', 'name district')
      .sort('-createdAt');
    res.json(bookings);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
