import { test } from 'node:test';
import assert from 'node:assert/strict';
import labs from '../src/bank/labs.js';
import { Lab, gradeLab } from '../src/sim/lab.js';

for (const q of labs) {
  test(`${q.id}: devices build without config errors`, () => {
    const lab = new Lab(q.lab);
    assert.ok(Object.keys(lab.devs).length > 0);
  });
  if (q.type !== 'lab') continue;
  test(`${q.id}: starting state fails every task`, () => {
    const res = gradeLab(q.lab, []);
    const passing = res.filter(r => r.ok).map(r => r.text);
    assert.deepEqual(passing, [], `tasks already passing: ${passing.join(' | ')}`);
  });
  test(`${q.id}: reference solution passes every task`, () => {
    const lab = new Lab(q.lab);
    lab.replay(q.lab.solution);
    const errors = Object.values(lab.consoles).flatMap(c => c.buf.filter(l => /^% (Invalid|Incomplete|Ambiguous)|Command rejected|overlaps|Bad mask/.test(l)));
    assert.deepEqual(errors, [], 'solution produced CLI errors');
    const res = gradeLab(q.lab, q.lab.solution);
    const failing = res.filter(r => !r.ok).map(r => r.text);
    assert.deepEqual(failing, [], `failing: ${failing.join(' | ')}`);
  });
}
