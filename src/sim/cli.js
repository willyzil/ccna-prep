// Console sessions: IOS exec/config modes, a Windows-like PC prompt, and
// telnet/SSH sessions stacked on top of the local console.
import { buildTree, match, helpFor, complete, tokenize } from './grammar.js';
import { MODES, PROMPT, HELP } from './commands.js';
import { parseV4, parseV6, fmtV4, fmtV6, lenToMask, maskToLen } from './addr.js';
import { runningConfig, createDevice } from './device.js';
import { isHost } from './net.js';

const TREES = {};
function treeFor(mode, kind) {
  const k = `${mode}|${kind}`;
  if (!TREES[k]) TREES[k] = buildTree(MODES[mode].filter(([, , kinds]) => !kinds || kinds.includes(kind)));
  return TREES[k];
}

const SUBMODES = ['if', 'subif', 'range', 'router', 'line', 'vlan', 'dhcp', 'nacl-std', 'nacl-ext'];
const CONFIG_MODES = ['config', ...SUBMODES];
const FILTERS = ['include', 'exclude', 'begin', 'section'];

function applyFilter(text, f) {
  if (!f || typeof text !== 'string') return text;
  let re;
  try { re = new RegExp(f.pattern, 'i'); } catch { re = new RegExp(f.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); }
  const lines = text.split('\n');
  if (f.kind === 'include') return lines.filter(l => re.test(l)).join('\n');
  if (f.kind === 'exclude') return lines.filter(l => !re.test(l)).join('\n');
  if (f.kind === 'begin') {
    const i = lines.findIndex(l => re.test(l));
    return i < 0 ? '' : lines.slice(i).join('\n');
  }
  const out = [];
  let on = false;
  for (const l of lines) {
    if (!l.startsWith(' ')) on = re.test(l);
    if (on) out.push(l);
  }
  return out.join('\n');
}

// --------------------------------------------------------------------------
export class Session {
  constructor(console_, devName, mode, extra = {}) {
    this.console = console_;
    this.lab = console_.lab;
    this.devName = devName;
    this.mode = mode;
    this.ctx = {};
    this.pending = null;
    this.history = [];
    this.remote = extra.remote || null;
    this.loggedOut = false;
  }

  get dev() { return this.lab.devs[this.devName]; }
  get net() { return this.lab.net; }

  prompt() {
    if (this.loggedOut) return '';
    return this.dev.hostname + PROMPT[this.mode];
  }

  ask(prompt, cb, opts = {}) {
    this.pending = { prompt, cb, mask: !!opts.mask };
    return undefined;
  }

  caret(sub, tokIdx) {
    const line = this.curLine || '';
    const base = line.indexOf(sub);
    const toks = tokenize(sub);
    const col = base + (toks[tokIdx] ? toks[tokIdx].col : sub.length);
    return `${' '.repeat(this.prompt().length + Math.max(col, 0))}^\n% Invalid input detected at '^' marker.\n`;
  }

  // Runs one line; returns output text.
  run(line) {
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      const r = p.cb(line);
      return r === undefined ? '' : r;
    }
    if (this.loggedOut) return this.console.relogin(this);
    const trimmed = line.trim();
    if (!trimmed) return '';
    this.history.push(trimmed);
    this.curLine = line;
    let cmd = line;
    let filter = null;
    const pipe = line.match(/^(.*?)\s*\|\s*(\S+)\s+(.+)$/);
    if (pipe && /^\s*(do\s+)?sh/i.test(pipe[1])) {
      const kind = FILTERS.find(f => f.startsWith(pipe[2].toLowerCase()));
      if (!kind) return `${' '.repeat(this.prompt().length + line.indexOf(pipe[2]))}^\n% Invalid input detected at '^' marker.\n`;
      cmd = pipe[1];
      filter = { kind, pattern: pipe[3].trim() };
    }
    return this.dispatch(cmd, filter);
  }

  dispatch(cmd, filter) {
    const kind = this.dev.kind;
    let r = match(treeFor(this.mode, kind), cmd);
    if (r.kind !== 'ok' && SUBMODES.includes(this.mode)) {
      const g = match(treeFor('config', kind), cmd);
      if (g.kind === 'ok') {
        this.mode = 'config';
        this.ctx = {};
        r = g;
      }
    }
    if (r.kind === 'empty') return '';
    if (r.kind === 'ok') {
      if (filter && r.vals[0] === 'do') {
        return this.console.doExec(this, r.vals[1], filter);
      }
      const out = r.end.handler(this, r.vals, cmd);
      return applyFilter(out === undefined ? '' : out, filter);
    }
    if (r.kind === 'incomplete') return '% Incomplete command.\n';
    if (r.kind === 'ambiguous') return `% Ambiguous command:  "${cmd.trim()}"`;
    const toks = r.toks;
    if ((this.mode === 'exec' || this.mode === 'user') && toks.length === 1 && r.at === 0) {
      const t = toks[0].text;
      if (this.dev.noLookup) return '% Unknown command or computer name, or unable to find computer address';
      return `Translating "${t}"...domain server (255.255.255.255)\n% Unknown command or computer name, or unable to find computer address`;
    }
    const col = toks[Math.min(r.at, toks.length - 1)].col;
    return `${' '.repeat(this.prompt().length + col)}^\n% Invalid input detected at '^' marker.\n`;
  }

  help(line) {
    const kind = this.dev.kind;
    let h = helpFor(treeFor(this.mode, kind), line, HELP);
    if (!h && SUBMODES.includes(this.mode)) h = helpFor(treeFor('config', kind), line, HELP);
    return h || '% Unrecognized command';
  }

  complete(line) {
    const kind = this.dev.kind;
    return complete(treeFor(this.mode, kind), line) || (SUBMODES.includes(this.mode) ? complete(treeFor('config', kind), line) : null);
  }
}

// --------------------------------------------------------------------------
// A PC/server: ipconfig, ping, tracert, arp, telnet/ssh.
export class HostSession {
  constructor(console_, devName) {
    this.console = console_;
    this.lab = console_.lab;
    this.devName = devName;
    this.pending = null;
    this.mode = 'host';
    this.history = [];
  }

  get dev() { return this.lab.devs[this.devName]; }
  get net() { return this.lab.net; }
  prompt() { return 'C:\\>'; }

  ask(prompt, cb, opts = {}) {
    this.pending = { prompt, cb, mask: !!opts.mask };
    return undefined;
  }

  run(line) {
    if (this.pending) {
      const p = this.pending;
      this.pending = null;
      const r = p.cb(line);
      return r === undefined ? '' : r;
    }
    const t = line.trim().split(/\s+/).filter(Boolean);
    if (!t.length) return '';
    this.history.push(line.trim());
    const cmd = t[0].toLowerCase();
    if (cmd === 'ipconfig') {
      const arg = (t[1] || '').toLowerCase();
      if (arg === '/release') { this.dev.host.released = true; this.lab.recompute(); return this.ipconfig(false); }
      if (arg === '/renew') { this.dev.host.released = false; this.lab.recompute(); return this.ipconfig(false); }
      return this.ipconfig(arg === '/all');
    }
    if (cmd === 'ping') return this.ping(t.slice(1));
    if (cmd === 'tracert') return this.tracert(t[1]);
    if (cmd === 'arp' && (t[1] || '').toLowerCase() === '-a') return this.arp();
    if (cmd === 'hostname') return this.dev.hostname;
    if (cmd === 'telnet' && t[1]) return this.console.connect(this, t[1], 'telnet');
    if (cmd === 'ssh' && t[1] === '-l' && t[2] && t[3]) return this.console.connect(this, t[3], 'ssh', t[2]);
    if (cmd === 'help' || cmd === '?') return HOST_HELP;
    if (cmd === 'cls') { this.console.buf = []; return ''; }
    return `Invalid Command.`;
  }

  help() { return HOST_HELP; }
  complete() { return null; }

  addr() {
    return (this.net.l3[this.devName] || []).find(a => a.fam === 4 && a.primary) || null;
  }

  ipconfig(all) {
    const d = this.dev;
    const nic = d.intfs[d.portList[0]];
    const a = this.addr();
    const lease = this.net.leases[`${this.devName}|${nic.name}`];
    const gw = d.host.dhcp ? (lease ? lease.gw : null) : (d.host.gw ? parseV4(d.host.gw) : null);
    const v6 = (this.net.l3[this.devName] || []).filter(x => x.fam === 6);
    const ll = v6.find(x => x.kind === 'll');
    const out = ['', 'Windows IP Configuration', ''];
    if (all) {
      out.push(`   Host Name . . . . . . . . . . . . : ${d.hostname}`, '   Primary Dns Suffix  . . . . . . . : ', '   Node Type . . . . . . . . . . . . : Hybrid',
        '   IP Routing Enabled. . . . . . . . : No', '');
    }
    out.push('', 'Ethernet adapter Ethernet0:', '');
    if (d.host.released) {
      out.push('   Media State . . . . . . . . . . . : Media disconnected');
      return out.join('\n');
    }
    out.push(`   Connection-specific DNS Suffix  . : ${lease && lease.domain ? lease.domain : ''}`);
    if (all) {
      out.push('   Description . . . . . . . . . . . : Intel(R) 82574L Gigabit Network Connection',
        `   Physical Address. . . . . . . . . : ${nic.mac.replace(/\./g, '').toUpperCase().match(/../g).join('-')}`,
        `   DHCP Enabled. . . . . . . . . . . : ${d.host.dhcp ? 'Yes' : 'No'}`, '   Autoconfiguration Enabled . . . . : Yes');
    }
    for (const g of v6.filter(x => x.kind === 'global')) out.push(`   IPv6 Address. . . . . . . . . . . : ${fmtV6(g.addr).toLowerCase()}`);
    if (ll) out.push(`   Link-local IPv6 Address . . . . . : ${fmtV6(ll.addr).toLowerCase()}%11`);
    if (a && a.apipa) {
      out.push(`   Autoconfiguration IPv4 Address. . : ${fmtV4(a.addr)}`, '   Subnet Mask . . . . . . . . . . . : 255.255.0.0');
    } else if (a) {
      out.push(`   IPv4 Address. . . . . . . . . . . : ${fmtV4(a.addr)}`, `   Subnet Mask . . . . . . . . . . . : ${lenToMask(a.len)}`);
    }
    if (all && lease) {
      out.push('   Lease Obtained. . . . . . . . . . : Monday, March 1, 1993 12:00:41 AM', '   Lease Expires . . . . . . . . . . : Tuesday, March 2, 1993 12:00:41 AM');
    }
    const gw6 = d.host.v6gw ? fmtV6(parseV6(d.host.v6gw)).toLowerCase() : null;
    out.push(`   Default Gateway . . . . . . . . . : ${gw6 || (gw !== null && !(a && a.apipa) ? fmtV4(gw) : '')}`);
    if (gw6 && gw !== null) out.push(`                                       ${fmtV4(gw)}`);
    if (all && lease) out.push(`   DHCP Server . . . . . . . . . . . : ${fmtV4(this.lab.serverAddr(lease))}`);
    if (all) {
      const dns = lease ? lease.dns : (d.host.dns ? [parseV4(d.host.dns)] : []);
      out.push(`   DNS Servers . . . . . . . . . . . : ${dns.length ? fmtV4(dns[0]) : ''}`);
      for (const x of dns.slice(1)) out.push(`                                       ${fmtV4(x)}`);
    }
    return out.join('\n');
  }

  ping(args) {
    const target = args.find(a => !a.startsWith('-') && !/^\d+$/.test(a) || parseV4(a) !== null);
    const nIdx = args.findIndex(a => a.toLowerCase() === '-n');
    const count = nIdx >= 0 ? Math.min(Number(args[nIdx + 1]) || 4, 20) : 4;
    if (!target) return 'Usage: ping [-n count] target_name';
    const v4 = parseV4(target), v6 = v4 === null ? parseV6(target) : null;
    if (v4 === null && v6 === null) return `Ping request could not find host ${target}. Please check the name and try again.`;
    const fam = v4 !== null ? 4 : 6;
    const dst = v4 !== null ? v4 : v6;
    const fmt = fam === 4 ? fmtV4 : x => fmtV6(x).toLowerCase();
    const me = this.addr();
    const out = ['', `Pinging ${fmt(dst)} with 32 bytes of data:`];
    const r = this.net.ping(this.devName, dst, fam);
    for (let k = 1; k < count; k++) this.net.ping(this.devName, dst, fam);
    let recv = 0;
    for (let k = 0; k < count; k++) {
      if (r.ok) {
        const ttl = this.lab.ttlFor(r.fwd.at) - Math.max(0, r.back.hops.length - 1);
        out.push(`Reply from ${fmt(dst)}: bytes=32 time${k === 0 && r.firstArp ? '=1ms' : '<1ms'} TTL=${ttl}`);
        recv++;
      } else {
        const f = r.fwd;
        if (f && f.reason === 'arp' && f.at === this.devName) {
          out.push(`Reply from ${me ? fmt(me.addr) : '0.0.0.0'}: Destination host unreachable.`);
          recv++;
        } else if (f && (f.reason === 'no-route' || f.reason === 'acl-in' || f.reason === 'acl-out') && f.at !== this.devName) {
          const via = f.hops.length ? f.hops[f.hops.length - 1] : null;
          const from = via ? this.lab.ifAddr(via.to, via.in) : null;
          out.push(`Reply from ${from !== null ? fmtV4(from) : '0.0.0.0'}: Destination ${f.reason === 'no-route' ? 'net' : 'host'} unreachable.`);
          recv++;
        } else if (f && f.reason === 'no-route' && f.at === this.devName) {
          out.push('PING: transmit failed. General failure. ');
        } else out.push('Request timed out.');
      }
    }
    out.push('', `Ping statistics for ${fmt(dst)}:`, `    Packets: Sent = ${count}, Received = ${recv}, Lost = ${count - recv} (${Math.round(((count - recv) / count) * 100)}% loss),`);
    if (r.ok) out.push('Approximate round trip times in milli-seconds:', `    Minimum = 0ms, Maximum = ${r.firstArp ? 1 : 0}ms, Average = 0ms`);
    return out.join('\n');
  }

  tracert(target) {
    const dst = parseV4(target || '');
    if (dst === null) return 'Unable to resolve target system name ' + (target || '') + '.';
    const out = ['', `Tracing route to ${fmtV4(dst)} over a maximum of 30 hops`, ''];
    const t = this.net.trace(this.devName, null, dst, 4);
    let n = 1;
    t.hops.forEach((h, idx) => {
      const last = idx === t.hops.length - 1 && t.ok;
      const a = last ? dst : this.lab.ifAddr(h.to, h.in);
      const times = [n === 1 ? '1 ms' : '<1 ms', '<1 ms', '<1 ms'].map(x => lpad(x, 9)).join('');
      out.push(`${lpad(n++, 3)}${times}  ${a !== null ? fmtV4(a) : '*'}`);
    });
    if (!t.ok) {
      if (t.reason === 'no-route' && t.at !== this.devName) {
        const a = t.hops.length ? this.lab.ifAddr(t.hops[t.hops.length - 1].to, t.hops[t.hops.length - 1].in) : null;
        out.push(`${lpad(n, 3)}  ${a !== null ? fmtV4(a) : '*'}  reports: Destination net unreachable.`);
      } else {
        for (let k = 0; k < 3; k++) out.push(`${lpad(n++, 3)}${['*', '*', '*'].map(x => lpad(x, 9)).join('')}     Request timed out.`);
      }
    }
    out.push('', 'Trace complete.');
    return out.join('\n');
  }

  arp() {
    const me = this.addr();
    if (!me) return 'No ARP Entries Found.';
    const out = ['', `Interface: ${fmtV4(me.addr)} --- 0xb`, '  Internet Address      Physical Address      Type'];
    for (const [tn, list] of Object.entries(this.net.l3)) {
      if (tn === this.devName) continue;
      for (const b of list) {
        if (b.fam !== 4 || !b.up || b.seg !== me.seg) continue;
        if (![...this.net.arpSeen].some(k => k.startsWith(this.devName + '>'))) continue;
        out.push(`  ${fmtV4(b.addr).padEnd(21)} ${this.net.devs[tn].intfs[b.intf].mac.replace(/\./g, '').match(/../g).join('-').padEnd(21)} dynamic`);
      }
    }
    return out.join('\n');
  }
}

const HOST_HELP = `Available Commands:
ipconfig     Display IP configuration (/all, /release, /renew)
ping         Send echo messages (-n count)
tracert      Trace route to destination
arp -a       Display the ARP table
telnet       Telnet to a device
ssh -l       SSH to a device (ssh -l user address)
cls          Clear the screen`;

function lpad(s, n) { return String(s).padStart(n); }

// --------------------------------------------------------------------------
export class Console {
  constructor(lab, devName) {
    this.lab = lab;
    this.devName = devName;
    this.buf = [];
    const d = lab.devs[devName];
    this.stack = [isHost(d) ? new HostSession(this, devName) : new Session(this, devName, lab.startMode)];
  }

  get s() { return this.stack[this.stack.length - 1]; }

  prompt() {
    const s = this.s;
    if (s.pending) return s.pending.prompt;
    return s.prompt();
  }

  masked() {
    return !!(this.s.pending && this.s.pending.mask);
  }

  write(text) {
    if (text === undefined || text === null) return;
    const t = String(text);
    if (t === '') return;
    this.buf.push(...t.replace(/\n$/, '').split('\n'));
  }

  // Executes a line typed at this console.
  input(line) {
    const s = this.s;
    const masked = this.masked();
    this.buf.push(this.prompt() + (masked ? '' : line));
    const out = s.run(line);
    this.write(out);
  }

  helpText(line) {
    this.buf.push(this.prompt() + line + '?');
    this.write(this.s.help(line));
  }

  // ------------------------------------------------------------ exec helpers
  enable(s) {
    const d = s.dev;
    const needs = d.enableSecret || d.enablePassword;
    if (!needs) {
      if (s.remote) return '% No password set';
      s.mode = 'exec';
      return undefined;
    }
    let tries = 0;
    const attempt = () => s.ask('Password: ', (pw) => {
      const ok = d.enableSecret ? pw === d.enableSecret : pw === d.enablePassword;
      if (ok) { s.mode = 'exec'; return undefined; }
      if (++tries >= 3) return '% Bad secrets\n';
      attempt();
      return undefined;
    }, { mask: true });
    attempt();
    return undefined;
  }

  endConfig(s) {
    if (s.mode === 'exec' || s.mode === 'user') return undefined;
    s.mode = 'exec';
    s.ctx = {};
    this.lab.logTo(s.devName, `%SYS-5-CONFIG_I: Configured from console by ${s.remote ? 'vty0 (' + s.remote.from + ')' : 'console'}`);
    return undefined;
  }

  exitMode(s) {
    if (SUBMODES.includes(s.mode)) { s.mode = 'config'; s.ctx = {}; return undefined; }
    return this.endConfig(s);
  }

  exitSession(s) {
    if (this.stack.length > 1) {
      this.stack.pop();
      return `\n[Connection to ${s.remote.addr} closed by foreign host]`;
    }
    s.loggedOut = true;
    s.mode = 'user';
    return `\n\n\n${s.dev.hostname} con0 is now available\n\n\n\n\n\nPress RETURN to get started.\n`;
  }

  relogin(s) {
    const con = s.dev.lines.con;
    s.loggedOut = false;
    const banner = s.dev.banner !== null ? s.dev.banner + '\n' : '';
    if (con.login === 'line' && con.password) {
      let tries = 0;
      const ask = () => s.ask('Password: ', (pw) => {
        if (pw === con.password) return undefined;
        if (++tries >= 3) { s.loggedOut = true; return '% Bad passwords\n'; }
        ask();
        return undefined;
      }, { mask: true });
      ask();
      return `${banner}\nUser Access Verification\n`;
    }
    if (con.login === 'local') {
      s.ask('Username: ', (user) => {
        s.ask('Password: ', (pw) => {
          const u = s.dev.users[user];
          if (u && (u.secret || u.password) === pw) { if (u.priv === 15) s.mode = 'exec'; return undefined; }
          s.loggedOut = true;
          return '% Login invalid\n';
        }, { mask: true });
        return undefined;
      });
      return `${banner}\nUser Access Verification\n`;
    }
    return banner;
  }

  doExec(s, cmd, filter) {
    const saved = { mode: s.mode, ctx: s.ctx };
    s.mode = 'exec';
    const out = s.dispatch(cmd, filter);
    // Exec commands never change config mode, but guard against prompts.
    if (s.mode === 'exec') { s.mode = saved.mode; s.ctx = saved.ctx; }
    return out;
  }

  save(s) {
    s.dev.saved = runningConfig(s.dev);
    s.dev.savedState = snapshot(s.dev);
    return 'Building configuration...\n[OK]';
  }

  loadStartup(s) {
    if (!s.dev.savedState) return '%% Non-volatile configuration memory is not present';
    restore(s.dev, s.dev.savedState);
    return `${s.dev.saved.length} bytes copied in 0.236 secs`;
  }

  reload(s) {
    const d = s.dev;
    if (d.savedState) restore(d, d.savedState);
    else {
      const fresh = createDevice(this.lab.specs[d.name]);
      restore(d, snapshot(fresh));
    }
    for (const o of Object.values(d.ospf)) o.activeRid = null;
    this.lab.net.natTable[d.name] = [];
    this.stack = [this.stack[0]];
    const base = this.stack[0];
    base.mode = 'user';
    base.ctx = {};
    return `\nSystem Bootstrap, Version 15.0(1r)M15, RELEASE SOFTWARE (fc1)\nTechnical Support: http://www.cisco.com/techsupport\nCopyright (c) 2011 by cisco Systems, Inc.\n\n...\n\nPress RETURN to get started!\n`;
  }

  genRsa(s, bits) {
    const d = s.dev;
    if (/^(Router|Switch)$/.test(d.hostname)) return `% Please define a hostname other than ${d.hostname}.`;
    if (!d.domainName) return '% Please define a domain-name first.';
    const finish = (b) => {
      d.rsaBits = b;
      this.lab.logTo(s.devName, '%SSH-5-ENABLED: SSH 1.99 has been enabled');
      return `% Generating ${b} bit RSA keys, keys will be non-exportable...\n[OK] (elapsed time was 1 seconds)`;
    };
    const intro = `The name for the keys will be: ${d.hostname}.${d.domainName}\nChoose the size of the key modulus in the range of 360 to 4096 for your\n  General Purpose Keys. Choosing a key modulus greater than 512 may take\n  a few minutes.\n`;
    const go = () => {
      if (bits) return `${intro}\n${finish(bits)}`;
      s.ask('How many bits in the modulus [512]: ', (ans) => {
        const b = ans.trim() ? Number(ans.trim()) : 512;
        if (!Number.isInteger(b) || b < 360 || b > 4096) return '% You must specify a modulus in the range of 360 to 4096';
        return finish(b);
      });
      return intro;
    };
    if (d.rsaBits) {
      s.ask(`% You already have RSA keys defined named ${d.hostname}.${d.domainName}.\n% Do you really want to replace them? [yes/no]: `, (a) => {
        if (!/^y/i.test(a.trim())) return '';
        return go();
      });
      return undefined;
    }
    return go();
  }

  banner(s, text) {
    const delim = text[0];
    const rest = text.slice(1);
    const end = rest.indexOf(delim);
    if (end >= 0) { s.dev.banner = rest.slice(0, end); return undefined; }
    const lines = rest ? [rest] : [];
    const more = () => s.ask('', (l) => {
      const i = l.indexOf(delim);
      if (i >= 0) { lines.push(l.slice(0, i)); s.dev.banner = lines.join('\n'); return undefined; }
      lines.push(l);
      more();
      return undefined;
    });
    more();
    return `Enter TEXT message.  End with the character '${delim}'.`;
  }

  // ------------------------------------------------------------ ping & trace
  resolveHost(s, host) {
    const v4 = parseV4(host);
    if (v4 !== null) return { fam: 4, addr: v4 };
    const v6 = parseV6(host);
    if (v6 !== null) return { fam: 6, addr: v6 };
    return null;
  }

  ping(s, host, opts = {}) {
    const t = this.resolveHost(s, host);
    if (!t) {
      const pre = s.dev.noLookup ? '' : `Translating "${host}"...domain server (255.255.255.255)\n`;
      return `${pre}% Unrecognized host or address, or protocol not running.\n`;
    }
    const net = this.lab.net;
    let src = null;
    if (opts.srcIntf) {
      const a = (net.l3[s.devName] || []).find(x => x.intf === opts.srcIntf && x.fam === t.fam && (t.fam === 4 ? x.primary : x.kind === 'global'));
      if (!a) return `% Invalid source interface - IP not enabled or interface is down`;
      src = a.addr;
    } else if (opts.srcIp) {
      src = parseV4(opts.srcIp);
      if (!net.owns(s.devName, src, 4)) return `% Invalid source. Must use same-VRF IP address or full interface name without spaces`;
    }
    const n = opts.repeat || 5;
    const fmt = t.fam === 4 ? fmtV4 : fmtV6;
    const lines = ['Type escape sequence to abort.', `Sending ${n}, 100-byte ICMP Echos to ${fmt(t.addr)}, timeout is 2 seconds:`];
    if (src !== null) lines.push(`Packet sent with a source address of ${fmt(src)} `);
    const r = net.ping(s.devName, t.addr, t.fam, src);
    for (let k = 1; k < n; k++) net.ping(s.devName, t.addr, t.fam, src);
    let marks;
    let ok = 0;
    if (r.ok) {
      marks = Array.from({ length: n }, (_, i) => (i === 0 && r.firstArp ? '.' : '!')).join('');
      ok = marks.split('').filter(c => c === '!').length;
    } else {
      const f = r.fwd;
      const unreachable = f && f.at !== s.devName && (f.reason === 'no-route' || f.reason === 'acl-in' || f.reason === 'acl-out');
      marks = Array.from({ length: n }, (_, i) => (unreachable && i % 2 === 0 ? 'U' : '.')).join('');
    }
    lines.push(marks);
    const pct = Math.round((ok / n) * 100);
    lines.push(`Success rate is ${pct} percent (${ok}/${n})${ok ? ', round-trip min/avg/max = 1/1/4 ms' : ''}`);
    return lines.join('\n');
  }

  traceroute(s, host) {
    const t = this.resolveHost(s, host);
    if (!t) return `% Unrecognized host or address, or protocol not running.\n`;
    const net = this.lab.net;
    const fmt = t.fam === 4 ? fmtV4 : fmtV6;
    const lines = ['Type escape sequence to abort.', `Tracing the route to ${fmt(t.addr)}`, 'VRF info: (vrf in name/id, vrf out name/id)'];
    const tr = net.trace(s.devName, null, t.addr, t.fam);
    tr.hops.forEach((h, i) => {
      const last = i === tr.hops.length - 1 && tr.ok;
      const a = last ? t.addr : this.lab.ifAddr(h.to, h.in, t.fam);
      lines.push(`  ${i + 1} ${a !== null ? fmt(a) : '*'} ${i === 0 ? 0 : 1} msec 1 msec 0 msec`);
    });
    if (!tr.ok) {
      const n = tr.hops.length + 1;
      if (tr.reason === 'no-route' && tr.at !== s.devName) {
        const h = tr.hops[tr.hops.length - 1];
        const a = this.lab.ifAddr(h.to, h.in, t.fam);
        lines.push(`  ${n} ${a !== null ? fmt(a) : '*'} !H  !H  !H `);
      } else if (tr.reason === 'acl-in' || tr.reason === 'acl-out') {
        const h = tr.hops[tr.hops.length - 1];
        const a = h ? this.lab.ifAddr(h.to, h.in, t.fam) : null;
        lines.push(`  ${n} ${a !== null ? fmt(a) : '*'} !A  !A  !A `);
      } else {
        for (let k = 0; k < 3; k++) lines.push(`  ${n + k}  *  *  * `);
      }
    }
    return lines.join('\n');
  }

  // ------------------------------------------------------------ telnet / ssh
  connect(s, host, proto, user) {
    const dst = parseV4(host);
    if (dst === null) return `% Unknown command or computer name, or unable to find computer address`;
    const trying = proto === 'telnet' ? `Trying ${host} ... ` : '';
    const p = this.lab.probeRemote(s.devName, dst, proto);
    if (p.error === 'timeout') return `${trying}\n% Connection timed out; remote host not responding`;
    if (p.error) return `${trying}\n% Connection refused by remote host`;
    const { target, td, vty } = p;
    const srcAddr = p.src;
    const fromLabel = fmtV4(srcAddr);
    const open = (priv) => {
      const sess = new Session(this, target, priv >= 15 ? 'exec' : 'user', { remote: { addr: host, from: fromLabel } });
      this.stack.push(sess);
      return td.banner !== null ? td.banner : '';
    };
    const banner = td.banner !== null ? `${td.banner}\n` : '';
    if (proto === 'ssh') {
      if (vty.login !== 'local') {
        return '% Authentication failed.\n[Connection to ' + host + ' closed by foreign host]';
      }
      s.ask('Password: ', (pw) => {
        const u = td.users[user];
        if (!u || (u.secret || u.password) !== pw) return '% Authentication failed.\n';
        this.stack.push(new Session(this, target, u.priv >= 15 ? 'exec' : 'user', { remote: { addr: host, from: fromLabel } }));
        return td.banner !== null ? `\n${td.banner}` : '';
      }, { mask: true });
      return undefined;
    }
    // telnet
    if (vty.login === null) return `${trying}Open\n${banner}${open(1)}`;
    if (vty.login === 'line') {
      if (!vty.password) return `${trying}Open\n\nPassword required, but none set\n\n[Connection to ${host} closed by foreign host]`;
      let tries = 0;
      const ask = () => s.ask('Password: ', (pw) => {
        if (pw === vty.password) { open(1); return undefined; }
        if (++tries >= 3) return `% Bad passwords\n\n[Connection to ${host} closed by foreign host]`;
        ask();
        return undefined;
      }, { mask: true });
      ask();
      return `${trying}Open\n${banner}\nUser Access Verification\n`;
    }
    let tries = 0;
    const askUser = () => s.ask('Username: ', (u) => {
      s.ask('Password: ', (pw) => {
        const acc = td.users[u];
        if (acc && (acc.secret || acc.password) === pw) { open(acc.priv); return undefined; }
        if (++tries >= 3) return `% Login invalid\n\n[Connection to ${host} closed by foreign host]`;
        askUser();
        return '% Login invalid\n';
      }, { mask: true });
      return undefined;
    });
    askUser();
    return `${trying}Open\n${banner}\nUser Access Verification\n`;
  }
}

// Deep copy of a device's configuration state (BigInt-safe).
export function snapshot(dev) {
  const { saved, savedState, ...rest } = dev;
  return structuredClone(rest);
}

export function restore(dev, snap) {
  const copy = structuredClone(snap);
  for (const k of Object.keys(dev)) if (k !== 'saved' && k !== 'savedState' && k !== 'name') delete dev[k];
  Object.assign(dev, copy);
}

export { CONFIG_MODES, maskToLen };
