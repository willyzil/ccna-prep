// Network model: derives link state, L2 segments, routing tables, OSPF,
// DHCP leases and packet forwarding from device configuration.
import {
  parseV4, parseV6, fmtV4, maskOf, netOf, inPrefix, wildMatch, linkLocalFor, eui64, BITS,
} from './addr.js';
import { defaultBw, isSubif, parentOf, typeOf } from './intf.js';

const key = (dev, intf) => `${dev}|${intf}`;
const isSwitch = d => d.kind === 'switch' || d.kind === 'l3switch';
const isHost = d => d.kind === 'host' || d.kind === 'server';

export function areaNum(a) {
  const s = String(a);
  if (/^\d+$/.test(s)) return Number(s);
  const v = parseV4(s);
  return v === null ? NaN : Number(v);
}

class UF {
  constructor() { this.p = new Map(); }
  find(x) {
    if (!this.p.has(x)) this.p.set(x, x);
    let r = x;
    while (this.p.get(r) !== r) r = this.p.get(r);
    let c = x;
    while (this.p.get(c) !== r) { const n = this.p.get(c); this.p.set(c, r); c = n; }
    return r;
  }
  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.p.set(ra, rb);
  }
}

const COMPAT = {
  on: ['on'],
  active: ['active', 'passive'],
  passive: ['active'],
  desirable: ['desirable', 'auto'],
  auto: ['desirable'],
};

export class Net {
  constructor(devices, links) {
    this.devs = devices;
    this.links = links;
    this.natTable = {};
    this.aclHits = {};
    this.arpSeen = new Set();
    this.compute();
  }

  dev(name) { return this.devs[name]; }

  // ---------------------------------------------------------------- compute
  compute() {
    this.peer = {};
    for (const l of this.links) {
      this.peer[key(l.a.dev, l.a.intf)] = l.b;
      this.peer[key(l.b.dev, l.b.intf)] = l.a;
    }
    this.computeChannels();
    this.computeStatus();
    this.computeTrunks();
    this.computeSegments();
    this.leases = {};
    this.computeL3();
    this.computeRouting();
    if (this.computeLeases()) {
      this.computeL3();
      this.computeRouting();
    }
  }

  computeChannels() {
    this.chan = {};
    for (const [dn, d] of Object.entries(this.devs)) {
      for (const i of Object.values(d.intfs)) {
        if (!i.channel) continue;
        const p = this.peer[key(dn, i.name)];
        const pi = p && this.devs[p.dev].intfs[p.intf];
        let flag = 'D';
        if (!i.shutdown && pi && !pi.shutdown) {
          if (pi.channel && COMPAT[i.channel.mode].includes(pi.channel.mode)) flag = 'P';
          else if (i.channel.mode === 'on') flag = pi.channel ? 's' : 'P';
          else flag = 'I';
        }
        this.chan[key(dn, i.name)] = flag;
      }
    }
  }

  // Effective switchport config: a bundled member takes its port-channel's.
  swOf(dn, i) {
    if (i.channel && this.chan[key(dn, i.name)] === 'P') {
      const po = this.devs[dn].intfs[`Port-channel${i.channel.group}`];
      if (po && po.sw) return po.sw;
    }
    return i.sw;
  }

  physUp(dn, name) {
    const d = this.devs[dn];
    const i = d.intfs[name];
    if (!i || i.shutdown || i.errDisabled) return false;
    const p = this.peer[key(dn, name)];
    if (!p) return false;
    const pi = this.devs[p.dev].intfs[p.intf];
    if (!pi || pi.shutdown || pi.errDisabled) return false;
    if (i.speed !== 'auto' && pi.speed !== 'auto' && i.speed !== pi.speed) return false;
    return true;
  }

  computeStatus() {
    this.st = {};
    for (const [dn, d] of Object.entries(this.devs)) {
      this.st[dn] = {};
      for (const i of Object.values(d.intfs)) {
        const t = typeOf(i.name);
        let s;
        if (i.shutdown) s = { admin: 'administratively down', proto: 'down' };
        else if (i.errDisabled) s = { admin: 'down', proto: 'down', err: true };
        else if (t === 'Loopback') s = { admin: 'up', proto: 'up' };
        else if (isSubif(i.name)) s = null;
        else if (t === 'Vlan' || t === 'Port-channel') s = null;
        else {
          const up = this.physUp(dn, i.name);
          s = { admin: up ? 'up' : 'down', proto: up ? 'up' : 'down' };
        }
        this.st[dn][i.name] = s;
      }
      for (const i of Object.values(d.intfs)) {
        if (this.st[dn][i.name]) continue;
        if (isSubif(i.name)) {
          const ps = this.st[dn][parentOf(i.name)];
          this.st[dn][i.name] = ps.admin === 'administratively down' ? { admin: 'down', proto: 'down' } : { ...ps };
        } else if (typeOf(i.name) === 'Port-channel') {
          const g = Number(i.name.replace('Port-channel', ''));
          const up = Object.values(d.intfs).some(m => m.channel && m.channel.group === g &&
            this.chan[key(dn, m.name)] === 'P' && this.st[dn][m.name].proto === 'up');
          this.st[dn][i.name] = { admin: up ? 'up' : 'down', proto: up ? 'up' : 'down' };
        }
      }
    }
  }

  trunkOp(dn, i) {
    const sw = this.swOf(dn, i);
    if (!sw || i.routed) return false;
    if (sw.mode === 'trunk') return true;
    if (sw.mode === 'access') return false;
    const p = this.peer[key(dn, i.name)];
    if (!p) return false;
    const pd = this.devs[p.dev];
    const pi = pd.intfs[p.intf];
    const psw = pi && this.swOf(p.dev, pi);
    if (!psw || pi.routed || psw.nonegotiate) return false;
    if (sw.mode === 'dynamic desirable') return ['trunk', 'dynamic desirable', 'dynamic auto'].includes(psw.mode);
    return ['trunk', 'dynamic desirable'].includes(psw.mode);
  }

  computeTrunks() {
    this.trunk = {};
    for (const [dn, d] of Object.entries(this.devs)) {
      if (!isSwitch(d)) continue;
      for (const i of Object.values(d.intfs)) {
        if (i.sw && !i.routed) this.trunk[key(dn, i.name)] = this.trunkOp(dn, i);
      }
    }
  }

  // VLANs a trunk port carries: allowed AND existing on the switch.
  trunkVlans(dn, i) {
    const d = this.devs[dn];
    const sw = this.swOf(dn, i);
    const exist = Object.keys(d.vlans).map(Number);
    return exist.filter(v => !sw.allowed || sw.allowed.includes(v));
  }

  tagMap(dn, name) {
    const d = this.devs[dn];
    const i = d.intfs[name];
    const m = { u: null, t: new Map() };
    if (isHost(d)) { m.u = key(dn, name); return m; }
    if (i.sw && !i.routed) {
      const sw = this.swOf(dn, i);
      const vnode = v => (d.vlans[v] ? `${dn}|vlan:${v}` : null);
      if (this.trunk[key(dn, name)]) {
        m.u = vnode(sw.native);
        for (const v of this.trunkVlans(dn, i)) if (v !== sw.native) m.t.set(v, vnode(v));
      } else {
        m.u = vnode(sw.access);
        if (sw.voice) m.t.set(sw.voice, vnode(sw.voice));
      }
      return m;
    }
    m.u = key(dn, name);
    for (const s of Object.values(d.intfs)) {
      if (!isSubif(s.name) || parentOf(s.name) !== name || !s.encap || s.shutdown) continue;
      if (s.encap.native) m.u = key(dn, s.name);
      else m.t.set(s.encap.vlan, key(dn, s.name));
    }
    return m;
  }

  computeSegments() {
    const uf = new UF();
    this.uf = uf;
    for (const l of this.links) {
      const ia = this.devs[l.a.dev].intfs[l.a.intf];
      const ib = this.devs[l.b.dev].intfs[l.b.intf];
      if (!this.physUp(l.a.dev, l.a.intf)) continue;
      const fa = this.chan[key(l.a.dev, l.a.intf)], fb = this.chan[key(l.b.dev, l.b.intf)];
      if (fa === 's' || fb === 's' || fa === 'D' || fb === 'D') continue;
      if (ia.channel && fa === 'P' && ib.channel && fb === 'P') {
        // A bundle forwards once; any one member link joins the two sides.
      }
      const A = this.tagMap(l.a.dev, l.a.intf);
      const B = this.tagMap(l.b.dev, l.b.intf);
      if (A.u && B.u) uf.union(A.u, B.u);
      for (const [v, n] of A.t) {
        const o = B.t.get(v);
        if (n && o) uf.union(n, o);
      }
    }
  }

  segOf(dn, intf) {
    const d = this.devs[dn];
    if (typeOf(intf) === 'Vlan' && isSwitch(d)) return this.uf.find(`${dn}|vlan:${intf.replace('Vlan', '')}`);
    return this.uf.find(key(dn, intf));
  }

  // Interface status, including SVIs which depend on VLAN membership.
  status(dn, name) {
    const d = this.devs[dn];
    const s = this.st[dn][name];
    if (s) return s;
    if (typeOf(name) === 'Vlan') {
      const i = d.intfs[name];
      if (i.shutdown) return { admin: 'administratively down', proto: 'down' };
      const v = Number(name.replace('Vlan', ''));
      if (!d.vlans[v]) return { admin: 'up', proto: 'down' };
      const active = Object.values(d.intfs).some(p => {
        if (!p.sw || p.routed || !this.st[dn][p.name] || this.st[dn][p.name].proto !== 'up') return false;
        if (p.channel && this.chan[key(dn, p.name)] !== 'P' && this.chan[key(dn, p.name)] !== 'I') return false;
        if (this.trunk[key(dn, p.name)]) return this.trunkVlans(dn, p).includes(v);
        return this.swOf(dn, p).access === v;
      });
      return { admin: 'up', proto: active ? 'up' : 'down' };
    }
    return { admin: 'down', proto: 'down' };
  }

  isUp(dn, name) {
    return this.status(dn, name).proto === 'up';
  }

  // ---------------------------------------------------------------- L3
  computeL3() {
    this.l3 = {};
    for (const [dn, d] of Object.entries(this.devs)) {
      const list = [];
      const add = (intf, fam, addr, len, extra = {}) => {
        list.push({ dev: dn, intf, fam, addr, len, up: this.isUp(dn, intf), seg: this.segOf(dn, intf), ...extra });
      };
      if (isHost(d)) {
        const nic = d.portList[0];
        const h = d.host || {};
        const lease = this.leases[key(dn, nic)];
        if (h.dhcp && h.released) {
          // ipconfig /release: no address until /renew.
        } else if (h.dhcp) {
          if (lease) add(nic, 4, lease.addr, lease.len, { primary: true, dhcp: true });
          else if (lease === null) add(nic, 4, apipa(d.intfs[nic].mac), 16, { primary: true, apipa: true });
        } else if (h.ip) {
          add(nic, 4, parseV4(h.ip), maskLen(h.mask), { primary: true });
        }
        if (h.v6) {
          const [a, l] = h.v6.split('/');
          add(nic, 6, parseV6s(a), Number(l), { kind: 'global' });
        }
        if (h.v6 || h.v6ll) add(nic, 6, linkLocalFor(d.intfs[nic].mac), 64, { kind: 'll' });
        this.l3[dn] = list;
        continue;
      }
      for (const i of Object.values(d.intfs)) {
        if (i.sw && !i.routed) continue;
        if (typeOf(i.name) === 'Port-channel' && isSwitch(d) && !i.routed) continue;
        if (i.dhcp) {
          const lease = this.leases[key(dn, i.name)];
          if (lease) add(i.name, 4, lease.addr, lease.len, { primary: true, dhcp: true });
        } else if (i.ip) {
          add(i.name, 4, i.ip.addr, i.ip.len, { primary: true });
          for (const s of i.secondary) add(i.name, 4, s.addr, s.len, { secondary: true });
        }
        if (i.v6.length || i.v6Enabled) {
          const ll = i.v6.find(a => a.type === 'link-local');
          add(i.name, 6, ll ? ll.addr : linkLocalFor(i.mac), 64, { kind: 'll' });
          for (const a of i.v6) {
            if (a.type === 'link-local') continue;
            const addr = a.type === 'eui-64' ? (netOf(a.addr, a.len, 6) | eui64(i.mac)) : a.addr;
            add(i.name, 6, addr, a.len, { kind: 'global' });
          }
        }
      }
      this.l3[dn] = list;
    }
  }

  addrsOn(dn, intf, fam = 4) {
    return (this.l3[dn] || []).filter(a => a.intf === intf && a.fam === fam);
  }

  primaryIp(dn, intf) {
    return (this.l3[dn] || []).find(a => a.intf === intf && a.fam === 4 && a.primary) || null;
  }

  routes(dn) {
    return this.devs[dn].kind === 'router' || this.devs[dn].ipRouting;
  }

  computeRouting() {
    this.ospf = {};
    for (const dn of Object.keys(this.devs)) this.ospf[dn] = this.ospfIntfs(dn);
    this.computeAdjacencies();
    this.rib = {};
    for (const dn of Object.keys(this.devs)) this.rib[dn] = { 4: this.connected(dn, 4), 6: this.connected(dn, 6) };
    for (let pass = 0; pass < 3; pass++) {
      for (const dn of Object.keys(this.devs)) {
        const c4 = this.connected(dn, 4), c6 = this.connected(dn, 6);
        const ospfRoutes = this.ospfRoutes(dn);
        this.rib[dn] = {
          4: this.mergeRoutes([...c4, ...this.staticRoutes(dn, 4, c4.concat(ospfRoutes)), ...ospfRoutes, ...this.dhcpDefault(dn)]),
          6: this.mergeRoutes([...c6, ...this.staticRoutes(dn, 6, c6)]),
        };
      }
    }
  }

  connected(dn, fam) {
    const d = this.devs[dn];
    const out = [];
    for (const a of this.l3[dn] || []) {
      if (a.fam !== fam || !a.up) continue;
      if (fam === 6 && a.kind === 'll') continue;
      const bits = BITS[fam];
      out.push({ fam, code: 'C', net: netOf(a.addr, a.len, fam), len: a.len, ad: 0, metric: 0, nhs: [{ ip: null, intf: a.intf }] });
      if (a.len < bits) out.push({ fam, code: 'L', net: a.addr, len: bits, ad: 0, metric: 0, nhs: [{ ip: null, intf: a.intf }] });
    }
    if (isHost(d) || (isSwitch(d) && !d.ipRouting)) {
      let gw = null;
      if (isHost(d)) {
        const lease = this.leases[key(dn, d.portList[0])];
        gw = d.host && d.host.dhcp ? (lease ? lease.gw : null) : (d.host && d.host.gw ? parseV4(d.host.gw) : null);
        if (fam === 6 && d.host && d.host.v6gw) {
          out.push({ fam: 6, code: 'S*', net: 0n, len: 0, ad: 1, metric: 0, nhs: [{ ip: parseV6s(d.host.v6gw), intf: d.portList[0] }] });
        }
      } else gw = d.defaultGw;
      if (fam === 4 && gw !== null && gw !== undefined) {
        out.push({ fam, code: 'S*', net: 0n, len: 0, ad: 1, metric: 0, nhs: [{ ip: gw, intf: null }] });
      }
    }
    return out;
  }

  dhcpDefault(dn) {
    const d = this.devs[dn];
    const out = [];
    for (const i of Object.values(d.intfs)) {
      const lease = this.leases[key(dn, i.name)];
      if (i.dhcp && lease && lease.gw !== null && this.isUp(dn, i.name)) {
        out.push({ fam: 4, code: 'S*', net: 0n, len: 0, ad: 254, metric: 0, nhs: [{ ip: lease.gw, intf: null }] });
      }
    }
    return out;
  }

  // Longest match in an arbitrary route list.
  bestIn(list, fam, addr, exclude) {
    let best = null;
    for (const r of list) {
      if (r.fam !== fam || r === exclude) continue;
      if (!inPrefix(addr, r.net, r.len, fam)) continue;
      if (!best || r.len > best.len || (r.len === best.len && r.ad < best.ad)) best = r;
    }
    return best;
  }

  staticRoutes(dn, fam, base) {
    const d = this.devs[dn];
    if (!this.routes(dn) || (fam === 6 && !d.v6Routing)) return [];
    const out = [];
    const prev = this.rib[dn] ? this.rib[dn][fam] : [];
    for (const s of d.statics) {
      if (s.fam !== fam) continue;
      const isDefault = s.len === 0;
      const code = isDefault ? 'S*' : 'S';
      if (s.intf) {
        if (!d.intfs[s.intf] || !this.isUp(dn, s.intf)) continue;
        out.push({ fam, code, net: s.net, len: s.len, ad: s.ad, metric: 0, nhs: [{ ip: s.nh, intf: s.intf }], direct: s.nh === null });
        continue;
      }
      // Recursive next hop: it must resolve through something other than this route.
      const pool = [...base, ...prev.filter(r => !(r.code[0] === 'S' && r.net === s.net && r.len === s.len))];
      const via = this.bestIn(pool, fam, s.nh);
      if (!via) continue;
      out.push({ fam, code, net: s.net, len: s.len, ad: s.ad, metric: 0, nhs: [{ ip: s.nh, intf: null }] });
    }
    return out;
  }

  mergeRoutes(list) {
    const by = new Map();
    for (const r of list) {
      const k = `${r.net}/${r.len}/${r.code === 'L' ? 'L' : ''}`;
      const cur = by.get(k);
      if (!cur || r.ad < cur.ad || (r.ad === cur.ad && r.metric < cur.metric)) by.set(k, { ...r, nhs: [...r.nhs] });
      else if (r.ad === cur.ad && r.metric === cur.metric && r.code === cur.code) {
        for (const n of r.nhs) if (!cur.nhs.some(x => x.ip === n.ip && x.intf === n.intf)) cur.nhs.push(n);
      }
    }
    return [...by.values()];
  }

  // Resolve a route's next hop to an exit interface (recursively for statics).
  resolve(dn, fam, r, depth = 0) {
    const out = [];
    for (const nh of r.nhs) {
      if (nh.intf) { out.push({ ip: nh.ip, intf: nh.intf }); continue; }
      if (depth > 5) continue;
      const via = this.bestIn(this.rib[dn][fam], fam, nh.ip, r);
      if (!via) continue;
      for (const x of this.resolve(dn, fam, via, depth + 1)) out.push({ ip: x.ip === null ? nh.ip : x.ip, intf: x.intf });
    }
    return out;
  }

  lookup(dn, fam, addr) {
    if (!this.rib[dn]) return null;
    return this.bestIn(this.rib[dn][fam], fam, addr);
  }

  // ---------------------------------------------------------------- OSPF
  ospfIntfs(dn) {
    const d = this.devs[dn];
    const pids = Object.keys(d.ospf);
    const intfPids = Object.values(d.intfs).filter(i => i.ospf.pid !== null).map(i => String(i.ospf.pid));
    const all = [...new Set([...pids, ...intfPids])];
    if (!all.length || !this.routes(dn)) return null;
    const pid = all.sort((a, b) => a - b)[0];
    const proc = d.ospf[pid] || { rid: null, networks: [], passive: [], passiveDefault: false, nonPassive: [], refBw: null, defaultOriginate: null };
    let rid = proc.activeRid !== null && proc.activeRid !== undefined ? proc.activeRid : proc.rid;
    if (rid === null) {
      const v4 = (this.l3[dn] || []).filter(a => a.fam === 4 && a.up && a.primary);
      const loops = v4.filter(a => typeOf(a.intf) === 'Loopback');
      const pick = (loops.length ? loops : v4).map(a => a.addr).sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));
      rid = pick.length ? pick[0] : null;
    }
    const refBw = (proc.refBw || 100) * 1000;
    const intfs = [];
    for (const a of this.l3[dn]) {
      if (a.fam !== 4 || !a.primary) continue;
      const i = d.intfs[a.intf];
      let area = null;
      if (i.ospf.pid !== null && String(i.ospf.pid) === String(pid)) area = i.ospf.area;
      else {
        let bestW = null;
        for (const n of proc.networks) {
          if (wildMatch(a.addr, n.addr, n.wild) && (bestW === null || n.wild < bestW)) { area = n.area; bestW = n.wild; }
        }
      }
      if (area === null) continue;
      const passive = proc.passiveDefault ? !proc.nonPassive.includes(a.intf) : proc.passive.includes(a.intf);
      const t = typeOf(a.intf);
      const net = i.ospf.net || (t === 'Loopback' ? 'loopback' : t === 'Serial' ? 'point-to-point' : 'broadcast');
      const bwIntf = isSubif(a.intf) ? d.intfs[parentOf(a.intf)] : i;
      const bw = bwIntf.bw || defaultBw(bwIntf.name);
      const cost = i.ospf.cost || (t === 'Loopback' ? 1 : Math.max(1, Math.floor(refBw / bw)));
      const hello = i.ospf.hello || 10;
      intfs.push({
        intf: a.intf, area: String(area), areaN: areaNum(area), passive, net, cost, hello,
        dead: i.ospf.dead || hello * 4, prio: i.ospf.priority, addr: a.addr, len: a.len, seg: a.seg, up: a.up,
        state: 'DOWN', nbrs: [], dr: null, bdr: null,
      });
    }
    return { pid, rid, intfs, proc };
  }

  computeAdjacencies() {
    // Group candidate interfaces by L2 segment.
    const bySeg = new Map();
    for (const [dn, o] of Object.entries(this.ospf)) {
      if (!o || o.rid === null) continue;
      for (const oi of o.intfs) {
        if (!oi.up || oi.net === 'loopback') {
          oi.state = oi.net === 'loopback' && oi.up ? 'LOOP' : 'DOWN';
          continue;
        }
        oi.state = oi.passive ? (oi.net === 'point-to-point' ? 'P2P' : 'DR') : 'WAIT';
        if (oi.passive) continue;
        if (!bySeg.has(oi.seg)) bySeg.set(oi.seg, []);
        bySeg.get(oi.seg).push({ dn, rid: o.rid, oi });
      }
    }
    this.ospfSegs = [];
    for (const members of bySeg.values()) {
      // Members that can talk: same subnet, area, timers, network type, distinct RIDs.
      const ok = (a, b) => a.dn !== b.dn && a.rid !== b.rid &&
        a.oi.len === b.oi.len && netOf(a.oi.addr, a.oi.len) === netOf(b.oi.addr, b.oi.len) &&
        a.oi.areaN === b.oi.areaN && a.oi.hello === b.oi.hello && a.oi.dead === b.oi.dead &&
        (a.oi.net === 'point-to-point') === (b.oi.net === 'point-to-point');
      const p2p = members.every(m => m.oi.net === 'point-to-point');
      if (p2p) {
        for (const m of members) {
          m.oi.state = 'P2P';
          for (const n of members) {
            if (ok(m, n)) m.oi.nbrs.push({ dn: n.dn, rid: n.rid, prio: 0, addr: n.oi.addr, intf: m.oi.intf, state: 'FULL', role: '-' });
          }
        }
        this.ospfSegs.push({ members, full: members.filter(m => m.oi.nbrs.length), p2p: true });
        continue;
      }
      // Broadcast: elect DR/BDR among the routers that can see each other.
      const groups = [];
      for (const m of members) {
        let g = groups.find(gr => gr.every(x => ok(x, m)));
        if (!g) { g = []; groups.push(g); }
        g.push(m);
      }
      for (const g of groups) {
        const elig = g.filter(m => m.oi.prio > 0).sort((a, b) => b.oi.prio - a.oi.prio || (a.rid > b.rid ? -1 : 1));
        const dr = g.length > 1 ? elig[0] || null : null;
        const bdr = g.length > 1 ? elig[1] || null : null;
        for (const m of g) {
          m.oi.dr = dr ? dr.oi.addr : null;
          m.oi.drRid = dr ? dr.rid : null;
          m.oi.bdr = bdr ? bdr.oi.addr : null;
          m.oi.bdrRid = bdr ? bdr.rid : null;
          if (g.length === 1) { m.oi.state = 'DR'; m.oi.dr = m.oi.addr; m.oi.drRid = m.rid; }
          else m.oi.state = m === dr ? 'DR' : m === bdr ? 'BDR' : 'DROTHER';
        }
        for (const m of g) {
          for (const n of g) {
            if (m === n) continue;
            const role = n === dr ? 'DR' : n === bdr ? 'BDR' : 'DROTHER';
            const full = dr && (m === dr || m === bdr || n === dr || n === bdr);
            m.oi.nbrs.push({ dn: n.dn, rid: n.rid, prio: n.oi.prio, addr: n.oi.addr, intf: m.oi.intf, state: full ? 'FULL' : '2WAY', role });
          }
        }
        this.ospfSegs.push({ members: g, full: dr ? g : [], p2p: false });
      }
    }
  }

  ospfNeighbors(dn) {
    const o = this.ospf[dn];
    if (!o) return [];
    return o.intfs.flatMap(oi => oi.nbrs);
  }

  ospfRoutes(dn) {
    const me = this.ospf[dn];
    if (!me || me.rid === null) return [];
    // Graph edges between routers: from each FULL transit segment.
    const edges = new Map();
    const addEdge = (a, b, cost, intf, nhAddr) => {
      if (!edges.has(a)) edges.set(a, []);
      edges.get(a).push({ to: b, cost, intf, nh: nhAddr });
    };
    for (const s of this.ospfSegs) {
      const full = s.p2p ? s.members.filter(m => m.oi.nbrs.some(n => n.state === 'FULL')) : s.full;
      for (const a of full) {
        for (const b of full) {
          if (a === b) continue;
          if (s.p2p && !a.oi.nbrs.some(n => n.dn === b.dn)) continue;
          addEdge(a.dn, b.dn, a.oi.cost, a.oi.intf, b.oi.addr);
        }
      }
    }
    // Dijkstra with ECMP first hops.
    const dist = new Map([[dn, 0]]);
    const first = new Map([[dn, []]]);
    const done = new Set();
    for (;;) {
      let u = null;
      for (const [n, dd] of dist) if (!done.has(n) && (u === null || dd < dist.get(u))) u = n;
      if (u === null) break;
      done.add(u);
      for (const e of edges.get(u) || []) {
        const nd = dist.get(u) + e.cost;
        const hops = u === dn ? [{ ip: e.nh, intf: e.intf }] : first.get(u);
        if (!dist.has(e.to) || nd < dist.get(e.to)) { dist.set(e.to, nd); first.set(e.to, [...hops]); }
        else if (nd === dist.get(e.to)) {
          const cur = first.get(e.to);
          for (const h of hops) if (!cur.some(x => x.ip === h.ip && x.intf === h.intf)) cur.push(h);
        }
      }
    }
    const myAreas = new Set(me.intfs.map(i => i.areaN));
    const best = new Map();
    for (const [rn, d0] of dist) {
      if (rn === dn) continue;
      const o = this.ospf[rn];
      for (const oi of o.intfs) {
        if (!oi.up) continue;
        const len = oi.net === 'loopback' ? 32 : oi.len;
        const net = netOf(oi.addr, len);
        const k = `${net}/${len}`;
        const metric = d0 + oi.cost;
        const cur = best.get(k);
        const code = myAreas.has(oi.areaN) ? 'O' : 'O IA';
        if (!cur || metric < cur.metric) best.set(k, { fam: 4, code, net, len, ad: 110, metric, nhs: [...first.get(rn)] });
        else if (metric === cur.metric) {
          for (const h of first.get(rn)) if (!cur.nhs.some(x => x.ip === h.ip && x.intf === h.intf)) cur.nhs.push(h);
        }
      }
      // Default route originated into OSPF (type 5, E2: the advertised metric of 1 is not increased).
      const org = o.proc.defaultOriginate;
      if (org) {
        const has = org === 'always' || (this.rib[rn] && this.rib[rn][4].some(r => r.len === 0 && r.code !== 'O*E2'));
        if (has) {
          const cur = best.get('0/0');
          if (!cur || d0 < cur.fwd) best.set('0/0', { fam: 4, code: 'O*E2', net: 0n, len: 0, ad: 110, metric: 1, fwd: d0, nhs: [...first.get(rn)] });
          else if (d0 === cur.fwd) for (const h of first.get(rn)) if (!cur.nhs.some(x => x.ip === h.ip)) cur.nhs.push(h);
        }
      }
    }
    return [...best.values()];
  }

  // ---------------------------------------------------------------- DHCP
  computeLeases() {
    let changed = false;
    const clients = [];
    for (const [dn, d] of Object.entries(this.devs)) {
      if (isHost(d) && d.host && d.host.dhcp && !d.host.released) clients.push([dn, d.portList[0]]);
      else for (const i of Object.values(d.intfs)) if (i.dhcp) clients.push([dn, i.name]);
    }
    clients.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
    const used = new Set();
    for (const [dn, intf] of clients) {
      const lease = this.findLease(dn, intf, used);
      this.leases[key(dn, intf)] = lease;
      if (lease && lease.addr !== null) { used.add(`${lease.server}|${lease.addr}`); changed = true; }
    }
    return changed || clients.length > 0;
  }

  findLease(dn, intf, used) {
    if (!this.isUp(dn, intf)) return null;
    const seg = this.segOf(dn, intf);
    // Any routed interface on the client's segment: a local server, or a relay.
    for (const [rn, list] of Object.entries(this.l3)) {
      if (rn === dn) continue;
      for (const a of list) {
        if (a.fam !== 4 || !a.primary || !a.up || a.seg !== seg) continue;
        const giaddr = a.addr;
        const local = this.poolFor(rn, giaddr, used);
        if (local) return local;
        const ri = this.devs[rn].intfs[a.intf];
        if (!ri || !ri.helpers.length) continue;
        for (const h of ri.helpers) {
          const owner = this.owner(h, 4);
          if (!owner) continue;
          const t = this.trace(rn, giaddr, h, 4, { proto: 'udp', dport: 67 });
          if (!t.ok) continue;
          const back = this.trace(owner.dev, h, giaddr, 4, { proto: 'udp', sport: 67 });
          if (!back.ok) continue;
          const lease = this.poolFor(owner.dev, giaddr, used);
          if (lease) return lease;
        }
      }
    }
    return null;
  }

  poolFor(server, giaddr, used) {
    const d = this.devs[server];
    if (!d.dhcp || this.devs[server].kind !== 'router' && !this.devs[server].ipRouting) return null;
    for (const p of Object.values(d.dhcp.pools)) {
      if (p.network === null || !inPrefix(giaddr, p.network, p.len)) continue;
      const size = 1n << BigInt(32 - p.len);
      for (let off = 1n; off < size - 1n; off++) {
        const addr = p.network + off;
        if (d.dhcp.excluded.some(([a, b]) => addr >= a && addr <= b)) continue;
        if (used.has(`${server}|${addr}`)) continue;
        if (this.owner(addr, 4)) continue;
        return { addr, len: p.len, gw: p.router, dns: p.dns, domain: p.domain, server, pool: p.name };
      }
    }
    return null;
  }

  // ---------------------------------------------------------------- forwarding
  owner(addr, fam = 4) {
    for (const [dn, list] of Object.entries(this.l3)) {
      for (const a of list) if (a.fam === fam && a.up && a.addr === addr) return { dev: dn, intf: a.intf };
    }
    return null;
  }

  owns(dn, addr, fam) {
    return (this.l3[dn] || []).some(a => a.fam === fam && a.up && a.addr === addr);
  }

  aclPermits(dn, name, pkt) {
    const acl = this.devs[dn].acls[name];
    if (!acl) return true;
    for (let idx = 0; idx < acl.entries.length; idx++) {
      const e = acl.entries[idx];
      if (e.remark !== undefined) continue;
      if (matchAce(e, pkt)) {
        const k = `${dn}|${name}|${e.seq}`;
        this.aclHits[k] = (this.aclHits[k] || 0) + 1;
        return e.action === 'permit';
      }
    }
    return false;
  }

  natLookupOut(dn, inIntf, outIntf, pkt) {
    const d = this.devs[dn];
    const ii = d.intfs[inIntf], oi = d.intfs[outIntf];
    if (!ii || !oi || ii.nat !== 'inside' || oi.nat !== 'outside') return null;
    const st = d.nat.statics.find(s => s.local === pkt.src);
    if (st) return { global: st.global, kind: 'static' };
    for (const dy of d.nat.dynamic) {
      if (!this.devs[dn].acls[dy.acl]) continue;
      if (!aclMatchOnly(this.devs[dn].acls[dy.acl], { proto: 'ip', src: pkt.src, dst: pkt.dst })) continue;
      if (dy.intf) {
        const ip = this.primaryIp(dn, dy.intf);
        if (ip) return { global: ip.addr, kind: 'overload' };
      } else if (d.nat.pools[dy.pool]) {
        const p = d.nat.pools[dy.pool];
        const table = this.natTable[dn] || [];
        const existing = table.find(t => t.local === pkt.src && t.kind === 'pool');
        if (existing) return { global: existing.global, kind: 'pool' };
        for (let a = p.start; a <= p.end; a++) {
          if (!table.some(t => t.global === a && t.kind === 'pool')) return { global: a, kind: 'pool' };
        }
        if (dy.overload) return { global: p.start, kind: 'overload' };
        return null;
      }
    }
    return null;
  }

  natLookupIn(dn, inIntf, pkt) {
    const d = this.devs[dn];
    const ii = d.intfs[inIntf];
    if (!ii || ii.nat !== 'outside') return null;
    const st = d.nat.statics.find(s => s.global === pkt.dst);
    if (st) return st.local;
    const t = (this.natTable[dn] || []).find(x => x.global === pkt.dst && x.remote === pkt.src);
    return t ? t.local : null;
  }

  // Walks a packet hop by hop. Returns { ok, hops, at, reason, pkt }.
  trace(srcDev, srcAddr, dst, fam = 4, opts = {}) {
    const pkt = {
      src: srcAddr, dst, proto: opts.proto || 'icmp', sport: opts.sport, dport: opts.dport, fam,
      established: !!opts.established, reply: !!opts.reply,
    };
    const hops = [];
    let dn = srcDev, inIntf = null;
    for (let ttl = 0; ttl < 30; ttl++) {
      const d = this.devs[dn];
      if (inIntf && fam === 4) {
        const ii = d.intfs[inIntf];
        if (ii && ii.nat === 'outside') {
          const local = this.natLookupIn(dn, inIntf, pkt);
          if (local !== null) pkt.dst = local;
        }
        if (ii && ii.acl.in && !this.aclPermits(dn, ii.acl.in, pkt)) {
          return { ok: false, hops, at: dn, reason: 'acl-in', intf: inIntf, pkt };
        }
      }
      if (this.owns(dn, pkt.dst, fam)) return { ok: true, hops, at: dn, pkt };
      if (dn !== srcDev && !this.routes(dn)) return { ok: false, hops, at: dn, reason: 'not-router', pkt };
      if (fam === 6 && dn !== srcDev && !d.v6Routing && !isHost(d)) return { ok: false, hops, at: dn, reason: 'not-router', pkt };
      const r = this.lookup(dn, fam, pkt.dst);
      if (!r) return { ok: false, hops, at: dn, reason: 'no-route', pkt };
      const exits = this.resolve(dn, fam, r);
      if (!exits.length) return { ok: false, hops, at: dn, reason: 'no-route', pkt };
      const ex = exits[0];
      const nextIp = ex.ip === null ? pkt.dst : ex.ip;
      if (pkt.src === null || pkt.src === undefined) {
        const src = this.addrsOn(dn, ex.intf, fam).filter(a => fam === 4 ? a.primary : a.kind === 'global')[0] ||
          this.addrsOn(dn, ex.intf, fam)[0];
        if (!src) return { ok: false, hops, at: dn, reason: 'no-source', pkt };
        pkt.src = src.addr;
      }
      if (fam === 4 && inIntf) {
        const tr = this.natLookupOut(dn, inIntf, ex.intf, pkt);
        if (tr) {
          if (!this.natTable[dn]) this.natTable[dn] = [];
          const t = this.natTable[dn];
          if (tr.kind !== 'static' && !t.some(x => x.local === pkt.src && x.remote === pkt.dst)) {
            t.push({ local: pkt.src, global: tr.global, remote: pkt.dst, kind: tr.kind, proto: pkt.proto });
          }
          pkt.src = tr.global;
        }
      }
      const oi = d.intfs[ex.intf];
      if (fam === 4 && oi && oi.acl.out && dn !== srcDev && !this.aclPermits(dn, oi.acl.out, pkt)) {
        return { ok: false, hops, at: dn, reason: 'acl-out', intf: ex.intf, pkt };
      }
      if (!this.isUp(dn, ex.intf)) return { ok: false, hops, at: dn, reason: 'down', pkt };
      const seg = this.segOf(dn, ex.intf);
      let target = null;
      for (const [tn, list] of Object.entries(this.l3)) {
        if (tn === dn) continue;
        const a = list.find(x => x.fam === fam && x.up && x.seg === seg && x.addr === nextIp);
        if (a) { target = a; break; }
      }
      if (!target && fam === 4) target = this.natArp(seg, nextIp);
      if (!target && ex.ip === null && r.code[0] === 'S' && r.len > 0 || !target && ex.ip === null && r.code === 'S*') {
        target = this.proxyArp(dn, seg, pkt.dst, fam);
      }
      if (!target) return { ok: false, hops, at: dn, reason: 'arp', nextIp, intf: ex.intf, pkt };
      hops.push({ dev: dn, out: ex.intf, nextIp, to: target.dev, in: target.intf });
      dn = target.dev;
      inIntf = target.intf;
    }
    return { ok: false, hops, at: dn, reason: 'ttl', pkt };
  }

  // A NAT router answers ARP on its outside segment for its static and pool globals.
  natArp(seg, addr) {
    for (const [dn, d] of Object.entries(this.devs)) {
      if (!d.nat.statics.length && !Object.keys(d.nat.pools).length) continue;
      const a = (this.l3[dn] || []).find(x => x.fam === 4 && x.up && x.seg === seg && d.intfs[x.intf] && d.intfs[x.intf].nat === 'outside');
      if (!a) continue;
      if (d.nat.statics.some(s => s.global === addr)) return a;
      if (Object.values(d.nat.pools).some(p => addr >= p.start && addr <= p.end)) return a;
    }
    return null;
  }

  // A router on the segment answers ARP for an address it can route elsewhere.
  proxyArp(dn, seg, dst, fam) {
    if (fam !== 4) return null;
    for (const [tn, list] of Object.entries(this.l3)) {
      if (tn === dn || !this.routes(tn)) continue;
      const a = list.find(x => x.fam === 4 && x.up && x.seg === seg);
      if (!a) continue;
      const r = this.lookup(tn, 4, dst);
      if (r && !r.nhs.some(n => n.intf === a.intf)) return a;
    }
    return null;
  }

  // Full round trip; source address chosen like IOS when not given.
  ping(srcDev, dst, fam = 4, srcAddr = null, opts = {}) {
    const fwd = this.trace(srcDev, srcAddr, dst, fam, opts);
    if (!fwd.ok) return { ok: false, fwd, firstArp: false };
    const back = this.trace(fwd.at, fwd.pkt.dst, fwd.pkt.src, fam, {
      proto: fwd.pkt.proto, sport: opts.dport, dport: opts.sport, established: true, reply: true,
    });
    const k = `${srcDev}>${dst}`;
    const firstArp = !this.arpSeen.has(k) && fwd.hops.length > 0;
    this.arpSeen.add(k);
    return { ok: back.ok, fwd, back, firstArp };
  }

  // ---------------------------------------------------------------- neighbours
  cdpNeighbors(dn) {
    const d = this.devs[dn];
    if (!d.cdpRun || isHost(d)) return [];
    const out = [];
    for (const i of Object.values(d.intfs)) {
      const p = this.peer[key(dn, i.name)];
      if (!p || !i.cdp || !this.physUp(dn, i.name)) continue;
      const pd = this.devs[p.dev];
      if (isHost(pd) || !pd.cdpRun || !pd.intfs[p.intf].cdp) continue;
      out.push({ local: i.name, dev: pd, port: p.intf });
    }
    return out;
  }

  lldpNeighbors(dn) {
    const d = this.devs[dn];
    if (!d.lldpRun) return [];
    const out = [];
    for (const i of Object.values(d.intfs)) {
      const p = this.peer[key(dn, i.name)];
      if (!p || !this.physUp(dn, i.name)) continue;
      const pd = this.devs[p.dev];
      if (isHost(pd) || !pd.lldpRun) continue;
      out.push({ local: i.name, dev: pd, port: p.intf });
    }
    return out;
  }

  // MAC table entries for a switch: endpoints learned out of each port.
  macTable(dn) {
    const d = this.devs[dn];
    const out = [];
    for (const i of Object.values(d.intfs)) {
      if (!i.sw || i.routed || !this.isUp(dn, i.name)) continue;
      const p = this.peer[key(dn, i.name)];
      if (!p) continue;
      const vlans = this.trunk[key(dn, i.name)] ? this.trunkVlans(dn, i) : [this.swOf(dn, i).access];
      const seen = new Set([dn]);
      const endpoints = [];
      const stack = [p];
      while (stack.length) {
        const cur = stack.pop();
        const cd = this.devs[cur.dev];
        if (!isSwitch(cd)) { endpoints.push(cur); continue; }
        if (seen.has(cur.dev)) continue;
        seen.add(cur.dev);
        for (const ci of Object.values(cd.intfs)) {
          if (ci.name === cur.intf || !ci.sw || ci.routed || !this.isUp(cur.dev, ci.name)) continue;
          const np = this.peer[key(cur.dev, ci.name)];
          if (np && !seen.has(np.dev)) stack.push(np);
        }
      }
      for (const ep of endpoints) {
        const ed = this.devs[ep.dev];
        const nodes = [ep.intf, ...Object.keys(ed.intfs).filter(n => isSubif(n) && parentOf(n) === ep.intf)];
        for (const n of nodes) {
          const seg = this.uf.find(key(ep.dev, n));
          const v = vlans.find(x => this.uf.find(`${dn}|vlan:${x}`) === seg);
          if (v !== undefined && !out.some(o => o.vlan === v && o.mac === ed.intfs[ep.intf].mac)) {
            out.push({ vlan: v, mac: ed.intfs[ep.intf].mac, port: i.name });
          }
        }
      }
    }
    return out.sort((a, b) => a.vlan - b.vlan || a.mac.localeCompare(b.mac));
  }
}

// Windows picks a 169.254.0.0/16 address when DHCP fails.
function apipa(mac) {
  const hex = mac.replace(/\./g, '');
  const b5 = Math.max(1, parseInt(hex.slice(8, 10), 16)), b6 = Math.max(1, parseInt(hex.slice(10, 12), 16));
  return parseV4(`169.254.${Math.min(b5, 254)}.${Math.min(b6, 254)}`);
}

function maskLen(mask) {
  const n = parseV4(mask);
  for (let len = 0; len <= 32; len++) if (maskOf(len) === n) return len;
  return 24;
}

const parseV6s = s => parseV6(s);

function portMatch(op, ports, p) {
  if (!op) return true;
  if (p === undefined || p === null) return false;
  switch (op) {
    case 'eq': return ports.includes(p);
    case 'neq': return !ports.includes(p);
    case 'gt': return p > ports[0];
    case 'lt': return p < ports[0];
    case 'range': return p >= ports[0] && p <= ports[1];
    default: return false;
  }
}

function addrMatch(spec, addr) {
  return wildMatch(addr, spec.addr, spec.wild);
}

export function matchAce(e, pkt) {
  if (e.type === 'standard') return addrMatch(e.src, pkt.src);
  if (e.proto !== 'ip') {
    if (e.proto !== pkt.proto) return false;
  }
  if (!addrMatch(e.src, pkt.src) || !addrMatch(e.dst, pkt.dst)) return false;
  if (e.proto === 'tcp' || e.proto === 'udp') {
    if (!portMatch(e.sport && e.sport.op, e.sport && e.sport.ports, pkt.sport)) return false;
    if (!portMatch(e.dport && e.dport.op, e.dport && e.dport.ports, pkt.dport)) return false;
    if (e.established && !pkt.established) return false;
  }
  if (e.proto === 'icmp' && e.icmpType) {
    const t = pkt.icmpType || (pkt.reply ? 'echo-reply' : 'echo');
    if (t !== e.icmpType) return false;
  }
  return true;
}

function aclMatchOnly(acl, pkt) {
  for (const e of acl.entries) {
    if (e.remark !== undefined) continue;
    if (matchAce(e, pkt)) return e.action === 'permit';
  }
  return false;
}

export { key as intfKey, isSwitch, isHost, fmtV4 };
