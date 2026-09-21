import type { ViewId } from "../state/store";
import type { DocSpec } from "./atoms";
import { consoleDoc, windingDoc, derivationDoc, playgroundDoc, classicalDoc } from "./kcbsDocs";
import { polytopeDoc, convexityDoc, hierarchyDoc } from "./convexDocs";
import { tsirelsonDoc } from "./tsirelsonDoc";

/** short label shown on the topbar button, per view */
export const DOC_REGISTRY: Record<ViewId, { label: string; spec: DocSpec }> = {
  console: { label: "overview", spec: consoleDoc },
  winding: { label: "winding", spec: windingDoc },
  derivation: { label: "KCBS", spec: derivationDoc },
  playground: { label: "N-cycles", spec: playgroundDoc },
  classical: { label: "parity", spec: classicalDoc },
  polytope: { label: "polytope", spec: polytopeDoc },
  convexity: { label: "sandwich", spec: convexityDoc },
  chsh: { label: "Tsirelson", spec: tsirelsonDoc },
  hierarchy: { label: "hierarchy", spec: hierarchyDoc },
  theory: { label: "overview", spec: consoleDoc },
};

export type { DocSpec };
