// Checks the Supabase side of accounts against a running instance: row-level
// security, the size and row caps, and self-service account deletion.
// It needs the secret key, which never leaves the server, so run it there:
//
//   docker run --rm --network host -v "$PWD":/work -v ~/supabase/.env:/sb.env:ro -w /work \
//     -e SB_ENV=/sb.env node:22-alpine sh -c "npm i --silent --no-save @supabase/supabase-js@2.118.0 && node check.mjs"
//
// It creates two throwaway users and deletes them again at the end.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';

const env = {};
for (const line of readFileSync(process.env.SB_ENV, 'utf8').split('\n')) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m) env[m[1]] = m[2];
}
const URL = process.env.SB_URL || 'http://127.0.0.1:8000';
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(URL, env.SUPABASE_SECRET_KEY, opts);
const visitor = () => createClient(URL, env.SUPABASE_PUBLISHABLE_KEY, opts);

const stamp = Date.now().toString(36);
const made = [];
let failures = 0;

async function step(name, fn) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${name}: ${e.message}`);
  }
}

async function makeUser(tag) {
  const email = `check-${tag}-${stamp}@example.com`;
  const password = randomBytes(18).toString('base64url');
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  made.push(data.user.id);
  const c = visitor();
  const r = await c.auth.signInWithPassword({ email, password });
  if (r.error) throw r.error;
  return { c, id: data.user.id };
}

const attempt = (id, extra = {}) => ({ id, status: 'active', qids: ['q1', 'q2'], answers: {}, ...extra });

const A = await makeUser('a');
const B = await makeUser('b');
const aid = `chk${stamp}`;

await step('owner can save and read an attempt', async () => {
  const w = await A.c.from('ccna_attempts').upsert({ user_id: A.id, id: aid, status: 'active', data: attempt(aid) }, { onConflict: 'user_id,id' });
  assert.equal(w.error, null);
  const r = await A.c.from('ccna_attempts').select('id, data').eq('id', aid);
  assert.equal(r.error, null);
  assert.equal(r.data.length, 1);
  assert.deepEqual(r.data[0].data.qids, ['q1', 'q2']);
});

await step('saving again updates the row and its timestamp', async () => {
  const before = (await A.c.from('ccna_attempts').select('updated_at').eq('id', aid).single()).data.updated_at;
  await new Promise(r => setTimeout(r, 30));
  const w = await A.c.from('ccna_attempts').upsert({ user_id: A.id, id: aid, status: 'done', data: attempt(aid, { status: 'done' }) }, { onConflict: 'user_id,id' });
  assert.equal(w.error, null);
  const after = (await A.c.from('ccna_attempts').select('status, updated_at').eq('id', aid).single()).data;
  assert.equal(after.status, 'done');
  assert.ok(new Date(after.updated_at) > new Date(before));
});

await step('owner can flag a question and save study ticks', async () => {
  assert.equal((await A.c.from('ccna_flags').upsert({ user_id: A.id, qid: 'D1-001' }, { onConflict: 'user_id,qid', ignoreDuplicates: true })).error, null);
  assert.equal((await A.c.from('ccna_flags').upsert({ user_id: A.id, qid: 'D1-001' }, { onConflict: 'user_id,qid', ignoreDuplicates: true })).error, null);
  assert.equal((await A.c.from('ccna_study').upsert({ user_id: A.id, progress: { '1-0': true } }, { onConflict: 'user_id' })).error, null);
  assert.equal((await A.c.from('ccna_flags').select('qid')).data.length, 1);
});

await step('another user sees none of it', async () => {
  for (const t of ['ccna_attempts', 'ccna_flags', 'ccna_study']) {
    const r = await B.c.from(t).select('*');
    assert.equal(r.error, null, t);
    assert.equal(r.data.length, 0, t);
  }
});

await step('another user cannot write rows as the owner', async () => {
  const w = await B.c.from('ccna_attempts').insert({ user_id: A.id, id: `x${stamp}`, status: 'active', data: attempt(`x${stamp}`) });
  assert.ok(w.error, 'insert as someone else should fail');
});

await step('another user cannot change or delete the owner\'s rows', async () => {
  await B.c.from('ccna_attempts').update({ status: 'hacked' }).eq('id', aid);
  await B.c.from('ccna_attempts').delete().eq('id', aid);
  const r = await A.c.from('ccna_attempts').select('status').eq('id', aid).single();
  assert.equal(r.data.status, 'done');
});

await step('visitors who are not signed in get no access', async () => {
  for (const t of ['ccna_attempts', 'ccna_flags', 'ccna_study']) {
    const r = await visitor().from(t).select('*');
    assert.ok(r.error, `${t} should refuse anon`);
  }
  const w = await visitor().from('ccna_attempts').insert({ user_id: A.id, id: `y${stamp}`, status: 'active', data: {} });
  assert.ok(w.error, 'anon insert should fail');
});

await step('oversized attempts are refused', async () => {
  const big = attempt(`big${stamp}`, { pad: 'x'.repeat(2_300_000) });
  const w = await A.c.from('ccna_attempts').upsert({ user_id: A.id, id: big.id, status: 'active', data: big }, { onConflict: 'user_id,id' });
  assert.ok(w.error, 'a 2.3 MB attempt should fail');
});

await step('a user cannot store more than 1000 attempts', async () => {
  const rows = [];
  for (let i = 0; i < 999; i++) rows.push({ user_id: A.id, id: `cap${i}x${stamp}`, status: 'done', data: { id: `cap${i}`, qids: [] } });
  const fill = await A.c.from('ccna_attempts').insert(rows);
  assert.equal(fill.error, null, fill.error && fill.error.message);
  const over = await A.c.from('ccna_attempts').insert({ user_id: A.id, id: `over${stamp}`, status: 'done', data: { qids: [] } });
  assert.ok(over.error, 'the 1001st attempt should fail');
});

await step('a user can delete their own account, and their data goes with it', async () => {
  assert.equal((await B.c.from('ccna_flags').insert({ user_id: B.id, qid: 'D2-001' })).error, null);
  const r = await B.c.rpc('ccna_delete_account');
  assert.equal(r.error, null, r.error && r.error.message);
  const u = await admin.auth.admin.getUserById(B.id);
  assert.ok(u.error || !u.data.user, 'user should be gone');
  const left = await admin.from('ccna_flags').select('qid').eq('user_id', B.id);
  assert.equal(left.data.length, 0);
  made.splice(made.indexOf(B.id), 1);
});

await step('visitors cannot call account deletion', async () => {
  const r = await visitor().rpc('ccna_delete_account');
  assert.ok(r.error);
});

for (const id of made) await admin.auth.admin.deleteUser(id);
const leftovers = await admin.from('ccna_attempts').select('id', { count: 'exact', head: true }).eq('user_id', A.id);
console.log(`cleanup: ${made.length} user(s) deleted, ${leftovers.count} row(s) left`);
console.log(failures ? `${failures} check(s) FAILED` : 'all checks passed');
process.exit(failures ? 1 : 0);
