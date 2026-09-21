import { TeX } from "../components/TeX";
import { H, H2, P, M, Note, Step, Tbl, type DocSpec } from "./atoms";

const GOLD = "#e8b45c", CYAN = "#6fdcf7", VIOLET = "#a78bfa", NEON = "#7CFFB2";

export const tsirelsonDoc: DocSpec = {
  title: "Tsirelson's bound — complete derivation",
  subtitle: "FROM FIRST PRINCIPLES · 11 SECTIONS",
  sections: [
  { id: "d0", n: "§0", t: "Scenario and notation" },
  { id: "d1", n: "§1", t: "The local bound |C| ≤ 2" },
  { id: "d2", n: "§2", t: "Quantum kinematics, explicitly" },
  { id: "d3", n: "§3", t: "W1 · Vectors and the parallelogram law" },
  { id: "d4", n: "§4", t: "W2 · Sum-of-squares certificate" },
  { id: "d5", n: "§5", t: "Interlude · the commutator route" },
  { id: "d6", n: "§6", t: "W3 · The quantum elliptope" },
  { id: "d7", n: "§7", t: "W4 · NPA moment matrix" },
  { id: "d8", n: "§8", t: "PR boxes and the hierarchy" },
  { id: "d9", n: "§9", t: "Worked canonical example" },
  { id: "d10", n: "§10", t: "Formula reference for the app" },
  { id: "d11", n: "§11", t: "Errata and references" },
  ],
  footer: [
    ["local", "2", GOLD],
    ["Tsirelson", "2\u221a2 = 2.8284271", CYAN],
    ["PR / algebraic", "4", VIOLET],
    ["optimal E", "1/\u221a2 = 0.7071068", NEON],
  ],
  Body: () => (
<div className="max-w-[820px]">
      {/* ============ 0 ============ */}
      <H id="d0" n="§0">Scenario and notation</H>
      <P>
        Two separated parties. Alice receives an input <TeX>{"x\\in\\{0,1\\}"}</TeX> and returns an
        outcome <TeX>{"a\\in\\{+1,-1\\}"}</TeX>; Bob receives <TeX>{"y\\in\\{0,1\\}"}</TeX> and
        returns <TeX>{"b\\in\\{+1,-1\\}"}</TeX>. Repeating the experiment estimates the four joint
        distributions <TeX>{"P(a,b\\,|\\,x,y)"}</TeX>, from which we keep only the correlators
      </P>
      <M tag="0.1">{"E_{xy} \\;:=\\; \\mathbb{E}[\\,a\\,b\\,|\\,x,y\\,] \\;=\\; \\sum_{a,b\\in\\{\\pm1\\}} a\\,b\\;P(a,b\\,|\\,x,y) \\;\\in\\;[-1,1]."}</M>
      <P>
        The CHSH functional is the particular sign pattern
      </P>
      <M tag="0.2">{"\\mathcal{C} \\;:=\\; E_{00} + E_{01} + E_{10} - E_{11}."}</M>
      <P>
        The lone minus sign is essential: it is what makes the four terms impossible to satisfy
        simultaneously by deterministic values. Any of the eight sign patterns with an odd number
        of minus signs works equally well; they are related by relabelling inputs and outputs.
      </P>
      <Note kind="info" title="WHY CORRELATORS SUFFICE">
        A behaviour <TeX>{"P(a,b|x,y)"}</TeX> with unbiased marginals is completely determined by
        the four numbers <TeX>{"E_{xy}"}</TeX> through{" "}
        <TeX>{"P(a,b|x,y) = \\tfrac14\\big(1 + a\\langle A_x\\rangle + b\\langle B_y\\rangle + ab\\,E_{xy}\\big)"}</TeX>.
        The whole geometry therefore lives in the cube <TeX>{"[-1,1]^4"}</TeX>.
      </Note>

      {/* ============ 1 ============ */}
      <H id="d1" n="§1">The local bound <TeX>{"|\\mathcal{C}| \\le 2"}</TeX></H>
      <P>
        A local hidden-variable (LHV) model postulates a shared random variable{" "}
        <TeX>{"\\lambda"}</TeX> distributed as <TeX>{"q(\\lambda)"}</TeX>, together with response
        functions <TeX>{"A_x(\\lambda), B_y(\\lambda) \\in \\{\\pm1\\}"}</TeX> that do not depend on
        the distant input. Then
      </P>
      <M tag="1.1">{"E_{xy} = \\int d\\lambda\\, q(\\lambda)\\, A_x(\\lambda) B_y(\\lambda)."}</M>
      <P>Fix a single <TeX>{"\\lambda"}</TeX> and factor the four terms pairwise:</P>
      <M tag="1.2">{"\\mathcal{C}(\\lambda) = A_0\\big[B_0 + B_1\\big] + A_1\\big[B_0 - B_1\\big]."}</M>
      <Step n="(i)">
        Because <TeX>{"B_0,B_1\\in\\{\\pm1\\}"}</TeX>, there are only two cases. If{" "}
        <TeX>{"B_0 = B_1"}</TeX> then <TeX>{"B_0+B_1 = \\pm2"}</TeX> and{" "}
        <TeX>{"B_0-B_1 = 0"}</TeX>. If <TeX>{"B_0 \\ne B_1"}</TeX> the roles swap.
      </Step>
      <Step n="(ii)">
        In either case exactly one bracket is <TeX>{"\\pm2"}</TeX> and the other vanishes, so{" "}
        <TeX>{"\\mathcal{C}(\\lambda) = \\pm2\\,A_x(\\lambda)"}</TeX> for one of{" "}
        <TeX>{"x"}</TeX>, hence <TeX>{"|\\mathcal{C}(\\lambda)| = 2"}</TeX> identically.
      </Step>
      <Step n="(iii)">
        Averaging is a convex combination of numbers of modulus 2, so
      </Step>
      <M tag="1.3">{"|\\mathcal{C}| = \\Big|\\int d\\lambda\\, q(\\lambda)\\,\\mathcal{C}(\\lambda)\\Big| \\le \\int d\\lambda\\, q(\\lambda)\\,|\\mathcal{C}(\\lambda)| = 2."}</M>
      <Note kind="key" title="GEOMETRIC READING">
        There are <TeX>{"2^4 = 16"}</TeX> deterministic strategies and each gives{" "}
        <TeX>{"\\mathcal{C} = \\pm2"}</TeX> (8 give <TeX>{"+2"}</TeX>, 8 give <TeX>{"-2"}</TeX>).
        The local set is their convex hull — a polytope — and{" "}
        <TeX>{"\\mathcal{C}\\le 2"}</TeX> is one of its facets. Convexity is why averaging cannot
        help: you can never leave the hull of the extreme points.
      </Note>

      {/* ============ 2 ============ */}
      <H id="d2" n="§2">Quantum kinematics, explicitly</H>
      <H2>Observables</H2>
      <P>
        We restrict all measurements to the <TeX>{"x"}</TeX>–<TeX>{"z"}</TeX> plane of the Bloch
        sphere, which costs no generality for CHSH (by Jordan's lemma the optimum is always
        attained by real, two-dimensional blocks). Define
      </P>
      <M tag="2.1">{"\\hat A(\\alpha) := \\cos\\alpha\\,\\sigma_z + \\sin\\alpha\\,\\sigma_x = \\begin{pmatrix} \\cos\\alpha & \\sin\\alpha \\\\ \\sin\\alpha & -\\cos\\alpha\\end{pmatrix}."}</M>
      <P>
        These are Hermitian and traceless. Using <TeX>{"\\sigma_z^2=\\sigma_x^2=\\mathbb{I}"}</TeX>{" "}
        and <TeX>{"\\{\\sigma_z,\\sigma_x\\}=0"}</TeX>,
      </P>
      <M tag="2.2">{"\\hat A(\\alpha)^2 = \\cos^2\\!\\alpha\\,\\mathbb{I} + \\sin^2\\!\\alpha\\,\\mathbb{I} + \\cos\\alpha\\sin\\alpha\\,\\{\\sigma_z,\\sigma_x\\} = \\mathbb{I},"}</M>
      <P>
        so the spectrum is <TeX>{"\\{+1,-1\\}"}</TeX> exactly as a dichotomic measurement requires.
        We write <TeX>{"\\hat A_x = \\hat A(\\alpha_x)\\otimes\\mathbb{I}"}</TeX> and{" "}
        <TeX>{"\\hat B_y = \\mathbb{I}\\otimes \\hat A(\\beta_y)"}</TeX>; these commute by
        construction, <TeX>{"[\\hat A_x,\\hat B_y]=0"}</TeX>, which is the operational content of
        "separated laboratories".
      </P>

      <H2>State and correlators</H2>
      <P>
        Take the Schmidt-parametrised pure state and its depolarised version,
      </P>
      <M tag="2.3">{"|\\psi(\\theta)\\rangle = \\cos\\theta\\,|00\\rangle + \\sin\\theta\\,|11\\rangle, \\qquad \\rho = p\\,|\\psi\\rangle\\langle\\psi| + (1-p)\\tfrac{\\mathbb{I}}{4}."}</M>
      <P>
        Four elementary expectation values generate everything. Writing{" "}
        <TeX>{"c=\\cos\\theta,\\ s=\\sin\\theta"}</TeX>:
      </P>
      <Tbl
        head={["operator", "action on |ψ⟩", "⟨ψ|·|ψ⟩"]}
        rows={[
          [<TeX>{"\\sigma_z\\otimes\\sigma_z"}</TeX>, <TeX>{"c|00\\rangle + s|11\\rangle"}</TeX>, <TeX>{"c^2+s^2 = 1"}</TeX>],
          [<TeX>{"\\sigma_x\\otimes\\sigma_x"}</TeX>, <TeX>{"c|11\\rangle + s|00\\rangle"}</TeX>, <TeX>{"2cs = \\sin2\\theta"}</TeX>],
          [<TeX>{"\\sigma_z\\otimes\\sigma_x"}</TeX>, <TeX>{"c|01\\rangle - s|10\\rangle"}</TeX>, <TeX>{"0"}</TeX>],
          [<TeX>{"\\sigma_x\\otimes\\sigma_z"}</TeX>, <TeX>{"c|10\\rangle - s|01\\rangle"}</TeX>, <TeX>{"0"}</TeX>],
        ]}
      />
      <P>
        Expanding <TeX>{"\\hat A(\\alpha)\\otimes\\hat A(\\beta)"}</TeX> in this basis and noting
        that the maximally mixed part contributes nothing (<TeX>{"\\mathrm{Tr}\\,\\sigma_i = 0"}</TeX>),
      </P>
      <M tag="2.4">{"\\boxed{\\;E_{xy} = p\\Big(\\cos\\alpha_x\\cos\\beta_y + \\sin2\\theta\\;\\sin\\alpha_x\\sin\\beta_y\\Big)\\;}"}</M>
      <P>and the single-party marginals are</P>
      <M tag="2.5">{"\\langle \\hat A_x\\rangle = p\\,\\cos\\alpha_x\\cos2\\theta, \\qquad \\langle \\hat B_y\\rangle = p\\,\\cos\\beta_y\\cos2\\theta."}</M>
      <Note kind="key" title="THE MAXIMALLY ENTANGLED SPECIALISATION">
        At <TeX>{"\\theta=\\pi/4,\\ p=1"}</TeX> we get <TeX>{"\\sin2\\theta=1"}</TeX> and{" "}
        <TeX>{"\\cos2\\theta = 0"}</TeX>, so (2.4) collapses to the angle-difference law{" "}
        <TeX>{"E_{xy} = \\cos(\\alpha_x-\\beta_y)"}</TeX> and all marginals vanish. This is the
        case in which the quantum correlators literally become Euclidean inner products — the
        subject of §3.
      </Note>
      <P>
        Note also that <TeX>{"E_{xy}"}</TeX> depends on <TeX>{"y"}</TeX> only through{" "}
        <TeX>{"\\beta_y"}</TeX> and the marginal <TeX>{"\\langle\\hat A_x\\rangle"}</TeX> does not
        depend on <TeX>{"y"}</TeX> at all: <strong>no-signalling is structural</strong>, not an
        extra assumption. The app's signalling auditor therefore reads exactly zero always.
      </P>

      {/* ============ 3 ============ */}
      <H id="d3" n="§3">W1 · Vectors and the parallelogram law</H>
      <P>
        Tsirelson's theorem (1980) states that for dichotomic observables on a bipartite state
        there exist real unit vectors <TeX>{"\\vec a_0,\\vec a_1,\\vec b_0,\\vec b_1\\in\\mathbb{R}^d"}</TeX>{" "}
        (and <TeX>{"d\\le4"}</TeX> always suffices) with
      </P>
      <M tag="3.1">{"E_{xy} = \\vec a_x\\cdot\\vec b_y, \\qquad \\|\\vec a_x\\| = \\|\\vec b_y\\| = 1."}</M>
      <P>
        For our planar family the vectors are explicit:{" "}
        <TeX>{"\\vec a_x = (\\sin\\alpha_x,\\cos\\alpha_x)"}</TeX>,{" "}
        <TeX>{"\\vec b_y = (\\sin\\beta_y,\\cos\\beta_y)"}</TeX>, whose inner product is{" "}
        <TeX>{"\\cos(\\alpha_x-\\beta_y)"}</TeX>, matching (2.4) at{" "}
        <TeX>{"\\theta=\\pi/4, p=1"}</TeX>.
      </P>
      <H2>Step 1 — factor the functional</H2>
      <P>By bilinearity of the inner product,</P>
      <M tag="3.2">{"\\mathcal{C} = \\vec a_0\\cdot\\vec b_0 + \\vec a_0\\cdot\\vec b_1 + \\vec a_1\\cdot\\vec b_0 - \\vec a_1\\cdot\\vec b_1 = \\vec a_0\\cdot\\underbrace{(\\vec b_0+\\vec b_1)}_{\\vec S} + \\vec a_1\\cdot\\underbrace{(\\vec b_0-\\vec b_1)}_{\\vec D}."}</M>
      <H2>Step 2 — Cauchy–Schwarz</H2>
      <M tag="3.3">{"\\mathcal{C} \\le \\|\\vec a_0\\|\\,\\|\\vec S\\| + \\|\\vec a_1\\|\\,\\|\\vec D\\| = u + v, \\qquad u:=\\|\\vec S\\|,\\; v:=\\|\\vec D\\|."}</M>
      <H2>Step 3 — the parallelogram law pins u and v</H2>
      <P>
        Expanding the squared norms and cancelling the cross terms,
      </P>
      <M tag="3.4">{"u^2 + v^2 = \\|\\vec b_0+\\vec b_1\\|^2 + \\|\\vec b_0-\\vec b_1\\|^2 = 2\\|\\vec b_0\\|^2 + 2\\|\\vec b_1\\|^2 = 4."}</M>
      <P>
        This is the crucial rigidity: whatever Bob does, the pair{" "}
        <TeX>{"(u,v)"}</TeX> is confined to a quarter circle of radius 2. The cross term{" "}
        <TeX>{"2\\vec b_0\\cdot\\vec b_1"}</TeX> appears with opposite signs in the two norms and
        cancels identically — that is the entire mechanism.
      </P>
      <H2>Step 4 — maximise on the circle</H2>
      <P>
        Apply Cauchy–Schwarz a second time, in <TeX>{"\\mathbb{R}^2"}</TeX>, to{" "}
        <TeX>{"(1,1)\\cdot(u,v)"}</TeX>:
      </P>
      <M tag="3.5">{"(u+v)^2 \\le (1^2+1^2)(u^2+v^2) = 2\\cdot4 = 8 \\quad\\Longrightarrow\\quad \\mathcal{C} \\le u+v \\le 2\\sqrt2."}</M>
      <H2>Equality conditions</H2>
      <P>Tracing back which inequality is tight when gives three simultaneous requirements:</P>
      <Tbl
        head={["from", "condition", "meaning"]}
        rows={[
          ["(3.5)", <TeX>{"u = v = \\sqrt2"}</TeX>, <>⟺ <TeX>{"\\vec b_0\\cdot\\vec b_1 = 0"}</TeX>, Bob's directions orthogonal</>],
          ["(3.3a)", <TeX>{"\\vec a_0 = \\vec S/\\|\\vec S\\|"}</TeX>, <>Alice's first vector bisects</>],
          ["(3.3b)", <TeX>{"\\vec a_1 = \\vec D/\\|\\vec D\\|"}</TeX>, <>Alice's second is the other bisector</>],
        ]}
      />
      <P>
        Since <TeX>{"u=v=\\sqrt2"}</TeX> forces <TeX>{"\\vec a_0 = (\\vec b_0+\\vec b_1)/\\sqrt2"}</TeX>{" "}
        and <TeX>{"\\vec a_1 = (\\vec b_0-\\vec b_1)/\\sqrt2"}</TeX>, Alice's two directions are
        also mutually orthogonal, and the four vectors interleave at 45°. This is precisely the
        canonical configuration of §9.
      </P>

      {/* ============ 4 ============ */}
      <H id="d4" n="§4">W2 · Sum-of-squares certificate</H>
      <P>
        The vector argument assumed the Tsirelson representation. Here is a proof that uses nothing
        but operator positivity — and which, as a bonus, proves rigidity. Define the CHSH operator
        and two <em>residual operators</em>:
      </P>
      <M tag="4.1">{"\\hat{\\mathcal C} = \\hat A_0\\hat B_0 + \\hat A_0\\hat B_1 + \\hat A_1\\hat B_0 - \\hat A_1\\hat B_1,"}</M>
      <M tag="4.2">{"\\hat R_0 := \\frac{\\hat A_0+\\hat A_1}{\\sqrt2} - \\hat B_0, \\qquad \\hat R_1 := \\frac{\\hat A_0-\\hat A_1}{\\sqrt2} - \\hat B_1."}</M>
      <H2>Expanding the squares</H2>
      <P>
        Both <TeX>{"\\hat R_k"}</TeX> are Hermitian. Using{" "}
        <TeX>{"\\hat A_x^2=\\hat B_y^2=\\mathbb{I}"}</TeX> and{" "}
        <TeX>{"[\\hat A_x,\\hat B_y]=0"}</TeX> (so that{" "}
        <TeX>{"\\{\\hat A_x,\\hat B_y\\} = 2\\hat A_x\\hat B_y"}</TeX>):
      </P>
      <M tag="4.3">{"\\begin{aligned}\\hat R_0^2 &= \\frac{(\\hat A_0+\\hat A_1)^2}{2} + \\hat B_0^2 - \\Big\\{\\frac{\\hat A_0+\\hat A_1}{\\sqrt2},\\,\\hat B_0\\Big\\} \\\\[4pt] &= \\frac{2\\mathbb{I} + \\{\\hat A_0,\\hat A_1\\}}{2} + \\mathbb{I} - \\sqrt2\\big(\\hat A_0\\hat B_0 + \\hat A_1\\hat B_0\\big) \\\\[4pt] &= 2\\mathbb{I} + \\tfrac12\\{\\hat A_0,\\hat A_1\\} - \\sqrt2\\big(\\hat A_0\\hat B_0+\\hat A_1\\hat B_0\\big).\\end{aligned}"}</M>
      <P>The same computation with the minus sign gives</P>
      <M tag="4.4">{"\\hat R_1^2 = 2\\mathbb{I} - \\tfrac12\\{\\hat A_0,\\hat A_1\\} - \\sqrt2\\big(\\hat A_0\\hat B_1 - \\hat A_1\\hat B_1\\big)."}</M>
      <P>
        Adding, the anticommutator cancels and the four surviving products assemble into exactly
        the CHSH pattern:
      </P>
      <M tag="4.5">{"\\hat R_0^2 + \\hat R_1^2 = 4\\mathbb{I} - \\sqrt2\\,\\hat{\\mathcal C}."}</M>
      <Note kind="warn" title="THE FACTOR √2 IS NOT OPTIONAL">
        A common slip is to write <TeX>{"\\hat R_0^2+\\hat R_1^2 = 4\\mathbb{I}-\\hat{\\mathcal C}"}</TeX>.
        The cross terms carry <TeX>{"2/\\sqrt2 = \\sqrt2"}</TeX>, so the correct identity is (4.5).
        Numerically the app reports{" "}
        <TeX>{"\\|(\\hat R_0^2+\\hat R_1^2)-(4\\mathbb{I}-\\sqrt2\\hat{\\mathcal C})\\| \\approx 9\\times10^{-16}"}</TeX>{" "}
        versus <TeX>{"\\approx 0.586"}</TeX> for the version without the <TeX>{"\\sqrt2"}</TeX>.
      </Note>
      <P>Dividing (4.5) by <TeX>{"\\sqrt2"}</TeX> and using <TeX>{"4/\\sqrt2 = 2\\sqrt2"}</TeX>:</P>
      <M tag="4.6">{"\\boxed{\\;2\\sqrt2\\,\\mathbb{I} - \\hat{\\mathcal C} \\;=\\; \\tfrac{1}{\\sqrt2}\\hat R_0^2 + \\tfrac{1}{\\sqrt2}\\hat R_1^2 \\;\\succeq\\; 0\\;}"}</M>
      <P>
        For any Hermitian <TeX>{"\\hat R"}</TeX> and any state,{" "}
        <TeX>{"\\langle\\psi|\\hat R^2|\\psi\\rangle = \\|\\hat R|\\psi\\rangle\\|^2\\ge0"}</TeX>.
        Taking expectations in (4.6) therefore gives Tsirelson's bound with no optimisation
        whatsoever:
      </P>
      <M tag="4.7">{"2\\sqrt2 - \\langle\\hat{\\mathcal C}\\rangle = \\tfrac{1}{\\sqrt2}\\Big(\\big\\|\\hat R_0|\\psi\\rangle\\big\\|^2 + \\big\\|\\hat R_1|\\psi\\rangle\\big\\|^2\\Big) \\;\\ge\\; 0."}</M>

      <H2>The defect in measurable quantities</H2>
      <P>
        Taking expectations of (4.3)–(4.4) term by term, with{" "}
        <TeX>{"a := \\tfrac12\\langle\\{\\hat A_0,\\hat A_1\\}\\rangle"}</TeX>, the app computes
      </P>
      <M tag="4.8">{"n_0 = \\big\\|\\hat R_0|\\psi\\rangle\\big\\|^2 = 2 + a - \\sqrt2\\,(E_{00}+E_{10}), \\qquad n_1 = 2 - a - \\sqrt2\\,(E_{01}-E_{11}),"}</M>
      <M tag="4.9">{"\\mathrm{defect} := \\frac{n_0+n_1}{\\sqrt2} = \\frac{4 - \\sqrt2\\,\\mathcal{C}}{\\sqrt2} = 2\\sqrt2 - \\mathcal{C}."}</M>
      <P>
        This identity holds for <em>every</em> state and every set of angles — including partially
        entangled and noisy ones — which is why the app's residual{" "}
        <TeX>{"|\\mathrm{defect} - (2\\sqrt2-\\mathcal C)|"}</TeX> displays{" "}
        <TeX>{"0"}</TeX> to machine precision at all times. For a qubit realisation{" "}
        <TeX>{"\\{\\hat A_0,\\hat A_1\\} = 2\\cos(\\alpha_0-\\alpha_1)\\,\\mathbb{I}"}</TeX>, so{" "}
        <TeX>{"a = \\cos(\\alpha_0-\\alpha_1)"}</TeX>.
      </P>

      <H2>Rigidity and self-testing</H2>
      <P>
        Saturation <TeX>{"\\langle\\hat{\\mathcal C}\\rangle = 2\\sqrt2"}</TeX> requires both
        squares to annihilate the state:
      </P>
      <M tag="4.10">{"\\hat R_0|\\psi\\rangle = 0 \\iff \\hat B_0|\\psi\\rangle = \\frac{\\hat A_0+\\hat A_1}{\\sqrt2}|\\psi\\rangle, \\qquad \\hat R_1|\\psi\\rangle = 0 \\iff \\hat B_1|\\psi\\rangle = \\frac{\\hat A_0-\\hat A_1}{\\sqrt2}|\\psi\\rangle."}</M>
      <P>
        Apply <TeX>{"\\hat B_0"}</TeX> to the first relation and use{" "}
        <TeX>{"\\hat B_0^2=\\mathbb{I}"}</TeX> together with{" "}
        <TeX>{"[\\hat A_x,\\hat B_y]=0"}</TeX>:
      </P>
      <M tag="4.11">{"|\\psi\\rangle = \\hat B_0^2|\\psi\\rangle = \\frac{(\\hat A_0+\\hat A_1)^2}{2}|\\psi\\rangle = \\Big(\\mathbb{I} + \\tfrac12\\{\\hat A_0,\\hat A_1\\}\\Big)|\\psi\\rangle \\;\\Longrightarrow\\; \\{\\hat A_0,\\hat A_1\\}|\\psi\\rangle = 0."}</M>
      <Note kind="key" title="ANTICOMMUTATION IS FORCED">
        Alice's two observables must <em>anticommute</em> on the state. Commuting (i.e. jointly
        measurable, effectively classical) observables can never reach <TeX>{"2\\sqrt2"}</TeX>.
        Together with (4.10) this fixes the state and both measurement pairs up to a local
        isometry — the statement that CHSH <em>self-tests</em> the singlet.
      </Note>

      {/* ============ 5 ============ */}
      <H id="d5" n="§5">Interlude · the commutator route</H>
      <P>
        A third proof, due to Tsirelson, bounds the operator norm directly. Write{" "}
        <TeX>{"\\hat S = \\hat B_0+\\hat B_1"}</TeX>, <TeX>{"\\hat D = \\hat B_0-\\hat B_1"}</TeX>{" "}
        so that <TeX>{"\\hat{\\mathcal C} = \\hat A_0\\hat S + \\hat A_1\\hat D"}</TeX>. Squaring and
        using <TeX>{"[\\hat A_x,\\hat B_y]=0"}</TeX>, <TeX>{"\\hat A_x^2=\\mathbb{I}"}</TeX>:
      </P>
      <M tag="5.1">{"\\hat{\\mathcal C}^2 = \\hat S^2 + \\hat D^2 + \\hat A_0\\hat A_1\\,\\hat S\\hat D + \\hat A_1\\hat A_0\\,\\hat D\\hat S."}</M>
      <P>Now <TeX>{"\\hat S^2+\\hat D^2 = 4\\mathbb{I}"}</TeX> (the operator parallelogram law), while</P>
      <M tag="5.2">{"\\hat S\\hat D = \\hat B_0^2 - \\hat B_0\\hat B_1 + \\hat B_1\\hat B_0 - \\hat B_1^2 = -[\\hat B_0,\\hat B_1], \\qquad \\hat D\\hat S = +[\\hat B_0,\\hat B_1],"}</M>
      <P>so the two cross terms combine into a single commutator product:</P>
      <M tag="5.3">{"\\boxed{\\;\\hat{\\mathcal C}^2 = 4\\mathbb{I} - [\\hat A_0,\\hat A_1]\\,[\\hat B_0,\\hat B_1]\\;}"}</M>
      <P>
        For Hermitian <TeX>{"\\hat X,\\hat Y"}</TeX> with{" "}
        <TeX>{"\\|\\hat X\\|,\\|\\hat Y\\|\\le1"}</TeX> we have{" "}
        <TeX>{"\\|[\\hat X,\\hat Y]\\| \\le 2\\|\\hat X\\|\\|\\hat Y\\| \\le 2"}</TeX>. Hence
      </P>
      <M tag="5.4">{"\\|\\hat{\\mathcal C}^2\\| \\le 4 + 2\\cdot2 = 8 \\quad\\Longrightarrow\\quad \\|\\hat{\\mathcal C}\\| \\le \\sqrt8 = 2\\sqrt2."}</M>
      <P>
        For qubits the commutators are explicit:{" "}
        <TeX>{"[\\hat A(\\alpha_0),\\hat A(\\alpha_1)] = 2i\\sin(\\alpha_0-\\alpha_1)\\,\\sigma_y"}</TeX>,
        of norm <TeX>{"2|\\sin(\\alpha_0-\\alpha_1)|"}</TeX>. The bound is saturated only when both
        pairs are at 90°, again reproducing the canonical angles.
      </P>
      <Note kind="key" title="A PRETTY CONSEQUENCE">
        At the canonical angles one finds{" "}
        <TeX>{"\\hat{\\mathcal C}^2 = 4\\mathbb{I} - 4\\,\\sigma_y\\otimes\\sigma_y"}</TeX>, whose
        spectrum is <TeX>{"\\{0,0,8,8\\}"}</TeX>. Therefore{" "}
        <TeX>{"\\mathrm{spec}(\\hat{\\mathcal C}) = \\{-2\\sqrt2,\\,0,\\,0,\\,+2\\sqrt2\\}"}</TeX> —
        the CHSH operator literally has <TeX>{"\\pm2\\sqrt2"}</TeX> as its extreme eigenvalues, and
        the optimal state is the corresponding eigenvector.
      </Note>

      {/* ============ 6 ============ */}
      <H id="d6" n="§6">W3 · The quantum elliptope</H>
      <P>
        The previous sections bound one linear functional. The full characterisation of which
        correlator vectors <TeX>{"\\vec E = (E_{00},E_{01},E_{10},E_{11})"}</TeX> are quantum was
        given by Tsirelson, Landau and Masanes:
      </P>
      <M tag="6.1">{"\\big|\\arcsin E_{00} + \\arcsin E_{01} + \\arcsin E_{10} - \\arcsin E_{11}\\big| \\;\\le\\; \\pi."}</M>
      <P>
        Unlike the local polytope, whose boundary consists of flat facets, this region has a{" "}
        <em>curved</em> boundary — the quantum <em>elliptope</em>. To visualise it we take the
        symmetric two-dimensional slice
      </P>
      <M tag="6.2">{"x := E_{00}=E_{01}=E_{10}, \\qquad y := E_{11}, \\qquad \\mathcal{C} = 3x - y."}</M>
      <H2>The classical boundary</H2>
      <P>
        The facet <TeX>{"\\mathcal{C} \\le 2"}</TeX> becomes the straight line{" "}
        <TeX>{"y = 3x-2"}</TeX>, of slope 3. (The slice's full local polytope is the quadrilateral
        with vertices <TeX>{"(-1,-1),\\,(\\tfrac13,-1),\\,(1,1),\\,(-\\tfrac13,1)"}</TeX>, cut out by{" "}
        <TeX>{"|3x-y|\\le2"}</TeX> and <TeX>{"|x+y|\\le2"}</TeX>.)
      </P>
      <H2>The quantum boundary</H2>
      <P>Saturating (6.1) in the slice gives <TeX>{"3\\arcsin x - \\arcsin y = \\pi"}</TeX>, i.e.</P>
      <M tag="6.3">{"y = \\sin\\!\\big(3\\arcsin x - \\pi\\big) = -\\sin\\!\\big(3\\arcsin x\\big)."}</M>
      <P>
        Now use the triple-angle identity{" "}
        <TeX>{"\\sin3t = 3\\sin t - 4\\sin^3 t"}</TeX> with <TeX>{"t=\\arcsin x"}</TeX>, so{" "}
        <TeX>{"\\sin(3\\arcsin x) = 3x-4x^3"}</TeX>:
      </P>
      <M tag="6.4">{"\\boxed{\\;y = 4x^3 - 3x\\;}\\qquad \\text{valid for } x\\in[\\tfrac12,1]."}</M>
      <P>
        The domain restriction comes from requiring{" "}
        <TeX>{"3\\arcsin x - \\pi \\in [-\\tfrac{\\pi}{2},\\tfrac{\\pi}{2}]"}</TeX>, i.e.{" "}
        <TeX>{"\\arcsin x \\in [\\tfrac{\\pi}{6},\\tfrac{\\pi}{2}]"}</TeX>.
      </P>
      <H2>Maximising along the slice</H2>
      <P>On this boundary the CHSH value is a cubic in a single variable:</P>
      <M tag="6.5">{"\\mathcal{C}(x) = 3x - (4x^3-3x) = 6x - 4x^3, \\qquad \\frac{d\\mathcal C}{dx} = 6 - 12x^2 = 0 \\;\\Longrightarrow\\; x^\\star = \\frac{1}{\\sqrt2}."}</M>
      <P>
        Since <TeX>{"\\mathcal C''(x) = -24x < 0"}</TeX> there, it is a maximum, and
      </P>
      <M tag="6.6">{"\\mathcal{C}^\\star = \\frac{6}{\\sqrt2} - \\frac{4}{2\\sqrt2} = \\frac{6-2}{\\sqrt2} = \\frac{4}{\\sqrt2} = 2\\sqrt2, \\qquad y^\\star = 4\\cdot\\tfrac{1}{2\\sqrt2}-\\tfrac{3}{\\sqrt2} = -\\frac{1}{\\sqrt2}."}</M>
      <H2>Tangency</H2>
      <P>
        The witness line <TeX>{"3x-y=\\mathcal C"}</TeX> has slope 3. The curve's slope is{" "}
        <TeX>{"dy/dx = 12x^2-3"}</TeX>, which at <TeX>{"x^\\star=1/\\sqrt2"}</TeX> equals{" "}
        <TeX>{"12\\cdot\\tfrac12-3 = 3"}</TeX>. The two slopes coincide:
      </P>
      <Note kind="key" title="THE WITNESS PLANE KISSES THE ELLIPTOPE">
        At <TeX>{"\\mathcal C = 2\\sqrt2"}</TeX> the CHSH hyperplane is <em>tangent</em> to the
        quantum body at the single point{" "}
        <TeX>{"(x,y) = (1/\\sqrt2,\\,-1/\\sqrt2)"}</TeX>, i.e.{" "}
        <TeX>{"\\vec E^\\star = \\tfrac{1}{\\sqrt2}(1,1,1,-1)"}</TeX>. Below <TeX>{"2"}</TeX> the
        plane cuts through the flat classical facet; between <TeX>{"2"}</TeX> and{" "}
        <TeX>{"2\\sqrt2"}</TeX> it rolls across the curved shell; beyond it leaves the quantum set
        entirely. Curvature is exactly why the quantum maximum is irrational.
      </Note>

      {/* ============ 7 ============ */}
      <H id="d7" n="§7">W4 · NPA moment matrix</H>
      <P>
        The fourth route is the most general: it asks only that the observed numbers be consistent
        with <em>some</em> Hilbert-space model, and derives the bound from linear algebra. Choose
        the operator list
      </P>
      <M tag="7.1">{"\\mathcal{O} = \\{\\hat{\\mathbb{I}},\\, \\hat A_0,\\, \\hat A_1,\\, \\hat B_0,\\, \\hat B_1\\}"}</M>
      <P>and form the <TeX>{"5\\times5"}</TeX> moment (Gram) matrix</P>
      <M tag="7.2">{"\\Gamma_{ij} := \\langle\\psi|\\hat O_i^\\dagger \\hat O_j|\\psi\\rangle."}</M>
      <H2>Why Γ must be positive semi-definite</H2>
      <P>For any complex vector <TeX>{"\\vec c\\in\\mathbb{C}^5"}</TeX>,</P>
      <M tag="7.3">{"\\vec c^{\\,\\dagger}\\Gamma\\vec c = \\sum_{i,j} \\bar c_i c_j \\langle\\psi|\\hat O_i^\\dagger\\hat O_j|\\psi\\rangle = \\Big\\|\\sum_j c_j \\hat O_j|\\psi\\rangle\\Big\\|^2 \\;\\ge\\; 0."}</M>
      <P>
        A negative eigenvalue would assert that some vector in Hilbert space has negative squared
        norm — impossible. So <TeX>{"\\Gamma\\succeq0"}</TeX> is a necessary condition on any
        quantum behaviour. This is level 1 of the Navascués–Pironio–Acín hierarchy; remarkably, for
        CHSH it is already tight.
      </P>
      <H2>Filling in the entries</H2>
      <P>
        Using <TeX>{"\\hat A_x^2=\\hat B_y^2=\\mathbb{I}"}</TeX>,{" "}
        <TeX>{"[\\hat A_x,\\hat B_y]=0"}</TeX>, and writing{" "}
        <TeX>{"a=\\tfrac12\\langle\\{\\hat A_0,\\hat A_1\\}\\rangle"}</TeX>,{" "}
        <TeX>{"b=\\tfrac12\\langle\\{\\hat B_0,\\hat B_1\\}\\rangle"}</TeX>, and taking unbiased
        marginals <TeX>{"\\langle\\hat A_x\\rangle=\\langle\\hat B_y\\rangle=0"}</TeX>:
      </P>
      <M tag="7.4">{"\\Gamma = \\begin{pmatrix} 1 & 0 & 0 & 0 & 0 \\\\ 0 & 1 & a & E_{00} & E_{01} \\\\ 0 & a & 1 & E_{10} & E_{11} \\\\ 0 & E_{00} & E_{10} & 1 & b \\\\ 0 & E_{01} & E_{11} & b & 1\\end{pmatrix}."}</M>
      <P>
        The first row and column decouple, so <TeX>{"\\Gamma\\succeq0"}</TeX> if and only if the{" "}
        <TeX>{"4\\times4"}</TeX> block <TeX>{"\\Gamma_{\\mathrm{sub}}\\succeq0"}</TeX> (a trivial
        Schur complement).
      </P>
      <H2>The symmetric case, solved exactly</H2>
      <P>
        Put <TeX>{"a=b=0"}</TeX>, <TeX>{"E_{00}=E_{01}=E_{10}=E"}</TeX>,{" "}
        <TeX>{"E_{11}=-E"}</TeX>, so that <TeX>{"\\mathcal C = 4E"}</TeX>. Then
      </P>
      <M tag="7.5">{"\\Gamma_{\\mathrm{sub}} = \\mathbb{I}_4 + E\\,M, \\qquad M = \\begin{pmatrix}0&0&1&1\\\\0&0&1&-1\\\\1&1&0&0\\\\1&-1&0&0\\end{pmatrix} = \\begin{pmatrix}0 & K\\\\ K^{\\mathsf T} & 0\\end{pmatrix},\\;\\; K=\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}."}</M>
      <P>
        Because <TeX>{"KK^{\\mathsf T} = K^{\\mathsf T}K = 2\\mathbb{I}_2"}</TeX>, the block
        structure gives <TeX>{"M^2 = 2\\mathbb{I}_4"}</TeX>. Hence <TeX>{"M"}</TeX> has eigenvalues{" "}
        <TeX>{"\\pm\\sqrt2"}</TeX>, each twice, and
      </P>
      <M tag="7.6">{"\\mathrm{spec}\\,\\Gamma_{\\mathrm{sub}} = \\big\\{\\,1-\\sqrt2 E,\\; 1-\\sqrt2 E,\\; 1+\\sqrt2 E,\\; 1+\\sqrt2 E \\,\\big\\}."}</M>
      <P>Positivity of the smallest eigenvalue is the whole story:</P>
      <M tag="7.7">{"1 - \\sqrt2\\,E \\;\\ge\\; 0 \\;\\Longleftrightarrow\\; E \\le \\frac{1}{\\sqrt2} \\;\\Longleftrightarrow\\; \\mathcal{C} = 4E \\le \\frac{4}{\\sqrt2} = 2\\sqrt2."}</M>
      <Note kind="key" title="THE SPECTRAHEDRON PICTURE">
        The set <TeX>{"\\{\\Gamma\\succeq0\\}"}</TeX> is a <em>spectrahedron</em> — the
        intersection of an affine space with the PSD cone. Its boundary is where an eigenvalue
        hits zero, which is generically curved; that curvature is the same curvature seen in §6.
        A PR box has <TeX>{"E=1"}</TeX>, giving{" "}
        <TeX>{"\\lambda_{\\min} = 1-\\sqrt2 \\approx -0.41421 < 0"}</TeX>: no Hilbert space
        whatsoever can produce it.
      </Note>

      {/* ============ 8 ============ */}
      <H id="d8" n="§8">PR boxes and the hierarchy</H>
      <P>
        The Popescu–Rohrlich box is defined by the correlation rule{" "}
        <TeX>{"a\\oplus b = x\\cdot y"}</TeX> with uniform marginals, giving
      </P>
      <M tag="8.1">{"E_{00}=E_{01}=E_{10}=+1,\\quad E_{11}=-1 \\quad\\Longrightarrow\\quad \\mathcal{C}=4."}</M>
      <P>
        It satisfies no-signalling exactly (each party's marginal is uniform regardless of the
        other's input) and is perfectly normalised. Yet it fails both quantum tests: the arcsin
        criterion gives <TeX>{"3\\cdot\\tfrac\\pi2 - (-\\tfrac\\pi2) = 2\\pi > \\pi"}</TeX>, and the
        Gram matrix has <TeX>{"\\lambda_{\\min} = 1-\\sqrt2 < 0"}</TeX>.
      </P>
      <P>
        Projecting the four correlators onto the two Bell expressions{" "}
        <TeX>{"\\mathcal C_1 = E_{00}+E_{01}+E_{10}-E_{11}"}</TeX> and{" "}
        <TeX>{"\\mathcal C_2 = E_{00}+E_{01}-E_{10}+E_{11}"}</TeX> renders the hierarchy in two
        dimensions:
      </P>
      <Tbl
        head={["set", "region in the (C₁,C₂) plane", "max |C₁|", "boundary"]}
        rows={[
          ["local L", "square |C₁|,|C₂| ≤ 2", "2", "flat (polytope)"],
          ["quantum Q", "disc C₁² + C₂² ≤ 8", "2√2 ≈ 2.8284", "curved (elliptope)"],
          ["no-signalling NS", "diamond |C₁|+|C₂| ≤ 4", "4", "flat (polytope)"],
        ]}
      />
      <P>
        The square is inscribed in the disc, which is inscribed in the diamond, and all three
        touch at the four points <TeX>{"(\\pm2,\\pm2)"}</TeX> — the deterministic strategies. The
        PR boxes sit at the diamond's vertices <TeX>{"(\\pm4,0),(0,\\pm4)"}</TeX>.
      </P>
      <Note kind="info" title="WHY DOES NATURE STOP AT 2√2?">
        No-signalling alone permits <TeX>{"\\mathcal C = 4"}</TeX>, so relativistic causality is
        not the reason. Candidate explanations include <em>information causality</em> (PR boxes
        would allow implausible communication compression), <em>macroscopic locality</em>, and{" "}
        <em>local orthogonality</em> — each of which singles out <TeX>{"2\\sqrt2"}</TeX> or close
        to it. The question of a single compelling physical axiom remains open.
      </Note>

      {/* ============ 9 ============ */}
      <H id="d9" n="§9">Worked canonical example</H>
      <P>Take the maximally entangled state and the optimal angles</P>
      <M tag="9.1">{"\\theta = \\tfrac\\pi4,\\quad p=1,\\qquad \\alpha_0 = 0,\\quad \\alpha_1 = \\tfrac\\pi2,\\quad \\beta_0 = \\tfrac\\pi4,\\quad \\beta_1 = -\\tfrac\\pi4."}</M>
      <P>By (2.1) the four observables are, as explicit matrices,</P>
      <M tag="9.2">{"\\hat A_0 = \\sigma_z = \\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix},\\qquad \\hat A_1 = \\sigma_x = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix},"}</M>
      <M tag="9.3">{"\\hat B_0 = \\frac{\\sigma_z+\\sigma_x}{\\sqrt2} = \\frac{1}{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix},\\qquad \\hat B_1 = \\frac{\\sigma_z-\\sigma_x}{\\sqrt2} = \\frac{1}{\\sqrt2}\\begin{pmatrix}1&-1\\\\-1&-1\\end{pmatrix}."}</M>
      <P>Since <TeX>{"\\theta=\\pi/4"}</TeX>, (2.4) reduces to <TeX>{"E_{xy}=\\cos(\\alpha_x-\\beta_y)"}</TeX>:</P>
      <M tag="9.4">{"E_{00} = \\cos\\!\\big(0-\\tfrac\\pi4\\big) = \\tfrac{1}{\\sqrt2},\\quad E_{01} = \\cos\\!\\big(0+\\tfrac\\pi4\\big) = \\tfrac{1}{\\sqrt2},\\quad E_{10} = \\cos\\tfrac\\pi4 = \\tfrac{1}{\\sqrt2},\\quad E_{11} = \\cos\\tfrac{3\\pi}{4} = -\\tfrac{1}{\\sqrt2}."}</M>
      <M tag="9.5">{"\\mathcal{C} = \\tfrac{1}{\\sqrt2}+\\tfrac{1}{\\sqrt2}+\\tfrac{1}{\\sqrt2}-\\Big(-\\tfrac{1}{\\sqrt2}\\Big) = \\frac{4}{\\sqrt2} = 2\\sqrt2 \\approx 2.828427."}</M>
      <P>Every window confirms saturation independently:</P>
      <Tbl
        head={["window", "quantity", "value"]}
        rows={[
          ["W1", <TeX>{"u=\\|\\vec b_0+\\vec b_1\\|,\\ v=\\|\\vec b_0-\\vec b_1\\|"}</TeX>, "√2, √2 → u²+v² = 4, u+v = 2√2"],
          ["W2", <TeX>{"\\hat R_0 = (\\hat A_0+\\hat A_1)/\\sqrt2 - \\hat B_0"}</TeX>, "≡ 0 (the zero matrix)"],
          ["W2", <TeX>{"\\hat R_1 = (\\hat A_0-\\hat A_1)/\\sqrt2 - \\hat B_1"}</TeX>, "≡ 0 → defect = 0.000000"],
          ["W2", <TeX>{"\\{\\hat A_0,\\hat A_1\\} = \\{\\sigma_z,\\sigma_x\\}"}</TeX>, "= 0 → anticommuting ✓"],
          ["W3", <TeX>{"(x,y) = (E_{00}, E_{11})"}</TeX>, "(0.70711, −0.70711) → on the curve"],
          ["W4", <TeX>{"\\lambda_{\\min}(\\Gamma)"}</TeX>, "1 − √2·(1/√2) = 0 exactly"],
          ["§5", <TeX>{"\\mathrm{spec}(\\hat{\\mathcal C})"}</TeX>, "{−2√2, 0, 0, +2√2}"],
        ]}
      />
      <P>
        Observe that <TeX>{"\\hat B_0"}</TeX> and <TeX>{"\\hat B_1"}</TeX> are literally the
        normalised sum and difference of Alice's observables — the SOS residuals vanish as
        matrices, not merely in expectation. This is the strongest possible form of saturation.
      </P>

      {/* ============ 10 ============ */}
      <H id="d10" n="§10">Formula reference for the app</H>
      <P>
        Every number displayed in the Tsirelson laboratory is computed from the following closed
        forms at render time; nothing is hard-coded or fitted.
      </P>
      <Tbl
        head={["displayed quantity", "formula", "source"]}
        rows={[
          [<TeX>{"E_{xy}"}</TeX>, <TeX>{"p(\\cos\\alpha_x\\cos\\beta_y + \\sin2\\theta\\sin\\alpha_x\\sin\\beta_y)"}</TeX>, "(2.4)"],
          [<TeX>{"\\langle\\mathcal C\\rangle"}</TeX>, <TeX>{"E_{00}+E_{01}+E_{10}-E_{11}"}</TeX>, "(0.2)"],
          ["state max", <TeX>{"2p\\sqrt{1+\\sin^2 2\\theta}"}</TeX>, "Horodecki criterion"],
          [<TeX>{"u,\\,v"}</TeX>, <TeX>{"\\|\\vec b_0\\pm\\vec b_1\\|"}</TeX>, "(3.3)"],
          ["invariant", <TeX>{"u^2+v^2 \\equiv 4"}</TeX>, "(3.4)"],
          [<TeX>{"n_0,\\,n_1"}</TeX>, <TeX>{"2\\pm a - \\sqrt2(E_{00}+E_{10}\\ \\mathrm{resp.}\\ E_{01}-E_{11})"}</TeX>, "(4.8)"],
          ["defect", <TeX>{"(n_0+n_1)/\\sqrt2 = 2\\sqrt2-\\mathcal C"}</TeX>, "(4.9)"],
          [<TeX>{"a"}</TeX>, <TeX>{"\\cos(\\alpha_0-\\alpha_1)"}</TeX>, "§4"],
          ["elliptope curve", <TeX>{"y = 4x^3-3x"}</TeX>, "(6.4)"],
          ["Cirel'son value", <TeX>{"\\textstyle\\sum \\arcsin E_{xy}"}</TeX>, "(6.1)"],
          [<TeX>{"\\lambda_{\\min}(\\Gamma)"}</TeX>, "Jacobi eigenvalue solver on (7.4)", "(7.2)"],
          ["symmetric sweep", <TeX>{"1\\pm\\sqrt2 E"}</TeX>, "(7.6)"],
        ]}
      />
      <P>
        The Horodecki criterion referenced above states that the maximal CHSH value over all
        measurement choices for a two-qubit state <TeX>{"\\rho"}</TeX> is{" "}
        <TeX>{"2\\sqrt{\\lambda_1+\\lambda_2}"}</TeX>, where{" "}
        <TeX>{"\\lambda_1\\ge\\lambda_2"}</TeX> are the two largest eigenvalues of{" "}
        <TeX>{"T^{\\mathsf T}T"}</TeX> and <TeX>{"T_{ij} = \\mathrm{Tr}[\\rho\\,\\sigma_i\\otimes\\sigma_j]"}</TeX>.
        For our family <TeX>{"T = p\\,\\mathrm{diag}(\\sin2\\theta,\\,-\\sin2\\theta,\\,1)"}</TeX>,
        giving <TeX>{"2p\\sqrt{1+\\sin^2 2\\theta}"}</TeX>; this is the violet gauge in the dock,
        and it is the reason a weakly entangled or noisy state cannot reach{" "}
        <TeX>{"2\\sqrt2"}</TeX> no matter how you turn the dials.
      </P>

      {/* ============ 11 ============ */}
      <H id="d11" n="§11">Errata and references</H>
      <P>
        Two algebraic slips are common in write-ups of this material, and both are checked
        numerically live in the app:
      </P>
      <Note kind="warn" title="ERRATUM 1 — THE √2 IN THE SOS EXPANSION">
        Expanding the residual squares gives{" "}
        <TeX>{"\\hat R_0^2+\\hat R_1^2 = 4\\mathbb{I}-\\sqrt2\\,\\hat{\\mathcal C}"}</TeX>, not{" "}
        <TeX>{"4\\mathbb{I}-\\hat{\\mathcal C}"}</TeX>. Only with the <TeX>{"\\sqrt2"}</TeX> does
        multiplication by <TeX>{"1/\\sqrt2"}</TeX> yield{" "}
        <TeX>{"2\\sqrt2\\,\\mathbb{I}-\\hat{\\mathcal C}"}</TeX>. At the canonical angles the
        measured operator-norm residual is <TeX>{"\\sim10^{-16}"}</TeX> with the{" "}
        <TeX>{"\\sqrt2"}</TeX> and <TeX>{"0.586"}</TeX> without it; for generic angles the
        discrepancy is <TeX>{"O(1)"}</TeX> likewise.
      </Note>
      <Note kind="warn" title="ERRATUM 2 — THE SIGN OF THE ELLIPTOPE CUBIC">
        The slice boundary is <TeX>{"y=-\\sin(3\\arcsin x) = 4x^3-3x"}</TeX>, not{" "}
        <TeX>{"-\\cos(3\\arcsin x) = -4x^3+3x"}</TeX>. Only the former satisfies{" "}
        <TeX>{"3\\arcsin x-\\arcsin y=\\pi"}</TeX> identically and passes through the tangency
        point <TeX>{"(1/\\sqrt2,-1/\\sqrt2)"}</TeX>.
      </Note>
      <H2>References</H2>
      <div className="space-y-1.5 mb-4">
        {[
          ["J. S. Bell (1964)", "On the Einstein–Podolsky–Rosen paradox, Physics 1, 195"],
          ["J. F. Clauser, M. A. Horne, A. Shimony, R. A. Holt (1969)", "Phys. Rev. Lett. 23, 880"],
          ["B. S. Cirel'son [Tsirelson] (1980)", "Quantum generalizations of Bell's inequality, Lett. Math. Phys. 4, 93"],
          ["L. J. Landau (1988)", "Empirical two-point correlation functions, Found. Phys. 18, 449"],
          ["S. Popescu, D. Rohrlich (1994)", "Quantum nonlocality as an axiom, Found. Phys. 24, 379"],
          ["R. Horodecki, P. Horodecki, M. Horodecki (1995)", "Violating Bell inequality by mixed states, Phys. Lett. A 200, 340"],
          ["M. Navascués, S. Pironio, A. Acín (2007)", "Bounding the set of quantum correlations, Phys. Rev. Lett. 98, 010401"],
          ["M. Pawłowski et al. (2009)", "Information causality as a physical principle, Nature 461, 1101"],
          ["I. Šupić, J. Bowles (2020)", "Self-testing of quantum systems: a review, Quantum 4, 337"],
        ].map(([a, b], i) => (
          <div key={i} className="flex gap-3 text-[12px] leading-relaxed border-b border-line/40 pb-1.5">
            <span className="mono text-[10px] text-faint shrink-0 w-6">[{i + 1}]</span>
            <span className="text-muted"><span className="text-ink">{a}</span> — {b}</span>
          </div>
        ))}
      </div>
      <P>
        <span className="mono text-[11px] text-faint">
          All identities in this document are re-verified numerically on every render of the
          Tsirelson laboratory; the residual gauges in W2 and W4 are the live proof.
        </span>
      </P>
    </div>
  ),
};
