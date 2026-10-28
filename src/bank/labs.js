// Hands-on CLI labs (graded by tasks) and "sim" items (multiple choice
// answered by investigating live devices).
import { computeStp } from '../sim/stp.js';
import { parseV6, parseV4 } from '../sim/addr.js';

const pc = (name, ip, gw, mask = '255.255.255.0') => ({ name, kind: 'host', host: { ip, mask, gw } });
const steps = (dev, text) => text.trim().split('\n').map(l => [dev, l.trim()]);

export default [
  // ------------------------------------------------------------------ A
  {
    id: 'LAB-SSH', exam: 'A', obj: '4.8', type: 'lab', title: 'Secure device access with SSH',
    q: `You have console access to the HQ router. Harden management access and enable SSH so the admin PC can manage the router securely.

Credentials and values are case-sensitive.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        pc('PC-ADMIN', '192.168.1.10', '192.168.1.1'),
      ],
      links: [['R1 g0/1', 'SW1 g0/1'], ['SW1 f0/1', 'PC-ADMIN f0']],
      topo: { 'R1': [50, 12], 'SW1': [50, 50], 'PC-ADMIN': [50, 88] },
      tasks: [
        { text: 'Set the hostname to **HQ-R1**.', check: L => L.dev('R1').hostname === 'HQ-R1' },
        { text: 'Protect privileged EXEC mode with the hashed secret **Exec#2024**.', check: L => L.dev('R1').enableSecret === 'Exec#2024' },
        { text: 'Create local user **netops** with privilege level 15 and the secret **0psTeam!**.', check: L => { const u = L.dev('R1').users.netops; return !!u && u.secret === '0psTeam!' && u.priv === 15; } },
        { text: 'Use the domain name **corp.lab**, generate 2048-bit RSA keys and allow only SSH version 2.', check: L => { const d = L.dev('R1'); return d.domainName === 'corp.lab' && d.rsaBits >= 2048 && d.sshVersion === 2; } },
        { text: 'On VTY lines 0–15, authenticate against the local user database and accept SSH only.', check: L => L.dev('R1').lines.vty.every(l => l.login === 'local' && l.transport && l.transport.length === 1 && l.transport[0] === 'ssh') },
        { text: 'Encrypt any plaintext passwords in the configuration.', check: L => L.dev('R1').pwEncryption },
        { text: 'Verify: PC-ADMIN can SSH to 192.168.1.1 as netops, and Telnet is refused.', check: L => L.login('PC-ADMIN', '192.168.1.1', 'ssh', 'netops', '0psTeam!') && !L.login('PC-ADMIN', '192.168.1.1', 'telnet', 'netops', '0psTeam!') },
      ],
      solution: steps('R1', `enable
configure terminal
hostname HQ-R1
enable secret Exec#2024
username netops privilege 15 secret 0psTeam!
ip domain-name corp.lab
crypto key generate rsa modulus 2048
ip ssh version 2
line vty 0 15
login local
transport input ssh
exit
service password-encryption
end`),
    },
    exp: `**Why each step matters**

- \`enable secret\` stores a hash. \`enable password\` is stored in clear text (or weak type 7 with \`service password-encryption\`), so always prefer the secret.
- SSH needs a hostname other than the default **and** a domain name: together they name the RSA key pair (\`HQ-R1.corp.lab\`). Keys of at least 768 bits are needed for SSH v2; 2048 is the modern minimum.
- \`login local\` makes the VTY lines use the \`username\` database. \`transport input ssh\` refuses Telnet, which sends credentials in plain text.
- \`service password-encryption\` only obscures type 0 passwords with reversible type 7. It is not real security, but it stops shoulder-surfing of \`show run\`.

Verify with \`show ip ssh\`, \`show run | section line vty\` and \`ssh -l netops 192.168.1.1\` from PC-ADMIN.`,
  },
  {
    id: 'LAB-VLAN', exam: 'A', obj: '2.2', type: 'lab', title: 'VLANs and an 802.1Q trunk',
    q: `Two access switches serve the Sales and Engineering teams. Create the VLANs, assign the access ports and build a secure trunk between the switches.

| Port | VLAN |
|---|---|
| Fa0/1 (both switches) | 10 – SALES |
| Fa0/2 (both switches) | 20 – ENG |
| Trunk native | 99 – NATIVE |`,
    lab: {
      devices: [
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        { name: 'SW2', kind: 'switch', config: 'hostname SW2' },
        pc('PC1', '192.168.10.11', '192.168.10.1'), pc('PC2', '192.168.20.12', '192.168.20.1'),
        pc('PC3', '192.168.10.13', '192.168.10.1'), pc('PC4', '192.168.20.14', '192.168.20.1'),
      ],
      links: [['SW1 g0/1', 'SW2 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'PC2 f0'], ['SW2 f0/1', 'PC3 f0'], ['SW2 f0/2', 'PC4 f0']],
      topo: { SW1: [28, 30], SW2: [72, 30], PC1: [14, 80], PC2: [38, 80], PC3: [62, 80], PC4: [86, 80] },
      tasks: [
        { text: 'On both switches create VLAN 10 **SALES**, VLAN 20 **ENG** and VLAN 99 **NATIVE**.', check: L => ['SW1', 'SW2'].every(s => { const v = L.dev(s).vlans; return v[10]?.name === 'SALES' && v[20]?.name === 'ENG' && v[99]?.name === 'NATIVE'; }) },
        { text: 'Make Fa0/1 a static access port in VLAN 10 and Fa0/2 a static access port in VLAN 20 on both switches.', check: L => ['SW1', 'SW2'].every(s => { const a = L.intf(s, 'f0/1').sw, b = L.intf(s, 'f0/2').sw; return a.mode === 'access' && a.access === 10 && b.mode === 'access' && b.access === 20; }) },
        { text: 'Configure Gi0/1 on both switches as a static 802.1Q trunk with native VLAN 99.', check: L => ['SW1', 'SW2'].every(s => { const t = L.intf(s, 'g0/1').sw; return t.mode === 'trunk' && t.native === 99; }) },
        { text: 'Allow only VLANs 10, 20 and 99 on the trunk.', check: L => ['SW1', 'SW2'].every(s => JSON.stringify(L.intf(s, 'g0/1').sw.allowed) === '[10,20,99]') },
        { text: 'Verify: PC1 reaches PC3, and PC2 reaches PC4.', check: L => L.vlanOf('SW1', 'f0/1') === 10 && L.vlanOf('SW2', 'f0/2') === 20 && L.ping('PC1', '192.168.10.13') && L.ping('PC2', '192.168.20.14') },
      ],
      solution: ['SW1', 'SW2'].flatMap(s => steps(s, `enable
configure terminal
vlan 10
name SALES
vlan 20
name ENG
vlan 99
name NATIVE
interface fa0/1
switchport mode access
switchport access vlan 10
interface fa0/2
switchport mode access
switchport access vlan 20
interface gi0/1
switchport mode trunk
switchport trunk native vlan 99
switchport trunk allowed vlan 10,20,99
end`)),
    },
    exp: `- \`switchport mode access\` stops the port negotiating a trunk (DTP), which is the first step of VLAN hardening.
- A **native VLAN** carries untagged frames. Moving it off VLAN 1 to an unused VLAN, and doing so on *both* ends, prevents VLAN hopping by double tagging. A mismatch shows up as \`%CDP-4-NATIVE_VLAN_MISMATCH\`.
- Pruning the allowed list keeps unused VLANs' broadcasts off the link.

Verify with \`show vlan brief\`, \`show interfaces trunk\` and pings between the PCs. PC1 → PC2 still fails, because VLANs 10 and 20 are separate broadcast domains with no router between them.`,
  },
  {
    id: 'LAB-OSPF', exam: 'A', obj: '3.4', type: 'lab', points: 4, title: 'Single-area OSPFv2',
    q: `Three routers connect the HQ LAN to the branch LAN; R1 also connects to the ISP and already has a default route pointing at it. Deploy OSPF so every internal network is reachable and the branch can reach the Internet.

Do not advertise the ISP link (203.0.113.0/30) into OSPF.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.12.1 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown
interface g0/2
 ip address 203.0.113.2 255.255.255.252
 no shutdown
ip route 0.0.0.0 0.0.0.0 203.0.113.1` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 10.0.23.1 255.255.255.252
 no shutdown` },
        { name: 'R3', kind: 'router', config: `hostname R3
interface g0/0
 ip address 10.0.23.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.3.1 255.255.255.0
 no shutdown` },
        { name: 'ISP', kind: 'router', config: `hostname ISP
interface g0/0
 ip address 203.0.113.1 255.255.255.252
 no shutdown
interface loopback0
 ip address 8.8.8.8 255.255.255.255
ip route 192.168.0.0 255.255.0.0 203.0.113.2
ip route 10.0.0.0 255.0.0.0 203.0.113.2` },
        pc('PC1', '192.168.1.10', '192.168.1.1'), pc('PC3', '192.168.3.10', '192.168.3.1'),
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R2 g0/1', 'R3 g0/0'], ['R1 g0/1', 'PC1 f0'], ['R3 g0/1', 'PC3 f0'], ['R1 g0/2', 'ISP g0/0']],
      topo: { ISP: [18, 14], R1: [18, 48], R2: [50, 48], R3: [82, 48], PC1: [18, 88], PC3: [82, 88] },
      tasks: [
        { text: 'Run OSPF process **10** on R1, R2 and R3 and advertise every internal network in area 0.', check: L => L.ospfFull('R1', 'R2') && L.ospfFull('R2', 'R3') && L.route('R1', '192.168.3.0/24', 'O') && L.route('R3', '192.168.1.0/24', 'O') && ['R1', 'R2', 'R3'].every(r => L.net.ospf[r] && String(L.net.ospf[r].pid) === '10') },
        { text: 'Keep the ISP link out of OSPF.', check: L => L.ospfFull('R1', 'R2') && !L.route('R2', '203.0.113.0/30') },
        { text: 'Set router IDs **1.1.1.1**, **2.2.2.2** and **3.3.3.3** (R1–R3). They must be the IDs actually in use.', check: L => ['1.1.1.1', '2.2.2.2', '3.3.3.3'].every((rid, i) => { const o = L.net.ospf[`R${i + 1}`]; return o && o.rid !== null && L.net.ospf[`R${i + 1}`] && fmt(o.rid) === rid; }) },
        { text: 'Stop sending hellos out of the LAN interfaces (R1 G0/1 and R3 G0/1).', check: L => ['R1', 'R3'].every(r => { const o = L.net.ospf[r]; const i = o && o.intfs.find(x => x.intf === 'GigabitEthernet0/1'); return i && i.passive; }) },
        { text: 'Have R1 advertise its default route into OSPF.', check: L => L.route('R3', '0.0.0.0/0', 'O*E2') },
        { text: 'Verify: PC3 can ping 8.8.8.8.', check: L => L.ping('PC3', '8.8.8.8') },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
router ospf 10
router-id 1.1.1.1
network 10.0.12.0 0.0.0.3 area 0
network 192.168.1.0 0.0.0.255 area 0
passive-interface g0/1
default-information originate
end`),
        ...steps('R2', `enable
configure terminal
router ospf 10
router-id 2.2.2.2
network 10.0.12.0 0.0.0.3 area 0
network 10.0.23.0 0.0.0.3 area 0
end`),
        ...steps('R3', `enable
configure terminal
router ospf 10
router-id 3.3.3.3
network 10.0.23.0 0.0.0.3 area 0
network 192.168.3.0 0.0.0.255 area 0
passive-interface g0/1
end`),
      ],
    },
    exp: `- **Router ID order matters.** The RID is chosen when the process starts: manual \`router-id\`, else the highest loopback, else the highest active interface IP. Changing it later only takes effect after \`clear ip ospf process\` (or a reload), so set it first.
- Wildcard \`0.0.0.3\` matches exactly the /30 links; you could also use \`ip ospf 10 area 0\` on each interface.
- \`passive-interface\` still advertises the LAN subnet but stops hellos, so no rogue router can form an adjacency there.
- \`default-information originate\` advertises R1's static default as an external type-2 route (\`O*E2\`) because a default route already exists on R1 (add \`always\` to advertise it regardless).

Verify with \`show ip ospf neighbor\`, \`show ip protocols\` and \`show ip route ospf\`.`,
  },
  {
    id: 'SIM-ROUTE', exam: 'A', obj: '3.2', type: 'sim', title: 'Forwarding decision',
    q: `Use the CLI on R1 to investigate its routing table.

A packet arrives at R1 destined for **10.10.3.25**. Which next-hop address does R1 forward it to?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.12.1 255.255.255.252
 no shutdown
interface g0/1
 ip address 10.0.13.1 255.255.255.252
 no shutdown
router ospf 1
 router-id 1.1.1.1
 network 10.0.12.0 0.0.0.3 area 0
ip route 10.10.0.0 255.255.0.0 10.0.13.2
ip route 10.10.3.0 255.255.255.0 10.0.13.2 120
ip route 10.10.3.0 255.255.255.128 10.0.13.2 115` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface loopback1
 ip address 10.10.3.1 255.255.255.0
 ip ospf network point-to-point
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.3 area 0
 network 10.10.3.0 0.0.0.255 area 0` },
        { name: 'R3', kind: 'router', config: `hostname R3
interface g0/0
 ip address 10.0.13.2 255.255.255.252
 no shutdown
interface loopback1
 ip address 10.10.1.1 255.255.255.0
ip route 0.0.0.0 0.0.0.0 10.0.13.1` },
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R1 g0/1', 'R3 g0/0']],
      topo: { R1: [20, 50], R2: [75, 20], R3: [75, 80] },
    },
    opts: [
      ['10.0.13.2, because the /25 static route is the longest match', 'Correct: 10.10.3.25 falls inside 10.10.3.0/25 (.0–.127). Longest prefix match beats AD and metric, and the /25 static (AD 115) is installed because no other source offers a /25.'],
      ['10.0.12.2, because the OSPF /24 route has a lower AD than the /24 floating static', 'The OSPF /24 does beat the AD 120 static for the /24 prefix, but a more specific /25 also matches the destination, and longest match is evaluated first.'],
      ['10.0.13.2, because static routes always beat OSPF', 'AD only compares routes to the *same* prefix. Here the deciding factor is prefix length.'],
      ['R1 load-balances between 10.0.12.2 and 10.0.13.2', 'Load balancing needs equal-cost paths to the same prefix from the same source; these are different prefixes.'],
    ],
    ans: 'a',
    exp: `\`show ip route\` on R1 lists three candidates that contain 10.10.3.25:

| Route | Source | Installed? |
|---|---|---|
| 10.10.0.0/16 via 10.0.13.2 | static, AD 1 | yes |
| 10.10.3.0/24 via 10.0.12.2 | OSPF, AD 110 | yes (beats the AD 120 floating static) |
| 10.10.3.0/25 via 10.0.13.2 | static, AD 115 | yes (only source for /25) |

The router first picks the **longest matching prefix**: /25 wins. AD and metric only break ties between routes to the *same* prefix. \`show ip route 10.10.3.25\` confirms the entry used.`,
  },
  {
    id: 'SIM-ACL', exam: 'A', obj: '5.6', type: 'sim', title: 'ACL analysis',
    q: `Inspect the access list applied on R1. Which two flows are permitted to reach the server subnet 192.168.50.0/24?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
interface g0/1
 ip address 192.168.50.1 255.255.255.0
 ip access-group 120 out
 no shutdown
access-list 120 deny tcp 192.168.1.0 0.0.0.127 host 192.168.50.10 eq 22
access-list 120 permit tcp 192.168.1.0 0.0.0.255 host 192.168.50.10 eq www
access-list 120 deny icmp any 192.168.50.0 0.0.0.255 echo
access-list 120 permit ip 192.168.1.0 0.0.0.255 any` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        pc('PC1', '192.168.1.20', '192.168.1.1'),
        pc('SRV', '192.168.50.10', '192.168.50.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['R1 g0/1', 'SRV f0']],
      topo: { PC1: [12, 50], SW1: [36, 50], R1: [62, 50], SRV: [90, 50] },
    },
    opts: [
      ['SSH from 192.168.1.200 to 192.168.50.10', 'Permitted. .200 is outside 192.168.1.0/25, so line 10 does not match. Line 20 is HTTP only, line 30 is ICMP, and line 40 permits all IP from 192.168.1.0/24.'],
      ['SSH from 192.168.1.20 to 192.168.50.10', 'Denied by line 10: .20 is in 192.168.1.0 0.0.0.127 (.0–.127).'],
      ['Ping from 192.168.1.20 to 192.168.50.10', 'Denied by line 30, which drops ICMP echo requests to the whole server subnet.'],
      ['HTTP from 192.168.1.130 to 192.168.50.10', 'Permitted by line 20 (www = TCP 80) for any host in 192.168.1.0/24.'],
      ['Any traffic from 192.168.2.5 to 192.168.50.10', 'Denied by the implicit `deny any` at the end of every ACL.'],
    ],
    ans: 'a,d',
    exp: `ACLs are processed top-down and stop at the first match:

1. \`deny tcp 192.168.1.0 0.0.0.127 host 192.168.50.10 eq 22\`: hosts .0–.127 cannot SSH to the server.
2. \`permit tcp 192.168.1.0 0.0.0.255 host 192.168.50.10 eq www\`: any 192.168.1.x may use HTTP.
3. \`deny icmp any 192.168.50.0 0.0.0.255 echo\`: no pings into the subnet.
4. \`permit ip 192.168.1.0 0.0.0.255 any\`: everything else from 192.168.1.0/24.
5. Implicit \`deny ip any any\`.

So SSH from .200 (skips line 1, matches line 4) and HTTP from .130 (line 2) are permitted. Try \`ping 192.168.50.10\` from PC1 and then \`show access-lists\` to watch the counters.`,
  },

  // ------------------------------------------------------------------ B
  {
    id: 'LAB-ROAS', exam: 'B', obj: '2.1', type: 'lab', title: 'Router-on-a-stick',
    q: `SW1 already has VLAN 10 (STAFF) and VLAN 20 (GUEST) with the PCs assigned. Provide inter-VLAN routing on R1 using a single physical link.

| Subinterface | VLAN | Address |
|---|---|---|
| G0/0.10 | 10 | 192.168.10.1/24 |
| G0/0.20 | 20 | 192.168.20.1/24 |`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: 'hostname R1' },
        { name: 'SW1', kind: 'switch', config: `hostname SW1
vlan 10
 name STAFF
vlan 20
 name GUEST
interface f0/1
 switchport mode access
 switchport access vlan 10
interface f0/2
 switchport mode access
 switchport access vlan 20` },
        pc('PC1', '192.168.10.10', '192.168.10.1'), pc('PC2', '192.168.20.10', '192.168.20.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'PC2 f0']],
      topo: { R1: [50, 12], SW1: [50, 50], PC1: [25, 88], PC2: [75, 88] },
      tasks: [
        { text: 'Configure SW1 Gi0/1 as a static trunk.', check: L => L.intf('SW1', 'g0/1').sw.mode === 'trunk' },
        { text: 'Create R1 G0/0.10 (VLAN 10, 192.168.10.1/24) and G0/0.20 (VLAN 20, 192.168.20.1/24).', check: L => { const a = L.intf('R1', 'g0/0.10'), b = L.intf('R1', 'g0/0.20'); return !!a && !!b && a.encap?.vlan === 10 && b.encap?.vlan === 20 && L.has('R1', /ip address 192\.168\.10\.1 255\.255\.255\.0/) && L.has('R1', /ip address 192\.168\.20\.1 255\.255\.255\.0/); } },
        { text: 'Bring up the physical interface G0/0.', check: L => !L.intf('R1', 'g0/0').shutdown && L.up('R1', 'g0/0') },
        { text: 'Verify: PC1 can ping PC2.', check: L => L.ping('PC1', '192.168.20.10') },
      ],
      solution: [
        ...steps('SW1', `enable
configure terminal
interface g0/1
switchport mode trunk
end`),
        ...steps('R1', `enable
configure terminal
interface g0/0
no shutdown
interface g0/0.10
encapsulation dot1Q 10
ip address 192.168.10.1 255.255.255.0
interface g0/0.20
encapsulation dot1Q 20
ip address 192.168.20.1 255.255.255.0
end`),
      ],
    },
    exp: `- Each subinterface must have \`encapsulation dot1Q <vlan>\` **before** an IP address; IOS refuses the address otherwise.
- Subinterfaces inherit the physical interface's state, so \`no shutdown\` on G0/0 itself is required.
- The switch port toward the router must trunk. A router does not speak DTP, so a \`dynamic auto\` port stays in access mode and only VLAN 1 would reach R1.

Verify with \`show ip interface brief\`, \`show interfaces trunk\` on SW1, and a ping from PC1 to PC2 (first the gateway, then across).`,
  },
  {
    id: 'LAB-STATIC', exam: 'B', obj: '3.3', type: 'lab', title: 'Static and floating static routes',
    q: `HQ (R1) and Branch (R2) are joined by a primary Gigabit link and a backup serial link. Configure static routing so traffic uses the Gigabit link and automatically fails over to the serial link.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.12.1 255.255.255.252
 no shutdown
interface s0/0/0
 ip address 10.0.21.1 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface s0/0/0
 ip address 10.0.21.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.2.1 255.255.255.0
 no shutdown
interface loopback0
 ip address 2.2.2.2 255.255.255.255` },
        pc('PC1', '192.168.1.10', '192.168.1.1'), pc('PC2', '192.168.2.10', '192.168.2.1'),
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R1 s0/0/0', 'R2 s0/0/0'], ['R1 g0/1', 'PC1 f0'], ['R2 g0/1', 'PC2 f0']],
      topo: { R1: [30, 45], R2: [70, 45], PC1: [30, 88], PC2: [70, 88] },
      tasks: [
        { text: 'On R1, route 192.168.2.0/24 via R2\'s G0/0 address.', check: L => L.dev('R1').statics.some(r => r.fam === 4 && fmt(r.net) === '192.168.2.0' && r.len === 24 && r.nh !== null && fmt(r.nh) === '10.0.12.2' && r.ad === 1) },
        { text: 'On R1, add a floating static route to 192.168.2.0/24 via the serial link that is used only if the primary fails.', check: L => L.dev('R1').statics.some(r => r.fam === 4 && fmt(r.net) === '192.168.2.0' && r.len === 24 && ((r.nh !== null && fmt(r.nh) === '10.0.21.2') || r.intf === 'Serial0/0/0') && r.ad > 1) },
        { text: 'On R2, add a default route via 10.0.12.1 and a floating default route via 10.0.21.1 with AD 10.', check: L => { const st = L.dev('R2').statics.filter(r => r.len === 0); return st.some(r => r.nh !== null && fmt(r.nh) === '10.0.12.1' && r.ad === 1) && st.some(r => r.nh !== null && fmt(r.nh) === '10.0.21.1' && r.ad === 10); } },
        { text: 'On R1, add a host route to R2\'s loopback 2.2.2.2 via 10.0.12.2.', check: L => L.route('R1', '2.2.2.2/32', 'S') && L.nextHop('R1', '2.2.2.2/32').includes('10.0.12.2') },
        { text: 'Verify: PC1 reaches PC2, and still does if R1 G0/0 is shut down.', check: L => L.ping('PC1', '192.168.2.10') && L.withExtra(steps('R1', 'enable\nconfigure terminal\ninterface g0/0\nshutdown\nend')).ping('PC1', '192.168.2.10') },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
ip route 192.168.2.0 255.255.255.0 10.0.12.2
ip route 192.168.2.0 255.255.255.0 10.0.21.2 5
ip route 2.2.2.2 255.255.255.255 10.0.12.2
end`),
        ...steps('R2', `enable
configure terminal
ip route 0.0.0.0 0.0.0.0 10.0.12.1
ip route 0.0.0.0 0.0.0.0 10.0.21.1 10
end`),
      ],
    },
    exp: `- A **floating static** route is just a static route with a higher administrative distance (here 5 or 10). It stays out of the routing table while the AD 1 route is valid, and installs as soon as the primary route's next hop becomes unreachable.
- Both directions need a backup: if only R1 fails over, replies from R2 would still be sent toward the dead link.
- A /32 **host route** matches a single address; \`ip route 2.2.2.2 255.255.255.255 10.0.12.2\`.

Test the failover yourself: \`shutdown\` R1 G0/0, run \`show ip route static\` and ping PC2 again.`,
  },
  {
    id: 'LAB-ACL', exam: 'B', obj: '5.6', type: 'lab', points: 4, title: 'Extended and VTY ACLs',
    q: `Users on 192.168.10.0/24 must not reach the server subnet, except the administrator's PC. Management access to R1 must be limited to that same PC.

| Host | Address |
|---|---|
| PC-ADMIN | 192.168.10.5 |
| PC1 | 192.168.10.11 |
| SRV1 | 192.168.20.10 |
| Remote site (R2 Lo0) | 172.16.2.2 |

R1 already has a local user **admin** / **Adm1n!** for VTY logins.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
username admin secret Adm1n!
interface g0/0
 ip address 192.168.10.1 255.255.255.0
 no shutdown
interface g0/1
 ip address 192.168.20.1 255.255.255.0
 no shutdown
interface g0/2
 ip address 10.0.12.1 255.255.255.252
 no shutdown
ip route 172.16.2.2 255.255.255.255 10.0.12.2
line vty 0 4
 login local
 transport input telnet ssh` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface loopback0
 ip address 172.16.2.2 255.255.255.255
ip route 0.0.0.0 0.0.0.0 10.0.12.1` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        pc('PC-ADMIN', '192.168.10.5', '192.168.10.1'), pc('PC1', '192.168.10.11', '192.168.10.1'),
        pc('SRV1', '192.168.20.10', '192.168.20.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC-ADMIN f0'], ['SW1 f0/2', 'PC1 f0'], ['R1 g0/1', 'SRV1 f0'], ['R1 g0/2', 'R2 g0/0']],
      topo: { 'PC-ADMIN': [12, 30], PC1: [12, 75], SW1: [34, 52], R1: [58, 52], SRV1: [58, 90], R2: [86, 52] },
      tasks: [
        { text: 'Create extended ACL **USERS-IN** so that 192.168.10.0/24 cannot reach 192.168.20.0/24, except PC-ADMIN; all other traffic is permitted.', check: L => L.dev('R1').acls['USERS-IN']?.type === 'extended' && !L.ping('PC1', '192.168.20.10') && L.ping('PC-ADMIN', '192.168.20.10') && L.ping('PC1', '172.16.2.2') },
        { text: 'Apply USERS-IN inbound on R1 G0/0, closest to the users.', check: L => L.intf('R1', 'g0/0').acl.in === 'USERS-IN' },
        { text: 'With a standard ACL named **VTY-ONLY**, allow only PC-ADMIN to open Telnet/SSH sessions to R1.', check: L => L.dev('R1').acls['VTY-ONLY']?.type === 'standard' && L.dev('R1').lines.vty.slice(0, 5).every(l => l.accessClass === 'VTY-ONLY') && L.login('PC-ADMIN', '192.168.10.1', 'telnet', 'admin', 'Adm1n!') && !L.login('PC1', '192.168.10.1', 'telnet', 'admin', 'Adm1n!') },
      ],
      solution: steps('R1', `enable
configure terminal
ip access-list extended USERS-IN
permit ip host 192.168.10.5 192.168.20.0 0.0.0.255
deny ip 192.168.10.0 0.0.0.255 192.168.20.0 0.0.0.255
permit ip any any
exit
interface g0/0
ip access-group USERS-IN in
exit
ip access-list standard VTY-ONLY
permit host 192.168.10.5
exit
line vty 0 4
access-class VTY-ONLY in
end`),
    },
    exp: `- **Order matters**: the admin \`permit\` must come before the subnet \`deny\`, or the deny matches first.
- Without the final \`permit ip any any\`, the implicit deny would also block users from the remote site.
- Extended ACLs go **close to the source** so unwanted traffic is dropped before crossing the network; standard ACLs (source-only) go close to the destination.
- \`access-class\` filters connections *to* the VTY lines; \`ip access-group\` filters traffic *through* an interface.

Verify with \`show access-lists\` (watch the match counters) and by trying \`telnet 192.168.10.1\` from PC1.`,
  },
  {
    id: 'LAB-SERVICES', exam: 'B', obj: '4.2', type: 'lab', title: 'NTP, syslog and SNMP',
    q: `R1 will be the time source for the network. Configure R2 to synchronise to R1's loopback and to report to the NOC.

| Item | Value |
|---|---|
| R1 Loopback0 | 10.1.1.1 |
| Syslog server | 192.168.2.50 |
| SNMP read-only community | N0C-ro |`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.12.1 255.255.255.252
 no shutdown
interface loopback0
 ip address 10.1.1.1 255.255.255.255
ip route 192.168.2.0 255.255.255.0 10.0.12.2` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.2.1 255.255.255.0
 no shutdown
ip route 10.1.1.1 255.255.255.255 10.0.12.1` },
        pc('NOC', '192.168.2.50', '192.168.2.1'),
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R2 g0/1', 'NOC f0']],
      topo: { R1: [20, 45], R2: [55, 45], NOC: [88, 45] },
      tasks: [
        { text: 'Make R1 an authoritative NTP source at **stratum 3**.', check: L => L.dev('R1').ntp.master === 3 },
        { text: 'Make R2 an NTP client of 10.1.1.1, and confirm it can reach it.', check: L => L.dev('R2').ntp.servers.some(s => fmt(s) === '10.1.1.1') && L.ping('R2', '10.1.1.1') },
        { text: 'Send R2\'s syslog messages to 192.168.2.50, severity **warnings** and more severe only.', check: L => L.has('R2', /^logging host 192\.168\.2\.50$/m) && L.has('R2', /^logging trap (warnings|4)$/m) },
        { text: 'Configure the read-only SNMP community **N0C-ro** on R2.', check: L => L.has('R2', /^snmp-server community N0C-ro RO$/m) },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
ntp master 3
end`),
        ...steps('R2', `enable
configure terminal
ntp server 10.1.1.1
logging host 192.168.2.50
logging trap warnings
snmp-server community N0C-ro ro
end`),
      ],
    },
    exp: `- \`ntp master 3\` makes R1 serve its own clock at stratum 3; clients then sit at stratum 4. Pointing clients at a **loopback** keeps NTP working while any physical path to R1 is up.
- \`logging trap warnings\` (level 4) sends levels 0–4: emergencies, alerts, critical, errors, warnings. Lower number = more severe.
- SNMPv2c communities are clear-text passwords; \`RO\` allows GET only. Prefer SNMPv3 with authPriv in production.

Verify with \`show ntp associations\`, \`show ntp status\` and \`show run | include logging|snmp\`.`,
  },
  {
    id: 'SIM-STP', exam: 'B', obj: '2.5', type: 'sim', title: 'Spanning tree roles',
    q: `Three switches are connected in a triangle and run PVST+ with VLAN 1 only. Use the CLI on each switch to find the spanning-tree topology.

Which two statements are true?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'SW1', kind: 'switch', config: `hostname SW1
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode trunk` },
        { name: 'SW2', kind: 'switch', config: `hostname SW2
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode trunk` },
        { name: 'SW3', kind: 'switch', config: `hostname SW3
spanning-tree vlan 1 priority 4096
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode trunk` },
      ],
      links: [['SW1 g0/1', 'SW2 g0/1'], ['SW1 g0/2', 'SW3 g0/1'], ['SW2 g0/2', 'SW3 g0/2']],
      topo: { SW3: [50, 14], SW1: [20, 78], SW2: [80, 78] },
    },
    opts: [
      ['SW3 is the root bridge for VLAN 1.', 'Correct: SW3 has the lowest bridge priority (4096 + 1).'],
      ['SW1 is the root bridge for VLAN 1 because it has the lowest MAC address.', 'MAC address is only the tie-breaker when priorities are equal. SW3\'s priority 4097 beats 32769.'],
      ['SW2 Gi0/1 is an alternate port in the blocking state.', 'Correct. On the SW1–SW2 link both switches advertise root cost 4. SW1 has the lower bridge ID (equal priority, lower MAC), so SW1 Gi0/1 is designated and SW2 Gi0/1 becomes the alternate (blocking) port.'],
      ['Both of SW3\'s ports are root ports.', 'The root bridge has no root port; all of its ports are designated.'],
      ['SW1 Gi0/1 is an alternate port in the blocking state.', 'SW1 wins the tie-break on that link with its lower bridge ID, so its end is the designated (forwarding) port.'],
    ],
    ans: 'a,c',
    exp: `- **Root bridge**: lowest bridge ID = priority + VLAN (sys-id-ext) + MAC. SW3 (4096 + 1 = 4097) wins over the default 32769.
- SW1 and SW2 each pick the port with the lowest root path cost as **root port**: their direct Gi links to SW3 (cost 4).
- On the SW1–SW2 link one side must block. Both offer cost 4 to the root, so the **lower sender bridge ID** decides: the switch with the higher MAC (bridge ID) has its port as **alternate/blocking**.

Commands: \`show spanning-tree vlan 1\` on every switch. Look for "This bridge is the root", the Root/Desg/Altn roles and BLK state.`,
  },
  {
    id: 'SIM-DUPLEX', exam: 'B', obj: '1.4', type: 'sim', title: 'Slow link',
    q: `Users report that file transfers through the link between SW1 Fa0/1 and R1 G0/0 are very slow, although pings succeed. Investigate both ends of the link.

What is the most likely cause?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 speed 100
 duplex full
 no shutdown` },
        { name: 'SW1', kind: 'switch', config: `hostname SW1
interface vlan1
 ip address 192.168.1.2 255.255.255.0
 no shutdown` },
      ],
      links: [['R1 g0/0', 'SW1 f0/1']],
      topo: { R1: [25, 50], SW1: [75, 50] },
    },
    opts: [
      ['A duplex mismatch: R1 is hard-coded to full duplex while SW1 negotiated half duplex', 'Correct. R1 G0/0 is fixed at 100/full, so autonegotiation fails on SW1, which senses 100 Mb/s but falls back to half duplex. The half-duplex side logs late collisions; the full-duplex side logs CRC errors and runts.'],
      ['A speed mismatch between 100 Mb/s and 1000 Mb/s', 'A speed mismatch brings the link down entirely; this link is up/up and pings work.'],
      ['A faulty cable causing CRC errors on both ends', 'A bad cable would show errors on both ends in a similar way, not late collisions on one side and CRC/runts on the other.'],
      ['The switch port is in the wrong VLAN', 'Pings to SW1\'s VLAN 1 address work, so VLAN membership is fine.'],
    ],
    ans: 'a',
    exp: `\`show interfaces g0/0\` on R1 shows **Full-duplex, 100Mb/s** with CRC errors and runts. \`show interfaces f0/1\` on SW1 shows **Half-duplex** with **late collisions**.

When one side is hard-coded, it stops sending autonegotiation pulses. The other side can still detect the **speed** from the signal, but not the duplex, so IEEE 802.3 says it must assume **half duplex** at 10/100 Mb/s. Fix it by setting both ends to auto (preferred) or both to the same fixed values.`,
  },

  // ------------------------------------------------------------------ C
  {
    id: 'LAB-OSPF-TS', exam: 'C', obj: '3.4', type: 'lab', points: 4, title: 'Troubleshoot OSPF',
    q: `OSPF was deployed on R1, R2 and R3 but PC1 cannot reach PC3. Find and fix the faults. Every OSPF interface must be in **area 0**.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.12.1 255.255.255.252
 ip ospf hello-interval 5
 no shutdown
interface g0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown
router ospf 1
 router-id 1.1.1.1
 passive-interface g0/1
 network 10.0.12.0 0.0.0.3 area 0
 network 192.168.1.0 0.0.0.255 area 0` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 10.0.23.1 255.255.255.252
 no shutdown
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.3 area 0
 network 10.0.23.0 0.0.0.3 area 1` },
        { name: 'R3', kind: 'router', config: `hostname R3
interface g0/0
 ip address 10.0.23.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.3.1 255.255.255.0
 no shutdown
router ospf 1
 router-id 3.3.3.3
 passive-interface g0/1
 network 10.0.23.0 0.0.0.3 area 0` },
        pc('PC1', '192.168.1.10', '192.168.1.1'), pc('PC3', '192.168.3.10', '192.168.3.1'),
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R2 g0/1', 'R3 g0/0'], ['R1 g0/1', 'PC1 f0'], ['R3 g0/1', 'PC3 f0']],
      topo: { R1: [18, 40], R2: [50, 40], R3: [82, 40], PC1: [18, 85], PC3: [82, 85] },
      tasks: [
        { text: 'Restore the R1–R2 adjacency without changing R2\'s timers.', check: L => L.ospfFull('R1', 'R2') && L.intf('R2', 'g0/0').ospf.hello === null },
        { text: 'Restore the R2–R3 adjacency with every OSPF interface in area 0.', check: L => L.ospfFull('R2', 'R3') && ['R1', 'R2', 'R3'].every(r => L.net.ospf[r].intfs.every(i => i.areaN === 0)) },
        { text: 'Make R3\'s LAN reachable through OSPF.', check: L => L.route('R1', '192.168.3.0/24', 'O') },
        { text: 'Verify: PC1 can ping PC3.', check: L => L.ping('PC1', '192.168.3.10') },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
interface g0/0
no ip ospf hello-interval
end`),
        ...steps('R2', `enable
configure terminal
router ospf 1
no network 10.0.23.0 0.0.0.3 area 1
network 10.0.23.0 0.0.0.3 area 0
end`),
        ...steps('R3', `enable
configure terminal
router ospf 1
network 192.168.3.0 0.0.0.255 area 0
end`),
      ],
    },
    exp: `Three faults were planted:

1. **Hello/dead timer mismatch** on R1 G0/0 (hello 5, dead 20 vs R2's 10/40). Neighbors must agree on both timers, so no adjacency forms. \`show ip ospf interface g0/0\` shows the timers; \`no ip ospf hello-interval\` restores the defaults.
2. **Area mismatch** on the R2–R3 link (R2 says area 1, R3 says area 0). Hellos carry the area ID and must match.
3. **Missing network statement**: R3 never advertised 192.168.3.0/24. A passive interface is still advertised, but only if OSPF is enabled on it.

Other things to check when an adjacency will not form: subnet/mask, authentication, duplicate router IDs, MTU (stuck in EXSTART) and passive interfaces on the transit link.`,
  },
  {
    id: 'LAB-NAT', exam: 'C', obj: '4.1', type: 'lab', title: 'Static NAT and PAT',
    q: `The ISP routes only 203.0.113.0/29 back to R1, which already has a default route to the ISP. Configure NAT so the LAN can reach the Internet and the web server is reachable from outside.

| Item | Value |
|---|---|
| Web server inside / outside | 192.168.1.100 / 203.0.113.5 |
| Other LAN hosts | PAT on R1 G0/1's address, using ACL 1 |
| Internet test address | 8.8.8.8 |`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown
interface g0/1
 ip address 203.0.113.2 255.255.255.248
 no shutdown
ip route 0.0.0.0 0.0.0.0 203.0.113.1` },
        { name: 'ISP', kind: 'router', config: `hostname ISP
interface g0/0
 ip address 203.0.113.1 255.255.255.248
 no shutdown
interface loopback0
 ip address 8.8.8.8 255.255.255.255` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        pc('PC1', '192.168.1.10', '192.168.1.1'), { ...pc('WEB', '192.168.1.100', '192.168.1.1'), kind: 'server' },
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'WEB f0'], ['R1 g0/1', 'ISP g0/0']],
      topo: { PC1: [12, 30], WEB: [12, 75], SW1: [36, 52], R1: [62, 52], ISP: [88, 52] },
      tasks: [
        { text: 'Mark G0/0 as the NAT inside interface and G0/1 as the NAT outside interface.', check: L => L.intf('R1', 'g0/0').nat === 'inside' && L.intf('R1', 'g0/1').nat === 'outside' },
        { text: 'Publish the web server 192.168.1.100 as 203.0.113.5 with static NAT.', check: L => L.dev('R1').nat.statics.some(s => fmt(s.local) === '192.168.1.100' && fmt(s.global) === '203.0.113.5') && L.ping('ISP', '203.0.113.5') },
        { text: 'Translate the rest of 192.168.1.0/24 with PAT on G0/1\'s address (ACL 1).', check: L => L.dev('R1').nat.dynamic.some(d => d.acl === '1' && d.intf === 'GigabitEthernet0/1' && d.overload) && L.ping('PC1', '8.8.8.8') },
      ],
      solution: steps('R1', `enable
configure terminal
interface g0/0
ip nat inside
interface g0/1
ip nat outside
exit
ip nat inside source static 192.168.1.100 203.0.113.5
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 interface g0/1 overload
end`),
    },
    exp: `- NAT only acts on traffic moving between an \`ip nat inside\` and an \`ip nat outside\` interface. Forgetting either is the most common NAT fault.
- **Static NAT** is a permanent 1:1 mapping, so outside hosts can start connections to 203.0.113.5. R1 answers ARP for that address on the outside subnet.
- **PAT** (\`overload\`) maps many inside hosts to one address by rewriting source ports. The ACL selects *which* inside sources get translated.
- Statics are checked first, so the web server keeps its own public address even though ACL 1 also matches it.

Verify with \`show ip nat translations\` after a ping from PC1, and \`show ip nat statistics\`.`,
  },
  {
    id: 'LAB-DHCP', exam: 'C', obj: '4.6', type: 'lab', title: 'DHCP server and relay',
    q: `R1 will serve DHCP for both LANs. The PCs are already set to obtain an address automatically.

| Pool | Network | Gateway | DNS |
|---|---|---|---|
| LAN1 | 192.168.1.0/24 | 192.168.1.1 | 8.8.8.8 |
| LAN2 | 192.168.2.0/24 | 192.168.2.1 | 8.8.8.8 |

Reserve .1–.10 in each LAN for static devices.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.12.1 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.1.1 255.255.255.0
 no shutdown
ip route 192.168.2.0 255.255.255.0 10.0.12.2` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.12.2 255.255.255.252
 no shutdown
interface g0/1
 ip address 192.168.2.1 255.255.255.0
 no shutdown
ip route 0.0.0.0 0.0.0.0 10.0.12.1` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        { name: 'SW2', kind: 'switch', config: 'hostname SW2' },
        { name: 'PC1', kind: 'host', host: { dhcp: true } },
        { name: 'PC2', kind: 'host', host: { dhcp: true } },
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R1 g0/1', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['R2 g0/1', 'SW2 g0/1'], ['SW2 f0/1', 'PC2 f0']],
      topo: { R1: [28, 25], R2: [72, 25], SW1: [28, 58], SW2: [72, 58], PC1: [28, 90], PC2: [72, 90] },
      tasks: [
        { text: 'Exclude 192.168.1.1–10 and 192.168.2.1–10 from DHCP on R1.', check: L => ['192.168.1.', '192.168.2.'].every(p => [1, 5, 10].every(h => L.dev('R1').dhcp.excluded.some(([a, b]) => { const x = parseV4(p + h); return x >= a && x <= b; }))) },
        { text: 'Create pools **LAN1** and **LAN2** as shown in the table.', check: L => { const p = L.dev('R1').dhcp.pools; const ok = (n, net, gw) => p[n] && p[n].network !== null && fmt(p[n].network) === net && p[n].len === 24 && p[n].router !== null && fmt(p[n].router) === gw && p[n].dns.some(d => fmt(d) === '8.8.8.8'); return ok('LAN1', '192.168.1.0', '192.168.1.1') && ok('LAN2', '192.168.2.0', '192.168.2.1'); } },
        { text: 'Make R2 relay DHCP requests from LAN2 to R1.', check: L => L.intf('R2', 'g0/1').helpers.length > 0 && L.lease('PC2') !== null },
        { text: 'Verify: both PCs lease an address from .11 upwards and PC2 can ping PC1.', check: L => L.lease('PC1') === '192.168.1.11' && L.lease('PC2') === '192.168.2.11' && L.ping('PC2', '192.168.1.11') },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
ip dhcp excluded-address 192.168.1.1 192.168.1.10
ip dhcp excluded-address 192.168.2.1 192.168.2.10
ip dhcp pool LAN1
network 192.168.1.0 255.255.255.0
default-router 192.168.1.1
dns-server 8.8.8.8
exit
ip dhcp pool LAN2
network 192.168.2.0 255.255.255.0
default-router 192.168.2.1
dns-server 8.8.8.8
end`),
        ...steps('R2', `enable
configure terminal
interface g0/1
ip helper-address 10.0.12.1
end`),
      ],
    },
    exp: `- DHCP DISCOVER is a broadcast, and routers do not forward broadcasts. \`ip helper-address\` on the interface **facing the clients** turns it into a unicast to the server and sets the *giaddr* field to that interface's address (192.168.2.1).
- The server uses the giaddr to choose the pool: the one whose \`network\` contains 192.168.2.1, which is LAN2.
- Exclusions stop the server leasing addresses already used by gateways, printers and servers.

On the PCs, \`ipconfig /all\` shows the lease; on R1, \`show ip dhcp binding\` and \`show ip dhcp pool\`.`,
  },
  {
    id: 'SIM-DR', exam: 'C', obj: '3.4', type: 'sim', title: 'DR/BDR election',
    q: `Four routers share one Ethernet segment and run OSPF area 0. All routers started at the same time. Use the CLI to examine the routers.

Which two statements are true?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.0.1 255.255.255.0
 ip ospf priority 0
 no shutdown
router ospf 1
 router-id 192.168.100.1
 network 10.0.0.0 0.0.0.255 area 0` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 ip address 10.0.0.2 255.255.255.0
 no shutdown
router ospf 1
 router-id 10.2.2.2
 network 10.0.0.0 0.0.0.255 area 0` },
        { name: 'R3', kind: 'router', config: `hostname R3
interface g0/0
 ip address 10.0.0.3 255.255.255.0
 no shutdown
router ospf 1
 router-id 10.3.3.3
 network 10.0.0.0 0.0.0.255 area 0` },
        { name: 'R4', kind: 'router', config: `hostname R4
interface g0/0
 ip address 10.0.0.4 255.255.255.0
 ip ospf priority 50
 no shutdown
router ospf 1
 router-id 10.0.0.4
 network 10.0.0.0 0.0.0.255 area 0` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
      ],
      links: [['R1 g0/0', 'SW1 f0/1'], ['R2 g0/0', 'SW1 f0/2'], ['R3 g0/0', 'SW1 f0/3'], ['R4 g0/0', 'SW1 f0/4']],
      topo: { SW1: [50, 60], R1: [14, 18], R2: [38, 14], R3: [62, 14], R4: [86, 18] },
    },
    opts: [
      ['R4 is the DR.', 'Correct: priority 50 is the highest priority on the segment.'],
      ['R3 is the BDR.', 'Correct: among the remaining priority-1 routers, R3 has the highest router ID (10.3.3.3).'],
      ['R1 is the DR because it has the highest router ID.', 'Router ID only breaks ties between equal priorities, and priority 0 makes R1 ineligible altogether.'],
      ['R1 and R2 are fully adjacent with each other.', 'R1 and R2 are both DROTHERs. Two DROTHERs stay in the 2-WAY state; each forms a FULL adjacency only with the DR and BDR.'],
      ['R1 has no OSPF neighbors because its priority is 0.', 'Priority 0 only removes R1 from the election. It still forms FULL adjacencies with the DR and BDR.'],
    ],
    ans: 'a,b',
    exp: `DR election on a broadcast segment:

1. Highest **interface priority** wins (0 = never DR/BDR). R4 has 50, so it is DR.
2. Ties are broken by the highest **router ID**. R2 and R3 both have priority 1, so R3 (10.3.3.3) becomes BDR.

\`show ip ospf neighbor\` on R2 shows R4 as FULL/DR, R3 as FULL/BDR and R1 as 2WAY/DROTHER. DROTHERs only become fully adjacent with the DR and BDR, which keeps the number of adjacencies down on multi-access networks. The election is **not pre-emptive**: a higher-priority router joining later does not take over.`,
  },
  {
    id: 'SIM-NAT', exam: 'C', obj: '4.1', type: 'sim', title: 'NAT fault',
    q: `PC1 (192.168.1.10) can reach the ISP test address 198.51.100.100, but PC3 (192.168.1.200) cannot. Both PCs use R1 as their gateway. Investigate R1 and the PCs.

What is the cause?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
 no shutdown
interface g0/1
 ip address 203.0.113.2 255.255.255.0
 ip nat outside
 no shutdown
ip nat pool PUBLIC 203.0.113.10 203.0.113.14 netmask 255.255.255.0
access-list 10 permit 192.168.1.0 0.0.0.127
ip nat inside source list 10 pool PUBLIC overload
ip route 0.0.0.0 0.0.0.0 203.0.113.1` },
        { name: 'ISP', kind: 'router', config: `hostname ISP
interface g0/0
 ip address 203.0.113.1 255.255.255.0
 no shutdown
interface loopback0
 ip address 198.51.100.100 255.255.255.255` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        pc('PC1', '192.168.1.10', '192.168.1.1'), pc('PC3', '192.168.1.200', '192.168.1.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/3', 'PC3 f0'], ['R1 g0/1', 'ISP g0/0']],
      topo: { PC1: [12, 30], PC3: [12, 75], SW1: [36, 52], R1: [62, 52], ISP: [88, 52] },
    },
    opts: [
      ['ACL 10 only matches 192.168.1.0–127, so PC3 is never translated', 'Correct. The wildcard 0.0.0.127 covers .0–.127. PC3 at .200 is routed out untranslated, and the ISP has no route back to 192.168.1.0/24.'],
      ['The NAT pool is exhausted', 'With `overload`, the pool addresses are shared using ports; five addresses cannot be exhausted by two hosts.'],
      ['G0/0 is missing ip nat inside', '`show ip nat statistics` lists G0/0 as an inside interface, and PC1 is translated through it.'],
      ['PC3 has the wrong default gateway', '`ipconfig` on PC3 shows 192.168.1.1, the same gateway as PC1.'],
    ],
    ans: 'a',
    exp: `Dynamic NAT/PAT translates only the inside sources **permitted by the ACL**. \`access-list 10 permit 192.168.1.0 0.0.0.127\` matches .0–.127 (wildcard 127 = 7 host bits = 128 addresses).

PC3's packet leaves untranslated with source 192.168.1.200. The ISP cannot route a private address back, so the ping fails. Fix it with a wildcard of \`0.0.0.255\`.

Verify by pinging from PC1 and then checking \`show ip nat translations\`: only 192.168.1.10 appears.`,
  },

  // ------------------------------------------------------------------ D
  {
    id: 'LAB-ETHERCHANNEL', exam: 'D', obj: '2.4', type: 'lab', points: 4, title: 'EtherChannel and STP tuning',
    q: `Bundle the two links between the distribution switches and tune spanning tree so SW1 is the root for the user VLANs.

VLANs 10 and 20 already exist on all switches, and the Gi links are already trunks.`,
    lab: {
      devices: [
        { name: 'SW1', kind: 'switch', config: `hostname SW1
vlan 10
vlan 20
interface range f0/23 - 24
 switchport mode trunk
interface g0/1
 switchport mode trunk` },
        { name: 'SW2', kind: 'switch', config: `hostname SW2
vlan 10
vlan 20
interface range f0/23 - 24
 switchport mode trunk
interface g0/1
 switchport mode trunk` },
        { name: 'SW3', kind: 'switch', config: `hostname SW3
vlan 10
vlan 20
interface g0/1
 switchport mode trunk
interface g0/2
 switchport mode trunk
interface f0/1
 switchport mode access
 switchport access vlan 10` },
        pc('PC1', '192.168.10.10', '192.168.10.1'),
      ],
      links: [['SW1 f0/23', 'SW2 f0/23'], ['SW1 f0/24', 'SW2 f0/24'], ['SW1 g0/1', 'SW3 g0/1'], ['SW2 g0/1', 'SW3 g0/2'], ['SW3 f0/1', 'PC1 f0']],
      topo: { SW1: [25, 22], SW2: [75, 22], SW3: [50, 62], PC1: [50, 92] },
      tasks: [
        { text: 'Bundle SW1–SW2 Fa0/23–24 into **Port-channel 1** with LACP; SW1 must actively negotiate.', check: L => ['SW1', 'SW2'].every(s => ['f0/23', 'f0/24'].every(p => { const i = L.intf(s, p); return i.channel && i.channel.group === 1 && L.net.chan[`${s}|${i.name}`] === 'P' && ['active', 'passive'].includes(i.channel.mode); })) && L.intf('SW1', 'f0/23').channel.mode === 'active' },
        { text: 'Port-channel 1 must be an 802.1Q trunk on both switches.', check: L => ['SW1', 'SW2'].every(s => L.dev(s).intfs['Port-channel1']?.sw?.mode === 'trunk' && L.trunking(s, 'f0/23')) },
        { text: 'Make SW1 the root bridge for VLANs 10 and 20, and SW2 the backup root.', check: L => [10, 20].every(v => { const st = computeStp(L.net, v); return st.SW1.root.dev === 'SW1' && (L.dev('SW2').stp.priority[v] ?? 32768) < 32768 && (L.dev('SW2').stp.priority[v] ?? 32768) > (L.dev('SW1').stp.priority[v] ?? 32768); }) },
        { text: 'On SW3 Fa0/1, enable PortFast and BPDU Guard.', check: L => L.intf('SW3', 'f0/1').portfast && L.intf('SW3', 'f0/1').bpduguard },
      ],
      solution: [
        ...steps('SW1', `enable
configure terminal
interface range fa0/23 - 24
channel-group 1 mode active
exit
interface port-channel 1
switchport mode trunk
exit
spanning-tree vlan 10,20 root primary
end`),
        ...steps('SW2', `enable
configure terminal
interface range fa0/23 - 24
channel-group 1 mode passive
exit
interface port-channel 1
switchport mode trunk
exit
spanning-tree vlan 10,20 root secondary
end`),
        ...steps('SW3', `enable
configure terminal
interface fa0/1
spanning-tree portfast
spanning-tree bpduguard enable
end`),
      ],
    },
    exp: `- LACP modes: **active** sends LACPDUs, **passive** only answers. active–active and active–passive bundle; passive–passive never does. PAgP uses desirable/auto, and \`on\` forces a bundle with no negotiation (both ends must be \`on\`).
- Member ports must match (speed, duplex, mode, allowed/native VLANs). Configure the logical **Port-channel** interface and IOS pushes it to members.
- \`spanning-tree vlan 10,20 root primary\` sets priority 24576 (or lower than the current root); \`root secondary\` sets 28672.
- **PortFast** skips listening/learning on edge ports; **BPDU Guard** err-disables the port if a BPDU ever arrives (someone plugged in a switch).

Verify with \`show etherchannel summary\` (look for Po1(SU) and (P) members) and \`show spanning-tree vlan 10\`.`,
  },
  {
    id: 'LAB-PORTSEC', exam: 'D', obj: '5.7', type: 'lab', title: 'Port security',
    q: `Secure the access ports on SW1.

- Fa0/1 and Fa0/2 connect user PCs.
- Fa0/5 is in a public area and may only be used by the printer with MAC **0050.7966.6805**. The device currently plugged into Fa0/5 is **not** that printer.`,
    lab: {
      devices: [
        { name: 'SW1', kind: 'switch', config: `hostname SW1
interface vlan1
 ip address 192.168.1.2 255.255.255.0
 no shutdown` },
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 192.168.1.1 255.255.255.0
 no shutdown` },
        pc('PC1', '192.168.1.11', '192.168.1.1'), pc('PC2', '192.168.1.12', '192.168.1.1'),
        pc('UNKNOWN', '192.168.1.55', '192.168.1.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'PC2 f0'], ['SW1 f0/5', 'UNKNOWN f0']],
      topo: { R1: [50, 12], SW1: [50, 46], PC1: [18, 86], PC2: [50, 86], UNKNOWN: [82, 86] },
      tasks: [
        { text: 'On Fa0/1–2: static access mode, port security with up to **2** MAC addresses, learned **sticky**, violation mode **restrict**.', check: L => ['f0/1', 'f0/2'].every(p => { const i = L.intf('SW1', p); return i.sw.mode === 'access' && i.ps && i.ps.enabled && i.ps.max === 2 && i.ps.sticky && i.ps.violation === 'restrict'; }) },
        { text: 'The PCs\' MAC addresses must appear in the running configuration.', check: L => L.has('SW1', new RegExp(`mac-address sticky ${L.intf('PC1', 'f0').mac}`)) && L.has('SW1', new RegExp(`mac-address sticky ${L.intf('PC2', 'f0').mac}`)) },
        { text: 'On Fa0/5: allow only MAC 0050.7966.6805, violation mode shutdown.', check: L => { const i = L.intf('SW1', 'f0/5'); return i.ps && i.ps.enabled && i.ps.macs.length === 1 && i.ps.macs[0] === '0050.7966.6805' && i.ps.violation === 'shutdown' && i.ps.max === 1; } },
        { text: 'Confirm that Fa0/5 has been err-disabled by the unknown device.', check: L => L.intf('SW1', 'f0/5').errDisabled === true },
        { text: 'Save the configuration so it survives a reload.', check: L => !!L.dev('SW1').saved && /port-security/.test(L.dev('SW1').saved) },
      ],
      solution: steps('SW1', `enable
configure terminal
interface range fa0/1 - 2
switchport mode access
switchport port-security
switchport port-security maximum 2
switchport port-security mac-address sticky
switchport port-security violation restrict
exit
interface fa0/5
switchport mode access
switchport port-security
switchport port-security mac-address 0050.7966.6805
end
copy running-config startup-config`).concat([['SW1', '']]),
    },
    exp: `- Port security only works on **static** access (or trunk) ports. On a \`dynamic auto/desirable\` port IOS rejects the command, so set \`switchport mode access\` first.
- **Sticky** learning writes the learned MACs into the running config as \`switchport port-security mac-address sticky …\`. Save the config or they are lost at reload.
- Violation modes: **protect** drops silently; **restrict** drops, logs and counts; **shutdown** (default) err-disables the port. Recover with \`shutdown\` / \`no shutdown\`, or \`errdisable recovery cause psecure-violation\`.

Verify with \`show port-security\`, \`show port-security interface fa0/5\` and \`show interfaces status\` (err-disabled).`,
  },
  {
    id: 'LAB-IPV6', exam: 'D', obj: '1.8', type: 'lab', title: 'IPv6 addressing and static routes',
    q: `Enable IPv6 between two sites. The PCs already have static IPv6 addresses (::10) with the router's ::1 address as their gateway.

| Device | Interface | Address |
|---|---|---|
| R1 | G0/0 | 2001:db8:0:12::1/64, link-local FE80::1 |
| R1 | G0/1 | 2001:db8:acad:1::1/64 |
| R2 | G0/0 | 2001:db8:0:12::2/64 |
| R2 | G0/1 | 2001:db8:acad:2::1/64 |`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 no shutdown
interface g0/1
 no shutdown` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 no shutdown
interface g0/1
 no shutdown` },
        { name: 'PC1', kind: 'host', host: { v6: '2001:db8:acad:1::10/64', v6gw: '2001:db8:acad:1::1' } },
        { name: 'PC2', kind: 'host', host: { v6: '2001:db8:acad:2::10/64', v6gw: '2001:db8:acad:2::1' } },
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R1 g0/1', 'PC1 f0'], ['R2 g0/1', 'PC2 f0']],
      topo: { R1: [30, 40], R2: [70, 40], PC1: [30, 86], PC2: [70, 86] },
      tasks: [
        { text: 'Enable IPv6 routing on both routers.', check: L => L.dev('R1').v6Routing && L.dev('R2').v6Routing },
        { text: 'Configure the addresses in the table, including R1 G0/0\'s link-local address.', check: L => has6(L, 'R1', 'g0/0', '2001:db8:0:12::1') && has6(L, 'R1', 'g0/1', '2001:db8:acad:1::1') && has6(L, 'R2', 'g0/0', '2001:db8:0:12::2') && has6(L, 'R2', 'g0/1', '2001:db8:acad:2::1') && L.intf('R1', 'g0/0').v6.some(a => a.type === 'link-local' && a.addr === parseV6('fe80::1')) },
        { text: 'On R1, route 2001:db8:acad:2::/64 via 2001:db8:0:12::2.', check: L => L.dev('R1').statics.some(r => r.fam === 6 && r.len === 64 && r.net === parseV6('2001:db8:acad:2::') && r.nh === parseV6('2001:db8:0:12::2')) },
        { text: 'On R2, add an IPv6 default route to R1\'s link-local address out G0/0.', check: L => L.dev('R2').statics.some(r => r.fam === 6 && r.len === 0 && r.nh === parseV6('fe80::1') && r.intf === 'GigabitEthernet0/0') },
        { text: 'Verify: PC1 can ping PC2 (2001:db8:acad:2::10).', check: L => L.ping('PC1', '2001:db8:acad:2::10') },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
ipv6 unicast-routing
interface g0/0
ipv6 address 2001:db8:0:12::1/64
ipv6 address fe80::1 link-local
interface g0/1
ipv6 address 2001:db8:acad:1::1/64
exit
ipv6 route 2001:db8:acad:2::/64 2001:db8:0:12::2
end`),
        ...steps('R2', `enable
configure terminal
ipv6 unicast-routing
interface g0/0
ipv6 address 2001:db8:0:12::2/64
interface g0/1
ipv6 address 2001:db8:acad:2::1/64
exit
ipv6 route ::/0 g0/0 fe80::1
end`),
      ],
    },
    exp: `- Without \`ipv6 unicast-routing\` a router acts as an IPv6 *host*: it has addresses but does not forward packets between interfaces.
- Every IPv6 interface automatically gets a **link-local** address (FE80::/10, usually EUI-64 based). Setting a short one like FE80::1 makes it easy to use as a next hop.
- A link-local next hop is only unique on its own link, so the static route **must name the exit interface**: \`ipv6 route ::/0 g0/0 fe80::1\`.

Verify with \`show ipv6 interface brief\`, \`show ipv6 route\` and \`ping 2001:db8:acad:2::10\` from PC1.`,
  },
  {
    id: 'SIM-TRUNK', exam: 'D', obj: '2.2', type: 'sim', title: 'Lost VLAN',
    q: `PC1 and PC2 are both in VLAN 10 (192.168.10.0/24) but cannot ping each other. PC3 and PC4 in VLAN 20 work fine. Investigate the switches.

What is the cause?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'SW1', kind: 'switch', config: `hostname SW1
vlan 10
vlan 20
interface f0/1
 switchport mode access
 switchport access vlan 10
interface f0/2
 switchport mode access
 switchport access vlan 20
interface g0/1
 switchport mode trunk` },
        { name: 'SW2', kind: 'switch', config: `hostname SW2
vlan 10
vlan 20
interface f0/1
 switchport mode access
 switchport access vlan 10
interface f0/2
 switchport mode access
 switchport access vlan 20
interface g0/1
 switchport mode trunk
 switchport trunk allowed vlan 1,20,30` },
        pc('PC1', '192.168.10.1', '192.168.10.254'), pc('PC3', '192.168.20.3', '192.168.20.254'),
        pc('PC2', '192.168.10.2', '192.168.10.254'), pc('PC4', '192.168.20.4', '192.168.20.254'),
      ],
      links: [['SW1 g0/1', 'SW2 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'PC3 f0'], ['SW2 f0/1', 'PC2 f0'], ['SW2 f0/2', 'PC4 f0']],
      topo: { SW1: [28, 30], SW2: [72, 30], PC1: [14, 80], PC3: [38, 80], PC2: [62, 80], PC4: [86, 80] },
    },
    opts: [
      ['VLAN 10 is not in the allowed VLAN list on SW2\'s trunk', 'Correct: `show interfaces trunk` on SW2 shows only 1,20,30 allowed, so VLAN 10 frames are dropped at SW2.'],
      ['The trunk did not form because of DTP', 'Both ends are `switchport mode trunk` and `show interfaces trunk` lists Gi0/1 trunking on each switch.'],
      ['There is a native VLAN mismatch', 'Both ends use native VLAN 1. A mismatch would also produce CDP warnings and affect untagged traffic, not just VLAN 10.'],
      ['PC2\'s switch port is in the wrong VLAN', '`show vlan brief` on SW2 shows Fa0/1 in VLAN 10.'],
    ],
    ans: 'a',
    exp: `\`show interfaces trunk\` is the key command. On SW2 the "Vlans allowed on trunk" line reads **1,20,30**, so tagged VLAN 10 frames from SW1 are discarded.

Fix it with \`switchport trunk allowed vlan add 10\`. Be careful: without the \`add\` keyword, the command *replaces* the whole list, which is a classic way to cut off every other VLAN by accident.`,
  },
  {
    id: 'SIM-CDP', exam: 'D', obj: '2.3', type: 'sim', title: 'Neighbor discovery',
    q: `The cabling documentation is missing. Use a Layer 2 discovery protocol from **SW2**.

Which SW2 interface connects to the router, and which router interface is on the other end?`,
    lab: {
      startMode: 'exec',
      devices: [
        { name: 'HQ-EDGE', kind: 'router', config: `hostname HQ-EDGE
interface g0/2
 ip address 10.10.10.1 255.255.255.0
 no shutdown` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        { name: 'SW2', kind: 'switch', config: `hostname SW2
interface vlan1
 ip address 10.10.10.12 255.255.255.0
 no shutdown` },
      ],
      links: [['HQ-EDGE g0/2', 'SW2 f0/17'], ['SW1 g0/1', 'SW2 g0/2']],
      topo: { 'HQ-EDGE': [50, 14], SW1: [20, 75], SW2: [80, 75], hideIntf: true },
    },
    opts: [
      ['SW2 Fa0/17 connects to HQ-EDGE GigabitEthernet0/2', 'Correct: `show cdp neighbors` on SW2 lists HQ-EDGE with Local Intrfce Fas 0/17 and Port ID Gig 0/2.'],
      ['SW2 Gi0/2 connects to HQ-EDGE GigabitEthernet0/2', 'Gi0/2 is the link to SW1.'],
      ['SW2 Fa0/17 connects to HQ-EDGE GigabitEthernet0/0', 'The Port ID column shows the *neighbor\'s* interface: Gig 0/2.'],
      ['SW2 Gi0/1 connects to HQ-EDGE GigabitEthernet0/1', 'SW2 has no active link on Gi0/1.'],
    ],
    ans: 'a',
    exp: `In \`show cdp neighbors\`:

- **Local Intrfce** is the port on the switch you are logged into (Fas 0/17).
- **Port ID** is the port on the *neighbor* (Gig 0/2).
- **Device ID** is the neighbor's hostname (HQ-EDGE) and **Capability** R = router.

\`show cdp neighbors detail\` also shows the neighbor's IP address and IOS version, useful when you need to reach a device you cannot see. LLDP (\`lldp run\`, then \`show lldp neighbors\`) is the vendor-neutral equivalent and is off by default on Cisco IOS.`,
  },

  // ------------------------------------------------------------------ practice labs
  // No `exam` field: they appear on the Labs page only, so exams A-D keep their blueprint weighting.
  {
    id: 'LAB-VOICE', obj: '2.1', type: 'lab', title: 'Voice VLAN for IP phones',
    q: `Each desk has an IP phone, and the user's PC plugs into the phone's PC port, so one switch port carries both. Configure SW1 for the desks on Fa0/1 and Fa0/2.

| VLAN | Name | Carries |
|---|---|---|
| 10 | USERS | the PCs (untagged) |
| 150 | VOICE | the phones (tagged; a phone learns the VLAN from the switch over CDP or LLDP) |

R1 already routes both VLANs on G0/0.10 and G0/0.150.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 no shutdown
interface g0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface g0/0.150
 encapsulation dot1Q 150
 ip address 192.168.150.1 255.255.255.0` },
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        pc('PC1', '192.168.10.11', '192.168.10.1'), pc('PC2', '192.168.10.12', '192.168.10.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'PC2 f0']],
      topo: { R1: [50, 12], SW1: [50, 50], PC1: [25, 88], PC2: [75, 88] },
      tasks: [
        { text: 'Create VLAN 10 **USERS** and VLAN 150 **VOICE** on SW1.', check: L => L.dev('SW1').vlans[10]?.name === 'USERS' && L.dev('SW1').vlans[150]?.name === 'VOICE' },
        { text: 'Make Fa0/1 and Fa0/2 static access ports in VLAN 10 with voice VLAN 150.', check: L => ['f0/1', 'f0/2'].every(p => { const s = L.intf('SW1', p).sw; return s.mode === 'access' && s.access === 10 && s.voice === 150; }) },
        { text: 'Phones and PCs are end devices: enable PortFast on Fa0/1 and Fa0/2.', check: L => ['f0/1', 'f0/2'].every(p => L.intf('SW1', p).portfast) },
        { text: 'Make Gi0/1 a static 802.1Q trunk that carries only VLANs 10 and 150.', check: L => { const s = L.intf('SW1', 'g0/1').sw; return s.mode === 'trunk' && JSON.stringify(s.allowed) === '[10,150]'; } },
        { text: 'Verify: PC1 can ping its gateway 192.168.10.1.', check: L => L.ping('PC1', '192.168.10.1') },
      ],
      solution: steps('SW1', `enable
configure terminal
vlan 10
name USERS
vlan 150
name VOICE
exit
interface range fa0/1 - 2
switchport mode access
switchport access vlan 10
switchport voice vlan 150
spanning-tree portfast
exit
interface g0/1
switchport mode trunk
switchport trunk allowed vlan 10,150
end`),
    },
    exp: `- \`switchport voice vlan 150\` adds a second VLAN to an **access** port: the PC's frames stay untagged in the access VLAN, the phone tags its frames with VLAN 150. The switch tells the phone which VLAN to use through CDP (or LLDP-MED).
- The port is still an access port, not a trunk: \`show interfaces fa0/1 switchport\` shows *Operational Mode: static access*, *Access Mode VLAN: 10* and *Voice VLAN: 150*.
- PortFast belongs on every port that faces end devices. Without it a phone or PC waits through listening and learning before it can send.
- The uplink must carry the voice VLAN too, or the phones register nowhere.

Verify with \`show vlan brief\`, \`show interfaces fa0/1 switchport\`, \`show interfaces trunk\` and a ping from PC1 to 192.168.10.1.`,
  },
  {
    id: 'LAB-LLDP', obj: '2.3', type: 'lab', title: 'Map the network with LLDP, keep CDP off the ISP link',
    q: `The drawing has no port numbers and the cabling records are out of date. SW1 is the core switch; SW2 and SW3 hang off it, and SW1 Gi0/1 faces the ISP's router.

The monitoring system only speaks LLDP, and security wants no Cisco discovery data leaving the network. Find the real ports from the neighbor tables.`,
    lab: {
      devices: [
        { name: 'SW1', kind: 'switch', config: 'hostname SW1' },
        { name: 'SW2', kind: 'switch', config: 'hostname SW2' },
        { name: 'SW3', kind: 'switch', config: 'hostname SW3' },
        { name: 'ISP', kind: 'router', config: `hostname ISP
interface g0/0
 ip address 203.0.113.1 255.255.255.252
 no shutdown` },
      ],
      links: [['SW1 g0/1', 'ISP g0/0'], ['SW1 f0/24', 'SW2 f0/24'], ['SW1 f0/17', 'SW3 f0/9']],
      topo: { ISP: [50, 12], SW1: [50, 46], SW2: [22, 84], SW3: [78, 84], hideIntf: true },
      tasks: [
        { text: 'Turn on LLDP on SW1, SW2 and SW3.', check: L => ['SW1', 'SW2', 'SW3'].every(s => L.dev(s).lldpRun) },
        { text: 'Stop CDP on SW1\'s link to the ISP only. CDP must keep running everywhere else.', check: L => L.intf('SW1', 'g0/1').cdp === false && L.dev('SW1').cdpRun && L.intf('SW1', 'f0/24').cdp && L.intf('SW1', 'f0/17').cdp },
        { text: 'Label the SW1–SW3 link from the neighbor tables: description **TO-SW3** on the SW1 port, **TO-SW1** on the SW3 port.', check: L => L.intf('SW1', 'f0/17').desc === 'TO-SW3' && L.intf('SW3', 'f0/9').desc === 'TO-SW1' },
      ],
      solution: [
        ...steps('SW1', `enable
configure terminal
lldp run
interface g0/1
no cdp enable
interface f0/17
description TO-SW3
end`),
        ...steps('SW2', `enable
configure terminal
lldp run
end`),
        ...steps('SW3', `enable
configure terminal
lldp run
interface f0/9
description TO-SW1
end`),
      ],
    },
    exp: `- **LLDP** (IEEE 802.1AB) is off by default on Cisco IOS: \`lldp run\` turns it on globally. On real IOS it can be limited per port with \`no lldp transmit\` / \`no lldp receive\`.
- **CDP** is on by default. \`no cdp run\` stops it everywhere; \`no cdp enable\` on an interface stops it on that port only, which is what you want on a link to another organisation.
- In \`show lldp neighbors\` and \`show cdp neighbors\`, *Local Intf* is your port and *Port ID* is the neighbor's. On SW1 that gives Fa0/17 ↔ SW3 Fa0/9 and Fa0/24 ↔ SW2 Fa0/24.
- Neighbors take a moment to appear and stay listed for the hold time after a link goes away (LLDP: 30 s timer, 120 s hold by default; CDP: 60 s and 180 s).`,
  },
  {
    id: 'LAB-L3SW', obj: '2.1', type: 'lab', title: 'Inter-VLAN routing on a Layer 3 switch',
    q: `DSW1 is a Catalyst 3650. VLAN 10 (STAFF) and VLAN 20 (LAB) already exist with the PCs assigned. Route between them on DSW1 itself, without a router-on-a-stick, and send everything else to R1.

| Interface | Address |
|---|---|
| DSW1 VLAN 10 | 192.168.10.1/24 |
| DSW1 VLAN 20 | 192.168.20.1/24 |
| DSW1 Gi1/1/1 (to R1) | 10.0.0.2/30 |
| R1 G0/0 | 10.0.0.1/30 (already configured, with routes back to both VLANs) |`,
    lab: {
      devices: [
        { name: 'DSW1', kind: 'l3switch', config: `hostname DSW1
vlan 10
 name STAFF
vlan 20
 name LAB
interface g1/0/1
 switchport mode access
 switchport access vlan 10
interface g1/0/2
 switchport mode access
 switchport access vlan 20` },
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 ip address 10.0.0.1 255.255.255.252
 no shutdown
interface loopback0
 ip address 1.1.1.1 255.255.255.255
ip route 192.168.10.0 255.255.255.0 10.0.0.2
ip route 192.168.20.0 255.255.255.0 10.0.0.2` },
        pc('PC1', '192.168.10.10', '192.168.10.1'), pc('PC2', '192.168.20.10', '192.168.20.1'),
      ],
      links: [['R1 g0/0', 'DSW1 g1/1/1'], ['DSW1 g1/0/1', 'PC1 f0'], ['DSW1 g1/0/2', 'PC2 f0']],
      topo: { R1: [50, 12], DSW1: [50, 50], PC1: [25, 88], PC2: [75, 88] },
      tasks: [
        { text: 'Turn DSW1 into a router: enable IP routing.', check: L => L.dev('DSW1').ipRouting === true },
        { text: 'Create SVIs VLAN 10 (192.168.10.1/24) and VLAN 20 (192.168.20.1/24); both must be up.', check: L => L.has('DSW1', /ip address 192\.168\.10\.1 255\.255\.255\.0/, /^interface Vlan10$/) && L.has('DSW1', /ip address 192\.168\.20\.1 255\.255\.255\.0/, /^interface Vlan20$/) && L.up('DSW1', 'vlan10') && L.up('DSW1', 'vlan20') },
        { text: 'Make Gi1/1/1 a routed port with 10.0.0.2/30.', check: L => L.intf('DSW1', 'g1/1/1').routed && L.has('DSW1', /ip address 10\.0\.0\.2 255\.255\.255\.252/, /^interface GigabitEthernet1\/1\/1$/) },
        { text: 'Send all other traffic to R1 with a default route.', check: L => L.route('DSW1', '0.0.0.0/0', 'S') },
        { text: 'Verify: PC1 can ping PC2 and R1\'s loopback 1.1.1.1.', check: L => L.ping('PC1', '192.168.20.10') && L.ping('PC1', '1.1.1.1') },
      ],
      solution: steps('DSW1', `enable
configure terminal
ip routing
interface vlan 10
ip address 192.168.10.1 255.255.255.0
no shutdown
interface vlan 20
ip address 192.168.20.1 255.255.255.0
no shutdown
interface g1/1/1
no switchport
ip address 10.0.0.2 255.255.255.252
no shutdown
exit
ip route 0.0.0.0 0.0.0.0 10.0.0.1
end`),
    },
    exp: `- A multilayer switch only routes once \`ip routing\` is on. Without it each SVI still answers pings to itself, but nothing is forwarded between VLANs.
- An **SVI** (\`interface vlan 10\`) is the VLAN's gateway. It comes up only when the VLAN exists *and* at least one port in that VLAN is up and forwarding (or a trunk carries it).
- \`no switchport\` turns a switch port into a **routed port**: it belongs to no VLAN and takes an IP address directly, like a router interface. That is the usual uplink from a distribution switch.
- Compared with router-on-a-stick, inter-VLAN traffic never leaves the switch, so one router link no longer limits it.

Verify with \`show ip interface brief\` (Vlan10, Vlan20 and Gi1/1/1 up/up), \`show ip route\` (two connected VLANs, the /30 and \`S* 0.0.0.0/0\`) and the pings.`,
  },
  {
    id: 'LAB-EUI64', obj: '1.9', type: 'lab', title: 'IPv6 EUI-64 addressing',
    q: `Bring up IPv6 between two sites. The PCs already have static addresses (::10) with their router's ::1 as gateway.

The R1–R2 link must use **EUI-64**: each router builds its own interface ID from its MAC address. You will have to look up the addresses the routers chose before you can route to them.`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 no shutdown
interface g0/1
 no shutdown` },
        { name: 'R2', kind: 'router', config: `hostname R2
interface g0/0
 no shutdown
interface g0/1
 no shutdown` },
        { name: 'PC1', kind: 'host', host: { v6: '2001:db8:a::10/64', v6gw: '2001:db8:a::1' } },
        { name: 'PC2', kind: 'host', host: { v6: '2001:db8:b::10/64', v6gw: '2001:db8:b::1' } },
      ],
      links: [['R1 g0/0', 'R2 g0/0'], ['R1 g0/1', 'PC1 f0'], ['R2 g0/1', 'PC2 f0']],
      topo: { R1: [30, 40], R2: [70, 40], PC1: [30, 86], PC2: [70, 86] },
      tasks: [
        { text: 'Enable IPv6 routing on R1 and R2.', check: L => L.dev('R1').v6Routing && L.dev('R2').v6Routing },
        { text: 'Address G0/0 on both routers from **2001:db8:12::/64** using EUI-64.', check: L => ['R1', 'R2'].every(r => L.intf(r, 'g0/0').v6.some(a => a.type === 'eui-64' && a.addr === parseV6('2001:db8:12::') && a.len === 64)) },
        { text: 'Give the LANs (G0/1) 2001:db8:a::1/64 on R1 and 2001:db8:b::1/64 on R2.', check: L => has6(L, 'R1', 'g0/1', '2001:db8:a::1') && has6(L, 'R2', 'g0/1', '2001:db8:b::1') },
        { text: 'On R1, route 2001:db8:b::/64 to R2\'s **EUI-64 global address** on the link (not its link-local).', check: L => L.dev('R1').statics.some(r => r.fam === 6 && r.len === 64 && r.net === parseV6('2001:db8:b::') && r.nh === eui64('2001:db8:12:0', L.intf('R2', 'g0/0').mac)) },
        { text: 'On R2, route 2001:db8:a::/64 to R1\'s EUI-64 global address on the link.', check: L => L.dev('R2').statics.some(r => r.fam === 6 && r.len === 64 && r.net === parseV6('2001:db8:a::') && r.nh === eui64('2001:db8:12:0', L.intf('R1', 'g0/0').mac)) },
        { text: 'Verify: PC1 can ping PC2 (2001:db8:b::10).', check: L => L.ping('PC1', '2001:db8:b::10') },
      ],
      solution: [
        ...steps('R1', `enable
configure terminal
ipv6 unicast-routing
interface g0/0
ipv6 address 2001:db8:12::/64 eui-64
interface g0/1
ipv6 address 2001:db8:a::1/64
exit
ipv6 route 2001:db8:b::/64 2001:db8:12:0:20f:50ff:fe85:401
end`),
        ...steps('R2', `enable
configure terminal
ipv6 unicast-routing
interface g0/0
ipv6 address 2001:db8:12::/64 eui-64
interface g0/1
ipv6 address 2001:db8:b::1/64
exit
ipv6 route 2001:db8:a::/64 2001:db8:12:0:20c:4bff:fecc:401
end`),
      ],
    },
    exp: `**Modified EUI-64** turns a 48-bit MAC into a 64-bit interface ID:

1. Split the MAC in half and insert **FFFE**: 000f.5085.0401 → 000f.50**ff.fe**85.0401
2. Flip the 7th bit of the first byte (the universal/local bit): 0x00 → **0x02**
3. Result: 020f:50ff:fe85:0401, so R2's link address is **2001:db8:12::20f:50ff:fe85:401**

- \`ipv6 address 2001:db8:12::/64 eui-64\` gives only the prefix; the router fills in the rest. Read the result with \`show ipv6 interface brief\`. The link-local address uses the same interface ID behind FE80::.
- The MAC comes from \`show interfaces g0/0\` (*address is …*), if you want to work it out by hand.
- A static route to a **global** next hop needs no exit interface; a route to a **link-local** next hop does, because the same FE80:: address can exist on every link.`,
  },
  {
    id: 'LAB-TS-INTERVLAN', obj: '2.2', type: 'lab', title: 'Troubleshoot inter-VLAN routing',
    q: `Router-on-a-stick was working until a change window last night. Now neither VLAN reaches its gateway. Find and fix the faults. Do not change the PCs or the address plan.

| VLAN | Name | Subnet | Gateway |
|---|---|---|---|
| 10 | STAFF | 192.168.10.0/24 | R1 G0/0.10, .1 |
| 20 | GUEST | 192.168.20.0/24 | R1 G0/0.20, .1 |

PC1 is on SW1 Fa0/1 (VLAN 10), PC2 on Fa0/2 (VLAN 20).`,
    lab: {
      devices: [
        { name: 'R1', kind: 'router', config: `hostname R1
interface g0/0
 no shutdown
interface g0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface g0/0.20
 encapsulation dot1Q 21
 ip address 192.168.20.1 255.255.255.0` },
        { name: 'SW1', kind: 'switch', config: `hostname SW1
vlan 10
 name STAFF
vlan 20
 name GUEST
vlan 30
 name SPARE
interface f0/1
 switchport mode access
 switchport access vlan 10
interface f0/2
 switchport mode access
 switchport access vlan 30
interface g0/1
 switchport mode trunk
 switchport trunk allowed vlan 1,30` },
        pc('PC1', '192.168.10.10', '192.168.10.1'), pc('PC2', '192.168.20.10', '192.168.20.1'),
      ],
      links: [['R1 g0/0', 'SW1 g0/1'], ['SW1 f0/1', 'PC1 f0'], ['SW1 f0/2', 'PC2 f0']],
      topo: { R1: [50, 12], SW1: [50, 50], PC1: [25, 88], PC2: [75, 88] },
      tasks: [
        { text: 'PC1 can ping its gateway 192.168.10.1.', check: L => L.ping('PC1', '192.168.10.1') },
        { text: 'PC2 can ping its gateway 192.168.20.1.', check: L => L.ping('PC2', '192.168.20.1') },
        { text: 'PC1 can ping PC2.', check: L => L.ping('PC1', '192.168.20.10') },
        { text: 'PC2\'s port is in VLAN 20 and the trunk carries only VLANs 10 and 20.', check: L => L.vlanOf('SW1', 'f0/2') === 20 && JSON.stringify(L.intf('SW1', 'g0/1').sw.allowed) === '[10,20]' },
      ],
      solution: [
        ...steps('SW1', `enable
configure terminal
interface g0/1
switchport trunk allowed vlan 10,20
interface f0/2
switchport access vlan 20
end`),
        ...steps('R1', `enable
configure terminal
interface g0/0.20
encapsulation dot1Q 20
ip address 192.168.20.1 255.255.255.0
end`),
      ],
    },
    exp: `Three faults, each found with one command:

1. **The trunk drops both VLANs.** \`show interfaces trunk\` on SW1: *Vlans allowed on trunk* is 1,30. Fix with \`switchport trunk allowed vlan 10,20\`. Without \`add\`, that command **replaces** the list, which is how this kind of fault usually happens.
2. **PC2 sits in the wrong VLAN.** \`show vlan brief\`: Fa0/2 is in VLAN 30. Fix with \`switchport access vlan 20\`.
3. **R1 tags GUEST traffic with the wrong VLAN.** \`show running-config interface g0/0.20\`: *encapsulation dot1Q 21*. Fix with \`encapsulation dot1Q 20\`.

Work bottom-up: the host's port and VLAN, then the trunk, then the router's subinterfaces. Each layer you confirm rules out half of the possible causes.`,
  },
];

// Modified EUI-64 address on a /64: flip the U/L bit, insert FFFE. prefix64 = the first four groups.
function eui64(prefix64, mac) {
  const b = mac.replace(/\./g, '').match(/../g).map(x => parseInt(x, 16));
  b[0] ^= 0x02;
  const id = [b[0], b[1], b[2], 0xff, 0xfe, b[3], b[4], b[5]];
  const groups = [0, 2, 4, 6].map(i => ((id[i] << 8) | id[i + 1]).toString(16));
  return parseV6(`${prefix64}:${groups.join(':')}`);
}

function fmt(n) {
  n = BigInt(n);
  return [24n, 16n, 8n, 0n].map(s => String((n >> s) & 255n)).join('.');
}

function has6(L, dev, intf, addr) {
  const want = parseV6(addr);
  return L.intf(dev, intf).v6.some(a => a.addr === want && a.len === 64);
}
