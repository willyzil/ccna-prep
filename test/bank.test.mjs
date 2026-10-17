import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bank, validate } from '../src/bank/index.js';
import { DOMAINS, EXAMS } from '../src/bank/blueprint.js';
import { newAttempt, finalize, scoreQuestion } from '../src/exam/engine.js';

test('every question is well-formed', () => {
  const errs = bank.list.flatMap(validate);
  assert.deepEqual(errs, []);
});

test('ids are unique', () => {
  const seen = new Map();
  for (const q of bank.list) {
    assert.ok(!seen.has(q.id), `duplicate id ${q.id}`);
    seen.set(q.id, true);
  }
});

test('multi-answer stems say how many to choose', () => {
  for (const q of bank.list.filter(x => x.type === 'multi')) {
    assert.match(q.q, /\(Choose (two|three|four)\.\)/, q.id);
  }
});

test('no option text gives the answer away with "all of the above"', () => {
  for (const q of bank.list.filter(x => x.opts)) {
    for (const o of q.opts) assert.doesNotMatch(o.text, /all of the above|none of the above/i, q.id);
  }
});

test('the correct option is not systematically the first one', () => {
  const firsts = bank.list.filter(q => q.type === 'single').length;
  assert.ok(firsts > 0);
});

test('exam composition summary', () => {
  for (const e of EXAMS) {
    const qs = bank.exams[e.id].map(id => bank.byId[id]);
    const by = Object.fromEntries(DOMAINS.map(d => [d.id, qs.filter(q => q.domain === d.id).length]));
    console.log(`Exam ${e.id}: ${qs.length} items`, JSON.stringify(by));
  }
});

test('a perfect attempt scores 1000 and a blank attempt scores 0', () => {
  const qids = bank.list.filter(q => q.type !== 'lab').map(q => q.id);
  const a = newAttempt(bank, { title: 't', examId: 'x', mode: 'sim', qids });
  for (const id of qids) {
    const q = bank.byId[id];
    a.answers[id] = q.type === 'match' ? { ...q.ans } : q.type === 'order' ? [...q.ans] : [...q.ans];
  }
  assert.equal(finalize(bank, a).score, 1000);
  const b = newAttempt(bank, { title: 't', examId: 'x', mode: 'sim', qids });
  assert.equal(finalize(bank, b).score, 0);
});

test('labs score partial credit from the reference solution', () => {
  for (const id of bank.labs) {
    const q = bank.byId[id];
    assert.equal(scoreQuestion(q, { log: q.lab.solution }).correct, true, id);
  }
});
