export const domains = [
  {
    id: 1,
    title: "Network Fundamentals",
    weight: "20%",
    icon: "🌐",
    description: "OSI/TCP-IP models, IPv4/IPv6 addressing, subnetting, Ethernet, wireless concepts",
    topics: [
      {
        title: "OSI & TCP/IP Models",
        content: `
## OSI Model — 7 Layers

| Layer | Name | PDU | Key Protocols / Devices | Function |
|-------|------|-----|------------------------|----------|
| 7 | Application | Data | HTTP, FTP, DNS, SMTP, DHCP, SSH | User-facing services |
| 6 | Presentation | Data | TLS/SSL, JPEG, ASCII, encryption | Data format, encryption |
| 5 | Session | Data | NetBIOS, RPC, SIP | Session establishment/teardown |
| 4 | Transport | Segment | TCP, UDP | End-to-end delivery, ports |
| 3 | Network | Packet | IP, ICMP — Routers | Logical addressing, routing |
| 2 | Data Link | Frame | Ethernet, MAC — Switches | Physical addressing, framing |
| 1 | Physical | Bit | Cables, Fiber, Hubs | Raw bit transmission |

**Memory trick (top-down):** "All People Seem To Need Data Processing"

---

## TCP/IP Model (4 Layers)

| TCP/IP Layer | OSI Equivalent | Protocols |
|---|---|---|
| Application | 7, 6, 5 | HTTP, HTTPS, FTP, DNS, DHCP, SMTP, SSH |
| Transport | 4 | TCP, UDP |
| Internet | 3 | IP, ICMP, ARP |
| Network Access | 2, 1 | Ethernet, Wi-Fi |

---

## TCP vs UDP

| Feature | TCP | UDP |
|---------|-----|-----|
| Connection | Connection-oriented (3-way handshake) | Connectionless |
| Reliability | Reliable — ACKs, retransmission | Unreliable |
| Ordering | Sequence numbers guarantee order | No ordering |
| Flow Control | Sliding window | None |
| Speed | Slower (overhead) | Faster |
| Use Cases | HTTP, HTTPS, FTP, SSH, Telnet, SMTP | DNS, DHCP, VoIP, TFTP, SNMP, streaming |

**TCP 3-Way Handshake:** SYN → SYN-ACK → ACK
**TCP 4-Way Teardown:** FIN → ACK → FIN → ACK

---

## Critical Port Numbers

| Protocol | Port | Transport |
|----------|------|-----------|
| FTP Data | 20 | TCP |
| FTP Control | 21 | TCP |
| SSH | 22 | TCP |
| Telnet | 23 | TCP |
| SMTP | 25 | TCP |
| DNS | 53 | TCP/UDP |
| DHCP Server | 67 | UDP |
| DHCP Client | 68 | UDP |
| TFTP | 69 | UDP |
| HTTP | 80 | TCP |
| NTP | 123 | UDP |
| SNMP | 161 | UDP |
| SNMP Trap | 162 | UDP |
| HTTPS | 443 | TCP |
| Syslog | 514 | UDP |
| RDP | 3389 | TCP |

---

## Encapsulation

- **Sending (top-down):** Data → Segment (L4 header) → Packet (L3 header) → Frame (L2 header+trailer) → Bits
- **Receiving (bottom-up):** Bits → Frame → Packet → Segment → Data

Each layer **adds a header** on send and **strips it** on receive.

---

## Exam Tips

- Routers operate at **Layer 3** — they read IP addresses and route packets
- Switches operate at **Layer 2** — they read MAC addresses and forward frames
- A **Layer 3 switch** can do routing between VLANs
- **ARP** maps a known IP address to an unknown MAC address
- **ICMP** is a Layer 3 protocol used by ping and traceroute
- Segments have port numbers; Packets have IP addresses; Frames have MAC addresses
`
      },
      {
        title: "IPv4 Addressing & Subnetting",
        content: `
## IPv4 Address Structure

32-bit address in dotted decimal (four octets 0-255):

\`\`\`
192.168.10.100 /24
Network: 192.168.10.0    Broadcast: 192.168.10.255    Hosts: .1 - .254
\`\`\`

## Address Classes

| Class | First Octet | Default Mask | Private Range |
|-------|-------------|--------------|---------------|
| A | 1-126 | /8 | 10.0.0.0/8 |
| B | 128-191 | /16 | 172.16.0.0 - 172.31.255.255 |
| C | 192-223 | /24 | 192.168.0.0/16 |
| D | 224-239 | N/A | Multicast |
| E | 240-255 | N/A | Experimental |

**Loopback:** 127.0.0.0/8 (127.0.0.1 most used)
**APIPA:** 169.254.0.0/16 — auto-assigned when DHCP fails

---

## Subnetting — Magic Number Method

1. Find the interesting octet (not 255 or 0 in the mask)
2. Block size = **256 minus mask value** in that octet
3. Count by block size to find the subnet

**Example:** Host = 192.168.1.200, Mask = /27 (255.255.255.224)
- Block size: 256 - 224 = **32**
- Subnets: 0, 32, 64, 96, 128, 160, **192**, 224
- Network: **192.168.1.192**, Broadcast: **192.168.1.223**, Hosts: .193-.222 (30 hosts)

---

## CIDR Reference Table

| Prefix | Subnet Mask | Hosts | Block Size |
|--------|-------------|-------|------------|
| /24 | 255.255.255.0 | 254 | 256 |
| /25 | 255.255.255.128 | 126 | 128 |
| /26 | 255.255.255.192 | 62 | 64 |
| /27 | 255.255.255.224 | 30 | 32 |
| /28 | 255.255.255.240 | 14 | 16 |
| /29 | 255.255.255.248 | 6 | 8 |
| /30 | 255.255.255.252 | 2 | 4 |
| /31 | 255.255.255.254 | 2 (no broadcast) | 2 |
| /32 | 255.255.255.255 | Host route | 1 |

**Usable hosts = 2^(host bits) - 2**

---

## Wildcard Masks

Wildcard = **255.255.255.255 minus subnet mask**

| Subnet Mask | Wildcard |
|-------------|----------|
| 255.255.255.0 | 0.0.0.255 |
| 255.255.255.128 | 0.0.0.127 |
| 255.255.255.192 | 0.0.0.63 |
| 255.255.255.224 | 0.0.0.31 |
| 255.255.255.240 | 0.0.0.15 |
| 255.255.255.252 | 0.0.0.3 |

- **0 bit** = must match exactly
- **1 bit** = any value allowed
- \`host 10.1.1.1\` = \`10.1.1.1 0.0.0.0\`
- \`any\` = \`0.0.0.0 255.255.255.255\`

---

## VLSM (Variable Length Subnet Masking)

Allocate largest subnets first to avoid waste.

**Example:** 10.0.0.0/24, need: 100 hosts, 50 hosts, 25 hosts, 2 hosts
1. 100 hosts -> /25 (126 hosts) -> 10.0.0.0/25
2. 50 hosts -> /26 (62 hosts) -> 10.0.0.128/26
3. 25 hosts -> /27 (30 hosts) -> 10.0.0.192/27
4. 2 hosts -> /30 (2 hosts) -> 10.0.0.224/30

---

## Exam Tips

- Practice subnetting until you can do it in under 30 seconds per question
- /31 is valid for point-to-point links (RFC 3021) — no network/broadcast
- /32 = host route (single IP address)
- Private addresses require **NAT** to reach the internet
`
      },
      {
        title: "IPv6 Addressing",
        content: `
## IPv6 Basics

IPv6 uses **128-bit** addresses in 8 groups of 4 hex digits:

\`\`\`
Full:       2001:0DB8:0000:0001:0000:0000:0000:0001
Compressed: 2001:DB8:0:1::1
\`\`\`

**Compression rules:**
1. Remove leading zeros per group: \`0DB8\` becomes \`DB8\`
2. Replace ONE longest run of consecutive all-zero groups with \`::\`

---

## IPv6 Address Types

| Type | Prefix | Description |
|------|--------|-------------|
| Global Unicast | 2000::/3 | Internet-routable (starts with 2 or 3) |
| Link-Local | FE80::/10 | Auto-assigned, non-routable, required |
| Unique Local | FC00::/7 | Private (like RFC 1918) |
| Loopback | ::1/128 | Like 127.0.0.1 |
| Multicast | FF00::/8 | One-to-many delivery |

**Key multicast addresses:**
- \`FF02::1\` — All IPv6 nodes
- \`FF02::2\` — All routers
- \`FF02::5\` — All OSPF routers
- \`FF02::A\` — All EIGRP routers

---

## EUI-64 Address Generation

Converts 48-bit MAC to 64-bit Interface ID:
1. Split MAC in half: \`AA:BB:CC\` | \`DD:EE:FF\`
2. Insert \`FF:FE\` in middle: \`AA:BB:CC:FF:FE:DD:EE:FF\`
3. Flip bit 7 (U/L bit) of first byte
4. Combine with /64 prefix

---

## NDP (Neighbor Discovery Protocol)

Replaces ARP in IPv6, uses ICMPv6:

| Message | Purpose |
|---------|---------|
| Router Solicitation (RS) | Host asks for router info |
| Router Advertisement (RA) | Router sends prefix, gateway info |
| Neighbor Solicitation (NS) | Like ARP request — find MAC for IP |
| Neighbor Advertisement (NA) | Like ARP reply — respond with MAC |

---

## IPv6 Configuration

\`\`\`
ipv6 unicast-routing

interface GigabitEthernet0/0
  ipv6 address 2001:DB8:1:1::1/64
  ipv6 address FE80::1 link-local
  no shutdown

ipv6 route 2001:DB8:2::/48 2001:DB8:1::2
ipv6 route ::/0 2001:DB8:1::1

show ipv6 interface brief
show ipv6 route
\`\`\`

---

## Exam Tips

- Every IPv6 interface automatically gets a **link-local** address
- Link-locals are used for **routing protocol neighbors** and **NDP**
- IPv6 has **no broadcast** — uses multicast
- \`::/0\` is the IPv6 default route
- **Dual-stack** = device runs both IPv4 and IPv6 simultaneously
`
      },
      {
        title: "Ethernet & Switching Fundamentals",
        content: `
## Ethernet Frame Structure

\`\`\`
| Preamble(7) | SFD(1) | Dest MAC(6) | Src MAC(6) | Type(2) | Data(46-1500) | FCS(4) |
\`\`\`

- **Type field**: 0x0800=IPv4, 0x86DD=IPv6, 0x0806=ARP, 0x8100=802.1Q tag
- **FCS**: CRC error detection — frame discarded if bad
- **Min frame**: 64 bytes | **Max frame**: 1518 bytes (1522 with 802.1Q tag)

---

## MAC Addresses

- 48-bit, written as \`AA:BB:CC:DD:EE:FF\` or \`AABB.CCDD.EEFF\` (Cisco)
- First 24 bits = **OUI** (manufacturer ID)
- **FF:FF:FF:FF:FF:FF** = Layer 2 broadcast

---

## How a Switch Operates

| Action | Trigger |
|--------|---------|
| **Learn** | Record source MAC + ingress port in MAC table |
| **Forward** | Destination MAC is in table — send to that port |
| **Flood** | Destination MAC unknown, or broadcast/multicast — send to all except source |
| **Filter** | Source and destination on same port — drop frame |

\`\`\`
show mac address-table
show mac address-table dynamic
clear mac address-table dynamic
\`\`\`

---

## Ethernet Standards

| Standard | Speed | Medium | Max Distance |
|----------|-------|--------|--------------|
| 100BASE-TX | 100 Mbps | Cat5 UTP | 100m |
| 1000BASE-T | 1 Gbps | Cat5e/6 UTP | 100m |
| 1000BASE-SX | 1 Gbps | Multimode fiber | 550m |
| 1000BASE-LX | 1 Gbps | Single-mode fiber | 5km |
| 10GBASE-T | 10 Gbps | Cat6a UTP | 100m |

---

## ARP (Address Resolution Protocol)

Maps known **IP to unknown MAC**:
1. Host A broadcasts: "Who has 10.1.1.1?"
2. Target 10.1.1.1 unicasts back: "I'm at AA:BB:CC:DD:EE:FF"
3. Host A caches in ARP table

\`\`\`
show arp
show ip arp
\`\`\`

**Gratuitous ARP**: Unsolicited ARP reply — used by HSRP on failover to update neighbor caches

---

## Exam Tips

- A switch builds its MAC table from **source** MAC addresses
- Unknown unicast, broadcast, and multicast frames are all **flooded**
- Each switch port is its own **collision domain**
- Routers create separate **broadcast domains**
- **Half-duplex** uses CSMA/CD; **full-duplex** does not
`
      },
      {
        title: "Wireless Networking Fundamentals",
        content: `
## 802.11 Standards

| Standard | Band | Max Speed | Key Feature |
|----------|------|-----------|-------------|
| 802.11b | 2.4 GHz | 11 Mbps | Legacy |
| 802.11a | 5 GHz | 54 Mbps | Less congestion |
| 802.11g | 2.4 GHz | 54 Mbps | Backward compatible with b |
| 802.11n (Wi-Fi 4) | 2.4 / 5 GHz | 600 Mbps | MIMO, channel bonding |
| 802.11ac (Wi-Fi 5) | **5 GHz only** | 3.5 Gbps | MU-MIMO |
| 802.11ax (Wi-Fi 6) | 2.4 / 5 / 6 GHz | 9.6 Gbps | OFDMA |

---

## Key Wireless Concepts

| Term | Definition |
|------|-----------|
| **SSID** | Network name that clients see and connect to |
| **BSSID** | MAC address of the AP radio |
| **BSS** | Basic Service Set — one AP and its clients |
| **ESS** | Extended Service Set — multiple APs sharing same SSID (roaming) |
| **IBSS** | Ad-hoc mode — devices talk directly, no AP |

**Non-overlapping 2.4 GHz channels:** **1, 6, 11**

---

## AP Deployment Modes

| Mode | Description |
|------|-------------|
| **Autonomous AP** | Standalone, full config on each AP |
| **Lightweight AP (LAP)** | Managed by WLC via CAPWAP |
| **FlexConnect** | LAP that can locally switch traffic if WLC unreachable |

---

## CAPWAP

Protocol between Lightweight APs and Wireless LAN Controller (WLC):

- **Control channel** (UDP 5246) — encrypted with DTLS
- **Data channel** (UDP 5247) — client traffic tunneled to WLC

**AP join process:**
1. AP gets IP via DHCP
2. AP discovers WLC (DHCP option 43, DNS, or broadcast)
3. CAPWAP tunnel established
4. AP downloads config from WLC

---

## Exam Tips

- **802.11ac is 5 GHz ONLY** — classic exam trap
- CAPWAP control port: **5246**, data port: **5247**
- WLC centralizes: roaming, RF management, security policy, firmware
- Wi-Fi 6 (802.11ax) uses **OFDMA** to serve multiple clients simultaneously
- Co-channel interference (same channel) is worse than adjacent-channel
`
      }
    ]
  },
  {
    id: 2,
    title: "Network Access",
    weight: "20%",
    icon: "🔌",
    description: "VLANs, STP, EtherChannel, wireless LAN architecture, switch security",
    topics: [
      {
        title: "VLANs & Trunking",
        content: `
## What is a VLAN?

A VLAN logically segments a switch into multiple broadcast domains.

**Benefits:** Separate broadcast traffic, group users logically, reduce broadcast domain size

---

## Port Types

| Port Type | Description | Carries |
|-----------|-------------|---------|
| **Access port** | Connects to end devices | One VLAN only |
| **Trunk port** | Connects switches, routers | Multiple VLANs |
| **Voice port** | Access port with separate voice VLAN | Data + Voice VLANs |

---

## 802.1Q Trunking

Adds a **4-byte tag** to identify VLAN (VLAN ID: 12 bits, supports 1-4094).

**Native VLAN**: One VLAN per trunk that crosses **untagged** (default VLAN 1). Must match on both ends.

---

## VLAN Configuration

\`\`\`
vlan 10
  name USERS
vlan 20
  name SERVERS

interface GigabitEthernet0/1
  switchport mode access
  switchport access vlan 10
  switchport nonegotiate

interface GigabitEthernet0/24
  switchport trunk encapsulation dot1q
  switchport mode trunk
  switchport trunk native vlan 99
  switchport trunk allowed vlan 10,20,99

interface GigabitEthernet0/5
  switchport mode access
  switchport access vlan 10
  switchport voice vlan 100

show vlan brief
show interfaces trunk
\`\`\`

---

## DTP Modes

| Mode | Behavior |
|------|----------|
| **trunk** | Always trunk |
| **access** | Always access |
| **dynamic desirable** | Actively tries to form trunk |
| **dynamic auto** | Passively waits (default) |
| **nonegotiate** | No DTP frames |

---

## VTP Modes

| Mode | Creates VLANs | Syncs from Server |
|------|--------------|-------------------|
| **Server** | Yes | Yes |
| **Client** | No | Yes |
| **Transparent** | Yes (local only) | No |
| **Off** | Yes (local only) | No |

**Risk**: Higher VTP revision number overwrites lower — adding a rogue switch can wipe VLAN database!

---

## Inter-VLAN Routing

**Router-on-a-Stick:**
\`\`\`
interface GigabitEthernet0/0.10
  encapsulation dot1Q 10
  ip address 192.168.10.1 255.255.255.0
\`\`\`

**Layer 3 Switch (SVIs):**
\`\`\`
ip routing

interface Vlan10
  ip address 192.168.10.1 255.255.255.0
  no shutdown
\`\`\`

---

## Exam Tips

- VLANs 1 and 1002-1005 are **reserved** and cannot be deleted
- Native VLAN mismatch causes traffic in wrong VLAN
- Trunk ports carry **all VLANs by default** unless pruned
- Layer 3 switches with SVIs are preferred for inter-VLAN routing
`
      },
      {
        title: "Spanning Tree Protocol (STP & RSTP)",
        content: `
## Why STP?

Redundant Layer 2 links cause **broadcast storms** and **MAC table instability**. STP prevents loops by blocking redundant paths.

---

## STP (802.1D) Election Process

**Step 1: Elect Root Bridge** — Lowest Bridge ID (Priority + MAC). Default priority: **32768**

**Step 2: Root Ports** — One per non-root switch; lowest cost path to Root Bridge

**Step 3: Designated Ports** — One per segment; forwards toward Root Bridge

**Step 4: Block** — All remaining ports go to Blocking state

---

## STP Port States (802.1D)

| State | Duration | Action |
|-------|----------|--------|
| **Blocking** | 20 sec max age | Receives BPDUs only |
| **Listening** | 15 sec | BPDU exchange, no forwarding |
| **Learning** | 15 sec | Learns MACs, no forwarding |
| **Forwarding** | Stable | Normal operation |

**Convergence time:** Up to **50 seconds**

---

## STP Port Costs

| Speed | Cost |
|-------|------|
| 10 Mbps | 100 |
| 100 Mbps | 19 |
| 1 Gbps | 4 |
| 10 Gbps | 2 |

---

## RSTP (802.1w) — Rapid STP

Converges in **1-2 seconds** instead of 50.

| RSTP Port Role | Description |
|---------------|-------------|
| **Root Port** | Best path to Root Bridge |
| **Designated Port** | Forwards toward root on segment |
| **Alternate Port** | Backup Root Port |
| **Backup Port** | Backup Designated Port |

**RSTP States:** Discarding | Learning | Forwarding (only 3!)

---

## STP Enhancements

| Feature | Function |
|---------|----------|
| **PortFast** | Skip Listening/Learning on access ports |
| **BPDU Guard** | Shutdown port if BPDU received |
| **Root Guard** | Prevent port becoming Root Port |
| **Loop Guard** | Prevent alternate port transitioning if BPDUs stop |

---

## STP Configuration

\`\`\`
spanning-tree vlan 10 priority 4096
spanning-tree vlan 10 root primary

interface GigabitEthernet0/1
  spanning-tree portfast
  spanning-tree bpduguard enable

spanning-tree portfast default
spanning-tree portfast bpduguard default

interface GigabitEthernet0/2
  spanning-tree vlan 10 cost 10

show spanning-tree
show spanning-tree vlan 10
show spanning-tree summary
\`\`\`

---

## Exam Tips

- Root Bridge: **lowest priority** wins; tie = **lowest MAC address**
- PortFast only on **access ports** (never trunk links)
- BPDU Guard error-disables port if BPDU arrives
- RSTP is backward compatible with 802.1D
- Rapid PVST+ is the default on modern Cisco switches
`
      },
      {
        title: "EtherChannel",
        content: `
## What is EtherChannel?

Bundles multiple physical links into one **logical link** for increased bandwidth and redundancy. STP sees it as a single link.

---

## Protocols

| Protocol | Standard | Modes |
|----------|----------|-------|
| **LACP** (802.3ad) | IEEE | Active / Passive |
| **PAgP** | Cisco | Desirable / Auto |
| **Static** | None | On / On |

**LACP:** Active+Active or Active+Passive = forms channel. Passive+Passive = no channel.

**PAgP:** Desirable+Desirable or Desirable+Auto = forms. Auto+Auto = no channel.

---

## Configuration

\`\`\`
interface range GigabitEthernet0/1 - 2
  channel-group 1 mode active           ! LACP

interface range GigabitEthernet0/3 - 4
  channel-group 2 mode desirable        ! PAgP

interface Port-channel 1
  switchport mode trunk
  switchport trunk native vlan 99
  switchport trunk allowed vlan 10,20,99

port-channel load-balance src-dst-ip

show etherchannel summary
show etherchannel detail
\`\`\`

---

## Requirements

All member ports must have **identical** configuration:
- Speed and duplex
- VLAN configuration
- STP settings

---

## Exam Tips

- EtherChannel = **single logical link** in STP — no ports blocked
- LACP is preferred in multi-vendor environments
- **On + On** (static) has no negotiation — misconfiguration risk
- Configure trunk/access on the **Port-Channel interface**, not individual ports
`
      },
      {
        title: "Wireless LAN Architecture",
        content: `
## Autonomous vs Controller-Based

| Feature | Autonomous AP | Lightweight AP + WLC |
|---------|--------------|---------------------|
| Configuration | Per-AP | Centralized at WLC |
| Roaming | Basic | Seamless |
| RF Management | Manual | Auto-optimized |
| Scalability | Low | High |

---

## WLC Interfaces

| Interface | Purpose |
|-----------|---------|
| **Management** | WLC management (SSH, web GUI) |
| **AP Manager** | CAPWAP communication with APs |
| **Virtual** | DHCP relay, web auth (169.254.1.1) |
| **Service Port** | Out-of-band management |
| **Dynamic** | Maps SSIDs to VLANs |

---

## WLC Deployment Models

| Model | Description |
|-------|-------------|
| **Centralized** | WLC in data center; all traffic tunneled |
| **Cloud-based** | WLC in cloud (Cisco Meraki) |
| **Embedded** | WLC inside a switch |
| **Mobility Express** | WLC software on capable AP |

---

## FlexConnect

Allows APs to operate locally when WLC link fails:
- **Central switching** — traffic tunneled to WLC (normal)
- **Local switching** — client traffic switched locally at AP
- **Local auth** — AP authenticates if WLC unreachable

---

## SSID to VLAN Mapping

\`\`\`
SSID: CORP  -> WLAN Profile -> Dynamic Interface -> VLAN 10
SSID: GUEST -> WLAN Profile -> Dynamic Interface -> VLAN 99
\`\`\`

---

## Exam Tips

- CAPWAP: UDP **5246** (control, encrypted) and **5247** (data)
- AP joins WLC: DHCP option 43 -> DNS -> broadcast
- WLC **virtual interface** IP is always 169.254.1.1
- In centralized mode, all client traffic goes to WLC even between local clients
`
      },
      {
        title: "Switch Security",
        content: `
## Port Security

\`\`\`
interface GigabitEthernet0/1
  switchport mode access
  switchport port-security
  switchport port-security maximum 2
  switchport port-security mac-address sticky
  switchport port-security violation restrict

show port-security
show port-security interface GigabitEthernet0/1
\`\`\`

**Violation Modes:**

| Mode | Action | Increments Counter |
|------|--------|-------------------|
| **Protect** | Drop unknown MACs | No |
| **Restrict** | Drop + log/SNMP | Yes |
| **Shutdown** (default) | Error-disable port | Yes |

**Recovery from err-disabled:**
\`\`\`
interface GigabitEthernet0/1
  shutdown
  no shutdown

errdisable recovery cause psecure-violation
errdisable recovery interval 300
\`\`\`

---

## DHCP Snooping

Prevents rogue DHCP servers.

- **Trusted port**: Uplinks to legitimate DHCP server
- **Untrusted port**: Client ports — only DHCP Requests allowed

\`\`\`
ip dhcp snooping
ip dhcp snooping vlan 10,20

interface GigabitEthernet0/24
  ip dhcp snooping trust

show ip dhcp snooping binding
\`\`\`

---

## Dynamic ARP Inspection (DAI)

Validates ARP packets using DHCP Snooping binding table. Prevents ARP spoofing.

\`\`\`
ip arp inspection vlan 10,20

interface GigabitEthernet0/24
  ip arp inspection trust

show ip arp inspection
\`\`\`

---

## Best Practices

| Practice | Protection Against |
|----------|--------------------|
| Port Security | MAC flooding, unauthorized devices |
| DHCP Snooping | Rogue DHCP servers |
| DAI | ARP spoofing, man-in-the-middle |
| Disable unused ports | Physical access attacks |
| Change native VLAN from 1 | VLAN hopping |
| Disable DTP on access ports | VLAN hopping via trunk negotiation |

---

## Exam Tips

- DHCP Snooping must be enabled **before** DAI
- Port security **sticky** saves learned MACs to running config
- Default violation mode is **shutdown** (err-disabled)
- Trunk ports are typically **trusted** for DHCP Snooping
`
      }
    ]
  },
  {
    id: 3,
    title: "IP Connectivity",
    weight: "25%",
    icon: "🔀",
    description: "Static routing, OSPFv2, NAT/PAT, IPv6 routing — the highest-weighted domain",
    topics: [
      {
        title: "Static Routing",
        content: `
## Routing Table Basics

\`\`\`
show ip route
show ip route 192.168.10.0
show ip route summary
\`\`\`

**Route codes:** C=Connected, L=Local, S=Static, O=OSPF, D=EIGRP, R=RIP, B=BGP

---

## Administrative Distance (AD)

| Source | AD |
|--------|-----|
| Connected | 0 |
| Static | 1 |
| EIGRP Internal | 90 |
| OSPF | 110 |
| RIP | 120 |
| EIGRP External | 170 |

---

## Longest Prefix Match

Router always chooses the **most specific** matching route.
Destination 10.1.1.5 matches 10.0.0.0/8, 10.1.0.0/16, AND 10.1.1.0/24 — router picks **/24**.

---

## Static Route Configuration

\`\`\`
! Next-hop IP
ip route 192.168.2.0 255.255.255.0 10.0.0.2

! Exit interface
ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1

! Both (fully specified)
ip route 192.168.2.0 255.255.255.0 GigabitEthernet0/1 10.0.0.2

! Default route
ip route 0.0.0.0 0.0.0.0 10.0.0.1

! Floating static (backup, higher AD)
ip route 192.168.2.0 255.255.255.0 10.0.0.3 150

! IPv6 static
ipv6 route 2001:DB8:2::/48 2001:DB8:1::2
ipv6 route ::/0 2001:DB8:1::1
\`\`\`

---

## Exam Tips

- Default route **0.0.0.0 0.0.0.0** = **gateway of last resort**
- Floating static AD must be **higher** than primary protocol's AD
- Connected routes are installed automatically when interface comes up
- The **local route** (/32) is the router's own interface IP
`
      },
      {
        title: "OSPFv2 — Single Area",
        content: `
## OSPF Overview

Link-state protocol. Builds complete map (LSDB) and runs Dijkstra SPF algorithm.
- **AD = 110**, metric = cost (based on bandwidth)
- Cost = **Reference Bandwidth / Interface Bandwidth** (default ref = 100 Mbps)

| Interface | Cost (default) |
|-----------|---------------|
| Serial (1.544M) | 64 |
| FastEthernet | 1 |
| GigabitEthernet | 1 (same as FE!) |

Fix: \`auto-cost reference-bandwidth 10000\` on all routers

---

## OSPF Neighbor States

| State | Meaning |
|-------|---------|
| **Down** | No hello received |
| **Init** | Hello received, RID not in it |
| **2-Way** | Bidirectional; DR/BDR elected here |
| **ExStart** | Master/slave election |
| **Exchange** | Exchanging DBDs |
| **Loading** | Requesting missing LSAs |
| **Full** | Synchronized — fully adjacent |

---

## DR/BDR Election

On broadcast (Ethernet) networks:
- **DR**: All routers form adjacency with DR
- **BDR**: Backup — takes over if DR fails
- **DROther**: Only 2-Way with other DROthers

Election: Highest **priority** (default 1; 0 = never DR), tie = highest **Router ID**. **Non-preemptive.**

---

## Router ID Selection

1. Manually: \`router-id X.X.X.X\`
2. Highest **loopback** IP
3. Highest **active interface** IP

---

## OSPF Configuration

\`\`\`
router ospf 1
  router-id 1.1.1.1
  network 192.168.1.0 0.0.0.255 area 0
  passive-interface GigabitEthernet0/1
  default-information originate
  auto-cost reference-bandwidth 10000

interface GigabitEthernet0/0
  ip ospf 1 area 0
  ip ospf priority 255
  ip ospf cost 10
  ip ospf hello-interval 5
  ip ospf dead-interval 20

show ip ospf neighbor
show ip ospf interface GigabitEthernet0/0
show ip ospf database
show ip route ospf
\`\`\`

---

## Hello Requirements (Must Match for Adjacency)

Area ID, Hello interval, Dead interval, Authentication, Subnet, Stub area flag

**Defaults:** Hello = 10s, Dead = 40s (broadcast); Hello = 30s, Dead = 120s (NBMA)

---

## Exam Tips

- Process ID has **local significance only** — doesn't need to match
- **Area 0** is required — all areas must connect to it
- Passive interface: **no hellos**, but network is still **advertised**
- DR/BDR election only on **broadcast** networks (not point-to-point)
- On point-to-point links, both routers go directly to **Full** state
`
      },
      {
        title: "OSPFv2 — Multi-Area",
        content: `
## Why Multiple Areas?

Large single area: big LSDB, slow SPF, every change triggers recalculation everywhere.
Areas contain LSA flooding and SPF scope.

---

## OSPF Router Types

| Router Type | Description |
|-------------|-------------|
| **Internal Router** | All interfaces in same area |
| **ABR** | Area Border Router — connects 2+ areas |
| **ASBR** | Autonomous System BR — connects OSPF to external routing |
| **Backbone Router** | Has interface in Area 0 |

---

## LSA Types

| Type | Name | Origin | Scope |
|------|------|---------|-------|
| **1** | Router LSA | All routers | Intra-area only |
| **2** | Network LSA | DR | Intra-area only |
| **3** | Summary LSA | ABR | Inter-area |
| **4** | ASBR Summary | ABR | Tells others where ASBR is |
| **5** | AS External | ASBR | Entire OSPF domain |
| **7** | NSSA External | ASBR in NSSA | NSSA area only (converted to Type 5 at ABR) |

---

## Area Types

| Area Type | Blocks | Receives |
|-----------|--------|---------|
| **Standard** | Nothing | All LSA types |
| **Stub** | Types 4, 5 | Default route from ABR |
| **Totally Stubby** | Types 3, 4, 5 (Cisco) | Default route only |
| **NSSA** | Types 4, 5 | Allows Type 7 from ASBR |
| **Totally NSSA** | Types 3, 4, 5 | Default route + Type 7 |

---

## Multi-Area Configuration

\`\`\`
! ABR connecting Area 0 and Area 1
router ospf 1
  router-id 1.1.1.1
  network 10.0.0.0 0.0.0.3 area 0
  network 10.1.0.0 0.0.0.3 area 1
  area 1 stub                          ! Stub area (all area 1 routers)
  area 1 stub no-summary               ! Totally stubby (ABR only)
  area 1 range 192.168.0.0 255.255.0.0 ! Summarize at ABR

show ip ospf database summary
show ip ospf border-routers
\`\`\`

---

## Exam Tips

- All inter-area traffic must pass through **Area 0**
- ABR generates **Type 3 LSAs** — they are not flooded from area to area
- Stub areas block Type 4 and 5; receive a default route from ABR
- Totally Stubby additionally blocks Type 3 — simplest for spoke areas
- Virtual links can connect non-contiguous areas to Area 0 through a transit area
`
      },
      {
        title: "NAT & PAT",
        content: `
## Why NAT?

Private IPv4 addresses (RFC 1918) are not internet-routable. NAT translates private to public at the border router.

---

## NAT Terminology

| Term | Definition |
|------|-----------|
| **Inside Local** | Private IP of internal host (before translation) |
| **Inside Global** | Public IP representing internal host (after translation) |
| **Outside Local** | Destination IP as seen from inside |
| **Outside Global** | Actual public IP of external destination |

---

## NAT Types

### Static NAT — One-to-one permanent mapping
\`\`\`
ip nat inside source static 192.168.1.10 203.0.113.10

interface GigabitEthernet0/0
  ip nat inside
interface GigabitEthernet0/1
  ip nat outside
\`\`\`

### Dynamic NAT — Pool of IPs assigned as needed
\`\`\`
ip nat pool PUBLIC_POOL 203.0.113.1 203.0.113.10 netmask 255.255.255.0
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 pool PUBLIC_POOL
\`\`\`

### PAT (NAT Overload) — Many-to-one, most common
\`\`\`
access-list 1 permit 192.168.0.0 0.0.255.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
\`\`\`

---

## Verification

\`\`\`
show ip nat translations
show ip nat statistics
clear ip nat translations *
debug ip nat
\`\`\`

---

## Exam Tips

- **PAT** differentiates sessions using **source port numbers**
- Static NAT is for servers needing a consistent public IP
- NAT breaks **end-to-end connectivity** — problematic for IPsec, VoIP
- Must configure **ip nat inside** and **ip nat outside** on correct interfaces
- IPv6 eliminates the need for NAT (abundant addresses)
`
      },
      {
        title: "IPv6 Routing",
        content: `
## Enabling IPv6 Routing

\`\`\`
ipv6 unicast-routing      ! Must enable — off by default
\`\`\`

---

## IPv6 Static Routes

\`\`\`
! Next-hop global unicast
ipv6 route 2001:DB8:2::/48 2001:DB8:1::2

! Next-hop link-local (must specify exit interface!)
ipv6 route 2001:DB8:2::/48 GigabitEthernet0/0 FE80::2

! Default route
ipv6 route ::/0 2001:DB8:1::1

! Floating static (AD=200)
ipv6 route 2001:DB8:2::/48 2001:DB8:3::2 200

show ipv6 route
show ipv6 route static
\`\`\`

---

## OSPFv3

Same concepts as OSPFv2 but for IPv6:
- Uses **link-local addresses** for adjacencies
- Enabled per-interface

\`\`\`
ipv6 router ospf 1
  router-id 1.1.1.1

interface GigabitEthernet0/0
  ipv6 ospf 1 area 0

show ipv6 ospf neighbor
show ipv6 route ospf
\`\`\`

---

## Dual-Stack Operation

\`\`\`
interface GigabitEthernet0/0
  ip address 192.168.1.1 255.255.255.0
  ipv6 address 2001:DB8:1::1/64
  ipv6 enable
  no shutdown
\`\`\`

---

## IPv6 Transition Mechanisms

| Mechanism | Description |
|-----------|-------------|
| **Dual-stack** | Device runs both IPv4 and IPv6 |
| **Tunneling** | IPv6 encapsulated in IPv4 (GRE, 6to4) |
| **Translation** | NAT64 converts between IPv4 and IPv6 |

---

## Exam Tips

- **Link-local required** for OSPFv3 and EIGRPv6 adjacencies
- When using link-local as next-hop, you **must** specify the exit interface
- \`ipv6 unicast-routing\` required to route IPv6 — easy to forget
- \`::/0\` is the IPv6 default route
`
      }
    ]
  },
  {
    id: 4,
    title: "IP Services",
    weight: "10%",
    icon: "⚙️",
    description: "DHCP, DNS, NTP, SNMP, Syslog, HSRP/VRRP/GLBP, QoS",
    topics: [
      {
        title: "DHCP",
        content: `
## DHCP Operation — DORA

| Step | Message | Direction | Description |
|------|---------|-----------|-------------|
| **D**iscover | DHCPDISCOVER | Client -> Broadcast | Client looking for DHCP server |
| **O**ffer | DHCPOFFER | Server -> Broadcast | Server offers an IP address |
| **R**equest | DHCPREQUEST | Client -> Broadcast | Client accepts the offer |
| **A**cknowledge | DHCPACK | Server -> Client | Server confirms lease |

**Ports:** Server = UDP **67**, Client = UDP **68**

---

## DHCPv4 Server Configuration

\`\`\`
ip dhcp excluded-address 192.168.1.1 192.168.1.20

ip dhcp pool LAN_POOL
  network 192.168.1.0 255.255.255.0
  default-router 192.168.1.1
  dns-server 8.8.8.8 8.8.4.4
  domain-name ccna.local
  lease 7

show ip dhcp pool
show ip dhcp binding
show ip dhcp conflict
\`\`\`

---

## DHCP Relay Agent

\`\`\`
interface GigabitEthernet0/0
  ip helper-address 10.0.0.100        ! DHCP server IP
\`\`\`

\`ip helper-address\` also relays: DNS(53), TFTP(69), Time(37), NetBIOS(137,138)

---

## DHCPv6

\`\`\`
ipv6 dhcp pool IPV6_POOL
  address prefix 2001:DB8:1::/64
  dns-server 2001:4860:4860::8888

interface GigabitEthernet0/0
  ipv6 dhcp server IPV6_POOL
  ipv6 nd managed-config-flag          ! Stateful DHCPv6
  ! ipv6 nd other-config-flag          ! Stateless — SLAAC + DNS from DHCPv6
\`\`\`

---

## Exam Tips

- DHCP Discover and Request are **broadcasts** (255.255.255.255)
- APIPA (169.254.x.x) means client **could not reach a DHCP server**
- Client renews at **50%** of lease time (T1), tries another server at **87.5%** (T2)
- \`ip helper-address\` converts broadcast to unicast for forwarding
`
      },
      {
        title: "DNS, NTP & SNMP/Syslog",
        content: `
## DNS Record Types

| Record | Purpose |
|--------|---------|
| **A** | Hostname to IPv4 |
| **AAAA** | Hostname to IPv6 |
| **CNAME** | Alias to another hostname |
| **MX** | Mail server |
| **PTR** | IP to hostname (reverse lookup) |
| **NS** | Authoritative nameserver |

DNS uses **UDP port 53** (TCP for large responses and zone transfers)

\`\`\`
ip domain-name cisco.local
ip name-server 8.8.8.8 8.8.4.4
show hosts
\`\`\`

---

## NTP (Network Time Protocol) — UDP 123

**Stratum levels:** 0 = Atomic/GPS (reference), 1 = directly connected to 0, 16 = unsynchronized

\`\`\`
ntp server 216.239.35.0 prefer
ntp master 3                          ! Act as stratum 3

! NTP Authentication
ntp authenticate
ntp authentication-key 1 md5 NTPpass
ntp trusted-key 1
ntp server 10.0.0.1 key 1

show ntp status
show ntp associations
\`\`\`

---

## SNMP (Simple Network Management Protocol)

**UDP 161** (polling) and **162** (traps)

| Version | Security |
|---------|----------|
| SNMPv1 | Community string (cleartext) |
| SNMPv2c | Community string (cleartext) — most common |
| **SNMPv3** | Username/password, **encrypted** |

**Operations:** Get, GetNext, GetBulk, Set, **Trap** (no ACK), **Inform** (requires ACK)

\`\`\`
snmp-server community PUBLIC ro
snmp-server community PRIVATE rw
snmp-server host 10.0.0.50 version 2c PUBLIC
snmp-server enable traps

! SNMPv3
snmp-server group ADMINS v3 priv
snmp-server user NETADMIN ADMINS v3 auth sha AuthPass priv aes 128 PrivPass

show snmp
\`\`\`

---

## Syslog Severity Levels — UDP 514

| Level | Name | Memory Trick |
|-------|------|-------------|
| 0 | Emergency | **E**very |
| 1 | Alert | **A**wful |
| 2 | Critical | **C**isco |
| 3 | Error | **E**ngineer |
| 4 | Warning | **W**ill |
| 5 | Notice | **N**eed |
| 6 | Informational | **I**ce |
| 7 | Debug | **D**aily |

\`\`\`
logging host 10.0.0.50
logging trap informational            ! Send levels 0-6
logging buffered 16384 debugging
show logging
\`\`\`

---

## Exam Tips

- SNMPv3 is the only version with **encryption** — use for security
- **Traps** are one-way (no ACK); **Informs** require acknowledgment
- Syslog level is **inclusive** downward: "warnings" sends levels 0-4
- NTP stratum increases by 1 per hop — higher stratum = less accurate
`
      },
      {
        title: "HSRP, VRRP & GLBP",
        content: `
## Why First-Hop Redundancy?

Hosts use a **single default gateway**. If that router fails, hosts lose connectivity.
FHRPs create a **virtual IP and MAC** shared between routers.

---

## HSRP (Hot Standby Router Protocol) — Cisco

One **Active** router, one **Standby**.

**Election:** Highest **priority** (default 100) wins Active. Tie = highest real IP.

**Virtual MAC:** \`0000.0C07.ACxx\` (xx = group number in hex)

\`\`\`
interface GigabitEthernet0/0
  standby 1 ip 192.168.1.1            ! Virtual IP
  standby 1 priority 150
  standby 1 preempt                   ! Reclaim Active after recovery
  standby 1 track GigabitEthernet0/1 60  ! Decrement priority by 60 if Gi0/1 fails
  standby version 2                   ! HSRPv2

show standby
show standby brief
\`\`\`

**HSRP States:** Initial -> Learn -> Listen -> Speak -> Standby -> **Active**
**Timers:** Hello = 3s, Hold = 10s

---

## VRRP (IEEE Standard)

| Feature | HSRP | VRRP |
|---------|------|------|
| Standard | Cisco | IEEE 802.1 |
| Roles | Active/Standby | Master/Backup |
| Virtual MAC | 0000.0C07.ACxx | 0000.5E00.01xx |
| Preempt default | Disabled | **Enabled** |

\`\`\`
interface GigabitEthernet0/0
  vrrp 1 ip 192.168.1.1
  vrrp 1 priority 150
  vrrp 1 preempt

show vrrp brief
\`\`\`

---

## GLBP (Gateway Load Balancing Protocol) — Cisco

Unique: actually **load balances** across multiple routers (not just failover).

- **AVG** (Active Virtual Gateway): Assigns virtual MACs
- **AVF** (Active Virtual Forwarder): Up to 4 routers actively forward

\`\`\`
interface GigabitEthernet0/0
  glbp 1 ip 192.168.1.1
  glbp 1 priority 150
  glbp 1 preempt
  glbp 1 load-balancing round-robin

show glbp brief
\`\`\`

---

## Comparison

| Feature | HSRP | VRRP | GLBP |
|---------|------|------|------|
| Standard | Cisco | IEEE | Cisco |
| Active forwarders | 1 | 1 | Up to 4 |
| Load balancing | No | No | **Yes** |

---

## Exam Tips

- **Preempt** must be enabled for a recovered router to reclaim Active/Master role
- HSRP **tracking** automatically lowers priority if tracked interface fails
- Gratuitous ARP sent when new Active router takes over — updates hosts' ARP caches
- GLBP is unique in providing **real load balancing**
`
      },
      {
        title: "QoS Fundamentals",
        content: `
## Why QoS?

When links are congested, QoS determines which traffic gets priority.

| Traffic Type | Needs |
|-------------|-------|
| Voice (VoIP) | Low latency (<150ms), low jitter, some loss OK |
| Video | Low latency, low jitter, some loss OK |
| Critical data | No loss, latency less critical |
| Best effort | Whatever is left |

---

## QoS Models

| Model | Description |
|-------|-------------|
| **Best Effort** | No QoS — all traffic equal (default) |
| **IntServ** | Per-flow RSVP reservation — doesn't scale |
| **DiffServ** | Mark packets by class and treat accordingly — scalable, most common |

---

## QoS Markings

**Layer 3: DSCP (6 bits in IP header)**

| Traffic Type | DSCP | Value |
|-------------|------|-------|
| Voice (RTP) | EF | 46 |
| Call signaling | CS3 | 24 |
| Video | AF41 | 34 |
| Best effort | BE | 0 |

**Layer 2: CoS (3 bits in 802.1Q tag)** — range 0-7, present only on trunk links

---

## QoS Mechanisms

| Mechanism | Purpose |
|-----------|---------|
| **Classification** | Identify traffic (ACL, NBAR, DSCP) |
| **Marking** | Set DSCP/CoS bits |
| **Policing** | Enforce rate limit — drop or re-mark excess |
| **Shaping** | Buffer excess — smoother, delays instead of drops |
| **Queuing** | Prioritize during congestion (LLQ recommended) |

**LLQ (Low Latency Queuing)**: CBWFQ + strict priority queue — voice always gets out first

---

## Exam Tips

- QoS only matters during **congestion** — no effect on uncongested links
- DSCP is in the **IP header** (Layer 3); CoS is in the **802.1Q tag** (Layer 2)
- Policing **drops** excess; shaping **delays** — shaping is gentler for TCP
- LLQ provides a **strict priority queue** for voice
- Trust markings from IP phones; remark or distrust PC markings at access switch
`
      },
      {
        title: "Network Services — FTP, TFTP, CDP & LLDP",
        content: `
## FTP vs TFTP

| Feature | FTP | TFTP |
|---------|-----|------|
| Port | TCP 20/21 | UDP 69 |
| Authentication | Username/Password | None |
| Transfer mode | Active or Passive | Lock-step |
| Use case | File management | IOS image/config transfer |
| Directory listing | Yes | No |

### FTP Active vs Passive

**Active mode**: Client opens port 21 for control; server initiates data connection back to client on port 20.
- Problem: NAT/firewall blocks inbound server connection.

**Passive mode**: Server opens a random high port for data; client connects to it.
- FW-friendly: client initiates both connections.

### IOS Image Transfer with FTP

\`\`\`
! Configure FTP credentials
ip ftp username admin
ip ftp password cisco

! Copy IOS image
copy ftp://192.168.1.100/c3900-universalk9-mz.SPA.157-3.M2.bin flash:

! Verify
dir flash:
show version
\`\`\`

---

## CDP — Cisco Discovery Protocol

Layer 2 multicast protocol (proprietary Cisco). Discovers directly connected Cisco devices.

\`\`\`
! View CDP neighbors summary
show cdp neighbors

! View detailed info (IP, IOS, capabilities)
show cdp neighbors detail

! Disable CDP globally (security hardening)
no cdp run

! Disable CDP on a specific interface
interface Gi0/1
 no cdp enable
\`\`\`

**CDP show output fields:**
- Device ID — hostname of neighbor
- Local Interface — which local port the neighbor is on
- Holdtime — seconds until entry expires
- Capability — R (Router), S (Switch), etc.
- Platform — device model
- Port ID — neighbor's interface

---

## LLDP — Link Layer Discovery Protocol

IEEE 802.1AB standard — works with non-Cisco devices. Similar to CDP.

\`\`\`
! Enable LLDP globally (off by default on Cisco)
lldp run

! Disable LLDP transmit on an interface
interface Gi0/1
 no lldp transmit

! Disable LLDP receive on an interface
interface Gi0/1
 no lldp receive

! Show LLDP neighbors
show lldp neighbors
show lldp neighbors detail
\`\`\`

**CDP vs LLDP comparison:**

| Feature | CDP | LLDP |
|---------|-----|------|
| Standard | Cisco proprietary | IEEE 802.1AB |
| Multi-vendor | No | Yes |
| Default state | Enabled | Disabled |
| Layer | Layer 2 multicast | Layer 2 multicast |
| Timer | 60s | 30s |
| Holdtime | 180s | 120s |

---

## Network Troubleshooting Tools

### ping & traceroute

\`\`\`
! Extended ping (test specific source interface)
ping 8.8.8.8 source Loopback0

! Traceroute (shows each hop)
traceroute 8.8.8.8

! IPv6 ping
ping ipv6 2001:DB8::1
\`\`\`

### show commands for troubleshooting

\`\`\`
show ip interface brief     ! Interface status and IPs
show interfaces Gi0/1       ! Detailed interface stats, errors
show ip route               ! Routing table
show arp                    ! ARP table
show mac address-table      ! Switch MAC table
\`\`\`

### Interpreting interface errors

| Error | Cause |
|-------|-------|
| Input errors | CRC, runts, giants |
| CRC errors | Cable issue, duplex mismatch |
| Runts | Frames < 64 bytes (collision domain issue) |
| Giants | Frames > 1518 bytes |
| Collisions | Half-duplex or duplex mismatch |
| Input drops | Interface buffer overflow |

---

## Exam Tips

- TFTP uses **UDP 69** — no auth, simple, used for IOS transfers
- FTP uses **TCP 20/21** — Active mode server initiates data; Passive is firewall-friendly
- CDP is **Cisco-only**, **enabled by default** — disable on untrusted ports (security)
- LLDP is **IEEE standard**, **disabled by default** on Cisco — must run \`lldp run\`
- Both CDP and LLDP operate at **Layer 2** — they reveal device info to neighbors
`
      },
    ]
  },
  {
    id: 5,
    title: "Security Fundamentals",
    weight: "15%",
    icon: "🔒",
    description: "ACLs, device hardening, AAA, VPN concepts, wireless security",
    topics: [
      {
        title: "Access Control Lists (ACLs)",
        content: `
## ACL Basics

Ordered list of permit/deny rules that filter traffic.

**Rules:**
1. Processed **top-to-bottom** — first match wins
2. Implicit **deny any** at the end (invisible)
3. Applied **per interface, per direction**

---

## ACL Types

| Type | Numbers | Matches |
|------|---------|---------|
| **Standard** | 1-99, 1300-1999 | Source IP only |
| **Extended** | 100-199, 2000-2699 | Src IP, Dst IP, Protocol, Ports |
| **Named** | Any name | Same as above |

**Placement:**
- Standard: Place **close to destination**
- Extended: Place **close to source**

---

## Standard ACL

\`\`\`
access-list 10 permit 192.168.1.0 0.0.0.255
access-list 10 deny any

ip access-list standard BLOCK_HOST
  permit 192.168.1.0 0.0.0.255
  deny any

interface GigabitEthernet0/1
  ip access-group 10 out

line vty 0 15
  access-class 10 in
\`\`\`

---

## Extended ACL

\`\`\`
! Syntax: access-list <num> <permit|deny> <protocol> <src> <wc> <dst> <wc> [eq <port>]

access-list 110 deny tcp 192.168.1.0 0.0.0.255 host 10.0.0.10 eq 23
access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 80
access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 443
access-list 110 permit ip any any

ip access-list extended WEB_FILTER
  10 permit tcp any any eq 80
  20 permit tcp any any eq 443
  30 deny ip any any

interface GigabitEthernet0/0
  ip access-group 110 in

show access-lists
show ip interface GigabitEthernet0/0
\`\`\`

---

## Port Operators

| Operator | Meaning |
|----------|---------|
| \`eq 80\` | Equal to port 80 |
| \`gt 1023\` | Greater than 1023 |
| \`lt 1024\` | Less than 1024 |
| \`neq 23\` | Not equal to 23 |
| \`range 20 21\` | Ports 20 through 21 |

---

## Exam Tips

- **Only one ACL per interface per direction** (in or out)
- The implicit deny blocks everything not explicitly permitted
- \`show access-lists\` shows hit counts
- ACLs on VTY lines control **management access** (SSH/Telnet) to the router
- Named ACLs can be edited with sequence numbers — numbered cannot
`
      },
      {
        title: "Device Hardening",
        content: `
## Password Security

\`\`\`
enable secret Str0ngP@ss!              ! Encrypted (use this, not enable password)
service password-encryption           ! Type 7 encryption for plaintext passwords

line console 0
  password ConPass123
  login
  exec-timeout 5 0

line vty 0 15
  login local
  exec-timeout 5 0
  transport input ssh

username admin privilege 15 secret AdminPass123
\`\`\`

---

## SSH Configuration

\`\`\`
ip domain-name company.local
crypto key generate rsa modulus 2048
ip ssh version 2
ip ssh time-out 60
ip ssh authentication-retries 3

line vty 0 15
  login local
  transport input ssh

show ip ssh
show ssh
\`\`\`

---

## Banners

\`\`\`
banner motd ^
UNAUTHORIZED ACCESS IS PROHIBITED.
This system is for authorized users only.
^

banner login ^
Enter credentials to continue.
^
\`\`\`

---

## Disable Unused Services

\`\`\`
no ip http server
ip http secure-server
no cdp run
no lldp run

interface range GigabitEthernet0/10 - 24
  shutdown
  switchport access vlan 999
  no cdp enable
\`\`\`

---

## Privilege Levels

IOS has 16 levels (0-15). Level 1 = User EXEC, Level 15 = Privileged EXEC.

\`\`\`
privilege exec level 7 show running-config
enable secret level 7 Level7Pass
\`\`\`

---

## Exam Tips

- Always use \`enable secret\` — \`enable password\` is weak
- \`service password-encryption\` uses Type 7 (reversible) — not truly secure
- SSH requires: hostname, domain-name, RSA key, SSHv2 configured
- **Telnet is insecure** — always disable in modern networks
- CDP/LLDP reveal network topology — disable on external-facing ports
`
      },
      {
        title: "AAA, RADIUS & TACACS+",
        content: `
## AAA Framework

- **Authentication**: Who are you? Verify credentials
- **Authorization**: What can you do? Permit/deny access
- **Accounting**: What did you do? Log for audit

---

## RADIUS vs TACACS+

| Feature | RADIUS | TACACS+ |
|---------|--------|---------|
| Standard | Open (RFC 2865) | Cisco proprietary |
| Transport | UDP 1812/1813 | **TCP 49** |
| Encryption | Password only | **Full packet** |
| AAA separation | Combined | **Separate** |
| Best for | Network access (802.1X, VPN) | **Device admin** |

**Rule:** RADIUS for network access; TACACS+ for device administration

---

## AAA Configuration

\`\`\`
aaa new-model

radius server CORP_RADIUS
  address ipv4 10.0.0.10 auth-port 1812 acct-port 1813
  key RadiusSecret123

tacacs server CORP_TACACS
  address ipv4 10.0.0.11
  key TacacsSecret123

aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa accounting exec default start-stop group tacacs+

line vty 0 15
  login authentication default

show aaa sessions
show aaa servers
\`\`\`

---

## 802.1X Port Authentication

| Component | Role |
|-----------|------|
| **Supplicant** | Client device |
| **Authenticator** | Switch or WLC |
| **Auth Server** | RADIUS (Cisco ISE) |

**EAP Types:**
| Type | Method |
|------|--------|
| EAP-TLS | Certificate-based — most secure |
| PEAP | Password in TLS tunnel (server cert only) |
| EAP-FAST | Cisco, similar to PEAP |

\`\`\`
aaa authentication dot1x default group radius
dot1x system-auth-control

interface GigabitEthernet0/1
  authentication port-control auto
  dot1x pae authenticator
\`\`\`

---

## Exam Tips

- TACACS+ encrypts the **entire packet**; RADIUS only the password
- TACACS+ uses **TCP** (reliable); RADIUS uses **UDP**
- **Local** database is always the fallback when servers are unreachable
- RADIUS is standard for wireless and VPN auth (802.1X)
`
      },
      {
        title: "VPN Concepts",
        content: `
## VPN Types

| Type | Use Case |
|------|---------|
| **Site-to-Site** | Permanent tunnel between locations |
| **Remote Access** | Individual users connect to corporate network |

---

## IPsec Framework

**Protocols:**
| Protocol | Provides |
|----------|---------|
| **AH** | Integrity + authentication (no encryption) |
| **ESP** | Encryption + integrity — most used |

**Modes:**
| Mode | Description |
|------|-------------|
| **Transport** | Encrypts payload only; original IP header intact |
| **Tunnel** | Encrypts entire packet; new IP header added (site-to-site) |

---

## IKE (Internet Key Exchange) — IKEv1

**Phase 1 (IKE SA)**: Establish secure channel
- Negotiate: encryption (AES), hashing (SHA), DH group, auth (PSK or RSA)

**Phase 2 (IPsec SA)**: Negotiate tunnel parameters
- Creates unidirectional SAs (one for each direction)

---

## Cryptographic Algorithms

| Category | Avoid | Use |
|----------|-------|-----|
| Encryption | DES, 3DES | **AES-256** |
| Hashing | MD5 | **SHA-256/384** |
| Key Exchange | DH 1, 2, 5 | **DH 14, 19, 20** |

**PFS (Perfect Forward Secrecy):** New DH exchange per session — compromise of one doesn't expose others

---

## SSL/TLS VPN

Uses HTTPS port **443** — works through firewalls blocking IPsec.
- **Clientless**: Browser-based, limited (web apps)
- **Client-based**: Cisco AnyConnect — full network access

---

## GRE Tunnels

\`\`\`
interface Tunnel0
  ip address 172.16.0.1 255.255.255.252
  tunnel source GigabitEthernet0/1
  tunnel destination 203.0.113.2
\`\`\`

GRE alone is **not encrypted** — combine with IPsec for security.

---

## Exam Tips

- IPsec **ESP** provides encryption (not AH — AH has no encryption)
- **Tunnel mode** for site-to-site; **Transport mode** for host-to-host
- SSL VPN uses port **443** — passes through firewalls blocking UDP 500
- Cisco AnyConnect is the SSL VPN client
`
      },
      {
        title: "Wireless Security",
        content: `
## Wireless Security Protocols

| Protocol | Encryption | Auth | Status |
|----------|-----------|------|--------|
| **WEP** | RC4 | Shared key | **Broken — never use** |
| **WPA** | TKIP | PSK or 802.1X | Deprecated |
| **WPA2** | **AES-CCMP** | PSK or 802.1X | Current standard |
| **WPA3** | AES-GCMP + SAE | SAE or 802.1X | Latest — best |

---

## WPA2 Modes

**WPA2-Personal (PSK):**
- Everyone uses the same password
- 4-way handshake generates per-session keys
- Vulnerable to offline dictionary attack if handshake captured

**WPA2-Enterprise (802.1X):**
- Each user authenticates with unique credentials via RADIUS
- No shared secret — much more secure

---

## WPA3 Improvements

| Feature | WPA2 | WPA3 |
|---------|------|------|
| Key exchange | 4-way handshake (PSK) | **SAE (Dragonfly)** |
| Forward secrecy | No | **Yes** |
| Offline attacks | Vulnerable | Protected |
| MFP | Optional | **Required** |

**SAE**: Even if attacker captures handshake, cannot brute-force password offline.

---

## 802.11w (Management Frame Protection)

Encrypts management frames to prevent deauth attacks.
- Optional in WPA2, **Mandatory in WPA3**

---

## Wireless Threats

| Threat | Description |
|--------|-------------|
| **Rogue AP** | Unauthorized AP connected to network |
| **Evil Twin AP** | AP mimicking legitimate SSID |
| **Deauth attack** | Flood deauth frames to disconnect clients |
| **KRACK** | Key Reinstallation Attack on WPA2 (patched) |

---

## Exam Tips

- WPA2 uses **AES-CCMP** — know this
- WPA3 uses **SAE** instead of PSK — prevents offline dictionary attacks
- Enterprise wireless: **WPA2/WPA3 Enterprise + 802.1X + RADIUS**
- Rogue AP detection is a **WLC function**
- The **4-way handshake** is what attackers capture for offline cracking
`
      }
    ]
  },
  {
    id: 6,
    title: "Automation & Programmability",
    weight: "10%",
    icon: "🤖",
    description: "SDN, REST APIs, data formats, NETCONF/RESTCONF, configuration management tools",
    topics: [
      {
        title: "SDN & Controller-Based Networking",
        content: `
## Network Planes

| Plane | Function | Where |
|-------|---------|-------|
| **Data Plane** | Forward packets per FIB/CAM table | Hardware ASICs |
| **Control Plane** | Build routing/switching tables | Device CPU or SDN controller |
| **Management Plane** | Device management (SSH, SNMP) | Device or management system |

---

## Traditional vs. Controller-Based

| Feature | Traditional | SDN |
|---------|------------|-----|
| Control plane | Distributed (per device) | Centralized (controller) |
| Configuration | Per-device CLI | Controller pushes to all |
| Visibility | Per-device | Network-wide |
| Automation | Difficult | Native |

---

## SDN Architecture

\`\`\`
Applications / Orchestration
        |
   Northbound API (REST/JSON)    <- Apps talk to controller
        |
    SDN Controller (DNA Center, APIC)
        |
   Southbound API (NETCONF, RESTCONF, OpenFlow, OpFlex)
        |
Network Devices (data plane only)
\`\`\`

**Northbound APIs**: Controller to applications (REST/JSON)
**Southbound APIs**: Controller to devices (NETCONF, RESTCONF, OpenFlow, OpFlex)

---

## Cisco DNA Center (Catalyst Center)

| Feature | Description |
|---------|-------------|
| **Design** | Sites, networks, templates |
| **Policy** | QoS, security policies |
| **Provision** | Zero-touch provisioning |
| **Assurance** | Real-time monitoring |
| **Platform** | REST APIs for automation |

---

## Cisco ACI (Data Center SDN)

- Controller: **APIC** (Application Policy Infrastructure Controller)
- Southbound: **OpFlex** protocol
- Key concepts: Tenant, VRF, Bridge Domain, EPG (Endpoint Group), Contract

---

## Spine-Leaf Architecture

Modern data center topology:
- **Spine switches**: High-speed interconnect (no servers)
- **Leaf switches**: Connect endpoints; each leaf connects to every spine
- Any endpoint reaches any other in **exactly 2 hops**
- Uses routing (ECMP), not STP

---

## Exam Tips

- Know the three planes: **data, control, management**
- **Northbound** = controller to apps; **Southbound** = controller to devices
- DNA Center = **intent-based networking** (describe what you want, not how)
- OpenFlow is the original southbound protocol (not widely used by Cisco)
- APIC is the controller for **ACI** (data center)
`
      },
      {
        title: "REST APIs & HTTP",
        content: `
## HTTP Methods (CRUD)

| Method | CRUD | Description |
|--------|------|-------------|
| **GET** | Read | Retrieve resource — no body |
| **POST** | Create | Create new resource — body required |
| **PUT** | Update (replace) | Replace entire resource |
| **PATCH** | Update (partial) | Modify specific fields |
| **DELETE** | Delete | Remove resource |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| **200 OK** | Success |
| **201 Created** | Resource created |
| **204 No Content** | Success, no body (DELETE) |
| **400 Bad Request** | Invalid request |
| **401 Unauthorized** | Authentication required |
| **403 Forbidden** | Authenticated but not authorized |
| **404 Not Found** | Resource doesn't exist |
| **500 Server Error** | Server-side problem |

---

## REST API Concepts

**Endpoint (URL):**
\`\`\`
https://dna-center.company.com/dna/intent/api/v1/network-device
\`\`\`

**Headers:**
- \`Content-Type: application/json\`
- \`Accept: application/json\`
- \`X-Auth-Token: <token>\`

**Authentication methods:**
- **Basic Auth**: Base64(username:password)
- **Token/Bearer**: Login once, get token, use for all requests
- **OAuth 2.0**: Delegated authorization

---

## DNA Center API Flow

\`\`\`
# Step 1: Get auth token
POST /dna/system/api/v1/auth/token
Authorization: Basic <base64>

# Response
{"Token": "eyJhbGciO..."}

# Step 2: Get devices
GET /dna/intent/api/v1/network-device
X-Auth-Token: eyJhbGciO...
\`\`\`

---

## Exam Tips

- **GET** never has a request body
- REST APIs primarily use **JSON**
- 2xx = success, 4xx = client error, 5xx = server error
- REST is **stateless** — each request is independent
- Know the DNA Center API pattern: authenticate first, then use token
`
      },
      {
        title: "Data Formats — JSON, YAML & XML",
        content: `
## JSON (JavaScript Object Notation)

Most common format for REST APIs.

\`\`\`json
{
  "device": {
    "hostname": "ROUTER1",
    "ipAddress": "10.0.0.1",
    "ospfEnabled": true,
    "vlanCount": 5,
    "interfaces": [
      {
        "name": "GigabitEthernet0/0",
        "status": "up"
      }
    ]
  }
}
\`\`\`

**JSON data types:** String, Number, Boolean (true/false), Null, Array \`[]\`, Object \`{}\`

**Rules:** Keys must be strings in double quotes; no trailing commas

---

## YAML (YAML Ain't Markup Language)

Common in Ansible playbooks and config management.

\`\`\`yaml
---
device:
  hostname: ROUTER1
  ip_address: 10.0.0.1
  ospf_enabled: true
  vlan_count: 5
  interfaces:
    - name: GigabitEthernet0/0
      status: up
    - name: GigabitEthernet0/1
      status: down

# This is a comment
\`\`\`

**Rules:** Indentation is significant (spaces only, no tabs); lists use \`-\`; comments use \`#\`

---

## XML (Extensible Markup Language)

Used by NETCONF/YANG.

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<device>
  <hostname>ROUTER1</hostname>
  <ipAddress>10.0.0.1</ipAddress>
  <interfaces>
    <interface>
      <name>GigabitEthernet0/0</name>
      <status>up</status>
    </interface>
  </interfaces>
</device>
\`\`\`

---

## Comparison

| Feature | JSON | YAML | XML |
|---------|------|------|-----|
| Readability | Good | Best | Verbose |
| Comments | No | Yes (#) | Yes |
| Common use | REST APIs | Ansible | NETCONF |
| Used by Cisco | DNA Center API | Ansible | NETCONF |

---

## Exam Tips

- JSON: \`{}\` = object, \`[]\` = array
- YAML: indentation = hierarchy — mixing tabs/spaces causes errors
- XML used by **NETCONF** — YANG defines the data model
- REST APIs primarily use **JSON**
`
      },
      {
        title: "NETCONF, RESTCONF & Configuration Management",
        content: `
## NETCONF

RFC 6241 — manages network device configuration.

| Feature | Value |
|---------|-------|
| Transport | **SSH (port 830)** |
| Data format | **XML** |
| Data model | **YANG** |
| Key operations | get, get-config, edit-config, copy-config, commit |

**Datastores:**
- **running**: Active configuration
- **candidate**: Proposed changes (committed to make active)
- **startup**: Loaded at boot

---

## RESTCONF

REST-based alternative to NETCONF (RFC 8040).

| Feature | NETCONF | RESTCONF |
|---------|---------|----------|
| Transport | SSH | **HTTPS** |
| Data format | XML | **JSON or XML** |
| Protocol | Custom RPC | HTTP methods |
| Port | 830 | **443** |

HTTP methods map to NETCONF operations:
- GET = get-config
- POST = create
- PUT = replace
- PATCH = modify
- DELETE = delete

---

## YANG Data Models

Defines the structure of configuration data:
\`\`\`
module ietf-interfaces {
  container interfaces {
    list interface {
      key "name";
      leaf name { type string; }
      leaf enabled { type boolean; }
    }
  }
}
\`\`\`

YANG = schema; NETCONF/RESTCONF = transport

---

## Configuration Management Tools

| Tool | Push/Pull | Agentless? | Language |
|------|-----------|------------|---------|
| **Ansible** | Push | **Yes** (SSH) | YAML |
| **Puppet** | Pull | No (agent) | Puppet DSL |
| **Chef** | Pull | No (agent) | Ruby |
| **Terraform** | Push | Yes (API) | HCL |

---

## Ansible Components

- **Inventory**: List of managed devices
- **Playbook**: YAML tasks
- **Module**: Unit of work (ios_config, ios_ospfv2)
- **Role**: Reusable task collection
- **Vault**: Encrypted secrets

\`\`\`yaml
---
- name: Configure OSPF
  hosts: routers
  gather_facts: no
  tasks:
    - name: Set hostname
      cisco.ios.ios_system:
        hostname: "{{ inventory_hostname }}"
\`\`\`

---

## Git Version Control

\`\`\`bash
git init
git add router1.cfg
git commit -m "Add OSPF config"
git log --oneline
git diff HEAD~1 router1.cfg
git checkout -b new-feature
\`\`\`

---

## Exam Tips

- NETCONF uses **SSH port 830**; RESTCONF uses **HTTPS port 443**
- NETCONF = **XML**; RESTCONF = **JSON or XML**
- **Ansible is agentless** — uses SSH/API, no software on managed devices
- Puppet/Chef require an **agent** on each device
- YANG defines the **data model** — NETCONF/RESTCONF transport data
`
      },
      {
        title: "Cisco DNA Center & Intent-Based Networking",
        content: `
## Intent-Based Networking (IBN)

IBN translates business intent into network policy automatically. The key pillar of Cisco's software-defined networking strategy.

**Three key functions of IBN:**
1. **Translate** — Convert business intent into network policy
2. **Activate** — Implement policy across the network automatically
3. **Assure** — Continuously verify the network is operating as intended

---

## Cisco DNA Center (Catalyst Center)

The management and automation platform for Cisco's IBN solution.

### DNA Center Workflows

| Workflow | Function |
|----------|----------|
| **Design** | Network hierarchy, settings, device profiles |
| **Policy** | Group-Based Access Control (GBAC), application policy |
| **Provision** | Zero-Touch Provisioning (ZTP), PnP, template deployment |
| **Assurance** | Health dashboards, AI-driven insights, path trace |

### DNA Center vs Traditional Management

| Aspect | Traditional | DNA Center |
|--------|-------------|------------|
| Configuration | CLI per device | GUI/API for all devices |
| Troubleshooting | Manual show commands | AI-driven assurance |
| Policy enforcement | Manual ACLs/QoS | Automated group policy |
| Compliance | Manual audit | Continuous automated check |

---

## SD-Access (Software-Defined Access)

Cisco's campus fabric solution built on DNA Center.

**Key components:**

| Component | Role |
|-----------|------|
| **Fabric Edge Nodes** | Connect end devices; enforce policy |
| **Fabric Border Nodes** | Connect fabric to external networks |
| **Fabric Control Plane Nodes** | Run LISP for endpoint location tracking |
| **DNA Center** | Orchestration and automation |
| **ISE (Identity Services Engine)** | 802.1X authentication, group assignment |

### LISP in SD-Access

LISP (Locator/ID Separation Protocol) separates the endpoint identity (EID) from location (RLOC):
- EID = endpoint IP/MAC (WHO the device is)
- RLOC = fabric edge node IP (WHERE the device is)

### VXLAN in SD-Access

VXLAN encapsulates Layer 2 frames in UDP packets, providing:
- Virtual extensible LAN overlays across the fabric
- Up to 16 million segment IDs (vs 4094 VLANs)
- Macro-segmentation between different virtual networks

---

## Scalable Group Tags (SGTs)

- Assigned by ISE based on user/device identity after authentication
- Carried in traffic across the fabric
- Policy enforced at the destination edge node
- Replaces complex ACLs with simple Group-to-Group policy matrix

---

## DNA Center REST API

DNA Center exposes a northbound REST API for automation:

\`\`\`python
import requests

# Authenticate
url = "https://dnac.example.com/dna/system/api/v1/auth/token"
response = requests.post(url, auth=("admin", "password"), verify=False)
token = response.json()["Token"]

# Get all devices
headers = {"X-Auth-Token": token}
devices_url = "https://dnac.example.com/dna/intent/api/v1/network-device"
devices = requests.get(devices_url, headers=headers, verify=False)
print(devices.json())
\`\`\`

### Common DNA Center API endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /dna/system/api/v1/auth/token | POST | Get auth token |
| /dna/intent/api/v1/network-device | GET | List all devices |
| /dna/intent/api/v1/topology/physical-topology | GET | Physical topology |
| /dna/intent/api/v1/network-health | GET | Network health score |

---

## Network Automation with Python

### Netmiko — SSH automation library

\`\`\`python
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios",
    "host": "192.168.1.1",
    "username": "admin",
    "password": "cisco",
}

with ConnectHandler(**device) as net_connect:
    output = net_connect.send_command("show ip interface brief")
    print(output)

    # Push config
    commands = ["interface Gi0/1", "description WAN Link"]
    net_connect.send_config_set(commands)
\`\`\`

---

## Exam Tips

- DNA Center uses **REST APIs** northbound (to apps) and **NETCONF/RESTCONF/SNMP** southbound (to devices)
- **SD-Access** uses LISP for control plane and VXLAN for data plane
- **ISE** provides identity services (802.1X) and assigns SGTs
- DNA Center **Assurance** uses AI/ML to correlate telemetry and predict issues
- **PnP (Plug and Play)** = Zero-Touch Provisioning for new devices joining DNA Center
`
      },
    ]
  }
];
