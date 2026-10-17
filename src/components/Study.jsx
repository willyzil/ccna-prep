import React, { useEffect, useState } from 'react';
import Markdown from './Markdown.jsx';
import { domains } from '../data/domains.js';

// Topic notes carried over from the original study guide. Progress uses the
// same localStorage key, so ticks made in the old app are kept.
const KEY = 'ccna-prep-progress';
function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export default function Study({ domainId }) {
  const [progress, setProgress] = useState(load);
  const [open, setOpen] = useState(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* blocked */ } }, [progress]);
  const d = domainId ? domains.find(x => String(x.id) === String(domainId)) : null;

  if (!d) {
    return (
      <div className="page">
        <h1>Study notes</h1>
        <div className="study-grid">
          {domains.map(x => {
            const done = x.topics.filter((_, i) => progress[`${x.id}-${i}`]).length;
            return (
              <a key={x.id} className="study-card" href={`#/study/${x.id}`}>
                <span className="study-icon" aria-hidden="true">{x.icon}</span>
                <b>{x.id}.0 {x.title}</b>
                <span className="muted sm">{x.description}</span>
                <span className="sm">{done}/{x.topics.length} topics done · {x.weight} of exam</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      <a className="back" href="#/study">← All domains</a>
      <h1>{d.icon} {d.id}.0 {d.title}</h1>
      <p className="muted">{d.description}</p>
      <div className="topics">
        {d.topics.map((t, i) => {
          const k = `${d.id}-${i}`;
          return (
            <div key={k} className={`topic${open === i ? ' open' : ''}`}>
              <button className="topic-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span className={`tick${progress[k] ? ' on' : ''}`}>{progress[k] ? '✓' : ''}</span>
                {t.title}
              </button>
              {open === i && (
                <div className="topic-body">
                  <Markdown>{t.content}</Markdown>
                  <button className="btn ghost sm" onClick={() => setProgress(p => ({ ...p, [k]: !p[k] }))}>{progress[k] ? 'Mark as not done' : 'Mark as done'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
