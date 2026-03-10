// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  aadhaar:  { type: String, required: true, unique: true },
  dob:      { type: Date, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  dose1Taken: { type: Boolean, default: false },
  dose2Taken: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (pwd) { return bcrypt.compare(pwd, this.password); };

const User = mongoose.model('User', userSchema);

// models/Centre.js
const centreSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  address:  { type: String, required: true },
  district: { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  vaccines: [{ type: String }],
  feeType:  { type: String, enum: ['Free', 'Paid'], default: 'Free' },
  feeAmount:{ type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Centre = mongoose.model('Centre', centreSchema);

// models/Slot.js
const slotSchema = new mongoose.Schema({
  centre:       { type: mongoose.Schema.Types.ObjectId, ref: 'Centre', required: true },
  date:         { type: Date, required: true },
  startTime:    { type: String, required: true },
  endTime:      { type: String, required: true },
  vaccine:      { type: String, required: true },
  doseNumber:   { type: Number, enum: [1, 2], required: true },
  totalSlots:   { type: Number, required: true },
  bookedSlots:  { type: Number, default: 0 },
}, { timestamps: true });

slotSchema.virtual('availableSlots').get(function () { return this.totalSlots - this.bookedSlots; });
slotSchema.virtual('isFull').get(function () { return this.bookedSlots >= this.totalSlots; });

const Slot = mongoose.model('Slot', slotSchema);

// models/Booking.js
const bookingSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slot:     { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  centre:   { type: mongoose.Schema.Types.ObjectId, ref: 'Centre', required: true },
  vaccine:  { type: String, required: true },
  doseNumber: { type: Number, required: true },
  bookingRef: { type: String, unique: true },
  status:   { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  appointmentDate: { type: Date, required: true },
}, { timestamps: true });

bookingSchema.pre('save', function (next) {
  if (!this.bookingRef) this.bookingRef = 'VX' + Date.now().toString(36).toUpperCase();
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { User, Centre, Slot, Booking };
