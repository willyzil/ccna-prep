// ACL entry parsing and IOS-style rendering.
import { parseV4, fmtV4 } from './addr.js';

const TCP_PORTS = {
  bgp: 179, domain: 53, echo: 7, finger: 79, ftp: 21, 'ftp-data': 20, pop3: 110, smtp: 25,
  sunrpc: 111, tacacs: 49, telnet: 23, www: 80, ident: 113, nntp: 119, lpd: 515, whois: 43,
};
const UDP_PORTS = {
  bootpc: 68, bootps: 67, domain: 53, echo: 7, isakmp: 500, ntp: 123, rip: 520, snmp: 161,
  snmptrap: 162, syslog: 514, tacacs: 49, tftp: 69, 'netbios-ns': 137, 'netbios-dgm': 138,
};
const ICMP_TYPES = ['echo', 'echo-reply', 'unreachable', 'time-exceeded', 'redirect', 'packet-too-big'];
const PROTOS = ['ip', 'icmp', 'tcp', 'udp', 'ospf', 'eigrp', 'gre', 'esp', 'ahp', 'pim', 'igmp'];

export function isStandardNum(n) {
  n = Number(n);
  return (n >= 1 && n <= 99) || (n >= 1300 && n <= 1999);
}
export function isExtendedNum(n) {
  n = Number(n);
  return (n >= 100 && n <= 199) || (n >= 2000 && n <= 2699);
}

function portName(proto, p) {
  const table = proto === 'tcp' ? TCP_PORTS : UDP_PORTS;
  const hit = Object.entries(table).find(([, v]) => v === p);
  return hit ? hit[0] : String(p);
}

function parsePort(proto, tok) {
  if (tok === undefined) return null;
  if (/^\d+$/.test(tok)) { const n = Number(tok); return n <= 65535 ? n : null; }
  const table = proto === 'tcp' ? TCP_PORTS : UDP_PORTS;
  const t = tok.toLowerCase();
  if (t in table) return table[t];
  const hits = Object.keys(table).filter(k => k.startsWith(t));
  return hits.length === 1 ? table[hits[0]] : null;
}

// Address spec at toks[i]: any | host A | A W. Standard ACLs allow a bare A.
function parseAddr(toks, i, standard) {
  const t = (toks[i] || '').toLowerCase();
  if (t === 'any') return { spec: { addr: 0n, wild: 0xffffffffn, any: true }, n: 1 };
  if (t === 'host') {
    const a = parseV4(toks[i + 1]);
    if (a === null) return null;
    return { spec: { addr: a, wild: 0n, host: true }, n: 2 };
  }
  const a = parseV4(toks[i]);
  if (a === null) return null;
  const w = parseV4(toks[i + 1]);
  if (w === null) {
    if (!standard) return null;
    return { spec: { addr: a, wild: 0n, host: true }, n: 1 };
  }
  const addr = a & (w ^ 0xffffffffn);
  return { spec: { addr, wild: w, host: w === 0n }, n: 2 };
}

function addrText(spec, standard, forShow) {
  if (spec.any) return 'any';
  if (spec.wild === 0n) return standard ? fmtV4(spec.addr) : `host ${fmtV4(spec.addr)}`;
  if (standard && forShow) return `${fmtV4(spec.addr)}, wildcard bits ${fmtV4(spec.wild)}`;
  return `${fmtV4(spec.addr)} ${fmtV4(spec.wild)}`;
}

function portText(proto, p) {
  if (!p) return '';
  if (p.op === 'range') return ` range ${portName(proto, p.ports[0])} ${portName(proto, p.ports[1])}`;
  return ` ${p.op} ${p.ports.map(x => portName(proto, x)).join(' ')}`;
}

function parsePortSpec(proto, toks, i) {
  const op = (toks[i] || '').toLowerCase();
  if (!['eq', 'neq', 'gt', 'lt', 'range'].includes(op)) return { spec: null, n: 0 };
  if (op === 'range') {
    const a = parsePort(proto, toks[i + 1]), b = parsePort(proto, toks[i + 2]);
    if (a === null || b === null) return null;
    return { spec: { op, ports: [a, b] }, n: 3 };
  }
  const a = parsePort(proto, toks[i + 1]);
  if (a === null) return null;
  return { spec: { op, ports: [a] }, n: 2 };
}

// Parses "permit 10.0.0.0 0.0.0.255 log" style text. Returns entry or { error }.
export function parseAce(type, action, text) {
  const toks = text.trim().split(/\s+/).filter(Boolean);
  const e = { type, action };
  let i = 0;
  if (type === 'standard') {
    const a = parseAddr(toks, i, true);
    if (!a) return { error: i };
    e.src = a.spec;
    i += a.n;
  } else {
    let proto = (toks[i] || '').toLowerCase();
    if (!PROTOS.includes(proto)) {
      const hits = PROTOS.filter(p => p.startsWith(proto));
      if (hits.length === 1 && proto) proto = hits[0];
      else if (!/^\d+$/.test(proto)) return { error: i };
    }
    e.proto = proto;
    i++;
    const s = parseAddr(toks, i, false);
    if (!s) return { error: i };
    e.src = s.spec;
    i += s.n;
    if (proto === 'tcp' || proto === 'udp') {
      const sp = parsePortSpec(proto, toks, i);
      if (!sp) return { error: i };
      e.sport = sp.spec;
      i += sp.n;
    }
    const d = parseAddr(toks, i, false);
    if (!d) return { error: i };
    e.dst = d.spec;
    i += d.n;
    if (proto === 'tcp' || proto === 'udp') {
      const dp = parsePortSpec(proto, toks, i);
      if (!dp) return { error: i };
      e.dport = dp.spec;
      i += dp.n;
    }
    if (proto === 'icmp' && toks[i] && ICMP_TYPES.includes(toks[i].toLowerCase())) { e.icmpType = toks[i].toLowerCase(); i++; }
    if (proto === 'tcp' && toks[i] && 'established'.startsWith(toks[i].toLowerCase()) && toks[i].length >= 3) { e.established = true; i++; }
  }
  if (toks[i] && toks[i].toLowerCase() === 'log') { e.log = true; i++; }
  if (i < toks.length) return { error: i };
  e.text = renderAce(e, false);
  e.show = renderAce(e, true);
  return e;
}

export function renderAce(e, forShow) {
  if (e.type === 'standard') return `${e.action} ${addrText(e.src, true, forShow)}${e.log ? ' log' : ''}`;
  let t = `${e.action} ${e.proto} ${addrText(e.src, false)}${portText(e.proto, e.sport)} ${addrText(e.dst, false)}${portText(e.proto, e.dport)}`;
  if (e.icmpType) t += ` ${e.icmpType}`;
  if (e.established) t += ' established';
  if (e.log) t += ' log';
  return t;
}

export function addEntry(acl, entry, seq) {
  if (seq === undefined || seq === null) {
    const last = acl.entries.length ? acl.entries[acl.entries.length - 1].seq : 0;
    seq = Math.floor(last / 10) * 10 + 10;
  }
  if (acl.entries.some(x => x.seq === seq)) return `% Duplicate sequence number`;
  // IOS refuses an exact duplicate entry silently.
  if (entry.text && acl.entries.some(x => x.text === entry.text)) return null;
  entry.seq = seq;
  acl.entries.push(entry);
  acl.entries.sort((a, b) => a.seq - b.seq);
  return null;
}
