// Command grammar: patterns compile into a keyword tree that supports
// IOS-style abbreviations, "?" help and tab completion.
import { parseV4, parseV6, parseV6Prefix, parseList } from './addr.js';
import { parseIntf, isTypePrefix } from './intf.js';

// Splits a pattern into elements, expanding [optional] tails into variants.
function expand(pattern) {
  const toks = [];
  let i = 0;
  const s = pattern.trim();
  while (i < s.length) {
    if (s[i] === ' ') { i++; continue; }
    if (s[i] === '[') {
      let depth = 0, j = i;
      for (; j < s.length; j++) {
        if (s[j] === '[') depth++;
        if (s[j] === ']' && --depth === 0) break;
      }
      toks.push({ opt: s.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    let j = i;
    if (s[i] === '{') j = s.indexOf('}', i) + 1;
    else while (j < s.length && s[j] !== ' ') j++;
    toks.push(s.slice(i, j));
    i = j;
  }
  let variants = [[]];
  for (const t of toks) {
    if (typeof t === 'object') {
      const inner = expand(t.opt);
      variants = variants.flatMap(v => [v, ...inner.map(x => [...v, ...x])]);
    } else variants = variants.map(v => [...v, t]);
  }
  return variants;
}

function newNode() {
  return { lits: new Map(), params: [], end: null };
}

export function buildTree(defs) {
  const root = newNode();
  for (const [pattern, handler, help] of defs) {
    for (const elems of expand(pattern)) {
      let node = root;
      for (const el of elems) {
        if (el.startsWith('<')) {
          let p = node.params.find(x => x.type === el);
          if (!p) { p = { type: el, node: newNode() }; node.params.push(p); }
          node = p.node;
        } else {
          const words = (el.startsWith('{') ? el.slice(1, -1).split('|') : [el]).map(w => w.toLowerCase());
          let next = null;
          for (const w of words) if (node.lits.has(w)) next = node.lits.get(w);
          if (!next) next = newNode();
          for (const w of words) if (!node.lits.has(w)) node.lits.set(w, next);
          node = next;
        }
      }
      if (!node.end) node.end = { handler, help };
    }
  }
  return root;
}

// Tokenises keeping column offsets (for the ^ marker and raw remainders).
export function tokenize(line) {
  const toks = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(line))) toks.push({ text: m[0], col: m.index });
  return toks;
}

const PARAM_HELP = {
  '<ip>': ['A.B.C.D', 'IP address'],
  '<mask>': ['A.B.C.D', 'Mask'],
  '<wild>': ['A.B.C.D', 'Wildcard bits'],
  '<num>': ['<0-4294967295>', 'Number'],
  '<word>': ['WORD', 'Name or string'],
  '<line>': ['LINE', 'Text'],
  '<intf>': ['<interface>', 'Interface name, e.g. GigabitEthernet0/0'],
  '<v6pfx>': ['X:X:X:X::X/<0-128>', 'IPv6 prefix'],
  '<v6>': ['X:X:X:X::X', 'IPv6 address'],
  '<list>': ['WORD', 'VLAN IDs, e.g. 1,3-5,7'],
  '<host>': ['WORD', 'Destination address or hostname'],
};

function paramHelp(type) {
  const m = type.match(/^<num:(\d+)-(\d+)>$/);
  if (m) return [`<${m[1]}-${m[2]}>`, 'Number'];
  return PARAM_HELP[type] || [type.replace(/[<>]/g, '').toUpperCase(), ''];
}

// Returns { n, value } if the param accepts tokens starting at i.
function matchParam(type, toks, i, line) {
  const t = toks[i].text;
  const num = type.match(/^<num(?::(\d+)-(\d+))?>$/);
  if (num) {
    if (!/^\d+$/.test(t)) return null;
    const v = Number(t);
    if (num[1] !== undefined && (v < Number(num[1]) || v > Number(num[2]))) return null;
    return { n: 1, value: v };
  }
  switch (type) {
    case '<ip>':
    case '<mask>':
    case '<wild>':
      return parseV4(t) === null ? null : { n: 1, value: t };
    case '<word>':
    case '<host>':
      return { n: 1, value: t };
    case '<line>':
      return { n: toks.length - i, value: line.slice(toks[i].col).trimEnd() };
    case '<v6>':
      return parseV6(t) === null ? null : { n: 1, value: t };
    case '<v6pfx>':
      return parseV6Prefix(t) === null ? null : { n: 1, value: t };
    case '<list>':
      return parseList(t) === null ? null : { n: 1, value: t };
    case '<intf>': {
      const one = parseIntf(t);
      if (one) return { n: 1, value: one.full };
      if (isTypePrefix(t) && toks[i + 1]) {
        const two = parseIntf(t + toks[i + 1].text);
        if (two) return { n: 2, value: two.full };
      }
      return null;
    }
    default:
      return null;
  }
}

// Walks the tree. Result kinds: ok | incomplete | ambiguous | invalid.
export function match(root, line) {
  const toks = tokenize(line);
  let furthest = 0;
  function walk(node, i, vals) {
    if (i === toks.length) {
      return node.end ? { kind: 'ok', end: node.end, vals } : { kind: 'incomplete' };
    }
    furthest = Math.max(furthest, i);
    const w = toks[i].text.toLowerCase();
    let child = node.lits.get(w);
    let word = w;
    if (!child) {
      const cands = [...node.lits.keys()].filter(k => k.startsWith(w));
      const distinct = new Set(cands.map(k => node.lits.get(k)));
      if (distinct.size > 1 && !node.params.some(p => matchParam(p.type, toks, i, line))) {
        return { kind: 'ambiguous', at: i };
      }
      if (cands.length >= 1 && distinct.size === 1) { child = node.lits.get(cands[0]); word = cands[0]; }
    }
    let fallback = null;
    if (child) {
      const r = walk(child, i + 1, [...vals, word]);
      if (r.kind === 'ok') return r;
      fallback = r;
    }
    for (const p of node.params) {
      const m = matchParam(p.type, toks, i, line);
      if (!m) continue;
      const r = walk(p.node, i + m.n, [...vals, m.value]);
      if (r.kind === 'ok') return r;
      if (!fallback || (fallback.kind === 'invalid' && r.kind !== 'invalid')) fallback = r;
    }
    return fallback || { kind: 'invalid', at: i };
  }
  if (!toks.length) return { kind: 'empty' };
  const r = walk(root, 0, []);
  if (r.kind === 'invalid') r.at = Math.max(r.at, 0);
  r.toks = toks;
  r.furthest = furthest;
  return r;
}

// Finds the node reached by fully-typed tokens, for "?" and completion.
function nodeAfter(root, toks, line) {
  let nodes = [root];
  for (let i = 0; i < toks.length;) {
    const next = [];
    let step = 1;
    for (const n of nodes) {
      const w = toks[i].text.toLowerCase();
      const cands = n.lits.has(w) ? [w] : [...n.lits.keys()].filter(k => k.startsWith(w));
      const uniq = new Set(cands.map(k => n.lits.get(k)));
      if (uniq.size === 1) next.push(n.lits.get(cands[0]));
      for (const p of n.params) {
        const m = matchParam(p.type, toks, i, line);
        if (m) { next.push(p.node); step = Math.max(step, m.n); }
      }
    }
    if (!next.length) return [];
    nodes = next;
    i += step;
  }
  return nodes;
}

export function helpFor(root, line, HELP) {
  const endsSpace = /\s$/.test(line) || line === '';
  const toks = tokenize(line);
  if (endsSpace) {
    const nodes = nodeAfter(root, toks, line);
    if (!nodes.length) return null;
    const rows = [];
    for (const n of nodes) {
      for (const w of [...n.lits.keys()].sort()) if (!rows.some(r => r[0] === w)) rows.push([w, HELP[w] || '']);
      for (const p of n.params) {
        const [a, b] = paramHelp(p.type);
        if (!rows.some(r => r[0] === a)) rows.push([a, b]);
      }
      if (n.end && !rows.some(r => r[0] === '<cr>')) rows.push(['<cr>', '']);
    }
    const width = Math.max(...rows.map(r => r[0].length)) + 2;
    return rows.map(([a, b]) => `  ${a.padEnd(width)}${b}`).join('\n');
  }
  // Word completion help: "sh?" lists keywords starting with "sh".
  const last = toks[toks.length - 1].text.toLowerCase();
  const nodes = nodeAfter(root, toks.slice(0, -1), line);
  const words = new Set();
  for (const n of nodes) for (const w of n.lits.keys()) if (w.startsWith(last)) words.add(w);
  if (!words.size) return null;
  return [...words].sort().join('  ');
}

export function complete(root, line) {
  if (/\s$/.test(line) || !line) return null;
  const toks = tokenize(line);
  const last = toks[toks.length - 1];
  const nodes = nodeAfter(root, toks.slice(0, -1), line);
  const words = new Set();
  for (const n of nodes) for (const w of n.lits.keys()) if (w.startsWith(last.text.toLowerCase())) words.add(w);
  if (words.size !== 1) return null;
  const [w] = words;
  return line.slice(0, last.col) + w + ' ';
}
