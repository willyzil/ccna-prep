import React from 'react';
import { parseIntf } from '../sim/intf.js';

const W = 600, H = 340;

function Icon({ kind }) {
  switch (kind) {
    case 'router':
      return (
        <g>
          <ellipse cx="0" cy="4" rx="22" ry="9" className="ic-side" />
          <rect x="-22" y="-6" width="44" height="10" className="ic-side" />
          <ellipse cx="0" cy="-6" rx="22" ry="9" className="ic-top" />
          <path d="M-12 -6h24M-12 -6l4 -3M-12 -6l4 3M12 -6l-4 -3M12 -6l-4 3" className="ic-mark" />
        </g>
      );
    case 'switch':
    case 'l3switch':
      return (
        <g>
          <rect x="-22" y="-14" width="44" height="28" rx="4" className="ic-top" />
          <path d="M-13 -5h26l-5 -4M13 5h-26l5 4" className="ic-mark" />
          {kind === 'l3switch' && <circle cx="0" cy="0" r="4" className="ic-mark" />}
        </g>
      );
    case 'server':
      return (
        <g>
          <rect x="-13" y="-19" width="26" height="38" rx="3" className="ic-top" />
          <path d="M-8 -10h16M-8 -3h16M-8 4h16" className="ic-mark" />
        </g>
      );
    case 'cloud':
      return <path d="M-20 8a9 9 0 0 1 2-17a12 12 0 0 1 22-3a10 10 0 0 1 16 10a7 7 0 0 1-2 10z" className="ic-top" />;
    default:
      return (
        <g>
          <rect x="-17" y="-15" width="34" height="23" rx="2" className="ic-top" />
          <rect x="-12" y="-11" width="24" height="15" className="ic-screen" />
          <path d="M-6 12h12M0 8v4" className="ic-stand" />
        </g>
      );
  }
}

function short(name) {
  const p = parseIntf(name);
  if (!p) return name;
  return p.short.replace(/^Gi/, 'G').replace(/^Se/, 'S');
}

// Builds nodes/links for a lab definition.
export function topoFromLab(def) {
  const pos = def.topo || {};
  const nodes = def.devices.map((d, i) => ({
    id: d.name,
    kind: d.kind || 'router',
    x: (pos[d.name] ? pos[d.name][0] : 10 + (i * 80) / Math.max(1, def.devices.length - 1)) * (W / 100),
    y: (pos[d.name] ? pos[d.name][1] : 50) * (H / 100),
  }));
  const links = (def.links || []).map(([a, b]) => {
    const [ad, ...ai] = a.split(/\s+/);
    const [bd, ...bi] = b.split(/\s+/);
    return { a: ad, ai: short(ai.join('')), b: bd, bi: short(bi.join('')) };
  });
  return { nodes, links, hideIntf: !!pos.hideIntf };
}

// Builds nodes/links for a standalone exhibit: { nodes: {R1: ['router', x, y]}, links: [['R1 g0/0', 'R2 g0/0', 'label']] }.
export function topoFromExhibit(ex) {
  const nodes = Object.entries(ex.nodes).map(([id, [kind, x, y, sub]]) => ({ id, kind, x: x * (W / 100), y: y * (H / 100), sub }));
  const links = (ex.links || []).map(([a, b, label]) => {
    const [ad, ...ai] = a.split(/\s+/);
    const [bd, ...bi] = b.split(/\s+/);
    return { a: ad, ai: ai.length ? short(ai.join('')) : '', b: bd, bi: bi.length ? short(bi.join('')) : '', label };
  });
  return { nodes, links, hideIntf: false };
}

export default function Topology({ topo, selected, onSelect, height }) {
  const { nodes, links, hideIntf } = topo;
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  // Fit the view to the nodes so narrow layouts are not drawn tiny.
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
  let minX = Math.min(...xs) - 64, maxX = Math.max(...xs) + 64;
  const minY = Math.min(...ys) - 38, maxY = Math.max(...ys) + (nodes.some(n => n.sub) ? 60 : 46);
  if (maxX - minX < 300) { const c = (minX + maxX) / 2; minX = c - 150; maxX = c + 150; }
  return (
    <svg className="topo" viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`} style={height ? { maxHeight: height } : undefined} role="img" aria-label="Network topology">
      {links.map((l, i) => {
        const A = byId[l.a], B = byId[l.b];
        if (!A || !B) return null;
        const dx = B.x - A.x, dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const at = (n, t, off) => [n.x + dx * t * (n === A ? 1 : -1) + nx * off, n.y + dy * t * (n === A ? 1 : -1) + ny * off];
        const pa = at(A, Math.min(0.32, 46 / len), 11);
        const pb = at(B, Math.min(0.32, 46 / len), 11);
        return (
          <g key={i}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} className="topo-link" />
            {!hideIntf && l.ai && <text x={pa[0]} y={pa[1]} className="topo-if">{l.ai}</text>}
            {!hideIntf && l.bi && <text x={pb[0]} y={pb[1]} className="topo-if">{l.bi}</text>}
            {l.label && <text x={(A.x + B.x) / 2 + nx * 14} y={(A.y + B.y) / 2 + ny * 14} className="topo-net">{l.label}</text>}
          </g>
        );
      })}
      {nodes.map(n => (
        <g
          key={n.id}
          transform={`translate(${n.x},${n.y})`}
          className={`topo-node k-${n.kind}${selected === n.id ? ' sel' : ''}${onSelect ? ' clickable' : ''}`}
          onClick={onSelect ? () => onSelect(n.id) : undefined}
          role={onSelect ? 'button' : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onKeyDown={onSelect ? e => { if (e.key === 'Enter' || e.key === ' ') onSelect(n.id); } : undefined}
        >
          <circle r="30" className="topo-ring" />
          <Icon kind={n.kind} />
          <text y="36" className="topo-name">{n.id}</text>
          {n.sub && <text y="50" className="topo-sub">{n.sub}</text>}
        </g>
      ))}
    </svg>
  );
}
