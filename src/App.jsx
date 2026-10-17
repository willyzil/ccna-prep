import React, { useCallback, useEffect, useState } from 'react';
import { bank } from './bank/index.js';
import { api } from './api.js';
import { newAttempt } from './exam/engine.js';
import Home from './components/Home.jsx';
import ExamRunner from './components/ExamRunner.jsx';
import Report from './components/Report.jsx';
import History from './components/History.jsx';
import Custom from './components/Custom.jsx';
import Labs from './components/Labs.jsx';
import Study from './components/Study.jsx';
import StartDialog from './components/StartDialog.jsx';

function parse(hash) {
  const parts = (hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
  return { page: parts[0] || 'home', arg: parts[1] || null };
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ccna-theme') || 'auto'; } catch { return 'auto'; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', theme);
    try { localStorage.setItem('ccna-theme', theme); } catch { /* blocked */ }
  }, [theme]);
  return [theme, setTheme];
}

const NAV = [['home', 'Exams', '#/'], ['custom', 'Custom', '#/custom'], ['labs', 'Labs', '#/labs'], ['history', 'History', '#/history'], ['study', 'Study', '#/study']];

export default function App() {
  const [route, setRoute] = useState(() => parse(window.location.hash));
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({ q: {}, flags: [] });
  const [startCfg, setStartCfg] = useState(null);
  const [storeMode, setStoreMode] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useTheme();

  const navigate = useCallback(h => { window.location.hash = h; }, []);

  const refresh = useCallback(() => {
    api.listAttempts().then(setAttempts).catch(e => setError(e.message));
    api.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    api.mode().then(setStoreMode);
    const on = () => setRoute(parse(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  useEffect(() => { if (route.page !== 'exam') refresh(); }, [route, refresh]);

  const begin = useCallback(async (cfg) => {
    const a = newAttempt(bank, cfg);
    await api.saveAttempt(a);
    setStartCfg(null);
    navigate(`#/exam/${a.id}`);
  }, [navigate]);

  const onStart = useCallback(cfg => {
    if (cfg.direct) begin({ ...cfg, mode: 'study', strict: false, timed: false, shuffleQ: false });
    else setStartCfg(cfg);
  }, [begin]);

  const startPractice = useCallback((qids, title) => setStartCfg({ title, examId: 'practice', qids }), []);

  const onDelete = useCallback(async id => { await api.deleteAttempt(id); refresh(); }, [refresh]);

  const inExam = route.page === 'exam';
  let body;
  switch (route.page) {
    case 'exam': body = <ExamRunner key={route.arg} id={route.arg} bank={bank} navigate={navigate} />; break;
    case 'report': body = <Report key={route.arg} id={route.arg} bank={bank} navigate={navigate} startPractice={startPractice} />; break;
    case 'history': body = <History bank={bank} attempts={attempts} stats={stats} onDelete={onDelete} startPractice={startPractice} />; break;
    case 'custom': body = <Custom bank={bank} stats={stats} onStart={onStart} />; break;
    case 'labs': body = <Labs bank={bank} stats={stats} onStart={onStart} />; break;
    case 'study': body = <Study domainId={route.arg} />; break;
    default: body = <Home bank={bank} attempts={attempts} stats={stats} onStart={onStart} onResume={id => navigate(`#/exam/${id}`)} onDelete={onDelete} />;
  }

  return (
    <div className={`app${inExam ? ' in-exam' : ''}`}>
      {!inExam && (
        <header className="topbar">
          <a className="brand" href="#/"><span className="brand-mark" aria-hidden="true">⌁</span> CCNA Exam Sim</a>
          <nav aria-label="Main">
            {NAV.map(([k, t, h]) => <a key={k} href={h} className={route.page === k || (k === 'home' && route.page === 'report') ? 'on' : ''}>{t}</a>)}
          </nav>
          <button className="icon-btn theme" onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'auto' : 'dark')} title={`Theme: ${theme}`} aria-label={`Theme: ${theme}`}>
            {theme === 'dark' ? '☾' : theme === 'light' ? '☀' : '◐'}
          </button>
        </header>
      )}
      {!inExam && storeMode === 'local' && <div className="banner">Offline mode: progress is saved in this browser only.</div>}
      {error && !inExam && <div className="banner bad">{error}</div>}
      {body}
      {startCfg && <StartDialog cfg={startCfg} onStart={begin} onClose={() => setStartCfg(null)} />}
    </div>
  );
}
