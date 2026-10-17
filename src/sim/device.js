// Device state and running-config rendering.
import { fmtV4, lenToMask, fmtV6, fmtList } from './addr.js';
import { portsFor, compareIntf, isSubif, parentOf, typeOf, PLATFORM } from './intf.js';

function hash(s) {
  let h = 2166136261;
  for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

function macFor(devName, idx) {
  const h = hash(devName);
  const hex = n => n.toString(16).padStart(4, '0');
  return `00${((h >> 24) & 255).toString(16).padStart(2, '0')}.${hex(h & 0xffff)}.${hex((((h >> 16) & 0xff) << 8) + idx + 1)}`;
}

// Cisco type 7 "encryption": a fixed XOR key, reversible by design.
const XLAT = 'dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87';
export function type7(pw) {
  const seed = hash(pw) % 16;
  let out = String(seed).padStart(2, '0');
  for (let i = 0; i < pw.length; i++) {
    out += (pw.charCodeAt(i) ^ XLAT.charCodeAt((seed + i) % XLAT.length)).toString(16).toUpperCase().padStart(2, '0');
  }
  return out;
}

const B64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export function type5(pw) {
  let h = hash(pw);
  let s = '';
  for (let i = 0; i < 26; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = (h + i + pw.length) >>> 0;
    s += B64[h % 64];
  }
  return `$1$${s.slice(0, 4)}$${s.slice(4)}`;
}

export function newIntf(dev, name) {
  const physical = !/^(Loopback|Vlan|Port-channel|Tunnel)/.test(name) && !isSubif(name);
  const switchPort = (dev.kind === 'switch' || dev.kind === 'l3switch') && physical;
  const idx = dev.portList.indexOf(name);
  return {
    name,
    shutdown: (dev.kind === 'router' && physical) || (name === 'Vlan1'),
    desc: null,
    ip: null,
    secondary: [],
    dhcp: false,
    v6: [],
    v6Enabled: false,
    helpers: [],
    nat: null,
    acl: { in: null, out: null },
    ospf: { pid: null, area: null, cost: null, priority: 1, hello: null, dead: null, net: null },
    sw: switchPort ? { mode: 'dynamic auto', access: 1, voice: null, native: 1, allowed: null, nonegotiate: false } : null,
    routed: false,
    encap: null,
    channel: null,
    ps: null,
    portfast: false,
    bpduguard: false,
    speed: 'auto',
    duplex: 'auto',
    bw: null,
    clockRate: null,
    cdp: true,
    mac: macFor(dev.name, idx >= 0 ? idx : 40 + (hash(name) % 200)),
    errDisabled: false,
  };
}

export function newLine() {
  return { password: null, pwEnc: false, login: null, transport: null, execTimeout: null, logSync: false, accessClass: null };
}

export function createDevice(spec) {
  const kind = spec.kind || 'router';
  const dev = {
    name: spec.name,
    kind,
    model: spec.model || kind,
    platform: PLATFORM[spec.model || kind] || PLATFORM[kind],
    hostname: spec.hostname || (kind === 'router' ? 'Router' : (kind === 'host' || kind === 'server') ? spec.name : 'Switch'),
    portList: spec.ports || portsFor(spec.model || kind),
    intfs: {},
    vlans: {},
    ipRouting: kind === 'router',
    v6Routing: false,
    defaultGw: null,
    statics: [],
    ospf: {},
    acls: {},
    nat: { statics: [], dynamic: [], pools: {} },
    dhcp: { excluded: [], pools: {} },
    users: {},
    enableSecret: null,
    enablePassword: null,
    pwEncryption: false,
    domainName: null,
    rsaBits: 0,
    sshVersion: null,
    banner: null,
    lines: { con: newLine(), vty: Array.from({ length: 16 }, () => ({ ...newLine(), login: 'line' })) },
    ntp: { servers: [], master: null },
    stp: { mode: 'pvst', priority: {} },
    cdpRun: true,
    lldpRun: false,
    misc: [],
    saved: null,
    host: spec.host ? { ...spec.host } : null,
    lease: null,
  };
  if (kind === 'switch' || kind === 'l3switch') {
    dev.vlans[1] = { name: 'default' };
    dev.intfs.Vlan1 = newIntf(dev, 'Vlan1');
  }
  for (const p of dev.portList) dev.intfs[p] = newIntf(dev, p);
  return dev;
}

export function getIntf(dev, full, create = false) {
  if (dev.intfs[full]) return dev.intfs[full];
  if (!create) return null;
  const t = typeOf(full);
  if (isSubif(full)) {
    if (!dev.intfs[parentOf(full)] || dev.kind !== 'router') return null;
  } else if (t === 'Vlan') {
    if (dev.kind === 'router') return null;
  } else if (t !== 'Loopback' && t !== 'Port-channel' && t !== 'Tunnel') {
    return null;
  }
  const i = newIntf(dev, full);
  if (t === 'Port-channel' && (dev.kind === 'switch' || dev.kind === 'l3switch')) {
    i.sw = { mode: 'dynamic auto', access: 1, voice: null, native: 1, allowed: null, nonegotiate: false };
  }
  dev.intfs[full] = i;
  return i;
}

export function sortedIntfs(dev) {
  return Object.keys(dev.intfs).sort(compareIntf).map(n => dev.intfs[n]);
}

function pw(dev, line, value) {
  return dev.pwEncryption ? `${line} 7 ${type7(value)}` : `${line} ${value}`;
}

function aclEntryText(e) {
  if (e.remark !== undefined) return `remark ${e.remark}`;
  return e.text;
}

function lineBlock(l) {
  const out = [];
  if (l.accessClass) out.push(` access-class ${l.accessClass} in`);
  if (l.execTimeout) out.push(` exec-timeout ${l.execTimeout}`);
  if (l.password) out.push(l.pwEnc ? ` password 7 ${type7(l.password)}` : ` password ${l.password}`);
  if (l.logSync) out.push(' logging synchronous');
  if (l.login === 'local') out.push(' login local');
  else if (l.login === 'line') out.push(' login');
  if (l.transport) out.push(` transport input ${l.transport.join(' ')}`);
  return out;
}

function vtyGroups(vty) {
  const groups = [];
  for (const [a, b] of [[0, 4], [5, 15]]) {
    let start = a;
    for (let i = a + 1; i <= b + 1; i++) {
      if (i > b || JSON.stringify(vty[i]) !== JSON.stringify(vty[start])) {
        groups.push([start, i - 1]);
        start = i;
      }
    }
  }
  return groups;
}

export function intfLines(dev, i) {
  const out = [];
  if (i.desc) out.push(` description ${i.desc}`);
  if (i.encap) out.push(` encapsulation dot1Q ${i.encap.vlan}${i.encap.native ? ' native' : ''}`);
  if (i.sw && !i.routed) {
    if (i.sw.access !== 1) out.push(` switchport access vlan ${i.sw.access}`);
    if (i.sw.native !== 1) out.push(` switchport trunk native vlan ${i.sw.native}`);
    if (i.sw.allowed) out.push(` switchport trunk allowed vlan ${i.sw.allowed.length ? fmtList(i.sw.allowed) : 'none'}`);
    if (i.sw.mode !== 'dynamic auto') out.push(` switchport mode ${i.sw.mode}`);
    if (i.sw.nonegotiate) out.push(' switchport nonegotiate');
    if (i.sw.voice) out.push(` switchport voice vlan ${i.sw.voice}`);
    if (i.ps) {
      if (i.ps.max !== 1) out.push(` switchport port-security maximum ${i.ps.max}`);
      if (i.ps.violation !== 'shutdown') out.push(` switchport port-security violation ${i.ps.violation}`);
      if (i.ps.sticky) out.push(' switchport port-security mac-address sticky');
      for (const m of i.ps.macs) out.push(` switchport port-security mac-address ${i.ps.sticky ? 'sticky ' : ''}${m}`);
      if (i.ps.enabled) out.push(' switchport port-security');
    }
  }
  if (i.routed) out.push(' no switchport');
  if (i.sw === null || i.routed) {
    if (i.dhcp) out.push(' ip address dhcp');
    else if (i.ip) {
      out.push(` ip address ${fmtV4(i.ip.addr)} ${lenToMask(i.ip.len)}`);
      for (const s of i.secondary) out.push(` ip address ${fmtV4(s.addr)} ${lenToMask(s.len)} secondary`);
    } else if (!/^Port-channel/.test(i.name)) out.push(' no ip address');
  }
  for (const h of i.helpers) out.push(` ip helper-address ${fmtV4(h)}`);
  if (i.acl.in) out.push(` ip access-group ${i.acl.in} in`);
  if (i.acl.out) out.push(` ip access-group ${i.acl.out} out`);
  if (i.nat) out.push(` ip nat ${i.nat}`);
  const o = i.ospf;
  if (o.net) out.push(` ip ospf network ${o.net}`);
  if (o.hello) out.push(` ip ospf hello-interval ${o.hello}`);
  if (o.dead) out.push(` ip ospf dead-interval ${o.dead}`);
  if (o.priority !== 1) out.push(` ip ospf priority ${o.priority}`);
  if (o.cost) out.push(` ip ospf cost ${o.cost}`);
  if (o.pid !== null) out.push(` ip ospf ${o.pid} area ${o.area}`);
  if (i.bw) out.push(` bandwidth ${i.bw}`);
  if (i.channel) out.push(` channel-group ${i.channel.group} mode ${i.channel.mode}`);
  if (i.portfast) out.push(' spanning-tree portfast');
  if (i.bpduguard) out.push(' spanning-tree bpduguard enable');
  if (i.clockRate) out.push(` clock rate ${i.clockRate}`);
  if (!i.cdp) out.push(' no cdp enable');
  if (/Ethernet/.test(i.name) && !isSubif(i.name) && (dev.kind === 'router' || i.speed !== 'auto' || i.duplex !== 'auto')) {
    if (i.duplex !== 'auto' || dev.kind === 'router') out.push(` duplex ${i.duplex}`);
    if (i.speed !== 'auto' || dev.kind === 'router') out.push(` speed ${i.speed}`);
  }
  if (i.v6Enabled) out.push(' ipv6 enable');
  for (const a of i.v6) {
    if (a.type === 'link-local') out.push(` ipv6 address ${fmtV6(a.addr)} link-local`);
    else if (a.type === 'eui-64') out.push(` ipv6 address ${fmtV6(a.addr)}/${a.len} eui-64`);
    else out.push(` ipv6 address ${fmtV6(a.addr)}/${a.len}`);
  }
  if (i.shutdown) out.push(' shutdown');
  return out;
}

export function runningConfig(dev) {
  const L = [];
  const bang = () => { if (L[L.length - 1] !== '!') L.push('!'); };
  L.push('!');
  L.push('version 15.2');
  L.push(dev.pwEncryption ? 'service password-encryption' : 'no service password-encryption');
  bang();
  L.push(`hostname ${dev.hostname}`);
  bang();
  if (dev.enableSecret) L.push(`enable secret 5 ${type5(dev.enableSecret)}`);
  if (dev.enablePassword) L.push(pw(dev, 'enable password', dev.enablePassword));
  bang();
  for (const [a, b] of dev.dhcp.excluded) L.push(`ip dhcp excluded-address ${fmtV4(a)}${b !== a ? ' ' + fmtV4(b) : ''}`);
  bang();
  for (const [name, p] of Object.entries(dev.dhcp.pools)) {
    L.push(`ip dhcp pool ${name}`);
    if (p.network) L.push(` network ${fmtV4(p.network)} ${lenToMask(p.len)}`);
    if (p.router) L.push(` default-router ${fmtV4(p.router)}`);
    if (p.dns.length) L.push(` dns-server ${p.dns.map(fmtV4).join(' ')}`);
    if (p.domain) L.push(` domain-name ${p.domain}`);
    if (p.lease) L.push(` lease ${p.lease}`);
    bang();
  }
  if (dev.domainName) L.push(`ip domain name ${dev.domainName}`);
  if (dev.kind === 'l3switch' && dev.ipRouting) L.push('ip routing');
  if (dev.v6Routing) L.push('ipv6 unicast-routing');
  bang();
  for (const [name, u] of Object.entries(dev.users)) {
    const priv = u.priv !== 1 ? ` privilege ${u.priv}` : '';
    if (u.secret) L.push(`username ${name}${priv} secret 5 ${type5(u.secret)}`);
    else L.push(pw(dev, `username ${name}${priv} password`, u.password));
  }
  bang();
  if (dev.kind === 'switch' || dev.kind === 'l3switch') {
    L.push(`spanning-tree mode ${dev.stp.mode}`);
    for (const [v, p] of Object.entries(dev.stp.priority)) L.push(`spanning-tree vlan ${v} priority ${p}`);
    bang();
    for (const [id, v] of Object.entries(dev.vlans)) {
      if (Number(id) === 1) continue;
      L.push(`vlan ${id}`);
      if (v.name !== `VLAN${String(id).padStart(4, '0')}`) L.push(` name ${v.name}`);
      bang();
    }
  }
  for (const i of sortedIntfs(dev)) {
    L.push(`interface ${i.name}`);
    L.push(...intfLines(dev, i));
    bang();
  }
  for (const [pid, o] of Object.entries(dev.ospf)) {
    L.push(`router ospf ${pid}`);
    if (o.rid !== null) L.push(` router-id ${fmtV4(o.rid)}`);
    if (o.refBw) L.push(` auto-cost reference-bandwidth ${o.refBw}`);
    if (o.passiveDefault) {
      L.push(' passive-interface default');
      for (const n of o.nonPassive) L.push(` no passive-interface ${n}`);
    } else {
      for (const n of o.passive) L.push(` passive-interface ${n}`);
    }
    for (const n of o.networks) L.push(` network ${fmtV4(n.addr)} ${fmtV4(n.wild)} area ${n.area}`);
    if (o.defaultOriginate) L.push(` default-information originate${o.defaultOriginate === 'always' ? ' always' : ''}`);
    bang();
  }
  if (dev.kind === 'router' || dev.ipRouting) L.push('ip forward-protocol nd');
  if (dev.kind !== 'router' && dev.defaultGw !== null) L.push(`ip default-gateway ${fmtV4(dev.defaultGw)}`);
  bang();
  for (const [name, p] of Object.entries(dev.nat.pools)) {
    L.push(`ip nat pool ${name} ${fmtV4(p.start)} ${fmtV4(p.end)} netmask ${lenToMask(p.len)}`);
  }
  for (const d of dev.nat.dynamic) {
    const target = d.intf ? `interface ${d.intf}` : `pool ${d.pool}`;
    L.push(`ip nat inside source list ${d.acl} ${target}${d.overload ? ' overload' : ''}`);
  }
  for (const s of dev.nat.statics) L.push(`ip nat inside source static ${fmtV4(s.local)} ${fmtV4(s.global)}`);
  for (const r of dev.statics.filter(r => r.fam === 4)) {
    const parts = [`ip route ${fmtV4(r.net)} ${lenToMask(r.len)}`];
    if (r.intf) parts.push(r.intf);
    if (r.nh !== null) parts.push(fmtV4(r.nh));
    if (r.ad !== 1) parts.push(String(r.ad));
    L.push(parts.join(' '));
  }
  bang();
  for (const [name, a] of Object.entries(dev.acls)) {
    if (!a.named) continue;
    L.push(`ip access-list ${a.type} ${name}`);
    for (const e of a.entries) L.push(` ${aclEntryText(e)}`);
    bang();
  }
  for (const r of dev.statics.filter(r => r.fam === 6)) {
    const parts = [`ipv6 route ${fmtV6(r.net)}/${r.len}`];
    if (r.intf) parts.push(r.intf);
    if (r.nh !== null) parts.push(fmtV6(r.nh));
    if (r.ad !== 1) parts.push(String(r.ad));
    L.push(parts.join(' '));
  }
  bang();
  const numbered = Object.entries(dev.acls).filter(([, a]) => !a.named).sort((x, y) => Number(x[0]) - Number(y[0]));
  for (const [name, a] of numbered) {
    for (const e of a.entries) L.push(`access-list ${name} ${aclEntryText(e)}`);
  }
  bang();
  for (const m of dev.misc) L.push(m);
  if (!dev.cdpRun) L.push('no cdp run');
  if (dev.lldpRun) L.push('lldp run');
  if (dev.sshVersion) L.push(`ip ssh version ${dev.sshVersion}`);
  bang();
  if (dev.banner !== null) L.push(`banner motd ^C${dev.banner}^C`);
  bang();
  L.push('line con 0');
  L.push(...lineBlock(dev.lines.con));
  L.push('line aux 0');
  for (const [a, b] of vtyGroups(dev.lines.vty)) {
    L.push(`line vty ${a} ${b}`);
    L.push(...lineBlock(dev.lines.vty[a]));
  }
  bang();
  for (const s of dev.ntp.servers) L.push(`ntp server ${fmtV4(s)}`);
  if (dev.ntp.master !== null) L.push(`ntp master${dev.ntp.master !== 8 ? ' ' + dev.ntp.master : ''}`);
  bang();
  L.push('end');
  const body = L.join('\n');
  return `Building configuration...\n\nCurrent configuration : ${body.length + 40} bytes\n${body}`;
}

// Lines of a block whose header matches `header` (like "| section").
export function section(cfg, header) {
  const lines = cfg.split('\n');
  const out = [];
  let inBlock = false;
  for (const l of lines) {
    if (!l.startsWith(' ')) inBlock = header.test(l);
    if (inBlock) out.push(l);
  }
  return out.join('\n');
}
