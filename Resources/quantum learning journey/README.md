# qucontext

> **Navigating the boundary between classical physics, quantum mechanics, and PR boxes.**

`qucontext` is an interactive, research-grade quantum physics laboratory and visual computing platform for exploring **quantum contextuality**, **Bell non-locality**, and the geometry of **quantum correlation bodies**.

Built with React 19, Three.js (WebGL), KaTeX, and Tailwind CSS v4, all values, operator certificates, and convex hulls are computed live in real-time from explicit vector and operator constructions.

---

## 🔬 Core Pillars

```
Classical (LHV) ────────► Quantum (QM) ────────► Post-Quantum (NS)
  Local Bound               Tsirelson Bound          PR-Box Limit
   |C| ≤ 2                   |C| ≤ 2√2 ≈ 2.828        |C| ≤ 4
   Σpᵢ ≤ 2                   Σpᵢ ≤ √5 ≈ 2.236         Σpᵢ ≤ 5/2 = 2.5
```

### 1. The KCBS Pentagram & Orthogonality Umbrellas
- **Qutrit Contextuality**: Visualizes the Klyachko-Can-Binicioğlu-Shumovsky (2008) state-dependent contextuality witness on a spin-1 Hilbert space ($\mathbb{R}^3$).
- **The Winding Problem (Why $4\pi$, not $2\pi$?)**: Demonstrates why a standard pentagon step ($\Delta = 72^\circ$, $\cos\Delta > 0$) fails to yield real vectors, while the star pentagram ($\Delta = 144^\circ$, $\cos\Delta = -\frac{1+\sqrt{5}}{4}$) solves $(1-h^2)\cos\Delta + h^2 = 0$.
- **Exact Construction**:
  $$\Delta = \frac{4\pi}{5} = 144^\circ, \quad h = 5^{-1/4} \approx 0.6687403, \quad r = \sqrt{1 - 5^{-1/2}} \approx 0.7434960$$
  $$\sum_{i=1}^5 p_i = \sqrt{5} \approx 2.23607 > \alpha(C_5) = 2$$
  $$\sum_{i=1}^5 \langle S_i S_{i+1} \rangle = 5 - 4\sqrt{5} \approx -3.94427 < -3$$
- **Arbitrary $N$-Cycle Umbrellas**: Generalizes to all symmetric $\{N/p\}$ star cycles with Lovász theta $\vartheta(C_N)$ and fractional packing bounds.

### 2. Tsirelson Laboratory (CHSH & Bell Non-Locality)
Four independent mathematical windows explaining why nature stops at $2\sqrt{2}$:
1. **Parallelogram Law**: Invariant $\|b_0 + b_1\|^2 + \|b_0 - b_1\|^2 \equiv 4$ on unit vectors.
2. **Sum of Squares (SOS) Certificate**: Live operator identity:
   $$2\sqrt{2}\,\mathbb{I} - \hat{C} = \frac{1}{\sqrt{2}}\left[\left(\frac{A_0 + A_1}{\sqrt{2}} - B_0\right)^2 + \left(\frac{A_0 - A_1}{\sqrt{2}} - B_1\right)^2\right] \succeq 0$$
3. **Landau / Cirel'son Arcsin Criterion**:
   $$\arcsin(E_{00}) + \arcsin(E_{01}) + \arcsin(E_{10}) - \arcsin(E_{11}) \le \pi$$
4. **NPA Hierarchy (Level 1)**: Live $5 \times 5$ moment matrix $G \succeq 0$ over $\{\mathbb{I}, A_0, A_1, B_0, B_1\}$.

### 3. Convex Geometry & Correlation Polytopes
- **The $n=3$ Correlation Simplex**: Complete V-representation (8 deterministic assignments $\to$ 4 extreme vertices) to H-representation (4 facets) live conversion.
- Demonstrates that for $n=3$, the quantum point touches the facet at $(-1/3, -1/3, -1/3)$ without violating classical limits.

### 4. The Hierarchy: $L \subset Q \subset NS$
- Interactive 2D slice $(C_1, C_2)$ where the nested sets manifest as:
  - **Local (Classical)**: Square with corners $(\pm 2, \pm 2)$
  - **Quantum**: Disk of radius $2\sqrt{2}$
  - **No-Signaling**: Diamond with vertices at $(\pm 4, 0)$ and $(0, \pm 4)$
- Interactive Popescu-Rohrlich (PR) box editor with live signaling checks and causality audits.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **3D Engine**: [Three.js](https://threejs.org/) via [@react-three/fiber](https://r3f.docs.pmnd.rs/) & [@react-three/drei](https://github.com/pmndrs/drei)
- **Math Typesetting**: [KaTeX](https://katex.org/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/username/qucontext.git
cd qucontext

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📖 Key References

1. **A. A. Klyachko, M. A. Can, S. Binicioğlu, A. S. Shumovsky** — *Simple test for hidden variables in spin-1 systems*, Phys. Rev. Lett. 101, 020403 (2008).
2. **B. S. Cirel'son (Tsirelson)** — *Quantum generalizations of Bell's inequality*, Lett. Math. Phys. 4, 93–100 (1980).
3. **J. F. Clauser, M. A. Horne, A. Shimony, R. A. Holt** — *Proposed experiment to test local hidden-variable theories*, Phys. Rev. Lett. 23, 880 (1969).
4. **S. Popescu, D. Rohrlich** — *Quantum nonlocality as an axiom*, Found. Phys. 24, 379–385 (1994).
5. **M. Navascués, S. Pironio, A. Acín** — *Bounding the set of quantum correlations*, Phys. Rev. Lett. 98, 010401 (2007).
6. **L. Lovász** — *On the Shannon capacity of a graph*, IEEE Trans. Inf. Theory 25, 1–7 (1979).
7. **M. Pawłowski et al.** — *Information causality as a physical principle*, Nature 461, 1101–1104 (2009).
