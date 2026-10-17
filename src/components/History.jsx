import React, { useMemo } from 'react';
import { OBJECTIVES } from '../bank/blueprint.js';
import { PASS_SCORE, fmtTime } from '../exam/engine.js';

function Trend({ points }) {
  if (points.length < 2) return <p className="muted">Finish two or more simulation-mode exams to see a trend.</p>;
  const W = 640, H = 200, P = 28;
  const x = i => P + (i * (W - 2 * P)) / (points.length - 1);
  const y = v => H - P - (Math.max(0, v - 300) / 700) * (H - 2 * P);
  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Score trend">
      <line x1={P} x2={W - P} y1={y(PASS_SCORE)} y2={y(PASS_SCORE)} className="trend-pass" />
      <text x={W - P} y={y(PASS_SCORE) - 6} className="trend-label" textAnchor="end">825</text>
      <polyline points={points.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')} className="trend-line" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.score)} r="4" className={p.score >= PASS_SCORE ? 'trend-dot ok' : 'trend-dot bad'}><title>{`${p.title}: ${p.score}`}</title></circle>
        </g>
      ))}
    </svg>
  );
}

export default function History({ bank, attempts, stats, onDelete, startPractice }) {
  const done = attempts.filter(a => a.status === 'done').sort((a, b) => b.finishedAt - a.finishedAt);
  const sims = done.filter(a => a.mode === 'sim').slice().reverse();
  const objRows = useMemo(() => {
    const by = {};
    for (const q of bank.list) {
      const s = stats.q && stats.q[q.id];
      const r = (by[q.obj] ||= { obj: q.obj, total: 0, seen: 0, right: 0, tries: 0, ids: [] });
      r.total++;
      r.ids.push(q.id);
      if (s) { r.seen++; r.tries += s.n; if (s.lastRight) r.right++; }
    }
    return Object.values(by).filter(r => r.seen).map(r => ({ ...r, v: Math.round((r.right / r.seen) * 100) }))
      .sort((a, b) => a.v - b.v || b.seen - a.seen);
  }, [bank, stats]);
  const flagged = (stats.flags || []).filter(id => bank.byId[id]);
  const missedEver = Object.entries(stats.q || {}).filter(([id, s]) => bank.byId[id] && !s.lastRight).map(([id]) => id);

  return (
    <div className="page">
      <h1>History</h1>
      <section className="card">
        <h2>Simulation scores</h2>
        <Trend points={sims} />
      </section>

      <div className="two-col">
        <section className="card">
          <h2>Practice sets</h2>
          <div className="btn-col">
            <button className="btn" disabled={!missedEver.length} onClick={() => startPractice(missedEver, 'Previously missed')}>Missed last time ({missedEver.length})</button>
            <button className="btn ghost" disabled={!flagged.length} onClick={() => startPractice(flagged, 'Flagged questions')}>Flagged ({flagged.length})</button>
          </div>
        </section>
        <section className="card">
          <h2>Weakest objectives</h2>
          {!objRows.length && <p className="muted">No finished attempts yet.</p>}
          <table className="objtable">
            <tbody>
              {objRows.slice(0, 8).map(r => (
                <tr key={r.obj}>
                  <td>{r.obj} {OBJECTIVES[r.obj]}</td>
                  <td className={r.v < 70 ? 'weak' : ''}>{r.v}%</td>
                  <td><button className="btn ghost xs" onClick={() => startPractice(r.ids, `Objective ${r.obj}`)}>Practise</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card">
        <h2>All attempts</h2>
        <div className="table-wrap">
          <table className="attempts">
            <thead><tr><th>Finished</th><th>Exam</th><th>Mode</th><th>Score</th><th>Time</th><th /></tr></thead>
            <tbody>
              {done.map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.finishedAt).toLocaleString()}</td>
                  <td>{a.title}</td>
                  <td>{a.mode === 'study' ? 'Study' : a.strict ? 'Sim (exam rules)' : 'Sim'}</td>
                  <td><span className={`pill ${a.pass ? 'ok' : 'bad'}`}>{a.score}</span></td>
                  <td>{fmtTime(a.elapsed)}</td>
                  <td className="nowrap">
                    <a className="btn ghost xs" href={`#/report/${a.id}`}>Review</a>
                    <button className="btn ghost xs" onClick={() => { if (confirm('Delete this attempt from your history?')) onDelete(a.id); }}>Delete</button>
                  </td>
                </tr>
              ))}
              {!done.length && <tr><td colSpan="6" className="muted">No finished attempts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
