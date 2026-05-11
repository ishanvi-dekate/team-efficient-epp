import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Card from "../Components/Card";
import SearchBar from "../Components/SearchBar";
import HomeChat from "../Components/HomeChat";
import "./Home.css";

const GRAPH_COLOR = '#1E3A8A';

function parseSleepHours(sleepTime, wakeTime) {
  if (!sleepTime || !wakeTime) return null;
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let diff = (wh * 60 + wm) - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  const h = diff / 60;
  return (h < 1 || h > 16) ? null : Math.round(h * 10) / 10;
}

function Sparkline({ data, minY = 0, maxY }) {
  const W = 180, H = 52, P = 5;
  if (!data || data.length < 2) {
    return <p className="hg-empty">Complete a Mental Check to see your trend</p>;
  }
  const hi = maxY ?? Math.max(...data);
  const lo = minY;
  const rng = (hi - lo) || 1;
  const px = i => P + (i / (data.length - 1)) * (W - P * 2);
  const py = v => H - P - ((v - lo) / rng) * (H - P * 2);
  const pts = data.map((v, i) => [px(i), py(v)]);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const area = `${line} L${last[0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H}Z`;
  return (
    <svg className="hg-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path d={area} fill={GRAPH_COLOR} opacity="0.15" />
      <path d={line} fill="none" stroke={GRAPH_COLOR} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.5" fill={GRAPH_COLOR} />)}
    </svg>
  );
}

function BarChart({ data, maxY }) {
  const W = 180, H = 52, P = 5;
  if (!data || data.length === 0) {
    return <p className="hg-empty">Complete a Mental Check to see your sleep data</p>;
  }
  const hi = maxY ?? Math.max(...data, 1);
  const n = data.length;
  const slot = (W - P * 2) / n;
  const bw = slot * 0.6;
  return (
    <svg className="hg-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = Math.max(3, (v / hi) * (H - P * 2));
        return (
          <rect
            key={i}
            x={P + i * slot + (slot - bw) / 2}
            y={H - P - bh}
            width={bw}
            height={bh}
            rx="2"
            fill={GRAPH_COLOR}
            opacity="0.8"
          />
        );
      })}
    </svg>
  );
}

function DonutProgress({ done, total }) {
  const R = 26, CX = 36, CY = 36, SW = 7;
  const circ = 2 * Math.PI * R;
  const pct = total > 0 ? done / total : 0;
  const dash = (pct * circ).toFixed(2);
  return (
    <div className="hg-donut-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={GRAPH_COLOR} strokeWidth={SW} opacity="0.2" />
        <circle
          cx={CX} cy={CY} r={R} fill="none" stroke={GRAPH_COLOR} strokeWidth={SW}
          strokeDasharray={`${dash} ${circ.toFixed(2)}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
        />
        <text x={CX} y={CY} textAnchor="middle" dy="0.35em" fontSize="12" fontWeight="700" fill="#1F2937">
          {total > 0 ? `${Math.round(pct * 100)}%` : '—'}
        </text>
      </svg>
      <div className="hg-donut-text">
        <span className="hg-donut-count">{done}/{total}</span>
        <span className="hg-donut-label">done this week</span>
      </div>
    </div>
  );
}

function Home({ setPage, user }) {
  const [mentalData, setMentalData] = useState([]);
  const [todosData, setTodosData] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!user) return;

    getDocs(
      query(collection(db, 'users', user.uid, 'mentalChecks'), orderBy('submittedAt', 'desc'), limit(7))
    ).then(snap => setMentalData(snap.docs.map(d => d.data()).reverse()))
      .catch(() => {});

    const now = new Date();
    const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay());
    const we = new Date(now); we.setDate(now.getDate() + (6 - now.getDay()));

    getDocs(collection(db, 'users', user.uid, 'todos'))
      .then(snap => {
        const todos = snap.docs.map(d => d.data()).filter(t => t.date >= fmt(ws) && t.date <= fmt(we));
        setTodosData({ done: todos.filter(t => t.done).length, total: todos.length });
      })
      .catch(() => {});
  }, [user]);

  const stressData = mentalData.map(c => parseFloat(c.stressLevel)).filter(v => !isNaN(v) && v > 0);
  const sleepData = mentalData.map(c => parseSleepHours(c.sleepTime, c.wakeTime)).filter(Boolean);
  const avgStress = stressData.length
    ? (stressData.reduce((a, b) => a + b, 0) / stressData.length).toFixed(1)
    : null;
  const avgSleep = sleepData.length
    ? (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1)
    : null;

  return (
    <main className="home-page">
      <div className="home-banner">
        <div className="home-banner-bg" />
        <h2 className="home-title">Welcome Back, {user?.displayName || user?.email || ""}</h2>
        <SearchBar user={user} setPage={setPage} />
      </div>

      <section className="home-cards">
        <Card title="Stress" className="home-card">
          <div className="hg-stat">
            {avgStress
              ? <><span className="hg-num">{avgStress}</span><span className="hg-unit">/ 5 avg</span></>
              : <span className="hg-unit">Track your stress levels over time</span>
            }
          </div>
          <Sparkline data={stressData} minY={1} maxY={5} />
        </Card>

        <Card title="Time Management + Homework" className="home-card">
          <div className="hg-stat">
            <span className="hg-unit">This week's task completion</span>
          </div>
          <DonutProgress done={todosData.done} total={todosData.total} />
        </Card>

        <Card title="Sleep" className="home-card">
          <div className="hg-stat">
            {avgSleep
              ? <><span className="hg-num">{avgSleep}</span><span className="hg-unit">hrs avg</span></>
              : <span className="hg-unit">Monitor your sleep patterns</span>
            }
          </div>
          <BarChart data={sleepData} maxY={12} />
        </Card>
      </section>

      <HomeChat user={user} setPage={setPage} />

      <section className="home-icons">
        {/* To-Do: Checklist icon */}
        <button className="icon-btn icon-btn-purple" onClick={() => setPage('Todo')}>
          <div className="icon-circle">
            <svg className="icon-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="14" y="10" width="36" height="46" rx="3"/>
              <path d="M22 22 l4 4 l8 -8"/>
              <line x1="38" y1="22" x2="44" y2="22"/>
              <path d="M22 36 l4 4 l8 -8"/>
              <line x1="38" y1="36" x2="44" y2="36"/>
              <line x1="22" y1="50" x2="34" y2="50"/>
            </svg>
          </div>
          <span className="icon-label">To-Do</span>
        </button>

        {/* Mental State: Brain icon */}
        <button className="icon-btn icon-btn-blue" onClick={() => setPage('Mental')}>
          <div className="icon-circle">
            <svg className="icon-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16 C16 16 12 20 12 26 C12 30 14 32 14 34 C12 36 12 40 14 42 C13 45 14 48 17 50 C18 52 22 54 26 52 L26 16 C25 14 24 16 22 16 Z"/>
              <path d="M42 16 C48 16 52 20 52 26 C52 30 50 32 50 34 C52 36 52 40 50 42 C51 45 50 48 47 50 C46 52 42 54 38 52 L38 16 C39 14 40 16 42 16 Z"/>
              <line x1="32" y1="20" x2="32" y2="50"/>
            </svg>
          </div>
          <span className="icon-label">Mental State</span>
        </button>

        {/* Profile: Person icon */}
        <button className="icon-btn icon-btn-pink" onClick={() => setPage('Profile')}>
          <div className="icon-circle">
            <svg className="icon-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="32" cy="22" r="10"/>
              <path d="M10 54 C10 40 54 40 54 54"/>
            </svg>
          </div>
          <span className="icon-label">Profile</span>
        </button>

        {/* Settings: Gear icon */}
        <button className="icon-btn icon-btn-orange" onClick={() => setPage('Settings')}>
          <div className="icon-circle">
            <svg className="icon-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="32" cy="32" r="6"/>
              <path d="M32 8 L32 14 M32 50 L32 56 M8 32 L14 32 M50 32 L56 32 M15 15 L19 19 M45 45 L49 49 M15 49 L19 45 M45 19 L49 15"/>
              <circle cx="32" cy="32" r="14"/>
            </svg>
          </div>
          <span className="icon-label">Settings</span>
        </button>
      </section>
    </main>
  );
}

export default Home;
