import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use(c => { const t = localStorage.getItem('vax_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });

const Ctx = createContext();
const useApp = () => useContext(Ctx);

const s = {
  page: { background: '#f0f4f8', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  nav: { background: '#0059b3', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontWeight: 800, fontSize: '1.3rem', letterSpacing: '0.5px' },
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '1rem' },
  btn: (color='#0059b3') => ({ background: color, color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }),
  btnSm: { background: '#0059b3', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  badge: (c) => ({ background: c, color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }),
  tab: (a) => ({ padding: '0.6rem 1.4rem', cursor: 'pointer', border: 'none', borderBottom: a ? '3px solid #0059b3' : '3px solid transparent', background: 'none', color: a ? '#0059b3' : '#666', fontWeight: a ? 700 : 400, fontSize: '0.95rem' }),
  label: { fontSize: '0.85rem', color: '#555', marginBottom: '0.3rem', display: 'block' },
  alert: (t) => ({ padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', background: t === 'success' ? '#e6f4ea' : '#fdecea', color: t === 'success' ? '#1e7e34' : '#c0392b', fontSize: '0.9rem' })
};

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  useEffect(() => {
    const t = localStorage.getItem('vax_token');
    if (t) API.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('vax_token'));
  }, []);
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('vax_token', data.token);
    setUser(data); setPage('dashboard');
  };
  const logout = () => { localStorage.removeItem('vax_token'); setUser(null); setPage('home'); };
  return <Ctx.Provider value={{ user, login, logout, page, setPage }}>{children}</Ctx.Provider>;
}

function Navbar() {
  const { user, logout, setPage } = useApp();
  return (
    <nav style={s.nav}>
      <div style={s.brand} onClick={() => setPage('home')} role="button" title="Home" style={{ ...s.brand, cursor: 'pointer' }}>
        💉 CoWIN Booking Portal
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem' }}>👤 {user.name}</span>
            <button onClick={() => setPage('dashboard')} style={s.btnSm}>Dashboard</button>
            <button onClick={() => setPage('book')} style={s.btnSm}>Book Slot</button>
            <button onClick={logout} style={{ ...s.btnSm, background: '#c0392b' }}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('login')} style={s.btnSm}>Login</button>
            <button onClick={() => setPage('register')} style={{ ...s.btnSm, background: '#27ae60' }}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const { setPage } = useApp();
  return (
    <div style={{ ...s.container, textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💉</div>
      <h1 style={{ fontSize: '2.5rem', color: '#0059b3', marginBottom: '1rem' }}>COVID-19 Vaccine Booking</h1>
      <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem', lineHeight: 1.7 }}>
        Book your COVID-19 vaccination slot at the nearest centre. Safe, free, and easy to use.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <button onClick={() => setPage('register')} style={s.btn()}>Register Now</button>
        <button onClick={() => setPage('find')} style={{ ...s.btn('#27ae60') }}>Find Slots</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
        {[['🏥', 'Find Centres', 'Search vaccination centres near you by district or pincode'],
          ['📅', 'Book Slots', 'Choose a convenient date and time slot for both doses'],
          ['📋', 'Track Bookings', 'View and manage all your vaccine appointments in one place']
        ].map(([icon, title, desc]) => (
          <div key={title} style={s.card}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
            <h3 style={{ color: '#0059b3', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login() {
  const { login } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const handle = async () => { try { await login(form.email, form.password); } catch { setError('Invalid credentials'); } };
  return (
    <div style={{ ...s.container, maxWidth: '420px' }}>
      <div style={s.card}>
        <h2 style={{ color: '#0059b3', marginBottom: '1.5rem' }}>Login to your account</h2>
        {error && <div style={s.alert('error')}>{error}</div>}
        <label style={s.label}>Email</label>
        <input style={s.input} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@email.com" />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password" />
        <button onClick={handle} style={{ ...s.btn(), width: '100%' }}>Login</button>
      </div>
    </div>
  );
}

function Register() {
  const { setPage } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', aadhaar: '', dob: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const handle = async () => {
    try {
      await API.post('/auth/register', form);
      setMsg('Registration successful! Please login.'); setError('');
    } catch (e) { setError(e.response?.data?.message || 'Error'); setMsg(''); }
  };
  return (
    <div style={{ ...s.container, maxWidth: '520px' }}>
      <div style={s.card}>
        <h2 style={{ color: '#0059b3', marginBottom: '1.5rem' }}>Create Account</h2>
        {msg   && <div style={s.alert('success')}>{msg} <button onClick={() => setPage('login')} style={{ background: 'none', border: 'none', color: '#0059b3', cursor: 'pointer', textDecoration: 'underline' }}>Login</button></div>}
        {error && <div style={s.alert('error')}>{error}</div>}
        <div style={s.grid}>
          {[['Full Name', 'name', 'text', 'Tejo Sharan'], ['Email', 'email', 'email', 'you@email.com'], ['Phone', 'phone', 'tel', '9999999999'], ['Aadhaar Number', 'aadhaar', 'text', '1234 5678 9012'], ['Password', 'password', 'password', ''], ['Date of Birth', 'dob', 'date', '']].map(([label, key, type, ph]) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input style={s.input} type={type} placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
        </div>
        <button onClick={handle} style={{ ...s.btn(), width: '100%' }}>Register</button>
      </div>
    </div>
  );
}

function FindSlots() {
  const { user, setPage } = useApp();
  const [filters, setFilters] = useState({ district: '', date: '', doseNumber: '1', vaccine: '' });
  const [slots, setSlots] = useState([]);
  const [msg, setMsg] = useState('');
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const search = async () => {
    try {
      const { data } = await API.get('/slots', { params: filters });
      setSlots(data);
    } catch { setMsg('Error fetching slots'); }
  };

  const book = async (slotId) => {
    if (!user) { setPage('login'); return; }
    try {
      await API.post('/bookings', { slotId });
      setMsg('Booking confirmed! Check your dashboard.'); search();
    } catch (e) { setMsg(e.response?.data?.message || 'Booking failed'); }
  };

  return (
    <div style={s.container}>
      <h2 style={{ color: '#0059b3', marginBottom: '1.5rem' }}>Find Vaccination Slots</h2>
      {msg && <div style={s.alert(msg.includes('confirmed') ? 'success' : 'error')}>{msg}</div>}
      <div style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[['District', 'district', 'text', 'Chennai'], ['Date', 'date', 'date', ''], ['Vaccine', 'vaccine', 'text', 'Covaxin']].map(([label, key, type, ph]) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input style={s.input} type={type} placeholder={ph} value={filters[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={s.label}>Dose</label>
            <select style={s.input} value={filters.doseNumber} onChange={e => set('doseNumber', e.target.value)}>
              <option value="1">Dose 1</option>
              <option value="2">Dose 2</option>
            </select>
          </div>
        </div>
        <button onClick={search} style={s.btn()}>Search Slots</button>
      </div>

      {slots.map(slot => (
        <div key={slot._id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: '#0059b3' }}>{slot.centre?.name}</h3>
              <p style={{ color: '#666', margin: '0.3rem 0' }}>{slot.centre?.address}, {slot.centre?.district}</p>
              <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0', flexWrap: 'wrap' }}>
                <span style={s.badge('#0059b3')}>{slot.vaccine}</span>
                <span style={s.badge('#27ae60')}>Dose {slot.doseNumber}</span>
                <span style={s.badge(slot.centre?.feeType === 'Free' ? '#27ae60' : '#e67e22')}>{slot.centre?.feeType}</span>
              </div>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>
                📅 {new Date(slot.date).toDateString()} &nbsp;|&nbsp; 🕐 {slot.startTime} – {slot.endTime}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: slot.isFull ? '#e74c3c' : '#27ae60' }}>
                {slot.availableSlots}
              </div>
              <div style={{ color: '#888', fontSize: '0.8rem' }}>slots left</div>
              <button onClick={() => book(slot._id)} disabled={slot.isFull} style={{ ...s.btn(slot.isFull ? '#ccc' : '#27ae60'), marginTop: '0.5rem', cursor: slot.isFull ? 'not-allowed' : 'pointer' }}>
                {slot.isFull ? 'Full' : 'Book'}
              </button>
            </div>
          </div>
        </div>
      ))}
      {slots.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Search for available slots above.</p>}
    </div>
  );
}

function Dashboard() {
  const { user } = useApp();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    API.get('/bookings/my').then(r => setBookings(r.data)).catch(console.error);
  }, []);

  const cancel = async (id) => {
    try { await API.delete(`/bookings/${id}`); setBookings(b => b.map(x => x._id === id ? { ...x, status: 'cancelled' } : x)); }
    catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const statusColor = { confirmed: '#27ae60', cancelled: '#e74c3c', completed: '#0059b3' };
  const filtered = bookings.filter(b => tab === 'all' || (tab === 'upcoming' ? b.status === 'confirmed' : b.status === tab));

  return (
    <div style={s.container}>
      <h2 style={{ color: '#0059b3', marginBottom: '0.5rem' }}>Welcome, {user?.name} 👋</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0' }}>
        {['upcoming', 'cancelled', 'all'].map(t => <button key={t} onClick={() => setTab(t)} style={s.tab(tab === t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
      </div>
      {filtered.length === 0 && <div style={s.card}><p style={{ color: '#888', textAlign: 'center' }}>No bookings found.</p></div>}
      {filtered.map(b => (
        <div key={b._id} style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: '#0059b3' }}>{b.centre?.name}</h3>
              <p style={{ color: '#666', margin: '0.3rem 0', fontSize: '0.9rem' }}>{b.centre?.district}</p>
              <div style={{ display: 'flex', gap: '0.5rem', margin: '0.5rem 0' }}>
                <span style={s.badge('#0059b3')}>{b.vaccine}</span>
                <span style={s.badge('#6c757d')}>Dose {b.doseNumber}</span>
                <span style={s.badge(statusColor[b.status] || '#999')}>{b.status}</span>
              </div>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>📅 {new Date(b.appointmentDate).toDateString()}</p>
              <p style={{ color: '#aaa', fontSize: '0.8rem' }}>Booking Ref: <strong>{b.bookingRef}</strong></p>
            </div>
            {b.status === 'confirmed' && (
              <button onClick={() => cancel(b._id)} style={s.btn('#c0392b')}>Cancel</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div style={s.page}>
        <Navbar />
        <PageRouter />
      </div>
    </AppProvider>
  );
}

function PageRouter() {
  const { page, user } = useApp();
  if (page === 'home')      return <Home />;
  if (page === 'login')     return <Login />;
  if (page === 'register')  return <Register />;
  if (page === 'find')      return <FindSlots />;
  if (page === 'book')      return <FindSlots />;
  if (page === 'dashboard') return user ? <Dashboard /> : <Login />;
  return <Home />;
}
