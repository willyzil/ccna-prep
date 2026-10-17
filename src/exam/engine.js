// Exam engine: attempts, shuffling, scoring. Pure functions, no UI.
import { gradeLab } from '../sim/lab.js';
import { DOMAINS, OBJECTIVES } from '../bank/blueprint.js';

export const PASS_SCORE = 825;
export const EXAM_MINUTES = 120;

// Deterministic PRNG so an attempt's shuffle can be rebuilt from its seed.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffled(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function pointsFor(q) {
  return q.type === 'lab' ? (q.points || 3) : 1;
}

/**
 * opts: { title, examId, mode: 'sim'|'study', strict, timed, minutes, qids, shuffleQ, shuffleOpts }
 */
export function newAttempt(bank, opts) {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const rand = rng(seed);
  let qids = [...opts.qids];
  if (opts.shuffleQ) qids = shuffled(qids, rand);
  const optOrder = {};
  for (const id of qids) {
    const q = bank.byId[id];
    if (!q) continue;
    if ((q.type === 'single' || q.type === 'multi' || q.type === 'sim') && opts.shuffleOpts !== false && !q.fixedOrder) {
      optOrder[id] = shuffled(q.opts.map(o => o.id), rand);
    } else if (q.type === 'match' || q.type === 'order') {
      optOrder[id] = shuffled(q.items.map(i => i.id), rand);
    }
  }
  return {
    id: newId(),
    v: 1,
    title: opts.title,
    examId: opts.examId,
    mode: opts.mode,
    strict: !!opts.strict,
    timed: !!opts.timed,
    limitSec: (opts.minutes || EXAM_MINUTES) * 60,
    seed,
    qids,
    optOrder,
    answers: {},
    marked: [],
    revealed: [],
    cursor: 0,
    maxSeen: 0,
    elapsed: 0,
    status: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    finishedAt: null,
    result: null,
  };
}

export function isAnswered(q, a) {
  if (a === undefined || a === null) return false;
  switch (q.type) {
    case 'single':
    case 'sim':
    case 'multi':
      return Array.isArray(a) && a.length > 0;
    case 'match':
      return Object.keys(a).length > 0;
    case 'order':
      return Array.isArray(a) && a.length === q.items.length;
    case 'lab':
      return Array.isArray(a.log) && a.log.length > 0;
    default:
      return false;
  }
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every(x => s.has(x));
}

// Returns { earned, possible, correct, detail }.
export function scoreQuestion(q, a) {
  const possible = pointsFor(q);
  if (q.type === 'lab') {
    const tasks = gradeLab(q.lab, a && a.log ? a.log : []);
    const passed = tasks.filter(t => t.ok).length;
    const earned = tasks.length ? (passed / tasks.length) * possible : 0;
    return { earned, possible, correct: passed === tasks.length, detail: { tasks } };
  }
  if (!isAnswered(q, a)) return { earned: 0, possible, correct: false, detail: { blank: true } };
  let correct = false;
  if (q.type === 'single' || q.type === 'sim' || q.type === 'multi') correct = sameSet(a, q.ans);
  else if (q.type === 'match') {
    const keys = Object.keys(q.ans);
    correct = keys.every(k => a[k] === q.ans[k]) && Object.keys(a).every(k => q.ans[k] === a[k]);
  } else if (q.type === 'order') correct = a.every((x, i) => x === q.ans[i]);
  return { earned: correct ? possible : 0, possible, correct, detail: {} };
}

export function finalize(bank, attempt) {
  const perQ = {};
  let earned = 0, possible = 0;
  const byDomain = {};
  const byObj = {};
  for (const id of attempt.qids) {
    const q = bank.byId[id];
    if (!q) continue;
    const r = scoreQuestion(q, attempt.answers[id]);
    perQ[id] = { frac: r.possible ? r.earned / r.possible : 0, correct: r.correct, earned: r.earned, possible: r.possible, detail: r.detail };
    earned += r.earned;
    possible += r.possible;
    const d = q.domain;
    byDomain[d] ||= { earned: 0, possible: 0, n: 0, right: 0 };
    byDomain[d].earned += r.earned;
    byDomain[d].possible += r.possible;
    byDomain[d].n++;
    if (r.correct) byDomain[d].right++;
    byObj[q.obj] ||= { earned: 0, possible: 0, n: 0, right: 0 };
    byObj[q.obj].earned += r.earned;
    byObj[q.obj].possible += r.possible;
    byObj[q.obj].n++;
    if (r.correct) byObj[q.obj].right++;
  }
  const score = possible ? Math.round((earned / possible) * 1000) : 0;
  return {
    score,
    pass: score >= PASS_SCORE,
    earned: Math.round(earned * 100) / 100,
    possible,
    correct: Object.values(perQ).filter(r => r.correct).length,
    total: attempt.qids.length,
    byDomain,
    byObj,
    perQ,
  };
}

export function domainName(id) {
  const d = DOMAINS.find(x => x.id === Number(id));
  return d ? d.name : `Domain ${id}`;
}

export function objectiveName(id) {
  return OBJECTIVES[id] || id;
}

export function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const two = n => String(n).padStart(2, '0');
  return h ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}
