/* ==================================================================
   KCBS playground mathematics — symmetric cone umbrellas {N, p}

   Place N unit vectors at constant latitude h around ẑ, separated in
   azimuth by the star pitch Δ = 2πp/N (gcd(p,N) = 1 ⟹ the visited
   polygon is the star {N/p}, and the orthogonality graph is provably
   exactly the cycle C_N — see extraEdgeCheck()).
   ================================================================== */

export const SQRT5 = Math.sqrt(5);

/* ---------- legacy constants (N = 5 KCBS) ---------- */
export const N5 = 5;
export const H2 = 1 / SQRT5;
export const H = Math.sqrt(H2); // 5^(−1/4) ≈ 0.6687403
export const R = Math.sqrt(1 - H2);
export const COS_STAR = -(SQRT5 + 1) / 4; // cos(4π/5)
export const CLASSICAL_SUM = -3;
export const CLASSICAL_AVG = -0.6;
export const QUANTUM_SUM = 5 - 4 * SQRT5; // ≈ −3.9442719
export const QUANTUM_AVG = 1 - 4 / SQRT5; // ≈ −0.7888544
export const LOVASZ_C5 = SQRT5;
export const ALPHA_C5 = 2;

export type Vec3 = [number, number, number];

/* ---------------- generic cone umbrella arithmetic ---------------- */

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export interface ConeSpec {
  N: number;
  p: number;
  /** relative azimuth Δ = 2πp/N between contexts (i, i+1) */
  delta: number;
  deltaDeg: number;
  /** χ = π − Δ = π(N−2p)/N, the polar "deficit" angle */
  chi: number;
  /** h² = cos χ / (1 + cos χ) — forced by ⟨vᵢ|vᵢ₊₁⟩ = 0 */
  h2: number;
  h: number;
  r2: number;
  r: number;
  /** acos(h) — half-opening angle of the cone */
  halfAngleDeg: number;
  feasible: boolean;
}

/** cos(2πp/N) < 0  ⇔  N/4 < p < N/2 (for p ≤ N/2) */
export function validSteps(N: number): number[] {
  const out: number[] = [];
  for (let p = 1; p <= Math.floor(N / 2); p++) {
    if (gcd(p, N) !== 1) continue;
    if (Math.cos((2 * Math.PI * p) / N) < -1e-12) out.push(p);
  }
  return out;
}

export function coneSpec(N: number, p: number): ConeSpec {
  const delta = (2 * Math.PI * p) / N;
  const c = Math.cos(delta); // negative for feasible cones
  const h2 = c / (c - 1); // = cos(χ)/(1+cos(χ)), χ = π − Δ
  const h = Math.sqrt(Math.max(0, h2));
  const r2 = 1 - h2;
  return {
    N, p,
    delta,
    deltaDeg: (360 * p) / N,
    chi: Math.PI - delta,
    h2, h,
    r2,
    r: Math.sqrt(Math.max(0, r2)),
    halfAngleDeg: (Math.acos(Math.min(1, h)) * 180) / Math.PI,
    feasible: validSteps(N).includes(p),
  };
}

/** v_i at star pitch: azimuth θᵢ = i·2πp/N, i ∈ 0..N−1 */
export function coneVectors(spec: ConeSpec): Vec3[] {
  const { N, r, h, delta } = spec;
  return Array.from({ length: N }, (_, i) => [
    r * Math.cos(i * delta),
    r * Math.sin(i * delta),
    h,
  ]);
}

/** dot(v_i, v_j) = (1−h²)·cos(Δ(i−j)) + h²  (circulant) */
export function gramMatrix(vs: Vec3[]): number[][] {
  return vs.map((a) => vs.map((b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
}

/**
 * Orthogonality-graph certificate: with gcd(p,N)=1 the only exact
 * off-diagonal zeros of the Gram matrix are the cycle edges (i, i±1).
 * Returns true when the graph is exactly C_N. (Analytic reason:
 * cos(Δk) = cos(Δ)  ⟺  k ≡ ±1 mod N when gcd(p,N)=1.)
 */
export function orthGraphIsCycle(gram: number[][]): boolean {
  const N = gram.length;
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      const zero = Math.abs(gram[i][j]) < 1e-9;
      const cyc = (i + 1) % N === j || (j + 1) % N === i;
      if (zero !== cyc) return false;
    }
  return true;
}

/** Gram/frame spectrum — closed form: {Nh², Nr²/2, Nr²/2, 0,…,0} */
export function gramSpectrum(spec: ConeSpec): [number, number, number] {
  return [spec.N * spec.h2, (spec.N * spec.r2) / 2, (spec.N * spec.r2) / 2];
}

/* ---------------- real 3×3 operator algebra (live matrices) ---------- */

export type Mat3 = number[][];

export const I3: Mat3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/** P = |v⟩⟨v| */
export function projector(v: Vec3): Mat3 {
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => v[i] * v[j]));
}

/** Ŝ = 2|v⟩⟨v| − 𝕀 — reflection across the ray */
export function reflection(v: Vec3): Mat3 {
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => 2 * v[i] * v[j] - (i === j ? 1 : 0)));
}

export function matMul(A: Mat3, B: Mat3): Mat3 {
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]));
}

export function matScale(A: Mat3, s: number): Mat3 {
  return A.map((r) => r.map((x) => x * s));
}

export function matAdd(A: Mat3, B: Mat3): Mat3 {
  return A.map((r, i) => r.map((x, j) => x + B[i][j]));
}

export function matSub(A: Mat3, B: Mat3): Mat3 {
  return A.map((r, i) => r.map((x, j) => x - B[i][j]));
}

export function maxAbs(A: Mat3): number {
  return Math.max(...A.flat().map(Math.abs));
}

/** ⟨ψ|M|ψ⟩ for a real unit vector ψ */
export function expectation(M: Mat3, psi: Vec3): number {
  let s = 0;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += psi[i] * M[i][j] * psi[j];
  return s;
}

/* ---------------- N = 5 derivation helpers (live in h) --------------- */

/** the KCBS ray at index i for an ARBITRARY height h (pitch 4π/5) */
export function ray5(i: number, h: number): Vec3 {
  const r = Math.sqrt(Math.max(0, 1 - h * h));
  const a = (4 * Math.PI * i) / 5;
  return [r * Math.cos(a), r * Math.sin(a), h];
}

/** f(h) = ⟨vᵢ|vᵢ₊₁⟩ = (1−h²)cos(4π/5) + h² — the root is the construction */
export function orthResidual(h: number): number {
  return (1 - h * h) * COS_STAR + h * h;
}

/** golden ratio φ = (1+√5)/2 ; cos(π/5) = φ/2 */
export const PHI = (1 + SQRT5) / 2;

/**
 * EXACT ⟨ψ|ŜᵢŜᵢ₊₁|ψ⟩ for ψ = ẑ at arbitrary h (no orthogonality assumed):
 *   = 1 − 4h² + 4h²·⟨vᵢ|vᵢ₊₁⟩.
 * Collapses to the textbook 1 − 4h² only at the root h = 5^(−1/4).
 */
export function edgeExpect5(h: number): number {
  return 1 - 4 * h * h + 4 * h * h * orthResidual(h);
}

/* ==================================================================
   WINDING ANALYSIS — why Δφ = 4π/5 and never 2π/5
   ------------------------------------------------------------------
   Put N unit vectors on a cone of height h. Two of them separated in
   azimuth by Δφ have overlap

        ⟨v_a|v_b⟩ = r²·cos(Δφ) + h²,     r² = 1 − h².

   Orthogonality demands cos(Δφ) = −h²/r² ≤ 0, i.e. Δφ MUST be obtuse.
   Solving (1−h²)cos Δφ + h² = 0 for the height gives

        h² = cos Δφ / (cos Δφ − 1),

   which is positive only when cos Δφ < 0. A pentagon step (72°) returns
   a negative h² — the construction fails at every real height.
   ================================================================== */

/** required squared height for a given neighbour separation */
export function requiredH2(cosDelta: number): number {
  return cosDelta / (cosDelta - 1);
}

/** f(h) = (1−h²)·cos Δφ + h² — the overlap whose root we hunt */
export function overlapAt(h: number, cosDelta: number): number {
  return (1 - h * h) * cosDelta + h * h;
}

export interface WindingInfo {
  N: number;
  /** winding number k (the playground calls it the star pitch p) */
  k: number;
  deltaRad: number;
  deltaDeg: number;
  cos: number;
  /** total azimuth swept closing the cycle = N·Δφ = 2πk */
  totalDeg: number;
  turns: number;
  obtuse: boolean;
  coprime: boolean;
  /** h² from the orthogonality condition — negative ⇒ impossible */
  h2: number;
  h: number | null;
  feasible: boolean;
  reason: string;
  /** the order in which the cycle visits the fixed vertex positions */
  visitOrder: number[];
  /** {N/k} reduces to this equivalent pitch (k and N−k give equal cosines) */
  mirror: number;
}

export function windingInfo(N: number, k: number): WindingInfo {
  const deltaRad = (2 * Math.PI * k) / N;
  const cos = Math.cos(deltaRad);
  const obtuse = cos < -1e-12;
  const coprime = gcd(k, N) === 1;
  const h2 = requiredH2(cos);
  const feasible = obtuse && coprime;

  const visitOrder: number[] = [];
  for (let i = 0; i <= N; i++) visitOrder.push((i * k) % N);

  let reason: string;
  if (!coprime) {
    reason = `gcd(${k}, ${N}) = ${gcd(k, N)} — the walk closes early and revisits only ${N / gcd(k, N)} of the ${N} rays.`;
  } else if (!obtuse) {
    reason =
      Math.abs(cos) < 1e-12
        ? "Δφ = 90° exactly — then h² = 0 and all rays collapse into the equator plane."
        : `cos Δφ = +${cos.toFixed(5)} > 0 — both terms of r²cosΔφ + h² are positive, so the overlap can never reach zero.`;
  } else {
    reason = `cos Δφ = ${cos.toFixed(5)} < 0 — the horizontal overlap is negative and can cancel the vertical h².`;
  }

  return {
    N, k, deltaRad,
    deltaDeg: (360 * k) / N,
    cos,
    totalDeg: 360 * k,
    turns: k,
    obtuse, coprime, h2,
    h: h2 > 0 ? Math.sqrt(h2) : null,
    feasible, reason, visitOrder,
    mirror: N - k,
  };
}

/** every distinct wiring of an N-cycle (k and N−k are mirror images) */
export function allWindings(N: number): WindingInfo[] {
  return Array.from({ length: Math.max(1, Math.floor(N / 2)) }, (_, i) => windingInfo(N, i + 1));
}

/** exact closed forms for the pentagon family — resolves sign confusion */
export const PENTAGON_COSINES: { deg: number; tex: string; value: number; note: string }[] = [
  { deg: 36, tex: "\\cos 36^\\circ = \\tfrac{1+\\sqrt5}{4} = \\tfrac{\\varphi}{2}", value: (1 + SQRT5) / 4, note: "half the golden ratio" },
  { deg: 72, tex: "\\cos 72^\\circ = \\tfrac{\\sqrt5-1}{4} = \\tfrac{1}{2\\varphi}", value: (SQRT5 - 1) / 4, note: "pentagon step — POSITIVE" },
  { deg: 108, tex: "\\cos 108^\\circ = -\\tfrac{\\sqrt5-1}{4}", value: -(SQRT5 - 1) / 4, note: "≈ −0.309 — often misquoted as cos144°" },
  { deg: 144, tex: "\\cos 144^\\circ = -\\tfrac{1+\\sqrt5}{4} = -\\tfrac{\\varphi}{2}", value: -(1 + SQRT5) / 4, note: "pentagram step — NEGATIVE" },
];

/* ---------------- probe state, probabilities, witnesses -------------- */

export function psiFromAngles(thetaDeg: number, phiDeg: number): Vec3 {
  const t = (thetaDeg * Math.PI) / 180;
  const f = (phiDeg * Math.PI) / 180;
  return [Math.sin(t) * Math.cos(f), Math.sin(t) * Math.sin(f), Math.cos(t)];
}

/**
 * p_i = |⟨ψ|vᵢ⟩|²  (real qutrit vectors → real overlaps).
 * These are the KCBS "events" P(Ŝᵢ = +1); adjacent events are exactly
 * exclusive because vᵢ ⊥ vᵢ₊₁.
 */
export function projProbs(vs: Vec3[], psi: Vec3): number[] {
  return vs.map((v) => {
    const d = v[0] * psi[0] + v[1] * psi[1] + v[2] * psi[2];
    return d * d;
  });
}

export interface CorrStats {
  P: number[]; // event probs per vertex
  m: number[]; // marginals ⟨Ŝᵢ⟩ = 2pᵢ − 1
  e: number[]; // edge correlations ⟨ŜᵢŜᵢ₊₁⟩ = 1 − 2pᵢ − 2pᵢ₊₁ (orthogonality)
  sumP: number; // Σpᵢ — the exclusivity witness
  sumE: number; // Σ⟨ŜᵢŜᵢ₊₁⟩ = N − 4Σpᵢ — the KCBS spin witness
}

/**
 * Exact operator algebra for ANY configuration (no orthogonality assumed):
 *   ⟨ψ|ŜᵢŜⱼ|ψ⟩ = 4·⟨vᵢ|vⱼ⟩·(ψ·vᵢ)(ψ·vⱼ) − 2pᵢ − 2pⱼ + 1.
 * When vᵢ ⊥ vⱼ the cross-term vanishes and e = 1 − 2pᵢ − 2pⱼ exactly.
 * The KCBS inequality only applies when the cross-terms are zero.
 */
export function corrStats(vs: Vec3[], psi: Vec3): CorrStats {
  const N = vs.length;
  const d = vs.map((v) => v[0] * psi[0] + v[1] * psi[1] + v[2] * psi[2]);
  const P = d.map((x) => x * x);
  const m = P.map((q) => 2 * q - 1);
  const e = P.map((q, i) => {
    const j = (i + 1) % N;
    const g = vs[i][0] * vs[j][0] + vs[i][1] * vs[j][1] + vs[i][2] * vs[j][2];
    return 1 - 2 * q - 2 * P[j] + 4 * g * d[i] * d[j];
  });
  return { P, m, e, sumP: P.reduce((a, b) => a + b, 0), sumE: e.reduce((a, b) => a + b, 0) };
}

/* ---------------- the three bounds (convex-set theory) --------------- */

/** classical (STAB) bound for Σpᵢ on the cycle C_N */
export function alphaBound(N: number): number {
  return N % 2 === 1 ? (N - 1) / 2 : N / 2;
}

/** Lovász theta of C_N — quantum (theta-body) ceiling for Σpᵢ */
export function lovaszBound(N: number): number {
  if (N % 2 === 0) return N / 2;
  const c = Math.cos(Math.PI / N);
  return (N * c) / (1 + c);
}

/** fractional-packing (no-signaling / E1) ceiling for Σpᵢ */
export function fracBound(N: number): number {
  return N / 2;
}

/** non-contextual bound for the spin witness Σ⟨ŜᵢŜᵢ₊₁⟩ ≥ N − 4α */
export function corrClassicalBound(N: number): number {
  return N - 4 * alphaBound(N);
}

/** optimal probe direction (degrees): ẑ when h² ≥ r²/2, else equatorial */
export function optimalPsiDeg(spec: ConeSpec): { theta: number; phi: number } {
  return spec.h2 >= spec.r2 / 2 ? { theta: 0, phi: 0 } : { theta: 90, phi: 0 };
}

/** best achievable Σpᵢ on THIS cone with the optimal state */
export function bestSumP(spec: ConeSpec): number {
  return Math.max(spec.N * spec.h2, (spec.N * spec.r2) / 2);
}

/* ---------------- exact symbolic h² for notable cones ---------------- */

export function h2Symbolic(N: number, p: number): { tex: string; plain: string } {
  const key = `${N},${p}`;
  const table: Record<string, { tex: string; plain: string }> = {
    "3,1": { tex: "\\tfrac{1}{3}", plain: "1/3" },
    "5,2": { tex: "\\tfrac{1}{\\sqrt5}", plain: "1/√5" },
    "8,3": { tex: "\\sqrt2 - 1", plain: "√2 − 1" },
    "10,3": { tex: "\\sqrt5 - 2", plain: "√5 − 2" },
    "12,5": { tex: "2\\sqrt3 - 3", plain: "2√3 − 3" },
  };
  if (table[key]) return table[key];
  const k = N - 2 * p;
  return {
    tex: `\\dfrac{\\cos(${k === 1 ? "" : k}\\pi/${N})}{1 + \\cos(${k === 1 ? "" : k}\\pi/${N})}`,
    plain: `cos(${k}π/${N})/(1+cos(${k}π/${N}))`,
  };
}

/* ---------------- full sweep: which cones witness contextuality ------- */

export interface SweepRow {
  N: number;
  bestP: number | null;
  best: ConeSpec | null;
  steps: number[];
  sumPStar: number | null;
  alpha: number;
  lovasz: number;
  gap: number | null; // sumPStar − α (event picture); >0 ⟹ violation
  optimal: boolean; // does the best cone attain Lovász exactly?
  parity: "odd" | "even";
}

export function sweepTable(Nmin = 3, Nmax = 12): SweepRow[] {
  const rows: SweepRow[] = [];
  for (let N = Nmin; N <= Nmax; N++) {
    const steps = validSteps(N);
    const alpha = alphaBound(N);
    const lovasz = lovaszBound(N);
    if (steps.length === 0) {
      rows.push({ N, bestP: null, best: null, steps, sumPStar: null, alpha, lovasz, gap: null, optimal: false, parity: N % 2 ? "odd" : "even" });
      continue;
    }
    let bestP = steps[0];
    let bestVal = -Infinity;
    for (const p of steps) {
      const v = bestSumP(coneSpec(N, p));
      if (v > bestVal) { bestVal = v; bestP = p; }
    }
    const best = coneSpec(N, bestP);
    const gap = bestVal - alpha;
    rows.push({
      N, bestP, best, steps,
      sumPStar: bestVal,
      alpha, lovasz, gap,
      optimal: N % 2 === 1 && bestP === (N - 1) / 2,
      parity: N % 2 ? "odd" : "even",
    });
  }
  return rows;
}

/* ---------------- classical enumeration (N = 5 game, kept) ------------ */

export const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
];

export function assignmentSum(s: number[]): number {
  return EDGES.reduce((acc, [a, b]) => acc + s[a] * s[b], 0);
}

export function classicalHistogram(): { sum: number; count: number }[] {
  const map = new Map<number, number>();
  for (let mask = 0; mask < 32; mask++) {
    const s = Array.from({ length: 5 }, (_, i) => (mask & (1 << i) ? 1 : -1));
    const v = assignmentSum(s);
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()].map(([sum, count]) => ({ sum, count })).sort((a, b) => a.sum - b.sum);
}

export const OPTIMAL_ASSIGNMENT = [1, 1, -1, 1, -1];

/* ---------------- formatting ---------------- */

export function clamp(x: number, a: number, b: number) {
  return Math.min(b, Math.max(a, x));
}

export function fmt(x: number, digits = 4): string {
  const s = x.toFixed(digits);
  return s.replace("-", "−");
}
