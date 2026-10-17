// Domain 2: Network Access (20%).
export default [
  // ================================================================ Exam A
  {
    id: 'A2-01', exam: 'A', obj: '2.1', type: 'single',
    q: 'An IP phone is connected to switch port Fa0/5 and a PC is connected to the phone\'s PC port. Data must use VLAN 10 and voice must use VLAN 150. Which configuration is correct?',
    opts: [
      ['`switchport mode access`, `switchport access vlan 10`, `switchport voice vlan 150`', 'Correct. The access VLAN carries the PC\'s untagged traffic and the voice VLAN carries the phone\'s tagged traffic.'],
      ['`switchport mode trunk`, `switchport trunk allowed vlan 10,150`', 'A voice port is an access port with a voice VLAN, not a full trunk.'],
      ['`switchport mode access`, `switchport access vlan 150`, `switchport voice vlan 10`', 'The VLANs are reversed: the PC would land in the voice VLAN.'],
      ['`switchport access vlan 10`, `switchport access vlan 150`', 'An access port has one data VLAN; the second command replaces the first.'],
    ],
    ans: 'a',
    exp: 'A port with a **voice VLAN** stays an access port. The switch uses CDP (or LLDP-MED) to tell the phone its voice VLAN; the phone **tags** voice frames with 802.1Q VLAN 150 (with a CoS value), while frames from the PC pass through **untagged** in access VLAN 10.',
  },
  {
    id: 'A2-02', exam: 'A', obj: '2.1', type: 'multi',
    q: 'Which two statements about VLAN 1 on a Cisco switch are true?',
    opts: [
      ['All ports belong to VLAN 1 by default.', 'Correct. VLAN 1 is the default VLAN.'],
      ['VLAN 1 cannot be deleted or renamed.', 'Correct. It always exists with the name "default".'],
      ['VLAN 1 traffic is always tagged on trunks.', 'VLAN 1 is the default native VLAN, so it is untagged by default.'],
      ['VLAN 1 can only contain trunk ports.', 'Any access port can be in VLAN 1, and all are by default.'],
      ['Using VLAN 1 for user traffic is recommended.', 'Best practice is to move users and the native VLAN off VLAN 1.'],
    ],
    ans: 'a,b',
    exp: '**VLAN 1** is the default VLAN and the default native VLAN; it cannot be deleted. Control protocols such as CDP, VTP, PAgP and DTP also use VLAN 1 on trunks. For security, put unused ports in a separate unused VLAN (and shut them down), and use a dedicated native VLAN on trunks.',
  },
  {
    id: 'A2-03', exam: 'A', obj: '2.1', type: 'single',
    q: 'A PC connected to Fa0/3 should be in the ENGINEERING VLAN but cannot reach other engineering hosts. What must be done?',
    ex: [{ kind: 'cli', title: 'SW1#show vlan brief', text: `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5, Fa0/6
                                                Fa0/7, Fa0/8, Gi0/2
10   SALES                            active    Fa0/1
20   ENGINEERING                      active    Fa0/2
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup
1004 fddinet-default                  act/unsup
1005 trnet-default                    act/unsup` }],
    opts: [
      ['Configure `switchport access vlan 20` on Fa0/3.', 'Correct. Fa0/3 is still in VLAN 1.'],
      ['Create VLAN 20 on SW1.', 'VLAN 20 already exists and is active.'],
      ['Configure Fa0/3 as a trunk.', 'An end PC should connect to an access port.'],
      ['Add VLAN 20 to Gi0/2.', 'Gi0/2 is listed in VLAN 1 as an access port; the fault is on Fa0/3.'],
    ],
    ans: 'a',
    exp: '`show vlan brief` lists every **access** port under its VLAN (trunk ports are not listed). Fa0/3 appears under VLAN 1, so it still has the default assignment. Assign it with `switchport mode access` and `switchport access vlan 20`.',
  },
  {
    id: 'A2-04', exam: 'A', obj: '2.2', type: 'multi',
    q: 'Which two combinations of DTP modes on the two ends of a link result in an operational trunk?',
    opts: [
      ['dynamic desirable and dynamic auto', 'Correct. Desirable actively asks to trunk, and auto agrees.'],
      ['trunk and dynamic auto', 'Correct. A static trunk sends DTP, and auto agrees.'],
      ['dynamic auto and dynamic auto', 'Both sides wait for the other, so the link stays in access mode.'],
      ['access and trunk', 'This is a mode mismatch; the access side does not trunk.'],
      ['access and dynamic desirable', 'An access port never trunks.'],
    ],
    ans: 'a,b',
    exp: 'DTP outcomes: **trunk** + trunk/desirable/auto → trunk; **desirable** + desirable/auto → trunk; **auto + auto → access**; anything with **access** → access. Best practice is to hard-code trunks (`switchport mode trunk`) and turn DTP off with `switchport nonegotiate`, and to make user ports static access.',
  },
  {
    id: 'A2-05', exam: 'A', obj: '2.2', type: 'single',
    q: 'How does an 802.1Q trunk handle frames that belong to the native VLAN?',
    opts: [
      ['They are sent untagged.', 'Correct.'],
      ['They are tagged with VLAN ID 0.', 'VLAN 0 is used for priority tagging, not for the native VLAN.'],
      ['They are dropped.', 'Native VLAN frames are forwarded.'],
      ['They are encapsulated in ISL.', 'ISL is an obsolete Cisco trunking protocol.'],
    ],
    ans: 'a',
    exp: 'On an 802.1Q trunk every VLAN except the **native VLAN** is tagged. Untagged frames received on the trunk are placed in the native VLAN. Both ends must agree on the native VLAN, or frames will leak between VLANs (CDP reports `%CDP-4-NATIVE_VLAN_MISMATCH`).',
  },
  {
    id: 'A2-06', exam: 'A', obj: '2.2', type: 'single',
    q: 'Based on the output, why is traffic for VLAN 20 not forwarded across Gi0/1?',
    ex: [{ kind: 'cli', title: 'SW1#show interfaces trunk', text: `Port        Mode             Encapsulation  Status        Native vlan
Gi0/1       on               802.1q         trunking      99

Port        Vlans allowed on trunk
Gi0/1       1-100

Port        Vlans allowed and active in management domain
Gi0/1       1,10,20,30,99

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/1       1,10,30,99` }],
    opts: [
      ['Spanning tree is blocking Gi0/1 for VLAN 20 (or the VLAN has been pruned).', 'Correct. VLAN 20 is allowed and active but missing from the forwarding list.'],
      ['VLAN 20 is not in the allowed list.', 'VLANs 1–100 are allowed.'],
      ['VLAN 20 does not exist on SW1.', 'VLAN 20 is listed as active in the management domain.'],
      ['There is a native VLAN mismatch.', 'A mismatch would not single out VLAN 20.'],
    ],
    ans: 'a',
    exp: 'Read the four sections of `show interfaces trunk` in order: **allowed** (configured list) → **allowed and active** (also exists locally) → **forwarding and not pruned** (STP state and VTP pruning). VLAN 20 passes the first two checks but not the last, so per-VLAN spanning tree has this port blocking for VLAN 20, or VTP pruning removed it. With PVST+ a trunk can forward some VLANs and block others.',
  },
  {
    id: 'A2-07', exam: 'A', obj: '2.3', type: 'single',
    q: 'An engineer must enable LLDP on a switch but must not send LLDP advertisements out of Gi0/2, which faces the Internet. Which configuration is correct?',
    opts: [
      ['`lldp run` globally, then `no lldp transmit` under Gi0/2', 'Correct.'],
      ['`cdp run` globally, then `no cdp enable` under Gi0/2', 'This configures CDP, not LLDP.'],
      ['`lldp enable` under every interface except Gi0/2', 'LLDP is enabled globally with lldp run; per-interface control uses lldp transmit and lldp receive.'],
      ['`no lldp run` under Gi0/2', 'lldp run is a global command.'],
    ],
    ans: 'a',
    exp: 'LLDP (IEEE 802.1AB) is off by default on many Cisco switches. Enable it with **`lldp run`**, then control each interface with **`[no] lldp transmit`** and **`[no] lldp receive`**. CDP uses `[no] cdp run` globally and `[no] cdp enable` per interface. Disable both on untrusted edges, because they reveal platform, software version and addressing.',
  },
  {
    id: 'A2-08', exam: 'A', obj: '2.3', type: 'multi',
    q: 'Which two pieces of information can be learned about a neighbour from CDP?',
    opts: [
      ['The neighbour\'s hostname and hardware platform', 'Correct. Device ID and platform appear in show cdp neighbors.'],
      ['The neighbour\'s management IP address', 'Correct. Shown by show cdp neighbors detail.'],
      ['The neighbour\'s routing table', 'CDP does not exchange routes.'],
      ['The neighbour\'s running configuration', 'CDP shares only summary information.'],
      ['The MAC address table of the neighbour', 'This is not advertised.'],
    ],
    ans: 'a,b',
    exp: 'CDP advertises the device ID (hostname), **IP addresses**, local and remote port IDs, **platform** and capabilities, IOS version, native VLAN and duplex. `show cdp neighbors` gives a summary; `show cdp neighbors detail` adds the IP address and software version.',
  },
  {
    id: 'A2-09', exam: 'A', obj: '2.4', type: 'match',
    q: 'Drag each EtherChannel mode to the negotiation protocol it uses.',
    items: [['m1', 'active'], ['m2', 'passive'], ['m3', 'desirable'], ['m4', 'auto'], ['m5', 'on']],
    targets: [['lacp', 'LACP (IEEE 802.3ad)'], ['pagp', 'PAgP (Cisco proprietary)'], ['none', 'No negotiation protocol']],
    ans: { m1: 'lacp', m2: 'lacp', m3: 'pagp', m4: 'pagp', m5: 'none' },
    exp: '- **LACP**: `active` (initiates) and `passive` (responds). Active–active and active–passive form a bundle.\n- **PAgP**: `desirable` (initiates) and `auto` (responds). Desirable–desirable and desirable–auto form a bundle.\n- **on**: forces the channel with no negotiation; the other end must also be `on`.',
  },
  {
    id: 'A2-10', exam: 'A', obj: '2.4', type: 'multi',
    q: 'Which two settings must match on all member ports before they can join the same EtherChannel?',
    opts: [
      ['Speed and duplex', 'Correct.'],
      ['Switchport mode and allowed/native VLANs', 'Correct. Members must be all access in the same VLAN, or all trunks with the same VLAN settings.'],
      ['The interface description', 'Descriptions are cosmetic.'],
      ['The physical port numbers on both switches', 'Port numbers do not need to match between switches.'],
      ['The CDP setting', 'CDP does not affect bundling.'],
    ],
    ans: 'a,b',
    exp: 'Bundled ports must be compatible: same **speed and duplex**, same **switchport mode**, same access VLAN (or same native and allowed VLANs for trunks), and the same STP settings. Mismatched ports are suspended (`s`) or stay stand-alone (`I`). Configure the logical `interface port-channel` and let IOS apply the settings to the members.',
  },
  {
    id: 'A2-11', exam: 'A', obj: '2.5', type: 'single',
    q: 'Which port states does Rapid PVST+ use?',
    opts: [
      ['Discarding, learning, forwarding', 'Correct. RSTP merges disabled, blocking and listening into discarding.'],
      ['Blocking, listening, learning, forwarding, disabled', 'These are the classic 802.1D states.'],
      ['Initial, learn, listen, speak, standby, active', 'These are HSRP states.'],
      ['Down, init, two-way, full', 'These are OSPF neighbour states.'],
    ],
    ans: 'a',
    exp: '**RSTP (802.1w)**, which Rapid PVST+ runs per VLAN, has three states: **discarding**, **learning** and **forwarding**. Its roles are root, designated, alternate and backup (plus disabled). Fast convergence comes from the proposal/agreement handshake on point-to-point links and from edge ports (PortFast).',
  },
  {
    id: 'A2-12', exam: 'A', obj: '2.5', type: 'single',
    q: 'Three switches run PVST+. Based on the information below, which switch becomes the root bridge for VLAN 10?',
    ex: [{ kind: 'table', title: 'Bridge IDs for VLAN 10', md: '| Switch | Priority | MAC address |\n|---|---|---|\n| SW1 | 32778 | 0019.e86a.1100 |\n| SW2 | 28682 | 0024.97b3.5500 |\n| SW3 | 28682 | 0024.97b3.4200 |' }],
    opts: [
      ['SW3', 'Correct. SW2 and SW3 tie on the lowest priority; SW3 has the lower MAC.'],
      ['SW2', 'SW2 has the same priority as SW3 but a higher MAC.'],
      ['SW1', 'SW1 has the lowest MAC, but MAC is only a tie-breaker; its priority (32778) is higher.'],
      ['No root is elected because two switches have the same priority.', 'The MAC address breaks the tie.'],
    ],
    ans: 'a',
    exp: 'The bridge ID is **priority** (including the VLAN number as the sys-id-ext: 28672 + 10 = 28682) followed by the **MAC address**. Lowest wins: SW2 and SW3 share the lowest priority, so the lower MAC **0024.97b3.42**00 makes **SW3** the root.',
  },
  {
    id: 'A2-13', exam: 'A', obj: '2.5', type: 'single',
    q: 'Which feature err-disables a PortFast-enabled access port as soon as it receives a BPDU?',
    opts: [
      ['BPDU Guard', 'Correct.'],
      ['Root Guard', 'Root Guard blocks a port only when it receives a superior BPDU, and recovers automatically.'],
      ['Loop Guard', 'Loop Guard protects against unidirectional links on non-designated ports.'],
      ['BPDU Filter', 'BPDU Filter stops sending BPDUs (and can ignore received ones); it does not err-disable the port.'],
    ],
    ans: 'a',
    exp: '**BPDU Guard** (`spanning-tree bpduguard enable`, or globally for all PortFast ports with `spanning-tree portfast bpduguard default`) shuts the port down (err-disabled) when any BPDU arrives, which protects against someone connecting a switch to an edge port. **Root Guard** keeps the root bridge where you designed it by putting a port into root-inconsistent state if it hears a superior BPDU.',
  },
  {
    id: 'A2-14', exam: 'A', obj: '2.6', type: 'single',
    q: 'A branch site has lightweight APs that join a WLC in the HQ data centre over the WAN. Which AP mode lets the APs keep serving clients and switch traffic locally if the WAN link fails?',
    opts: [
      ['FlexConnect', 'Correct. FlexConnect APs can switch locally and survive a lost controller connection.'],
      ['Local', 'Local-mode APs tunnel all client traffic to the WLC and depend on it.'],
      ['Monitor', 'Monitor mode does not serve clients.'],
      ['Sniffer', 'Sniffer mode captures packets for analysis and does not serve clients.'],
    ],
    ans: 'a',
    exp: '**FlexConnect** is designed for branch offices: the AP can switch client traffic locally onto the branch VLANs instead of tunnelling it to the WLC. In **standalone** mode, when the controller is unreachable, it keeps existing clients connected (and can authenticate new ones locally).',
  },
  {
    id: 'A2-15', exam: 'A', obj: '2.6', type: 'single',
    q: 'In Cisco\'s split-MAC architecture, which function is performed by the lightweight AP rather than the WLC?',
    opts: [
      ['Sending beacons and responding to probe requests', 'Correct. These real-time functions stay on the AP.'],
      ['Client authentication and association management', 'The WLC handles authentication and associations.'],
      ['Assigning channels and transmit power to all APs', 'Radio resource management is centralised on the WLC.'],
      ['Managing roaming between APs', 'Roaming is coordinated by the WLC.'],
    ],
    ans: 'a',
    exp: '**AP (real-time MAC):** beacons, probe responses, frame acknowledgements and retransmissions, encryption/decryption, queuing. **WLC (management MAC):** authentication, association, roaming, RF management, security and QoS policy. Control and data are carried between them in **CAPWAP** tunnels.',
  },
  {
    id: 'A2-16', exam: 'A', obj: '2.7', type: 'single',
    q: 'How should the switch port connected to a lightweight AP in **local** mode be configured?',
    opts: [
      ['As an access port in the AP management VLAN', 'Correct. All client traffic is tunnelled to the WLC inside CAPWAP.'],
      ['As a trunk carrying every WLAN VLAN', 'A trunk is needed for autonomous APs or FlexConnect local switching.'],
      ['As a routed port', 'The AP needs a Layer 2 connection to an access VLAN.'],
      ['As an EtherChannel member', 'APs normally connect with a single link.'],
    ],
    ans: 'a',
    exp: 'A **local-mode** AP encapsulates all client traffic in CAPWAP to the WLC, so it only needs an IP address in one VLAN: use an **access port**. **Autonomous** APs and **FlexConnect** APs that switch WLAN traffic locally need an **802.1Q trunk**. The WLC itself usually connects with trunks (or a LAG) to reach its VLANs.',
  },
  {
    id: 'A2-17', exam: 'A', obj: '2.8', type: 'multi',
    q: 'Which two management protocols send login credentials in clear text?',
    opts: [
      ['Telnet', 'Correct. TCP 23, unencrypted.'],
      ['HTTP', 'Correct. TCP 80, unencrypted.'],
      ['SSH', 'SSH encrypts the whole session.'],
      ['HTTPS', 'HTTPS uses TLS encryption.'],
      ['SNMPv3 with authPriv', 'SNMPv3 authPriv authenticates and encrypts.'],
    ],
    ans: 'a,b',
    exp: 'Use **SSH** instead of Telnet and **HTTPS** instead of HTTP for device management (`transport input ssh`, `no ip http server`, `ip http secure-server`). SNMPv1/v2c communities are also sent in clear text, which is why SNMPv3 is preferred.',
  },
  {
    id: 'A2-18', exam: 'A', obj: '2.8', type: 'single',
    q: 'Which statement describes TACACS+?',
    opts: [
      ['It uses TCP port 49, encrypts the entire payload and separates authentication, authorisation and accounting.', 'Correct.'],
      ['It uses UDP 1812/1813 and encrypts only the password.', 'That describes RADIUS.'],
      ['It is an open IETF standard used mainly for network access (802.1X).', 'That also describes RADIUS.'],
      ['It stores credentials locally on each device.', 'TACACS+ uses a central server.'],
    ],
    ans: 'a',
    exp: '**TACACS+** (Cisco-developed, TCP 49) encrypts the whole body and handles authentication, authorisation and accounting separately, which allows per-command authorisation. It is the usual choice for **device administration**. **RADIUS** (open standard, UDP 1812/1813) encrypts only the password, combines authentication and authorisation, and is typical for **network access** (802.1X, VPN, Wi-Fi).',
  },
  {
    id: 'A2-19', exam: 'A', obj: '2.9', type: 'single',
    q: 'In the AireOS WLC GUI, where do you configure WPA2 with a pre-shared key for an existing WLAN?',
    opts: [
      ['WLANs > edit the WLAN > Security > Layer 2', 'Correct. Choose WPA2 policy with AES and AKM PSK, then enter the passphrase.'],
      ['Controller > Interfaces > edit the dynamic interface', 'Interfaces define VLANs and IP addressing, not WLAN security.'],
      ['Wireless > Access Points > edit the AP > Credentials', 'AP credentials are for logging in to the AP itself.'],
      ['WLANs > edit the WLAN > QoS', 'The QoS tab sets the QoS profile (Platinum, Gold, Silver, Bronze).'],
    ],
    ans: 'a',
    exp: 'WLAN settings are grouped in tabs: **General** (SSID, status, interface/VLAN), **Security** (Layer 2: WPA2/WPA3, AES, PSK or 802.1X; Layer 3: web authentication; AAA servers), **QoS** and **Advanced**. For WPA2-Personal, set Layer 2 Security to WPA+WPA2, tick WPA2 Policy and AES, set Auth Key Mgmt to PSK, and enter the key.',
  },

  // ================================================================ Exam B
  {
    id: 'B2-01', exam: 'B', obj: '2.1', type: 'multi',
    q: 'Which two methods provide routing between VLANs?',
    opts: [
      ['A router with 802.1Q subinterfaces on a trunk link (router-on-a-stick)', 'Correct.'],
      ['A multilayer switch with SVIs and IP routing enabled', 'Correct.'],
      ['VTP server mode', 'VTP synchronises VLAN databases; it does not route.'],
      ['A trunk link between two Layer 2 switches', 'Trunks carry VLANs but keep them separate.'],
      ['Changing the native VLAN', 'The native VLAN only controls untagged frames.'],
    ],
    ans: 'a,b',
    exp: 'Each VLAN is a separate IP subnet, so traffic between VLANs must be **routed**. Options: a separate router interface per VLAN (legacy), **router-on-a-stick** (one trunk with dot1Q subinterfaces), or a **Layer 3 switch** with one SVI per VLAN, which is the fastest and most common in campus networks.',
  },
  {
    id: 'B2-02', exam: 'B', obj: '2.1', type: 'single',
    q: 'A multilayer switch must route between VLAN 10 (192.168.10.0/24) and VLAN 20 (192.168.20.0/24). Which configuration achieves this?',
    opts: [
      ['`ip routing`; `interface vlan 10` with `ip address 192.168.10.1 255.255.255.0`; `interface vlan 20` with `ip address 192.168.20.1 255.255.255.0`', 'Correct. SVIs come up when the VLAN has active ports.'],
      ['`interface vlan 10` and `interface vlan 20` with IP addresses, without `ip routing`', 'Without ip routing the switch behaves as a host and does not route between SVIs.'],
      ['`switchport mode trunk` on every access port', 'Trunking does not provide routing.'],
      ['`ip default-gateway 192.168.10.1`', 'ip default-gateway is for a switch that is not routing.'],
    ],
    ans: 'a',
    exp: 'On a multilayer switch: enable **`ip routing`**, create one **SVI** per VLAN with the gateway address, and make sure each VLAN exists and has at least one active port (otherwise the SVI stays up/down). Hosts use the SVI address as their default gateway.',
  },
  {
    id: 'B2-03', exam: 'B', obj: '2.1', type: 'single',
    q: 'Several access ports are assigned to VLAN 30. An engineer enters `no vlan 30`. What happens to those ports?',
    opts: [
      ['They become inactive and stop forwarding until VLAN 30 is recreated or the ports are reassigned.', 'Correct.'],
      ['They automatically move to VLAN 1.', 'The ports keep their VLAN 30 assignment.'],
      ['They become trunk ports.', 'The port mode does not change.'],
      ['They are shut down administratively.', 'No shutdown command is applied.'],
    ],
    ans: 'a',
    exp: 'Deleting a VLAN does not reassign its ports. They still reference VLAN 30, which no longer exists, so they become **inactive** and drop traffic. Always reassign ports before deleting a VLAN. (By contrast, `switchport access vlan 30` on a switch where VLAN 30 does not exist **creates** it automatically.)',
  },
  {
    id: 'B2-04', exam: 'B', obj: '2.2', type: 'single',
    q: 'Which interface command stops a trunk port from sending DTP frames?',
    opts: [
      ['switchport nonegotiate', 'Correct. Use it together with switchport mode trunk (or access).'],
      ['no cdp enable', 'This disables CDP, not DTP.'],
      ['switchport mode dynamic auto', 'Dynamic modes rely on DTP.'],
      ['spanning-tree bpdufilter enable', 'This affects STP BPDUs.'],
    ],
    ans: 'a',
    exp: '**`switchport nonegotiate`** turns DTP off on a port that is statically `trunk` (or `access`). This prevents an attacker\'s device from negotiating a trunk (switch spoofing). The far end must also be a static trunk, because a dynamic port will not trunk without DTP.',
  },
  {
    id: 'B2-05', exam: 'B', obj: '2.2', type: 'single',
    q: 'How does 802.1Q identify the VLAN of a frame on a trunk?',
    opts: [
      ['It inserts a 4-byte tag, containing a 12-bit VLAN ID, between the source MAC address and the EtherType field.', 'Correct.'],
      ['It encapsulates the whole frame inside a new 26-byte header.', 'That describes the obsolete ISL.'],
      ['It writes the VLAN number into the IP header.', '802.1Q works at Layer 2.'],
      ['It uses a different destination MAC address for each VLAN.', 'The MAC addresses are unchanged.'],
    ],
    ans: 'a',
    exp: 'The **802.1Q tag** is 4 bytes: TPID (0x8100), a 3-bit PCP (CoS priority), a 1-bit DEI and a **12-bit VID** (VLANs 1–4094 usable; 0 and 4095 are reserved). Because the frame changes, the FCS is recalculated. ISL, by contrast, encapsulated the whole frame and is no longer supported on modern switches.',
  },
  {
    id: 'B2-06', exam: 'B', obj: '2.2', type: 'single',
    q: 'A trunk currently allows VLANs 10 and 20. An engineer enters `switchport trunk allowed vlan 30` on the trunk. What is the result?',
    opts: [
      ['Only VLAN 30 is now allowed; VLANs 10 and 20 are removed.', 'Correct. Without add, the command replaces the list.'],
      ['VLANs 10, 20 and 30 are allowed.', 'That needs switchport trunk allowed vlan add 30.'],
      ['VLAN 30 becomes the native VLAN.', 'The native VLAN is set with switchport trunk native vlan.'],
      ['The command is rejected because VLANs are already allowed.', 'The command is accepted.'],
    ],
    ans: 'a',
    exp: '`switchport trunk allowed vlan <list>` **replaces** the allowed list. To change it incrementally use **`add`**, **`remove`** or **`except`**. Typing the command without `add` on a production trunk is a classic way to cut off every other VLAN.',
  },
  {
    id: 'B2-07', exam: 'B', obj: '2.3', type: 'single',
    q: 'Why should CDP be disabled on an interface that connects to an untrusted network such as the Internet?',
    opts: [
      ['CDP advertises details such as the hostname, IP address, platform and IOS version that help attackers.', 'Correct. Use no cdp enable on that interface.'],
      ['CDP consumes most of the link bandwidth.', 'CDP sends small messages every 60 seconds.'],
      ['CDP causes spanning-tree loops.', 'CDP has nothing to do with STP.'],
      ['CDP prevents NAT from working.', 'CDP does not interact with NAT.'],
    ],
    ans: 'a',
    exp: 'CDP and LLDP are useful inside the network but leak reconnaissance information. Disable them on untrusted interfaces (`no cdp enable`, `no lldp transmit`) or globally (`no cdp run`) where they are not needed.',
  },
  {
    id: 'B2-08', exam: 'B', obj: '2.3', type: 'single',
    q: 'Which statement correctly compares CDP and LLDP?',
    opts: [
      ['LLDP is an IEEE standard (802.1AB) that works between vendors, while CDP is Cisco proprietary.', 'Correct.'],
      ['CDP is disabled by default on Cisco devices, while LLDP is enabled.', 'It is usually the opposite: CDP is on by default, LLDP is often off.'],
      ['LLDP runs at Layer 3 and needs IP addresses.', 'Both run at Layer 2 and need no IP configuration.'],
      ['CDP can discover devices several hops away.', 'Both only discover directly connected neighbours.'],
    ],
    ans: 'a',
    exp: 'Both are **Layer 2** neighbour discovery protocols that only see **directly connected** devices. **CDP** is Cisco proprietary and enabled by default (60 s timer, 180 s holdtime). **LLDP** is vendor-neutral (30 s timer, 120 s holdtime) and is enabled with `lldp run`.',
  },
  {
    id: 'B2-09', exam: 'B', obj: '2.4', type: 'single',
    q: 'The EtherChannel between SW1 and SW2 does not form. SW2 has the same configuration as SW1. What is the cause?',
    ex: [{ kind: 'cli', title: 'SW1', text: `SW1#show running-config | section interface GigabitEthernet0/[12]
interface GigabitEthernet0/1
 switchport mode trunk
 channel-group 1 mode passive
interface GigabitEthernet0/2
 switchport mode trunk
 channel-group 1 mode passive

SW1#show etherchannel summary | begin Group
Group  Port-channel  Protocol    Ports
------+-------------+-----------+-----------------------------------------------
1      Po1(SD)         LACP      Gi0/1(I)    Gi0/2(I)` }],
    opts: [
      ['Both switches use LACP passive mode, so neither starts the negotiation.', 'Correct. At least one side must be active.'],
      ['LACP is not supported on trunk ports.', 'LACP bundles trunk ports routinely.'],
      ['The ports must use mode on.', 'mode on would work if both sides used it, but it is not required.'],
      ['Port-channel 1 has not been created manually.', 'IOS creates Po1 automatically when channel-group is configured.'],
    ],
    ans: 'a',
    exp: '**Passive** ports only reply to LACPDUs; they never send the first one. With both ends passive, no negotiation happens and the ports stay **stand-alone (I)** while Po1 is down (**SD**). Set at least one side to **active**.',
  },
  {
    id: 'B2-10', exam: 'B', obj: '2.4', type: 'single',
    q: 'How is a Layer 3 EtherChannel configured on a multilayer switch?',
    opts: [
      ['Make the member ports routed (`no switchport`), bundle them, and put the IP address on the Port-channel interface.', 'Correct.'],
      ['Put the IP address on each member interface.', 'The address belongs on the logical Port-channel interface.'],
      ['Configure the members as trunks and create an SVI.', 'That is a Layer 2 EtherChannel with an SVI.'],
      ['Layer 3 EtherChannels are only supported on routers.', 'Multilayer switches support them.'],
    ],
    ans: 'a',
    exp: 'For a **Layer 3 EtherChannel**: `no switchport` on the members (and on `interface port-channel N`), `channel-group N mode active`, then assign the IP address under **`interface port-channel N`**. The bundle behaves as one routed link, which is common between distribution and core switches.',
  },
  {
    id: 'B2-11', exam: 'B', obj: '2.5', type: 'single',
    q: 'Which RSTP port role provides a backup path to the root bridge and is in the discarding state?',
    opts: [
      ['Alternate', 'Correct. It takes over immediately if the root port fails.'],
      ['Backup', 'A backup port is a redundant link to the same segment on the same switch (rare with modern full-duplex links).'],
      ['Designated', 'Designated ports forward toward a segment.'],
      ['Root', 'The root port is the best path to the root and is forwarding.'],
    ],
    ans: 'a',
    exp: 'RSTP roles: **root** (best path to the root bridge, forwarding), **designated** (best port onto a segment, forwarding), **alternate** (another path to the root, discarding, which becomes root port immediately on failure), **backup** (a redundant port onto a segment the switch already serves as designated).',
  },
  {
    id: 'B2-12', exam: 'B', obj: '2.5', type: 'single',
    q: 'What is the purpose of PortFast?',
    opts: [
      ['It lets an access port connected to an end device go straight to forwarding, skipping the listening and learning delays.', 'Correct.'],
      ['It increases the speed of the link to the next standard.', 'Speed is not affected.'],
      ['It enables load balancing across redundant links.', 'That is EtherChannel.'],
      ['It prevents the port from ever sending BPDUs.', 'That is BPDU Filter.'],
    ],
    ans: 'a',
    exp: 'Without PortFast, a classic STP port spends 30 seconds in listening and learning, so PCs could time out waiting for DHCP. **PortFast** (an RSTP edge port) moves straight to forwarding. Use it only on ports facing end hosts, and pair it with **BPDU Guard**.',
  },
  {
    id: 'B2-13', exam: 'B', obj: '2.5', type: 'single',
    q: 'Which feature prevents a switch attached to a designated port from becoming the root bridge, by placing that port in a root-inconsistent state if it receives a superior BPDU?',
    opts: [
      ['Root Guard', 'Correct.'],
      ['BPDU Guard', 'BPDU Guard err-disables a port on any BPDU.'],
      ['Loop Guard', 'Loop Guard reacts to missing BPDUs.'],
      ['UplinkFast', 'UplinkFast speeds up failover in classic STP.'],
    ],
    ans: 'a',
    exp: '**Root Guard** (`spanning-tree guard root`) is applied on designated ports where the root must never appear, such as ports toward access switches or a customer. A superior BPDU puts the port into **root-inconsistent** (blocking) state, which clears automatically when the superior BPDUs stop.',
  },
  {
    id: 'B2-14', exam: 'B', obj: '2.6', type: 'single',
    q: 'Which protocol do lightweight APs use to communicate with their wireless LAN controller?',
    opts: [
      ['CAPWAP', 'Correct. UDP 5246 for control and 5247 for data.'],
      ['LWAPP over TCP 443', 'LWAPP was CAPWAP\'s predecessor and did not use TCP 443.'],
      ['RADIUS', 'RADIUS is used for authentication with an AAA server.'],
      ['GRE', 'GRE is a generic tunnelling protocol, not used for AP-to-WLC control.'],
    ],
    ans: 'a',
    exp: '**CAPWAP** builds two tunnels between each AP and its WLC: **control** (UDP 5246, DTLS-encrypted) and **data** (UDP 5247, encryption optional). Client traffic from local-mode APs travels inside the data tunnel to the WLC.',
  },
  {
    id: 'B2-15', exam: 'B', obj: '2.6', type: 'match',
    q: 'Drag each lightweight AP mode to its description.',
    items: [['m1', 'Local'], ['m2', 'FlexConnect'], ['m3', 'Monitor'], ['m4', 'Sniffer'], ['m5', 'Bridge']],
    targets: [
      ['t1', 'Default mode: serves clients and tunnels all their traffic to the WLC'],
      ['t2', 'Can switch client traffic locally and keep working if the WLC is unreachable'],
      ['t3', 'Does not serve clients; scans channels for rogue devices, intrusion detection and location'],
      ['t4', 'Captures 802.11 frames and forwards them to a packet analyser'],
      ['t5', 'Joins APs into a point-to-point or mesh wireless backhaul'],
    ],
    ans: { m1: 't1', m2: 't2', m3: 't3', m4: 't4', m5: 't5' },
    exp: 'Other modes include **rogue detector** (listens on the wired side for rogue client MACs) and **SE-Connect** (spectrum analysis with Cisco Spectrum Expert). Only Local, FlexConnect and Bridge serve clients.',
  },
  {
    id: 'B2-16', exam: 'B', obj: '2.7', type: 'single',
    q: 'An AireOS WLC is configured with LAG. How must the switch ports connected to its distribution ports be configured?',
    opts: [
      ['As an EtherChannel using `channel-group <n> mode on`', 'Correct. AireOS LAG does not support LACP or PAgP.'],
      ['As an EtherChannel using LACP active mode', 'AireOS WLC LAG does not negotiate with LACP.'],
      ['As individual access ports in the management VLAN', 'LAG needs a bundle on the switch.'],
      ['As routed ports with IP addresses', 'WLC distribution ports carry 802.1Q trunks.'],
    ],
    ans: 'a',
    exp: 'With **LAG** enabled, the WLC bundles all its distribution system ports into one logical link with no negotiation protocol, so the switch side must be an EtherChannel in **mode on**, usually configured as a trunk carrying the management and dynamic interface VLANs. LAG gives redundancy and load sharing without needing a separate AP-manager per port.',
  },
  {
    id: 'B2-17', exam: 'B', obj: '2.8', type: 'multi',
    q: 'A Layer 2 switch must be managed with SSH from a different subnet. Apart from the SSH settings, which two IP settings are required?',
    opts: [
      ['An IP address on a management SVI (for example interface vlan 99) that is up', 'Correct.'],
      ['ip default-gateway pointing to the router on the management subnet', 'Correct. A Layer 2 switch needs it to reply to remote hosts.'],
      ['ip routing', 'A Layer 2 switch does not route; it acts as a host.'],
      ['router ospf 1', 'Routing protocols are not needed for management.'],
      ['ip helper-address', 'This relays DHCP; it is not needed for management access.'],
    ],
    ans: 'a,b',
    exp: 'A Layer 2 switch is managed like a host: an IP address on an **SVI** in the management VLAN (the VLAN must exist and have an active port or trunk) and an **`ip default-gateway`** to reach other subnets. SSH also needs a hostname, domain name, RSA keys, local users and `transport input ssh` on the VTY lines.',
  },
  {
    id: 'B2-18', exam: 'B', obj: '2.9', type: 'single',
    q: 'Which QoS profile should be selected on the WLC for a WLAN that carries voice traffic?',
    opts: [
      ['Platinum', 'Correct. Platinum is for voice.'],
      ['Gold', 'Gold is for video.'],
      ['Silver', 'Silver is best effort, the default.'],
      ['Bronze', 'Bronze is for background traffic.'],
    ],
    ans: 'a',
    exp: 'AireOS WLAN QoS profiles: **Platinum** (voice), **Gold** (video), **Silver** (best effort, default) and **Bronze** (background). The profile caps the 802.11e/WMM priority that clients on the WLAN receive and the markings used toward the wired network.',
  },

  // ================================================================ Exam C
  {
    id: 'C2-01', exam: 'C', obj: '2.1', type: 'multi',
    q: 'Which two statements describe an access port?',
    opts: [
      ['It belongs to one data VLAN (plus an optional voice VLAN).', 'Correct.'],
      ['It sends and receives data frames untagged.', 'Correct. End hosts are not VLAN-aware.'],
      ['It carries traffic for multiple data VLANs using 802.1Q tags.', 'That is a trunk.'],
      ['It negotiates trunking by default.', 'A static access port does not trunk.'],
      ['It can only be in VLAN 1.', 'It can be in any VLAN.'],
    ],
    ans: 'a,b',
    exp: 'An **access port** carries one data VLAN and connects to an end device, which sends ordinary untagged Ethernet frames. The switch associates those frames with the configured access VLAN. A voice VLAN adds tagged phone traffic without making the port a trunk.',
  },
  {
    id: 'C2-02', exam: 'C', obj: '2.1', type: 'single',
    q: 'Hosts in VLAN 10 can reach other subnets through R1, but hosts in VLAN 20 cannot. What is the problem?',
    ex: [{ kind: 'cli', title: 'R1#show running-config | section interface Gig', text: `interface GigabitEthernet0/0
 no ip address
 duplex auto
 speed auto
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
interface GigabitEthernet0/0.20
 encapsulation dot1Q 30
 ip address 192.168.20.1 255.255.255.0` }],
    opts: [
      ['Subinterface G0/0.20 is tagged for VLAN 30 instead of VLAN 20.', 'Correct. The subinterface number is just a label; the encapsulation sets the VLAN.'],
      ['The physical interface G0/0 has no IP address.', 'The parent interface of a router-on-a-stick normally has no IP address.'],
      ['The subinterface number must equal the IP subnet.', 'Subinterface numbers are arbitrary.'],
      ['VLAN 20 must be the native VLAN.', 'There is no native VLAN requirement here.'],
    ],
    ans: 'a',
    exp: 'In router-on-a-stick, **`encapsulation dot1Q <vlan>`** binds a subinterface to a VLAN. Matching the subinterface number to the VLAN ID is only a convention. G0/0.20 is tagged for VLAN 30, so frames from VLAN 20 never reach it. Fix it with `encapsulation dot1Q 20`.',
  },
  {
    id: 'C2-03', exam: 'C', obj: '2.1', type: 'single',
    q: 'Which range of VLAN IDs is the normal range on Cisco Catalyst switches?',
    opts: [
      ['1–1005', 'Correct. 1002–1005 are reserved for legacy FDDI and Token Ring.'],
      ['1–4094', 'This is the full usable range, including the extended range.'],
      ['1006–4094', 'This is the extended range.'],
      ['0–4095', '0 and 4095 are reserved and cannot be used.'],
    ],
    ans: 'a',
    exp: '**Normal range:** VLANs 1–1005, stored in vlan.dat (1 is default, 1002–1005 are reserved). **Extended range:** 1006–4094. VLAN IDs 0 and 4095 are reserved by the 802.1Q standard.',
  },
  {
    id: 'C2-04', exam: 'C', obj: '2.2', type: 'single',
    q: 'SW1 logs the message below. What is the effect of this condition?',
    ex: [{ kind: 'cli', title: 'SW1 log', text: `%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet0/1 (99), with SW2 GigabitEthernet0/1 (1).` }],
    opts: [
      ['Untagged frames sent from VLAN 99 on SW1 arrive in VLAN 1 on SW2, so traffic leaks between the two VLANs.', 'Correct.'],
      ['The trunk shuts down until the native VLANs match.', 'The trunk stays up; the mismatch causes leaking, not a shutdown.'],
      ['All VLANs stop working on the trunk.', 'Tagged VLANs are unaffected.'],
      ['SW2 tags VLAN 1 frames with VLAN 99.', 'Native VLAN frames are untagged on both sides.'],
    ],
    ans: 'a',
    exp: 'Native VLAN frames cross the trunk **untagged**, and each switch puts untagged frames into its own native VLAN. With 99 on SW1 and 1 on SW2, traffic crosses between VLAN 99 and VLAN 1, which is a connectivity and security problem. STP may also put ports into an inconsistent state. Make both ends match.',
  },
  {
    id: 'C2-05', exam: 'C', obj: '2.2', type: 'multi',
    q: 'Which two statements about the 802.1Q native VLAN are true?',
    opts: [
      ['It should be the same on both ends of a trunk.', 'Correct.'],
      ['Best practice is to use an unused VLAN rather than VLAN 1.', 'Correct. This helps prevent VLAN-hopping attacks.'],
      ['Its frames are tagged with VLAN ID 1.', 'Native VLAN frames are untagged.'],
      ['It must always be VLAN 1.', 'It is VLAN 1 by default but can be changed.'],
      ['It carries all the user data on the trunk.', 'User VLANs are tagged; the native VLAN should carry little or nothing.'],
    ],
    ans: 'a,b',
    exp: 'Set the native VLAN to an **unused, dedicated VLAN** on both ends (`switchport trunk native vlan 999`). Optionally use `vlan dot1q tag native` to tag it too. This mitigates **double-tagging VLAN hopping**, where an attacker in the native VLAN sends frames with two tags.',
  },
  {
    id: 'C2-06', exam: 'C', obj: '2.2', type: 'single',
    q: 'SW1 Gi0/1 is set to `switchport mode dynamic auto` and SW2 Gi0/1 is set to `switchport mode access`. What is the operational mode of the link?',
    opts: [
      ['Access on both ends', 'Correct. Neither side will initiate a trunk.'],
      ['Trunk on both ends', 'Auto needs the other side to request a trunk; an access port never does.'],
      ['Trunk on SW1, access on SW2', 'Auto only becomes a trunk if the neighbour requests it.'],
      ['The link is err-disabled', 'There is no error condition.'],
    ],
    ans: 'a',
    exp: '`dynamic auto` waits passively for a trunk request. An **access** port never sends one, so the link operates in **access** mode. Check with `show interfaces gi0/1 switchport` (Administrative Mode vs Operational Mode).',
  },
  {
    id: 'C2-07', exam: 'C', obj: '2.3', type: 'single',
    q: 'Which command shows the IP addresses of directly connected Cisco devices?',
    opts: [
      ['show cdp neighbors detail', 'Correct. The detail view includes the Entry address(es) field.'],
      ['show cdp neighbors', 'The summary table does not include IP addresses.'],
      ['show ip interface brief', 'This shows the local interfaces only.'],
      ['show arp', 'ARP shows IP-to-MAC entries but not which device or port they belong to.'],
    ],
    ans: 'a',
    exp: '`show cdp neighbors detail` (or `show cdp entry *`) lists each neighbour\'s **IP address**, platform, capabilities, IOS version and interfaces, which is useful for building a topology from the CLI. The LLDP equivalent is `show lldp neighbors detail`.',
  },
  {
    id: 'C2-08', exam: 'C', obj: '2.3', type: 'multi',
    q: 'Which two statements about LLDP on Cisco IOS are true?',
    opts: [
      ['It is enabled globally with the lldp run command.', 'Correct.'],
      ['Transmission and reception can be controlled per interface.', 'Correct. Use lldp transmit and lldp receive.'],
      ['It is Cisco proprietary.', 'LLDP is IEEE 802.1AB.'],
      ['It requires an IP address on the interface.', 'LLDP runs at Layer 2.'],
      ['It discovers devices up to three hops away.', 'LLDP only sees directly connected neighbours.'],
    ],
    ans: 'a,b',
    exp: 'Enable LLDP with **`lldp run`**, then fine-tune each interface with **`[no] lldp transmit`** and **`[no] lldp receive`**. Verify with `show lldp neighbors [detail]`. Defaults: 30-second advertisements and a 120-second holdtime.',
  },
  {
    id: 'C2-09', exam: 'C', obj: '2.4', type: 'single',
    q: 'What is the maximum number of physical links that can actively forward traffic in one LACP EtherChannel?',
    opts: [
      ['8', 'Correct. Up to 16 ports can be configured; 8 are active and the rest are hot-standby.'],
      ['2', 'More than two links are allowed.'],
      ['4', 'Four is not the limit.'],
      ['16', '16 can be configured, but only 8 are active.'],
    ],
    ans: 'a',
    exp: 'An EtherChannel has up to **8 active** members. **LACP** allows up to 16 to be configured, with the extra 8 in **hot-standby** (flag H) ready to replace a failed link. PAgP and `on` support 8.',
  },
  {
    id: 'C2-10', exam: 'C', obj: '2.4', type: 'multi',
    q: 'Which two mode combinations form an EtherChannel?',
    opts: [
      ['on / on', 'Correct. A static bundle with no negotiation.'],
      ['desirable / auto', 'Correct. PAgP negotiation succeeds.'],
      ['on / active', 'on sends no LACPDUs, so the active side never bundles.'],
      ['passive / passive', 'Neither side starts LACP.'],
      ['auto / auto', 'Neither side starts PAgP.'],
    ],
    ans: 'a,b',
    exp: 'Valid pairs: LACP **active/active** and **active/passive**; PAgP **desirable/desirable** and **desirable/auto**; static **on/on**. You cannot mix protocols or combine `on` with a negotiating mode.',
  },
  {
    id: 'C2-11', exam: 'C', obj: '2.4', type: 'single',
    q: 'How does an EtherChannel distribute traffic across its member links?',
    opts: [
      ['It hashes fields such as source and destination MAC or IP addresses, so each flow consistently uses one member link.', 'Correct.'],
      ['It sends each frame out of the next link in turn (round-robin).', 'Round-robin would reorder frames within a flow.'],
      ['It always uses the lowest-numbered link until it is full.', 'That is not how load balancing works.'],
      ['It duplicates every frame on all links for redundancy.', 'Frames are sent once.'],
    ],
    ans: 'a',
    exp: 'EtherChannel load balancing hashes chosen header fields (`port-channel load-balance src-dst-ip`, `src-mac` and so on) to pick a member. All frames of one flow use the **same link**, which keeps them in order, so a single large flow cannot exceed one link\'s speed. Pick a method that suits the traffic mix to spread flows evenly.',
  },
  {
    id: 'C2-12', exam: 'C', obj: '2.5', type: 'single',
    q: 'Based on the output, which statement is true?',
    ex: [{ kind: 'cli', title: 'SW2#show spanning-tree vlan 10', text: `VLAN0010
  Spanning tree enabled protocol rstp
  Root ID    Priority    24586
             Address     0019.e86a.1100
             Cost        4
             Port        25 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)
             Address     0024.97b3.5500
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec
             Aging Time  300 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.25   P2p
Gi0/2               Altn BLK 4         128.26   P2p
Fa0/1               Desg FWD 19        128.1    P2p Edge` }],
    opts: [
      ['SW2 is not the root bridge; it reaches the root through Gi0/1 with a path cost of 4.', 'Correct.'],
      ['SW2 is the root bridge for VLAN 10.', 'The root has priority 24586 and a different MAC address.'],
      ['Gi0/2 is forwarding traffic for VLAN 10.', 'Gi0/2 is an alternate port in the blocking state.'],
      ['Fa0/1 connects to another switch.', 'Edge means PortFast is enabled, so it faces an end device.'],
    ],
    ans: 'a',
    exp: 'The Root ID differs from SW2\'s Bridge ID, so SW2 is a non-root switch. Its **root port** Gi0/1 has a root path cost of **4** (one Gigabit hop to the root). Gi0/2 is an **alternate** port (discarding) ready to take over, and Fa0/1 is an **edge** (PortFast) designated port.',
  },
  {
    id: 'C2-13', exam: 'C', obj: '2.5', type: 'single',
    q: 'Which command makes a switch the root bridge for VLAN 10 by lowering its priority below that of the current root?',
    opts: [
      ['spanning-tree vlan 10 root primary', 'Correct. It is a macro that sets 24576, or 4096 below the current root if that is lower.'],
      ['spanning-tree vlan 10 priority 32768', 'This is the default priority.'],
      ['spanning-tree vlan 10 root secondary', 'This sets 28672 for a backup root.'],
      ['spanning-tree portfast', 'This is an interface feature for edge ports.'],
    ],
    ans: 'a',
    exp: '**`root primary`** sets the priority to 24576, or lower in steps of 4096 if another switch already has a lower priority. **`root secondary`** sets 28672. You can also set it directly: `spanning-tree vlan 10 priority 4096` (values must be multiples of 4096).',
  },
  {
    id: 'C2-14', exam: 'C', obj: '2.5', type: 'single',
    q: 'Which set lists the default 802.1D (short method) spanning-tree port costs for 10 Mb/s, 100 Mb/s, 1 Gb/s and 10 Gb/s links?',
    opts: [
      ['100, 19, 4, 2', 'Correct.'],
      ['10, 1, 1, 1', 'These resemble OSPF costs with a 100-Mbps reference.'],
      ['100, 10, 1, 1', 'These are not the STP short-method values.'],
      ['2, 4, 19, 100', 'This is the right set in reverse order.'],
    ],
    ans: 'a',
    exp: 'Short (16-bit) STP costs: **10 Mb/s = 100**, **100 Mb/s = 19**, **1 Gb/s = 4**, **10 Gb/s = 2**. Root path cost is the sum of the costs of the ports *receiving* BPDUs along the path. The long (32-bit) method uses 2,000,000 / 200,000 / 20,000 / 2,000.',
  },
  {
    id: 'C2-15', exam: 'C', obj: '2.6', type: 'single',
    q: 'Which lightweight AP mode dedicates the radios to scanning for rogue devices, intrusion detection and location tracking, and does not serve clients?',
    opts: [
      ['Monitor', 'Correct.'],
      ['Local', 'Local mode serves clients and scans off-channel only briefly.'],
      ['FlexConnect', 'FlexConnect serves clients at remote sites.'],
      ['Bridge', 'Bridge mode builds wireless backhaul links.'],
    ],
    ans: 'a',
    exp: '**Monitor** mode APs do not transmit to clients; they continuously scan all channels for rogue APs and clients, wIPS and location services. Local-mode APs also scan, but only briefly between serving clients.',
  },
  {
    id: 'C2-16', exam: 'C', obj: '2.6', type: 'single',
    q: 'Which statement describes an autonomous AP compared with a lightweight AP?',
    opts: [
      ['An autonomous AP is configured and managed individually and does not need a WLC.', 'Correct.'],
      ['An autonomous AP must tunnel all client traffic to a WLC using CAPWAP.', 'That describes a lightweight local-mode AP.'],
      ['An autonomous AP cannot support multiple SSIDs.', 'Autonomous APs can map several SSIDs to VLANs over a trunk.'],
      ['An autonomous AP is managed only from a cloud dashboard.', 'That describes cloud-managed APs such as Meraki.'],
    ],
    ans: 'a',
    exp: '**Autonomous** APs hold their full configuration locally and bridge each SSID to a VLAN, usually over an 802.1Q trunk. They do not scale well because every AP is managed separately. **Lightweight** APs depend on a WLC (on premises or embedded), and **cloud-managed** APs are run from a cloud dashboard.',
  },
  {
    id: 'C2-17', exam: 'C', obj: '2.7', type: 'single',
    q: 'A FlexConnect AP switches traffic for two WLANs locally onto VLANs 20 and 30. Its own management address is in VLAN 10. How should the access switch port be configured?',
    opts: [
      ['As a trunk with native VLAN 10 that allows VLANs 10, 20 and 30', 'Correct. The AP\'s management traffic is untagged in the native VLAN.'],
      ['As an access port in VLAN 10', 'Locally switched WLAN traffic in VLANs 20 and 30 would have nowhere to go.'],
      ['As an access port in VLAN 20', 'This breaks AP management and the VLAN 30 WLAN.'],
      ['As a routed port', 'The AP needs Layer 2 VLAN connectivity.'],
    ],
    ans: 'a',
    exp: 'With **local switching**, a FlexConnect AP tags each WLAN\'s traffic with its VLAN, so the switch port must be an **802.1Q trunk**. The AP sources its own CAPWAP and management traffic untagged, so set the trunk\'s **native VLAN** to the AP management VLAN.',
  },
  {
    id: 'C2-18', exam: 'C', obj: '2.8', type: 'single',
    q: 'Which AAA protocol uses UDP ports 1812 and 1813, encrypts only the password and combines authentication with authorisation?',
    opts: [
      ['RADIUS', 'Correct.'],
      ['TACACS+', 'TACACS+ uses TCP 49 and encrypts the whole payload.'],
      ['LDAP', 'LDAP is a directory protocol.'],
      ['Kerberos', 'Kerberos is a ticket-based authentication protocol, not a network AAA protocol.'],
    ],
    ans: 'a',
    exp: '**RADIUS** is an open standard on UDP 1812 (authentication) and 1813 (accounting); older implementations used 1645/1646. It hides only the password and returns authorisation attributes in the Access-Accept message. It is the protocol used by 802.1X, Wi-Fi Enterprise and VPN logins.',
  },
  {
    id: 'C2-19', exam: 'C', obj: '2.8', type: 'single',
    q: 'Which statement describes cloud-managed network devices, such as Cisco Meraki?',
    opts: [
      ['They are configured and monitored through a web dashboard hosted by the vendor, and the devices connect outbound to the cloud.', 'Correct.'],
      ['They require an on-premises controller in each building.', 'No local controller is needed.'],
      ['They can only be managed with the console port.', 'Management is through the dashboard.'],
      ['They cannot be managed remotely.', 'Remote management is their main benefit.'],
    ],
    ans: 'a',
    exp: '**Cloud-managed** devices phone home to the vendor\'s cloud. Administrators use one dashboard for configuration, monitoring, firmware and alerts across all sites, which suits distributed organisations with little local IT staff. Only management traffic goes to the cloud; user data is forwarded locally.',
  },
  {
    id: 'C2-20', exam: 'C', obj: '2.9', type: 'single',
    q: 'In the AireOS WLC GUI, which setting maps a WLAN\'s clients to a VLAN?',
    opts: [
      ['WLANs > edit the WLAN > General > Interface/Interface Group', 'Correct. Select the dynamic interface for that VLAN.'],
      ['WLANs > edit the WLAN > Security > Layer 3', 'Layer 3 security is web authentication.'],
      ['Controller > General > LAG Mode', 'LAG bundles the controller\'s ports.'],
      ['Wireless > 802.11a/n/ac > RRM', 'RRM controls channels and power.'],
    ],
    ans: 'a',
    exp: 'Each **dynamic interface** on the WLC is a VLAN with an IP address. On a WLAN\'s **General** tab you choose the **Interface/Interface Group**, which places that WLAN\'s client traffic onto the VLAN. The Security tab handles WPA2/WPA3 and AAA, and the QoS tab handles the QoS profile.',
  },

  // ================================================================ Exam D
  {
    id: 'D2-01', exam: 'D', obj: '2.1', type: 'single',
    q: 'VLAN 50 does not exist on a switch. An engineer enters `switchport access vlan 50` on Fa0/7. What happens?',
    opts: [
      ['The switch reports that the VLAN does not exist and creates VLAN 50 automatically.', 'Correct: "% Access VLAN does not exist. Creating vlan 50".'],
      ['The command is rejected.', 'IOS creates the VLAN instead of rejecting the command.'],
      ['The port is placed in VLAN 1 until VLAN 50 is created.', 'The VLAN is created immediately.'],
      ['The port becomes a trunk.', 'The port mode does not change.'],
    ],
    ans: 'a',
    exp: 'On Catalyst switches, assigning an access port to a missing VLAN **creates** the VLAN (named VLAN0050). Remember the difference: *deleting* a VLAN leaves its ports inactive until you recreate it.',
  },
  {
    id: 'D2-02', exam: 'D', obj: '2.1', type: 'single',
    q: 'A port is configured with `switchport access vlan 10` and `switchport voice vlan 110`. How does the switch handle voice traffic from the attached IP phone?',
    opts: [
      ['The phone sends voice frames tagged with VLAN 110; data from the PC is untagged in VLAN 10.', 'Correct.'],
      ['Both voice and data are untagged in VLAN 10.', 'Voice is tagged with the voice VLAN.'],
      ['The port becomes a full trunk carrying all VLANs.', 'The port stays an access port with an auxiliary voice VLAN.'],
      ['The switch tags the PC\'s traffic with VLAN 110.', 'The PC\'s traffic is in the access VLAN.'],
    ],
    ans: 'a',
    exp: 'The switch tells the phone its voice VLAN through **CDP** (or LLDP-MED). The phone tags its own frames with **802.1Q VLAN 110** and a CoS value, and passes the PC\'s frames through untagged into **access VLAN 10**. This keeps voice in its own subnet for QoS and security.',
  },
  {
    id: 'D2-03', exam: 'D', obj: '2.2', type: 'single',
    q: 'How many bits of the 802.1Q tag identify the VLAN, and what is the highest usable VLAN ID?',
    opts: [
      ['12 bits; 4094', 'Correct. 2¹² = 4096 values, with 0 and 4095 reserved.'],
      ['10 bits; 1005', '1005 is the top of the normal range, not the tag limit.'],
      ['16 bits; 65535', 'The whole TPID is 16 bits, but the VID is 12 bits.'],
      ['12 bits; 4096', 'VLAN 4095 is reserved and 4096 does not exist.'],
    ],
    ans: 'a',
    exp: 'The **VID** field is 12 bits, giving values 0–4095. **0** means priority-tagged (no VLAN) and **4095** is reserved, so usable VLANs are **1–4094**.',
  },
  {
    id: 'D2-04', exam: 'D', obj: '2.2', type: 'single',
    q: 'The link between SW1 and SW2 must trunk, but it does not. SW2\'s port shows the same output. What should be changed?',
    ex: [{ kind: 'cli', title: 'SW1#show interfaces gi0/1 switchport', text: `Name: Gi0/1
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)` }],
    opts: [
      ['Configure `switchport mode trunk` on at least one side (ideally both).', 'Correct. Two dynamic auto ports never form a trunk.'],
      ['Change the trunking encapsulation to ISL.', 'Encapsulation is not the problem.'],
      ['Configure `switchport nonegotiate` on both sides.', 'nonegotiate is rejected on dynamic ports and would not create a trunk.'],
      ['Change the native VLAN to 99 on SW1 only.', 'A native VLAN change does not create a trunk and would cause a mismatch.'],
    ],
    ans: 'a',
    exp: 'Both ports are **dynamic auto**: each waits for the other to request a trunk, so the link operates as access. Set **`switchport mode trunk`** (best on both ends, optionally with `switchport nonegotiate`), or set one side to `dynamic desirable`.',
  },
  {
    id: 'D2-05', exam: 'D', obj: '2.3', type: 'single',
    q: 'Which global command disables CDP on the whole device?',
    opts: [
      ['no cdp run', 'Correct.'],
      ['no cdp enable', 'This is the interface-level command.'],
      ['no lldp run', 'This disables LLDP.'],
      ['cdp disable all', 'This command does not exist.'],
    ],
    ans: 'a',
    exp: '**Global:** `[no] cdp run`. **Per interface:** `[no] cdp enable`. For LLDP the equivalents are `[no] lldp run` and `[no] lldp transmit` / `[no] lldp receive`.',
  },
  {
    id: 'D2-06', exam: 'D', obj: '2.4', type: 'single',
    q: 'SW1\'s ports use `channel-group 1 mode desirable` and SW2\'s ports use `channel-group 1 mode active`. What is the result?',
    opts: [
      ['No EtherChannel forms, because PAgP and LACP cannot negotiate with each other.', 'Correct.'],
      ['A PAgP EtherChannel forms.', 'SW2 runs LACP, not PAgP.'],
      ['An LACP EtherChannel forms.', 'SW1 runs PAgP, not LACP.'],
      ['The ports are bundled statically with no protocol.', 'Static bundling needs mode on on both sides.'],
    ],
    ans: 'a',
    exp: '**desirable/auto** are **PAgP** modes; **active/passive** are **LACP** modes. The two protocols are not compatible, so the ports stay unbundled (stand-alone). Both ends must use the same protocol.',
  },
  {
    id: 'D2-07', exam: 'D', obj: '2.4', type: 'single',
    q: 'After bundling Gi0/1 and Gi0/2 into Port-channel 1, where should an engineer configure trunking and the allowed VLAN list?',
    opts: [
      ['On interface Port-channel 1', 'Correct. The logical interface\'s settings are applied to the members.'],
      ['Only on Gi0/1, which acts as the master link', 'There is no master link; members must stay consistent.'],
      ['On a VLAN interface (SVI)', 'SVIs are for Layer 3 VLAN interfaces.'],
      ['Under the global channel-group configuration', 'There is no such configuration mode.'],
    ],
    ans: 'a',
    exp: 'Configure Layer 2 settings (mode, allowed VLANs, native VLAN) on **`interface port-channel N`**. IOS propagates them to the members. Changing a single member\'s settings can make it inconsistent and suspended from the bundle.',
  },
  {
    id: 'D2-08', exam: 'D', obj: '2.5', type: 'single',
    q: 'Which type of RSTP port moves to the forwarding state immediately when its link comes up?',
    opts: [
      ['An edge port (PortFast)', 'Correct.'],
      ['An alternate port', 'Alternate ports discard until they are needed.'],
      ['A backup port', 'Backup ports discard.'],
      ['Any port on the root bridge', 'Root bridge ports still go through the proposal/agreement process on point-to-point links.'],
    ],
    ans: 'a',
    exp: 'RSTP **edge** ports, configured with PortFast, go straight to forwarding because they connect to hosts that cannot create loops. If an edge port receives a BPDU it loses edge status (or is err-disabled by BPDU Guard). Point-to-point links converge quickly using proposal/agreement.',
  },
  {
    id: 'D2-09', exam: 'D', obj: '2.5', type: 'order',
    q: 'Put the steps spanning tree uses to build a loop-free topology into the correct order.',
    items: [
      ['s1', 'Elect the root bridge (lowest bridge ID)'],
      ['s2', 'On each non-root switch, select the root port (lowest cost path to the root)'],
      ['s3', 'On each segment, select the designated port'],
      ['s4', 'Put all remaining ports into blocking/discarding (alternate or backup)'],
    ],
    exp: 'STP first elects a single **root bridge**. Each other switch picks one **root port** (lowest root path cost, then lowest sender bridge ID, then lowest sender port ID). Each segment then gets one **designated port** (the side offering the best path to the root; all ports on the root bridge are designated). Every remaining port **blocks**, which removes the loops.',
  },
  {
    id: 'D2-10', exam: 'D', obj: '2.5', type: 'single',
    q: 'What is the purpose of Loop Guard?',
    opts: [
      ['To stop a root or alternate port from becoming designated and forwarding when it stops receiving BPDUs, for example because of a unidirectional link', 'Correct. The port moves to loop-inconsistent (blocking).'],
      ['To err-disable PortFast ports that receive BPDUs', 'That is BPDU Guard.'],
      ['To keep a specific switch from becoming the root bridge', 'That is Root Guard.'],
      ['To make PortFast ports forward immediately', 'That is PortFast itself.'],
    ],
    ans: 'a',
    exp: 'If a fibre strand fails in one direction, a blocking port may stop hearing BPDUs, assume it should become designated and start forwarding, which creates a loop. **Loop Guard** puts such a port into **loop-inconsistent** state instead and recovers when BPDUs return. UDLD addresses the same problem at Layer 1/2.',
  },
  {
    id: 'D2-11', exam: 'D', obj: '2.6', type: 'single',
    q: 'On an AireOS WLC, which type of interface is mapped to a WLAN to put wireless clients into a specific VLAN?',
    opts: [
      ['Dynamic interface', 'Correct.'],
      ['Management interface', 'This is used for in-band management and AP joins.'],
      ['Virtual interface', 'This is used for DHCP relay and web authentication redirects.'],
      ['Service port', 'This is an out-of-band management port.'],
    ],
    ans: 'a',
    exp: 'WLC interfaces: **management** (in-band management and CAPWAP termination), **virtual** (a non-routable address for DHCP relay and web authentication), **service port** (out-of-band management), and **dynamic** interfaces (user VLANs that WLANs are mapped to, comparable to SVIs).',
  },
  {
    id: 'D2-12', exam: 'D', obj: '2.6', type: 'single',
    q: 'Which wireless architecture manages access points from a vendor-hosted dashboard without an on-premises controller?',
    opts: [
      ['Cloud-managed', 'Correct, for example Cisco Meraki.'],
      ['Centralised (local-mode APs with a WLC)', 'This uses an on-premises controller.'],
      ['Autonomous', 'Autonomous APs are configured one at a time with no central dashboard.'],
      ['Embedded WLC on a switch', 'The controller still runs on site.'],
    ],
    ans: 'a',
    exp: 'Architectures: **autonomous** (each AP standalone), **centralised/unified** (lightweight APs with a WLC appliance), **embedded** (WLC software on a switch or AP), and **cloud-managed** (APs managed from a cloud dashboard; client data is still bridged locally).',
  },
  {
    id: 'D2-13', exam: 'D', obj: '2.7', type: 'single',
    q: 'Which physical port on an AireOS WLC is used only for out-of-band management?',
    opts: [
      ['The service port', 'Correct.'],
      ['A distribution system port', 'Distribution system ports carry AP, client and management traffic.'],
      ['The redundancy port', 'This port is used for high-availability pairing.'],
      ['The console port', 'The console is a serial CLI connection, not a network management port.'],
    ],
    ans: 'a',
    exp: 'WLC physical ports: **distribution system** ports (data and in-band management, usually trunked or bundled in a LAG), the **service port** (out-of-band management on a separate network), the **redundancy** port (HA pairing) and the **console** port.',
  },
  {
    id: 'D2-14', exam: 'D', obj: '2.8', type: 'multi',
    q: 'Which two benefits come from using a central TACACS+ or RADIUS server for device administration instead of local accounts on every device?',
    opts: [
      ['Credentials are managed centrally, so adding or removing an administrator is done once.', 'Correct.'],
      ['Logins and commands can be recorded centrally through accounting.', 'Correct. TACACS+ can account for each command.'],
      ['Devices no longer need any local fallback account.', 'A local account is still recommended as a fallback.'],
      ['It works even if the server is unreachable.', 'A fallback method is needed for that case.'],
      ['It removes the need for passwords.', 'Users still authenticate with credentials.'],
    ],
    ans: 'a,b',
    exp: 'Central **AAA** gives one place to manage identities (often linked to Active Directory), per-user privilege and command **authorisation**, and an **accounting** audit trail. Keep a local break-glass account and configure `local` as the fallback method: `aaa authentication login default group tacacs+ local`.',
  },
  {
    id: 'D2-15', exam: 'D', obj: '2.8', type: 'single',
    q: 'A router uses `aaa authentication login default group tacacs+ local`. When does the router check its local user database?',
    opts: [
      ['Only when no TACACS+ server responds', 'Correct. A reject from the server is final.'],
      ['When the TACACS+ server rejects the password', 'An explicit reject ends authentication; the next method is used only on an error or timeout.'],
      ['Always first, before trying TACACS+', 'Methods are tried in the order listed.'],
      ['Never, because local accounts are ignored with AAA', 'local is the configured fallback.'],
    ],
    ans: 'a',
    exp: 'Methods in an AAA list are tried **in order**. The next method is used only if the current one returns an **error** (for example, the server is unreachable). If the server answers with a **reject**, authentication fails and the local database is not consulted.',
  },
  {
    id: 'D2-16', exam: 'D', obj: '2.9', type: 'single',
    q: 'An engineer is configuring a WLAN on the WLC GUI for WPA2-Personal. On the Security > Layer 2 tab, which settings are required?',
    opts: [
      ['WPA+WPA2 security, WPA2 policy with AES encryption, Auth Key Management set to PSK, and a passphrase', 'Correct.'],
      ['WPA2 policy with TKIP and Auth Key Management set to 802.1X', 'TKIP is deprecated, and 802.1X is WPA2-Enterprise.'],
      ['Static WEP with a 128-bit key', 'WEP is broken and should not be used.'],
      ['Layer 3 web authentication only', 'Web authentication is not WPA2-Personal.'],
    ],
    ans: 'a',
    exp: '**WPA2-Personal** = WPA2 + **AES-CCMP** + **PSK** (a passphrase of 8–63 characters). **WPA2-Enterprise** replaces PSK with **802.1X** and a RADIUS server. On newer releases you can also enable **WPA3** with SAE.',
  },
  {
    id: 'D2-17', exam: 'D', obj: '2.9', type: 'single',
    q: 'Where in the AireOS WLC GUI is 802.11r Fast Transition enabled for a WLAN?',
    opts: [
      ['WLANs > edit the WLAN > Security > Layer 2', 'Correct. Fast Transition is configured with the Layer 2 security settings.'],
      ['WLANs > edit the WLAN > QoS', 'The QoS tab controls QoS profiles and WMM.'],
      ['Controller > Mobility Management', 'Mobility groups are related but FT is set per WLAN.'],
      ['Wireless > Access Points > All APs', 'This lists and configures individual APs.'],
    ],
    ans: 'a',
    exp: '**802.11r Fast Transition** shortens roaming between APs by pre-establishing keys. On AireOS it is enabled per WLAN on the **Security > Layer 2** tab, alongside the authentication key management options (FT PSK or FT 802.1X).',
  },
];
