// Domain 4: IP Services (10%).
export default [
  // ================================================================ Exam A
  {
    id: 'A4-01', exam: 'A', obj: '4.1', type: 'match',
    q: 'PC1 (10.1.1.10) browses to a web server at 93.184.216.34. R1 translates PC1 to 203.0.113.5. Drag each address to its NAT term, from R1\'s point of view.',
    items: [['a1', '10.1.1.10'], ['a2', '203.0.113.5'], ['a3', '93.184.216.34 as seen by PC1'], ['a4', '93.184.216.34 as it really is on the Internet']],
    targets: [['t1', 'Inside local'], ['t2', 'Inside global'], ['t3', 'Outside local'], ['t4', 'Outside global']],
    ans: { a1: 't1', a2: 't2', a3: 't3', a4: 't4' },
    exp: '**Inside/outside** says which host the address belongs to; **local/global** says where it is seen. Inside local = the inside host\'s real (private) address; inside global = what the outside world sees for that host. Outside global = the outside host\'s real address; outside local = how the outside host appears to inside hosts, which is the same unless destination translation is configured.',
  },
  {
    id: 'A4-02', exam: 'A', obj: '4.1', type: 'multi',
    q: 'Based on the output, which two statements are true?',
    ex: [{ kind: 'cli', title: 'R1#show ip nat translations', text: `Pro  Inside global         Inside local          Outside local         Outside global
tcp  203.0.113.5:1024      10.1.1.5:51432        93.184.216.34:443     93.184.216.34:443
tcp  203.0.113.5:1025      10.1.1.6:49875        93.184.216.34:443     93.184.216.34:443
---  203.0.113.10          10.1.1.100            ---                   ---` }],
    opts: [
      ['Hosts 10.1.1.5 and 10.1.1.6 share one public address using PAT (overload).', 'Correct. Same inside global address, different ports.'],
      ['10.1.1.100 has a static one-to-one translation to 203.0.113.10.', 'Correct. The entry has no protocol or ports, which marks a static mapping.'],
      ['The web server\'s address is being translated.', 'Outside local and outside global are the same.'],
      ['10.1.1.5 appears on the Internet as 10.1.1.5.', 'It appears as 203.0.113.5:1024.'],
      ['All three entries were created by traffic and will time out.', 'The static entry is permanent.'],
    ],
    ans: 'a,b',
    exp: '**PAT** entries show the protocol and port numbers: many inside hosts share one inside global address and are told apart by port. A **static NAT** entry (`---` for protocol and outside) exists permanently, created by `ip nat inside source static 10.1.1.100 203.0.113.10`.',
  },
  {
    id: 'A4-03', exam: 'A', obj: '4.2', type: 'single',
    q: 'R1 synchronises its clock to an NTP server that reports stratum 2. What stratum does R1 report to its own NTP clients?',
    opts: [
      ['3', 'Correct. Each hop away from the reference clock adds 1.'],
      ['2', 'R1 is one level below its server.'],
      ['1', 'Stratum 1 servers connect directly to a reference clock.'],
      ['16', 'Stratum 16 means unsynchronised.'],
    ],
    ans: 'a',
    exp: 'Stratum is the distance from an authoritative reference clock (stratum 0, for example GPS or an atomic clock). A server connected to it is stratum 1, its clients are stratum 2, and so on. A device synced to a stratum 2 server is **stratum 3**. Stratum **16** means unsynchronised.',
  },
  {
    id: 'A4-04', exam: 'A', obj: '4.3', type: 'single',
    q: 'Which DNS record type maps a hostname to an IPv6 address?',
    opts: [
      ['AAAA', 'Correct.'],
      ['A', 'An A record maps a name to an IPv4 address.'],
      ['PTR', 'PTR records are used for reverse lookups (address to name).'],
      ['CNAME', 'A CNAME is an alias for another name.'],
    ],
    ans: 'a',
    exp: 'Common records: **A** (IPv4), **AAAA** (IPv6), **CNAME** (alias), **MX** (mail exchanger), **PTR** (reverse lookup), **NS** (name server), **SOA** (zone authority). Clients query DNS on UDP 53; zone transfers use TCP 53.',
  },
  {
    id: 'A4-05', exam: 'A', obj: '4.4', type: 'single',
    q: 'Which SNMP message does an agent send to the manager, unsolicited and without expecting an acknowledgement, when an event such as a link failure occurs?',
    opts: [
      ['Trap', 'Correct.'],
      ['Inform', 'An Inform is also unsolicited, but the manager acknowledges it.'],
      ['Get', 'The manager sends Get requests to read values.'],
      ['Set', 'The manager sends Set requests to change values.'],
    ],
    ans: 'a',
    exp: 'SNMP operations: the **manager** polls agents with **Get/GetNext/GetBulk** (UDP 161) and changes values with **Set**. The **agent** reports events with a **Trap** (unacknowledged) or an **Inform** (acknowledged, retransmitted if no reply) to UDP 162. The data is described by the **MIB** using OIDs.',
  },
  {
    id: 'A4-06', exam: 'A', obj: '4.5', type: 'order',
    q: 'Put the syslog severity levels in order from 0 (most severe) to 7 (least severe).',
    items: [['l0', 'Emergencies'], ['l1', 'Alerts'], ['l2', 'Critical'], ['l3', 'Errors'], ['l4', 'Warnings'], ['l5', 'Notifications'], ['l6', 'Informational'], ['l7', 'Debugging']],
    exp: 'A popular mnemonic is "**E**very **A**wesome **C**isco **E**ngineer **W**ill **N**eed **I**ce cream **D**aily": 0 Emergencies, 1 Alerts, 2 Critical, 3 Errors, 4 Warnings, 5 Notifications, 6 Informational, 7 Debugging. Configuring a level sends that level **and everything more severe** (lower numbers).',
  },
  {
    id: 'A4-07', exam: 'A', obj: '4.7', type: 'single',
    q: 'Which QoS mechanism enforces a rate limit by immediately dropping or re-marking traffic that exceeds it, without buffering?',
    opts: [
      ['Policing', 'Correct.'],
      ['Shaping', 'Shaping buffers excess traffic and sends it later.'],
      ['Queuing', 'Queuing decides the order in which waiting packets are sent.'],
      ['Classification', 'Classification identifies traffic; it does not enforce rates.'],
    ],
    ans: 'a',
    exp: '**Policing** drops or re-marks excess traffic straight away; it can be applied inbound or outbound and is typical at provider edges. **Shaping** queues the excess and smooths it to the contracted rate (outbound only), adding delay but avoiding drops. Shaping toward a provider avoids being policed by them.',
  },
  {
    id: 'A4-08', exam: 'A', obj: '4.9', type: 'multi',
    q: 'Which two statements about TFTP are true?',
    opts: [
      ['It uses UDP port 69.', 'Correct.'],
      ['It has no user authentication.', 'Correct. Anyone who can reach the server can read or write the allowed files.'],
      ['It uses TCP ports 20 and 21.', 'Those are FTP ports.'],
      ['It supports directory listings and file browsing.', 'TFTP only gets and puts named files.'],
      ['It encrypts transfers by default.', 'TFTP sends everything in clear text.'],
    ],
    ans: 'a,b',
    exp: '**TFTP** is deliberately simple: UDP 69, lock-step blocks with acknowledgements, no authentication and no directory listing. It is used for IOS images, configurations and IP phone files on trusted networks. **FTP** (TCP 20/21) adds authentication and directory operations. **SCP** or **SFTP** add encryption.',
  },
  {
    id: 'A4-09', exam: 'A', obj: '4.6', type: 'single',
    q: 'Which interface command makes a router obtain its address on G0/1 from the ISP\'s DHCP server?',
    opts: [
      ['ip address dhcp', 'Correct.'],
      ['ip helper-address dhcp', 'helper-address relays clients\' requests to a server.'],
      ['ip dhcp client enable', 'This is not an IOS command.'],
      ['ip address auto', 'This is not an IOS command.'],
    ],
    ans: 'a',
    exp: '`ip address dhcp` makes the interface a **DHCP client**. If the server supplies a default gateway, IOS installs a static default route with an AD of 254. Verify with `show ip interface brief` (Method: DHCP) and `show dhcp lease`.',
  },

  // ================================================================ Exam B
  {
    id: 'B4-01', exam: 'B', obj: '4.1', type: 'single',
    q: 'Which type of NAT lets hundreds of inside hosts share a single public IPv4 address at the same time?',
    opts: [
      ['PAT (NAT overload)', 'Correct. Hosts are told apart by translated port numbers.'],
      ['Static NAT', 'Static NAT maps one inside address to one public address.'],
      ['Dynamic NAT without overload', 'Each host needs its own pool address.'],
      ['NAT64', 'NAT64 translates between IPv6 and IPv4.'],
    ],
    ans: 'a',
    exp: '**PAT** rewrites the source IP **and** the source port, so tens of thousands of sessions can share one address: `ip nat inside source list 1 interface g0/1 overload`. Static NAT is 1:1 and permanent; dynamic NAT is 1:1 from a pool, as long as addresses remain.',
  },
  {
    id: 'B4-02', exam: 'B', obj: '4.1', type: 'single',
    q: 'Inside hosts cannot reach the Internet, and `show ip nat translations` is empty. What is missing?',
    ex: [{ kind: 'cli', title: 'R1#show running-config (excerpt)', text: `interface GigabitEthernet0/0
 description LAN
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/1
 description ISP
 ip address 203.0.113.2 255.255.255.252
!
ip nat inside source list 1 interface GigabitEthernet0/1 overload
ip route 0.0.0.0 0.0.0.0 203.0.113.1
!
access-list 1 permit 192.168.1.0 0.0.0.255` }],
    opts: [
      ['ip nat outside on GigabitEthernet0/1', 'Correct. NAT needs both an inside and an outside interface.'],
      ['A NAT pool', 'Overload on an interface needs no pool.'],
      ['A route to 192.168.1.0/24', 'That network is directly connected.'],
      ['An extended ACL instead of a standard ACL', 'A standard ACL is fine for selecting inside sources.'],
    ],
    ans: 'a',
    exp: 'Translation happens only for packets moving between an **ip nat inside** and an **ip nat outside** interface. With no outside interface, nothing is translated and private sources leak to the ISP, which drops them. Add `ip nat outside` under G0/1.',
  },
  {
    id: 'B4-03', exam: 'B', obj: '4.2', type: 'single',
    q: 'In the output of `show ntp associations`, what does an asterisk (*) next to a server mean?',
    opts: [
      ['It is the server the router is currently synchronised to (sys.peer).', 'Correct.'],
      ['The server is unreachable.', 'Unreachable servers show reach 0 and no * mark.'],
      ['The server was configured with ntp master.', 'The * is about the local synchronisation source.'],
      ['The server is a false ticker.', 'False tickers are marked with x.'],
    ],
    ans: 'a',
    exp: 'Markers in `show ntp associations`: **\\*** sys.peer (current sync source), **#** selected, **+** candidate, **-** outlyer, **x** false ticker, **~** configured. `show ntp status` shows whether the clock is synchronised and its stratum.',
  },
  {
    id: 'B4-04', exam: 'B', obj: '4.3', type: 'order',
    q: 'Put the DHCP messages exchanged when a client obtains an address in the correct order.',
    items: [['d1', 'DHCPDISCOVER'], ['d2', 'DHCPOFFER'], ['d3', 'DHCPREQUEST'], ['d4', 'DHCPACK']],
    exp: '**DORA**: the client broadcasts a **Discover**; servers reply with an **Offer**; the client broadcasts a **Request** for one offer (telling other servers their offers were declined); the chosen server confirms with an **Ack**. Clients use UDP 68 and servers UDP 67. Renewals are unicast Request/Ack exchanges at 50% of the lease time.',
  },
  {
    id: 'B4-05', exam: 'B', obj: '4.4', type: 'single',
    q: 'Which SNMP version and security level provide both authentication and encryption?',
    opts: [
      ['SNMPv3 with authPriv', 'Correct.'],
      ['SNMPv3 with authNoPriv', 'This authenticates but does not encrypt.'],
      ['SNMPv2c', 'v2c uses clear-text community strings.'],
      ['SNMPv1', 'v1 uses clear-text community strings.'],
    ],
    ans: 'a',
    exp: 'SNMPv3 security levels: **noAuthNoPriv** (username only), **authNoPriv** (HMAC authentication), **authPriv** (authentication + encryption, for example AES). SNMPv1 and v2c rely on community strings sent in clear text.',
  },
  {
    id: 'B4-06', exam: 'B', obj: '4.5', type: 'single',
    q: 'An engineer configures `logging trap notifications`. Which severity levels are sent to the syslog server?',
    opts: [
      ['Levels 0 to 5', 'Correct. Notifications is level 5, and more severe levels are included.'],
      ['Level 5 only', 'The level sets a threshold, not a single level.'],
      ['Levels 5 to 7', 'This includes less severe messages and excludes more severe ones.'],
      ['All levels 0 to 7', 'That would be logging trap debugging.'],
    ],
    ans: 'a',
    exp: 'A logging level is a threshold: the device sends the named level and **everything more severe** (lower numbers). `logging trap notifications` therefore sends 0–5. The default trap level is informational (6). Interface up/down messages such as `%LINEPROTO-5-UPDOWN` are level 5.',
  },
  {
    id: 'B4-07', exam: 'B', obj: '4.6', type: 'single',
    q: 'Clients on VLAN 20 must receive addresses from a DHCP server in the data centre. On R1, where should `ip helper-address <server>` be configured?',
    opts: [
      ['On the R1 interface (or subinterface) that is the default gateway for VLAN 20', 'Correct. That is where the client broadcasts arrive.'],
      ['On the R1 interface facing the DHCP server', 'Client broadcasts never reach that interface.'],
      ['On the DHCP server\'s switch port', 'Relay is a Layer 3 function on the router.'],
      ['Globally under router configuration mode', 'ip helper-address is an interface command.'],
    ],
    ans: 'a',
    exp: 'A DHCP relay receives client broadcasts on the **client-facing** interface, forwards them as unicast to the server and inserts that interface\'s IP address as **giaddr**. The server uses the giaddr to pick the right pool, so a pool for VLAN 20\'s subnet must exist on the server.',
  },
  {
    id: 'B4-08', exam: 'B', obj: '4.7', type: 'single',
    q: 'Which DSCP per-hop behaviour is recommended for voice bearer traffic?',
    opts: [
      ['Expedited Forwarding (EF, DSCP 46)', 'Correct. EF gives low loss, latency and jitter.'],
      ['AF41 (DSCP 34)', 'AF41 is typically used for interactive video.'],
      ['CS1 (DSCP 8)', 'CS1 is scavenger or bulk traffic.'],
      ['Default (DSCP 0)', 'DSCP 0 is best effort.'],
    ],
    ans: 'a',
    exp: 'Voice needs low delay (under 150 ms one way), low jitter (under 30 ms) and low loss (under 1%). It is marked **EF (46)** and placed in a strict-priority queue (LLQ). Voice signalling commonly uses CS3, and video uses AF4x. On 802.1Q links the equivalent Layer 2 marking is CoS 5.',
  },
  {
    id: 'B4-09', exam: 'B', obj: '4.8', type: 'multi',
    q: 'Which two settings must be configured before `crypto key generate rsa` succeeds on a router?',
    opts: [
      ['A hostname other than the default Router', 'Correct.'],
      ['A domain name (ip domain-name)', 'Correct.'],
      ['An enable secret', 'Recommended, but not needed to generate keys.'],
      ['A local username', 'Needed for login local, but not for key generation.'],
      ['transport input ssh on the VTY lines', 'This controls which protocols the VTY lines accept, not key generation.'],
    ],
    ans: 'a,b',
    exp: 'The RSA key pair is named **hostname.domain**, so IOS requires a non-default **hostname** and an **ip domain-name** before `crypto key generate rsa [modulus 2048]`. Then use `ip ssh version 2` (needs at least 768-bit keys), local users, and `login local` with `transport input ssh` on the VTY lines.',
  },

  // ================================================================ Exam C
  {
    id: 'C4-01', exam: 'C', obj: '4.1', type: 'single',
    q: 'Why would an administrator configure static NAT rather than PAT for an internal web server?',
    opts: [
      ['So hosts on the Internet can start connections to the server through a fixed public address', 'Correct. A permanent mapping allows inbound connections.'],
      ['Because PAT cannot carry HTTPS', 'PAT handles HTTPS without problems.'],
      ['To save public addresses', 'Static NAT uses one public address per server, so PAT saves more.'],
      ['Because static NAT encrypts the traffic', 'NAT does not encrypt anything.'],
    ],
    ans: 'a',
    exp: 'Dynamic NAT and PAT entries are created by **outbound** traffic, so an outside client cannot reach an inside host that has not first sent traffic out. **Static NAT** (`ip nat inside source static 192.168.1.100 203.0.113.5`) creates a permanent bidirectional mapping, which is ideal for servers. Static PAT (port forwarding) can publish a single port instead.',
  },
  {
    id: 'C4-02', exam: 'C', obj: '4.2', type: 'single',
    q: 'Which command makes R2 an NTP client that synchronises its clock from 10.1.1.1?',
    opts: [
      ['ntp server 10.1.1.1', 'Correct. The command names the server the device should use.'],
      ['ntp master 10.1.1.1', 'ntp master makes this router itself an authoritative source; it takes a stratum, not an address.'],
      ['ntp client 10.1.1.1', 'This is not an IOS command.'],
      ['clock set 10.1.1.1', 'clock set sets the time manually.'],
    ],
    ans: 'a',
    exp: '`ntp server <address>` points a device at a time source; the device becomes a client (and can serve time to others in turn). `ntp master [stratum]` makes the router serve its own clock. `ntp peer` is used for symmetric peering. NTP uses UDP 123.',
  },
  {
    id: 'C4-03', exam: 'C', obj: '4.3', type: 'single',
    q: 'In an IOS DHCP pool, which command gives clients their default gateway?',
    opts: [
      ['default-router 192.168.1.1', 'Correct.'],
      ['ip default-gateway 192.168.1.1', 'This sets the gateway for a non-routing device itself.'],
      ['gateway 192.168.1.1', 'This is not a DHCP pool command.'],
      ['dns-server 192.168.1.1', 'This sets the DNS server option.'],
    ],
    ans: 'a',
    exp: 'Typical pool:\n```\nip dhcp excluded-address 192.168.1.1 192.168.1.10\nip dhcp pool LAN\n network 192.168.1.0 255.255.255.0\n default-router 192.168.1.1\n dns-server 8.8.8.8\n domain-name corp.local\n lease 7\n```\nVerify with `show ip dhcp binding` and `show ip dhcp pool`.',
  },
  {
    id: 'C4-04', exam: 'C', obj: '4.4', type: 'single',
    q: 'What is the SNMP MIB?',
    opts: [
      ['A structured database of managed objects, each identified by an OID, that the agent exposes to the manager', 'Correct.'],
      ['The software that runs on the network management station', 'That is the SNMP manager (NMS).'],
      ['The password used for SNMPv2c', 'That is the community string.'],
      ['A message sent when an interface fails', 'That is a trap or inform.'],
    ],
    ans: 'a',
    exp: 'SNMP components: the **manager/NMS** polls and receives notifications; the **agent** runs on the device; the **MIB** organises the variables (such as interface counters or CPU load) in a tree of **OIDs**, for example 1.3.6.1.2.1.2.2.1.10 for ifInOctets.',
  },
  {
    id: 'C4-05', exam: 'C', obj: '4.5', type: 'single',
    q: 'What is the severity of the log message below?',
    ex: [{ kind: 'cli', title: 'R1 log', text: `*Mar  1 00:21:42.123: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to down` }],
    opts: [
      ['Notifications (level 5)', 'Correct. The number after the facility is the severity.'],
      ['Critical (level 2)', 'The message shows level 5.'],
      ['Errors (level 3)', 'The message shows level 5.'],
      ['Informational (level 6)', 'The message shows level 5.'],
    ],
    ans: 'a',
    exp: 'Syslog format: **%FACILITY-SEVERITY-MNEMONIC: description**. Here the facility is LINEPROTO, the severity is **5** (notifications) and the mnemonic is UPDOWN. The timestamp depends on `service timestamps log datetime msec`, and the asterisk means the clock is not authoritative (not synchronised with NTP).',
  },
  {
    id: 'C4-06', exam: 'C', obj: '4.7', type: 'single',
    q: 'Which queuing method gives voice traffic a strict-priority queue while other classes share the remaining bandwidth by guarantee?',
    opts: [
      ['Low-latency queuing (LLQ)', 'Correct. LLQ is CBWFQ plus a policed strict-priority queue.'],
      ['First-in, first-out (FIFO)', 'FIFO has a single queue and no prioritisation.'],
      ['Weighted random early detection (WRED)', 'WRED is congestion avoidance, not a scheduler.'],
      ['Round robin', 'Plain round robin gives no strict priority.'],
    ],
    ans: 'a',
    exp: '**CBWFQ** gives each class a guaranteed share of bandwidth. **LLQ** adds a **priority queue** that is always served first, which suits voice, and polices it to its configured rate so it cannot starve the other classes.',
  },
  {
    id: 'C4-07', exam: 'C', obj: '4.9', type: 'single',
    q: 'Which capability does FTP have that TFTP lacks?',
    opts: [
      ['Username and password authentication and directory listing', 'Correct.'],
      ['Encryption of all transferred files by default', 'Plain FTP is not encrypted either.'],
      ['Use of UDP for faster transfers', 'FTP uses TCP; TFTP uses UDP.'],
      ['Transfer of IOS images', 'Both can transfer IOS images.'],
    ],
    ans: 'a',
    exp: '**FTP** (TCP 21 control, TCP 20 or ephemeral ports for data) supports **authentication** and commands such as listing, renaming and deleting. **TFTP** (UDP 69) only reads and writes files, with no login. Neither encrypts traffic; use SCP or SFTP when confidentiality matters. On IOS: `copy ftp: flash:` with `ip ftp username` and `ip ftp password`.',
  },

  // ================================================================ Exam D
  {
    id: 'D4-01', exam: 'D', obj: '4.1', type: 'single',
    q: 'Dynamic NAT (without overload) uses a pool of five public addresses. Five inside hosts already have translations when a sixth host tries to reach the Internet. What happens?',
    opts: [
      ['The sixth host\'s traffic is not translated and fails until a pool address is released.', 'Correct.'],
      ['The sixth host shares an address with another host using PAT.', 'Sharing requires the overload keyword.'],
      ['The router borrows the outside interface address.', 'Only an interface overload configuration does that.'],
      ['The oldest translation is immediately replaced.', 'Entries remain until they time out or are cleared.'],
    ],
    ans: 'a',
    exp: 'Dynamic NAT is **one-to-one**, so the pool caps the number of concurrent inside hosts. When it is exhausted, new hosts fail (the "NAT pool exhausted" statistic increments) until an entry times out (24 hours by default for simple translations) or is cleared. Add **overload** to the pool statement to use PAT instead.',
  },
  {
    id: 'D4-02', exam: 'D', obj: '4.1', type: 'single',
    q: 'After changing the NAT pool, an engineer wants to remove every dynamic translation immediately. Which command does this?',
    opts: [
      ['clear ip nat translation *', 'Correct.'],
      ['no ip nat inside', 'This disables NAT on an interface.'],
      ['clear ip route *', 'This clears the routing table.'],
      ['reload in 1', 'A reload is far more disruptive than needed.'],
    ],
    ans: 'a',
    exp: '`clear ip nat translation *` removes all **dynamic** entries (static mappings remain). Users\' active sessions will be interrupted and rebuilt. Use `show ip nat statistics` to check hits, misses and pool usage.',
  },
  {
    id: 'D4-03', exam: 'D', obj: '4.2', type: 'multi',
    q: 'Which two statements about NTP are true?',
    opts: [
      ['NTP uses UDP port 123.', 'Correct.'],
      ['`ntp master 4` makes a router serve its own clock at stratum 4.', 'Correct.'],
      ['A device synced to a stratum 3 server becomes stratum 2.', 'It becomes stratum 4.'],
      ['NTP requires TCP so that time messages are reliable.', 'NTP uses UDP and estimates delay itself.'],
      ['Stratum 1 indicates an unsynchronised clock.', 'Stratum 16 indicates unsynchronised.'],
    ],
    ans: 'a,b',
    exp: 'Accurate, consistent time matters for log correlation, certificates and authentication. NTP runs over **UDP 123**. `ntp master [stratum]` makes a router an authoritative source (default stratum 8), and `ntp server` points devices at a source. Use NTP authentication to prevent spoofed time.',
  },
  {
    id: 'D4-04', exam: 'D', obj: '4.3', type: 'single',
    q: 'Which DNS record identifies the mail server for a domain?',
    opts: [
      ['MX', 'Correct.'],
      ['A', 'An A record maps a name to an IPv4 address.'],
      ['NS', 'An NS record identifies authoritative name servers.'],
      ['SOA', 'The SOA record holds zone authority information.'],
    ],
    ans: 'a',
    exp: 'An **MX** record lists the mail exchangers for a domain with preference values (lower is preferred); the MX names are then resolved with A or AAAA records.',
  },
  {
    id: 'D4-05', exam: 'D', obj: '4.4', type: 'single',
    q: 'Which SNMP operation does a manager use to change a configurable value on an agent, for example to shut down an interface?',
    opts: [
      ['Set', 'Correct. It needs read-write access.'],
      ['Get', 'Get reads a value.'],
      ['Trap', 'Traps are sent by agents.'],
      ['GetBulk', 'GetBulk reads many values efficiently.'],
    ],
    ans: 'a',
    exp: '**Set** writes a MIB value, which requires a read-write community (v2c) or a v3 user with write access. Many organisations allow read-only access only, to reduce risk.',
  },
  {
    id: 'D4-06', exam: 'D', obj: '4.5', type: 'single',
    q: 'Where does `logging buffered 16384 warnings` store log messages, and how can they be viewed?',
    opts: [
      ['In a RAM buffer on the device, viewed with show logging', 'Correct. Messages are lost when the device reloads.'],
      ['On a remote syslog server', 'That is configured with logging host.'],
      ['In NVRAM, viewed with show startup-config', 'The buffer is in RAM, not NVRAM.'],
      ['Only on the console', 'Console logging is set with logging console.'],
    ],
    ans: 'a',
    exp: 'Syslog destinations: **console** (`logging console`), VTY sessions (`terminal monitor`), the **RAM buffer** (`logging buffered [size] [level]`, viewed with `show logging`) and **external servers** (`logging host`, with `logging trap <level>`).',
  },
  {
    id: 'D4-07', exam: 'D', obj: '4.6', type: 'single',
    q: 'A Windows PC was moved to a new VLAN and still has an address from the old subnet. Which commands make it obtain a new DHCP lease?',
    opts: [
      ['ipconfig /release followed by ipconfig /renew', 'Correct.'],
      ['ipconfig /flushdns', 'This clears the DNS cache only.'],
      ['ipconfig /all', 'This only displays the configuration.'],
      ['arp -d *', 'This clears the ARP cache.'],
    ],
    ans: 'a',
    exp: '`ipconfig /release` gives up the current lease (sending a DHCPRELEASE) and `ipconfig /renew` starts a new DORA exchange. On Linux, `dhclient -r` followed by `dhclient` (or `nmcli` commands) does the same.',
  },
  {
    id: 'D4-08', exam: 'D', obj: '4.7', type: 'match',
    q: 'Drag each QoS mechanism to its description.',
    items: [['q1', 'Classification'], ['q2', 'Marking'], ['q3', 'Queuing'], ['q4', 'Congestion avoidance (WRED)'], ['q5', 'Policing'], ['q6', 'Shaping']],
    targets: [
      ['t1', 'Identifies traffic by fields such as ACLs, NBAR or existing markings'],
      ['t2', 'Writes a value such as DSCP or CoS into the packet or frame'],
      ['t3', 'Holds packets in separate buffers and schedules which is sent next'],
      ['t4', 'Drops some packets early as a queue fills, so TCP senders slow down'],
      ['t5', 'Drops or re-marks traffic above a rate, without buffering'],
      ['t6', 'Buffers traffic above a rate and sends it later'],
    ],
    ans: { q1: 't1', q2: 't2', q3: 't3', q4: 't4', q5: 't5', q6: 't6' },
    exp: 'The QoS toolset: **classify** and **mark** at the trust boundary (as close to the source as possible), then let each hop apply its **per-hop behaviour** based on the markings: queuing/scheduling (CBWFQ, LLQ), congestion avoidance (WRED) and rate control (policing, shaping).',
  },
  {
    id: 'D4-09', exam: 'D', obj: '4.8', type: 'single',
    q: 'An engineer enters `ip ssh version 2` and IOS responds that RSA keys of at least 768 bits are required. What is the cause?',
    opts: [
      ['No RSA keys exist, or the existing keys are smaller than 768 bits.', 'Correct. Generate larger keys, for example with modulus 2048.'],
      ['SSH version 2 requires a TACACS+ server.', 'Local authentication is enough.'],
      ['The VTY lines are set to transport input telnet.', 'That affects access, not this message.'],
      ['The domain name is longer than 768 characters.', 'The message is about the RSA modulus.'],
    ],
    ans: 'a',
    exp: 'SSHv2 needs an RSA key pair of at least **768 bits**. Use `crypto key generate rsa modulus 2048` (after setting a hostname and domain name), then `ip ssh version 2`. Verify with `show ip ssh` and `show crypto key mypubkey rsa`.',
  },
  {
    id: 'D4-10', exam: 'D', obj: '4.9', type: 'single',
    q: 'Which is a typical use of TFTP in an enterprise network?',
    opts: [
      ['Backing up device configurations and transferring IOS images on a trusted management network', 'Correct.'],
      ['Securely exchanging files with business partners over the Internet', 'TFTP has no authentication or encryption.'],
      ['Browsing a file server\'s directory structure', 'TFTP cannot list directories.'],
      ['Synchronising device clocks', 'That is NTP.'],
    ],
    ans: 'a',
    exp: 'TFTP\'s small footprint makes it common for `copy running-config tftp:`, `copy tftp: flash:` and for IP phones and PXE clients downloading boot or configuration files. Because it has no security, keep it on trusted management networks or use SCP/SFTP instead.',
  },
];
