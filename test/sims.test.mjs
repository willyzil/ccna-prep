import { test } from 'node:test';
import assert from 'node:assert/strict';
import labs from '../src/bank/labs.js';
import { Lab, checker } from '../src/sim/lab.js';
import { parseV4, fmtV4 } from '../src/sim/addr.js';

const get = id => { const q = labs.find(x => x.id === id); return { q, lab: new Lab(q.lab) }; };
const out = (lab, dev, cmd) => { lab.input(dev, cmd); const c = lab.console(dev); const t = c.buf.join('\n'); c.buf = []; return t; };

test('SIM-ROUTE: 10.10.3.25 uses the /25 static via 10.0.13.2', () => {
  const { lab } = get('SIM-ROUTE');
  const r = lab.net.lookup('R1', 4, parseV4('10.10.3.25'));
  assert.equal(r.len, 25);
  assert.equal(fmtV4(r.nhs[0].ip), '10.0.13.2');
  const t = out(lab, 'R1', 'show ip route');
  assert.match(t, /O\s+10\.10\.3\.0\/24 \[110\/2\] via 10\.0\.12\.2/);
  assert.doesNotMatch(t, /\[120\/0\]/);
});

test('SIM-DR: R4 is DR, R3 is BDR, R1-R2 stay 2WAY', () => {
  const { lab } = get('SIM-DR');
  const n = lab.net.ospfNeighbors('R2');
  const by = Object.fromEntries(n.map(x => [x.dn, x]));
  assert.equal(by.R4.role, 'DR'); assert.equal(by.R4.state, 'FULL');
  assert.equal(by.R3.role, 'BDR'); assert.equal(by.R3.state, 'FULL');
  assert.equal(by.R1.state, '2WAY');
  assert.ok(lab.net.ospfNeighbors('R1').some(x => x.dn === 'R4' && x.state === 'FULL'));
});

test('SIM-NAT: PC1 reaches the ISP, PC3 does not', () => {
  const { lab } = get('SIM-NAT');
  const L = checker(lab);
  assert.ok(L.ping('PC1', '198.51.100.100'));
  assert.ok(!L.ping('PC3', '198.51.100.100'));
});

test('SIM-TRUNK: VLAN 10 broken, VLAN 20 works', () => {
  const { lab } = get('SIM-TRUNK');
  const L = checker(lab);
  assert.ok(!L.ping('PC1', '192.168.10.2'));
  assert.ok(L.ping('PC3', '192.168.20.4'));
  assert.match(out(lab, 'SW2', 'show interfaces trunk'), /Gi0\/1\s+1,20,30/);
});

test('SIM-CDP: SW2 Fa0/17 to HQ-EDGE Gig 0/2', () => {
  const { lab } = get('SIM-CDP');
  assert.match(out(lab, 'SW2', 'show cdp neighbors'), /HQ-EDGE\s+Fas 0\/17\s+\d+\s+R B S I\s+CISCO2911 Gig 0\/2/);
});

test('SIM-DUPLEX: router sees CRC, switch sees late collisions', () => {
  const { lab } = get('SIM-DUPLEX');
  const r = out(lab, 'R1', 'show interfaces g0/0');
  const s = out(lab, 'SW1', 'show interfaces f0/1');
  assert.match(r, /Full-duplex, 100Mb\/s/);
  assert.match(r, /[1-9]\d* CRC/);
  assert.match(s, /Half-duplex/);
  assert.match(s, /[1-9]\d* late collision/);
  assert.ok(checker(lab).ping('R1', '192.168.1.2'));
});

test('SIM-ACL: permitted flows are exactly a and d', () => {
  const { lab } = get('SIM-ACL');
  const flows = {
    a: { proto: 'tcp', src: '192.168.1.200', dport: 22 },
    b: { proto: 'tcp', src: '192.168.1.20', dport: 22 },
    c: { proto: 'icmp', src: '192.168.1.20' },
    d: { proto: 'tcp', src: '192.168.1.130', dport: 80 },
    e: { proto: 'ip', src: '192.168.2.5' },
  };
  const ok = Object.entries(flows).filter(([, f]) => lab.net.aclPermits('R1', '120', { ...f, src: parseV4(f.src), dst: parseV4('192.168.50.10') })).map(([k]) => k);
  assert.deepEqual(ok, ['a', 'd']);
});

test('SIM-STP: SW3 root, SW2 Gi0/1 blocks', () => {
  const { lab } = get('SIM-STP');
  assert.match(out(lab, 'SW3', 'show spanning-tree'), /This bridge is the root/);
  assert.match(out(lab, 'SW2', 'show spanning-tree'), /Gi0\/1\s+Altn BLK/);
  assert.match(out(lab, 'SW1', 'show spanning-tree'), /Gi0\/1\s+Desg FWD/);
});
