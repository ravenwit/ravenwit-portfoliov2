# First-Principles Mathematical Foundations & Connected Derivations for `qucontext`

**Author:** Distinguished Research Professor in Quantum Information Theory & Foundations of Quantum Mechanics  
**Target System:** `qucontext` — Navigating the Boundary Between Classical Physics, Quantum Mechanics, and PR Boxes  
**Scope:** Complete, self-contained, first-principles mathematical derivations and intuitive connections for all 10 views and modules.

---

## Table of Contents
1. [Section 1: The KCBS Contextuality Theorem (PRL 101, 020403) & General Qutrit Scenario](#section-1)
2. [Section 2: Winding Dynamics & Dihedral Star Geometry $\{N/p\}$, Deficit Angle, and the Proof of Obtuse Angular Requirement](#section-2)
3. [Section 3: Exact 9-Step Algebraic Derivation of $h = 5^{-1/4}$, Circulant Gram Spectrum, and Rank-3 Embedding](#section-3)
4. [Section 4: Graph Theory, Lovász $\vartheta(G)$, Orthonormal Representations, and Sandwich Theorems](#section-4)
5. [Section 5: Anti-ferromagnetic Frustration Theorem, Cycle Parity Invariant $\prod S_i S_{i+1} = +1$, and the $-3$ Classical Floor](#section-5)
6. [Section 6: Pitowsky Correlation Polytope for $n=3$, V-rep to H-rep Facet Extraction, Barycentric Coordinates, and Quantum Boundary Contact](#section-6)
7. [Section 7: Nested Convex Worlds: $\text{STAB}(G) \subset \text{TH}(G) \subset \text{QSTAB}(G)$, CSW Exclusivity, and Gleason's Theorem](#section-7)
8. [Section 8: Tsirelson's $2\sqrt{2}$ Bound: Parallelogram Invariant, SOS Operator Certificate, Commutator Identity, Landau Arcsin, and NPA Hierarchy](#section-8)
9. [Section 9: The Hierarchy $L \subset Q \subset NS$, Popescu-Rohrlich PR Boxes, Trivial Communication Complexity, and Information Causality](#section-9)
10. [Section 10: Foundational Axiomatics: Kochen-Specker, Gleason, Bell Nonlocality, and Device-Independent Self-Testing](#section-10)
11. [Section 11: UI Architecture for Intuitively Connecting Every Page to its Mathematical Derivations](#section-11)

---

<a id="section-1"></a>
## Section 1: The KCBS Contextuality Theorem (PRL 101, 020403) & General Qutrit Scenario

### 1.1 Physical Setup and the Qutrit Hilbert Space $\mathcal{H} = \mathbb{C}^3$
Klyachko, Can, Binicioğlu, and Shumovsky (PRL 101, 020403, 2008) discovered the minimal quantum state-dependent contextuality witness. Unlike Bell nonlocality, which requires at least two entangled subsystems ($d = 2 \times 2 = 4$), quantum contextuality emerges in a **single indivisible three-level quantum system (qutrit, $d=3$)**.

Let $\mathcal{H} = \mathbb{C}^3$. A quantum state is described by a density operator $\rho \in \mathcal{D}(\mathbb{C}^3)$ (or a unit state vector $|\psi\rangle \in \mathbb{C}^3$).

### 1.2 Ray Projectors and Dichotomic Spin-1 Observables
Consider five unit vectors $\{|v_i\rangle\}_{i=0}^4 \subset \mathbb{R}^3 \subset \mathbb{C}^3$. To each ray, we associate a rank-1 projection operator:
$$P_i = |v_i\rangle \langle v_i|, \quad P_i^2 = P_i = P_i^\dagger, \quad \text{Tr}(P_i) = 1.$$

For each ray $|v_i\rangle$, we define a dichotomic ($\pm 1$-valued) reflection observable $\hat{S}_i$:
$$\hat{S}_i := 2 P_i - \mathbb{I} = 2 |v_i\rangle\langle v_i| - \mathbb{I}.$$

#### Sanity Check 1.1: Spectral Properties of $\hat{S}_i$
$$\hat{S}_i^2 = (2P_i - \mathbb{I})^2 = 4 P_i^2 - 4 P_i + \mathbb{I} = 4 P_i - 4 P_i + \mathbb{I} = \mathbb{I}.$$
Since $\hat{S}_i^\dagger = \hat{S}_i$ and $\hat{S}_i^2 = \mathbb{I}$, the eigenvalues of $\hat{S}_i$ are strictly confined to $\sigma(\hat{S}_i) \subseteq \{+1, -1\}$.
- For any vector $|\phi\rangle \propto |v_i\rangle$:
  $$\hat{S}_i |v_i\rangle = (2 |v_i\rangle\langle v_i| - \mathbb{I})|v_i\rangle = 2|v_i\rangle - |v_i\rangle = +1 |v_i\rangle.$$
- For any vector $|\phi_\perp\rangle$ orthogonal to $|v_i\rangle$ ($\langle v_i|\phi_\perp\rangle = 0$):
  $$\hat{S}_i |\phi_\perp\rangle = (2|v_i\rangle\langle v_i| - \mathbb{I})|\phi_\perp\rangle = 0 - |\phi_\perp\rangle = -1 |\phi_\perp\rangle.$$
Thus, $\hat{S}_i$ has a non-degenerate eigenvalue $+1$ (along ray $|v_i\rangle$) and a 2-fold degenerate eigenvalue $-1$ on the 2D subspace $|v_i\rangle^\perp$.

### 1.3 Exclusivity vs. Compatibility Graph
In contextuality theory, we distinguish two complementary graph structures:
1. **The Exclusivity Graph $G = (V, E)$**: Vertices represent elementary quantum events (the projectors $P_i$). An edge $(i, j) \in E$ denotes that events $i$ and $j$ are mutually exclusive:
   $$\langle v_i | v_j \rangle = 0 \iff P_i P_j = 0.$$
2. **The Compatibility Graph $G_{\text{comp}} = (V, E_{\text{comp}})$**: Two observables $\hat{A}$ and $\hat{B}$ are compatible if they commute: $[\hat{A}, \hat{B}] = 0$.

#### Compatibility Lemma for Orthogonal Reflections
Let $|v_i\rangle \perp |v_j\rangle$, so $P_i P_j = 0$. Then:
$$[\hat{S}_i, \hat{S}_j] = [2P_i - \mathbb{I}, 2P_j - \mathbb{I}] = 4[P_i, P_j] = 4(P_i P_j - P_j P_i) = 4(0 - 0) = 0.$$
**Crucial result:** Whenever two rays are orthogonal, their associated reflection observables $\hat{S}_i$ and $\hat{S}_j$ **strictly commute**, and are therefore simultaneously measurable within the same physical context!

Furthermore, their operator product simplifies identically:
$$\hat{S}_i \hat{S}_j = (2P_i - \mathbb{I})(2P_j - \mathbb{I}) = 4 P_i P_j - 2P_i - 2P_j + \mathbb{I} = \mathbb{I} - 2P_i - 2P_j.$$

### 1.4 Non-Contextual Hidden Variable (NCHV) Inequality
In any non-contextual hidden variable theory (or classical realistic model), every observable $\hat{S}_i$ has a predetermined value $s_i \in \{+1, -1\}$ independent of which compatible measurement context is co-performed.
Each projector $P_i$ correspondingly takes a classical truth value:
$$p_i = \frac{1 + s_i}{2} \in \{0, 1\}.$$
Since adjacent events on the cycle $C_5$ are mutually exclusive ($P_i P_{i+1} = 0$), two adjacent events cannot both be true simultaneously:
$$p_i + p_{i+1} \le 1 \quad \forall i \in \mathbb{Z}_5.$$
This means the set of vertices where $p_i = 1$ forms an **independent set** of the pentagon graph $C_5$.
The maximum number of non-adjacent vertices in $C_5$ is the independence number:
$$\alpha(C_5) = 2.$$
Therefore, for any classical non-contextual assignment:
$$\sum_{i=0}^4 p_i \le \alpha(C_5) = 2.$$

Translating this back to the spin correlation sum:
$$\sum_{i=0}^4 s_i s_{i+1} = \sum_{i=0}^4 (1 - 2p_i - 2p_{i+1}) = 5 - 4 \sum_{i=0}^4 p_i \ge 5 - 4\alpha(C_5) = 5 - 4(2) = -3.$$
Hence, the **KCBS classical noncontextuality inequalities** are:
$$\sum_{i=0}^4 \langle P_i \rangle_{\text{NCHV}} \le 2, \qquad \sum_{i=0}^4 \langle \hat{S}_i \hat{S}_{i+1} \rangle_{\text{NCHV}} \ge -3.$$

### 1.5 Quantum Violation in $\mathbb{C}^3$
As shown in Section 3, arranging five rays symmetrically around the $z$-axis at height $h = 5^{-1/4}$ enables an apex probe state $|\psi\rangle = (0, 0, 1)^T$ to achieve:
$$\langle P_i \rangle_\psi = |\langle\psi|v_i\rangle|^2 = h^2 = \frac{1}{\sqrt{5}} \approx 0.447214 \quad (\forall i = 0, \dots, 4).$$
Summing over all five vertices:
$$\sum_{i=0}^4 \langle P_i \rangle_\psi = 5 \cdot \frac{1}{\sqrt{5}} = \sqrt{5} \approx 2.236068 > 2.$$
Evaluating the spin correlation witness:
$$\sum_{i=0}^4 \langle \psi | \hat{S}_i \hat{S}_{i+1} | \psi \rangle = 5 - 4 \sum_{i=0}^4 \langle P_i \rangle_\psi = 5 - 4\sqrt{5} \approx -3.944272 < -3.$$
The quantum violation magnitude is:
$$\Delta_{\text{KCBS}} = |(5 - 4\sqrt{5}) - (-3)| = 4\sqrt{5} - 8 \approx 0.944272.$$

---

<a id="section-2"></a>
## Section 2: Winding Dynamics & Dihedral Star Geometry $\{N/p\}$

### 2.1 The Star Polygon $\{N/p\}$ and Winding Number
A regular star polygon $\{N/p\}$ ($p < N/2$, $\gcd(N, p) = 1$) is constructed by placing $N$ vertices on a unit circle at azimuth angles:
$$\phi_k = k \cdot \Delta, \quad \Delta = \frac{2\pi p}{N}, \quad k = 0, 1, \dots, N-1.$$
Connecting vertex $k$ to vertex $k+1$ advances the azimuth by $\Delta$. Traversing all $N$ vertices in sequence traverses a total azimuth angle of:
$$\Phi_{\text{total}} = N \cdot \Delta = N \cdot \frac{2\pi p}{N} = 2\pi p.$$
Thus, the integer $p$ is the topological **winding number** of the polygon around the origin.

### 2.2 The Symmetric Orthogonality Umbrella
To embed $\{N/p\}$ as an exclusivity graph where consecutive vertices $k$ and $k+1$ correspond to orthogonal unit vectors in $\mathbb{R}^3$, we lift the vertices onto a symmetric cone (the "orthogonality umbrella") centered on the $z$-axis:
$$|v_k\rangle = \begin{pmatrix} r \cos(k \Delta) \\ r \sin(k \Delta) \\ h \end{pmatrix}, \quad k \in \{0, 1, \dots, N-1\}.$$
Normalization requires:
$$\langle v_k | v_k \rangle = r^2 \cos^2(k\Delta) + r^2 \sin^2(k\Delta) + h^2 = r^2 + h^2 = 1 \implies r^2 = 1 - h^2.$$

### 2.3 Inner Product Separation and the Strict Obtuse Angle Requirement
Compute the inner product between consecutive vectors $|v_k\rangle$ and $|v_{k+1}\rangle$:
$$\langle v_k | v_{k+1} \rangle = r^2 [\cos(k\Delta)\cos((k+1)\Delta) + \sin(k\Delta)\sin((k+1)\Delta)] + h^2 = r^2 \cos\Delta + h^2.$$
Substituting $r^2 = 1 - h^2$:
$$\langle v_k | v_{k+1} \rangle = (1 - h^2) \cos\Delta + h^2.$$

#### Theorem 2.1 (Obtuse Angle Requirement)
An orthogonality umbrella with real height $h \in [0, 1]$ satisfying $\langle v_k | v_{k+1} \rangle = 0$ exists if and only if the azimuth step $\Delta$ is strictly obtuse:
$$\cos\Delta < 0 \iff \Delta \in \left(\frac{\pi}{2}, \frac{3\pi}{2}\right).$$

*Proof:*
Set the inner product to zero:
$$(1 - h^2) \cos\Delta + h^2 = 0 \iff h^2 (1 - \cos\Delta) = -\cos\Delta \iff h^2 = \frac{-\cos\Delta}{1 - \cos\Delta} = \frac{\cos\Delta}{\cos\Delta - 1}.$$
Since $r^2 = 1 - h^2 = \frac{-1}{\cos\Delta - 1} = \frac{1}{1 - \cos\Delta}$, physical feasibility requires:
1. $h^2 \ge 0 \implies \frac{-\cos\Delta}{1 - \cos\Delta} \ge 0$.
   Since $1 - \cos\Delta > 0$ for all $\Delta \not\equiv 0 \pmod{2\pi}$, this requires $-\cos\Delta \ge 0 \implies \cos\Delta \le 0$.
2. If $\cos\Delta = 0$ ($\Delta = \pi/2 = 90^\circ$), then $h^2 = 0$, so $h = 0$ (all vectors lie in the equatorial $xy$-plane).
3. If $\cos\Delta > 0$, then $h^2 < 0$, which requires an imaginary height $h = i \sqrt{\frac{\cos\Delta}{1 - \cos\Delta}} \notin \mathbb{R}$.
   Physically, if $\Delta < 90^\circ$, both the horizontal inner product $r^2 \cos\Delta > 0$ and the vertical inner product $h^2 \ge 0$ are strictly positive. Two positive quantities can never sum to zero!
Hence, $\cos\Delta < 0$ is strictly necessary. $\blacksquare$

### 2.4 Why the Regular Pentagon $\{5/1\}$ Fails and the Pentagram $\{5/2\}$ Succeeds
Let $N = 5$:
- **Case 1: Regular Convex Pentagon $\{5/1\}$ ($p = 1$)**
  $$\Delta = \frac{2\pi(1)}{5} = \frac{2\pi}{5} = 72^\circ.$$
  $$\cos 72^\circ = \frac{\sqrt{5} - 1}{4} \approx +0.309017 > 0.$$
  Plugging into the formula for $h^2$:
  $$h^2 = \frac{\cos 72^\circ}{\cos 72^\circ - 1} = \frac{(\sqrt{5}-1)/4}{(\sqrt{5}-1)/4 - 1} = \frac{\sqrt{5}-1}{\sqrt{5}-5} = -\frac{1}{\sqrt{5}} < 0.$$
  This yields an imaginary height $h = i \cdot 5^{-1/4}$. The regular pentagon cannot form an orthogonality umbrella in real 3D space!
- **Case 2: Regular Star Pentagram $\{5/2\}$ ($p = 2$)**
  $$\Delta = \frac{2\pi(2)}{5} = \frac{4\pi}{5} = 144^\circ.$$
  $$\cos 144^\circ = -\cos 36^\circ = -\frac{\sqrt{5} + 1}{4} = -\frac{\phi}{2} \approx -0.809017 < 0.$$
  Now $\cos 144^\circ < 0$ is strictly negative!
  $$h^2 = \frac{-\cos 144^\circ}{1 - \cos 144^\circ} = \frac{\phi/2}{1 + \phi/2} = \frac{\phi}{2 + \phi} = \frac{1}{\sqrt{5}} > 0.$$
  This yields the real, physical height $h = 5^{-1/4} \approx 0.668740$.

### 2.5 The Polar Deficit Angle $\chi$
Define the polar deficit angle $\chi := \pi - \Delta$.
$$\chi = \pi - \frac{2\pi p}{N} = \frac{\pi(N - 2p)}{N}.$$
Then $\cos\Delta = \cos(\pi - \chi) = -\cos\chi$. Substituting this into $h^2$:
$$h^2 = \frac{\cos\chi}{1 + \cos\chi}.$$
Using the half-angle identity $1 + \cos\chi = 2\cos^2(\chi/2)$ and $\cos\chi = 2\cos^2(\chi/2) - 1$:
$$h^2 = 1 - \frac{1}{2}\sec^2\left(\frac{\chi}{2}\right) = 1 - \frac{1}{1 + \cos\chi}.$$
For $\{5/2\}$, $N=5, p=2$:
$$\chi = \frac{\pi(5 - 4)}{5} = \frac{\pi}{5} = 36^\circ.$$
$$\cos\chi = \cos\left(\frac{\pi}{5}\right) = \frac{\sqrt{5}+1}{4} = \frac{\phi}{2}.$$
$$h^2 = \frac{\phi/2}{1 + \phi/2} = \frac{\phi}{2+\phi} = \frac{1}{\sqrt{5}}.$$

---

<a id="section-3"></a>
## Section 3: Exact 9-Step Algebraic Derivation & Circulant Gram Spectrum

### 3.1 The 9-Step Algebraic Derivation
Here is the step-by-step mathematical derivation of $h = 5^{-1/4}$:

- **Step 1: Symmetry and Ray Parametrization**  
  Equiangular spacing on a cone of half-angle $\theta = \arccos(h)$ around $\hat{z}$:
  $$|v_k\rangle = \begin{pmatrix} r\cos\left(\frac{4\pi k}{5}\right) \\ r\sin\left(\frac{4\pi k}{5}\right) \\ h \end{pmatrix}, \quad k \in \{0, 1, 2, 3, 4\}.$$

- **Step 2: Normalization Constraint**  
  Normalization $\||v_k\rangle\|^2 = 1$ fixes the radius $r$:
  $$r^2 + h^2 = 1 \implies r = \sqrt{1 - h^2}.$$

- **Step 3: Exclusivity (Orthogonality) Condition**  
  Adjacent contexts on $C_5$ must be mutually exclusive: $\langle v_k | v_{k+1} \rangle = 0$.
  $$\langle v_k | v_{k+1} \rangle = r^2 \cos\left(\frac{4\pi}{5}\right) + h^2 = (1 - h^2)\cos\left(\frac{4\pi}{5}\right) + h^2 = 0.$$

- **Step 4: Golden Ratio Trigonometric Identity**  
  Using the exact trigonometric identity for $4\pi/5$:
  $$\cos\left(\frac{4\pi}{5}\right) = -\cos\left(\frac{\pi}{5}\right) = -\frac{1 + \sqrt{5}}{4} = -\frac{\phi}{2}, \quad \text{where } \phi = \frac{1+\sqrt{5}}{2}.$$

- **Step 5: Exact Algebraic Simplification for $h^2$**  
  $$(1 - h^2)\left(-\frac{\phi}{2}\right) + h^2 = 0 \iff h^2\left(1 + \frac{\phi}{2}\right) = \frac{\phi}{2} \iff h^2 = \frac{\phi}{2 + \phi}.$$
  *Lemma (Golden Ratio Reduction):*
  $$2 + \phi = 2 + \frac{1+\sqrt{5}}{2} = \frac{5+\sqrt{5}}{2} = \sqrt{5}\left(\frac{\sqrt{5}+1}{2}\right) = \sqrt{5}\phi.$$
  Therefore:
  $$h^2 = \frac{\phi}{\sqrt{5}\phi} = \frac{1}{\sqrt{5}} = 5^{-1/2} \implies h = 5^{-1/4} \approx 0.6687403.$$

- **Step 6: Optimal Probe State Selection**  
  By $C_5$ rotational symmetry around $\hat{z}$, the state that symmetrically samples all five projectors without bias is the apex vector:
  $$|\psi\rangle = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}.$$
  The probability of each event $P_k$ is:
  $$p_k = |\langle \psi | v_k \rangle|^2 = |0 \cdot v_{k,x} + 0 \cdot v_{k,y} + 1 \cdot h|^2 = h^2 = \frac{1}{\sqrt{5}}.$$

- **Step 7: Sum of Projector Probabilities**  
  $$\sum_{k=0}^4 \langle \psi | P_k | \psi \rangle = \sum_{k=0}^4 p_k = 5 \cdot \frac{1}{\sqrt{5}} = \sqrt{5} \approx 2.236068.$$

- **Step 8: Operator Correlation Reduction**  
  Since $P_k P_{k+1} = 0$, the observable product is:
  $$\hat{S}_k \hat{S}_{k+1} = \mathbb{I} - 2P_k - 2P_{k+1}.$$
  Its expectation value is:
  $$\langle \psi | \hat{S}_k \hat{S}_{k+1} | \psi \rangle = 1 - 2p_k - 2p_{k+1} = 1 - 2h^2 - 2h^2 = 1 - 4h^2 = 1 - \frac{4}{\sqrt{5}} \approx -0.788854.$$

- **Step 9: Quantum Sum of the Pentagram**  
  Summing all five edges:
  $$\sum_{k=0}^4 \langle \psi | \hat{S}_k \hat{S}_{k+1} | \psi \rangle = 5\left(1 - \frac{4}{\sqrt{5}}\right) = 5 - 4\sqrt{5} \approx -3.944272.$$

### 3.2 Circulant Gram Matrix Spectrum
The Gram matrix $G \in \mathbb{R}^{5 \times 5}$ of the five vectors has entries:
$$G_{jk} = \langle v_j | v_k \rangle = r^2 \cos((j - k)\Delta) + h^2, \quad \Delta = \frac{4\pi}{5}.$$
This is a symmetric circulant matrix:
$$G = \begin{pmatrix}
c_0 & c_1 & c_2 & c_2 & c_1 \\
c_1 & c_0 & c_1 & c_2 & c_2 \\
c_2 & c_1 & c_0 & c_1 & c_2 \\
c_2 & c_2 & c_1 & c_0 & c_1 \\
c_1 & c_2 & c_2 & c_1 & c_0
\end{pmatrix},$$
where:
$$c_0 = 1, \quad c_1 = \langle v_0 | v_1 \rangle = 0, \quad c_2 = \langle v_0 | v_2 \rangle = r^2 \cos\left(\frac{8\pi}{5}\right) + h^2 = r^2 \cos\left(\frac{2\pi}{5}\right) + h^2.$$
Using $\cos(2\pi/5) = \frac{\sqrt{5}-1}{4} = \frac{1}{2\phi}$ and $r^2 = 1 - \frac{1}{\sqrt{5}}$:
$$c_2 = \left(1 - \frac{1}{\sqrt{5}}\right)\frac{\sqrt{5}-1}{4} + \frac{1}{\sqrt{5}} = \frac{(\sqrt{5}-1)^2}{4\sqrt{5}} + \frac{1}{\sqrt{5}} = \frac{6 - 2\sqrt{5} + 4}{4\sqrt{5}} = \frac{5 - \sqrt{5}}{2\sqrt{5}} = \frac{\sqrt{5}-1}{2} = \frac{1}{\phi} \approx 0.618034.$$

#### Discrete Fourier Transform (DFT) Diagonalization
The eigenvalues of any $N \times N$ circulant matrix $G = \text{circ}(c_0, c_1, \dots, c_{N-1})$ are given by the discrete Fourier transform of its first row:
$$\lambda_m = \sum_{k=0}^{N-1} c_k e^{-i \frac{2\pi m k}{N}}, \quad m \in \{0, 1, \dots, N-1\}.$$
Substitute $c_k = h^2 + \frac{r^2}{2} e^{i k \Delta} + \frac{r^2}{2} e^{-i k \Delta}$ with $\Delta = \frac{2\pi p}{N}$ ($p=2$):
$$\lambda_m = \sum_{k=0}^{N-1} \left( h^2 + \frac{r^2}{2} e^{i \frac{2\pi p k}{N}} + \frac{r^2}{2} e^{-i \frac{2\pi p k}{N}} \right) e^{-i \frac{2\pi m k}{N}} = h^2 \sum_{k=0}^{N-1} e^{-i \frac{2\pi m k}{N}} + \frac{r^2}{2} \sum_{k=0}^{N-1} e^{i \frac{2\pi (p - m) k}{N}} + \frac{r^2}{2} \sum_{k=0}^{N-1} e^{-i \frac{2\pi (p + m) k}{N}}.$$
Using the identity $\sum_{k=0}^{N-1} e^{i \frac{2\pi q k}{N}} = N \delta_{q \equiv 0 \pmod N}$:
- For $m = 0$:
  $$\lambda_0 = N h^2 = 5 \cdot \frac{1}{\sqrt{5}} = \sqrt{5} \approx 2.236068.$$
- For $m = p = 2$:
  $$\lambda_2 = \frac{N r^2}{2} = \frac{5(1 - 1/\sqrt{5})}{2} = \frac{5 - \sqrt{5}}{2} \approx 1.381966.$$
- For $m = N - p = 3$:
  $$\lambda_3 = \frac{N r^2}{2} = \frac{5 - \sqrt{5}}{2} \approx 1.381966.$$
- For $m = 1$ and $m = 4$:
  Both $p - m \not\equiv 0$ and $p + m \not\equiv 0 \pmod 5$, so:
  $$\lambda_1 = 0, \quad \lambda_4 = 0.$$

#### Rank-3 Embedding Proof
The spectrum of $G$ is:
$$\sigma(G) = \left\{ \sqrt{5}, \; \frac{5 - \sqrt{5}}{2}, \; \frac{5 - \sqrt{5}}{2}, \; 0, \; 0 \right\}.$$
Notice that:
1. $\lambda_m \ge 0$ for all $m$, so $G \succeq 0$ (positive semi-definite).
2. Exactly 3 eigenvalues are strictly positive, and 2 are identically zero.
3. $\text{rank}(G) = 3$.
By the Spectral Theorem, $G$ can be factored as $G = V^T V$, where $V \in \mathbb{R}^{3 \times 5}$ is a matrix of 5 column vectors in $\mathbb{R}^3$. This rigorously proves that the KCBS vectors embed into a real 3D subspace $\mathbb{R}^3 \subset \mathbb{C}^3$ with zero geometric distortion.

---

<a id="section-4"></a>
## Section 4: Graph Theory, Lovász $\vartheta(G)$, Orthonormal Representations, and Sandwich Theorems

### 4.1 Orthonormal Representations (ONR)
Let $G = (V, E)$ be a simple undirected graph with vertex set $V = \{1, \dots, N\}$.
An **Orthonormal Representation (ONR)** of $G$ in $\mathbb{R}^d$ is an assignment of unit vectors $i \mapsto |u_i\rangle \in \mathbb{R}^d$ such that:
$$\langle u_i | u_j \rangle = 0 \quad \text{whenever } (i, j) \notin E \text{ (non-adjacent in } G\text{)}.$$
Equivalently, an ONR of the complement graph $\overline{G}$ satisfies:
$$\langle u_i | u_j \rangle = 0 \quad \text{whenever } (i, j) \in E \text{ (adjacent in } G\text{)}.$$

### 4.2 The Lovász Theta Function $\vartheta(G)$
Introduced by László Lovász in his landmark 1979 paper (*On the Shannon Capacity of a Graph*), the theta function $\vartheta(G)$ can be formulated in several dual ways:
1. **Handle Representation (Geometric Primal):**
   $$\vartheta(G) = \max_{|c\rangle, \{|u_i\rangle\}} \sum_{i \in V} |\langle c | u_i \rangle|^2,$$
   where $|c\rangle$ is a unit handle vector ($\||c\rangle\| = 1$) and $\{|u_i\rangle\}_{i \in V}$ is an ONR of $\overline{G}$.
2. **Semidefinite Program (SDP Formulation):**
   $$\vartheta(G) = \max_{X \in \mathcal{S}^N} \left\{ \sum_{i,j=1}^N X_{ij} : X \succeq 0, \; \text{Tr}(X) = 1, \; X_{ij} = 0 \text{ for all } (i, j) \in E \right\}.$$
3. **Dual SDP Formulation:**
   $$\vartheta(G) = \min_{M \in \mathcal{S}^N} \left\{ \lambda_{\max}(M) : M_{ii} = 1 \; (\forall i), \; M_{ij} = 1 \text{ for } (i, j) \notin E \right\}.$$

### 4.3 The Lovász Sandwich Theorem
For any graph $G$:
$$\alpha(G) \le \vartheta(G) \le \chi(\overline{G}) \le \chi^*(G),$$
where:
- $\alpha(G)$ is the independence number of $G$ (maximum cardinality of a pairwise non-adjacent subset of $V$).
- $\chi(\overline{G})$ is the clique covering number of $G$ (minimum number of cliques needed to cover all vertices of $G$).
- $\chi^*(G)$ is the fractional chromatic number.

### 4.4 Odd vs. Even Cycles
#### Odd Cycles $C_N$ ($N \ge 3$ odd)
For an odd cycle of length $N = 2k + 1$:
1. Classical independence number:
   $$\alpha(C_N) = \frac{N - 1}{2} = k.$$
2. Lovász theta function:
   $$\vartheta(C_N) = \frac{N \cos(\pi/N)}{1 + \cos(\pi/N)}.$$
   For $N = 5$:
   $$\vartheta(C_5) = \frac{5 \cos(\pi/5)}{1 + \cos(\pi/5)} = \frac{5 (\phi/2)}{1 + \phi/2} = \frac{5\phi}{2+\phi} = \sqrt{5} \approx 2.236068.$$
3. Fractional independence number (fractional packing bound):
   $$\alpha^*(C_N) = \frac{N}{2}.$$
   For $N = 5$: $\alpha^*(C_5) = 2.5$.
   Thus we obtain the strict separation:
   $$\alpha(C_5) = 2 < \vartheta(C_5) = \sqrt{5} \approx 2.236 < \alpha^*(C_5) = 2.5.$$

#### Even Cycles $C_{2k}$
Even cycles are bipartite graphs. By König's theorem, bipartite graphs are **perfect graphs**:
$$\alpha(C_{2k}) = \vartheta(C_{2k}) = \chi(\overline{C_{2k}}) = k.$$
Because $\alpha(C_{2k}) = \vartheta(C_{2k})$, quantum mechanics **cannot exceed** the classical bound on any even cycle exclusivity graph! Bipartite exclusivity graphs can never witness quantum contextuality.

---

<a id="section-5"></a>
## Section 5: Anti-ferromagnetic Frustration Theorem, Cycle Parity Invariant $\prod S_i S_{i+1} = +1$, and the $-3$ Classical Floor

### 5.1 Classical Spin Assignment on $C_5$
Let $s_i \in \{+1, -1\}$ ($i \in \mathbb{Z}_5$) be a classical valuation of the five observables. The five edge correlations are:
$$e_i := s_i s_{i+1} \in \{+1, -1\}, \quad i \in \{0, 1, 2, 3, 4\} \pmod 5.$$
The total correlation sum is:
$$\mathcal{S}_{\text{class}} = \sum_{i=0}^4 e_i = \sum_{i=0}^4 s_i s_{i+1}.$$

### 5.2 The Cycle Parity Invariant
#### Theorem 5.1 (Cycle Parity Invariant)
For any assignment $s \in \{+1, -1\}^5$, the product of all five edge variables is an exact algebraic invariant:
$$\prod_{i=0}^4 e_i = \prod_{i=0}^4 (s_i s_{i+1}) \equiv +1.$$

*Proof:*
$$\prod_{i=0}^4 (s_i s_{i+1}) = (s_0 s_1)(s_1 s_2)(s_2 s_3)(s_3 s_4)(s_4 s_0) = s_0^2 s_1^2 s_2^2 s_3^2 s_4^2.$$
Since $s_i \in \{+1, -1\}$, $s_i^2 = (+1)$ for every $i$.
$$\prod_{i=0}^4 e_i = (+1)(+1)(+1)(+1)(+1) = +1. \quad \blacksquare$$

### 5.3 Proof of the $-3$ Classical Floor
Let $k \in \{0, 1, 2, 3, 4, 5\}$ denote the number of edges with negative correlation ($e_i = -1$).
The remaining $5 - k$ edges have positive correlation ($e_i = +1$).
The product of the edge variables is:
$$\prod_{i=0}^4 e_i = (-1)^k (+1)^{5-k} = (-1)^k.$$
By the Cycle Parity Invariant (Theorem 5.1), $(-1)^k = +1$.
Therefore, $k$ **must be an even integer**:
$$k \in \{0, 2, 4\}.$$
The correlation sum as a function of $k$ is:
$$\mathcal{S}(k) = (5 - k)(+1) + k(-1) = 5 - 2k.$$
Evaluating $\mathcal{S}(k)$ for all admissible values of $k$:
- $k = 0 \implies \mathcal{S}(0) = 5 - 2(0) = +5$ (all spins aligned, e.g. $(+,+,+,+,+)$).
- $k = 2 \implies \mathcal{S}(2) = 5 - 2(2) = +1$ (e.g. $(+,+,+,-,-)$).
- $k = 4 \implies \mathcal{S}(4) = 5 - 2(4) = -3$ (e.g. $(+,+,-,+,-)$).

Could we have $k = 5$ (all five edges anti-correlated, $\mathcal{S} = -5$)?
If $k = 5$, then $(-1)^5 = -1 \ne +1$, violating the cycle parity invariant!
Thus, an odd cycle is topologically **frustrated**: it is impossible to satisfy all five anti-ferromagnetic bonds simultaneously. The minimum possible classical sum is strictly $-3$:
$$\min_{s \in \{+1, -1\}^5} \sum_{i=0}^4 s_i s_{i+1} = -3.$$

### 5.4 How Quantum Mechanics Escapes Frustration
In quantum mechanics, the expectation value of a product of non-commuting observables is not constrained by scalar valuation products.
While adjacent pairs commute ($[\hat{S}_i, \hat{S}_{i+1}] = 0$), non-adjacent pairs do not ($[\hat{S}_0, \hat{S}_2] \ne 0$).
Consequently, there does NOT exist a joint probability distribution over all five observables.
The quantum expectation value achieves:
$$\sum_{i=0}^4 \langle \psi | \hat{S}_i \hat{S}_{i+1} | \psi \rangle = 5 - 4\sqrt{5} \approx -3.944272,$$
breaking the topological $-3$ barrier by exploiting quantum contextuality.

---

<a id="section-6"></a>
## Section 6: Pitowsky Correlation Polytope for $n=3$, V-rep to H-rep Facet Extraction, Barycentric Coordinates, and Quantum Boundary Contact

### 6.1 The $n=3$ Correlation Scenario
Consider three dichotomic observables $S_1, S_2, S_3 \in \{+1, -1\}$.
The correlation vector is defined by the pairwise expectations:
$$\vec{x} = (x_1, x_2, x_3) = (\langle S_1 S_2 \rangle, \; \langle S_2 S_3 \rangle, \; \langle S_3 S_1 \rangle) \in \mathbb{R}^3.$$

### 6.2 The $2^3 = 8$ Assignments and Vertex Degeneracy
There are $2^3 = 8$ deterministic hidden variable assignments $s = (s_1, s_2, s_3) \in \{+1, -1\}^3$.
Evaluating $\vec{x}(s) = (s_1 s_2, s_2 s_3, s_3 s_1)$:
1. $(+1, +1, +1) \mapsto (+1, +1, +1) = \vec{v}_0$
2. $(-1, -1, -1) \mapsto (+1, +1, +1) = \vec{v}_0$
3. $(+1, +1, -1) \mapsto (+1, -1, -1) = \vec{v}_1$
4. $(-1, -1, +1) \mapsto (+1, -1, -1) = \vec{v}_1$
5. $(+1, -1, +1) \mapsto (-1, -1, +1) = \vec{v}_2$
6. $(-1, +1, -1) \mapsto (-1, -1, +1) = \vec{v}_2$
7. $(-1, +1, +1) \mapsto (-1, +1, -1) = \vec{v}_3$
8. $(+1, -1, -1) \mapsto (-1, +1, -1) = \vec{v}_3$

Because $\vec{x}(-s) = (-s_1)(-s_2) = s_1 s_2 = \vec{x}(s)$, the 8 assignments pair up into **4 unique extreme vertices**:
$$\vec{v}_0 = \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix}, \quad \vec{v}_1 = \begin{pmatrix} 1 \\ -1 \\ -1 \end{pmatrix}, \quad \vec{v}_2 = \begin{pmatrix} -1 \\ -1 \\ 1 \end{pmatrix}, \quad \vec{v}_3 = \begin{pmatrix} -1 \\ 1 \\ -1 \end{pmatrix}.$$

### 6.3 Geometric Structure: Regular Tetrahedron
Compute all $\binom{4}{2} = 6$ pairwise squared Euclidean distances:
$$\|\vec{v}_0 - \vec{v}_1\|^2 = (1-1)^2 + (1 - (-1))^2 + (1 - (-1))^2 = 0 + 4 + 4 = 8 \implies d = 2\sqrt{2}.$$
$$\|\vec{v}_0 - \vec{v}_2\|^2 = (1 - (-1))^2 + (1 - (-1))^2 + (1-1)^2 = 4 + 4 + 0 = 8 \implies d = 2\sqrt{2}.$$
$$\|\vec{v}_0 - \vec{v}_3\|^2 = (1 - (-1))^2 + (1-1)^2 + (1 - (-1))^2 = 4 + 0 + 4 = 8 \implies d = 2\sqrt{2}.$$
$$\|\vec{v}_1 - \vec{v}_2\|^2 = (1 - (-1))^2 + (-1 - (-1))^2 + (-1-1)^2 = 4 + 0 + 4 = 8 \implies d = 2\sqrt{2}.$$
$$\|\vec{v}_1 - \vec{v}_3\|^2 = (1 - (-1))^2 + (-1-1)^2 + (-1 - (-1))^2 = 4 + 4 + 0 = 8 \implies d = 2\sqrt{2}.$$
$$\|\vec{v}_2 - \vec{v}_3\|^2 = (-1 - (-1))^2 + (-1-1)^2 + (1 - (-1))^2 = 0 + 4 + 4 = 8 \implies d = 2\sqrt{2}.$$
All 6 edges are of identical length $L = 2\sqrt{2}$. The correlation polytope is an exact **regular tetrahedron** in $\mathbb{R}^3$!

### 6.4 Polytope Volume
The volume of a 3-simplex with vertices $\vec{v}_0, \vec{v}_1, \vec{v}_2, \vec{v}_3$ is:
$$\text{Vol}(\mathcal{P}) = \frac{1}{6} |\det(\vec{v}_1 - \vec{v}_0, \; \vec{v}_2 - \vec{v}_0, \; \vec{v}_3 - \vec{v}_0)|.$$
$$\vec{u}_1 = \vec{v}_1 - \vec{v}_0 = \begin{pmatrix} 0 \\ -2 \\ -2 \end{pmatrix}, \quad \vec{u}_2 = \vec{v}_2 - \vec{v}_0 = \begin{pmatrix} -2 \\ -2 \\ 0 \end{pmatrix}, \quad \vec{u}_3 = \vec{v}_3 - \vec{v}_0 = \begin{pmatrix} -2 \\ 0 \\ -2 \end{pmatrix}.$$
$$\det \begin{pmatrix} 0 & -2 & -2 \\ -2 & -2 & 0 \\ -2 & 0 & -2 \end{pmatrix} = 0 - (-2)(4 - 0) + (-2)(0 - 4) = 8 + 8 = 16.$$
$$\text{Vol}(\mathcal{P}) = \frac{16}{6} = \frac{8}{3}.$$
*(Cross-check via standard tetrahedron formula: $\text{Vol} = \frac{L^3}{6\sqrt{2}} = \frac{(2\sqrt{2})^3}{6\sqrt{2}} = \frac{16\sqrt{2}}{6\sqrt{2}} = \frac{8}{3}$. Perfect match!)*

### 6.5 V-representation to H-representation (Facet Planes)
Each facet is defined by 3 vertices and lies opposite the fourth vertex:
1. **Facet $F_0$ (opposite $\vec{v}_0$):** Contains $\vec{v}_1, \vec{v}_2, \vec{v}_3$.
   Normal vector $\vec{n}_0 \propto (\vec{v}_2 - \vec{v}_1) \times (\vec{v}_3 - \vec{v}_1)$:
   $$\vec{v}_2 - \vec{v}_1 = (-2, 0, 2)^T, \quad \vec{v}_3 - \vec{v}_1 = (-2, 2, 0)^T.$$
   $$\vec{n}_0 = \begin{pmatrix} -2 \\ 0 \\ 2 \end{pmatrix} \times \begin{pmatrix} -2 \\ 2 \\ 0 \end{pmatrix} = \begin{pmatrix} -4 \\ -4 \\ -4 \end{pmatrix} \propto \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix}.$$
   Evaluating at $\vec{v}_1$: $\vec{n}_0 \cdot \vec{v}_1 = 1(1) + 1(-1) + 1(-1) = -1$.
   Evaluating at $\vec{v}_0$: $\vec{n}_0 \cdot \vec{v}_0 = 1+1+1 = 3 \ge -1$.
   Facet inequality:
   $$x_1 + x_2 + x_3 \ge -1.$$
2. **Facet $F_1$ (opposite $\vec{v}_1$):** Contains $\vec{v}_0, \vec{v}_2, \vec{v}_3$.
   Facet inequality:
   $$x_1 - x_2 - x_3 \ge -1.$$
3. **Facet $F_2$ (opposite $\vec{v}_2$):** Contains $\vec{v}_0, \vec{v}_1, \vec{v}_3$.
   Facet inequality:
   $$-x_1 - x_2 + x_3 \ge -1.$$
4. **Facet $F_3$ (opposite $\vec{v}_3$):** Contains $\vec{v}_0, \vec{v}_1, \vec{v}_2$.
   Facet inequality:
   $$-x_1 + x_2 - x_3 \ge -1.$$

These are the classical **Pitowsky correlation inequalities** for $n=3$.

### 6.6 Barycentric Coordinates
For any point $\vec{x} \in \mathbb{R}^3$, the unique weights $\sum_{k=0}^3 \lambda_k = 1$ such that $\vec{x} = \sum_{k=0}^3 \lambda_k \vec{v}_k$ are:
$$\lambda_0 = \frac{1 + x_1 + x_2 + x_3}{4},$$
$$\lambda_1 = \frac{1 + x_1 - x_2 - x_3}{4},$$
$$\lambda_2 = \frac{1 - x_1 - x_2 + x_3}{4},$$
$$\lambda_3 = \frac{1 - x_1 + x_2 - x_3}{4}.$$
Clearly $\sum_{k=0}^3 \lambda_k = \frac{4 + (x_1+x_1-x_1-x_1) + (x_2-x_2-x_2+x_2) + (x_3-x_3+x_3-x_3)}{4} = \frac{4}{4} = 1$.
A point $\vec{x}$ lies inside the classical polytope if and only if $\lambda_k \ge 0$ for all $k \in \{0, 1, 2, 3\}$.

### 6.7 Quantum Boundary Contact at $(-1/3, -1/3, -1/3)$
Consider three mutually orthogonal rays in $\mathbb{R}^3$:
$$|v_1\rangle = \begin{pmatrix} 1 \\ 0 \\ 0 \end{pmatrix}, \quad |v_2\rangle = \begin{pmatrix} 0 \\ 1 \\ 0 \end{pmatrix}, \quad |v_3\rangle = \begin{pmatrix} 0 \\ 0 \\ 1 \end{pmatrix}.$$
Let the probe state be the completely symmetric vector:
$$|\psi\rangle = \frac{1}{\sqrt{3}} \begin{pmatrix} 1 \\ 1 \\ 1 \end{pmatrix}.$$
The event probabilities are:
$$p_i = |\langle \psi | v_i \rangle|^2 = \frac{1}{3}, \quad \forall i \in \{1, 2, 3\}.$$
Since $P_i P_j = 0$ for $i \ne j$, the correlator is:
$$\langle S_i S_j \rangle = 1 - 2p_i - 2p_j = 1 - \frac{2}{3} - \frac{2}{3} = -\frac{1}{3}.$$
Thus the quantum correlation point is:
$$\vec{x}_Q = \left(-\frac{1}{3}, \; -\frac{1}{3}, \; -\frac{1}{3}\right).$$
Substitute $\vec{x}_Q$ into Facet $F_0$:
$$x_1 + x_2 + x_3 = -\frac{1}{3} - \frac{1}{3} - \frac{1}{3} = -1.$$
The slack against Facet $F_0$ is **identically zero**:
$$\text{Slack}(F_0, \vec{x}_Q) = -1 - (-1) = 0 \implies \lambda_0 = 0.$$
The remaining barycentric weights are:
$$\lambda_1 = \lambda_2 = \lambda_3 = \frac{1 - 1/3 + 1/3 + 1/3}{4} = \frac{4/3}{4} = \frac{1}{3}.$$
Thus, the quantum point **touches the boundary facet of the classical tetrahedron exactly at its barycenter**, but **cannot cross it**!
This proves that for $n=3$ mutually orthogonal rays, quantum mechanics is strictly non-contextual. Contextuality demands $n \ge 5$ rays.

---

<a id="section-7"></a>
## Section 7: Nested Convex Worlds: $\text{STAB}(G) \subset \text{TH}(G) \subset \text{QSTAB}(G)$, CSW Exclusivity, and Gleason's Theorem

### 7.1 The Three Convex Bodies
For any exclusivity graph $G = (V, E)$:
1. **The Stable Set Polytope (Classical / Non-contextual World):**
   $$\text{STAB}(G) = \text{conv}\{\chi_I \in \{0, 1\}^V : I \subseteq V \text{ is an independent set of } G\}.$$
2. **The Fractional Stable Set Polytope (No-Signaling / Algebraic Exclusivity World):**
   $$\text{QSTAB}(G) = \{x \in \mathbb{R}_+^V : \sum_{i \in Q} x_i \le 1 \text{ for all cliques } Q \subseteq G\}.$$
3. **The Lovász Theta Body (Quantum World):**
   $$\text{TH}(G) = \{x \in \mathbb{R}_+^V : \exists \text{ ONR } \{|u_i\rangle\} \text{ of } \overline{G}, \; \||c\rangle\|=1 \text{ s.t. } x_i = |\langle c | u_i \rangle|^2 \; \forall i\}.$$

### 7.2 The Geometric Nesting
For any graph $G$:
$$\text{STAB}(G) \subseteq \text{TH}(G) \subseteq \text{QSTAB}(G).$$
- By the Grotschel-Lovász-Schrijver theorem (1986), $\text{STAB}(G) = \text{QSTAB}(G)$ if and only if $G$ is a **perfect graph**.
- For $C_5$, the pentagon is not perfect ($\alpha(C_5) = 2, \chi(C_5) = 3$). Hence:
  $$\text{STAB}(C_5) \subsetneq \text{TH}(C_5) \subsetneq \text{QSTAB}(C_5).$$
  - The maximum of $\sum x_i$ over $\text{STAB}(C_5)$ is $\alpha(C_5) = 2$.
  - The maximum of $\sum x_i$ over $\text{TH}(C_5)$ is $\vartheta(C_5) = \sqrt{5} \approx 2.236$.
  - The maximum of $\sum x_i$ over $\text{QSTAB}(C_5)$ is the fractional packing number $\alpha^*(C_5) = 5/2 = 2.5$.

### 7.3 Cabello-Severini-Winter (CSW) Exclusivity Principle
Cabello, Severini, and Winter (PRL 112, 040403, 2014) established that:
- Any set of events that are pairwise exclusive must satisfy $\sum_{i \in Q} P(e_i) \le 1$ for any clique $Q$ in the exclusivity graph.
- Applying this exclusivity principle to independent copies of the graph ($G \boxtimes G \boxtimes \dots \boxtimes G$) asymptotically converges to the Lovász theta function:
  $$\lim_{k \to \infty} [\alpha(G^{\boxtimes k})]^{1/k} = \vartheta(G).$$
  This demonstrates that the quantum boundary $\text{TH}(G)$ is the **unique** convex set consistent with the exclusivity principle applied to independent physical experiments!

### 7.4 Gleason's Theorem (1957)
#### Theorem 7.1 (Gleason)
Let $\mathcal{H}$ be a separable Hilbert space of dimension $\dim(\mathcal{H}) \ge 3$. Let $\mu: \mathcal{L}(\mathcal{H}) \to [0, 1]$ be a probability measure on the lattice of projection operators such that for any countable set of mutually orthogonal projectors $\{P_i\}$,
$$\mu\left(\sum_i P_i\right) = \sum_i \mu(P_i).$$
Then there exists a unique positive semi-definite, trace-class operator $\rho$ (density matrix) with $\text{Tr}(\rho) = 1$ such that:
$$\mu(P) = \text{Tr}(\rho P) \quad \text{for all } P \in \mathcal{L}(\mathcal{H}).$$

*Physical Consequence:*
Gleason's theorem rules out dispersion-free states ($\mu(P) \in \{0, 1\}$) on $\mathcal{H}$ for any dimension $d \ge 3$. Because non-contextual hidden variables require dispersion-free states, quantum mechanics in $d \ge 3$ is **inherently contextual**.

---

<a id="section-8"></a>
## Section 8: Tsirelson's $2\sqrt{2}$ Bound: Parallelogram Invariant, SOS Operator Certificate, Commutator Identity, Landau Arcsin, and NPA Hierarchy

### 8.1 The CHSH Operator and Observables
In the bipartite Bell-CHSH scenario, Alice chooses between dichotomic observables $A_0, A_1$ and Bob chooses between $B_0, B_1$, with $A_x^2 = \mathbb{I}, B_y^2 = \mathbb{I}$, and $[A_x, B_y] = 0$.
The Bell-CHSH operator is:
$$\hat{\mathcal{C}} = A_0 B_0 + A_0 B_1 + A_1 B_0 - A_1 B_1 = A_0(B_0 + B_1) + A_1(B_0 - B_1).$$

### 8.2 Window 1: Parallelogram Law Invariant
Let $S = B_0 + B_1$ and $D = B_0 - B_1$. In Tsirelson's vector representation:
$$\langle \hat{\mathcal{C}} \rangle = \vec{a}_0 \cdot \vec{S} + \vec{a}_1 \cdot \vec{D}.$$
By Cauchy-Schwarz:
$$\vec{a}_0 \cdot \vec{S} \le \|\vec{a}_0\| \|\vec{S}\| = 1 \cdot u = u, \quad \vec{a}_1 \cdot \vec{D} \le \|\vec{a}_1\| \|\vec{D}\| = 1 \cdot v = v,$$
where $u = \|\vec{b}_0 + \vec{b}_1\|$ and $v = \|\vec{b}_0 - \vec{b}_1\|$.
By the Parallelogram Law:
$$u^2 + v^2 = \|\vec{b}_0 + \vec{b}_1\|^2 + \|\vec{b}_0 - \vec{b}_1\|^2 = 2(\|\vec{b}_0\|^2 + \|\vec{b}_1\|^2) = 2(1 + 1) = 4.$$
Maximizing $u + v$ subject to $u^2 + v^2 = 4$:
By the Cauchy-Schwarz inequality on $\mathbb{R}^2$, $(1 \cdot u + 1 \cdot v)^2 \le (1^2 + 1^2)(u^2 + v^2) = 2 \cdot 4 = 8$.
$$u + v \le \sqrt{8} = 2\sqrt{2}.$$
Equality occurs if and only if $u = v = \sqrt{2}$, which implies:
$$\|\vec{b}_0 + \vec{b}_1\|^2 = \|\vec{b}_0 - \vec{b}_1\|^2 \iff \vec{b}_0 \cdot \vec{b}_1 = 0 \iff \vec{b}_0 \perp \vec{b}_1.$$

### 8.3 Window 2: Sum-of-Squares (SOS) Operator Proof
Define the two Hermitian defect operators:
$$M := \frac{A_0 + A_1}{\sqrt{2}} - B_0, \qquad N := \frac{A_0 - A_1}{\sqrt{2}} - B_1.$$
Expanding their squares:
$$M^2 = \frac{(A_0 + A_1)^2}{2} + B_0^2 - \frac{1}{\sqrt{2}}\{A_0 + A_1, B_0\} = \frac{A_0^2 + A_1^2 + \{A_0, A_1\}}{2} + \mathbb{I} - \sqrt{2}(A_0 B_0 + A_1 B_0).$$
Since $A_0^2 = A_1^2 = \mathbb{I}$:
$$M^2 = \mathbb{I} + \frac{1}{2}\{A_0, A_1\} + \mathbb{I} - \sqrt{2}(A_0 B_0 + A_1 B_0) = 2\mathbb{I} + \frac{1}{2}\{A_0, A_1\} - \sqrt{2}(A_0 B_0 + A_1 B_0).$$
Similarly for $N^2$:
$$N^2 = \frac{(A_0 - A_1)^2}{2} + B_1^2 - \frac{1}{\sqrt{2}}\{A_0 - A_1, B_1\} = 2\mathbb{I} - \frac{1}{2}\{A_0, A_1\} - \sqrt{2}(A_0 B_1 - A_1 B_1).$$
Adding $M^2$ and $N^2$ causes the anticommutator $\{A_0, A_1\}$ to cancel identically:
$$M^2 + N^2 = 4\mathbb{I} - \sqrt{2}(A_0 B_0 + A_0 B_1 + A_1 B_0 - A_1 B_1) = 4\mathbb{I} - \sqrt{2} \hat{\mathcal{C}}.$$
Dividing by $\sqrt{2}$:
$$\frac{1}{\sqrt{2}}(M^2 + N^2) = 2\sqrt{2}\mathbb{I} - \hat{\mathcal{C}} \iff 2\sqrt{2}\mathbb{I} - \hat{\mathcal{C}} = \frac{1}{\sqrt{2}} M^2 + \frac{1}{\sqrt{2}} N^2.$$
Because $M = M^\dagger$ and $N = N^\dagger$, $M^2 \succeq 0$ and $N^2 \succeq 0$.
Thus, for any state $|\psi\rangle$:
$$\langle \psi | (2\sqrt{2}\mathbb{I} - \hat{\mathcal{C}}) | \psi \rangle = \frac{1}{\sqrt{2}}\|M|\psi\rangle\|^2 + \frac{1}{\sqrt{2}}\|N|\psi\rangle\|^2 \ge 0.$$
Therefore:
$$\langle \hat{\mathcal{C}} \rangle_\psi \le 2\sqrt{2}. \quad \blacksquare$$

### 8.4 Window 3: The Commutator Identity $\hat{\mathcal{C}}^2 = 4\mathbb{I} - [A_0, A_1][B_0, B_1]$
Let $S = B_0 + B_1$ and $D = B_0 - B_1$. Then $\hat{\mathcal{C}} = A_0 S + A_1 D$.
Notice:
$$S D = (B_0 + B_1)(B_0 - B_1) = B_0^2 - B_0 B_1 + B_1 B_0 - B_1^2 = \mathbb{I} - B_0 B_1 + B_1 B_0 - \mathbb{I} = [B_1, B_0] = -[B_0, B_1].$$
$$D S = (B_0 - B_1)(B_0 + B_1) = B_0^2 + B_0 B_1 - B_1 B_0 - B_1^2 = [B_0, B_1] = -S D.$$
Thus $S D + D S = 0$ (they anticommute!).
Furthermore:
$$S^2 + D^2 = (B_0+B_1)^2 + (B_0-B_1)^2 = 2(B_0^2 + B_1^2) = 4\mathbb{I}.$$
Now compute $\hat{\mathcal{C}}^2$:
$$\hat{\mathcal{C}}^2 = (A_0 S + A_1 D)(A_0 S + A_1 D) = A_0^2 S^2 + A_0 A_1 S D + A_1 A_0 D S + A_1^2 D^2.$$
Since $[A_x, B_y] = 0$, $A_0^2 = A_1^2 = \mathbb{I}$, and $D S = -S D$:
$$\hat{\mathcal{C}}^2 = S^2 + D^2 + A_0 A_1 S D - A_1 A_0 S D = 4\mathbb{I} + (A_0 A_1 - A_1 A_0) S D = 4\mathbb{I} + [A_0, A_1] (-[B_0, B_1]).$$
$$\hat{\mathcal{C}}^2 = 4\mathbb{I} - [A_0, A_1][B_0, B_1]. \quad \blacksquare$$

Since $[A_0, A_1]$ and $[B_0, B_1]$ are skew-Hermitian operators on qubits, their operator norms satisfy $\|[A_0, A_1]\| \le 2$ and $\|[B_0, B_1]\| \le 2$.
Therefore:
$$\|\hat{\mathcal{C}}^2\| \le 4 + \|[A_0, A_1]\| \|[B_0, B_1]\| \le 4 + 2 \cdot 2 = 8 \implies \|\hat{\mathcal{C}}\| \le \sqrt{8} = 2\sqrt{2}.$$

### 8.5 Window 4: Landau Arcsin Criterion & NPA Hierarchy Level-1
#### Landau's Criterion (1988)
L. J. Landau established that four correlators $E_{xy} = \langle A_x B_y \rangle$ are quantum-realizable if and only if:
$$|\arcsin E_{00} + \arcsin E_{01} + \arcsin E_{10} - \arcsin E_{11}| \le \pi.$$
In the symmetric case $E_{00} = E_{01} = E_{10} = x$ and $E_{11} = y$:
$$3\arcsin x - \arcsin y = \pi \implies y = \sin(3\arcsin x - \pi) = -\sin(3\arcsin x) = 4x^3 - 3x.$$
The Bell value is $\mathcal{C} = 3x - y = 3x - (4x^3 - 3x) = 6x - 4x^3$.
Differentiating to find the maximum:
$$\frac{d\mathcal{C}}{dx} = 6 - 12x^2 = 0 \implies x^2 = \frac{1}{2} \implies x = \frac{1}{\sqrt{2}}.$$
At $x = 1/\sqrt{2}$:
$$y = 4(1/\sqrt{2})^3 - 3(1/\sqrt{2}) = \frac{4}{2\sqrt{2}} - \frac{3}{\sqrt{2}} = -\frac{1}{\sqrt{2}}.$$
$$\mathcal{C}_{\max} = 3\left(\frac{1}{\sqrt{2}}\right) - \left(-\frac{1}{\sqrt{2}}\right) = \frac{4}{\sqrt{2}} = 2\sqrt{2}.$$

#### NPA Hierarchy Level 1 (Navascués-Pironio-Acín 2007)
Consider the operator set $\mathcal{O} = \{\mathbb{I}, A_0, A_1, B_0, B_1\}$. The Gram moment matrix $\Gamma_{ij} = \langle \psi | \mathcal{O}_i^\dagger \mathcal{O}_j | \psi \rangle$ is:
$$\Gamma = \begin{pmatrix}
1 & \langle A_0\rangle & \langle A_1\rangle & \langle B_0\rangle & \langle B_1\rangle \\
\langle A_0\rangle & 1 & a & E_{00} & E_{01} \\
\langle A_1\rangle & a & 1 & E_{10} & E_{11} \\
\langle B_0\rangle & E_{00} & E_{10} & 1 & b \\
\langle B_1\rangle & E_{01} & E_{11} & b & 1
\end{pmatrix} \succeq 0.$$
For unbiased marginals ($\langle A_x\rangle = \langle B_y\rangle = 0$) and orthogonal observables ($a = b = 0$):
The submatrix over $\{A_0, A_1, B_0, B_1\}$ with symmetric entries $E$ is:
$$\Gamma_{\text{sub}} = \begin{pmatrix}
1 & 0 & E & E \\
0 & 1 & E & -E \\
E & E & 1 & 0 \\
E & -E & 0 & 1
\end{pmatrix}.$$
Its eigenvalues are $\lambda = 1 \pm \sqrt{2} E$.
Positive semi-definiteness $\Gamma \succeq 0$ requires:
$$1 - \sqrt{2} E \ge 0 \implies E \le \frac{1}{\sqrt{2}} \implies \mathcal{C} = 4E \le \frac{4}{\sqrt{2}} = 2\sqrt{2}.$$

---

<a id="section-9"></a>
## Section 9: The Hierarchy $L \subset Q \subset NS$, Popescu-Rohrlich PR Boxes, Trivial Communication Complexity, and Information Causality

### 9.1 The 2D Slice Boundaries
In the 2D plane defined by:
$$C_1 = E_{00} + E_{01} + E_{10} - E_{11}, \qquad C_2 = E_{00} + E_{01} - E_{10} + E_{11}:$$
1. **Local Realism $L$:**
   $$\max(|C_1|, |C_2|) \le 2 \implies \text{Square } [-2, 2]^2.$$
   The four deterministic corners are $(\pm 2, \pm 2)$.
2. **Quantum Mechanics $Q$:**
   $$C_1^2 + C_2^2 \le 8 \implies \text{Circular Disc of radius } 2\sqrt{2}.$$
3. **No-Signaling Principle $NS$:**
   $$|C_1| + |C_2| \le 4 \implies \text{Diamond with vertices } (\pm 4, 0) \text{ and } (0, \pm 4).$$

*Nesting Geometry:*
- The Local square is inscribed inside the Quantum disc: they touch at the 4 points $(\pm 2, \pm 2)$ where $2^2 + 2^2 = 8$.
- The Quantum disc is inscribed inside the No-Signaling diamond: they touch at the 4 points $(\pm 2, \pm 2)$ where $|2| + |2| = 4$.

### 9.2 The Popescu-Rohrlich (PR) Box (1994)
A PR box is an idealized no-signaling correlation defined by:
$$P(a, b | x, y) = \begin{cases} \frac{1}{2} & \text{if } a \oplus b = x \cdot y \\ 0 & \text{otherwise} \end{cases}, \quad a, b, x, y \in \{0, 1\}.$$
- Marginals: $P(a|x, y) = 1/2$, $P(b|x, y) = 1/2$ (strictly independent of the other party's input $\implies$ no-signaling).
- Correlators:
  $$E_{00} = +1, \quad E_{01} = +1, \quad E_{10} = +1, \quad E_{11} = -1.$$
  $$\mathcal{C}_{\text{PR}} = 1 + 1 + 1 - (-1) = 4.$$
This reaches the algebraic maximum of 4, sitting at the tip $(4, 0)$ of the No-Signaling diamond.

### 9.3 Trivial Communication Complexity (van Dam 2000)
Wim van Dam proved that if PR boxes existed in nature:
- Any distributed Boolean function $f(x, y)$ ($x \in \{0, 1\}^n, y \in \{0, 1\}^n$) could be computed with **a single bit of classical communication**!
- Any non-local box with $\mathcal{C} > \frac{4}{\pi}(1 + \sqrt{2}) \approx 3.07$ causes communication complexity to collapse. Nature avoids PR boxes to preserve communication complexity non-triviality.

### 9.4 Information Causality (Pawłowski et al. Nature 2009)
Information Causality posits that:
> If Alice transmits $m$ classical bits to Bob, the total information Bob can acquire about a previously unknown data set of Alice cannot exceed $m$ bits, even if they share prior non-local resources.

Mathematically, if Alice has $N$ random bits $\vec{a} = (a_0, \dots, a_{N-1})$ and Bob attempts to guess bit $a_K$ given a choice $K \in \{0, \dots, N-1\}$:
$$\sum_{K=0}^{N-1} I(a_K : B | K) \le m.$$
- **Quantum Mechanics:** Strictly satisfies Information Causality; saturation yields Tsirelson's bound $2\sqrt{2}$.
- **PR Boxes:** Violate Information Causality ($I_{\text{total}} > m$). Information Causality is recognized as the foundational physical principle that singles out $2\sqrt{2}$.

---

<a id="section-10"></a>
## Section 10: Foundational Axiomatics: Kochen-Specker, Gleason, Bell Nonlocality, and Device-Independent Self-Testing

### 10.1 The Kochen-Specker Theorem (1967)
#### Theorem 10.1 (Kochen-Specker)
Let $\mathcal{H}$ be a Hilbert space of dimension $d \ge 3$. There does not exist a function $v: \mathcal{L}(\mathcal{H}) \to \{0, 1\}$ assigning truth values to projection operators such that:
1. $v(\mathbb{I}) = 1$.
2. For any set of mutually orthogonal projectors $\{P_i\}_{i=1}^d$ summing to $\mathbb{I}$ ($\sum_{i=1}^d P_i = \mathbb{I}$),
   $$\sum_{i=1}^d v(P_i) = 1.$$
*Significance:* Quantum mechanics is irreconcilably non-contextual. The measurement outcome of an observable cannot be thought of as revealing a pre-existing property that is independent of the co-measured observables.

### 10.2 Bell Nonlocality as Distributed Contextuality
Bell nonlocality is a special case of contextuality where the contexts are enforced by space-like separation between relativistic observers. Every Bell inequality is a noncontextuality inequality for a specific exclusivity graph, but contextuality is more fundamental because it operates within a single physical system without requiring entanglement.

### 10.3 Device-Independent Self-Testing
Self-testing (Mayers & Yao 2004; Šupić & Bowles 2020) is the phenomenon where the maximal violation of a Bell or contextuality inequality **uniquely determines the quantum state and the measurement operators** up to local isometries.
- **For CHSH:** If $\langle \hat{\mathcal{C}} \rangle = 2\sqrt{2}$, then:
  1. The underlying state must be local-isometrically equivalent to the maximally entangled singlet/EPR state:
     $$|\psi\rangle \cong |\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}.$$
  2. The observables must satisfy the anticommutation relations:
     $$\{A_0, A_1\} = 0, \quad \{B_0, B_1\} = 0.$$
  Thus, Tsirelson's bound acts as an unforgeable cryptographic certificate of quantumness.

---

<a id="section-11"></a>
## Section 11: UI Architecture for Intuitively Connecting Every Page to its Mathematical Derivations

To satisfy the requirement that "each page should have its own intuitive connected contents", we propose the following unified, responsive UI architecture:

### 11.1 Component Specification: The "Derivation Drawer & Math Modal" Pattern
Every view in `qucontext` will feature a dedicated, context-sensitive mathematical derivation component:
1. **The "Inspect First-Principles Derivation" Action Bar:**
   A sleek banner at the top of each view displaying:
   - Primary Theorem & Citation (e.g. `KCBS · PRL 101, 020403`).
   - Key Analytical Invariant (e.g. `h = 5^(-1/4) · Circulant Rank 3`).
   - Quick "Deep Math" toggle button opening an expandable inline interactive derivation or slide-over drawer.
2. **Interactive Live Math Blocks:**
   Using our custom `<TeX>` component, all formulas are rendered with exact TeX typography, with interactive variables bound directly to the live state from `store.tsx`.
3. **Dedicated Mathematical Modules Per View:**
   - **Console View (`/console`):** Embeds the full KCBS contextuality theorem, qutrit Hilbert space derivation, and classical vs quantum witness comparison.
   - **Winding View (`/winding`):** Embeds the obtuse angle proof ($\cos\Delta \le 0$), deficit angle $\chi$, and why $\{5/1\}$ produces $h^2 = -1/\sqrt{5}$ while $\{5/2\}$ yields $h^2 = +1/\sqrt{5}$.
   - **Derivation View (`/derivation`):** Embeds the 9-step step-by-step solver, circulant Gram matrix spectrum, and rank-3 embedding proof.
   - **Playground View (`/playground`):** Embeds the graph-theoretic analysis of Lovász $\vartheta(G)$, ONR, and the sandwich theorem for odd vs even cycles.
   - **Classical Game (`/classical`):** Embeds the Anti-ferromagnetic Frustration Theorem, cycle parity invariant $\prod e_i = +1$, and the $-3$ integer programming floor.
   - **Polytope View (`/polytope`):** Embeds the regular tetrahedron derivation, volume $8/3$, V-rep to H-rep cross products, barycentric weights, and the quantum point facet contact at $(-1/3, -1/3, -1/3)$.
   - **Convexity View (`/convexity`):** Embeds $\text{STAB}(G) \subset \text{TH}(G) \subset \text{QSTAB}(G)$, CSW exclusivity framework, and Gleason's theorem.
   - **CHSH View (`/chsh`):** Embeds the complete 4-window Tsirelson derivation: Parallelogram, SOS, Commutator identity, and Landau arcsin / NPA.
   - **Hierarchy View (`/hierarchy`):** Embeds the 2D slice boundaries (square $\subset$ circle $\subset$ diamond), PR box properties, van Dam theorem, and Information Causality.
   - **Theory View (`/theory`):** Embeds the axiomatic synthesis linking Kochen-Specker, Gleason, Bell nonlocality, and self-testing.
