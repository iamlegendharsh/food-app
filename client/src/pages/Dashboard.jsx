import { useState, useEffect, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import API from '../api';
import FoodScanner from '../components/FoodScanner';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [logs, setLogs]         = useState([]);
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);
  const [advice, setAdvice]     = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diary'); // diary | scanner | ai
  const [mealFilter, setMealFilter] = useState('all');

  const today       = new Date().toISOString().split('T')[0];
  const calorieGoal = 2000;

  // ── Redirect if not logged in ──
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      window.location.href = '/login';
    }
  }, []);

  // ── Fetch logs ──
  const fetchLogs = useCallback(async () => {
    try {
      const res = await API.get(`/log/food/${today}`);
      setLogs(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [today]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Search food ──
  const searchFood = async () => {
    if (!search.trim()) return;
    try {
      const res = await API.get(`/food/search?query=${search}`);
      setResults(res.data);
    } catch (err) { console.log(err); }
  };

  // ── Add food manually ──
  const addFood = async (food, mealType = 'lunch') => {
    try {
      await API.post('/log/food', {
        date: today, mealType,
        foodName: food.name || food.foodName,
        calories: food.calories,
        protein:  food.protein,
        carbs:    food.carbs,
        fats:     food.fats,
        quantity: 1,
        unit:     food.unit || 'serving'
      });
      fetchLogs();
      setResults([]);
      setSearch('');
    } catch (err) { console.log(err); }
  };

  // ── Add food from scanner ──
  const addScannedFood = async (food) => {
    try {
      await API.post('/log/food', {
        date:     today,
        mealType: 'lunch',
        foodName: food.foodName,
        calories: food.calories,
        protein:  food.protein,
        carbs:    food.carbs,
        fats:     food.fats,
        quantity: 1,
        unit:     'serving'
      });
      fetchLogs();
      setActiveTab('diary');
    } catch (err) { console.log(err); }
  };

  // ── Delete log ──
  const deleteLog = async (id) => {
    try {
      await API.delete(`/log/food/${id}`);
      fetchLogs();
    } catch (err) { console.log(err); }
  };

  // ── Get AI advice ──
  const getAIAdvice = async () => {
    setAiLoading(true);
    try {
      const t   = getTotals();
      const res = await API.post('/ai/advice', { ...t, goal: 'lose weight', calorieGoal });
      setAdvice(res.data.advice);
    } catch (err) { console.log(err); }
    setAiLoading(false);
  };

  // ── Totals ──
  const getTotals = () => logs.reduce((acc, log) => ({
    totalCalories: acc.totalCalories + (log.calories || 0),
    protein:       acc.protein       + (log.protein  || 0),
    carbs:         acc.carbs         + (log.carbs    || 0),
    fats:          acc.fats          + (log.fats     || 0),
  }), { totalCalories: 0, protein: 0, carbs: 0, fats: 0 });

  const totals    = getTotals();
  const remaining = Math.max(calorieGoal - totals.totalCalories, 0);
  const progress  = Math.min((totals.totalCalories / calorieGoal) * 100, 100);

  const donutData = {
    labels: ['Consumed', 'Remaining'],
    datasets: [{
      data:            [totals.totalCalories, remaining],
      backgroundColor: [
        totals.totalCalories > calorieGoal ? '#ef4444' : '#6366f1',
        '#e0e7ff'
      ],
      borderWidth: 0
    }]
  };

  // ── Filter logs by meal ──
  const filteredLogs = mealFilter === 'all'
    ? logs
    : logs.filter(l => l.mealType === mealFilter);

  // ── Meal totals breakdown ──
  const mealTotals = ['breakfast','lunch','dinner','snack'].map(meal => ({
    meal,
    calories: logs.filter(l => l.mealType === meal).reduce((a, l) => a + (l.calories || 0), 0),
    count:    logs.filter(l => l.mealType === meal).length
  }));

  const mealEmoji = { breakfast:'🌅', lunch:'☀️', dinner:'🌙', snack:'🍎' };

  // ── Styles ──
  const s = {
    page:     { padding:'16px', maxWidth:'720px', margin:'0 auto', fontFamily:'sans-serif', background:'#f0f4ff', minHeight:'100vh' },
    card:     { background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', marginBottom:'16px' },
    input:    { flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'14px', outline:'none' },
    btn:      { padding:'10px 18px', background:'#6366f1', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'500' },
    btnSm:    { padding:'5px 12px', background:'#6366f1', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
    btnGreen: { padding:'5px 12px', background:'#22c55e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
    btnRed:   { padding:'5px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
    tag:      { fontSize:'11px', background:'#e0e7ff', color:'#6366f1', padding:'2px 8px', borderRadius:'999px', fontWeight:'500' },
    tab:      (active) => ({
      padding:'8px 16px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'500',
      borderRadius:'8px', transition:'all 0.2s',
      background: active ? '#6366f1' : 'transparent',
      color:      active ? 'white'   : '#666',
    }),
    mealBtn:  (active) => ({
      padding:'5px 12px', border:'none', cursor:'pointer', fontSize:'12px', borderRadius:'999px',
      background: active ? '#6366f1' : '#f0f0f0',
      color:      active ? 'white'   : '#666',
      fontWeight: active ? '600'     : '400',
    }),
  };

  return (
    <div style={s.page}>

      {/* ── HEADER ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div>
          <h1 style={{ margin:0, fontSize:'22px' }}>🏋️ FitTracker</h1>
          <p style={{ margin:0, fontSize:'12px', color:'#888' }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
          </p>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }}
          style={{ ...s.btn, background:'#ef4444', padding:'8px 14px', fontSize:'13px' }}>
          Logout
        </button>
      </div>

      {/* ── CALORIE RING CARD ── */}
      <div style={{ ...s.card, display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
        <div style={{ width:140, flexShrink:0 }}>
          <Doughnut data={donutData} options={{
            cutout:'72%',
            plugins:{ legend:{ display:false }, tooltip:{ enabled:true } }
          }} />
        </div>
        <div style={{ flex:1, minWidth:'180px' }}>
          <div style={{ marginBottom:'12px' }}>
            <p style={{ margin:0, fontSize:'13px', color:'#888' }}>Calories Today</p>
            <h2 style={{ margin:'2px 0', fontSize:'28px', color: totals.totalCalories > calorieGoal ? '#ef4444' : '#1f2937' }}>
              {totals.totalCalories}
              <span style={{ fontSize:'14px', color:'#aaa', fontWeight:'normal' }}> / {calorieGoal}</span>
            </h2>
            {/* Progress bar */}
            <div style={{ background:'#e0e7ff', borderRadius:'999px', height:'6px', marginTop:'6px' }}>
              <div style={{
                background: progress >= 100 ? '#ef4444' : '#6366f1',
                width:`${progress}%`, height:'6px',
                borderRadius:'999px', transition:'width 0.4s ease'
              }} />
            </div>
            <p style={{ margin:'4px 0 0', fontSize:'12px', color: remaining === 0 ? '#ef4444' : '#22c55e', fontWeight:'600' }}>
              {remaining === 0 ? '⚠️ Goal reached!' : `${remaining} kcal remaining`}
            </p>
          </div>
          {/* Macros row */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {[
              { label:'Protein', value:totals.protein, color:'#f59e0b', emoji:'🥩' },
              { label:'Carbs',   value:totals.carbs,   color:'#3b82f6', emoji:'🌾' },
              { label:'Fats',    value:totals.fats,    color:'#10b981', emoji:'🧈' },
            ].map(m => (
              <div key={m.label} style={{ background:'#f9fafb', borderRadius:'8px', padding:'6px 10px', textAlign:'center', minWidth:'64px' }}>
                <p style={{ margin:0, fontSize:'11px', color:'#888' }}>{m.emoji} {m.label}</p>
                <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:m.color }}>{m.value.toFixed(0)}g</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MEAL BREAKDOWN ── */}
      <div style={{ ...s.card, padding:'14px 20px' }}>
        <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:'600', color:'#555' }}>Meal Breakdown</p>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {mealTotals.map(m => (
            <div key={m.meal} style={{ flex:1, minWidth:'70px', background:'#f9fafb', borderRadius:'10px', padding:'10px', textAlign:'center' }}>
              <p style={{ margin:0, fontSize:'18px' }}>{mealEmoji[m.meal]}</p>
              <p style={{ margin:'2px 0 0', fontSize:'11px', color:'#888', textTransform:'capitalize' }}>{m.meal}</p>
              <p style={{ margin:'2px 0 0', fontSize:'13px', fontWeight:'700', color:'#6366f1' }}>
                {m.calories > 0 ? `${m.calories} kcal` : '—'}
              </p>
              {m.count > 0 && <p style={{ margin:0, fontSize:'10px', color:'#aaa' }}>{m.count} item{m.count>1?'s':''}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ ...s.card, padding:'8px', display:'flex', gap:'4px', marginBottom:'16px' }}>
        {[
          { key:'diary',   label:'📋 Food Diary' },
          { key:'scanner', label:'📷 Scanner' },
          { key:'ai',      label:'🤖 AI Advice' },
        ].map(t => (
          <button key={t.key} style={{ ...s.tab(activeTab === t.key), flex:1 }}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════ */}
      {/* TAB 1 — FOOD DIARY                */}
      {/* ══════════════════════════════════ */}
      {activeTab === 'diary' && (
        <>
          {/* Search */}
          <div style={s.card}>
            <h3 style={{ marginTop:0, fontSize:'15px' }}>🔍 Search & Add Food</h3>
            <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
              <input style={s.input} value={search}
                placeholder="e.g. chicken breast, rice, banana..."
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchFood()} />
              <button style={s.btn} onClick={searchFood}>Search</button>
            </div>

            {results.length > 0 && (
              <div>
                <p style={{ fontSize:'12px', color:'#888', margin:'0 0 8px' }}>
                  {results.length} results — click meal type to add:
                </p>
                {results.map(food => (
                  <div key={food.fdcId} style={{
                    padding:'10px 12px', border:'1px solid #f0f0f0',
                    borderRadius:'10px', marginBottom:'8px'
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px' }}>
                      <div style={{ flex:1 }}>
                        <b style={{ fontSize:'13px' }}>{food.name}</b>
                        {food.brand !== 'Generic' && (
                          <span style={{ ...s.tag, marginLeft:'6px' }}>{food.brand}</span>
                        )}
                        <p style={{ margin:'3px 0 6px', fontSize:'11px', color:'#888' }}>
                          {food.calories} kcal &nbsp;·&nbsp; P:{food.protein}g &nbsp;·&nbsp; C:{food.carbs}g &nbsp;·&nbsp; F:{food.fats}g &nbsp; /100g
                        </p>
                        {/* Meal type buttons */}
                        <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                          {['breakfast','lunch','dinner','snack'].map(meal => (
                            <button key={meal} style={s.btnGreen}
                              onClick={() => addFood(food, meal)}>
                              {mealEmoji[meal]} {meal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setResults([])}
                  style={{ ...s.btn, background:'#9ca3af', fontSize:'12px', padding:'6px 12px' }}>
                  Clear Results
                </button>
              </div>
            )}
          </div>

          {/* Log */}
          <div style={s.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px', flexWrap:'wrap', gap:'8px' }}>
              <h3 style={{ margin:0, fontSize:'15px' }}>📋 Today's Log</h3>
              {/* Meal filter */}
              <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                {['all','breakfast','lunch','dinner','snack'].map(m => (
                  <button key={m} style={s.mealBtn(mealFilter === m)}
                    onClick={() => setMealFilter(m)}>
                    {m === 'all' ? 'All' : `${mealEmoji[m]} ${m}`}
                  </button>
                ))}
              </div>
            </div>

            {filteredLogs.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'#bbb' }}>
                <p style={{ fontSize:'32px', margin:0 }}>🍽️</p>
                <p style={{ margin:'8px 0 0', fontSize:'14px' }}>
                  {mealFilter === 'all' ? 'No food logged yet. Search above or use the scanner!' : `No ${mealFilter} logged yet.`}
                </p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div key={log._id} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'10px 12px', background:'#f9fafb',
                  borderRadius:'10px', marginBottom:'8px', gap:'8px'
                }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                      <b style={{ fontSize:'13px' }}>{log.foodName}</b>
                      <span style={s.tag}>{mealEmoji[log.mealType]} {log.mealType}</span>
                    </div>
                    <p style={{ margin:'3px 0 0', fontSize:'11px', color:'#888' }}>
                      🔥 {log.calories} kcal &nbsp;·&nbsp; P:{(log.protein||0).toFixed(0)}g &nbsp;·&nbsp; C:{(log.carbs||0).toFixed(0)}g &nbsp;·&nbsp; F:{(log.fats||0).toFixed(0)}g
                    </p>
                  </div>
                  <button style={s.btnRed} onClick={() => deleteLog(log._id)}>✕</button>
                </div>
              ))
            )}

            {logs.length > 0 && (
              <div style={{ marginTop:'12px', padding:'10px', background:'#f0f4ff', borderRadius:'10px', display:'flex', justifyContent:'space-between', fontSize:'13px' }}>
                <span style={{ color:'#555' }}>Total today:</span>
                <b style={{ color:'#6366f1' }}>
                  {totals.totalCalories} kcal &nbsp;·&nbsp;
                  P:{totals.protein.toFixed(0)}g &nbsp;·&nbsp;
                  C:{totals.carbs.toFixed(0)}g &nbsp;·&nbsp;
                  F:{totals.fats.toFixed(0)}g
                </b>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════════════════════ */}
      {/* TAB 2 — FOOD SCANNER              */}
      {/* ══════════════════════════════════ */}
      {activeTab === 'scanner' && (
        <FoodScanner onFoodDetected={addScannedFood} />
      )}

      {/* ══════════════════════════════════ */}
      {/* TAB 3 — AI ADVICE                 */}
      {/* ══════════════════════════════════ */}
      {activeTab === 'ai' && (
        <div style={s.card}>
          <h3 style={{ marginTop:0, fontSize:'15px' }}>🤖 AI Nutrition Advisor</h3>

          {/* Today's summary for AI */}
          <div style={{ background:'#f9fafb', borderRadius:'10px', padding:'12px', marginBottom:'14px' }}>
            <p style={{ margin:'0 0 6px', fontSize:'13px', fontWeight:'600', color:'#555' }}>Today's Summary</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {[
                { label:'Calories', value:`${totals.totalCalories}/${calorieGoal}`, color:'#6366f1' },
                { label:'Protein',  value:`${totals.protein.toFixed(0)}g`,          color:'#f59e0b' },
                { label:'Carbs',    value:`${totals.carbs.toFixed(0)}g`,            color:'#3b82f6' },
                { label:'Fats',     value:`${totals.fats.toFixed(0)}g`,             color:'#10b981' },
              ].map(item => (
                <div key={item.label} style={{ background:'white', borderRadius:'8px', padding:'8px 12px', border:'1px solid #e5e7eb' }}>
                  <p style={{ margin:0, fontSize:'11px', color:'#888' }}>{item.label}</p>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:'700', color:item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            style={{
              ...s.btn, width:'100%', padding:'14px', fontSize:'15px',
              opacity: aiLoading ? 0.7 : 1,
              background:'linear-gradient(135deg, #6366f1, #8b5cf6)'
            }}
            onClick={getAIAdvice}
            disabled={aiLoading}>
            {aiLoading ? '⏳ Analysing your nutrition...' : '✨ Get Personalised AI Tips'}
          </button>

          {advice && (
            <div style={{
              marginTop:'14px', padding:'16px',
              background:'linear-gradient(135deg, #f0f4ff, #faf0ff)',
              borderRadius:'12px', border:'1px solid #e0e7ff',
              whiteSpace:'pre-wrap', fontSize:'14px',
              lineHeight:'1.8', color:'#374151'
            }}>
              <p style={{ margin:'0 0 8px', fontWeight:'700', color:'#6366f1', fontSize:'13px' }}>
                🤖 AI Recommendations
              </p>
              {advice}
            </div>
          )}

          {!advice && !aiLoading && (
            <p style={{ textAlign:'center', color:'#bbb', fontSize:'13px', marginTop:'16px' }}>
              Click the button above to get personalised tips based on today's nutrition
            </p>
          )}
        </div>
      )}

    </div>
  );
}
