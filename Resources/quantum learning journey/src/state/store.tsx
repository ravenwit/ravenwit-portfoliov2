import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  H, coneSpec, coneVectors, corrStats, psiFromAngles, validSteps, bestSumP,
  alphaBound, lovaszBound, optimalPsiDeg, edgeExpect5, orthResidual, h2Symbolic,
  type ConeSpec, type CorrStats,
} from "../lib/kcbs";

export type PsiMode = "apex" | "optimal" | "custom";
export type ViewId =
  | "console"
  | "winding"
  | "derivation"
  | "playground"
  | "classical"
  | "polytope"
  | "convexity"
  | "chsh"
  | "hierarchy"
  | "theory";

interface Calc {
  /* ---- navigation ---- */
  view: ViewId;
  setView: (v: ViewId) => void;

  /* ---- derivation state ---- */
  h: number;
  setH: (h: number) => void;
  step: number;
  setStep: (s: number | ((s: number) => number)) => void;

  /* ---- playground state ---- */
  N: number;
  setN: (n: number) => void;
  p: number;
  setP: (p: number) => void;
  mode: PsiMode;
  setMode: (m: PsiMode) => void;
  theta: number;
  setTheta: (t: number) => void;
  phi: number;
  setPhi: (f: number) => void;
  edge: number;
  setEdge: (e: number) => void;

  /* ---- derived (recomputed every render) ---- */
  spec: ConeSpec;
  steps: number[];
  angles: { theta: number; phi: number };
  stats: CorrStats;
  alpha: number;
  lovasz: number;
  violating: boolean;
  gap: number;
  snapped: boolean;
  residual: number;
  edgeExp: number;
  sum5: number;
  symbolic: { tex: string; plain: string };

  /* ---- actions ---- */
  solveH: () => void;
  optimizeP: () => void;
  reset: () => void;
  loadCone: (n: number, p: number) => void;
}

const Ctx = createContext<Calc | null>(null);

const KEY = "kcbs.calc.v1";

export function CalcProvider({ children }: { children: ReactNode }) {
  const saved = (() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "null");
    } catch {
      return null;
    }
  })();

  const [view, setView] = useState<ViewId>(saved?.view ?? "console");
  const [h, setH] = useState<number>(saved?.h ?? H);
  const [step, setStep] = useState<number>(saved?.step ?? 0);
  const [N, setNRaw] = useState<number>(saved?.N ?? 5);
  const [p, setP] = useState<number>(saved?.p ?? 2);
  const [mode, setMode] = useState<PsiMode>(saved?.mode ?? "apex");
  const [theta, setTheta] = useState<number>(saved?.theta ?? 25);
  const [phi, setPhi] = useState<number>(saved?.phi ?? 20);
  const [edge, setEdge] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify({ view, h, step, N, p, mode, theta, phi }));
      } catch { /* ignore quota */ }
    }, 250);
    return () => clearTimeout(t);
  }, [view, h, step, N, p, mode, theta, phi]);

  /* keep p legal whenever N changes */
  const setN = (n: number) => {
    const nn = Math.max(3, Math.min(12, n));
    setNRaw(nn);
    const st = validSteps(nn);
    if (st.length && !st.includes(p)) setP(st[st.length - 1]);
  };

  const spec = useMemo(() => coneSpec(N, p), [N, p]);
  const steps = useMemo(() => validSteps(N), [N]);
  const angles = useMemo(() => {
    if (mode === "apex") return { theta: 0, phi: 0 };
    if (mode === "optimal") return optimalPsiDeg(spec);
    return { theta, phi };
  }, [mode, spec, theta, phi]);

  const stats = useMemo(
    () => corrStats(coneVectors(spec), psiFromAngles(angles.theta, angles.phi)),
    [spec, angles]
  );

  const alpha = alphaBound(N);
  const lovasz = lovaszBound(N);
  const violating = spec.feasible && stats.sumP > alpha + 1e-9;

  const value: Calc = {
    view, setView,
    h, setH, step, setStep,
    N, setN, p, setP, mode, setMode, theta, setTheta, phi, setPhi, edge, setEdge,
    spec, steps, angles, stats, alpha, lovasz, violating,
    gap: stats.sumP - alpha,
    snapped: Math.abs(h - H) < 1e-4,
    residual: orthResidual(h),
    edgeExp: edgeExpect5(h),
    sum5: 5 * edgeExpect5(h),
    symbolic: h2Symbolic(N, p),
    solveH: () => setH(H),
    optimizeP: () => {
      const st = validSteps(N);
      if (!st.length) return;
      let bp = st[0], bv = -Infinity;
      for (const q of st) {
        const v = bestSumP(coneSpec(N, q));
        if (v > bv) { bv = v; bp = q; }
      }
      setP(bp);
      setMode("optimal");
    },
    reset: () => { setNRaw(5); setP(2); setMode("apex"); setTheta(25); setPhi(20); setH(H); setStep(0); },
    loadCone: (n, q) => { setNRaw(n); setP(q); setMode("optimal"); },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCalc(): Calc {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCalc must be used inside <CalcProvider>");
  return c;
}
