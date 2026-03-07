import { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import API from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default function Dashboard() {
  const [logs, setLogs]     = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [advice, setAdvice] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const calorieGoal = 2000;

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const res = await API.get(`/log/food/${today}`);
    setLogs(res.data);
  };

  const searchFood = async () => {
    const res = await API.get(`/food/search?query=${search}`);
    setResults(res.data);
  };

  const addFood = async (food, mealType = 'lunch') => {
    await API.post('/log/food', {
      date: today, mealType,
      foodName: food.name,
      calories: food.calories,
      protein:  food.protein,
      carbs:    food.carbs,
      fats:     food.fats,
      quantity: 1, unit: food.unit
    });
    fetchLogs();
    setResults([]);
    setSearch('');
  };

  const deleteLog = async (id) => {
    await API.delete(`/log/food/${id}`);
    fetchLogs();
  };

  const getAIAdvice = async () => {
    const totals = getTotals();
    const res = await API.post('/ai/advice', {
      ...totals, goal: 'lose weight', calorieGoal
    });
    setAdvice(res.data.advice);
  };

  const getTotals = () => logs.reduce((acc, log) => ({
    totalCalories: acc.totalCalories + log.calories,
    protein: acc.protein + log.protein,
    carbs:   acc.carbs   + log.carbs,
    fats:    acc.fats    + log.fats
  }), { totalCalories: 0, protein: 0, carbs: 0, fats: 0 });

  const totals = getTotals();
  const remaining = calorieGoal - totals.totalCalories;

  const donutData = {
    labels: ['Consumed', 'Remaining'],
    datasets: [{ data: [totals.totalCalories, Math.max(remaining, 0)],
      backgroundColor: ['#ef4444', '#22c55e'] }]
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>🏋️ FitTracker</h1>

      {/* Calorie Ring */}
      <div style={{ width: 200, margin: '0 auto' }}>
        <Doughnut data={donutData} />
        <p style={{ textAlign: 'center' }}>{totals.totalCalories} / {calorieGoal} kcal</p>
      </div>

      {/* Macros */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0' }}>
        <div>🥩 Protein: {totals.protein.toFixed(0)}g</div>
        <div>🌾 Carbs: {totals.carbs.toFixed(0)}g</div>
        <div>🧈 Fats: {totals.fats.toFixed(0)}g</div>
      </div>

      {/* Food Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search food (e.g. chicken breast)"
          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <button onClick={searchFood} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Search</button>
      </div>

      {/* Search Results */}
      {results.map(food => (
        <div key={food.fdcId} style={{ display:'flex', justifyContent:'space-between', padding:'8px', border:'1px solid #eee', borderRadius:'6px', marginBottom:'6px' }}>
          <span>{food.name} — {food.calories} kcal/100g</span>
          <button onClick={() => addFood(food)} style={{ background:'#22c55e', color:'white', border:'none', padding:'4px 10px', borderRadius:'4px', cursor:'pointer' }}>+ Add</button>
        </div>
      ))}

      {/* Today's Logs */}
      <h3>Today's Food Log</h3>
      {logs.map(log => (
        <div key={log._id} style={{ display:'flex', justifyContent:'space-between', padding:'8px', background:'#f9fafb', borderRadius:'6px', marginBottom:'6px' }}>
          <span>{log.foodName} ({log.mealType}) — {log.calories} kcal</span>
          <button onClick={() => deleteLog(log._id)} style={{ background:'#ef4444', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer' }}>✕</button>
        </div>
      ))}

      {/* AI Advice */}
      <button onClick={getAIAdvice} style={{ marginTop:'20px', padding:'10px 20px', background:'#8b5cf6', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', width:'100%' }}>
        🤖 Get AI Nutrition Advice
      </button>
      {advice && (
        <div style={{ marginTop:'15px', padding:'15px', background:'#f3f4f6', borderRadius:'8px', whiteSpace:'pre-wrap' }}>
          {advice}
        </div>
      )}
    </div>
  );
}
