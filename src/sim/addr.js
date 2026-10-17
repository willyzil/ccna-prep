// Address helpers. IPv4 and IPv6 addresses are both held as BigInt so the
// routing code can treat the two families the same way.

export const BITS = { 4: 32, 6: 128 };

export function parseV4(s) {
  if (typeof s !== 'string') return null;
  const m = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  let n = 0n;
  for (let i = 1; i <= 4; i++) {
    const o = Number(m[i]);
    if (o > 255) return null;
    n = (n << 8n) | BigInt(o);
  }
  return n;
}

export function fmtV4(n) {
  n = BigInt(n);
  return [24n, 16n, 8n, 0n].map(s => String((n >> s) & 255n)).join('.');
}

export function maskOf(len, fam = 4) {
  const bits = BigInt(BITS[fam]);
  if (len <= 0) return 0n;
  return ((1n << bits) - 1n) ^ ((1n << (bits - BigInt(len))) - 1n);
}

export function lenToMask(len) {
  return fmtV4(maskOf(len, 4));
}

// Dotted mask -> prefix length, or null when the bits are not contiguous.
export function maskToLen(s) {
  const n = typeof s === 'bigint' ? s : parseV4(s);
  if (n === null) return null;
  for (let len = 0; len <= 32; len++) if (maskOf(len, 4) === n) return len;
  return null;
}

// Wildcard -> prefix length when it is the inverse of a contiguous mask.
export function wildToLen(s) {
  const n = parseV4(s);
  if (n === null) return null;
  return maskToLen(n ^ 0xffffffffn);
}

export function lenToWild(len) {
  return fmtV4(maskOf(len, 4) ^ 0xffffffffn);
}

export function netOf(addr, len, fam = 4) {
  return addr & maskOf(len, fam);
}

export function inPrefix(addr, net, len, fam = 4) {
  return (addr & maskOf(len, fam)) === (net & maskOf(len, fam));
}

export function broadcastOf(addr, len) {
  return netOf(addr, len, 4) | (maskOf(len, 4) ^ 0xffffffffn);
}

// Wildcard match used by ACLs and OSPF network statements.
export function wildMatch(addr, base, wild) {
  const care = wild ^ 0xffffffffn;
  return (addr & care) === (base & care);
}

export function classfulLen(addr) {
  const first = Number(addr >> 24n);
  if (first < 128) return 8;
  if (first < 192) return 16;
  if (first < 224) return 24;
  return 32;
}

export function parseV6(s) {
  if (typeof s !== 'string') return null;
  s = s.trim();
  if (!/^[0-9a-fA-F:]+$/.test(s) || s.length < 2) return null;
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const groups = halves.length === 2 ? head.length + tail.length : head.length;
  if (halves.length === 1 && groups !== 8) return null;
  if (halves.length === 2 && groups > 7) return null;
  const all = [...head, ...Array(8 - groups).fill('0'), ...tail];
  let n = 0n;
  for (const g of all) {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
    n = (n << 16n) | BigInt(parseInt(g, 16));
  }
  return n;
}

// Compressed, upper-case form, the way IOS prints IPv6 addresses.
export function fmtV6(n) {
  n = BigInt(n);
  const g = [];
  for (let i = 7; i >= 0; i--) g.push(Number((n >> BigInt(i * 16)) & 0xffffn));
  let best = -1, bestLen = 0;
  for (let i = 0; i < 8;) {
    if (g[i] !== 0) { i++; continue; }
    let j = i;
    while (j < 8 && g[j] === 0) j++;
    if (j - i > bestLen && j - i > 1) { best = i; bestLen = j - i; }
    i = j;
  }
  const hex = x => x.toString(16).toUpperCase();
  if (best < 0) return g.map(hex).join(':');
  const left = g.slice(0, best).map(hex).join(':');
  const right = g.slice(best + bestLen).map(hex).join(':');
  return `${left}::${right}`;
}

export function parseV6Prefix(s) {
  const m = String(s).match(/^([0-9a-fA-F:]+)\/(\d{1,3})$/);
  if (!m) return null;
  const addr = parseV6(m[1]);
  const len = Number(m[2]);
  if (addr === null || len > 128) return null;
  return { addr, len };
}

export function fmtAddr(n, fam) {
  return fam === 6 ? fmtV6(n) : fmtV4(n);
}

export function parseAny(s) {
  const v4 = parseV4(s);
  if (v4 !== null) return { addr: v4, fam: 4 };
  const v6 = parseV6(s);
  if (v6 !== null) return { addr: v6, fam: 6 };
  return null;
}

// Modified EUI-64 interface ID from a MAC written as 0050.7966.6800.
export function eui64(mac) {
  const hex = mac.replace(/[^0-9a-fA-F]/g, '');
  const b = hex.match(/../g).map(x => parseInt(x, 16));
  b[0] ^= 0x02;
  const bytes = [b[0], b[1], b[2], 0xff, 0xfe, b[3], b[4], b[5]];
  return bytes.reduce((n, x) => (n << 8n) | BigInt(x), 0n);
}

export function linkLocalFor(mac) {
  return (0xfe80n << 112n) | eui64(mac);
}

// Parses "10,20,30-35" into a sorted array of numbers.
export function parseList(s, max = 4094) {
  const out = new Set();
  for (const part of String(s).split(',')) {
    const p = part.trim();
    if (!p) return null;
    const m = p.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) return null;
    const a = Number(m[1]), b = m[2] ? Number(m[2]) : a;
    if (a < 1 || b > max || b < a) return null;
    for (let i = a; i <= b; i++) out.add(i);
  }
  return [...out].sort((x, y) => x - y);
}

// Inverse of parseList: [1,2,3,10] -> "1-3,10".
export function fmtList(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const out = [];
  for (let i = 0; i < a.length;) {
    let j = i;
    while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++;
    out.push(j > i ? `${a[i]}-${a[j]}` : `${a[i]}`);
    i = j + 1;
  }
  return out.join(',');
}
