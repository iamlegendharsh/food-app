import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏋️ FitTracker</h2>
        <h3 style={styles.subtitle}>Sign In</h3>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input style={styles.input} type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)}    required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit">Login</button>
        </form>
        <p style={{ textAlign:'center', marginTop:'12px', color:'#666' }}>
          No account? <a href="/register" style={{ color:'#6366f1' }}>Register</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4ff' },
  card:      { background:'white', padding:'40px', borderRadius:'16px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', width:'360px' },
  title:     { textAlign:'center', fontSize:'28px', marginBottom:'4px' },
  subtitle:  { textAlign:'center', color:'#888', marginBottom:'24px', fontWeight:'normal' },
  input:     { width:'100%', padding:'12px', marginBottom:'14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  button:    { width:'100%', padding:'12px', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  error:     { color:'red', textAlign:'center', marginBottom:'12px', fontSize:'13px' }
};
