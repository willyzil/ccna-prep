import React, { useEffect, useMemo, useRef, useState } from 'react';
import Question, { groupLog } from './Question.jsx';
import { api } from '../api.js';
import { Lab } from '../sim/lab.js';
import { DOMAINS } from '../bank/blueprint.js';
import { PASS_SCORE, fmtTime, objectiveName, isAnswered } from '../exam/engine.js';

function pct(e, p) {
  return p ? Math.round((e / p) * 100) : 0;
}

export function DomainBars({ byDomain }) {
  return (
    <div className="dbars">
      {DOMAINS.map(d => {
        const r = byDomain[d.id];
        const v = r ? pct(r.earned, r.possible) : null;
        return (
          <div className="dbar" key={d.id}>
            <div className="dbar-head">
              <span>{d.id}.0 {d.name}</span>
              <span className="muted">{r ? `${v}% · ${r.right}/${r.n}` : 'not tested'}</span>
            </div>
            <div className="bar"><div className={`bar-fill${v !== null && v < 70 ? ' weak' : ''}`} style={{ width: `${v || 0}%` }} /><div className="bar-mark" style={{ left: '82.5%' }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewItem({ bank, att, qid, index, flags, onFlag }) {
  const q = bank.byId[qid];
  const r = att.result.perQ[qid];
  const [open, setOpen] = useState(false);
  const labRef = useRef(null);
  const [, setV] = useState(0);
  const a = att.answers[qid];
  const status = !r ? 'skip' : r.correct ? 'ok' : r.frac > 0 ? 'part' : isAnswered(q, a) ? 'bad' : 'skip';
  if (open && (q.type === 'lab' || q.type === 'sim') && !labRef.current) {
    const l = new Lab(q.lab);
    const log = q.type === 'lab' ? (a && a.log) : (att.simLogs && att.simLogs[qid]);
    if (log && log.length) l.replay(log);
    labRef.current = l;
  }
  return (
    <li className={`ritem ${status}${open ? ' open' : ''}`}>
      <button className="ritem-head" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className={`rmark ${status}`}>{status === 'ok' ? '✓' : status === 'part' ? '◐' : status === 'bad' ? '✗' : '–'}</span>
        <span className="rnum">{index + 1}</span>
        <span className="robj">{q.obj}</span>
        <span className="rtext">{q.title || q.q.replace(/[#*`|>_]/g, '').slice(0, 140)}</span>
        {att.marked.includes(qid) && <span className="tag">marked</span>}
        {q.type === 'lab' && <span className="tag lab">{Math.round(r.frac * 100)}%</span>}
      </button>
      {open && (
        <div className="ritem-body">
          <div className="ritem-tools">
            <button className={`btn ghost sm${flags.has(qid) ? ' on' : ''}`} onClick={() => onFlag(qid, !flags.has(qid))}>{flags.has(qid) ? '⚑ Flagged for practice' : '⚐ Flag for practice'}</button>
          </div>
          <Question
            q={q}
            index={index}
            order={att.optOrder[qid]}
            answer={a}
            onAnswer={() => {}}
            disabled
            reveal
            labProps={(q.type === 'lab' || q.type === 'sim') ? {
              lab: labRef.current,
              onCommand: (dev, line) => { labRef.current.input(dev, line); setV(v => v + 1); },
              results: r && r.detail && r.detail.tasks,
              showSolution: q.type === 'lab',
              tools: <span className="muted sm">Changes here are for exploring only; they are not scored.</span>,
            } : null}
          />
          {q.type === 'lab' && a && a.log && a.log.length > 0 && (
            <details className="yourlog">
              <summary>Your commands ({a.log.length})</summary>
              {groupLog(a.log).map(([d, lines], i) => <div key={i}><div className="sol-dev">{d}</div><pre className="cli">{lines.join('\n')}</pre></div>)}
            </details>
          )}
        </div>
      )}
    </li>
  );
}

export default function Report({ id, bank, navigate, startPractice }) {
  const [att, setAtt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [flags, setFlags] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAttempt(id).then(setAtt).catch(e => setError(e.message));
    api.stats().then(s => setFlags(new Set(s.flags || []))).catch(() => {});
  }, [id]);

  const weakObjs = useMemo(() => {
    if (!att || !att.result) return [];
    return Object.entries(att.result.byObj).map(([o, r]) => ({ o, v: pct(r.earned, r.possible), n: r.n, right: r.right }))
      .sort((a, b) => a.v - b.v || b.n - a.n);
  }, [att]);

  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!att) return <div className="page"><div className="loading">Loading…</div></div>;
  if (!att.result) return <div className="page"><p>This attempt has not been finished.</p><a className="btn" href={`#/exam/${att.id}`}>Continue</a></div>;

  const r = att.result;
  const onFlag = (qid, on) => {
    api.setFlag(qid, on);
    setFlags(f => { const n = new Set(f); if (on) n.add(qid); else n.delete(qid); return n; });
  };
  const list = att.qids.map((qid, i) => ({ qid, i })).filter(({ qid }) => {
    const pr = r.perQ[qid];
    if (filter === 'wrong') return !pr || !pr.correct;
    if (filter === 'marked') return att.marked.includes(qid);
    if (filter === 'labs') return bank.byId[qid].type === 'lab' || bank.byId[qid].type === 'sim';
    return true;
  });
  const missed = att.qids.filter(qid => !r.perQ[qid] || !r.perQ[qid].correct);

  return (
    <div className="page report">
      <div className="report-top">
        <div className={`score-card ${r.pass ? 'pass' : 'fail'}`}>
          <div className="score-num">{r.score}</div>
          <div className="score-of">/ 1000</div>
          <div className={`score-verdict ${r.pass ? 'ok' : 'bad'}`}>{r.pass ? 'PASS' : 'FAIL'}</div>
          <div className="score-sub">Passing score {PASS_SCORE}*</div>
        </div>
        <div className="report-meta">
          <h1>{att.title}</h1>
          <p className="muted">{att.mode === 'study' ? 'Study mode' : 'Simulation mode'} · {new Date(att.finishedAt).toLocaleString()}</p>
          <div className="kpis">
            <div><b>{r.correct}</b><span>of {r.total} fully correct</span></div>
            <div><b>{fmtTime(att.elapsed)}</b><span>time used{att.timed ? ` of ${fmtTime(att.limitSec)}` : ''}</span></div>
            <div><b>{Math.round((r.earned / r.possible) * 100)}%</b><span>points earned</span></div>
          </div>
          <div className="btn-row">
            {missed.length > 0 && <button className="btn" onClick={() => startPractice(missed, `Missed from ${att.title}`)}>Practise the {missed.length} missed</button>}
            <a className="btn ghost" href="#/">Home</a>
          </div>
        </div>
      </div>
      <p className="footnote">* Cisco does not publish the CCNA cut score; 825/1000 is the commonly used estimate. Labs carry more weight and earn partial credit per task.</p>

      <section className="card">
        <h2>Score by domain</h2>
        <DomainBars byDomain={r.byDomain} />
      </section>

      <section className="card">
        <h2>Weakest objectives</h2>
        <table className="objtable">
          <thead><tr><th>Objective</th><th>Score</th><th>Questions</th></tr></thead>
          <tbody>
            {weakObjs.slice(0, 8).map(w => (
              <tr key={w.o}><td>{w.o} {objectiveName(w.o)}</td><td className={w.v < 70 ? 'weak' : ''}>{w.v}%</td><td>{w.right}/{w.n}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <div className="review-head">
          <h2>Review</h2>
          <div className="seg" role="tablist">
            {[['all', 'All'], ['wrong', 'Incorrect'], ['marked', 'Marked'], ['labs', 'Labs & sims']].map(([k, t]) => (
              <button key={k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)} role="tab" aria-selected={filter === k}>{t}</button>
            ))}
          </div>
        </div>
        <ul className="rlist">
          {list.map(({ qid, i }) => <ReviewItem key={qid} bank={bank} att={att} qid={qid} index={i} flags={flags} onFlag={onFlag} />)}
          {!list.length && <li className="muted">Nothing here.</li>}
        </ul>
      </section>
    </div>
  );
}
