# COVID-19 Vaccine Slot Booking System

A full-stack COVID vaccination slot booking portal inspired by CoWIN, built with the MERN stack. Users can register, find available slots by district/date, book appointments, and manage their bookings.

## Features
- User registration with Aadhaar, DOB, phone verification
- Search vaccination centres by district, pincode, state
- Filter available slots by date, dose number, vaccine type
- Real-time slot availability tracking
- Dose 1 & Dose 2 booking with eligibility checks
- Booking cancellation with automatic slot release
- Unique booking reference for each appointment
- Admin panel to manage centres and slots
- JWT-based authentication

## Tech Stack
- **Frontend:** React, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT, bcryptjs

## Getting Started

### Backend
```bash
cd backend
npm install
# Create .env:
# MONGO_URI=mongodb://localhost:27017/vaccine-booking
# JWT_SECRET=your_secret_key
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register with Aadhaar |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |

### Centres
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/centres | List centres (filter by district/state) |
| POST | /api/centres | Add centre (Admin) |

### Slots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/slots | Available slots (filter by centre/date/dose) |
| POST | /api/slots | Create slot (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | Book a slot |
| GET | /api/bookings/my | My bookings |
| DELETE | /api/bookings/:id | Cancel booking |
| GET | /api/bookings | All bookings (Admin) |

## Business Logic
- Dose 2 can only be booked after Dose 1 is confirmed
- Cancellation releases the slot back to available pool
- Unique booking reference generated per appointment
- Duplicate booking prevention per slot
