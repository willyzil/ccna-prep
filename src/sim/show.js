// "show" command renderers, formatted like IOS 15.
import { fmtV4, fmtV6, lenToMask, classfulLen, netOf, fmtList, inPrefix, parseV4 } from './addr.js';
import { shortName, typeOf, isSubif, parentOf, compareIntf, defaultBw } from './intf.js';
import { runningConfig, sortedIntfs, intfLines, section } from './device.js';
import { intfKey, isSwitch, isHost } from './net.js';
import { computeStp, bridgeMac, bridgePriority } from './stp.js';

const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

function uptime(s) {
  const t = 754 + s.lab.clock;
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function cdpIntf(full) {
  const t = typeOf(full);
  const map = { GigabitEthernet: 'Gig', FastEthernet: 'Fas', Serial: 'Ser', Ethernet: 'Eth', TenGigabitEthernet: 'Ten', 'Port-channel': 'Por' };
  return `${map[t] || t.slice(0, 3)} ${full.slice(t.length)}`;
}

export function showRun(s, intf) {
  if (intf) {
    const i = s.dev.intfs[intf];
    if (!i) return '%Invalid interface type and number';
    const body = [`interface ${i.name}`, ...intfLines(s.dev, i), 'end'].join('\n');
    return `Building configuration...\n\nCurrent configuration : ${body.length} bytes\n!\n${body}`;
  }
  return runningConfig(s.dev);
}

export function showStartup(s) {
  if (!s.dev.saved) return 'startup-config is not present';
  return s.dev.saved.replace(/^Building configuration\.\.\.\n\nCurrent configuration :/, 'Using');
}

export function ipIntBrief(s) {
  const { dev, net } = s;
  const rows = ['Interface              IP-Address      OK? Method Status                Protocol'];
  for (const i of sortedIntfs(dev)) {
    if (isHost(dev)) continue;
    const st = net.status(dev.name, i.name);
    let ip = 'unassigned', method = 'unset';
    const a = net.primaryIp(dev.name, i.name);
    if (i.dhcp) { method = 'DHCP'; if (a) ip = fmtV4(a.addr); }
    else if (i.ip && !(i.sw && !i.routed)) { ip = fmtV4(i.ip.addr); method = 'manual'; }
    rows.push(`${pad(i.name, 23)}${pad(ip, 16)}YES ${pad(method, 7)}${pad(st.admin, 22)}${st.proto}`);
  }
  return rows.join('\n');
}

export function ipv6IntBrief(s) {
  const { dev, net } = s;
  const rows = [];
  for (const i of sortedIntfs(dev)) {
    if (i.sw && !i.routed) continue;
    const st = net.status(dev.name, i.name);
    const label = st.admin === 'administratively down' ? 'administratively down/down' : `${st.admin}/${st.proto}`;
    rows.push(`${pad(i.name, 23)}[${label}]`);
    const addrs = net.addrsOn(dev.name, i.name, 6);
    if (!addrs.length) rows.push('    unassigned');
    for (const a of addrs.filter(x => x.kind === 'll')) rows.push(`    ${fmtV6(a.addr)}`);
    for (const a of addrs.filter(x => x.kind === 'global')) rows.push(`    ${fmtV6(a.addr)}`);
  }
  return rows.join('\n');
}

function hwLine(dev, i) {
  const t = typeOf(i.name);
  if (t === 'Loopback') return '  Hardware is Loopback';
  if (t === 'Serial') return '  Hardware is WIC MBRD Serial';
  if (t === 'Vlan') return `  Hardware is EtherSVI, address is ${i.mac} (bia ${i.mac})`;
  if (t === 'Port-channel') return `  Hardware is EtherChannel, address is ${i.mac} (bia ${i.mac})`;
  const hw = t === 'GigabitEthernet' ? (dev.kind === 'router' ? 'CN Gigabit Ethernet' : 'Gigabit Ethernet') : t === 'FastEthernet' ? 'Fast Ethernet' : 'Ethernet';
  return `  Hardware is ${hw}, address is ${i.mac} (bia ${i.mac})`;
}

function duplexInfo(s, i) {
  const p = s.net.peer[intfKey(s.dev.name, i.name)];
  const pi = p ? s.net.devs[p.dev].intfs[p.intf] : null;
  const speedOf = x => (x.speed !== 'auto' ? Number(x.speed) : (typeOf(x.name) === 'GigabitEthernet' ? 1000 : typeOf(x.name) === 'FastEthernet' ? 100 : 10));
  let speed = speedOf(i);
  if (pi && i.speed === 'auto') speed = Math.min(speed, speedOf(pi));
  let duplex = i.duplex === 'auto' ? 'full' : i.duplex;
  // Auto against a hard-coded peer: speed is sensed, but duplex falls back to half at 10/100.
  if (pi && i.duplex === 'auto' && pi.duplex !== 'auto' && speed <= 100) duplex = 'half';
  const peerDuplex = pi ? (pi.duplex === 'auto' ? (i.duplex !== 'auto' && speed <= 100 ? 'half' : 'full') : pi.duplex) : duplex;
  return { speed, duplex, mismatch: pi && duplex !== peerDuplex };
}

export function showInterfaces(s, only) {
  const { dev, net } = s;
  const list = only ? [dev.intfs[only]].filter(Boolean) : sortedIntfs(dev);
  if (only && !list.length) return '                ^\n% Invalid input detected at \'^\' marker.';
  const out = [];
  for (const i of list) {
    const st = net.status(dev.name, i.name);
    const head = st.admin === 'administratively down' ? 'administratively down' : st.admin;
    out.push(`${i.name} is ${head}, line protocol is ${st.proto}${st.err ? ' (err-disabled)' : ''} `);
    out.push(hwLine(dev, i));
    if (i.desc) out.push(`  Description: ${i.desc}`);
    const a = net.primaryIp(dev.name, i.name);
    if (a) out.push(`  Internet address is ${fmtV4(a.addr)}/${a.len}`);
    const t = typeOf(i.name);
    const base = isSubif(i.name) ? dev.intfs[parentOf(i.name)] : i;
    const bw = i.bw || base.bw || defaultBw(base.name);
    const dly = t === 'Serial' ? 20000 : t === 'Loopback' ? 5000 : t === 'FastEthernet' ? 100 : 10;
    out.push(`  MTU ${t === 'Loopback' ? 1514 : 1500} bytes, BW ${bw} Kbit/sec, DLY ${dly} usec, `);
    out.push('     reliability 255/255, txload 1/255, rxload 1/255');
    if (t === 'Serial') out.push('  Encapsulation HDLC, loopback not set');
    else if (t === 'Loopback') out.push('  Encapsulation LOOPBACK, loopback not set');
    else if (i.encap) out.push(`  Encapsulation 802.1Q Virtual LAN, Vlan ID  ${i.encap.vlan}.`);
    else out.push('  Encapsulation ARPA, loopback not set');
    out.push('  Keepalive set (10 sec)');
    let lateColl = 0, crc = 0, runts = 0;
    if (/Ethernet/.test(t) && !isSubif(i.name)) {
      const d = duplexInfo(s, i);
      const sp = d.speed === 1000 ? '1000Mb/s' : `${d.speed}Mb/s`;
      out.push(`  ${d.duplex === 'full' ? 'Full-duplex' : 'Half-duplex'}, ${sp}, media type is ${dev.kind === 'router' ? 'RJ45' : '10/100BaseTX'}`);
      if (d.mismatch && st.proto === 'up') {
        if (d.duplex === 'half') lateColl = 87 + (s.lab.clock % 13);
        else { crc = 214 + (s.lab.clock % 17); runts = 63 + (s.lab.clock % 7); }
      }
    }
    out.push('  ARP type: ARPA, ARP Timeout 04:00:00');
    out.push('  Last input 00:00:01, output 00:00:02, output hang never');
    out.push('  Last clearing of "show interface" counters never');
    out.push('  Input queue: 0/75/0/0 (size/max/drops/flushes); Total output drops: 0');
    out.push('  Queueing strategy: fifo');
    out.push('  Output queue: 0/40 (size/max)');
    out.push('  5 minute input rate 0 bits/sec, 0 packets/sec');
    out.push('  5 minute output rate 0 bits/sec, 0 packets/sec');
    const up = st.proto === 'up';
    const pin = up ? 1520 + s.lab.clock * 3 : 0, pout = up ? 1488 + s.lab.clock * 3 : 0;
    out.push(`     ${pin} packets input, ${pin * 96} bytes, 0 no buffer`);
    out.push(`     Received ${Math.floor(pin / 3)} broadcasts (0 IP multicasts)`);
    out.push(`     ${runts} runts, 0 giants, 0 throttles `);
    out.push(`     ${crc + runts} input errors, ${crc} CRC, 0 frame, 0 overrun, 0 ignored`);
    out.push(`     ${pout} packets output, ${pout * 94} bytes, 0 underruns`);
    out.push(`     0 output errors, ${lateColl ? lateColl * 3 : 0} collisions, 1 interface resets`);
    out.push(`     0 babbles, ${lateColl} late collision, ${lateColl ? 12 : 0} deferred`);
    out.push('     0 lost carrier, 0 no carrier');
    out.push('     0 output buffer failures, 0 output buffers swapped out');
  }
  return out.join('\n');
}

const ROUTE_CODES = `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       + - replicated route, % - next hop override`;

function routeText(s, r, indent) {
  const pfx = `${fmtV4(r.net)}/${r.len}`;
  const code = pad(r.code, indent);
  if (r.code === 'C' || r.code === 'L') return [`${code}${pfx} is directly connected, ${r.nhs[0].intf}`];
  const lines = [];
  r.nhs.forEach((n, idx) => {
    let tail;
    if (n.ip === null) tail = `is directly connected, ${n.intf}`;
    else if (r.code.startsWith('O')) tail = `[${r.ad}/${r.metric}] via ${fmtV4(n.ip)}, ${uptime(s)}, ${n.intf}`;
    else tail = `[${r.ad}/${r.metric}] via ${fmtV4(n.ip)}${n.intf ? ', ' + n.intf : ''}`;
    if (idx === 0) lines.push(`${code}${pfx} ${tail}`);
    else {
      const first = lines[0];
      const col = first.indexOf('[');
      lines.push(`${' '.repeat(col > 0 ? col : indent + pfx.length + 1)}${tail.startsWith('[') ? tail : tail}`);
    }
  });
  return lines;
}

export function showIpRoute(s, filter) {
  const { dev, net } = s;
  if (!net.routes(dev.name) && !isHost(dev)) {
    const gw = dev.defaultGw;
    return gw !== null ? `Default gateway is ${fmtV4(gw)}\n\nHost               Gateway           Last Use    Total Uses  Interface\nICMP redirect cache is empty` : 'Default gateway is not set\n\nHost               Gateway           Last Use    Total Uses  Interface\nICMP redirect cache is empty';
  }
  let routes = [...net.rib[dev.name][4]];
  const codeMatch = { connected: c => c === 'C' || c === 'L', static: c => c[0] === 'S', ospf: c => c[0] === 'O' };
  if (filter && codeMatch[filter]) routes = routes.filter(r => codeMatch[filter](r.code));
  if (filter && !codeMatch[filter]) {
    const ip = parseV4(filter);
    const r = net.lookup(dev.name, 4, ip);
    if (!r) return '% Network not in table';
    const lines = [`Routing entry for ${fmtV4(r.net)}/${r.len}`];
    const src = { C: 'connected', L: 'connected', S: 'static', 'S*': 'static', O: 'ospf ' + (net.ospf[dev.name] || {}).pid };
    lines.push(`  Known via "${src[r.code] || 'ospf'}", distance ${r.ad}, metric ${r.metric}${r.code === 'C' ? ' (connected, via interface)' : ''}`);
    lines.push('  Routing Descriptor Blocks:');
    for (const n of r.nhs) {
      if (n.ip === null) lines.push(`  * directly connected, via ${n.intf}`);
      else lines.push(`  * ${fmtV4(n.ip)}${n.intf ? ', via ' + n.intf : ''}`);
      lines.push(`      Route metric is ${r.metric}, traffic share count is 1`);
    }
    return lines.join('\n');
  }
  const out = [ROUTE_CODES, ''];
  const def = net.rib[dev.name][4].find(r => r.len === 0);
  if (def) {
    const nh = def.nhs[0].ip;
    out.push(`Gateway of last resort is ${nh !== null ? fmtV4(nh) : '0.0.0.0'} to network 0.0.0.0`);
  } else out.push('Gateway of last resort is not set');
  out.push('');
  routes.sort((a, b) => (a.net < b.net ? -1 : a.net > b.net ? 1 : a.len - b.len));
  const groups = new Map();
  const top = [];
  for (const r of routes) {
    const cl = classfulLen(r.net);
    if (r.len < cl) { top.push({ r }); continue; }
    const major = netOf(r.net, cl);
    if (!groups.has(major)) { groups.set(major, { cl, list: [] }); top.push({ major }); }
    groups.get(major).list.push(r);
  }
  for (const t of top) {
    if (t.r) { out.push(...routeText(s, t.r, 6)); continue; }
    const g = groups.get(t.major);
    if (g.list.length === 1 && g.list[0].len === g.cl) { out.push(...routeText(s, g.list[0], 6)); continue; }
    const masks = new Set(g.list.map(r => r.len));
    if (masks.size === 1) out.push(`      ${fmtV4(t.major)}/${[...masks][0]} is subnetted, ${g.list.length} subnets`);
    else out.push(`      ${fmtV4(t.major)}/${g.cl} is variably subnetted, ${g.list.length} subnets, ${masks.size} masks`);
    for (const r of g.list) out.push(...routeText(s, r, 9));
  }
  return out.join('\n');
}

export function showIpv6Route(s) {
  const { dev, net } = s;
  const routes = [...net.rib[dev.name][6]].sort((a, b) => (a.net < b.net ? -1 : a.net > b.net ? 1 : a.len - b.len));
  const out = [`IPv6 Routing Table - default - ${routes.length + 1} entries`,
    `Codes: C - Connected, L - Local, S - Static, U - Per-user Static route
       B - BGP, R - RIP, I1 - ISIS L1, I2 - ISIS L2
       IA - ISIS interarea, IS - ISIS summary, D - EIGRP, EX - EIGRP external
       ND - ND Default, NDp - ND Prefix, DCE - Destination, NDr - Redirect
       O - OSPF Intra, OI - OSPF Inter, OE1 - OSPF ext 1, OE2 - OSPF ext 2
       ON1 - OSPF NSSA ext 1, ON2 - OSPF NSSA ext 2`];
  for (const r of routes) {
    const code = r.code === 'S*' ? 'S' : r.code;
    out.push(`${pad(code, 4)}${fmtV6(r.net)}/${r.len} [${r.ad}/${r.metric}]`);
    for (const n of r.nhs) {
      if (r.code === 'C') out.push(`     via ${n.intf}, directly connected`);
      else if (r.code === 'L') out.push(`     via ${n.intf}, receive`);
      else if (n.ip === null) out.push(`     via ${n.intf}, directly connected`);
      else out.push(`     via ${fmtV6(n.ip)}${n.intf ? ', ' + n.intf : ''}`);
    }
  }
  out.push('L   FF00::/8 [0/0]', '     via Null0, receive');
  return out.join('\n');
}

export function ospfNeighbor(s) {
  const nbrs = s.net.ospfNeighbors(s.dev.name);
  const out = ['', 'Neighbor ID     Pri   State           Dead Time   Address         Interface'];
  for (const n of nbrs) {
    const oi = s.net.ospf[s.dev.name].intfs.find(x => x.intf === n.intf);
    const state = n.role === '-' ? `${n.state}/  -` : `${n.state}/${n.role}`;
    const dead = `00:00:${String(Math.max(oi.dead - 3 - (s.lab.clock % 7), 0)).padStart(2, '0')}`;
    out.push(`${pad(fmtV4(n.rid), 15)} ${lpad(n.prio, 3)}   ${pad(state, 15)} ${pad(dead, 11)} ${pad(fmtV4(n.addr), 15)} ${n.intf}`);
  }
  return out.join('\n');
}

export function ospfIntBrief(s) {
  const o = s.net.ospf[s.dev.name];
  if (!o) return '';
  const out = ['Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C'];
  for (const oi of [...o.intfs].sort((a, b) => compareIntf(a.intf, b.intf))) {
    const full = oi.nbrs.filter(n => n.state === 'FULL').length;
    const state = !oi.up ? 'DOWN' : oi.state;
    out.push(`${pad(shortName(oi.intf), 12)} ${pad(o.pid, 5)} ${pad(oi.area, 15)} ${pad(`${fmtV4(oi.addr)}/${oi.len}`, 18)} ${pad(oi.cost, 5)} ${pad(state, 5)} ${full}/${oi.nbrs.length}`);
  }
  return out.join('\n');
}

export function ospfInterface(s, only) {
  const o = s.net.ospf[s.dev.name];
  if (!o) return '';
  const out = [];
  for (const oi of o.intfs) {
    if (only && oi.intf !== only) continue;
    const st = s.net.status(s.dev.name, oi.intf);
    out.push(`${oi.intf} is ${st.admin}, line protocol is ${st.proto} `);
    const via = s.dev.intfs[oi.intf].ospf.pid !== null ? 'Interface Enable' : 'Network Statement';
    out.push(`  Internet Address ${fmtV4(oi.addr)}/${oi.len}, Area ${oi.area}, Attached via ${via}`);
    const ntype = { broadcast: 'BROADCAST', 'point-to-point': 'POINT_TO_POINT', loopback: 'LOOPBACK' }[oi.net];
    out.push(`  Process ID ${o.pid}, Router ID ${fmtV4(o.rid)}, Network Type ${ntype}, Cost: ${oi.cost}`);
    if (oi.net === 'loopback') { out.push('  Loopback interface is treated as a stub Host'); continue; }
    const state = !oi.up ? 'DOWN' : oi.state === 'P2P' ? 'POINT_TO_POINT' : oi.state;
    out.push(`  Transmit Delay is 1 sec, State ${state}${oi.net === 'broadcast' ? `, Priority ${oi.prio}` : ''}`);
    if (oi.net === 'broadcast' && oi.drRid) out.push(`  Designated Router (ID) ${fmtV4(oi.drRid)}, Interface address ${fmtV4(oi.dr)}`);
    else if (oi.net === 'broadcast') out.push('  No designated router on this network');
    if (oi.net === 'broadcast' && oi.bdrRid) out.push(`  Backup Designated router (ID) ${fmtV4(oi.bdrRid)}, Interface address ${fmtV4(oi.bdr)}`);
    else if (oi.net === 'broadcast') out.push('  No backup designated router on this network');
    out.push(`  Timer intervals configured, Hello ${oi.hello}, Dead ${oi.dead}, Wait ${oi.dead}, Retransmit 5`);
    if (oi.passive) out.push('    No Hellos (Passive interface) ');
    else out.push(`    Hello due in 00:00:0${(s.lab.clock % 9) + 1}`);
    const adj = oi.nbrs.filter(n => n.state === 'FULL');
    out.push(`  Neighbor Count is ${oi.nbrs.length}, Adjacent neighbor count is ${adj.length} `);
    for (const n of adj) {
      const tag = n.role === 'DR' ? '  (Designated Router)' : n.role === 'BDR' ? '  (Backup Designated Router)' : '';
      out.push(`    Adjacent with neighbor ${fmtV4(n.rid)}${tag}`);
    }
    out.push('  Suppress hello for 0 neighbor(s)');
  }
  return out.join('\n') || `%OSPF: OSPF not enabled on ${only}`;
}

export function showIpOspf(s) {
  const o = s.net.ospf[s.dev.name];
  if (!o) return '%OSPF: Router process not running';
  const areas = [...new Set(o.intfs.map(i => i.area))];
  const out = [` Routing Process "ospf ${o.pid}" with ID ${o.rid !== null ? fmtV4(o.rid) : '0.0.0.0'}`,
    ' Start time: 00:00:41.123, Time elapsed: ' + uptime(s),
    ' Supports only single TOS(TOS0) routes',
    ' Supports opaque LSA',
    ' Router is not originating router-LSAs with maximum metric',
    ` Reference bandwidth unit is ${o.proc.refBw || 100} mbps`,
    ` Number of areas in this router is ${areas.length}. ${areas.length} normal 0 stub 0 nssa`];
  for (const a of areas) {
    const n = o.intfs.filter(i => i.area === a).length;
    out.push(`    Area ${a === '0' ? 'BACKBONE(0)' : a}`, `        Number of interfaces in this area is ${n}`);
  }
  return out.join('\n');
}

export function showIpProtocols(s) {
  const o = s.net.ospf[s.dev.name];
  if (!o) return '';
  const p = o.proc;
  const out = ['*** IP Routing is NSF aware ***', '', `Routing Protocol is "ospf ${o.pid}"`,
    '  Outgoing update filter list for all interfaces is not set',
    '  Incoming update filter list for all interfaces is not set',
    `  Router ID ${o.rid !== null ? fmtV4(o.rid) : '0.0.0.0'}`];
  const areas = [...new Set(o.intfs.map(i => i.area))];
  out.push(`  Number of areas in this router is ${areas.length}. ${areas.length} normal 0 stub 0 nssa`);
  out.push('  Maximum path: 4');
  out.push('  Routing for Networks:');
  for (const n of p.networks) out.push(`    ${fmtV4(n.addr)} ${fmtV4(n.wild)} area ${n.area}`);
  const explicit = Object.values(s.dev.intfs).filter(i => i.ospf.pid !== null);
  if (explicit.length) {
    out.push(`  Routing on Interfaces Configured Explicitly (Area ${explicit[0].ospf.area}):`);
    for (const i of explicit) out.push(`    ${i.name}`);
  }
  const passive = o.intfs.filter(i => i.passive).map(i => i.intf);
  if (passive.length) { out.push('  Passive Interface(s):'); for (const x of passive) out.push(`    ${x}`); }
  out.push('  Routing Information Sources:', '    Gateway         Distance      Last Update');
  const rids = [...new Set(s.net.ospfNeighbors(s.dev.name).filter(n => n.state === 'FULL').map(n => n.rid))];
  for (const r of rids) out.push(`    ${pad(fmtV4(r), 15)} ${lpad(110, 8)}      ${uptime(s)}`);
  out.push('  Distance: (default is 110)');
  return out.join('\n');
}

const RESERVED = [[1002, 'fddi-default'], [1003, 'token-ring-default'], [1004, 'fddinet-default'], [1005, 'trnet-default']];

export function vlanBrief(s) {
  const { dev, net } = s;
  if (!isSwitch(dev)) return '% Invalid input detected';
  const out = ['', 'VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------'];
  for (const id of Object.keys(dev.vlans).map(Number).sort((a, b) => a - b)) {
    const poTrunk = po => {
      const g = Number(po.name.replace('Port-channel', ''));
      const m = Object.values(dev.intfs).find(x => x.channel && x.channel.group === g && net.chan[intfKey(dev.name, x.name)] === 'P');
      return !m || net.trunk[intfKey(dev.name, m.name)];
    };
    const ports = sortedIntfs(dev).filter(i => i.sw && !i.routed && !net.trunk[intfKey(dev.name, i.name)] &&
      !(i.channel && net.chan[intfKey(dev.name, i.name)] === 'P') && !(/^Port-channel/.test(i.name) && poTrunk(i)) &&
      (net.swOf(dev.name, i).access === id || net.swOf(dev.name, i).voice === id))
      .sort((a, b) => (/^Port-channel/.test(a.name) ? 1 : 0) - (/^Port-channel/.test(b.name) ? 1 : 0))
      .map(i => shortName(i.name));
    const chunks = [];
    for (let k = 0; k < ports.length; k += 4) chunks.push(ports.slice(k, k + 4).join(', ') + (k + 4 < ports.length ? ',' : ''));
    out.push(`${pad(id, 4)} ${pad(dev.vlans[id].name, 32)} ${pad('active', 9)} ${chunks[0] || ''}`.trimEnd());
    for (const c of chunks.slice(1)) out.push(`${' '.repeat(48)}${c}`);
  }
  for (const [id, name] of RESERVED) out.push(`${id} ${pad(name, 32)} act/unsup `);
  return out.join('\n');
}

export function showTrunk(s) {
  const { dev, net } = s;
  const trunks = sortedIntfs(dev).filter(i => i.sw && !i.routed && net.trunk[intfKey(dev.name, i.name)] && net.isUp(dev.name, i.name) &&
    !(i.channel && net.chan[intfKey(dev.name, i.name)] === 'P'));
  const pos = sortedIntfs(dev).filter(i => /^Port-channel/.test(i.name) && net.isUp(dev.name, i.name)).filter(po => {
    const g = Number(po.name.replace('Port-channel', ''));
    const m = Object.values(dev.intfs).find(x => x.channel && x.channel.group === g && net.chan[intfKey(dev.name, x.name)] === 'P');
    return m && net.trunk[intfKey(dev.name, m.name)];
  });
  const all = [...pos, ...trunks];
  if (!all.length) return '';
  const memberOf = po => Object.values(dev.intfs).find(x => x.channel && x.channel.group === Number(po.name.replace('Port-channel', '')));
  const swFor = i => (/^Port-channel/.test(i.name) ? i.sw : net.swOf(dev.name, i));
  const modeName = i => ({ trunk: 'on', 'dynamic desirable': 'desirable', 'dynamic auto': 'auto' }[swFor(i).mode] || 'on');
  const out = ['', 'Port        Mode             Encapsulation  Status        Native vlan'];
  for (const i of all) out.push(`${pad(shortName(i.name), 11)} ${pad(modeName(i), 16)} ${pad('802.1q', 14)} ${pad('trunking', 13)} ${swFor(i).native}`);
  out.push('', 'Port        Vlans allowed on trunk');
  for (const i of all) out.push(`${pad(shortName(i.name), 11)} ${swFor(i).allowed ? (swFor(i).allowed.length ? fmtList(swFor(i).allowed) : 'none') : '1-4094'}`);
  out.push('', 'Port        Vlans allowed and active in management domain');
  const active = i => {
    const ref = /^Port-channel/.test(i.name) ? memberOf(i) : i;
    return net.trunkVlans(dev.name, ref);
  };
  for (const i of all) out.push(`${pad(shortName(i.name), 11)} ${fmtList(active(i)) || 'none'}`);
  out.push('', 'Port        Vlans in spanning tree forwarding state and not pruned');
  for (const i of all) {
    const fwd = active(i).filter(v => {
      const st = computeStp(net, v)[dev.name];
      const p = st && st.ports[i.name];
      return !p || p.state === 'FWD';
    });
    out.push(`${pad(shortName(i.name), 11)} ${fmtList(fwd) || 'none'}`);
  }
  return out.join('\n');
}

export function showSwitchport(s, name) {
  const { dev, net } = s;
  const i = dev.intfs[name];
  if (!i || !i.sw) return `Name: ${shortName(name)}\nSwitchport: Disabled`;
  const sw = net.swOf(dev.name, i);
  const adm = { access: 'static access', trunk: 'trunk', 'dynamic auto': 'dynamic auto', 'dynamic desirable': 'dynamic desirable' }[sw.mode];
  const up = net.isUp(dev.name, name);
  const op = !up ? 'down' : net.trunk[intfKey(dev.name, name)] ? 'trunk' : 'static access';
  const vname = v => (dev.vlans[v] ? dev.vlans[v].name : 'Inactive');
  return [`Name: ${shortName(name)}`, 'Switchport: Enabled', `Administrative Mode: ${adm}`, `Operational Mode: ${op}`,
    'Administrative Trunking Encapsulation: dot1q', `Operational Trunking Encapsulation: ${op === 'trunk' ? 'dot1q' : 'native'}`,
    `Negotiation of Trunking: ${sw.mode === 'access' || sw.nonegotiate ? 'Off' : 'On'}`,
    `Access Mode VLAN: ${sw.access} (${vname(sw.access)})`, `Trunking Native Mode VLAN: ${sw.native} (${vname(sw.native)})`,
    'Administrative Native VLAN tagging: enabled', `Voice VLAN: ${sw.voice ? `${sw.voice} (${vname(sw.voice)})` : 'none'}`,
    'Administrative private-vlan host-association: none', 'Administrative private-vlan mapping: none',
    'Operational private-vlan: none', `Trunking VLANs Enabled: ${sw.allowed ? fmtList(sw.allowed) || 'NONE' : 'ALL'}`,
    'Pruning VLANs Enabled: 2-1001', 'Capture Mode Disabled', 'Capture VLANs Allowed: ALL', '',
    'Protected: false', 'Unknown unicast blocked: disabled', 'Unknown multicast blocked: disabled', 'Appliance trust: none'].join('\n');
}

export function intStatus(s) {
  const { dev, net } = s;
  const out = ['', 'Port      Name               Status       Vlan       Duplex  Speed Type'];
  for (const i of sortedIntfs(dev)) {
    if (!i.sw && !i.routed) continue;
    if (typeOf(i.name) === 'Vlan') continue;
    const st = net.status(dev.name, i.name);
    const status = i.shutdown ? 'disabled' : st.err ? 'err-disabled' : st.proto === 'up' ? 'connected' : 'notconnect';
    const vlan = i.routed ? 'routed' : net.trunk[intfKey(dev.name, i.name)] ? 'trunk' : net.swOf(dev.name, i).access;
    const d = st.proto === 'up' ? duplexInfo(s, i) : null;
    const dup = d ? (i.duplex === 'auto' ? `a-${d.duplex}` : d.duplex) : (i.duplex === 'auto' ? 'auto' : i.duplex);
    const spd = d ? (i.speed === 'auto' ? `a-${d.speed}` : String(d.speed)) : (i.speed === 'auto' ? 'auto' : i.speed);
    const type = /^Port-channel/.test(i.name) ? '' : typeOf(i.name) === 'FastEthernet' ? '10/100BaseTX' : '10/100/1000BaseTX';
    out.push(`${pad(shortName(i.name), 9)} ${pad((i.desc || '').slice(0, 18), 18)} ${pad(status, 12)} ${pad(vlan, 10)} ${lpad(dup, 6)} ${lpad(spd, 6)} ${type}`);
  }
  return out.join('\n');
}

export function macTable(s) {
  const rows = s.net.macTable(s.dev.name);
  const out = ['          Mac Address Table', '-------------------------------------------', '',
    'Vlan    Mac Address       Type        Ports', '----    -----------       --------    -----'];
  for (const r of rows) out.push(`${lpad(r.vlan, 4)}    ${r.mac}    DYNAMIC     ${shortName(r.port)}`);
  out.push(`Total Mac Addresses for this criterion: ${rows.length}`);
  return out.join('\n');
}

const CAP = { router: 'R B S I', switch: 'S I', l3switch: 'R S I' };

export function cdpNeighbors(s, detail) {
  const nbrs = s.net.cdpNeighbors(s.dev.name);
  if (!s.dev.cdpRun) return '% CDP is not enabled';
  if (detail) {
    const out = [];
    for (const n of nbrs) {
      const ip = s.net.primaryIp(n.dev.name, n.port) ||
        (s.net.l3[n.dev.name] || []).find(a => a.fam === 4 && a.primary && a.up);
      out.push('-------------------------', `Device ID: ${n.dev.hostname}`, 'Entry address(es): ');
      if (ip) out.push(`  IP address: ${fmtV4(ip.addr)}`);
      const caps = { router: 'Router Switch IGMP', switch: 'Switch IGMP', l3switch: 'Router Switch IGMP' }[n.dev.kind];
      out.push(`Platform: cisco ${n.dev.platform},  Capabilities: ${caps} `);
      out.push(`Interface: ${n.local},  Port ID (outgoing port): ${n.port}`);
      out.push('Holdtime : 151 sec', '', 'Version :');
      out.push(n.dev.kind === 'router'
        ? 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.2(4)M3, RELEASE SOFTWARE (fc1)'
        : 'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4, RELEASE SOFTWARE (fc1)');
      out.push('Technical Support: http://www.cisco.com/techsupport', 'Copyright (c) 1986-2013 by Cisco Systems, Inc.', '', 'advertisement version: 2');
      const li = s.dev.intfs[n.local], pi = n.dev.intfs[n.port];
      if (li.sw && pi.sw) out.push(`Native VLAN: ${pi.sw.native}`);
      out.push('Duplex: full', '');
    }
    out.push(`Total cdp entries displayed : ${nbrs.length}`);
    return out.join('\n');
  }
  const out = ['Capability Codes: R - Router, T - Trans Bridge, B - Source Route Bridge',
    '                  S - Switch, H - Host, I - IGMP, r - Repeater, P - Phone, ',
    '                  D - Remote, C - CVTA, M - Two-port Mac Relay ', '',
    'Device ID        Local Intrfce     Holdtme    Capability  Platform  Port ID'];
  for (const n of nbrs) {
    out.push(`${pad(n.dev.hostname, 16)} ${pad(cdpIntf(n.local), 17)} ${pad('151', 10)} ${pad(CAP[n.dev.kind], 11)} ${pad(n.dev.platform.slice(0, 9), 9)} ${cdpIntf(n.port)}`);
  }
  out.push('', `Total cdp entries displayed : ${nbrs.length}`);
  return out.join('\n');
}

export function lldpNeighbors(s) {
  if (!s.dev.lldpRun) return '% LLDP is not enabled';
  const nbrs = s.net.lldpNeighbors(s.dev.name);
  const out = ['Capability codes:', '    (R) Router, (B) Bridge, (T) Telephone, (C) DOCSIS Cable Device',
    '    (W) WLAN Access Point, (P) Repeater, (S) Station, (O) Other', '',
    'Device ID           Local Intf     Hold-time  Capability      Port ID'];
  for (const n of nbrs) {
    const cap = n.dev.kind === 'router' ? 'R' : n.dev.kind === 'l3switch' ? 'B,R' : 'B';
    out.push(`${pad(n.dev.hostname, 19)} ${pad(shortName(n.local), 14)} ${pad('120', 10)} ${pad(cap, 15)} ${shortName(n.port)}`);
  }
  out.push('', `Total entries displayed: ${nbrs.length}`);
  return out.join('\n');
}

export function etherSummary(s) {
  const { dev, net } = s;
  const groups = {};
  for (const i of Object.values(dev.intfs)) if (i.channel) (groups[i.channel.group] ||= []).push(i);
  const out = ['Flags:  D - down        P - bundled in port-channel', '        I - stand-alone s - suspended',
    '        H - Hot-standby (LACP only)', '        R - Layer3      S - Layer2', '        U - in use      f - failed to allocate aggregator', '',
    '        M - not in use, minimum links not met', '        u - unsuitable for bundling', '        w - waiting to be aggregated',
    '        d - default port', '', '',
    `Number of channel-groups in use: ${Object.keys(groups).length}`, `Number of aggregators:           ${Object.keys(groups).length}`, '',
    'Group  Port-channel  Protocol    Ports', '------+-------------+-----------+-----------------------------------------------'];
  for (const [g, mem] of Object.entries(groups).sort((a, b) => a[0] - b[0])) {
    const mode = mem[0].channel.mode;
    const proto = ['active', 'passive'].includes(mode) ? 'LACP' : ['desirable', 'auto'].includes(mode) ? 'PAgP' : '-';
    const anyP = mem.some(m => net.chan[intfKey(dev.name, m.name)] === 'P' && net.isUp(dev.name, m.name));
    const po = dev.intfs[`Port-channel${g}`];
    const flag = `${po && po.routed ? 'R' : 'S'}${anyP ? 'U' : 'D'}`;
    const ports = mem.sort((a, b) => compareIntf(a.name, b.name)).map(m => {
      let f = net.chan[intfKey(dev.name, m.name)];
      if (!net.physUp(dev.name, m.name)) f = 'D';
      return pad(`${shortName(m.name)}(${f})`, 12);
    }).join('');
    out.push(`${pad(g, 6)} ${pad(`Po${g}(${flag})`, 13)} ${pad(lpad(proto, 6), 11)} ${ports}`);
  }
  return out.join('\n');
}

export function accessLists(s, ipOnly) {
  const out = [];
  const names = Object.keys(s.dev.acls).sort((a, b) => {
    const na = /^\d+$/.test(a), nb = /^\d+$/.test(b);
    if (na && nb) return Number(a) - Number(b);
    if (na !== nb) return na ? -1 : 1;
    return a.localeCompare(b);
  });
  for (const n of names) {
    const a = s.dev.acls[n];
    out.push(`${a.type === 'standard' ? 'Standard' : 'Extended'} IP access list ${n}`);
    for (const e of a.entries) {
      if (e.remark !== undefined) continue;
      const hits = s.net.aclHits[`${s.dev.name}|${n}|${e.seq}`];
      out.push(`    ${e.seq} ${e.show}${hits ? ` (${hits} match${hits === 1 ? '' : 'es'})` : ''}`);
    }
  }
  return out.join('\n');
}

export function natTranslations(s) {
  const out = ['Pro  Inside global         Inside local          Outside local         Outside global'];
  const d = s.dev;
  let id = 1;
  for (const t of s.net.natTable[d.name] || []) {
    const port = t.kind === 'overload' ? `:${id++}` : '';
    out.push(`${pad(t.proto === 'icmp' ? 'icmp' : t.proto, 4)} ${pad(fmtV4(t.global) + port, 21)} ${pad(fmtV4(t.local) + port, 21)} ${pad(fmtV4(t.remote) + port, 21)} ${fmtV4(t.remote) + port}`);
  }
  for (const st of d.nat.statics) out.push(`${pad('---', 4)} ${pad(fmtV4(st.global), 21)} ${pad(fmtV4(st.local), 21)} ${pad('---', 21)} ---`);
  return out.join('\n');
}

export function natStatistics(s) {
  const d = s.dev;
  const dyn = (s.net.natTable[d.name] || []).length;
  const ins = Object.values(d.intfs).filter(i => i.nat === 'inside').map(i => i.name);
  const outs = Object.values(d.intfs).filter(i => i.nat === 'outside').map(i => i.name);
  const lines = [`Total active translations: ${dyn + d.nat.statics.length} (${d.nat.statics.length} static, ${dyn} dynamic; ${dyn} extended)`,
    'Peak translations: ' + (dyn + d.nat.statics.length), 'Outside interfaces:', `  ${outs.join(', ')}`, 'Inside interfaces: ', `  ${ins.join(', ')}`,
    `Hits: ${dyn * 5}  Misses: 0`, 'Dynamic mappings:', '-- Inside Source'];
  for (const m of d.nat.dynamic) {
    lines.push(`[Id: 1] access-list ${m.acl} ${m.intf ? `interface ${m.intf}` : `pool ${m.pool}`} refcount ${dyn}`);
  }
  return lines.join('\n');
}

export function dhcpBinding(s) {
  const out = ['Bindings from all pools not associated with VRF:', 'IP address          Client-ID/              Lease expiration        Type',
    '                    Hardware address/', '                    User name'];
  for (const [k, l] of Object.entries(s.net.leases)) {
    if (!l || l.server !== s.dev.name) continue;
    const [dn, intf] = k.split('|');
    const mac = s.net.devs[dn].intfs[intf].mac;
    const cid = `01${mac.replace(/\./g, '')}`.match(/.{1,4}/g).join('.');
    out.push(`${pad(fmtV4(l.addr), 19)} ${pad(cid, 23)} ${pad('Mar 02 1993 12:12 AM', 23)} Automatic`);
  }
  return out.join('\n');
}

export function dhcpPool(s) {
  const out = [];
  for (const [name, p] of Object.entries(s.dev.dhcp.pools)) {
    const leased = Object.values(s.net.leases).filter(l => l && l.server === s.dev.name && l.pool === name).length;
    const total = p.network !== null ? 2 ** (32 - p.len) - 2 : 0;
    out.push('', `Pool ${name} :`, ' Utilization mark (high/low)    : 100 / 0', ' Subnet size (first/next)       : 0 / 0 ',
      ` Total addresses                : ${total}`, ` Leased addresses               : ${leased}`, ' Pending event                  : none');
    if (p.network !== null) {
      const first = p.network + 1n, last = p.network + BigInt(total);
      out.push(' 1 subnet is currently in the pool :', ' Current index        IP address range                    Leased addresses',
        ` ${pad(fmtV4(first + BigInt(leased)), 20)} ${pad(fmtV4(first), 16)} - ${pad(fmtV4(last), 17)} ${leased}`);
    }
  }
  return out.join('\n');
}

export function showVersion(s) {
  const d = s.dev;
  const sw = d.kind !== 'router';
  return [
    sw ? 'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE4, RELEASE SOFTWARE (fc1)'
      : 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.2(4)M3, RELEASE SOFTWARE (fc1)',
    'Technical Support: http://www.cisco.com/techsupport', 'Copyright (c) 1986-2013 by Cisco Systems, Inc.', '',
    `ROM: Bootstrap program is ${sw ? 'C2960' : 'C2900'} boot loader`, '',
    `${d.hostname} uptime is ${Math.floor((754 + s.lab.clock) / 60)} minutes`,
    'System returned to ROM by power-on', `System image file is "flash:${sw ? 'c2960-lanbasek9-mz.150-2.SE4.bin' : 'c2900-universalk9-mz.SPA.152-4.M3.bin'}"`, '',
    `cisco ${d.platform} (${sw ? 'PowerPC405' : 'revision 1.0'}) processor with ${sw ? '65536K' : '491520K/32768K'} bytes of memory.`,
    `${Object.keys(d.intfs).filter(n => /Ethernet/.test(n)).length} Ethernet interfaces`,
    'Configuration register is 0x2102'].join('\n');
}

export function showClock(s) {
  return `*${uptime(s)}.${String(123 + (s.lab.clock % 800)).padStart(3, '0')} UTC Mon Mar 1 1993`;
}

export function showIpSsh(s) {
  const d = s.dev;
  if (!d.rsaBits) return 'SSH Disabled - version 1.99\n%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).\nAuthentication timeout: 120 secs; Authentication retries: 3';
  const v = d.sshVersion === 2 ? '2.0' : d.sshVersion === 1 ? '1.5' : '1.99';
  return `SSH Enabled - version ${v}\nAuthentication methods:publickey,keyboard-interactive,password\nAuthentication timeout: 120 secs; Authentication retries: 3\nMinimum expected Diffie Hellman key size : 1024 bits\nIOS Keys in SECSH format(ssh-rsa, base64 encoded): ${d.hostname}`;
}

export function portSecurity(s, only) {
  const d = s.dev;
  if (only) {
    const i = d.intfs[only];
    if (!i) return '';
    const ps = i.ps || {};
    const st = s.net.status(d.name, only);
    const status = !ps.enabled ? 'Secure-down' : st.err ? 'Secure-shutdown' : st.proto === 'up' ? 'Secure-up' : 'Secure-down';
    const mode = { shutdown: 'Shutdown', restrict: 'Restrict', protect: 'Protect' }[ps.violation || 'shutdown'];
    const learned = s.net.macTable(d.name).filter(m => m.port === only);
    const last = learned[0];
    return [`Port Security              : ${ps.enabled ? 'Enabled' : 'Disabled'}`, `Port Status                : ${status}`,
      `Violation Mode             : ${mode}`, 'Aging Time                 : 0 mins', 'Aging Type                 : Absolute',
      'SecureStatic Address Aging : Disabled', `Maximum MAC Addresses      : ${ps.max || 1}`,
      `Total MAC Addresses        : ${ps.enabled ? Math.max(ps.macs ? ps.macs.length : 0, learned.length ? 1 : 0) : 0}`,
      `Configured MAC Addresses   : ${ps.macs && !ps.sticky ? ps.macs.length : 0}`, `Sticky MAC Addresses       : ${ps.sticky ? ps.macs.length : 0}`,
      `Last Source Address:Vlan   : ${last ? `${last.mac}:${last.vlan}` : '0000.0000.0000:0'}`,
      `Security Violation Count   : ${ps.violations || 0}`].join('\n');
  }
  const out = ['Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action', '                (Count)       (Count)          (Count)',
    '---------------------------------------------------------------------------'];
  for (const i of sortedIntfs(d)) {
    if (!i.ps || !i.ps.enabled) continue;
    const cur = s.net.macTable(d.name).filter(m => m.port === i.name).length;
    const mode = { shutdown: 'Shutdown', restrict: 'Restrict', protect: 'Protect' }[i.ps.violation];
    out.push(`${lpad(shortName(i.name), 11)} ${lpad(i.ps.max, 14)} ${lpad(cur, 12)} ${lpad(i.ps.violations || 0, 18)} ${lpad(mode, 16)}`);
  }
  out.push('---------------------------------------------------------------------------',
    'Total Addresses in System (excluding one mac per port)     : 0', 'Max Addresses limit in System (excluding one mac per port) : 8192');
  return out.join('\n');
}

export function spanningTree(s, vlanFilter) {
  const { dev, net } = s;
  if (!isSwitch(dev)) return '';
  const out = [];
  const vlans = Object.keys(dev.vlans).map(Number).filter(v => vlanFilter === undefined || v === vlanFilter);
  for (const v of vlans) {
    const st = computeStp(net, v)[dev.name];
    if (!st || !Object.keys(st.ports).length) continue;
    const isRoot = st.root.dev === dev.name;
    out.push(`VLAN${String(v).padStart(4, '0')}`);
    out.push(`  Spanning tree enabled protocol ${dev.stp.mode === 'rapid-pvst' ? 'rstp' : 'ieee'}`);
    out.push(`  Root ID    Priority    ${st.root.prio}`, `             Address     ${st.root.mac}`);
    if (isRoot) out.push('             This bridge is the root');
    else {
      const rp = st.rootPort;
      out.push(`             Cost        ${st.rootCost}`, `             Port        ${st.ports[rp].id} (${rp})`);
    }
    out.push('             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec', '');
    out.push(`  Bridge ID  Priority    ${st.bid.prio}  (priority ${bridgePriority(dev, v)} sys-id-ext ${v})`,
      `             Address     ${bridgeMac(dev)}`, '             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec',
      '             Aging Time  300 sec', '');
    out.push('Interface           Role Sts Cost      Prio.Nbr Type', '------------------- ---- --- --------- -------- --------------------------------');
    for (const [name, p] of Object.entries(st.ports).sort((a, b) => compareIntf(a[0], b[0]))) {
      out.push(`${pad(shortName(name), 19)} ${p.role} ${p.state} ${pad(p.cost, 9)} ${pad(`128.${p.id}`, 8)} P2p${p.edge ? ' Edge' : ''}`);
    }
    out.push('', '');
  }
  return out.join('\n').trimEnd() || `Spanning tree instance(s) for vlan ${vlanFilter} does not exist.`;
}

export function ntpAssociations(s) {
  const d = s.dev;
  const out = ['', '  address         ref clock       st   when   poll reach  delay  offset   disp'];
  for (const srv of d.ntp.servers) {
    const owner = s.net.owner(srv, 4);
    const ok = owner && s.net.devs[owner.dev].ntp.master !== null && s.net.ping(d.name, srv).ok;
    const st = ok ? s.net.devs[owner.dev].ntp.master : 16;
    out.push(`${ok ? '*~' : ' ~'}${pad(fmtV4(srv), 15)} ${pad(ok ? '127.127.1.1' : '.INIT.', 15)} ${lpad(st, 3)} ${lpad(ok ? 12 : '-', 6)} ${lpad(64, 6)} ${lpad(ok ? 377 : 0, 5)} ${lpad(ok ? '1.204' : '0.000', 6)} ${lpad(ok ? '-0.054' : '0.000', 7)} ${lpad(ok ? '0.873' : '15937.', 6)}`);
  }
  out.push(' * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured');
  return out.join('\n');
}

export function ntpStatus(s) {
  const d = s.dev;
  if (d.ntp.master !== null) return `Clock is synchronized, stratum ${d.ntp.master}, reference is 127.127.1.1`;
  for (const srv of d.ntp.servers) {
    const owner = s.net.owner(srv, 4);
    if (owner && s.net.devs[owner.dev].ntp.master !== null && s.net.ping(d.name, srv).ok) {
      return `Clock is synchronized, stratum ${s.net.devs[owner.dev].ntp.master + 1}, reference is ${fmtV4(srv)}`;
    }
  }
  return 'Clock is unsynchronized, stratum 16, no reference clock';
}

export function ipInterface(s, name) {
  const { dev, net } = s;
  const i = dev.intfs[name];
  if (!i) return '';
  const st = net.status(dev.name, name);
  const a = net.primaryIp(dev.name, name);
  const out = [`${name} is ${st.admin}, line protocol is ${st.proto}`];
  if (!a) { out.push('  Internet protocol processing disabled'); return out.join('\n'); }
  out.push(`  Internet address is ${fmtV4(a.addr)}/${a.len}`, '  Broadcast address is 255.255.255.255', '  Address determined by ' + (i.dhcp ? 'DHCP' : 'non-volatile memory'),
    '  MTU is 1500 bytes');
  out.push(i.helpers.length ? `  Helper addresses are ${i.helpers.map(fmtV4).join(' ')}` : '  Helper address is not set');
  out.push('  Directed broadcast forwarding is disabled');
  out.push(`  Outgoing Common access list is not set `, `  Outgoing access list is ${i.acl.out || 'not set'}`,
    `  Inbound Common access list is not set `, `  Inbound  access list is ${i.acl.in || 'not set'}`,
    '  Proxy ARP is enabled', '  Local Proxy ARP is disabled', '  Security level is default', '  Split horizon is enabled',
    '  ICMP redirects are always sent', '  ICMP unreachables are always sent', '  ICMP mask replies are never sent',
    `  IP fast switching is enabled`, `  IP Flow switching is disabled`, `  IP CEF switching is enabled`);
  if (i.nat) out.push(`  Network address translation is enabled, interface in domain ${i.nat}`);
  return out.join('\n');
}

export function arpTable(s) {
  const { dev, net } = s;
  const out = ['Protocol  Address          Age (min)  Hardware Addr   Type   Interface'];
  for (const a of (net.l3[dev.name] || []).filter(x => x.fam === 4 && x.up)) {
    out.push(`Internet  ${pad(fmtV4(a.addr), 16)} ${pad('-', 10)} ${pad(dev.intfs[a.intf].mac, 15)} ARPA   ${a.intf}`);
    for (const [tn, list] of Object.entries(net.l3)) {
      if (tn === dev.name) continue;
      for (const b of list) {
        if (b.fam !== 4 || !b.up || b.seg !== a.seg || !inPrefix(b.addr, a.addr, a.len)) continue;
        if (!net.arpSeen.has(`${dev.name}>${fmtV4(b.addr)}`) && !net.arpSeen.has(`${tn}>${fmtV4(a.addr)}`) && ![...net.arpSeen].some(k => k.startsWith(dev.name + '>'))) continue;
        out.push(`Internet  ${pad(fmtV4(b.addr), 16)} ${pad('0', 10)} ${pad(net.devs[tn].intfs[b.intf].mac, 15)} ARPA   ${a.intf}`);
      }
    }
  }
  return out.join('\n');
}

export { section, lenToMask };
