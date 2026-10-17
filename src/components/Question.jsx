import React, { useState } from 'react';
import Markdown from './Markdown.jsx';
import Topology, { topoFromExhibit, topoFromLab } from './Topology.jsx';
import Terminal from './Terminal.jsx';
import { objectiveName } from '../exam/engine.js';

const L = i => String.fromCharCode(65 + i);

export function Exhibits({ list }) {
  if (!list || !list.length) return null;
  return (
    <div className="exhibits">
      {list.map((e, i) => (
        <figure className={`exhibit ex-${e.kind}`} key={i}>
          <figcaption>{e.title || (list.length > 1 ? `Exhibit ${i + 1}` : 'Exhibit')}</figcaption>
          {e.kind === 'cli' && <pre className="cli">{e.text.replace(/^\n/, '')}</pre>}
          {e.kind === 'code' && <pre className="code">{e.text.replace(/^\n/, '')}</pre>}
          {e.kind === 'table' && <Markdown>{e.md}</Markdown>}
          {e.kind === 'topo' && <Topology topo={topoFromExhibit(e)} />}
          {e.kind === 'img' && <img src={e.src} alt={e.alt || ''} />}
        </figure>
      ))}
    </div>
  );
}

function Options({ q, order, answer, onChange, disabled, reveal }) {
  const multi = q.type === 'multi' || (q.type === 'sim' && q.multi);
  const chosen = new Set(answer || []);
  const ids = order || q.opts.map(o => o.id);
  const byId = Object.fromEntries(q.opts.map(o => [o.id, o]));
  const toggle = id => {
    if (disabled) return;
    if (!multi) { onChange([id]); return; }
    const s = new Set(chosen);
    if (s.has(id)) s.delete(id);
    else {
      if (s.size >= q.pick) return;
      s.add(id);
    }
    onChange([...s]);
  };
  return (
    <div className="opts" role={multi ? 'group' : 'radiogroup'}>
      {multi && !disabled && <div className="opts-hint">Select {q.pick} ({chosen.size} selected)</div>}
      {ids.map((id, i) => {
        const o = byId[id];
        const isAns = q.ans.includes(id);
        const picked = chosen.has(id);
        let cls = 'opt';
        if (picked) cls += ' picked';
        if (reveal && isAns) cls += ' right';
        if (reveal && picked && !isAns) cls += ' wrong';
        return (
          <div key={id} className={cls}>
            <label>
              <input
                type={multi ? 'checkbox' : 'radio'}
                name={`q-${q.id}`}
                checked={picked}
                onChange={() => toggle(id)}
                disabled={disabled}
              />
              <span className="opt-letter">{L(i)}.</span>
              <span className="opt-text"><Markdown>{o.text}</Markdown></span>
              {reveal && isAns && <span className="tag ok">Correct</span>}
              {reveal && picked && !isAns && <span className="tag bad">Your answer</span>}
            </label>
            {reveal && o.why && <div className="opt-why"><Markdown>{o.why}</Markdown></div>}
          </div>
        );
      })}
    </div>
  );
}

function DragMatch({ q, order, answer, onChange, disabled, reveal }) {
  const a = answer || {};
  const [held, setHeld] = useState(null);
  const ids = order || q.items.map(i => i.id);
  const byId = Object.fromEntries(q.items.map(i => [i.id, i]));
  const place = (item, target) => {
    if (disabled || !item) return;
    const next = { ...a };
    if (target === null) delete next[item]; else next[item] = target;
    onChange(next);
    setHeld(null);
  };
  const pool = ids.filter(id => !a[id]);
  const chip = id => {
    const right = reveal && a[id] === q.ans[id];
    const wrong = reveal && a[id] && a[id] !== q.ans[id];
    return (
      <button
        key={id}
        type="button"
        className={`chip${held === id ? ' held' : ''}${right ? ' right' : ''}${wrong ? ' wrong' : ''}`}
        draggable={!disabled}
        onDragStart={e => { e.dataTransfer.setData('text/plain', id); setHeld(id); }}
        onClick={() => !disabled && setHeld(held === id ? null : id)}
        disabled={disabled && !reveal}
      >
        {byId[id].text}
        {a[id] && !disabled && <span className="chip-x" onClick={e => { e.stopPropagation(); place(id, null); }} aria-label="Remove">×</span>}
      </button>
    );
  };
  const zone = (tid, label, items) => (
    <div
      key={tid ?? 'pool'}
      className={`zone${held ? ' armed' : ''}`}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); place(e.dataTransfer.getData('text/plain'), tid); }}
      onClick={() => held && place(held, tid)}
    >
      <div className="zone-label">{label}</div>
      <div className="zone-items">{items.map(chip)}</div>
    </div>
  );
  return (
    <div className="dnd">
      {!disabled && <div className="opts-hint">Drag each item onto a category, or tap an item and then a category.</div>}
      <div className="dnd-pool">{zone(null, 'Items', pool)}</div>
      <div className="dnd-targets">
        {q.targets.map(t => zone(t.id, t.text, ids.filter(id => a[id] === t.id)))}
      </div>
      {reveal && (
        <div className="dnd-key">
          <strong>Correct placement</strong>
          <ul>{q.targets.map(t => <li key={t.id}><b>{t.text}:</b> {q.items.filter(i => q.ans[i.id] === t.id).map(i => i.text).join('; ') || '—'}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function DragOrder({ q, order, answer, onChange, disabled, reveal }) {
  const list = answer && answer.length === q.items.length ? answer : (order || q.items.map(i => i.id));
  const byId = Object.fromEntries(q.items.map(i => [i.id, i]));
  const [drag, setDrag] = useState(null);
  const move = (from, to) => {
    if (disabled || to < 0 || to >= list.length) return;
    const n = [...list];
    const [x] = n.splice(from, 1);
    n.splice(to, 0, x);
    onChange(n);
  };
  return (
    <div className="order">
      {!disabled && <div className="opts-hint">Drag the steps into the correct order, or use the arrows.</div>}
      <ol>
        {list.map((id, i) => {
          const ok = reveal && q.ans[i] === id;
          return (
            <li
              key={id}
              className={`order-item${reveal ? (ok ? ' right' : ' wrong') : ''}`}
              draggable={!disabled}
              onDragStart={() => setDrag(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}
            >
              <span className="order-n">{i + 1}</span>
              <span className="order-text">{byId[id].text}</span>
              {!disabled && (
                <span className="order-btns">
                  <button type="button" onClick={() => move(i, i - 1)} aria-label="Move up" disabled={i === 0}>▲</button>
                  <button type="button" onClick={() => move(i, i + 1)} aria-label="Move down" disabled={i === list.length - 1}>▼</button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!answer && !disabled && <div className="opts-hint muted">Not answered yet: reorder at least once to record your answer.</div>}
      {reveal && (
        <div className="dnd-key"><strong>Correct order</strong><ol>{q.ans.map(id => <li key={id}>{byId[id].text}</li>)}</ol></div>
      )}
    </div>
  );
}

export function LabPanel({ q, lab, onCommand, onReset, tools, results, showSolution }) {
  const devs = q.lab.devices.map(d => d.name);
  const [dev, setDev] = useState(() => devs.find(d => q.lab.devices.find(x => x.name === d).kind !== 'host') || devs[0]);
  const topo = topoFromLab(q.lab);
  return (
    <div className="labwrap">
      <div className="lab-side">
        <Topology topo={topo} selected={dev} onSelect={setDev} />
        <div className="lab-hint">Click a device to open its console.</div>
        {q.type === 'lab' && (
          <ol className="tasks">
            {q.lab.tasks.map((t, i) => {
              const r = results && results[i];
              return (
                <li key={i} className={r ? (r.ok ? 'ok' : 'bad') : ''}>
                  {r && <span className="task-mark">{r.ok ? '✓' : '✗'}</span>}
                  <Markdown>{t.text}</Markdown>
                </li>
              );
            })}
          </ol>
        )}
        {showSolution && q.lab.solution && (
          <div className="solution">
            <strong>Reference solution</strong>
            {groupLog(q.lab.solution).map(([d, lines]) => (
              <div key={d}><div className="sol-dev">{d}</div><pre className="cli">{lines.join('\n')}</pre></div>
            ))}
          </div>
        )}
      </div>
      <div className="lab-main">
        <div className="tabs" role="tablist">
          {devs.map(d => (
            <button key={d} role="tab" aria-selected={d === dev} className={`tab${d === dev ? ' on' : ''}`} onClick={() => setDev(d)}>{d}</button>
          ))}
        </div>
        {lab ? <Terminal lab={lab} dev={dev} onCommand={onCommand} readOnly={!onCommand} /> : <div className="term" />}
        <div className="lab-tools">
          {onReset && <button className="btn ghost sm" onClick={() => { if (confirm('Reset every device in this lab to its starting configuration?')) onReset(); }}>Reset lab</button>}
          {tools}
        </div>
      </div>
    </div>
  );
}

export function groupLog(log) {
  const out = [];
  for (const [d, line] of log) {
    if (!out.length || out[out.length - 1][0] !== d) out.push([d, []]);
    out[out.length - 1][1].push(line);
  }
  return out;
}

export default function Question({ q, index, total, order, answer, onAnswer, disabled, reveal, labProps }) {
  return (
    <div className={`question qt-${q.type}`}>
      <div className="q-meta">
        <span>Question {index + 1}{total ? ` of ${total}` : ''}</span>
        <span className="dot">·</span>
        <span title={objectiveName(q.obj)}>{q.obj} {objectiveName(q.obj)}</span>
        {q.type === 'lab' && <span className="tag lab">Lab · {q.points || 3} pts</span>}
        {q.type === 'sim' && <span className="tag lab">Simulation</span>}
        {(q.type === 'match' || q.type === 'order') && <span className="tag">Drag and drop</span>}
      </div>
      {q.title && (q.type === 'lab' || q.type === 'sim') && <h2 className="q-title">{q.title}</h2>}
      <Markdown className="q-stem">{q.q}</Markdown>
      <Exhibits list={q.ex} />
      {(q.type === 'lab' || q.type === 'sim') && labProps && <LabPanel q={q} {...labProps} />}
      {(q.type === 'single' || q.type === 'multi' || q.type === 'sim') && (
        <Options q={q} order={order} answer={answer} onChange={onAnswer} disabled={disabled} reveal={reveal} />
      )}
      {q.type === 'match' && <DragMatch q={q} order={order} answer={answer} onChange={onAnswer} disabled={disabled} reveal={reveal} />}
      {q.type === 'order' && <DragOrder q={q} order={order} answer={answer} onChange={onAnswer} disabled={disabled} reveal={reveal} />}
      {reveal && q.exp && (
        <div className="explain">
          <h3>Explanation</h3>
          <Markdown>{q.exp}</Markdown>
        </div>
      )}
    </div>
  );
}
