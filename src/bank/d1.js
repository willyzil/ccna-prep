// Domain 1: Network Fundamentals (20%).
export default [
  // ================================================================ Exam A
  {
    id: 'A1-01', exam: 'A', obj: '1.1', type: 'single',
    q: 'A company wants a device at the Internet edge that can identify applications regardless of the port they use, inspect traffic against known exploit signatures and block it inline. Which device meets these requirements?',
    opts: [
      ['A next-generation firewall with application visibility and an IPS', 'NGFWs add application awareness (AVC) and intrusion prevention to stateful filtering, and sit inline so they can drop traffic.'],
      ['A Layer 3 switch with extended ACLs', 'ACLs match addresses, protocols and ports; they cannot recognise an application running on a non-standard port or match exploit signatures.'],
      ['A wireless LAN controller', 'A WLC manages access points and wireless clients; it is not an Internet-edge security device.'],
      ['A traditional stateful firewall', 'A stateful firewall tracks sessions and filters by address and port, but it has no application identification or signature-based IPS.'],
    ],
    ans: 'a',
    exp: 'A **next-generation firewall (NGFW)** combines stateful inspection with application visibility and control, URL filtering and an integrated **IPS** that compares traffic against signatures. Because it is deployed inline, it can block malicious traffic rather than only alert (which is what an IDS does).',
  },
  {
    id: 'A1-02', exam: 'A', obj: '1.1', type: 'multi',
    q: 'Which two functions does a wireless LAN controller perform for lightweight access points?',
    opts: [
      ['Centralised configuration and management of the APs', 'Correct. Lightweight APs download their configuration from the WLC.'],
      ['Radio resource management, such as adjusting channels and transmit power', 'Correct. RRM is a WLC function that tunes the RF environment across all joined APs.'],
      ['Supplying PoE to the access points', 'Power comes from a PoE switch or power injector, not the controller.'],
      ['Transmitting beacons and responding to probe requests', 'These are real-time functions handled by the AP itself in a split-MAC architecture.'],
      ['Routing between all VLANs in the campus', 'Inter-VLAN routing is done by routers or Layer 3 switches.'],
    ],
    ans: 'a,b',
    exp: 'In the **split-MAC** architecture the AP keeps time-critical 802.11 functions (beacons, probe responses, ACKs, encryption), while the **WLC** handles management: configuration, authentication, roaming, security policy and **radio resource management** (channel and power assignment).',
  },
  {
    id: 'A1-03', exam: 'A', obj: '1.2', type: 'multi',
    q: 'Which two statements describe a spine-and-leaf data centre architecture?',
    opts: [
      ['Every leaf switch connects to every spine switch.', 'Correct. Full leaf-to-spine connectivity is the defining feature.'],
      ['Spine switches do not connect to each other.', 'Correct. Spines interconnect only through the leaves.'],
      ['Servers and other endpoints connect directly to spine switches.', 'Endpoints, firewalls and routers attach to leaf switches.'],
      ['Leaf switches connect directly to other leaf switches to shorten paths.', 'Leaf-to-leaf links are not part of the design; traffic between leaves always crosses one spine.'],
      ['It is a three-tier design with core, distribution and access layers.', 'That describes a campus hierarchy; spine-leaf has two tiers.'],
    ],
    ans: 'a,b',
    exp: 'In a **spine-leaf** fabric every leaf connects to every spine, spines do not connect to each other, and endpoints connect only to leaves. Any leaf reaches any other leaf through exactly one spine, giving predictable latency for heavy east-west traffic, and capacity grows by adding spines (bandwidth) or leaves (ports).',
  },
  {
    id: 'A1-04', exam: 'A', obj: '1.2', type: 'single',
    q: 'A medium-sized campus uses a **collapsed core** design. Which two hierarchical layers are combined into one?',
    opts: [
      ['Core and distribution', 'Correct. A collapsed core (two-tier) design merges the core and distribution layers.'],
      ['Distribution and access', 'Access remains a separate layer where end devices connect.'],
      ['Core and access', 'These layers have very different roles and are not merged.'],
      ['Access and edge', 'Edge/WAN connectivity is not part of the three campus hierarchy layers.'],
    ],
    ans: 'a',
    exp: 'A **two-tier (collapsed core)** campus combines the **core** and **distribution** layers into a single layer of switches that aggregate the access layer and provide the high-speed backbone. It suits networks that are too small to need a separate core.',
  },
  {
    id: 'A1-05', exam: 'A', obj: '1.3', type: 'single',
    q: 'Two buildings are 8 km apart and must be connected with a 10-Gbps link. Which cabling type should be used?',
    opts: [
      ['Single-mode fibre', 'Correct. SMF with laser optics supports distances of 10 km and beyond.'],
      ['Multimode fibre', 'Multimode supports only a few hundred metres at 10 Gbps (roughly 300–400 m with OM3/OM4).'],
      ['Category 6a UTP', 'All twisted-pair Ethernet is limited to 100 m.'],
      ['Coaxial cable', 'Coax is not used for modern Ethernet links of this kind.'],
    ],
    ans: 'a',
    exp: '**Single-mode fibre** has a very small core (about 9 µm), carries one mode of light from a laser and reaches the longest distances (10 km, 40 km or more depending on the optic). **Multimode** has a larger core, uses cheaper LED/VCSEL optics and is limited to hundreds of metres. Copper UTP is limited to 100 m.',
  },
  {
    id: 'A1-06', exam: 'A', obj: '1.3', type: 'single',
    q: 'An engineer connects two switches with a straight-through cable and the link comes up. Which feature made this possible?',
    opts: [
      ['Auto-MDIX', 'Correct. Auto-MDIX detects the cable type and swaps transmit and receive pairs when needed.'],
      ['Autonegotiation of speed and duplex', 'Autonegotiation agrees speed and duplex; it does not correct pin-outs.'],
      ['PortFast', 'PortFast is a spanning-tree feature and has nothing to do with the physical layer.'],
      ['Power over Ethernet', 'PoE delivers power over the cable; it does not affect pin-outs.'],
    ],
    ans: 'a',
    exp: 'Like devices (switch–switch, router–router, PC–PC) traditionally needed a **crossover** cable. **Auto-MDIX** detects that both ends transmit on the same pairs and internally swaps them, so a straight-through cable works. It is enabled by default on modern Cisco switches.',
  },
  {
    id: 'A1-07', exam: 'A', obj: '1.4', type: 'single',
    q: 'Users report errors on a link. Both ends are configured for 1000/full. What is the most likely cause?',
    ex: [{ kind: 'cli', title: 'SW1#show interfaces gigabitEthernet 0/1', text: `GigabitEthernet0/1 is up, line protocol is up (connected)
  Hardware is Gigabit Ethernet, address is 0019.e86a.2b81 (bia 0019.e86a.2b81)
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
     reliability 241/255, txload 3/255, rxload 4/255
  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX
     1823412 packets input, 1214033211 bytes, 0 no buffer
     0 runts, 0 giants, 0 throttles
     4381 input errors, 4381 CRC, 0 frame, 0 overrun, 0 ignored
     1790221 packets output, 1032212874 bytes, 0 underruns
     0 output errors, 0 collisions, 1 interface resets
     0 babbles, 0 late collision, 0 deferred` }],
    opts: [
      ['A damaged cable or electrical interference', 'Correct. CRC errors with no collisions on a full-duplex link point to the physical medium.'],
      ['A duplex mismatch', 'A duplex mismatch shows late collisions on the half-duplex side; here there are no collisions and both ends are full duplex.'],
      ['A speed mismatch', 'A speed mismatch prevents the link from coming up at all.'],
      ['An MTU mismatch', 'MTU mismatches cause giants or dropped large packets, not CRC errors.'],
    ],
    ans: 'a',
    exp: 'A **CRC error** means a received frame failed its frame check sequence: the bits were corrupted in transit. On a full-duplex link with **no collisions**, the usual causes are a damaged or poorly terminated cable, a bad connector or transceiver, or electromagnetic interference. Replace or reseat the cable first. Falling *reliability* (241/255) is another sign of errors.',
  },
  {
    id: 'A1-08', exam: 'A', obj: '1.5', type: 'multi',
    q: 'Which two characteristics apply to UDP?',
    opts: [
      ['It is connectionless.', 'Correct. UDP sends datagrams without setting up a session.'],
      ['It provides best-effort delivery without acknowledgements.', 'Correct. Lost datagrams are not detected or retransmitted by UDP.'],
      ['It uses a three-way handshake.', 'The SYN, SYN-ACK, ACK handshake is TCP.'],
      ['It uses windowing for flow control.', 'Windowing is a TCP mechanism.'],
      ['It guarantees in-order delivery using sequence numbers.', 'UDP has no sequence numbers; TCP does.'],
    ],
    ans: 'a,b',
    exp: '**UDP** has an 8-byte header with ports, length and checksum only. It is connectionless and unreliable, which keeps overhead and latency low for voice, video, DNS queries, DHCP, TFTP and SNMP. **TCP** adds the handshake, sequence numbers, acknowledgements, retransmission and windowing.',
  },
  {
    id: 'A1-09', exam: 'A', obj: '1.6', type: 'single',
    q: 'What is the broadcast address of the subnet that contains host **172.16.45.130/26**?',
    opts: [
      ['172.16.45.191', 'Correct. The /26 subnet is 172.16.45.128–191.'],
      ['172.16.45.255', 'That would be correct for a /24.'],
      ['172.16.45.127', 'That is the broadcast of the previous /26 (.64–.127).'],
      ['172.16.45.159', 'That would be the broadcast for a /27 (.128–.159).'],
    ],
    ans: 'a',
    exp: 'A /26 mask is 255.255.255.**192**, so the block size in the fourth octet is 256 − 192 = **64**: subnets start at .0, .64, .128 and .192. Host .130 falls in **172.16.45.128/26**, whose broadcast is the last address before the next subnet: **.191**.',
  },
  {
    id: 'A1-10', exam: 'A', obj: '1.6', type: 'single',
    q: 'Each subnet must support up to **500** hosts while using as few host bits as possible. Which mask meets the requirement?',
    opts: [
      ['255.255.254.0', 'Correct. /23 gives 9 host bits: 2⁹ − 2 = 510 hosts.'],
      ['255.255.255.0', 'A /24 supports only 254 hosts.'],
      ['255.255.252.0', 'A /22 supports 1022 hosts and wastes addresses.'],
      ['255.255.255.128', 'A /25 supports only 126 hosts.'],
    ],
    ans: 'a',
    exp: 'Find the smallest *h* with 2ʰ − 2 ≥ 500. 2⁸ − 2 = 254 is too few; 2⁹ − 2 = **510** works. Nine host bits leaves 32 − 9 = 23 network bits: **/23 = 255.255.254.0**.',
  },
  {
    id: 'A1-11', exam: 'A', obj: '1.6', type: 'single',
    q: 'The network 192.168.10.0/24 is divided into /27 subnets. What is the first usable host address in the **third** subnet?',
    opts: [
      ['192.168.10.65', 'Correct. The subnets are .0, .32, .64…, so the third is .64/27 and its first host is .65.'],
      ['192.168.10.97', 'That is the first host of the fourth subnet (.96/27).'],
      ['192.168.10.33', 'That is the first host of the second subnet.'],
      ['192.168.10.64', 'That is the subnet (network) address, not a usable host.'],
    ],
    ans: 'a',
    exp: '/27 = 255.255.255.224, block size **32**. Subnets: 1st .0, 2nd .32, 3rd **.64**, 4th .96 … The third subnet is 192.168.10.64/27; usable hosts are .65–.94 and .95 is the broadcast.',
  },
  {
    id: 'A1-12', exam: 'A', obj: '1.6', type: 'single',
    q: 'A user cannot reach anything outside the local subnet. Based on the output, what is wrong?',
    ex: [{ kind: 'cli', title: 'C:\\> ipconfig', text: `Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 10.1.5.200
   Subnet Mask . . . . . . . . . . . : 255.255.248.0
   Default Gateway . . . . . . . . . : 10.1.8.1` }],
    opts: [
      ['The default gateway is not in the host\'s subnet.', 'Correct. 10.1.5.200/21 is in 10.1.0.0–10.1.7.255, but the gateway is 10.1.8.1.'],
      ['The subnet mask is invalid.', '255.255.248.0 is a valid /21 mask.'],
      ['10.1.5.200 is the broadcast address of its subnet.', 'The broadcast of 10.1.0.0/21 is 10.1.7.255.'],
      ['The host needs a DNS server to reach remote subnets.', 'DNS resolves names; it is not needed to route packets.'],
    ],
    ans: 'a',
    exp: '/21 (255.255.**248**.0) has a block size of 8 in the third octet: 10.1.0.0, 10.1.8.0, 10.1.16.0… The host 10.1.5.200 is in **10.1.0.0/21** (10.1.0.1–10.1.7.254). The gateway 10.1.8.1 belongs to the *next* subnet, so the host cannot ARP for it and cannot send traffic off-subnet.',
  },
  {
    id: 'A1-13', exam: 'A', obj: '1.7', type: 'multi',
    q: 'Which two addresses are RFC 1918 private addresses?',
    opts: [
      ['172.31.255.254', 'Correct. 172.16.0.0/12 covers 172.16.0.0–172.31.255.255.'],
      ['10.255.0.1', 'Correct. 10.0.0.0/8 is entirely private.'],
      ['172.32.0.1', '172.32.x.x is just outside 172.16.0.0/12 and is public.'],
      ['192.169.1.1', 'Only 192.168.0.0/16 is private; 192.169.x.x is public.'],
      ['100.64.0.1', '100.64.0.0/10 is shared address space for carrier-grade NAT (RFC 6598), not RFC 1918.'],
    ],
    ans: 'a,b',
    exp: 'RFC 1918 reserves **10.0.0.0/8**, **172.16.0.0/12** (172.16.0.0–172.31.255.255) and **192.168.0.0/16** for private use. They are not routed on the Internet, so hosts using them need NAT to reach public networks.',
  },
  {
    id: 'A1-14', exam: 'A', obj: '1.8', type: 'multi',
    q: 'Which two are valid representations of the IPv6 address **2001:0db8:0000:0000:0a00:0000:0000:0001**?',
    opts: [
      ['2001:db8::a00:0:0:1', 'Correct. Leading zeros removed and the first run of zero groups replaced with ::.'],
      ['2001:db8:0:0:a00::1', 'Correct. Also valid; :: replaces the second run instead (RFC 5952 prefers the first when runs are equal).'],
      ['2001:db8::a00::1', 'Invalid: :: can appear only once, otherwise the address is ambiguous.'],
      ['2001:db8::a::1', 'Invalid: :: twice, and a00 cannot be shortened to a.'],
      ['2001:db8:0:0:a0:0:0:1', 'Invalid: only leading zeros may be dropped; 0a00 becomes a00, not a0.'],
    ],
    ans: 'a,b',
    exp: 'Two rules: (1) drop **leading** zeros in each group (0db8 → db8, 0a00 → a00, never trailing zeros); (2) replace **one** contiguous run of all-zero groups with **::**. This address has two equal runs of two zero groups, so either may be compressed, but :: can only be used once.',
  },
  {
    id: 'A1-15', exam: 'A', obj: '1.8', type: 'single',
    q: 'An interface with MAC address **001A.2B3C.4D5E** is configured with `ipv6 address 2001:db8:1:1::/64 eui-64`. Which address does it use?',
    opts: [
      ['2001:db8:1:1:21a:2bff:fe3c:4d5e', 'Correct. Insert FFFE in the middle and flip the seventh bit (00 → 02).'],
      ['2001:db8:1:1:1a:2bff:fe3c:4d5e', 'The universal/local bit was not flipped.'],
      ['2001:db8:1:1:21a:2bfe:ff3c:4d5e', 'The inserted value is FFFE, in that order.'],
      ['2001:db8:1:1:1a2b:3c4d:5e00:0', 'EUI-64 does not simply append the MAC.'],
    ],
    ans: 'a',
    exp: '**Modified EUI-64**: split the 48-bit MAC in half (001A2B | 3C4D5E), insert **FFFE** (001A2BFFFE3C4D5E), then flip the 7th bit of the first byte: 00 = 0000 0000 → 0000 0010 = **02**. Interface ID: 021A:2BFF:FE3C:4D5E, written as 21a:2bff:fe3c:4d5e.',
  },
  {
    id: 'A1-16', exam: 'A', obj: '1.9', type: 'match',
    q: 'Drag each IPv6 address to its address type.',
    items: [['i1', 'FE80::1'], ['i2', 'FD12:3456:789A::1'], ['i3', 'FF02::2'], ['i4', '2001:DB8:ACAD::1'], ['i5', '::1']],
    targets: [['t1', 'Link-local unicast'], ['t2', 'Unique local unicast'], ['t3', 'Multicast'], ['t4', 'Global unicast'], ['t5', 'Loopback']],
    ans: { i1: 't1', i2: 't2', i3: 't3', i4: 't4', i5: 't5' },
    exp: '- **FE80::/10**: link-local, valid only on the local link, always present on IPv6 interfaces.\n- **FC00::/7** (in practice **FD00::/8**): unique local, the IPv6 equivalent of private addressing.\n- **FF00::/8**: multicast; FF02::2 is all-routers on the link.\n- **2000::/3**: global unicast (2001:DB8::/32 is reserved for documentation).\n- **::1/128**: loopback.',
  },
  {
    id: 'A1-17', exam: 'A', obj: '1.10', type: 'single',
    q: 'A Windows laptop shows the output below. What is the most likely cause?',
    ex: [{ kind: 'cli', title: 'C:\\> ipconfig /all', text: `Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . :
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-V
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Autoconfiguration IPv4 Address. . : 169.254.37.112(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :` }],
    opts: [
      ['The laptop could not reach a DHCP server.', 'Correct. Windows assigns a 169.254.0.0/16 APIPA address when DHCP fails.'],
      ['The DHCP server assigned a link-local address.', 'DHCP servers do not assign 169.254.x.x; the host generates it itself.'],
      ['The laptop has a static IP address configured.', 'DHCP Enabled is Yes and the address is labelled Autoconfiguration.'],
      ['DNS resolution failed.', 'DNS failures do not change the IP address.'],
    ],
    ans: 'a',
    exp: 'When a DHCP client gets no offer, Windows uses **APIPA** (Automatic Private IP Addressing) and picks an address from **169.254.0.0/16** with no gateway. The host can only talk to others on the same link. Check the switch port and VLAN, the DHCP server and pool, and any `ip helper-address` relay.',
  },
  {
    id: 'A1-18', exam: 'A', obj: '1.11', type: 'single',
    q: 'Which set of 2.4-GHz channels does not overlap and should be used for adjacent access points in North America?',
    opts: [
      ['1, 6 and 11', 'Correct. These are 25 MHz apart and do not overlap.'],
      ['1, 5 and 9', 'These channels overlap each other.'],
      ['2, 7 and 12', 'Channel 12 is not usable in North America, and 2/7 overlap neighbouring channels.'],
      ['36, 40 and 44', 'These are 5-GHz channels.'],
    ],
    ans: 'a',
    exp: '2.4-GHz channels are only 5 MHz apart but each signal is about 22 MHz wide, so in the 11-channel North American plan only **1, 6 and 11** do not overlap. The 5-GHz band offers many more non-overlapping 20-MHz channels.',
  },
  {
    id: 'A1-19', exam: 'A', obj: '1.12', type: 'single',
    q: 'Which statement describes a key difference between containers and virtual machines?',
    opts: [
      ['Containers share the host operating system kernel, while each VM runs its own full guest OS.', 'Correct. This is why containers are lighter and start faster.'],
      ['Containers require a Type 1 hypervisor, while VMs require a Type 2 hypervisor.', 'Containers run on a container engine, not a hypervisor; VMs can use either hypervisor type.'],
      ['VMs share one kernel, while containers each include a complete OS.', 'This is the reverse of the truth.'],
      ['Containers can run only on physical servers.', 'Containers commonly run inside VMs and in the cloud.'],
    ],
    ans: 'a',
    exp: 'A **VM** virtualises hardware: the hypervisor presents virtual CPUs, memory and NICs, and each VM boots its own OS. A **container** virtualises the OS: containers are isolated processes sharing the host kernel and contain only the application and its libraries, so they are smaller and start in seconds.',
  },
  {
    id: 'A1-20', exam: 'A', obj: '1.13', type: 'single',
    q: 'A switch receives a unicast frame in VLAN 10 whose destination MAC address is not in its MAC address table. What does the switch do?',
    opts: [
      ['Floods the frame out all ports in VLAN 10 except the port it arrived on', 'Correct. Unknown unicast frames are flooded within the VLAN.'],
      ['Drops the frame', 'Switches flood unknown unicasts instead of dropping them.'],
      ['Sends the frame to the default gateway', 'Switches forward on MAC addresses; the default gateway is a host setting.'],
      ['Floods the frame out every port in every VLAN', 'Flooding stays inside the frame\'s VLAN (broadcast domain).'],
    ],
    ans: 'a',
    exp: 'Switches **learn** source MACs and **forward** on destination MACs. A known destination is forwarded out one port, but an **unknown unicast** (as well as broadcast and most multicast) is **flooded** out every port in the same VLAN except the incoming one. When the destination replies, the switch learns its MAC and later frames are forwarded directly.',
  },

  // ================================================================ Exam B
  {
    id: 'B1-01', exam: 'B', obj: '1.1', type: 'single',
    q: 'IP phones and wireless access points must be deployed without separate power adapters. Which capability must the access switches provide?',
    opts: [
      ['Power over Ethernet (802.3af/at/bt)', 'Correct. PoE delivers DC power over the same twisted-pair cable as the data.'],
      ['Auto-MDIX', 'Auto-MDIX corrects cable pin-outs; it supplies no power.'],
      ['Voice VLAN', 'A voice VLAN separates phone traffic but does not power the phone.'],
      ['EtherChannel', 'EtherChannel bundles links for bandwidth and redundancy.'],
    ],
    ans: 'a',
    exp: '**PoE** lets a switch act as power sourcing equipment (PSE) for powered devices such as phones, APs and cameras. 802.3af supplies up to 15.4 W per port, 802.3at (PoE+) up to 30 W and 802.3bt up to 60–90 W. Check the switch\'s total PoE budget as well as per-port limits.',
  },
  {
    id: 'B1-02', exam: 'B', obj: '1.1', type: 'multi',
    q: 'Which two statements describe a Layer 3 (multilayer) switch?',
    opts: [
      ['It can route between VLANs using switched virtual interfaces (SVIs).', 'Correct. With ip routing enabled, SVIs act as the default gateways for their VLANs.'],
      ['It can convert a port into a routed port with an IP address.', 'Correct. The no switchport command turns a physical port into a Layer 3 interface.'],
      ['It needs an external router-on-a-stick to route between VLANs.', 'That is how a Layer 2-only switch gets inter-VLAN routing.'],
      ['It cannot run routing protocols such as OSPF.', 'Multilayer switches can run OSPF and other routing protocols.'],
      ['It forwards frames only on the basis of MAC addresses.', 'That describes a Layer 2 switch.'],
    ],
    ans: 'a,b',
    exp: 'A **multilayer switch** forwards Layer 2 frames like any switch and can also route in hardware. Enable `ip routing`, then give each VLAN an **SVI** (`interface vlan 10` with an IP address) or create **routed ports** with `no switchport`. It can run static routing and dynamic protocols such as OSPF.',
  },
  {
    id: 'B1-03', exam: 'B', obj: '1.2', type: 'single',
    q: 'In a three-tier campus design, which layer aggregates the access-layer switches and is the usual boundary between Layer 2 and Layer 3, where policies such as ACLs are applied?',
    opts: [
      ['Distribution', 'Correct. Distribution aggregates access switches and enforces policy.'],
      ['Core', 'The core provides fast, reliable transport between distribution blocks and avoids complex policy.'],
      ['Access', 'The access layer connects end devices and applies port-level features.'],
      ['WAN edge', 'The WAN edge connects the campus to remote sites and providers.'],
    ],
    ans: 'a',
    exp: '- **Access**: connects users and devices; port security, PoE, VLAN assignment.\n- **Distribution**: aggregates access switches; Layer 2/3 boundary, inter-VLAN routing, ACLs, QoS policy, FHRP.\n- **Core**: high-speed, highly available backbone between distribution blocks; keep it simple and fast.',
  },
  {
    id: 'B1-04', exam: 'B', obj: '1.2', type: 'single',
    q: 'Which cloud service model gives the customer a complete application, with the provider managing the infrastructure, operating system and the application itself?',
    opts: [
      ['Software as a Service (SaaS)', 'Correct. Examples include web email and hosted CRM.'],
      ['Platform as a Service (PaaS)', 'With PaaS the customer still develops and manages their own applications.'],
      ['Infrastructure as a Service (IaaS)', 'With IaaS the customer manages the OS and everything above it.'],
      ['On-premises hosting', 'On-premises means the organisation runs everything itself.'],
    ],
    ans: 'a',
    exp: 'NIST service models: **IaaS**: provider supplies compute, storage and network and the customer manages the OS up. **PaaS**: the provider also manages the OS and runtime and the customer deploys code. **SaaS**: the provider delivers the finished application and the customer only uses it.',
  },
  {
    id: 'B1-05', exam: 'B', obj: '1.3', type: 'single',
    q: 'Which statement about multimode fibre is true?',
    opts: [
      ['It has a larger core than single-mode fibre and supports shorter distances.', 'Correct. Multiple light modes reflect within the larger core, causing modal dispersion.'],
      ['It uses only lasers and supports distances over 40 km.', 'That describes single-mode fibre with long-reach optics.'],
      ['It is immune to distance limits because light does not attenuate.', 'All fibre has distance limits caused by attenuation and dispersion.'],
      ['It uses RJ-45 connectors.', 'Fibre uses connectors such as LC and SC; RJ-45 is for copper.'],
    ],
    ans: 'a',
    exp: '**Multimode fibre (MMF)** has a 50 or 62.5 µm core. Light travels along many paths (modes), which arrive at slightly different times (**modal dispersion**), so reach is limited to hundreds of metres. It uses cheaper LED or VCSEL transmitters and suits links within a building or campus. **Single-mode** (≈9 µm core, laser) reaches kilometres.',
  },
  {
    id: 'B1-06', exam: 'B', obj: '1.3', type: 'single',
    q: 'Which statement describes Ethernet on a shared medium, such as a hub-based network, compared with a point-to-point switched link?',
    opts: [
      ['Devices share one collision domain, operate in half duplex and use CSMA/CD.', 'Correct. Only one device can transmit at a time on a shared medium.'],
      ['Each device has a dedicated collision domain and can run full duplex.', 'That describes switched point-to-point links.'],
      ['Collisions cannot occur because frames are tagged.', 'Tagging (802.1Q) is unrelated to collisions.'],
      ['Shared media always use fibre.', 'Hubs and early shared Ethernet used copper or coax.'],
    ],
    ans: 'a',
    exp: 'On a **shared** segment (hub or coax), all devices are in one **collision domain** and must use **half duplex** with **CSMA/CD** to detect collisions and back off. Each switch port, by contrast, is its own collision domain; a point-to-point link between two devices can run **full duplex**, where collisions cannot occur and CSMA/CD is disabled.',
  },
  {
    id: 'B1-07', exam: 'B', obj: '1.5', type: 'single',
    q: 'Which TCP mechanism lets a receiver control how much data a sender may transmit before it must wait for an acknowledgement?',
    opts: [
      ['The window size', 'Correct. The advertised window provides flow control.'],
      ['The sequence number', 'Sequence numbers order and identify data; they do not limit the rate.'],
      ['The checksum', 'The checksum detects corruption.'],
      ['The urgent pointer', 'The urgent pointer marks urgent data and is rarely used.'],
    ],
    ans: 'a',
    exp: 'TCP **flow control** uses the receiver\'s advertised **window**: the number of bytes the sender may have unacknowledged in flight. If the receiver\'s buffer fills, it shrinks the window (even to zero). The window also grows over time to use available bandwidth (sliding window).',
  },
  {
    id: 'B1-08', exam: 'B', obj: '1.5', type: 'multi',
    q: 'Which two applications normally use UDP as their transport?',
    opts: [
      ['DNS queries', 'Correct. Standard DNS queries use UDP port 53 (TCP is used for large responses and zone transfers).'],
      ['TFTP', 'Correct. TFTP uses UDP port 69 and does its own simple acknowledgements.'],
      ['SSH', 'SSH uses TCP port 22.'],
      ['HTTP', 'HTTP/1.1 and HTTP/2 use TCP port 80/443.'],
      ['SMTP', 'SMTP uses TCP port 25.'],
    ],
    ans: 'a,b',
    exp: 'UDP suits short request/response exchanges and real-time traffic: **DNS** (53), **DHCP** (67/68), **TFTP** (69), **NTP** (123), **SNMP** (161/162), **syslog** (514) and RTP voice/video. Applications that need guaranteed delivery and ordering, such as SSH, HTTP(S), SMTP and FTP, use TCP.',
  },
  {
    id: 'B1-09', exam: 'B', obj: '1.6', type: 'single',
    q: 'An administrator needs at least six subnets from 192.168.1.0/24, each as large as possible. Which mask should be used?',
    opts: [
      ['255.255.255.224', 'Correct. Borrowing 3 bits gives 8 subnets of 30 hosts each.'],
      ['255.255.255.192', 'Borrowing 2 bits gives only 4 subnets.'],
      ['255.255.255.240', 'This gives 16 subnets but only 14 hosts each, so they are smaller than necessary.'],
      ['255.255.255.248', 'This gives 32 subnets of only 6 hosts.'],
    ],
    ans: 'a',
    exp: 'Subnets = 2ⁿ for *n* borrowed bits: 2² = 4 is too few, **2³ = 8** ≥ 6. Borrowing 3 bits from the /24 gives **/27 = 255.255.255.224** and 5 host bits = 30 usable hosts per subnet. Borrowing more bits would create more but smaller subnets.',
  },
  {
    id: 'B1-10', exam: 'B', obj: '1.6', type: 'single',
    q: 'Which address is a valid host address in the subnet **10.10.64.0/18**?',
    opts: [
      ['10.10.127.254', 'Correct. 10.10.64.0/18 spans 10.10.64.0–10.10.127.255.'],
      ['10.10.128.1', 'This is in the next /18 subnet (10.10.128.0).'],
      ['10.10.63.255', 'This is the broadcast of the previous subnet.'],
      ['10.10.127.255', 'This is the broadcast address of 10.10.64.0/18.'],
    ],
    ans: 'a',
    exp: '/18 = 255.255.**192**.0, block size **64** in the third octet: 10.10.0.0, 10.10.64.0, 10.10.128.0, 10.10.192.0. So 10.10.64.0/18 runs from 10.10.64.0 (network) to 10.10.127.255 (broadcast). Usable hosts are 10.10.64.1–10.10.127.254.',
  },
  {
    id: 'B1-11', exam: 'B', obj: '1.6', type: 'single',
    q: 'Host A is 192.168.1.66/26 and host B is 192.168.1.130/26. Both are connected to the same switch in the same VLAN. Can they communicate directly?',
    opts: [
      ['No. They are in different subnets, so traffic must be routed.', 'Correct. A is in .64/26 and B is in .128/26.'],
      ['Yes, because they are in the same VLAN.', 'Being in the same VLAN does not put them in the same IP subnet; each host will try to send off-subnet traffic to its gateway.'],
      ['Yes, because both use a /26 mask.', 'The same mask does not mean the same subnet.'],
      ['No, because .130 is a broadcast address.', 'The broadcast of .128/26 is .191.'],
    ],
    ans: 'a',
    exp: 'With a block size of 64: A (.66) is in **192.168.1.64/26** and B (.130) is in **192.168.1.128/26**. Each host compares the destination with its own subnet; because it is off-subnet, it sends the packet to its **default gateway**. Without a router (and a gateway configured on each host) they cannot communicate.',
  },
  {
    id: 'B1-12', exam: 'B', obj: '1.6', type: 'single',
    q: 'An engineer configures `ip address 192.168.5.95 255.255.255.224` on a router interface and IOS rejects it. Why?',
    opts: [
      ['192.168.5.95 is the broadcast address of 192.168.5.64/27.', 'Correct. IOS refuses network and broadcast addresses ("Bad mask /27 for address").'],
      ['255.255.255.224 is not a valid subnet mask.', '/27 is a valid mask.'],
      ['192.168.5.95 is the network address of its subnet.', 'The network address is .64.'],
      ['Router interfaces cannot use /27 masks.', 'Any valid mask can be used.'],
    ],
    ans: 'a',
    exp: '/27 has a block size of 32: .0, .32, **.64**, .96… The subnet 192.168.5.64/27 covers .64–.95, so **.95 is its broadcast address** and cannot be assigned to an interface. IOS responds with `Bad mask /27 for address 192.168.5.95`.',
  },
  {
    id: 'B1-13', exam: 'B', obj: '1.7', type: 'single',
    q: 'Why can a company not simply advertise its internal 10.0.0.0/8 network to its Internet service provider to give hosts Internet access?',
    opts: [
      ['RFC 1918 addresses are not routable on the Internet, so the hosts need NAT to a public address.', 'Correct. ISPs filter private prefixes and many organisations reuse the same ranges.'],
      ['10.0.0.0/8 is reserved for loopback addresses.', 'Loopback is 127.0.0.0/8.'],
      ['The 10.0.0.0/8 range is too large for any routing table.', 'Prefix size is not the issue.'],
      ['Private addresses only work with IPv6.', 'RFC 1918 defines IPv4 private ranges.'],
    ],
    ans: 'a',
    exp: 'Private ranges (10/8, 172.16/12, 192.168/16) can be used by any organisation, so they are not globally unique and providers do not route them. To reach the Internet, the edge device translates inside private addresses to public ones with **NAT/PAT**.',
  },
  {
    id: 'B1-14', exam: 'B', obj: '1.8', type: 'single',
    q: 'An organisation receives the IPv6 prefix 2001:db8:abcd::/48 and uses /64 subnets. How many subnets are available?',
    opts: [
      ['65,536', 'Correct. 64 − 48 = 16 subnet bits; 2¹⁶ = 65,536.'],
      ['256', 'That would be 8 subnet bits (/56 subnets of a /48).'],
      ['16', '16 is the number of subnet bits, not the number of subnets.'],
      ['4,096', 'That would be 12 subnet bits.'],
    ],
    ans: 'a',
    exp: 'The subnet ID is the bits between the routing prefix and the interface ID: /48 to /64 leaves **16 bits**, so 2¹⁶ = **65,536** /64 subnets (the fourth hextet: 2001:db8:abcd:**0000**::/64 through 2001:db8:abcd:**ffff**::/64).',
  },
  {
    id: 'B1-15', exam: 'B', obj: '1.9', type: 'single',
    q: 'Which statement describes an IPv6 **anycast** address?',
    opts: [
      ['The same unicast address is assigned to several devices, and packets are delivered to the nearest one according to routing.', 'Correct. Anycast is configured like unicast on multiple nodes.'],
      ['It delivers a packet to every device in a group.', 'That is multicast.'],
      ['It replaces the IPv4 broadcast address.', 'IPv6 has no broadcast; multicast (for example FF02::1) fills that role.'],
      ['It is always an FF00::/8 address.', 'FF00::/8 is multicast.'],
    ],
    ans: 'a',
    exp: 'An **anycast** address is taken from unicast space and configured on more than one device (for example DNS resolvers in several locations). Routing delivers each packet to the **topologically nearest** instance. IPv6 has unicast, multicast and anycast, but no broadcast.',
  },
  {
    id: 'B1-16', exam: 'B', obj: '1.9', type: 'single',
    q: 'To which address does an IPv6 host send a Router Solicitation message?',
    opts: [
      ['FF02::2', 'Correct. FF02::2 is the all-routers link-local multicast group.'],
      ['FF02::1', 'FF02::1 is all nodes; routers send unsolicited Router Advertisements there.'],
      ['FE80::1', 'This is a link-local unicast address that may or may not belong to a router.'],
      ['FF02::1:FF00:0/104', 'That is the solicited-node multicast range used for neighbour discovery.'],
    ],
    ans: 'a',
    exp: 'NDP messages: a host sends a **Router Solicitation (RS)** to **FF02::2** (all routers). Routers answer with a **Router Advertisement (RA)**, and also send RAs periodically to **FF02::1** (all nodes). RAs carry the prefix and default gateway used by SLAAC.',
  },
  {
    id: 'B1-17', exam: 'B', obj: '1.10', type: 'multi',
    q: 'Which two commands display the IPv4 address configured on a Linux host?',
    opts: [
      ['ip addr show', 'Correct. The modern iproute2 command.'],
      ['ifconfig', 'Correct. The older net-tools command, still available on many systems and on macOS.'],
      ['ipconfig /all', 'This is the Windows command.'],
      ['show ip interface brief', 'This is a Cisco IOS command.'],
      ['netstat -r', 'This shows the routing table, not the interface addresses.'],
    ],
    ans: 'a,b',
    exp: 'Verifying client IP settings: **Windows**: `ipconfig` / `ipconfig /all`. **Linux**: `ip addr` (or `ifconfig`), `ip route` for the default gateway, and `/etc/resolv.conf` or `resolvectl` for DNS. **macOS**: `ifconfig`, `netstat -rn`, or the Network settings panel.',
  },
  {
    id: 'B1-18', exam: 'B', obj: '1.11', type: 'single',
    q: 'What does the **BSSID** identify in an 802.11 network?',
    opts: [
      ['The MAC address of the AP radio that serves a basic service set', 'Correct. Each SSID on each radio has its own BSSID.'],
      ['The human-readable name of the wireless network', 'That is the SSID.'],
      ['The channel the AP is using', 'The channel is advertised separately in beacons.'],
      ['The encryption key used on the WLAN', 'Keys are never identified by the BSSID.'],
    ],
    ans: 'a',
    exp: 'A **BSS** is one AP and its associated clients. The **SSID** is the network name (which can span many APs, forming an ESS), while the **BSSID** is the AP radio\'s MAC address that uniquely identifies each BSS. Clients use BSSIDs when roaming between APs advertising the same SSID.',
  },
  {
    id: 'B1-19', exam: 'B', obj: '1.12', type: 'single',
    q: 'What does a VRF (Virtual Routing and Forwarding) instance provide on a router?',
    opts: [
      ['A separate routing table, so overlapping IP ranges can coexist on one router', 'Correct. Interfaces are assigned to VRFs, each with its own routing and forwarding tables.'],
      ['A separate VLAN database for each customer', 'VLANs are a Layer 2 concept; VRFs separate Layer 3 routing.'],
      ['A virtual machine that runs IOS', 'That would be a virtual router image, not a VRF.'],
      ['Encryption between routers', 'VRFs separate routing but do not encrypt traffic.'],
    ],
    ans: 'a',
    exp: 'A **VRF** is Layer 3 virtualisation: one physical router hosts several independent routing tables. Interfaces belong to exactly one VRF, so customers or departments can reuse the same address space without seeing each other\'s routes. VRF-lite is common in enterprises; MPLS VPNs use VRFs at service providers.',
  },

  // ================================================================ Exam C
  {
    id: 'C1-01', exam: 'C', obj: '1.1', type: 'single',
    q: 'What is the main difference between an IPS and an IDS?',
    opts: [
      ['An IPS is deployed inline and can drop malicious traffic, while an IDS monitors a copy of traffic and only alerts.', 'Correct.'],
      ['An IDS encrypts traffic, while an IPS decrypts it.', 'Neither device\'s purpose is encryption.'],
      ['An IPS works only on wireless networks.', 'IPS sensors protect wired and wireless networks.'],
      ['An IDS can block traffic, while an IPS only logs it.', 'This is the reverse.'],
    ],
    ans: 'a',
    exp: 'An **IDS** receives a copy of traffic (SPAN or TAP), compares it with signatures or behaviour and raises alerts, but the attack packets still reach their target. An **IPS** sits **inline**, so it can drop or reset malicious flows in real time. The trade-off is that an inline device can add latency or become a point of failure.',
  },
  {
    id: 'C1-02', exam: 'C', obj: '1.1', type: 'single',
    q: 'Which network component provides centralised, intent-based management, automation and assurance for a Cisco campus network?',
    opts: [
      ['Cisco Catalyst Center (formerly DNA Center)', 'Correct. It is the campus SDN controller and management platform.'],
      ['A Layer 2 access switch', 'Access switches are managed devices, not the management platform.'],
      ['An autonomous access point', 'Autonomous APs are configured individually.'],
      ['A TFTP server', 'TFTP only transfers files.'],
    ],
    ans: 'a',
    exp: '**Catalyst Center** (DNA Center) is the controller for Cisco\'s intent-based networking: it provisions devices from templates and policy, automates software image management and provides **assurance** (telemetry, health scores and guided troubleshooting). Applications talk to it through its northbound REST API.',
  },
  {
    id: 'C1-03', exam: 'C', obj: '1.2', type: 'single',
    q: 'Which WAN topology provides the highest redundancy but also the highest cost and complexity as sites are added?',
    opts: [
      ['Full mesh', 'Correct. Every site connects to every other site: n(n − 1)/2 links.'],
      ['Hub and spoke', 'Hub-and-spoke is cheaper but the hub is a single point of failure.'],
      ['Point-to-point', 'A single point-to-point link has no redundancy.'],
      ['Partial mesh', 'Partial mesh is a compromise between cost and redundancy.'],
    ],
    ans: 'a',
    exp: 'In a **full mesh**, every site has a direct connection to every other site, so any single link failure is survivable and traffic takes the most direct path. The number of links grows with n(n − 1)/2: 10 sites already need 45 links. **Hub-and-spoke** needs only n − 1 links but relies on the hub; a **partial mesh** adds direct links only where they are needed.',
  },
  {
    id: 'C1-04', exam: 'C', obj: '1.2', type: 'single',
    q: 'Why is a spine-leaf topology well suited to modern data centres?',
    opts: [
      ['Traffic between any two leaves crosses the same number of hops, giving consistent latency for east-west traffic.', 'Correct. Leaf → spine → leaf for every pair.'],
      ['It relies on spanning tree to block redundant paths.', 'Spine-leaf fabrics use routed links and ECMP so that all paths are active.'],
      ['Servers connect to the spine for maximum bandwidth.', 'Servers connect to leaves.'],
      ['It removes the need for redundant links.', 'Every leaf has several spine uplinks for redundancy.'],
    ],
    ans: 'a',
    exp: 'Data centres have heavy **east-west** traffic between servers. In spine-leaf, any leaf reaches any other leaf through one spine, so latency is predictable. Multiple equal-cost paths are used at the same time (ECMP), and capacity scales out by adding spines or leaves.',
  },
  {
    id: 'C1-05', exam: 'C', obj: '1.3', type: 'multi',
    q: 'Which two statements about 1000BASE-T are true?',
    opts: [
      ['It uses all four wire pairs of the cable.', 'Correct. Gigabit over copper transmits on all four pairs in both directions.'],
      ['It supports a maximum segment length of 100 metres.', 'Correct. The standard UTP limit.'],
      ['It requires single-mode fibre.', '1000BASE-T is copper; 1000BASE-LX is a fibre standard.'],
      ['It uses only two pairs, like 100BASE-TX.', '100BASE-TX uses two pairs; 1000BASE-T uses four.'],
      ['It requires Category 3 cabling.', 'Category 5e or better is required.'],
    ],
    ans: 'a,b',
    exp: '**1000BASE-T** runs Gigabit Ethernet over Cat5e or better UTP, uses **all four pairs** simultaneously in both directions, and is limited to **100 m**. By contrast, 10BASE-T and 100BASE-TX use two pairs (1-2 and 3-6).',
  },
  {
    id: 'C1-06', exam: 'C', obj: '1.4', type: 'single',
    q: 'Two switches have their connecting ports hard-coded to different speeds: one to 100 Mb/s and the other to 10 Mb/s. What is the result?',
    opts: [
      ['The link does not come up.', 'Correct. Mismatched fixed speeds cannot communicate; both ports show down/down (notconnect).'],
      ['The link comes up at 10 Mb/s.', 'Only autonegotiation or speed sensing could agree a common speed; both ends are fixed and different.'],
      ['The link comes up with late collisions.', 'Late collisions are the symptom of a duplex mismatch.'],
      ['The link comes up but drops all broadcasts.', 'The link does not come up at all.'],
    ],
    ans: 'a',
    exp: 'Speed is a physical-layer property: the signalling at 10 Mb/s and 100 Mb/s is different, so the ports cannot establish a link and both show **down/down** (`notconnect`). A **duplex** mismatch is different: the link comes up but performs badly, with late collisions on the half-duplex side and CRC errors and runts on the full-duplex side.',
  },
  {
    id: 'C1-07', exam: 'C', obj: '1.5', type: 'order',
    q: 'Put the steps of a TCP session between a client and a server in the correct order.',
    items: [
      ['s1', 'Client sends a segment with the SYN flag set'],
      ['s2', 'Server replies with SYN and ACK set'],
      ['s3', 'Client sends an ACK'],
      ['s4', 'Data is exchanged and acknowledged using sequence and acknowledgement numbers'],
      ['s5', 'One side sends a segment with the FIN flag to begin closing the session'],
    ],
    exp: 'TCP opens a connection with the **three-way handshake** (SYN → SYN-ACK → ACK), which synchronises the initial sequence numbers in both directions. Data then flows with sequence/acknowledgement numbers and windowing. A connection is closed gracefully with **FIN** and ACK in each direction (or aborted with RST).',
  },
  {
    id: 'C1-08', exam: 'C', obj: '1.6', type: 'single',
    q: 'What is the subnet address for host **10.45.172.18/13**?',
    opts: [
      ['10.40.0.0', 'Correct. /13 = 255.248.0.0, block size 8 in the second octet; 45 falls in 40–47.'],
      ['10.45.0.0', 'This would be correct for a /16.'],
      ['10.32.0.0', 'This would be correct for a /11 (block size 32).'],
      ['10.45.168.0', 'This applies the mask to the wrong octet.'],
    ],
    ans: 'a',
    exp: '/13 = 8 + 5 bits, so the mask is 255.**248**.0.0 and the interesting octet is the second, with block size 256 − 248 = **8**: 0, 8, 16, 24, 32, **40**, 48… Since 45 is between 40 and 47, the subnet is **10.40.0.0/13** (10.40.0.0–10.47.255.255).',
  },
  {
    id: 'C1-09', exam: 'C', obj: '1.6', type: 'single',
    q: 'The network 172.16.0.0/16 is divided into /21 subnets. How many subnets are created, and how many usable hosts does each support?',
    opts: [
      ['32 subnets with 2046 hosts each', 'Correct. 5 subnet bits and 11 host bits.'],
      ['21 subnets with 2048 hosts each', 'The prefix length is not the subnet count, and two addresses per subnet are reserved.'],
      ['64 subnets with 1022 hosts each', 'That is /22.'],
      ['16 subnets with 4094 hosts each', 'That is /20.'],
    ],
    ans: 'a',
    exp: 'From /16 to /21 borrows **5** bits → 2⁵ = **32** subnets. Host bits = 32 − 21 = **11** → 2¹¹ − 2 = **2046** usable addresses per subnet. Each subnet steps by 8 in the third octet (172.16.0.0, 172.16.8.0, 172.16.16.0…).',
  },
  {
    id: 'C1-10', exam: 'C', obj: '1.6', type: 'single',
    q: 'Which prefix length provides exactly 14 usable host addresses per subnet?',
    opts: [
      ['/28', 'Correct. 4 host bits: 2⁴ − 2 = 14.'],
      ['/27', '/27 provides 30 hosts.'],
      ['/29', '/29 provides 6 hosts.'],
      ['/26', '/26 provides 62 hosts.'],
    ],
    ans: 'a',
    exp: 'Usable hosts = 2ʰ − 2. For h = 4: 16 − 2 = **14**, so 32 − 4 = **/28** (255.255.255.240). Memorise the series: /30 = 2, /29 = 6, /28 = 14, /27 = 30, /26 = 62, /25 = 126, /24 = 254.',
  },
  {
    id: 'C1-11', exam: 'C', obj: '1.6', type: 'single',
    q: 'Which is a usable host address in the same subnet as the router interface shown?',
    ex: [{ kind: 'cli', title: 'R1#show running-config interface g0/1', text: `interface GigabitEthernet0/1
 ip address 172.16.10.17 255.255.255.240
 duplex auto
 speed auto` }],
    opts: [
      ['172.16.10.30', 'Correct. 172.16.10.16/28 has hosts .17–.30.'],
      ['172.16.10.31', 'This is the broadcast address of 172.16.10.16/28.'],
      ['172.16.10.32', 'This is the next subnet.'],
      ['172.16.10.15', 'This belongs to the previous subnet (.0/28).'],
    ],
    ans: 'a',
    exp: '255.255.255.240 = /28, block size 16: .0, **.16**, .32… The interface .17 is in 172.16.10.16/28, so usable hosts are **.17–.30**, with .31 as the broadcast.',
  },
  {
    id: 'C1-12', exam: 'C', obj: '1.7', type: 'single',
    q: 'Which range is the RFC 1918 private block that was originally carved from the class B space?',
    opts: [
      ['172.16.0.0 – 172.31.255.255', 'Correct. 172.16.0.0/12, sixteen contiguous class B networks.'],
      ['172.16.0.0 – 172.16.255.255', 'This is only one /16 of the private 172.16.0.0/12 block.'],
      ['169.254.0.0 – 169.254.255.255', 'This is link-local (APIPA) space.'],
      ['192.168.0.0 – 192.168.255.255', 'This is the private block from class C space.'],
    ],
    ans: 'a',
    exp: 'RFC 1918: **10.0.0.0/8** (one class A), **172.16.0.0/12** (172.16–172.31, sixteen class Bs) and **192.168.0.0/16** (256 class Cs). A common exam trap is to assume 172.32.x.x or 172.15.x.x is private; neither is.',
  },
  {
    id: 'C1-13', exam: 'C', obj: '1.8', type: 'single',
    q: 'Which IPv6 method lets a host create its own global unicast address from the prefix in Router Advertisements, without a stateful DHCPv6 server?',
    opts: [
      ['SLAAC (stateless address autoconfiguration)', 'Correct. The host combines the advertised /64 prefix with its own interface ID.'],
      ['Stateful DHCPv6', 'Stateful DHCPv6 assigns and tracks addresses.'],
      ['APIPA', 'APIPA is the IPv4 169.254.0.0/16 fallback.'],
      ['NAT64', 'NAT64 translates between IPv6 and IPv4.'],
    ],
    ans: 'a',
    exp: 'With **SLAAC**, a router sends RAs with a /64 prefix and the host builds the interface ID itself (EUI-64 or random/privacy), running duplicate address detection. **Stateless DHCPv6** can add options such as DNS servers. With **stateful DHCPv6**, a server assigns the address. The RA M and O flags tell hosts which method to use.',
  },
  {
    id: 'C1-14', exam: 'C', obj: '1.8', type: 'single',
    q: 'An engineer must address router interface G0/0 with 2001:db8:a:1::1/64 and make the router forward IPv6 packets. Which configuration is required?',
    opts: [
      ['`ipv6 unicast-routing` globally, then `ipv6 address 2001:db8:a:1::1/64` under the interface', 'Correct.'],
      ['`ipv6 address 2001:db8:a:1::1 255.255.255.0` under the interface', 'IPv6 uses prefix-length notation, not dotted masks.'],
      ['`ip address 2001:db8:a:1::1/64` under the interface', 'The ip address command is for IPv4.'],
      ['`ipv6 enable` only', 'ipv6 enable creates a link-local address only and does not enable routing.'],
    ],
    ans: 'a',
    exp: 'IOS forwards IPv6 between interfaces only after **`ipv6 unicast-routing`** is enabled globally. Addresses use `ipv6 address <prefix>/<length>` (add `eui-64` to generate the interface ID). Configuring any IPv6 address also creates a link-local address automatically.',
  },
  {
    id: 'C1-15', exam: 'C', obj: '1.9', type: 'single',
    q: 'Which prefix identifies IPv6 unique local addresses (ULAs)?',
    opts: [
      ['FC00::/7', 'Correct. In practice addresses start with FD (FD00::/8, locally assigned).'],
      ['FE80::/10', 'This is link-local.'],
      ['2000::/3', 'This is the global unicast range.'],
      ['FF00::/8', 'This is multicast.'],
    ],
    ans: 'a',
    exp: '**Unique local** addresses (RFC 4193) come from **FC00::/7**. The L bit set to 1 gives **FD00::/8**, followed by a randomly generated 40-bit global ID. ULAs are routable within an organisation but not on the Internet, similar to RFC 1918 addresses in IPv4.',
  },
  {
    id: 'C1-16', exam: 'C', obj: '1.10', type: 'single',
    q: 'A user can reach devices on their own subnet but nothing else. What is the cause?',
    ex: [{ kind: 'cli', title: 'C:\\> ipconfig', text: `Ethernet adapter Ethernet0:

   Connection-specific DNS Suffix  . : corp.local
   IPv4 Address. . . . . . . . . . . : 10.20.30.45
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . :` }],
    opts: [
      ['The host has no default gateway configured.', 'Correct. Off-subnet traffic has nowhere to go.'],
      ['The subnet mask is wrong.', '/24 is consistent with the address and local connectivity works.'],
      ['The host has an APIPA address.', '10.20.30.45 is not a 169.254.x.x address.'],
      ['The DNS suffix is incorrect.', 'A DNS suffix does not affect IP routing.'],
    ],
    ans: 'a',
    exp: 'For a destination outside its subnet, a host sends the packet to its **default gateway**. An empty gateway field means the host can only reach its own subnet. Fix the DHCP option (`default-router` on an IOS DHCP pool) or the static configuration.',
  },
  {
    id: 'C1-17', exam: 'C', obj: '1.11', type: 'single',
    q: 'Which statement about the 5-GHz band, compared with 2.4 GHz, is true?',
    opts: [
      ['It offers many more non-overlapping channels but has a shorter range for the same power.', 'Correct. Higher frequencies are absorbed more by obstacles.'],
      ['It has only three non-overlapping channels.', 'That is 2.4 GHz.'],
      ['It penetrates walls better than 2.4 GHz.', '2.4 GHz penetrates obstacles better.'],
      ['It suffers more interference from microwave ovens and Bluetooth.', 'Those mainly interfere with 2.4 GHz.'],
    ],
    ans: 'a',
    exp: '**5 GHz** has many more 20-MHz channels that do not overlap, which allows denser AP deployments and channel bonding, and it is less congested. Its higher frequency is attenuated more by walls, so cells are smaller. **2.4 GHz** has longer reach but only three non-overlapping channels and suffers interference from microwaves, Bluetooth and similar devices.',
  },
  {
    id: 'C1-18', exam: 'C', obj: '1.12', type: 'single',
    q: 'What does a virtual switch (vSwitch) in a hypervisor do?',
    opts: [
      ['Connects VMs\' virtual NICs to each other and to the host\'s physical NICs', 'Correct.'],
      ['Routes traffic between different hypervisors over the WAN', 'A vSwitch works at Layer 2 inside one host.'],
      ['Replaces the need for physical switches in the data centre', 'Physical switches still connect the hosts.'],
      ['Provides power to virtual machines', 'VMs draw their resources from the host, not from a vSwitch.'],
    ],
    ans: 'a',
    exp: 'A **virtual switch** is software inside the hypervisor that forwards frames between VM vNICs and uplinks them through the server\'s physical NICs. It can do VLAN tagging (port groups), so the physical switch port facing a virtualisation host is normally an **802.1Q trunk**.',
  },
  {
    id: 'C1-19', exam: 'C', obj: '1.13', type: 'single',
    q: 'How does a switch build its MAC address table?',
    opts: [
      ['By recording the source MAC address and incoming port of each frame it receives', 'Correct. Learning is based on source addresses.'],
      ['By recording the destination MAC address of each frame', 'Destination addresses are looked up, not learned.'],
      ['By sending ARP requests for every host', 'Switches do not ARP to learn MAC locations.'],
      ['By exchanging MAC tables with neighbouring switches', 'There is no such protocol; each switch learns independently.'],
    ],
    ans: 'a',
    exp: 'For every frame received, the switch adds or refreshes an entry mapping the **source MAC** to the **ingress port** and VLAN. Entries age out after **300 seconds** of inactivity by default. Forwarding then uses the **destination** MAC: known → one port; unknown, broadcast or multicast → flood within the VLAN.',
  },
  {
    id: 'C1-20', exam: 'C', obj: '1.4', type: 'single',
    q: 'The output below shows an interface on R1. Where is the problem most likely to be?',
    ex: [{ kind: 'cli', title: 'R1#show interfaces serial 0/0/0', text: `Serial0/0/0 is up, line protocol is down
  Hardware is WIC MBRD Serial
  Internet address is 10.0.12.1/30
  MTU 1500 bytes, BW 1544 Kbit/sec, DLY 20000 usec,
     reliability 255/255, txload 1/255, rxload 1/255
  Encapsulation PPP, LCP Listen, loopback not set
  Keepalive set (10 sec)` }],
    opts: [
      ['A Layer 2 problem, such as an encapsulation mismatch with the neighbour', 'Correct. Up/down means the physical layer is fine but the data link protocol is not working.'],
      ['The interface is administratively shut down.', 'That would show "administratively down".'],
      ['The cable is unplugged.', 'An unplugged cable shows down/down.'],
      ['The IP address is in the wrong subnet.', 'IP addressing does not affect line protocol status.'],
    ],
    ans: 'a',
    exp: 'Read the two fields as Layer 1 / Layer 2: **up/up** works; **down/down** is a physical problem (cable, far end shut); **administratively down/down** is `shutdown`. **Up/down** means the carrier is present but the Layer 2 protocol is failing: on serial links this is typically an **encapsulation mismatch** (PPP on one side, HDLC on the other), missing clocking or failed keepalives. Here LCP is stuck in Listen.',
  },

  // ================================================================ Exam D
  {
    id: 'D1-01', exam: 'D', obj: '1.1', type: 'match',
    q: 'Drag each network component to the function it performs.',
    items: [['i1', 'Router'], ['i2', 'Layer 2 switch'], ['i3', 'Access point'], ['i4', 'Wireless LAN controller'], ['i5', 'Next-generation firewall']],
    targets: [
      ['t1', 'Forwards packets between networks using IP addresses'],
      ['t2', 'Forwards frames within a VLAN using MAC addresses'],
      ['t3', 'Bridges 802.11 clients onto the wired network'],
      ['t4', 'Centrally manages lightweight APs and their RF settings'],
      ['t5', 'Applies application-aware filtering and intrusion prevention'],
    ],
    ans: { i1: 't1', i2: 't2', i3: 't3', i4: 't4', i5: 't5' },
    exp: 'Routers work at Layer 3 between networks; switches at Layer 2 within a VLAN; APs connect wireless clients to the wired LAN; WLCs manage lightweight APs (configuration, RRM, roaming, security); NGFWs add application awareness and IPS to stateful firewalling.',
  },
  {
    id: 'D1-02', exam: 'D', obj: '1.1', type: 'single',
    q: 'What does a stateful firewall do with return traffic for a session that an inside host started?',
    opts: [
      ['It permits it automatically because it matches an entry in the connection table.', 'Correct. The firewall remembers the session and allows the replies.'],
      ['It drops it unless an explicit inbound rule permits it.', 'That describes a stateless packet filter such as a basic ACL.'],
      ['It sends it to the IPS for signature matching first in every case.', 'Inspection may happen, but statefulness is about tracking sessions.'],
      ['It translates it using PAT.', 'NAT is a separate function, even if the same device often performs it.'],
    ],
    ans: 'a',
    exp: 'A **stateful** firewall tracks each connection (addresses, ports, protocol and TCP state). Outbound traffic from a trusted zone creates a state entry, and the corresponding return traffic is allowed without an explicit inbound rule. A **stateless** ACL looks at each packet on its own, so it needs rules for both directions (or the `established` keyword for TCP).',
  },
  {
    id: 'D1-03', exam: 'D', obj: '1.2', type: 'single',
    q: 'In a hierarchical campus design, at which layer would you normally enable PoE, port security and voice VLANs?',
    opts: [
      ['Access', 'Correct. These features apply to the ports where end devices connect.'],
      ['Distribution', 'Distribution aggregates access switches and applies routing and policy.'],
      ['Core', 'The core should forward quickly with minimal features.'],
      ['Data centre spine', 'Spines interconnect leaves in a data centre fabric.'],
    ],
    ans: 'a',
    exp: 'The **access layer** is where users, phones, APs and printers connect, so port-level features live there: PoE, port security, DHCP snooping, DAI, voice VLANs, PortFast and BPDU Guard.',
  },
  {
    id: 'D1-04', exam: 'D', obj: '1.2', type: 'single',
    q: 'Which statement describes a hybrid cloud deployment?',
    opts: [
      ['Workloads run in both the organisation\'s own data centre and a public cloud, connected so they can interoperate.', 'Correct.'],
      ['Several organisations share one private cloud.', 'That is a community cloud.'],
      ['All servers are hosted by one public cloud provider.', 'That is a public cloud deployment.'],
      ['Virtual machines and containers run on the same host.', 'This describes mixed virtualisation, not a cloud deployment model.'],
    ],
    ans: 'a',
    exp: 'Deployment models: **public** (provider infrastructure shared by many customers), **private** (dedicated to one organisation, on or off premises), **community** (shared by organisations with common needs), and **hybrid**, which combines on-premises/private resources with public cloud and connects them, typically with VPNs or dedicated links.',
  },
  {
    id: 'D1-05', exam: 'D', obj: '1.3', type: 'single',
    q: 'Which copper cabling category is required to run 10GBASE-T over the full 100-metre distance?',
    opts: [
      ['Category 6a', 'Correct. Cat6a is specified for 10 Gb/s up to 100 m.'],
      ['Category 6', 'Cat6 supports 10GBASE-T only up to about 55 m.'],
      ['Category 5e', 'Cat5e is specified for 1000BASE-T.'],
      ['Category 3', 'Cat3 was used for 10BASE-T and telephony.'],
    ],
    ans: 'a',
    exp: 'UTP categories: Cat5e → 1 Gb/s at 100 m; Cat6 → 1 Gb/s at 100 m and 10 Gb/s to about 55 m; **Cat6a** → **10 Gb/s at 100 m** (better crosstalk performance at 500 MHz).',
  },
  {
    id: 'D1-06', exam: 'D', obj: '1.4', type: 'multi',
    q: 'A switch port shows **notconnect** even though a cable is plugged in and the device at the other end is powered on. Which two problems could cause this?',
    opts: [
      ['A faulty or incorrectly wired cable', 'Correct. Without a working physical path there is no link.'],
      ['Both ends hard-coded to different speeds', 'Correct. Mismatched fixed speeds prevent link establishment.'],
      ['A duplex mismatch', 'A duplex mismatch still lets the link come up (connected), with errors.'],
      ['The port assigned to the wrong VLAN', 'VLAN membership does not affect the physical link state.'],
      ['A missing default gateway on the attached PC', 'Gateway settings are irrelevant to link state.'],
    ],
    ans: 'a,b',
    exp: '`notconnect` (down/down) is a Layer 1 problem: bad or wrong cable, a dead transceiver, the far end shut down or powered off, or a **speed mismatch** between hard-coded ports. A duplex mismatch and VLAN problems happen with the link **up**.',
  },
  {
    id: 'D1-07', exam: 'D', obj: '1.5', type: 'single',
    q: 'Which TCP header field lets the receiver put segments back in the correct order?',
    opts: [
      ['Sequence number', 'Correct. It numbers the first byte of data in each segment.'],
      ['Window size', 'The window controls the flow rate.'],
      ['Source port', 'Ports identify the application session.'],
      ['Checksum', 'The checksum detects corruption.'],
    ],
    ans: 'a',
    exp: 'Every TCP segment carries a **sequence number** for its first data byte. The receiver uses these numbers to reorder segments that arrive out of order, discard duplicates and detect gaps, and acknowledges with the next byte it expects (the acknowledgement number).',
  },
  {
    id: 'D1-08', exam: 'D', obj: '1.5', type: 'multi',
    q: 'Which two protocols use TCP?',
    opts: [
      ['SSH', 'Correct. TCP port 22.'],
      ['BGP', 'Correct. TCP port 179.'],
      ['SNMP', 'SNMP uses UDP 161 (and 162 for traps).'],
      ['DHCP', 'DHCP uses UDP 67/68.'],
      ['TFTP', 'TFTP uses UDP 69.'],
    ],
    ans: 'a,b',
    exp: 'Common TCP ports: FTP 20/21, **SSH 22**, Telnet 23, SMTP 25, HTTP 80, POP3 110, HTTPS 443, **BGP 179**. UDP: DHCP 67/68, TFTP 69, NTP 123, SNMP 161/162, syslog 514. DNS uses both (UDP 53 for queries, TCP 53 for zone transfers and large responses).',
  },
  {
    id: 'D1-09', exam: 'D', obj: '1.6', type: 'single',
    q: 'What is the broadcast address for **192.168.100.0/22**?',
    opts: [
      ['192.168.103.255', 'Correct. /22 spans four /24s: 192.168.100.0–192.168.103.255.'],
      ['192.168.100.255', 'This is the broadcast of a /24.'],
      ['192.168.101.255', 'This is the broadcast of a /23.'],
      ['192.168.255.255', 'This is the broadcast of 192.168.0.0/16.'],
    ],
    ans: 'a',
    exp: '/22 = 255.255.**252**.0, block size **4** in the third octet. 100 is a multiple of 4, so the subnet is 192.168.100.0/22 and it ends just before 192.168.104.0: broadcast **192.168.103.255**.',
  },
  {
    id: 'D1-10', exam: 'D', obj: '1.6', type: 'single',
    q: 'Which prefix length supports exactly two hosts on a point-to-point link without wasting network or broadcast addresses?',
    opts: [
      ['/31', 'Correct. RFC 3021 lets point-to-point links use both addresses of a /31.'],
      ['/30', '/30 gives two usable hosts but uses four addresses (network and broadcast are wasted).'],
      ['/32', '/32 is a single host address, used for loopbacks.'],
      ['/29', '/29 gives six hosts.'],
    ],
    ans: 'a',
    exp: 'A /30 is the traditional choice for point-to-point links (4 addresses, 2 usable). **RFC 3021** allows **/31** on point-to-point links: with only two devices there is no need for network or broadcast addresses, so both are usable. IOS supports /31 on point-to-point interfaces.',
  },
  {
    id: 'D1-11', exam: 'D', obj: '1.6', type: 'single',
    q: 'To which subnet does host **172.20.99.33/19** belong?',
    opts: [
      ['172.20.96.0/19', 'Correct. /19 has a block size of 32 in the third octet; 99 falls in 96–127.'],
      ['172.20.99.0/19', 'A /19 subnet cannot start at 99 in the third octet.'],
      ['172.20.64.0/19', 'That subnet covers 64–95.'],
      ['172.20.99.32/19', 'This mixes /27 thinking with a /19 mask.'],
    ],
    ans: 'a',
    exp: '/19 = 255.255.**224**.0; block size 256 − 224 = **32** in the third octet: 0, 32, 64, **96**, 128… Since 96 ≤ 99 < 128, the subnet is **172.20.96.0/19** (172.20.96.0–172.20.127.255).',
  },
  {
    id: 'D1-12', exam: 'D', obj: '1.6', type: 'multi',
    q: 'Which two addresses can be assigned to hosts in **10.1.1.0/29**?',
    opts: [
      ['10.1.1.6', 'Correct. Usable hosts are .1–.6.'],
      ['10.1.1.1', 'Correct.'],
      ['10.1.1.7', 'This is the broadcast address.'],
      ['10.1.1.8', 'This is the network address of the next /29.'],
      ['10.1.1.0', 'This is the network address.'],
    ],
    ans: 'a,b',
    exp: '/29 = block size 8: 10.1.1.0 (network), .1–.6 (hosts), .7 (broadcast). The next subnet starts at .8.',
  },
  {
    id: 'D1-13', exam: 'D', obj: '1.7', type: 'single',
    q: 'An organisation uses 10.0.0.0/8 internally. Which statement is true?',
    opts: [
      ['Other organisations may use the same range, and NAT is required to reach the Internet.', 'Correct.'],
      ['The organisation must register the range with a regional Internet registry.', 'Private ranges need no registration.'],
      ['Internet routers will route the range back to the organisation.', 'Private ranges are filtered on the Internet.'],
      ['The range can only be used with /8 masks.', 'Private ranges can be subnetted any way you like.'],
    ],
    ans: 'a',
    exp: 'RFC 1918 space is free for anyone to use internally, and many organisations use the same ranges, so it cannot be routed globally. Edge devices translate to public addresses with NAT/PAT. Overlapping private ranges become an issue when merging companies or building site-to-site VPNs.',
  },
  {
    id: 'D1-14', exam: 'D', obj: '1.9', type: 'single',
    q: 'What is the solicited-node multicast address for the unicast address **2001:db8::1:2345:6789**?',
    opts: [
      ['FF02::1:FF45:6789', 'Correct. FF02::1:FF00:0/104 plus the low-order 24 bits of the address.'],
      ['FF02::1:FF23:4567', 'These are not the last 24 bits.'],
      ['FF02::2345:6789', 'The format is FF02::1:FFxx:xxxx.'],
      ['FF02::1', 'This is the all-nodes address.'],
    ],
    ans: 'a',
    exp: 'Each unicast address joins the **solicited-node** group **FF02::1:FF00:0/104 + the last 24 bits** of the address. The last 24 bits of …:2345:**6789** are 45:6789, giving **FF02::1:FF45:6789**. Neighbour Solicitations (the IPv6 replacement for ARP) are sent to this group, so only a few hosts must process them.',
  },
  {
    id: 'D1-15', exam: 'D', obj: '1.9', type: 'single',
    q: 'Which statement about IPv6 link-local addresses is true?',
    opts: [
      ['They are automatically created in FE80::/10 and are used, for example, as next-hop addresses by routing protocols.', 'Correct.'],
      ['They are routed across the enterprise but not on the Internet.', 'That describes unique local addresses.'],
      ['They must be assigned by a DHCPv6 server.', 'They are generated automatically (or set manually).'],
      ['They are optional and usually disabled.', 'Every IPv6-enabled interface has one.'],
    ],
    ans: 'a',
    exp: 'Every IPv6 interface automatically has a **link-local** address (FE80::/10, usually FE80::/64 + EUI-64 or a random ID). Routers never forward packets with link-local destinations to another link. NDP, Router Advertisements and routing protocols such as OSPFv3 use them, which is why IPv6 next hops are often link-local addresses.',
  },
  {
    id: 'D1-16', exam: 'D', obj: '1.10', type: 'single',
    q: 'On a Windows PC, which command shows the DNS servers and the DHCP lease times?',
    opts: [
      ['ipconfig /all', 'Correct.'],
      ['ipconfig', 'Basic ipconfig shows only the address, mask and gateway.'],
      ['ipconfig /renew', 'This requests a new lease; it is not a display command.'],
      ['netstat -an', 'This lists connections and listening ports.'],
    ],
    ans: 'a',
    exp: '`ipconfig /all` adds the physical (MAC) address, DHCP enabled, DHCP server, lease obtained/expires and **DNS servers**. `ipconfig /release` and `/renew` drop and re-request a DHCP lease; `ipconfig /flushdns` clears the resolver cache.',
  },
  {
    id: 'D1-17', exam: 'D', obj: '1.11', type: 'single',
    q: 'A wireless signal becomes weaker as it passes through a concrete wall, and part of its energy is turned into heat. Which RF behaviour is this?',
    opts: [
      ['Absorption', 'Correct.'],
      ['Reflection', 'Reflection is when a signal bounces off a surface such as metal.'],
      ['Refraction', 'Refraction is a change of direction when passing between media.'],
      ['Diffraction', 'Diffraction is bending around an obstacle.'],
    ],
    ans: 'a',
    exp: 'RF behaviours: **absorption** (materials such as concrete, water and people soak up energy), **reflection** (bouncing off metal or glass, causing multipath), **refraction** (bending through different densities), **diffraction** (bending around objects) and **scattering** (bouncing off uneven surfaces in many directions).',
  },
  {
    id: 'D1-18', exam: 'D', obj: '1.12', type: 'single',
    q: 'Which type of hypervisor runs as an application on top of a conventional host operating system?',
    opts: [
      ['Type 2 (hosted)', 'Correct. Examples are VirtualBox and VMware Workstation.'],
      ['Type 1 (bare metal)', 'Type 1 hypervisors run directly on the hardware.'],
      ['A container engine', 'Container engines share the host kernel rather than virtualise hardware.'],
      ['A virtual switch', 'A vSwitch connects VMs; it does not run them.'],
    ],
    ans: 'a',
    exp: '**Type 1** hypervisors (ESXi, Hyper-V, KVM) run on bare metal and are used in data centres. **Type 2** hypervisors run inside a host OS and are typical on laptops for labs and testing. Type 2 is simpler to set up but has more overhead.',
  },
  {
    id: 'D1-19', exam: 'D', obj: '1.13', type: 'single',
    q: 'By default, how long does a Cisco switch keep a dynamically learned MAC address table entry for a host that stops sending frames?',
    opts: [
      ['300 seconds', 'Correct. The default aging time is 5 minutes.'],
      ['60 seconds', 'Not the default.'],
      ['4 hours', 'Four hours is the default ARP cache timeout on IOS routers.'],
      ['Forever, until the switch reloads', 'Dynamic entries age out; static and sticky secure entries do not.'],
    ],
    ans: 'a',
    exp: 'Dynamic MAC entries are refreshed each time a frame from that source arrives and are removed after **300 seconds** of silence (`mac address-table aging-time`). Do not confuse this with the router **ARP** timeout of 4 hours.',
  },
];
