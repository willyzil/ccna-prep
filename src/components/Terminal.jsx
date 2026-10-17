import React, { useEffect, useReducer, useRef, useState } from 'react';

const MAX_LINES = 1500;

// A console attached to one device of a Lab. Keys behave like IOS:
// "?" lists options, Tab completes, Up/Down recall history, Ctrl+Z = end.
export default function Terminal({ lab, dev, onCommand, readOnly }) {
  const [, force] = useReducer(x => x + 1, 0);
  const [value, setValue] = useState('');
  const hist = useRef({});
  const scroller = useRef(null);
  const input = useRef(null);
  const con = lab.console(dev);
  const lines = con.buf.length > MAX_LINES ? con.buf.slice(-MAX_LINES) : con.buf;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    setValue('');
    if (input.current && !readOnly) input.current.focus({ preventScroll: true });
  }, [dev, readOnly]);

  const h = (hist.current[dev] ||= { list: [], idx: -1 });

  function submit(line) {
    if (line.trim()) { h.list.push(line); if (h.list.length > 100) h.list.shift(); }
    h.idx = -1;
    setValue('');
    onCommand(dev, line);
    force();
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); submit(value); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const c = lab.complete(dev, value);
      if (c) setValue(c);
      return;
    }
    if (e.key === '?' && !con.masked()) {
      e.preventDefault();
      lab.help(dev, value);
      force();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!h.list.length) return;
      h.idx = h.idx < 0 ? h.list.length - 1 : Math.max(0, h.idx - 1);
      setValue(h.list[h.idx]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (h.idx < 0) return;
      h.idx++;
      if (h.idx >= h.list.length) { h.idx = -1; setValue(''); } else setValue(h.list[h.idx]);
      return;
    }
    if (e.ctrlKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); submit('end'); return; }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C') && !window.getSelection().toString()) { e.preventDefault(); setValue(''); }
  }

  return (
    <div className="term" onClick={() => { if (!window.getSelection().toString() && input.current) input.current.focus({ preventScroll: true }); }}>
      <div className="term-scroll" ref={scroller}>
        {con.buf.length > MAX_LINES && <div className="term-trunc">… earlier output trimmed …</div>}
        <pre className="term-out">{lines.join('\n')}{lines.length ? '\n' : ''}</pre>
        {!readOnly && (
          <div className="term-line">
            <span className="term-prompt">{con.prompt()}</span>
            <input
              ref={input}
              className="term-input"
              type={con.masked() ? 'password' : 'text'}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-label={`${dev} console`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
