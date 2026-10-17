import React from 'react';
import { DOMAINS } from '../bank/blueprint.js';
import { objectiveName } from '../exam/engine.js';

export default function Labs({ bank, stats, onStart }) {
  const items = bank.list.filter(q => q.type === 'lab' || q.type === 'sim');
  return (
    <div className="page">
      <h1>Labs and simulations</h1>
      <p className="muted">Each opens in study mode: you can check your work, see the reference solution and read the explanation.</p>
      <div className="btn-row">
        <button className="btn" onClick={() => onStart({ title: 'All CLI labs', examId: 'labs', qids: items.filter(q => q.type === 'lab').map(q => q.id), fixedMode: 'study' })}>Run all labs in a row</button>
      </div>
      {DOMAINS.map(d => {
        const list = items.filter(q => q.domain === d.id);
        if (!list.length) return null;
        return (
          <section key={d.id}>
            <h2 className="section-title">{d.id}.0 {d.name}</h2>
            <div className="lab-grid">
              {list.map(q => {
                const s = stats.q && stats.q[q.id];
                return (
                  <button key={q.id} className="lab-card" onClick={() => onStart({ title: q.title, examId: 'labs', qids: [q.id], fixedMode: 'study', direct: true })}>
                    <span className={`tag ${q.type === 'lab' ? 'lab' : ''}`}>{q.type === 'lab' ? 'Lab' : 'Sim'}</span>
                    <b>{q.title}</b>
                    <span className="muted sm">{q.obj} {objectiveName(q.obj)} · Exam {q.exam}</span>
                    {s && <span className={`sm ${s.lastRight ? 'ok-text' : 'bad-text'}`}>{s.lastRight ? 'Passed last time' : 'Not passed last time'}</span>}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
