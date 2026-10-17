// A lab: devices + links + consoles. Every typed line is logged so a lab can
// be rebuilt exactly (resume, grading) by replaying the log.
import { createDevice, runningConfig, section } from './device.js';
import { Net, intfKey, isSwitch, isHost } from './net.js';
import { Console } from './cli.js';
import { parseIntf, shortName } from './intf.js';
import { parseAny, fmtV4, parseV4, parseV6Prefix, netOf } from './addr.js';

function parseEnd(s, devs) {
  const m = String(s).trim().match(/^(\S+)\s+(.+)$/);
  if (!m) throw new Error(`Bad link end "${s}"`);
  const p = parseIntf(m[2]);
  if (!p || !devs[m[1]] || !devs[m[1]].intfs[p.full]) throw new Error(`Unknown link end "${s}"`);
  return { dev: m[1], intf: p.full };
}

export class Lab {
  constructor(def) {
    this.def = def;
    this.clock = 0;
    this.startMode = def.startMode || 'user';
    this.specs = {};
    this.devs = {};
    for (const spec of def.devices) {
      this.specs[spec.name] = spec;
      this.devs[spec.name] = createDevice(spec);
    }
    this.links = (def.links || []).map(([a, b]) => ({ a: parseEnd(a, this.devs), b: parseEnd(b, this.devs) }));
    this.net = new Net(this.devs, this.links);
    this.consoles = {};
    for (const spec of def.devices) if (spec.config) this.applyConfig(spec.name, spec.config);
    this.recompute(true);
    this.consoles = {};
    this.log = [];
  }

  applyConfig(name, text) {
    const c = new Console(this, name);
    const s = c.s;
    s.mode = 'config';
    for (const raw of String(text).split('\n')) {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim() || line.trim() === '!') continue;
      const out = s.run(line.trim());
      if (/% (Invalid|Incomplete|Ambiguous)|overlaps with|Bad mask|Inconsistent/.test(out || '')) {
        throw new Error(`Config error on ${name}: "${line.trim()}" -> ${out}`);
      }
      if (s.mode === 'exec') s.mode = 'config';
      this.net.compute();
    }
  }

  console(name) {
    if (!this.consoles[name]) this.consoles[name] = new Console(this, name);
    return this.consoles[name];
  }

  input(name, line) {
    this.log.push([name, line]);
    this.busy = true;
    this.queued = [];
    this.console(name).input(line);
    this.clock += 4;
    this.recompute();
    this.busy = false;
    for (const [n, msg] of this.queued) this.console(n).buf.push(msg);
    this.queued = [];
  }

  help(name, line) {
    this.console(name).helpText(line);
  }

  complete(name, line) {
    return this.console(name).s.complete(line);
  }

  replay(log) {
    for (const [name, line] of log) this.input(name, line);
  }

  // ------------------------------------------------------------ derived state
  recompute(silent = false) {
    this.net.compute();
    let again = false;
    for (const [dn, o] of Object.entries(this.net.ospf)) {
      if (!o || o.rid === null) continue;
      const p = this.devs[dn].ospf[o.pid];
      if (p && (p.activeRid === null || p.activeRid === undefined)) { p.activeRid = o.rid; again = true; }
    }
    if (this.portSecurity(silent)) again = true;
    if (again) this.net.compute();
    if (!silent) this.diffLogs();
    this.snap = this.snapshotState();
  }

  portSecurity(silent) {
    let changed = false;
    for (const [dn, d] of Object.entries(this.devs)) {
      if (!isSwitch(d)) continue;
      let table = null;
      for (const i of Object.values(d.intfs)) {
        const ps = i.ps;
        if (!ps || !ps.enabled || i.errDisabled || i.shutdown) continue;
        if (!this.net.isUp(dn, i.name)) continue;
        table ||= this.net.macTable(dn);
        const learned = [...new Set(table.filter(m => m.port === i.name).map(m => m.mac))];
        if (ps.sticky) {
          for (const m of learned) if (!ps.macs.includes(m) && ps.macs.length < ps.max) ps.macs.push(m);
        }
        const secure = [...ps.macs];
        for (const m of learned) if (!secure.includes(m) && secure.length < ps.max) secure.push(m);
        const bad = learned.filter(m => !secure.includes(m));
        const key = bad.join(',');
        if (!bad.length) { ps.flagged = ''; continue; }
        if (ps.flagged === key && ps.violation !== 'shutdown') continue;
        ps.flagged = key;
        if (ps.violation === 'protect') continue;
        ps.violations = (ps.violations || 0) + 1;
        const vlan = (table.find(m => m.mac === bad[0]) || {}).vlan || 1;
        if (!silent) this.logTo(dn, `%PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address ${bad[0]} on port ${i.name}.`);
        if (ps.violation === 'shutdown') {
          if (!silent) this.logTo(dn, `%PM-4-ERR_DISABLE: psecure-violation error detected on ${shortName(i.name)}, putting ${shortName(i.name)} in err-disable state`);
          i.errDisabled = true;
          changed = true;
        }
        void vlan;
      }
    }
    return changed;
  }

  snapshotState() {
    const st = {};
    const ospf = {};
    const native = new Set();
    const dup = new Set();
    for (const [dn, d] of Object.entries(this.devs)) {
      if (isHost(d)) continue;
      st[dn] = {};
      for (const i of Object.values(d.intfs)) {
        const s = this.net.status(dn, i.name);
        st[dn][i.name] = `${s.admin}|${s.proto}`;
      }
      ospf[dn] = new Set(this.net.ospfNeighbors(dn).filter(n => n.state === 'FULL').map(n => `${fmtV4(n.rid)}|${n.intf}`));
    }
    for (const l of this.links) {
      const A = this.devs[l.a.dev], B = this.devs[l.b.dev];
      const ia = A.intfs[l.a.intf], ib = B.intfs[l.b.intf];
      if (!isSwitch(A) || !isSwitch(B) || !ia.sw || !ib.sw) continue;
      if (!this.net.trunk[intfKey(l.a.dev, l.a.intf)] || !this.net.trunk[intfKey(l.b.dev, l.b.intf)]) continue;
      const na = this.net.swOf(l.a.dev, ia).native, nb = this.net.swOf(l.b.dev, ib).native;
      if (na !== nb && this.net.physUp(l.a.dev, l.a.intf)) {
        native.add(`${l.a.dev}|${l.a.intf}|${na}|${B.hostname}|${l.b.intf}|${nb}`);
        native.add(`${l.b.dev}|${l.b.intf}|${nb}|${A.hostname}|${l.a.intf}|${na}`);
      }
    }
    const seen = new Map();
    for (const [dn, list] of Object.entries(this.net.l3)) {
      for (const a of list) {
        if (a.fam !== 4 || !a.up) continue;
        const k = `${a.seg}|${a.addr}`;
        if (seen.has(k) && seen.get(k).dev !== dn) {
          const o = seen.get(k);
          dup.add(`${dn}|${a.intf}|${fmtV4(a.addr)}|${this.devs[o.dev].intfs[o.intf].mac}`);
          dup.add(`${o.dev}|${o.intf}|${fmtV4(a.addr)}|${this.devs[dn].intfs[a.intf].mac}`);
        } else seen.set(k, { dev: dn, intf: a.intf });
      }
    }
    return { st, ospf, native, dup };
  }

  diffLogs() {
    const prev = this.snap;
    const cur = this.snapshotState();
    if (!prev) return;
    for (const [dn, intfs] of Object.entries(cur.st)) {
      const pmap = prev.st[dn] || {};
      for (const [name, now] of Object.entries(intfs)) {
        const was = pmap[name] || 'down|down';
        if (was === now) continue;
        const [wa, wp] = was.split('|');
        const [na, np] = now.split('|');
        const sub = /\.\d+$/.test(name);
        if (wa !== na) {
          if (na === 'administratively down') this.logTo(dn, `%LINK-5-CHANGED: Interface ${name}, changed state to administratively down`);
          else if (!sub) this.logTo(dn, `%LINK-3-UPDOWN: Interface ${name}, changed state to ${na === 'up' ? 'up' : 'down'}`);
        }
        if (wp !== np && !sub) this.logTo(dn, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${name}, changed state to ${np}`);
      }
    }
    for (const [dn, set] of Object.entries(cur.ospf)) {
      const before = prev.ospf[dn] || new Set();
      const pid = (this.net.ospf[dn] || {}).pid || Object.keys(this.devs[dn].ospf)[0] || 1;
      for (const k of set) {
        if (before.has(k)) continue;
        const [rid, intf] = k.split('|');
        this.logTo(dn, `%OSPF-5-ADJCHG: Process ${pid}, Nbr ${rid} on ${intf} from LOADING to FULL, Loading Done`);
      }
      for (const k of before) {
        if (set.has(k)) continue;
        const [rid, intf] = k.split('|');
        const down = !this.net.isUp(dn, intf);
        this.logTo(dn, `%OSPF-5-ADJCHG: Process ${pid}, Nbr ${rid} on ${intf} from FULL to DOWN, Neighbor Down: ${down ? 'Interface down or detached' : 'Dead timer expired'}`);
      }
    }
    for (const k of cur.native) {
      if (prev.native.has(k)) continue;
      const [dn, intf, v, ph, pi, pv] = k.split('|');
      this.logTo(dn, `%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on ${intf} (${v}), with ${ph} ${pi} (${pv}).`);
    }
    for (const k of cur.dup) {
      if (prev.dup.has(k)) continue;
      const [dn, intf, ip, mac] = k.split('|');
      this.logTo(dn, `%IP-4-DUPADDR: Duplicate address ${ip} on ${intf}, sourced by ${mac}`);
    }
  }

  stamp() {
    const t = 754 + this.clock;
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    const two = n => String(n).padStart(2, '0');
    return `*Mar  1 ${two(h)}:${two(m)}:${two(s)}.${String((this.clock * 37) % 1000).padStart(3, '0')}`;
  }

  // Logs raised while a command runs are printed after its output, like IOS.
  logTo(name, msg) {
    if (isHost(this.devs[name])) return;
    const line = `${this.stamp()}: ${msg}`;
    if (this.busy) this.queued.push([name, line]);
    else this.console(name).buf.push(line);
  }

  // ------------------------------------------------------------ helpers
  ttlFor(name) {
    return isHost(this.devs[name]) ? 128 : 255;
  }

  ifAddr(dev, intf, fam = 4) {
    const list = (this.net.l3[dev] || []).filter(a => a.intf === intf && a.fam === fam);
    const a = fam === 4 ? list.find(x => x.primary) : list.find(x => x.kind === 'global');
    return a ? a.addr : null;
  }

  // Can `from` open a telnet/ssh session to `dst`? Mirrors what the vty lines enforce.
  probeRemote(from, dst, proto) {
    const port = proto === 'telnet' ? 23 : 22;
    const r = this.net.ping(from, dst, 4, null, { proto: 'tcp', dport: port, sport: 49152 });
    if (!r.ok) return { error: 'timeout' };
    const target = r.fwd.at;
    const td = this.devs[target];
    if (isHost(td)) return { error: 'refused' };
    const vty = td.lines.vty[0];
    const src = r.fwd.pkt.src;
    if (vty.accessClass && td.acls[vty.accessClass] && !this.net.aclPermits(target, vty.accessClass, { proto: 'tcp', src, dst, dport: port })) {
      return { error: 'refused' };
    }
    const allowed = vty.transport ? vty.transport : ['telnet', 'ssh'];
    if (!allowed.includes(proto) && !allowed.includes('all')) return { error: 'refused' };
    if (proto === 'ssh' && !td.rsaBits) return { error: 'refused' };
    return { target, td, vty, src };
  }

  serverAddr(lease) {
    const list = (this.net.l3[lease.server] || []).filter(x => x.fam === 4 && x.primary && x.up);
    const local = list.find(x => netOf(x.addr, x.len) === netOf(lease.addr, x.len));
    const a = local || list[0];
    return a ? a.addr : 0n;
  }
}

// Read-only helpers handed to task checks.
export function checker(lab) {
  const canon = s => (parseIntf(s) || { full: s }).full;
  const L = {
    lab,
    net: lab.net,
    dev: n => lab.devs[n],
    intf: (n, i) => lab.devs[n].intfs[canon(i)],
    run: n => runningConfig(lab.devs[n]),
    has: (n, re, sec) => re.test(sec ? section(runningConfig(lab.devs[n]), sec) : runningConfig(lab.devs[n])),
    up: (n, i) => lab.net.isUp(n, canon(i)),
    ping: (from, to) => {
      const t = parseAny(to);
      return !!t && lab.net.ping(from, t.addr, t.fam).ok;
    },
    trace: (from, to) => lab.net.trace(from, null, parseV4(to), 4),
    ospfFull: (a, b) => lab.net.ospfNeighbors(a).some(n => n.dn === b && n.state === 'FULL'),
    route: (n, pfx, code) => {
      const [a, l] = pfx.split('/');
      const v4 = parseV4(a);
      const fam = v4 !== null ? 4 : 6;
      let net, len;
      if (fam === 4) { len = Number(l); net = netOf(v4, len); } else { const p = parseV6Prefix(pfx); len = p.len; net = netOf(p.addr, len, 6); }
      return lab.net.rib[n][fam].some(r => r.net === net && r.len === len && (!code || r.code === code || (code === 'S' && r.code === 'S*')));
    },
    nextHop: (n, pfx) => {
      const [a, l] = pfx.split('/');
      const r = lab.net.rib[n][4].find(x => x.net === netOf(parseV4(a), Number(l)) && x.len === Number(l));
      return r ? r.nhs.map(h => (h.ip !== null ? fmtV4(h.ip) : h.intf)) : [];
    },
    trunking: (n, i) => !!lab.net.trunk[intfKey(n, canon(i))],
    vlanOf: (n, i) => {
      const x = lab.devs[n].intfs[canon(i)];
      return x && x.sw ? lab.net.swOf(n, x).access : null;
    },
    lease: (n) => {
      const d = lab.devs[n];
      const l = lab.net.leases[intfKey(n, d.portList[0])];
      return l ? fmtV4(l.addr) : null;
    },
    natCount: n => (lab.net.natTable[n] || []).length,
    // Full login check: reachability, vty transport/ACL, then credentials.
    login: (from, to, proto, user, pass) => {
      const p = lab.probeRemote(from, parseV4(to), proto);
      if (p.error) return false;
      if (proto === 'ssh') {
        if (p.vty.login !== 'local') return false;
        const u = p.td.users[user];
        return !!u && (u.secret || u.password) === pass;
      }
      if (p.vty.login === null) return true;
      if (p.vty.login === 'line') return !!p.vty.password && p.vty.password === pass;
      const u = p.td.users[user];
      return !!u && (u.secret || u.password) === pass;
    },
    // Re-runs the lab with extra commands appended, for "what if" checks.
    withExtra: (cmds) => {
      const l2 = new Lab(lab.def);
      l2.replay([...lab.log, ...cmds]);
      return checker(l2);
    },
  };
  return L;
}

// Builds a fresh lab from a log and evaluates every task.
export function gradeLab(def, log) {
  const lab = new Lab(def);
  lab.replay(log || []);
  const L = checker(lab);
  return def.tasks.map(t => {
    let ok = false;
    try { ok = !!t.check(L); } catch { ok = false; }
    return { text: t.text, ok };
  });
}
