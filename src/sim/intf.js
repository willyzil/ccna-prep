// Interface naming: abbreviations, canonical names, ordering and ranges.

export const TYPES = [
  { full: 'GigabitEthernet', short: 'Gi', bw: 1000000 },
  { full: 'FastEthernet', short: 'Fa', bw: 100000 },
  { full: 'TenGigabitEthernet', short: 'Te', bw: 10000000 },
  { full: 'Ethernet', short: 'Et', bw: 10000 },
  { full: 'Serial', short: 'Se', bw: 1544 },
  { full: 'Loopback', short: 'Lo', bw: 8000000 },
  { full: 'Port-channel', short: 'Po', bw: 2000000 },
  { full: 'Vlan', short: 'Vl', bw: 1000000 },
  { full: 'Tunnel', short: 'Tu', bw: 100 },
];

const ORDER = ['Loopback', 'Tunnel', 'Port-channel', 'Ethernet', 'FastEthernet', 'GigabitEthernet', 'TenGigabitEthernet', 'Serial', 'Vlan'];

export function typeFor(word) {
  const w = word.toLowerCase();
  const exact = TYPES.find(t => t.full.toLowerCase() === w);
  if (exact) return exact;
  const hits = TYPES.filter(t => t.full.toLowerCase().startsWith(w));
  return hits.length === 1 ? hits[0] : null;
}

export function isTypePrefix(word) {
  return /^[a-zA-Z-]+$/.test(word) && typeFor(word) !== null;
}

// "g0/0", "Gig 0/0.10", "lo0" -> { type, num, full, short } or null.
export function parseIntf(text) {
  const m = String(text).trim().match(/^([a-zA-Z-]+)\s*(\d+(?:\/\d+){0,2}(?:\.\d+)?)$/);
  if (!m) return null;
  const t = typeFor(m[1]);
  if (!t) return null;
  return { type: t.full, num: m[2], full: t.full + m[2], short: t.short + m[2] };
}

export function shortName(full) {
  const p = parseIntf(full);
  return p ? p.short : full;
}

export function typeOf(full) {
  const p = parseIntf(full);
  return p ? p.type : null;
}

export function defaultBw(full) {
  const t = TYPES.find(x => x.full === typeOf(full));
  return t ? t.bw : 1000000;
}

export function isSubif(full) {
  return /\.\d+$/.test(full);
}

export function parentOf(full) {
  return full.replace(/\.\d+$/, '');
}

function numKey(num) {
  return num.split(/[/.]/).map(n => String(n).padStart(5, '0')).join('.');
}

export function compareIntf(a, b) {
  const pa = parseIntf(a), pb = parseIntf(b);
  const oa = ORDER.indexOf(pa.type), ob = ORDER.indexOf(pb.type);
  if (oa !== ob) return oa - ob;
  const ka = numKey(pa.num), kb = numKey(pb.num);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

// Expands "f0/1 - 5, g0/1" into full names. Returns { list } or { error }.
export function expandRange(text) {
  const out = [];
  for (const raw of String(text).split(',')) {
    const part = raw.trim();
    if (!part) return { error: true };
    const m = part.match(/^(.+?)\s*-\s*(\d+)$/);
    if (m && !/^[a-zA-Z-]+$/.test(m[1])) {
      const start = parseIntf(m[1]);
      if (!start) return { error: true };
      const nums = start.num.split('/');
      const first = Number(nums[nums.length - 1]);
      const last = Number(m[2]);
      if (last < first) return { error: true };
      for (let i = first; i <= last; i++) {
        const num = [...nums.slice(0, -1), i].join('/');
        out.push(start.type + num);
      }
    } else {
      const p = parseIntf(part);
      if (!p) return { error: true };
      out.push(p.full);
    }
  }
  return { list: out };
}

// Device interface sets by model.
export function portsFor(model) {
  const r = (prefix, a, b) => Array.from({ length: b - a + 1 }, (_, i) => `${prefix}${a + i}`);
  switch (model) {
    case 'router':
      return [...r('GigabitEthernet0/', 0, 2), ...r('Serial0/0/', 0, 1)];
    case 'switch':
      return [...r('FastEthernet0/', 1, 24), ...r('GigabitEthernet0/', 1, 2)];
    case 'l3switch':
      return [...r('GigabitEthernet1/0/', 1, 24), ...r('GigabitEthernet1/1/', 1, 4)];
    case 'host':
    case 'server':
      return ['FastEthernet0'];
    default:
      return [];
  }
}

export const PLATFORM = {
  router: 'CISCO2911/K9',
  switch: 'WS-C2960-24TT-L',
  l3switch: 'WS-C3650-24PS',
  host: 'PC',
  server: 'Server',
};
