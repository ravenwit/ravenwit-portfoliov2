import { TeX } from "../components/TeX";
import { H, H2, P, M, Note, Step, Tbl, Refs, type DocSpec } from "./atoms";

const GOLD = "#e8b45c", CYAN = "#6fdcf7", VIOLET = "#a78bfa", NEON = "#7CFFB2";

/* ================================================================== */
/*  CONSOLE — the master overview                                      */
/* ================================================================== */
export const consoleDoc: DocSpec = {
  title: "Contextuality & non-locality — the master argument",
  subtitle: "WHAT THE WHOLE APP IS PROVING · 6 SECTIONS",
  sections: [
    { id: "c0", n: "§0", t: "The single question" },
    { id: "c1", n: "§1", t: "Behaviours and the correlation polytope" },
    { id: "c2", n: "§2", t: "Non-contextuality as a hypothesis" },
    { id: "c3", n: "§3", t: "The two escape routes" },
    { id: "c4", n: "§4", t: "Convex geometry dictionary" },
    { id: "c5", n: "§5", t: "Map of the application" },
  ],
  footer: [["classical", "−3 / 2", GOLD], ["quantum", "5−4√5 / 2√2", CYAN], ["algebraic", "−5 / 4", VIOLET]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="c0" n="§0">The single question</H>
      <P>
        Every page of this application answers one question in a different setting:{" "}
        <em>which correlations are possible under which physical assumptions?</em> The mathematical
        apparatus — deterministic assignments, convex hulls, facets, operator algebras, semidefinite
        cones — exists only to make that question geometric.
      </P>
      <P>
        Fix a finite set of measurements <TeX>{"\\{M_1,\\dots,M_n\\}"}</TeX>, each with outcomes in{" "}
        <TeX>{"\\{+1,-1\\}"}</TeX>, together with a list of <em>contexts</em>: subsets that may be
        measured jointly. The experiment produces a <em>behaviour</em>, the collection of all
        observed conditional distributions. We compress it into correlators and ask which points
        of that vector space are attainable.
      </P>

      <H id="c1" n="§1">Behaviours and the correlation polytope</H>
      <P>
        Let <TeX>{"\\mathcal{E}"}</TeX> be the set of contexts, e.g. edges{" "}
        <TeX>{"\\{i,i+1\\}"}</TeX> of a cycle. Define the correlation vector
      </P>
      <M tag="1.1">{"\\vec x = \\big(\\langle M_iM_j\\rangle\\big)_{\\{i,j\\}\\in\\mathcal{E}} \\;\\in\\; [-1,1]^{|\\mathcal{E}|}."}</M>
      <P>
        A <strong>deterministic assignment</strong> is a function{" "}
        <TeX>{"s:\\{1,\\dots,n\\}\\to\\{\\pm1\\}"}</TeX>; it produces the vertex{" "}
        <TeX>{"\\vec v^{(s)} = (s_is_j)_{\\{i,j\\}\\in\\mathcal E}"}</TeX>. There are at most{" "}
        <TeX>{"2^n"}</TeX> of them, hence finitely many. The classical set is their convex hull
      </P>
      <M tag="1.2">{"\\mathcal{L} = \\operatorname{conv}\\big\\{\\vec v^{(s)} : s\\in\\{\\pm1\\}^n\\big\\} = \\Big\\{\\textstyle\\sum_s q(s)\\,\\vec v^{(s)} \\;:\\; q(s)\\ge0,\\ \\sum_s q(s)=1\\Big\\}."}</M>
      <Note kind="key" title="WHY CONVEXITY IS THE WHOLE STORY">
        Randomness in a classical model is nothing but a probability distribution{" "}
        <TeX>{"q"}</TeX> over deterministic strategies. Mixing is <em>exactly</em> convex
        combination, so no amount of cleverness with randomness can leave the hull. By the
        Minkowski–Weyl theorem a bounded convex hull of finitely many points is a polytope: it
        equals the solution set of finitely many linear inequalities,
        <TeX>{"\\ \\mathcal{L} = \\{\\vec x : \\vec n_f\\!\\cdot\\vec x \\ge d_f,\\ f=1..F\\}"}</TeX>.
        Those inequalities are the Bell / non-contextuality inequalities. Nothing else is being
        claimed by them.
      </Note>

      <H id="c2" n="§2">Non-contextuality as a hypothesis</H>
      <P>
        The passage from "deterministic assignment" to "physically meaningful hypothesis" needs
        care. A measurement <TeX>{"M_i"}</TeX> appears in several contexts. The assignment{" "}
        <TeX>{"s(i)"}</TeX> is a <em>single</em> number regardless of which context it is measured
        in. That is the assumption:
      </P>
      <M tag="2.1">{"\\textbf{(NC)}\\quad \\text{the value assigned to } M_i \\text{ does not depend on which compatible } M_j \\text{ accompanies it.}"}</M>
      <P>
        Locality is the special case where the contexts are "one measurement per party" and the
        independence is enforced by spacelike separation. So <em>Bell is a corollary of
        non-contextuality</em>, not the other way round. Determinism itself is not an extra
        assumption: by a standard argument (Fine's theorem in the Bell case) any non-contextual
        probabilistic model is a mixture of deterministic ones.
      </P>

      <H id="c3" n="§3">The two escape routes</H>
      <Tbl
        head={["", "KCBS (contextuality)", "CHSH (non-locality)"]}
        rows={[
          ["assumption broken", "non-contextuality", "locality"],
          ["system", "one qutrit, ℂ³", "two qubits, ℂ²⊗ℂ²"],
          ["entanglement", "none", "required"],
          ["contexts", "5 edges of C₅", "4 input pairs (x,y)"],
          ["compatibility from", "orthogonality ⟨vᵢ|vᵢ₊₁⟩ = 0", "tensor factorisation [Aₓ,B_y]=0"],
          ["classical bound", <TeX>{"\\sum\\langle S_iS_{i+1}\\rangle \\ge -3"}</TeX>, <TeX>{"|\\mathcal{C}|\\le2"}</TeX>],
          ["quantum value", <TeX>{"5-4\\sqrt5 \\approx -3.9443"}</TeX>, <TeX>{"2\\sqrt2\\approx2.8284"}</TeX>],
          ["algebraic limit", "−5", "4 (PR box)"],
          ["graph invariant", <TeX>{"\\vartheta(C_5)=\\sqrt5"}</TeX>, "CHSH facet"],
        ]}
      />
      <P>
        Both are the same picture: a polytope of deterministic strategies, a strictly larger convex
        body of quantum behaviours bulging through one facet, and an outer polytope of
        "logically consistent but unphysical" behaviours.
      </P>

      <H id="c4" n="§4">Convex geometry dictionary</H>
      <Tbl
        head={["geometric object", "physical meaning", "membership test"]}
        rows={[
          ["vertex / extreme point", "deterministic strategy", "enumeration"],
          ["convex hull", "shared randomness", "linear program"],
          ["facet", "tight Bell / NC inequality", "evaluate n·x ≥ d"],
          ["polytope", "classical model class", "finitely many inequalities"],
          ["curved convex body", "quantum model class", "semidefinite program"],
          ["tangent hyperplane", "optimal witness", "λ_min = 0"],
          ["negative slack", "impossible classically", "n·x < d"],
        ]}
      />
      <Note kind="info" title="THE ONE ASYMMETRY WORTH REMEMBERING">
        Classical and no-signalling sets are <em>polytopes</em> — flat, finitely generated,
        decidable by linear programming. The quantum set is convex but <em>not polyhedral</em>: its
        boundary is curved, it has infinitely many extreme points, and membership requires
        semidefinite programming (the NPA hierarchy). Every irrational bound in this app —{" "}
        <TeX>{"\\sqrt5"}</TeX>, <TeX>{"2\\sqrt2"}</TeX>, <TeX>{"5^{-1/4}"}</TeX> — is a symptom of
        that curvature.
      </Note>

      <H id="c5" n="§5">Map of the application</H>
      <Tbl
        head={["page", "object of study", "central result"]}
        rows={[
          ["Why 4π?", "star polygon wiring", <TeX>{"\\cos\\Delta\\phi<0"}</TeX>],
          ["Derivation", "the KCBS cone", <TeX>{"h=5^{-1/4}"}</TeX>],
          ["Playground", "N-cycle umbrellas", <TeX>{"\\vartheta(C_N)"}</TeX>],
          ["Classical game", "parity of the cycle", <TeX>{"\\sum s_is_{i+1}\\ge-3"}</TeX>],
          ["Polytope lab", "the monolith tetrahedron", "V-rep ⟷ H-rep"],
          ["Convexity", "STAB ⊆ TH ⊆ QSTAB", "the contextual crescent"],
          ["Tsirelson lab", "CHSH operator algebra", <TeX>{"2\\sqrt2"}</TeX>],
          ["L ⊂ Q ⊂ NS", "the nesting", "square ⊂ disc ⊂ diamond"],
        ]}
      />
      <Refs items={[
        ["S. Kochen, E. P. Specker (1967)", "The problem of hidden variables in QM, J. Math. Mech. 17, 59"],
        ["A. Fine (1982)", "Hidden variables, joint probability, and the Bell inequalities, PRL 48, 291"],
        ["A. Cabello, S. Severini, A. Winter (2014)", "Graph-theoretic approach to quantum correlations, PRL 112, 040401"],
        ["C. Budroni et al. (2022)", "Kochen–Specker contextuality, Rev. Mod. Phys. 94, 045007"],
      ]} />
    </div>
  ),
};

/* ================================================================== */
/*  WINDING                                                            */
/* ================================================================== */
export const windingDoc: DocSpec = {
  title: "Why 4π and never 2π — the winding number",
  subtitle: "STAR POLYGONS, OBTUSE NEIGHBOURS, EXISTENCE · 6 SECTIONS",
  sections: [
    { id: "w0", n: "§0", t: "From commutation to orthogonality" },
    { id: "w1", n: "§1", t: "Why a cone is forced" },
    { id: "w2", n: "§2", t: "The master overlap equation" },
    { id: "w3", n: "§3", t: "The obtuseness theorem" },
    { id: "w4", n: "§4", t: "Pentagon vs pentagram" },
    { id: "w5", n: "§5", t: "General admissibility" },
  ],
  footer: [["cos 72°", "+0.309017", "#fb5c7a"], ["cos 144°", "−0.809017", CYAN], ["h = 5⁻¹ᐟ⁴", "0.6687403", NEON]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="w0" n="§0">From commutation to orthogonality</H>
      <P>
        Attach to each unit ray <TeX>{"|v_i\\rangle\\in\\mathbb{R}^3"}</TeX> the reflection
        observable
      </P>
      <M tag="0.1">{"\\hat S_i = 2P_i - \\mathbb{I}, \\qquad P_i = |v_i\\rangle\\langle v_i|, \\quad P_i^2 = P_i."}</M>
      <P>
        Then <TeX>{"\\hat S_i^2 = 4P_i - 4P_i + \\mathbb{I} = \\mathbb{I}"}</TeX>, so the spectrum
        is <TeX>{"\\{\\pm1\\}"}</TeX>. Two such observables commute iff their projectors do:
      </P>
      <M tag="0.2">{"[\\hat S_i,\\hat S_j] = 4[P_i,P_j] = 4\\big(|v_i\\rangle\\langle v_i|v_j\\rangle\\langle v_j| - |v_j\\rangle\\langle v_j|v_i\\rangle\\langle v_i|\\big)."}</M>
      <P>
        Write <TeX>{"c=\\langle v_i|v_j\\rangle"}</TeX> (real here). Then{" "}
        <TeX>{"[P_i,P_j] = c\\big(|v_i\\rangle\\langle v_j| - |v_j\\rangle\\langle v_i|\\big)"}</TeX>.
        Apply it to <TeX>{"|v_j\\rangle"}</TeX>:
      </P>
      <M tag="0.3">{"[P_i,P_j]\\,|v_j\\rangle = c\\big(|v_i\\rangle - c\\,|v_j\\rangle\\big)."}</M>
      <P>
        If <TeX>{"c\\ne0"}</TeX> then, since <TeX>{"|v_i\\rangle"}</TeX> and{" "}
        <TeX>{"|v_j\\rangle"}</TeX> are distinct rays, the bracket is a non-zero vector and the
        commutator does not vanish. Hence for rank-one projectors onto distinct rays,
      </P>
      <M tag="0.4">{"\\boxed{\\;[\\hat S_i,\\hat S_j]=0 \\iff \\langle v_i|v_j\\rangle = 0\\;}"}</M>
      <P>
        Joint measurability of neighbouring observables is therefore <em>exactly</em> orthogonality
        of neighbouring rays. This is the hinge of the entire construction.
      </P>

      <H id="w1" n="§1">Why a cone is forced</H>
      <P>
        We need <TeX>{"N=5"}</TeX> rays in <TeX>{"\\mathbb{R}^3"}</TeX> with{" "}
        <TeX>{"v_i\\perp v_{i+1}"}</TeX> cyclically. Three is the maximum number of{" "}
        <em>mutually</em> orthogonal directions in <TeX>{"\\mathbb{R}^3"}</TeX>, but we only require
        adjacent pairs to be orthogonal — the orthogonality graph is the cycle{" "}
        <TeX>{"C_5"}</TeX>, not the complete graph.
      </P>
      <P>
        To give every observable identical statistical weight we demand the configuration be
        invariant under a <TeX>{"\\mathbb{Z}_5"}</TeX> rotation <TeX>{"R"}</TeX> with{" "}
        <TeX>{"v_{i+1} = R\\,v_i"}</TeX>. Every element of <TeX>{"SO(3)"}</TeX> has a rotation axis{" "}
        <TeX>{"\\hat z"}</TeX> (Euler). A rotation preserves both the length of a vector and its
        component along the axis, so
      </P>
      <M tag="1.1">{"\\|v_i\\| = 1 \\quad\\text{and}\\quad \\hat z\\cdot v_i = h \\quad\\text{are the same for all } i."}</M>
      <P>
        Therefore all five tips lie on the circle of height <TeX>{"h"}</TeX> and radius{" "}
        <TeX>{"r=\\sqrt{1-h^2}"}</TeX>: the rays sweep out a <strong>cone</strong>. Parametrise
      </P>
      <M tag="1.2">{"v_i = \\big(r\\cos\\phi_i,\\; r\\sin\\phi_i,\\; h\\big), \\qquad \\phi_i = i\\,\\Delta\\phi,\\quad \\Delta\\phi = \\frac{2\\pi k}{N}"}</M>
      <P>
        for some integer <TeX>{"k"}</TeX>, the <strong>winding number</strong>. Closure after{" "}
        <TeX>{"N"}</TeX> steps requires <TeX>{"N\\Delta\\phi = 2\\pi k"}</TeX>, i.e. the walk must
        wrap the circle a whole number of times. This <TeX>{"k"}</TeX> is the entire content of the
        "2π versus 4π" question.
      </P>

      <H id="w2" n="§2">The master overlap equation</H>
      <P>
        For two tips separated in azimuth by <TeX>{"\\Delta\\phi"}</TeX>, the Euclidean inner
        product splits into a horizontal and a vertical part:
      </P>
      <M tag="2.1">{"\\begin{aligned}\\langle v_a|v_b\\rangle &= r^2\\big(\\cos\\phi_a\\cos\\phi_b + \\sin\\phi_a\\sin\\phi_b\\big) + h^2 \\\\ &= r^2\\cos(\\phi_b-\\phi_a) + h^2 = (1-h^2)\\cos\\Delta\\phi + h^2.\\end{aligned}"}</M>
      <P>Setting this to zero and solving for the height:</P>
      <M tag="2.2">{"(1-h^2)\\cos\\Delta\\phi + h^2 = 0 \\;\\Longrightarrow\\; h^2\\big(1-\\cos\\Delta\\phi\\big) = -\\cos\\Delta\\phi"}</M>
      <M tag="2.3">{"\\boxed{\\;h^2 = \\frac{-\\cos\\Delta\\phi}{1-\\cos\\Delta\\phi} = \\frac{\\cos\\Delta\\phi}{\\cos\\Delta\\phi - 1}\\;}"}</M>
      <P>
        Writing <TeX>{"\\chi := \\pi - \\Delta\\phi"}</TeX> so that{" "}
        <TeX>{"\\cos\\Delta\\phi = -\\cos\\chi"}</TeX>, this is the form used in the playground:
      </P>
      <M tag="2.4">{"h^2 = \\frac{\\cos\\chi}{1+\\cos\\chi}, \\qquad \\chi = \\pi - \\frac{2\\pi k}{N} = \\frac{\\pi(N-2k)}{N}."}</M>

      <H id="w3" n="§3">The obtuseness theorem</H>
      <P>Rearranging (2.1) with <TeX>{"\\langle v_a|v_b\\rangle = 0"}</TeX> gives</P>
      <M tag="3.1">{"\\cos\\Delta\\phi = -\\frac{h^2}{r^2} = -\\frac{h^2}{1-h^2}."}</M>
      <Note kind="key" title="THEOREM (OBTUSE NEIGHBOURS)">
        Because <TeX>{"h^2\\ge0"}</TeX> and <TeX>{"r^2>0"}</TeX>, the right-hand side of (3.1) is{" "}
        <TeX>{"\\le 0"}</TeX>. Hence <strong>any</strong> symmetric cone realisation requires{" "}
        <TeX>{"\\cos\\Delta\\phi\\le0"}</TeX>, i.e.{" "}
        <TeX>{"\\Delta\\phi\\in[\\tfrac\\pi2,\\tfrac{3\\pi}2]"}</TeX>. Wired neighbours must be
        separated by an <em>obtuse</em> azimuth. Equality <TeX>{"\\cos\\Delta\\phi=0"}</TeX> forces{" "}
        <TeX>{"h=0"}</TeX>, a degenerate flat configuration.
      </Note>
      <P>
        The mechanism is transparent: the vertical components of two rays on the same cone always
        overlap <em>positively</em> (both equal <TeX>{"h"}</TeX>, contributing{" "}
        <TeX>{"+h^2"}</TeX>). The only way to cancel that is a negative horizontal overlap, which
        requires the projected directions to point more than 90° apart.
      </P>
      <P>
        Equivalently, from (2.3): <TeX>{"h^2>0"}</TeX> requires numerator and denominator to share
        a sign. The denominator <TeX>{"\\cos\\Delta\\phi-1"}</TeX> is always{" "}
        <TeX>{"\\le0"}</TeX>, so we need <TeX>{"\\cos\\Delta\\phi\\le0"}</TeX>. An acute step
        returns a <em>negative</em> <TeX>{"h^2"}</TeX> — an imaginary height.
      </P>

      <H id="w4" n="§4">Pentagon vs pentagram</H>
      <H2>The exact pentagon cosines</H2>
      <P>
        Let <TeX>{"\\varphi=\\tfrac{1+\\sqrt5}{2}"}</TeX> be the golden ratio, the positive root of{" "}
        <TeX>{"\\varphi^2=\\varphi+1"}</TeX>. Setting{" "}
        <TeX>{"t=\\cos36^\\circ"}</TeX> and using the triple/double angle relations with{" "}
        <TeX>{"\\cos(3\\cdot36^\\circ) = -\\cos(2\\cdot36^\\circ)"}</TeX> (since{" "}
        <TeX>{"108^\\circ = 180^\\circ-72^\\circ"}</TeX>) yields{" "}
        <TeX>{"4t^3-3t = -(2t^2-1)"}</TeX>, i.e.{" "}
        <TeX>{"4t^3+2t^2-3t-1=0"}</TeX>, which factors as{" "}
        <TeX>{"(t+1)(4t^2-2t-1)=0"}</TeX>. The relevant root is
      </P>
      <M tag="4.1">{"\\cos36^\\circ = \\frac{1+\\sqrt5}{4} = \\frac{\\varphi}{2} \\approx 0.809017."}</M>
      <Tbl
        head={["angle", "exact value", "decimal", "role"]}
        rows={[
          ["36°", <TeX>{"(1+\\sqrt5)/4 = \\varphi/2"}</TeX>, "+0.809017", "half-pentagon"],
          ["72°", <TeX>{"(\\sqrt5-1)/4 = 1/(2\\varphi)"}</TeX>, "+0.309017", "pentagon step"],
          ["108°", <TeX>{"-(\\sqrt5-1)/4"}</TeX>, "−0.309017", "often confused with 144°"],
          ["144°", <TeX>{"-(1+\\sqrt5)/4 = -\\varphi/2"}</TeX>, "−0.809017", "pentagram step"],
        ]}
      />
      <Note kind="warn" title="A FREQUENT SIGN ERROR">
        <TeX>{"\\cos144^\\circ"}</TeX> is <TeX>{"-(1+\\sqrt5)/4"}</TeX>, not{" "}
        <TeX>{"(1-\\sqrt5)/4"}</TeX>. The latter equals <TeX>{"-0.309"}</TeX>, which is{" "}
        <TeX>{"\\cos108^\\circ"}</TeX>. The decimal <TeX>{"-0.809"}</TeX> is the correct one, and
        the surd must match it.
      </Note>

      <H2>k = 1: the pentagon fails</H2>
      <P>
        With <TeX>{"\\Delta\\phi = 2\\pi/5 = 72^\\circ"}</TeX> we have{" "}
        <TeX>{"\\cos\\Delta\\phi = +0.309017 > 0"}</TeX>, so both terms of (2.1) are strictly
        positive and the overlap can never vanish:
      </P>
      <M tag="4.2">{"\\langle v_i|v_{i+1}\\rangle = \\underbrace{(1-h^2)}_{>0}\\underbrace{(+0.309)}_{>0} + \\underbrace{h^2}_{\\ge0} \\;>\\;0 \\quad \\forall h\\in[0,1)."}</M>
      <P>Formally applying (2.3) anyway:</P>
      <M tag="4.3">{"h^2 = \\frac{(\\sqrt5-1)/4}{(\\sqrt5-1)/4 - 1} = \\frac{\\sqrt5-1}{\\sqrt5-5} = \\frac{\\sqrt5-1}{-\\sqrt5(\\sqrt5-1)} = -\\frac{1}{\\sqrt5}."}</M>
      <Note kind="warn" title="AN IMAGINARY HEIGHT">
        The pentagon returns <TeX>{"h^2=-1/\\sqrt5"}</TeX>, i.e.{" "}
        <TeX>{"h = i\\,5^{-1/4}"}</TeX> — exactly <em>minus</em> the pentagram's answer. The
        construction does not merely "fail to be optimal"; it has no solution in{" "}
        <TeX>{"\\mathbb{R}^3"}</TeX> at all.
      </Note>

      <H2>k = 2: the pentagram works</H2>
      <P>
        With <TeX>{"\\Delta\\phi = 4\\pi/5 = 144^\\circ"}</TeX> and{" "}
        <TeX>{"\\cos\\Delta\\phi = -\\varphi/2"}</TeX>, equation (2.3) gives
      </P>
      <M tag="4.4">{"h^2 = \\frac{-\\varphi/2}{-\\varphi/2-1} = \\frac{\\varphi}{\\varphi+2} = \\frac{(1+\\sqrt5)/2}{(5+\\sqrt5)/2} = \\frac{1+\\sqrt5}{5+\\sqrt5} = \\frac{1+\\sqrt5}{\\sqrt5(\\sqrt5+1)} = \\frac{1}{\\sqrt5}."}</M>
      <M tag="4.5">{"\\boxed{\\;h = 5^{-1/4} \\approx 0.6687403,\\qquad r = \\sqrt{1-\\tfrac{1}{\\sqrt5}} \\approx 0.7434934\\;}"}</M>
      <P>
        The walk <TeX>{"1\\to3\\to5\\to2\\to4\\to1"}</TeX> visits all five rays and sweeps{" "}
        <TeX>{"5\\times144^\\circ = 720^\\circ = 4\\pi"}</TeX> — twice around the circle. That
        total winding is the origin of the "<TeX>{"4\\pi"}</TeX>" in the literature; the{" "}
        <em>spacing</em> of the rays is still <TeX>{"2\\pi/5"}</TeX>.
      </P>

      <H id="w5" n="§5">General admissibility</H>
      <P>Two conditions decide whether an <TeX>{"\\{N/k\\}"}</TeX> umbrella exists.</P>
      <Step n="(A)">
        <strong>Obtuseness.</strong> <TeX>{"\\cos(2\\pi k/N)<0"}</TeX> holds iff{" "}
        <TeX>{"2\\pi k/N \\in (\\tfrac\\pi2,\\tfrac{3\\pi}2)"}</TeX>, i.e.
        <M tag="5.1">{"\\frac{N}{4} < k < \\frac{3N}{4}, \\qquad\\text{and by the } k\\leftrightarrow N-k \\text{ mirror symmetry it suffices to take } \\frac{N}{4}<k<\\frac{N}{2}."}</M>
      </Step>
      <Step n="(B)">
        <strong>Primitivity.</strong> The walk <TeX>{"i\\mapsto ik \\bmod N"}</TeX> visits all{" "}
        <TeX>{"N"}</TeX> rays iff <TeX>{"\\gcd(k,N)=1"}</TeX>. Otherwise it closes after{" "}
        <TeX>{"N/\\gcd(k,N)"}</TeX> steps and the configuration degenerates into{" "}
        <TeX>{"\\gcd(k,N)"}</TeX> disjoint smaller stars.
      </Step>
      <P>
        Moreover, when <TeX>{"\\gcd(k,N)=1"}</TeX> the identity{" "}
        <TeX>{"\\cos(m\\Delta\\phi)=\\cos(\\Delta\\phi)"}</TeX> holds only for{" "}
        <TeX>{"m\\equiv\\pm1 \\pmod N"}</TeX>, so the <em>only</em> orthogonal pairs are the cyclic
        neighbours: the orthogonality graph is exactly <TeX>{"C_N"}</TeX>, with no accidental
        extra edges. (The app verifies this numerically on the Gram matrix.)
      </P>
      <Tbl
        head={["N", "admissible k", "best k = (N−1)/2", "h²", "h"]}
        rows={[
          ["3", "1", "1", "1/3", "0.577350"],
          ["4", "— (none)", "—", "—", "—"],
          ["5", "2", "2", "1/√5", "0.668740"],
          ["7", "2, 3", "3", "0.473945", "0.688436"],
          ["9", "3, 4", "4", "0.484450", "0.696024"],
        ]}
      />
      <Note kind="key" title="FOR N = 5 THERE IS NO CHOICE">
        The window <TeX>{"1.25<k<2.5"}</TeX> contains the single integer{" "}
        <TeX>{"k=2"}</TeX>. The pentagram is not an aesthetic preference or a clever trick — it is
        the unique admissible wiring of five rays.
      </Note>
      <Refs items={[
        ["A. A. Klyachko et al. (2008)", "Simple test for hidden variables in spin-1 systems, PRL 101, 020403"],
        ["H. S. M. Coxeter (1973)", "Regular Polytopes, Dover — star polygons {n/k}"],
        ["D. Gross", "Lecture notes on quantum mechanics (the cone construction)"],
      ]} />
    </div>
  ),
};

/* ================================================================== */
/*  DERIVATION (KCBS)                                                  */
/* ================================================================== */
export const derivationDoc: DocSpec = {
  title: "The KCBS pentagram — complete derivation",
  subtitle: "FROM REFLECTIONS TO 5 − 4√5 · 8 SECTIONS",
  sections: [
    { id: "k0", n: "§0", t: "Setting and observables" },
    { id: "k1", n: "§1", t: "The cone and its height" },
    { id: "k2", n: "§2", t: "The probe state" },
    { id: "k3", n: "§3", t: "Product of two reflections" },
    { id: "k4", n: "§4", t: "The quantum value" },
    { id: "k5", n: "§5", t: "The classical bound" },
    { id: "k6", n: "§6", t: "Event form and the Lovász number" },
    { id: "k7", n: "§7", t: "Optimality and rigidity" },
  ],
  footer: [["h", "5⁻¹ᐟ⁴ = 0.6687403", CYAN], ["per edge", "1−4/√5 = −0.7888544", GOLD], ["Σ", "5−4√5 = −3.9442719", "#fb5c7a"]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="k0" n="§0">Setting and observables</H>
      <P>
        Work in <TeX>{"\\mathcal H=\\mathbb{C}^3"}</TeX> (a qutrit), with all rays chosen real, so
        effectively in <TeX>{"\\mathbb{R}^3"}</TeX>. Define five reflections
      </P>
      <M tag="0.1">{"\\hat S_i = 2|v_i\\rangle\\langle v_i| - \\mathbb{I}, \\qquad i\\in\\mathbb{Z}_5,\\quad \\|v_i\\|=1."}</M>
      <P>
        As shown in the winding document, <TeX>{"\\hat S_i^2=\\mathbb{I}"}</TeX> (so outcomes are{" "}
        <TeX>{"\\pm1"}</TeX>) and neighbours commute precisely when{" "}
        <TeX>{"\\langle v_i|v_{i+1}\\rangle=0"}</TeX>. Geometrically <TeX>{"\\hat S_i"}</TeX> is the
        reflection that fixes the axis <TeX>{"v_i"}</TeX> and negates its orthogonal plane:
      </P>
      <M tag="0.2">{"\\hat S_i|\\psi\\rangle = 2\\langle v_i|\\psi\\rangle\\,|v_i\\rangle - |\\psi\\rangle."}</M>
      <P>The quantity under test is the cyclic sum over the five commuting contexts:</P>
      <M tag="0.3">{"\\Sigma := \\sum_{i=1}^{5}\\big\\langle \\hat S_i\\hat S_{i+1}\\big\\rangle, \\qquad \\text{indices mod }5."}</M>

      <H id="k1" n="§1">The cone and its height</H>
      <P>
        By §1–§4 of the winding document, five-fold symmetry plus cyclic orthogonality forces the
        rays onto a cone with pitch <TeX>{"\\Delta\\phi=4\\pi/5"}</TeX> and
      </P>
      <M tag="1.1">{"v_i = \\Big(r\\cos\\tfrac{4\\pi i}{5},\\; r\\sin\\tfrac{4\\pi i}{5},\\; h\\Big),\\qquad r=\\sqrt{1-h^2},\\qquad h^2=\\frac{1}{\\sqrt5}."}</M>
      <P>
        Numerically <TeX>{"h=5^{-1/4}\\approx0.6687403"}</TeX>,{" "}
        <TeX>{"r\\approx0.7434934"}</TeX>, and the half-opening angle is{" "}
        <TeX>{"\\arccos h\\approx48.03^\\circ"}</TeX>.
      </P>

      <H id="k2" n="§2">The probe state</H>
      <P>
        Choose the state along the symmetry axis, <TeX>{"|\\psi\\rangle=|2\\rangle=(0,0,1)^{\\mathsf T}"}</TeX>.
        Then for every <TeX>{"i"}</TeX>,
      </P>
      <M tag="2.1">{"\\langle\\psi|v_i\\rangle = h \\quad\\Longrightarrow\\quad p_i := \\big|\\langle\\psi|v_i\\rangle\\big|^2 = h^2 = \\frac{1}{\\sqrt5} \\approx 0.4472136."}</M>
      <P>
        The axis is the unique direction giving all five rays equal weight; this "democracy" is what
        makes the five contexts statistically indistinguishable. The single-observable expectation
        is
      </P>
      <M tag="2.2">{"\\langle\\hat S_i\\rangle = 2p_i - 1 = \\frac{2}{\\sqrt5}-1 \\approx -0.1055728."}</M>
      <Note kind="info" title="WHY THE AXIS IS OPTIMAL">
        The frame operator <TeX>{"F=\\sum_i|v_i\\rangle\\langle v_i|"}</TeX> evaluates in closed
        form. Using <TeX>{"\\sum_i\\cos^2\\phi_i=\\sum_i\\sin^2\\phi_i=N/2"}</TeX> and{" "}
        <TeX>{"\\sum_i\\cos\\phi_i=\\sum_i\\sin\\phi_i=0"}</TeX> for{" "}
        <TeX>{"N\\ge3"}</TeX>,
        <M>{"F = \\operatorname{diag}\\Big(\\tfrac{Nr^2}{2},\\;\\tfrac{Nr^2}{2},\\;Nh^2\\Big) = \\operatorname{diag}(1.381966,\\,1.381966,\\,2.236068)."}</M>
        Since <TeX>{"\\sum_i p_i=\\langle\\psi|F|\\psi\\rangle"}</TeX>, the best state is the top
        eigenvector. Here <TeX>{"Nh^2=\\sqrt5 > Nr^2/2"}</TeX>, so the axis wins — and the maximum
        of <TeX>{"\\sum p_i"}</TeX> is exactly <TeX>{"\\sqrt5"}</TeX>.
      </Note>

      <H id="k3" n="§3">Product of two reflections</H>
      <P>Expand the product of two reflections in terms of projectors:</P>
      <M tag="3.1">{"\\hat S_i\\hat S_j = (2P_i-\\mathbb{I})(2P_j-\\mathbb{I}) = 4P_iP_j - 2P_i - 2P_j + \\mathbb{I}."}</M>
      <P>
        The cross term satisfies <TeX>{"P_iP_j = \\langle v_i|v_j\\rangle\\,|v_i\\rangle\\langle v_j|"}</TeX>.
        For orthogonal neighbours it vanishes <em>identically as an operator</em>:
      </P>
      <M tag="3.2">{"\\langle v_i|v_{i+1}\\rangle = 0 \\;\\Longrightarrow\\; \\hat S_i\\hat S_{i+1} = \\mathbb{I} - 2P_i - 2P_{i+1}."}</M>
      <P>Taking the expectation in an arbitrary state and using <TeX>{"\\langle P_i\\rangle=p_i"}</TeX>:</P>
      <M tag="3.3">{"\\boxed{\\;\\big\\langle \\hat S_i\\hat S_{i+1}\\big\\rangle = 1 - 2p_i - 2p_{i+1}\\;}"}</M>
      <P>
        For a general (non-orthogonal) pair the exact expression keeps the cross term,{" "}
        <TeX>{"\\langle\\hat S_i\\hat S_j\\rangle = 1-2p_i-2p_j+4\\langle v_i|v_j\\rangle\\langle\\psi|v_i\\rangle\\langle v_j|\\psi\\rangle"}</TeX>;
        the app evaluates this form so that off-root configurations are reported honestly.
      </P>

      <H id="k4" n="§4">The quantum value</H>
      <P>Substituting <TeX>{"p_i=p_{i+1}=h^2=1/\\sqrt5"}</TeX> into (3.3):</P>
      <M tag="4.1">{"\\big\\langle \\hat S_i\\hat S_{i+1}\\big\\rangle = 1-4h^2 = 1-\\frac{4}{\\sqrt5} = 1 - \\frac{4\\sqrt5}{5} \\approx -0.7888544."}</M>
      <P>All five edges are equal by symmetry, so</P>
      <M tag="4.2">{"\\boxed{\\;\\Sigma_{\\rm QM} = 5\\Big(1-\\frac{4}{\\sqrt5}\\Big) = 5 - \\frac{20}{\\sqrt5} = 5 - 4\\sqrt5 \\approx -3.9442719\\;}"}</M>
      <P>
        using <TeX>{"20/\\sqrt5 = 20\\sqrt5/5 = 4\\sqrt5"}</TeX>. The per-context average is{" "}
        <TeX>{"1-4/\\sqrt5\\approx-0.7888544"}</TeX>, against a classical floor of{" "}
        <TeX>{"-0.6"}</TeX>.
      </P>
      <H2>Joint outcome distribution</H2>
      <P>
        Because the two observables in a context commute, a genuine joint distribution exists:
      </P>
      <M tag="4.3">{"P(a,b) = \\tfrac14\\Big(1 + a\\langle\\hat S_i\\rangle + b\\langle\\hat S_{i+1}\\rangle + ab\\,\\langle\\hat S_i\\hat S_{i+1}\\rangle\\Big),\\qquad a,b\\in\\{\\pm1\\}."}</M>
      <Tbl
        head={["outcome", "exact", "decimal"]}
        rows={[
          ["P(+,+)", "0", "0.000000"],
          ["P(+,−)", <TeX>{"1/\\sqrt5"}</TeX>, "0.447214"],
          ["P(−,+)", <TeX>{"1/\\sqrt5"}</TeX>, "0.447214"],
          ["P(−,−)", <TeX>{"1-2/\\sqrt5"}</TeX>, "0.105573"],
        ]}
      />
      <P>
        The vanishing of <TeX>{"P(+,+)"}</TeX> is exactly orthogonality: two orthogonal rays cannot
        both "fire". This is the <em>exclusivity</em> structure exploited in §6.
      </P>

      <H id="k5" n="§5">The classical bound</H>
      <P>
        Suppose each observable carries a pre-existing, context-independent value{" "}
        <TeX>{"s_i\\in\\{\\pm1\\}"}</TeX>. Consider the product of all five edge terms:
      </P>
      <M tag="5.1">{"\\prod_{i=1}^{5} \\big(s_is_{i+1}\\big) = \\Big(\\prod_{i=1}^{5}s_i\\Big)^{\\!2} = +1,"}</M>
      <P>
        because each <TeX>{"s_i"}</TeX> appears in exactly two edges of the cycle. Each factor is{" "}
        <TeX>{"\\pm1"}</TeX>, so the number of factors equal to <TeX>{"-1"}</TeX> must be{" "}
        <strong>even</strong>. Let <TeX>{"m\\in\\{0,2,4\\}"}</TeX> be that number; then
      </P>
      <M tag="5.2">{"\\Sigma_{\\rm NC} = (5-m)(+1) + m(-1) = 5-2m \\in \\{5,\\,1,\\,-3\\}."}</M>
      <M tag="5.3">{"\\boxed{\\;\\Sigma_{\\rm NC}\\ \\ge\\ -3\\;}"}</M>
      <P>
        Averaging over any distribution of assignments preserves the bound by convexity. Direct
        enumeration of all <TeX>{"2^5=32"}</TeX> assignments confirms the distribution{" "}
        <TeX>{"\\Sigma=5"}</TeX> (2 assignments), <TeX>{"\\Sigma=1"}</TeX> (20),{" "}
        <TeX>{"\\Sigma=-3"}</TeX> (10). The value <TeX>{"-3.944"}</TeX> is simply not in the list.
      </P>
      <Note kind="key" title="ODD CYCLES ONLY">
        The argument uses that <TeX>{"C_5"}</TeX> is an <em>odd</em> cycle: you cannot two-colour it,
        so not all edges can be made <TeX>{"-1"}</TeX>. For even <TeX>{"N"}</TeX> the alternating
        assignment gives every edge <TeX>{"-1"}</TeX> and the classical minimum is the algebraic
        one, <TeX>{"-N"}</TeX> — leaving no room for a quantum violation. Frustration is the
        resource.
      </Note>

      <H id="k6" n="§6">Event form and the Lovász number</H>
      <P>
        Using <TeX>{"\\langle\\hat S_i\\hat S_{i+1}\\rangle = 1-2p_i-2p_{i+1}"}</TeX> and summing
        over the cycle, each <TeX>{"p_i"}</TeX> appears in two edges:
      </P>
      <M tag="6.1">{"\\Sigma = \\sum_{i=1}^{N}\\big(1-2p_i-2p_{i+1}\\big) = N - 4\\sum_{i=1}^{N} p_i."}</M>
      <P>
        So the spin inequality is equivalent to a bound on the total event probability. The
        classical bound <TeX>{"\\Sigma\\ge N-4\\alpha"}</TeX> becomes
      </P>
      <M tag="6.2">{"\\sum_i p_i \\;\\le\\; \\alpha(C_N) = \\Big\\lfloor \\tfrac{N}{2}\\Big\\rfloor,"}</M>
      <P>
        where <TeX>{"\\alpha"}</TeX> is the <em>independence number</em>: the largest set of
        pairwise non-adjacent vertices, i.e. the most events that can simultaneously be assigned
        "+1" given that neighbours are exclusive. For <TeX>{"C_5"}</TeX>,{" "}
        <TeX>{"\\alpha=2"}</TeX> and <TeX>{"N-4\\alpha=-3"}</TeX>, reproducing §5.
      </P>
      <P>The quantum maximum of the same sum is the <strong>Lovász theta number</strong>:</P>
      <M tag="6.3">{"\\vartheta(C_N) = \\frac{N\\cos(\\pi/N)}{1+\\cos(\\pi/N)} \\qquad (N \\text{ odd}), \\qquad \\vartheta(C_5)=\\sqrt5."}</M>
      <P>
        Our construction attains it: <TeX>{"\\sum_i p_i = Nh^2 = 5\\cdot\\tfrac{1}{\\sqrt5}=\\sqrt5"}</TeX>.
        Indeed with <TeX>{"h^2=\\cos\\chi/(1+\\cos\\chi)"}</TeX> and{" "}
        <TeX>{"\\chi=\\pi/N"}</TeX> at the maximal pitch <TeX>{"k=(N-1)/2"}</TeX>, the identity{" "}
        <TeX>{"Nh^2=\\vartheta(C_N)"}</TeX> is exact — the KCBS cone <em>is</em> the Lovász optimum.
      </P>
      <Tbl
        head={["N", "α(C_N)", "ϑ(C_N)", "gap ϑ−α", "Σ_QM = N−4ϑ"]}
        rows={[
          ["3", "1", "1.000000", "0.000000", "−1.000000"],
          ["5", "2", "2.236068", "0.236068", "−3.944272"],
          ["7", "3", "3.317667", "0.317667", "−6.270668"],
          ["9", "4", "4.360090", "0.360090", "−8.440359"],
          ["11", "5", "5.386303", "0.386303", "−10.545210"],
        ]}
      />

      <H id="k7" n="§7">Optimality and rigidity</H>
      <P>
        Is <TeX>{"5-4\\sqrt5"}</TeX> the best a qutrit can do? Yes. By (6.1) minimising{" "}
        <TeX>{"\\Sigma"}</TeX> means maximising <TeX>{"\\sum_ip_i"}</TeX> subject to the
        exclusivity constraints <TeX>{"p_i+p_{i+1}\\le1"}</TeX> arising from{" "}
        <TeX>{"v_i\\perp v_{i+1}"}</TeX>. Lovász's theorem states that for any orthonormal
        representation of the graph, <TeX>{"\\sum_ip_i\\le\\vartheta"}</TeX>. Hence
      </P>
      <M tag="7.1">{"\\Sigma_{\\rm QM} \\;\\ge\\; N-4\\vartheta(C_5) = 5-4\\sqrt5,"}</M>
      <P>and the cone construction saturates it. The violation depth is</P>
      <M tag="7.2">{"\\Sigma_{\\rm NC}-\\Sigma_{\\rm QM} = -3-(5-4\\sqrt5) = 4\\sqrt5-8 \\approx 0.9442719."}</M>
      <Note kind="key" title="DIMENSION THREE IS NECESSARY">
        In <TeX>{"\\mathbb{C}^2"}</TeX> any two distinct rays span the whole space, so
        orthogonality of <TeX>{"v_i,v_{i+1}"}</TeX> and of{" "}
        <TeX>{"v_{i+1},v_{i+2}"}</TeX> would force <TeX>{"v_i=\\pm v_{i+2}"}</TeX>, collapsing the
        cycle. Contextuality requires <TeX>{"d\\ge3"}</TeX> (Kochen–Specker), and{" "}
        <TeX>{"C_5"}</TeX> is the smallest odd cycle with{" "}
        <TeX>{"\\vartheta>\\alpha"}</TeX>. KCBS is therefore minimal in both dimension and
        number of measurements.
      </Note>
      <Refs items={[
        ["A. A. Klyachko, M. A. Can, S. Binicioğlu, A. S. Shumovsky (2008)", "PRL 101, 020403"],
        ["L. Lovász (1979)", "On the Shannon capacity of a graph, IEEE Trans. Inf. Theory 25, 1"],
        ["A. Cabello, S. Severini, A. Winter (2014)", "PRL 112, 040401"],
        ["M. Araújo et al. (2013)", "All noncontextuality inequalities for the n-cycle scenario, PRA 88, 022118"],
      ]} />
    </div>
  ),
};

/* ================================================================== */
/*  PLAYGROUND                                                         */
/* ================================================================== */
export const playgroundDoc: DocSpec = {
  title: "N-cycle umbrellas — the general theory",
  subtitle: "GRAM MATRICES, FRAME OPERATORS, THETA BODIES · 6 SECTIONS",
  sections: [
    { id: "p0", n: "§0", t: "The umbrella family" },
    { id: "p1", n: "§1", t: "Gram matrix and its spectrum" },
    { id: "p2", n: "§2", t: "The frame operator and optimal states" },
    { id: "p3", n: "§3", t: "Witnesses in two equivalent forms" },
    { id: "p4", n: "§4", t: "The three graph invariants" },
    { id: "p5", n: "§5", t: "The sweep, explained" },
  ],
  footer: [["α(C_N)", "⌊N/2⌋", GOLD], ["ϑ(C_N)", "N cos(π/N)/(1+cos(π/N))", CYAN], ["α*(C_N)", "N/2", VIOLET]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="p0" n="§0">The umbrella family</H>
      <P>
        Generalise KCBS to any cycle length. Fix <TeX>{"N\\ge3"}</TeX> and an admissible winding{" "}
        <TeX>{"k"}</TeX> (see the winding document: <TeX>{"N/4<k<N/2"}</TeX>,{" "}
        <TeX>{"\\gcd(k,N)=1"}</TeX>). Define
      </P>
      <M tag="0.1">{"v_i = \\big(r\\cos(i\\Delta),\\, r\\sin(i\\Delta),\\, h\\big), \\quad \\Delta=\\tfrac{2\\pi k}{N}, \\quad h^2=\\frac{\\cos\\chi}{1+\\cos\\chi},\\quad \\chi=\\frac{\\pi(N-2k)}{N}."}</M>
      <P>
        We call this the <TeX>{"\\{N/k\\}"}</TeX> <em>umbrella</em>: <TeX>{"N"}</TeX> unit ribs on a
        cone of height <TeX>{"h"}</TeX>, with cyclically orthogonal neighbours.
      </P>

      <H id="p1" n="§1">Gram matrix and its spectrum</H>
      <P>The Gram matrix <TeX>{"G_{ij}=\\langle v_i|v_j\\rangle"}</TeX> is circulant:</P>
      <M tag="1.1">{"G_{ij} = (1-h^2)\\cos\\big((i-j)\\Delta\\big) + h^2 = r^2\\cos\\big((i-j)\\Delta\\big) + h^2."}</M>
      <P>
        Its eigenvalues follow from the discrete Fourier transform of the first row. Writing{" "}
        <TeX>{"\\omega=e^{2\\pi i/N}"}</TeX>, the circulant eigenvalues are{" "}
        <TeX>{"\\lambda_m=\\sum_{d}G_{0d}\\,\\omega^{md}"}</TeX>. Since{" "}
        <TeX>{"\\cos(d\\Delta)=\\tfrac12(\\omega^{kd}+\\omega^{-kd})"}</TeX> and{" "}
        <TeX>{"\\sum_d\\omega^{md}=N\\delta_{m,0}"}</TeX>, only three modes survive:
      </P>
      <M tag="1.2">{"\\boxed{\\;\\operatorname{spec}(G) = \\Big\\{\\,Nh^2,\\;\\tfrac{Nr^2}{2},\\;\\tfrac{Nr^2}{2},\\;\\underbrace{0,\\dots,0}_{N-3}\\,\\Big\\}\\;}"}</M>
      <P>
        Exactly three non-zero eigenvalues: the umbrella genuinely lives in{" "}
        <TeX>{"\\mathbb{R}^3"}</TeX> and has full rank there. The trace check is immediate:{" "}
        <TeX>{"Nh^2+Nr^2 = N"}</TeX>, matching <TeX>{"\\operatorname{tr}G=N"}</TeX> since every
        diagonal entry is 1.
      </P>
      <Note kind="info" title="THE ORTHOGONALITY-GRAPH CERTIFICATE">
        For <TeX>{"\\gcd(k,N)=1"}</TeX>, <TeX>{"G_{ij}=0"}</TeX> happens exactly when{" "}
        <TeX>{"\\cos((i-j)\\Delta) = -h^2/r^2 = \\cos\\Delta"}</TeX>, which for a primitive step
        occurs only for <TeX>{"i-j\\equiv\\pm1"}</TeX>. Hence the orthogonality graph is precisely{" "}
        <TeX>{"C_N"}</TeX> with no extra edges — the app tests every off-diagonal entry to confirm
        this at run time.
      </Note>

      <H id="p2" n="§2">The frame operator and optimal states</H>
      <P>
        The total event probability for a state <TeX>{"|\\psi\\rangle"}</TeX> is a quadratic form:
      </P>
      <M tag="2.1">{"\\sum_{i=1}^N p_i = \\sum_i |\\langle\\psi|v_i\\rangle|^2 = \\langle\\psi|F|\\psi\\rangle, \\qquad F := \\sum_{i=1}^{N}|v_i\\rangle\\langle v_i|."}</M>
      <P>
        Evaluate <TeX>{"F"}</TeX> using the elementary sums{" "}
        <TeX>{"\\sum_i\\cos\\phi_i=\\sum_i\\sin\\phi_i=0"}</TeX>,{" "}
        <TeX>{"\\sum_i\\cos^2\\phi_i=\\sum_i\\sin^2\\phi_i=N/2"}</TeX>, and{" "}
        <TeX>{"\\sum_i\\cos\\phi_i\\sin\\phi_i=0"}</TeX> (valid for <TeX>{"N\\ge3"}</TeX>):
      </P>
      <M tag="2.2">{"\\boxed{\\;F = \\operatorname{diag}\\Big(\\tfrac{Nr^2}{2},\\;\\tfrac{Nr^2}{2},\\;Nh^2\\Big)\\;}"}</M>
      <P>
        <TeX>{"F"}</TeX> is diagonal in the cone frame. Maximising a quadratic form over unit
        vectors gives the largest eigenvalue, so
      </P>
      <M tag="2.3">{"\\max_{\\psi}\\sum_i p_i = \\max\\Big\\{Nh^2,\\ \\tfrac{Nr^2}{2}\\Big\\},"}</M>
      <P>
        attained by the cone axis <TeX>{"\\hat z"}</TeX> when{" "}
        <TeX>{"h^2\\ge r^2/2"}</TeX>, and by any equatorial direction otherwise. This is exactly the
        rule behind the playground's "optimal <TeX>{"\\psi^\\star"}</TeX>" mode: for tall cones the
        apex wins; for flat ones the optimum tilts into the equator.
      </P>

      <H id="p3" n="§3">Witnesses in two equivalent forms</H>
      <P>Orthogonal neighbours give the exact identity (derived in the KCBS document)</P>
      <M tag="3.1">{"\\langle\\hat S_i\\hat S_{i+1}\\rangle = 1-2p_i-2p_{i+1} \\;\\Longrightarrow\\; \\Sigma = N - 4\\sum_i p_i."}</M>
      <P>So the "spin" and "event" witnesses are affinely equivalent:</P>
      <Tbl
        head={["form", "quantity", "classical bound", "quantum bound"]}
        rows={[
          ["event", <TeX>{"\\sum_i p_i"}</TeX>, <TeX>{"\\le \\alpha(C_N)"}</TeX>, <TeX>{"\\le \\vartheta(C_N)"}</TeX>],
          ["spin", <TeX>{"\\sum_i\\langle\\hat S_i\\hat S_{i+1}\\rangle"}</TeX>, <TeX>{"\\ge N-4\\alpha"}</TeX>, <TeX>{"\\ge N-4\\vartheta"}</TeX>],
        ]}
      />
      <P>
        Because the map <TeX>{"x\\mapsto N-4x"}</TeX> is decreasing, maximal event probability
        corresponds to minimal spin correlation. The app shows both, always consistent.
      </P>

      <H id="p4" n="§4">The three graph invariants</H>
      <P>
        Lovász's sandwich theorem places the quantum set between two classical polytopes for any
        graph <TeX>{"\\Gamma"}</TeX>:
      </P>
      <M tag="4.1">{"\\operatorname{STAB}(\\Gamma) \\;\\subseteq\\; \\operatorname{TH}(\\Gamma) \\;\\subseteq\\; \\operatorname{QSTAB}(\\Gamma)"}</M>
      <P>whose maxima along the all-ones direction are, respectively,</P>
      <Tbl
        head={["invariant", "meaning", "value for C_N (odd)", "C₅"]}
        rows={[
          [<TeX>{"\\alpha(\\Gamma)"}</TeX>, "independence number — largest set of pairwise non-adjacent vertices", <TeX>{"(N-1)/2"}</TeX>, "2"],
          [<TeX>{"\\vartheta(\\Gamma)"}</TeX>, "Lovász number — SDP relaxation, quantum ceiling", <TeX>{"\\frac{N\\cos(\\pi/N)}{1+\\cos(\\pi/N)}"}</TeX>, "√5 ≈ 2.2361"],
          [<TeX>{"\\alpha^*(\\Gamma)"}</TeX>, "fractional packing — LP relaxation, no-signalling ceiling", <TeX>{"N/2"}</TeX>, "2.5"],
        ]}
      />
      <P>
        For odd cycles all three differ, which is why odd cycles are the canonical contextuality
        scenarios. For <em>even</em> cycles the graph is bipartite and{" "}
        <TeX>{"\\alpha=\\vartheta=\\alpha^*=N/2"}</TeX>: the sandwich collapses and no quantum
        advantage exists at all.
      </P>
      <Note kind="key" title="THE CONE ATTAINS ϑ EXACTLY">
        At the maximal admissible winding <TeX>{"k=(N-1)/2"}</TeX> we get{" "}
        <TeX>{"\\chi=\\pi/N"}</TeX>, hence{" "}
        <TeX>{"h^2=\\frac{\\cos(\\pi/N)}{1+\\cos(\\pi/N)}"}</TeX> and
        <M>{"\\sum_i p_i = Nh^2 = \\frac{N\\cos(\\pi/N)}{1+\\cos(\\pi/N)} = \\vartheta(C_N)."}</M>
        The umbrella is not an approximation to the optimum — it <em>is</em> the Lovász-optimal
        orthonormal representation, and the sweep table verifies the equality numerically for every
        odd N from 3 to 11.
      </Note>

      <H id="p5" n="§5">The sweep, explained</H>
      <P>The discovery table performs, for each <TeX>{"N"}</TeX>:</P>
      <Step n="(1)">
        enumerate admissible <TeX>{"k"}</TeX> via <TeX>{"\\cos(2\\pi k/N)<0"}</TeX> and{" "}
        <TeX>{"\\gcd(k,N)=1"}</TeX>;
      </Step>
      <Step n="(2)">
        for each, build the cone from (0.1), diagonalise the frame operator, and record{" "}
        <TeX>{"\\max_\\psi\\sum_i p_i"}</TeX> from (2.3);
      </Step>
      <Step n="(3)">
        compare with <TeX>{"\\alpha(C_N)"}</TeX> and report the gap.
      </Step>
      <Tbl
        head={["N", "admissible k", "best", "Σpᵢ*", "α", "verdict"]}
        rows={[
          ["3", "1", "{3/1}", "1.000000", "1", "no gap (ϑ = α)"],
          ["4", "—", "—", "—", "2", "no cone exists"],
          ["5", "2", "{5/2}", "2.236068", "2", "violates · = ϑ"],
          ["6", "—", "—", "—", "3", "no cone exists"],
          ["7", "2, 3", "{7/3}", "3.317667", "3", "violates · = ϑ"],
          ["8", "3", "{8/3}", "3.313708", "4", "even — no gap"],
          ["9", "3, 4", "{9/4}", "4.360090", "4", "violates · = ϑ"],
        ]}
      />
      <P>
        Note <TeX>{"N=4"}</TeX> and <TeX>{"N=6"}</TeX>: the admissibility window{" "}
        <TeX>{"(N/4,N/2)"}</TeX> contains no integer coprime to <TeX>{"N"}</TeX>, so no symmetric
        orthogonal cone exists at all. And for <TeX>{"N=8"}</TeX> a cone exists but{" "}
        <TeX>{"\\sum p_i = 3.3137 < 4 = \\alpha"}</TeX> — geometry alone is not enough; the cycle
        must also be odd.
      </P>
      <Refs items={[
        ["L. Lovász (1979)", "On the Shannon capacity of a graph, IEEE Trans. Inf. Theory 25, 1"],
        ["D. Knuth (1994)", "The sandwich theorem, Electron. J. Combin. 1, A1"],
        ["M. Araújo et al. (2013)", "All noncontextuality inequalities for the n-cycle scenario, PRA 88, 022118"],
        ["A. Cabello, S. Severini, A. Winter (2014)", "PRL 112, 040401"],
      ]} />
    </div>
  ),
};

/* ================================================================== */
/*  CLASSICAL GAME                                                     */
/* ================================================================== */
export const classicalDoc: DocSpec = {
  title: "The classical floor — parity on an odd cycle",
  subtitle: "WHY −3 IS A WALL · 5 SECTIONS",
  sections: [
    { id: "g0", n: "§0", t: "The assignment model" },
    { id: "g1", n: "§1", t: "The parity lemma" },
    { id: "g2", n: "§2", t: "Complete enumeration" },
    { id: "g3", n: "§3", t: "Graph-theoretic restatement" },
    { id: "g4", n: "§4", t: "Even cycles and why they fail" },
  ],
  footer: [["reachable sums", "{5, 1, −3}", GOLD], ["counts", "2 / 20 / 10", CYAN], ["quantum", "−3.9442719", "#fb5c7a"]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="g0" n="§0">The assignment model</H>
      <P>
        A non-contextual model assigns to each observable a definite value{" "}
        <TeX>{"s_i\\in\\{+1,-1\\}"}</TeX>, independent of which context it is measured in. The
        observed correlation in the context <TeX>{"\\{i,i+1\\}"}</TeX> is then the product
      </P>
      <M tag="0.1">{"\\langle \\hat S_i\\hat S_{i+1}\\rangle = s_is_{i+1}, \\qquad \\Sigma(s) = \\sum_{i\\in\\mathbb{Z}_N} s_is_{i+1}."}</M>
      <P>
        A general (randomised) non-contextual model is a probability distribution{" "}
        <TeX>{"q"}</TeX> over assignments, giving{" "}
        <TeX>{"\\Sigma = \\sum_s q(s)\\Sigma(s)"}</TeX>. Since this is a convex combination, the
        extremes are attained by deterministic assignments — it suffices to bound{" "}
        <TeX>{"\\Sigma(s)"}</TeX>.
      </P>

      <H id="g1" n="§1">The parity lemma</H>
      <P>
        Let <TeX>{"e_i := s_is_{i+1} \\in\\{\\pm1\\}"}</TeX> be the edge variables. Their product
        over the whole cycle telescopes:
      </P>
      <M tag="1.1">{"\\prod_{i=1}^{N} e_i = \\prod_{i=1}^{N} s_is_{i+1} = \\prod_{i=1}^{N}s_i \\cdot \\prod_{i=1}^{N}s_{i+1} = \\Big(\\prod_{i=1}^{N}s_i\\Big)^{\\!2} = +1,"}</M>
      <P>
        because the cyclic shift <TeX>{"i\\mapsto i+1"}</TeX> is a bijection of{" "}
        <TeX>{"\\mathbb{Z}_N"}</TeX>, so both products run over the same multiset. Therefore:
      </P>
      <Note kind="key" title="PARITY LEMMA">
        The number <TeX>{"m"}</TeX> of edges carrying <TeX>{"e_i=-1"}</TeX> is <strong>even</strong>,
        for any assignment and any cycle length. The frustrated edges always come in pairs — you
        cannot "close the loop" with an odd number of sign flips.
      </Note>
      <P>Counting, <TeX>{"\\Sigma = (N-m)-m = N-2m"}</TeX> with <TeX>{"m"}</TeX> even. For <TeX>{"N=5"}</TeX>:</P>
      <M tag="1.2">{"m\\in\\{0,2,4\\} \\;\\Longrightarrow\\; \\Sigma \\in \\{5,\\,1,\\,-3\\} \\;\\Longrightarrow\\; \\boxed{\\Sigma \\ge -3}."}</M>
      <P>
        The crucial point is that <TeX>{"m=5"}</TeX> (all edges frustrated) is <em>parity-forbidden</em>.
        Were it allowed we would get <TeX>{"\\Sigma=-5"}</TeX>, the algebraic minimum.
      </P>

      <H id="g2" n="§2">Complete enumeration</H>
      <P>
        There are <TeX>{"2^5=32"}</TeX> assignments. Global inversion{" "}
        <TeX>{"s\\mapsto-s"}</TeX> leaves every product fixed, so they pair into 16 classes. Direct
        enumeration gives:
      </P>
      <Tbl
        head={["m (frustrated edges)", "Σ = 5 − 2m", "# assignments", "example"]}
        rows={[
          ["0", "+5", "2", "(+,+,+,+,+)"],
          ["2", "+1", "20", "(+,+,+,+,−)"],
          ["4", "−3", "10", "(+,+,−,+,−)"],
          ["1, 3, 5", "— (parity-forbidden)", "0", "—"],
        ]}
      />
      <P>
        Total <TeX>{"2+20+10=32"}</TeX>. ✓ The classical optimum <TeX>{"-3"}</TeX> is attained by
        10 assignments — those with exactly one "aligned" edge in the star ordering.
      </P>
      <P>
        Since the quantum prediction is <TeX>{"5-4\\sqrt5\\approx-3.9443"}</TeX>, and the nearest
        classical value below <TeX>{"-3"}</TeX> would be <TeX>{"-5"}</TeX>, the quantum value falls
        in a gap that <em>no</em> classical world occupies — not even approximately.
      </P>

      <H id="g3" n="§3">Graph-theoretic restatement</H>
      <P>
        Substituting <TeX>{"s_i=2t_i-1"}</TeX> with <TeX>{"t_i\\in\\{0,1\\}"}</TeX> and using the
        event form <TeX>{"\\Sigma=N-4\\sum_ip_i"}</TeX> from the KCBS document, the bound{" "}
        <TeX>{"\\Sigma\\ge-3"}</TeX> reads
      </P>
      <M tag="3.1">{"\\sum_{i} p_i \\le \\alpha(C_5) = 2,"}</M>
      <P>
        where <TeX>{"\\alpha"}</TeX> is the independence number. The interpretation is exact: the
        events "<TeX>{"\\hat S_i=+1"}</TeX>" are pairwise exclusive along edges, so a deterministic
        model can set at most an independent set of them to certainty. In the pentagon that is 2 of
        5 vertices; in <TeX>{"C_N"}</TeX> it is <TeX>{"\\lfloor N/2\\rfloor"}</TeX>.
      </P>
      <M tag="3.2">{"\\alpha(C_N)=\\Big\\lfloor\\frac{N}{2}\\Big\\rfloor, \\qquad \\Sigma_{\\min}^{\\rm NC} = N-4\\Big\\lfloor\\frac{N}{2}\\Big\\rfloor = \\begin{cases}-N & N \\text{ even}\\\\ 2-N & N \\text{ odd}\\end{cases}"}</M>

      <H id="g4" n="§4">Even cycles and why they fail</H>
      <P>
        For even <TeX>{"N"}</TeX> the cycle is bipartite: colour vertices alternately and set{" "}
        <TeX>{"s_i=+1"}</TeX> on one class, <TeX>{"-1"}</TeX> on the other. Every edge joins
        opposite classes, so <TeX>{"e_i=-1"}</TeX> for all <TeX>{"i"}</TeX> — and{" "}
        <TeX>{"m=N"}</TeX> is even, so parity permits it. Hence
      </P>
      <M tag="4.1">{"\\Sigma_{\\min}^{\\rm NC} = -N \\quad (N \\text{ even}),"}</M>
      <P>
        which is already the algebraic minimum. There is nothing left for quantum mechanics to win,
        consistent with <TeX>{"\\alpha=\\vartheta=N/2"}</TeX> for bipartite graphs.
      </P>
      <Note kind="key" title="FRUSTRATION IS THE RESOURCE">
        Contextuality in the cycle scenario is exactly the impossibility of two-colouring an odd
        cycle. The gap <TeX>{"\\vartheta-\\alpha>0"}</TeX> exists only for odd{" "}
        <TeX>{"N\\ge5"}</TeX> (for <TeX>{"N=3"}</TeX>, <TeX>{"\\vartheta=\\alpha=1"}</TeX> and the
        quantum point merely touches the facet). Odd-cycle frustration, the same phenomenon that
        makes antiferromagnets interesting, is being used here as a quantum resource.
      </Note>
      <Refs items={[
        ["A. A. Klyachko et al. (2008)", "PRL 101, 020403"],
        ["M. Araújo et al. (2013)", "PRA 88, 022118 — complete n-cycle inequality list"],
        ["A. Fine (1982)", "Hidden variables, joint probability, and the Bell inequalities, PRL 48, 291"],
      ]} />
    </div>
  ),
};
