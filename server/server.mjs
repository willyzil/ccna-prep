// Serves the built SPA and a small JSON API backed by SQLite (node:sqlite).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { computeStats, summarise } from '../src/exam/stats.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DIST || path.join(here, '..', 'dist');
const DATA = process.env.DATA_DIR || path.join(here, '..', 'data');
const PORT = Number(process.env.PORT || 8080);
const MAX_BODY = 8 * 1024 * 1024;

if (!existsSync(DATA)) mkdirSync(DATA, { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'ccna.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    status TEXT NOT NULL,
    updated INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS flags (
    qid TEXT PRIMARY KEY,
    created INTEGER NOT NULL
  );
`);

const q = {
  all: db.prepare('SELECT json FROM attempts ORDER BY updated DESC'),
  get: db.prepare('SELECT json FROM attempts WHERE id = ?'),
  put: db.prepare('INSERT INTO attempts (id, json, status, updated) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json, status = excluded.status, updated = excluded.updated'),
  del: db.prepare('DELETE FROM attempts WHERE id = ?'),
  flags: db.prepare('SELECT qid FROM flags'),
  flagOn: db.prepare('INSERT OR IGNORE INTO flags (qid, created) VALUES (?, ?)'),
  flagOff: db.prepare('DELETE FROM flags WHERE qid = ?'),
};

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2',
};

function send(res, code, body, headers = {}) {
  const data = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const allAttempts = () => q.all.all().map(r => JSON.parse(r.json));

async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1);
  if (parts[0] === 'health') return send(res, 200, { ok: true });
  if (parts[0] === 'attempts' && !parts[1] && req.method === 'GET') {
    return send(res, 200, allAttempts().map(summarise));
  }
  if (parts[0] === 'attempts' && parts[1]) {
    const id = parts[1];
    if (!/^[a-z0-9]{6,40}$/i.test(id)) return send(res, 400, { error: 'bad id' });
    if (req.method === 'GET') {
      const row = q.get.get(id);
      return row ? send(res, 200, row.json) : send(res, 404, { error: 'not found' });
    }
    if (req.method === 'PUT') {
      let a;
      try { a = JSON.parse(await readBody(req)); } catch { return send(res, 400, { error: 'bad json' }); }
      if (!a || a.id !== id || !Array.isArray(a.qids)) return send(res, 400, { error: 'bad attempt' });
      q.put.run(id, JSON.stringify(a), String(a.status || 'active'), Date.now());
      return send(res, 200, { ok: true });
    }
    if (req.method === 'DELETE') {
      q.del.run(id);
      return send(res, 204, '');
    }
  }
  if (parts[0] === 'stats' && req.method === 'GET') {
    return send(res, 200, { q: computeStats(allAttempts()), flags: q.flags.all().map(r => r.qid) });
  }
  if (parts[0] === 'flags' && parts[1] && req.method === 'PUT') {
    const qid = decodeURIComponent(parts[1]);
    let body;
    try { body = JSON.parse(await readBody(req)); } catch { return send(res, 400, { error: 'bad json' }); }
    if (body.on) q.flagOn.run(qid, Date.now()); else q.flagOff.run(qid);
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: 'no such endpoint' });
}

async function staticFile(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p.includes('..')) return send(res, 400, { error: 'bad path' });
  let file = path.join(DIST, p);
  try {
    const st = await stat(file);
    if (st.isDirectory()) file = path.join(file, 'index.html');
  } catch {
    file = path.join(DIST, 'index.html');
  }
  try {
    const data = await readFile(file);
    const ext = path.extname(file);
    const cache = file.endsWith('index.html') ? 'no-store' : p.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': cache });
    res.end(data);
  } catch {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await staticFile(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'server error' });
  }
});

server.listen(PORT, () => console.log(`ccna-prep listening on :${PORT}, data in ${DATA}`));
