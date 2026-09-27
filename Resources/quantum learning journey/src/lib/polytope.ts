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

/* ==================================================================
   EXTENDED 8-CORNER HYPERCUBE & ODD-PARITY INEQUALITIES
   ------------------------------------------------------------------
   The correlation cube [-1, 1]³ has 8 vertices:
   - 4 classical (even parity x1*x2*x3 = +1): regular tetrahedron T_even
   - 4 non-classical / frustrated (odd parity x1*x2*x3 = -1): dual tetrahedron T_odd
   Together they form Kepler's Stella Octangula (compound of two tetrahedra).
   The intersection T_even ∩ T_odd is the regular octahedron.
   ================================================================== */

export interface CubeCorner {
  id: string; // "v1".."v4" (classical) or "c1".."c4" (frustrated)
  label: string; // "v₁".."v₄" or "c₁".."c₄"
  name: string;
  x: V3;
  isClassical: boolean;
  parity: 1 | -1;
  minusCount: number;
  assignments: [number, number, number][]; // deterministic spins if classical
  physicalMeaning: string;
  oppositeCornerId: string;
}

export function allCubeCorners(classicalVertices: V3[]): CubeCorner[] {
  // Deterministic spin assignments matching monolithAssignments
  const v1Assignments: [number, number, number][] = [[1, 1, 1], [-1, -1, -1]];
  const v2Assignments: [number, number, number][] = [[1, 1, -1], [-1, -1, 1]];
  const v3Assignments: [number, number, number][] = [[-1, 1, 1], [1, -1, -1]];
  const v4Assignments: [number, number, number][] = [[1, -1, 1], [-1, 1, -1]];

  const classical: CubeCorner[] = classicalVertices.map((v, i) => {
    const assignments = [v1Assignments, v2Assignments, v3Assignments, v4Assignments][i] || [];
    const minusCount = v.filter((c) => c < 0).length;
    return {
      id: `v${i + 1}`,
      label: `v${["₁", "₂", "₃", "₄"][i]}`,
      name: `Classical Vertex v${i + 1}`,
      x: v,
      isClassical: true,
      parity: 1,
      minusCount,
      assignments,
      physicalMeaning:
        i === 0
          ? "All pairs positively correlated. Realized when all 3 spins agree."
          : `Two pairs anti-correlated, one positively correlated. Realized when spin S${
              i === 1 ? "3" : i === 2 ? "1" : "2"
            } is opposite to the other two.`,
      oppositeCornerId: `c${i + 1}`,
    };
  });

  // Dual corners are the antipodes: c_k = -v_k
  // They have odd parity: x1*x2*x3 = -1
  const duals: CubeCorner[] = classicalVertices.map((v, i) => {
    const opp: V3 = [-v[0], -v[1], -v[2]];
    const minusCount = opp.filter((c) => c < 0).length;
    const name =
      i === 0
        ? "c₁: Anti-Cycle (Frustrated Ground State)"
        : `c${i + 1}: Frustrated Parity Corner`;
    const physicalMeaning =
      i === 0
        ? "Total anti-correlation (-1, -1, -1). Requires S1≠S2, S2≠S3, S3≠S1 on an odd 3-cycle: topological frustration. Maximally violates classical facet F1."
        : `Odd parity corner (${opp.map((c) => (c > 0 ? "+1" : "-1")).join(", ")}). Exactly 1 anti-correlation product. Topologically forbidden because (S1S2)(S2S3)(S3S1) = +1 in classical mechanics. Maximally violates classical facet F${i + 1}.`;

    return {
      id: `c${i + 1}`,
      label: `c${["₁", "₂", "₃", "₄"][i]}`,
      name,
      x: opp,
      isClassical: false,
      parity: -1,
      minusCount,
      assignments: [],
      physicalMeaning,
      oppositeCornerId: `v${i + 1}`,
    };
  });

  return [...classical, ...duals];
}

export interface OddInequality {
  id: string; // "O1".."O4"
  label: string; // "O₁".."O₄"
  name: string;
  n: V3; // normal vector (oriented so n·x ≥ rhs holds on the dual tetrahedron)
  rhs: number; // -1
  minusCount: number; // count of -1 in n (1 or 3)
  tex: string; // e.g. "-x_1 - x_2 - x_3 \ge -1"
  dualTex: string; // equivalent e.g. "x_1 + x_2 + x_3 \le 1"
  corrTex: string; // in correlator notation
  onDual: number[]; // indices of dual corners lying on this supporting plane
  oppositeDual: number; // index of dual corner in strict interior
  violatingClassicalIdx: number; // index of classical vertex v_k that severely violates this inequality
  violatingClassicalCoords: V3;
  violationSlack: number; // slack value at v_k, strictly negative (-2.0)
  reason: string;
}

/**
 * Computes the 4 odd-parity inequalities.
 * These are the facet inequalities of the dual/frustrated tetrahedron T_odd.
 * Each has an ODD number of minus signs (1 or 3), and each is VIOLATED by a classical vertex.
 */
export function computeOddInequalities(classicalVertices: V3[]): OddInequality[] {
  const lbl = ["\\langle S_1S_2\\rangle", "\\langle S_2S_3\\rangle", "\\langle S_3S_1\\rangle"];

  return classicalVertices.map((v, i) => {
    // Normal is c_i = -v_i
    const n: V3 = [-v[0], -v[1], -v[2]];
    const rhs = -1;
    const minusCount = n.filter((c) => c < 0).length;

    // Term formatter: e.g. -x_1 - x_2 - x_3 >= -1
    const term = (c: number, s: string) =>
      `${c > 0 ? "+" : "-"}${Math.abs(c) === 1 ? "" : Math.abs(c)}${s}`;
    const tex = `${term(n[0], "x_1")} ${term(n[1], "x_2")} ${term(n[2], "x_3")} \\;\\ge\\; ${rhs}`;

    // Dual form by multiplying by -1: e.g. x_1 + x_2 + x_3 <= 1
    const dualTerms = n
      .map((c, idx) => `${-c > 0 ? "+" : "-"}${Math.abs(c) === 1 ? "" : Math.abs(c)}x_${idx + 1}`)
      .join(" ")
      .replace(/^\+/, "");
    const dualTex = `${dualTerms} \\;\\le\\; ${-rhs}`;

    const corrTerms = n
      .map((c, idx) => `${c > 0 ? "+" : "-"}${lbl[idx]}`)
      .join(" ")
      .replace(/^\+/, "");
    const corrTex = `${corrTerms} \\;\\ge\\; ${rhs}`;

    // The classical vertex that violates it is v_i (since n = -v_i, n·v_i = -3 < -1)
    const violatingSlack = dot(n, v) - rhs; // -3 - (-1) = -2

    // Dual corners: c_k = -v_k
    // For j != i, n · c_j = (-v_i) · (-v_j) = v_i · v_j = -1 = rhs (lies on plane)
    // For j == i, n · c_i = (-v_i) · (-v_i) = 3 > -1 (opposite interior)
    const onDual = [0, 1, 2, 3].filter((k) => k !== i);

    const reason =
      minusCount === 3
        ? "Three minus signs: requires sum of pairwise correlations ≤ 1. The classical ferromagnet v₁=(1,1,1) reaches 3, violating this bound by 2.0."
        : `One minus sign on x${n.findIndex((c) => c < 0) + 1}: requires two positive correlations minus one to be ≤ 1. Classical vertex v${i + 1} reaches sum 3, violating this bound by 2.0.`;

    return {
      id: `O${i + 1}`,
      label: `O${["₁", "₂", "₃", "₄"][i]}`,
      name: `Odd-Parity Inequality O${i + 1} (${minusCount} minus sign${minusCount > 1 ? "s" : ""})`,
      n,
      rhs,
      minusCount,
      tex,
      dualTex,
      corrTex,
      onDual,
      oppositeDual: i,
      violatingClassicalIdx: i,
      violatingClassicalCoords: v,
      violationSlack: violatingSlack,
      reason,
    };
  });
}

export function slackOdd(o: OddInequality, x: V3): number {
  return dot(o.n, x) - o.rhs;
}

export function insideDualPolytope(odds: OddInequality[], x: V3, tol = 1e-9): boolean {
  return odds.every((o) => slackOdd(o, x) >= -tol);
}

export type PolytopeRegion =
  | "classical_only"
  | "dual_only"
  | "octahedron_core"
  | "in_cube_non_convex"
  | "outside_cube";

export function classifyPointRegion(
  facets: Facet[],
  odds: OddInequality[],
  x: V3,
  tol = 1e-9
): {
  region: PolytopeRegion;
  inClassical: boolean;
  inDual: boolean;
  inCube: boolean;
  label: string;
  badgeColor: string;
} {
  const inClassical = insidePolytope(facets, x, tol);
  const inDual = insideDualPolytope(odds, x, tol);
  const inCube = x.every((coord) => Math.abs(coord) <= 1 + tol);

  if (inClassical && inDual) {
    return {
      region: "octahedron_core",
      inClassical: true,
      inDual: true,
      inCube: true,
      label: "Octahedral Core (T_even ∩ T_odd)",
      badgeColor: "#6fdcf7",
    };
  }

  if (inClassical) {
    return {
      region: "classical_only",
      inClassical: true,
      inDual: false,
      inCube: true,
      label: "Classical Polytope (T_even)",
      badgeColor: "#7CFFB2",
    };
  }

  if (inDual) {
    return {
      region: "dual_only",
      inClassical: false,
      inDual: true,
      inCube: true,
      label: "Dual Frustrated Polytope (T_odd)",
      badgeColor: "#fb5c7a",
    };
  }

  if (inCube) {
    return {
      region: "in_cube_non_convex",
      inClassical: false,
      inDual: false,
      inCube: true,
      label: "Within Correlation Cube [-1, 1]³ (Outside Both Tetrahedra)",
      badgeColor: "#e8b45c",
    };
  }

  return {
    region: "outside_cube",
    inClassical: false,
    inDual: false,
    inCube: false,
    label: "Exterior (Beyond No-Signaling Box)",
    badgeColor: "#a78bfa",
  };
}
