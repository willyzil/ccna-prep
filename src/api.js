// Where exam history lives:
//   cloud  - signed in: the user's own rows in Supabase (supabase/schema.sql)
//   server - signed out on ccna.lan: the box's own SQLite API
//   local  - signed out anywhere else (Netlify, `vite dev`): this browser only
import { computeStats, summarise } from './exam/stats.js';
import { supabase } from './supabase.js';

let baseMode = null; // where history goes while nobody is signed in
let user = null;

async function detectBase() {
  if (baseMode) return baseMode;
  try {
    const r = await fetch('/api/health', { cache: 'no-store' });
    // A host that answers every path with the app's index.html is not the API.
    baseMode = r.ok && (r.headers.get('content-type') || '').includes('json') ? 'server' : 'local';
  } catch {
    baseMode = 'local';
  }
  return baseMode;
}

const detect = async () => (user && supabase ? 'cloud' : detectBase());

async function req(method, path, body) {
  const r = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status}`);
  return r.status === 204 ? null : r.json();
}

// ---------------------------------------------------------------- browser store
const LS = 'ccna-exam-attempts';
const LF = 'ccna-exam-flags';
const LP = 'ccna-prep-progress'; // study ticks, same key as the old study app
function lsRead(k, d) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
}
function lsWrite(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ }
}

// ---------------------------------------------------------------- account store
const ATT = 'ccna_attempts';
const FLAGS = 'ccna_flags';
const STUDY = 'ccna_study';

function must({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// The app asks for the list and the stats together after every navigation;
// one fetch serves both.
let recent = null;
function cloudAll() {
  if (recent && Date.now() - recent.at < 2000) return recent.p;
  const p = supabase.from(ATT).select('data').order('updated_at', { ascending: false })
    .then(r => must(r).map(x => x.data));
  recent = { at: Date.now(), p };
  p.catch(() => { recent = null; });
  return p;
}
const changed = () => { recent = null; };

const attemptRow = a => ({ user_id: user.id, id: a.id, status: String(a.status || 'active'), data: a });

// What was saved before signing in: on ccna.lan the server's history,
// anywhere else this browser's.
async function signedOutData() {
  const where = await detectBase();
  let attempts;
  let flags;
  if (where === 'server') {
    const list = await req('GET', '/attempts');
    attempts = await Promise.all(list.map(s => req('GET', `/attempts/${s.id}`)));
    flags = (await req('GET', '/stats')).flags || [];
  } else {
    attempts = Object.values(lsRead(LS, {}));
    flags = lsRead(LF, []);
  }
  attempts = attempts.filter(a => a && typeof a.id === 'string' && Array.isArray(a.qids));
  return { where, attempts, flags, study: lsRead(LP, {}) };
}
const importMark = () => `ccna-imported-${user.id}`;

export const api = {
  setUser(u) { user = u; changed(); },

  async mode() { return detect(); },

  async listAttempts() {
    const m = await detect();
    if (m === 'cloud') return (await cloudAll()).map(summarise);
    if (m === 'server') return req('GET', '/attempts');
    return Object.values(lsRead(LS, {})).map(summarise).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async getAttempt(id) {
    const m = await detect();
    if (m === 'cloud') {
      const row = must(await supabase.from(ATT).select('data').eq('id', id).maybeSingle());
      if (!row) throw new Error('not found');
      return row.data;
    }
    if (m === 'server') return req('GET', `/attempts/${id}`);
    const a = lsRead(LS, {})[id];
    if (!a) throw new Error('not found');
    return a;
  },

  async saveAttempt(a) {
    a.updatedAt = Date.now();
    const m = await detect();
    if (m === 'cloud') {
      must(await supabase.from(ATT).upsert(attemptRow(a), { onConflict: 'user_id,id' }));
      changed();
      return { ok: true };
    }
    if (m === 'server') return req('PUT', `/attempts/${a.id}`, a);
    const all = lsRead(LS, {});
    all[a.id] = a;
    lsWrite(LS, all);
    return { ok: true };
  },

  async deleteAttempt(id) {
    const m = await detect();
    if (m === 'cloud') {
      must(await supabase.from(ATT).delete().eq('id', id));
      changed();
      return null;
    }
    if (m === 'server') return req('DELETE', `/attempts/${id}`);
    const all = lsRead(LS, {});
    delete all[id];
    lsWrite(LS, all);
    return null;
  },

  async stats() {
    const m = await detect();
    if (m === 'cloud') {
      const [all, flags] = await Promise.all([cloudAll(), supabase.from(FLAGS).select('qid').then(must)]);
      return { q: computeStats(all), flags: flags.map(f => f.qid) };
    }
    if (m === 'server') return req('GET', '/stats');
    return { q: computeStats(Object.values(lsRead(LS, {}))), flags: lsRead(LF, []) };
  },

  async setFlag(qid, on) {
    const m = await detect();
    if (m === 'cloud') {
      if (on) must(await supabase.from(FLAGS).upsert({ user_id: user.id, qid }, { onConflict: 'user_id,qid', ignoreDuplicates: true }));
      else must(await supabase.from(FLAGS).delete().eq('qid', qid));
      return null;
    }
    if (m === 'server') return req('PUT', `/flags/${encodeURIComponent(qid)}`, { on });
    const f = new Set(lsRead(LF, []));
    if (on) f.add(qid); else f.delete(qid);
    lsWrite(LF, [...f]);
    return null;
  },

  // Study ticks: in the account when signed in, otherwise in this browser
  // (the ccna.lan server never stored them).
  async getStudy() {
    if ((await detect()) === 'cloud') {
      const row = must(await supabase.from(STUDY).select('progress').maybeSingle());
      return row ? row.progress : {};
    }
    return lsRead(LP, {});
  },

  async setStudy(progress) {
    if ((await detect()) === 'cloud') {
      must(await supabase.from(STUDY).upsert({ user_id: user.id, progress }, { onConflict: 'user_id' }));
      return null;
    }
    lsWrite(LP, progress);
    return null;
  },

  // ------------------------------------------------------------ history from before signing in

  // What there is to copy into the account, or null. Offered once; after a
  // copy or a "no thanks", only exams taken signed out since then count.
  async pendingImport() {
    if (!user || !supabase) return null;
    const since = lsRead(importMark(), 0);
    const d = await signedOutData();
    const attempts = d.attempts.filter(a => (a.updatedAt || 0) > since).length;
    const flags = since ? 0 : d.flags.length;
    const ticks = since ? 0 : Object.values(d.study).filter(Boolean).length;
    if (!attempts && !flags && !ticks) return null;
    return { where: d.where === 'server' ? 'this server' : 'this browser', attempts, flags, ticks };
  },

  // Copies it in. Exams already in the account are left as they are.
  async importIntoAccount() {
    const d = await signedOutData();
    let copied = 0;
    let failed = 0;
    for (let i = 0; i < d.attempts.length; i += 20) {
      const chunk = d.attempts.slice(i, i + 20);
      const r = await supabase.from(ATT).upsert(chunk.map(attemptRow), { onConflict: 'user_id,id', ignoreDuplicates: true });
      if (!r.error) { copied += chunk.length; continue; }
      for (const a of chunk) { // one bad exam must not hold back the rest
        const one = await supabase.from(ATT).upsert(attemptRow(a), { onConflict: 'user_id,id', ignoreDuplicates: true });
        if (one.error) failed++; else copied++;
      }
    }
    if (d.flags.length) {
      must(await supabase.from(FLAGS).upsert(d.flags.map(qid => ({ user_id: user.id, qid })), { onConflict: 'user_id,qid', ignoreDuplicates: true }));
    }
    const ticks = Object.keys(d.study).filter(k => d.study[k]);
    if (ticks.length) {
      const mine = await api.getStudy();
      for (const k of ticks) mine[k] = true;
      await api.setStudy(mine);
    }
    lsWrite(importMark(), Date.now());
    changed();
    return { copied, failed };
  },

  skipImport() {
    if (user) lsWrite(importMark(), Date.now());
  },
};
