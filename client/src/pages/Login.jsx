import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

// ── Lamp Face Components ──
const SleepingFace = () => (
  <div style={{ display:'flex', gap:'16px', alignItems:'center', justifyContent:'center', marginTop:'28px' }}>
    <div style={{ width:'20px', height:'3px', background:'rgba(0,0,0,0.5)', borderRadius:'2px' }} />
    <div style={{ width:'20px', height:'3px', background:'rgba(0,0,0,0.5)', borderRadius:'2px' }} />
  </div>
);

const HappyFace = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop:'18px', gap:'4px' }}>
    <div style={{ display:'flex', gap:'16px' }}>
      <div style={{ width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderBottom:'10px solid rgba(0,0,0,0.8)' }} />
      <div style={{ width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderBottom:'10px solid rgba(0,0,0,0.8)' }} />
    </div>
    <div style={{ width:'16px', height:'10px', background:'rgba(0,0,0,0.8)', borderRadius:'0 0 10px 10px', marginTop:'2px' }} />
  </div>
);

// ── Lamp Shade (trapezoid via clip-path) ──
const LampShade = ({ isOn }) => (
  <div style={{
    width:'160px', height:'100px',
    background: isOn ? '#81C784' : '#2C2C2C',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
    transition: 'background 0.3s ease',
    display:'flex', alignItems:'center', justifyContent:'center',
  }}>
    {isOn ? <HappyFace /> : <SleepingFace />}
  </div>
);

// ── Light Beam ──
const LightBeam = ({ isOn }) => (
  <div style={{
    width:'320px', height:'220px',
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
    background: 'linear-gradient(to bottom, rgba(129,199,132,0.18), rgba(129,199,132,0))',
    opacity: isOn ? 1 : 0,
    transition: 'opacity 0.3s ease',
    position:'absolute', top:'148px', left:'50%', transform:'translateX(-50%)',
    pointerEvents:'none'
  }} />
);

export default function Login() {
  const [isOn, setIsOn]         = useState(false);
  const [cordY, setCordY]       = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY]     = useState(0);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  // ── Cord drag handlers ──
  const onMouseDown = (e) => { setDragging(true); setStartY(e.clientY); };
  const onTouchStart = (e) => { setDragging(true); setStartY(e.touches[0].clientY); };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      const delta = Math.min(Math.max(e.clientY - startY, 0), 40);
      setCordY(delta);
    };
    const onTouchMove = (e) => {
      if (!dragging) return;
      const delta = Math.min(Math.max(e.touches[0].clientY - startY, 0), 40);
      setCordY(delta);
    };
    const onUp = () => {
      if (dragging) {
        if (cordY > 20) setIsOn(prev => !prev);
        setCordY(0);
        setDragging(false);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, startY, cordY]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  const inputStyle = (focused) => ({
    width: '100%',
    padding: '14px 16px',
    background: '#121212',
    border: `1.5px solid ${focused ? '#81C784' : 'transparent'}`,
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.2s',
  });

  return (
    <div style={{
      minHeight:'100vh', background:'#121212',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'Roboto, sans-serif', padding:'20px'
    }}>
      <div style={{
        display:'flex', flexWrap:'wrap',
        alignItems:'center', justifyContent:'center', gap:'20px'
      }}>

        {/* ── LAMP SECTION ── */}
        <div style={{ width:'320px', height:'400px', position:'relative', display:'flex', justifyContent:'center' }}>

          {/* Light beam */}
          <LightBeam isOn={isOn} />

          {/* Lamp shade */}
          <div style={{ position:'absolute', top:'50px', left:'50%', transform:'translateX(-50%)' }}>
            <LampShade isOn={isOn} />
          </div>

          {/* Stem */}
          <div style={{
            position:'absolute', top:'140px', left:'50%', transform:'translateX(-50%)',
            width:'16px', height:'120px',
            background:'#424242', borderRadius:'8px'
          }} />

          {/* Base */}
          <div style={{
            position:'absolute', top:'252px', left:'50%', transform:'translateX(-50%)',
            width:'100px', height:'16px',
            background:'#424242', borderRadius:'10px 10px 4px 4px'
          }} />

          {/* Pull cord */}
          <div
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onClick={() => { if (cordY === 0) setIsOn(prev => !prev); }}
            style={{
              position:'absolute', top:'140px', left:'calc(50% + 12px)',
              cursor:'pointer', userSelect:'none',
              transform:`translateY(${cordY}px)`,
              transition: cordY === 0 ? 'transform 0.2s ease' : 'none',
              display:'flex', flexDirection:'column', alignItems:'center'
            }}
          >
            {/* String */}
            <div style={{ width:'2px', height:'60px', background:'rgba(255,255,255,0.7)' }} />
            {/* Handle */}
            <div style={{
              width:'8px', height:'12px',
              background:'white', borderRadius:'4px'
            }} />
          </div>

          {/* Hint text */}
          <p style={{
            position:'absolute', bottom:'10px',
            color:'rgba(255,255,255,0.3)', fontSize:'12px', textAlign:'center', width:'100%',
            margin:0
          }}>
            {isOn ? '💡 Lamp is ON' : '← Pull cord to turn on lamp'}
          </p>
        </div>

        {/* ── LOGIN FORM ── */}
        <div style={{
          width:'320px', padding:'32px',
          background:'#1C1C1E',
          borderRadius:'16px',
          border:`1.5px solid rgba(129,199,132,${isOn ? '0.5' : '0.05'})`,
          boxShadow: isOn ? '0 0 30px rgba(129,199,132,0.15)' : 'none',
          opacity: isOn ? 1 : 0.15,
          pointerEvents: isOn ? 'all' : 'none',
          transition: 'opacity 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
        }}>
          <h2 style={{ color:'white', textAlign:'center', margin:'0 0 28px', fontSize:'22px', fontWeight:'bold' }}>
            Welcome Back
          </h2>

          {error && (
            <p style={{ color:'#ef4444', textAlign:'center', fontSize:'13px', marginBottom:'12px' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>Email</label>
            <div style={{ marginTop:'8px', marginBottom:'18px' }}>
              <FocusInput
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                inputStyle={inputStyle}
                required
              />
            </div>

            {/* Password */}
            <label style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px' }}>Password</label>
            <div style={{ marginTop:'8px', marginBottom:'28px' }}>
              <FocusInput
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                inputStyle={inputStyle}
                required
              />
            </div>

            {/* Login Button */}
            <button type="submit" style={{
              width:'100%', padding:'14px',
              background:'#66BB6A', color:'black',
              border:'none', borderRadius:'8px',
              fontSize:'16px', fontWeight:'bold',
              cursor:'pointer', transition:'background 0.2s',
            }}
              onMouseEnter={e => e.target.style.background='#81C784'}
              onMouseLeave={e => e.target.style.background='#66BB6A'}
            >
              Login
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'16px' }}>
            <button onClick={() => {}} style={{
              background:'none', border:'none',
              color:'rgba(255,255,255,0.4)', fontSize:'13px', cursor:'pointer'
            }}>
              Forgot Password?
            </button>
          </div>

          <p style={{ textAlign:'center', marginTop:'12px', color:'rgba(255,255,255,0.3)', fontSize:'13px' }}>
            No account?{' '}
            <a href="/register" style={{ color:'#81C784', textDecoration:'none', fontWeight:'bold' }}>
              Sign Up
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Focus-aware input wrapper ──
function FocusInput({ inputStyle, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={inputStyle(focused)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}
