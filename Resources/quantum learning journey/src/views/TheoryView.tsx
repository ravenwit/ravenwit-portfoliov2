import { ExternalLink } from "lucide-react";
import { SetupSection } from "../components/Sections";
import { Violation } from "../components/Violation";

const REFS = [
  {
    t: "A. A. Klyachko, M. A. Can, S. Binicioğlu, A. S. Shumovsky — “Simple test for hidden variables in spin-1 systems”",
    j: "Phys. Rev. Lett. 101, 020403 (2008)",
    href: "https://doi.org/10.1103/PhysRevLett.101.020403",
  },
  {
    t: "D. Gross — Lecture notes on quantum mechanics (the pentagram cone construction)",
    j: "Universität zu Köln",
    href: "https://www.thp.uni-koeln.de/gross/teaching.html",
  },
  {
    t: "A. Cabello, S. Severini, A. Winter — “Graph-theoretic approach to quantum correlations”",
    j: "Phys. Rev. Lett. 112, 040401 (2014)",
    href: "https://doi.org/10.1103/PhysRevLett.112.040401",
  },
  {
    t: "M. Araújo, M. T. Quintino, C. Budroni, M. T. Cunha, A. Cabello — “All noncontextuality inequalities for the n-cycle scenario”",
    j: "Phys. Rev. A 88, 022118 (2013)",
    href: "https://doi.org/10.1103/PhysRevA.88.022118",
  },
  {
    t: "L. Lovász — “On the Shannon capacity of a graph”",
    j: "IEEE Trans. Inf. Theory 25, 1–7 (1979)",
    href: "https://doi.org/10.1109/TIT.1979.1055985",
  },
  {
    t: "J. F. Clauser, M. A. Horne, A. Shimony, R. A. Holt — “Proposed experiment to test local hidden-variable theories”",
    j: "Phys. Rev. Lett. 23, 880 (1969)",
    href: "https://doi.org/10.1103/PhysRevLett.23.880",
  },
  {
    t: "B. S. Cirel'son (Tsirelson) — “Quantum generalizations of Bell's inequality”",
    j: "Lett. Math. Phys. 4, 93–100 (1980)",
    href: "https://doi.org/10.1007/BF00417500",
  },
  {
    t: "S. Popescu, D. Rohrlich — “Quantum nonlocality as an axiom” (PR boxes)",
    j: "Found. Phys. 24, 379–385 (1994)",
    href: "https://doi.org/10.1007/BF02058098",
  },
  {
    t: "I. Šupić, J. Bowles — “Self-testing of quantum systems: a review”",
    j: "Quantum 4, 337 (2020)",
    href: "https://doi.org/10.22331/q-2020-09-30-337",
  },
  {
    t: "M. Navascués, S. Pironio, A. Acín — “Bounding the set of quantum correlations” (NPA hierarchy)",
    j: "Phys. Rev. Lett. 98, 010401 (2007)",
    href: "https://doi.org/10.1103/PhysRevLett.98.010401",
  },
  {
    t: "L. J. Landau — “Empirical two-point correlation functions” (the arcsin / elliptope criterion)",
    j: "Found. Phys. 18, 449–460 (1988)",
    href: "https://doi.org/10.1007/BF00732549",
  },
  {
    t: "M. Pawłowski et al. — “Information causality as a physical principle” (why not PR boxes)",
    j: "Nature 461, 1101–1104 (2009)",
    href: "https://doi.org/10.1038/nature08400",
  },
  {
    t: "S. Kochen, E. P. Specker — “The problem of hidden variables in quantum mechanics”",
    j: "J. Math. Mech. 17, 59–87 (1967)",
    href: "https://doi.org/10.1512/iumj.1968.17.17004",
  },
];

export function TheoryView() {
  return (
    <div>
      <SetupSection />
      <div className="hairline mx-8" />
      <Violation />
      <div className="hairline mx-8" />
      <section className="px-5 md:px-8 py-7 max-w-[1500px]">
        <div className="mono text-[10px] tracking-[0.3em] text-faint mb-5">REFERENCES</div>
        <div className="grid md:grid-cols-2 gap-3">
          {REFS.map((r, i) => (
            <a
              key={i}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="card px-5 py-4 group hover:border-line-bright transition-colors flex items-start gap-3"
            >
              <span className="mono text-[10px] text-faint pt-0.5 shrink-0">
                [{String(i + 1).padStart(2, "0")}]
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] text-muted group-hover:text-ink transition-colors leading-relaxed">
                  {r.t}
                </span>
                <span className="mono text-[10.5px] text-quantum/70 mt-1.5 flex items-center gap-1.5">
                  {r.j}
                  <ExternalLink size={10} className="opacity-60" />
                </span>
              </span>
            </a>
          ))}
        </div>
        <p className="mono text-[10px] text-faint mt-8 tracking-wider">
          BUILT WITH REACT · THREE.JS · KATEX — ALL VALUES COMPUTED LIVE FROM THE DISPLAYED CONSTRUCTIONS
        </p>
      </section>
    </div>
  );
}
