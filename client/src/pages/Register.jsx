import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', weight: '', height: '',
    goal: 'lose weight'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/api/auth/register', {
        ...form,
        age:    Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} style={card}>
        <div style={logoBox}>✨</div>
        <h1 style={heading}>Create account</h1>
        <p style={sub}>Start your fitness journey — free forever.</p>

        {error && <div style={errorBox}>⚠️ {error}</div>}

        {/* Name */}
        <label style={label}>Full Name</label>
        <input style={input} type="text" name="name"
          placeholder="Your name"
          value={form.name} onChange={handleChange} required />

        {/* Email */}
        <label style={label}>Email</label>
        <input style={input} type="email" name="email"
          placeholder="Your email"
          value={form.email} onChange={handleChange} required />

        {/* Password */}
        <label style={label}>Password</label>
        <input style={input} type="password" name="password"
          placeholder="Create a password"
          value={form.password} onChange={handleChange} required />

        {/* Age + Goal */}
        <div style={grid2}>
          <div>
            <label style={label}>Age</label>
            <input style={input} type="number" name="age"
              placeholder="e.g. 21"
              value={form.age} onChange={handleChange} required />
          </div>
          <div>
            <label style={label}>Goal</label>
            <select name="goal" value={form.goal}
              onChange={handleChange} style={input}>
              <option value="lose weight">🔥 Lose weight</option>
              <option value="maintain">⚖️ Maintain</option>
              <option value="gain muscle">💪 Gain muscle</option>
            </select>
          </div>
        </div>

        {/* Weight + Height */}
        <div style={grid2}>
          <div>
            <label style={label}>Weight (kg)</label>
            <input style={input} type="number" name="weight"
              placeholder="e.g. 70"
              value={form.weight} onChange={handleChange} required />
          </div>
          <div>
            <label style={label}>Height (cm)</label>
            <input style={input} type="number" name="height"
              placeholder="e.g. 175"
              value={form.height} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" style={btn} disabled={loading}>
          {loading ? '⏳ Creating account...' : '🚀 Create Account'}
        </button>

        <p style={footer}>
          Already have an account?{' '}
          <Link to="/login" style={footerLink}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

// ── shared layout ──────────────────────────────────────────────
function AuthLayout({ children }) {
  return (
    <div style={page}>
      <div style={glow('10%', '10%', '#6366f1')} />
      <div style={glow('70%', '75%', '#a855f7')} />
      <div style={glow('80%', '5%',  '#3b82f6')} />
      {children}
    </div>
  );
}

// ── styles ─────────────────────────────────────────────────────
const page = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  background: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, #0f172a 50%, #030712 100%)',
  position: 'relative',
  overflow: 'hidden',
};

const glow = (top, left, color) => ({
  position: 'absolute',
  width: '320px',
  height: '320px',
  borderRadius: '999px',
  background: color,
  opacity: 0.18,
  filter: 'blur(80px)',
  top, left,
  pointerEvents: 'none',
});

const card = {
  width: '100%',
  maxWidth: '440px',
  padding: '36px 28px',
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  color: 'white',
  position: 'relative',
  zIndex: 2,
};

const logoBox = {
  width: '60px',
  height: '60px',
  borderRadius: '18px',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
  fontSize: '28px',
  marginBottom: '18px',
  boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
};

const heading = {
  margin: '0 0 6px',
  fontSize: '26px',
  fontWeight: '800',
  letterSpacing: '-0.5px',
};

const sub = {
  margin: '0 0 26px',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '14px',
  lineHeight: '1.6',
};

const label = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.8)',
  marginBottom: '8px',
};

const input = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.07)',
  color: 'white',
  fontSize: '14px',
  outline: 'none',
  marginBottom: '18px',
  boxSizing: 'border-box',
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const btn = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: 'white',
  fontSize: '15px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '6px',
  boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
};

const errorBox = {
  background: 'rgba(239,68,68,0.14)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#fca5a5',
  padding: '10px 14px',
  borderRadius: '12px',
  fontSize: '13px',
  marginBottom: '18px',
};

const footer = {
  marginTop: '20px',
  textAlign: 'center',
  fontSize: '14px',
  color: 'rgba(255,255,255,0.6)',
};

const footerLink = {
  color: '#c4b5fd',
  fontWeight: '700',
  textDecoration: 'none',
};
