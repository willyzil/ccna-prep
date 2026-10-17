// Domain 6: Automation and Programmability (10%).
export default [
  // ================================================================ Exam A
  {
    id: 'A6-01', exam: 'A', obj: '6.1', type: 'multi',
    q: 'Which two benefits does network automation bring compared with manual, device-by-device configuration?',
    opts: [
      ['Consistent configurations with fewer human errors', 'Correct.'],
      ['Faster deployment of changes across many devices', 'Correct.'],
      ['No further need for network engineers', 'Engineers design, review and maintain the automation.'],
      ['No need to test changes', 'Automated changes still need testing; errors spread faster.'],
      ['More CLI work for each change', 'Automation reduces manual CLI work.'],
    ],
    ans: 'a,b',
    exp: 'Automation replaces repetitive manual steps with code and templates: changes become **consistent**, **repeatable**, **faster** and easier to audit, and configuration drift is detected and corrected. Engineers shift toward design, testing and maintaining the automation.',
  },
  {
    id: 'A6-02', exam: 'A', obj: '6.2', type: 'single',
    q: 'In a traditional (non-SDN) network, where does the control plane run?',
    opts: [
      ['Separately on every device, with each router or switch running its own protocols such as OSPF and STP', 'Correct. The control plane is distributed.'],
      ['On a central controller that programs all devices', 'That describes controller-based networking.'],
      ['Only on the core switches', 'Every device runs its own control plane.'],
      ['In the cloud', 'Not in a traditional network.'],
    ],
    ans: 'a',
    exp: 'Traditionally each device has its own **management, control and data planes**, and devices learn the topology from each other (distributed control). In **controller-based** networking a controller centralises policy and much of the control logic, and programs devices through southbound APIs.',
  },
  {
    id: 'A6-03', exam: 'A', obj: '6.3', type: 'match',
    q: 'Drag each function to the plane that performs it.',
    items: [['f1', 'Forwarding a frame out of a port according to the MAC address table'], ['f2', 'Exchanging OSPF hellos and LSAs'], ['f3', 'Building the spanning tree with BPDUs'], ['f4', 'An administrator connecting with SSH'], ['f5', 'An NMS polling with SNMP']],
    targets: [['data', 'Data plane'], ['ctrl', 'Control plane'], ['mgmt', 'Management plane']],
    ans: { f1: 'data', f2: 'ctrl', f3: 'ctrl', f4: 'mgmt', f5: 'mgmt' },
    exp: '**Data plane**: forwards user traffic (switching, routing, NAT, ACL enforcement). **Control plane**: builds the forwarding information (routing protocols, STP, ARP). **Management plane**: lets people and tools manage the device (SSH, SNMP, syslog, APIs).',
  },
  {
    id: 'A6-04', exam: 'A', obj: '6.3', type: 'single',
    q: 'Which interface does an SDN controller use to communicate with and program the network devices it manages?',
    opts: [
      ['The southbound interface (SBI)', 'Correct. For example NETCONF, RESTCONF, OpenFlow or SSH.'],
      ['The northbound interface (NBI)', 'The NBI faces applications and scripts.'],
      ['The management plane console port', 'Console access is out-of-band, per device.'],
      ['The east-west interface', 'East-west communication is between controllers.'],
    ],
    ans: 'a',
    exp: '**Northbound** APIs (usually REST) let applications and scripts ask the controller for information or changes. **Southbound** APIs or protocols carry the controller\'s instructions to the devices: OpenFlow, NETCONF, RESTCONF, OpFlex, or CLI over SSH.',
  },
  {
    id: 'A6-05', exam: 'A', obj: '6.3', type: 'single',
    q: 'In a Cisco SD-Access fabric, what is the **underlay**?',
    opts: [
      ['The physical network of switches and links running IP routing, which provides reachability for the overlay tunnels', 'Correct.'],
      ['The VXLAN tunnels that carry user traffic between edge nodes', 'That is the overlay.'],
      ['The controller\'s northbound API', 'The API belongs to the management layer.'],
      ['The wireless network only', 'The underlay is the wired infrastructure.'],
    ],
    ans: 'a',
    exp: 'In SD-Access, the **underlay** is the physical, routed network (typically IS-IS) that only needs IP reachability between the fabric nodes. The **overlay** is virtual networks built on top: **VXLAN** for the data plane, **LISP** for the control plane and **TrustSec/SGTs** for policy. Together they form the **fabric**.',
  },
  {
    id: 'A6-06', exam: 'A', obj: '6.4', type: 'single',
    q: 'Which example describes **predictive** AI or machine learning in network operations?',
    opts: [
      ['Analysing historical telemetry to forecast that a link will become congested next week', 'Correct.'],
      ['Writing a configuration template from a natural-language prompt', 'Producing new content is generative AI.'],
      ['Running a fixed script that backs up configurations every night', 'This is rule-based automation, not machine learning.'],
      ['Manually reviewing syslog messages', 'This involves no AI.'],
    ],
    ans: 'a',
    exp: '**Predictive AI/ML** learns patterns from historical data to forecast or classify: capacity trends, failure prediction, anomaly detection and baselining. **Generative AI** creates new content such as text, configurations or summaries from prompts. Both should help engineers decide, and their output still needs human validation.',
  },
  {
    id: 'A6-07', exam: 'A', obj: '6.5', type: 'match',
    q: 'Drag each CRUD operation to the HTTP method normally used for it in a REST API.',
    items: [['c1', 'Create'], ['c2', 'Read'], ['c3', 'Update (replace)'], ['c4', 'Delete']],
    targets: [['post', 'POST'], ['get', 'GET'], ['put', 'PUT'], ['del', 'DELETE']],
    ans: { c1: 'post', c2: 'get', c3: 'put', c4: 'del' },
    exp: 'REST maps CRUD onto HTTP methods: **POST** creates, **GET** reads, **PUT** replaces (and **PATCH** partially updates) and **DELETE** removes. GET, PUT and DELETE are idempotent: repeating them has the same effect as doing them once.',
  },
  {
    id: 'A6-08', exam: 'A', obj: '6.5', type: 'single',
    q: 'A script calls the controller\'s REST API and receives **401 Unauthorized**. What is the most likely cause?',
    opts: [
      ['The request\'s credentials or authentication token are missing, invalid or expired.', 'Correct.'],
      ['The requested resource does not exist.', 'That would be 404 Not Found.'],
      ['The server had an internal error.', 'That would be 500.'],
      ['The request succeeded and created a resource.', 'That would be 201 Created.'],
    ],
    ans: 'a',
    exp: 'Status classes: **2xx** success (200 OK, 201 Created, 204 No Content), **3xx** redirection, **4xx** client error (400 Bad Request, **401 Unauthorized** = not authenticated, 403 Forbidden = authenticated but not allowed, 404 Not Found) and **5xx** server error.',
  },
  {
    id: 'A6-09', exam: 'A', obj: '6.6', type: 'multi',
    q: 'Which two statements describe Ansible?',
    opts: [
      ['It is agentless and usually connects to network devices over SSH.', 'Correct.'],
      ['Its playbooks are written in YAML.', 'Correct.'],
      ['It requires an agent on every managed device that pulls its configuration.', 'That describes Puppet or Chef.'],
      ['It stores infrastructure state in a state file and uses HCL.', 'That describes Terraform.'],
      ['It only works with Cisco devices.', 'Ansible supports many vendors and platforms.'],
    ],
    ans: 'a,b',
    exp: '**Ansible**: agentless, **push** model, **YAML playbooks**, an inventory of hosts, and modules (for example the cisco.ios collection). **Puppet** and **Chef**: agent-based, pull model, Ruby-based DSLs. **Terraform**: declarative **HCL**, a state file and providers, aimed at provisioning infrastructure.',
  },
  {
    id: 'A6-10', exam: 'A', obj: '6.7', type: 'single',
    q: 'In this JSON document, what type of value is assigned to the key **vlans**?',
    ex: [{ kind: 'code', title: 'JSON', text: `{
  "hostname": "SW1",
  "vlans": [10, 20, 30],
  "mgmt": {
    "ip": "192.168.99.11",
    "mask": "255.255.255.0"
  },
  "stp_enabled": true
}` }],
    opts: [
      ['An array of numbers', 'Correct. Square brackets contain an ordered list.'],
      ['An object', 'Objects use curly braces, like the value of mgmt.'],
      ['A string', 'Strings are in double quotes.'],
      ['A boolean', 'Booleans are true or false, like stp_enabled.'],
    ],
    ans: 'a',
    exp: 'JSON value types: **string** ("SW1"), **number** (10), **boolean** (true/false), **null**, **array** ([ … ], an ordered list) and **object** ({ "key": value, … }). Keys are always double-quoted strings, and items are separated by commas.',
  },

  // ================================================================ Exam B
  {
    id: 'B6-01', exam: 'B', obj: '6.1', type: 'single',
    q: 'Which task gains the most from automation?',
    opts: [
      ['Deploying the same VLAN and SNMP configuration to 300 access switches', 'Correct. The task is repetitive, identical and large-scale.'],
      ['Designing a new data centre topology', 'Design requires human judgement.'],
      ['Investigating a one-off routing anomaly', 'Ad-hoc troubleshooting benefits from tools but is hard to script in advance.'],
      ['Negotiating a circuit contract with a provider', 'This is not a technical task.'],
    ],
    ans: 'a',
    exp: 'Automation pays off most for tasks that are **repetitive, rule-based and done at scale**: configuration rollout, compliance checks, backups, inventory and software upgrades. Tools such as Ansible, Terraform and controllers like Catalyst Center do this.',
  },
  {
    id: 'B6-02', exam: 'B', obj: '6.2', type: 'single',
    q: 'Which characteristic distinguishes controller-based networking from traditional networking?',
    opts: [
      ['Policy and configuration are defined centrally on a controller, which programs the devices through APIs.', 'Correct.'],
      ['Each device must be configured individually from its CLI.', 'That is traditional networking.'],
      ['Devices no longer forward traffic themselves.', 'Devices still forward traffic; the data plane stays on the device.'],
      ['It removes the need for IP routing.', 'Routing still exists, often automated in the underlay.'],
    ],
    ans: 'a',
    exp: 'Controller-based networks **centralise** intent and policy: you tell the controller what you want, and it translates that into device configuration through southbound interfaces and gives a network-wide view through northbound APIs. The devices keep their data planes.',
  },
  {
    id: 'B6-03', exam: 'B', obj: '6.3', type: 'single',
    q: 'Which Catalyst Center (DNA Center) function collects telemetry, scores network and client health and suggests fixes?',
    opts: [
      ['Assurance', 'Correct.'],
      ['Provisioning', 'Provisioning pushes configurations and policies to devices.'],
      ['Design', 'Design defines the hierarchy, IP pools and settings.'],
      ['Policy', 'Policy defines access and application rules.'],
    ],
    ans: 'a',
    exp: 'Catalyst Center workflows: **Design** (sites, settings, IP pools, images), **Policy** (group-based access and application policy), **Provision** (onboarding and deploying configuration and templates) and **Assurance** (health scores, issues, path trace and guided remediation from telemetry).',
  },
  {
    id: 'B6-04', exam: 'B', obj: '6.3', type: 'multi',
    q: 'Which two are southbound protocols that a controller can use to configure network devices?',
    opts: [
      ['NETCONF', 'Correct. It uses SSH (port 830) and YANG models.'],
      ['OpenFlow', 'Correct.'],
      ['The controller\'s REST API used by Python scripts', 'That is a northbound interface.'],
      ['SMTP', 'SMTP is for email.'],
      ['DNS', 'DNS resolves names.'],
    ],
    ans: 'a,b',
    exp: 'Southbound options include **OpenFlow** (programs flow tables directly), **NETCONF** (XML over SSH, using YANG models), **RESTCONF** (REST over HTTPS, YANG with JSON or XML), OpFlex and plain CLI over SSH. The controller\'s northbound REST API is what applications call.',
  },
  {
    id: 'B6-05', exam: 'B', obj: '6.4', type: 'single',
    q: 'Which statement describes **generative** AI in network operations?',
    opts: [
      ['It produces new content, such as a draft configuration or a plain-language incident summary, from a prompt.', 'Correct.'],
      ['It is a fixed set of if-then rules written by engineers.', 'That is traditional rule-based automation.'],
      ['It only predicts future link utilisation.', 'That is predictive AI.'],
      ['It replaces the need to validate changes.', 'Generated output can be wrong and must be reviewed.'],
    ],
    ans: 'a',
    exp: '**Generative AI** (large language models) creates text, code or configurations, for example assistants that explain logs, draft templates or answer "why is this client failing?". Because it can produce plausible but wrong output, keep a human review and test step.',
  },
  {
    id: 'B6-06', exam: 'B', obj: '6.5', type: 'single',
    q: 'A script first sends credentials to an authentication endpoint and receives a token, then includes that token in a header on later API calls. Which authentication type is this?',
    opts: [
      ['Token-based (bearer token) authentication', 'Correct.'],
      ['Basic authentication', 'Basic sends a Base64-encoded username:password with every request.'],
      ['No authentication', 'A token is authentication.'],
      ['SNMP community authentication', 'SNMP is unrelated to REST APIs.'],
    ],
    ans: 'a',
    exp: 'REST authentication types: **Basic** (username:password in Base64 in every request), **API key** (a static key in a header or query string), **bearer token** (a temporary token obtained by authenticating, for example Catalyst Center\'s X-Auth-Token) and **OAuth** (delegated authorisation). Always use HTTPS.',
  },
  {
    id: 'B6-07', exam: 'B', obj: '6.5', type: 'single',
    q: 'Which statement about REST APIs is true?',
    opts: [
      ['They are stateless: each request carries everything the server needs to process it.', 'Correct.'],
      ['The server keeps a session for each client between requests.', 'REST is stateless by design.'],
      ['They can only exchange XML.', 'JSON is most common; XML and others are possible.'],
      ['They require SNMP for transport.', 'REST uses HTTP or HTTPS.'],
    ],
    ans: 'a',
    exp: 'REST constraints include a client-server architecture, **statelessness**, cacheability, a uniform interface (resources identified by URIs and manipulated with HTTP methods) and a layered system. Statelessness is why each request includes its authentication token or credentials.',
  },
  {
    id: 'B6-08', exam: 'B', obj: '6.6', type: 'single',
    q: 'Which configuration management tool uses a declarative language (HCL), keeps a state file of what it has deployed and works through vendor plug-ins called providers?',
    opts: [
      ['Terraform', 'Correct.'],
      ['Ansible', 'Ansible uses YAML playbooks and is mostly procedural.'],
      ['Puppet', 'Puppet uses its own Ruby-based DSL with agents.'],
      ['Chef', 'Chef uses Ruby recipes with agents.'],
    ],
    ans: 'a',
    exp: '**Terraform** (Infrastructure as Code): you declare the desired end state in **HCL**; `terraform plan` compares it with the **state file** and real infrastructure, and `terraform apply` makes the changes through **providers** (cloud platforms, Cisco ACI, Meraki and so on).',
  },
  {
    id: 'B6-09', exam: 'B', obj: '6.7', type: 'multi',
    q: 'Which two problems make this document invalid JSON?',
    ex: [{ kind: 'code', title: 'Document', text: `{
  "interface": "GigabitEthernet0/1",
  "enabled": True,
  "description": 'Uplink to core'
}` }],
    opts: [
      ['Booleans must be lowercase: true.', 'Correct.'],
      ['Strings must use double quotes, not single quotes.', 'Correct.'],
      ['Keys must not be quoted.', 'JSON keys must be double-quoted.'],
      ['Every value must be a string.', 'JSON supports numbers, booleans, null, arrays and objects.'],
      ['The object needs a comma after the last value.', 'A trailing comma is itself invalid in JSON.'],
    ],
    ans: 'a,b',
    exp: 'JSON is strict: keys and strings use **double quotes**, the literals are **true**, **false** and **null** in lowercase, items are separated by commas with **no trailing comma**, and comments are not allowed. (Python dictionaries look similar but use True/False and allow single quotes.)',
  },
  {
    id: 'B6-10', exam: 'B', obj: '6.7', type: 'single',
    q: 'What is the value of the **ipv4** key in the second element of the **interfaces** array?',
    ex: [{ kind: 'code', title: 'JSON', text: `{
  "device": "R1",
  "interfaces": [
    { "name": "Gi0/0", "ipv4": "10.0.12.1", "enabled": true },
    { "name": "Gi0/1", "ipv4": "192.168.1.1", "enabled": false }
  ]
}` }],
    opts: [
      ['"192.168.1.1"', 'Correct. The second element (index 1) describes Gi0/1.'],
      ['"10.0.12.1"', 'This belongs to the first element (index 0).'],
      ['false', 'This is the value of enabled in the second element.'],
      ['"Gi0/1"', 'This is the value of name.'],
    ],
    ans: 'a',
    exp: 'interfaces is an **array of objects**. Arrays are zero-indexed, so the second element is `interfaces[1]`, and its ipv4 key holds **"192.168.1.1"**. In Python: `data["interfaces"][1]["ipv4"]`.',
  },

  // ================================================================ Exam C
  {
    id: 'C6-01', exam: 'C', obj: '6.1', type: 'single',
    q: 'Which is a risk that automation introduces, and must be managed?',
    opts: [
      ['A mistake in a template or script can be pushed to hundreds of devices very quickly.', 'Correct. Test, review and stage changes.'],
      ['Configurations become less consistent.', 'Automation improves consistency.'],
      ['Changes take longer to deploy.', 'Automation is faster.'],
      ['Audit trails are lost.', 'Automation usually improves auditability through version control and logs.'],
    ],
    ans: 'a',
    exp: 'Automation amplifies both good and bad changes. Manage the risk with version control, peer review, lab or virtual testing, pre- and post-change validation, staged rollouts and easy rollback.',
  },
  {
    id: 'C6-02', exam: 'C', obj: '6.2', type: 'single',
    q: 'An engineer must change a QoS policy on 400 switches. Which statement compares the two approaches correctly?',
    opts: [
      ['Traditionally each switch is changed separately; with a controller the policy is changed once and pushed to all devices.', 'Correct.'],
      ['With a controller, each switch must still be configured through its own CLI.', 'The controller does this.'],
      ['Traditional networks always deploy changes faster.', 'They are usually slower and more error-prone at scale.'],
      ['Controller-based networks do not support QoS.', 'They support QoS and many other policies.'],
    ],
    ans: 'a',
    exp: 'The key operational difference: **traditional** networks use box-by-box configuration through CLI, SNMP or scripts; **controller-based** networks express intent once, and the controller renders and deploys device-specific configuration, verifies it and reports compliance.',
  },
  {
    id: 'C6-03', exam: 'C', obj: '6.3', type: 'single',
    q: 'In SD-Access, what is the purpose of the overlay network?',
    opts: [
      ['To provide virtual networks over the underlay using VXLAN tunnels, with LISP as control plane and SGTs for policy', 'Correct.'],
      ['To provide physical cabling between switches', 'That is part of the underlay.'],
      ['To replace IP routing with spanning tree', 'SD-Access uses a routed underlay.'],
      ['To run the controller\'s web GUI', 'The GUI is part of the management layer.'],
    ],
    ans: 'a',
    exp: 'The **overlay** decouples users and devices from physical topology: endpoints keep their policy and VN membership wherever they connect, while traffic is tunnelled (VXLAN) between fabric edge nodes over the **underlay**.',
  },
  {
    id: 'C6-04', exam: 'C', obj: '6.3', type: 'single',
    q: 'Who or what typically uses a controller\'s northbound API?',
    opts: [
      ['Applications, scripts and orchestration tools that request information from the controller or ask it to make changes', 'Correct.'],
      ['Switches and routers receiving configuration', 'They use the southbound side.'],
      ['End users browsing the web', 'End users do not use controller APIs.'],
      ['The power supplies of network devices', 'Not related.'],
    ],
    ans: 'a',
    exp: '**Northbound** = between the controller and the things above it: custom Python scripts, ITSM systems such as ServiceNow, orchestrators and dashboards, usually through REST and JSON. **Southbound** = between the controller and the devices below it.',
  },
  {
    id: 'C6-05', exam: 'C', obj: '6.4', type: 'single',
    q: 'A network analytics platform learns each site\'s normal DHCP response times and raises an issue when one site\'s values deviate sharply. What is this an example of?',
    opts: [
      ['Machine-learning-based anomaly detection using dynamic baselines', 'Correct.'],
      ['Generative AI writing configurations', 'Nothing is being generated.'],
      ['A static threshold alarm configured by hand', 'The baseline is learned, not set by hand.'],
      ['SNMP trap forwarding', 'Traps are simple event notifications.'],
    ],
    ans: 'a',
    exp: 'ML-driven assurance (for example Catalyst Center AI Network Analytics) builds **dynamic baselines** from history and flags **anomalies**, which avoids the noise and blind spots of fixed thresholds. It is a predictive or analytical use of AI rather than a generative one.',
  },
  {
    id: 'C6-06', exam: 'C', obj: '6.5', type: 'multi',
    q: 'Which two data encoding formats are commonly used in REST API request and response bodies?',
    opts: [
      ['JSON', 'Correct.'],
      ['XML', 'Correct.'],
      ['CSV', 'CSV is rare for REST APIs.'],
      ['ASN.1 BER', 'This is used by SNMP.'],
      ['Binary IOS images', 'These are files, not API data encoding.'],
    ],
    ans: 'a,b',
    exp: 'REST APIs mostly exchange **JSON** (compact and readable), and some also offer **XML**. The client says what it sends with **Content-Type** and what it wants back with **Accept**, for example `application/json`. YAML is common in automation tools such as Ansible, but less common on the wire.',
  },
  {
    id: 'C6-07', exam: 'C', obj: '6.5', type: 'multi',
    q: 'Based on the HTTP exchange, which two statements are true?',
    ex: [{ kind: 'code', title: 'HTTP exchange', text: `GET /dna/intent/api/v1/network-device HTTP/1.1
Host: catalyst-center.corp.local
X-Auth-Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{"response": [{"hostname": "SW1", "managementIpAddress": "10.99.0.11"}]}` }],
    opts: [
      ['The client is reading (retrieving) a list of devices.', 'Correct. GET is a read operation.'],
      ['The client authenticates with a token in a request header.', 'Correct. X-Auth-Token.'],
      ['The client is creating a new device.', 'Creating would use POST.'],
      ['The response body is XML.', 'Content-Type is application/json.'],
      ['The request failed.', '200 means success.'],
    ],
    ans: 'a,b',
    exp: 'Read the request line (**method** + URI + version), the **headers** (authentication token, Accept) and the response **status code**, **Content-Type** and **body**. This is a successful (200) GET against Catalyst Center\'s Intent API, authenticated with a token.',
  },
  {
    id: 'C6-08', exam: 'C', obj: '6.6', type: 'match',
    q: 'Drag each Ansible component to its description.',
    items: [['a1', 'Inventory'], ['a2', 'Playbook'], ['a3', 'Module'], ['a4', 'Variables']],
    targets: [
      ['t1', 'The list of managed hosts and groups'],
      ['t2', 'A YAML file of plays and tasks that describes what to do'],
      ['t3', 'The unit of code that performs one task, such as configuring IOS lines'],
      ['t4', 'Values that make a playbook reusable, such as per-host IP addresses'],
    ],
    ans: { a1: 't1', a2: 't2', a3: 't3', a4: 't4' },
    exp: 'Ansible runs **playbooks** (YAML) against hosts from the **inventory**. Each task calls a **module** (for example cisco.ios.ios_config) with parameters, often filled in from **variables** and Jinja2 templates. It connects to devices without agents (network_cli over SSH, NETCONF or HTTP APIs).',
  },
  {
    id: 'C6-09', exam: 'C', obj: '6.6', type: 'single',
    q: 'Which statement correctly compares configuration management tools?',
    opts: [
      ['Ansible is agentless and pushes changes; Puppet and Chef traditionally use agents that pull their configuration from a server.', 'Correct.'],
      ['All three require agents on network devices.', 'Ansible is agentless.'],
      ['Puppet uses YAML playbooks.', 'Puppet uses manifests written in its own DSL.'],
      ['Chef is agentless and uses HCL.', 'Chef uses agents and Ruby; HCL is Terraform.'],
    ],
    ans: 'a',
    exp: '**Ansible**: push, agentless, YAML. **Puppet**: pull, agent-based (agentless options exist for network devices), Puppet DSL manifests. **Chef**: pull, agent-based, Ruby cookbooks and recipes. **Terraform**: declarative provisioning with state, HCL.',
  },
  {
    id: 'C6-10', exam: 'C', obj: '6.7', type: 'single',
    q: 'What is the data type of the value of the **active** key?',
    ex: [{ kind: 'code', title: 'JSON', text: `{"vlan": 10, "name": "SALES", "active": true, "description": null}` }],
    opts: [
      ['Boolean', 'Correct. true and false are JSON booleans.'],
      ['String', 'A string would be "true" in quotes.'],
      ['Number', 'vlan holds a number.'],
      ['Null', 'description holds null.'],
    ],
    ans: 'a',
    exp: 'Unquoted `true`/`false` are **booleans**, `null` is the null value, unquoted digits are **numbers** and anything in double quotes is a **string**, so "10" in quotes would be a string, not a number.',
  },

  // ================================================================ Exam D
  {
    id: 'D6-01', exam: 'D', obj: '6.1', type: 'single',
    q: 'How does automation help an organisation meet compliance requirements, such as having a syslog server and an NTP server on every device?',
    opts: [
      ['Scripts or controllers can continuously check every device against the required settings and fix or report any drift.', 'Correct.'],
      ['Compliance requirements no longer apply when automation is used.', 'They still apply.'],
      ['Automation removes the need for logging.', 'Logging is still needed.'],
      ['It disables manual access to devices.', 'Access policy is a separate decision.'],
    ],
    ans: 'a',
    exp: 'Automation turns standards into code: **audit** every device on a schedule, report deviations and optionally **remediate** them, with version-controlled evidence for auditors. Controllers such as Catalyst Center provide compliance dashboards.',
  },
  {
    id: 'D6-02', exam: 'D', obj: '6.2', type: 'single',
    q: 'In a controller-based (SDN) architecture, where is the logic that decides policy and how traffic should be handled concentrated?',
    opts: [
      ['On the centralised controller', 'Correct. Devices keep the data plane.'],
      ['On each individual switch\'s CLI', 'That is traditional networking.'],
      ['On the end hosts', 'Hosts are not part of the network control architecture.'],
      ['On the DHCP server', 'DHCP only assigns addresses.'],
    ],
    ans: 'a',
    exp: 'SDN **centralises** control or policy logic on a controller with a network-wide view, and keeps fast packet forwarding in the devices\' data planes. Some designs, such as OpenFlow, move nearly all control logic to the controller; others, such as SD-Access, keep distributed routing and centralise policy and automation.',
  },
  {
    id: 'D6-03', exam: 'D', obj: '6.3', type: 'single',
    q: 'What does the term **fabric** refer to in Cisco controller-based architectures?',
    opts: [
      ['The underlay and overlay together, managed as one system that provides virtual networks and policy', 'Correct.'],
      ['Only the physical cabling', 'That is part of the underlay alone.'],
      ['A type of fibre-optic connector', 'Not in this context.'],
      ['The controller\'s database', 'The fabric is the network, not the database.'],
    ],
    ans: 'a',
    exp: 'A **fabric** combines a routed **underlay** with an **overlay** of tunnels and virtual networks, automated and managed centrally (SD-Access in the campus, ACI in the data centre, SD-WAN across the WAN).',
  },
  {
    id: 'D6-04', exam: 'D', obj: '6.3', type: 'single',
    q: 'What is OpenFlow?',
    opts: [
      ['A southbound protocol that lets an SDN controller program flow-table entries in switches', 'Correct.'],
      ['A northbound REST API for applications', 'OpenFlow faces the devices.'],
      ['A dynamic routing protocol similar to OSPF', 'It is not a routing protocol.'],
      ['A JSON schema for configuration files', 'It is a protocol, not a data format.'],
    ],
    ans: 'a',
    exp: '**OpenFlow** (from the Open Networking Foundation) is the classic SDN southbound protocol. The controller installs match/action entries directly into the switches\' forwarding tables, centralising most of the control plane.',
  },
  {
    id: 'D6-05', exam: 'D', obj: '6.4', type: 'single',
    q: 'Which benefit does AI for IT operations (AIOps) offer a network team?',
    opts: [
      ['Correlating large volumes of logs, events and telemetry to find likely root causes and reduce alert noise', 'Correct.'],
      ['Removing the need for monitoring tools', 'AIOps relies on monitoring data.'],
      ['Guaranteeing that the network never fails', 'Nothing can guarantee that.'],
      ['Replacing all routing protocols', 'Routing still works as before.'],
    ],
    ans: 'a',
    exp: 'AIOps applies analytics and ML to operational data to **correlate** related events, **suppress noise**, **detect anomalies**, **predict** problems and suggest **root causes**, so engineers spend less time sifting through alerts. Its conclusions still need human validation.',
  },
  {
    id: 'D6-06', exam: 'D', obj: '6.5', type: 'single',
    q: 'Which HTTP method replaces an entire existing resource with the representation sent in the request?',
    opts: [
      ['PUT', 'Correct.'],
      ['PATCH', 'PATCH modifies only the fields it includes.'],
      ['POST', 'POST normally creates a new resource.'],
      ['GET', 'GET only reads.'],
    ],
    ans: 'a',
    exp: '**PUT** replaces the whole resource and is idempotent. **PATCH** updates part of it. **POST** creates a resource (the server usually assigns its ID and returns 201) and is not idempotent.',
  },
  {
    id: 'D6-07', exam: 'D', obj: '6.5', type: 'match',
    q: 'Drag each HTTP status code to its meaning.',
    items: [['s1', '200'], ['s2', '201'], ['s3', '403'], ['s4', '404'], ['s5', '500']],
    targets: [['t1', 'OK: the request succeeded'], ['t2', 'Created: a new resource was created'], ['t3', 'Forbidden: authenticated, but not allowed'], ['t4', 'Not Found: the URI does not exist'], ['t5', 'Internal Server Error']],
    ans: { s1: 't1', s2: 't2', s3: 't3', s4: 't4', s5: 't5' },
    exp: '**2xx** success, **3xx** redirection, **4xx** a client problem (400 bad request, 401 not authenticated, 403 not authorised, 404 not found), **5xx** a server problem.',
  },
  {
    id: 'D6-08', exam: 'D', obj: '6.6', type: 'single',
    q: 'An engineer runs a command that shows what the tool would change by comparing the declared configuration with its record of the deployed infrastructure, then runs another command to make those changes. Which tool is this?',
    opts: [
      ['Terraform (terraform plan, then terraform apply)', 'Correct.'],
      ['Ansible (ansible-playbook)', 'Ansible keeps no state file; it has a check mode instead.'],
      ['Puppet (puppet agent -t)', 'Puppet agents pull a catalogue and have no plan/apply workflow.'],
      ['Chef (knife bootstrap)', 'This bootstraps a node.'],
    ],
    ans: 'a',
    exp: '**Terraform** compares the **desired state** (HCL files) with its **state file** and the real resources. `plan` shows the differences and `apply` executes them. The state file is what makes Terraform declarative and lets it know what it created.',
  },
  {
    id: 'D6-09', exam: 'D', obj: '6.7', type: 'single',
    q: 'Which statement about this JSON document is true?',
    ex: [{ kind: 'code', title: 'JSON', text: `{
  "ntp_servers": ["10.1.1.1", "10.1.1.2", "10.1.1.3"],
  "location": {
    "site": "HQ",
    "rack": 4
  }
}` }],
    opts: [
      ['ntp_servers is an array containing three string values.', 'Correct.'],
      ['location is an array.', 'location is an object (curly braces).'],
      ['The value of rack is a string.', '4 is unquoted, so it is a number.'],
      ['The document is invalid because it contains a nested object.', 'Nesting objects is valid JSON.'],
    ],
    ans: 'a',
    exp: 'Arrays [ ] hold ordered values (here, three quoted strings); objects { } hold key/value pairs and can be nested. Look at the brackets and quotes to identify each value\'s type.',
  },
  {
    id: 'D6-10', exam: 'D', obj: '6.7', type: 'single',
    q: 'Which option is valid JSON representing a list of two VLAN objects?',
    opts: [
      ['`[{"id": 10, "name": "USERS"}, {"id": 20, "name": "VOICE"}]`', 'Correct.'],
      ['`{"id": 10, "name": "USERS"}, {"id": 20, "name": "VOICE"}`', 'A JSON document has a single top-level value; wrap the two objects in an array.'],
      ['`[{id: 10, name: "USERS"}, {id: 20, name: "VOICE"}]`', 'Keys must be double-quoted strings.'],
      ['`[{"id": 10, "name": "USERS"} {"id": 20, "name": "VOICE"}]`', 'Array elements must be separated by commas.'],
    ],
    ans: 'a',
    exp: 'A list of objects is an **array of objects**: `[ {…}, {…} ]`. Remember the rules: one top-level value, double-quoted keys, commas between elements and no trailing commas.',
  },
];
