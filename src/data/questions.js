export const questions = [
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "Which OSI layer is responsible for logical addressing and routing?",
    options: ["Layer 2 — Data Link", "Layer 3 — Network", "Layer 4 — Transport", "Layer 5 — Session"],
    correct: 1,
    explanation: "Layer 3 (Network) handles logical addressing (IP addresses) and routing. Layer 2 handles physical (MAC) addressing."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "A host sends data to another host. At which layer does segmentation occur?",
    options: ["Layer 2", "Layer 3", "Layer 4", "Layer 7"],
    correct: 2,
    explanation: "Layer 4 (Transport) segments data into segments and adds port numbers for TCP/UDP."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "Which protocol uses a 3-way handshake before data transfer?",
    options: ["UDP", "TCP", "ICMP", "ARP"],
    correct: 1,
    explanation: "TCP uses a 3-way handshake (SYN, SYN-ACK, ACK) to establish a reliable connection before transferring data."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "Which layer of the OSI model does a switch primarily operate at?",
    options: ["Layer 1", "Layer 2", "Layer 3", "Layer 4"],
    correct: 1,
    explanation: "Switches operate at Layer 2 (Data Link) and make forwarding decisions based on MAC addresses."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "What is the correct order of TCP/IP layers from top to bottom?",
    options: ["Application, Transport, Internet, Network Access", "Application, Network, Transport, Physical", "Session, Transport, Network, Data Link", "Application, Transport, Network, Data Link, Physical"],
    correct: 0,
    explanation: "TCP/IP has 4 layers: Application (maps to OSI layers 5-7), Transport, Internet, and Network Access (maps to OSI layers 1-2)."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "Which protocols use UDP? (Choose TWO)",
    options: ["FTP", "DHCP", "HTTP", "SNMP"],
    correct: 3,
    explanation: "DHCP (ports 67/68) and SNMP (port 161) use UDP. FTP and HTTP use TCP. Note: Since this is single-select, SNMP is the better single answer as DHCP is also correct. SNMP uses UDP 161."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "What port does SSH use?",
    options: ["21", "22", "23", "25"],
    correct: 1,
    explanation: "SSH uses TCP port 22. FTP control = 21, Telnet = 23, SMTP = 25."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "What port does HTTPS use?",
    options: ["80", "443", "8080", "8443"],
    correct: 1,
    explanation: "HTTPS uses TCP port 443. HTTP uses port 80."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "What does ARP do?",
    options: ["Maps hostname to IP address", "Maps IP address to MAC address", "Maps MAC address to port", "Encrypts data in transit"],
    correct: 1,
    explanation: "ARP (Address Resolution Protocol) resolves a known IP address to the unknown MAC address of a device on the same subnet."
  },
  {
    domain: 1,
    topic: "OSI & TCP/IP Models",
    question: "Which PDU is used at the Transport layer?",
    options: ["Bit", "Frame", "Packet", "Segment"],
    correct: 3,
    explanation: "Layer 4 (Transport) uses Segments. Layer 3 uses Packets, Layer 2 uses Frames, Layer 1 uses Bits."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "How many usable host addresses are in a /27 subnet?",
    options: ["14", "30", "62", "126"],
    correct: 1,
    explanation: "/27 = 5 host bits. 2^5 - 2 = 30 usable hosts."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "What is the network address of 192.168.10.200/28?",
    options: ["192.168.10.192", "192.168.10.196", "192.168.10.200", "192.168.10.208"],
    correct: 0,
    explanation: "/28 = 255.255.255.240, block size = 16. Subnets: 0,16,32...176,192,208. 200 falls in the 192 subnet. Network = 192.168.10.192."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "Which subnet mask provides exactly 14 usable hosts?",
    options: ["/26", "/27", "/28", "/29"],
    correct: 2,
    explanation: "/28 = 4 host bits. 2^4 - 2 = 14 usable hosts."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "What is the broadcast address of 172.16.5.0/25?",
    options: ["172.16.5.127", "172.16.5.128", "172.16.5.255", "172.16.5.254"],
    correct: 0,
    explanation: "/25 = block size 128. Network = 172.16.5.0, Broadcast = 172.16.5.127."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "A company needs 50 subnets with at least 2 hosts each from 10.0.0.0/8. Which mask should be used?",
    options: ["/26", "/29", "/30", "/24"],
    correct: 2,
    explanation: "/30 provides 2 usable hosts per subnet and supports up to 4,194,304 subnets from /8 space. 50 subnets needed — /30 easily satisfies both requirements."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "What is the wildcard mask for 255.255.255.240?",
    options: ["0.0.0.240", "0.0.0.15", "0.0.0.31", "0.0.0.224"],
    correct: 1,
    explanation: "Wildcard = 255.255.255.255 - 255.255.255.240 = 0.0.0.15."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "Which IP address range is reserved for APIPA?",
    options: ["10.0.0.0/8", "172.16.0.0/12", "169.254.0.0/16", "192.168.0.0/16"],
    correct: 2,
    explanation: "APIPA (Automatic Private IP Addressing) uses 169.254.0.0/16. A host uses APIPA when it fails to get an address from DHCP."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "How many subnets can be created by subnetting 192.168.1.0/24 with a /27 mask?",
    options: ["4", "6", "8", "16"],
    correct: 2,
    explanation: "Going from /24 to /27 borrows 3 bits. 2^3 = 8 subnets."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "Which of the following is a valid host address in the 10.1.1.128/25 subnet?",
    options: ["10.1.1.128", "10.1.1.130", "10.1.1.255", "10.1.1.127"],
    correct: 1,
    explanation: "/25 block = 128. Subnet 10.1.1.128, Broadcast 10.1.1.255. Usable hosts: .129-.254. 10.1.1.130 is valid. .128 is network address, .255 is broadcast, .127 is in previous subnet."
  },
  {
    domain: 1,
    topic: "IPv4 Addressing & Subnetting",
    question: "What is the purpose of a /32 route?",
    options: ["Default route", "Host route for a specific IP", "Summarize multiple subnets", "Point-to-point link"],
    correct: 1,
    explanation: "A /32 is a host route — it represents a single specific IP address, not a range."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "Which IPv6 address type is automatically assigned to every IPv6-enabled interface?",
    options: ["Global unicast", "Unique local", "Link-local", "Multicast"],
    correct: 2,
    explanation: "Every IPv6-enabled interface automatically gets a link-local address in the FE80::/10 range."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "What is the IPv6 equivalent of the IPv4 loopback address (127.0.0.1)?",
    options: ["::0", "::1", "FE80::1", "FF02::1"],
    correct: 1,
    explanation: "::1/128 is the IPv6 loopback address, equivalent to 127.0.0.1 in IPv4."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "Which IPv6 prefix is used for global unicast addresses?",
    options: ["FE80::/10", "FC00::/7", "2000::/3", "FF00::/8"],
    correct: 2,
    explanation: "Global unicast addresses use the 2000::/3 prefix — they start with 2 or 3 and are internet-routable."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "What IPv6 address does FF02::1 represent?",
    options: ["All OSPF routers", "All routers", "All IPv6 nodes", "All EIGRP routers"],
    correct: 2,
    explanation: "FF02::1 is the all-nodes multicast address. FF02::2 = all routers, FF02::5 = all OSPF routers, FF02::A = all EIGRP routers."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "What is the compressed form of 2001:0DB8:0000:0001:0000:0000:0000:0001?",
    options: ["2001:DB8::1:1", "2001:DB8:0:1::1", "2001:DB8:0:1:0:0:0:1", "2001:DB8::1"],
    correct: 1,
    explanation: "Remove leading zeros per group: 0DB8=DB8, 0000=0. The longest run of all-zero groups (the three 0000s after the 0001) are replaced with ::. Result: 2001:DB8:0:1::1."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "Which command enables IPv6 routing on a Cisco router?",
    options: ["ip ipv6-routing", "ipv6 enable routing", "ipv6 unicast-routing", "ip routing ipv6"],
    correct: 2,
    explanation: "The command 'ipv6 unicast-routing' enables IPv6 packet forwarding between interfaces on a Cisco router."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "What protocol replaces ARP in IPv6?",
    options: ["DHCPv6", "NDP (ICMPv6)", "OSPFv3", "SLAAC"],
    correct: 1,
    explanation: "NDP (Neighbor Discovery Protocol) using ICMPv6 replaces ARP in IPv6. NS/NA messages perform the ARP function."
  },
  {
    domain: 1,
    topic: "IPv6 Addressing",
    question: "What is the IPv6 default route?",
    options: ["0.0.0.0/0", "::/128", "::/0", "FE80::/10"],
    correct: 2,
    explanation: "::/0 is the IPv6 default route, equivalent to 0.0.0.0/0 in IPv4."
  },
  {
    domain: 1,
    topic: "Wireless Networking Fundamentals",
    question: "Which 802.11 standard operates ONLY in the 5 GHz band?",
    options: ["802.11b", "802.11g", "802.11n", "802.11ac"],
    correct: 3,
    explanation: "802.11ac (Wi-Fi 5) operates ONLY in the 5 GHz band. 802.11n operates in both 2.4 and 5 GHz."
  },
  {
    domain: 1,
    topic: "Wireless Networking Fundamentals",
    question: "Which three 2.4 GHz channels are non-overlapping?",
    options: ["1, 5, 10", "1, 6, 11", "2, 7, 12", "1, 7, 13"],
    correct: 1,
    explanation: "Channels 1, 6, and 11 are the only non-overlapping channels in the 2.4 GHz band."
  },
  {
    domain: 1,
    topic: "Wireless Networking Fundamentals",
    question: "What does SSID stand for?",
    options: ["Secure System Interface Device", "Service Set Identifier", "Single Station Infrastructure Device", "Switched Signal Interface Domain"],
    correct: 1,
    explanation: "SSID = Service Set Identifier. It is the name of a wireless network that clients see and connect to."
  },
  {
    domain: 1,
    topic: "Wireless Networking Fundamentals",
    question: "Which CAPWAP port is used for the control channel between an AP and WLC?",
    options: ["UDP 5246", "UDP 5247", "TCP 443", "UDP 4500"],
    correct: 0,
    explanation: "CAPWAP uses UDP 5246 for the control channel (encrypted with DTLS) and UDP 5247 for the data channel."
  },
  {
    domain: 1,
    topic: "Wireless Networking Fundamentals",
    question: "What is the wireless medium access method?",
    options: ["CSMA/CD", "CSMA/CA", "Token passing", "TDMA"],
    correct: 1,
    explanation: "Wireless uses CSMA/CA (Collision Avoidance). Wired Ethernet uses CSMA/CD (Collision Detection). Wireless cannot detect collisions while transmitting."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "Which VLAN is the native VLAN by default on a Cisco switch?",
    options: ["VLAN 0", "VLAN 1", "VLAN 99", "VLAN 1001"],
    correct: 1,
    explanation: "VLAN 1 is the default native VLAN on Cisco switches. Native VLAN traffic crosses trunk ports untagged."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "What happens when a trunk port receives an untagged frame?",
    options: ["The frame is dropped", "The frame is placed in VLAN 1", "The frame is placed in the native VLAN", "The frame is flooded to all VLANs"],
    correct: 2,
    explanation: "Untagged frames arriving on a trunk port are placed in the native VLAN, which defaults to VLAN 1."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "Which command configures a switch port as an access port in VLAN 20?",
    options: ["switchport vlan 20", "switchport access vlan 20", "vlan 20 access", "switchport mode vlan 20"],
    correct: 1,
    explanation: "The correct command is 'switchport access vlan 20' (after 'switchport mode access')."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "A router-on-a-stick configuration requires which type of interface?",
    options: ["Physical routed interface", "Switched Virtual Interface (SVI)", "Subinterface", "Loopback"],
    correct: 2,
    explanation: "Router-on-a-stick uses subinterfaces (e.g., Gi0/0.10) on the router, each configured with 802.1Q encapsulation for a specific VLAN."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "Which VTP mode allows a switch to create and modify VLANs locally without syncing from a VTP server?",
    options: ["Server", "Client", "Transparent", "Off"],
    correct: 2,
    explanation: "VTP Transparent mode allows local VLAN creation/deletion but does not sync from the VTP server and does not participate in VTP domain updates."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "What command shows which VLANs are active on a switch?",
    options: ["show vlan", "show vlan brief", "show interfaces vlan", "show switchport"],
    correct: 1,
    explanation: "'show vlan brief' displays a compact view of all VLANs and their assigned ports."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "Inter-VLAN routing on a Layer 3 switch requires which configuration?",
    options: ["A router connected to a trunk port", "ip routing enabled and SVIs configured", "VTP server mode", "802.1Q encapsulation on all ports"],
    correct: 1,
    explanation: "A Layer 3 switch performs inter-VLAN routing with 'ip routing' enabled and Switched Virtual Interfaces (SVIs) configured for each VLAN."
  },
  {
    domain: 2,
    topic: "VLANs & Trunking",
    question: "Which VLANs are reserved and cannot be deleted on a Cisco switch?",
    options: ["VLANs 1-10", "VLANs 1 and 1002-1005", "VLANs 1001-1005 only", "VLANs 4094-4096"],
    correct: 1,
    explanation: "VLANs 1 and 1002-1005 are reserved on Cisco switches and cannot be deleted."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "How is the Root Bridge elected in STP?",
    options: ["Highest Bridge ID", "Lowest Bridge ID", "Highest MAC address", "Lowest IP address"],
    correct: 1,
    explanation: "The switch with the LOWEST Bridge ID wins the Root Bridge election. Bridge ID = Priority (default 32768) + MAC address."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "What is the default STP port cost for a 100 Mbps FastEthernet link?",
    options: ["1", "4", "10", "19"],
    correct: 3,
    explanation: "STP port cost for 100 Mbps = 19. 1 Gbps = 4, 10 Gbps = 2, 10 Mbps = 100."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "What STP enhancement should be configured on access ports facing end devices?",
    options: ["Root Guard", "BPDU Guard", "Loop Guard", "PortFast"],
    correct: 3,
    explanation: "PortFast allows access ports to immediately transition to Forwarding state, bypassing Listening and Learning, which speeds up connectivity for end devices."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "A switch port running PortFast receives a BPDU. What happens if BPDU Guard is enabled?",
    options: ["The port ignores the BPDU", "The port transitions to Blocking state", "The port is placed in err-disabled state", "STP reconverges"],
    correct: 2,
    explanation: "BPDU Guard immediately places the port in err-disabled state if a BPDU is received. This protects against rogue switches."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "How long does 802.1D STP take to converge in the worst case?",
    options: ["15 seconds", "30 seconds", "50 seconds", "90 seconds"],
    correct: 2,
    explanation: "802.1D convergence = 20 sec max age + 15 sec Listening + 15 sec Learning = 50 seconds maximum."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "What is the purpose of Root Guard?",
    options: ["Prevent a port from becoming a root port", "Shutdown ports receiving BPDUs", "Speed up STP convergence", "Protect against broadcast storms"],
    correct: 0,
    explanation: "Root Guard prevents a port from becoming a Root Port if a superior BPDU is received. It protects the Root Bridge placement."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "Which STP variant provides per-VLAN spanning tree instances and rapid convergence?",
    options: ["802.1D", "Rapid PVST+", "802.1s (MSTP)", "Common STP"],
    correct: 1,
    explanation: "Rapid PVST+ (Cisco) provides a separate RSTP instance per VLAN with rapid convergence (~1-2 seconds). Default on modern Cisco switches."
  },
  {
    domain: 2,
    topic: "Spanning Tree Protocol (STP & RSTP)",
    question: "On which type of network does OSPF elect a DR/BDR (similar to STP DR election)?",
    options: ["Point-to-point links", "Broadcast (Ethernet)", "Only OSPF area 0", "NBMA only"],
    correct: 1,
    explanation: "OSPF elects DR/BDR on broadcast (Ethernet) and NBMA networks to reduce adjacencies. On point-to-point links, all routers become Full neighbors."
  },
  {
    domain: 2,
    topic: "EtherChannel",
    question: "Which EtherChannel protocol is IEEE standard and works with non-Cisco devices?",
    options: ["PAgP", "LACP", "VTP", "DTP"],
    correct: 1,
    explanation: "LACP (Link Aggregation Control Protocol) is the IEEE 802.3ad standard. PAgP is Cisco proprietary."
  },
  {
    domain: 2,
    topic: "EtherChannel",
    question: "A switch port is configured with 'channel-group 1 mode passive'. Which mode on the other end will successfully form an EtherChannel?",
    options: ["Passive", "Auto", "Active", "On"],
    correct: 2,
    explanation: "LACP Passive waits for the other side to initiate. Active + Passive = forms. Passive + Passive = no channel. 'On' uses static (no LACP), incompatible with Passive."
  },
  {
    domain: 2,
    topic: "EtherChannel",
    question: "What is the maximum number of active links in a standard EtherChannel bundle?",
    options: ["4", "6", "8", "16"],
    correct: 2,
    explanation: "An EtherChannel supports a maximum of 8 active links bundled together (additional links can be in standby)."
  },
  {
    domain: 2,
    topic: "EtherChannel",
    question: "Which command shows the EtherChannel status summary?",
    options: ["show interfaces port-channel 1", "show etherchannel summary", "show lacp neighbor", "show channel-group status"],
    correct: 1,
    explanation: "'show etherchannel summary' shows a quick overview of all EtherChannel bundles including protocol, flags, and member ports."
  },
  {
    domain: 2,
    topic: "Wireless LAN Architecture",
    question: "What is the main difference between an autonomous AP and a lightweight AP?",
    options: ["Autonomous APs support more clients", "Lightweight APs are managed by a WLC via CAPWAP", "Autonomous APs use WPA3 only", "Lightweight APs cannot do VLAN tagging"],
    correct: 1,
    explanation: "Lightweight APs (LAPs) are managed centrally by a Wireless LAN Controller (WLC) using the CAPWAP protocol. Autonomous APs are self-contained."
  },
  {
    domain: 2,
    topic: "Wireless LAN Architecture",
    question: "Which WLC interface IP address is used for web authentication redirect?",
    options: ["The management IP", "10.0.0.1", "169.254.1.1", "0.0.0.0"],
    correct: 2,
    explanation: "The WLC virtual interface uses IP address 169.254.1.1 for web authentication redirect and DHCP relay."
  },
  {
    domain: 2,
    topic: "Switch Security",
    question: "What is the default violation action for port security on a Cisco switch?",
    options: ["Protect", "Restrict", "Shutdown", "Drop"],
    correct: 2,
    explanation: "The default port security violation mode is Shutdown, which places the port in err-disabled state when a violation occurs."
  },
  {
    domain: 2,
    topic: "Switch Security",
    question: "Which feature prevents rogue DHCP servers from providing IP addresses to clients?",
    options: ["Port Security", "DHCP Snooping", "Dynamic ARP Inspection", "802.1X"],
    correct: 1,
    explanation: "DHCP Snooping distinguishes between trusted (server-connected) and untrusted ports, dropping DHCP Offer/Ack from untrusted ports."
  },
  {
    domain: 2,
    topic: "Switch Security",
    question: "What database does Dynamic ARP Inspection use to validate ARP packets?",
    options: ["MAC address table", "DHCP Snooping binding table", "ARP cache", "OSPF database"],
    correct: 1,
    explanation: "DAI uses the DHCP Snooping binding table (IP-MAC-port mappings) to validate ARP packets. That's why DHCP Snooping must be configured before DAI."
  },
  {
    domain: 2,
    topic: "Switch Security",
    question: "A network engineer types 'switchport port-security mac-address sticky'. What does this accomplish?",
    options: ["Statically assigns a specific MAC", "Automatically learns and saves MACs to running config", "Increases the MAC limit to sticky", "Disables port security"],
    correct: 1,
    explanation: "The 'sticky' keyword causes the switch to dynamically learn MAC addresses and add them to the running configuration as static secure MACs."
  },
  {
    domain: 3,
    topic: "Static Routing",
    question: "Which administrative distance does a static route have by default?",
    options: ["0", "1", "90", "110"],
    correct: 1,
    explanation: "Static routes have an administrative distance of 1 by default. Connected routes have 0. OSPF = 110, EIGRP = 90."
  },
  {
    domain: 3,
    topic: "Static Routing",
    question: "What is a floating static route?",
    options: ["A route with no next-hop", "A static route with a higher AD than the primary dynamic route", "A route that changes dynamically", "A default route for all traffic"],
    correct: 1,
    explanation: "A floating static route has a higher AD than the primary routing protocol's AD. It only appears in the routing table if the dynamic route disappears."
  },
  {
    domain: 3,
    topic: "Static Routing",
    question: "Which command configures a default route on a Cisco router?",
    options: ["ip route default 0.0.0.0 10.0.0.1", "ip route 0.0.0.0 0.0.0.0 10.0.0.1", "ip default-gateway 10.0.0.1", "ip route any any 10.0.0.1"],
    correct: 1,
    explanation: "The correct syntax is 'ip route 0.0.0.0 0.0.0.0 next-hop'. This creates a default route (gateway of last resort)."
  },
  {
    domain: 3,
    topic: "Static Routing",
    question: "A router has routes for 10.0.0.0/8, 10.1.0.0/16, and 10.1.1.0/24. A packet arrives for 10.1.1.50. Which route is used?",
    options: ["10.0.0.0/8", "10.1.0.0/16", "10.1.1.0/24", "The packet is dropped"],
    correct: 2,
    explanation: "Routers use the longest prefix match. 10.1.1.0/24 is the most specific match for 10.1.1.50 and will be selected."
  },
  {
    domain: 3,
    topic: "Static Routing",
    question: "What does the 'L' code represent in 'show ip route' output?",
    options: ["A learned route via OSPF", "The local route for the router's own interface IP", "A link-state route", "A loopback route"],
    correct: 1,
    explanation: "The 'L' code represents a Local route — the specific /32 host route for the router's own interface IP addresses."
  },
  {
    domain: 3,
    topic: "Static Routing",
    question: "Which of the following is the BEST type of static route for a WAN backup link?",
    options: ["Standard static route", "Default static route", "Floating static route", "Host route"],
    correct: 2,
    explanation: "A floating static route is configured with a higher AD than the primary routing protocol. It only activates when the primary route (e.g., OSPF) fails."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "What is the administrative distance of OSPF?",
    options: ["90", "100", "110", "120"],
    correct: 2,
    explanation: "OSPF has an AD of 110. EIGRP internal = 90, RIP = 120, Static = 1."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "Which OSPF state indicates that two routers have fully synchronized their link-state databases?",
    options: ["2-Way", "ExStart", "Loading", "Full"],
    correct: 3,
    explanation: "The Full state means both routers have exchanged and synchronized their LSDBs. Routers must reach Full state to exchange routing information."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "By default, what is the OSPF hello interval on an Ethernet interface?",
    options: ["5 seconds", "10 seconds", "30 seconds", "40 seconds"],
    correct: 1,
    explanation: "OSPF hello interval on broadcast (Ethernet) = 10 seconds. Dead interval = 40 seconds (4x hello). NBMA = 30/120."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "An OSPF router has multiple loopback interfaces. Which is used as the Router ID?",
    options: ["The lowest loopback IP", "The highest loopback IP", "The loopback configured first", "All loopbacks are used"],
    correct: 1,
    explanation: "OSPF selects the highest loopback IP as the Router ID (if no manual RID). If no loopbacks, it uses the highest active physical interface IP."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "What does the 'passive-interface' OSPF command do?",
    options: ["Stops the router from advertising that network", "Prevents hello packets from being sent but still advertises the network", "Removes the interface from OSPF completely", "Blocks OSPF on all interfaces"],
    correct: 1,
    explanation: "Passive interface stops sending/receiving OSPF Hello packets (no neighbor formation), but the connected network is still advertised in OSPF."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "Which OSPF network type elects a DR and BDR?",
    options: ["Point-to-point", "Loopback", "Broadcast", "Point-to-multipoint"],
    correct: 2,
    explanation: "DR/BDR election occurs on broadcast (Ethernet) and NBMA network types. Point-to-point links skip DR/BDR and both routers go directly to Full."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "A GigabitEthernet and a FastEthernet interface have the same default OSPF cost. What is the best fix?",
    options: ["Manually set the cost on each interface", "Change the OSPF process ID", "Increase hello intervals", "Use 'auto-cost reference-bandwidth 10000' on all OSPF routers"],
    correct: 3,
    explanation: "The default reference bandwidth is 100 Mbps, giving both FE and GE a cost of 1. Setting 'auto-cost reference-bandwidth 10000' (10 Gbps) differentiates: FE=100, GE=10, 10GE=1. Must be set on all routers."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Single Area",
    question: "Which command adds the network 192.168.1.0/24 to OSPF area 0?",
    options: ["network 192.168.1.0 255.255.255.0 area 0", "network 192.168.1.0 0.0.0.255 area 0", "ip ospf 1 area 0 192.168.1.0", "ospf network 192.168.1.0/24 area 0"],
    correct: 1,
    explanation: "OSPF 'network' statements use WILDCARD masks, not subnet masks. 'network 192.168.1.0 0.0.0.255 area 0' is correct."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Multi-Area",
    question: "All OSPF areas must connect to which area?",
    options: ["Area 1", "Area 0", "Area 255", "The backbone area configured per design"],
    correct: 1,
    explanation: "All OSPF areas must connect to Area 0 (the backbone area). This is a fundamental OSPF requirement."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Multi-Area",
    question: "Which LSA type is generated by an ABR to describe routes in other areas?",
    options: ["Type 1 (Router LSA)", "Type 2 (Network LSA)", "Type 3 (Summary LSA)", "Type 5 (AS External LSA)"],
    correct: 2,
    explanation: "Type 3 Summary LSAs are generated by ABRs to advertise networks from one area into another area."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Multi-Area",
    question: "A stub area blocks which LSA types?",
    options: ["Types 1 and 2", "Types 3 and 4", "Types 4 and 5", "Types 5 and 6"],
    correct: 2,
    explanation: "A stub area blocks Type 4 (ASBR Summary) and Type 5 (AS External) LSAs. The ABR injects a default route instead."
  },
  {
    domain: 3,
    topic: "OSPFv2 — Multi-Area",
    question: "What is an ASBR?",
    options: ["A router that connects two OSPF areas", "A router that connects OSPF to external routing domains", "A router with the highest Router ID", "A router running OSPF and EIGRP simultaneously"],
    correct: 1,
    explanation: "An ASBR (Autonomous System Boundary Router) connects OSPF to another routing domain (like BGP, EIGRP, or static routes) and redistributes external routes."
  },
  {
    domain: 3,
    topic: "NAT & PAT",
    question: "Which NAT type maps one private IP to one public IP permanently?",
    options: ["Dynamic NAT", "PAT", "Static NAT", "NAT Overload"],
    correct: 2,
    explanation: "Static NAT creates a permanent one-to-one mapping between a private IP and a public IP. Used for servers that must always be reachable at the same public IP."
  },
  {
    domain: 3,
    topic: "NAT & PAT",
    question: "What does PAT use to differentiate multiple inside hosts sharing one public IP?",
    options: ["VLAN tags", "Source port numbers", "IP precedence", "DSCP values"],
    correct: 1,
    explanation: "PAT (Port Address Translation) uses unique source port numbers to track each session, allowing many hosts to share a single public IP."
  },
  {
    domain: 3,
    topic: "NAT & PAT",
    question: "Which NAT term describes the private IP address of an inside host BEFORE translation?",
    options: ["Inside Global", "Inside Local", "Outside Local", "Outside Global"],
    correct: 1,
    explanation: "Inside Local = the private IP of the inside host before NAT translation. Inside Global = what that host's IP becomes on the public internet."
  },
  {
    domain: 3,
    topic: "NAT & PAT",
    question: "Which interface command designates the inside NAT interface?",
    options: ["ip nat outside", "ip nat inside", "nat inside", "ip nat enable inside"],
    correct: 1,
    explanation: "The command 'ip nat inside' is applied to the interface facing the private network. 'ip nat outside' is applied to the internet-facing interface."
  },
  {
    domain: 3,
    topic: "NAT & PAT",
    question: "A network uses PAT with a single public IP. What is the maximum number of simultaneous translations?",
    options: ["65,535", "1,024", "About 64,000 (practical)", "Unlimited"],
    correct: 2,
    explanation: "PAT theoretically supports up to 65,535 port numbers per public IP, but in practice around 64,000 simultaneous translations are supported."
  },
  {
    domain: 3,
    topic: "IPv6 Routing",
    question: "When configuring an IPv6 static route using a link-local next-hop, what additional parameter is required?",
    options: ["The VLAN ID", "The exit interface", "The routing protocol process ID", "The MTU size"],
    correct: 1,
    explanation: "Link-local addresses are not unique across the entire network (only unique per link). When using link-local as a next-hop, you must specify the exit interface so the router knows which link."
  },
  {
    domain: 3,
    topic: "IPv6 Routing",
    question: "What is the OSPFv3 equivalent for IPv6?",
    options: ["OSPFv2 with IPv6 enabled", "OSPFv3", "OSPF for IPv6", "Both OSPFv3 and OSPFv2 running simultaneously"],
    correct: 1,
    explanation: "OSPFv3 is the version of OSPF adapted for IPv6. It uses link-local addresses for adjacencies and is configured per-interface."
  },
  {
    domain: 3,
    topic: "IPv6 Routing",
    question: "Which command verifies IPv6 routes on a Cisco router?",
    options: ["show ip route ipv6", "show ipv6 route", "show route ipv6", "show ip ipv6 routing"],
    correct: 1,
    explanation: "The correct command is 'show ipv6 route' to display the IPv6 routing table."
  },
  {
    domain: 4,
    topic: "DHCP",
    question: "What is the correct order of DHCP messages when a client obtains an IP address?",
    options: ["Offer, Discover, Request, Ack", "Discover, Offer, Request, Ack", "Request, Discover, Offer, Ack", "Discover, Request, Offer, Ack"],
    correct: 1,
    explanation: "DORA: Discover -> Offer -> Request -> Acknowledge. The client broadcasts Discover, server offers, client requests (still broadcast), server acknowledges."
  },
  {
    domain: 4,
    topic: "DHCP",
    question: "Which command is used to forward DHCP broadcasts to a DHCP server on another subnet?",
    options: ["ip dhcp relay", "ip helper-address", "ip dhcp forward", "ip broadcast-relay"],
    correct: 1,
    explanation: "'ip helper-address' configures the router interface to convert DHCP broadcasts to unicast and forward them to the DHCP server's IP."
  },
  {
    domain: 4,
    topic: "DHCP",
    question: "A host receives the IP address 169.254.5.100. What does this indicate?",
    options: ["The host is using a static IP", "The host received its address from a DHCP server", "The host failed to reach a DHCP server and assigned itself an APIPA address", "The host is on the loopback network"],
    correct: 2,
    explanation: "169.254.0.0/16 is the APIPA (Automatic Private IP Addressing) range. Hosts use this when they cannot contact a DHCP server."
  },
  {
    domain: 4,
    topic: "DHCP",
    question: "What is the purpose of 'ip dhcp excluded-address 192.168.1.1 192.168.1.10'?",
    options: ["Remove these IPs from the DHCP pool", "Reserve these IPs so DHCP won't assign them", "Block these IPs from the network", "Assign these IPs to specific MAC addresses"],
    correct: 1,
    explanation: "This command tells the DHCP server to exclude the range .1 through .10 from dynamic assignment — typically used for routers, servers, and printers with static IPs."
  },
  {
    domain: 4,
    topic: "DHCP",
    question: "At what percentage of the lease time does a DHCP client first attempt to renew its lease?",
    options: ["25%", "50%", "75%", "87.5%"],
    correct: 1,
    explanation: "DHCP clients attempt renewal at 50% of lease time (T1). If unsuccessful, they try again at 87.5% (T2), then broadcast for any DHCP server."
  },
  {
    domain: 4,
    topic: "DNS, NTP & SNMP/Syslog",
    question: "What DNS record type maps a hostname to an IPv4 address?",
    options: ["AAAA", "PTR", "MX", "A"],
    correct: 3,
    explanation: "An A record maps a hostname to an IPv4 address. AAAA maps to IPv6. PTR is reverse lookup. MX is for mail servers."
  },
  {
    domain: 4,
    topic: "DNS, NTP & SNMP/Syslog",
    question: "What is the NTP stratum of a device that gets its time directly from an atomic clock?",
    options: ["0", "1", "2", "3"],
    correct: 1,
    explanation: "Stratum 1 devices are directly connected to a stratum 0 reference (atomic/GPS). Stratum 0 is the reference itself and is not accessible via NTP."
  },
  {
    domain: 4,
    topic: "DNS, NTP & SNMP/Syslog",
    question: "Which SNMP version provides encryption and strong authentication?",
    options: ["SNMPv1", "SNMPv2c", "SNMPv3", "SNMPv4"],
    correct: 2,
    explanation: "SNMPv3 provides authentication (MD5/SHA) and encryption (DES/AES). SNMPv1 and v2c use community strings with no encryption."
  },
  {
    domain: 4,
    topic: "DNS, NTP & SNMP/Syslog",
    question: "What is the difference between an SNMP Trap and an Inform?",
    options: ["Traps use TCP; Informs use UDP", "Informs require acknowledgment; Traps do not", "Traps are encrypted; Informs are not", "Informs go to multiple managers; Traps go to one"],
    correct: 1,
    explanation: "SNMP Informs are acknowledged by the receiving NMS. Traps are fire-and-forget (no ACK). Both use UDP."
  },
  {
    domain: 4,
    topic: "DNS, NTP & SNMP/Syslog",
    question: "Which syslog severity level indicates a warning condition?",
    options: ["Level 3 (Error)", "Level 4 (Warning)", "Level 5 (Notice)", "Level 6 (Informational)"],
    correct: 1,
    explanation: "Syslog Level 4 = Warning. Level 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notice, 6=Informational, 7=Debug."
  },
  {
    domain: 4,
    topic: "DNS, NTP & SNMP/Syslog",
    question: "A router is configured with 'logging trap warnings'. Which syslog levels will be sent to the server?",
    options: ["Level 4 only", "Levels 0-4", "Levels 4-7", "All levels"],
    correct: 1,
    explanation: "Syslog filtering is inclusive downward. 'Warnings' (level 4) sends levels 0 through 4 (Emergency, Alert, Critical, Error, Warning)."
  },
  {
    domain: 4,
    topic: "HSRP, VRRP & GLBP",
    question: "In HSRP, which router forwards traffic for the virtual IP address?",
    options: ["The standby router", "The active router", "Both routers simultaneously", "The router with the highest real IP"],
    correct: 1,
    explanation: "The HSRP Active router forwards all traffic for the virtual IP address. The Standby router monitors and takes over if the Active fails."
  },
  {
    domain: 4,
    topic: "HSRP, VRRP & GLBP",
    question: "What is the default HSRP priority?",
    options: ["50", "100", "120", "255"],
    correct: 1,
    explanation: "Default HSRP priority is 100. The router with the highest priority becomes Active. Tie-breaker = highest real IP address."
  },
  {
    domain: 4,
    topic: "HSRP, VRRP & GLBP",
    question: "What command enables an HSRP router to reclaim the Active role after recovering from a failure?",
    options: ["standby 1 preempt", "standby 1 priority 200", "standby 1 track", "no standby 1 standby"],
    correct: 0,
    explanation: "'standby 1 preempt' enables preemption — the router will take back the Active role when it comes back up (if it has higher priority)."
  },
  {
    domain: 4,
    topic: "HSRP, VRRP & GLBP",
    question: "Which FHRP provides actual load balancing across multiple routers, not just failover?",
    options: ["HSRP", "VRRP", "GLBP", "IRDP"],
    correct: 2,
    explanation: "GLBP (Gateway Load Balancing Protocol) is the only FHRP that provides load balancing. It assigns different virtual MACs to different AVF routers."
  },
  {
    domain: 4,
    topic: "HSRP, VRRP & GLBP",
    question: "VRRP preemption is enabled by default. What does this mean?",
    options: ["The Master cannot be replaced once elected", "A higher-priority router automatically becomes Master when it comes up", "All routers negotiate simultaneously", "Preemption must be disabled manually"],
    correct: 1,
    explanation: "In VRRP, preemption is on by default. If a router with higher priority joins the group, it will automatically become the Master router."
  },
  {
    domain: 4,
    topic: "QoS Fundamentals",
    question: "What DSCP value is used for voice (RTP) traffic?",
    options: ["0 (BE)", "24 (CS3)", "34 (AF41)", "46 (EF)"],
    correct: 3,
    explanation: "EF (Expedited Forwarding) = DSCP 46 is used for voice/RTP traffic. It receives the lowest delay, lowest jitter, and highest priority."
  },
  {
    domain: 4,
    topic: "QoS Fundamentals",
    question: "What is the difference between traffic policing and traffic shaping?",
    options: ["Policing buffers excess; shaping drops excess", "Shaping buffers excess; policing drops excess", "They are the same mechanism", "Policing is for inbound; shaping is for outbound only"],
    correct: 1,
    explanation: "Shaping buffers (queues) excess traffic and sends it when possible — smoother, better for TCP. Policing drops or re-marks excess traffic immediately."
  },
  {
    domain: 4,
    topic: "QoS Fundamentals",
    question: "Where in the network should QoS markings be trusted from end devices?",
    options: ["Never trust any device markings", "Trust all device markings", "Trust markings from IP phones; remark or distrust PC markings", "Only trust markings from routers"],
    correct: 2,
    explanation: "IP phones are trusted to correctly mark voice traffic (EF). PCs can set any DSCP value — they should not be trusted; their markings should be re-marked at the access switch."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "A standard ACL should be placed closest to which location?",
    options: ["Closest to the source", "Closest to the destination", "On the WAN interface", "On the loopback interface"],
    correct: 1,
    explanation: "Standard ACLs only match on source IP. Placing them close to the destination prevents accidentally blocking traffic to other destinations."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "What is at the end of every ACL, even if not explicitly written?",
    options: ["Permit any any", "Deny any any (implicit deny)", "Log any any", "Count any any"],
    correct: 1,
    explanation: "Every ACL ends with an implicit 'deny any any'. If a packet doesn't match any rule, it is dropped. This is why you must explicitly permit needed traffic."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "Which ACL would block all Telnet traffic from any source to any destination?",
    options: ["access-list 10 deny tcp any any eq 22", "access-list 110 deny tcp any any eq 23", "access-list 10 deny ip any any", "access-list 110 deny udp any any eq 23"],
    correct: 1,
    explanation: "Telnet uses TCP port 23. Extended ACL 110 (100-199) is needed to match protocol and port. TCP port 23 = Telnet."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "How many ACLs can be applied to a single interface in a single direction?",
    options: ["1", "2", "4", "Unlimited"],
    correct: 0,
    explanation: "Only ONE ACL can be applied per interface per direction (inbound or outbound). Applying a second ACL in the same direction replaces the first."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "An ACL is applied to the VTY lines. What does this control?",
    options: ["Traffic routing through the router", "Who can telnet/SSH into the router itself", "Which VLANs can access the network", "SNMP access to the router"],
    correct: 1,
    explanation: "ACLs on VTY lines (using 'access-class') control which source IP addresses are allowed to establish SSH or Telnet sessions to the router's management plane."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "Which extended ACL entry permits HTTP traffic from 10.1.0.0/24 to any destination?",
    options: ["permit tcp 10.1.0.0 0.0.0.255 any eq 80", "permit udp 10.1.0.0 0.0.0.255 any eq 80", "permit tcp any 10.1.0.0 0.0.0.255 eq 80", "permit ip 10.1.0.0 255.255.255.0 any eq 80"],
    correct: 0,
    explanation: "HTTP = TCP port 80. The syntax is: permit [protocol] [source] [wildcard] [destination] [wildcard] eq [port]. Wildcard 0.0.0.255 for /24."
  },
  {
    domain: 5,
    topic: "Access Control Lists (ACLs)",
    question: "What does the 'eq' operator mean in an extended ACL?",
    options: ["Excluding", "Equal to (exactly this port number)", "Encrypted", "Evaluate"],
    correct: 1,
    explanation: "'eq' means equal to a specific port number. Other operators: gt (greater than), lt (less than), neq (not equal), range (range of ports)."
  },
  {
    domain: 5,
    topic: "Device Hardening",
    question: "Which command sets an encrypted password for privileged EXEC mode on a Cisco router?",
    options: ["enable password cisco", "enable secret cisco", "service password-encryption", "set enable password cisco"],
    correct: 1,
    explanation: "'enable secret' stores the password using a strong hash (MD5/scrypt). 'enable password' stores it in weak or cleartext. Always use 'enable secret'."
  },
  {
    domain: 5,
    topic: "Device Hardening",
    question: "What is required before SSH can be configured on a Cisco IOS device?",
    options: ["A TACACS+ server", "Domain name configured and RSA keys generated", "An enable secret of at least 8 characters", "VTP configured"],
    correct: 1,
    explanation: "SSH requires: hostname set, IP domain-name configured, and RSA keys generated ('crypto key generate rsa'). SSHv2 recommended."
  },
  {
    domain: 5,
    topic: "Device Hardening",
    question: "Which command restricts VTY access to SSH only (no Telnet)?",
    options: ["transport input none", "transport input ssh", "transport input telnet ssh", "no transport output telnet"],
    correct: 1,
    explanation: "'transport input ssh' on VTY lines allows only SSH connections. Telnet is disabled, improving security."
  },
  {
    domain: 5,
    topic: "Device Hardening",
    question: "What does 'service password-encryption' do?",
    options: ["Uses AES-256 to encrypt all passwords", "Applies Type 7 (weak, reversible) encryption to plaintext passwords", "Requires all passwords to be encrypted before entry", "Enables MD5 hashing for the enable secret"],
    correct: 1,
    explanation: "'service password-encryption' applies Cisco Type 7 encryption to passwords stored in plaintext in the config. Type 7 is reversible — it's better than cleartext but not truly secure."
  },
  {
    domain: 5,
    topic: "Device Hardening",
    question: "Which banner appears before the login prompt?",
    options: ["banner motd", "banner login", "banner exec", "banner incoming"],
    correct: 1,
    explanation: "Banner login appears before the username/password prompt. Banner motd appears when connecting (before login). Banner exec appears after successful login."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "Which protocol is preferred for device administration (SSH/Telnet CLI access) and why?",
    options: ["RADIUS — because it is open standard", "TACACS+ — because it encrypts the entire packet and separates AAA functions", "RADIUS — because it uses TCP", "TACACS+ — because it uses UDP which is faster"],
    correct: 1,
    explanation: "TACACS+ is preferred for device admin because it encrypts the entire packet (RADIUS only encrypts the password) and separates Authentication, Authorization, and Accounting. It also uses TCP for reliability."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "On which port does TACACS+ communicate?",
    options: ["UDP 161", "UDP 1812", "TCP 49", "TCP 1645"],
    correct: 2,
    explanation: "TACACS+ uses TCP port 49. RADIUS uses UDP 1812 (auth) and 1813 (accounting)."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "What does the 'aaa new-model' command enable on a Cisco device?",
    options: ["NTP authentication", "AAA framework for centralized authentication", "SNMP v3 authentication", "SSH key generation"],
    correct: 1,
    explanation: "'aaa new-model' enables the AAA framework on Cisco IOS. Without this command, RADIUS/TACACS+ cannot be used for authentication."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "In 802.1X, what is the role of the switch?",
    options: ["Supplicant", "Authenticator", "Authentication Server", "RADIUS Proxy"],
    correct: 1,
    explanation: "In 802.1X, the switch acts as the Authenticator — it enforces access policy. The client is the Supplicant. The RADIUS server is the Authentication Server."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "Which RADIUS ports are used for authentication and accounting?",
    options: ["TCP 49 and 50", "UDP 1812 and 1813", "UDP 161 and 162", "TCP 1645 and 1646"],
    correct: 1,
    explanation: "RADIUS uses UDP 1812 for authentication/authorization and UDP 1813 for accounting. Older implementations used 1645/1646."
  },
  {
    domain: 5,
    topic: "VPN Concepts",
    question: "Which IPsec protocol provides both encryption and integrity?",
    options: ["AH (Authentication Header)", "ESP (Encapsulating Security Payload)", "IKE (Internet Key Exchange)", "GRE (Generic Routing Encapsulation)"],
    correct: 1,
    explanation: "ESP provides encryption AND integrity/authentication. AH provides only integrity/authentication (no encryption). ESP is the most commonly used protocol."
  },
  {
    domain: 5,
    topic: "VPN Concepts",
    question: "Which IPsec mode is used for site-to-site VPNs?",
    options: ["Transport mode", "Tunnel mode", "Aggressive mode", "Main mode"],
    correct: 1,
    explanation: "Tunnel mode encapsulates the entire original IP packet in a new IP packet. This is used for site-to-site VPNs. Transport mode only encrypts the payload."
  },
  {
    domain: 5,
    topic: "VPN Concepts",
    question: "A remote worker needs to access corporate resources through an encrypted tunnel over the internet. Which VPN type is used?",
    options: ["Site-to-site VPN", "GRE tunnel", "Remote access VPN", "MPLS VPN"],
    correct: 2,
    explanation: "Remote access VPN (like Cisco AnyConnect/SSL VPN) allows individual users to connect securely from anywhere using an encrypted tunnel."
  },
  {
    domain: 5,
    topic: "VPN Concepts",
    question: "What port does an SSL VPN use?",
    options: ["UDP 500", "UDP 4500", "TCP 443", "TCP 1194"],
    correct: 2,
    explanation: "SSL VPN uses TCP port 443 (HTTPS), which is typically allowed through firewalls, making it more firewall-friendly than IPsec (UDP 500)."
  },
  {
    domain: 5,
    topic: "VPN Concepts",
    question: "What does PFS (Perfect Forward Secrecy) provide in IPsec?",
    options: ["Prevents replay attacks", "Ensures each session uses a new DH key exchange", "Encrypts the IKE Phase 1 negotiation", "Authenticates both VPN endpoints"],
    correct: 1,
    explanation: "PFS uses a new Diffie-Hellman exchange for each IPsec SA. If one session key is compromised, past and future sessions remain secure."
  },
  {
    domain: 5,
    topic: "Wireless Security",
    question: "Which wireless security protocol uses AES-CCMP for encryption?",
    options: ["WEP", "WPA (TKIP)", "WPA2", "WPA3"],
    correct: 2,
    explanation: "WPA2 uses AES-CCMP for encryption, which is much stronger than WEP (RC4) and WPA (TKIP). WPA3 uses AES-GCMP."
  },
  {
    domain: 5,
    topic: "Wireless Security",
    question: "What is the main improvement of WPA3 over WPA2 regarding key exchange?",
    options: ["WPA3 uses a longer key length", "WPA3 uses SAE instead of PSK 4-way handshake", "WPA3 supports TKIP", "WPA3 requires a RADIUS server"],
    correct: 1,
    explanation: "WPA3 uses SAE (Simultaneous Authentication of Equals / Dragonfly handshake) instead of the PSK 4-way handshake, preventing offline dictionary attacks even if the handshake is captured."
  },
  {
    domain: 5,
    topic: "Wireless Security",
    question: "Which wireless attack involves creating a fake AP that mimics a legitimate one?",
    options: ["Rogue AP", "Evil twin attack", "Deauthentication flood", "KRACK attack"],
    correct: 1,
    explanation: "An evil twin attack involves creating an AP with the same SSID as a legitimate AP to trick users into connecting to it, enabling credential capture and man-in-the-middle attacks."
  },
  {
    domain: 5,
    topic: "Wireless Security",
    question: "WPA2-Enterprise differs from WPA2-Personal in that it uses:",
    options: ["A longer pre-shared key", "802.1X authentication with RADIUS", "WPA3 encryption", "TKIP instead of AES"],
    correct: 1,
    explanation: "WPA2-Enterprise uses 802.1X with a RADIUS server for authentication. Each user has unique credentials. WPA2-Personal uses a shared PSK for all users."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "Which network plane is responsible for forwarding packets based on the FIB?",
    options: ["Management plane", "Control plane", "Data plane", "Application plane"],
    correct: 2,
    explanation: "The data plane (forwarding plane) forwards packets based on the Forwarding Information Base (FIB). The control plane builds the routing/switching tables that populate the FIB."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "In SDN architecture, what does the northbound API connect?",
    options: ["The controller to network devices", "Applications to the SDN controller", "The data plane to the control plane", "Physical devices to each other"],
    correct: 1,
    explanation: "Northbound APIs connect applications (automation scripts, analytics tools) to the SDN controller. Southbound APIs connect the controller to network devices."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "What is the primary function of Cisco DNA Center?",
    options: ["Provide DHCP services", "Centralize network management, automation, and assurance", "Act as a RADIUS server", "Manage wireless access points only"],
    correct: 1,
    explanation: "Cisco DNA Center (Catalyst Center) provides centralized network management through Design, Policy, Provision, and Assurance workflows with REST APIs for automation."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "Which southbound protocol does Cisco ACI use between the APIC controller and network devices?",
    options: ["OpenFlow", "NETCONF", "OpFlex", "RESTCONF"],
    correct: 2,
    explanation: "Cisco ACI uses OpFlex as the southbound protocol between the APIC controller and ACI switches. OpenFlow is used by other SDN solutions."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "In a spine-leaf data center architecture, how many hops does it take for any device to reach any other device?",
    options: ["1 hop", "2 hops", "3 hops", "Varies by design"],
    correct: 1,
    explanation: "Spine-leaf architecture provides exactly 2 hops between any two endpoints: leaf switch -> spine switch -> leaf switch."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "Which HTTP method is used to retrieve information without modifying anything?",
    options: ["POST", "PUT", "GET", "DELETE"],
    correct: 2,
    explanation: "GET retrieves information. It is read-only and should not have a request body or cause any changes on the server."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "What HTTP status code indicates a successful resource creation?",
    options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
    correct: 1,
    explanation: "201 Created indicates that a POST request successfully created a new resource. 200 OK is for successful GET/PUT/PATCH. 204 is for successful DELETE."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "Which HTTP method completely replaces an existing resource?",
    options: ["GET", "POST", "PUT", "PATCH"],
    correct: 2,
    explanation: "PUT replaces the entire resource with the data provided. PATCH only modifies specific fields. POST creates new resources."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "A REST API call returns status code 401. What does this mean?",
    options: ["The resource was not found", "Authentication is required", "The request was malformed", "The server encountered an error"],
    correct: 1,
    explanation: "401 Unauthorized means the client must authenticate before making the request. 403 Forbidden means authenticated but not permitted. 404 = not found. 400 = bad request."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "What header value should be set when sending JSON data in a REST API request body?",
    options: ["Accept: application/json", "Content-Type: application/json", "Authorization: Bearer", "Transfer-Encoding: json"],
    correct: 1,
    explanation: "Content-Type tells the server the format of the request body. 'Content-Type: application/json' indicates JSON data. 'Accept' tells the server what format the client expects back."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "Which data format is most commonly used by REST APIs?",
    options: ["XML", "YAML", "JSON", "CSV"],
    correct: 2,
    explanation: "JSON (JavaScript Object Notation) is the most common format for REST APIs. It is lightweight, human-readable, and supported by virtually all programming languages."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "In JSON, which characters define an object (key-value pairs)?",
    options: ["[] square brackets", "{} curly braces", "() parentheses", "<> angle brackets"],
    correct: 1,
    explanation: "JSON objects use curly braces {}. Arrays use square brackets []."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "Which data format uses significant indentation to define hierarchy?",
    options: ["JSON", "XML", "YAML", "CSV"],
    correct: 2,
    explanation: "YAML uses indentation (spaces only — never tabs) to define the document hierarchy. This makes it very readable but indentation errors cause parsing failures."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "Which data format is used by NETCONF?",
    options: ["JSON", "YAML", "XML", "CSV"],
    correct: 2,
    explanation: "NETCONF uses XML for its data encoding. YANG models define the structure. RESTCONF supports both JSON and XML."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "A YAML configuration file has mixed tabs and spaces for indentation. What will happen?",
    options: ["YAML ignores whitespace type", "It will cause a parsing error", "Tabs and spaces are interchangeable in YAML", "Only the first indentation level matters"],
    correct: 1,
    explanation: "YAML prohibits mixing tabs and spaces for indentation. Using tabs (or mixing) will cause a parsing/syntax error. Always use spaces only in YAML."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "On which port does NETCONF communicate?",
    options: ["TCP 22 (SSH)", "TCP 830", "UDP 161", "TCP 443"],
    correct: 1,
    explanation: "NETCONF uses SSH on TCP port 830. RESTCONF uses HTTPS on TCP port 443."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "What is YANG?",
    options: ["A southbound API protocol", "A data modeling language used with NETCONF/RESTCONF", "A configuration management tool like Ansible", "A JSON variant"],
    correct: 1,
    explanation: "YANG (Yet Another Next Generation) is a data modeling language that defines the structure of configuration and operational data. NETCONF and RESTCONF use YANG models to know what data can be configured."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "Which configuration management tool is agentless, using SSH to connect to devices?",
    options: ["Puppet", "Chef", "Ansible", "Salt"],
    correct: 2,
    explanation: "Ansible is agentless — it uses SSH (or REST APIs for network devices) without requiring any agent software on managed devices. Puppet and Chef require agents."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "In Ansible, what is a playbook?",
    options: ["The inventory file listing managed devices", "A YAML file containing ordered automation tasks", "The Ansible control node", "An encrypted secrets file"],
    correct: 1,
    explanation: "An Ansible playbook is a YAML file that defines the automation tasks to be executed on managed hosts (or network devices)."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "What NETCONF datastore contains the currently active device configuration?",
    options: ["startup", "candidate", "running", "baseline"],
    correct: 2,
    explanation: "The 'running' datastore contains the active, currently running configuration. 'candidate' is for proposed changes, 'startup' is loaded at boot."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "Which Git command saves staged changes to the local repository?",
    options: ["git push", "git add", "git commit", "git merge"],
    correct: 2,
    explanation: "'git commit' saves staged changes to the local repository with a commit message. 'git add' stages changes, 'git push' sends commits to remote, 'git merge' combines branches."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "RESTCONF compared to NETCONF uses which transport protocol?",
    options: ["SSH", "HTTPS", "Telnet", "SMTP"],
    correct: 1,
    explanation: "RESTCONF uses HTTPS (port 443). NETCONF uses SSH (port 830). RESTCONF is the REST-based alternative to NETCONF, supporting JSON or XML."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "What does the PATCH HTTP method do in a REST API?",
    options: ["Deletes a resource", "Replaces the entire resource", "Partially updates a resource", "Creates a new resource"],
    correct: 2,
    explanation: "PATCH only modifies specific fields in an existing resource, unlike PUT which replaces the entire resource."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "An API returns status 403. What does this mean?",
    options: ["The resource was not found", "Authentication failed", "Authenticated but not permitted to access the resource", "The server is overloaded"],
    correct: 2,
    explanation: "403 Forbidden means the client is authenticated but lacks permission to access the resource. 401 = needs auth, 404 = not found, 503 = server overloaded."
  },
  {
    domain: 6,
    topic: "REST APIs & HTTP",
    question: "Which HTTP method is idempotent?",
    options: ["POST", "GET", "PATCH", "Both GET and PUT"],
    correct: 3,
    explanation: "GET, PUT, DELETE, and PATCH are idempotent — calling them multiple times has the same effect as calling once. POST is NOT idempotent."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "What separates the control plane from the data plane in SDN?",
    options: ["A firewall", "Centralized controller with programmable interfaces", "A hardware appliance", "Manual configuration"],
    correct: 1,
    explanation: "SDN decouples the control plane (decision-making) from the data plane (packet forwarding). A centralized controller manages the network using programmable APIs."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "What does 'intent-based networking' mean?",
    options: ["Configuring each device manually", "Admins specify desired outcome and system handles configuration", "Using CLI commands exclusively", "A backup protocol for networks"],
    correct: 1,
    explanation: "Intent-based networking lets admins declare the desired state/outcome, and the SDN controller automatically translates it into device configurations."
  },
  {
    domain: 6,
    topic: "SDN & Controller-Based Networking",
    question: "In Cisco ACI, what is a 'tenant'?",
    options: ["A physical server", "A logical container for network policy and configuration", "A type of switch", "A routing protocol"],
    correct: 1,
    explanation: "In Cisco ACI, a tenant is a logical container that holds all network policy and configuration for a specific application or department, enabling multi-tenancy."
  },
  {
    domain: 6,
    topic: "NETCONF, RESTCONF & Configuration Management",
    question: "What is the purpose of the NETCONF 'candidate' datastore?",
    options: ["Stores the active running config", "Provides a staging area for proposed changes before applying", "Stores backup configurations from previous boots", "Holds temporary DHCP leases"],
    correct: 1,
    explanation: "The 'candidate' datastore allows administrators to make changes in a staging area, then commit them to 'running' when ready — enabling atomic config changes."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "In JSON, how do you represent a null/empty value?",
    options: ["empty string \"\"", "null", "undefined", "0"],
    correct: 1,
    explanation: "JSON uses the literal 'null' to represent an empty/missing value. It is distinct from 0, empty string, or false."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "Which JSON data type would hold a true/false value?",
    options: ["string", "number", "boolean", "object"],
    correct: 2,
    explanation: "JSON has 6 primitive data types: string, number, boolean (true/false), null, array, and object. true and false are boolean values."
  },
  {
    domain: 6,
    topic: "Data Formats — JSON, YAML & XML",
    question: "How do you represent a multi-line string in JSON?",
    options: ["Use triple quotes", "Use \\n escape sequences in a single string", "Use XML CDATA", "Use YAML literal block notation"],
    correct: 1,
    explanation: "JSON strings must be on a single line. Multi-line content uses escape sequences like \\n (newline). YAML has native multi-line support but JSON does not."
  },
  {
    domain: 5,
    topic: "Network Security Threats & Mitigation",
    question: "What is a 'zero-day' vulnerability?",
    options: ["A vulnerability that lasts only one day", "A vulnerability unknown to the vendor with no patch available", "A vulnerability found in day-zero of a product launch", "A vulnerability that affects zero devices"],
    correct: 1,
    explanation: "A zero-day vulnerability is one that is unknown to the software vendor and has no available patch. Attackers exploit it before the vendor can develop a fix."
  },
  {
    domain: 5,
    topic: "Network Security Threats & Mitigation",
    question: "Which attack involves intercepting communication between two parties?",
    options: ["DDoS", "Man-in-the-middle (MitM)", "Buffer overflow", "SQL injection"],
    correct: 1,
    explanation: "A man-in-the-middle (MitM) attack intercepts and potentially alters communication between two parties who believe they are directly communicating."
  },
  {
    domain: 5,
    topic: "Network Security Threats & Mitigation",
    question: "What is the primary defense against DNS spoofing?",
    options: ["Disable DNS", "DNSSEC (DNS Security Extensions)", "Use public Wi-Fi", "Enable DHCP snooping"],
    correct: 1,
    explanation: "DNSSEC adds cryptographic signatures to DNS records, allowing clients to verify that DNS responses are authentic and haven't been tampered with."
  },
  {
    domain: 5,
    topic: "Wireless Security",
    question: "What is the minimum WPA2 key length for a strong passphrase?",
    options: ["4 characters", "8 characters", "12 characters", "16 characters"],
    correct: 1,
    explanation: "WPA2-Personal requires a minimum of 8 characters (up to 63). While 8 is the minimum, longer passphrases (12+) are recommended for stronger security."
  },
  {
    domain: 5,
    topic: "Device Hardening",
    question: "What does 'banner login' display on a Cisco device?",
    options: ["A message after login", "A legal warning before login", "Device configuration details", "System uptime information"],
    correct: 1,
    explanation: "'banner login' displays a legal warning or notice that users must see before they can log in. It is used for legal protection and user awareness."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "TACACS+ separates which three security functions?",
    options: ["Encryption, Decryption, Key Exchange", "Authentication, Authorization, Accounting", "Discovery, Offer, Request", "Routing, Switching, Bridging"],
    correct: 1,
    explanation: "TACACS+ separates Authentication (who you are), Authorization (what you can do), and Accounting (what you did). This allows granular control — unlike RADIUS which combines authN and authZ."
  },
  {
    domain: 5,
    topic: "AAA, RADIUS & TACACS+",
    question: "What does 'aaa authorization exec' do?",
    options: ["Enables encryption for AAA", "Requires authorization before granting exec shell access", "Sets the exec timeout", "Configures AAA accounting"],
    correct: 1,
    explanation: "'aaa authorization exec' requires users to be authorized before being granted an executive shell session. It works with RADIUS/TACACS+ to control who can access privileged EXEC mode."
  },
  {
    domain: 5,
    topic: "VPN Concepts",
    question: "What are the two phases of IPsec/IKE negotiation?",
    options: ["Phase 1: encryption, Phase 2: decryption", "Phase 1: IKE SA establishment, Phase 2: IPsec SA establishment", "Phase 1: authentication, Phase 2: routing", "Phase 1: key exchange, Phase 2: packet forwarding"],
    correct: 1,
    explanation: "IKE Phase 1 establishes an IKE Security Association (encrypts the IKE channel). Phase 2 establishes IPsec SAs (encrypts actual data) within the secure IKE channel."
  },
  {
    domain: 5,
    topic: "Network Security Threats & Mitigation",
    question: "Which tool is used to detect and prevent unauthorized network access?",
    options: ["IDS/IPS (Intrusion Detection/Prevention System)", "DHCP server", "NTP server", "DNS resolver"],
    correct: 0,
    explanation: "An IDS detects suspicious activity and alerts, while an IPS actively blocks/prevents it. Both monitor network traffic for known attack patterns and anomalies."
  },
  {
    domain: 5,
    topic: "Network Security Threats & Mitigation",
    question: "What is 'social engineering' in cybersecurity?",
    options: ["Engineering social media posts", "Manipulating people to reveal confidential information", "A type of network protocol", "Automated security testing"],
    correct: 1,
    explanation: "Social engineering exploits human psychology to trick people into revealing sensitive information or performing actions that compromise security. Examples: phishing, pretexting, baiting."
  }
  ];