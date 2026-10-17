// Command definitions per mode: [pattern, handler, kinds?].
import { parseV4, fmtV4, maskToLen, lenToMask, netOf, inPrefix, parseV6Prefix, parseV6, parseList, maskOf, wildToLen } from './addr.js';
import { expandRange, isSubif, parentOf, typeOf } from './intf.js';
import { getIntf, newLine, runningConfig } from './device.js';
import { parseAce, addEntry, isStandardNum, isExtendedNum } from './acl.js';
import * as S from './show.js';
import { areaNum } from './net.js';

const R = ['router'];
const SW = ['switch', 'l3switch'];
const L3 = ['router', 'l3switch'];

const HOSTLIKE_DEFAULT = { router: 'Router', switch: 'Switch', l3switch: 'Switch' };

// ------------------------------------------------------------------ helpers
function eachIntf(s, fn) {
  const out = [];
  for (const n of s.ctx.intfs) {
    const r = fn(s.dev.intfs[n], n);
    if (r) out.push(r);
  }
  return out.join('\n') || undefined;
}

function badMask(addr, len) {
  if (len >= 31) return false;
  const host = addr & (maskOf(len) ^ 0xffffffffn);
  return host === 0n || host === (maskOf(len) ^ 0xffffffffn);
}

function setIp(s, i, ipT, maskT, secondary) {
  const d = s.dev;
  if (i.sw && !i.routed) return '% IP addresses may not be configured on L2 links.';
  if (isSubif(i.name) && !i.encap) {
    return '% Configuring IP routing on a LAN subinterface is only allowed if that\nsubinterface is already configured as part of an IEEE 802.10, IEEE 802.1Q,\nor ISL vLAN.';
  }
  const addr = parseV4(ipT);
  const len = maskToLen(maskT);
  if (len === null) return `Bad mask 0x${parseV4(maskT).toString(16).toUpperCase()} for address ${ipT}`;
  if (badMask(addr, len)) return `Bad mask /${len} for address ${ipT}`;
  for (const o of Object.values(d.intfs)) {
    if (o === i) continue;
    for (const a of [o.ip, ...o.secondary].filter(Boolean)) {
      const l = Math.min(len, a.len);
      if (netOf(addr, l) === netOf(a.addr, l)) return `% ${fmtV4(netOf(addr, len))} overlaps with ${o.name}`;
    }
  }
  if (secondary) {
    if (!i.ip) return '% Primary address is not configured';
    i.secondary = i.secondary.filter(x => x.addr !== addr);
    i.secondary.push({ addr, len });
  } else {
    i.ip = { addr, len };
    i.dhcp = false;
  }
  return undefined;
}

function ensureVlan(d, v) {
  if (!d.vlans[v]) d.vlans[v] = { name: `VLAN${String(v).padStart(4, '0')}` };
}

function swOnly(i) {
  if (!i.sw) return '% Invalid input detected at \'^\' marker.';
  if (i.routed) return '% Command not allowed on routed port';
  return null;
}

function pwText(raw) {
  const m = raw.match(/^0\s+(.+)$/);
  return m ? m[1] : raw;
}

function intfOrError(s, name, create) {
  const i = getIntf(s.dev, name, create);
  return i;
}

function lineTargets(s) {
  const d = s.dev;
  if (s.ctx.line === 'con') return [d.lines.con];
  return s.ctx.vty.map(n => d.lines.vty[n]);
}

function ospfProc(s) {
  return s.dev.ospf[s.ctx.pid];
}

function newOspf() {
  return { rid: null, networks: [], passive: [], passiveDefault: false, nonPassive: [], refBw: null, defaultOriginate: null, activeRid: null };
}

function addMisc(d, line, removePattern) {
  d.misc = d.misc.filter(m => !(removePattern || new RegExp(`^${line.split(' ').slice(0, 2).join(' ')}`)).test(m));
  if (line) d.misc.push(line);
}

// ------------------------------------------------------------------ show
export const SHOW = [
  ['show running-config', s => S.showRun(s)],
  ['show running-config interface <intf>', (s, v) => S.showRun(s, v[3])],
  ['show startup-config', s => S.showStartup(s)],
  ['show ip interface brief', s => S.ipIntBrief(s)],
  ['show ip interface <intf>', (s, v) => S.ipInterface(s, v[3])],
  ['show interfaces', s => S.showInterfaces(s)],
  ['show interfaces <intf>', (s, v) => S.showInterfaces(s, v[2])],
  ['show interfaces status', s => S.intStatus(s), SW],
  ['show interfaces trunk', s => S.showTrunk(s), SW],
  ['show interfaces <intf> switchport', (s, v) => S.showSwitchport(s, v[2]), SW],
  ['show ip route', s => S.showIpRoute(s)],
  ['show ip route {connected|static|ospf}', (s, v) => S.showIpRoute(s, v[3])],
  ['show ip route <ip>', (s, v) => S.showIpRoute(s, v[3])],
  ['show ipv6 route', s => S.showIpv6Route(s), L3],
  ['show ipv6 interface brief', s => S.ipv6IntBrief(s)],
  ['show ip ospf', s => S.showIpOspf(s), L3],
  ['show ip ospf neighbor', s => S.ospfNeighbor(s), L3],
  ['show ip ospf interface', s => S.ospfInterface(s), L3],
  ['show ip ospf interface brief', s => S.ospfIntBrief(s), L3],
  ['show ip ospf interface <intf>', (s, v) => S.ospfInterface(s, v[4]), L3],
  ['show ip protocols', s => S.showIpProtocols(s), L3],
  ['show vlan', s => S.vlanBrief(s), SW],
  ['show vlan brief', s => S.vlanBrief(s), SW],
  ['show mac address-table', s => S.macTable(s), SW],
  ['show mac address-table dynamic', s => S.macTable(s), SW],
  ['show cdp', s => (s.dev.cdpRun ? 'Global CDP information:\n        Sending CDP packets every 60 seconds\n        Sending a holdtime value of 180 seconds\n        Sending CDPv2 advertisements is  enabled' : '% CDP is not enabled')],
  ['show cdp neighbors', s => S.cdpNeighbors(s)],
  ['show cdp neighbors detail', s => S.cdpNeighbors(s, true)],
  ['show lldp neighbors', s => S.lldpNeighbors(s)],
  ['show etherchannel summary', s => S.etherSummary(s), SW],
  ['show access-lists', s => S.accessLists(s)],
  ['show access-lists <word>', (s, v) => S.accessLists({ ...s, dev: { ...s.dev, acls: s.dev.acls[v[2]] ? { [v[2]]: s.dev.acls[v[2]] } : {} } })],
  ['show ip access-lists', s => S.accessLists(s, true)],
  ['show ip nat translations', s => S.natTranslations(s), R],
  ['show ip nat statistics', s => S.natStatistics(s), R],
  ['show ip dhcp binding', s => S.dhcpBinding(s), L3],
  ['show ip dhcp pool', s => S.dhcpPool(s), L3],
  ['show version', s => S.showVersion(s)],
  ['show clock', s => S.showClock(s)],
  ['show ip ssh', s => S.showIpSsh(s)],
  ['show port-security', s => S.portSecurity(s), SW],
  ['show port-security interface <intf>', (s, v) => S.portSecurity(s, v[3]), SW],
  ['show spanning-tree', s => S.spanningTree(s), SW],
  ['show spanning-tree vlan <num:1-4094>', (s, v) => S.spanningTree(s, v[3]), SW],
  ['show ntp associations', s => S.ntpAssociations(s)],
  ['show ntp status', s => S.ntpStatus(s)],
  ['show arp', s => S.arpTable(s)],
  ['show ip arp', s => S.arpTable(s)],
  ['show history', s => s.history.slice(-10).map(h => `  ${h}`).join('\n')],
];

// ------------------------------------------------------------------ exec
const EXEC_COMMON = [
  ['ping <host>', (s, v) => s.console.ping(s, v[1])],
  ['ping <host> source <intf>', (s, v) => s.console.ping(s, v[1], { srcIntf: v[3] })],
  ['ping <host> source <ip>', (s, v) => s.console.ping(s, v[1], { srcIp: v[3] })],
  ['ping <host> repeat <num:1-100>', (s, v) => s.console.ping(s, v[1], { repeat: v[3] })],
  ['ping ipv6 <v6>', (s, v) => s.console.ping(s, v[2])],
  ['traceroute <host>', (s, v) => s.console.traceroute(s, v[1])],
  ['telnet <host>', (s, v) => s.console.connect(s, v[1], 'telnet')],
  ['ssh -l <word> <host>', (s, v) => s.console.connect(s, v[3], 'ssh', v[2])],
  ['terminal length <num>', () => undefined],
  ['terminal monitor', () => undefined],
  ['{exit|logout|quit}', s => s.console.exitSession(s)],
];

export const USER = [
  ['enable', s => s.console.enable(s)],
  ...EXEC_COMMON,
  ...SHOW.filter(([p]) => !/running-config|startup-config/.test(p)),
];

export const EXEC = [
  ['enable', () => undefined],
  ['disable', s => { s.mode = 'user'; }],
  ['configure terminal', s => { s.mode = 'config'; return 'Enter configuration commands, one per line.  End with CNTL/Z.'; }],
  ['configure', s => s.ask('Configuring from terminal, memory, or network [terminal]? ', (ans) => {
    if (ans.trim() && !'terminal'.startsWith(ans.trim().toLowerCase())) return '?Must be "terminal", "memory" or "network"';
    s.mode = 'config';
    return 'Enter configuration commands, one per line.  End with CNTL/Z.';
  })],
  ['copy running-config startup-config', s => s.ask('Destination filename [startup-config]? ', () => s.console.save(s))],
  ['copy startup-config running-config', s => s.console.loadStartup(s)],
  ['write', s => s.console.save(s)],
  ['write memory', s => s.console.save(s)],
  ['erase startup-config', s => s.ask('Erasing the nvram filesystem will remove all configuration files! Continue? [confirm]', (ans) => {
    if (ans.trim() && !/^y/i.test(ans.trim())) return '';
    s.dev.saved = null;
    return '[OK]\nErase of nvram: complete';
  })],
  ['reload', s => s.ask('Proceed with reload? [confirm]', (ans) => {
    if (ans.trim() && !/^y/i.test(ans.trim())) return '';
    return s.console.reload(s);
  })],
  ['clear ip ospf process', s => s.ask('Reset ALL OSPF processes? [no]: ', (ans) => {
    if (!/^y/i.test(ans.trim())) return '';
    for (const o of Object.values(s.dev.ospf)) o.activeRid = null;
    s.lab.ospfReset = true;
    return undefined;
  }), L3],
  ['clear ip nat translation *', s => { s.net.natTable[s.dev.name] = []; }, R],
  ['clear mac address-table dynamic', () => undefined, SW],
  ['clear counters', s => s.ask('Clear "show interface" counters on all interfaces [confirm]', () => undefined)],
  ['clear arp-cache', s => { s.net.arpSeen.clear(); }],
  ...EXEC_COMMON,
  ...SHOW,
];

// ------------------------------------------------------------------ global config
const CONFIG_TAIL = [
  ['end', s => s.console.endConfig(s)],
  ['exit', s => s.console.exitMode(s)],
  ['do <line>', (s, v) => s.console.doExec(s, v[1])],
];

export const CONFIG = [
  ['hostname <word>', (s, v) => { s.dev.hostname = v[1]; }],
  ['no hostname', s => { s.dev.hostname = HOSTLIKE_DEFAULT[s.dev.kind]; }],
  ['enable secret <line>', (s, v) => {
    const pw = pwText(v[2]);
    if (s.dev.enablePassword === pw) {
      // IOS accepts it but warns.
      s.dev.enableSecret = pw;
      return 'The enable secret you have chosen is the same as your enable password.\nThis is not recommended.  Re-enter the enable secret.';
    }
    s.dev.enableSecret = pw;
  }],
  ['enable password <line>', (s, v) => {
    const pw = pwText(v[2]);
    if (s.dev.enableSecret === pw) return 'The enable password you have chosen is the same as your enable secret.\nThis is not recommended.  Re-enter the enable password.';
    s.dev.enablePassword = pw;
  }],
  ['no enable secret', s => { s.dev.enableSecret = null; }],
  ['no enable password', s => { s.dev.enablePassword = null; }],
  ['username <word> {secret|password} <line>', (s, v) => { s.dev.users[v[1]] = { priv: 1, [v[2]]: pwText(v[3]) }; }],
  ['username <word> privilege <num:0-15> {secret|password} <line>', (s, v) => { s.dev.users[v[1]] = { priv: v[3], [v[4]]: pwText(v[5]) }; }],
  ['no username <word>', (s, v) => { delete s.dev.users[v[2]]; }],
  ['service password-encryption', s => {
    s.dev.pwEncryption = true;
    s.dev.lines.con.pwEnc = !!s.dev.lines.con.password;
    for (const l of s.dev.lines.vty) l.pwEnc = !!l.password;
  }],
  ['no service password-encryption', s => { s.dev.pwEncryption = false; }],
  ['ip domain-name <word>', (s, v) => { s.dev.domainName = v[2]; }],
  ['ip domain name <word>', (s, v) => { s.dev.domainName = v[3]; }],
  ['no ip domain-name', s => { s.dev.domainName = null; }],
  ['no ip domain name', s => { s.dev.domainName = null; }],
  ['no ip domain-lookup', s => { s.dev.noLookup = true; addMisc(s.dev, 'no ip domain lookup', /^no ip domain lookup/); }],
  ['no ip domain lookup', s => { s.dev.noLookup = true; addMisc(s.dev, 'no ip domain lookup', /^no ip domain lookup/); }],
  ['ip domain-lookup', s => { s.dev.noLookup = false; s.dev.misc = s.dev.misc.filter(m => m !== 'no ip domain lookup'); }],
  ['crypto key generate rsa', s => s.console.genRsa(s, null)],
  ['crypto key generate rsa modulus <num:360-4096>', (s, v) => s.console.genRsa(s, v[5])],
  ['crypto key generate rsa general-keys modulus <num:360-4096>', (s, v) => s.console.genRsa(s, v[6])],
  ['crypto key zeroize rsa', s => s.ask('% All keys will be removed.\n% All router certs issued using these keys will also be removed.\nDo you really want to remove these keys? [yes/no]: ', (a) => {
    if (/^y/i.test(a.trim())) { s.dev.rsaBits = 0; return '%SSH-5-DISABLED: SSH 1.99 has been disabled'; }
    return '';
  })],
  ['ip ssh version <num:1-2>', (s, v) => {
    if (v[3] === 2 && s.dev.rsaBits < 768) return 'Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).';
    s.dev.sshVersion = v[3];
  }],
  ['no ip ssh version', s => { s.dev.sshVersion = null; }],
  ['banner motd <line>', (s, v) => s.console.banner(s, v[2])],
  ['no banner motd', s => { s.dev.banner = null; }],
  ['interface <intf>', (s, v) => {
    const i = intfOrError(s, v[1], true);
    if (!i) return '                ^\n% Invalid input detected at \'^\' marker.';
    s.mode = isSubif(i.name) ? 'subif' : 'if';
    s.ctx = { intfs: [i.name] };
  }],
  ['interface range <line>', (s, v) => {
    const r = expandRange(v[2]);
    if (r.error || r.list.some(n => !s.dev.intfs[n])) return '% Command rejected: Bad interface range';
    s.mode = 'range';
    s.ctx = { intfs: r.list };
  }],
  ['no interface <intf>', (s, v) => {
    const n = v[2];
    const t = typeOf(n);
    if (!s.dev.intfs[n]) return undefined;
    if (!(isSubif(n) || ['Loopback', 'Vlan', 'Port-channel', 'Tunnel'].includes(t))) return '% Removal of physical interfaces is not permitted';
    if (t === 'Port-channel') for (const i of Object.values(s.dev.intfs)) if (i.channel && i.channel.group === Number(n.replace('Port-channel', ''))) i.channel = null;
    delete s.dev.intfs[n];
  }],
  ['vlan <list>', (s, v) => {
    const ids = parseList(v[1]);
    for (const id of ids) {
      if (id >= 1002 && id <= 1005) return `Default VLAN ${id} may not have its name changed.`;
      if (id > 1005 && !(s.dev.vtp === 'transparent')) { /* extended range accepted on IOS 15 */ }
      ensureVlan(s.dev, id);
    }
    s.mode = 'vlan';
    s.ctx = { vlans: ids };
  }, SW],
  ['no vlan <list>', (s, v) => {
    for (const id of parseList(v[2])) {
      if (id === 1 || (id >= 1002 && id <= 1005)) return `Default VLAN ${id} may not be deleted.`;
      delete s.dev.vlans[id];
    }
  }, SW],
  ['ip routing', s => { s.dev.ipRouting = true; }, ['l3switch']],
  ['no ip routing', s => { s.dev.ipRouting = false; }, ['l3switch']],
  ['ip default-gateway <ip>', (s, v) => { s.dev.defaultGw = parseV4(v[2]); }, SW],
  ['no ip default-gateway', s => { s.dev.defaultGw = null; }, SW],
  ['ip route <ip> <mask> <ip>', (s, v) => staticRoute(s, v[2], v[3], { nh: v[4] }), L3],
  ['ip route <ip> <mask> <ip> <num:1-255>', (s, v) => staticRoute(s, v[2], v[3], { nh: v[4], ad: v[5] }), L3],
  ['ip route <ip> <mask> <intf>', (s, v) => staticRoute(s, v[2], v[3], { intf: v[4] }), L3],
  ['ip route <ip> <mask> <intf> <num:1-255>', (s, v) => staticRoute(s, v[2], v[3], { intf: v[4], ad: v[5] }), L3],
  ['ip route <ip> <mask> <intf> <ip>', (s, v) => staticRoute(s, v[2], v[3], { intf: v[4], nh: v[5] }), L3],
  ['ip route <ip> <mask> <intf> <ip> <num:1-255>', (s, v) => staticRoute(s, v[2], v[3], { intf: v[4], nh: v[5], ad: v[6] }), L3],
  ['no ip route <ip> <mask>', (s, v) => noStatic(s, 4, v[3], v[4]), L3],
  ['no ip route <ip> <mask> <ip>', (s, v) => noStatic(s, 4, v[3], v[4], v[5]), L3],
  ['no ip route <ip> <mask> <ip> <num:1-255>', (s, v) => noStatic(s, 4, v[3], v[4], v[5]), L3],
  ['no ip route <ip> <mask> <intf>', (s, v) => noStatic(s, 4, v[3], v[4], null, v[5]), L3],
  ['no ip route <ip> <mask> <intf> <ip>', (s, v) => noStatic(s, 4, v[3], v[4], v[6], v[5]), L3],
  ['ipv6 unicast-routing', s => { s.dev.v6Routing = true; }, L3],
  ['no ipv6 unicast-routing', s => { s.dev.v6Routing = false; }, L3],
  ['ipv6 route <v6pfx> <v6>', (s, v) => staticRoute6(s, v[2], { nh: v[3] }), L3],
  ['ipv6 route <v6pfx> <v6> <num:1-254>', (s, v) => staticRoute6(s, v[2], { nh: v[3], ad: v[4] }), L3],
  ['ipv6 route <v6pfx> <intf>', (s, v) => staticRoute6(s, v[2], { intf: v[3] }), L3],
  ['ipv6 route <v6pfx> <intf> <v6>', (s, v) => staticRoute6(s, v[2], { intf: v[3], nh: v[4] }), L3],
  ['ipv6 route <v6pfx> <intf> <v6> <num:1-254>', (s, v) => staticRoute6(s, v[2], { intf: v[3], nh: v[4], ad: v[5] }), L3],
  ['no ipv6 route <v6pfx>', (s, v) => { const p = parseV6Prefix(v[3]); s.dev.statics = s.dev.statics.filter(r => !(r.fam === 6 && r.net === netOf(p.addr, p.len, 6) && r.len === p.len)); }, L3],
  ['no ipv6 route <v6pfx> <v6>', (s, v) => { const p = parseV6Prefix(v[3]); const nh = parseV6(v[4]); s.dev.statics = s.dev.statics.filter(r => !(r.fam === 6 && r.net === netOf(p.addr, p.len, 6) && r.len === p.len && r.nh === nh)); }, L3],
  ['router ospf <num:1-65535>', (s, v) => {
    if (!s.dev.ospf[v[2]]) s.dev.ospf[v[2]] = newOspf();
    s.mode = 'router';
    s.ctx = { pid: v[2] };
  }, L3],
  ['no router ospf <num:1-65535>', (s, v) => { delete s.dev.ospf[v[3]]; }, L3],
  ['access-list <num:1-2699> remark <line>', (s, v) => {
    const n = String(v[1]);
    if (!isStandardNum(n) && !isExtendedNum(n)) return '% Invalid access list number';
    const a = s.dev.acls[n] ||= { type: isStandardNum(n) ? 'standard' : 'extended', named: false, entries: [] };
    addEntry(a, { remark: v[3] });
  }],
  ['access-list <num:1-2699> {permit|deny} <line>', (s, v) => {
    const n = String(v[1]);
    const type = isStandardNum(n) ? 'standard' : isExtendedNum(n) ? 'extended' : null;
    if (!type) return '% Invalid access list number';
    const e = parseAce(type, v[2], v[3]);
    if (e.error !== undefined) return s.caret(v[3], e.error);
    const a = s.dev.acls[n] ||= { type, named: false, entries: [] };
    return addEntry(a, e) || undefined;
  }],
  ['no access-list <num:1-2699>', (s, v) => { delete s.dev.acls[String(v[2])]; }],
  ['ip access-list {standard|extended} <word>', (s, v) => {
    const name = v[3];
    const type = v[2];
    if (/^\d+$/.test(name) && ((type === 'standard' && !isStandardNum(name)) || (type === 'extended' && !isExtendedNum(name)))) return '% Invalid access list name.';
    const cur = s.dev.acls[name];
    if (cur && cur.type !== type) return `% A named ${cur.type} IP access list with this name already exists`;
    s.dev.acls[name] ||= { type, named: !/^\d+$/.test(name), entries: [] };
    s.mode = type === 'standard' ? 'nacl-std' : 'nacl-ext';
    s.ctx = { acl: name };
  }],
  ['no ip access-list {standard|extended} <word>', (s, v) => { delete s.dev.acls[v[4]]; }],
  ['ip nat inside source static <ip> <ip>', (s, v) => {
    const local = parseV4(v[5]), global = parseV4(v[6]);
    s.dev.nat.statics = s.dev.nat.statics.filter(x => x.local !== local);
    s.dev.nat.statics.push({ local, global });
  }, R],
  ['no ip nat inside source static <ip> <ip>', (s, v) => {
    const local = parseV4(v[6]);
    s.dev.nat.statics = s.dev.nat.statics.filter(x => x.local !== local);
  }, R],
  ['ip nat inside source list <word> interface <intf> [overload]', (s, v) => {
    s.dev.nat.dynamic = s.dev.nat.dynamic.filter(d => d.acl !== v[5]);
    s.dev.nat.dynamic.push({ acl: v[5], intf: v[7], overload: v[8] === 'overload' });
  }, R],
  ['ip nat inside source list <word> pool <word> [overload]', (s, v) => {
    s.dev.nat.dynamic = s.dev.nat.dynamic.filter(d => d.acl !== v[5]);
    s.dev.nat.dynamic.push({ acl: v[5], pool: v[7], overload: v[8] === 'overload' });
  }, R],
  ['no ip nat inside source list <word> [<line>]', (s, v) => { s.dev.nat.dynamic = s.dev.nat.dynamic.filter(d => d.acl !== v[6]); }, R],
  ['ip nat pool <word> <ip> <ip> netmask <mask>', (s, v) => natPool(s, v[3], v[4], v[5], maskToLen(v[7])), R],
  ['ip nat pool <word> <ip> <ip> prefix-length <num:1-32>', (s, v) => natPool(s, v[3], v[4], v[5], v[7]), R],
  ['no ip nat pool <word>', (s, v) => { delete s.dev.nat.pools[v[4]]; }, R],
  ['ip dhcp excluded-address <ip>', (s, v) => { const a = parseV4(v[3]); s.dev.dhcp.excluded.push([a, a]); }, L3],
  ['ip dhcp excluded-address <ip> <ip>', (s, v) => { s.dev.dhcp.excluded.push([parseV4(v[3]), parseV4(v[4])]); }, L3],
  ['no ip dhcp excluded-address <ip> [<ip>]', (s, v) => { const a = parseV4(v[4]); s.dev.dhcp.excluded = s.dev.dhcp.excluded.filter(([x]) => x !== a); }, L3],
  ['ip dhcp pool <word>', (s, v) => {
    s.dev.dhcp.pools[v[3]] ||= { name: v[3], network: null, len: 24, router: null, dns: [], domain: null, lease: null };
    s.mode = 'dhcp';
    s.ctx = { pool: v[3] };
  }, L3],
  ['no ip dhcp pool <word>', (s, v) => { delete s.dev.dhcp.pools[v[4]]; }, L3],
  ['line {console|con} 0', s => { s.mode = 'line'; s.ctx = { line: 'con' }; }],
  ['line vty <num:0-15>', (s, v) => { s.mode = 'line'; s.ctx = { line: 'vty', vty: [v[2]] }; }],
  ['line vty <num:0-15> <num:0-15>', (s, v) => {
    if (v[3] < v[2]) return '% Invalid input detected at \'^\' marker.';
    s.mode = 'line';
    s.ctx = { line: 'vty', vty: Array.from({ length: v[3] - v[2] + 1 }, (_, k) => v[2] + k) };
  }],
  ['ntp server <ip>', (s, v) => { const a = parseV4(v[2]); if (!s.dev.ntp.servers.includes(a)) s.dev.ntp.servers.push(a); }],
  ['no ntp server <ip>', (s, v) => { const a = parseV4(v[3]); s.dev.ntp.servers = s.dev.ntp.servers.filter(x => x !== a); }],
  ['ntp master [<num:1-15>]', (s, v) => { s.dev.ntp.master = v[2] || 8; }],
  ['no ntp master', s => { s.dev.ntp.master = null; }],
  ['spanning-tree mode {pvst|rapid-pvst|mst}', (s, v) => { s.dev.stp.mode = v[2]; }, SW],
  ['spanning-tree vlan <list> priority <num:0-61440>', (s, v) => {
    if (v[4] % 4096) return '% Bridge Priority must be in increments of 4096.\n% Allowed values are:\n  0     4096  8192  12288 16384 20480 24576 28672\n  32768 36864 40960 45056 49152 53248 57344 61440';
    for (const id of parseList(v[2])) s.dev.stp.priority[id] = v[4];
  }, SW],
  ['spanning-tree vlan <list> root {primary|secondary}', (s, v) => {
    for (const id of parseList(v[2])) s.dev.stp.priority[id] = v[4] === 'primary' ? 24576 : 28672;
  }, SW],
  ['no spanning-tree vlan <list> priority', (s, v) => { for (const id of parseList(v[3])) delete s.dev.stp.priority[id]; }, SW],
  ['cdp run', s => { s.dev.cdpRun = true; }],
  ['no cdp run', s => { s.dev.cdpRun = false; }],
  ['lldp run', s => { s.dev.lldpRun = true; }],
  ['no lldp run', s => { s.dev.lldpRun = false; }],
  ['logging host <ip>', (s, v) => addMisc(s.dev, `logging host ${v[2]}`, new RegExp(`^logging host ${v[2].replace(/\./g, '\\.')}$`))],
  ['logging <ip>', (s, v) => addMisc(s.dev, `logging host ${v[1]}`, new RegExp(`^logging host ${v[1].replace(/\./g, '\\.')}$`))],
  ['logging trap <word>', (s, v) => addMisc(s.dev, `logging trap ${v[2]}`, /^logging trap /)],
  ['logging buffered [<line>]', (s, v) => addMisc(s.dev, `logging buffered${v[2] ? ' ' + v[2] : ''}`, /^logging buffered/)],
  ['snmp-server community <word> {ro|rw} [<word>]', (s, v) => addMisc(s.dev, `snmp-server community ${v[2]} ${v[3].toUpperCase()}${v[4] ? ' ' + v[4] : ''}`, new RegExp(`^snmp-server community ${v[2]} `))],
  ['snmp-server location <line>', (s, v) => addMisc(s.dev, `snmp-server location ${v[2]}`, /^snmp-server location/)],
  ['snmp-server contact <line>', (s, v) => addMisc(s.dev, `snmp-server contact ${v[2]}`, /^snmp-server contact/)],
  ['snmp-server host <ip> <line>', (s, v) => addMisc(s.dev, `snmp-server host ${v[2]} ${v[3]}`, new RegExp(`^snmp-server host ${v[2].replace(/\./g, '\\.')} `))],
  ['clock timezone <line>', (s, v) => addMisc(s.dev, `clock timezone ${v[2]}`, /^clock timezone/)],
  ['ip http server', s => addMisc(s.dev, 'ip http server', /^(no )?ip http server$/)],
  ['no ip http server', s => addMisc(s.dev, 'no ip http server', /^(no )?ip http server$/)],
  ['ip http secure-server', s => addMisc(s.dev, 'ip http secure-server', /^(no )?ip http secure-server$/)],
  ['no ip http secure-server', s => addMisc(s.dev, 'no ip http secure-server', /^(no )?ip http secure-server$/)],
  ['vtp mode {transparent|server|client|off}', (s, v) => { s.dev.vtp = v[2]; addMisc(s.dev, `vtp mode ${v[2]}`, /^vtp mode/); return `Setting device to VTP ${v[2].toUpperCase()} mode for VLANS.`; }, SW],
  ['ip dhcp snooping', s => addMisc(s.dev, 'ip dhcp snooping', /^ip dhcp snooping$/), SW],
  ['ip dhcp snooping vlan <list>', (s, v) => addMisc(s.dev, `ip dhcp snooping vlan ${v[4]}`, /^ip dhcp snooping vlan/), SW],
  ['ip arp inspection vlan <list>', (s, v) => addMisc(s.dev, `ip arp inspection vlan ${v[4]}`, /^ip arp inspection vlan/), SW],
  ...CONFIG_TAIL,
];

function staticRoute(s, netT, maskT, o) {
  const d = s.dev;
  const net = parseV4(netT);
  const len = maskToLen(maskT);
  if (len === null || netOf(net, len) !== net) return '%Inconsistent address and mask';
  let nh = null;
  if (o.nh) {
    nh = parseV4(o.nh);
    if (Object.values(d.intfs).some(i => i.ip && i.ip.addr === nh)) return '%Invalid next hop address (it\'s this router)';
  }
  if (o.intf && !d.intfs[o.intf]) return '% Invalid input detected at \'^\' marker.';
  const ad = o.ad || 1;
  d.statics = d.statics.filter(r => !(r.fam === 4 && r.net === net && r.len === len && r.nh === nh && (r.intf || null) === (o.intf || null)));
  d.statics.push({ fam: 4, net, len, nh, intf: o.intf || null, ad });
}

function noStatic(s, fam, netT, maskT, nhT, intf) {
  const net = parseV4(netT), len = maskToLen(maskT);
  const nh = nhT ? parseV4(nhT) : undefined;
  const before = s.dev.statics.length;
  s.dev.statics = s.dev.statics.filter(r => !(r.fam === fam && r.net === net && r.len === len &&
    (nh === undefined || r.nh === nh) && (intf === undefined || r.intf === intf)));
  if (s.dev.statics.length === before) return '%No matching route to delete';
}

function staticRoute6(s, pfxT, o) {
  const p = parseV6Prefix(pfxT);
  const net = netOf(p.addr, p.len, 6);
  const nh = o.nh ? parseV6(o.nh) : null;
  if (o.intf && !s.dev.intfs[o.intf]) return '% Invalid input detected at \'^\' marker.';
  if (nh !== null && (nh >> 118n) === 0x3fan && !o.intf) return '% Interface has to be specified for a link-local nexthop';
  s.dev.statics = s.dev.statics.filter(r => !(r.fam === 6 && r.net === net && r.len === p.len && r.nh === nh));
  s.dev.statics.push({ fam: 6, net, len: p.len, nh, intf: o.intf || null, ad: o.ad || 1 });
}

function natPool(s, name, a, b, len) {
  const start = parseV4(a), end = parseV4(b);
  if (len === null || end < start) return '%Pool ' + name + ' mask ' + lenToMask(len || 0) + ' too small; should be at least ' + lenToMask(32);
  if (netOf(start, len) !== netOf(end, len)) return `%End address not on same subnet as start address`;
  s.dev.nat.pools[name] = { start, end, len };
}

// ------------------------------------------------------------------ interface
export const INTF = [
  ['description <line>', (s, v) => eachIntf(s, i => { i.desc = v[1]; })],
  ['no description', s => eachIntf(s, i => { i.desc = null; })],
  ['ip address <ip> <mask>', (s, v) => eachIntf(s, i => setIp(s, i, v[2], v[3], false))],
  ['ip address <ip> <mask> secondary', (s, v) => eachIntf(s, i => setIp(s, i, v[2], v[3], true))],
  ['ip address dhcp', s => eachIntf(s, i => {
    if (i.sw && !i.routed) return '% IP addresses may not be configured on L2 links.';
    i.dhcp = true; i.ip = null;
  })],
  ['no ip address', s => eachIntf(s, i => { i.ip = null; i.secondary = []; i.dhcp = false; })],
  ['no ip address <ip> <mask>', (s, v) => eachIntf(s, i => {
    const a = parseV4(v[3]);
    if (i.ip && i.ip.addr === a) { i.ip = null; i.secondary = []; return undefined; }
    i.secondary = i.secondary.filter(x => x.addr !== a);
  })],
  ['shutdown', s => eachIntf(s, i => { i.shutdown = true; i.errDisabled = false; })],
  ['no shutdown', s => eachIntf(s, i => { i.shutdown = false; })],
  ['ipv6 address <v6pfx>', (s, v) => eachIntf(s, i => setV6(i, v[2], 'global'))],
  ['ipv6 address <v6pfx> eui-64', (s, v) => eachIntf(s, i => setV6(i, v[2], 'eui-64'))],
  ['ipv6 address <v6> link-local', (s, v) => eachIntf(s, i => {
    if ((parseV6(v[2]) >> 118n) !== 0x3fan) return '% Invalid link-local address';
    i.v6 = i.v6.filter(a => a.type !== 'link-local');
    i.v6.push({ addr: parseV6(v[2]), len: 64, type: 'link-local' });
  })],
  ['ipv6 enable', s => eachIntf(s, i => { i.v6Enabled = true; })],
  ['no ipv6 enable', s => eachIntf(s, i => { i.v6Enabled = false; })],
  ['no ipv6 address', s => eachIntf(s, i => { i.v6 = []; })],
  ['no ipv6 address <v6pfx> [eui-64]', (s, v) => eachIntf(s, i => {
    const p = parseV6Prefix(v[3]);
    i.v6 = i.v6.filter(a => !(a.addr === p.addr && a.len === p.len));
  })],
  ['switchport', s => eachIntf(s, i => { if (i.sw) i.routed = false; }), ['l3switch']],
  ['no switchport', s => eachIntf(s, i => {
    if (!i.sw) return undefined;
    i.routed = true;
  }), ['l3switch']],
  ['switchport mode {access|trunk}', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    i.sw.mode = v[2];
  }), SW],
  ['switchport mode dynamic {auto|desirable}', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    if (i.ps && i.ps.enabled) return `Command rejected: ${i.name} is a port-security enabled port.`;
    i.sw.mode = `dynamic ${v[3]}`;
  }), SW],
  ['no switchport mode', s => eachIntf(s, i => { if (i.sw) i.sw.mode = 'dynamic auto'; }), SW],
  ['switchport access vlan <num:1-4094>', (s, v) => {
    const out = [];
    if (!s.dev.vlans[v[3]]) {
      out.push(`% Access VLAN does not exist. Creating vlan ${v[3]}`);
      ensureVlan(s.dev, v[3]);
    }
    const r = eachIntf(s, i => { const e = swOnly(i); if (e) return e; i.sw.access = v[3]; });
    if (r) out.push(r);
    return out.join('\n') || undefined;
  }, SW],
  ['no switchport access vlan', s => eachIntf(s, i => { if (i.sw) i.sw.access = 1; }), SW],
  ['switchport voice vlan <num:1-4094>', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    ensureVlan(s.dev, v[3]);
    i.sw.voice = v[3];
  }), SW],
  ['no switchport voice vlan', s => eachIntf(s, i => { if (i.sw) i.sw.voice = null; }), SW],
  ['switchport trunk native vlan <num:1-4094>', (s, v) => eachIntf(s, i => { const e = swOnly(i); if (e) return e; i.sw.native = v[4]; }), SW],
  ['no switchport trunk native vlan', s => eachIntf(s, i => { if (i.sw) i.sw.native = 1; }), SW],
  ['switchport trunk allowed vlan <list>', (s, v) => eachIntf(s, i => { const e = swOnly(i); if (e) return e; i.sw.allowed = parseList(v[4]); }), SW],
  ['switchport trunk allowed vlan add <list>', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    if (!i.sw.allowed) return undefined;
    i.sw.allowed = [...new Set([...i.sw.allowed, ...parseList(v[5])])].sort((a, b) => a - b);
  }), SW],
  ['switchport trunk allowed vlan remove <list>', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    const rm = parseList(v[5]);
    const base = i.sw.allowed || Array.from({ length: 4094 }, (_, k) => k + 1);
    i.sw.allowed = base.filter(x => !rm.includes(x));
  }), SW],
  ['switchport trunk allowed vlan except <list>', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    const rm = parseList(v[5]);
    i.sw.allowed = Array.from({ length: 4094 }, (_, k) => k + 1).filter(x => !rm.includes(x));
  }), SW],
  ['switchport trunk allowed vlan {all|none}', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    i.sw.allowed = v[4] === 'all' ? null : [];
  }), SW],
  ['no switchport trunk allowed vlan', s => eachIntf(s, i => { if (i.sw) i.sw.allowed = null; }), SW],
  ['switchport trunk encapsulation dot1q', () => undefined, ['l3switch']],
  ['switchport nonegotiate', s => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    if (i.sw.mode.startsWith('dynamic')) return 'Command rejected: Conflict between \'nonegotiate\' and \'dynamic\' status.';
    i.sw.nonegotiate = true;
  }), SW],
  ['no switchport nonegotiate', s => eachIntf(s, i => { if (i.sw) i.sw.nonegotiate = false; }), SW],
  ['switchport port-security', s => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    if (i.sw.mode.startsWith('dynamic')) return `Command rejected: ${i.name} is a dynamic port.`;
    psOf(i).enabled = true;
  }), SW],
  ['no switchport port-security', s => eachIntf(s, i => { if (i.ps) i.ps.enabled = false; }), SW],
  ['switchport port-security maximum <num:1-132>', (s, v) => eachIntf(s, i => { const e = swOnly(i); if (e) return e; psOf(i).max = v[3]; }), SW],
  ['switchport port-security violation {protect|restrict|shutdown}', (s, v) => eachIntf(s, i => { const e = swOnly(i); if (e) return e; psOf(i).violation = v[3]; }), SW],
  ['switchport port-security mac-address sticky', s => eachIntf(s, i => { const e = swOnly(i); if (e) return e; psOf(i).sticky = true; }), SW],
  ['no switchport port-security mac-address sticky', s => eachIntf(s, i => { if (i.ps) { i.ps.sticky = false; i.ps.macs = []; } }), SW],
  ['switchport port-security mac-address <word>', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    const mac = normMac(v[3]);
    if (!mac) return '% Invalid input detected at \'^\' marker.';
    const ps = psOf(i);
    if (!ps.macs.includes(mac)) ps.macs.push(mac);
  }), SW],
  ['switchport port-security mac-address sticky <word>', (s, v) => eachIntf(s, i => {
    const e = swOnly(i); if (e) return e;
    const mac = normMac(v[4]);
    if (!mac) return '% Invalid input detected at \'^\' marker.';
    const ps = psOf(i);
    ps.sticky = true;
    if (!ps.macs.includes(mac)) ps.macs.push(mac);
  }), SW],
  ['spanning-tree portfast', s => {
    const r = eachIntf(s, i => { i.portfast = true; });
    return r || '%Warning: portfast should only be enabled on ports connected to a single\n host. Connecting hubs, concentrators, switches, bridges, etc... to this\n interface  when portfast is enabled, can cause temporary bridging loops.\n Use with CAUTION';
  }, SW],
  ['no spanning-tree portfast', s => eachIntf(s, i => { i.portfast = false; }), SW],
  ['spanning-tree bpduguard enable', s => eachIntf(s, i => { i.bpduguard = true; }), SW],
  ['no spanning-tree bpduguard', s => eachIntf(s, i => { i.bpduguard = false; }), SW],
  ['channel-group <num:1-48> mode {active|passive|on|desirable|auto}', (s, v) => {
    const d = s.dev;
    const g = v[1];
    const mode = v[3];
    const proto = m => (['active', 'passive'].includes(m) ? 'lacp' : ['desirable', 'auto'].includes(m) ? 'pagp' : 'on');
    const existing = Object.values(d.intfs).find(i => i.channel && i.channel.group === g && !s.ctx.intfs.includes(i.name));
    if (existing && proto(existing.channel.mode) !== proto(mode)) {
      return `Command rejected (Channel protocol mismatch for interface ${s.ctx.intfs[0]} in group ${g}): the interface can not be added to the channel group`;
    }
    const out = [];
    const poName = `Port-channel${g}`;
    if (!d.intfs[poName]) {
      const first = d.intfs[s.ctx.intfs[0]];
      const po = getIntf(d, poName, true);
      if (po.sw && first.sw) po.sw = { ...first.sw };
      if (first.routed) po.routed = true;
      out.push(`Creating a port-channel interface Port-channel ${g}`);
    }
    eachIntf(s, i => { i.channel = { group: g, mode }; });
    return out.join('\n') || undefined;
  }, SW],
  ['no channel-group', s => eachIntf(s, i => { i.channel = null; }), SW],
  ['encapsulation dot1Q <num:1-4094>', (s, v) => subEncap(s, v[2], false), R],
  ['encapsulation dot1Q <num:1-4094> native', (s, v) => subEncap(s, v[2], true), R],
  ['ip ospf <num:1-65535> area <word>', (s, v) => eachIntf(s, i => {
    if (Number.isNaN(areaNum(v[4]))) return '% Invalid input detected at \'^\' marker.';
    if (!s.dev.ospf[v[2]]) s.dev.ospf[v[2]] = newOspf();
    i.ospf.pid = v[2]; i.ospf.area = v[4];
  }), L3],
  ['no ip ospf <num:1-65535> area <word>', s => eachIntf(s, i => { i.ospf.pid = null; i.ospf.area = null; }), L3],
  ['ip ospf cost <num:1-65535>', (s, v) => eachIntf(s, i => { i.ospf.cost = v[3]; }), L3],
  ['no ip ospf cost', s => eachIntf(s, i => { i.ospf.cost = null; }), L3],
  ['ip ospf priority <num:0-255>', (s, v) => eachIntf(s, i => { i.ospf.priority = v[3]; }), L3],
  ['no ip ospf priority', s => eachIntf(s, i => { i.ospf.priority = 1; }), L3],
  ['ip ospf hello-interval <num:1-65535>', (s, v) => eachIntf(s, i => { i.ospf.hello = v[3]; }), L3],
  ['no ip ospf hello-interval', s => eachIntf(s, i => { i.ospf.hello = null; }), L3],
  ['ip ospf dead-interval <num:1-65535>', (s, v) => eachIntf(s, i => { i.ospf.dead = v[3]; }), L3],
  ['no ip ospf dead-interval', s => eachIntf(s, i => { i.ospf.dead = null; }), L3],
  ['ip ospf network {point-to-point|broadcast}', (s, v) => eachIntf(s, i => { i.ospf.net = v[3]; }), L3],
  ['no ip ospf network', s => eachIntf(s, i => { i.ospf.net = null; }), L3],
  ['ip helper-address <ip>', (s, v) => eachIntf(s, i => {
    const a = parseV4(v[2]);
    if (i.sw && !i.routed) return '% Invalid input detected at \'^\' marker.';
    if (!i.helpers.includes(a)) i.helpers.push(a);
  }), L3],
  ['no ip helper-address', s => eachIntf(s, i => { i.helpers = []; }), L3],
  ['no ip helper-address <ip>', (s, v) => eachIntf(s, i => { const a = parseV4(v[3]); i.helpers = i.helpers.filter(x => x !== a); }), L3],
  ['ip nat {inside|outside}', (s, v) => eachIntf(s, i => { i.nat = v[2]; }), R],
  ['no ip nat {inside|outside}', s => eachIntf(s, i => { i.nat = null; }), R],
  ['ip access-group <word> {in|out}', (s, v) => eachIntf(s, i => {
    if (i.sw && !i.routed && s.dev.kind === 'switch') return '% Invalid input detected at \'^\' marker.';
    i.acl[v[3]] = v[2];
  })],
  ['no ip access-group <word> {in|out}', (s, v) => eachIntf(s, i => { i.acl[v[4]] = null; })],
  ['no ip access-group {in|out}', (s, v) => eachIntf(s, i => { i.acl[v[3]] = null; })],
  ['speed {10|100|1000|auto}', (s, v) => eachIntf(s, i => {
    if (v[1] === '1000' && typeOf(i.name) === 'FastEthernet') return '% Invalid input detected at \'^\' marker.';
    i.speed = v[1];
  })],
  ['duplex {full|half|auto}', (s, v) => eachIntf(s, i => {
    if (v[1] === 'half' && i.speed === '1000') return '% Duplex cannot be set to half when speed is 1000';
    i.duplex = v[1];
  })],
  ['no speed', s => eachIntf(s, i => { i.speed = 'auto'; })],
  ['no duplex', s => eachIntf(s, i => { i.duplex = 'auto'; })],
  ['bandwidth <num:1-10000000>', (s, v) => eachIntf(s, i => { i.bw = v[1]; })],
  ['no bandwidth', s => eachIntf(s, i => { i.bw = null; })],
  ['clock rate <num:1200-8000000>', (s, v) => eachIntf(s, i => {
    if (typeOf(i.name) !== 'Serial') return '% Invalid input detected at \'^\' marker.';
    i.clockRate = v[2];
  }), R],
  ['cdp enable', s => eachIntf(s, i => { i.cdp = true; })],
  ['no cdp enable', s => eachIntf(s, i => { i.cdp = false; })],
  ['lldp {transmit|receive}', () => undefined],
  ['no lldp {transmit|receive}', () => undefined],
  ...CONFIG_TAIL,
];

function psOf(i) {
  if (!i.ps) i.ps = { enabled: false, max: 1, violation: 'shutdown', sticky: false, macs: [], violations: 0 };
  return i.ps;
}

function normMac(t) {
  const hex = t.replace(/[.:-]/g, '').toLowerCase();
  if (!/^[0-9a-f]{12}$/.test(hex)) return null;
  return hex.match(/.{4}/g).join('.');
}

function setV6(i, t, type) {
  if (i.sw && !i.routed) return '% Invalid input detected at \'^\' marker.';
  const p = parseV6Prefix(t);
  i.v6 = i.v6.filter(a => !(a.addr === p.addr && a.len === p.len));
  i.v6.push({ addr: p.addr, len: p.len, type });
}

function subEncap(s, vlan, native) {
  return eachIntf(s, i => {
    if (!isSubif(i.name)) return '% Invalid input detected at \'^\' marker.';
    const parent = parentOf(i.name);
    const clash = Object.values(s.dev.intfs).find(o => o !== i && isSubif(o.name) && parentOf(o.name) === parent && o.encap && o.encap.vlan === vlan);
    if (clash) return `% Configuration of multiple subinterfaces of the same main interface with the same VID (${vlan}) is not permitted.\nThis VID is already configured on ${clash.name}.`;
    i.encap = { vlan, native };
  });
}

// ------------------------------------------------------------------ router ospf
export const ROUTER = [
  ['network <ip> <wild> area <word>', (s, v) => {
    const o = ospfProc(s);
    if (Number.isNaN(areaNum(v[4]))) return '% Invalid input detected at \'^\' marker.';
    const wild = parseV4(v[2]);
    const addr = parseV4(v[1]) & (wild ^ 0xffffffffn);
    const ex = o.networks.find(n => n.addr === addr && n.wild === wild);
    if (ex && ex.area !== v[4]) return `% OSPF: "network ${fmtV4(addr)} ${fmtV4(wild)} area ${ex.area}" is already configured`;
    if (!ex) o.networks.push({ addr, wild, area: v[4] });
  }],
  ['no network <ip> <wild> area <word>', (s, v) => {
    const o = ospfProc(s);
    const wild = parseV4(v[3]);
    const addr = parseV4(v[2]) & (wild ^ 0xffffffffn);
    o.networks = o.networks.filter(n => !(n.addr === addr && n.wild === wild));
  }],
  // A new router ID applies at once, unless the process already has neighbors.
  ['router-id <ip>', (s, v) => {
    const o = ospfProc(s);
    const rid = parseV4(v[1]);
    o.rid = rid;
    if (o.activeRid === null || o.activeRid === undefined || o.activeRid === rid) return undefined;
    if (s.net.ospfNeighbors(s.dev.name).length) return '% OSPF: Reload or use "clear ip ospf process" command, for this to take effect';
    o.activeRid = rid;
  }],
  ['no router-id', s => {
    const o = ospfProc(s);
    o.rid = null;
    if (!s.net.ospfNeighbors(s.dev.name).length) o.activeRid = null;
  }],
  ['passive-interface default', s => { const o = ospfProc(s); o.passiveDefault = true; o.nonPassive = []; }],
  ['no passive-interface default', s => { const o = ospfProc(s); o.passiveDefault = false; o.passive = []; }],
  ['passive-interface <intf>', (s, v) => {
    const o = ospfProc(s);
    if (!s.dev.intfs[v[1]]) return '% Invalid input detected at \'^\' marker.';
    if (o.passiveDefault) o.nonPassive = o.nonPassive.filter(n => n !== v[1]);
    else if (!o.passive.includes(v[1])) o.passive.push(v[1]);
  }],
  ['no passive-interface <intf>', (s, v) => {
    const o = ospfProc(s);
    if (o.passiveDefault) { if (!o.nonPassive.includes(v[2])) o.nonPassive.push(v[2]); }
    else o.passive = o.passive.filter(n => n !== v[2]);
  }],
  ['default-information originate', s => { ospfProc(s).defaultOriginate = 'yes'; }],
  ['default-information originate always', s => { ospfProc(s).defaultOriginate = 'always'; }],
  ['no default-information originate', s => { ospfProc(s).defaultOriginate = null; }],
  ['auto-cost reference-bandwidth <num:1-4294967>', (s, v) => {
    ospfProc(s).refBw = v[2] === 100 ? null : v[2];
    return '% OSPF: Reference bandwidth is changed.\n        Please ensure reference bandwidth is consistent across all routers.';
  }],
  ['no auto-cost reference-bandwidth', s => { ospfProc(s).refBw = null; }],
  ['maximum-paths <num:1-32>', () => undefined],
  ...CONFIG_TAIL,
];

// ------------------------------------------------------------------ line
export const LINE = [
  ['password <line>', (s, v) => { for (const l of lineTargets(s)) { l.password = pwText(v[1]); l.pwEnc = s.dev.pwEncryption; } }],
  ['no password', s => { for (const l of lineTargets(s)) l.password = null; }],
  ['login', s => { for (const l of lineTargets(s)) l.login = 'line'; }],
  ['login local', s => { for (const l of lineTargets(s)) l.login = 'local'; }],
  ['no login', s => { for (const l of lineTargets(s)) l.login = null; }],
  ['transport input {ssh|telnet|all|none}', (s, v) => { for (const l of lineTargets(s)) l.transport = [v[2]]; }],
  ['transport input {ssh|telnet} {ssh|telnet}', (s, v) => { for (const l of lineTargets(s)) l.transport = v[2] === v[3] ? [v[2]] : [v[2], v[3]]; }],
  ['no transport input', s => { for (const l of lineTargets(s)) l.transport = null; }],
  ['exec-timeout <num:0-35791> [<num:0-2147483>]', (s, v) => {
    const sec = v[2] === undefined ? 0 : v[2];
    for (const l of lineTargets(s)) l.execTimeout = v[1] === 10 && sec === 0 ? null : `${v[1]} ${sec}`;
  }],
  ['logging synchronous', s => { for (const l of lineTargets(s)) l.logSync = true; }],
  ['no logging synchronous', s => { for (const l of lineTargets(s)) l.logSync = false; }],
  ['access-class <word> in', (s, v) => {
    if (s.ctx.line !== 'vty') return '% Invalid input detected at \'^\' marker.';
    for (const l of lineTargets(s)) l.accessClass = v[1];
  }],
  ['no access-class <word> in', s => { for (const l of lineTargets(s)) l.accessClass = null; }],
  ...CONFIG_TAIL,
];

// ------------------------------------------------------------------ vlan
export const VLAN = [
  ['name <word>', (s, v) => { for (const id of s.ctx.vlans) s.dev.vlans[id].name = v[1]; }],
  ['no name', s => { for (const id of s.ctx.vlans) s.dev.vlans[id].name = `VLAN${String(id).padStart(4, '0')}`; }],
  ...CONFIG_TAIL,
];

// ------------------------------------------------------------------ dhcp pool
export const DHCP = [
  ['network <ip> <mask>', (s, v) => {
    const len = maskToLen(v[2]);
    if (len === null) return '% Invalid mask';
    const p = s.dev.dhcp.pools[s.ctx.pool];
    p.network = netOf(parseV4(v[1]), len);
    p.len = len;
  }],
  ['default-router <ip>', (s, v) => { s.dev.dhcp.pools[s.ctx.pool].router = parseV4(v[1]); }],
  ['no default-router', s => { s.dev.dhcp.pools[s.ctx.pool].router = null; }],
  ['dns-server <line>', (s, v) => {
    const ips = v[1].split(/\s+/).map(parseV4);
    if (ips.some(x => x === null)) return '% Invalid input detected at \'^\' marker.';
    s.dev.dhcp.pools[s.ctx.pool].dns = ips;
  }],
  ['domain-name <word>', (s, v) => { s.dev.dhcp.pools[s.ctx.pool].domain = v[1]; }],
  ['lease <line>', (s, v) => { s.dev.dhcp.pools[s.ctx.pool].lease = v[1]; }],
  ...CONFIG_TAIL,
];

// ------------------------------------------------------------------ named ACL
function naclAdd(s, action, text, seq) {
  const a = s.dev.acls[s.ctx.acl];
  const e = parseAce(a.type, action, text);
  if (e.error !== undefined) return s.caret(text, e.error);
  return addEntry(a, e, seq) || undefined;
}

export const NACL = [
  ['{permit|deny} <line>', (s, v) => naclAdd(s, v[0], v[1])],
  ['<num:1-2147483647> {permit|deny} <line>', (s, v) => naclAdd(s, v[1], v[2], v[0])],
  ['remark <line>', (s, v) => { addEntry(s.dev.acls[s.ctx.acl], { remark: v[1] }); }],
  ['no <num:1-2147483647>', (s, v) => {
    const a = s.dev.acls[s.ctx.acl];
    a.entries = a.entries.filter(e => e.seq !== v[1]);
  }],
  ['no {permit|deny} <line>', (s, v) => {
    const a = s.dev.acls[s.ctx.acl];
    const e = parseAce(a.type, v[1], v[2]);
    if (e.error === undefined) a.entries = a.entries.filter(x => x.text !== e.text);
  }],
  ...CONFIG_TAIL,
];

export const MODES = {
  user: USER, exec: EXEC, config: CONFIG, if: INTF, subif: INTF, range: INTF,
  router: ROUTER, line: LINE, vlan: VLAN, dhcp: DHCP, 'nacl-std': NACL, 'nacl-ext': NACL,
};

export const PROMPT = {
  user: '>', exec: '#', config: '(config)#', if: '(config-if)#', subif: '(config-subif)#', range: '(config-if-range)#',
  router: '(config-router)#', line: '(config-line)#', vlan: '(config-vlan)#', dhcp: '(dhcp-config)#',
  'nacl-std': '(config-std-nacl)#', 'nacl-ext': '(config-ext-nacl)#',
};

export const HELP = {
  show: 'Show running system information', configure: 'Enter configuration mode', ping: 'Send echo messages',
  traceroute: 'Trace route to destination', enable: 'Turn on privileged commands', disable: 'Turn off privileged commands',
  exit: 'Exit from the EXEC', logout: 'Exit from the EXEC', copy: 'Copy from one file to another', write: 'Write running configuration to memory, network, or terminal',
  reload: 'Halt and perform a cold restart', clear: 'Reset functions', telnet: 'Open a telnet connection', ssh: 'Open a secure shell client connection',
  terminal: 'Set terminal line parameters', erase: 'Erase a filesystem', interface: 'Select an interface to configure',
  hostname: 'Set system\'s network name', 'ip': 'Global IP configuration subcommands', ipv6: 'Global IPv6 configuration commands',
  router: 'Enable a routing process', line: 'Configure a terminal line', vlan: 'Vlan commands', username: 'Establish User Name Authentication',
  'access-list': 'Add an access list entry', banner: 'Define a login banner', crypto: 'Encryption module', service: 'Modify use of network based services',
  'spanning-tree': 'Spanning Tree Subsystem', cdp: 'Global CDP configuration subcommands', lldp: 'Global LLDP configuration subcommands',
  ntp: 'Configure NTP', logging: 'Modify message logging facilities', 'snmp-server': 'Modify SNMP engine parameters', end: 'Exit from configure mode',
  do: 'To run exec commands in config mode', no: 'Negate a command or set its defaults', description: 'Interface specific description',
  shutdown: 'Shutdown the selected interface', switchport: 'Set switching mode characteristics', 'channel-group': 'Etherchannel/port bundling configuration',
  encapsulation: 'Set encapsulation type for an interface', duplex: 'Configure duplex operation.', speed: 'Configure speed operation.',
  bandwidth: 'Set bandwidth informational parameter', network: 'Enable routing on an IP network', 'router-id': 'router-id for this OSPF process',
  'passive-interface': 'Suppress routing updates on an interface', 'default-information': 'Control distribution of default information',
  'auto-cost': 'Calculate OSPF interface cost according to bandwidth', password: 'Set a password', login: 'Enable password checking',
  transport: 'Define transport protocols for line', 'exec-timeout': 'Set the EXEC timeout', 'access-class': 'Filter connections based on an IP access list',
  name: 'Ascii name of the VLAN', 'default-router': 'Default routers', 'dns-server': 'DNS servers', 'domain-name': 'Domain name', lease: 'Address lease time',
  permit: 'Specify packets to forward', deny: 'Specify packets to reject', remark: 'Access list entry comment',
  'running-config': 'Current operating configuration', 'startup-config': 'Contents of startup configuration', interfaces: 'Interface status and configuration',
  route: 'IP routing table', ospf: 'OSPF information', protocols: 'IP routing protocol process parameters', brief: 'Brief summary',
  neighbor: 'Neighbor list', neighbors: 'CDP neighbor entries', trunk: 'Show interface trunk information', status: 'Show interface line status',
  'mac': 'MAC configuration', 'address-table': 'MAC forwarding table', 'access-lists': 'List access lists', nat: 'IP NAT information',
  dhcp: 'Dynamic Host Configuration Protocol', binding: 'DHCP address bindings', pool: 'DHCP pools information', version: 'System hardware and software status',
  clock: 'Display the system clock', etherchannel: 'EtherChannel information', 'port-security': 'Show secure port information',
  translations: 'Translation entries', statistics: 'Translation statistics', address: 'Set the IP address of an interface',
  'helper-address': 'Specify a destination address for UDP broadcasts', 'access-group': 'Specify access control for packets',
  'default-gateway': 'Specify default gateway (if not routing IP)', 'domain-name_': '', secret: 'Assign the privileged level secret',
  'terminal_': '', 'startup-config_': '', mode: 'Set trunking mode of the interface', access: 'Set access mode characteristics of the interface',
  native: 'Set trunking native characteristics when interface is in trunking mode', allowed: 'Set allowed VLAN characteristics when interface is in trunking mode',
};
