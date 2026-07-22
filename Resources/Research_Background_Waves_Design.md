# Physics and Mathematics of the Research Background Waves

The background animation for the research section relies on an approximated 2D wave equation computed via a discrete grid of interacting points. This is enhanced by custom physics such as variable wave speeds (refraction), damping boundaries (sponge layers), and a continuous harmonic oscillator.

## 1. The Core Wave Equation (Discrete Laplacian)

At its core, the system models the classic 2D wave equation:
$$ \frac{\partial^2 u}{\partial t^2} = c^2 \nabla^2 u $$

This is calculated discretely for a grid of 90 horizontal strings, each containing 170 points. For each point $p$, the code computes an approximation of the Laplacian ($\nabla^2 u$) by measuring the difference in displacement between a point and its immediate neighbors (up, down, left, right).

```javascript
let forceLeft = (j > 0) ? (strings[i][j - 1].y - p.y) : (strings[i][j + 1].y - p.y);
let forceRight = (j < pointsPerString - 1) ? (strings[i][j + 1].y - p.y) : (strings[i][j - 1].y - p.y);
let u_up = (i > 0) ? (strings[i - 1][j].y - strings[i - 1][j].baseY) : (strings[i + 1][j].y - strings[i + 1][j].baseY);
let u_down = (i < stringCount - 1) ? (strings[i + 1][j].y - strings[i + 1][j].baseY) : (strings[i - 1][j].y - strings[i - 1][j].baseY);

p.vy += (forceLeft + forceRight + (u_up - u) + (u_down - u)) * p.c2;
```

The parameter `p.c2` acts as the squared wave speed $c^2$ dictating how fast the force transfers between nodes.

## 2. Dual-Hemisphere Refraction

To create a visually complex and intellectually thematic environment, the screen is split into two halves with different "densities" or wave speeds. This creates a literal refraction effect across the UI split:

```javascript
// 1. Dual-Hemisphere Refraction: Left side is dense/slow, Right side is fast
this.c2 = (x < w / 2) ? 0.0015 : 0.006;
```

- **Right Hemisphere:** High $c^2$ ($0.006$), allowing waves to travel faster with a longer apparent wavelength.
- **Left Hemisphere:** Low $c^2$ ($0.0015$), simulating a denser medium. 

When the continuous wave travels from the right side of the screen to the left side, it physically slows down and its wavelength compresses, simulating real-world light or sound refraction.

## 3. Damped Harmonic Oscillator (Restoring Forces)

In addition to the neighbor interactions, each point independently behaves as a damped spring attached to its original resting position `baseY`. This is governed by Hooke's Law and a friction multiplier:
$$ \frac{\partial^2 u}{\partial t^2} + \gamma \frac{\partial u}{\partial t} + k \cdot u = 0 $$

```javascript
this.vy += (this.baseY - this.y) * baseRestoring; // Hooke's law (k = 0.00004)
this.vy *= this.localDamping;                     // Damping (gamma = ~0.9976)
this.y += this.vy;                                // Velocity integration
```

This forces the grid to remain stable and eventually return to equilibrium if no external forces are applied.

## 4. Source Wave Generator (The Perturbation)

The waves are continuously emitted from a source located at the bottom right corner of the screen (`sourceX = width`, `sourceY = height`), imitating a ripple.

$$ u(x, t) = A \cdot \cos(\omega t - k x) \cdot I $$

```javascript
let s_dx = sourceX - p.x, s_dy = sourceY - p.baseY;
let s_dist = Math.sqrt(s_dx * s_dx + s_dy * s_dy);
if (s_dist < sourceRadius) {
    let s_influence = Math.pow(1 - (s_dist / sourceRadius), 2);
    let projected_d = (s_dx + s_dy) / Math.SQRT2;
    p.vy += Math.cos(performance.now() * sourceFrequency - waveNumber * projected_d) * sourceAmplitude * s_influence;
}
```

- **Frequency & Wavenumber:** Tuned via `sourceFrequency = 0.003` and `waveNumber = 0.035`.
- **Projected Distance:** The wave propagates diagonally `(s_dx + s_dy) / Math.SQRT2`.
- **Inverse-Square Falloff:** `s_influence` limits the strict oscillator to a `400px` radius from the bottom right. Beyond this, the waves propagate purely through the Laplacian physics simulated in the grid.

## 5. Boundary Conditions

Handling boundaries is one of the most subtle parts of simulating wave equations.

- **Reflective / Neumann Boundaries:** At the literal edges of the grid array (`j=0`, `i=0`), the Laplacian code mimics Neumann boundary conditions by mirroring the neighboring point (`j+1` or `i+1`). Without intervention, waves hitting the top or left edges would bounce back perfectly, creating chaotic and noisy standing waves over time.
- **Sponge Layer (Absorbing Boundary Condition):** To prevent unwanted reflection and simulate an infinite medium in the top and left directions, a "sponge layer" is used.

```javascript
let minDist = Math.min(gridX, gridY);
if (minDist < spongeWidth) {
    let penetration = (spongeWidth - minDist) / spongeWidth;
    this.localDamping = baseDamping - (maxExtraDamping * Math.pow(penetration, 2));
}
```

If a point is within 25 units (`spongeWidth`) of the top or left edge, its damping factor is aggressively increased via a quadratic curve (`Math.pow(penetration, 2)`). This smoothly and silently absorbs kinetic energy from the wave before it can hit the hard boundary and reflect back into the canvas.

## 6. Interactive Perturbation

The system also accepts external kinetic energy via the user's mouse. When the mouse moves across the grid, its vertical velocity (`researchMouse.vy`) is transferred to points within a 120-pixel radius, weighted linearly by proximity:

```javascript
let dx = researchMouse.x - p.x, dy = researchMouse.y - p.y;
let dist = Math.sqrt(dx * dx + dy * dy);
if (dist < 120) {
    let influence = 1 - (dist / 120);
    p.vy += researchMouse.vy * 0.05 * influence;
}
```

## 7. Rendering Execution

The final state is rendered efficiently per frame by connecting the discrete $x, y$ positions of all points along a given string ($i$) using `ctx.lineTo()`, drawing each as a continuous 1px stroke on an HTML5 Canvas (`#research-bg-canvas`), achieving a fluid, high-performance visualization across 15,300 unique physics nodes.
