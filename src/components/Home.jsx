import React, { useMemo } from 'react';
import { EXAMS, DOMAINS } from '../bank/blueprint.js';
import { fmtTime, PASS_SCORE } from '../exam/engine.js';

export function readiness(bank, stats) {
  const out = {};
  for (const d of DOMAINS) out[d.id] = { total: 0, seen: 0, right: 0 };
  for (const q of bank.list) {
    const r = out[q.domain];
    r.total++;
    const s = stats[q.id];
    if (s) { r.seen++; if (s.lastRight) r.right++; }
  }
  return out;
}

function ExamCard({ exam, bank, attempts, onStart }) {
  const qids = bank.exams[exam.id];
  const qs = qids.map(id => bank.byId[id]);
  const mine = attempts.filter(a => a.examId === exam.id && a.status === 'done');
  const best = mine.reduce((m, a) => Math.max(m, a.score || 0), -1);
  const last = mine.sort((a, b) => b.finishedAt - a.finishedAt)[0];
  return (
    <div className="exam-card">
      <div className="exam-card-head">
        <h3>{exam.title}</h3>
        {best >= 0 && <span className={`pill ${best >= PASS_SCORE ? 'ok' : 'bad'}`}>Best {best}</span>}
      </div>
      <p className="muted">
        {qs.length} items · {qs.filter(q => q.type === 'lab').length} labs · {qs.filter(q => q.type === 'sim').length} sims · {qs.filter(q => q.type === 'match' || q.type === 'order').length} drag-and-drop
      </p>
      <p className="sm muted">{mine.length ? `${mine.length} attempt${mine.length > 1 ? 's' : ''} · last ${last.score} on ${new Date(last.finishedAt).toLocaleDateString()}` : 'Not attempted yet'}</p>
      <div className="btn-row">
        <button className="btn" onClick={() => onStart({ title: exam.title, examId: exam.id, qids, fixedMode: 'sim' })} disabled={!qids.length}>Simulation</button>
        <button className="btn ghost" onClick={() => onStart({ title: `${exam.title} (study)`, examId: exam.id, qids, fixedMode: 'study' })} disabled={!qids.length}>Study</button>
      </div>
    </div>
  );
}

export default function Home({ bank, attempts, stats, onStart, onResume, onDelete }) {
  const active = attempts.filter(a => a.status === 'active');
  const done = attempts.filter(a => a.status === 'done' && a.mode === 'sim');
  const rd = useMemo(() => readiness(bank, stats.q || {}), [bank, stats]);
  const recent = done.slice().sort((a, b) => b.finishedAt - a.finishedAt).slice(0, 3);
  const avg = recent.length ? Math.round(recent.reduce((s, a) => s + a.score, 0) / recent.length) : null;
  const seen = Object.keys(stats.q || {}).filter(id => bank.byId[id]).length;
  return (
    <div className="page home">
      <section className="hero">
        <div>
          <h1>CCNA 200-301 exam simulator</h1>
          <p className="muted">Full-length practice exams in the style of the real test: multiple choice, drag and drop, show-command simulations and graded CLI labs, each with a full explanation.</p>
        </div>
        <div className="hero-stats">
          <div><b>{avg ?? '—'}</b><span>avg of last {recent.length || 3} sims</span></div>
          <div><b>{bank.list.length}</b><span>items in bank</span></div>
          <div><b>{Math.round((seen / bank.list.length) * 100)}%</b><span>of bank seen</span></div>
        </div>
      </section>

      {active.length > 0 && (
        <section className="card">
          <h2>In progress</h2>
          <ul className="resume-list">
            {active.map(a => (
              <li key={a.id}>
                <div>
                  <b>{a.title}</b>
                  <span className="muted sm"> · {a.mode === 'study' ? 'study' : 'simulation'} · question {a.cursor + 1} of {a.nQ} · {fmtTime(a.elapsed)} used</span>
                </div>
                <div className="btn-row">
                  <button className="btn sm" onClick={() => onResume(a.id)}>Resume</button>
                  <button className="btn ghost sm" onClick={() => { if (confirm('Discard this attempt?')) onDelete(a.id); }}>Discard</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="section-title">Practice exams</h2>
        <div className="exam-grid">
          {EXAMS.map(e => <ExamCard key={e.id} exam={e} bank={bank} attempts={attempts} onStart={onStart} />)}
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <h2>Readiness by domain</h2>
          <p className="muted sm">Share of each domain's questions you got right the last time you saw them.</p>
          <div className="dbars">
            {DOMAINS.map(d => {
              const r = rd[d.id];
              const v = r.seen ? Math.round((r.right / r.total) * 100) : 0;
              return (
                <div className="dbar" key={d.id}>
                  <div className="dbar-head"><span>{d.id}.0 {d.name} <span className="muted sm">({d.weight}%)</span></span><span className="muted">{r.right}/{r.total}</span></div>
                  <div className="bar"><div className={`bar-fill${v < 70 ? ' weak' : ''}`} style={{ width: `${v}%` }} /><div className="bar-mark" style={{ left: '82.5%' }} /></div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card">
          <h2>More ways to practise</h2>
          <ul className="links">
            <li><a href="#/custom"><b>Custom exam</b><span>Pick domains, question types and source (unseen, missed, flagged).</span></a></li>
            <li><a href="#/labs"><b>Labs</b><span>Every CLI lab and simulation, one at a time in study mode.</span></a></li>
            <li><a href="#/history"><b>History</b><span>Past attempts, score trend and your weakest objectives.</span></a></li>
            <li><a href="#/study"><b>Study notes</b><span>Topic notes for all six exam domains.</span></a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
