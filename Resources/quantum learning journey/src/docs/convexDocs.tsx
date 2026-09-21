import { TeX } from "../components/TeX";
import { H, H2, P, M, Note, Step, Tbl, Refs, type DocSpec } from "./atoms";

const GOLD = "#e8b45c", CYAN = "#6fdcf7", VIOLET = "#a78bfa", NEON = "#7CFFB2";

/* ================================================================== */
/*  POLYTOPE LAB                                                       */
/* ================================================================== */
export const polytopeDoc: DocSpec = {
  title: "The monolith polytope — V-representation to H-representation",
  subtitle: "EIGHT WORLDS, FOUR CORNERS, ONE TETRAHEDRON · 7 SECTIONS",
  sections: [
    { id: "t0", n: "§0", t: "The n = 3 scenario" },
    { id: "t1", n: "§1", t: "V-representation: 8 → 4" },
    { id: "t2", n: "§2", t: "Minkowski–Weyl and facet enumeration" },
    { id: "t3", n: "§3", t: "The four facets, computed" },
    { id: "t4", n: "§4", t: "Barycentric coordinates = slacks" },
    { id: "t5", n: "§5", t: "Symmetry group" },
    { id: "t6", n: "§6", t: "Why quantum cannot escape" },
  ],
  footer: [["vertices", "4", GOLD], ["facets", "4", CYAN], ["edge", "2√2 = 2.8284271", VIOLET], ["volume", "8/3", NEON]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="t0" n="§0">The n = 3 scenario</H>
      <P>
        Three dichotomic observables <TeX>{"S_1,S_2,S_3\\in\\{\\pm1\\}"}</TeX>, with all three pairs
        jointly measurable — the compatibility graph is the triangle <TeX>{"C_3"}</TeX>. The
        experiment reports three correlators, assembled into a vector in{" "}
        <TeX>{"\\mathbb{R}^3"}</TeX>:
      </P>
      <M tag="0.1">{"\\vec x = (x_1,x_2,x_3) := \\big(\\langle S_1S_2\\rangle,\\ \\langle S_2S_3\\rangle,\\ \\langle S_3S_1\\rangle\\big) \\in [-1,1]^3."}</M>
      <P>
        We ask: which <TeX>{"\\vec x"}</TeX> admit a non-contextual explanation? The answer is a
        concrete solid body, and this scenario is small enough to compute it completely by hand.
      </P>

      <H id="t1" n="§1">V-representation: 8 → 4</H>
      <P>
        A deterministic assignment is a triple <TeX>{"s=(s_1,s_2,s_3)\\in\\{\\pm1\\}^3"}</TeX>, of
        which there are <TeX>{"2^3=8"}</TeX>. It maps to
      </P>
      <M tag="1.1">{"\\Phi(s) = (s_1s_2,\\; s_2s_3,\\; s_3s_1)."}</M>
      <P>
        <strong>Claim.</strong> <TeX>{"\\Phi"}</TeX> is exactly two-to-one, with fibres the pairs{" "}
        <TeX>{"\\{s,-s\\}"}</TeX>.
      </P>
      <Step n="(⊇)">
        Global inversion gives <TeX>{"(-s_i)(-s_j)=s_is_j"}</TeX>, so{" "}
        <TeX>{"\\Phi(-s)=\\Phi(s)"}</TeX>: each image is hit at least twice.
      </Step>
      <Step n="(⊆)">
        Conversely, suppose <TeX>{"\\Phi(s)=\\Phi(s')"}</TeX>. Put{" "}
        <TeX>{"u_i=s_i s_i'\\in\\{\\pm1\\}"}</TeX>. Then{" "}
        <TeX>{"u_1u_2 = (s_1s_2)(s_1's_2')=+1"}</TeX>, and likewise{" "}
        <TeX>{"u_2u_3=u_3u_1=+1"}</TeX>. Hence all <TeX>{"u_i"}</TeX> are equal, i.e.{" "}
        <TeX>{"s'=\\pm s"}</TeX>. ∎
      </Step>
      <P>
        So the image has exactly <TeX>{"8/2=4"}</TeX> points. Note also the constraint{" "}
        <TeX>{"x_1x_2x_3 = (s_1s_2s_3)^2 = +1"}</TeX>: the product of the three coordinates is
        always <TeX>{"+1"}</TeX>, which is why only the four sign patterns with an even number of
        minus signs occur.
      </P>
      <Tbl
        head={["vertex", "coordinates", "from assignments", "Σxᵢ"]}
        rows={[
          [<span style={{ color: CYAN }}>v₁</span>, "(+1, +1, +1)", "(+,+,+) and (−,−,−)", "+3"],
          [<span style={{ color: GOLD }}>v₂</span>, "(+1, −1, −1)", "(+,+,−) and (−,−,+)", "−1"],
          [<span style={{ color: VIOLET }}>v₃</span>, "(−1, −1, +1)", "(+,−,+) and (−,+,−)", "−1"],
          [<span style={{ color: "#fb5c7a" }}>v₄</span>, "(−1, +1, −1)", "(+,−,−) and (−,+,+)", "−1"],
        ]}
      />
      <P>The non-contextual set is the convex hull</P>
      <M tag="1.2">{"\\mathcal{L} = \\operatorname{conv}\\{\\vec v_1,\\vec v_2,\\vec v_3,\\vec v_4\\}."}</M>

      <H id="t2" n="§2">Minkowski–Weyl and facet enumeration</H>
      <P>
        The four vertices are affinely independent: the edge vectors from <TeX>{"v_1"}</TeX> are{" "}
        <TeX>{"(0,-2,-2),(-2,-2,0),(-2,0,-2)"}</TeX>, whose determinant is{" "}
        <TeX>{"-16\\ne0"}</TeX>. Hence <TeX>{"\\mathcal L"}</TeX> is a <strong>3-simplex</strong>{" "}
        with exactly <TeX>{"\\binom{4}{3}=4"}</TeX> facets, <TeX>{"\\binom42=6"}</TeX> edges and 4
        vertices (Euler: <TeX>{"4-6+4=2"}</TeX> ✓).
      </P>
      <P>
        By the Minkowski–Weyl theorem the hull equals an intersection of half-spaces. For each
        triple of vertices we compute the supporting plane:
      </P>
      <Step n="(1)">pick three vertices <TeX>{"v_a,v_b,v_c"}</TeX>;</Step>
      <Step n="(2)">form edge vectors <TeX>{"\\vec u=v_b-v_a"}</TeX>, <TeX>{"\\vec w=v_c-v_a"}</TeX>;</Step>
      <Step n="(3)">take the normal <TeX>{"\\vec n=\\vec u\\times\\vec w"}</TeX>;</Step>
      <Step n="(4)">
        set <TeX>{"d=\\vec n\\cdot v_a"}</TeX> and orient the sign so the excluded vertex satisfies{" "}
        <TeX>{"\\vec n\\cdot v_{\\rm out}\\ge d"}</TeX>.
      </Step>

      <H id="t3" n="§3">The four facets, computed</H>
      <H2>Worked example: the facet opposite v₁</H2>
      <P>Take <TeX>{"v_2=(1,-1,-1)"}</TeX>, <TeX>{"v_3=(-1,-1,1)"}</TeX>, <TeX>{"v_4=(-1,1,-1)"}</TeX>:</P>
      <M tag="3.1">{"\\vec u = v_3-v_2 = (-2,0,2), \\qquad \\vec w = v_4-v_2 = (-2,2,0)."}</M>
      <M tag="3.2">{"\\vec n = \\vec u\\times\\vec w = \\begin{pmatrix} 0\\cdot0 - 2\\cdot2 \\\\ 2\\cdot(-2) - (-2)\\cdot 0 \\\\ (-2)\\cdot2 - 0\\cdot(-2)\\end{pmatrix} = \\begin{pmatrix}-4\\\\-4\\\\-4\\end{pmatrix} \\;\\propto\\; \\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}."}</M>
      <P>
        With <TeX>{"\\vec n=(1,1,1)"}</TeX>: <TeX>{"d=\\vec n\\cdot v_2 = 1-1-1=-1"}</TeX>, and the
        excluded vertex gives <TeX>{"\\vec n\\cdot v_1 = 3\\ge-1"}</TeX> ✓. So
      </P>
      <M tag="3.3">{"F_1:\\quad x_1+x_2+x_3\\ \\ge\\ -1 \\qquad\\Longleftrightarrow\\qquad \\langle S_1S_2\\rangle+\\langle S_2S_3\\rangle+\\langle S_3S_1\\rangle \\ \\ge\\ -1."}</M>
      <Note kind="key" title="A STRIKING COINCIDENCE">
        Repeating for the other three triples gives normals{" "}
        <TeX>{"(1,-1,-1),(-1,-1,1),(-1,1,-1)"}</TeX> — the facet normals are <em>precisely the
        vertices themselves</em>, <TeX>{"\\vec n_i = \\vec v_i"}</TeX>, each with{" "}
        <TeX>{"d=-1"}</TeX>. This is the self-duality of the regular simplex centred at the origin.
        One verifies <TeX>{"\\vec v_i\\cdot\\vec v_i=3"}</TeX> and{" "}
        <TeX>{"\\vec v_i\\cdot\\vec v_j=-1"}</TeX> for <TeX>{"i\\ne j"}</TeX>, so the facet with
        normal <TeX>{"\\vec v_i"}</TeX> is tight at the three vertices <TeX>{"j\\ne i"}</TeX> and
        opposite <TeX>{"v_i"}</TeX>.
      </Note>
      <M tag="3.4">{"\\boxed{\\begin{aligned} +x_1+x_2+x_3 &\\ge -1\\\\ +x_1-x_2-x_3 &\\ge -1\\\\ -x_1-x_2+x_3 &\\ge -1\\\\ -x_1+x_2-x_3 &\\ge -1\\end{aligned}}"}</M>
      <P>
        These four inequalities are necessary <em>and</em> sufficient: a correlation vector is
        non-contextual iff all four hold. The first is precisely the <TeX>{"N=3"}</TeX> cycle bound{" "}
        <TeX>{"\\Sigma\\ge N-4\\alpha = 3-4 = -1"}</TeX> reported by the playground.
      </P>
      <Note kind="warn" title="LABELLING CAVEAT">
        It is easy to mis-pair a facet with its opposite vertex. Adopt the convention{" "}
        <TeX>{"F_i := \\{\\vec x : \\vec v_i\\cdot\\vec x\\ge-1\\}"}</TeX>, so <TeX>{"F_i"}</TeX> is
        tight at the three vertices <em>other than</em> <TeX>{"v_i"}</TeX> and is the facet{" "}
        <em>opposite</em> <TeX>{"v_i"}</TeX>. The app determines this by numerical membership
        testing rather than assumption.
      </Note>

      <H id="t4" n="§4">Barycentric coordinates = slacks</H>
      <P>
        In a simplex every interior point has a <em>unique</em> convex decomposition. Here it has a
        beautiful closed form. Define the slack of <TeX>{"\\vec x"}</TeX> against facet{" "}
        <TeX>{"F_i"}</TeX>:
      </P>
      <M tag="4.1">{"\\sigma_i(\\vec x) := \\vec v_i\\cdot\\vec x + 1 \\;\\ge\\; 0 \\quad\\text{(the facet inequality)}."}</M>
      <P>Claim: the barycentric weights are the normalised slacks,</P>
      <M tag="4.2">{"\\boxed{\\;\\lambda_i = \\frac{\\sigma_i(\\vec x)}{\\sigma_i(\\vec v_i)} = \\frac{\\vec v_i\\cdot\\vec x+1}{4}\\;}"}</M>
      <P>
        since <TeX>{"\\sigma_i(v_i)=3+1=4"}</TeX>. Two checks confirm it. First, normalisation:
        because <TeX>{"\\sum_i \\vec v_i = \\vec 0"}</TeX> (the vertices sum to zero),
      </P>
      <M tag="4.3">{"\\sum_{i=1}^4 \\lambda_i = \\frac{\\big(\\sum_i\\vec v_i\\big)\\cdot\\vec x + 4}{4} = \\frac{0+4}{4} = 1."}</M>
      <P>
        Second, reconstruction. The four vertices form a <em>tight frame</em>: computing the outer
        products entrywise, the off-diagonal terms cancel in pairs and each diagonal term gets{" "}
        <TeX>{"4\\times1"}</TeX>, so
        <TeX>{"\\ \\sum_{i=1}^4 \\vec v_i\\,\\vec v_i^{\\mathsf T} = 4\\,\\mathbb{I}_3"}</TeX>, i.e.{" "}
        <TeX>{"\\sum_i \\vec v_i(\\vec v_i\\cdot\\vec x) = 4\\vec x"}</TeX>. Hence
      </P>
      <M tag="4.4">{"\\sum_i \\lambda_i \\vec v_i = \\frac{1}{4}\\Big(\\sum_i \\vec v_i(\\vec v_i\\cdot\\vec x) + \\sum_i\\vec v_i\\Big) = \\frac{4\\vec x + \\vec 0}{4} = \\vec x. \\;\\checkmark"}</M>
      <Note kind="info" title="PHYSICAL MEANING">
        <TeX>{"\\lambda_i"}</TeX> is the probability the hidden-variable model assigns to
        deterministic strategy <TeX>{"i"}</TeX>. A point is non-contextual iff every{" "}
        <TeX>{"\\lambda_i\\ge0"}</TeX> — and a negative weight is a "negative probability", the
        classic signature of contextuality. The centre <TeX>{"\\vec x=0"}</TeX> gives{" "}
        <TeX>{"\\lambda=(\\tfrac14,\\tfrac14,\\tfrac14,\\tfrac14)"}</TeX>, the uniform mixture.
      </Note>

      <H id="t5" n="§5">Symmetry group</H>
      <P>
        Flipping one physical variable, <TeX>{"S_k\\mapsto-S_k"}</TeX>, negates exactly the two
        correlators containing <TeX>{"S_k"}</TeX>:
      </P>
      <Tbl
        head={["flip", "action on (x₁,x₂,x₃)", "F₁ maps to"]}
        rows={[
          ["S₁ → −S₁", "(−x₁, +x₂, −x₃)", "−x₁+x₂−x₃ ≥ −1  = F₄"],
          ["S₂ → −S₂", "(−x₁, −x₂, +x₃)", "−x₁−x₂+x₃ ≥ −1  = F₃"],
          ["S₃ → −S₃", "(+x₁, −x₂, −x₃)", "+x₁−x₂−x₃ ≥ −1  = F₂"],
        ]}
      />
      <P>
        These three involutions generate a group isomorphic to{" "}
        <TeX>{"\\mathbb{Z}_2\\times\\mathbb{Z}_2"}</TeX> (the product of all three flips is the
        identity on correlators, since it is global inversion). Together with the{" "}
        <TeX>{"S_3"}</TeX> permutations of the labels, the symmetry group has order{" "}
        <TeX>{"4\\times6=24"}</TeX> — the full rotation group of the tetrahedron,{" "}
        <TeX>{"A_4\\rtimes\\mathbb{Z}_2 \\cong S_4"}</TeX>. It acts <em>transitively</em> on the
        four facets, so all four inequalities are physically the same statement.
      </P>

      <H id="t6" n="§6">Why quantum cannot escape</H>
      <P>
        Build the <TeX>{"N=3"}</TeX> umbrella: three unit rays with{" "}
        <TeX>{"v_i\\perp v_{i+1}"}</TeX> cyclically. But for three vectors in{" "}
        <TeX>{"\\mathbb{R}^3"}</TeX>, cyclic orthogonality <em>is</em> mutual orthogonality — they
        form an orthonormal basis. Consistently, <TeX>{"\\Delta\\phi=2\\pi/3=120^\\circ"}</TeX>
        gives <TeX>{"h^2=\\tfrac{\\cos120^\\circ}{\\cos120^\\circ-1}=\\tfrac{-1/2}{-3/2}=\\tfrac13"}</TeX>,
        and indeed <TeX>{"3h^2=1"}</TeX>.
      </P>
      <P>
        All three projectors then commute, so the three observables are jointly measurable — the
        model is secretly classical. With the symmetric state <TeX>{"p_i=h^2=1/3"}</TeX>:
      </P>
      <M tag="6.1">{"\\langle S_iS_j\\rangle = 1-2p_i-2p_j = 1-\\tfrac43 = -\\tfrac13, \\qquad \\vec x^{\\rm QM} = \\big(-\\tfrac13,-\\tfrac13,-\\tfrac13\\big)."}</M>
      <M tag="6.2">{"\\sigma_1(\\vec x^{\\rm QM}) = (1,1,1)\\cdot(-\\tfrac13,-\\tfrac13,-\\tfrac13) + 1 = -1+1 = 0."}</M>
      <Note kind="key" title="TOUCHING, NEVER CROSSING">
        The best quantum point lies <em>exactly on</em> facet <TeX>{"F_1"}</TeX> — slack zero to
        machine precision. In barycentric terms{" "}
        <TeX>{"\\lambda=(0,\\tfrac13,\\tfrac13,\\tfrac13)"}</TeX>: it is the centroid of the
        opposite face, a perfectly legitimate classical mixture. This matches the graph invariants:{" "}
        <TeX>{"\\vartheta(C_3)=\\alpha(C_3)=1"}</TeX>, zero gap. To get a violation you need the
        smallest odd cycle with <TeX>{"\\vartheta>\\alpha"}</TeX>, namely{" "}
        <TeX>{"N=5"}</TeX>.
      </Note>
      <H2>Metric data</H2>
      <Tbl
        head={["quantity", "computation", "value"]}
        rows={[
          ["edge length", <TeX>{"\\|v_i-v_j\\| = \\sqrt{(\\pm2)^2+(\\pm2)^2+0^2}"}</TeX>, "2√2 ≈ 2.828427"],
          ["circumradius", <TeX>{"\\|v_i\\| = \\sqrt3"}</TeX>, "1.732051"],
          ["inradius", <TeX>{"|d|/\\|n\\| = 1/\\sqrt3"}</TeX>, "0.577350"],
          ["volume", <TeX>{"\\tfrac16|\\det(v_2-v_1,v_3-v_1,v_4-v_1)| = \\tfrac{16}{6}"}</TeX>, "8/3 ≈ 2.666667"],
          ["cube volume", <TeX>{"2^3"}</TeX>, "8  (ratio 1/3)"],
        ]}
      />
      <P>
        All six edges are equal, so this is a <em>regular</em> tetrahedron: the alternating
        demicube inscribed in <TeX>{"[-1,1]^3"}</TeX>, occupying one third of the cube's volume.
      </P>
      <Refs items={[
        ["H. Minkowski (1896), H. Weyl (1935)", "Equivalence of V- and H-representations of polyhedra"],
        ["G. M. Ziegler (1995)", "Lectures on Polytopes, Springer GTM 152"],
        ["I. Pitowsky (1989)", "Quantum Probability — Quantum Logic, Springer LNP 321"],
        ["M. Araújo et al. (2013)", "PRA 88, 022118"],
      ]} />
    </div>
  ),
};

/* ================================================================== */
/*  CONVEXITY (KCBS crescent)                                          */
/* ================================================================== */
export const convexityDoc: DocSpec = {
  title: "Three nested worlds — STAB ⊆ TH ⊆ QSTAB",
  subtitle: "THE LOVÁSZ SANDWICH AND THE CONTEXTUAL CRESCENT · 6 SECTIONS",
  sections: [
    { id: "x0", n: "§0", t: "Events and exclusivity" },
    { id: "x1", n: "§1", t: "STAB — the non-contextual polytope" },
    { id: "x2", n: "§2", t: "TH — the theta body" },
    { id: "x3", n: "§3", t: "QSTAB — the no-signalling polytope" },
    { id: "x4", n: "§4", t: "The sandwich theorem" },
    { id: "x5", n: "§5", t: "Reading the map" },
  ],
  footer: [["α(C₅)", "2", GOLD], ["ϑ(C₅)", "√5 = 2.2360680", CYAN], ["α*(C₅)", "5/2", VIOLET]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="x0" n="§0">Events and exclusivity</H>
      <P>
        Move from correlators to <em>events</em>. For each ray define the event{" "}
        <TeX>{"e_i = \\text{“}\\hat S_i=+1\\text{”}"}</TeX> with probability
      </P>
      <M tag="0.1">{"p_i = \\big|\\langle\\psi|v_i\\rangle\\big|^2 = \\langle\\psi|P_i|\\psi\\rangle."}</M>
      <P>
        When <TeX>{"v_i\\perp v_j"}</TeX> the events are <strong>exclusive</strong>: they cannot
        both occur, because <TeX>{"P_iP_j=0"}</TeX> implies{" "}
        <TeX>{"P(e_i\\wedge e_j)=0"}</TeX>, hence <TeX>{"p_i+p_j\\le1"}</TeX>. The exclusivity
        structure is captured by a graph <TeX>{"\\Gamma"}</TeX> — for KCBS, the pentagon{" "}
        <TeX>{"C_5"}</TeX>.
      </P>
      <P>
        The natural question becomes: how large can{" "}
        <TeX>{"\\sum_i p_i"}</TeX> be? Three answers exist, one per physical theory, and they are
        three classical graph invariants.
      </P>

      <H id="x1" n="§1">STAB — the non-contextual polytope</H>
      <P>
        A non-contextual model assigns each event a definite truth value{" "}
        <TeX>{"t_i\\in\\{0,1\\}"}</TeX> respecting exclusivity: adjacent events cannot both be 1.
        Such a <TeX>{"t"}</TeX> is the indicator vector of an <em>independent set</em> of{" "}
        <TeX>{"\\Gamma"}</TeX>. Allowing shared randomness gives
      </P>
      <M tag="1.1">{"\\operatorname{STAB}(\\Gamma) = \\operatorname{conv}\\big\\{\\,\\mathbb{1}_I \\;:\\; I\\subseteq V \\text{ independent}\\,\\big\\} \\subset [0,1]^{|V|},"}</M>
      <P>
        the <em>stable-set polytope</em>. Maximising <TeX>{"\\sum_ip_i"}</TeX> over it returns the
        largest independent set:
      </P>
      <M tag="1.2">{"\\max_{\\vec p\\,\\in\\,\\operatorname{STAB}} \\sum_i p_i = \\alpha(\\Gamma), \\qquad \\alpha(C_N)=\\Big\\lfloor\\tfrac{N}{2}\\Big\\rfloor,\\quad \\alpha(C_5)=2."}</M>
      <P>
        For <TeX>{"C_5"}</TeX> there are 11 independent sets (the empty set, 5 singletons, 5
        non-adjacent pairs), so STAB is a polytope with 11 vertices in{" "}
        <TeX>{"\\mathbb{R}^5"}</TeX>.
      </P>

      <H id="x2" n="§2">TH — the theta body</H>
      <P>
        Quantum mechanics represents events by projectors. An <em>orthonormal representation</em> of{" "}
        <TeX>{"\\Gamma"}</TeX> assigns unit vectors <TeX>{"|v_i\\rangle"}</TeX> with{" "}
        <TeX>{"\\langle v_i|v_j\\rangle=0"}</TeX> for adjacent <TeX>{"i,j"}</TeX>. The achievable
        probability vectors form Lovász's <em>theta body</em>
      </P>
      <M tag="2.1">{"\\operatorname{TH}(\\Gamma) = \\Big\\{ \\vec p \\;:\\; p_i = |\\langle\\psi|v_i\\rangle|^2 \\text{ for some o.r. } \\{v_i\\} \\text{ and unit } |\\psi\\rangle \\Big\\}^{\\rm conv}."}</M>
      <P>Its maximum along the all-ones direction is the <strong>Lovász theta number</strong>:</P>
      <M tag="2.2">{"\\vartheta(\\Gamma) = \\max_{\\vec p\\in\\operatorname{TH}} \\sum_i p_i, \\qquad \\vartheta(C_N) = \\frac{N\\cos(\\pi/N)}{1+\\cos(\\pi/N)} \\ (N\\text{ odd})."}</M>
      <P>
        For the pentagon, <TeX>{"\\cos36^\\circ=\\varphi/2"}</TeX> gives
      </P>
      <M tag="2.3">{"\\vartheta(C_5) = \\frac{5\\cdot\\varphi/2}{1+\\varphi/2} = \\frac{5\\varphi}{2+\\varphi} = \\sqrt5 \\approx 2.2360680,"}</M>
      <P>
        using <TeX>{"\\varphi^2=\\varphi+1"}</TeX>. This is exactly what the KCBS umbrella attains,{" "}
        <TeX>{"\\sum_ip_i=5h^2=5/\\sqrt5=\\sqrt5"}</TeX>.
      </P>
      <Note kind="key" title="TH IS CONVEX BUT NOT A POLYTOPE">
        <TeX>{"\\vartheta"}</TeX> is defined by a semidefinite program, and TH is a{" "}
        <em>spectrahedral shadow</em>: convex with a curved boundary and infinitely many extreme
        points. This is why the quantum bound <TeX>{"\\sqrt5"}</TeX> is irrational while the
        classical bounds 2 and 5/2 are rational. Curvature ⟺ irrationality, exactly as with{" "}
        <TeX>{"2\\sqrt2"}</TeX> in the CHSH case.
      </Note>

      <H id="x3" n="§3">QSTAB — the no-signalling polytope</H>
      <P>
        The weakest assumption keeps only local consistency: every <em>clique</em> (set of mutually
        exclusive events) must have total probability at most 1. For a graph with no triangles the
        cliques are just the edges:
      </P>
      <M tag="3.1">{"\\operatorname{QSTAB}(\\Gamma) = \\Big\\{\\vec p\\in[0,1]^{|V|} : \\sum_{i\\in K}p_i\\le1 \\ \\ \\forall \\text{ cliques } K\\Big\\}."}</M>
      <P>
        Its maximum is the <em>fractional packing number</em>{" "}
        <TeX>{"\\alpha^*(\\Gamma)"}</TeX>, the LP relaxation of <TeX>{"\\alpha"}</TeX>. For{" "}
        <TeX>{"C_N"}</TeX> the uniform assignment <TeX>{"p_i=1/2"}</TeX> is feasible and optimal:
      </P>
      <M tag="3.2">{"\\alpha^*(C_N) = \\frac{N}{2}, \\qquad \\alpha^*(C_5) = \\frac52 = 2.5."}</M>
      <P>
        This is again a polytope, and it is strictly larger than TH: the point{" "}
        <TeX>{"p_i=1/2"}</TeX> for all <TeX>{"i"}</TeX> satisfies all edge constraints but has{" "}
        <TeX>{"\\sum p_i = 2.5 > \\sqrt5"}</TeX>, so it is not quantum-realizable. It is the
        KCBS analogue of a PR box.
      </P>

      <H id="x4" n="§4">The sandwich theorem</H>
      <Note kind="key" title="LOVÁSZ SANDWICH (1979)">
        <M>{"\\operatorname{STAB}(\\Gamma) \\;\\subseteq\\; \\operatorname{TH}(\\Gamma) \\;\\subseteq\\; \\operatorname{QSTAB}(\\Gamma), \\qquad \\alpha(\\Gamma)\\le\\vartheta(\\Gamma)\\le\\alpha^*(\\Gamma)."}</M>
        Moreover all three coincide precisely when <TeX>{"\\Gamma"}</TeX> is <em>perfect</em>. Odd
        cycles of length ≥ 5 are the smallest imperfect graphs — which is exactly why they are the
        smallest contextuality scenarios.
      </Note>
      <P><strong>Proof sketches.</strong></P>
      <Step n="(⊆₁)">
        Any independent set <TeX>{"I"}</TeX> is realised quantum-mechanically: choose{" "}
        <TeX>{"|v_i\\rangle=|\\psi\\rangle"}</TeX> for one <TeX>{"i\\in I"}</TeX> and mutually
        orthogonal vectors elsewhere, so every vertex of STAB lies in TH. Convexity of TH then gives
        the inclusion.
      </Step>
      <Step n="(⊆₂)">
        For any clique <TeX>{"K"}</TeX> the vectors <TeX>{"\\{|v_i\\rangle\\}_{i\\in K}"}</TeX> are
        pairwise orthogonal, hence orthonormal, so Bessel's inequality gives{" "}
        <TeX>{"\\sum_{i\\in K}|\\langle\\psi|v_i\\rangle|^2\\le\\|\\psi\\|^2=1"}</TeX>. So every
        quantum point satisfies all clique constraints.
      </Step>
      <P>For the pentagon the three numbers are strictly ordered:</P>
      <M tag="4.1">{"2 \\;<\\; \\sqrt5 \\approx 2.2360680 \\;<\\; 2.5."}</M>
      <P>
        Lovász introduced <TeX>{"\\vartheta"}</TeX> precisely to compute the Shannon capacity of{" "}
        <TeX>{"C_5"}</TeX>, obtaining <TeX>{"\\Theta(C_5)=\\sqrt5"}</TeX> — the same number that
        bounds quantum contextuality. The coincidence is not accidental: both ask how many pairwise
        "confusable" alternatives can be packed.
      </P>

      <H id="x5" n="§5">Reading the map</H>
      <P>
        The visualisation projects the five-dimensional bodies onto two coordinates that respect the{" "}
        <TeX>{"\\mathbb{Z}_N"}</TeX> symmetry:
      </P>
      <M tag="5.1">{"\\Big(\\ \\Sigma := \\sum_i p_i,\\qquad \\rho := \\sqrt{\\tfrac1N\\textstyle\\sum_i (p_i-\\bar p)^2}\\ \\Big), \\qquad \\bar p = \\Sigma/N."}</M>
      <P>
        <TeX>{"\\Sigma"}</TeX> is the witness itself; <TeX>{"\\rho"}</TeX> measures how unevenly the
        probability is spread. The symmetric quantum optimum has{" "}
        <TeX>{"\\rho=0"}</TeX> (all <TeX>{"p_i"}</TeX> equal) and sits at the far right of the
        <TeX>{"\\rho=0"}</TeX> axis; classical vertices have large <TeX>{"\\rho"}</TeX>.
      </P>
      <Tbl
        head={["region", "colour", "apex Σ", "boundary type"]}
        rows={[
          ["STAB — non-contextual", "gold", "α = 2", "flat facets (LP)"],
          ["TH — quantum", "cyan", "ϑ = √5 ≈ 2.2361", "curved (SDP)"],
          ["QSTAB — no-signalling", "violet", "α* = 2.5", "flat facets (LP)"],
        ]}
      />
      <P>
        The <strong>contextual crescent</strong> is <TeX>{"\\operatorname{TH}\\setminus\\operatorname{STAB}"}</TeX>:
        the cyan region wrapped around the gold core. A behaviour lands in it exactly when{" "}
        <TeX>{"\\sum_ip_i>\\alpha"}</TeX> — which is the KCBS inequality violated. Since{" "}
        <TeX>{"\\Sigma = N-4\\sum p_i"}</TeX>, this is the same statement as{" "}
        <TeX>{"\\Sigma<-3"}</TeX>.
      </P>
      <Note kind="info" title="ON THE SAMPLED SILHOUETTES">
        The shaded bands are traced by Monte-Carlo sampling: Haar-random states through the current
        umbrella for TH, and random convex combinations of the 11 independent-set indicators (plus
        the fractional vertex <TeX>{"\\tfrac12\\mathbb{1}"}</TeX> for QSTAB) for the polytopes. The
        theorem <TeX>{"\\operatorname{STAB}\\subseteq\\operatorname{TH}"}</TeX> is then imposed
        exactly rather than left to sampling noise.
      </Note>
      <Refs items={[
        ["L. Lovász (1979)", "On the Shannon capacity of a graph, IEEE Trans. Inf. Theory 25, 1"],
        ["M. Grötschel, L. Lovász, A. Schrijver (1986)", "Relaxations of vertex packing, JCTB 40, 330"],
        ["D. Knuth (1994)", "The sandwich theorem, Electron. J. Combin. 1, A1"],
        ["A. Cabello, S. Severini, A. Winter (2014)", "Graph-theoretic approach to quantum correlations, PRL 112, 040401"],
      ]} />
    </div>
  ),
};

/* ================================================================== */
/*  HIERARCHY                                                          */
/* ================================================================== */
export const hierarchyDoc: DocSpec = {
  title: "L ⊂ Q ⊂ NS — square, disc, diamond",
  subtitle: "THE CHSH SLICE AND WHY NATURE STOPS EARLY · 6 SECTIONS",
  sections: [
    { id: "h0", n: "§0", t: "The slice coordinates" },
    { id: "h1", n: "§1", t: "L is a square" },
    { id: "h2", n: "§2", t: "Q is a disc" },
    { id: "h3", n: "§3", t: "NS is a diamond" },
    { id: "h4", n: "§4", t: "Nesting and tangency" },
    { id: "h5", n: "§5", t: "Why not PR boxes?" },
  ],
  footer: [["local", "|C₁|,|C₂| ≤ 2", GOLD], ["quantum", "C₁²+C₂² ≤ 8", CYAN], ["no-signalling", "|C₁|+|C₂| ≤ 4", NEON]],
  Body: () => (
    <div className="max-w-[820px]">
      <H id="h0" n="§0">The slice coordinates</H>
      <P>
        The CHSH correlator space is the cube <TeX>{"[-1,1]^4"}</TeX>, hard to draw. Project onto
        two Bell functionals that differ by one sign flip:
      </P>
      <M tag="0.1">{"\\mathcal{C}_1 = E_{00}+E_{01}+E_{10}-E_{11}, \\qquad \\mathcal{C}_2 = E_{00}+E_{01}-E_{10}+E_{11}."}</M>
      <P>
        <TeX>{"\\mathcal C_2"}</TeX> is the CHSH expression obtained by relabelling Bob's second
        output, so both are legitimate Bell functionals. Usefully,
      </P>
      <M tag="0.2">{"\\mathcal{C}_1+\\mathcal{C}_2 = 2(E_{00}+E_{01}), \\qquad \\mathcal{C}_1-\\mathcal{C}_2 = 2(E_{10}-E_{11}),"}</M>
      <P>
        which will give the no-signalling bound immediately. All three physical sets project onto
        convex, centrally symmetric regions in the <TeX>{"(\\mathcal C_1,\\mathcal C_2)"}</TeX> plane.
      </P>

      <H id="h1" n="§1">L is a square</H>
      <P>
        Evaluate both functionals on all <TeX>{"2^4=16"}</TeX> deterministic strategies{" "}
        <TeX>{"(A_0,A_1,B_0,B_1)\\in\\{\\pm1\\}^4"}</TeX>. By §1 of the Tsirelson document each
        gives <TeX>{"\\mathcal C_1=\\pm2"}</TeX>; the same argument applied to the other sign
        pattern gives <TeX>{"\\mathcal C_2=\\pm2"}</TeX>. Explicit enumeration shows all four
        combinations occur, each exactly four times:
      </P>
      <M tag="1.1">{"\\{(\\mathcal C_1,\\mathcal C_2)\\} = \\{(+2,+2),\\,(+2,-2),\\,(-2,+2),\\,(-2,-2)\\}."}</M>
      <P>Hence the local set projects to the convex hull of those four points:</P>
      <M tag="1.2">{"\\boxed{\\;\\mathcal{L}\\big|_{\\rm slice} = \\big\\{|\\mathcal C_1|\\le2\\big\\}\\cap\\big\\{|\\mathcal C_2|\\le2\\big\\} = [-2,2]^2\\;}"}</M>
      <P>
        A square with flat edges and four sharp corners — the hallmark of a polytope. The corners
        are the deterministic strategies themselves.
      </P>

      <H id="h2" n="§2">Q is a disc</H>
      <P>
        Using the Tsirelson vector representation <TeX>{"E_{xy}=\\vec a_x\\cdot\\vec b_y"}</TeX> and
        the factorisations
      </P>
      <M tag="2.1">{"\\mathcal C_1 = \\vec a_0\\cdot\\vec S + \\vec a_1\\cdot\\vec D, \\qquad \\mathcal C_2 = \\vec a_0\\cdot\\vec S - \\vec a_1\\cdot\\vec D,"}</M>
      <P>
        with <TeX>{"\\vec S=\\vec b_0+\\vec b_1"}</TeX>,{" "}
        <TeX>{"\\vec D=\\vec b_0-\\vec b_1"}</TeX> — note the second follows because flipping the
        sign of <TeX>{"E_{10}"}</TeX> and <TeX>{"E_{11}"}</TeX> flips{" "}
        <TeX>{"\\vec a_1\\to-\\vec a_1"}</TeX>. Then
      </P>
      <M tag="2.2">{"\\mathcal C_1^2 + \\mathcal C_2^2 = 2\\big(\\vec a_0\\cdot\\vec S\\big)^2 + 2\\big(\\vec a_1\\cdot\\vec D\\big)^2 \\le 2\\|\\vec S\\|^2 + 2\\|\\vec D\\|^2 = 2(u^2+v^2) = 8,"}</M>
      <P>
        by Cauchy–Schwarz and the parallelogram law <TeX>{"u^2+v^2=4"}</TeX>. Therefore
      </P>
      <M tag="2.3">{"\\boxed{\\;\\mathcal{Q}\\big|_{\\rm slice} = \\big\\{\\mathcal C_1^2+\\mathcal C_2^2 \\le 8\\big\\}\\;}"}</M>
      <P>
        a disc of radius <TeX>{"\\sqrt8=2\\sqrt2"}</TeX>. This is the <em>Uffink inequality</em>, a
        strictly stronger statement than the pair of CHSH inequalities: it says you cannot
        maximally violate two complementary Bell inequalities at once. Setting{" "}
        <TeX>{"\\mathcal C_2=0"}</TeX> recovers <TeX>{"|\\mathcal C_1|\\le2\\sqrt2"}</TeX>.
      </P>

      <H id="h3" n="§3">NS is a diamond</H>
      <P>
        Assume only normalisation and no-signalling, so each <TeX>{"E_{xy}\\in[-1,1]"}</TeX>
        independently. From (0.2),
      </P>
      <M tag="3.1">{"|\\mathcal C_1+\\mathcal C_2| = 2|E_{00}+E_{01}| \\le 4, \\qquad |\\mathcal C_1-\\mathcal C_2| = 2|E_{10}-E_{11}| \\le 4."}</M>
      <P>
        These two conditions are together equivalent to{" "}
        <TeX>{"|\\mathcal C_1|+|\\mathcal C_2|\\le4"}</TeX>, since{" "}
        <TeX>{"|a|+|b| = \\max(|a+b|,|a-b|)"}</TeX>. Hence
      </P>
      <M tag="3.2">{"\\boxed{\\;\\mathcal{NS}\\big|_{\\rm slice} = \\big\\{|\\mathcal C_1|+|\\mathcal C_2|\\le4\\big\\}\\;}"}</M>
      <P>
        a diamond (an <TeX>{"\\ell^1"}</TeX> ball of radius 4) whose four vertices{" "}
        <TeX>{"(\\pm4,0),(0,\\pm4)"}</TeX> are exactly the PR boxes.
      </P>

      <H id="h4" n="§4">Nesting and tangency</H>
      <P>The three regions nest, and the geometry is unusually clean:</P>
      <Tbl
        head={["inclusion", "reason", "contact"]}
        rows={[
          ["square ⊂ disc", <TeX>{"\\max_{[-2,2]^2}\\sqrt{C_1^2+C_2^2} = \\sqrt8"}</TeX>, "at the 4 corners (±2,±2)"],
          ["disc ⊂ diamond", <TeX>{"\\text{dist}(0,\\{|C_1|+|C_2|=4\\}) = 4/\\sqrt2 = 2\\sqrt2"}</TeX>, "at the 4 edge midpoints (±2,±2)"],
        ]}
      />
      <Note kind="key" title="ALL THREE MEET AT (±2, ±2)">
        The square's corners lie at distance <TeX>{"\\sqrt{2^2+2^2}=2\\sqrt2"}</TeX> from the
        origin — exactly the disc's radius. And the diamond's edge{" "}
        <TeX>{"C_1+C_2=4"}</TeX> is at perpendicular distance{" "}
        <TeX>{"4/\\sqrt2=2\\sqrt2"}</TeX> from the origin, touching the disc at{" "}
        <TeX>{"(2,2)"}</TeX>. So the square is inscribed in the disc, the disc is inscribed in the
        diamond, and all three boundaries kiss at the four deterministic points. Quantum theory
        gains nothing at those corners — precisely where the correlations are classical.
      </Note>
      <P>
        The curvature of the middle set is the whole content of Tsirelson's bound: were{" "}
        <TeX>{"\\mathcal Q"}</TeX> a polytope with the same extreme points as{" "}
        <TeX>{"\\mathcal L"}</TeX>, there would be no violation; were it the diamond, PR boxes
        would exist. It is a disc, so <TeX>{"\\max|\\mathcal C_1| = 2\\sqrt2"}</TeX>, strictly
        between.
      </P>

      <H id="h5" n="§5">Why not PR boxes?</H>
      <P>
        A PR box <TeX>{"a\\oplus b=xy"}</TeX> has <TeX>{"E=(1,1,1,-1)"}</TeX>,{" "}
        <TeX>{"\\mathcal C_1=4"}</TeX>, uniform marginals and perfect normalisation. It is
        consistent with relativity — no signalling, so no causal paradox. Yet it does not exist.
        Several physical principles single out <TeX>{"2\\sqrt2"}</TeX>:
      </P>
      <Tbl
        head={["principle", "statement", "conclusion"]}
        rows={[
          ["Information causality", "m transmitted bits yield at most m bits of accessible information", "recovers exactly 2√2"],
          ["Macroscopic locality", "coarse-grained many-particle statistics must be classical", "recovers the Q boundary at level 1 NPA"],
          ["Local orthogonality", "pairwise-exclusive events have total probability ≤ 1", "excludes much of NS"],
          ["Non-trivial communication complexity", "PR boxes trivialise all communication complexity", "excludes C > 3.266"],
        ]}
      />
      <Note kind="info" title="AN OPEN QUESTION">
        No single, universally accepted axiom derives quantum theory's exact boundary from physical
        principles alone. Information causality comes closest for CHSH, but reconstructing the full
        quantum set in all scenarios remains open. The app's "principles" toggles let you watch the
        allowed region inflate as each assumption is dropped — from square, to disc, to diamond,
        to the bare algebraic cube.
      </Note>
      <Refs items={[
        ["B. S. Cirel'son [Tsirelson] (1980)", "Quantum generalizations of Bell's inequality, Lett. Math. Phys. 4, 93"],
        ["J. Uffink (2002)", "Quadratic Bell inequalities as tests for multipartite entanglement, PRL 88, 230406"],
        ["S. Popescu, D. Rohrlich (1994)", "Quantum nonlocality as an axiom, Found. Phys. 24, 379"],
        ["M. Pawłowski et al. (2009)", "Information causality as a physical principle, Nature 461, 1101"],
        ["M. Navascués, H. Wunderlich (2010)", "A glance beyond the quantum model, Proc. R. Soc. A 466, 881"],
      ]} />
    </div>
  ),
};
