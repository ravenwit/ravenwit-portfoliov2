/* ==================================================================
   THE MONOLITH POLYTOPE — the n = 3 correlation scenario
   ------------------------------------------------------------------
   Three ±1 observables S1,S2,S3, pairwise jointly measurable.
   Correlation vector  x = (E[S1S2], E[S2S3], E[S3S1]) ∈ R³.

   Everything below (vertices, facets, normals, opposite vertices,
   edge lengths, symmetry action) is COMPUTED, never transcribed.
   ================================================================== */

export type V3 = [number, number, number];

export interface Assignment {
  idx: number;
  s: [number, number, number];
  x: V3;
  vertex: number; // index into the deduplicated vertex list
  partner: number; // the globally sign-flipped assignment index
}

/** all 2³ deterministic assignments, mapped to correlation space */
export function monolithAssignments(): { rows: Assignment[]; vertices: V3[] } {
  const raw: { s: [number, number, number]; x: V3 }[] = [];
  for (let m = 0; m < 8; m++) {
    const s: [number, number, number] = [
      m & 4 ? -1 : 1,
      m & 2 ? -1 : 1,
      m & 1 ? -1 : 1,
    ];
    raw.push({ s, x: [s[0] * s[1], s[1] * s[2], s[2] * s[0]] });
  }
  const vertices: V3[] = [];
  const key = (x: V3) => x.join(",");
  const rows: Assignment[] = raw.map((r, idx) => {
    let vi = vertices.findIndex((v) => key(v) === key(r.x));
    if (vi < 0) { vertices.push(r.x); vi = vertices.length - 1; }
    return { idx, s: r.s, x: r.x, vertex: vi, partner: 7 - idx };
  });
  return { rows, vertices };
}

export interface Facet {
  id: string;
  /** primitive integer normal, oriented so that n·x ≥ rhs holds on the polytope */
  n: V3;
  rhs: number;
  /** indices of the vertices lying ON the supporting plane */
  on: number[];
  /** the single vertex NOT on the plane (computed, not assumed) */
  opposite: number;
  /** raw cross product before orientation/scaling — shown in the derivation */
  rawNormal: V3;
  scale: number;
  flipped: boolean;
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (u: V3, w: V3): V3 => [
  u[1] * w[2] - u[2] * w[1],
  u[2] * w[0] - u[0] * w[2],
  u[0] * w[1] - u[1] * w[0],
];

/** triples of vertex indices, C(4,3) = 4 facets */
export function tripleIndices(n = 4): number[][] {
  const out: number[][] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) out.push([i, j, k]);
  return out;
}

/**
 * Facet enumeration from the V-representation:
 * for each triple take n = (b−a)×(c−a), orient it so the remaining
 * vertex satisfies n·v ≥ n·a, then scale to primitive integers.
 */
export function computeFacets(vertices: V3[]): Facet[] {
  const built = tripleIndices(vertices.length).map((tri, t) => {
    const [ia, ib, ic] = tri;
    const a = vertices[ia];
    const u = sub(vertices[ib], a);
    const w = sub(vertices[ic], a);
    const raw = cross(u, w);
    const other = vertices.findIndex((_, i) => !tri.includes(i));
    // orient: the excluded vertex must satisfy the ≥ inequality
    const flipped = dot(raw, vertices[other]) < dot(raw, a);
    const oriented: V3 = flipped ? [-raw[0], -raw[1], -raw[2]] : raw;
    const scale = Math.max(...oriented.map(Math.abs)) || 1;
    const n: V3 = [oriented[0] / scale, oriented[1] / scale, oriented[2] / scale];
    const rhs = dot(n, a);
    const on = vertices
      .map((v, i) => (Math.abs(dot(n, v) - rhs) < 1e-9 ? i : -1))
      .filter((i) => i >= 0);
    return {
      id: `F${t + 1}`,
      n, rhs, on, opposite: other,
      rawNormal: raw, scale, flipped,
    };
  });
  // canonical labelling: facet F_i is the one OPPOSITE vertex v_i
  return built
    .sort((a, b) => a.opposite - b.opposite)
    .map((f, i) => ({ ...f, id: `F${i + 1}` }));
}

/**
 * Unique convex decomposition in a simplex.
 * Because facet F_i is the one OPPOSITE v_i, the barycentric weight is
 * simply the normalized slack:  λ_i = slack(F_i, x) / slack(F_i, v_i).
 * x is inside ⟺ every λ_i ≥ 0 (and they always sum to 1).
 */
export function barycentric(vertices: V3[], facets: Facet[], x: V3): number[] {
  return facets.map((f) => {
    const denom = slack(f, vertices[f.opposite]);
    return Math.abs(denom) < 1e-12 ? 0 : slack(f, x) / denom;
  });
}

/** mix vertices with given weights (renormalized) */
export function mixVertices(vertices: V3[], w: number[]): V3 {
  const s = w.reduce((a, b) => a + b, 0) || 1;
  return [0, 1, 2].map((k) => vertices.reduce((acc, v, i) => acc + (w[i] / s) * v[k], 0)) as V3;
}

/** slack of x against a facet: n·x − rhs (≥ 0 means satisfied) */
export function slack(f: Facet, x: V3): number {
  return dot(f.n, x) - f.rhs;
}

export function insidePolytope(fs: Facet[], x: V3, tol = 1e-9): boolean {
  return fs.every((f) => slack(f, x) >= -tol);
}

/** S_i → −S_i acts on (x1,x2,x3) = (S1S2, S2S3, S3S1) by flipping two coords */
export function signFlipAction(i: 0 | 1 | 2): V3 {
  // x1 = S1S2 involves 0,1 · x2 = S2S3 involves 1,2 · x3 = S3S1 involves 2,0
  const members: [number, number][] = [[0, 1], [1, 2], [2, 0]];
  return members.map((m) => (m.includes(i) ? -1 : 1)) as V3;
}

export function applyAction(a: V3, f: Facet): { n: V3; rhs: number } {
  return { n: [f.n[0] * a[0], f.n[1] * a[1], f.n[2] * a[2]], rhs: f.rhs };
}

export function sameFacet(n: V3, rhs: number, f: Facet, tol = 1e-9): boolean {
  return Math.abs(rhs - f.rhs) < tol && n.every((v, i) => Math.abs(v - f.n[i]) < tol);
}

/** pairwise Euclidean distances — proves regularity */
export function edgeTable(vertices: V3[]): { i: number; j: number; d: number }[] {
  const out: { i: number; j: number; d: number }[] = [];
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++) {
      const d = Math.hypot(...sub(vertices[i], vertices[j]));
      out.push({ i, j, d });
    }
  return out;
}

/** signed volume of the 3-simplex */
export function simplexVolume(v: V3[]): number {
  const a = sub(v[1], v[0]), b = sub(v[2], v[0]), c = sub(v[3], v[0]);
  return Math.abs(dot(a, cross(b, c))) / 6;
}

/** facet inequality as TeX, e.g. +x_1 − x_2 − x_3 ≥ −1 */
export function facetTeX(f: Facet): string {
  const term = (c: number, s: string) =>
    `${c > 0 ? "+" : "-"}${Math.abs(c) === 1 ? "" : Math.abs(c)}${s}`;
  return `${term(f.n[0], "x_1")} ${term(f.n[1], "x_2")} ${term(f.n[2], "x_3")} \\;\\ge\\; ${f.rhs}`;
}

export function facetCorrTeX(f: Facet): string {
  const lbl = ["\\langle S_1S_2\\rangle", "\\langle S_2S_3\\rangle", "\\langle S_3S_1\\rangle"];
  return f.n
    .map((c, i) => `${c > 0 ? "+" : "-"}${lbl[i]}`)
    .join(" ")
    .replace(/^\+/, "") + ` \\;\\ge\\; ${f.rhs}`;
}

/**
 * The quantum point for the n = 3 cycle: three MUTUALLY orthogonal rays
 * (an orthonormal basis of R³) with the symmetric probe state.
 * p_i = h² = 1/3 ⟹ E[S_iS_j] = 1 − 2p_i − 2p_j = −1/3, landing exactly
 * on facet x1+x2+x3 = −1. Quantum theory cannot escape this tetrahedron.
 */
export function monolithQuantumPoint(): { x: V3; p: number; sum: number } {
  const p = 1 / 3;
  const e = 1 - 4 * p;
  return { x: [e, e, e], p, sum: 3 * e };
}
