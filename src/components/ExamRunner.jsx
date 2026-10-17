import React, { useCallback, useEffect, useRef, useState } from 'react';
import Question from './Question.jsx';
import Modal from './Modal.jsx';
import { api } from '../api.js';
import { Lab, gradeLab } from '../sim/lab.js';
import { finalize, isAnswered, fmtTime } from '../exam/engine.js';

function Timer({ att, elapsed, paused, onTimeout }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      if (!paused && !document.hidden) {
        elapsed.current += 1;
        if (att.timed && elapsed.current >= att.limitSec) onTimeout();
      }
      tick(x => x + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [paused, att, elapsed, onTimeout]);
  const left = att.limitSec - elapsed.current;
  if (!att.timed) return <span className="timer">{fmtTime(elapsed.current)}</span>;
  return <span className={`timer${left < 600 ? ' low' : ''}`} title="Time remaining">{fmtTime(left)}</span>;
}

export default function ExamRunner({ id, bank, navigate }) {
  const [att, setAtt] = useState(null);
  const [error, setError] = useState(null);
  const [grid, setGrid] = useState(false);
  const [ending, setEnding] = useState(false);
  const [paused, setPaused] = useState(false);
  const [checks, setChecks] = useState({});
  const [sol, setSol] = useState({});
  const [labVer, setLabVer] = useState(0);
  const elapsed = useRef(0);
  const labs = useRef({});
  const saveTimer = useRef(null);
  const attRef = useRef(null);
  attRef.current = att;

  useEffect(() => {
    api.getAttempt(id).then(a => {
      if (a.status === 'done') { navigate(`#/report/${a.id}`); return; }
      a.simLogs ||= {};
      elapsed.current = a.elapsed || 0;
      setAtt(a);
    }).catch(e => setError(String(e.message || e)));
  }, [id, navigate]);

  const persist = useCallback((a) => {
    a.elapsed = elapsed.current;
    return api.saveAttempt(a).catch(e => setError(`Could not save: ${e.message}`));
  }, []);

  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { if (attRef.current) persist(attRef.current); }, 700);
  }, [persist]);

  // Periodic save so elapsed time survives a closed tab.
  useEffect(() => {
    const t = setInterval(() => { if (attRef.current && attRef.current.status === 'active') persist(attRef.current); }, 20000);
    const flush = () => { if (attRef.current && attRef.current.status === 'active') persist(attRef.current); };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', flush);
    return () => { clearInterval(t); window.removeEventListener('beforeunload', flush); document.removeEventListener('visibilitychange', flush); };
  }, [persist]);

  const update = useCallback(fn => {
    setAtt(prev => {
      const next = { ...prev };
      fn(next);
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  const finish = useCallback(async () => {
    const a = { ...attRef.current };
    a.elapsed = elapsed.current;
    a.status = 'done';
    a.finishedAt = Date.now();
    a.result = finalize(bank, a);
    clearTimeout(saveTimer.current);
    await api.saveAttempt(a);
    navigate(`#/report/${a.id}`);
  }, [bank, navigate]);

  const onTimeout = useCallback(() => { finish(); }, [finish]);

  if (error) return <div className="page"><div className="alert">{error}</div><a className="btn" href="#/">Back</a></div>;
  if (!att) return <div className="page"><div className="loading">Loading exam…</div></div>;

  const qid = att.qids[att.cursor];
  const q = bank.byId[qid];
  const study = att.mode === 'study';
  const revealed = att.revealed.includes(qid);
  const marked = att.marked.includes(qid);
  const last = att.cursor === att.qids.length - 1;

  const labFor = (qq) => {
    if (!labs.current[qq.id]) {
      const l = new Lab(qq.lab);
      const log = qq.type === 'lab' ? (att.answers[qq.id] && att.answers[qq.id].log) : att.simLogs[qq.id];
      if (log && log.length) l.replay(log);
      labs.current[qq.id] = l;
    }
    return labs.current[qq.id];
  };

  const go = (to) => {
    if (to < 0 || to >= att.qids.length) return;
    if (att.strict && to < att.cursor) return;
    update(a => { a.cursor = to; a.maxSeen = Math.max(a.maxSeen || 0, to); });
    window.scrollTo({ top: 0 });
  };

  const next = () => {
    if (att.strict && !isAnswered(q, att.answers[qid]) && q.type !== 'lab') {
      if (!confirm('You have not answered this question. Under exam rules you cannot come back to it. Continue anyway?')) return;
    }
    if (last) { setEnding(true); return; }
    go(att.cursor + 1);
  };

  let labProps = null;
  if (q.type === 'lab' || q.type === 'sim') {
    const lab = labFor(q);
    const locked = study && revealed && q.type === 'lab';
    labProps = {
      lab,
      onCommand: locked ? null : (dev, line) => {
        lab.input(dev, line);
        update(a => {
          if (q.type === 'lab') a.answers = { ...a.answers, [q.id]: { log: [...lab.log] } };
          else a.simLogs = { ...a.simLogs, [q.id]: [...lab.log] };
        });
      },
      onReset: locked ? null : () => {
        labs.current[q.id] = new Lab(q.lab);
        update(a => {
          if (q.type === 'lab') { const n = { ...a.answers }; delete n[q.id]; a.answers = n; } else a.simLogs = { ...a.simLogs, [q.id]: [] };
        });
        setChecks(c => ({ ...c, [q.id]: undefined }));
        setLabVer(v => v + 1);
      },
      results: q.type === 'lab' ? (revealed ? gradeLab(q.lab, (att.answers[qid] || {}).log || []) : checks[q.id]) : null,
      showSolution: q.type === 'lab' && (sol[q.id] || (study && revealed)),
      tools: study && q.type === 'lab' ? (
        <>
          <button className="btn ghost sm" onClick={() => setChecks(c => ({ ...c, [q.id]: gradeLab(q.lab, lab.log) }))}>Check my work</button>
          <button className="btn ghost sm" onClick={() => setSol(s => ({ ...s, [q.id]: !s[q.id] }))}>{sol[q.id] ? 'Hide' : 'Show'} solution</button>
        </>
      ) : null,
    };
  }

  const unanswered = att.qids.filter(id => !isAnswered(bank.byId[id], att.answers[id])).length;

  return (
    <div className={`runner${paused ? ' paused' : ''}`}>
      <header className="runner-bar">
        <div className="rb-left">
          <strong className="rb-title">{att.title}</strong>
          <span className="rb-mode">{study ? 'Study mode' : att.strict ? 'Simulation · exam rules' : 'Simulation'}</span>
        </div>
        <div className="rb-mid">
          <span className="rb-count">{att.cursor + 1} / {att.qids.length}</span>
          <Timer att={att} elapsed={elapsed} paused={paused} onTimeout={onTimeout} />
        </div>
        <div className="rb-right">
          <button className={`btn ghost sm${marked ? ' on' : ''}`} onClick={() => update(a => { a.marked = marked ? a.marked.filter(x => x !== qid) : [...a.marked, qid]; })} aria-pressed={marked}>
            {marked ? '★ Marked' : '☆ Mark'}
          </button>
          {!att.strict && <button className="btn ghost sm" onClick={() => setGrid(true)}>Item review</button>}
          <button className="btn ghost sm" onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button>
          <button className="btn ghost sm" onClick={async () => { await persist(att); navigate('#/'); }}>Save &amp; exit</button>
          <button className="btn danger sm" onClick={() => setEnding(true)}>End exam</button>
        </div>
      </header>

      {paused ? (
        <div className="pause-screen">
          <h2>Paused</h2>
          <p>The timer is stopped and the question is hidden.</p>
          <button className="btn" onClick={() => setPaused(false)}>Resume</button>
        </div>
      ) : (
        <main className="runner-body" key={`${qid}-${labVer}`}>
          <Question
            q={q}
            index={att.cursor}
            total={att.qids.length}
            order={att.optOrder[qid]}
            answer={att.answers[qid]}
            onAnswer={v => update(a => { a.answers = { ...a.answers, [qid]: v }; })}
            disabled={study && revealed}
            reveal={study && revealed}
            labProps={labProps}
          />
        </main>
      )}

      <footer className="runner-foot">
        <button className="btn ghost" onClick={() => go(att.cursor - 1)} disabled={att.cursor === 0 || att.strict}>← Previous</button>
        <div className="rf-mid">
          {study && !revealed && (
            <button className="btn secondary" onClick={() => update(a => { a.revealed = [...a.revealed, qid]; })}>
              {q.type === 'lab' ? 'Grade lab & explain' : 'Check answer'}
            </button>
          )}
          {study && revealed && q.type !== 'lab' && (
            <span className={`verdict ${isRight(q, att.answers[qid], bank) ? 'ok' : 'bad'}`}>{isRight(q, att.answers[qid], bank) ? 'Correct' : 'Incorrect'}</span>
          )}
        </div>
        <button className="btn" onClick={next}>{last ? 'Finish' : 'Next →'}</button>
      </footer>

      {grid && (
        <Modal title="Item review" onClose={() => setGrid(false)} wide>
          <div className="grid-legend">
            <span><i className="sw answered" /> Answered</span>
            <span><i className="sw" /> Unanswered</span>
            <span><i className="sw marked" /> Marked</span>
          </div>
          <div className="qgrid">
            {att.qids.map((id, i) => {
              const qq = bank.byId[id];
              const ans = isAnswered(qq, att.answers[id]);
              return (
                <button
                  key={id}
                  className={`qcell${ans ? ' answered' : ''}${att.marked.includes(id) ? ' marked' : ''}${i === att.cursor ? ' current' : ''}`}
                  onClick={() => { setGrid(false); go(i); }}
                  title={`${qq.obj} · ${qq.type}`}
                >
                  {i + 1}{qq.type === 'lab' ? 'ᴸ' : ''}
                </button>
              );
            })}
          </div>
        </Modal>
      )}

      {ending && (
        <Modal
          title="End the exam?"
          onClose={() => setEnding(false)}
          actions={<>
            <button className="btn ghost" onClick={() => setEnding(false)}>Keep going</button>
            {!att.strict && att.marked.length > 0 && <button className="btn ghost" onClick={() => { setEnding(false); setGrid(true); }}>Review marked</button>}
            <button className="btn danger" onClick={finish}>End and score</button>
          </>}
        >
          <p>{att.qids.length - unanswered} of {att.qids.length} answered{unanswered ? <>, <b>{unanswered} unanswered</b></> : ''}{att.marked.length ? `, ${att.marked.length} marked` : ''}.</p>
          <p className="muted">Labs are graded on the configuration you leave in place. Unanswered questions score zero.</p>
        </Modal>
      )}
    </div>
  );
}

function isRight(q, a) {
  if (!isAnswered(q, a)) return false;
  if (q.type === 'match') return Object.keys(q.ans).every(k => a[k] === q.ans[k]);
  if (q.type === 'order') return a.every((x, i) => x === q.ans[i]);
  const s = new Set(a);
  return s.size === q.ans.length && q.ans.every(x => s.has(x));
}
