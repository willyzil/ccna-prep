// Domain 3: IP Connectivity (25%).
export default [
  // ================================================================ Exam A
  {
    id: 'A3-01', exam: 'A', obj: '3.1', type: 'single',
    q: 'In the output of `show ip route`, what does a route with the code **L** represent?',
    opts: [
      ['A /32 host route for an IP address configured on one of the router\'s own interfaces', 'Correct.'],
      ['A route learned from a link-state routing protocol', 'OSPF routes use the code O.'],
      ['A route to a directly connected subnet', 'Connected subnets use the code C.'],
      ['A route learned from a LISP mapping system', 'LISP routes use a lowercase l.'],
    ],
    ans: 'a',
    exp: 'Since IOS 15, every interface address produces two entries: **C** for the connected subnet (for example 10.1.1.0/30) and **L** (local) for the interface\'s own address as a **/32** (10.1.1.1/32). The local route lets the router recognise packets addressed to itself.',
  },
  {
    id: 'A3-02', exam: 'A', obj: '3.1', type: 'multi',
    q: 'Which two statements about this routing table entry are true?',
    ex: [{ kind: 'cli', title: 'R1#show ip route 192.168.5.0', text: `O        192.168.5.0/24 [110/20] via 10.1.1.2, 00:12:44, GigabitEthernet0/1` }],
    opts: [
      ['The route was learned through OSPF and has an administrative distance of 110.', 'Correct. The first number in brackets is the AD.'],
      ['Packets to 192.168.5.0/24 are sent to next hop 10.1.1.2 out of GigabitEthernet0/1.', 'Correct.'],
      ['The route\'s metric is 110.', 'The metric is the second number: 20.'],
      ['The route was learned 12 hours ago.', '00:12:44 means 12 minutes 44 seconds.'],
      ['It is a static route.', 'The code O means OSPF.'],
    ],
    ans: 'a,b',
    exp: 'Route entry fields: **code** (O = OSPF), **prefix/length**, **[AD/metric]** = [110/20], **next hop** (via 10.1.1.2), **age** (time since the route was learned or last changed) and **outgoing interface**.',
  },
  {
    id: 'A3-03', exam: 'A', obj: '3.1', type: 'single',
    q: 'R1 receives a packet destined for 172.31.1.1. What does R1 do with it?',
    ex: [{ kind: 'cli', title: 'R1#show ip route', text: `Gateway of last resort is 10.0.0.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 10.0.0.1
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
L        10.0.0.2/32 is directly connected, GigabitEthernet0/0
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/1
L        192.168.1.1/32 is directly connected, GigabitEthernet0/1` }],
    opts: [
      ['Forwards it to 10.0.0.1 using the default route', 'Correct. No more specific route matches 172.31.1.1.'],
      ['Drops it because there is no route to 172.31.0.0', 'The default route matches every destination.'],
      ['Floods it out of every interface', 'Routers never flood unicast packets.'],
      ['Sends it out of GigabitEthernet0/1 because that is the LAN interface', 'Only 192.168.1.0/24 is reachable through Gi0/1.'],
    ],
    ans: 'a',
    exp: 'The **default route** (0.0.0.0/0) matches any destination with a prefix length of 0, so it is used only when nothing more specific matches. The **gateway of last resort** line shows which next hop it uses. The asterisk marks it as the candidate default.',
  },
  {
    id: 'A3-04', exam: 'A', obj: '3.2', type: 'single',
    q: 'R1 has the routes below. Which route is used for a packet to **10.10.10.20**?',
    ex: [{ kind: 'cli', title: 'R1 routes (excerpt)', text: `O        10.0.0.0/8 [110/30] via 172.16.1.1
O        10.10.0.0/16 [110/20] via 172.16.2.2
O        10.10.10.0/24 [110/10] via 172.16.3.3
S        10.10.10.0/28 [1/0] via 172.16.4.4` }],
    opts: [
      ['10.10.10.0/24 via 172.16.3.3', 'Correct. 10.10.10.20 is outside the /28 (.0–.15), so the /24 is the longest match.'],
      ['10.10.10.0/28 via 172.16.4.4', 'The /28 covers only .0–.15.'],
      ['10.0.0.0/8 via 172.16.1.1', 'Less specific routes lose to more specific matches.'],
      ['10.10.0.0/16 via 172.16.2.2', 'The /24 also matches and is more specific.'],
    ],
    ans: 'a',
    exp: 'Forwarding uses **longest prefix match** among the routes that actually contain the destination. 10.10.10.0/28 spans 10.10.10.0–10.10.10.15, so .20 is not in it. Of the routes that do match (/8, /16, /24), the **/24** is the most specific.',
  },
  {
    id: 'A3-05', exam: 'A', obj: '3.2', type: 'single',
    q: 'A router learns 172.16.0.0/16 from OSPF, from EIGRP (internal) and from eBGP. Which route is installed in the routing table?',
    opts: [
      ['The eBGP route', 'Correct. eBGP has an AD of 20.'],
      ['The EIGRP route', 'Internal EIGRP is 90, which loses to eBGP at 20.'],
      ['The OSPF route', 'OSPF is 110.'],
      ['All three, for load balancing', 'Load balancing happens only between equal routes from the same source.'],
    ],
    ans: 'a',
    exp: 'For the **same prefix**, the route with the lowest **administrative distance** wins: connected 0, static 1, **eBGP 20**, EIGRP internal 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200.',
  },
  {
    id: 'A3-06', exam: 'A', obj: '3.2', type: 'multi',
    q: 'OSPF on R1 calculates several paths to 10.20.0.0/16. Which two statements are true?',
    opts: [
      ['If the path costs are 20 and 30, only the cost-20 path is installed.', 'Correct. The lowest metric wins within one protocol.'],
      ['If two paths both cost 20, both are installed and traffic is shared between them.', 'Correct. OSPF installs equal-cost paths (4 by default).'],
      ['The path with the highest bandwidth link anywhere on the path is always chosen.', 'OSPF compares total path cost, not individual links.'],
      ['Administrative distance decides between the two OSPF paths.', 'AD is the same (110) for both; the metric decides.'],
      ['OSPF installs only one path even when costs are equal.', 'OSPF supports ECMP.'],
    ],
    ans: 'a,b',
    exp: 'Within one routing protocol the **metric** decides: OSPF installs the lowest-cost path and, when costs tie, up to **4 equal-cost paths** by default (`maximum-paths` can change this). AD only compares routes from different sources.',
  },
  {
    id: 'A3-07', exam: 'A', obj: '3.3', type: 'single',
    q: 'R1 learns 10.50.0.0/16 through OSPF. Which command adds a backup static route through 10.2.2.2 that is used only if the OSPF route disappears?',
    opts: [
      ['ip route 10.50.0.0 255.255.0.0 10.2.2.2 115', 'Correct. An AD above 110 keeps it out of the table while OSPF is present.'],
      ['ip route 10.50.0.0 255.255.0.0 10.2.2.2', 'AD 1 would override the OSPF route.'],
      ['ip route 10.50.0.0 255.255.0.0 10.2.2.2 100', 'AD 100 is lower than 110, so the static route would win.'],
      ['ip route 10.50.0.0 0.0.255.255 10.2.2.2 115', 'Static routes use a subnet mask, not a wildcard.'],
    ],
    ans: 'a',
    exp: 'A **floating static route** has an AD set **higher** than the primary route\'s AD. With OSPF at 110, any value from 111 to 254 works. When the OSPF route is withdrawn, the static route "floats" into the routing table. (AD 255 means the route is never used.)',
  },
  {
    id: 'A3-08', exam: 'A', obj: '3.3', type: 'single',
    q: 'Which command configures an IPv6 default route through next hop 2001:db8:0:1::1?',
    opts: [
      ['ipv6 route ::/0 2001:db8:0:1::1', 'Correct.'],
      ['ipv6 route 0.0.0.0 0.0.0.0 2001:db8:0:1::1', 'IPv6 routes use IPv6 prefix notation.'],
      ['ip route ::/0 2001:db8:0:1::1', 'IPv6 static routes use the ipv6 route command.'],
      ['ipv6 default-gateway 2001:db8:0:1::1', 'This command does not exist on routers.'],
    ],
    ans: 'a',
    exp: 'The IPv6 default route is **::/0**: `ipv6 route ::/0 <next-hop | exit-interface [next-hop]> [AD]`. Remember that the router only forwards IPv6 after `ipv6 unicast-routing` is enabled.',
  },
  {
    id: 'A3-09', exam: 'A', obj: '3.3', type: 'single',
    q: 'Which command creates a host route to the server 10.1.1.10 through next hop 192.168.1.2?',
    opts: [
      ['ip route 10.1.1.10 255.255.255.255 192.168.1.2', 'Correct. A host route has a /32 mask.'],
      ['ip route 10.1.1.10 255.255.255.0 192.168.1.2', 'IOS rejects this ("Inconsistent address and mask"), and a /24 would not be a host route.'],
      ['ip route 10.1.1.0 255.255.255.0 192.168.1.2', 'This is a network route.'],
      ['ip host 10.1.1.10 192.168.1.2', 'ip host creates a local name-to-address mapping.'],
    ],
    ans: 'a',
    exp: 'A **host route** matches a single address: a /32 in IPv4 (255.255.255.255) or a /128 in IPv6. Because it is the most specific possible match, it overrides any network or default route for that one destination.',
  },
  {
    id: 'A3-10', exam: 'A', obj: '3.3', type: 'single',
    q: 'Why is `ip route 0.0.0.0 0.0.0.0 GigabitEthernet0/1` (exit interface only, no next hop) discouraged on an Ethernet link?',
    opts: [
      ['The router treats every destination as directly connected and must ARP for each one, relying on proxy ARP from the next router.', 'Correct.'],
      ['IOS rejects static routes that point to Ethernet interfaces.', 'IOS accepts the command.'],
      ['The route has an administrative distance of 255.', 'The AD is not affected.'],
      ['It disables CEF on the interface.', 'CEF keeps working.'],
    ],
    ans: 'a',
    exp: 'On multi-access media, a static route with only an exit interface makes the router ARP for **every destination address**. It only works if the next router answers with **proxy ARP**, and it bloats the ARP cache. On Ethernet, specify the **next-hop address** (optionally with the interface: a fully specified static). Exit-interface-only statics are fine on point-to-point serial links.',
  },
  {
    id: 'A3-11', exam: 'A', obj: '3.3', type: 'match',
    q: 'Drag each static route command to the type of static route it creates.',
    items: [
      ['r1', 'ip route 10.0.0.0 255.0.0.0 192.168.1.1'],
      ['r2', 'ip route 10.0.0.0 255.0.0.0 Serial0/0/0'],
      ['r3', 'ip route 10.0.0.0 255.0.0.0 GigabitEthernet0/1 192.168.1.1'],
      ['r4', 'ip route 0.0.0.0 0.0.0.0 192.168.1.1'],
      ['r5', 'ip route 10.0.0.0 255.0.0.0 192.168.2.1 130'],
    ],
    targets: [['t1', 'Recursive (next-hop only)'], ['t2', 'Directly attached (exit interface only)'], ['t3', 'Fully specified'], ['t4', 'Default'], ['t5', 'Floating']],
    ans: { r1: 't1', r2: 't2', r3: 't3', r4: 't4', r5: 't5' },
    exp: '- **Recursive**: only a next hop; the router does a second lookup to find the exit interface.\n- **Directly attached**: only an exit interface; best on point-to-point links.\n- **Fully specified**: both exit interface and next hop.\n- **Default**: 0.0.0.0/0.\n- **Floating**: a higher AD, so it acts as a backup.',
  },
  {
    id: 'A3-12', exam: 'A', obj: '3.4', type: 'multi',
    q: 'Which two parameters must match on two routers before they form an OSPFv2 adjacency over an Ethernet link?',
    opts: [
      ['Area ID', 'Correct.'],
      ['Hello and dead intervals', 'Correct.'],
      ['Router ID', 'Router IDs must be unique, not equal.'],
      ['OSPF process ID', 'The process ID is locally significant.'],
      ['Interface cost', 'Costs can differ.'],
    ],
    ans: 'a,b',
    exp: 'Neighbours must agree on: **area ID**, **hello and dead timers**, **subnet and mask** (on broadcast networks), **authentication**, the stub area flag, and MTU (or they stick in EXSTART/EXCHANGE). Router IDs must be **unique**. Process IDs and costs may differ.',
  },
  {
    id: 'A3-13', exam: 'A', obj: '3.4', type: 'single',
    q: 'On which OSPF network type are a DR and a BDR elected by default?',
    opts: [
      ['Broadcast multi-access, such as Ethernet', 'Correct.'],
      ['Point-to-point, such as a serial link with HDLC or PPP', 'Point-to-point links have only one possible neighbour, so no DR is needed.'],
      ['Loopback', 'Loopbacks have no neighbours.'],
      ['All network types', 'DR election happens only on multi-access types.'],
    ],
    ans: 'a',
    exp: 'On **multi-access** segments (broadcast and NBMA), a **DR** and **BDR** reduce the number of adjacencies and flooding: other routers become FULL only with the DR and BDR. On **point-to-point** links (serial, or Ethernet with `ip ospf network point-to-point`) there is no election.',
  },
  {
    id: 'A3-14', exam: 'A', obj: '3.4', type: 'order',
    q: 'Put the sources an OSPF router uses to choose its router ID in order of preference, highest priority first.',
    items: [
      ['s1', 'The router-id command under router ospf'],
      ['s2', 'The highest IPv4 address on an up loopback interface'],
      ['s3', 'The highest IPv4 address on an up non-loopback interface'],
    ],
    exp: 'The **RID** is chosen when the OSPF process starts: (1) manual `router-id`; (2) highest up **loopback** address; (3) highest up physical interface address. After the process has neighbours, a change only takes effect with `clear ip ospf process` or a reload.',
  },
  {
    id: 'A3-15', exam: 'A', obj: '3.4', type: 'single',
    q: 'R1 has stayed in this state with R2 for several minutes. What is the most likely cause?',
    ex: [{ kind: 'cli', title: 'R1#show ip ospf neighbor', text: `Neighbor ID     Pri   State           Dead Time   Address         Interface
2.2.2.2           1   EXSTART/DR      00:00:36    10.0.12.2       GigabitEthernet0/0` }],
    opts: [
      ['An MTU mismatch between the two interfaces', 'Correct. DBD exchange fails when MTUs differ.'],
      ['Mismatched hello timers', 'With mismatched timers the neighbour would not appear at all.'],
      ['Different area IDs', 'Hellos with different area IDs are ignored, so no neighbour would appear.'],
      ['A duplicate router ID', 'This causes different symptoms, such as flapping and log messages.'],
    ],
    ans: 'a',
    exp: 'Routers stuck in **EXSTART/EXCHANGE** are usually facing an **MTU mismatch**: the Database Description packets carry the interface MTU, and the side with the smaller MTU rejects larger DBDs. Fix the MTU (or use `ip ospf mtu-ignore` as a workaround). Hello and area mismatches stop routers seeing each other at all.',
  },
  {
    id: 'A3-16', exam: 'A', obj: '3.4', type: 'single',
    q: 'R1 has G0/0 = 10.1.1.5/30 and G0/1 = 10.1.1.9/30. Which `network` command enables OSPF on G0/0 but **not** on G0/1?',
    opts: [
      ['network 10.1.1.5 0.0.0.0 area 0', 'Correct. A wildcard of 0.0.0.0 matches exactly one interface address.'],
      ['network 10.1.1.0 0.0.0.15 area 0', 'This matches .0–.15, which includes .9.'],
      ['network 10.1.1.4 255.255.255.252 area 0', 'This is a subnet mask used as a wildcard; it matches almost every address.'],
      ['network 10.1.1.0 0.0.0.255 area 0', 'This matches both interfaces.'],
    ],
    ans: 'a',
    exp: 'The `network` command matches **interface addresses** against an address and **wildcard** (0 bits must match, 1 bits are ignored). `0.0.0.0` matches one exact address, and `10.1.1.4 0.0.0.3` would also work. Entering a subnet mask by mistake (255.255.255.252) creates a wildcard that ignores almost every bit.',
  },
  {
    id: 'A3-17', exam: 'A', obj: '3.4', type: 'single',
    q: 'With default settings, OSPF assigns cost 1 to both FastEthernet and 10-Gigabit links. How do you make OSPF prefer the faster links?',
    opts: [
      ['Set `auto-cost reference-bandwidth 10000` (or higher) on all OSPF routers.', 'Correct. Cost = reference bandwidth / interface bandwidth.'],
      ['Set `bandwidth 100` on the 10-Gigabit interfaces.', 'Lowering the bandwidth value makes those links look slower.'],
      ['Use `ip ospf priority 255` on the 10-Gigabit interfaces.', 'Priority affects DR election only.'],
      ['Set `maximum-paths 1`.', 'This limits ECMP; it does not change costs.'],
    ],
    ans: 'a',
    exp: 'OSPF cost = **reference bandwidth (default 100 Mb/s) / interface bandwidth**, with a minimum of 1, so everything at 100 Mb/s or faster costs 1. Raise the reference (in Mb/s) **consistently on all routers**, for example `auto-cost reference-bandwidth 10000` makes 10G = 1, 1G = 10 and 100M = 100. You can also set `ip ospf cost` per interface.',
  },
  {
    id: 'A3-18', exam: 'A', obj: '3.4', type: 'single',
    q: 'On an Ethernet segment with four OSPF routers, R3 shows R4 in the state **2WAY/DROTHER**. What does this indicate?',
    opts: [
      ['Normal operation: neither R3 nor R4 is the DR or BDR, so they do not need a full adjacency.', 'Correct.'],
      ['A mismatched hello timer between R3 and R4', 'With mismatched timers they would not see each other.'],
      ['R4 is about to become the DR', 'The state shows R4 is a DROTHER.'],
      ['An MTU mismatch', 'An MTU mismatch shows EXSTART or EXCHANGE.'],
    ],
    ans: 'a',
    exp: 'On multi-access segments, **DROTHERs** form **FULL** adjacencies only with the DR and BDR. Between two DROTHERs the neighbourship stays at **2-WAY**, which is expected and reduces flooding overhead.',
  },
  {
    id: 'A3-19', exam: 'A', obj: '3.4', type: 'single',
    q: 'Which OSPF LSA type does the DR originate to describe a multi-access network and the routers attached to it?',
    opts: [
      ['Type 2 (network LSA)', 'Correct.'],
      ['Type 1 (router LSA)', 'Every router originates a Type 1 describing its own links.'],
      ['Type 3 (summary LSA)', 'Type 3 LSAs are created by ABRs for inter-area routes.'],
      ['Type 5 (external LSA)', 'Type 5 LSAs are created by ASBRs for external routes such as an advertised default.'],
    ],
    ans: 'a',
    exp: 'Inside an area, each router floods a **Type 1** (router) LSA listing its links. On each multi-access segment, the **DR** floods a **Type 2** (network) LSA listing the routers attached to that segment. ABRs create Type 3; ASBRs create Type 5 (for example, with `default-information originate`).',
  },
  {
    id: 'A3-20', exam: 'A', obj: '3.5', type: 'single',
    q: 'Which problem does a first hop redundancy protocol solve?',
    opts: [
      ['Hosts lose off-subnet connectivity when their single configured default gateway fails.', 'Correct.'],
      ['Switching loops between access switches', 'Loops are prevented by STP.'],
      ['Slow OSPF convergence between core routers', 'FHRPs protect the host\'s first hop, not the routing protocol.'],
      ['Running out of DHCP addresses', 'That is a DHCP pool sizing issue.'],
    ],
    ans: 'a',
    exp: 'Hosts usually have one static default gateway. An **FHRP** (HSRP, VRRP or GLBP) lets two or more routers share a **virtual IP and virtual MAC** that hosts use as their gateway. If the active router fails, another takes over the virtual address and hosts need no reconfiguration.',
  },
  {
    id: 'A3-21', exam: 'A', obj: '3.5', type: 'single',
    q: 'What is the virtual MAC address of HSRP version 1 group 10?',
    opts: [
      ['0000.0C07.AC0A', 'Correct. 0000.0C07.ACxx, where xx is the group number in hex.'],
      ['0000.0C9F.F00A', 'This is the HSRPv2 format (0000.0C9F.Fxxx).'],
      ['0000.5E00.010A', 'This is the VRRP format.'],
      ['0007.B400.0A01', 'This is the GLBP format.'],
    ],
    ans: 'a',
    exp: 'Virtual MACs: **HSRPv1** 0000.0C07.AC**xx** (groups 0–255), **HSRPv2** 0000.0C9F.F**xxx** (groups 0–4095), **VRRP** 0000.5E00.01**xx**. Group 10 = 0x0A.',
  },
  {
    id: 'A3-22', exam: 'A', obj: '3.5', type: 'single',
    q: 'Which first hop redundancy protocol is an open (IETF) standard?',
    opts: [
      ['VRRP', 'Correct. RFC 5798.'],
      ['HSRP', 'HSRP is Cisco proprietary.'],
      ['GLBP', 'GLBP is Cisco proprietary.'],
      ['CARP', 'CARP is an open-source protocol from OpenBSD and is not one of the protocols covered by the exam.'],
    ],
    ans: 'a',
    exp: '**HSRP** (Cisco): active/standby. **VRRP** (IETF standard): master/backup, pre-emption enabled by default, and the virtual IP may be a real interface address. **GLBP** (Cisco): one virtual IP with several virtual MACs to load-balance hosts across gateways.',
  },
  {
    id: 'A3-23', exam: 'A', obj: '3.2', type: 'single',
    q: 'A router receives a packet with a TTL of 1 destined for a remote network. What does it do?',
    opts: [
      ['Decrements the TTL to 0, drops the packet and sends an ICMP Time Exceeded message to the source', 'Correct. This is how traceroute discovers each hop.'],
      ['Forwards the packet with TTL 0', 'Packets with TTL 0 are never forwarded.'],
      ['Resets the TTL to 255 and forwards the packet', 'TTL is never increased in transit.'],
      ['Sends an ICMP Destination Unreachable message', 'Unreachable is used when there is no route or the traffic is filtered.'],
    ],
    ans: 'a',
    exp: 'Each router decrements the TTL by 1. If it reaches **0**, the router drops the packet and returns **ICMP Time Exceeded**. This prevents packets from circulating forever in a routing loop, and traceroute uses it by sending probes with TTL 1, 2, 3 and so on.',
  },

  // ================================================================ Exam B
  {
    id: 'B3-01', exam: 'B', obj: '3.1', type: 'multi',
    q: 'Based on the routing table, which two statements are true?',
    ex: [{ kind: 'cli', title: 'R1#show ip route', text: `Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
      10.0.0.0/8 is variably subnetted, 7 subnets, 5 masks
C        10.1.1.0/30 is directly connected, GigabitEthernet0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0
C        10.1.1.4/30 is directly connected, GigabitEthernet0/2
L        10.1.1.5/32 is directly connected, GigabitEthernet0/2
O        10.2.0.0/16 [110/2] via 10.1.1.2, 00:21:13, GigabitEthernet0/0
O        10.2.5.0/24 [110/3] via 10.1.1.2, 00:21:13, GigabitEthernet0/0
S        10.2.5.128/25 [1/0] via 10.1.1.6
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/1
L        203.0.113.2/32 is directly connected, GigabitEthernet0/1` }],
    opts: [
      ['A packet to 10.2.5.200 is forwarded to 10.1.1.6.', 'Correct. .200 is in 10.2.5.128/25, the longest match.'],
      ['A packet to 10.2.6.1 is forwarded to 10.1.1.2.', 'Correct. Only the /16 OSPF route (and the default) match.'],
      ['A packet to 10.3.0.1 is dropped.', 'It matches the default route and goes to 203.0.113.1.'],
      ['A packet to 10.2.5.10 is forwarded to 10.1.1.6.', '.10 is not in the /25 (.128–.255), so the /24 via 10.1.1.2 is used.'],
      ['The static route to 10.2.5.128/25 is ignored because OSPF has a route to 10.2.5.0/24.', 'They are different prefixes, so both are installed.'],
    ],
    ans: 'a,b',
    exp: 'Different prefix lengths are **different routes**, all installed together. For each packet, the router picks the **longest matching prefix**: 10.2.5.200 → /25 static; 10.2.5.10 → /24 OSPF; 10.2.6.1 → /16 OSPF; 10.3.0.1 → default.',
  },
  {
    id: 'B3-02', exam: 'B', obj: '3.1', type: 'match',
    q: 'Drag each route source to its default administrative distance.',
    items: [['s1', 'Connected interface'], ['s2', 'Static route'], ['s3', 'eBGP'], ['s4', 'EIGRP (internal)'], ['s5', 'OSPF'], ['s6', 'RIP'], ['s7', 'iBGP']],
    targets: [['t0', '0'], ['t1', '1'], ['t20', '20'], ['t90', '90'], ['t110', '110'], ['t120', '120'], ['t200', '200']],
    ans: { s1: 't0', s2: 't1', s3: 't20', s4: 't90', s5: 't110', s6: 't120', s7: 't200' },
    exp: 'Lower AD = more trusted source. Also worth knowing: IS-IS 115, EIGRP external 170, and 255 = unknown/never installed. A static route can be given any AD from 1 to 255 to make it float.',
  },
  {
    id: 'B3-03', exam: 'B', obj: '3.1', type: 'single',
    q: 'In `show ip route`, what does the line **10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks** mean?',
    opts: [
      ['The routing table has three routes within the classful network 10.0.0.0/8, using two different prefix lengths.', 'Correct.'],
      ['The router is summarising 10.0.0.0/8 into three subnets.', 'This is a heading for grouping, not a summary.'],
      ['There are three equal-cost paths to 10.0.0.0/8.', 'This has nothing to do with paths.'],
      ['The 10.0.0.0/8 network has an invalid mask.', 'Variable masks (VLSM) are normal.'],
    ],
    ans: 'a',
    exp: 'IOS groups routes under their **classful** parent network. "is subnetted, N subnets" means all routes under it share one mask; "**variably subnetted, N subnets, M masks**" means VLSM is in use. Since IOS 15, connected subnets plus their /32 local routes already make the group variably subnetted.',
  },
  {
    id: 'B3-04', exam: 'B', obj: '3.2', type: 'single',
    q: 'R1 has these routes: 192.168.0.0/16 via A (static), 192.168.1.0/24 via B (OSPF) and 192.168.1.0/24 via C (EIGRP internal). Which next hop is used for a packet to 192.168.1.50?',
    opts: [
      ['C', 'Correct. EIGRP (AD 90) beats OSPF (AD 110) for the same /24, and the /24 beats the /16.'],
      ['B', 'OSPF\'s AD of 110 loses to EIGRP\'s 90 for the same prefix, so the OSPF /24 is not installed.'],
      ['A', 'The /16 is less specific than the /24.'],
      ['B and C, load-balanced', 'Routes from different protocols are never load-balanced.'],
    ],
    ans: 'a',
    exp: 'Two separate steps: (1) **building the table**: for the same prefix from different sources, the lowest AD is installed, so the EIGRP /24 wins over OSPF; (2) **forwarding**: among the installed routes, the longest match wins, so the /24 beats the /16.',
  },
  {
    id: 'B3-05', exam: 'B', obj: '3.2', type: 'single',
    q: 'A router receives a packet for a destination that matches no route, and it has no default route. What does it do?',
    opts: [
      ['Drops the packet and sends an ICMP Destination Unreachable message to the source', 'Correct.'],
      ['Floods the packet out all interfaces', 'Routers do not flood unicast packets.'],
      ['Sends the packet back to the interface it arrived on', 'That would create a loop.'],
      ['Holds the packet until a route is learned', 'Routers do not queue packets waiting for routes.'],
    ],
    ans: 'a',
    exp: 'With no matching route and no gateway of last resort, the router **drops** the packet and normally returns **ICMP Destination Unreachable** (network unreachable). In an IOS ping this shows as **U**.',
  },
  {
    id: 'B3-06', exam: 'B', obj: '3.2', type: 'multi',
    q: 'A router has several candidate routes to exactly the same prefix. Which two values does it use to pick the route to install?',
    opts: [
      ['Administrative distance, when the routes come from different sources', 'Correct.'],
      ['Metric, when the routes come from the same routing protocol', 'Correct.'],
      ['Prefix length', 'The prefix is identical in this case; prefix length matters when choosing between different prefixes.'],
      ['The router ID of the neighbour', 'Router IDs identify routers; they do not rank routes.'],
      ['The interface MAC address', 'MAC addresses do not influence route selection.'],
    ],
    ans: 'a,b',
    exp: 'Order of decisions: when forwarding, the **longest prefix match** applies across all installed routes. When installing routes to the **same prefix**, the lowest **AD** wins between sources, and the lowest **metric** wins within one source (with ties installed as ECMP).',
  },
  {
    id: 'B3-07', exam: 'B', obj: '3.3', type: 'single',
    q: 'Which command sends all traffic without a more specific route to the ISP at 198.51.100.1?',
    opts: [
      ['ip route 0.0.0.0 0.0.0.0 198.51.100.1', 'Correct.'],
      ['ip default-gateway 198.51.100.1', 'ip default-gateway is used only when IP routing is disabled, as on a Layer 2 switch.'],
      ['ip route 255.255.255.255 0.0.0.0 198.51.100.1', 'This is not a valid default route.'],
      ['ip route 0.0.0.0 255.255.255.255 198.51.100.1', 'The mask must be 0.0.0.0.'],
    ],
    ans: 'a',
    exp: 'A **default route** is network 0.0.0.0 with mask 0.0.0.0, so it matches everything with the shortest possible prefix. Routers use `ip route 0.0.0.0 0.0.0.0 <next-hop>`. Non-routing devices (Layer 2 switches, or a router with `no ip routing`) use `ip default-gateway`.',
  },
  {
    id: 'B3-08', exam: 'B', obj: '3.3', type: 'single',
    q: 'PC1 cannot ping PC2. R1 shows the configuration below and its routing table contains a route to 172.16.20.0/24. R2 has no static or dynamic routes. What must be done?',
    ex: [{ kind: 'topo', title: 'Topology', nodes: { PC1: ['host', 10, 50, '192.168.1.10'], R1: ['router', 35, 50], R2: ['router', 65, 50], PC2: ['host', 90, 50, '172.16.20.10'] }, links: [['PC1', 'R1 g0/1', '192.168.1.0/24'], ['R1 g0/0', 'R2 g0/0', '10.10.10.0/30'], ['R2 g0/1', 'PC2', '172.16.20.0/24']] },
      { kind: 'cli', title: 'R1#show running-config | include ip route', text: 'ip route 172.16.20.0 255.255.255.0 10.10.10.2' }],
    opts: [
      ['Add a route on R2 to 192.168.1.0/24 via 10.10.10.1.', 'Correct. Echo replies from PC2 need a path back.'],
      ['Change R1\'s route to point to 172.16.20.1.', '172.16.20.1 is not directly reachable from R1.'],
      ['Add a default route on PC2.', 'PC2\'s gateway (R2) is the issue, not PC2.'],
      ['Remove the static route from R1.', 'R1 needs that route to reach PC2.'],
    ],
    ans: 'a',
    exp: 'Routing must work in **both directions**. R1 can forward the echo request to R2, but R2 has no route to 192.168.1.0/24, so it drops the reply. Add `ip route 192.168.1.0 255.255.255.0 10.10.10.1` (or a default route) on R2.',
  },
  {
    id: 'B3-09', exam: 'B', obj: '3.3', type: 'single',
    q: 'Which command configures a floating IPv6 default route through 2001:db8:0:2::2 with an administrative distance of 200?',
    opts: [
      ['ipv6 route ::/0 2001:db8:0:2::2 200', 'Correct.'],
      ['ipv6 route ::/0 2001:db8:0:2::2 distance 200', 'The AD is entered as a plain number at the end.'],
      ['ipv6 route 2001:db8:0:2::2 ::/0 200', 'The prefix comes first, then the next hop.'],
      ['ip route ::/0 2001:db8:0:2::2 200', 'IPv6 static routes use the ipv6 route command.'],
    ],
    ans: 'a',
    exp: 'Syntax: `ipv6 route <prefix/len> [interface] [next-hop] [AD]`. With AD 200 the route stays out of the table while a better default (for example a static with AD 1 or an OSPFv3 route) is present.',
  },
  {
    id: 'B3-10', exam: 'B', obj: '3.3', type: 'single',
    q: 'Which single static route summarises 192.168.16.0/24, 192.168.17.0/24, 192.168.18.0/24 and 192.168.19.0/24 without including other networks?',
    opts: [
      ['192.168.16.0 255.255.252.0', 'Correct. 192.168.16.0/22 covers 16–19.'],
      ['192.168.16.0 255.255.248.0', 'A /21 also covers 20–23.'],
      ['192.168.0.0 255.255.0.0', 'A /16 covers 256 networks.'],
      ['192.168.16.0 255.255.254.0', 'A /23 covers only 16–17.'],
    ],
    ans: 'a',
    exp: 'Four contiguous /24s, starting at a multiple of 4 (16), can be summarised by removing 2 bits: **/22 = 255.255.252.0**. In binary the third octet values 16–19 are 000100**xx**: the first 6 bits are common, so 16 + 6 = 22 bits.',
  },
  {
    id: 'B3-11', exam: 'B', obj: '3.3', type: 'multi',
    q: 'Which two statements about IPv6 static routes on IOS are true?',
    opts: [
      ['A static route that uses a link-local next hop must also specify the exit interface.', 'Correct. Link-local addresses are only unique on one link.'],
      ['The router forwards IPv6 only after ipv6 unicast-routing is enabled.', 'Correct.'],
      ['IPv6 static routes are configured with the ip route command.', 'They use ipv6 route.'],
      ['The next hop must always be a global unicast address.', 'Link-local next hops are common and valid.'],
      ['The default administrative distance of an IPv6 static route is 5.', 'The default is 1, as for IPv4.'],
    ],
    ans: 'a,b',
    exp: 'Every IPv6 link reuses FE80::/10, so a next hop such as FE80::1 is ambiguous without an interface: `ipv6 route ::/0 g0/0 fe80::1`. Static routes default to AD 1, and nothing is forwarded until `ipv6 unicast-routing` is on.',
  },
  {
    id: 'B3-12', exam: 'B', obj: '3.4', type: 'single',
    q: 'Which interface command enables OSPF process 10 in area 0 directly on GigabitEthernet0/1, without a network statement?',
    opts: [
      ['ip ospf 10 area 0', 'Correct.'],
      ['ospf 10 area 0', 'The command needs the ip keyword.'],
      ['network 10 area 0', 'network is a router configuration command and takes an address and wildcard.'],
      ['ip ospf area 0 process 10', 'The syntax is ip ospf <process-id> area <area-id>.'],
    ],
    ans: 'a',
    exp: 'OSPFv2 can be enabled in two ways: under `router ospf <pid>` with `network <address> <wildcard> area <id>`, or per interface with **`ip ospf <pid> area <id>`**. The interface command takes precedence and shows as "Attached via Interface Enable" in `show ip ospf interface`.',
  },
  {
    id: 'B3-13', exam: 'B', obj: '3.4', type: 'single',
    q: 'An engineer accidentally configures `passive-interface GigabitEthernet0/0` on R1, and G0/0 connects to R2. What is the result?',
    opts: [
      ['R1 stops sending hellos on G0/0, the R1–R2 adjacency goes down, but the G0/0 subnet is still advertised.', 'Correct.'],
      ['The G0/0 subnet is removed from OSPF, but the adjacency stays up.', 'Passive keeps the subnet and removes the adjacency.'],
      ['Nothing changes, because passive affects only LAN interfaces.', 'Passive applies to any interface it is configured on.'],
      ['OSPF stops on the whole router.', 'Only the one interface is affected.'],
    ],
    ans: 'a',
    exp: 'A **passive interface** still has its prefix advertised (if OSPF is enabled on it) but **does not send or process hellos**, so no adjacency can form over it. Use it on LAN interfaces with no other routers, never on transit links to neighbours.',
  },
  {
    id: 'B3-14', exam: 'B', obj: '3.4', type: 'single',
    q: 'What are the default OSPF hello and dead intervals on a broadcast (Ethernet) network?',
    opts: [
      ['10 seconds and 40 seconds', 'Correct. The dead interval defaults to four times the hello.'],
      ['30 seconds and 120 seconds', 'These are the defaults on NBMA networks.'],
      ['5 seconds and 15 seconds', 'These are EIGRP defaults on fast links.'],
      ['3 seconds and 10 seconds', 'These are HSRP hello and hold timers.'],
    ],
    ans: 'a',
    exp: 'On broadcast and point-to-point networks, OSPF sends **hellos every 10 s** with a **dead interval of 40 s**. On NBMA networks the defaults are 30/120. Changing `ip ospf hello-interval` also adjusts the dead interval to four times the new value unless it is set explicitly. Both values must match between neighbours.',
  },
  {
    id: 'B3-15', exam: 'B', obj: '3.4', type: 'single',
    q: 'Two routers are connected by a single Ethernet link. What is a benefit of configuring `ip ospf network point-to-point` on both interfaces?',
    opts: [
      ['No DR/BDR election takes place, so the adjacency forms faster and no network LSA is needed.', 'Correct.'],
      ['It increases the link bandwidth.', 'The network type does not change bandwidth.'],
      ['It allows more than two routers on the link.', 'Point-to-point assumes exactly one neighbour.'],
      ['It changes the OSPF cost to 0.', 'Cost is still based on bandwidth.'],
    ],
    ans: 'a',
    exp: 'With only two routers, a DR/BDR election adds a wait timer and an unnecessary Type 2 LSA. The **point-to-point** network type skips the election, so the routers go straight to FULL. Both ends must use the same network type.',
  },
  {
    id: 'B3-16', exam: 'B', obj: '3.4', type: 'multi',
    q: 'Based on the output, which two statements about R1 are true?',
    ex: [{ kind: 'cli', title: 'R1#show ip ospf interface gigabitEthernet 0/0', text: `GigabitEthernet0/0 is up, line protocol is up
  Internet Address 10.0.0.1/24, Area 0, Attached via Network Statement
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State BDR, Priority 1
  Designated Router (ID) 3.3.3.3, Interface address 10.0.0.3
  Backup Designated router (ID) 1.1.1.1, Interface address 10.0.0.1
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Neighbor Count is 2, Adjacent neighbor count is 2
    Adjacent with neighbor 3.3.3.3  (Designated Router)
    Adjacent with neighbor 2.2.2.2` }],
    opts: [
      ['R1 is the BDR on this segment.', 'Correct.'],
      ['R1 is fully adjacent with 2.2.2.2.', 'Correct. The BDR forms full adjacencies with every router on the segment.'],
      ['R1 is the DR on this segment.', 'The DR is 3.3.3.3.'],
      ['The interface is passive.', 'A passive interface would show "No Hellos (Passive interface)".'],
      ['The OSPF cost of the interface is 10.', 'The cost is 1.'],
    ],
    ans: 'a,b',
    exp: 'The output shows **State BDR** and lists R1 (1.1.1.1) as the Backup Designated Router, with 3.3.3.3 as DR. Both the DR and the BDR form FULL adjacencies with all routers on the segment, so the adjacent count equals the neighbour count (2/2).',
  },
  {
    id: 'B3-17', exam: 'B', obj: '3.4', type: 'single',
    q: 'What does `passive-interface default` do under `router ospf 1`?',
    opts: [
      ['Makes every interface passive; hellos are then enabled on selected interfaces with no passive-interface.', 'Correct.'],
      ['Makes only the default-route interface passive.', 'There is no such behaviour.'],
      ['Disables OSPF on every interface.', 'Prefixes are still advertised; only hellos stop.'],
      ['Restores the default (non-passive) setting on all interfaces.', 'It does the opposite.'],
    ],
    ans: 'a',
    exp: 'On routers with many LAN interfaces and few transit links, **`passive-interface default`** followed by **`no passive-interface <transit-intf>`** is safer: new interfaces are passive automatically, so no unexpected adjacency can form.',
  },
  {
    id: 'B3-18', exam: 'B', obj: '3.4', type: 'single',
    q: 'An engineer adds `router-id 9.9.9.9` to an OSPF process that already has neighbours, but `show ip protocols` still shows the old router ID. Why?',
    opts: [
      ['A running process keeps its router ID until `clear ip ospf process` is entered or the router reloads.', 'Correct. IOS prints a message to this effect.'],
      ['Router IDs must match a loopback address.', 'Any unique dotted-decimal value is allowed.'],
      ['9.9.9.9 is a reserved address.', 'It is not reserved.'],
      ['The router ID can only be set before any network statements exist.', 'It can be changed later, but takes effect only after a reset.'],
    ],
    ans: 'a',
    exp: 'Changing the RID on a process that already has neighbours prints `% OSPF: Reload or use "clear ip ospf process" command, for this to take effect`. Clearing the process tears down all adjacencies briefly, so do it in a maintenance window.',
  },
  {
    id: 'B3-19', exam: 'B', obj: '3.4', type: 'single',
    q: 'Which statement about OSPF routers within the same area is true?',
    opts: [
      ['They all have an identical link-state database for that area.', 'Correct. Each then runs SPF independently.'],
      ['They all have identical routing tables.', 'Each router calculates routes from its own position, so tables differ.'],
      ['They all elect the same router as DR on every segment.', 'DR elections are per segment.'],
      ['They exchange their complete routing tables every 30 seconds.', 'That describes RIP; OSPF floods LSAs only when something changes, and refreshes them every 30 minutes.'],
    ],
    ans: 'a',
    exp: 'OSPF floods LSAs so that every router in an area has the **same LSDB**, which is the shared map of the area. Each router then runs **SPF** (Dijkstra) with itself as the root to build its own shortest-path tree and routing table.',
  },
  {
    id: 'B3-20', exam: 'B', obj: '3.4', type: 'single',
    q: 'The reference bandwidth is the default (100 Mb/s). R1 connects to R2 over FastEthernet, R2 connects to R3 over a 10 Mb/s Ethernet link, and R3\'s LAN is FastEthernet. What is R1\'s OSPF cost to R3\'s LAN?',
    opts: [
      ['12', 'Correct. 1 (R1 Fa) + 10 (R2 Eth) + 1 (R3 LAN Fa).'],
      ['11', 'This forgets the cost of R3\'s LAN interface.'],
      ['3', 'The 10 Mb/s link costs 10, not 1.'],
      ['21', 'This counts the 10 Mb/s link twice.'],
    ],
    ans: 'a',
    exp: 'OSPF adds the cost of each **outgoing** interface along the path, including the interface on the destination network: R1 → R2 (FastEthernet: 100/100 = **1**), R2 → R3 (Ethernet: 100/10 = **10**), and R3\'s LAN interface (**1**). Total **12**.',
  },
  {
    id: 'B3-21', exam: 'B', obj: '3.4', type: 'single',
    q: 'Which command makes an OSPF router advertise a default route to its neighbours even if it has no default route of its own?',
    opts: [
      ['default-information originate always', 'Correct.'],
      ['default-information originate', 'Without always, the router advertises a default only if it has one in its routing table.'],
      ['ip route 0.0.0.0 0.0.0.0 null0', 'This creates a local default, not an OSPF advertisement by itself.'],
      ['redistribute connected', 'This injects connected subnets, not a default route.'],
    ],
    ans: 'a',
    exp: '`default-information originate` advertises a Type 5 LSA for 0.0.0.0/0 (seen as **O*E2** on other routers) **only if** the router has a default route. Adding **`always`** advertises it unconditionally, which can black-hole traffic if the router has no real exit.',
  },
  {
    id: 'B3-22', exam: 'B', obj: '3.5', type: 'single',
    q: 'R1 (HSRP priority 110) and R2 (default priority) share a virtual gateway. R1 reloads, R2 becomes active, and when R1 comes back R2 stays active. Why?',
    opts: [
      ['Pre-emption is not enabled on R1.', 'Correct. HSRP does not pre-empt by default.'],
      ['R2 has the higher priority.', 'R2 has the default 100, which is lower than 110.'],
      ['The virtual IP addresses do not match.', 'They match, or failover would not have worked.'],
      ['HSRP version 2 never pre-empts.', 'Both versions support pre-emption when configured.'],
    ],
    ans: 'a',
    exp: 'HSRP elects the active router by highest priority (default 100) and then highest IP, but a running active router is **not replaced** unless the higher-priority router has **`standby <group> preempt`**. VRRP, by contrast, pre-empts by default.',
  },
  {
    id: 'B3-23', exam: 'B', obj: '3.5', type: 'single',
    q: 'What is the virtual MAC address format for HSRP version 2?',
    opts: [
      ['0000.0C9F.Fxxx', 'Correct. xxx is the group number (0–4095) in hex.'],
      ['0000.0C07.ACxx', 'This is HSRPv1.'],
      ['0000.5E00.01xx', 'This is VRRP.'],
      ['0100.5E00.0002', 'This is a multicast MAC address, not an HSRP virtual MAC.'],
    ],
    ans: 'a',
    exp: '**HSRPv2** supports groups 0–4095, uses multicast 224.0.0.102 (v1 uses 224.0.0.2) and the virtual MAC **0000.0C9F.Fxxx**. Both versions use UDP port 1985.',
  },
  {
    id: 'B3-24', exam: 'B', obj: '3.5', type: 'single',
    q: 'Which FHRP uses one virtual IP address but answers ARP requests with different virtual MAC addresses, spreading hosts across several active gateways?',
    opts: [
      ['GLBP', 'Correct. The AVG assigns virtual MACs to up to four AVFs.'],
      ['HSRP', 'In HSRP one router per group is active.'],
      ['VRRP', 'In VRRP one master per group forwards.'],
      ['NHRP', 'NHRP is used in DMVPN networks, not for gateway redundancy.'],
    ],
    ans: 'a',
    exp: 'In **GLBP**, the **AVG** (active virtual gateway) answers hosts\' ARP requests for the virtual IP with the virtual MAC of one of up to four **AVFs** (active virtual forwarders), in turn. All routers forward traffic at once. With HSRP or VRRP you need several groups to balance the load.',
  },

  // ================================================================ Exam C
  {
    id: 'C3-01', exam: 'C', obj: '3.1', type: 'single',
    q: 'Based on this routing table entry, how does R1 forward traffic to 10.5.5.0/24?',
    ex: [{ kind: 'cli', title: 'R1#show ip route 10.5.5.0 255.255.255.0 longer-prefixes', text: `O        10.5.5.0/24 [110/3] via 10.0.12.2, 00:04:11, GigabitEthernet0/0
                     [110/3] via 10.0.13.3, 00:04:11, GigabitEthernet0/1` }],
    opts: [
      ['It shares the load across both next hops because the two paths have equal cost.', 'Correct. OSPF installed two equal-cost paths.'],
      ['It uses only 10.0.12.2, the first path listed; the second line is a backup.', 'Both entries are active for ECMP.'],
      ['It drops the traffic because two routes conflict.', 'Equal routes do not conflict.'],
      ['It uses 10.0.13.3 because it was learned more recently.', 'Both have the same age and cost.'],
    ],
    ans: 'a',
    exp: 'Several next hops listed under one prefix with the same [AD/metric] are **equal-cost multipath** routes. CEF shares the traffic across them, by default per flow (source and destination hash), so packets in one flow stay in order.',
  },
  {
    id: 'C3-02', exam: 'C', obj: '3.1', type: 'single',
    q: 'In the route `O 10.20.0.0/16 [110/11] via 10.0.0.2, 03:15:22, GigabitEthernet0/0`, what does **03:15:22** represent?',
    opts: [
      ['How long ago the route was learned or last changed', 'Correct.'],
      ['The time until the route expires', 'OSPF routes do not count down to expiry.'],
      ['The round-trip time to the next hop', 'Routing entries contain no latency measurements.'],
      ['The system uptime', 'It is per route, not the system uptime.'],
    ],
    ans: 'a',
    exp: 'The time stamp in a dynamic route is its **age**, the time since it was installed or updated. A very young route on a stable network can point to flapping links or neighbours.',
  },
  {
    id: 'C3-03', exam: 'C', obj: '3.2', type: 'single',
    q: 'R1 has a static default route to ISP1 (AD 1) and an OSPF external route to 8.0.0.0/8 via ISP2 (AD 110). Which path does a packet to 8.8.8.8 take?',
    opts: [
      ['Via ISP2, because 8.0.0.0/8 is a longer match than 0.0.0.0/0', 'Correct. Longest match decides before AD comes into play.'],
      ['Via ISP1, because the static route has a lower AD', 'AD only compares routes to the same prefix.'],
      ['Both, load-balanced', 'They are different prefixes.'],
      ['It is dropped because the routes conflict', 'They do not conflict.'],
    ],
    ans: 'a',
    exp: 'Longest-prefix match is applied to the installed routes: **/8 beats /0**. Administrative distance matters only when two sources offer the **same** prefix.',
  },
  {
    id: 'C3-04', exam: 'C', obj: '3.2', type: 'single',
    q: 'R1 learns 10.1.0.0/16 from OSPF with a cost of 50 and also has `ip route 10.1.0.0 255.255.0.0 172.16.0.2 120`. Which route is installed?',
    opts: [
      ['The OSPF route, because its AD of 110 is lower than 120', 'Correct.'],
      ['The static route, because static routes always win', 'A static route\'s AD can be set higher than OSPF\'s, as here.'],
      ['The static route, because 120 is lower than the cost of 50 plus 110', 'AD and metric are not added together.'],
      ['Both, load-balanced', 'Routes from different sources are not load-balanced.'],
    ],
    ans: 'a',
    exp: 'Same prefix, different sources → lowest **AD** wins: OSPF 110 < static 120. The static is a **floating** route and appears only if OSPF loses the prefix. Metrics from different protocols are never compared.',
  },
  {
    id: 'C3-05', exam: 'C', obj: '3.3', type: 'single',
    q: 'The static route on R1 does not appear in its routing table. Why?',
    ex: [{ kind: 'cli', title: 'R1', text: `R1#show running-config | include ip route
ip route 10.20.0.0 255.255.0.0 10.0.12.2

R1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     10.0.12.1       YES manual down                  down
GigabitEthernet0/1     192.168.1.1     YES manual up                    up

R1#show ip route static

R1#` }],
    opts: [
      ['The next hop 10.0.12.2 cannot be resolved because G0/0 is down, so the route is not installed.', 'Correct.'],
      ['Static routes are only shown after the configuration is saved.', 'Saving has no effect on the routing table.'],
      ['The mask 255.255.0.0 is invalid for 10.20.0.0.', 'A /16 is valid for 10.20.0.0.'],
      ['Static routes require a routing protocol to be running.', 'They do not.'],
    ],
    ans: 'a',
    exp: 'A recursive static route is installed only if its **next hop is reachable** through another route. With G0/0 down, the connected 10.0.12.0/30 route disappears, so 10.0.12.2 cannot be resolved and the static route is withdrawn. It returns automatically when the link comes back. This is exactly how floating statics fail over.',
  },
  {
    id: 'C3-06', exam: 'C', obj: '3.3', type: 'single',
    q: 'Traffic to 10.50.0.0/16 should use ISP-A (next hop 1.1.1.1) and use ISP-B (next hop 2.2.2.2) only if ISP-A\'s next hop becomes unreachable. Which configuration achieves this?',
    opts: [
      ['ip route 10.50.0.0 255.255.0.0 1.1.1.1 and ip route 10.50.0.0 255.255.0.0 2.2.2.2 10', 'Correct.'],
      ['ip route 10.50.0.0 255.255.0.0 1.1.1.1 10 and ip route 10.50.0.0 255.255.0.0 2.2.2.2', 'This makes ISP-B the primary.'],
      ['ip route 10.50.0.0 255.255.0.0 1.1.1.1 and ip route 10.50.0.0 255.255.0.0 2.2.2.2', 'Equal AD would load-balance across both ISPs.'],
      ['ip route 10.50.0.0 255.255.0.0 1.1.1.1 255 and ip route 10.50.0.0 255.255.0.0 2.2.2.2 254', 'AD 255 is never installed, and ISP-B would be primary.'],
    ],
    ans: 'a',
    exp: 'Give the primary route the default AD (1) and the backup a **higher** AD. Note that a static route only fails over when its next hop becomes **unresolvable** (for example, the interface goes down). To detect failures further away, use IP SLA tracking with the static route.',
  },
  {
    id: 'C3-07', exam: 'C', obj: '3.3', type: 'single',
    q: 'Which command creates a fully specified IPv6 static route to 2001:db8:9::/64 out of G0/1 through next hop FE80::2?',
    opts: [
      ['ipv6 route 2001:db8:9::/64 gigabitEthernet0/1 fe80::2', 'Correct.'],
      ['ipv6 route 2001:db8:9::/64 fe80::2', 'A link-local next hop requires an interface.'],
      ['ipv6 route gigabitEthernet0/1 2001:db8:9::/64 fe80::2', 'The prefix comes first.'],
      ['ip route 2001:db8:9::/64 g0/1 fe80::2', 'IPv6 uses ipv6 route.'],
    ],
    ans: 'a',
    exp: 'A **fully specified** static route names both the exit interface and the next hop. It is required with a **link-local** next hop and is good practice on multi-access links.',
  },
  {
    id: 'C3-08', exam: 'C', obj: '3.4', type: 'order',
    q: 'Put the OSPF neighbour states in the order a broadcast adjacency moves through them.',
    items: [['s1', 'Down'], ['s2', 'Init'], ['s3', '2-Way'], ['s4', 'ExStart'], ['s5', 'Exchange'], ['s6', 'Loading'], ['s7', 'Full']],
    exp: '**Down** → **Init** (a hello received) → **2-Way** (each sees itself in the other\'s hello; DR/BDR election happens here) → **ExStart** (master/slave chosen) → **Exchange** (DBDs summarise the LSDB) → **Loading** (LSRs request missing LSAs, answered with LSUs) → **Full** (the databases are synchronised).',
  },
  {
    id: 'C3-09', exam: 'C', obj: '3.4', type: 'match',
    q: 'Drag each OSPF packet type to its purpose.',
    items: [['p1', 'Hello'], ['p2', 'Database Description (DBD)'], ['p3', 'Link-State Request (LSR)'], ['p4', 'Link-State Update (LSU)'], ['p5', 'Link-State Acknowledgment (LSAck)']],
    targets: [
      ['t1', 'Discovers neighbours and maintains adjacencies'],
      ['t2', 'Summarises the LSAs in the sender\'s database'],
      ['t3', 'Asks the neighbour for specific LSAs'],
      ['t4', 'Carries one or more full LSAs'],
      ['t5', 'Confirms that LSAs were received'],
    ],
    ans: { p1: 't1', p2: 't2', p3: 't3', p4: 't4', p5: 't5' },
    exp: 'OSPF packet types are numbered 1–5: **Hello**, **DBD**, **LSR**, **LSU**, **LSAck**. OSPF runs directly over IP (protocol 89), not over TCP or UDP.',
  },
  {
    id: 'C3-10', exam: 'C', obj: '3.4', type: 'multi',
    q: 'Which two multicast addresses does OSPFv2 use?',
    opts: [
      ['224.0.0.5, for all OSPF routers', 'Correct.'],
      ['224.0.0.6, for the DR and BDR', 'Correct.'],
      ['224.0.0.9', 'This is RIPv2.'],
      ['224.0.0.10', 'This is EIGRP.'],
      ['224.0.0.18', 'This is VRRP.'],
    ],
    ans: 'a,b',
    exp: '**224.0.0.5** (AllSPFRouters): hellos, and updates sent by the DR. **224.0.0.6** (AllDRouters): updates sent by DROTHERs to the DR and BDR. OSPFv3 uses FF02::5 and FF02::6.',
  },
  {
    id: 'C3-11', exam: 'C', obj: '3.4', type: 'single',
    q: 'R1 has no OSPF neighbour on G0/1, which connects to R2. Based on the output, why?',
    ex: [{ kind: 'cli', title: 'R1#show ip protocols', text: `Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID 1.1.1.1
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.0.0 0.255.255.255 area 0
  Passive Interface(s):
    GigabitEthernet0/1
  Routing Information Sources:
    Gateway         Distance      Last Update
  Distance: (default is 110)` }],
    opts: [
      ['G0/1 is configured as a passive interface, so no hellos are exchanged.', 'Correct.'],
      ['The network statement does not include G0/1.', '10.0.0.0 0.255.255.255 matches any 10.x.x.x address.'],
      ['The router ID is invalid.', '1.1.1.1 is valid.'],
      ['OSPF uses area 1 on G0/1.', 'The only network statement places interfaces in area 0.'],
    ],
    ans: 'a',
    exp: '`show ip protocols` lists the network statements, **passive interfaces**, router ID and routing information sources. G0/1 is passive, so it never sends hellos and the adjacency with R2 cannot form. Fix it with `no passive-interface g0/1`.',
  },
  {
    id: 'C3-12', exam: 'C', obj: '3.4', type: 'single',
    q: 'What is the effect of `network 0.0.0.0 255.255.255.255 area 0` under `router ospf 1`?',
    opts: [
      ['OSPF is enabled in area 0 on every interface that has an IPv4 address.', 'Correct. The all-ones wildcard matches every address.'],
      ['A default route is advertised into OSPF.', 'Advertising a default needs default-information originate.'],
      ['OSPF is enabled only on the interface with address 0.0.0.0.', 'A wildcard of all 1s ignores every bit.'],
      ['The command is rejected.', 'It is accepted and commonly used in labs.'],
    ],
    ans: 'a',
    exp: 'A wildcard of **255.255.255.255** means "ignore all bits", so every interface address matches and joins area 0. It is quick to type, but it also enables OSPF on interfaces you may not want, such as an Internet-facing link.',
  },
  {
    id: 'C3-13', exam: 'C', obj: '3.4', type: 'single',
    q: 'R1 runs `router ospf 1` and R2 runs `router ospf 20`. Can they become neighbours?',
    opts: [
      ['Yes. The process ID is locally significant and does not have to match.', 'Correct.'],
      ['No. The process IDs must match.', 'Process IDs are not carried in hellos.'],
      ['Only if both are in area 1', 'The area must match, but it can be any area.'],
      ['Only on point-to-point links', 'Network type is unrelated to the process ID.'],
    ],
    ans: 'a',
    exp: 'The OSPF **process ID** only identifies the process on the local router (a router can run several). Unlike EIGRP\'s AS number, it is not part of the hello, so neighbours can use different process IDs.',
  },
  {
    id: 'C3-14', exam: 'C', obj: '3.4', type: 'single',
    q: 'A router has no `router-id` command. Its interfaces are Loopback0 10.255.255.1, G0/0 192.168.1.1 and G0/1 172.16.1.1, all up. Which router ID does OSPF choose?',
    opts: [
      ['10.255.255.1', 'Correct. An up loopback is preferred over physical interfaces, even if its address is lower.'],
      ['192.168.1.1', 'This is the highest physical interface address, but loopbacks take precedence.'],
      ['172.16.1.1', 'This is neither the loopback nor the highest address.'],
      ['0.0.0.0', 'OSPF needs a valid router ID and one is available here.'],
    ],
    ans: 'a',
    exp: 'Router ID selection: manual `router-id` → highest **loopback** address → highest active physical interface address. A loopback\'s address wins even if it is numerically lower than a physical interface address.',
  },
  {
    id: 'C3-15', exam: 'C', obj: '3.4', type: 'single',
    q: 'An engineer is designing a small single-area OSPF network. Which area number is recommended?',
    opts: [
      ['Area 0, the backbone area', 'Correct. It allows future areas to be added cleanly.'],
      ['Area 1, because area 0 is reserved for ABRs', 'Area 0 is the normal backbone and is not reserved for ABRs.'],
      ['Any number, and they must differ on each link', 'All routers in a single area must use the same area ID.'],
      ['Area 255', 'There is no special meaning to area 255.'],
    ],
    ans: 'a',
    exp: 'A single-area design can technically use any area number, but **area 0** is recommended because in a multi-area design every other area must connect to the backbone. Area IDs can be written as a number (0) or in dotted form (0.0.0.0).',
  },
  {
    id: 'C3-16', exam: 'C', obj: '3.4', type: 'single',
    q: 'R1 shows R2 in the **INIT** state and never progresses. What does this mean?',
    opts: [
      ['R1 receives hellos from R2, but R2 is not receiving R1\'s hellos (R1\'s router ID is not in R2\'s hello).', 'Correct. Communication is one-way, for example because an ACL blocks multicast in one direction.'],
      ['The routers are exchanging database descriptions.', 'That is the EXCHANGE state.'],
      ['The adjacency is fully formed.', 'That is FULL.'],
      ['The routers have mismatched areas.', 'With mismatched areas the hellos are ignored, so R2 would not appear at all.'],
    ],
    ans: 'a',
    exp: '**INIT** means "I have heard you, but you have not heard me yet". The state becomes 2-WAY when R1 sees its own router ID in R2\'s neighbour list. Being stuck in INIT points to one-way communication: an ACL dropping 224.0.0.5, a unidirectional link or authentication failing in one direction.',
  },
  {
    id: 'C3-17', exam: 'C', obj: '3.4', type: 'single',
    q: 'R1 reaches 10.9.0.0/16 through two paths with equal OSPF cost, via G0/1 and via G0/2. The engineer wants traffic to prefer G0/1 and use G0/2 only as a backup. Which change achieves this?',
    opts: [
      ['Configure a higher ip ospf cost on G0/2.', 'Correct. The G0/2 path becomes more expensive.'],
      ['Configure ip ospf priority 255 on G0/1.', 'Priority affects DR election, not path selection.'],
      ['Configure maximum-paths 2.', 'This allows ECMP; it does not create a preference.'],
      ['Make G0/2 a passive interface.', 'That would tear down the adjacency on G0/2 and remove the backup.'],
    ],
    ans: 'a',
    exp: 'OSPF chooses the lowest total **cost**. Raising `ip ospf cost` on G0/2 (or lowering it on G0/1) makes the G0/1 path cheaper, while the G0/2 path remains available if G0/1 fails. Cost is applied to **outgoing** interfaces, so set it on the router that sends the traffic.',
  },
  {
    id: 'C3-18', exam: 'C', obj: '3.4', type: 'single',
    q: 'Two OSPF routers in the same area are accidentally configured with the same router ID. What is the most likely result?',
    opts: [
      ['Adjacencies fail or LSAs are repeatedly overwritten, causing missing routes and flapping, with duplicate router ID log messages.', 'Correct.'],
      ['OSPF automatically renumbers one of the routers.', 'OSPF does not change router IDs itself.'],
      ['Nothing happens, because router IDs need not be unique.', 'Router IDs must be unique within the OSPF domain.'],
      ['Both routers become the DR.', 'Duplicate IDs break the protocol rather than electing two DRs.'],
    ],
    ans: 'a',
    exp: 'The router ID identifies each router\'s LSAs. Duplicates cause directly connected neighbours to refuse the adjacency (`%OSPF-4-DUPID`), or, if the routers are not neighbours, constant LSA overwriting and SPF churn. Assign unique IDs, ideally by setting `router-id` explicitly.',
  },
  {
    id: 'C3-19', exam: 'C', obj: '3.5', type: 'single',
    q: 'Both routers are up. Which router is the HSRP active router for group 1?',
    ex: [{ kind: 'cli', title: 'Configuration', text: `R1(config)#interface g0/1
R1(config-if)#ip address 192.168.1.2 255.255.255.0
R1(config-if)#standby 1 ip 192.168.1.254
R1(config-if)#standby 1 priority 120
R1(config-if)#standby 1 preempt

R2(config)#interface g0/1
R2(config-if)#ip address 192.168.1.3 255.255.255.0
R2(config-if)#standby 1 ip 192.168.1.254
R2(config-if)#standby 1 priority 110` }],
    opts: [
      ['R1, because it has the higher priority and pre-emption', 'Correct.'],
      ['R2, because it has the higher IP address', 'IP address only breaks ties between equal priorities.'],
      ['Both routers, sharing the load', 'HSRP has one active router per group.'],
      ['Neither, because the priorities must match', 'Priorities do not need to match.'],
    ],
    ans: 'a',
    exp: 'HSRP elects the router with the **highest priority** (default 100) as active; the highest IP address breaks ties. With `preempt`, R1 also takes over the active role whenever it comes back online. Hosts use **192.168.1.254** as their gateway.',
  },
  {
    id: 'C3-20', exam: 'C', obj: '3.5', type: 'order',
    q: 'Put the HSRP states in the order a router passes through them on its way to becoming the active router.',
    items: [['s1', 'Initial'], ['s2', 'Learn'], ['s3', 'Listen'], ['s4', 'Speak'], ['s5', 'Standby'], ['s6', 'Active']],
    exp: '**Initial** (HSRP starting) → **Learn** (waiting to learn the virtual IP from the active router) → **Listen** (knows the VIP, listening for hellos) → **Speak** (sending hellos, taking part in the election) → **Standby** (next in line) → **Active** (forwarding for the virtual IP and MAC).',
  },
  {
    id: 'C3-21', exam: 'C', obj: '3.5', type: 'single',
    q: 'Which statement about VRRP is true?',
    opts: [
      ['The virtual IP address can be the real interface address of one of the routers, which then always becomes master.', 'Correct. The address owner has priority 255.'],
      ['Pre-emption is disabled by default.', 'VRRP pre-empts by default; HSRP does not.'],
      ['It is Cisco proprietary.', 'VRRP is an IETF standard.'],
      ['The roles are called active and standby.', 'VRRP uses master and backup.'],
    ],
    ans: 'a',
    exp: '**VRRP**: master/backup roles, default priority 100, **pre-emption on by default**, multicast 224.0.0.18 (IP protocol 112), virtual MAC 0000.5E00.01xx. If the virtual IP equals a router\'s real address, that router is the **IP address owner** with priority 255.',
  },
  {
    id: 'C3-22', exam: 'C', obj: '3.2', type: 'single',
    q: 'With Cisco Express Forwarding (CEF), which two tables does the router use to forward packets?',
    opts: [
      ['The FIB and the adjacency table', 'Correct.'],
      ['The routing table and the MAC address table', 'CEF builds the FIB from the routing table and uses its own adjacency table for Layer 2 rewrites.'],
      ['The LSDB and the neighbour table', 'These are OSPF control-plane tables.'],
      ['The ARP cache and the NAT table', 'CEF builds its adjacency table from ARP, but these are not the CEF tables.'],
    ],
    ans: 'a',
    exp: 'CEF pre-computes forwarding: the **FIB** mirrors the routing table with every recursive lookup resolved, and the **adjacency table** stores the Layer 2 rewrite information (next-hop MAC addresses learned via ARP). Packets are then switched without process-level route lookups.',
  },
  {
    id: 'C3-23', exam: 'C', obj: '3.3', type: 'single',
    q: 'Which summary route covers exactly the networks 10.10.32.0/24 through 10.10.47.0/24?',
    opts: [
      ['10.10.32.0/20', 'Correct. A /20 is a block of 16 /24s, and 32 is a multiple of 16.'],
      ['10.10.32.0/19', 'A /19 covers 32–63.'],
      ['10.10.0.0/18', 'A /18 covers 0–63.'],
      ['10.10.32.0/21', 'A /21 covers only 32–39.'],
    ],
    ans: 'a',
    exp: '32–47 is 16 networks = 2⁴, so remove 4 bits from /24: **/20** (255.255.240.0). The block must start on a multiple of 16, and 32 is one. In binary, 32 = 0010 0000 and 47 = 0010 1111: the first 4 bits are common.',
  },

  // ================================================================ Exam D
  {
    id: 'D3-01', exam: 'D', obj: '3.1', type: 'single',
    q: 'What do the route codes **O IA** and **O E2** indicate?',
    opts: [
      ['O IA is an OSPF inter-area route; O E2 is an OSPF external type 2 route whose metric does not include the internal path cost.', 'Correct.'],
      ['O IA is an intra-area route; O E2 is an EIGRP route.', 'Intra-area routes are shown as plain O, and EIGRP uses D.'],
      ['Both are static routes redistributed into OSPF.', 'Only E1/E2 are external; IA is inter-area.'],
      ['O IA is invalid; O E2 is an error state.', 'Both are normal route types.'],
    ],
    ans: 'a',
    exp: 'OSPF route types: **O** = intra-area, **O IA** = inter-area (from an ABR\'s Type 3 LSA), **O E1/E2** = external (Type 5 from an ASBR). An E2 route keeps the cost set by the ASBR (default 20, or 1 for a default route); an E1 route adds the internal cost to reach the ASBR. **O*E2** is a candidate default route learned as external.',
  },
  {
    id: 'D3-02', exam: 'D', obj: '3.1', type: 'single',
    q: 'Which component of a routing table entry reflects how trustworthy the route\'s source is?',
    opts: [
      ['Administrative distance', 'Correct.'],
      ['Metric', 'The metric ranks paths within one protocol.'],
      ['Prefix length', 'Prefix length determines how specific the route is.'],
      ['Route age', 'Age is only informational.'],
    ],
    ans: 'a',
    exp: '**AD** ranks the reliability of route sources (lower is better) and is used when the same prefix is learned from several sources. The **metric** is the protocol\'s own measure of path quality.',
  },
  {
    id: 'D3-03', exam: 'D', obj: '3.1', type: 'single',
    q: 'How does R1 handle Internet-bound traffic, based on this output?',
    ex: [{ kind: 'cli', title: 'R1#show ip route 0.0.0.0', text: `Gateway of last resort is 192.0.2.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 192.0.2.1
                [1/0] via 198.51.100.1` }],
    opts: [
      ['It shares the traffic across both ISPs, because both default routes have the same AD and metric.', 'Correct. Two equal static default routes are both installed.'],
      ['It uses only 192.0.2.1; 198.51.100.1 is a floating backup.', 'A floating static would have a higher AD and would not appear.'],
      ['It drops the traffic because there are two gateways.', 'Equal routes do not conflict.'],
      ['It uses 198.51.100.1 because it is listed last.', 'Order does not imply preference.'],
    ],
    ans: 'a',
    exp: 'Two static routes to the same prefix with the same AD are both installed and CEF shares traffic between them per flow. The "Gateway of last resort" line simply names the first one. For active/standby behaviour, give the backup a higher AD.',
  },
  {
    id: 'D3-04', exam: 'D', obj: '3.2', type: 'single',
    q: 'R1 has routes to 10.1.1.0/24 via R2 (OSPF) and to 10.1.1.20/32 via R3 (static). Which next hop is used for a packet to 10.1.1.20?',
    opts: [
      ['R3, because the /32 host route is the longest match', 'Correct.'],
      ['R2, because OSPF is a dynamic protocol', 'Dynamic or static does not matter for longest match.'],
      ['R2, because the /24 was learned first', 'Learning order is irrelevant.'],
      ['Both, load-balanced', 'They are different prefixes.'],
    ],
    ans: 'a',
    exp: 'Longest prefix match: **/32 > /24**. Host routes are often used to steer one specific destination differently, for example a management server reached through a different path.',
  },
  {
    id: 'D3-05', exam: 'D', obj: '3.2', type: 'single',
    q: 'A router learns 172.16.5.0/24 from both EIGRP (internal) and OSPF. What happens to the OSPF route?',
    opts: [
      ['It is not installed in the routing table but stays in the OSPF database, ready to be installed if the EIGRP route disappears.', 'Correct.'],
      ['It is deleted from the OSPF database.', 'The LSDB is unaffected by routing table decisions.'],
      ['It is installed alongside the EIGRP route for load balancing.', 'Different sources are never load-balanced.'],
      ['It replaces the EIGRP route because OSPF is a link-state protocol.', 'EIGRP\'s AD of 90 beats OSPF\'s 110.'],
    ],
    ans: 'a',
    exp: 'Each routing protocol offers its best route to the routing table manager, which installs the one with the lowest **AD** (EIGRP 90). The OSPF route remains a candidate in OSPF\'s own database and is installed automatically if the EIGRP route is withdrawn.',
  },
  {
    id: 'D3-06', exam: 'D', obj: '3.2', type: 'single',
    q: 'R1 has an OSPF route to 172.16.0.0/16 and a static route to 172.16.1.0/24 with an AD of 200. Which route forwards a packet to 172.16.1.5?',
    opts: [
      ['The static /24, because it is the longest match, regardless of its higher AD', 'Correct.'],
      ['The OSPF /16, because its AD of 110 is lower than 200', 'AD only compares routes to the same prefix.'],
      ['Neither: the packet is dropped', 'Both routes are installed.'],
      ['Both, load-balanced', 'They are different prefixes.'],
    ],
    ans: 'a',
    exp: 'Because the prefixes differ, **both** routes are installed (the /24 static has no competitor for its own prefix). At forwarding time the **longest match** (/24) is used. A high AD only makes a static float behind another route to the **same** prefix.',
  },
  {
    id: 'D3-07', exam: 'D', obj: '3.3', type: 'single',
    q: 'Which command creates a static route to 10.40.0.0/16 out of the point-to-point interface Serial0/0/0?',
    opts: [
      ['ip route 10.40.0.0 255.255.0.0 serial0/0/0', 'Correct. A directly attached static route suits point-to-point links.'],
      ['ip route 10.40.0.0 0.0.255.255 serial0/0/0', 'This uses a wildcard instead of a mask.'],
      ['ip route serial0/0/0 10.40.0.0 255.255.0.0', 'The prefix comes first.'],
      ['ip route 10.40.0.0/16 serial0/0/0', 'IPv4 static routes use a dotted mask.'],
    ],
    ans: 'a',
    exp: 'On a **point-to-point** serial link there is only one possible next hop, so naming the exit interface is enough: `ip route 10.40.0.0 255.255.0.0 s0/0/0`. The route is shown as "directly connected".',
  },
  {
    id: 'D3-08', exam: 'D', obj: '3.3', type: 'single',
    q: 'The link via 172.16.0.2 was meant to be a backup for the OSPF route to 10.50.0.0/16, but all traffic uses it. Why?',
    ex: [{ kind: 'cli', title: 'R1', text: `R1#show running-config | include ip route
ip route 10.50.0.0 255.255.0.0 172.16.0.2 5

R1#show ip route 10.50.0.0
Routing entry for 10.50.0.0/16
  Known via "static", distance 5, metric 0
  Routing Descriptor Blocks:
  * 172.16.0.2
      Route metric is 0, traffic share count is 1` }],
    opts: [
      ['The static route\'s AD of 5 is lower than OSPF\'s 110, so it is preferred; the AD must be higher than 110.', 'Correct.'],
      ['The static route needs an exit interface to be a backup.', 'An exit interface does not change preference.'],
      ['OSPF routes are never preferred over static routes.', 'A static route with an AD above 110 loses to OSPF.'],
      ['The route should use a /24 mask.', 'A more specific mask would make it win even more clearly.'],
    ],
    ans: 'a',
    exp: 'A floating static must have an AD **greater than** the primary route\'s AD. With OSPF at 110, use 111–254: `ip route 10.50.0.0 255.255.0.0 172.16.0.2 120`.',
  },
  {
    id: 'D3-09', exam: 'D', obj: '3.3', type: 'single',
    q: 'Which command creates an IPv6 host route to 2001:db8:a::5 through next hop 2001:db8:12::2?',
    opts: [
      ['ipv6 route 2001:db8:a::5/128 2001:db8:12::2', 'Correct. /128 is an IPv6 host route.'],
      ['ipv6 route 2001:db8:a::5/64 2001:db8:12::2', 'A /64 is a whole subnet.'],
      ['ipv6 route 2001:db8:a::5/32 2001:db8:12::2', '/32 is a very large prefix in IPv6.'],
      ['ipv6 host 2001:db8:a::5 2001:db8:12::2', 'ipv6 host creates a name mapping.'],
    ],
    ans: 'a',
    exp: 'IPv6 host routes use **/128**, the equivalent of an IPv4 /32.',
  },
  {
    id: 'D3-10', exam: 'D', obj: '3.4', type: 'single',
    q: 'Which command shows each OSPF neighbour\'s router ID, priority, state, dead timer and interface?',
    opts: [
      ['show ip ospf neighbor', 'Correct.'],
      ['show ip ospf database', 'This shows the LSDB.'],
      ['show ip protocols', 'This summarises the routing process, not neighbour states.'],
      ['show cdp neighbors', 'CDP is unrelated to OSPF.'],
    ],
    ans: 'a',
    exp: 'Useful OSPF verification commands: `show ip ospf neighbor` (adjacencies), `show ip ospf interface [brief]` (per-interface area, cost, state, timers), `show ip protocols` (RID, networks, passive interfaces), `show ip ospf database` (LSDB) and `show ip route ospf`.',
  },
  {
    id: 'D3-11', exam: 'D', obj: '3.4', type: 'single',
    q: 'On a broadcast segment, to which multicast address does a DROTHER send its link-state updates?',
    opts: [
      ['224.0.0.6 (AllDRouters)', 'Correct. Only the DR and BDR listen on this address.'],
      ['224.0.0.5 (AllSPFRouters)', 'The DR uses this address to flood updates to everyone.'],
      ['255.255.255.255', 'OSPF does not use broadcasts.'],
      ['The unicast address of every neighbour', 'Multicast is used on broadcast networks.'],
    ],
    ans: 'a',
    exp: 'DROTHERs send updates to **224.0.0.6**; the DR acknowledges them and re-floods to **224.0.0.5** for all routers. This avoids an n×n flooding mesh.',
  },
  {
    id: 'D3-12', exam: 'D', obj: '3.4', type: 'single',
    q: 'Based on this output from R1, what is R1\'s role on the GigabitEthernet0/0 segment?',
    ex: [{ kind: 'cli', title: 'R1#show ip ospf neighbor', text: `Neighbor ID     Pri   State           Dead Time   Address         Interface
3.3.3.3           1   FULL/DR         00:00:35    10.0.0.3        GigabitEthernet0/0
2.2.2.2           1   FULL/BDR        00:00:33    10.0.0.2        GigabitEthernet0/0
4.4.4.4           1   2WAY/DROTHER    00:00:38    10.0.0.4        GigabitEthernet0/0` }],
    opts: [
      ['DROTHER', 'Correct. R1 is fully adjacent only with the DR and BDR, and 2-WAY with another DROTHER.'],
      ['DR', 'The DR is 3.3.3.3.'],
      ['BDR', 'The BDR is 2.2.2.2.'],
      ['Its role cannot be determined from this output.', 'The 2WAY state with 4.4.4.4 shows that R1 is neither the DR nor the BDR.'],
    ],
    ans: 'a',
    exp: 'The DR and BDR are FULL with every router on the segment. Because R1 is only **2WAY** with 4.4.4.4, R1 must be a **DROTHER** too. `show ip ospf interface g0/0` would confirm with "State DROTHER".',
  },
  {
    id: 'D3-13', exam: 'D', obj: '3.4', type: 'single',
    q: 'Which LSA type does every OSPF router originate to describe its own links and their costs within an area?',
    opts: [
      ['Type 1 (router LSA)', 'Correct.'],
      ['Type 2 (network LSA)', 'Type 2 LSAs are created by the DR for a multi-access segment.'],
      ['Type 3 (summary LSA)', 'Type 3 LSAs are created by ABRs.'],
      ['Type 5 (external LSA)', 'Type 5 LSAs are created by ASBRs.'],
    ],
    ans: 'a',
    exp: 'Every router floods one **Type 1 router LSA** per area, listing its links (point-to-point, transit or stub) and their costs. Together with the Type 2 LSAs, these describe the complete topology of the area for SPF.',
  },
  {
    id: 'D3-14', exam: 'D', obj: '3.4', type: 'multi',
    q: 'Two routers are connected by a serial link using HDLC. Which two statements describe their default OSPF behaviour on that link?',
    opts: [
      ['The network type is point-to-point, so no DR or BDR is elected.', 'Correct.'],
      ['Hellos are sent every 10 seconds.', 'Correct. The dead interval is 40 seconds.'],
      ['The interface cost is 1.', 'With a 1.544 Mb/s bandwidth the cost is 64.'],
      ['The network type is broadcast.', 'Serial interfaces default to point-to-point.'],
      ['Hellos are sent every 30 seconds.', '30 seconds is the NBMA default.'],
    ],
    ans: 'a,b',
    exp: 'Serial HDLC/PPP interfaces default to OSPF network type **point-to-point**: no DR/BDR election, hello 10 s and dead 40 s. Their default bandwidth of 1544 kb/s gives a cost of 100,000 / 1,544 ≈ **64**.',
  },
  {
    id: 'D3-15', exam: 'D', obj: '3.4', type: 'single',
    q: 'With the default reference bandwidth, what is the OSPF cost of a serial interface whose bandwidth is the default 1544 kb/s?',
    opts: [
      ['64', 'Correct. 100,000 kb/s / 1,544 kb/s = 64 (truncated).'],
      ['1', 'Cost 1 applies to links of 100 Mb/s or faster.'],
      ['10', 'Cost 10 applies to 10 Mb/s links.'],
      ['1544', 'Bandwidth is not the cost.'],
    ],
    ans: 'a',
    exp: 'Cost = reference bandwidth / interface bandwidth = 100,000 kb/s / 1,544 kb/s = 64.77, truncated to **64**. The `bandwidth` command on the interface changes this (and should reflect the real circuit speed).',
  },
  {
    id: 'D3-16', exam: 'D', obj: '3.4', type: 'single',
    q: 'Which interface command ensures that R1 never becomes the DR or BDR on G0/0?',
    opts: [
      ['ip ospf priority 0', 'Correct. Priority 0 makes the router ineligible.'],
      ['ip ospf priority 255', 'This makes R1 the most preferred candidate.'],
      ['ip ospf cost 0', 'Cost affects path selection, and its minimum is 1.'],
      ['passive-interface g0/0', 'This would stop all adjacencies on G0/0.'],
    ],
    ans: 'a',
    exp: 'Priorities range from 0 to 255 (default 1). Highest wins the election, with the router ID breaking ties; **0 excludes** the router from the election, but it still forms adjacencies as a DROTHER.',
  },
  {
    id: 'D3-17', exam: 'D', obj: '3.4', type: 'single',
    q: 'The DR on an Ethernet segment fails. What happens?',
    opts: [
      ['The BDR becomes the DR, and a new BDR is elected.', 'Correct.'],
      ['All routers re-run a full election and the BDR stays BDR.', 'The BDR exists so that it can take over immediately.'],
      ['The segment has no DR until the old DR returns.', 'The BDR takes over.'],
      ['The router with the highest priority among the DROTHERs becomes DR, skipping the BDR.', 'The BDR is promoted first.'],
    ],
    ans: 'a',
    exp: 'The BDR is already fully adjacent with every router, so it is promoted to **DR** straight away, and a new **BDR** is elected from the remaining routers. When the old DR returns it does **not** take its role back, because DR election is not pre-emptive.',
  },
  {
    id: 'D3-18', exam: 'D', obj: '3.4', type: 'single',
    q: 'Which algorithm does OSPF use to calculate the best paths from its link-state database?',
    opts: [
      ['Dijkstra\'s shortest path first (SPF)', 'Correct.'],
      ['Bellman-Ford', 'Bellman-Ford is used by distance-vector protocols such as RIP.'],
      ['DUAL', 'DUAL is EIGRP\'s algorithm.'],
      ['Spanning tree', 'Spanning tree prevents Layer 2 loops.'],
    ],
    ans: 'a',
    exp: 'OSPF is a **link-state** protocol: each router builds the same topology map (LSDB) and runs **Dijkstra\'s SPF** with itself as the root to produce a shortest-path tree. RIP uses Bellman-Ford (distance vector), and EIGRP uses DUAL (advanced distance vector).',
  },
  {
    id: 'D3-19', exam: 'D', obj: '3.4', type: 'single',
    q: 'R1 and R2 are connected over Ethernet. Both use OSPF area 0 with default timers, but no adjacency forms. What is the cause?',
    ex: [{ kind: 'cli', title: 'Interface configuration', text: `R1#show running-config interface g0/0
interface GigabitEthernet0/0
 ip address 10.1.1.1 255.255.255.0
 ip ospf 1 area 0

R2#show running-config interface g0/0
interface GigabitEthernet0/0
 ip address 10.1.1.2 255.255.255.128
 ip ospf 1 area 0` }],
    opts: [
      ['The subnet masks do not match, and OSPF checks the mask in hellos on broadcast networks.', 'Correct.'],
      ['The interfaces must use network statements instead of ip ospf.', 'Both methods work.'],
      ['The process IDs must be different.', 'Process IDs are locally significant.'],
      ['10.1.1.2 is not a valid host address.', 'It is valid in both /24 and /25.'],
    ],
    ans: 'a',
    exp: 'On broadcast (and NBMA) networks the hello contains the **network mask**, and neighbours must agree on it. A /24 against a /25 means the hellos are ignored. (On point-to-point networks the mask is not checked.)',
  },
  {
    id: 'D3-20', exam: 'D', obj: '3.4', type: 'single',
    q: 'In which OSPF neighbour state do the routers decide which of them is master and which is slave for the database exchange?',
    opts: [
      ['ExStart', 'Correct. The router with the higher router ID becomes master.'],
      ['Exchange', 'In Exchange the DBD packets are already being exchanged.'],
      ['2-Way', '2-Way is where bidirectional communication is confirmed and the DR/BDR election happens.'],
      ['Loading', 'Loading is where LSRs and LSUs fetch the missing LSAs.'],
    ],
    ans: 'a',
    exp: 'In **ExStart** the two routers send empty DBDs and agree a starting sequence number. The one with the **higher router ID** becomes master and controls the sequencing during **Exchange**.',
  },
  {
    id: 'D3-21', exam: 'D', obj: '3.5', type: 'single',
    q: 'Which FHRP sends its hellos to 224.0.0.2 (version 1) or 224.0.0.102 (version 2) using UDP port 1985?',
    opts: [
      ['HSRP', 'Correct.'],
      ['VRRP', 'VRRP uses 224.0.0.18 and IP protocol 112.'],
      ['GLBP', 'GLBP uses 224.0.0.102 with UDP port 3222.'],
      ['OSPF', 'OSPF is a routing protocol, not an FHRP.'],
    ],
    ans: 'a',
    exp: '**HSRP**: UDP 1985, 224.0.0.2 (v1) or 224.0.0.102 (v2), hello 3 s and hold 10 s. **VRRP**: IP protocol 112, 224.0.0.18. **GLBP**: UDP 3222, 224.0.0.102.',
  },
  {
    id: 'D3-22', exam: 'D', obj: '3.5', type: 'multi',
    q: 'Which two statements about HSRP are true?',
    opts: [
      ['In each group, one router is active and one is standby.', 'Correct. Others in the group stay in the listen state.'],
      ['Hosts use the virtual IP address as their default gateway.', 'Correct.'],
      ['All routers in a group forward traffic at the same time.', 'That describes GLBP.'],
      ['HSRP is an IETF open standard.', 'HSRP is Cisco proprietary; VRRP is the open standard.'],
      ['Pre-emption is enabled by default.', 'HSRP needs standby preempt.'],
    ],
    ans: 'a,b',
    exp: 'Hosts are configured with the **virtual IP** as their gateway and ARP for it; the **active** router answers with the virtual MAC. The **standby** router monitors the active router\'s hellos and takes over after the hold time (10 s by default). To balance load with HSRP, configure several groups with different active routers.',
  },
  {
    id: 'D3-23', exam: 'D', obj: '3.5', type: 'single',
    q: 'In GLBP, what is the role of the active virtual gateway (AVG)?',
    opts: [
      ['It answers ARP requests for the virtual IP and assigns virtual MAC addresses to the forwarders', 'Correct.'],
      ['It is the only router that forwards traffic', 'Up to four AVFs forward traffic.'],
      ['It monitors the HSRP standby router', 'The AVG is a GLBP role, not an HSRP one.'],
      ['It elects the OSPF DR', 'GLBP is unrelated to OSPF.'],
    ],
    ans: 'a',
    exp: 'GLBP elects one **AVG** per group. It hands out up to four virtual MACs to **AVFs** (active virtual forwarders) and replies to hosts\' ARP requests with these MACs in turn (round-robin by default), so traffic is spread across the routers.',
  },
  {
    id: 'D3-24', exam: 'D', obj: '3.2', type: 'order',
    q: 'Put the steps a router takes to forward an IPv4 packet received on an Ethernet interface into the correct order.',
    items: [
      ['s1', 'Check the frame\'s FCS and remove the Ethernet header and trailer'],
      ['s2', 'Find the longest-prefix match for the destination IP address'],
      ['s3', 'Decrement the TTL and recalculate the IP header checksum'],
      ['s4', 'Look up the next hop\'s MAC address (ARP cache or adjacency table)'],
      ['s5', 'Build a new Ethernet frame and send it out of the exit interface'],
    ],
    exp: 'A router **de-encapsulates** the frame (discarding it if the FCS is bad), performs a **longest-match** lookup, **decrements the TTL** (dropping the packet and sending ICMP Time Exceeded if it reaches 0), resolves the **next-hop MAC** and **re-encapsulates** the packet in a new frame. The IP addresses stay the same (unless NAT is in use); the MAC addresses change at every hop.',
  },
  {
    id: 'D3-25', exam: 'D', obj: '3.4', type: 'single',
    q: 'Which command displays the LSAs that a router holds in its OSPF link-state database?',
    opts: [
      ['show ip ospf database', 'Correct.'],
      ['show ip ospf neighbor', 'This shows adjacencies.'],
      ['show ip route ospf', 'This shows only the routes installed from OSPF.'],
      ['show ip ospf interface brief', 'This shows per-interface OSPF settings and states.'],
    ],
    ans: 'a',
    exp: '`show ip ospf database` lists the LSAs by type: Router Link States (Type 1), Net Link States (Type 2), Summary Net Link States (Type 3) and Type-5 AS External Link States, each with the advertising router and sequence number.',
  },
];
