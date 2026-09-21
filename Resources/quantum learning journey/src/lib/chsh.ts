/* ==================================================================
   CHSH — local realism, Tsirelson, SOS certificate, PR boxes
   ------------------------------------------------------------------
   Real 2-qubit algebra: observables live in the x–z plane so every
   matrix is real symmetric and we can verify all operator identities
   numerically at render time.
   ================================================================== */

export type Mat = number[][];

export const LOCAL_BOUND = 2;
export const TSIRELSON = 2 * Math.SQRT2; // 2√2 ≈ 2.8284271
export const PR_BOUND = 4;

/* ---------------- tiny real linear algebra ---------------- */

export const I2: Mat = [[1, 0], [0, 1]];
export const SZ: Mat = [[1, 0], [0, -1]];
export const SX: Mat = [[0, 1], [1, 0]];

export function idn(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}
export function mul(A: Mat, B: Mat): Mat {
  const n = A.length, m = B[0].length, k = B.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => {
      let s = 0;
      for (let t = 0; t < k; t++) s += A[i][t] * B[t][j];
      return s;
    })
  );
}
export function add(A: Mat, B: Mat): Mat { return A.map((r, i) => r.map((v, j) => v + B[i][j])); }
export function sub(A: Mat, B: Mat): Mat { return A.map((r, i) => r.map((v, j) => v - B[i][j])); }
export function scale(A: Mat, s: number): Mat { return A.map((r) => r.map((v) => v * s)); }
export function comm(A: Mat, B: Mat): Mat { return sub(mul(A, B), mul(B, A)); }
export function maxAbs(A: Mat): number { return Math.max(...A.flat().map(Math.abs)); }
export function kron(A: Mat, B: Mat): Mat {
  const n = A.length, m = B.length;
  const out: Mat = Array.from({ length: n * m }, () => Array(n * m).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
    for (let k = 0; k < m; k++) for (let l = 0; l < m; l++)
      out[i * m + k][j * m + l] = A[i][j] * B[k][l];
  return out;
}

/** Jacobi eigenvalues of a real symmetric matrix (ascending) */
export function eigSym(M: Mat, iters = 100): number[] {
  const n = M.length;
  const A = M.map((r) => [...r]);
  for (let sweep = 0; sweep < iters; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] * A[i][j];
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-18) continue;
      const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) {
        const akp = A[k][p], akq = A[k][q];
        A[k][p] = c * akp - s * akq;
        A[k][q] = s * akp + c * akq;
      }
      for (let k = 0; k < n; k++) {
        const apk = A[p][k], aqk = A[q][k];
        A[p][k] = c * apk - s * aqk;
        A[q][k] = s * apk + c * aqk;
      }
    }
  }
  return Array.from({ length: n }, (_, i) => A[i][i]).sort((a, b) => a - b);
}

/** operator norm of a real symmetric matrix */
export function opNorm(M: Mat): number {
  return Math.max(...eigSym(M).map(Math.abs));
}

/* ---------------- local hidden variables ---------------- */

export interface LHV {
  idx: number;
  A0: number; A1: number; B0: number; B1: number;
  E: [number, number, number, number]; // E00, E01, E10, E11
  chsh: number;
  /** the two bracket values in C = A0(B0+B1) + A1(B0−B1) */
  sumB: number;
  diffB: number;
}

export function lhvStrategies(): LHV[] {
  const out: LHV[] = [];
  for (let m = 0; m < 16; m++) {
    const A0 = m & 8 ? -1 : 1, A1 = m & 4 ? -1 : 1, B0 = m & 2 ? -1 : 1, B1 = m & 1 ? -1 : 1;
    const E: [number, number, number, number] = [A0 * B0, A0 * B1, A1 * B0, A1 * B1];
    out.push({
      idx: m, A0, A1, B0, B1, E,
      chsh: E[0] + E[1] + E[2] - E[3],
      sumB: B0 + B1,
      diffB: B0 - B1,
    });
  }
  return out;
}

export function lhvHistogram(): { value: number; count: number }[] {
  const map = new Map<number, number>();
  for (const s of lhvStrategies()) map.set(s.chsh, (map.get(s.chsh) ?? 0) + 1);
  return [...map.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => a.value - b.value);
}

/* ---------------- quantum model ---------------- */

export interface Angles { a0: number; a1: number; b0: number; b1: number } // radians

export const OPTIMAL_ANGLES: Angles = {
  a0: 0,
  a1: Math.PI / 2,
  b0: Math.PI / 4,
  b1: -Math.PI / 4,
};

/** observable cos θ σz + sin θ σx (±1 eigenvalues) */
export function obs(theta: number): Mat {
  return [
    [Math.cos(theta), Math.sin(theta)],
    [Math.sin(theta), -Math.cos(theta)],
  ];
}

/** ⟨Φ⁺|obs(a)⊗obs(b)|Φ⁺⟩ = cos(a − b) */
export function corr(a: number, b: number): number {
  return Math.cos(a - b);
}

export function chshValue(g: Angles): number {
  return corr(g.a0, g.b0) + corr(g.a0, g.b1) + corr(g.a1, g.b0) - corr(g.a1, g.b1);
}

export interface Ops { A0: Mat; A1: Mat; B0: Mat; B1: Mat; C: Mat }

export function buildOps(g: Angles): Ops {
  const A0 = kron(obs(g.a0), I2);
  const A1 = kron(obs(g.a1), I2);
  const B0 = kron(I2, obs(g.b0));
  const B1 = kron(I2, obs(g.b1));
  const C = sub(add(add(mul(A0, B0), mul(A0, B1)), mul(A1, B0)), mul(A1, B1));
  return { A0, A1, B0, B1, C };
}

/** verify Ĉ² = 4𝕀 − [A0,A1][B0,B1] */
export function commutatorIdentity(g: Angles) {
  const { A0, A1, B0, B1, C } = buildOps(g);
  const lhs = mul(C, C);
  const cA = comm(A0, A1), cB = comm(B0, B1);
  const rhs = sub(scale(idn(4), 4), mul(cA, cB));
  return {
    residual: maxAbs(sub(lhs, rhs)),
    normCA: opNorm(cA),
    normCB: opNorm(cB),
    normC2: opNorm(lhs),
    bound: 4 + opNorm(cA) * opNorm(cB),
    normC: opNorm(C),
  };
}

/**
 * SOS certificate:
 *   2√2·𝕀 − Ĉ = (1/√2)[ ((A0+A1)/√2 − B0)² + ((A0−A1)/√2 − B1)² ]
 * NOTE: expanding the brackets gives M² + N² = 4𝕀 − √2·Ĉ  (the √2 is
 * essential — dropping it breaks the identity). Multiplying by 1/√2
 * then yields 2√2·𝕀 − Ĉ, as verified numerically below.
 */
export function sosCertificate(g: Angles) {
  const { A0, A1, B0, B1, C } = buildOps(g);
  const M = sub(scale(add(A0, A1), 1 / Math.SQRT2), B0);
  const N = sub(scale(sub(A0, A1), 1 / Math.SQRT2), B1);
  const M2 = mul(M, M), N2 = mul(N, N);
  const sumSquares = add(M2, N2); // = 4𝕀 − √2 Ĉ
  const inner = sub(scale(idn(4), 4), scale(C, Math.SQRT2));
  const lhs = sub(scale(idn(4), TSIRELSON), C);
  const rhs = scale(sumSquares, 1 / Math.SQRT2);
  return {
    M, N, M2, N2,
    innerResidual: maxAbs(sub(sumSquares, inner)), // checks M²+N² = 4𝕀 − √2Ĉ
    residual: maxAbs(sub(lhs, rhs)),
    minEigLHS: eigSym(lhs)[0],
    eigM2: eigSym(M2)[0],
    eigN2: eigSym(N2)[0],
    eigC: eigSym(C),
    saturated: Math.abs(eigSym(lhs)[0]) < 1e-9,
  };
}

/* ---------------- PR box ---------------- */

/** PR box: a ⊕ b = x·y, uniform marginals ⟹ E = +1 except E11 = −1 */
export function prBox() {
  const E: [number, number, number, number] = [1, 1, 1, -1];
  return { E, chsh: E[0] + E[1] + E[2] - E[3] };
}

export function prTable() {
  const rows: { x: number; y: number; rule: string; E: number }[] = [];
  for (const x of [0, 1]) for (const y of [0, 1]) {
    rows.push({ x, y, rule: `a ⊕ b = ${x * y}`, E: x * y === 0 ? 1 : -1 });
  }
  return rows;
}

/* ==================================================================
   THE CHSH 2-D SLICE — where L ⊂ Q ⊂ NS becomes square ⊂ disc ⊂ diamond
   ------------------------------------------------------------------
   Two Bell expressions built from the same four correlators:
     C₁ = E00+E01+E10−E11   (the CHSH operator)
     C₂ = E00+E01−E10+E11   (its sign-flipped partner)
   Deterministic strategies land ONLY on (±2,±2) ⟹ L = square [−2,2]².
   Quantum obeys the Uffink/Tsirelson circle C₁²+C₂² ≤ 8 (radius 2√2).
   No-signaling: C₁±C₂ = 2(E00+E01) resp. 2(E10−E11) ∈ [−4,4]
                 ⟹ |C₁|+|C₂| ≤ 4, a diamond. PR boxes sit at (±4,0),(0,±4).
   The square is inscribed in the circle, the circle inscribed in the
   diamond — all three touch exactly at the four corners (±2,±2).
   ================================================================== */

export type E4 = [number, number, number, number]; // E00, E01, E10, E11

export function c1of(E: E4) { return E[0] + E[1] + E[2] - E[3]; }
export function c2of(E: E4) { return E[0] + E[1] - E[2] + E[3]; }

export const SLICE = {
  localHalf: 2,
  quantumRadius: TSIRELSON, // √8
  nsHalfDiagonal: 4,
};

export type Layer = "local" | "quantum" | "ns" | "outside";

export function sliceLayer(c1: number, c2: number): Layer {
  const eps = 1e-9;
  if (Math.abs(c1) <= 2 + eps && Math.abs(c2) <= 2 + eps) return "local";
  if (c1 * c1 + c2 * c2 <= 8 + eps) return "quantum";
  if (Math.abs(c1) + Math.abs(c2) <= 4 + eps) return "ns";
  return "outside";
}

/** the four deterministic corners of the local square in this slice */
export function sliceLocalCorners(): [number, number][] {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const s of lhvStrategies()) {
    const p: [number, number] = [c1of(s.E), c2of(s.E)];
    const k = p.join(",");
    if (!seen.has(k)) { seen.add(k); out.push(p); }
  }
  return out;
}

/** quantum boundary point at angle t: the circle of radius 2√2 */
export function sliceQuantumPoint(t: number): [number, number] {
  return [TSIRELSON * Math.cos(t), TSIRELSON * Math.sin(t)];
}

/* ---------------- no-signaling box editor ---------------- */

/**
 * A behaviour P(a,b|x,y) stored as p[x][y][a][b] with a,b ∈ {0,1} ≡ {+1,−1}.
 * We expose the four "correlated" probabilities P(a=b) per setting and build
 * the rest from uniform marginals, then CHECK no-signaling explicitly.
 */
export interface Box {
  /** p[x][y] = P(a = b | x,y); the box is defined with uniform marginals */
  agree: [[number, number], [number, number]];
}

export function boxCorrelators(b: Box): E4 {
  // E = P(a=b) − P(a≠b) = 2·P(a=b) − 1
  return [
    2 * b.agree[0][0] - 1,
    2 * b.agree[0][1] - 1,
    2 * b.agree[1][0] - 1,
    2 * b.agree[1][1] - 1,
  ];
}

/** full 4-outcome distribution for setting (x,y) with uniform marginals */
export function boxDistribution(b: Box, x: 0 | 1, y: 0 | 1) {
  const q = b.agree[x][y];
  return { pp: q / 2, mm: q / 2, pm: (1 - q) / 2, mp: (1 - q) / 2 };
}

export function boxChecks(b: Box) {
  const dists = ([0, 1] as const).flatMap((x) =>
    ([0, 1] as const).map((y) => ({ x, y, d: boxDistribution(b, x, y) }))
  );
  const normalized = dists.every(({ d }) => Math.abs(d.pp + d.pm + d.mp + d.mm - 1) < 1e-9);
  const positive = dists.every(({ d }) => Math.min(d.pp, d.pm, d.mp, d.mm) >= -1e-12);
  // marginals: P(a|x) must not depend on y (and vice versa) — uniform by construction
  const marginalsA = ([0, 1] as const).map((x) =>
    ([0, 1] as const).map((y) => {
      const d = boxDistribution(b, x, y);
      return d.pp + d.pm;
    })
  );
  const marginalsB = ([0, 1] as const).map((y) =>
    ([0, 1] as const).map((x) => {
      const d = boxDistribution(b, x, y);
      return d.pp + d.mp;
    })
  );
  const noSignalA = marginalsA.every((r) => Math.abs(r[0] - r[1]) < 1e-9);
  const noSignalB = marginalsB.every((r) => Math.abs(r[0] - r[1]) < 1e-9);
  const E = boxCorrelators(b);
  const c1 = c1of(E);
  return {
    normalized, positive, noSignal: noSignalA && noSignalB,
    marginalsA, marginalsB, E, c1, c2: c2of(E),
    layer: sliceLayer(c1, c2of(E)),
    local: Math.abs(c1) <= 2 + 1e-9,
    quantum: Math.abs(c1) <= TSIRELSON + 1e-9,
  };
}

export const PR_BOX: Box = { agree: [[1, 1], [1, 0]] };
export const CLASSICAL_BOX: Box = { agree: [[1, 1], [1, 1]] };
export const QUANTUM_BOX: Box = {
  agree: [
    [(1 + Math.SQRT1_2) / 2, (1 + Math.SQRT1_2) / 2],
    [(1 + Math.SQRT1_2) / 2, (1 - Math.SQRT1_2) / 2],
  ],
};

/* ==================================================================
   TSIRELSON LABORATORY — four independent windows onto 2√2
   ================================================================== */

export type Vec2 = [number, number];

/** unit vector at polar angle a, measured from the +z (vertical) axis */
export const uvec = (a: number): Vec2 => [Math.sin(a), Math.cos(a)];
export const dot2 = (u: Vec2, v: Vec2) => u[0] * v[0] + u[1] * v[1];
export const add2 = (u: Vec2, v: Vec2): Vec2 => [u[0] + v[0], u[1] + v[1]];
export const sub2 = (u: Vec2, v: Vec2): Vec2 => [u[0] - v[0], u[1] - v[1]];
export const scal2 = (u: Vec2, s: number): Vec2 => [u[0] * s, u[1] * s];
export const norm2 = (u: Vec2) => Math.hypot(u[0], u[1]);

/** lab state: Schmidt angle θ (π/4 = maximally entangled) and visibility p */
export interface LabCfg { g: Angles; theta: number; p: number }

/**
 * E_xy for ρ = p|ψ(θ)⟩⟨ψ(θ)| + (1−p)𝕀/4 with |ψ(θ)⟩ = cosθ|00⟩ + sinθ|11⟩
 * and observables cos α σz + sin α σx:
 *      E = p·( cos α cos β + sin2θ · sin α sin β ).
 * At θ = π/4, p = 1 this is exactly cos(α − β) = â·b̂ (Tsirelson vectors).
 */
export function labCorr(cfg: LabCfg, alpha: number, beta: number): number {
  return cfg.p * (Math.cos(alpha) * Math.cos(beta) + Math.sin(2 * cfg.theta) * Math.sin(alpha) * Math.sin(beta));
}

export function labE(cfg: LabCfg): E4 {
  const { a0, a1, b0, b1 } = cfg.g;
  return [labCorr(cfg, a0, b0), labCorr(cfg, a0, b1), labCorr(cfg, a1, b0), labCorr(cfg, a1, b1)];
}

export function labC(cfg: LabCfg): number {
  return c1of(labE(cfg));
}

/** Horodecki: max CHSH over all angles for this state = 2p√(1+sin²2θ) */
export function horodeckiMax(cfg: LabCfg): number {
  return cfg.p * 2 * Math.sqrt(1 + Math.sin(2 * cfg.theta) ** 2);
}

/** single-party marginals ⟨A_x⟩ = p cos α cos2θ (zero iff maximally entangled) */
export function labMarginalA(cfg: LabCfg, alpha: number) {
  return cfg.p * Math.cos(alpha) * Math.cos(2 * cfg.theta);
}
export function labMarginalB(cfg: LabCfg, beta: number) {
  return cfg.p * Math.cos(beta) * Math.cos(2 * cfg.theta);
}

/* ---------------- Window 1: parallelogram law ---------------- */

export interface Parallelogram {
  a0: Vec2; a1: Vec2; b0: Vec2; b1: Vec2;
  S: Vec2; D: Vec2;
  u: number; v: number;
  invariant: number; // u² + v² ≡ 4 for unit b's
  uPlusV: number;
  C: number; // a0·S + a1·D
  orthogonal: boolean; // b0 ⊥ b1  ⟺  u = v
  aligned0: number; // cos angle between a0 and S
  aligned1: number;
}

export function parallelogram(g: Angles): Parallelogram {
  const a0 = uvec(g.a0), a1 = uvec(g.a1), b0 = uvec(g.b0), b1 = uvec(g.b1);
  const S = add2(b0, b1), D = sub2(b0, b1);
  const u = norm2(S), v = norm2(D);
  return {
    a0, a1, b0, b1, S, D, u, v,
    invariant: u * u + v * v,
    uPlusV: u + v,
    C: dot2(a0, S) + dot2(a1, D),
    orthogonal: Math.abs(dot2(b0, b1)) < 1e-9,
    aligned0: u < 1e-9 ? 0 : dot2(a0, S) / u,
    aligned1: v < 1e-9 ? 0 : dot2(a1, D) / v,
  };
}

/* ---------------- Window 2: SOS residual defect ---------------- */

export interface SOSDefect {
  a: number;            // ⟨½{A₀,A₁}⟩ = cos(α₀−α₁)
  b: number;            // ⟨½{B₀,B₁}⟩ = cos(β₀−β₁)
  n0: number;           // ‖R₀|ψ⟩‖²  = 2 + a − √2(E₀₀+E₁₀)
  n1: number;           // ‖R₁|ψ⟩‖²  = 2 − a − √2(E₀₁−E₁₁)
  defect: number;       // (n0+n1)/√2
  gap: number;          // 2√2 − C  (must equal defect, for ANY state)
  residual: number;     // |defect − gap|
  r0: Vec2; r1: Vec2;   // geometric gap vectors (exact when θ=π/4, p=1)
  m0: Vec2; m1: Vec2;   // (a₀±a₁)/√2
  vectorExact: boolean;
}

export function sosDefect(cfg: LabCfg): SOSDefect {
  const { g } = cfg;
  const E = labE(cfg);
  const a = Math.cos(g.a0 - g.a1);
  const b = Math.cos(g.b0 - g.b1);
  const n0 = 2 + a - Math.SQRT2 * (E[0] + E[2]);
  const n1 = 2 - a - Math.SQRT2 * (E[1] - E[3]);
  const defect = (n0 + n1) / Math.SQRT2;
  const gap = TSIRELSON - c1of(E);
  const a0 = uvec(g.a0), a1 = uvec(g.a1);
  const m0 = scal2(add2(a0, a1), 1 / Math.SQRT2);
  const m1 = scal2(sub2(a0, a1), 1 / Math.SQRT2);
  return {
    a, b, n0, n1, defect, gap,
    residual: Math.abs(defect - gap),
    m0, m1,
    r0: sub2(m0, uvec(g.b0)),
    r1: sub2(m1, uvec(g.b1)),
    vectorExact: Math.abs(cfg.theta - Math.PI / 4) < 1e-9 && Math.abs(cfg.p - 1) < 1e-9,
  };
}

/* ---------------- Window 3: the quantum elliptope slice ----------------
   Symmetric slice  x = E₀₀ = E₀₁ = E₁₀ ,  y = E₁₁ ,  C = 3x − y.
   Classical facets here:  |3x − y| ≤ 2  and  |x + y| ≤ 2.
   Cirel'son criterion 3·arcsin x − arcsin y = π gives
        y = sin(3·arcsin x − π) = −sin(3 arcsin x) = 4x³ − 3x,
   valid for x ∈ [1/2, 1].  Its slope at x = 1/√2 is 12x²−3 = 3, exactly the
   slope of the witness line 3x − y = C ⟹ tangency at (1/√2, −1/√2), C = 2√2.
----------------------------------------------------------------------- */

export const elliptopeQ = (x: number) => 4 * x * x * x - 3 * x;
export const elliptopeL = (x: number) => 3 * x - 2;
export const elliptopeQSlope = (x: number) => 12 * x * x - 3;

/** Cirel'son's analytic membership test — ≤ π means quantum-realizable */
export function cirelsonCriterion(E: E4) {
  const cl = (t: number) => Math.asin(Math.max(-1, Math.min(1, t)));
  const val = cl(E[0]) + cl(E[1]) + cl(E[2]) - cl(E[3]);
  return { value: val, ok: Math.abs(val) <= Math.PI + 1e-9, limit: Math.PI };
}

/* ---------------- Window 4: NPA level-1 moment matrix ---------------- */

export interface Moment {
  G: Mat;             // 5×5 Gram matrix over {𝕀, A₀, A₁, B₀, B₁}
  eig: number[];
  lambdaMin: number;
  psd: boolean;
  E: E4;
  a: number; b: number;
  /** closed form for the symmetric case: λ = 1 ± √2·E */
  predicted: [number, number] | null;
}

export function momentMatrix(cfg: LabCfg): Moment {
  const E = labE(cfg);
  const { g } = cfg;
  const a = Math.cos(g.a0 - g.a1);
  const b = Math.cos(g.b0 - g.b1);
  const mA0 = labMarginalA(cfg, g.a0), mA1 = labMarginalA(cfg, g.a1);
  const mB0 = labMarginalB(cfg, g.b0), mB1 = labMarginalB(cfg, g.b1);
  const G: Mat = [
    [1,   mA0,  mA1,  mB0,  mB1],
    [mA0, 1,    a,    E[0], E[1]],
    [mA1, a,    1,    E[2], E[3]],
    [mB0, E[0], E[2], 1,    b],
    [mB1, E[1], E[3], b,    1],
  ];
  const eig = eigSym(G);
  const sym = Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9 &&
    Math.abs(E[0] - E[1]) < 1e-9 && Math.abs(E[0] - E[2]) < 1e-9 && Math.abs(E[0] + E[3]) < 1e-9;
  return {
    G, eig, lambdaMin: eig[0], psd: eig[0] >= -1e-9, E, a, b,
    predicted: sym ? [1 - Math.SQRT2 * E[0], 1 + Math.SQRT2 * E[0]] : null,
  };
}

/** the idealized symmetric Gram matrix used for the E-sweep */
export function symMoment(E: number): { G: Mat; eig: number[]; lambdaMin: number; C: number } {
  const G: Mat = [
    [1, 0, E, E],
    [0, 1, E, -E],
    [E, E, 1, 0],
    [E, -E, 0, 1],
  ];
  const eig = eigSym(G);
  return { G, eig, lambdaMin: eig[0], C: 4 * E };
}

/** signaling audit — must be identically zero in this model */
export function signalingAudit(cfg: LabCfg) {
  const { g } = cfg;
  // P(a=+1|x, y) depends only on x by construction ⟹ Δ = 0
  const dA = Math.max(
    Math.abs(labMarginalA(cfg, g.a0) - labMarginalA(cfg, g.a0)),
    Math.abs(labMarginalA(cfg, g.a1) - labMarginalA(cfg, g.a1))
  );
  const dB = Math.max(
    Math.abs(labMarginalB(cfg, g.b0) - labMarginalB(cfg, g.b0)),
    Math.abs(labMarginalB(cfg, g.b1) - labMarginalB(cfg, g.b1))
  );
  return { dA, dB, ok: dA < 1e-12 && dB < 1e-12 };
}

/** is a correlation vector no-signaling-consistent and how strong is it? */
export function classifyCHSH(v: number): "local" | "quantum" | "postquantum" | "impossible" {
  const a = Math.abs(v);
  if (a <= LOCAL_BOUND + 1e-9) return "local";
  if (a <= TSIRELSON + 1e-9) return "quantum";
  if (a <= PR_BOUND + 1e-9) return "postquantum";
  return "impossible";
}
