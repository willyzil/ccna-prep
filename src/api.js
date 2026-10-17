// Talks to the server; falls back to localStorage when there is no API
// (e.g. `vite dev` without the server running).
import { computeStats, summarise } from './exam/stats.js';

let mode = null;

async function detect() {
  if (mode) return mode;
  try {
    const r = await fetch('/api/health', { cache: 'no-store' });
    mode = r.ok ? 'server' : 'local';
  } catch {
    mode = 'local';
  }
  return mode;
}

async function req(method, path, body) {
  const r = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status}`);
  return r.status === 204 ? null : r.json();
}

// ---------------------------------------------------------------- local store
const LS = 'ccna-exam-attempts';
const LF = 'ccna-exam-flags';
function lsRead(k, d) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
}
function lsWrite(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ }
}

export const api = {
  async mode() { return detect(); },

  async listAttempts() {
    if ((await detect()) === 'server') return req('GET', '/attempts');
    return Object.values(lsRead(LS, {})).map(summarise).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async getAttempt(id) {
    if ((await detect()) === 'server') return req('GET', `/attempts/${id}`);
    const a = lsRead(LS, {})[id];
    if (!a) throw new Error('not found');
    return a;
  },

  async saveAttempt(a) {
    a.updatedAt = Date.now();
    if ((await detect()) === 'server') return req('PUT', `/attempts/${a.id}`, a);
    const all = lsRead(LS, {});
    all[a.id] = a;
    lsWrite(LS, all);
    return { ok: true };
  },

  async deleteAttempt(id) {
    if ((await detect()) === 'server') return req('DELETE', `/attempts/${id}`);
    const all = lsRead(LS, {});
    delete all[id];
    lsWrite(LS, all);
    return null;
  },

  async stats() {
    if ((await detect()) === 'server') return req('GET', '/stats');
    return { q: computeStats(Object.values(lsRead(LS, {}))), flags: lsRead(LF, []) };
  },

  async setFlag(qid, on) {
    if ((await detect()) === 'server') return req('PUT', `/flags/${encodeURIComponent(qid)}`, { on });
    const f = new Set(lsRead(LF, []));
    if (on) f.add(qid); else f.delete(qid);
    lsWrite(LF, [...f]);
    return null;
  },
};
