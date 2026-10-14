"use client";
import clsx from "clsx";
import type { ReactNode } from "react";

/* ───────────────────────── Isometric projection ─────────────────────────
 * World units: x grows to the screen's lower-right, y to the lower-left, z up.
 * The viewer looks from +x/+y, so the visible faces are: top, +x ("right") and +y ("front").
 * Everything is drawn back-to-front (painter's algorithm): smaller x + y first.
 */
const S = 30;
export type V3 = [number, number, number];
export const iso = ([x, y, z]: V3): [number, number] => [(x - y) * 0.866 * S, (x + y) * 0.5 * S - z * S];
const pts = (vs: V3[]) => vs.map((v) => iso(v).map((n) => n.toFixed(1)).join(",")).join(" ");
const P = (vs: V3[], props: React.SVGProps<SVGPolygonElement> = {}) => <polygon points={pts(vs)} {...props} />;

/** Rectangle on a plane y = const (front face) */
const fy = (y: number, x0: number, x1: number, z0: number, z1: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];
/** Rectangle on a plane x = const (right face) */
const fx = (x: number, y0: number, y1: number, z0: number, z1: number): V3[] => [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]];
/** Rectangle on a plane z = const (top face) */
const fz = (z: number, x0: number, x1: number, y0: number, y1: number): V3[] => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];

type BoxProps = {
  x: number; y: number; z: number; w: number; d: number; h: number;
  top?: string; right?: string; front?: string; edge?: string; topEdge?: string;
};
/** Solid box: front (+y), right (+x) and top faces with a highlighted top rim. */
function Box({ x, y, z, w, d, h, top = "url(#gTop)", right = "url(#gRight)", front = "url(#gFront)", edge = "rgba(106,166,255,.22)", topEdge = "rgba(150,195,255,.55)" }: BoxProps) {
  return (
    <g strokeLinejoin="round">
      {P(fy(y + d, x, x + w, z, z + h), { fill: front, stroke: edge, strokeWidth: 0.8 })}
      {P(fx(x + w, y, y + d, z, z + h), { fill: right, stroke: edge, strokeWidth: 0.8 })}
      {P(fz(z + h, x, x + w, y, y + d), { fill: top, stroke: topEdge, strokeWidth: 0.9 })}
    </g>
  );
}

/** Horizontal siding courses on a front (+y) and right (+x) face — gives the wall a material. */
function Siding({ x, y, w, d, z0, z1, step = 0.3 }: { x: number; y: number; w: number; d: number; z0: number; z1: number; step?: number }) {
  const lines: ReactNode[] = [];
  for (let z = z0 + step; z < z1 - 0.05; z += step) {
    const a = iso([x, y + d, z]), b = iso([x + w, y + d, z]), c = iso([x + w, y, z]);
    lines.push(<polyline key={z} points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]}`} fill="none" stroke="rgba(160,200,255,.07)" strokeWidth={0.7} />);
  }
  return <g>{lines}</g>;
}

/** Soft contact shadow around a footprint (stacked translucent rings — no blur filter, cheap to repaint). */
function ContactShadow({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <g fill="#00040f">
      {P(fz(0.002, x - 0.9, x + w + 1.4, y - 0.6, y + d + 1.1), { opacity: 0.12 })}
      {P(fz(0.003, x - 0.45, x + w + 0.8, y - 0.3, y + d + 0.6), { opacity: 0.18 })}
      {P(fz(0.004, x - 0.15, x + w + 0.3, y - 0.1, y + d + 0.25), { opacity: 0.3 })}
    </g>
  );
}

type WinKind = "glass" | "warm" | "screen" | "dark";
/** Recessed window on the front (+y) face: glass set back, visible left reveal + sill, frame and reflection. */
function WindowFront({ y, x0, x1, z0, z1, kind = "glass", lit = false }: { y: number; x0: number; x1: number; z0: number; z1: number; kind?: WinKind; lit?: boolean }) {
  const r = 0.16;
  const fill = kind === "warm" ? "url(#gWarm)" : kind === "screen" ? "url(#gGlass)" : kind === "dark" ? "#051335" : "url(#gGlass)";
  return (
    <g>
      {P(fy(y - r, x0, x1, z0, z1), { fill, opacity: lit ? 1 : kind === "warm" ? 0.7 : 0.82, className: "transition-opacity duration-500" })}
      {/* reflection streak */}
      {P([[x0 + 0.15, y - r, z1 - 0.05], [x0 + 0.45, y - r, z1 - 0.05], [x0 + 0.05, y - r, z0 + 0.35], [x0 + 0.02, y - r, z0 + 0.6]], { fill: "#fff", opacity: 0.12 })}
      {/* reveals: left jamb (faces +x) and sill (faces +z) */}
      {P(fx(x0, y - r, y, z0, z1), { fill: "#04102c" })}
      {P(fz(z0, x0, x1, y - r, y), { fill: "#1e4796" })}
      {/* frame */}
      {P(fy(y, x0, x1, z0, z1), { fill: "none", stroke: "#3b6fcf", strokeWidth: 1.1 })}
      {/* mullion */}
      <line {...line([(x0 + x1) / 2, y - r, z0], [(x0 + x1) / 2, y - r, z1])} stroke="#3b6fcf" strokeWidth={0.8} />
      {/* protruding sill */}
      {P([[x0 - 0.08, y + 0.12, z0], [x1 + 0.08, y + 0.12, z0], [x1 + 0.08, y, z0], [x0 - 0.08, y, z0]], { fill: "#5f8fe6" })}
    </g>
  );
}
/** Recessed window on the right (+x) face. */
function WindowRight({ x, y0, y1, z0, z1, children }: { x: number; y0: number; y1: number; z0: number; z1: number; children?: ReactNode }) {
  const r = 0.16;
  return (
    <g>
      {P(fx(x - r, y0, y1, z0, z1), { fill: "#04122f" })}
      {children}
      {P(fy(y0, x - r, x, z0, z1), { fill: "#0b2a63" })}
      {P(fz(z0, x - r, x, y0, y1), { fill: "#1a3f88" })}
      {P(fx(x, y0, y1, z0, z1), { fill: "none", stroke: "#3b6fcf", strokeWidth: 1.1 })}
    </g>
  );
}
const line = (a: V3, b: V3) => {
  const [x1, y1] = iso(a), [x2, y2] = iso(b);
  return { x1, y1, x2, y2 };
};

/** Solar panel on a tilted rack with legs and cell grid. */
function SolarPanel({ x, y, z, w = 1.5, d = 1.15, tilt = 0.45, active }: { x: number; y: number; z: number; w?: number; d?: number; tilt?: number; active: boolean }) {
  const hi = z + 0.15 + tilt, lo = z + 0.15;
  const corners: V3[] = [[x, y, hi], [x + w, y, hi], [x + w, y + d, lo], [x, y + d, lo]];
  const cells: ReactNode[] = [];
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    cells.push(<line key={"c" + i} {...line([x + w * t, y, hi], [x + w * t, y + d, lo])} stroke="rgba(160,200,255,.35)" strokeWidth={0.5} />);
  }
  cells.push(<line key="m" {...line([x, y + d / 2, (hi + lo) / 2], [x + w, y + d / 2, (hi + lo) / 2])} stroke="rgba(160,200,255,.35)" strokeWidth={0.5} />);
  return (
    <g>
      {/* rack legs (back edge raised) */}
      <line {...line([x + 0.1, y + 0.05, z], [x + 0.1, y + 0.05, hi])} stroke="#6f86b3" strokeWidth={1.2} />
      <line {...line([x + w - 0.1, y + 0.05, z], [x + w - 0.1, y + 0.05, hi])} stroke="#6f86b3" strokeWidth={1.2} />
      {/* panel thickness */}
      {P([[x, y + d, lo], [x + w, y + d, lo], [x + w, y + d, lo - 0.07], [x, y + d, lo - 0.07]], { fill: "#9fb6dd" })}
      {P([[x + w, y, hi], [x + w, y + d, lo], [x + w, y + d, lo - 0.07], [x + w, y, hi - 0.07]], { fill: "#7d93bd" })}
      {P(corners, { fill: "url(#gPanel)", stroke: "#8fb6ff", strokeWidth: 0.7, className: active ? "eco-breathe" : undefined })}
      {cells}
      {/* specular glint */}
      {P([[x + w * 0.55, y, hi], [x + w * 0.75, y, hi], [x + w * 0.35, y + d, lo], [x + w * 0.15, y + d, lo]], { fill: "#fff", opacity: 0.1 })}
    </g>
  );
}

/** Wall-mounted bullet camera at a world point. */
function Camera({ at, flip }: { at: V3; flip?: boolean }) {
  const [x, y] = iso(at);
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""}`}>
      <rect x="-2" y="-9" width="3.5" height="9" rx="1" fill="#9aa9bf" />
      <g transform="rotate(24)">
        <rect x="-10" y="-3" width="20" height="8.5" rx="2.5" fill="#eef3fa" />
        <rect x="-10" y="2.5" width="20" height="3" rx="1.5" fill="#c3cfe0" />
        <rect x="-12" y="-4.5" width="10" height="2.5" rx="1" fill="#dfe7f2" />
      </g>
      <circle cx="9" cy="6.5" r="2.6" fill="#020817" stroke="#6aa6ff" strokeWidth=".6" />
      <circle cx="9" cy="6.5" r="0.9" fill="#e9f205" className="eco-blink" />
    </g>
  );
}

/** Low-poly tree: trunk + layered crown with light/shadow halves. */
function Tree({ at, s = 1 }: { at: V3; s?: number }) {
  const [x, y] = iso(at);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="6" cy="2" rx="26" ry="9" fill="#00040f" opacity=".35" />
      <rect x="-2.5" y="-30" width="5" height="31" fill="#3a2c22" />
      <circle cx="0" cy="-44" r="22" fill="#0d4b3c" />
      <circle cx="-7" cy="-50" r="15" fill="#13654f" />
      <circle cx="6" cy="-58" r="12" fill="#1a7a5f" />
      <path d="M0,-66 a22,22 0 0 1 22,22 a22,22 0 0 1 -6,15 a22,22 0 0 0 -16,-37z" fill="#082f27" opacity=".55" />
    </g>
  );
}
function Bush({ at, s = 1 }: { at: V3; s?: number }) {
  const [x, y] = iso(at);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="3" cy="2" rx="13" ry="4.5" fill="#00040f" opacity=".3" />
      <circle cx="-5" cy="-5" r="8" fill="#0f5745" />
      <circle cx="5" cy="-6" r="9" fill="#14684f" />
      <circle cx="0" cy="-10" r="7" fill="#1b7b5d" />
    </g>
  );
}

/** Simple car parked on the driveway (length along y). */
function Car({ x, y }: { x: number; y: number }) {
  const w = 1.7, l = 3.3;
  /** Wheel = circle on the plane x = const, projected point by point (correct isometric ellipse). */
  const wheel = (wy: number) => {
    const r = 0.36, cz = 0.36, wx = x + w + 0.02;
    const ring = (rr: number) =>
      Array.from({ length: 20 }, (_, i) => {
        const t = (i / 20) * Math.PI * 2;
        return iso([wx, wy + Math.cos(t) * rr, cz + Math.sin(t) * rr]).map((n) => n.toFixed(1)).join(",");
      }).join(" ");
    return (
      <g>
        <polygon points={ring(r)} fill="#05070d" stroke="#2a3348" strokeWidth={1.2} />
        <polygon points={ring(r * 0.5)} fill="#8a96ad" />
      </g>
    );
  };
  return (
    <g>
      {P(fz(0.003, x - 0.25, x + w + 0.45, y - 0.2, y + l + 0.35), { fill: "#00040f", opacity: 0.4 })}
      <Box x={x} y={y} z={0.28} w={w} d={l} h={0.55} top="#c9d4e6" right="#7d8aa3" front="#a6b3c9" edge="rgba(0,0,0,.25)" topEdge="rgba(255,255,255,.5)" />
      <Box x={x + 0.12} y={y + 0.85} z={0.83} w={w - 0.24} d={1.6} h={0.45} top="#dbe3ef" right="#1b2740" front="#24324f" edge="rgba(0,0,0,.25)" topEdge="rgba(255,255,255,.5)" />
      {/* windshield glint */}
      {P(fy(y + 0.85 + 1.6, x + 0.2, x + w - 0.2, 0.86, 1.25), { fill: "#6aa6ff", opacity: 0.35 })}
      {wheel(y + 0.7)}
      {wheel(y + l - 0.7)}
      {/* lights */}
      {P(fy(y + l, x + 0.1, x + 0.45, 0.55, 0.7), { fill: "#f2f86a" })}
      {P(fy(y + l, x + w - 0.45, x + w - 0.1, 0.55, 0.7), { fill: "#f2f86a" })}
    </g>
  );
}

/* ───────────────────────── Scene ───────────────────────── */
export const HUB: V3 = [5.2, 0.9, 7];
export const SPOTS: Record<string, V3> = {
  cctv: [6.05, 5.05, 4.65],
  "energia-solar": [2.9, 2.4, 5.9],
  "automatizacion-de-puertas": [8.1, 5, 1.3],
  domotica: [1.25, 5, 3.4],
  ups: [11.1, 3.9, 1.7],
  "servicios-informaticos": [4.85, 5, 1.3],
};

export function IsometricScene({ slug, paused }: { slug: string; paused: boolean }) {
  const on = (s: string) => slug === s;
  // Main building: x 0..6, y 0..5, h 4.4 · Garage: x 6..10.2, y 1..5, h 2.7
  return (
    <g data-paused={paused ? "" : undefined}>
      <defs>
        <linearGradient id="gFront" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1a4699" />
          <stop offset="1" stopColor="#0b2760" />
        </linearGradient>
        <linearGradient id="gRight" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0e2c6b" />
          <stop offset="1" stopColor="#061639" />
        </linearGradient>
        <linearGradient id="gTop" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#2a5ab5" />
          <stop offset="1" stopColor="#163d86" />
        </linearGradient>
        <linearGradient id="gRoof" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#0d2a66" />
          <stop offset="1" stopColor="#0a2152" />
        </linearGradient>
        <linearGradient id="gGlass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8cc0ff" />
          <stop offset=".55" stopColor="#2f7ff0" />
          <stop offset="1" stopColor="#0a3a8c" />
        </linearGradient>
        <linearGradient id="gWarm" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff7b0" />
          <stop offset="1" stopColor="#f0b90b" />
        </linearGradient>
        <linearGradient id="gPanel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3d8bff" />
          <stop offset=".6" stopColor="#0c3f9e" />
          <stop offset="1" stopColor="#06235e" />
        </linearGradient>
        <linearGradient id="gDoor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3a69c4" />
          <stop offset="1" stopColor="#1f4a9e" />
        </linearGradient>
        <linearGradient id="gGround" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#0a1f4a" />
          <stop offset="1" stopColor="#061433" />
        </linearGradient>
        <linearGradient id="gGrass" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#0c3a35" />
          <stop offset="1" stopColor="#082a29" />
        </linearGradient>
        <radialGradient id="gCone">
          <stop offset="0" stopColor="#e9f205" stopOpacity=".45" />
          <stop offset="1" stopColor="#e9f205" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gLamp">
          <stop offset="0" stopColor="#fff7b0" stopOpacity=".9" />
          <stop offset="1" stopColor="#f2f86a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="doorOpening">
          <polygon points={pts(fy(4.82, 6.6, 9.6, 0, 2.05))} />
        </clipPath>
      </defs>

      {/* ── Ground slab with visible thickness ── */}
      {P(fy(10, -2, 14, -0.55, 0), { fill: "#04102b", stroke: "rgba(106,166,255,.25)", strokeWidth: 0.8 })}
      {P(fx(14, -2, 10, -0.55, 0), { fill: "#020a1f", stroke: "rgba(106,166,255,.25)", strokeWidth: 0.8 })}
      {P(fz(0, -2, 14, -2, 10), { fill: "url(#gGround)", stroke: "rgba(150,195,255,.4)", strokeWidth: 0.9 })}
      {/* lawn patches */}
      {P(fz(0.001, -1.6, 5.8, 5.5, 8.4), { fill: "url(#gGrass)" })}
      {P(fz(0.001, 12.9, 13.8, 4.6, 8.4), { fill: "url(#gGrass)" })}
      {/* parking pad */}
      {P(fz(0.002, 10.5, 12.8, 5.2, 8.4), { fill: "#122a5c" })}
      {P(fz(0.001, -1.6, -0.3, -1.6, 5.2), { fill: "url(#gGrass)" })}
      {/* sidewalk to the door */}
      {P(fz(0.002, 2.45, 3.55, 5, 8.4), { fill: "#1b3672" })}
      {/* driveway */}
      {P(fz(0.002, 6.4, 9.8, 5, 8.4), { fill: "#122a5c" })}
      {/* street with lane marks */}
      {P(fz(0.002, -2, 14, 8.4, 10), { fill: "#071230" })}
      {P(fz(0.003, -2, 14, 8.4, 8.55), { fill: "#2b4f96" })}
      {[-1, 1.5, 4, 6.5, 9, 11.5].map((x) => P(fz(0.004, x, x + 1.2, 9.18, 9.3), { key: x, fill: "#e9f205", opacity: 0.55 }))}

      {/* ── Contact shadows ── */}
      <ContactShadow x={0} y={0} w={6} d={5} />
      <ContactShadow x={6} y={1} w={4.2} d={4} />

      {/* ── Back-left tree (farthest) ── */}
      <Tree at={[-1.1, 0.6, 0]} s={1.05} />

      {/* ═════════ MAIN BUILDING ═════════ */}
      <Box x={0} y={0} z={0} w={6} d={5} h={4.4} />
      <Siding x={0} y={0} w={6} d={5} z0={0} z1={4.4} />
      {/* floor band */}
      <Box x={-0.06} y={-0.06} z={2.2} w={6.12} d={5.12} h={0.14} top="#3d6cc9" right="#163a80" front="#244f9f" edge="rgba(0,0,0,0)" topEdge="rgba(150,195,255,.4)" />
      {/* parapet + recessed roof */}
      <Box x={-0.1} y={-0.1} z={4.4} w={6.2} d={5.2} h={0.4} top="#2b5cb9" />
      {P(fz(4.8, 0.2, 5.8, 0.2, 4.8), { fill: "url(#gRoof)" })}
      {/* parapet inner walls visible from above (back & left inner faces) */}
      {P([[0.2, 0.2, 4.8], [5.8, 0.2, 4.8], [5.8, 0.2, 4.62], [0.2, 0.2, 4.62]], { fill: "#123477" })}
      {P([[0.2, 0.2, 4.8], [0.2, 4.8, 4.8], [0.2, 4.8, 4.62], [0.2, 0.2, 4.62]], { fill: "#0c2763" })}

      {/* Right face (+x) windows: server rack room + office */}
      <WindowRight x={6} y0={0.9} y1={2.8} z0={2.75} z1={3.95}>
        {[3.0, 3.25, 3.5, 3.75].map((z, i) => (
          <g key={z}>
            {P(fx(5.85, 1.15, 2.55, z, z + 0.17), { fill: "#0d2f78" })}
            {[1.3, 1.55, 1.8, 2.05, 2.3].map((y, j) => {
              const c = iso([5.849, y, z + 0.085]);
              return <circle key={y} cx={c[0]} cy={c[1]} r={1.2} fill={j % 2 ? "#e9f205" : "#6aa6ff"} className="eco-blink" style={{ animationDuration: `${0.6 + ((i + j) % 4) * 0.35}s` }} />;
            })}
          </g>
        ))}
      </WindowRight>
      <WindowRight x={6} y0={3.3} y1={4.5} z0={2.75} z1={3.95}>
        {P(fx(5.85, 3.3, 4.5, 2.75, 3.95), { fill: "url(#gGlass)", opacity: 0.55 })}
      </WindowRight>

      {/* Front face (+y) windows */}
      <WindowFront y={5} x0={0.6} x1={1.9} z0={2.75} z1={3.95} kind="warm" lit={on("domotica")} />
      <WindowFront y={5} x0={2.35} x1={3.65} z0={2.75} z1={3.95} />
      <WindowFront y={5} x0={4.1} x1={5.4} z0={2.75} z1={3.95} />
      <WindowFront y={5} x0={0.6} x1={1.9} z0={0.75} z1={1.95} kind="dark" />
      <WindowFront y={5} x0={4.1} x1={5.4} z0={0.75} z1={1.95} kind="screen" lit={on("servicios-informaticos")} />
      {/* monitor inside the IT window */}
      {P(fy(4.9, 4.4, 5.1, 1.0, 1.55), { fill: "#020817" })}
      {P(fy(4.89, 4.46, 5.04, 1.06, 1.49), { fill: "#6aa6ff", opacity: on("servicios-informaticos") ? 0.95 : 0.45, className: "transition-opacity duration-500" })}
      {/* smart lamp glow (domótica) */}
      {(() => {
        const c = iso([1.25, 5.1, 3.35]);
        return <circle cx={c[0]} cy={c[1]} r={on("domotica") ? 26 : 0} fill="url(#gLamp)" className="transition-all duration-500" />;
      })()}

      {/* Entrance: recessed door + canopy + step */}
      {P(fy(4.82, 2.55, 3.45, 0, 1.85), { fill: "#071a45" })}
      {P(fx(2.55, 4.82, 5, 0, 1.85), { fill: "#030b22" })}
      {P(fy(5, 2.55, 3.45, 0, 1.85), { fill: "none", stroke: "#3b6fcf", strokeWidth: 1 })}
      {(() => {
        const c = iso([3.3, 4.82, 0.95]);
        return <circle cx={c[0]} cy={c[1]} r={1.6} fill="#e9f205" />;
      })()}
      <Box x={2.35} y={5} z={2.0} w={1.3} d={0.55} h={0.1} top="#5f8fe6" right="#173c84" front="#2a56aa" />
      <Box x={2.4} y={5} z={0} w={1.2} d={0.4} h={0.1} top="#5376c0" right="#18356f" front="#23468e" />

      {/* Roof: AC unit, solar array, antenna hub */}
      <Box x={0.5} y={0.45} z={4.8} w={0.9} d={0.7} h={0.45} top="#9fb2d6" right="#4d5f86" front="#7488b3" edge="rgba(0,0,0,.2)" topEdge="rgba(255,255,255,.4)" />
      {[0.55, 2.05, 3.55].map((y) => [1.6, 3.3].map((x) => <SolarPanel key={`${x}-${y}`} x={x} y={y} z={4.8} active={on("energia-solar")} />))}
      <line {...line([5.2, 0.9, 4.8], HUB)} stroke="#8fb6ff" strokeWidth={2} />
      <Box x={5.0} y={0.7} z={4.8} w={0.4} d={0.4} h={0.18} top="#6f86b3" right="#2d3f66" front="#4a5f8c" />

      {/* Camera on the main building corner */}
      <Camera at={[6.05, 5.05, 4.25]} />
      <Camera at={[0, 5.05, 4.25]} flip />

      {/* ═════════ GARAGE ═════════ */}
      <Box x={6} y={1} z={0} w={4.2} d={4} h={2.7} />
      <Siding x={6} y={1} w={4.2} d={4} z0={0} z1={2.7} />
      <Box x={5.95} y={0.95} z={2.7} w={4.3} d={4.1} h={0.25} top="#2b5cb9" />
      {P(fz(2.95, 6.25, 9.95, 1.25, 4.8), { fill: "url(#gRoof)" })}
      {[1.45, 3.0].map((y) => [6.45, 8.25].map((x) => <SolarPanel key={`g${x}-${y}`} x={x} y={y} z={2.95} w={1.5} d={1.1} tilt={0.35} active={on("energia-solar")} />))}

      {/* Sectional door, recessed into the front wall */}
      {P(fy(4.82, 6.6, 9.6, 0, 2.05), { fill: "#020a1d" })}
      <g clipPath="url(#doorOpening)">
        <g className={on("automatizacion-de-puertas") ? "eco-door" : undefined}>
          {P(fy(4.82, 6.6, 9.6, 0, 2.05), { fill: "url(#gDoor)" })}
          {[0.41, 0.82, 1.23, 1.64].map((z) => (
            <line key={z} {...line([6.6, 4.82, z], [9.6, 4.82, z])} stroke="#0d2c6e" strokeWidth={1.2} />
          ))}
          {[6.9, 7.6, 8.3, 9.0].map((x) => P(fy(4.82, x, x + 0.45, 1.68, 1.9), { key: x, fill: "#8cc0ff", opacity: 0.6 }))}
        </g>
      </g>
      {/* lintel shadow + jambs (depth of the opening) */}
      {P(fy(4.82, 6.6, 9.6, 1.85, 2.05), { fill: "#000", opacity: 0.35 })}
      {P(fx(6.6, 4.82, 5, 0, 2.05), { fill: "#030b22" })}
      {P(fy(5, 6.6, 9.6, 0, 2.05), { fill: "none", stroke: "#3b6fcf", strokeWidth: 1.1 })}
      {/* wall lamp above the door */}
      {(() => {
        const c = iso([8.1, 5.02, 2.32]);
        return (
          <g>
            <rect x={c[0] - 5} y={c[1] - 3} width={10} height={4} rx={1.5} fill="#dfe7f2" />
            <circle cx={c[0]} cy={c[1] + 8} r={on("automatizacion-de-puertas") ? 22 : 12} fill="url(#gLamp)" className="transition-all duration-500" />
          </g>
        );
      })()}
      <Camera at={[10.25, 5.05, 2.45]} />

      {/* Camera field of view on the ground */}
      <g className={clsx("transition-opacity duration-500", on("cctv") ? "opacity-100" : "opacity-35")}>
        {P([[6.1, 5.1, 4.1], [4.4, 9.4, 0], [9.0, 8.8, 0]], { fill: "url(#gCone)", className: "eco-breathe" })}
        {P([[10.3, 5.1, 2.3], [10.6, 9.6, 0], [13.8, 6.6, 0]], { fill: "url(#gCone)", className: "eco-breathe", style: { animationDelay: "-1.2s" } })}
      </g>

      {/* ═════════ UPS cabinet ═════════ */}
      <Box x={10.6} y={3.4} z={0} w={1} d={1} h={1.35} top="#3a64b6" />
      {[0.3, 0.55, 0.8].map((z, i) =>
        P(fy(4.4, 10.75, 11.45, z, z + 0.13), {
          key: z,
          fill: "#e9f205",
          className: on("ups") ? "eco-blink" : undefined,
          opacity: on("ups") ? undefined : 0.35,
          style: { animationDelay: `${i * 0.2}s` },
        }),
      )}
      {[0.4, 0.6, 0.8, 1.0].map((z) => (
        <line key={z} {...line([11.6, 3.55, z], [11.6, 4.25, z])} stroke="rgba(160,200,255,.3)" strokeWidth={0.8} />
      ))}

      {/* ═════════ Front elements (nearest) ═════════ */}
      <Bush at={[0.6, 5.9, 0]} />
      <Bush at={[1.6, 6.1, 0]} s={0.85} />
      <Bush at={[4.6, 5.9, 0]} s={0.9} />
      <Tree at={[13.2, 3.0, 0]} s={1.1} />
      <Car x={10.8} y={5.5} />
      <Bush at={[13.3, 8.0, 0]} s={0.8} />
    </g>
  );
}
