// Per-VLAN spanning tree (PVST+/Rapid PVST+) for show spanning-tree.
import { intfKey, isSwitch } from './net.js';

const COST = { TenGigabitEthernet: 2, GigabitEthernet: 4, FastEthernet: 19, Ethernet: 100 };

function portCost(name) {
  const t = name.replace(/[\d/.]+$/, '');
  return COST[t] || 19;
}

export function bridgeMac(dev) {
  return dev.intfs[dev.portList[0]].mac.replace(/\.(\w{4})$/, (m, x) => `.${x.slice(0, 2)}00`);
}

export function bridgePriority(dev, vlan) {
  const p = dev.stp.priority[vlan];
  return (p === undefined ? 32768 : p);
}

function bid(dev, vlan) {
  return { prio: bridgePriority(dev, vlan) + vlan, mac: bridgeMac(dev), dev: dev.name };
}

function cmpBid(a, b) {
  if (a.prio !== b.prio) return a.prio - b.prio;
  return a.mac < b.mac ? -1 : a.mac > b.mac ? 1 : 0;
}

// Returns { root, rootCost, rootPort, ports: { name: { role, state, cost, id } } } per switch.
export function computeStp(net, vlan) {
  const sws = Object.values(net.devs).filter(d => isSwitch(d) && d.vlans[vlan]);
  const carries = (dn, i) => {
    if (!i.sw || i.routed || !net.isUp(dn, i.name)) return false;
    if (i.channel && net.chan[intfKey(dn, i.name)] === 'P') return false;
    if (net.trunk[intfKey(dn, i.name)]) return net.trunkVlans(dn, i).includes(vlan);
    return net.swOf(dn, i).access === vlan;
  };
  // Logical ports: physical ports plus bundled port-channels.
  const ports = {};
  for (const d of sws) {
    ports[d.name] = [];
    for (const i of Object.values(d.intfs)) {
      if (/^Port-channel/.test(i.name)) {
        if (!net.isUp(d.name, i.name)) continue;
        const sw = i.sw;
        const ok = net.trunk[intfKey(d.name, membersOf(d, i)[0])] ? (!sw.allowed || sw.allowed.includes(vlan)) : sw.access === vlan;
        if (!ok) continue;
        const mem = membersOf(d, i);
        const peerDev = net.peer[intfKey(d.name, mem[0])];
        ports[d.name].push({
          name: i.name, cost: mem.length > 1 ? Math.max(1, Math.round(portCost(mem[0]) * 0.75)) : portCost(mem[0]),
          id: 64 + Number(i.name.replace('Port-channel', '')), peer: peerDev ? channelPeer(net, peerDev) : null, edge: i.portfast,
        });
      } else if (carries(d.name, i)) {
        const p = net.peer[intfKey(d.name, i.name)];
        ports[d.name].push({ name: i.name, cost: portCost(i.name), id: d.portList.indexOf(i.name) + 1, peer: p, edge: i.portfast });
      }
    }
  }
  const byName = Object.fromEntries(sws.map(d => [d.name, d]));
  const bids = Object.fromEntries(sws.map(d => [d.name, bid(d, vlan)]));
  // Components: each connected set of switches elects its own root.
  const result = {};
  const seen = new Set();
  for (const start of sws) {
    if (seen.has(start.name)) continue;
    const comp = [];
    const stack = [start.name];
    while (stack.length) {
      const n = stack.pop();
      if (seen.has(n)) continue;
      seen.add(n);
      comp.push(n);
      for (const p of ports[n]) if (p.peer && byName[p.peer.dev]) stack.push(p.peer.dev);
    }
    const root = comp.map(n => bids[n]).sort(cmpBid)[0];
    // Root path cost (Dijkstra).
    const dist = { [root.dev]: 0 };
    const done = new Set();
    for (;;) {
      let u = null;
      for (const n of comp) if (dist[n] !== undefined && !done.has(n) && (u === null || dist[n] < dist[u])) u = n;
      if (u === null) break;
      done.add(u);
      for (const p of ports[u]) {
        if (!p.peer || !byName[p.peer.dev]) continue;
        const pp = ports[p.peer.dev].find(x => x.name === p.peer.intf);
        if (!pp) continue;
        const nd = dist[u] + pp.cost;
        if (dist[p.peer.dev] === undefined || nd < dist[p.peer.dev]) dist[p.peer.dev] = nd;
      }
    }
    for (const n of comp) {
      const res = { root, rootCost: dist[n] ?? 0, rootPort: null, ports: {}, bid: bids[n] };
      if (n !== root.dev) {
        let best = null;
        for (const p of ports[n]) {
          if (!p.peer || !byName[p.peer.dev]) continue;
          const pp = ports[p.peer.dev].find(x => x.name === p.peer.intf);
          if (!pp || dist[p.peer.dev] === undefined) continue;
          const cand = { p, cost: dist[p.peer.dev] + p.cost, sender: bids[p.peer.dev], spid: pp.id };
          if (!best || cand.cost < best.cost || (cand.cost === best.cost && (cmpBid(cand.sender, best.sender) < 0 ||
            (cmpBid(cand.sender, best.sender) === 0 && (cand.spid < best.spid || (cand.spid === best.spid && p.id < best.p.id)))))) best = cand;
        }
        res.rootPort = best ? best.p.name : null;
      }
      result[n] = res;
    }
    for (const n of comp) {
      for (const p of ports[n]) {
        let role;
        if (result[n].rootPort === p.name) role = 'Root';
        else if (!p.peer || !byName[p.peer.dev]) role = 'Desg';
        else {
          // Designated if our (cost, bid, port id) beats the far end's.
          const other = result[p.peer.dev];
          const pp = ports[p.peer.dev].find(x => x.name === p.peer.intf);
          if (other.rootPort === p.peer.intf) role = 'Desg';
          else {
            const mine = [result[n].rootCost, bids[n], p.id];
            const theirs = [other.rootCost, bids[p.peer.dev], pp ? pp.id : 0];
            const c = mine[0] - theirs[0] || cmpBid(mine[1], theirs[1]) || mine[2] - theirs[2];
            role = c < 0 ? 'Desg' : 'Altn';
          }
        }
        result[n].ports[p.name] = { role, state: role === 'Altn' ? 'BLK' : 'FWD', cost: p.cost, id: p.id, edge: p.edge };
      }
    }
  }
  return result;
}

function membersOf(dev, po) {
  const g = Number(po.name.replace('Port-channel', ''));
  return Object.values(dev.intfs).filter(i => i.channel && i.channel.group === g).map(i => i.name);
}

function channelPeer(net, peer) {
  const pd = net.devs[peer.dev];
  const pi = pd.intfs[peer.intf];
  if (pi.channel && net.chan[intfKey(peer.dev, peer.intf)] === 'P') return { dev: peer.dev, intf: `Port-channel${pi.channel.group}` };
  return peer;
}
