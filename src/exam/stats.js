// Per-question history derived from finished attempts. Shared by the server
// and the browser's offline fallback, so it must stay dependency-free.
export function computeStats(attempts) {
  const q = {};
  const done = attempts.filter(a => a.status === 'done' && a.result && a.result.perQ)
    .sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));
  for (const a of done) {
    for (const [id, r] of Object.entries(a.result.perQ)) {
      const s = (q[id] ||= { n: 0, right: 0, frac: 0, lastAt: 0, lastRight: false });
      s.n++;
      if (r.correct) s.right++;
      s.frac += r.frac;
      s.lastAt = a.finishedAt || a.updatedAt || 0;
      s.lastRight = !!r.correct;
    }
  }
  return q;
}

export function summarise(a) {
  return {
    id: a.id,
    title: a.title,
    examId: a.examId,
    mode: a.mode,
    strict: a.strict,
    status: a.status,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    finishedAt: a.finishedAt,
    elapsed: a.elapsed,
    nQ: a.qids.length,
    cursor: a.cursor,
    answered: Object.keys(a.answers || {}).length,
    score: a.result ? a.result.score : null,
    pass: a.result ? a.result.pass : null,
    byDomain: a.result ? a.result.byDomain : null,
  };
}
