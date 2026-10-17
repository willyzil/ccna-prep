// Loads, normalises and indexes the question bank.
import { OBJECTIVES, EXAMS } from './blueprint.js';
import d1 from './d1.js';
import d2 from './d2.js';
import d3 from './d3.js';
import d4 from './d4.js';
import d5 from './d5.js';
import d6 from './d6.js';
import labs from './labs.js';

const LETTERS = 'abcdefghij';
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five'];

export function normalise(raw) {
  const q = { ...raw };
  q.domain = Number(String(raw.obj).split('.')[0]);
  if (raw.opts) {
    q.opts = raw.opts.map((o, i) => (Array.isArray(o) ? { id: LETTERS[i], text: o[0], why: o[1] || '' } : { id: LETTERS[i], ...o }));
  }
  if (q.type === 'single' || q.type === 'multi' || q.type === 'sim') {
    q.ans = String(raw.ans).split(',').map(s => s.trim()).filter(Boolean);
    if (q.type === 'sim') q.multi = q.ans.length > 1;
  }
  if (q.type === 'multi' || (q.type === 'sim' && q.ans.length > 1)) {
    q.pick = q.ans.length;
    if (!/\(Choose \w+\.\)/.test(q.q)) q.q = `${q.q.trim()} (Choose ${WORDS[q.pick] || q.pick}.)`;
  }
  if (q.type === 'match') {
    q.items = raw.items.map(([id, text]) => ({ id, text }));
    q.targets = raw.targets.map(([id, text]) => ({ id, text }));
  }
  if (q.type === 'order') {
    q.items = raw.items.map(([id, text]) => ({ id, text }));
    q.ans = q.items.map(i => i.id);
  }
  return q;
}

// Returns a list of problems; empty means the question is well-formed.
export function validate(q) {
  const errs = [];
  const at = m => errs.push(`${q.id}: ${m}`);
  if (!q.id) at('missing id');
  if (!OBJECTIVES[q.obj]) at(`unknown objective ${q.obj}`);
  if (q.exam && !EXAMS.some(e => e.id === q.exam)) at(`unknown exam ${q.exam}`);
  if (!q.q || typeof q.q !== 'string') at('missing stem');
  if (!q.exp && q.type !== 'lab') at('missing explanation');
  if (['single', 'multi', 'sim'].includes(q.type)) {
    if (!q.opts || q.opts.length < 2) at('needs options');
    const ids = (q.opts || []).map(o => o.id);
    for (const a of q.ans) if (!ids.includes(a)) at(`answer ${a} not an option`);
    if (q.type === 'single' && q.ans.length !== 1) at('single needs exactly one answer');
    if (q.type === 'multi' && q.ans.length < 2) at('multi needs 2+ answers');
    const texts = (q.opts || []).map(o => o.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) at('duplicate option text');
  }
  if (q.type === 'match') {
    const tids = q.targets.map(t => t.id);
    for (const i of q.items) if (!(i.id in q.ans)) at(`item ${i.id} has no answer`);
    for (const [k, v] of Object.entries(q.ans)) {
      if (!q.items.some(i => i.id === k)) at(`answer for unknown item ${k}`);
      if (!tids.includes(v)) at(`answer target ${v} unknown`);
    }
  }
  if (q.type === 'lab' || q.type === 'sim') {
    if (!q.lab || !q.lab.devices) at('missing lab');
    if (q.type === 'lab' && (!q.lab.tasks || !q.lab.tasks.length)) at('lab needs tasks');
    if (q.type === 'lab' && !q.lab.solution) at('lab needs a solution');
  }
  if (!['single', 'multi', 'match', 'order', 'lab', 'sim'].includes(q.type)) at(`unknown type ${q.type}`);
  for (const e of q.ex || []) {
    if (!['cli', 'topo', 'table', 'code', 'img'].includes(e.kind)) at(`bad exhibit kind ${e.kind}`);
  }
  return errs;
}

export function buildBank(lists) {
  const list = lists.flat().map(normalise);
  const byId = {};
  for (const q of list) byId[q.id] = q;
  const exams = {};
  for (const e of EXAMS) exams[e.id] = list.filter(q => q.exam === e.id).map(q => q.id);
  return { list, byId, exams, labs: list.filter(q => q.type === 'lab').map(q => q.id) };
}

export const bank = buildBank([d1, d2, d3, d4, d5, d6, labs]);
