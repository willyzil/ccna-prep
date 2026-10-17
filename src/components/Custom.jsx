import React, { useMemo, useState } from 'react';
import { DOMAINS, EXAMS } from '../bank/blueprint.js';
import { rng, shuffled } from '../exam/engine.js';

const TYPES = [
  ['mc', 'Multiple choice', q => q.type === 'single' || q.type === 'multi'],
  ['dnd', 'Drag and drop', q => q.type === 'match' || q.type === 'order'],
  ['sim', 'Simulations', q => q.type === 'sim'],
  ['lab', 'CLI labs', q => q.type === 'lab'],
];

export default function Custom({ bank, stats, onStart }) {
  const [domains, setDomains] = useState(new Set(DOMAINS.map(d => d.id)));
  const [exams, setExams] = useState(new Set(EXAMS.map(e => e.id)));
  const [types, setTypes] = useState(new Set(TYPES.map(t => t[0])));
  const [source, setSource] = useState('all');
  const [count, setCount] = useState(25);

  const pool = useMemo(() => {
    const q = stats.q || {};
    const flags = new Set(stats.flags || []);
    return bank.list.filter(x => domains.has(x.domain) && (!x.exam || exams.has(x.exam)) &&
      TYPES.some(([k, , f]) => types.has(k) && f(x)) &&
      (source === 'all' || (source === 'unseen' && !q[x.id]) || (source === 'missed' && q[x.id] && !q[x.id].lastRight) || (source === 'flagged' && flags.has(x.id))));
  }, [bank, stats, domains, exams, types, source]);

  const toggle = (set, setter, v) => { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); setter(n); };
  const n = Math.min(count, pool.length);

  const start = () => {
    // Weight the draw by domain so a mixed custom exam mirrors the blueprint.
    const rand = rng(Date.now() % 2147483647);
    const byD = {};
    for (const q of shuffled(pool, rand)) (byD[q.domain] ||= []).push(q.id);
    const picked = [];
    const ds = DOMAINS.filter(d => byD[d.id]);
    const wsum = ds.reduce((s, d) => s + d.weight, 0);
    for (const d of ds) picked.push(...byD[d.id].splice(0, Math.round((n * d.weight) / wsum)));
    const rest = shuffled(Object.values(byD).flat(), rand);
    while (picked.length < n && rest.length) picked.push(rest.shift());
    onStart({ title: `Custom exam (${picked.slice(0, n).length})`, examId: 'custom', qids: picked.slice(0, n) });
  };

  return (
    <div className="page">
      <h1>Custom exam</h1>
      <div className="card form-card">
        <fieldset>
          <legend>Domains</legend>
          {DOMAINS.map(d => (
            <label className="check" key={d.id}><input type="checkbox" checked={domains.has(d.id)} onChange={() => toggle(domains, setDomains, d.id)} /> {d.id}.0 {d.name}</label>
          ))}
        </fieldset>
        <fieldset>
          <legend>From exams</legend>
          {EXAMS.map(e => (
            <label className="check" key={e.id}><input type="checkbox" checked={exams.has(e.id)} onChange={() => toggle(exams, setExams, e.id)} /> {e.title}</label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Question types</legend>
          {TYPES.map(([k, t]) => (
            <label className="check" key={k}><input type="checkbox" checked={types.has(k)} onChange={() => toggle(types, setTypes, k)} /> {t}</label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Source</legend>
          {[['all', 'All questions'], ['unseen', 'Never seen'], ['missed', 'Wrong last time'], ['flagged', 'Flagged']].map(([k, t]) => (
            <label className="check" key={k}><input type="radio" name="src" checked={source === k} onChange={() => setSource(k)} /> {t}</label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Number of questions</legend>
          <div className="seg">
            {[10, 25, 50, 100].map(c => <button key={c} className={count === c ? 'on' : ''} onClick={() => setCount(c)}>{c}</button>)}
          </div>
        </fieldset>
        <div className="form-foot">
          <span className="muted">{pool.length} matching · exam will have {n}</span>
          <button className="btn" disabled={!n} onClick={start}>Choose mode and start</button>
        </div>
      </div>
    </div>
  );
}
