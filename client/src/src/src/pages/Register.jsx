import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', age:'', weight:'', height:'', goalWeight:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  const fields = [
    { name:'name',       placeholder:'Full Name',       type:'text' },
    { name:'email',      placeholder:'Email',           type:'email' },
    { name:'password',   placeholder:'Password',        type:'password' },
    { name:'age',        placeholder:'Age',             type:'number' },
    { name:'weight',     placeholder:'Weight (kg)',     type:'number' },
    { name:'height',     placeholder:'Height (cm)',     type:'number' },
    { name:'goalWeight', placeholder:'Goal Weight (kg)',type:'number' },
  ];

  const styles = {
    container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4ff' },
    card:      { background:'white', padding:'40px', borderRadius:'16px', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', width:'360px' },
    input:     { width:'100%', padding:'12px', marginBottom:'12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
    button:    { width:'100%', padding:'12px', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', fontSize:'16px', cursor:'pointer' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign:'center', marginBottom:'20px' }}>🏋️ Create Account</h2>
        {error && <p style={{ color:'red', textAlign:'center' }}>{error}</p>}
        <form onSubmit={handleRegister}>
          {fields.map(f => (
            <input key={f.name} style={styles.input} name={f.name} type={f.type}
              placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} required />
          ))}
          <button style={styles.button} type="submit">Create Account</button>
        </form>
        <p style={{ textAlign:'center', marginTop:'12px', color:'#666' }}>
          Have an account? <a href="/login" style={{ color:'#6366f1' }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}
