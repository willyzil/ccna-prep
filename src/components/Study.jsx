import React, { useEffect, useState } from 'react';
import Markdown from './Markdown.jsx';
import { domains } from '../data/domains.js';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

// Topic notes carried over from the original study guide. Ticks save to the
// account when signed in, otherwise to this browser under the old app's key,
// so ticks made there are kept.
export default function Study({ domainId }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState({});
  const [open, setOpen] = useState(null);
  const [saveError, setSaveError] = useState(null);
  useEffect(() => {
    let live = true;
    api.getStudy().then(p => { if (live) setProgress(p || {}); }).catch(e => { if (live) setSaveError(`Could not load your ticks: ${e.message}`); });
    return () => { live = false; };
  }, [user]);
  const toggle = k => {
    const next = { ...progress, [k]: !progress[k] };
    setProgress(next);
    setSaveError(null);
    api.setStudy(next).catch(e => setSaveError(`Could not save: ${e.message}`));
  };
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
      {saveError && <p className="form-error" role="alert">{saveError}</p>}
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
                  <button className="btn ghost sm" onClick={() => toggle(k)}>{progress[k] ? 'Mark as not done' : 'Mark as done'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
