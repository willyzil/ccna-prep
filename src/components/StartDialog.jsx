import React, { useState } from 'react';
import Modal from './Modal.jsx';

export function defaultMinutes(n) {
  return n >= 90 ? 120 : Math.max(10, Math.round(n * 1.2));
}

// cfg: { title, qids, examId, fixedMode? }
export default function StartDialog({ cfg, onStart, onClose }) {
  const n = cfg.qids.length;
  const [mode, setMode] = useState(cfg.fixedMode || 'sim');
  const [strict, setStrict] = useState(true);
  const [timed, setTimed] = useState(true);
  const [minutes, setMinutes] = useState(defaultMinutes(n));
  const [shuffleQ, setShuffleQ] = useState(true);
  const sim = mode === 'sim';
  return (
    <Modal
      title={`Start: ${cfg.title}`}
      onClose={onClose}
      actions={<>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={() => onStart({ ...cfg, mode, strict: sim && strict, timed: sim ? timed : false, minutes, shuffleQ, shuffleOpts: true })}>Start</button>
      </>}
    >
      <p className="muted">{n} question{n === 1 ? '' : 's'}</p>
      <div className="seg big" role="radiogroup" aria-label="Mode">
        <button className={sim ? 'on' : ''} onClick={() => setMode('sim')} role="radio" aria-checked={sim}>
          <b>Simulation</b><span>Timed, no feedback until the end</span>
        </button>
        <button className={!sim ? 'on' : ''} onClick={() => setMode('study')} role="radio" aria-checked={!sim}>
          <b>Study</b><span>Check answers and read explanations as you go</span>
        </button>
      </div>
      <div className="form">
        {sim && (
          <>
            <label className="check"><input type="checkbox" checked={strict} onChange={e => setStrict(e.target.checked)} /> Real exam rules: no going back to earlier questions</label>
            <label className="check"><input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} /> Timed</label>
            {timed && (
              <label className="field">Time limit (minutes)
                <input type="number" min="5" max="300" value={minutes} onChange={e => setMinutes(Math.max(5, Number(e.target.value) || 5))} />
              </label>
            )}
          </>
        )}
        <label className="check"><input type="checkbox" checked={shuffleQ} onChange={e => setShuffleQ(e.target.checked)} /> Shuffle question order</label>
      </div>
    </Modal>
  );
}
